import escapeHtml from '@/utils/escapeHtml';
import safeUrl from '@/utils/safeUrl';
import { createListPage } from '@/scripts/ListPage';

/**
 * 友链页渲染
 *
 * 接口返回的是「已按分组聚合、分组名已由后端翻译好」的结构，前端只负责分区展示。
 * 未分组或字典项已被删除的友链由后端归入「其他」组并排在最后，不会消失。
 *
 * 输出保持**扁平结构**：`.links-main` 是 grid 容器，卡片样式挂在直接子元素 `&>a` 上。
 * 若把每组包进一层 section，那些样式就全部失效了——所以分组标题与卡片是平级的，
 * 标题靠 `.links-group-title { grid-column: 1 / -1 }` 独占一行。
 */
const renderGroups = (groups: any[]): string =>
  groups
    .map(g => {
      const title = `<h2 class="links-group-title">${escapeHtml(g.groupName)}</h2>`;
      const cards = (g.links || [])
        .map((i: any) => {
          // 站点地址与头像都进 href/src，必须过协议白名单
          const href = safeUrl(i.linkUrl);
          const avatar = safeUrl(i.avatar);
          const icon = avatar
            ? `<img class="avatar" data-vh-lz-src="${escapeHtml(avatar)}" alt="${escapeHtml(i.linkName)}" />`
            : `<span class="avatar avatar-text">${escapeHtml((i.linkName || '?').slice(0, 1))}</span>`;
          const info = `${icon}<section class="link-info"><span>${escapeHtml(
            i.linkName
          )}</span><p class="vh-ellipsis line-2">${escapeHtml(i.descr)}</p></section>`;
          // 地址不合规时退化成不可点击的卡片，友链本身仍然展示
          return href
            ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener nofollow" title="${escapeHtml(
                i.linkName
              )}">${info}</a>`
            : `<a title="${escapeHtml(i.linkName)}">${info}</a>`;
        })
        .join('');
      return title + cards;
    })
    .join('');

// 友情链接初始化
// 不分页：分页会把分组从中间切断，同一组的小标题在相邻两页重复出现
export default () =>
  createListPage({
    selector: '.main-inner-content>.vh-tools-main>main.links-main',
    endpoint: '/blog/public/links',
    paged: false,
    emptyText: '还没有友链，欢迎来评论区交换～',
    renderItems: renderGroups
  });
