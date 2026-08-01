/**
 * HTML 转义
 *
 * 列表渲染的所有文本插值都必须经过这里。后端已在抓取 RSS 时剥离了第三方摘要的
 * HTML 标签，这是第二道防线——第三方源不受我们控制，多一层纵深防御不算多余。
 *
 * 唯一例外是说说的 markdown 正文：那是管理员录入的可信内容，且本来就要渲染成 HTML。
 */
const escapeHtml = (text: unknown): string => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export default escapeHtml;
