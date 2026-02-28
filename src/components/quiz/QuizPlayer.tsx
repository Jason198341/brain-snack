import { useState, useEffect, useCallback } from 'react';
import type { Quiz, QuizState, QuizResult, QuizStats } from '../../lib/types';
import { CATEGORY_COLORS, DIFFICULTY_LABELS } from '../../lib/types';

interface Props {
  quiz: Quiz;
  prevSlug?: string;
  nextSlug?: string;
}

function getStoredResult(slug: string): QuizResult | null {
  try {
    const stored = localStorage.getItem(`quiz_${slug}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeResult(slug: string, result: QuizResult) {
  try {
    localStorage.setItem(`quiz_${slug}`, JSON.stringify(result));
  } catch { /* ignore */ }
}

export default function QuizPlayer({ quiz, prevSlug, nextSlug }: Props) {
  const [state, setState] = useState<QuizState>('UNSOLVED');
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [shared, setShared] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    const stored = getStoredResult(quiz.slug);
    if (stored) {
      setSelected(stored.choice);
      setState(stored.result);
    }
  }, [quiz.slug]);

  const handleSelect = (index: number) => {
    if (state === 'CORRECT' || state === 'WRONG') return;
    setSelected(index);
    setState('SOLVING');
  };

  const handleSubmit = useCallback(async () => {
    if (selected === null) return;
    const result: QuizState = selected === quiz.correctIndex ? 'CORRECT' : 'WRONG';
    setState(result);

    const quizResult: QuizResult = { choice: selected, result, timestamp: Date.now() };
    storeResult(quiz.slug, quizResult);

    // Submit to API
    try {
      await fetch('/api/quiz-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSlug: quiz.slug,
          selectedIndex: selected,
          isCorrect: result === 'CORRECT',
        }),
      });
    } catch { /* silent fail */ }

    // Fetch stats
    try {
      const res = await fetch(`/api/quiz-stats?slug=${quiz.slug}`);
      if (res.ok) setStats(await res.json());
    } catch { /* silent fail */ }
  }, [selected, quiz.correctIndex, quiz.slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/quiz/${quiz.slug}`;
    const text = `🧠 뇌간식 — "${quiz.title}"\n${state === 'CORRECT' ? '✅ 맞혔습니다!' : '도전해보세요!'}\n`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `뇌간식 — ${quiz.title}`, text, url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const isFinished = state === 'CORRECT' || state === 'WRONG';
  const categoryColor = CATEGORY_COLORS[quiz.category] || '#6C5CE7';

  return (
    <article className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {quiz.category}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {'★'.repeat(quiz.difficulty)}{'☆'.repeat(3 - quiz.difficulty)} {DIFFICULTY_LABELS[quiz.difficulty]}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">{quiz.publishedAt}</span>
      </div>

      {/* Question */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6 leading-relaxed">
        {quiz.question}
      </h1>

      {/* Choices */}
      <div className="space-y-3" role="radiogroup" aria-label="선택지">
        {quiz.choices.map((choice, i) => {
          let classes = 'w-full text-left px-4 py-4 rounded-xl border-2 transition-all text-base font-medium cursor-pointer min-h-[56px] relative';
          const statPercent = stats?.distribution?.[i]
            ? Math.round((stats.distribution[i] / stats.total) * 100)
            : null;

          if (isFinished) {
            if (i === quiz.correctIndex) {
              classes += ' border-[var(--color-correct)] bg-green-50 dark:bg-green-900/20';
            } else if (i === selected && state === 'WRONG') {
              classes += ' border-[var(--color-wrong)] bg-red-50 dark:bg-red-900/20';
            } else {
              classes += ' border-gray-200 dark:border-gray-700 opacity-50';
            }
          } else if (i === selected) {
            classes += ' border-[var(--color-primary)] bg-purple-50 dark:bg-purple-900/20 scale-[1.01]';
          } else {
            classes += ' border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary)] hover:bg-purple-50/30';
          }

          return (
            <button
              key={i}
              role="radio"
              aria-checked={i === selected}
              tabIndex={0}
              onClick={() => handleSelect(i)}
              className={classes}
              disabled={isFinished}
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                  {isFinished && i === quiz.correctIndex ? '✓' : isFinished && i === selected && state === 'WRONG' ? '✗' : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{choice}</span>
                {isFinished && statPercent !== null && (
                  <span className="text-sm font-bold shrink-0">{statPercent}%</span>
                )}
              </span>
              {/* Stats bar */}
              {isFinished && statPercent !== null && (
                <div className="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-700 ease-out"
                  style={{
                    width: `${statPercent}%`,
                    backgroundColor: i === quiz.correctIndex ? 'var(--color-correct)' : 'var(--color-text-secondary)',
                    opacity: 0.3,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {state === 'SOLVING' && (
        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-lg hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer min-h-[56px]"
        >
          정답 확인
        </button>
      )}

      {/* Result */}
      {isFinished && (
        <>
          <div
            className={`mt-6 p-5 rounded-xl ${state === 'CORRECT' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}
            role="alert"
            aria-live="assertive"
          >
            <p className="font-bold text-xl mb-1">
              {state === 'CORRECT' ? '✅ 정답!' : '❌ 아쉬워요!'}
            </p>
            {stats && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {stats.total}명 참여 · 정답률 {Math.round((stats.distribution[quiz.correctIndex] / stats.total) * 100)}%
              </p>
            )}
          </div>

          {/* Explanation toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full mt-4 py-4 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer"
          >
            {showExplanation ? '해설 접기 ↑' : '해설 보기 ↓'}
          </button>

          {showExplanation && (
            <div
              className="mt-4 p-6 rounded-xl bg-[var(--color-bg-warm)] dark:bg-[var(--color-dark-surface)] border border-gray-100 dark:border-gray-800"
              style={{ animation: 'slideDown 0.3s ease-out' }}
            >
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: formatExplanation(quiz.explanation) }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer min-h-[48px]"
            >
              {shared ? '링크 복사됨!' : '공유하기'}
            </button>
            {nextSlug && (
              <a
                href={`/quiz/${nextSlug}`}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-center no-underline hover:bg-[var(--color-primary-dark)] transition-colors min-h-[48px] flex items-center justify-center"
              >
                다음 문제 →
              </a>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
            {prevSlug ? (
              <a href={`/quiz/${prevSlug}`} className="text-[var(--color-primary)] no-underline">← 이전 문제</a>
            ) : <span />}
            <a href="/archive" className="text-[var(--color-text-secondary)] no-underline">전체 보기</a>
            {nextSlug ? (
              <a href={`/quiz/${nextSlug}`} className="text-[var(--color-primary)] no-underline">다음 문제 →</a>
            ) : <span />}
          </div>
        </>
      )}
    </article>
  );
}

function formatExplanation(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[var(--color-primary)] pl-4 py-1 my-3 text-sm bg-purple-50/50 dark:bg-purple-900/10 rounded-r-lg">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n- /g, '</p><li class="ml-4 mb-1">• ')
    .replace(/\n(\d+)\. /g, '</p><li class="ml-4 mb-1">$1. ');
}
