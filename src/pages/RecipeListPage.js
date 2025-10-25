import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecipesByPage } from '../api/recipeAPI';
import SearchComponent from '../components/Search/SearchBar';
import styles from './RecipeListPage.module.css';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { useNavigate } from 'react-router-dom';
import ClipAddModal from '../components/Modal/ClipAddModal';
import ClipAddBookclipUpdate from './ClipAddBookclipUpdate';



const ITEMS_PER_PAGE = 30;
const containerStyle = {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
};
const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

const RecipeListPage = () => {
    const [inputTerm, setInputTerm] = useState('');
    const [filterType, setFilterType] = useState('recipe');
    const [modalRecipe, setModalRecipe] = useState(null);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const navigate = useNavigate();

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


    const {
        data,
        error,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['allRecipes'],
        queryFn: ({ pageParam = 1 }) =>
            fetchRecipesByPage({ pageParam, searchTerm: '', filterType: 'recipe' }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < ITEMS_PER_PAGE) return undefined;
            return lastPageParam + lastPage.length;
        },
    });

    const allRecipes = data?.pages?.flatMap((page) =>
        page.map((r) => ({
            id: r.RCP_SEQ,
            imageUrl: r.ATT_FILE_NO_MAIN,
            title: r.RCP_NM,
            description: r.RCP_PARTS_DTLS,
            category: r.RCP_PAT2,
            method: r.RCP_WAY2,
            clipId: null,
        }))
    ) || [];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) return alert('검색어를 입력해주세요.');
        navigate(`/search?q=${inputTerm}&filter=${filterType}`);
    };

    const handleBookmarkClick = async (recipe) => {
        const uid = localStorage.getItem('uid') || crypto.randomUUID();
        localStorage.setItem('uid', uid);

        if (bookmarkedIds.has(recipe.id)) {
            // 이미 북마크 된 경우 -> 삭제
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
        } else if (!modalRecipe) { // ✅ 이미 모달이 열려있으면 무시
            setModalRecipe(recipe);
        }
    };


    const handleSaveClip = async (recipeId, comment) => {
        await ClipAddBookclipUpdate(recipeId, comment, modalRecipe);
        setBookmarkedIds(prev => new Set(prev).add(recipeId));
        setModalRecipe(null);
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
            <hr className={styles.hr} />
            {isLoading ? (
                <div className={styles.noResults}>레시피 데이터를 불러오는 중...</div>
            ) : error ? (
                <div className={styles.noResults}>오류: {error.message}</div>
            ) : !allRecipes.length ? (
                <div className={styles.noResults}>표시할 레시피가 없습니다.</div>
            ) : (
                <div className={styles.gridContainer}>
                    {allRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={{ ...recipe, isBookmarked: bookmarkedIds.has(recipe.id) }}
                            onBookmarkClick={() => handleBookmarkClick(recipe)}
                        />
                    ))}
                </div>
            )}

            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    className={styles.loadMoreButton}
                >
                    {isFetchingNextPage ? '레시피 불러오는 중...' : '더보기'}
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

export default RecipeListPage;
