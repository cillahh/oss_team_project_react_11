import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchRecipesByPage } from '../api/recipeAPI';
import SearchComponent from '../components/Search/SearchBar';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal';
import ClipAddBookclipUpdate from './ClipAddBookclipUpdate';
import styles from './RecipeListPage.module.css';

const ITEMS_PER_PAGE = 30;
const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

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
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

    // ✅ 유저 북마크 불러오기
    useEffect(() => {
        const loadBookmarkedIds = async () => {
            const uid = localStorage.getItem('uid');
            if (!uid) return;

            try {
                const res = await fetch(ITEMS_URL);
                const data = await res.json();
                const myIds = data
                    .filter(c => String(c.uid) === String(uid))
                    .map(c => String(c.cookid));
                setBookmarkedIds(new Set(myIds));
            } catch (err) {
                console.error('북마크 목록 불러오기 실패:', err);
            }
        };
        loadBookmarkedIds();
    }, []);

    // ✅ 무한 스크롤 쿼리
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

    // ✅ 검색 실행
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }
        setSearchParams({ q: inputTerm, filter: filterType });
    };

    // ✅ 북마크 토글
    const handleBookmarkClick = async (recipe) => {
        const uid = localStorage.getItem('uid') || crypto.randomUUID();
        localStorage.setItem('uid', uid);

        if (bookmarkedIds.has(recipe.id)) {
            // 이미 북마크 된 경우 → 삭제
            try {
                const res = await fetch(ITEMS_URL);
                const clips = await res.json();
                const myClip = clips.find(
                    c => String(c.uid) === String(uid) && String(c.cookid) === String(recipe.id)
                );

                if (!myClip) return;

                const delRes = await fetch(`${ITEMS_URL}/${myClip.id}`, { method: 'DELETE' });
                if (!delRes.ok) return alert('삭제 실패');

                setBookmarkedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(recipe.id);
                    return newSet;
                });
            } catch (err) {
                console.error(err);
            }
        } else if (!modalRecipe) {
            // 새 북마크 추가 → 모달 열기
            setModalRecipe(recipe);
        }
    };

    // ✅ 모달 저장 시 북마크 추가
    const handleSaveClip = async (recipeId, comment) => {
        await ClipAddBookclipUpdate(recipeId, comment, modalRecipe);
        setBookmarkedIds(prev => new Set(prev).add(recipeId));
        setModalRecipe(null);
    };

    // ✅ 검색어 반영
    useEffect(() => {
        setInputTerm(urlQuery);
        setFilterType(urlFilter);
    }, [urlQuery, urlFilter]);

    if (isLoading) return <div>'{urlQuery}' 검색 중...</div>;
    if (error) return <div>오류: {error.message}</div>;

    // ✅ 전체 레시피 변환
    const allRecipes = data?.pages?.flatMap((page) =>
        page.map((r) => ({
            id: r.RCP_SEQ,
            imageUrl: r.ATT_FILE_NO_MAIN,
            title: r.RCP_NM,
            description: r.RCP_PARTS_DTLS,
            category: r.RCP_PAT2,
            method: r.RCP_WAY2,
        }))
    ) || [];

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

            {!isLoading && urlQuery && allRecipes.length === 0 && (
                <div className={styles.noResults}>'{urlQuery}'에 대한 검색 결과가 없습니다.</div>
            )}

            <div className={styles.gridContainer}>
                {allRecipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={{
                            ...recipe,
                            isBookmarked: bookmarkedIds.has(recipe.id),
                        }}
                        onBookmarkClick={() => handleBookmarkClick(recipe)}
                    />
                ))}
            </div>

            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    className={styles.loadMoreButton}
                >
                    {isFetchingNextPage
                        ? '불러오는 중...'
                        : '검색 결과 더보기'}
                </button>
            )}

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
