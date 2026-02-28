/**
 * 뇌간식 AI 문제 생성 파이프라인
 * Claude API (Haiku → Sonnet 에스컬레이션)
 */

const SYSTEM_PROMPT = `당신은 "뇌간식"의 문제 출제자입니다. 다양한 시험에서 다루는 핵심 개념을 바탕으로, 일반 성인이 교양으로 즐길 수 있는 4지선다 퀴즈를 만듭니다.

## 톤앤매너
- "술자리에서 형이 설명해주는" 톤. 친근하고 재미있게.
- 비유와 일상 예시를 적극 활용
- 어려운 용어는 반드시 쉬운 말로 풀어서 설명
- 금지: "~입니다/~합니다" 딱딱한 어체, 교과서 말투, "알아봅시다/살펴보겠습니다"

## 출력 규칙
- 반드시 아래 JSON 형식으로만 출력
- 정답은 A,B,C,D 중 균등 분포 (특정 위치 편향 금지)
- 해설은 250~500자
- "한 줄 정리:" 블록 필수
- "알면 +1:" 블록 필수 (재미있는 추가 지식)
- 오답 선택지도 그럴듯하게 (함정이 있어야 교육적)

## JSON 스키마
{
  "title": "문제 제목 (짧고 호기심 유발)",
  "question": "문제 지문",
  "choices": ["A. 선택지1", "B. 선택지2", "C. 선택지3", "D. 선택지4"],
  "correct_answer": "A" | "B" | "C" | "D",
  "explanation": "해설 전문 (마크다운)",
  "metadata": {
    "concept": "핵심 개념명",
    "hook": "한 줄 훅 (공유 시 보이는 문구)",
    "one_liner": "한 줄 정리",
    "plus_one": "알면 +1 내용",
    "viral_score": 1-100,
    "share_hook": "공유 유도 문구"
  }
}`;

const FEW_SHOT_EXAMPLES = [
  {
    role: 'user' as const,
    content: JSON.stringify({ concept: '기회비용', category: '경제/경영', difficulty: 1 }),
  },
  {
    role: 'assistant' as const,
    content: JSON.stringify({
      title: '기회비용의 정체',
      question: '철수가 치킨(15,000원)과 피자(12,000원) 중 하나만 살 수 있을 때, 치킨을 선택했다면 이때 발생하는 기회비용은?',
      choices: ['A. 15,000원 (치킨 가격)', 'B. 12,000원 (피자 가격)', 'C. 27,000원 (둘의 합)', 'D. 3,000원 (가격 차이)'],
      correct_answer: 'B',
      explanation: '기회비용이란 뭔가를 선택했을 때 포기한 것 중 가장 가치 있는 것의 값이야.\n\n쉽게 말하면:\n- 치킨을 골랐어! 맛있다!\n- 근데 피자는 못 먹게 됐지?\n- 포기한 피자의 가치(12,000원) = 기회비용\n\n> 한 줄 정리: 기회비용 = 선택으로 포기한 것 중 가장 가치 있는 대안\n\n> 알면 +1: "공짜 점심은 없다"라는 경제학 격언이 바로 기회비용 개념에서 나왔어!',
      metadata: { concept: '기회비용', hook: '피자 vs 치킨, 진짜 비용은?', one_liner: '기회비용 = 포기한 최선의 대안', plus_one: '공짜 점심은 없다 격언의 기원', viral_score: 85, share_hook: '이거 의외로 틀리는 사람 많아' },
    }),
  },
];

interface GenerateQuizInput {
  concept: string;
  category: string;
  difficulty: 1 | 2 | 3;
  keywords?: string[];
  seasonContext?: string;
  avoidTopics?: string[];
}

interface GeneratedQuiz {
  title: string;
  question: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
  metadata: {
    concept: string;
    hook: string;
    one_liner: string;
    plus_one: string;
    viral_score: number;
    share_hook: string;
  };
}

export async function generateQuiz(
  input: GenerateQuizInput,
  apiKey: string,
  model: string = 'claude-haiku-4-5-20251001'
): Promise<GeneratedQuiz> {
  const userPrompt = JSON.stringify({
    concept: input.concept,
    category: input.category,
    difficulty: input.difficulty,
    keywords: input.keywords || [],
    season_context: input.seasonContext || '',
    avoid_topics: input.avoidTopics || [],
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [...FEW_SHOT_EXAMPLES, { role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const quiz: GeneratedQuiz = JSON.parse(text);

  // Structural validation
  validateQuiz(quiz);

  return quiz;
}

function validateQuiz(quiz: GeneratedQuiz): void {
  if (!quiz.title || !quiz.question || !quiz.explanation) {
    throw new Error('Missing required fields');
  }
  if (!Array.isArray(quiz.choices) || quiz.choices.length !== 4) {
    throw new Error('Must have exactly 4 choices');
  }
  if (!['A', 'B', 'C', 'D'].includes(quiz.correct_answer)) {
    throw new Error('correct_answer must be A, B, C, or D');
  }
  if (quiz.explanation.length < 100 || quiz.explanation.length > 2000) {
    throw new Error('Explanation length out of range');
  }
  if (!quiz.explanation.includes('한 줄 정리') && !quiz.explanation.includes('한줄정리')) {
    throw new Error('Missing 한 줄 정리 block');
  }

  // Check for banned expressions
  const banned = ['살펴보겠습니다', '알아봅시다', '알아보겠습니다'];
  for (const b of banned) {
    if (quiz.explanation.includes(b)) {
      throw new Error(`Banned expression found: ${b}`);
    }
  }
}

export async function crossValidate(
  quiz: GeneratedQuiz,
  apiKey: string
): Promise<boolean> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `다음 문제의 정답을 A, B, C, D 중 하나로만 답하세요.\n\n${quiz.question}\n${quiz.choices.join('\n')}\n\n정답:`,
      }],
    }),
  });

  const data = await response.json();
  const answer = data.content[0].text.trim().charAt(0);
  return answer === quiz.correct_answer;
}

export async function generateWithEscalation(
  input: GenerateQuizInput,
  apiKey: string
): Promise<GeneratedQuiz> {
  // Try Haiku first
  try {
    const quiz = await generateQuiz(input, apiKey, 'claude-haiku-4-5-20251001');
    const valid = await crossValidate(quiz, apiKey);
    if (valid) return quiz;
  } catch { /* escalate */ }

  // Escalate to Sonnet
  const quiz = await generateQuiz(input, apiKey, 'claude-sonnet-4-20250514');
  const valid = await crossValidate(quiz, apiKey);
  if (!valid) throw new Error('Cross validation failed even with Sonnet');
  return quiz;
}
