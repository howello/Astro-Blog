export default {
  // 网站标题
  Title: '王艳涛博客',
  // 网站地址
  Site: 'https://www.wyantao.com',
  // 网站副标题
  Subtitle: '保持努力，保持进步。',
  // 网站描述
  Description: '王艳涛博客 记录 Java 后端、Vue 前端与 DevOps 实践中的经验总结与踩坑记录，涵盖 Spring Boot、TypeScript、Docker、Linux 等领域，同时也分享一些生活随笔。',
  // 网站作者
  Author: '.𝙃owe',
  // 作者头像
  Avatar: 'https://q1.qlogo.cn/g?b=qq&nk=1669937522&s=640',
  // 网站座右铭
  Motto: '运气是计划之外的东西.',
  // Cover 网站缩略图
  Cover: '/assets/images/banner/072c12ec85d2d3b5.webp',
  // 网站侧边栏公告 (不填写即不开启)
  // Tips: '<p>欢迎光临我的博客 🎉</p><p>这里会分享我的日常和学习中的收集、整理及总结，希望能对你有所帮助:) 💖</p>',
  // 首页打字机文案列表
  TypeWriteList: [
    '保持努力，保持进步。',
    'Keep moving forward—small steps, steady heart, lasting change.'
  ],
  // 网站创建时间
  CreateTime: '2026-07-01',
  // 顶部 Banner 配置
  HomeBanner: {
    enable: true,
    // 首页高度（首页 Hero 模式：满屏，首屏只见背景 + 头像 + 文案）
    // 需要保持满屏就别改成固定值，否则 HomeHero 的「下滑才出现」体验会失真
    HomeHeight: '100dvh',
    // 其他页面高度
    PageHeight: '28.88rem',
    // 背景
    background: "url('/assets/images/home-banner.webp') no-repeat center 60%/cover",
  },
  // 顶部 Banner 动态着色器背景配置（@paper-design/shaders-react）
  // enable: false 时不渲染着色器，Banner 回退为上面 HomeBanner.background 的静态图片
  HomeShader: {
    enable: true,
    // 背景「主题」= 着色器名称，换 type 即换一套背景观感
    // 可选值（均为 @paper-design/shaders-react 的具名导出）：
    //   'Warp'               噪声 + 漩涡扭曲的流体色场（默认，最耐看）
    //   'MeshGradient'       柔和流动的网格渐变
    //   'GrainGradient'      带颗粒噪点的渐变
    //   'StaticMeshGradient' 静态网格渐变（不动，最省电）
    //   'SmokeRing'          烟环
    //   'Swirl'              同心漩涡色带
    //   'Spiral'             螺旋线条
    //   'Waves'              规则波纹（静态，无 speed）
    //   'NeuroNoise'         神经网络状噪声纹路
    //   'Dithering'          抖动像素风
    //   'Metaballs'          融球
    //   'Voronoi'            泰森多边形色块
    //   'GodRays'            体积光
    //   'ColorPanels'        旋转的彩色面板
    //   'DotOrbit' / 'DotGrid' / 'SimplexNoise' / 'PerlinNoise' / 'Water' / 'LiquidMetal' 等
    // 填了组件不认识的名字会自动回退到 'Warp'
    type: 'Warp',
    // 配色（自上而下混合，最多 10 个 16 进制颜色）
    // 绝大多数着色器都吃 colors 数组；Waves / Dithering / Spiral 等双色着色器不吃，
    // 需要在下面 params 里改用它们自己的 colorFront / colorBack
    colors: ['#0b1f2a', '#01C4B6', '#0f4c5c', '#7fdbd4'],
    // 动画速度，0 = 静止。建议 0.3~0.6，太快会晃眼
    speed: 2,
    // 该 type 对应着色器的其余参数，原样透传给组件
    // 下面这组是 'Warp' 的参数，换 type 时请照着对应着色器的文档一并替换
    params: {
      // 颜色分布的偏移点，0.5 = 均分
      proportion: 0.45,
      // 颜色过渡的柔和度，0 = 硬边，1 = 完全渐变
      softness: 1,
      // 底纹形状：'checks' 棋盘 | 'stripes' 条纹 | 'edge' 单边
      shape: 'stripes',
      // 底纹缩放，0~1，越小纹路越密
      shapeScale: 0.08,
      // 噪声扭曲强度，0~1
      distortion: 0.15,
      // 漩涡强度，0~1
      swirl: 0.7,
      // 漩涡叠加次数，0~20，配合 swirl > 0 生效
      swirlIterations: 8,
      // 整体缩放，0.01~4
      scale: 1,
      // 整体旋转角度（度）
      rotation: 0,
    },
  },
  // 博客主题配置
  Theme: {
    // 颜色请用 16 进制颜色码
    // 主题颜色
    "--vh-main-color": "#01C4B6",
    // 字体颜色
    "--vh-font-color": "#34495e",
    // 侧边栏宽度
    "--vh-aside-width": "318px",
    // 全局圆角
    "--vh-main-radius": "0.88rem",
    // 主体内容宽度
    "--vh-main-max-width": "1458px",
  },
  // 顶部主导航栏
  // ------------------------------------------------------------------
  // 每一项的字段：
  //   text     必填，菜单文案
  //   icon     必填，图标文件名。仅支持 SVG 且需放在 public/assets/images/svg/ 目录下，
  //            填文件名即可 <不需要 .svg 后缀>（封装了 Svg 组件，为了极致压缩 SVG）
  //            建议使用 https://tabler.io/icons 直接下载 SVG
  //   link     站内路径（如 '/about'）。**有 children 时不要填 link**
  //   target   true = 新标签页打开（仅对没有 children 的项生效）
  //   children 可选。填了就变成「hover 展开的二级下拉菜单」，本身不可点击；
  //            二级项一律按站外链接处理（target="_blank" + rel="noopener noreferrer"）
  //
  // 高亮规则：取当前页面 frontmatter 的 type（首页为 home）与 link 的首段路径**精确比对**，
  //          所以新增站内项时，link 的首段要和页面 frontmatter 的 type 保持一致。
  // ------------------------------------------------------------------
  Navs: [
    { text: '首页', link: '/', icon: 'Nav_home' },
    { text: '列表', link: '/archives', icon: 'Nav_archives' },
    {
      // 外链聚合项：本身不跳转，hover / 键盘聚焦时展开二级菜单
      // 想加/删外链，直接增删下面 children 里的 { text, link } 即可（请按需替换成你自己的站点）
      text: '外链', icon: 'Nav_link', children: [
        { text: 'GitHub', link: 'https://github.com/howello' },
        { text: 'Dpanel', link: 'https://dpanel.wyantao.com/' },
        { text: '后台管理', link: 'https://admin.wyantao.com/' },
        { text: 'Ai', link: 'https://ai.wyantao.com/' },
        { text: 'CPA', link: 'https://cpa.wyantao.com/' },
        { text: 'Mail', link: 'https://mail.wyantao.com/' },
        { text: '时光倒计时', link: 'https://timer.wyantao.com/' },
        { text: '接龙小游戏', link: 'https://game.wyantao.com/' },
      ]
    },
    { text: '留言', link: '/message', icon: 'Nav_message' },
    { text: '关于', link: '/about', icon: 'Nav_about' },
  ],
  // 次级导航（站内页面，不占用顶部主导航的位置）
  // ------------------------------------------------------------------
  // 只在「移动端侧边栏」和「页脚」露出，用来收纳不进主导航但仍需可达的站内页，
  // 避免这些页面变成没有任何入口的死页面。字段同 Navs（不支持 children）。
  // ------------------------------------------------------------------
  SubNavs: [
    { text: '朋友', link: '/links', icon: 'Nav_friends' },
    { text: '圈子', link: '/friends', icon: 'Nav_rss' },
    { text: '动态', link: '/talking', icon: 'Nav_talking' },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    // 示例：{ text: 'Github', link: 'https://github.com/<你的用户名>', icon: 'WebSite_github' },
      { text: 'Github', link: 'https://github.com/howello', icon: 'WebSite_github' }
  ],
  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示分类
    CategoriesShow: true,
    // 是否展示标签
    TagsShow: true,
    // 是否展示推荐文章
    recommendArticleShow: true
  },
  // DNS预解析地址
  DNSOptimization: [
    // i0.wp.com 供 demo 文章的图片使用，清掉 demo 文章后可一并移除
    'https://i0.wp.com',
    // registry.npmmirror.com 供视频播放器 (DPlayer/hls.js) 与评论表情按需加载使用，勿删
    'https://registry.npmmirror.com'
  ],
  // 博客音乐组件解析接口
  // 注意：这是主题作者的私有接口，仅供 markdown 里的 ::music 组件使用，随时可能失效。
  // 若不打算在文章里插音乐，可留空并删除上面的 vh-api.4ce.cn 预解析。
  vhMusicApi: 'https://vh-api.4ce.cn/blog/meting',
  // 评论组件（只允许同时开启一个）
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: false,
      serverURL: ''
    }
  },
  // Han Analytics 统计（https://github.com/uxiaohan/HanAnalytics）
  // 已关闭：原值会把访问数据上报到主题作者的服务器。如需启用请自建服务并填入自己的 server / siteId
  HanAnalytics: { enable: false, server: '', siteId: '' },
  // Google 广告
  GoogleAds: {
    ad_Client: '', //ca-pub-xxxxxx
    // 侧边栏广告(不填不开启)
    // asideAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    // 文章页广告(不填不开启)
    // articleAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`
  },
  // 文章内赞赏码
  Reward: {
    // 支付宝收款码
    // AliPay: '/assets/images/alipay.webp',
    // 微信收款码
    // WeChat: '/assets/images/wechat.webp'
  },
  // 访问网页 自动推送到搜索引擎
  SeoPush: {
    enable: false,
    serverApi: '',
    paramsName: 'url'
  },
  // 页面阻尼滚动速度
  ScrollSpeed: 500
}
