import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom'; // 1. useSearchParams 훅 import
import { fetchRecipesByPage } from '../api/recipeAPI';
import SearchComponent from '../components/Search/SearchBar';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import styles from './RecipeListPage.module.css'; // (CSS는 RecipeListPage와 공유 가능)

// 한 번에 불러올 아이템 개수 (API 함수와 동일하게 설정)
const ITEMS_PER_PAGE = 30;
const RecipeListPage = () => {

    // 2. URL의 쿼리 파라미터를 읽고/쓰기 위한 훅
    const [searchParams, setSearchParams] = useSearchParams();

    // 3. URL에서 검색어(q)와 필터(filter) 값을 읽어옴
    const urlQuery = searchParams.get('q') || '';
    const urlFilter = searchParams.get('filter') || 'recipe';

    // 4. SearchComponent의 input/filter 상태 (URL 값으로 초기화)
    const [inputTerm, setInputTerm] = useState(urlQuery);
    const [filterType, setFilterType] = useState(urlFilter);

    // 5. URL 기반의 '검색 결과' 쿼리
    const {
        data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage,
    } = useInfiniteQuery({
        // 6. [핵심] queryKey에 URL에서 읽어온 urlQuery와 urlFilter를 포함
        queryKey: ['recipes', urlQuery, urlFilter],

        // 7. API 함수에도 URL의 값을 전달
        queryFn: ({ pageParam = 1 }) =>
            fetchRecipesByPage({ pageParam, searchTerm: urlQuery, filterType: urlFilter }),

        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < 50) return undefined; // API의 ITEMS_PER_PAGE
            return lastPageParam + lastPage.length;
        },
        // 8. 검색어가 있을 때만 쿼리 실행
        enabled: urlQuery.trim() !== '',
    });

    // 9. [핵심] SearchPage 내에서의 '재검색' 핸들러
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }
        // 10. state에 있는 inputTerm으로 URL의 쿼리 파라미터를 '업데이트'
        // 이것이 실행되면 URL이 바뀌고, 쿼리가 자동으로 다시 실행됨
        setSearchParams({ q: inputTerm, filter: filterType });
    };

    // 11. (선택) 브라우저 뒤로가기 등으로 URL이 바뀌면 input 값도 동기화
    useEffect(() => {
        setInputTerm(urlQuery);
        setFilterType(urlFilter);
    }, [urlQuery, urlFilter]);

    return (
        <div style={containerStyle}>
            <SearchComponent
                title="검색 결과"
                placeholder="어떤 레시피를 찾으시나요?"
                inputValue={inputTerm}
                onInputChange={(e) => setInputTerm(e.target.value)}
                filterValue={filterType}
                onFilterChange={(e) => setFilterType(e.target.value)}
                onSearchSubmit={handleSearchSubmit}
            />
            <hr className={styles.hr}></hr>
            <div className={styles.gridContainer}> {/* 2. CSS 모듈 그리드 사용 */}
                {data?.pages?.flatMap((pageData) =>
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