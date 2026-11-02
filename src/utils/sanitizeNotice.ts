import DOMPurify from 'dompurify';

/** 净化历史及新增公告正文，保留 HTML 排版，禁用 SVG、事件和嵌入文档。 */
export function sanitizeNotice(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['iframe', 'object', 'embed', 'form', 'input', 'style'],
    FORBID_ATTR: ['style', 'srcdoc'],
  });
}
