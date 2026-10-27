import type { Translation } from "./types";

export const ko: Translation = {
	htmlLang: "ko",
	nativeName: "한국어",
	ui: {
		moveSequenceLabel: "회전 순서",
		sequenceHint:
			"U D L R F B M E S 회전을 공백으로 구분해 입력해요. 각 회전 뒤에 ' 를 붙이면 반시계 방향, 2 또는 3을 붙이면 반복 횟수예요 (L3 = L을 세 번).",
		optionsLegend: "옵션",
		showFinalState: "최종 상태 표시",
		finalStateHint: "마지막 단계 뒤에 큐브를 하나 더 추가해요.",
		startingPosition: "시작 위치",
		topColor: "윗면 색",
		frontColor: "앞면 색",
		resetOrientation: "기본 방향으로 되돌리기",
		startingSequenceLabel: "시작 순서 (스크램블)",
		startingSequenceHint:
			"1단계 전에 완성된 큐브에 적용해요. 이 회전은 그려지지 않아요.",
		tryExample: "예시 사용해 보기",
		downloadPdf: "PDF 다운로드",
		generating: "생성 중…",
		sheetPreview: "시트 미리보기",
		colors: {
			white: "흰색",
			yellow: "노란색",
			green: "초록색",
			blue: "파란색",
			red: "빨간색",
			orange: "주황색",
		},
		steps: (count) => `${count}단계`,
		pages: (count) => `${count}페이지`,
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `윗면 ${top}, 앞면 ${front}`,
		startAfter: (notations) => `${notations} 적용 후`,
		startSummary: (parts) => ` · 시작: ${parts.join(", ")}`,
		frontColorChanged: (color) => `앞면 색이 ${color}(으)로 바뀌었어요.`,
		enterMoves: "회전 순서를 입력하면 시작해요.",
		fixSequence: "미리보기를 보려면 순서를 수정해 주세요.",
		previewOutdated: (stepCount) =>
			`미리보기가 최신 상태가 아니에요. 현재 ${stepCount}단계가 표시돼요.`,
		enterSequenceToDownload: "다운로드하려면 순서를 입력해 주세요.",
		fixMove: (position) =>
			`다운로드하려면 ${position}번째 동작을 수정해 주세요.`,
		fixStartMove: (position) =>
			`다운로드하려면 시작 순서의 ${position}번째 동작을 수정해 주세요.`,
		pdfSaved: (filename) => `PDF를 ${filename} 파일로 저장했어요.`,
		pdfFailed: "PDF를 생성하지 못했어요. 다시 시도해 주세요.",
		pageLabel: (page, total, steps) =>
			`${total}페이지 중 ${page}페이지: ${steps}`,
		finalStateWord: "최종 상태",
		startingSequenceError: (error) => `시작 순서: ${error}`,
		languageNavLabel: "언어",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`${position}번째 동작 '${token}' 형식이 올바르지 않아요. ${face}, ${face}', ${face}2, ${face}3 중 하나로 입력해 주세요 (2 또는 3은 반복 횟수).`,
		lowercase: (position, token) =>
			`${position}번째 동작 '${token}' 형식은 지원하지 않아요. 영어 대문자 U, D, L, R, F, B, M, E, S 중 하나로 입력해 주세요.`,
		notAFace: (position, token) =>
			`${position}번째 동작 '${token}' 형식은 큐브의 면이 아니에요. 영어 대문자 U, D, L, R, F, B, M, E, S 중 하나로 입력해 주세요.`,
	},
	page: {
		title: "루빅스 큐브 단계 PDF 생성기 – Cubing Steps Generator",
		description:
			"무료 루빅스 큐브 알고리즘 PDF 생성기예요. F L F U' R U 같은 회전 기호를 입력하면 화살표가 그려진 인쇄용 해법 단계를 만들어 줘요. 브라우저에서 바로 실행됩니다.",
		ogImageAlt:
			"번호가 매겨진 루빅스 큐브 네 단계, 각 큐브에 돌릴 층을 가리키는 화살표가 있음",
		h1: "루빅스 큐브 단계 PDF: Cubing Steps Generator",
		structuredDescription:
			"루빅스 큐브 회전 순서를 화살표가 있는 번호 매긴 해법 단계의 인쇄용 PDF로 바꿔 줘요.",
		howTitle: "사용 방법",
		howText:
			"Cubing Steps Generator는 루빅스 큐브 회전 순서(알고리즘 또는 전체 해법)를 번호가 매겨진 그림 단계의 인쇄용 PDF로 바꿔 주는 무료 온라인 도구입니다. 튜토리얼, 수업, 다른 스피드큐버와의 해법 공유에 편리해요. 각 단계는 회전 전의 큐브와 돌릴 층을 가리키는 화살표를 보여 주고, 반복 회전에는 빨간색 x2 또는 x3 표시가 붙어요.",
		notationTitle: "회전 기호",
		notationText:
			"면은 U (윗면), D (아랫면), L (왼쪽), R (오른쪽), F (앞면), B (뒷면)로 쓰고, 가운데 층은 M (L과 R 사이, L처럼 회전), E (U와 D 사이, D처럼 회전), S (F와 B 사이, F처럼 회전)로 쓰며, 각각 공백으로 구분해요. 회전은 기본적으로 시계 방향이고, 어포스트로피를 붙이면 반시계 방향 (U'), 2 또는 3을 붙이면 반복 횟수 (L2, L3)예요. 3x3 큐브의 표준 기호입니다. 예시: F L F U' R U F2 L2 U'.",
		faqTitle: "자주 묻는 질문",
		faq: [
			{
				question: "PDF는 서버에서 생성되나요?",
				answer:
					"아니요. 시트는 브라우저에서 만들어지고 아무것도 업로드되지 않으므로 입력한 순서는 비공개로 유지돼요.",
			},
			{
				question: "순서는 얼마나 길어도 되나요?",
				answer:
					"길이 제한은 없어요. 한 페이지에 최대 30단계가 들어가고, 더 긴 순서는 새 A4 페이지로 이어져요.",
			},
			{
				question: "섞인 큐브에서 시작할 수 있나요?",
				answer:
					"네. 시작 방향을 고르고 시작 순서를 입력한 뒤, 마지막 단계 뒤에 최종 상태 큐브를 추가할 수 있어요.",
			},
		],
	},
};
