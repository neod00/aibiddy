import axios from 'axios';
import { BidSearchParams, BidResponse } from '../types/bid';

const NARA_API_URL = process.env.REACT_APP_NARA_API_URL || 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';
const NARA_API_KEY = process.env.REACT_APP_NARA_API_KEY || 'FgqpNtkJ%2FffO3Nx4mZ%2B530%2FPJsnR3yRxfjve4U5hkQi6XNzlGQ7m2JsvHEOLVZ1o9fP4MLnTRbcp%2FT2m3gSA%3D%3D';

// API 응답 캐시
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

class BidService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = NARA_API_URL;
    this.apiKey = NARA_API_KEY;
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
      const searchParams = new URLSearchParams({
        serviceKey: this.apiKey,
        pageNo: String(params.pageNo || 1),
        numOfRows: String(params.numOfRows || 10),
        type: 'json',
        ...(params.keyword && { bidNtceNm: params.keyword }),
        ...(params.type && { bidMethdNm: params.type }),
        ...(params.minAmount && { estmtPrceMin: String(params.minAmount) }),
        ...(params.maxAmount && { estmtPrceMax: String(params.maxAmount) }),
        ...(params.agency && { dminsttNm: params.agency }),
        ...(params.region && { rgnNm: params.region }),
      });

      const response = await axios.get(
        `${this.baseURL}/getBidPblancListInfoThng?${searchParams.toString()}`
      );

      // 응답 데이터 캐시에 저장
      this.setCachedData(cacheKey, response.data);
      console.log('API에서 데이터 로드 및 캐시 저장:', cacheKey);

      return response.data;
    } catch (error) {
      console.error('입찰공고 조회 중 오류 발생:', error);
      throw new Error('입찰공고를 불러오는데 실패했습니다.');
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
    } catch (error) {
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
}

export default new BidService();
