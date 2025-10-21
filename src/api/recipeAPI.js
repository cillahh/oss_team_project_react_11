// 한 번에 불러올 아이템 개수
const ITEMS_PER_PAGE = 50;

// pageParam을 startIndex로 사용합니다.
export const fetchRecipesByPage = async ({ pageParam = 1 }) => {
  const startIndex = pageParam;
  const endIndex = startIndex + ITEMS_PER_PAGE - 1;

  // 🚨 {인증키} 부분은 실제 키로 꼭 바꿔주세요!
  const API_KEY = '40803398dac9421487cf'; 
  const url = `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIndex}/${endIndex}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }

  const data = await response.json();

  // 1. API 자체 에러 확인 (식약처 API 예시)
  if (data.COOKRCP01.RESULT && data.COOKRCP01.RESULT.CODE !== 'INFO-000') {
    // 예: "INFO-200: 해당하는 데이터가 없습니다."
    if (data.COOKRCP01.RESULT.CODE === 'INFO-200') {
      return []; // 데이터가 없으면 빈 배열 반환
    }
    throw new Error(data.COOKRCP01.RESULT.MSG);
  }

  // 2. 실제 데이터(row)가 있는지 확인
  if (!data.COOKRCP01.row) {
    return []; // 데이터가 없으면 빈 배열 반환
  }

  // 3. 실제 레시피 배열 반환
  return data.COOKRCP01.row;
};