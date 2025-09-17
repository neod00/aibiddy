import axios from 'axios';
import { BidSearchParams, BidResponse } from '../types/bid';

const NARA_API_URL = process.env.REACT_APP_NARA_API_URL || 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';
const NARA_API_KEY = process.env.REACT_APP_NARA_API_KEY || 'FgqpNtkJ%2FffO3Nx4mZ%2B530%2FPJsnR3yRxfjve4U5hkQi6XNzlGQ7m2JsvHEOLVZ1o9fP4MLnTRbcp%2FT2m3gSA%3D%3D';

class BidService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = NARA_API_URL;
    this.apiKey = NARA_API_KEY;
  }

  // 입찰공고 목록 조회
  async getBidList(params: BidSearchParams): Promise<BidResponse> {
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

      return response.data;
    } catch (error) {
      console.error('입찰공고 조회 중 오류 발생:', error);
      throw new Error('입찰공고를 불러오는데 실패했습니다.');
    }
  }

  // 입찰공고 상세 조회
  async getBidDetail(bidNtceNo: string): Promise<any> {
    try {
      const searchParams = new URLSearchParams({
        serviceKey: this.apiKey,
        bidNtceNo: bidNtceNo,
        type: 'json',
      });

      const response = await axios.get(
        `${this.baseURL}/getBidPblancInfoThng?${searchParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('입찰공고 상세 조회 중 오류 발생:', error);
      throw new Error('입찰공고 상세정보를 불러오는데 실패했습니다.');
    }
  }
}

export default new BidService();
