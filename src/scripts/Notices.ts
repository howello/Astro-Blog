import SITE_CONFIG from '@/config';
import escapeHtml from '@/utils/escapeHtml';
import { fetchJson } from '@/utils/blogApi';

interface Notice {
  noticeId: number;
  noticeTitle: string;
  noticeContent: string;
  createTime?: string;
}

interface NoticeResponse {
  rows?: Notice[];
  total?: number;
}

// 富文本仅保留纯文本预览，用于行内辅助信息（不外暴露原始 HTML）
const textPreview = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
};

const fmtTime = (t?: string): string => (t ? String(t).replace('T', ' ').slice(0, 16) : '');

const normalize = (body: NoticeResponse | Notice[]): Notice[] =>
  Array.isArray(body) ? body : body.rows || [];

/** 行内状态文案：复用归档列表的 title 行展示加载/失败/空 */
const renderCount = (el: Element | null, text: string) => {
  if (!el) return;
  el.textContent = text;
};

/** 渲染单条公告：a 必须是 archive-list-item 的直接子级，才能命中分类/标签同款列表样式 */
const renderItem = (notice: Notice): string => {
  const safeTitle = escapeHtml(notice.noticeTitle);
  const safeTime = escapeHtml(fmtTime(notice.createTime));
  // 公告正文是后台可信富文本，仅在点击展开时以原始 HTML 注入展开区
  return `<a href="javascript:;" data-notice-toggle data-notice-id="${notice.noticeId}">
    <span class="vh-ellipsis">${safeTitle}</span>
    <i></i>
    <cite>${safeTime}</cite>
  </a>
  <div class="notice-content" data-notice-content="${notice.noticeId}" hidden></div>`;
};

const clearNoticeItems = (listEl: HTMLElement) => {
  listEl.querySelectorAll('[data-notice-toggle], [data-notice-content]').forEach((el) => el.remove());
};

const renderPage = (
  listEl: HTMLElement,
  countEl: HTMLElement | null,
  notices: Notice[]
) => {
  clearNoticeItems(listEl);
  if (!notices.length) {
    renderCount(countEl, '暂无公告');
    return;
  }
  renderCount(countEl, `${notices.length}条公告`);
  listEl.insertAdjacentHTML('beforeend', notices.map(renderItem).join(''));
};

const renderSidebar = (el: Element, notice: Notice) => {
  el.innerHTML = `<a class="notice-preview" href="/notice/"><strong>${escapeHtml(notice.noticeTitle)}</strong><span>${escapeHtml(textPreview(notice.noticeContent))}</span></a>`;
};

const renderState = (el: Element, text: string) => {
  el.innerHTML = `<p class="notice-state">${escapeHtml(text)}</p>`;
};

export default async function initNotices() {
  const sidebar = document.querySelector<HTMLElement>('[data-notices] [data-notice-state]');
  const page = document.querySelector<HTMLElement>('[data-notices-page]');
  if (!sidebar && !page) return;

  const target = page || sidebar;
  if (target?.dataset.loaded === 'true' || target?.dataset.loading === 'true') return;
  if (target) target.dataset.loading = 'true';

  // 新结构里计数文案挂在标题行的 span，加载/失败/空都先写到这里
  const countEl = page?.querySelector<HTMLElement>('[data-notice-count]') || null;
  const listEl = page?.querySelector<HTMLElement>('[data-notice-list]') || null;

  try {
    const body = await fetchJson<NoticeResponse | Notice[]>('/blog/public/notices', {
      pageNum: 1,
      pageSize: 50
    });
    const notices = normalize(body);
    if (sidebar)
      notices.length ? renderSidebar(sidebar, notices[0]) : renderState(sidebar, '暂无公告');
    if (page && listEl) renderPage(listEl, countEl, notices);
    if (target) {
      delete target.dataset.loading;
      target.dataset.loaded = 'true';
    }

    // 点击行展开/收起公告正文（首次展开才注入 HTML，避免重复解析）
    if (listEl) {
      listEl.querySelectorAll<HTMLElement>('[data-notice-toggle]').forEach((toggle) => {
        const content = listEl.querySelector<HTMLElement>(`[data-notice-content="${toggle.dataset.noticeId}"]`);
        if (!content) return;
        toggle.addEventListener('click', (ev) => {
          ev.preventDefault();
          const notice = notices.find((n) => String(n.noticeId) === String(toggle.dataset.noticeId));
          if (content.hidden && notice && !content.dataset.filled) {
            content.innerHTML = notice.noticeContent || '';
            content.dataset.filled = 'true';
          }
          content.hidden = !content.hidden;
          toggle.classList.toggle('expanded', !content.hidden);
        });
      });
    }
  } catch (error) {
    if (sidebar) renderState(sidebar, '公告加载失败，请稍后重试');
    if (countEl) renderCount(countEl, '加载失败，请稍后重试');
    if (listEl) clearNoticeItems(listEl);
    if (target) delete target.dataset.loading;
  }
}
