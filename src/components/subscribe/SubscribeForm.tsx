import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [agreed, setAgreed] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMsg('올바른 이메일 주소를 입력해주세요.');
      setStatus('error');
      return;
    }
    if (!agreed) {
      setErrorMsg('개인정보 수집에 동의해주세요.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || '구독 등록에 실패했습니다.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2">확인 이메일을 보냈어요!</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <strong>{email}</strong>으로 확인 메일을 보냈습니다.<br />
          메일함(스팸함도!)을 확인하고 링크를 클릭해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">이메일</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="hello@example.com"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--color-bg-light)] dark:bg-[var(--color-dark-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-base"
        />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => { setAgreed(e.target.checked); setStatus('idle'); }}
          className="mt-1 w-4 h-4 rounded accent-[var(--color-primary)]"
        />
        <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          개인정보(이메일) 수집·이용에 동의합니다. 뉴스레터 발송 목적으로만 사용되며, 구독 해지 시 즉시 파기됩니다.
        </span>
      </label>

      {status === 'error' && (
        <p className="text-sm text-[var(--color-wrong)] font-medium">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-base hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
      >
        {status === 'loading' ? '처리 중...' : '무료로 구독하기'}
      </button>
    </form>
  );
}
