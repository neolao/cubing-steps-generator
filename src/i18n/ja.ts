import type { Translation } from "./types";

export const ja: Translation = {
	htmlLang: "ja",
	nativeName: "日本語",
	ui: {
		moveSequenceLabel: "手順",
		sequenceHint:
			"U D L R F B M E S の動きを、スペースで区切って入力します。各文字の後ろに ' を付けると反時計回り、2 または 3 を付けるとその回数の繰り返しになります (L3 = L を 3 回)。",
		optionsLegend: "オプション",
		showFinalState: "最終状態を表示",
		finalStateHint: "最後のステップの後に、キューブをもう 1 つ追加します。",
		startingPosition: "開始時の向き",
		topColor: "上面の色",
		frontColor: "正面の色",
		resetOrientation: "標準の向きに戻す",
		startingSequenceLabel: "開始手順 (スクランブル)",
		startingSequenceHint:
			"ステップ 1 の前に、完成状態のキューブへ適用されます。この手順は図に描かれません。",
		tryExample: "例を試す",
		downloadPdf: "PDF をダウンロード",
		generating: "生成中…",
		sheetPreview: "シートのプレビュー",
		colors: {
			white: "白",
			yellow: "黄",
			green: "緑",
			blue: "青",
			red: "赤",
			orange: "橙",
		},
		steps: (count) => `${count} ステップ`,
		pages: (count) => `${count} ページ`,
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `上面 ${top}、正面 ${front}`,
		startAfter: (notations) => `${notations} の後`,
		startSummary: (parts) => ` · 開始: ${parts.join("、")}`,
		frontColorChanged: (color) => `正面の色を ${color} に変更しました。`,
		enterMoves: "手順を入力してください。",
		fixSequence: "プレビューを表示するには、手順を修正してください。",
		previewOutdated: (stepCount) =>
			`プレビューが古くなっています。${stepCount} ステップを表示中です。`,
		enterSequenceToDownload: "ダウンロードするには、手順を入力してください。",
		fixMove: (position) =>
			`ダウンロードするには、${position} 番目の動きを修正してください。`,
		fixStartMove: (position) =>
			`ダウンロードするには、開始手順の ${position} 番目の動きを修正してください。`,
		pdfSaved: (filename) => `PDF を ${filename} として保存しました。`,
		pdfFailed: "PDF を生成できませんでした。もう一度お試しください。",
		pageLabel: (page, total, steps) =>
			`${total} ページ中 ${page} ページ目: ${steps}`,
		finalStateWord: "最終状態",
		startingSequenceError: (error) => `開始手順: ${error}`,
		languageNavLabel: "言語",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`${position} 番目の動き '${token}' は正しくありません。 ${face}、${face}'、${face}2、${face}3 のいずれかの形式で入力してください (2 または 3 は繰り返しの回数です)。`,
		lowercase: (position, token) =>
			`${position} 番目の動き '${token}' には対応していません。 U, D, L, R, F, B, M, E, S の大文字の半角英字を使用してください。`,
		notAFace: (position, token) =>
			`${position} 番目の動き '${token}' はキューブの面ではありません。 大文字の半角英字 U, D, L, R, F, B, M, E, S を使用してください。`,
	},
	page: {
		title: "ルービックキューブの手順をPDFに – Cubing Steps Generator",
		description:
			"ルービックキューブのアルゴリズムをPDFにする無料ツールです。F L F U' R U などの手順を入力すると、矢印付きで印刷できる図解の手順書を作れます。ブラウザ上で動作します。",
		ogImageAlt:
			"番号付きのルービックキューブの 4 ステップ。各ステップで、回す段に矢印が描かれたキューブを表示",
		h1: "ルービックキューブの手順をPDFに: Cubing Steps Generator",
		structuredDescription:
			"ルービックキューブの手順を、矢印付きで番号の振られた、印刷できる PDF の手順書に変換します。",
		howTitle: "使い方",
		howText:
			"Cubing Steps Generator は、ルービックキューブの手順 (アルゴリズムや解法全体) を、番号付きの図解ステップを並べた印刷用 PDF に変換する無料のオンラインツールです。解説の作成や指導、ほかのスピードキューバーへの解法の共有に便利です。各ステップには、動かす前のキューブと、回す段を示す矢印が描かれます。繰り返しの回転には、赤い x2 または x3 の印が付きます。",
		notationTitle: "回転記号",
		notationText:
			"面は U (上)、D (下)、L (左)、R (右)、F (前)、B (後) で表し、中段は M (L と R の間の段で、L と同じ向きに回転)、E (U と D の間の段で、D と同じ向きに回転)、S (F と B の間の段で、F と同じ向きに回転) で表します。これらをスペースで区切って入力してください。回転は標準では時計回りです。反時計回りにするには ' を付け (U')、繰り返すには 2 または 3 を付けます (L2、L3)。これは 3x3 キューブの標準的な記号です。例: F L F U' R U F2 L2 U'。",
		faqTitle: "よくある質問",
		faq: [
			{
				question: "PDF はサーバーで生成されますか?",
				answer:
					"いいえ。シートはお使いのブラウザ内で作成され、何もアップロードされません。入力した手順が外部に送られることはありません。",
			},
			{
				question: "手順はどのくらいの長さまで入力できますか?",
				answer:
					"長さの制限はありません。1 ページに最大 30 ステップを配置し、それより長い手順は新しい A4 ページに続きます。",
			},
			{
				question: "スクランブルされたキューブから始められますか?",
				answer:
					"はい。開始時の向きと開始手順を指定でき、最後のステップの後に最終状態のキューブを追加することもできます。",
			},
		],
	},
};
