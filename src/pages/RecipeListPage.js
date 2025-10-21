import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecipesByPage } from '../api/recipeAPI'; // API 호출 함수

// 한 번에 불러올 아이템 개수 (API 함수와 동일하게 설정)
const ITEMS_PER_PAGE = 50;

const RecipeListPage = () => {
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesByPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // lastPage는 API에서 받아온 레시피 배열 (예: [{RCP_IMG: '...', ...}, ...])
      // lastPageParam은 직전에 사용한 startIndex
      
      // lastPage 배열이 ITEMS_PER_PAGE보다 적으면 더 이상 데이터가 없는 것으로 간주
      if (lastPage.length < ITEMS_PER_PAGE) {
        return undefined; // 다음 페이지 없음
      }

      // 다음 시작 인덱스 계산
      return lastPageParam + lastPage.length;
    },
  });

  if (isLoading) return <div>레시피 데이터를 불러오는 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  // 데이터가 없거나 로드된 레시피가 전혀 없을 때
  if (!data || data.pages.every(page => page.length === 0)) {
    return <div>표시할 레시피가 없습니다.</div>;
  }

  return (
    <div style={containerStyle}>
      <h2>레시피 사진 보기</h2>

      <div style={gridContainerStyle}>
        {/* data.pages는 중첩 배열이므로, flat()을 사용하여 단일 배열로 만들고 렌더링 */}
        {data.pages.flatMap((pageData) => 
          pageData.map((recipe) => (
            // recipe 객체에서 이미지 URL 필드 사용 (API 문서 확인 필요)
            // 보통 'RCP_IMG' 또는 'ATT_FILE_NO_MAIN' 같은 필드일 가능성이 높습니다.
            // 만약 이미지 필드가 없다면 다른 필드(예: RCP_NM)로 대체하여 텍스트로 확인
            recipe.ATT_FILE_NO_MAIN && ( // 이미지가 있는 경우에만 표시
              <div key={recipe.RCP_SEQ || Math.random()} style={imageWrapperStyle}>
                <img 
                  src={recipe.ATT_FILE_NO_MAIN} 
                  alt={recipe.RCP_NM || '레시피 이미지'} 
                  style={imageStyle} 
                />
                {/* 레시피 이름도 같이 보고 싶으면 추가 */}
                <p style={imageTitleStyle}>{recipe.RCP_NM}</p>
              </div>
            )
          ))
        )}
      </div>

      {/* 더보기 버튼 */}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        style={buttonStyle}
      >
        {isFetchingNextPage
          ? '더 불러오는 중...'
          : hasNextPage
          ? '더보기'
          : '모든 레시피를 불러왔습니다.'}
      </button>
    </div>
  );
};

// 인라인 스타일 정의 (나중에 CSS 파일로 분리하는 것을 추천합니다)
const containerStyle = {
  maxWidth: '1200px',
  margin: '20px auto',
  padding: '0 20px',
  textAlign: 'center',
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', // 반응형 그리드
  gap: '20px',
  marginTop: '30px',
  marginBottom: '30px',
};

const imageWrapperStyle = {
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
};

const imageStyle = {
  width: '100%',
  height: '150px', // 고정 높이
  objectFit: 'cover', // 이미지를 비율 유지하며 채움
  borderRadius: '4px',
};

const imageTitleStyle = {
  fontSize: '0.9em',
  fontWeight: 'bold',
  marginTop: '10px',
  color: '#333',
  wordBreak: 'keep-all', // 긴 단어 줄바꿈 방지
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '1em',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
  marginBottom: '50px',
};

export default RecipeListPage;