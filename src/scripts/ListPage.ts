import vh from 'vh-plugin';
import SITE_CONFIG from '@/config';
import { fetchJson, BlogApiNotConfiguredError } from '@/utils/blogApi';
import type { TableDataInfo, AjaxResult } from '@/utils/blogApi';
// 图片懒加载
import vhLzImgInit from '@/scripts/vhLazyImg';

export interface ListPageOptions {
  /** 列表容器选择器；选不到直接返回，非本页时无副作用 */
  selector: string;
  /** 接口路径，相对 BlogApi.baseURL */
  endpoint: string;
  /** 是否分页。false 时一次取全量（友链页） */
  paged: boolean;
  /** 把接口返回的行渲染成 HTML 字符串 */
  renderItems: (rows: any[]) => string;
  /** 空数据提示文案 */
  emptyText?: string;
}

/**
 * 每个容器同一时刻只允许一个在途请求。
 * swup 导航离开再回来会重新调用 init，旧请求的回调若还在跑就会操作已被替换掉的 DOM。
 */
const inflight = new Map<string, AbortController>();

/** 中止全部在途请求，供 swup 离开页面时调用 */
const abortAll = () => {
  inflight.forEach(c => c.abort());
  inflight.clear();
};

// swup 4 会在 document 上派发 visit:start；监听是尽力而为的，事件不存在也不影响
// 主保障（每次 init 前中止上一次）。
let swupHooked = false;
const hookSwupOnce = () => {
  if (swupHooked || typeof document === 'undefined') return;
  swupHooked = true;
  document.addEventListener('swup:visit:start', abortAll);
};

/** 加载中：复用主题既有的 loading 样式（三个 span 是它的动画元素，不能省） */
const renderLoading = (el: Element) => {
  el.innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>';
};

/** 失败与空数据必须区分开，都不能静默留白 */
const renderMessage = (el: Element, text: string) => {
  el.innerHTML = `<section class="vh-list-tip">${text}</section>`;
};

/** 渲染客户端分页器，复用主题的 .vh-art-page / .vh-pagination-item 样式类 */
const renderPager = (total: number, pageSize: number, current: number): string | null => {
  const pages = Math.ceil(total / pageSize);
  // 总页数 <= 1 时不渲染，避免出现只有一个禁用页码的无效分页器
  if (pages <= 1) return null;

  const PREV_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M15 6l-6 6l6 6"></path></svg>';
  const NEXT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 6l6 6l-6 6"></path></svg>';

  // 页码窗口：首页、末页、当前页附近，其余省略
  const nums: number[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - current) <= 1) nums.push(p);
  }

  let html = '<section class="vh-art-page">';
  html += `<a class="vh-pagination-item${current <= 1 ? ' disabled' : ''}" href="javascript:;" data-page="${current - 1}" title="上一页">${PREV_ICON}</a>`;
  let last = 0;
  for (const p of nums) {
    if (last && p - last > 1) html += '<a class="vh-pagination-item disabled" href="javascript:;">…</a>';
    html += `<a class="vh-pagination-item${p === current ? ' active' : ''}" href="javascript:;" data-page="${p}" title="第${p}页">${p}</a>`;
    last = p;
  }
  html += `<a class="vh-pagination-item${current >= pages ? ' disabled' : ''}" href="javascript:;" data-page="${current + 1}" title="下一页">${NEXT_ICON}</a>`;
  html += '</section>';
  return html;
};

/**
 * 列表页控制器：只管取数、分页与三态，不碰具体条目的 DOM 结构。
 * 条目长什么样由各页自己的 renderItems 决定。
 */
export const createListPage = (options: ListPageOptions) => {
  const el = document.querySelector(options.selector);
  if (!el) return;

  hookSwupOnce();
  // 同一容器的上一次请求先中止，防止回调操作已被 swup 替换掉的 DOM
  inflight.get(options.selector)?.abort();

  const pageSize = SITE_CONFIG.BlogApi?.pageSize || 12;
  const emptyText = options.emptyText || '暂无数据';

  const load = async (page: number) => {
    // 先中止同一容器上一次尚未完成的请求：快速连点页码时，旧响应可能后到并
    // 覆盖新页内容，导致分页器的 active 与实际列表对不上
    inflight.get(options.selector)?.abort();
    const controller = new AbortController();
    inflight.set(options.selector, controller);
    renderLoading(el);

    try {
      const params = options.paged ? { pageNum: page, pageSize } : undefined;
      const body = await fetchJson<TableDataInfo<any> & AjaxResult<any>>(options.endpoint, params, controller.signal);

      // 请求回来时容器可能已被 swup 换掉，此时不能再写 DOM
      if (!document.contains(el)) return;

      // 分页接口给 rows/total，单体接口给 data
      const rows: any[] = options.paged ? body.rows || [] : body.data || [];
      const total = options.paged ? body.total || 0 : rows.length;

      if (!rows.length) {
        renderMessage(el, emptyText);
        return;
      }

      const pager = options.paged ? renderPager(total, pageSize, page) : null;
      el.innerHTML = options.renderItems(rows) + (pager || '');

      if (pager) {
        el.querySelectorAll<HTMLElement>('.vh-art-page .vh-pagination-item[data-page]').forEach(a => {
          a.addEventListener('click', ev => {
            ev.preventDefault();
            if (a.classList.contains('disabled') || a.classList.contains('active')) return;
            const target = Number(a.dataset.page);
            const pages = Math.ceil(total / pageSize);
            // 后端 PageHelper 的 reasonable=true 会把越界页钳到末页，
            // 不能靠「返回空集」判断有没有下一页，这里自己卡住范围
            if (!target || target < 1 || target > pages) return;
            load(target);
          });
        });
      }

      // 图片懒加载
      vhLzImgInit();
    } catch (err: any) {
      // 主动中止不是错误，静默返回即可
      if (err?.name === 'AbortError') return;
      if (!document.contains(el)) return;
      const tip =
        err instanceof BlogApiNotConfiguredError
          ? '未配置后端接口地址，请联系站点管理员'
          : '加载失败，请稍后重试';
      renderMessage(el, tip);
      vh.Toast('获取数据失败');
    } finally {
      if (inflight.get(options.selector) === controller) inflight.delete(options.selector);
    }
  };

  load(1);
};

export default createListPage;
