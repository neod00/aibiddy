const axios = require('axios');

// 조달청 API 테스트
async function testNaraApi() {
  const apiKey = '3d5ffc75a14cccb5038feb87bbf1b03f36591801bd4469fbfaf1d39f90a62ff8';
  const baseURL = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';
  
  try {
    // 오늘과 1개월 전 날짜 계산
    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}0000`;
    };
    
    const searchParams = new URLSearchParams({
      ServiceKey: apiKey,
      pageNo: '1',
      numOfRows: '5', // 적은 수로 테스트
      type: 'json',
      inqryDiv: '1', // 1: 공고게시일시, 2: 개찰일시
      inqryBgnDt: formatDate(oneMonthAgo), // 1개월 전
      inqryEndDt: formatDate(today), // 오늘
      bidNtceNm: '소프트웨어', // 키워드 검색
    });
    
    const apiUrl = `${baseURL}/getBidPblancListInfoThngPPSSrch?${searchParams.toString()}`;
    console.log('API 호출 URL:', apiUrl);
    console.log('검색 파라미터:', Object.fromEntries(searchParams));
    
    const response = await axios.get(apiUrl);
    console.log('\n=== API 응답 상태 ===');
    console.log('Status:', response.status);
    
    console.log('\n=== API 응답 데이터 구조 ===');
    console.log('전체 응답:', JSON.stringify(response.data, null, 2));
    
    console.log('\n=== 응답 데이터 분석 ===');
    console.log('응답 타입:', typeof response.data);
    console.log('응답 키들:', Object.keys(response.data));
    
    if (response.data.response) {
      console.log('\n=== response 객체 ===');
      console.log('response 타입:', typeof response.data.response);
      console.log('response 키들:', Object.keys(response.data.response));
      
      if (response.data.response.body) {
        console.log('\n=== body 객체 ===');
        console.log('body 타입:', typeof response.data.response.body);
        console.log('body 키들:', Object.keys(response.data.response.body));
        
        if (response.data.response.body.items) {
          console.log('\n=== items 배열 ===');
          console.log('items 타입:', typeof response.data.response.body.items);
          console.log('items 길이:', response.data.response.body.items.length);
          
          if (Array.isArray(response.data.response.body.items)) {
            console.log('첫 번째 아이템:', JSON.stringify(response.data.response.body.items[0], null, 2));
          } else {
            console.log('items가 배열이 아닙니다:', response.data.response.body.items);
          }
        } else {
          console.log('items가 없습니다. body 구조:', JSON.stringify(response.data.response.body, null, 2));
        }
      } else {
        console.log('body가 없습니다. response 구조:', JSON.stringify(response.data.response, null, 2));
      }
    } else {
      console.log('response가 없습니다. 전체 구조:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

testNaraApi();
