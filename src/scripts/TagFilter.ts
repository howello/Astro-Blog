// 标签总览页：按关键词实时过滤标签列表（纯前端，标签在构建期已全部渲染进 DOM）
export default function initTagFilter() {
  const root = document.querySelector<HTMLElement>('[data-tag-filter]');
  if (!root || root.dataset.bound === 'true') return;

  const input = root.querySelector<HTMLInputElement>('[data-tag-search]');
  const countEl = root.querySelector<HTMLElement>('[data-tag-count]');
  const emptyEl = root.querySelector<HTMLElement>('.tag-empty');
  // 标签名在构建期就写成小写存进 data-tag-name，过滤时不必反复 toLowerCase
  const items = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[data-tag-name]'));
  if (!input || !items.length) return;

  const total = items.length;
  let composing = false;

  const filter = () => {
    const keyword = input.value.trim().toLowerCase();
    let matched = 0;
    items.forEach((item) => {
      const hit = !keyword || (item.dataset.tagName || '').includes(keyword);
      item.hidden = !hit;
      if (hit) matched++;
    });
    if (countEl) countEl.textContent = keyword ? `${matched}/${total}个标签` : `${total}个标签`;
    if (emptyEl) emptyEl.hidden = matched > 0;
  };

  // 中文输入法组合期间不过滤，否则拼音字母会先把列表清空
  input.addEventListener('compositionstart', () => {
    composing = true;
  });
  input.addEventListener('compositionend', () => {
    composing = false;
    filter();
  });
  input.addEventListener('input', () => {
    if (!composing) filter();
  });
  // Esc 清空关键词，恢复全量列表
  input.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || !input.value) return;
    ev.preventDefault();
    input.value = '';
    filter();
  });

  root.dataset.bound = 'true';
}
