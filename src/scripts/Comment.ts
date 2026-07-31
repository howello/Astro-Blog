/*
 * @Author: Han
 * @Date: 2025-04-07 11:31:34
 * @LastEditors: Han
 * @LastEditTime: 2025-04-21 14:32:19
 * @Description:
 *
 */
import SITE_INFO from "@/config";
import { LoadScript } from "@/utils/index";
import type { WalineMeta } from "@waline/client";
declare const twikoo: any;

// Twikoo 评论
const TwikooFn = async (commentDOM: string) => {
  document.querySelector(commentDOM)!.innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>'
  await LoadScript("https://registry.npmmirror.com/twikoo/1.6.41/files/dist/twikoo.all.min.js");
  twikoo.init({ envId: SITE_INFO.Comment.Twikoo.envId, el: commentDOM, onCommentLoaded: () => setTimeout(() => document.querySelectorAll('.vh-comment a[href="#"]').forEach(link => link.removeAttribute('href'))) })
}

// 评论区图片上传
// 端点与地址前缀都在 config.ts 的 Comment.Waline.ImageUpload 里配置。
// 约定端点接收 multipart POST（文件字段名 file），返回 JSON { data: { link } }；
// link 为完整 URL 时原样使用，为桶内相对 key 时拼上 publicPrefix
const uploadImage = async (file: File): Promise<string> => {
  const { uploadURL, publicPrefix } = SITE_INFO.Comment.Waline.ImageUpload;
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(uploadURL, { method: "POST", body });
  const link = (await res.json())?.url;
  if (!link) throw new Error('评论图片上传失败：响应中缺少 data.link');
  return /^https?:\/\//.test(link) ? link : `${publicPrefix.replace(/\/$/, '')}/${link.replace(/^\/+/, '')}`;
}

// Waline 评论
// 第二个参数收的是 Init.ts 里的 commentLIst 对象，实例必须写回它的属性：
// 若只赋值给形参，Init.ts 路由离开时的 destroy() 判断恒为 false，实例永不销毁，
// 而评论 DOM 在 swup 容器内每次导航都会被替换，旧实例会持续堆积
const WalineFn = async (commentDOM: string, commentList: any) => {
  import('@waline/client/waline.css');
  import('@waline/client/waline-meta.css');
  const { init } = await import('@waline/client');
  const { serverURL, requiredMeta, ImageUpload } = SITE_INFO.Comment.Waline;
  commentList.walineInit = init({
    el: commentDOM, path: window.location.pathname.replace(/\/$/, ''), serverURL,
    emoji: ['https://registry.npmmirror.com/@waline/emojis/1.3.0/files/alus', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bilibili', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bmoji', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/qq', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/weibo', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/soul-emoji'],
    reaction: [
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_agree.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_look_down.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sunglasses.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_pick_nose.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_awkward.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sleep.png",
    ],
    requiredMeta: requiredMeta as WalineMeta[],
    // uploadURL 留空即关闭评论区图片上传
    imageUploader: ImageUpload.uploadURL ? uploadImage : false
  });
}

// 检查是否开启评论
const checkComment = () => {
  const CommentARR: any = Object.keys(SITE_INFO.Comment);
  const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
  return CommentItem;
}

// 初始化评论插件
const commentInit = async (key: string, commentList: any) => {
  // 评论 DOM
  const commentDOM = '.vh-comment>section'
  if (!document.querySelector(commentDOM)) return;
  // 评论组件
  const CommentList: any = { TwikooFn, WalineFn };
  // 初始化评论
  CommentList[`${key}Fn`](commentDOM, commentList);
}

export { checkComment, commentInit }
