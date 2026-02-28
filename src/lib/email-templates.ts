/**
 * 뇌간식 이메일 템플릿
 */

import type { Quiz } from './types';
import { CATEGORY_COLORS } from './types';

export function dailyNewsletterHtml(quiz: Quiz, siteUrl: string, unsubscribeToken: string): string {
  const categoryColor = CATEGORY_COLORS[quiz.category] || '#6C5CE7';
  const quizUrl = `${siteUrl}/quiz/${quiz.slug}`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #F8F9FA; font-family: 'Pretendard', -apple-system, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 24px; border-bottom: 1px solid #eee; }
    .content { padding: 32px 24px; }
    .question { font-size: 18px; font-weight: bold; line-height: 1.6; color: #2D3436; margin-bottom: 24px; }
    .choice { display: block; width: 100%; padding: 14px 16px; margin-bottom: 8px; border: 2px solid #E2E8F0; border-radius: 12px; text-decoration: none; color: #2D3436; font-size: 15px; font-weight: 500; text-align: left; }
    .choice:hover { border-color: #6C5CE7; background: #F5F3FF; }
    .cta { display: inline-block; padding: 16px 32px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 16px; }
    .footer { padding: 24px; text-align: center; color: #636E72; font-size: 12px; border-top: 1px solid #eee; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; color: white; font-size: 12px; font-weight: bold; }
    @media (prefers-color-scheme: dark) {
      body { background: #1A1A2E; }
      .container { background: #16213E; }
      .question, .choice { color: #E8E8E8; }
      .choice { border-color: #374151; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <table width="100%">
        <tr>
          <td><span style="font-size:24px">🧠</span> <strong style="color:#6C5CE7;font-size:18px;">뇌간식</strong></td>
          <td align="right" style="color:#636E72;font-size:13px;">${quiz.publishedAt}</td>
        </tr>
      </table>
    </div>
    <div class="content">
      <div style="margin-bottom:16px;">
        <span class="badge" style="background:${categoryColor};">${quiz.category}</span>
        <span style="color:#636E72;font-size:13px;margin-left:8px;">${'★'.repeat(quiz.difficulty)}${'☆'.repeat(3 - quiz.difficulty)}</span>
      </div>
      <div class="question">${quiz.question}</div>
      ${quiz.choices.map((c, i) => `<a href="${quizUrl}?choice=${i}" class="choice">${c}</a>`).join('\n')}
      <div style="text-align:center;margin-top:24px;">
        <a href="${quizUrl}" class="cta">정답 확인하기 →</a>
      </div>
    </div>
    <div class="footer">
      <p>매일 아침, 한 입 크기 지식 퀴즈</p>
      <p>
        <a href="${unsubscribeUrl}" style="color:#636E72;">구독 해지</a> ·
        <a href="${siteUrl}/archive" style="color:#636E72;">아카이브</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeSequenceHtml(day: number, siteUrl: string, unsubscribeToken: string): string | null {
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const sequences: Record<number, { subject: string; body: string }> = {
    1: {
      subject: '어제 문제 풀어봤어? 🧐',
      body: `<p>어제 첫 번째 뇌간식이 도착했을 텐데, 풀어봤나요?</p>
        <p>틀려도 괜찮아요! 해설을 읽는 것만으로도 지식이 쌓여요.</p>
        <a href="${siteUrl}/archive" style="display:inline-block;padding:14px 28px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;margin-top:16px;">어제 문제 다시 보기 →</a>`,
    },
    3: {
      subject: '3일 연속 도전! 🔥',
      body: `<p>벌써 3일째! 꾸준히 풀고 있다면 대단해요.</p>
        <p>뇌간식은 매일 다른 분야의 문제가 나와요. 경제, 과학, 심리학… 어떤 분야가 제일 재밌었나요?</p>
        <a href="${siteUrl}/archive" style="display:inline-block;padding:14px 28px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;margin-top:16px;">카테고리별 둘러보기 →</a>`,
    },
    7: {
      subject: '1주일 완주! 🎉',
      body: `<p>뇌간식과 함께한 지 일주일!</p>
        <p>매일 1문제씩, 7개의 새로운 지식을 얻었어요. 친구에게도 추천해보는 건 어때요?</p>
        <a href="${siteUrl}" style="display:inline-block;padding:14px 28px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;margin-top:16px;">친구에게 공유하기 →</a>`,
    },
  };

  const seq = sequences[day];
  if (!seq) return null;

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Pretendard',-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;padding:32px;">
    <h1 style="color:#6C5CE7;font-size:24px;">🧠 뇌간식</h1>
    <div style="font-size:16px;line-height:1.6;color:#2D3436;">${seq.body}</div>
    <p style="font-size:13px;color:#636E72;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
      뇌간식 — 매일 한 입 크기 지식 퀴즈 · <a href="${unsubscribeUrl}" style="color:#636E72;">구독 해지</a>
    </p>
  </div>
</body></html>`;
}

export function getWelcomeSequenceSubject(day: number): string | null {
  const subjects: Record<number, string> = {
    1: '[뇌간식] 어제 문제 풀어봤어? 🧐',
    3: '[뇌간식] 3일 연속 도전! 🔥',
    7: '[뇌간식] 1주일 완주! 🎉',
  };
  return subjects[day] || null;
}

export function welcomeEmailHtml(siteUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Pretendard',-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;padding:32px;">
    <h1 style="color:#6C5CE7;font-size:28px;">🧠 환영합니다!</h1>
    <p style="font-size:16px;line-height:1.6;color:#2D3436;">
      <strong>뇌간식</strong>에 오신 걸 환영해요!<br><br>
      내일 아침 8시, 첫 번째 문제가 도착합니다.<br>
      그동안 아카이브에서 미리 문제를 풀어보세요.
    </p>
    <a href="${siteUrl}/archive" style="display:inline-block;padding:14px 28px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;margin-top:16px;">
      아카이브 둘러보기 →
    </a>
    <p style="font-size:13px;color:#636E72;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
      뇌간식 — 매일 한 입 크기 지식 퀴즈
    </p>
  </div>
</body>
</html>`;
}
