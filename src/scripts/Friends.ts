import { fmtDate } from '@/utils/index';
import escapeHtml from '@/utils/escapeHtml';
import safeUrl from '@/utils/safeUrl';
import { createListPage } from '@/scripts/ListPage';

/**
 * 取站点域名用于生成图标地址
 *
 * 原实现是 i.link.split('//')[1].split('/')[0]，URL 不带协议时 split 结果为
 * undefined，再 .split 就抛异常，整页因此渲染失败。改用 URL 解析并兜底空串。
 */
const siteHost = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

/** 朋友圈条目渲染。摘要已由后端剥离 HTML，这里仍统一转义作为第二道防线 */
const renderItems = (rows: any[]): string =>
  rows
    .map((i: any) => {
      // 条目链接来自第三方 RSS，必须过协议白名单：escapeHtml 挡不住 javascript:
      const href = safeUrl(i.url);
      const host = siteHost(href);
      const icon = host
        ? `<img data-vh-lz-src="https://icon.bqb.cool/?url=${encodeURIComponent(host)}" alt="" />`
        : '';
      const body = `<header><h2 class="vh-ellipsis line-2">${escapeHtml(
        i.title
      )}</h2></header><p class="vh-ellipsis line-2">${escapeHtml(i.summary)}</p><footer><span>${icon}<em class="vh-ellipsis">${escapeHtml(
        i.author || i.linkName
      )}</em></span><time>${fmtDate(i.pubDate, false)}前</time></footer>`;
      // 链接不合规时退化成不可点击的卡片，而不是渲染一个危险的 href
      return href
        ? `<article><a href="${escapeHtml(href)}" target="_blank" rel="noopener nofollow">${body}</a></article>`
        : `<article><div>${body}</div></article>`;
    })
    .join('');

// 朋友圈 RSS 初始化
export default () =>
  createListPage({
    selector: '.main-inner-content>.vh-tools-main>main.friends-main',
    endpoint: '/blog/public/moments',
    paged: true,
    emptyText: '还没有抓取到朋友的动态～',
    renderItems
  });
