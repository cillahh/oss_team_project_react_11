import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecipesByPage } from '../api/recipeAPI'; // API 호출 함수
import SearchComponent from '../components/Search/SearchBar';
import styles from './RecipeListPage.module.css';
import RecipeCard from '../components/RecipeCard/RecipeCard';

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
        <SearchComponent title="모든 레시피" placeholder='어떤 레시피를 찾으시나요?' />
    <hr></hr>
      <div className={styles.gridContainer}> {/* 2. CSS 모듈 그리드 사용 */}
        {data.pages.flatMap((pageData) => 
          pageData.map((recipe) => {
            // 3. API 데이터를 RecipeCard prop에 맞게 가공
            const recipeProps = {
              id: recipe.RCP_SEQ,
              imageUrl: recipe.ATT_FILE_NO_MAIN,
              title: recipe.RCP_NM,
              description: recipe.RCP_PARTS_DTLS, // (예시) 재료 필드를 설명으로 사용
              category: recipe.RCP_PAT2, // (API에 이 정보가 없다면 고정값이나 숨김)
              way: recipe.RCP_WAY2,  // (API에 이 정보가 없다면 고V정값이나 숨김)
              isBookmarked: false // (나중에 북마크 기능 구현 시 연결)
            };
            
            // 4. RecipeCard 렌더링
            return <RecipeCard key={recipe.RCP_SEQ} recipe={recipeProps} />;
          })
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