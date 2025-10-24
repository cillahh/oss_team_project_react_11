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
  const handleSaveClick = async () => {
    try {
      // 1️⃣ 로컬스토리지에서 uid 꺼내기
      let uid = localStorage.getItem('uid');
      if (!uid) {
        // uid가 없으면 랜덤 생성 후 저장 (첫 방문 가정)
        uid = crypto.randomUUID();
        localStorage.setItem('uid', uid);
      }

      // 2️⃣ cookid는 recipe.id로 바로 사용 가능 (이미 props로 받음)
      const cookid = recipe.id;

      // 3️⃣ mockAPI로 POST 요청 보내기
      const response = await fetch('https://68dfbc80898434f41358c319.mockapi.io/cookclip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          cookid,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('데이터 저장 실패!');
      }

      const data = await response.json();
      console.log('✅ 저장 성공:', data);

      // 4️⃣ 부모 컴포넌트에도 알리기 (선택)
      onSave(recipe.id, comment);

      // 5️⃣ 모달 닫기
      onClose();
    } catch (err) {
      console.error('❌ 에러 발생:', err);
      alert('저장 중 오류가 발생했어요 😢');
    }
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
