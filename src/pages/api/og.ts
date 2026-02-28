import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get('title') || '뇌간식';
  const category = url.searchParams.get('category') || '';

  // Generate simple SVG-based OG image
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#FFF9F0"/>
      <rect y="580" width="1200" height="50" fill="#6C5CE7"/>
      <text x="80" y="180" font-family="sans-serif" font-size="80" fill="#6C5CE7" font-weight="bold">🧠</text>
      <text x="160" y="180" font-family="sans-serif" font-size="48" fill="#6C5CE7" font-weight="bold">뇌간식</text>
      <text x="80" y="300" font-family="sans-serif" font-size="40" fill="#2D3436" font-weight="bold">${escapeXml(title.length > 30 ? title.slice(0, 30) + '...' : title)}</text>
      ${category ? `<text x="80" y="370" font-family="sans-serif" font-size="24" fill="#636E72">${escapeXml(category)}</text>` : ''}
      <text x="80" y="450" font-family="sans-serif" font-size="20" fill="#636E72">매일 한 입 크기 지식 퀴즈</text>
      <text x="600" y="615" font-family="sans-serif" font-size="18" fill="white" text-anchor="middle">brain-snack.vercel.app</text>
    </svg>
  `;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
