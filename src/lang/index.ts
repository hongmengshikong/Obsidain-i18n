import en from "./en";
import zh from "./zh";
import zhTW from "./zh-TW";

/**
 * 所有支持的语言包
 * key: Obsidian 的语言代码
 * value: 对应语言的文本对象
 */
const LANGUAGES: Record<string, Record<string, string>> = {
	en,
	zh,
	"zh-CN": zh,
	zhTW,
	"zh-TW": zhTW,
};

let currentLang: Record<string, string> = en;

/**
 * 初始化语言
 * @param app Obsidian App
 */
export function initLanguage(app: any) {
	const i18n = app?.i18n?.i18next || (window as any)?.i18next;
	const langCode = i18n?.language || "en";
	currentLang = LANGUAGES[langCode] || en;
}

/**
 * Android 风格的资源查找方法
 * @param id 资源 id（键名）
 * @returns 对应语言文本，找不到时返回 id
 */
export function getString(id: string): string {
	return currentLang[id] || id;
}

// ✨ 新增：支持变量替换的格式化函数
export function format(templateKey: string, params: Record<string, string | number | boolean>): string {
	let str = getString(templateKey);
	for (const [key, value] of Object.entries(params)) {
		// 转为字符串，避免 [object Object]
		const valStr = String(value);
		// 全局替换 ${key}
		str = str.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), valStr);
	}
	return str;
}
