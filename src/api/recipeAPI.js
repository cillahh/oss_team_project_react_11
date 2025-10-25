// 한 번에 불러올 아이템 개수
const ITEMS_PER_PAGE = 30;
const API_KEY = '40803398dac9421487cf';

/**
 * @param {object} params
 * @param {number} params.pageParam - 요청할 페이지의 시작 인덱스 (기본값: 1)
 * @param {string} params.searchTerm - 검색어 (기본값: "")
 * @param {string} params.filterType - 검색 필터 타입 ('recipe' 또는 'ingredient')
 * @returns {Promise<Array>} 레시피 데이터 배열
 */
export const fetchRecipesByPage = async ({ 
  pageParam = 1, 
  searchTerm = "", 
  filterType = "recipe" 
}) => {
  const startIndex = pageParam;
  const endIndex = startIndex + ITEMS_PER_PAGE - 1;
 
  let url = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIndex}/${endIndex}`;

  // 검색어가 있을 경우, URL에 검색 파라미터를 추가
  if (searchTerm.trim() !== "") {
    let paramName = "";
    if (filterType === 'recipe') {
      paramName = 'RCP_NM';
    } else if (filterType === 'ingredient') {
      paramName = 'RCP_PARTS_DTLS'; 
    }

    if (paramName) {
      // 한글 등 특수문자가 URL에 포함될 수 있도록 인코딩
      url += `/${paramName}=\"${encodeURIComponent(searchTerm)}\"`;
    }
  }

  // 3. API 요청
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }

  const data = await response.json();

  // API 자체 에러 확인
  if (data.COOKRCP01.RESULT && data.COOKRCP01.RESULT.CODE !== 'INFO-000') {
    if (data.COOKRCP01.RESULT.CODE === 'INFO-200') {
      return []; // 데이터가 없으면 빈 배열 반환
    }
    throw new Error(data.COOKRCP01.RESULT.MSG);
  }

  // 실제 데이터(row)가 있는지 확인
  if (!data.COOKRCP01.row) {
    return []; // 데이터가 없으면 빈 배열 반환
  }

  // 실제 레시피 배열 반환
  return data.COOKRCP01.row;
};



// --- [신규 함수 추가] ---
/**
 * COOKRCP01 API에서 제공하는 모든 레시피(1~1000)를 한 번에 불러옵니다.
 * 이 함수는 React-Query에 의해 캐시됩니다.
 * (CookclipPage, RecipeDetailPage에서 사용)
 */
export const fetchAllRecipes = async () => {
  const startIndex = 1;
  const endIndex = 300; // API가 1회 호출로 허용하는 최대치
  const url = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIndex}/${endIndex}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('전체 레시피 로드 실패: 네트워크 응답 오류');
  }

  const data = await response.json();

  if (data.COOKRCP01.RESULT && data.COOKRCP01.RESULT.CODE !== 'INFO-000') {
    if (data.COOKRCP01.RESULT.CODE === 'INFO-200') return [];
    throw new Error(data.COOKRCP01.RESULT.MSG);
  }
  
  return data.COOKRCP01.row || [];
};