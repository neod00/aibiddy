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

      // 지난공고 제외 옵션에 따른 로그 메시지
      if (params.includePastBids) {
        console.log('지난공고 제외: 결과에서 지난 마감일/개찰일 공고를 필터링합니다.');
      } else {
        console.log('지난공고 포함: 모든 기간의 공고를 검색합니다.');
      }

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

        let hasSuccessfulResponse = false;
        let lastError: Error | null = null;

        for (const type of allTypes) {
          const endpoint = getEndpointByType(type);
          const apiUrl = `${this.baseURL}/${endpoint}?${searchParams.toString()}`;
          
          console.log(`API 호출 URL (${type}):`, apiUrl);
          
          try {
            const response = await axios.get(apiUrl);
            console.log(`API 응답 상태 (${type}):`, response.status);
            
            const bidResponse = this.parseApiResponse(response.data, params.includePastBids);
            console.log(`추출된 입찰공고 (${type}):`, bidResponse.response.body.items);
            console.log(`총 개수 (${type}):`, bidResponse.response.body.totalCount);
            
            allResponses.push(bidResponse);
            totalCount += bidResponse.response.body.totalCount;
            allItems = allItems.concat(bidResponse.response.body.items);
            hasSuccessfulResponse = true;
          } catch (error: any) {
            console.error(`${type} API 호출 실패:`, error);
            lastError = error;
            // 개별 API 실패 시에도 계속 진행
          }
        }

        // 모든 API가 실패한 경우
        if (!hasSuccessfulResponse && lastError) {
          throw lastError;
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
        console.log('items.length:', combinedResponse.response.body.items.length);

        // API 응답이 성공적이지만 데이터가 비어있는 경우 빈 결과 반환
        if (combinedResponse.response.body.items.length === 0) {
          console.log('전체 API 응답이 비어있습니다.');
          return combinedResponse;
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
        const bidResponse = this.parseApiResponse(response.data, params.includePastBids);
        console.log('API 응답:', bidResponse);
        console.log('추출된 입찰공고:', bidResponse.response.body.items);
        console.log('총 개수:', bidResponse.response.body.totalCount);

        // API 응답이 성공적이지만 데이터가 비어있는 경우 빈 결과 반환
        if (bidResponse.response.body.items.length === 0) {
          console.log('API 응답이 비어있습니다.');
          return bidResponse;
        }

        // 응답 데이터 캐시에 저장
        this.setCachedData(cacheKey, bidResponse);
        console.log('API에서 데이터 로드 및 캐시 저장:', cacheKey);
        
        return bidResponse;
      }
    } catch (error: any) {
      console.error('입찰공고 조회 중 오류 발생:', error);
      
      // API 오류를 그대로 전파하여 상위에서 처리하도록 함
      throw new Error(`입찰공고 조회 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
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
  private parseApiResponse(apiResponse: any, includePastBids?: boolean): BidResponse {
    try {
      console.log('API 응답 파싱 시작:', apiResponse);
      
      // 조달청 API 오류 응답 처리
      if (apiResponse.response && apiResponse.response.header) {
        const header = apiResponse.response.header;
        const resultCode = header.resultCode;
        const resultMsg = header.resultMsg;
        
        // 오류 코드가 있는 경우
        if (resultCode && resultCode !== '00') {
          console.error('조달청 API 오류:', { resultCode, resultMsg });
          
          // API 키 관련 오류
          if (resultCode === '30' || resultMsg?.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
            throw new Error('SERVICE_KEY_IS_NOT_REGISTERED_ERROR');
          }
          
          // 날짜 범위 초과 오류 (사용자 친화적 메시지)
          if (resultCode === '07' || resultMsg?.includes('입력범위값 초과 에러')) {
            throw new Error('DATE_RANGE_EXCEEDED');
          }
          
          // 기타 서비스 오류
          if (resultCode === '99' || resultMsg?.includes('SERVICE ERROR')) {
            throw new Error('SERVICE ERROR');
          }
          
          // 일반적인 오류
          throw new Error(`API 오류 (${resultCode}): ${resultMsg || '알 수 없는 오류'}`);
        }
      }
      
      // ResponseError 객체 처리 (nkoneps.com.response.ResponseError)
      if (apiResponse['nkoneps.com.response.ResponseError']) {
        const responseError = apiResponse['nkoneps.com.response.ResponseError'];
        console.error('ResponseError 객체 감지:', responseError);
        
        if (responseError.header) {
          const resultCode = responseError.header.resultCode;
          const resultMsg = responseError.header.resultMsg;
          
          // 날짜 범위 초과 오류 (사용자 친화적 메시지)
          if (resultCode === '07' || resultMsg?.includes('입력범위값 초과 에러')) {
            throw new Error('DATE_RANGE_EXCEEDED');
          }
          
          // API 키 관련 오류
          if (resultCode === '30' || resultMsg?.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
            throw new Error('SERVICE_KEY_IS_NOT_REGISTERED_ERROR');
          }
          
          // 기타 서비스 오류
          if (resultCode === '99' || resultMsg?.includes('SERVICE ERROR')) {
            throw new Error('SERVICE ERROR');
          }
          
          // 일반적인 오류
          throw new Error(`API 오류 (${resultCode}): ${resultMsg || '알 수 없는 오류'}`);
        }
        
        throw new Error('API 서비스 오류가 발생했습니다.');
      }
      
      // 응답 구조 검증
      const response = apiResponse.response;
      if (!response) {
        console.error('API 응답에 response 필드가 없습니다:', apiResponse);
        throw new Error('API 응답 구조가 올바르지 않습니다.');
      }

      const body = response.body;
      if (!body) {
        console.error('API 응답에 body 필드가 없습니다:', apiResponse);
        throw new Error('API 응답 구조가 올바르지 않습니다.');
      }

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

      console.log('파싱된 입찰공고 수:', items.length);

      // 지난공고 제외 옵션이 true인 경우, 오늘 기준으로 지난 마감일/개찰일을 가진 공고 필터링
      if (includePastBids) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        items = items.filter(item => {
          // 개찰일시 기준으로 필터링
          const opengDt = item.opengDt;
          if (opengDt) {
            const opengDate = new Date(opengDt);
            const opengDateString = opengDate.toISOString().split('T')[0];
            
            // 오늘 이후의 개찰일을 가진 공고만 포함
            if (opengDateString >= todayString) {
              return true;
            }
          }
          
          // 투찰마감일 기준으로도 확인
          const bidClseDt = item.bidClseDt;
          if (bidClseDt) {
            const bidClseDate = new Date(bidClseDt);
            const bidClseDateString = bidClseDate.toISOString().split('T')[0];
            
            // 오늘 이후의 투찰마감일을 가진 공고만 포함
            if (bidClseDateString >= todayString) {
              return true;
            }
          }
          
          // 날짜 정보가 없는 경우 포함하지 않음
          return false;
        });
        
        console.log('지난공고 필터링 후 입찰공고 수:', items.length);
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
            totalCount: items.length // 필터링된 실제 개수로 업데이트
          }
        }
      };
    } catch (error) {
      console.error('API 응답 파싱 중 오류 발생:', error);
      throw error; // 원본 오류를 그대로 전파
    }
  }
}

export default new BidService();
