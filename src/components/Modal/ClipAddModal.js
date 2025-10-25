import React, { useState } from 'react';
import styles from './ClipAddModal.module.css';
import { CgClose } from 'react-icons/cg'; // 닫기 아이콘

/**
 * 레시피 클립(북마크) 추가 모달
 * @param {object} props
 * @param {object} props.recipe - 표시할 레시피 데이터
 * @param {function} props.onClose - 모달 닫기 함수
 * @param {function} props.onSave - (comment) => void. 저장 버튼 클릭 시 호출될 함수
 */
const ClipAddModal = ({ recipe, onClose, onSave }) => {
  // '나의 메모' textarea를 위한 state
  const [comment, setComment] = useState('');

  // 저장 버튼 클릭 시

  const handleSaveClick = () => {
    // POST는 부모에서 처리, 모달은 comment 값만 전달
    onSave(recipe.id, comment);
    onClose();
  };


  // 모달 뒷배경 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // 1. 모달 뒷배경 (어둡게 처리)
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>

      {/* 2. 모달 컨텐츠 본체 */}
      <div className={styles.modalContent}>

        {/* 3. 헤더: 제목, 닫기 버튼 */}
        <div className={styles.modalHeader}>
          <h2>레시피 클립 추가하기</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <CgClose size={24} />
          </button>
        </div>

        {/* 4. 바디: 이미지, 레시피 정보 */}
        <div className={styles.modalBody}>
          <div className={styles.imageWrapper}>
            <img src={recipe.imageUrl} alt={recipe.title} />
          </div>
          <div className={styles.infoWrapper}>
            <div className={styles.tags}>
              {/* API 데이터의 '요리종류', '조리방법'을 태그로 활용 */}
              <span className={styles.tag}>#{recipe.category}</span>
              <span className={styles.tag}>#{recipe.method}</span>
            </div>
            <h3 className={styles.title}>{recipe.title}</h3>
            <p className={styles.description}>{recipe.description}</p>
          </div>
        </div>

        {/* 5. 메모 섹션 */}
        <div className={styles.memoSection}>
          <h4>나의 메모</h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="코멘트를 입력해주세요."
            className={styles.memoTextarea}
          />
        </div>

        {/* 6. 푸터: 저장 버튼 */}
        <div className={styles.modalFooter}>
          <button onClick={handleSaveClick} className={styles.saveButton}>
            저장
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClipAddModal;
