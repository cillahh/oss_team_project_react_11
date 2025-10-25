// src/pages/CookclipPage.js

import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal';
import { fetchRecipesByPage } from '../api/recipeAPI';

const CookclipPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

  useEffect(() => {
    const loadClips = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) return;

        const res = await fetch(ITEMS_URL);
        const clips = await res.json();
        const myClips = clips.filter(c => c.uid === uid);

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
      }
    };
    loadClips();
  }, []);




  // 4️⃣ 이미 북마크 된 카드 클릭 시 삭제
  const handleDeleteClip = async (recipe) => {
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
    <div>
      <h1>🍳 레시피 목록 {recipes.length}</h1>
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


      {selectedRecipe && (
        <ClipAddModal
          recipe={selectedRecipe}
        />
      )}
    </div>
  );
};

export default CookclipPage;
