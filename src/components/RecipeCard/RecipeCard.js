// src/components/RecipeCard/RecipeCard.js

import React from 'react';
import styles from './RecipeCard.module.css';
import { Link } from 'react-router-dom';
import { CiBookmark } from "react-icons/ci"; // 기본 아이콘
import { FaBookmark } from "react-icons/fa"; // 북마크 선택된 아이콘

/**
 * RecipeCard 컴포넌트
 * @param {object} props
 * @param {object} props.recipe - 레시피 데이터 객체
 * @param {function} props.onOpenModal - (recipe) => void. 북마크 버튼 클릭 시 호출될 함수
 */
const RecipeCard = ({ recipe, onOpenModal }) => {
  console.log('북마크 상태:', recipe.title, recipe.isBookmarked);

  // 북마크 버튼 클릭 시 상위 <Link>의 이동을 막음
  const handleBookmarkClick = (e) => {
    e.preventDefault(); // <Link>의 기본 동작(페이지 이동)을 막음
    e.stopPropagation(); // 이벤트가 부모(카드)로 전파되는 것을 막음
    
    // 부모로부터 받은 onOpenModal 함수를 호출하며,
    // 이 카드의 레시피 데이터를 전달합니다.
    onOpenModal(recipe);
  };

  return (
    // 1. 카드 전체: 클릭 시 상세 페이지로 이동
    <Link to={`/detail/${recipe.id}`} className={styles.card}>
      
      {/* 2. 이미지 섹션 */}
      <div className={styles.imageContainer}>
        <img 
          src={recipe.imageUrl || 'https://via.placeholder.com/300x200'} // 이미지가 없을 경우 대비
          alt={recipe.title} 
          className={styles.recipeImage} 
        />
        {/* 3. 북마크 버튼 */}
        <button 
          className={`${styles.bookmarkButton} ${recipe.isBookmarked ? styles.bookmarked : ''}`}
          onClick={handleBookmarkClick}
          aria-label="북마크"
        >
          {recipe.isBookmarked ? <FaBookmark size={22} /> : <CiBookmark size={24} />}
        </button>
      </div>

      {/* 4. 컨텐츠 섹션 */}
      <div className={styles.contentContainer}>
        <h3 className={styles.title}>{recipe.title || '레시피 제목'}</h3>
        <p className={styles.description}>
          {recipe.description || '레시피에 대한 간단한 설명입니다.'}
        </p>
      </div>

      {/* 5. 태그 섹션 (준비시간, 조리시간) */}
      <div className={styles.tagsContainer}>
        {recipe.category && <span className={styles.tag}>#카테고리 | {recipe.category}</span>}
        {recipe.method && <span className={styles.tag}>#조리방법 | {recipe.method}</span>}
      </div>

    </Link>
  );
};

export default RecipeCard;