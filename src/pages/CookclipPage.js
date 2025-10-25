import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal';
// ⬇️ [수정] fetchRecipesByPage 대신 fetchAllRecipes를 import
import { fetchAllRecipes } from '../api/recipeAPI'; 
import styles from './CookclipPage.module.css';
import UserProfileSidebar from '../components/UserProfileSidebar/UserProfileSidebar';

const CookclipPage = () => {
  const [recipes, setRecipes] = useState([]);
  // [수정] 상세 페이지가 로직을 처리하므로 모달 상태 제거
  // const [selectedRecipe, setSelectedRecipe] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. MockAPI 주소
  const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';
  // 2. UID 키 확인
  const UID_KEY ='uid'; 

  useEffect(() => {
    const loadClips = async () => {
      setIsLoading(true);
      try {
        const uid = localStorage.getItem(UID_KEY);
        if (!uid) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(ITEMS_URL);
        const clips = await res.json();
        const myClips = clips.filter(c => c.uid === uid);

        if (myClips.length === 0) {
            setRecipes([]);
            setIsLoading(false);
            return;
        }

        // ⬇️ [수정] 50개가 아닌 1000개 레시피 전체를 불러옵니다.
        const allRecipes = await fetchAllRecipes(); 

        const recipesForUI = myClips.map(clip => {
          const recipe = allRecipes.find(r => String(r.RCP_SEQ) === String(clip.cookid));
          return recipe ? {
            id: recipe.RCP_SEQ,
            title: recipe.RCP_NM,
            description: recipe.RCP_PARTS_DTLS,
            imageUrl: recipe.ATT_FILE_NO_MAIN,
            category: recipe.RCP_PAT2,
            method: recipe.RCP_WAY2,
            // ⬇️ 쿡클립 페이지에서는 항상 true
            isBookmarked: true, 
            clipId: clip.id,
            comment: clip.comment,
            // ⬇️ 카드 prop에 누락된 API 원본 데이터 추가
            prepTime: recipe.INFO_WGT ? `${recipe.INFO_WGT}g` : '정보없음',
            cookTime: recipe.INFO_ENG ? `${recipe.INFO_ENG}kcal` : '정보없음',
          } : null;
        }).filter(Boolean);

        setRecipes(recipesForUI);
      } catch (err) {
        console.error('북마크 불러오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadClips();
  }, []); // 의존성 배열이 비어있으므로 1회 실행

  const handleDeleteClip = async (recipe) => {
    // 3. ⬇️ 삭제 확인 창 (선택 사항이지만 권장)
    if (!window.confirm(`'${recipe.title}' 쿡클립을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      if (!recipe.clipId) return;

      const res = await fetch(`${ITEMS_URL}/${recipe.clipId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');

      // UI 갱신
      setRecipes(prev =>
        prev.filter(r => r.id !== recipe.id)
      );
    } catch (err) {
      console.error(err);
      alert('클립 삭제 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <UserProfileSidebar />
      </aside>
      <main className={styles.mainContent}>
        {isLoading ? (
          <h3 className={styles.title}>로딩 중...</h3> // 로딩 중일 땐 타이틀 대신 로딩 표시
        ) : (
          <>
            <h3 className={styles.title}>마이 쿡클립 {recipes.length}</h3>
            <hr className={styles.hr} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  // ⬇️ [수정] onOpenModal 대신 onBookmarkClick을 사용
                  onBookmarkClick={() => handleDeleteClip(recipe)}
                />
              ))}
            </div>
          </>
        )}

        {/* [수정] 모달 로직이 RecipeCard에서 DetailPage로 이동했으므로
          이 페이지에서는 모달을 관리할 필요가 없습니다.
        */}
      </main>
    </div>
  );
};

export default CookclipPage;

