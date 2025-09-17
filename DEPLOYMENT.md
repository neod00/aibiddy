# AI낙찰이 배포 가이드

## 🚀 배포 전 체크리스트

### 1. 환경 변수 설정

#### Netlify 대시보드에서 설정할 환경 변수:

```bash
# 나라장터 API
REACT_APP_NARA_API_KEY=your_nara_api_key_here

# OpenAI API
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# SendGrid API (이메일 알림)
REACT_APP_EMAIL_API_KEY=your_sendgrid_api_key_here

# Google Sheets API
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# JWT Secret (강력한 랜덤 문자열)
REACT_APP_JWT_SECRET=your_strong_jwt_secret_here

# Google Analytics (선택사항)
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX

# 에러 로깅용 Google Sheets ID
GOOGLE_SHEETS_ERROR_LOG_ID=your_error_log_sheet_id

# Slack 웹훅 (선택사항)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. API 키 발급 가이드

#### 나라장터 API 키
1. [공공데이터포털](https://data.go.kr) 접속
2. 회원가입 및 로그인
3. "나라장터 입찰공고" 검색
4. API 신청 및 승인 대기
5. 승인 후 발급받은 키를 `REACT_APP_NARA_API_KEY`에 설정

#### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com) 접속
2. 계정 생성 및 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 `REACT_APP_OPENAI_API_KEY`에 설정

#### SendGrid API 키
1. [SendGrid](https://sendgrid.com) 접속
2. 계정 생성 및 로그인
3. Settings > API Keys에서 새 키 생성
4. 생성된 키를 `REACT_APP_EMAIL_API_KEY`에 설정

#### Google Sheets API 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services > Library에서 "Google Sheets API" 활성화
4. Credentials > Create Credentials > Service Account
5. 서비스 계정 생성 후 JSON 키 다운로드
6. JSON 키의 `client_email`과 `private_key`를 환경 변수에 설정

### 3. Google Sheets 설정

#### 사용자 데이터 시트 생성
1. Google Sheets에서 새 스프레드시트 생성
2. 다음 시트들을 생성:
   - `Users` - 사용자 정보
   - `Conditions` - 알림 조건
   - `Summaries` - AI 요약 캐시
   - `ErrorLogs` - 에러 로그

#### 시트 구조

**Users 시트:**
```
A: email (이메일)
B: password_hash (비밀번호 해시)
C: account_type (계정 타입: free/premium)
D: created_at (생성일시)
E: last_login (마지막 로그인)
```

**Conditions 시트:**
```
A: id (조건 ID)
B: user_id (사용자 ID)
C: keyword (키워드)
D: type (종류)
E: min_amount (최소금액)
F: max_amount (최대금액)
G: agency (기관명)
H: region (지역)
I: notification_interval (알림 간격)
J: is_active (활성 상태)
K: created_at (생성일시)
```

### 4. Netlify 배포 설정

#### 자동 배포 설정
1. Netlify 대시보드에서 새 사이트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18`

#### 도메인 설정
1. Site settings > Domain management
2. Custom domain 추가 (선택사항)
3. SSL 인증서 자동 설정 확인

### 5. GitHub Actions 설정

#### Secrets 설정
GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿 추가:

```bash
# Netlify
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id

# API Keys
REACT_APP_NARA_API_KEY=your_nara_api_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_EMAIL_API_KEY=your_sendgrid_api_key
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
REACT_APP_JWT_SECRET=your_jwt_secret
```

### 6. 모니터링 설정

#### Google Analytics 설정
1. [Google Analytics](https://analytics.google.com) 접속
2. 새 속성 생성
3. 측정 ID를 `REACT_APP_GA_TRACKING_ID`에 설정

#### Slack 알림 설정 (선택사항)
1. Slack 워크스페이스에서 Incoming Webhooks 앱 추가
2. 웹훅 URL을 `SLACK_WEBHOOK_URL`에 설정

### 7. 테스트 체크리스트

#### 기능 테스트
- [ ] 회원가입/로그인 기능
- [ ] 입찰공고 검색 기능
- [ ] AI 요약 기능
- [ ] 알림 조건 설정 기능
- [ ] 이메일 알림 발송 기능
- [ ] 모바일 반응형 디자인

#### 성능 테스트
- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 캐싱 동작 확인
- [ ] 에러 처리 확인

#### 보안 테스트
- [ ] HTTPS 강제 사용
- [ ] CSP 정책 확인
- [ ] XSS 보호 확인
- [ ] 환경 변수 노출 방지

### 8. 배포 후 확인사항

#### 즉시 확인
- [ ] 사이트 접속 가능
- [ ] 모든 페이지 정상 로딩
- [ ] API 호출 정상 동작
- [ ] 에러 로깅 정상 동작

#### 24시간 후 확인
- [ ] 스케줄된 함수 정상 동작
- [ ] 이메일 알림 정상 발송
- [ ] 사용자 데이터 정상 저장
- [ ] 성능 메트릭 정상 수집

### 9. 문제 해결

#### 일반적인 문제들

**빌드 실패:**
- 환경 변수 누락 확인
- Node.js 버전 확인 (18.x)
- 의존성 설치 확인

**API 호출 실패:**
- API 키 유효성 확인
- CORS 설정 확인
- 네트워크 연결 확인

**이메일 발송 실패:**
- SendGrid API 키 확인
- 이메일 템플릿 설정 확인
- 발신자 이메일 인증 확인

**Google Sheets 연결 실패:**
- 서비스 계정 권한 확인
- 스프레드시트 공유 설정 확인
- API 활성화 상태 확인

### 10. 유지보수

#### 정기 점검사항
- [ ] API 사용량 모니터링
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 분석
- [ ] 사용자 피드백 수집

#### 업데이트 가이드
- [ ] 의존성 업데이트
- [ ] 보안 패치 적용
- [ ] 기능 개선사항 반영
- [ ] 성능 최적화

---

## 📞 지원

배포 과정에서 문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: Netlify Functions 로그
2. **에러 리포팅**: Google Sheets ErrorLogs 시트
3. **성능 모니터링**: Google Analytics
4. **이슈 등록**: GitHub Issues

**AI낙찰이** - 성공적인 배포를 위해 함께합니다! 🚀
