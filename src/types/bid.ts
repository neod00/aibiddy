// 입찰공고 관련 타입 정의

export interface BidSearchParams {
  keyword?: string;
  type?: '전체' | '물품' | '용역' | '공사' | '외자';
  minAmount?: number;
  maxAmount?: number;
  agency?: string;
  region?: string;
  pageNo?: number;
  numOfRows?: number;
  startDate?: string; // 시작일 (YYYYMMDD 형식)
  endDate?: string;   // 종료일 (YYYYMMDD 형식)
  dateCriteria?: 'input' | 'opening'; // 날짜 기준: 입력일, 개찰일
  includePastBids?: boolean; // 지난공고 포함 여부
}

export interface BidItem {
  bidNtceNo: string; // 입찰공고번호
  bidNtceNm: string; // 입찰공고명
  dminsttNm: string; // 수요기관명
  bidNtceDt: string; // 입찰공고일시
  bidClseDt: string; // 입찰마감일시
  bidMethdNm: string; // 입찰방법명
  cntrctMthNm: string; // 계약방법명
  estmtPrce: string; // 추정가격
  rgnNm: string; // 지역명
  bidNtceDtlUrl: string; // 입찰공고상세URL
  
  // 1단계: 기본 정보 확장
  bidBeginDt?: string; // 입찰개시일시
  opengDt?: string; // 개찰일시
  cntrctCnclsMthdNm?: string; // 계약체결방법명
  ntceInsttNm?: string; // 공고기관명
  
  // 2단계: 고급 정보
  bidPrtcptFee?: string; // 입찰참가수수료
  bidPrtcptFeePaymntYn?: string; // 입찰참가수수료납부여부
  intrbidYn?: string; // 국제입찰대상여부
  reNtceYn?: string; // 재공고여부
  rgstTyNm?: string; // 등록유형명
  
  // 3단계: 추가 정보
  bidNtceOrd?: string; // 입찰공고차수
  cntrctPrd?: string; // 계약기간
  cntrctMngrNm?: string; // 담당자명
  cntrctMngrTelno?: string; // 담당자연락처
  atchFileNm?: string; // 첨부파일명
  atchFileUrl?: string; // 첨부파일URL
}

export interface BidResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: BidItem[];
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface SearchFormData {
  keyword: string;
  type: string;
  minAmount: string;
  maxAmount: string;
  agency: string;
  region: string;
  startDate: string; // 시작일 (YYYY-MM-DD 형식)
  endDate: string;   // 종료일 (YYYY-MM-DD 형식)
  dateRange: 'today' | '1week' | '1month' | '3months' | '6months' | '1year'; // 빠른 선택 옵션
  dateCriteria: 'input' | 'opening'; // 날짜 기준: 입력일, 개찰일
  includePastBids: boolean; // 지난공고 포함 여부
}