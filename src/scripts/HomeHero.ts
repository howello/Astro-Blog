// 首页 Hero 显隐控制
// -----------------------------------------------------------------------------
// 首页（Layout 收到 Home={true} 且 Banner 开启的页面，即 / ——分页 /2、/3 … 不算）首屏只显示满屏的 MainHeader，
// 顶部 Header、内容区、Footer、BackTop 全部初始隐藏：
//   · 鼠标移到视口顶部区域   → 临时唤出 Header（.vh-header-peek）
//   · 向下滚动超过阈值       → Header 常驻、内容淡入上移（.vh-home-revealed），滚回顶部恢复初始态
//   · 键盘焦点进入下方内容   → 直接展开，避免焦点停在不可见区域
// 所有视觉状态都由 body 上的 class 驱动，过渡全部交给 LESS（见 src/layouts/Layout/Layout.less）。
//
// ⚠️ swup 配了 updateBodyClass:false，body 的 class 不会随导航更新，
// 所以每次 page:view 都必须调用本模块重新同步（由 src/scripts/Init.ts 的 indexInit 负责）。

// 展开阈值（px）：滚动超过它就常驻展开
const REVEAL_OFFSET = 40;
// 鼠标悬顶感应区高度（px）
const PEEK_AREA = 90;
// 顶部 Header 高度（px），与 Header.less 保持一致
const HEADER_HEIGHT = 66;

// 当前页是否首页（且 Hero 本体真的存在）。
// 判断依据是 swup 容器 .main-inner-content 内部的 [data-vh-home] 标记（由 src/pages/[...page].astro 输出）：
// 该容器每次导航都会被 swup 替换，标记必然与当前渲染的页面一致；
// 而 body / main.main / <head> 都在容器之外，用它们判断会残留上一页的状态。
// 额外要求 .header-main 存在：config 里 HomeBanner.enable=false 时 Hero 本体不渲染，
// 此时再进 Hero 模式就会把 Header/内容/Footer 全藏起来，首屏得到一整块纯白。
const isHomePage = () => !!document.querySelector(".main-inner-content [data-vh-home]") && !!document.querySelector("main.main>.header-main");

// 滚动状态同步（rAF 节流）
let scrollTicking = false;
const applyScrollState = () => {
	scrollTicking = false;
	const cls = document.body.classList;
	if (!cls.contains("vh-home")) return;
	const y = window.scrollY;
	if (y > REVEAL_OFFSET) {
		cls.add("vh-home-revealed");
		// 已展开就不需要「悬顶临时显示」了
		cls.remove("vh-header-peek");
	} else if (y <= 0) {
		cls.remove("vh-home-revealed");
	}
};
const onScroll = () => {
	if (scrollTicking) return;
	scrollTicking = true;
	requestAnimationFrame(applyScrollState);
};

// 指针是否停在 Header（含展开的二级下拉菜单）内。
// 下拉面板的顶边在 66px 以下、三个二级项一路延伸到 ~183px，远超 PEEK_AREA；
// 只按指针 Y 坐标判定的话，鼠标从「外链」往下移动去点二级链接的瞬间就会摘掉 peek，
// Header 连同下拉面板一起淡出并 pointer-events:none，外链一个都点不到。
const pointerInHeader = () => {
	const header = document.querySelector("header.vh-header");
	return !!header && typeof header.matches === "function" && header.matches(":hover");
};

// 鼠标悬顶状态同步（rAF 节流，只记录坐标不读布局）
let pointerY = -1;
let peekTicking = false;
const applyPeekState = () => {
	peekTicking = false;
	const cls = document.body.classList;
	// 非首页 或 已展开：都不需要 peek
	if (!cls.contains("vh-home") || cls.contains("vh-home-revealed")) {
		cls.remove("vh-header-peek");
		return;
	}
	// 搜索浮层是 Header 的后代，收起 Header 会把它一起带走，打开期间必须锁住显示
	const searchOpened = !!document.querySelector(".vh-header .vh-search.active");
	cls.toggle("vh-header-peek", searchOpened || pointerInHeader() || (pointerY >= 0 && pointerY < PEEK_AREA));
};
const onPointerMove = (e: MouseEvent) => {
	pointerY = e.clientY;
	if (peekTicking) return;
	peekTicking = true;
	requestAnimationFrame(applyPeekState);
};
// 鼠标移出窗口：收起 Header
const onPointerLeave = () => {
	pointerY = -1;
	document.body.classList.remove("vh-header-peek");
};

// 展开到内容区
const revealContent = (scroll: boolean) => {
	const cls = document.body.classList;
	cls.add("vh-home-revealed");
	cls.remove("vh-header-peek");
	if (!scroll) return;
	const target = document.querySelector("main.main>.main-inner") as HTMLElement | null;
	if (!target) return;
	const top = target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
	window.scrollTo({ top: Math.max(top, REVEAL_OFFSET + 1), behavior: "smooth" });
};

// 「向下滚动」提示：点击 / 回车 / 空格 都能触发（事件委托，Hero 在 swup 容器外只需绑定一次）
const hintFrom = (e: Event) => {
	const target = e.target as HTMLElement | null;
	return target && typeof target.closest === "function" ? target.closest(".vh-scroll-hint") : null;
};
const onHintClick = (e: Event) => {
	if (!hintFrom(e) || !document.body.classList.contains("vh-home")) return;
	revealContent(true);
};
const onHintKeyDown = (e: KeyboardEvent) => {
	if (e.key !== "Enter" && e.key !== " ") return;
	if (!hintFrom(e) || !document.body.classList.contains("vh-home")) return;
	e.preventDefault();
	revealContent(true);
};

// 键盘用户：焦点落到 Hero 之外的内容上时直接展开
// （隐藏态刻意没用 visibility:hidden，正是为了让这些元素仍可被 Tab 聚焦）
const onFocusIn = (e: FocusEvent) => {
	const cls = document.body.classList;
	if (!cls.contains("vh-home") || cls.contains("vh-home-revealed")) return;
	const target = e.target as HTMLElement | null;
	if (!target || typeof target.closest !== "function") return;
	if (target.closest(".main-inner") || target.closest(".vh-footer")) revealContent(false);
};

// 同步 body 状态：每次导航后都要跑
const syncHomeState = () => {
	const cls = document.body.classList;
	const home = isHomePage();
	cls.toggle("vh-home", home);
	cls.remove("vh-header-peek");
	pointerY = -1;
	// 非首页：清空所有 Hero 状态，页面行为与改造前完全一致
	if (!home) {
		cls.remove("vh-home-revealed");
		return;
	}
	// 首页：按当前滚动位置决定初始是否已展开（swup 导航后通常已被滚到顶部）
	cls.toggle("vh-home-revealed", window.scrollY > REVEAL_OFFSET);
};

// only = true 时同时绑定全局监听（只需绑定一次）；每次调用都会重新同步状态
export default (only: boolean = true) => {
	// 撤销 Layout.astro 内联脚本埋下的兜底定时器：本模块已经跑起来，Hero 的显隐有人管了
	const win = window as any;
	if (win.__vhHeroFallback) {
		clearTimeout(win.__vhHeroFallback);
		win.__vhHeroFallback = 0;
	}
	syncHomeState();
	if (!only) return;
	window.addEventListener("scroll", onScroll, { passive: true });
	document.addEventListener("mousemove", onPointerMove, { passive: true });
	document.addEventListener("mouseleave", onPointerLeave);
	document.addEventListener("click", onHintClick);
	document.addEventListener("keydown", onHintKeyDown);
	document.addEventListener("focusin", onFocusIn);
};
