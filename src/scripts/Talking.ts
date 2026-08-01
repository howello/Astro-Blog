import { marked } from 'marked';
import SITE_CONFIG from '@/config';
import { fmtDate } from '@/utils/index';
import escapeHtml from '@/utils/escapeHtml';
import { createListPage } from '@/scripts/ListPage';

/**
 * 说说渲染
 *
 * 正文是管理员录入的 markdown 原文，用 marked 渲染成 HTML——这是全站转义防护的
 * **唯一例外**（markdown 本就要渲染成 HTML）。标签、时间等其余插值仍走 escapeHtml。
 *
 * 头像与昵称取自 config.ts，不再是上游主题作者的 QQ 头像与昵称。
 */
const renderItems = (rows: any[]): string => {
  const author = SITE_CONFIG.Author || '';
  const avatar = SITE_CONFIG.Avatar || '';
  return rows
    .map((i: any) => {
      // 标签是逗号分隔的字符串
      const tags = (i.tags || '')
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((t: string) => `<span>${escapeHtml(t)}</span>`)
        .join('');
      return `<article><header><img data-vh-lz-src="${escapeHtml(avatar)}" alt="${escapeHtml(
        author
      )}" /><p class="info"><span>${escapeHtml(author)}</span><time>${fmtDate(i.pubDate)}前</time></p></header><section class="main">${marked.parse(
        i.content || ''
      )}</section><footer>${tags}</footer></article>`;
    })
    .join('');
};

// 说说初始化
// 置顶由后端排在最前（order by is_top desc, pub_date desc），前端无需额外处理
export default () =>
  createListPage({
    selector: '.main-inner-content>.vh-tools-main>main.talking-main',
    endpoint: '/blog/public/talks',
    paged: true,
    emptyText: '还没有说说～',
    renderItems
  });
