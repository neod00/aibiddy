// 입찰공고 관련 타입 정의

export interface BidSearchParams {
  keyword?: string;
  type?: '물품' | '용역' | '공사' | '외자';
  minAmount?: number;
  maxAmount?: number;
  agency?: string;
  region?: string;
  pageNo?: number;
  numOfRows?: number;
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
}

export interface BidResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: BidItem[];
      };
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
}
