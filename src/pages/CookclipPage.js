import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal';
import { fetchRecipesByPage } from '../api/recipeAPI';
import styles from './CookclipPage.module.css';
import UserProfileSidebar from '../components/UserProfileSidebar/UserProfileSidebar';

const CookclipPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // 1. ⬇️ 로딩 상태를 관리할 state를 추가합니다. (기본값 true)
  const [isLoading, setIsLoading] = useState(true);

  const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

  useEffect(() => {
    const loadClips = async () => {
      // (선택) 로딩이 시작됨을 명시
      setIsLoading(true); 
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) {
          // uid가 없으면 로딩을 즉시 중단하고 빈 화면을 보여줌
          setIsLoading(false);
          return;
        }

        const res = await fetch(ITEMS_URL);
        const clips = await res.json();
        const myClips = clips.filter(c => c.uid === uid);

        // [최적화] 내 클립이 0개면 공공데이터를 호출할 필요가 없습니다.
        if (myClips.length === 0) {
            setRecipes([]);
            setIsLoading(false);
            return;
        }

        // 공공데이터에서 레시피를 찾기
        const allRecipes = await fetchRecipesByPage({ pageParam: 1 });
        const recipesForUI = myClips.map(clip => {
          const recipe = allRecipes.find(r => String(r.RCP_SEQ) === String(clip.cookid));
          return recipe ? {
            id: recipe.RCP_SEQ,
            title: recipe.RCP_NM,
            description: recipe.RCP_PARTS_DTLS,
            imageUrl: recipe.ATT_FILE_NO_MAIN,
            category: recipe.RCP_PAT2,
            method: recipe.RCP_WAY2,
            isBookmarked: true,
            clipId: clip.id,
            comment: clip.comment
          } : null;
        }).filter(Boolean);

        setRecipes(recipesForUI);
      } catch (err) {
        console.error('북마크 불러오기 실패:', err);
      } finally {
        // 2. ⬇️ try...catch...가 모두 끝난 후(성공/실패 무관) 로딩 상태를 false로 변경
        setIsLoading(false);
      }
    };
    loadClips();
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 1회 실행

  const handleDeleteClip = async (recipe) => {
    // ... (삭제 로직)
  };


  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <UserProfileSidebar />
      </aside>
      <main className={styles.mainContent}>

        {/* 3. ⬇️ isLoading 상태에 따라 조건부 렌더링 */}
        {isLoading ? (
          // 로딩 중일 때는 아무것도 표시하지 않음 (또는 로딩 스피너)
          null 
        ) : (
          // 로딩이 끝나면 컨텐츠 표시
          <>
            <h3 className={styles.title}>마이 쿡클립 <span className={styles.length}>{recipes.length}</span> </h3>
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
                  onBookmarkClick={() => handleDeleteClip(recipe)}
                />
              ))}
            </div>
          </>
        )}

        {selectedRecipe && (
          <ClipAddModal
            recipe={selectedRecipe}
          />
        )}
      </main>
    </div>
  );
};

export default CookclipPage;

