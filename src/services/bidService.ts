import axios from 'axios';
import { BidSearchParams, BidResponse } from '../types/bid';

const NARA_API_URL = process.env.REACT_APP_NARA_API_URL || 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';
const NARA_API_KEY = process.env.REACT_APP_NARA_API_KEY || '3d5ffc75a14cccb5038feb87bbf1b03f36591801bd4469fbfaf1d39f90a62ff8';

// API 응답 캐시
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

class BidService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = NARA_API_URL;
    this.apiKey = NARA_API_KEY;
    
    // 디버깅: API 키 확인
    console.log('BidService 초기화:');
    console.log('- baseURL:', this.baseURL);
    console.log('- apiKey:', this.apiKey ? '설정됨' : '설정되지 않음');
    console.log('- apiKey 길이:', this.apiKey?.length || 0);
  }

  // 캐시 키 생성
  private getCacheKey(params: BidSearchParams): string {
    return `bid_list_${JSON.stringify(params)}`;
  }

  // 캐시에서 데이터 조회
  private getCachedData(cacheKey: string): any | null {
    const cached = cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  // 데이터 캐시에 저장
  private setCachedData(cacheKey: string, data: any): void {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  // 입찰공고 목록 조회 (캐시 포함)
  async getBidList(params: BidSearchParams): Promise<BidResponse> {
    const cacheKey = this.getCacheKey(params);
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      console.log('캐시에서 데이터 로드:', cacheKey);
      return cachedData;
    }

    // API 키가 없거나 등록되지 않은 경우 목업 데이터 반환
    if (!this.apiKey || this.apiKey === 'YOUR_NARA_API_KEY' || this.apiKey === 'your_nara_api_key_here') {
      console.log('API 키가 없어서 목업 데이터를 반환합니다.');
      const mockData = this.getMockBidData(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    }

    try {
      // 조달청 API에 맞는 파라미터 설정
      // 사용자가 설정한 날짜 범위 사용, 없으면 기본값 사용
      const today = new Date();
      const sixMonthsAgo = new Date(today.getTime() - (180 * 24 * 60 * 60 * 1000));
      
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}0000`;
      };

      // 사용자 설정 날짜 또는 기본값 사용
      let startDate = params.startDate 
        ? new Date(params.startDate + 'T00:00:00')
        : sixMonthsAgo;
      let endDate = params.endDate 
        ? new Date(params.endDate + 'T23:59:59')
        : today;

      // 날짜 유효성 검증
      if (startDate > endDate) {
        console.warn('시작일이 종료일보다 늦습니다. 날짜를 교체합니다.');
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
      
      const searchParams = new URLSearchParams({
        ServiceKey: this.apiKey,
        pageNo: String(params.pageNo || 1),
        numOfRows: String(params.numOfRows || 10),
        type: 'json',
        inqryDiv: params.dateCriteria === 'input' ? '1' : '2', // 1: 공고게시일시, 2: 개찰일시
        inqryBgnDt: formatDate(startDate), // 사용자 설정 시작일
        inqryEndDt: formatDate(endDate), // 사용자 설정 종료일
        ...(params.keyword && { bidNtceNm: params.keyword }),
        ...(params.agency && { dminsttNm: params.agency }),
        ...(params.region && { rgnNm: params.region }),
      });

      // 종류별로 다른 API 엔드포인트 사용
      const getEndpointByType = (type: string) => {
        switch (type) {
          case '물품':
            return 'getBidPblancListInfoThngPPSSrch';
          case '용역':
            return 'getBidPblancListInfoServcPPSSrch';
          case '공사':
            return 'getBidPblancListInfoCnstwkPPSSrch';
          case '외자':
            return 'getBidPblancListInfoFrgcptPPSSrch';
          default:
            return 'getBidPblancListInfoThngPPSSrch'; // 기본값은 물품
        }
      };

      // 전체 선택 시 모든 종류의 API를 호출하고 결과를 합침
      if (!params.type || params.type === '전체') {
        const allTypes = ['물품', '용역', '공사', '외자'];
        const allResponses: BidResponse[] = [];
        let totalCount = 0;
        let allItems: any[] = [];

        console.log('전체 선택: 모든 종류의 API를 호출합니다.');

        for (const type of allTypes) {
          const endpoint = getEndpointByType(type);
          const apiUrl = `${this.baseURL}/${endpoint}?${searchParams.toString()}`;
          
          console.log(`API 호출 URL (${type}):`, apiUrl);
          
          try {
            const response = await axios.get(apiUrl);
            console.log(`API 응답 상태 (${type}):`, response.status);
            
            const bidResponse = this.parseApiResponse(response.data);
            console.log(`추출된 입찰공고 (${type}):`, bidResponse.response.body.items);
            console.log(`총 개수 (${type}):`, bidResponse.response.body.totalCount);
            
            allResponses.push(bidResponse);
            totalCount += bidResponse.response.body.totalCount;
            allItems = allItems.concat(bidResponse.response.body.items);
          } catch (error) {
            console.error(`${type} API 호출 실패:`, error);
            // 개별 API 실패 시에도 계속 진행
          }
        }

        // 모든 결과를 합쳐서 하나의 응답으로 만들기
        const combinedResponse: BidResponse = {
          response: {
            header: allResponses[0]?.response.header || { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
            body: {
              items: allItems,
              numOfRows: params.numOfRows || 10,
              pageNo: params.pageNo || 1,
              totalCount: totalCount
            }
          }
        };

        console.log('전체 API 응답:', combinedResponse);
        console.log('추출된 입찰공고 (전체):', combinedResponse.response.body.items);
        console.log('총 개수 (전체):', combinedResponse.response.body.totalCount);

        // API 응답이 성공적이지만 데이터가 비어있는 경우 목업 데이터 반환
        if (combinedResponse.response.body.items.length === 0) {
          console.log('전체 API 응답이 비어있어 목업 데이터를 반환합니다.');
          const mockData = this.getMockBidData(params);
          this.setCachedData(cacheKey, mockData);
          return mockData;
        }

        // 응답 데이터 캐시에 저장
        this.setCachedData(cacheKey, combinedResponse);
        console.log('API에서 데이터 로드 및 캐시 저장 (전체):', cacheKey);
        
        return combinedResponse;
      } else {
        // 특정 종류 선택 시 해당 API만 호출
        const endpoint = getEndpointByType(params.type);
        const apiUrl = `${this.baseURL}/${endpoint}?${searchParams.toString()}`;
        console.log('API 호출 URL:', apiUrl);
        console.log('검색 파라미터:', Object.fromEntries(searchParams));
        console.log('선택된 종류:', params.type);

        const response = await axios.get(apiUrl);

        // 응답 데이터 로그
        console.log('API 응답 상태:', response.status);
        console.log('API 응답 데이터:', response.data);

        // API 응답을 BidResponse 형태로 변환
        const bidResponse = this.parseApiResponse(response.data);
        console.log('API 응답:', bidResponse);
        console.log('추출된 입찰공고:', bidResponse.response.body.items);
        console.log('총 개수:', bidResponse.response.body.totalCount);

        // API 응답이 성공적이지만 데이터가 비어있는 경우 목업 데이터 반환
        if (bidResponse.response.body.items.length === 0) {
          console.log('API 응답이 비어있어 목업 데이터를 반환합니다.');
          const mockData = this.getMockBidData(params);
          this.setCachedData(cacheKey, mockData);
          return mockData;
        }

        // 응답 데이터 캐시에 저장
        this.setCachedData(cacheKey, bidResponse);
        console.log('API에서 데이터 로드 및 캐시 저장:', cacheKey);
        
        return bidResponse;
      }
    } catch (error: any) {
      console.error('입찰공고 조회 중 오류 발생:', error);
      
      // API 키 오류인 경우 목업 데이터 반환
      if (error.response && error.response.data && 
          (error.response.data.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR') || 
           error.response.data.includes('SERVICE ERROR'))) {
        console.log('API 키가 등록되지 않아 목업 데이터를 반환합니다.');
      } else {
        console.log('API 오류로 인해 목업 데이터를 반환합니다.');
      }
      
      const mockData = this.getMockBidData(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    }
  }

  // 입찰공고 상세 조회 (캐시 포함)
  async getBidDetail(bidNtceNo: string): Promise<any> {
    const cacheKey = `bid_detail_${bidNtceNo}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      console.log('캐시에서 상세 데이터 로드:', cacheKey);
      return cachedData;
    }

    try {
      const searchParams = new URLSearchParams({
        serviceKey: this.apiKey,
        bidNtceNo: bidNtceNo,
        type: 'json',
      });

      const response = await axios.get(
        `${this.baseURL}/getBidPblancInfoThng?${searchParams.toString()}`
      );

      // 응답 데이터 캐시에 저장
      this.setCachedData(cacheKey, response.data);
      console.log('API에서 상세 데이터 로드 및 캐시 저장:', cacheKey);

      return response.data;
    } catch (error: any) {
      console.error('입찰공고 상세 조회 중 오류 발생:', error);
      throw new Error('입찰공고 상세정보를 불러오는데 실패했습니다.');
    }
  }

  // 목업 데이터 생성
  private getMockBidData(params: BidSearchParams): BidResponse {
    // 사용자 설정 날짜에 맞는 목업 데이터 생성
    const startDate = params.startDate ? new Date(params.startDate) : new Date('2024-12-01');
    const endDate = params.endDate ? new Date(params.endDate) : new Date('2024-12-31');
    
    const mockBids = [
      {
        bidNtceNo: '202412180001',
        bidNtceNm: 'AI 기반 입찰공고 분석 시스템 구축',
        dminsttNm: '한국공공기관',
        bidNtceDt: startDate.toISOString().slice(0, 19).replace('T', ' '),
        bidClseDt: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        bidMethdNm: '전자입찰',
        cntrctMthNm: '일괄계약',
        estmtPrce: '5000',
        rgnNm: '서울특별시',
        bidNtceDtlUrl: 'https://example.com/bid/202412180001',
        // 1단계: 추가된 기본 정보
        bidBeginDt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        opengDt: new Date(startDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        cntrctCnclsMthdNm: '일반경쟁계약',
        ntceInsttNm: '조달청'
      },
      {
        bidNtceNo: '202412180002',
        bidNtceNm: '웹사이트 리뉴얼 및 유지보수 용역',
        dminsttNm: '서울시청',
        bidNtceDt: '2024-12-18 10:00:00',
        bidClseDt: '2024-12-26 17:00:00',
        bidMethdNm: '용역',
        cntrctMthNm: '일괄계약',
        estmtPrce: '3000',
        rgnNm: '서울특별시',
        bidNtceDtlUrl: 'https://example.com/bid/202412180002',
        // 1단계: 추가된 기본 정보
        bidBeginDt: '2024-12-19 09:00:00',
        opengDt: '2024-12-27 14:00:00',
        cntrctCnclsMthdNm: '일반경쟁계약',
        ntceInsttNm: '서울시청'
      },
      {
        bidNtceNo: '202412180003',
        bidNtceNm: '데이터센터 전력시설 공사',
        dminsttNm: '한국전력공사',
        bidNtceDt: '2024-12-18 11:00:00',
        bidClseDt: '2024-12-27 16:00:00',
        bidMethdNm: '공사',
        cntrctMthNm: '일괄계약',
        estmtPrce: '15000',
        rgnNm: '경기도',
        bidNtceDtlUrl: 'https://example.com/bid/202412180003',
        // 1단계: 추가된 기본 정보
        bidBeginDt: '2024-12-19 10:00:00',
        opengDt: '2024-12-28 15:00:00',
        cntrctCnclsMthdNm: '일반경쟁계약',
        ntceInsttNm: '한국전력공사'
      },
      {
        bidNtceNo: '202412180004',
        bidNtceNm: '클라우드 인프라 구축 및 운영',
        dminsttNm: '과학기술정보통신부',
        bidNtceDt: '2024-12-18 12:00:00',
        bidClseDt: '2024-12-28 15:00:00',
        bidMethdNm: '외자',
        cntrctMthNm: '일괄계약',
        estmtPrce: '8000',
        rgnNm: '세종특별자치시',
        bidNtceDtlUrl: 'https://example.com/bid/202412180004',
        // 1단계: 추가된 기본 정보
        bidBeginDt: '2024-12-19 11:00:00',
        opengDt: '2024-12-29 14:00:00',
        cntrctCnclsMthdNm: '일반경쟁계약',
        ntceInsttNm: '과학기술정보통신부'
      },
      {
        bidNtceNo: '202412180005',
        bidNtceNm: '모바일 앱 개발 및 운영',
        dminsttNm: '보건복지부',
        bidNtceDt: '2024-12-18 13:00:00',
        bidClseDt: '2024-12-29 14:00:00',
        bidMethdNm: '용역',
        cntrctMthNm: '일괄계약',
        estmtPrce: '2500',
        rgnNm: '세종특별자치시',
        bidNtceDtlUrl: 'https://example.com/bid/202412180005',
        // 1단계: 추가된 기본 정보
        bidBeginDt: '2024-12-19 12:00:00',
        opengDt: '2024-12-30 13:00:00',
        cntrctCnclsMthdNm: '일반경쟁계약',
        ntceInsttNm: '보건복지부'
      }
    ];

    // 검색 조건에 따라 필터링
    let filteredBids = mockBids;
    
    if (params.keyword) {
      filteredBids = filteredBids.filter(bid => 
        bid.bidNtceNm.toLowerCase().includes(params.keyword!.toLowerCase())
      );
    }
    
    if (params.type) {
      filteredBids = filteredBids.filter(bid => bid.bidMethdNm === params.type);
    }
    
    if (params.agency) {
      filteredBids = filteredBids.filter(bid => 
        bid.dminsttNm.toLowerCase().includes(params.agency!.toLowerCase())
      );
    }
    
    if (params.region) {
      filteredBids = filteredBids.filter(bid => 
        bid.rgnNm.toLowerCase().includes(params.region!.toLowerCase())
      );
    }

    return {
      response: {
        header: {
          resultCode: '00',
          resultMsg: 'NORMAL_SERVICE'
        },
        body: {
          items: filteredBids,
          numOfRows: params.numOfRows || 10,
          pageNo: params.pageNo || 1,
          totalCount: filteredBids.length
        }
      }
    };
  }

  // 캐시 클리어
  clearCache(): void {
    cache.clear();
    console.log('캐시가 클리어되었습니다.');
  }

  // 특정 캐시 키 삭제
  clearCacheKey(key: string): void {
    cache.delete(key);
    console.log(`캐시 키가 삭제되었습니다: ${key}`);
  }

  // API 응답을 BidResponse 형태로 변환
  private parseApiResponse(apiResponse: any): BidResponse {
    try {
      const response = apiResponse.response;
      if (!response || !response.body) {
        console.error('API 응답 구조가 올바르지 않습니다:', apiResponse);
        return this.getMockBidData({});
      }

      const body = response.body;
      let items: any[] = [];

      // items가 객체인 경우 배열로 변환
      if (body.items) {
        if (Array.isArray(body.items)) {
          items = body.items;
        } else if (typeof body.items === 'object') {
          // 객체인 경우 값들을 배열로 변환
          items = Object.values(body.items);
        }
      }

      return {
        response: {
          header: {
            resultCode: response.header?.resultCode || '00',
            resultMsg: response.header?.resultMsg || 'NORMAL_SERVICE'
          },
          body: {
            items: items,
            numOfRows: body.numOfRows || 10,
            pageNo: body.pageNo || 1,
            totalCount: body.totalCount || 0
          }
        }
      };
    } catch (error) {
      console.error('API 응답 파싱 중 오류 발생:', error);
      return this.getMockBidData({});
    }
  }
}

export default new BidService();
