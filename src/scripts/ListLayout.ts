// ListLayout.ts
// 首页文章列表卡片/列表布局切换：偏好 localStorage 持久化，默认 card。
// 幂等：data-bound 守卫，防止 swup 每次导航重复绑定（仿 TagFilter.ts）。
const STORAGE_KEY = 'vh-list-layout';
const VALID_LAYOUTS = ['card', 'list'];

export default function initListLayout() {
  const root = document.querySelector<HTMLElement>('[data-list-layout]');
  if (!root || root.dataset.bound === 'true') return;

  const listEl = document.querySelector<HTMLElement>('.article-list');
  if (!listEl) return;

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-layout]'));
  if (!buttons.length) return;

  const isNarrow = () => window.matchMedia('(max-width: 556px)').matches;

  const apply = (mode: string, animate = false) => {
    // 手机端固定卡片：即便偏好 list 也强制 card，且不写回 localStorage
    const valid = isNarrow() ? 'card' : (VALID_LAYOUTS.includes(mode) ? mode : 'card');
    if (animate) {
      listEl.classList.remove('vh-layout-switching');
      // 强制重排触发动画
      void listEl.offsetWidth;
      listEl.classList.add('vh-layout-switching');
      listEl.addEventListener('animationend', () => listEl.classList.remove('vh-layout-switching'), { once: true });
    }
    listEl.classList.toggle('view-card', valid === 'card');
    listEl.classList.toggle('view-list', valid === 'list');
    buttons.forEach((btn) => {
      const active = btn.dataset.layout === valid;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  // 存储不可用（隐私模式/禁用）时安全降级：读不到走默认，写不进也不阻断
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }

  // 恢复偏好；无/非法/存取异常回退 card（默认卡片），不加动画避免刷新闪动
  apply(saved ?? 'card');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = VALID_LAYOUTS.includes(btn.dataset.layout ?? '') ? btn.dataset.layout : 'card';
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // 存储被禁用时静默忽略，仅当前会话生效
      }
      apply(mode, true);
    });
  });

  root.dataset.bound = 'true';
}