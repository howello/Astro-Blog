// Banner 打字机
// -----------------------------------------------------------------------------
// 文案有两个来源，本地列表是永远的兜底，一言只做「轮播池扩充」：
//   · 本地  config.ts 的 TypeWriteList，静态、立即可用，负责首屏不留白
//   · 一言  config.ts 的 TypeWriteHitokoto，运行时异步拉取，取到才播，取不到用户无感
//
// 切换铁律：**只在当前句完整删除归零的那一刻才决定下一句**。
// 一言什么时候回来都不打断正在打字/删除的句子，只是先存进当前实例的缓存。
// 缓存未满时边播边预取，缓存满后只循环播放已成功获取的句子。
//
// 注意：.header-main 在 swup 容器（.main-inner>.main-inner-content 与 .vh-header>.main）之外，
// 路由切换不会替换 .desc 节点，所以本模块由 Init.ts 以 only 守卫只初始化一次，此处无需考虑重复启动。
import SITE_INFO from '@/config';

// 一言相关的可调项全部来自 config.ts 的 TypeWriteHitokoto。
// 这里的默认值只是「配置项缺失时」的保险，日常调整请改 config.ts，不要改这里
const HITOKOTO = (SITE_INFO as any).TypeWriteHitokoto ?? {};
// 接口地址。留空即关闭一言，只轮播本地列表
const HITOKOTO_API: string = HITOKOTO.api ?? 'https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=h&c=i&c=j&c=k&encode=text&charset=utf-8&min_length=8&max_length=20';
// 单次请求超时（毫秒）
const FETCH_TIMEOUT: number = HITOKOTO.timeout ?? 5000;
// 当前 TypeWrite 实例的一言缓存上限
const MAX_CACHE_SIZE = 10;
// 单句最大长度，超长视为异常响应（如被劫持成 HTML）
const MAX_SENTENCE_LEN: number = HITOKOTO.maxLength ?? 60;

export default () => {
  const writeDom = document.querySelector('.header-main>.desc');
  if (!writeDom) return;
  // 本地列表是兜底的底线：它为空说明作者就是不想要这块文案，此时连一言都不请求，直接移除
  const localList: any = SITE_INFO.TypeWriteList;
  if (!Array.isArray(localList) || !localList.length) return writeDom.remove();

  let localIndex = 0;
  // 当前页面实例已成功获取的一言，缓存满后只在这里循环
  const cache: string[] = [];
  let cacheIndex = 0;
  // 同一时刻只允许一个在途请求，避免切句频繁时堆积
  let fetching = false;

  // 预取一句一言进当前实例缓存。失败、超时、空响应、内容异常一律静默，交给本地列表兜底
  const prefetch = () => {
    // api 留空 = 配置里关掉了一言，此后只轮播本地列表
    if (!HITOKOTO_API) return;
    if (document.hidden || fetching || cache.length >= MAX_CACHE_SIZE) return;
    fetching = true;
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), FETCH_TIMEOUT);
    fetch(HITOKOTO_API, { signal: abort.signal })
      .then(res => (res.ok ? res.text() : ''))
      .then(text => {
        const sentence = text.trim();
        // 接口带 min_length/max_length 过滤，取不到合规句子时返回空属正常情况
        if (!sentence || sentence.length > MAX_SENTENCE_LEN || sentence.includes('<')) return;
        if (cache.length < MAX_CACHE_SIZE) cache.push(sentence);
      })
      .catch(() => { /* 网络失败/超时：静默，本地列表继续轮播 */ })
      .finally(() => {
        clearTimeout(timer);
        fetching = false;
      });
  };

  // 取下一句：有一言缓存就循环播放，缓存为空时回落本地列表
  const nextText = (): string => {
    if (cache.length) {
      const text = cache[cacheIndex % cache.length];
      cacheIndex = (cacheIndex + 1) % cache.length;
      return text;
    }
    const text = localList[localIndex];
    localIndex = (localIndex + 1) % localList.length;
    return text;
  };

  let current = nextText();
  let index = 0;
  let isDeleting = false;
  // 主动画函数
  const run = () => {
    // 用 textContent 而非 innerHTML：这里现在会写入远端返回的内容，
    // 且逐字 substring 本来就会把 HTML 标签截断，innerHTML 对这个场景没有意义
    writeDom.textContent = current.substring(0, index);
    // 正常打字阶段
    if (!isDeleting) {
      if (index < current.length) {
        index++;
        setTimeout(run, 188); // 打字速度
      } else {
        // 完整展示后开始删除
        setTimeout(() => {
          isDeleting = true;
          run();
        }, 2888);
      }
    } else {
      if (index > 0) {
        index--;
        setTimeout(run, 88); // 删除速度（比打字快）
      } else {
        // 唯一的切句时机：当前句已彻底删完，此刻才决定下一句是谁
        isDeleting = false;
        current = nextText();
        // 切句的同时补发请求，让「下一句的下一句」提前就位
        prefetch();
        setTimeout(run, 500);
      }
    }
  }
  // 进入页面立即发起第一个请求，但不等它——打字机马上用本地列表启动，首屏不留白
  prefetch();
  // 启动动画
  run();
}
