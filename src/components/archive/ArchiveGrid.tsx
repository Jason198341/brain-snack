import { useState, useMemo, useEffect } from 'react';
import type { Quiz, Category } from '../../lib/types';
import { CATEGORIES, CATEGORY_COLORS, DIFFICULTY_LABELS } from '../../lib/types';

interface Props {
  quizzes: Quiz[];
}

export default function ArchiveGrid({ quizzes }: Props) {
  const [category, setCategory] = useState<string>('전체');
  const [difficulty, setDifficulty] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    let result = [...quizzes];
    if (category !== '전체') result = result.filter((q) => q.category === category);
    if (difficulty > 0) result = result.filter((q) => q.difficulty === difficulty);
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          quiz.question.toLowerCase().includes(q) ||
          quiz.metadata?.concept?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [quizzes, category, difficulty, searchDebounced]);

  // Check localStorage for solved status
  const isSolved = (slug: string) => {
    try {
      return !!localStorage.getItem(`quiz_${slug}`);
    } catch {
      return false;
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <input
          type="text"
          placeholder="키워드로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--color-dark-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('전체')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              category === '전체'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                category === cat
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
              style={category === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                difficulty === d
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {d === 0 ? '전체 난이도' : `${'★'.repeat(d)} ${DIFFICULTY_LABELS[d]}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {filtered.length}개의 문제
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((quiz) => (
          <a
            key={quiz.slug}
            href={`/quiz/${quiz.slug}`}
            className="block p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[var(--color-dark-surface)] hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all no-underline group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: CATEGORY_COLORS[quiz.category] }}
              >
                {quiz.category}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {'★'.repeat(quiz.difficulty)}{'☆'.repeat(3 - quiz.difficulty)}
              </span>
              {isSolved(quiz.slug) && (
                <span className="text-xs text-[var(--color-correct)] font-bold ml-auto">✓ 풀이 완료</span>
              )}
            </div>
            <h3 className="font-bold text-base mb-1 group-hover:text-[var(--color-primary)] transition-colors">
              {quiz.title}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
              {quiz.question}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">{quiz.publishedAt}</p>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--color-text-secondary)]">
          <p className="text-4xl mb-4">🔍</p>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
