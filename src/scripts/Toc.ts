// 文章目录（TOC）
// -----------------------------------------------------------------------------
// Aside 在 swup 容器之外（containers 只有 .main-inner>.main-inner-content 与 .vh-header>.main），
// 服务端渲染的目录不会随导航更新，所以 Aside.astro 只输出一个空壳，内容全部在这里客户端渲染。
// 每次 page:view 都必须重建：先清掉上一次的 IntersectionObserver 与事件监听，再重新扫描正文标题。

// 正文容器：只扫这个范围内的标题，避免扫到侧栏或页面其它位置的 h3
const ARTICLE_SELECTOR = ".vh-article-main>main";
// 目录空壳（Aside.astro 渲染）
const TOC_BOX_SELECTOR = ".vh-aside-item.toc";
const TOC_NAV_SELECTOR = ".vh-aside-toc";
// 收录的标题层级
const HEADING_SELECTOR = "h2, h3, h4";
// 跳转落点预留的顶部偏移（固定 Header 66px + 余量），与 Header.less 保持一致
const SCROLL_OFFSET = 80;
// 点击目录后锁定高亮的时长（ms），避免平滑滚动途中高亮来回跳
const CLICK_LOCK = 618;

let observer: IntersectionObserver | null = null;
let tocBox: HTMLElement | null = null;
let tocNav: HTMLElement | null = null;
let headings: HTMLElement[] = [];
let links: HTMLAnchorElement[] = [];
let activeId = "";
let lockUntil = 0;

// 标题缺 id 时的兜底 slug（正常情况下 rehype-slug 已经写好 id）
const slugify = (text: string, idx: number) => {
	const base =
		text
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w一-龥-]/g, "")
			.replace(/-{2,}/g, "-")
			.replace(/^-+|-+$/g, "") || `heading-${idx + 1}`;
	let id = base;
	let n = 1;
	while (document.getElementById(id) && n < 999) id = `${base}-${++n}`;
	return id;
};

// 切换高亮，并让高亮项保持在目录可视区内
const setActive = (id: string) => {
	if (id === activeId) return;
	activeId = id;
	links.forEach(a => a.classList[a.dataset.tocId === id ? "add" : "remove"]("active"));
	const cur = links.find(a => a.dataset.tocId === id);
	if (!cur || !tocNav) return;
	// 目录内部出现滚动条时才需要跟随
	if (tocNav.scrollHeight <= tocNav.clientHeight) return;
	tocNav.scrollTo({ top: Math.max(cur.offsetTop - tocNav.clientHeight / 2 + cur.offsetHeight / 2, 0), behavior: "smooth" });
};

// 按标题相对视口的位置重算当前章节
const updateActive = () => {
	if (!headings.length || Date.now() < lockUntil) return;
	// 页面已到底：最后一个标题可能永远进不了检测带，直接高亮末项
	if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) return setActive(headings[headings.length - 1].id);
	let current = headings[0].id;
	for (const h of headings) {
		if (h.getBoundingClientRect().top - SCROLL_OFFSET > 1) break;
		current = h.id;
	}
	setActive(current);
};

// IntersectionObserver 负责主要触发（标题穿过检测带时才回调，无需逐帧计算）；
// scroll 仅作兜底：页面滚到底部时最后一个标题不会穿过检测带，光靠 IO 高亮不会走到末项。
let ticking = false;
const onScroll = () => {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		ticking = false;
		updateActive();
	});
};

// 目录点击：swup 开了 smoothScrolling，锚点链接默认会被它接管并滚到 y=0（标题被 66px 固定 Header 遮住）。
// 注意 swup 的委托监听挂在 documentElement 上且**不看 defaultPrevented**，光靠 preventDefault 拦不住它，
// 所以这里既 stopPropagation（事件到不了 documentElement），目录容器上也标了 data-no-swup（命中 swup 的 ignoreVisit），
// 双保险之后才轮到下面自己的偏移滚动生效
const onTocClick = (e: MouseEvent) => {
	const target = e.target as HTMLElement | null;
	const link = target && typeof target.closest === "function" ? (target.closest(".vh-toc-item") as HTMLAnchorElement | null) : null;
	if (!link) return;
	const id = link.dataset.tocId || "";
	const el = id ? document.getElementById(id) : null;
	if (!el) return;
	e.preventDefault();
	e.stopPropagation();
	window.scrollTo({ top: Math.max(el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET, 0), behavior: "smooth" });
	lockUntil = 0;
	setActive(id);
	lockUntil = Date.now() + CLICK_LOCK;
};

// 清理上一次的监听与内容（Aside 在 swup 容器外，元素本身会跨导航复用）
const destroy = () => {
	observer && observer.disconnect();
	observer = null;
	window.removeEventListener("scroll", onScroll);
	tocNav && tocNav.removeEventListener("click", onTocClick as EventListener);
	tocNav && (tocNav.innerHTML = "");
	tocBox && (tocBox.hidden = true);
	headings = [];
	links = [];
	activeId = "";
	lockUntil = 0;
};

// 初始化：每次导航都调用（不能用 only）
export default () => {
	destroy();
	tocBox = document.querySelector(TOC_BOX_SELECTOR);
	tocNav = document.querySelector(TOC_NAV_SELECTOR);
	if (!tocBox || !tocNav) return;
	// 非文章页：正文容器不存在，整块保持隐藏
	const article = document.querySelector(ARTICLE_SELECTOR);
	if (!article) return;
	const list = Array.from(article.querySelectorAll(HEADING_SELECTOR)) as HTMLElement[];
	const frag = document.createDocumentFragment();
	list.forEach((el, idx) => {
		const text = (el.textContent || "").trim();
		if (!text) return;
		// 正文标题由 rehype-slug 自带 id，这里只对空 id 兜底并写回
		if (!el.id) el.id = slugify(text, idx);
		// 键盘/浏览器自身跳转时也让开固定 Header
		el.style.scrollMarginTop = `${SCROLL_OFFSET}px`;
		const a = document.createElement("a");
		a.className = `vh-toc-item vh-toc-${el.tagName.toLowerCase()} vh-ellipsis`;
		a.href = `#${el.id}`;
		a.title = text;
		a.textContent = text;
		a.dataset.tocId = el.id;
		frag.appendChild(a);
		headings.push(el);
		links.push(a);
	});
	// 文章没有 h2~h4：整块不显示
	if (!headings.length) return;
	tocNav.appendChild(frag);
	tocBox.hidden = false;
	tocNav.addEventListener("click", onTocClick as EventListener);
	window.addEventListener("scroll", onScroll, { passive: true });
	// 检测带：视口顶部 80px 以下、底部 70% 以上
	observer = new IntersectionObserver(() => updateActive(), { rootMargin: `-${SCROLL_OFFSET}px 0px -70% 0px`, threshold: 0 });
	headings.forEach(h => observer!.observe(h));
	updateActive();
};
