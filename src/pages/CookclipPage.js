import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/ClipAddModal/ClipAddModal';
import { fetchRecipesByPage } from '../api/recipeAPI';

const CookclipPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

  useEffect(() => {
  const loadAll = async () => {
    try {
      const data = await fetchRecipesByPage({ pageParam: 1 });
      setRecipes(data.map(r => ({ ...r, isBookmarked: false, clipId: null })));

      // 레시피가 다 로드된 후 북마크 상태 적용
      let uid = localStorage.getItem('uid');
      if (!uid) return;

      const res = await fetch('https://68dfbc80898434f41358c319.mockapi.io/cookclip');
      const clips = await res.json();
      const myClips = clips.filter(c => c.uid === uid);

      setRecipes(prev =>
        prev.map(r => {
          const clip = myClips.find(c => c.cookid === String(r.id));
          if (clip) return { ...r, isBookmarked: true, clipId: clip.id };
          return r;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };
  loadAll();
}, []);

  const handleOpenModal = (recipe) => {
    if (recipe.isBookmarked) {
      // 이미 북마크 되어있으면 바로 삭제
      handleDeleteClip(recipe);
    } else {
      // 새 북마크는 모달 열기
      setSelectedRecipe(recipe);
    }
  };

  const handleCloseModal = () => setSelectedRecipe(null);

  const handleSaveClip = async (recipeId, comment) => {
    try {
      let uid = localStorage.getItem('uid');
      if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('uid', uid);
      }

      const recipe = recipes.find(r => r.id === recipeId);

      const res = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, cookid: recipeId, comment }),
      });

      if (!res.ok) throw new Error('저장 실패');
      const data = await res.json();

      // UI 갱신
      setRecipes(prev =>
        prev.map(r => r.id === recipeId ? { ...r, isBookmarked: true, clipId: data.id } : r)
      );

    } catch (err) {
      console.error(err);
      alert('클립 저장 중 오류가 발생했습니다.');
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteClip = async (recipe) => {
    try {
      if (!recipe.clipId) return;

      const res = await fetch(`${ITEMS_URL}/${recipe.clipId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');

      // UI 갱신
      setRecipes(prev =>
        prev.map(r => r.id === recipe.id ? { ...r, isBookmarked: false, clipId: null } : r)
      );
    } catch (err) {
      console.error(err);
      alert('클립 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>🍳 레시피 목록</h1>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onOpenModal={handleOpenModal}
          />
        ))}
      </div>

      {selectedRecipe && (
        <ClipAddModal
          recipe={selectedRecipe}
          onClose={handleCloseModal}
          onSave={handleSaveClip}
        />
      )}
    </div>
  );
};

export default CookclipPage;
