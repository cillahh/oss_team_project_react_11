// src/pages/CookclipPage.js

import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import ClipAddModal from '../components/Modal/ClipAddModal';
import { fetchRecipesByPage } from '../api/recipeAPI';

const CookclipPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

  // 1️⃣ 전체 레시피 불러오기 + 내 북마크 적용
  useEffect(() => {
    const loadAll = async () => {
      try {
        // 전체 레시피 불러오기
        const data = await fetchRecipesByPage({ pageParam: 1 });
        setRecipes(data.map(r => ({ ...r, isBookmarked: false, clipId: null })));

        // 내 uid 가져오기
        let uid = localStorage.getItem('uid');
        if (!uid) return;

        // 내 북마크 불러오기
        const res = await fetch(ITEMS_URL);
        const clips = await res.json();
        const myClips = clips.filter(c => c.uid === uid);

        // 레시피에 isBookmarked + clipId 적용
        setRecipes(prev =>
          prev.map(r => {
            const clip = myClips.find(c => c.cookid === String(r.id));
            if (clip) return { ...r, isBookmarked: true, clipId: clip.id };
            return r;
          })
        );
      } catch (err) {
        console.error('❌ 레시피 또는 북마크 불러오기 실패:', err);
      }
    };

    loadAll();
  }, []);

  // 2️⃣ 카드 클릭 시
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

  // 3️⃣ ClipAddModal 저장 시
  const handleSaveClip = async (recipeId, comment) => {
    try {
      let uid = localStorage.getItem('uid');
      if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('uid', uid);
      }

      // POST 요청
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

  // 4️⃣ 이미 북마크 된 카드 클릭 시 삭제
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
