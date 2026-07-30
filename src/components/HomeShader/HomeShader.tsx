import type { FC } from "react";
import { useEffect, useState } from "react";
import {
	ColorPanels,
	Dithering,
	DotGrid,
	DotOrbit,
	GodRays,
	GrainGradient,
	LiquidMetal,
	MeshGradient,
	Metaballs,
	NeuroNoise,
	PerlinNoise,
	SimplexNoise,
	SmokeRing,
	Spiral,
	StaticMeshGradient,
	Swirl,
	Voronoi,
	Warp,
	Water,
	Waves
} from "@paper-design/shaders-react";
import SITE_CONFIG from "@/config";

// 着色器名称 → 组件 的映射表
// config.ts 的 HomeShader.type 填这里的 key，填了表里没有的名字会回退到 Warp
const SHADER_MAP: Record<string, FC<any>> = {
	Warp,
	MeshGradient,
	StaticMeshGradient,
	GrainGradient,
	SmokeRing,
	Swirl,
	Spiral,
	Waves,
	Water,
	NeuroNoise,
	SimplexNoise,
	PerlinNoise,
	Dithering,
	Metaballs,
	Voronoi,
	GodRays,
	ColorPanels,
	DotOrbit,
	DotGrid,
	LiquidMetal
};

// WebGL2 是否可用。不可用时 ShaderMount 内部会直接 throw（且是在没有 .catch 的 async 里，
// React 既不报错也不重试），画面永远是空的，所以这种情况下必须让 MainHeader 的静态图兜底继续留着
const canUseWebGL2 = () => {
	try {
		return !!document.createElement("canvas").getContext("webgl2");
	} catch {
		return false;
	}
};

// 用户是否偏好「减少动态效果」。命中时把 speed 压成 0（着色器仍渲染静态色场，只是不再流动），
// 满屏持续流动的背景对前庭功能障碍用户很不友好（WCAG 2.2.2）
const useReducedMotion = () => {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mql.matches);
		const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return reduced;
};

const HomeShader: FC = () => {
	const config: any = (SITE_CONFIG as any).HomeShader || {};
	const reduced = useReducedMotion();

	// 着色器确实能画出来之后才通知 MainHeader 淡出静态图（见 MainHeader.less 的 .shader-ready）
	useEffect(() => {
		if (config.enable === false || !canUseWebGL2()) return;
		const box = document.querySelector(".header-main");
		if (!box) return;
		// 留一点时间给 WebGL 初始化与首帧绘制，避免静态图先没了着色器还没上来
		const timer = window.setTimeout(() => box.classList.add("shader-ready"), 200);
		return () => window.clearTimeout(timer);
	}, [config.enable]);

	// enable: false 时不渲染，Banner 回退成 HomeBanner.background 的静态图
	if (config.enable === false) return null;

	// type 不认识就回退到 Warp
	const Shader = SHADER_MAP[config.type as string] || Warp;
	// colors / speed 单独提出来是为了在 config 里更显眼，其余参数放在 params 里原样透传
	const { colors, speed, params } = config;

	return (
		<Shader
			{...(params || {})}
			{...(Array.isArray(colors) && colors.length ? { colors } : {})}
			{...(typeof speed === "number" ? { speed: reduced ? 0 : speed } : {})}
			style={{ width: "100%", height: "100%", display: "block" }}
		/>
	);
};

export default HomeShader;
