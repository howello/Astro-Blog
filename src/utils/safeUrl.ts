/**
 * URL 安全过滤
 *
 * 只放行 http/https。仅靠 `escapeHtml` 挡不住伪协议——转义能防属性闭合突破，
 * 但 `href="javascript:..."` 本身就是合法属性值，点一下就在本站域里执行了。
 *
 * 用的是**白名单**而非黑名单：必须以 http:// 或 https:// 开头才放行。
 * 黑名单要去堵 `javascript:` / `data:` / `vbscript:` 以及 `java\tscript:` 这类
 * 插控制字符的变形，永远堵不干净；白名单则天然把它们全挡在外面。
 *
 * 条目链接来自不受控的第三方 RSS。服务端 `RssParser` 已做同样的白名单并丢弃不合规条目，
 * 这里是第二道防线——存量数据是在该校验上线前入库的。
 *
 * @returns 合法则原样返回，否则返回空串（调用方据此不渲染链接）
 */
const safeUrl = (url: unknown): string => {
  if (url === null || url === undefined) return '';
  const raw = String(url).trim();
  return /^https?:\/\//i.test(raw) ? raw : '';
};

export default safeUrl;
