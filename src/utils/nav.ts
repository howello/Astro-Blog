// 导航项类型（对应 src/config.ts 里的 Navs / SubNavs）
export interface NavChild {
  text: string;
  link: string;
}

export interface NavItem {
  text: string;
  icon: string;
  // 有 children 的项本身不跳转，link 为空
  link?: string;
  target?: boolean;
  children?: NavChild[];
}

// 把导航项的 link 归一成「路由标识」：/ → home，/archives → archives，/tag/xxx → tag
// 与页面 frontmatter 的 type（首页由 [...page].astro 传 home）一一对应
const navKey = (link?: string) => {
  if (!link) return "";
  const path = link.split(/[?#]/)[0].replace(/^\/+/, "").replace(/\/+$/, "");
  return path ? path.split("/")[0] : "home";
}

// 精确匹配当前导航项是否高亮
// 注意：不能再用 link.includes(activeNav) —— activeNav 为空串时 includes 恒为 true 会全部高亮，
// 且有 children 的项没有 link，取 .includes 会直接报错
const isNavActive = (item: NavItem, activeNav?: string) => {
  if (!item.link || item.children) return false;
  // 站外链接不参与高亮
  if (/^[a-z]+:\/\//i.test(item.link)) return false;
  if (!activeNav || activeNav === "-") return false;
  return navKey(item.link) === activeNav;
}

export { navKey, isNavActive };
