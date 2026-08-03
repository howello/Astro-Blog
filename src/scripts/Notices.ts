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

const textPreview = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
};

const normalize = (body: NoticeResponse | Notice[]): Notice[] =>
  Array.isArray(body) ? body : body.rows || [];

const renderState = (el: Element, text: string) => {
  el.innerHTML = `<p class="notice-state">${escapeHtml(text)}</p>`;
  (el as HTMLElement).hidden = false;
};

const clearPageState = (el: HTMLElement | null) => {
  if (el) {
    el.textContent = '';
    el.hidden = true;
  }
};

const renderSidebar = (el: Element, notice: Notice) => {
  el.innerHTML = `<a class="notice-preview" href="/notice/"><strong>${escapeHtml(notice.noticeTitle)}</strong><span>${escapeHtml(textPreview(notice.noticeContent))}</span></a>`;
};

const renderPage = (el: Element, state: HTMLElement | null, notices: Notice[]) => {
  if (!notices.length) {
    renderState(state || el, '暂无公告');
    return;
  }
  clearPageState(state);
  // 公告正文由后台富文本编辑器产生，只有该字段允许保留 HTML；其他字段均已转义。
  el.innerHTML = notices.map(notice => `<article class="notice-item"><header><h2>${escapeHtml(notice.noticeTitle)}</h2><time>${escapeHtml(notice.createTime || '')}</time></header><div class="notice-content">${notice.noticeContent || ''}</div></article>`).join('');
};

export default async function initNotices() {
  const sidebar = document.querySelector<HTMLElement>('[data-notices] [data-notice-state]');
  const page = document.querySelector<HTMLElement>('[data-notices-page]');
  if (!sidebar && !page) return;

  const target = page || sidebar;
  if (target?.dataset.loaded === 'true' || target?.dataset.loading === 'true') return;
  if (target) target.dataset.loading = 'true';
  const pageState = page?.querySelector<HTMLElement>('[data-notice-state]') || null;
  const pageList = page?.querySelector<HTMLElement>('[data-notice-list]') || null;

  try {
    const body = await fetchJson<NoticeResponse | Notice[]>('/blog/public/notices', { pageNum: 1, pageSize: 20 });
    const notices = normalize(body);
    if (sidebar) notices.length ? renderSidebar(sidebar, notices[0]) : renderState(sidebar, '暂无公告');
    if (page && pageList) renderPage(pageList, pageState, notices);
    if (target) {
      delete target.dataset.loading;
      target.dataset.loaded = 'true';
    }
  } catch (error) {
    if (sidebar) renderState(sidebar, '公告加载失败，请稍后重试');
    if (pageState) renderState(pageState, '公告加载失败，请稍后重试');
    if (target) delete target.dataset.loading;
  }
}
