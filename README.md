# AI낙찰이 (AI Bidder)

공공조달 나라장터 입찰공고를 AI로 분석하고 맞춤형 알림을 제공하는 모바일 최적화 웹 애플리케이션입니다.

## 🚀 주요 기능

- **입찰공고 검색**: 키워드, 금액, 지역, 기관별 검색
- **AI 요약**: GPT-4o-mini를 활용한 입찰공고 핵심 정보 요약
- **조건부 알림**: 사용자 정의 조건에 따른 이메일 알림
- **계정 관리**: 무료/프리미엄 계정 시스템
- **모바일 최적화**: 반응형 디자인으로 모바일 환경 최적화

## 🛠 기술 스택

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Axios** for API calls
- **CRACO** for Webpack configuration
- **CSS3** with mobile-first design

### Backend
- **Netlify Functions** (Node.js)
- **Google Sheets API** for data storage
- **OpenAI API** for AI summarization
- **SendGrid API** for email notifications

### External APIs
- **나라장터 공공조달 API** for bid data
- **OpenAI GPT-4o-mini** for AI analysis
- **Google Sheets** for user data storage
- **SendGrid** for email notifications

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd ai-nakchali
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 나라장터 API
REACT_APP_NARA_API_KEY=your_nara_api_key

# OpenAI API
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# 이메일 API (SendGrid)
REACT_APP_EMAIL_API_KEY=your_sendgrid_api_key

# Google Sheets API
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY=your_private_key

# JWT Secret
REACT_APP_JWT_SECRET=your_jwt_secret

# Google Analytics (선택사항)
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id
```

### 4. 개발 서버 실행
```bash
npm start
```

### 5. 프로덕션 빌드
```bash
npm run build
```

### 6. 번들 분석
```bash
npm run analyze
```

## 🚀 배포

### Netlify 배포
1. Netlify 대시보드에서 새 사이트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

### 환경 변수 설정 (Netlify)
- `REACT_APP_NARA_API_KEY`
- `REACT_APP_OPENAI_API_KEY`
- `REACT_APP_EMAIL_API_KEY`
- `REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL`
- `REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY`
- `REACT_APP_JWT_SECRET`
- `GOOGLE_SHEETS_ERROR_LOG_ID` (에러 로깅용)
- `SLACK_WEBHOOK_URL` (선택사항)

## 📁 프로젝트 구조

```
ai-nakchali/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   ├── contexts/          # React Context
│   ├── hooks/             # 커스텀 훅
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # API 서비스
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   └── App.tsx            # 메인 앱 컴포넌트
├── netlify/
│   └── functions/         # Netlify Functions
├── .github/
│   └── workflows/         # GitHub Actions
├── netlify.toml           # Netlify 설정
├── craco.config.js        # CRACO 설정
└── package.json
```

## 🔧 주요 기능 상세

### 1. 입찰공고 검색
- 키워드, 종류, 금액 범위, 기관명, 지역별 검색
- 페이지네이션 지원
- 실시간 검색 결과 표시

### 2. AI 요약
- GPT-4o-mini를 활용한 입찰공고 분석
- 핵심 요구사항, 제출서류, 마감일, 예산 정보 추출
- 무료 계정: 월 10회 제한
- 프리미엄 계정: 무제한 사용

### 3. 조건부 알림
- 사용자 정의 검색 조건 설정
- 무료 계정: 최대 3개 조건
- 프리미엄 계정: 최대 10개 조건
- 이메일 알림 발송

### 4. 계정 관리
- JWT 기반 인증
- 무료/프리미엄 계정 구분
- Google Sheets를 통한 사용자 데이터 저장

## 🎨 UI/UX 특징

- **모바일 퍼스트**: 모바일 환경에 최적화된 반응형 디자인
- **직관적 네비게이션**: 탭 기반 네비게이션
- **위트 있는 UX**: 프리미엄 업그레이드 시 재미있는 사용자 경험
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 🔒 보안

- **CSP (Content Security Policy)** 설정
- **XSS 보호** 헤더
- **JWT 토큰** 기반 인증
- **HTTPS** 강제 사용
- **환경 변수**를 통한 민감 정보 관리

## 📊 모니터링 및 분석

- **Google Analytics 4** 통합
- **에러 리포팅** 시스템
- **성능 모니터링**
- **사용자 행동 추적**

## 🚀 성능 최적화

- **React.memo**를 통한 컴포넌트 최적화
- **useCallback**을 통한 불필요한 리렌더링 방지
- **API 응답 캐싱** 시스템
- **가상화**를 통한 대용량 목록 최적화
- **코드 스플리팅** 및 **지연 로딩**
- **번들 크기 최적화**

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# 커버리지 리포트 생성
npm test -- --coverage

# E2E 테스트 (추후 구현 예정)
npm run test:e2e
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**AI낙찰이** - 공공조달의 새로운 패러다임을 제시합니다. 🎯