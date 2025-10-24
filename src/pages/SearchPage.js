import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchRecipesByPage } from '../api/recipeAPI';
import SearchComponent from '../components/Search/SearchBar';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal'; // 1. [추가] 모달 import
import styles from './RecipeListPage.module.css'; // (CSS는 RecipeListPage와 공유)

const ITEMS_PER_PAGE = 30;

const containerStyle = {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
};


const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const urlFilter = searchParams.get('filter') || 'recipe';

    const [inputTerm, setInputTerm] = useState(urlQuery);
    const [filterType, setFilterType] = useState(urlFilter);
    const [modalRecipe, setModalRecipe] = useState(null);

    const {
        data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['recipes', urlQuery, urlFilter],
        queryFn: ({ pageParam = 1 }) =>
            fetchRecipesByPage({ pageParam, searchTerm: urlQuery, filterType: urlFilter }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < ITEMS_PER_PAGE) return undefined;
            return lastPageParam + lastPage.length;
        },
        enabled: urlQuery.trim() !== '',
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }
        setSearchParams({ q: inputTerm, filter: filterType });
    };

    // 모달 저장 핸들러 함수
    const handleSaveClip = (recipeId, comment) => {
        console.log('--- 클립 저장 (검색 페이지) ---');
        console.log('UID:', localStorage.getItem('cookclip_user_uid'));
        console.log('Recipe ID:', recipeId);
        console.log('Comment:', comment);
    };

    useEffect(() => {
        setInputTerm(urlQuery);
        setFilterType(urlFilter);
    }, [urlQuery, urlFilter]);

    // 로딩 및 에러 처리는
    if (isLoading) return <div>'{urlQuery}' 검색 중...</div>;
    if (error) return <div>오류: {error.message}</div>;

    return (
        <div style={containerStyle}>
            <SearchComponent
                title="검색 결과"
                placeholder="다시 검색해보세요"
                inputValue={inputTerm}
                onInputChange={(e) => setInputTerm(e.target.value)}
                filterValue={filterType}
                onFilterChange={(e) => setFilterType(e.target.value)}
                onSearchSubmit={handleSearchSubmit}
            />
            <hr className={styles.hr}></hr>

            {/* 검색 결과가 없을 때 메시지 표시 */}
            {!isLoading && urlQuery && data?.pages[0]?.length === 0 && (
                <div className={styles.noResults}>'{urlQuery}'에 대한 검색 결과가 없습니다.</div>
            )}

            <div className={styles.gridContainer}>
                {data?.pages?.flatMap((pageData) =>
                    pageData.map((recipe) => {
                        const recipeProps = {
                            id: recipe.RCP_SEQ,
                            imageUrl: recipe.ATT_FILE_NO_MAIN,
                            title: recipe.RCP_NM,
                            description: recipe.RCP_PARTS_DTLS,
                            category: recipe.RCP_PAT2,
                            method: recipe.RCP_WAY2, // (way -> method로 변경)
                            prepTime: recipe.INFO_WGT ? `${recipe.INFO_WGT}g` : '정보없음',
                            cookTime: recipe.INFO_ENG ? `${recipe.INFO_ENG}kcal` : '정보없음',
                            isBookmarked: false
                        };

                        return (
                            <RecipeCard
                                key={recipe.RCP_SEQ}
                                recipe={recipeProps}
                                // 카드에 모달을 여는 함수 전달
                                onOpenModal={() => setModalRecipe(recipeProps)}
                            />
                        );
                    })
                )}
            </div>

            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    className={styles.loadMoreButton}
                >
                    {isFetchingNextPage 
                    ? '불러오는 중...' 
                    :'검색 결과 더보기' 
                    }
                </button>
            )}

            {/* 모달 렌더링 */}
            {modalRecipe && (
                <ClipAddModal
                    recipe={modalRecipe}
                    onClose={() => setModalRecipe(null)}
                    onSave={handleSaveClip}
                />
            )}
        </div>
    );
};

export default SearchPage;