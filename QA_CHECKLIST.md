# 뇌간식 품질 평가 기준 (QA Checklist)

> 모든 항목이 PASS여야 배포 승인

## 1. 프로젝트 구조 (5항목)
- [ ] QA-1.1: Astro + React + TypeScript + Tailwind 정상 빌드
- [ ] QA-1.2: 디렉토리 구조 스펙 준수 (pages/, components/, layouts/, lib/, content/)
- [ ] QA-1.3: 환경변수 .env.example 파일 존재 + 모든 키 문서화
- [ ] QA-1.4: TypeScript strict 모드, 빌드 에러 0개
- [ ] QA-1.5: ESLint/Prettier 설정 + 린트 에러 0개

## 2. DB 스키마 (5항목)
- [ ] QA-2.1: SQL 마이그레이션 파일 존재 (8 테이블)
- [ ] QA-2.2: 필수 인덱스 7개 정의
- [ ] QA-2.3: FK 관계 올바르게 설정
- [ ] QA-2.4: 시드 데이터 최소 10개 퀴즈 포함
- [ ] QA-2.5: RLS(Row Level Security) 정책 정의

## 3. 디자인 시스템 (8항목)
- [ ] QA-3.1: CSS 변수로 컬러 9색 정의 (#6C5CE7 Primary 포함)
- [ ] QA-3.2: Pretendard 폰트 로드 + 타이포 스케일 적용
- [ ] QA-3.3: 다크모드 CSS 변수 정의
- [ ] QA-3.4: 반응형 브레이크포인트 3단계 (mobile/tablet/desktop)
- [ ] QA-3.5: 터치 타겟 최소 48x48px
- [ ] QA-3.6: 색상 대비 WCAG AA (4.5:1) 이상
- [ ] QA-3.7: BaseLayout + Header + Footer 렌더링
- [ ] QA-3.8: SEO 컴포넌트 (메타태그, OG, 트위터카드)

## 4. 랜딩 페이지 (7항목)
- [ ] QA-4.1: 히어로 섹션 (헤드라인, 서브카피, CTA)
- [ ] QA-4.2: 인터랙티브 샘플 퀴즈 동작
- [ ] QA-4.3: 3-step 작동방식 섹션
- [ ] QA-4.4: 소셜프루프 섹션
- [ ] QA-4.5: 이메일 구독 폼 (유효성 검사)
- [ ] QA-4.6: 모바일 반응형 정상
- [ ] QA-4.7: FAQ 섹션

## 5. 퀴즈 페이지 (12항목)
- [ ] QA-5.1: 4지선다 선택지 렌더링
- [ ] QA-5.2: 선택 → 정답/오답 판정 정상
- [ ] QA-5.3: 정답 시 초록 하이라이트 + 체크 아이콘
- [ ] QA-5.4: 오답 시 빨강 테두리 + X 아이콘 + 정답 표시
- [ ] QA-5.5: 선택지별 비율 바 애니메이션
- [ ] QA-5.6: 해설 카드 접기/펼치기
- [ ] QA-5.7: SNS 공유 버튼 (Web Share API + 폴백)
- [ ] QA-5.8: localStorage 상태 저장/복원
- [ ] QA-5.9: 이전/다음 문제 네비게이션
- [ ] QA-5.10: 키보드 접근성 (radiogroup, Enter/Space)
- [ ] QA-5.11: aria-live 결과 알림
- [ ] QA-5.12: prefers-reduced-motion 대응

## 6. 아카이브 페이지 (5항목)
- [ ] QA-6.1: 퀴즈 카드 그리드 렌더링
- [ ] QA-6.2: 카테고리 필터 동작
- [ ] QA-6.3: 난이도 필터 동작
- [ ] QA-6.4: 키워드 검색 (디바운스 300ms)
- [ ] QA-6.5: 풀이 여부 표시 (localStorage 연동)

## 7. 구독 시스템 (6항목)
- [ ] QA-7.1: 이메일 입력 + 유효성 검사
- [ ] QA-7.2: /api/subscribe POST 정상 동작
- [ ] QA-7.3: 더블옵트인 확인 이메일 발송
- [ ] QA-7.4: /api/confirm GET 토큰 검증 + 활성화
- [ ] QA-7.5: 구독 확인 페이지 렌더링
- [ ] QA-7.6: 중복 이메일 처리

## 8. API 라우트 (4항목)
- [ ] QA-8.1: /api/quiz-stats 응답 비율 정상 반환
- [ ] QA-8.2: /api/quiz-response POST 풀이 저장
- [ ] QA-8.3: /api/og 동적 OG 이미지 생성
- [ ] QA-8.4: 에러 핸들링 (400, 404, 500)

## 9. AI 파이프라인 (5항목)
- [ ] QA-9.1: Claude API 호출 코드 존재
- [ ] QA-9.2: 시스템 프롬프트 + few-shot 정의
- [ ] QA-9.3: JSON 출력 파싱 + 구조 검증
- [ ] QA-9.4: 교차 검증 로직 구현
- [ ] QA-9.5: Haiku → Sonnet 에스컬레이션 분기

## 10. 이메일 시스템 (4항목)
- [ ] QA-10.1: Resend API 연동 코드
- [ ] QA-10.2: 뉴스레터 HTML 템플릿
- [ ] QA-10.3: 웰컴 시퀀스 정의 (D+0~D+7)
- [ ] QA-10.4: 구독 해지 원클릭 처리

## 11. 성능 (5항목)
- [ ] QA-11.1: 빌드 성공 (에러 0)
- [ ] QA-11.2: 번들 사이즈 목표 (퀴즈 < 20KB gzip)
- [ ] QA-11.3: 이미지 최적화 (WebP/AVIF)
- [ ] QA-11.4: 폰트 서브셋 + preload
- [ ] QA-11.5: SSG 정적 페이지 생성 확인

## 12. SEO (4항목)
- [ ] QA-12.1: 페이지별 메타태그 (title, description)
- [ ] QA-12.2: OG 이미지 설정
- [ ] QA-12.3: sitemap.xml 자동 생성
- [ ] QA-12.4: Schema.org Quiz 마크업 (퀴즈 페이지)

## 13. 배포 (3항목)
- [ ] QA-13.1: Vercel 배포 성공
- [ ] QA-13.2: 모든 페이지 접근 가능 (404 없음)
- [ ] QA-13.3: 환경변수 정상 설정

## 14. 포트폴리오 (3항목)
- [ ] QA-14.1: jasonmoon.dev/projects/brain-snack 페이지 존재
- [ ] QA-14.2: 프로젝트 카드에 썸네일 표시
- [ ] QA-14.3: featured: true + 적절한 order 설정

---
**총 76항목 | 전체 PASS 시 배포 승인**
