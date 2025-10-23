import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecipesByPage } from '../api/recipeAPI'; // API 호출 함수
import SearchComponent from '../components/Search/SearchBar';
import styles from './RecipeListPage.module.css';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { useNavigate } from 'react-router-dom';
import ClipAddModal from '../components/Modal/ClipAddModal'; // 1. [수정] 모달 import 추가

// 2. [수정] API 파일(50)과 동일하게 설정
const ITEMS_PER_PAGE = 50; 

// 3. [수정] 인라인 스타일은 컴포넌트 함수 바깥으로 이동 (효율성)
const containerStyle = {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
    // textAlign: 'center'는 gridContainer 때문에 불필요할 수 있음
};

const RecipeListPage = () => {
    const [inputTerm, setInputTerm] = useState('');
    const [filterType, setFilterType] = useState('recipe');
    const [modalRecipe, setModalRecipe] = useState(null);
    const navigate = useNavigate();

    const {
        data,
        error,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        // 4. [수정] SearchPage와 겹치지 않는 고유한 key로 변경
        queryKey: ['allRecipes'], 
        
        // 5. [수정] queryFn이 API 함수를 올바르게 호출하도록 수정 (전체 목록)
        queryFn: ({ pageParam = 1 }) => 
            fetchRecipesByPage({ pageParam, searchTerm: '', filterType: 'recipe' }),
            
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            // 6. [수정] ITEMS_PER_PAGE가 50을 기준으로 정확하게 비교
            if (lastPage.length < ITEMS_PER_PAGE) {
                return undefined;
            }
            return lastPageParam + lastPage.length;
        },
    });

    if (isLoading) return <div>레시피 데이터를 불러오는 중...</div>;
    if (error) return <div>오류: {error.message}</div>;

    // 7. [수정] data가 undefined일 때를 대비해 ?. 추가
    if (!data?.pages || data.pages.every(page => page.length === 0)) {
        return <div>표시할 레시피가 없습니다.</div>;
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!inputTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }
        navigate(`/search?q=${inputTerm}&filter=${filterType}`);
    };

    const handleSaveClip = (recipeId, comment) => {
        console.log('--- 클립 저장 ---');
        console.log('UID:', localStorage.getItem('cookclip_user_uid'));
        console.log('Recipe ID:', recipeId);
        console.log('Comment:', comment);
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
            
            <div className={styles.gridContainer}>
                {/* 8. [수정] data.pages -> data?.pages로 변경 (오류 방지) */}
                {data?.pages?.flatMap((pageData) =>
                    pageData.map((recipe) => {
                        const recipeProps = {
                            id: recipe.RCP_SEQ,
                            imageUrl: recipe.ATT_FILE_NO_MAIN,
                            title: recipe.RCP_NM,
                            description: recipe.RCP_PARTS_DTLS,
                            category: recipe.RCP_PAT2, 
                            method: recipe.RCP_WAY2, // (way -> method로 변경. ClipAddModal과 맞춤)
                            prepTime: recipe.INFO_WGT ? `${recipe.INFO_WGT}g` : '정보없음',
                            cookTime: recipe.INFO_ENG ? `${recipe.INFO_ENG}kcal` : '정보없음',
                            isBookmarked: false
                        };

                        return <RecipeCard 
                                    key={recipe.RCP_SEQ} 
                                    recipe={recipeProps} 
                                    onOpenModal={() => setModalRecipe(recipeProps)} 
                                />;
                    })
                )}
            </div>

            {/* 더보기 버튼 */}
            <button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                // 9. [수정] CSS 모듈에 정의된 클래스 이름으로 변경
                className={styles.loadMoreButton} 
            >
                {isFetchingNextPage
                    ? '더 불러오는 중...'
                    : hasNextPage
                        ? '더보기'
                        : '모든 레시피를 불러왔습니다.'}
            </button>

            {/* 10. [수정] ClipAddModal이 import되어 이제 정상 작동 */}
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
