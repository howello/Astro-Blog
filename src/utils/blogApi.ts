import SITE_CONFIG from '@/config';

const BlogApi = SITE_CONFIG.BlogApi;

/** 后端统一分页响应（PageHelper 的 getDataTable） */
export interface TableDataInfo<T> {
  code: number;
  msg: string;
  total: number;
  rows: T[];
}

/** 后端统一单体响应（AjaxResult） */
export interface AjaxResult<T> {
  code: number;
  msg: string;
  data: T;
}

/** baseURL 没配时抛这个，供调用方给出比「网络错误」更准确的提示 */
export class BlogApiNotConfiguredError extends Error {
  constructor() {
    super('未配置后端接口地址（config.ts 的 BlogApi.baseURL）');
    this.name = 'BlogApiNotConfiguredError';
  }
}

/**
 * 请求后端 JSON 接口
 *
 * 超时用 AbortController 实现——fetch 没有原生超时，不加的话后端不可达时
 * 页面会一直停在「加载中」。外部传入的 signal（用于路由离开时中止）与内部的
 * 超时信号相互独立，任一触发都会中断请求。
 */
export const fetchJson = async <T>(
  path: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> => {
  const baseURL = (BlogApi?.baseURL || '').replace(/\/+$/, '');
  if (!baseURL) throw new BlogApiNotConfiguredError();

  const query = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    }
  }
  const qs = query.toString();
  const url = `${baseURL}${path}${qs ? `?${qs}` : ''}`;

  const timer = new AbortController();
  const timeoutId = setTimeout(() => timer.abort(), BlogApi?.timeout || 8000);
  // 外部中止（路由离开）要能穿透到本次请求
  const onAbort = () => timer.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(url, { signal: timer.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    // 后端异常（如限流）走的是 200 + code!=200，不看 code 会把错误当数据渲染
    if (body && typeof body.code === 'number' && body.code !== 200) {
      throw new Error(body.msg || `接口返回 code=${body.code}`);
    }
    return body as T;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
};
