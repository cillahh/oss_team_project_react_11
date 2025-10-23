
import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecipesByPage } from '../api/recipeAPI'; // API 호출 함수
import SearchComponent from '../components/Search/SearchBar';
import styles from './RecipeListPage.module.css';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { useNavigate } from 'react-router-dom';

// 한 번에 불러올 아이템 개수 (API 함수와 동일하게 설정)
const ITEMS_PER_PAGE = 30;
const RecipeListPage = () => {
    const [inputTerm, setInputTerm] = useState('');
    const [filterType, setFilterType] = useState('recipe');
    const navigate = useNavigate(); // 3. navigate 함수 초기화
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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }
        // 6. URL 쿼리 파라미터(?q=...)로 검색어와 필터를 담아 이동
        navigate(`/search?q=${inputTerm}&filter=${filterType}`);
    };

    return (
        <div style={containerStyle}>
            <SearchComponent
                title="모든 레시피"
                placeholder="어떤 레시피를 찾으시나요?"
                inputValue={inputTerm}
                onInputChange={(e) => setInputTerm(e.target.value)}
                filterValue={filterType}
                onFilterChange={(e) => setFilterType(e.target.value)}
                onSearchSubmit={handleSearchSubmit}
            />
            <hr className={styles.hr}></hr>
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
                className={styles.buttonStyle}
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
export default RecipeListPage;