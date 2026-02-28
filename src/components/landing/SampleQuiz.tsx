import { useState } from 'react';
import type { Quiz, QuizState } from '../../lib/types';

interface Props {
  quiz: Quiz;
}

export default function SampleQuiz({ quiz }: Props) {
  const [state, setState] = useState<QuizState>('UNSOLVED');
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (state === 'CORRECT' || state === 'WRONG') return;
    setSelected(index);
    setState('SOLVING');
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setState(selected === quiz.correctIndex ? 'CORRECT' : 'WRONG');
  };

  const isFinished = state === 'CORRECT' || state === 'WRONG';

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">{quiz.question}</h3>
      <div className="space-y-3" role="radiogroup" aria-label="선택지">
        {quiz.choices.map((choice, i) => {
          let classes = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer min-h-[48px]';

          if (isFinished) {
            if (i === quiz.correctIndex) {
              classes += ' border-[var(--color-correct)] bg-green-50 dark:bg-green-900/20 text-[var(--color-correct)]';
            } else if (i === selected && state === 'WRONG') {
              classes += ' border-[var(--color-wrong)] bg-red-50 dark:bg-red-900/20 text-[var(--color-wrong)]';
            } else {
              classes += ' border-gray-200 dark:border-gray-700 opacity-50';
            }
          } else if (i === selected) {
            classes += ' border-[var(--color-primary)] bg-purple-50 dark:bg-purple-900/20';
          } else {
            classes += ' border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary)] hover:bg-purple-50/50';
          }

          return (
            <button
              key={i}
              role="radio"
              aria-checked={i === selected}
              onClick={() => handleSelect(i)}
              className={classes}
              disabled={isFinished}
            >
              <span className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {isFinished && i === quiz.correctIndex ? '✓' : isFinished && i === selected && state === 'WRONG' ? '✗' : String.fromCharCode(65 + i)}
                </span>
                <span>{choice}</span>
              </span>
            </button>
          );
        })}
      </div>

      {state === 'SOLVING' && (
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer min-h-[48px]"
        >
          정답 확인
        </button>
      )}

      {isFinished && (
        <div
          className={`mt-4 p-4 rounded-xl ${state === 'CORRECT' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}
          role="alert"
          aria-live="assertive"
        >
          <p className="font-bold text-lg mb-1">
            {state === 'CORRECT' ? '✅ 정답!' : '❌ 아쉬워요!'}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {state === 'CORRECT'
              ? '대단해요! 해설이 궁금하다면 구독해보세요.'
              : `정답은 ${String.fromCharCode(65 + quiz.correctIndex)}번이에요. 해설이 궁금하다면 구독해보세요.`}
          </p>
          <a
            href="/subscribe"
            className="inline-block mt-3 px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold no-underline hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            매일 문제 받기 →
          </a>
        </div>
      )}
    </div>
  );
}
