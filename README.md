# AI낙찰이 (AI-Biddy)

조달청 OpenAPI를 활용한 AI 기반 입찰공고 분석 및 알림 서비스

## 🚀 주요 기능

### 📋 입찰공고 검색 및 분석
- **실시간 데이터**: 조달청 OpenAPI를 통한 최신 입찰공고 정보
- **다양한 검색 옵션**: 키워드, 기관명, 지역별, 금액 범위별 검색
- **스마트 필터링**: 입찰공고명, 수요기관, 계약체결방법 등 세부 조건 지원

### 🤖 AI 기반 분석
- **입찰공고 요약**: OpenAI API를 활용한 자동 요약 기능
- **조건 분석**: 사용자 맞춤형 입찰 조건 분석
- **알림 서비스**: 관심 입찰공고 실시간 알림

### 📧 알림 시스템
- **이메일 알림**: Gmail을 통한 입찰공고 알림
- **Google Sheets 연동**: 입찰공고 데이터 자동 저장 및 사용자 설정 관리
- **사용자 정의 조건**: 개인별 맞춤 알림 설정
- **실시간 설정 저장**: 사용자 설정, 조건 관리, 알림 설정이 Google Sheets에 실시간 저장

## 🛠️ 기술 스택

### Frontend
- **React 18** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **CSS3** - 현대적 UI/UX 디자인
- **Context API** - 상태 관리

### Backend
- **Netlify Functions** - 서버리스 백엔드
- **Node.js** - JavaScript 런타임
- **Express** - 웹 프레임워크

### API 연동
- **조달청 OpenAPI** - 입찰공고 데이터
- **OpenAI API** - AI 분석 기능
- **Gmail API** - 이메일 발송
- **Google Sheets API** - 데이터 저장

### 배포
- **Netlify** - 프론트엔드 및 서버리스 함수 배포
- **GitHub** - 버전 관리 및 CI/CD

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/neod00/aibiddy.git
cd aibiddy/ai-nakchali
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp env.example .env
```

`.env` 파일에 다음 API 키들을 설정하세요:

```env
# 나라장터 API 설정
REACT_APP_NARA_API_KEY=your_nara_api_key_here
REACT_APP_NARA_API_URL=https://apis.data.go.kr/1230000/ad/BidPublicInfoService

# OpenAI API 설정
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Gmail 이메일 설정
REACT_APP_GMAIL_USER=your-gmail@gmail.com
REACT_APP_GMAIL_APP_PASSWORD=your-16-digit-app-password

# Google Sheets API 설정
REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
REACT_APP_GOOGLE_SHEETS_ID=your_google_sheets_id_here
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📁 프로젝트 구조

```
ai-nakchali/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── SearchForm.tsx  # 검색 폼
│   │   ├── BidList.tsx     # 입찰공고 목록
│   │   └── ...
│   ├── contexts/           # React Context
│   ├── hooks/              # 커스텀 훅
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # API 서비스
│   │   ├── bidService.ts   # 조달청 API
│   │   ├── authService.ts  # 인증 서비스
│   │   └── ...
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── netlify/
│   └── functions/          # Netlify Functions
├── package.json
└── README.md
```

## 🔧 API 설정

### 조달청 OpenAPI
1. [공공데이터포털](https://data.go.kr)에서 회원가입
2. "나라장터 입찰공고정보서비스" 신청
3. 발급받은 API 키를 `.env` 파일에 설정

### OpenAI API
1. [OpenAI](https://platform.openai.com)에서 계정 생성
2. API 키 발급
3. `.env` 파일에 설정

### Gmail API
1. Gmail 계정에서 앱 비밀번호 생성
2. `.env` 파일에 설정

## 🚀 배포

### Netlify 배포
1. GitHub 저장소를 Netlify에 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `build`
3. 환경 변수 설정
4. 배포 완료

## 📊 주요 기능 상세

### 검색 기능
- **키워드 검색**: 입찰공고명에서 특정 키워드 검색
- **기관별 검색**: 수요기관명으로 필터링
- **지역별 검색**: 지역명으로 필터링
- **금액 범위**: 최소/최대 금액 설정
- **종류별**: 물품, 용역, 공사, 외자 구분

### AI 분석
- **자동 요약**: 입찰공고 내용을 AI가 요약
- **조건 분석**: 사용자 맞춤 입찰 조건 추천
- **알림 설정**: 관심 있는 입찰공고 자동 알림

### 데이터 관리
- **캐시 시스템**: 5분 TTL로 성능 최적화
- **페이지네이션**: 대용량 데이터 효율적 처리
- **실시간 업데이트**: 최신 입찰공고 자동 갱신
- **Google Sheets 연동**: 사용자 데이터 실시간 저장 및 동기화

### 사용자 설정 관리
- **설정 모달**: 이메일, SMS, 푸시 알림 설정
- **조건 관리**: 검색 조건 저장, 수정, 삭제, 활성화/비활성화
- **알림 설정**: 알림 채널, 빈도, 방해 금지 시간 설정
- **실시간 저장**: 모든 설정이 Google Sheets에 자동 저장

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**AI낙찰이**로 더 스마트한 입찰공고 분석을 시작하세요! 🎯