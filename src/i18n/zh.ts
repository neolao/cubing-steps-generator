import type { Translation } from "./types";

export const zh: Translation = {
	htmlLang: "zh-Hans",
	nativeName: "简体中文",
	ui: {
		moveSequenceLabel: "转动公式",
		sequenceHint:
			"可用转动 U D L R F B M E S,后面可加 ' 表示逆时针,或加 2、3 表示重复次数(L3 = 连续转 L 三次),各步之间用空格分隔。",
		optionsLegend: "选项",
		showFinalState: "显示最终状态",
		finalStateHint: "在最后一步之后再添加一个魔方图。",
		startingPosition: "起始状态",
		topColor: "顶面颜色",
		frontColor: "前面颜色",
		resetOrientation: "恢复默认朝向",
		startingSequenceLabel: "起始公式(打乱)",
		startingSequenceHint:
			"在第 1 步之前先作用于还原的魔方,这些转动不会画出来。",
		tryExample: "试试示例",
		downloadPdf: "下载 PDF",
		generating: "正在生成…",
		sheetPreview: "页面预览",
		colors: {
			white: "白色",
			yellow: "黄色",
			green: "绿色",
			blue: "蓝色",
			red: "红色",
			orange: "橙色",
		},
		steps: (count) => `${count} 步`,
		pages: (count) => `${count} 页`,
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `顶面${top},前面${front}`,
		startAfter: (notations) => `先做 ${notations}`,
		startSummary: (parts) => ` · 起始:${parts.join(",")}`,
		frontColorChanged: (color) => `前面颜色已改为${color}。`,
		enterMoves: "请输入转动公式开始。",
		fixSequence: "请先修正公式,才能查看预览。",
		previewOutdated: (stepCount) => `预览已过期,当前显示 ${stepCount} 步。`,
		enterSequenceToDownload: "请输入公式后再下载。",
		fixMove: (position) => `请先修正第 ${position} 个转动,才能下载。`,
		fixStartMove: (position) =>
			`请先修正起始公式的第 ${position} 个转动,才能下载。`,
		pdfSaved: (filename) => `PDF 已保存为 ${filename}。`,
		pdfFailed: "无法生成 PDF,请重试。",
		pageLabel: (page, total, steps) => `第 ${page} 页,共 ${total} 页:${steps}`,
		finalStateWord: "最终状态",
		startingSequenceError: (error) => `起始公式:${error}`,
		languageNavLabel: "语言",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`第 ${position} 个转动 '${token}' 无效。请写成 ${face}、${face}'、${face}2 或 ${face}3(重复 2 次或 3 次)。`,
		lowercase: (position, token) =>
			`第 ${position} 个转动 '${token}' 不受支持。转动字母必须是大写的 ASCII 字母 U、D、L、R、F、B、M、E 或 S(不能是小写或全角字母)。`,
		notAFace: (position, token) =>
			`第 ${position} 个转动 '${token}' 不是魔方的面。请使用大写的 ASCII 字母 U、D、L、R、F、B、M、E 或 S。`,
	},
	page: {
		title: "魔方步骤转PDF – 魔方步骤生成器",
		description:
			"免费的魔方公式转PDF工具:输入 F L F U' R U 等转动公式,即可生成带箭头、可打印的图解还原步骤,完全在浏览器中运行。",
		ogImageAlt: "四个带编号的魔方步骤,每个魔方图上都用箭头标出要转动的层",
		h1: "魔方步骤转PDF:魔方步骤生成器",
		structuredDescription:
			"把魔方转动公式变成可打印的PDF,包含带编号和箭头的还原步骤图。",
		howTitle: "使用方法",
		howText:
			"魔方步骤生成器是一个免费的在线工具,可以把魔方的转动公式(一个公式或完整的还原过程)变成可打印的PDF,里面是带编号的图解步骤,适合用来做教程、教学,或与其他魔友分享还原过程。每一步都显示转动之前的魔方,并用箭头标出要转动的层。重复转动会带有红色的 x2 或 x3 标记。",
		notationTitle: "转动符号",
		notationText:
			"用 U(上)、D(下)、L(左)、R(右)、F(前)、B(后)表示各个面,也可以用中层 M(中间层,位于 L 与 R 之间,转动方向同 L)、E(赤道层,位于 U 与 D 之间,转动方向同 D)、S(侧层,位于 F 与 B 之间,转动方向同 F),各步之间用空格分隔。默认顺时针转动;加撇号表示逆时针(U'),加 2 或 3 表示重复转动(L2、L3)。这是标准的三阶魔方符号。示例:F L F U' R U F2 L2 U'。",
		faqTitle: "常见问题",
		faq: [
			{
				question: "PDF 是在服务器上生成的吗?",
				answer:
					"不是。页面在你的浏览器中生成,不会上传任何内容,所以你的公式不会外泄。",
			},
			{
				question: "公式最多可以有多长?",
				answer:
					"没有长度限制。每页最多放 30 步,更长的公式会接着排到新的 A4 页面上。",
			},
			{
				question: "可以从打乱的魔方开始吗?",
				answer:
					"可以。你可以选择起始朝向、给出起始公式,还可以在最后一步之后加上最终状态的魔方图。",
			},
		],
	},
};
