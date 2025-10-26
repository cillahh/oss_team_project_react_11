import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRecipes } from '../api/recipeAPI';
import ClipAddModal from '../components/Modal/ClipAddModal';
import styles from './RecipeDetailPage.module.css';
import { CiBookmark } from 'react-icons/ci';
import { FaBookmark } from 'react-icons/fa';

const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

const RecipeDetailPage = () => {
  const { recipeId } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [clipId, setClipId] = useState(null);

  // ✅ 레시피 불러오기
  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['allRecipes'],
    queryFn: fetchAllRecipes,
    select: (allRecipes) => allRecipes.find(r => String(r.RCP_SEQ) === String(recipeId))
  });

  // ✅ 로그인 유저의 북마크 여부 확인
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (!uid || !recipeId) return;
        const res = await fetch(ITEMS_URL);
        const clips = await res.json();
        const myClip = clips.find(c => c.uid === uid && String(c.cookid) === String(recipeId));

        if (myClip) {
          setIsBookmarked(true);
          setComment(myClip.comment || '');
          setClipId(myClip.id);
        } else {
          setIsBookmarked(false);
          setComment('');
          setClipId(null);
        }
      } catch (err) {
        console.error('북마크 확인 실패:', err);
      }
    };
    checkBookmark();
  }, [recipeId]);


  // ✅ 북마크 버튼 클릭 시
  const handleBookmarkClick = () => {
    if (isBookmarked) {
      handleDeleteClip();
    } else {
      setIsModalOpen(true);
    }
  };

  // ✅ 북마크 삭제
  const handleDeleteClip = async () => {
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) return;
      const res = await fetch(ITEMS_URL);
      const clips = await res.json();
      const myClip = clips.find(c => c.uid === uid && String(c.cookid) === String(recipeId));
      if (!myClip) return;

      const deleteRes = await fetch(`${ITEMS_URL}/${myClip.id}`, { method: 'DELETE' });
      if (!deleteRes.ok) throw new Error('삭제 실패');
      setIsBookmarked(false);
    } catch (err) {
      console.error(err);
      alert('북마크 삭제 중 오류가 발생했습니다.');
    }
  };

  // ✅ 모달 닫기
  const handleModalClose = () => setIsModalOpen(false);

  // ✅ 모달에서 저장 버튼 클릭 시
  const handleSaveClip = async (recipeId, comment) => {
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        alert('로그인이 필요합니다.');
        return;
      }

      const newClip = {
        uid,
        cookid: recipeId,
        comment,
      };

      const res = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClip),
      });

      if (!res.ok) throw new Error('추가 실패');

      const savedClip = await res.json();

      setIsBookmarked(true);
      setIsModalOpen(false);
      setComment(savedClip.comment || '');
      setClipId(savedClip.id);
    } catch (err) {
      console.error(err);
      alert('북마크 추가 중 오류 발생');
    }
  };

  // ✅ 재료 / 단계
  const ingredients = useMemo(() => {
    if (!recipe?.RCP_PARTS_DTLS) return [];
    return recipe.RCP_PARTS_DTLS.split(',').map(item => {
      const parts = item.split('(');
      return {
        name: parts[0].trim(),
        amount: parts[1] ? `(${parts[1].trim()}` : ''
      };
    });
  }, [recipe]);

  const steps = useMemo(() => {
    if (!recipe) return [];
    const stepList = [];
    for (let i = 1; i <= 20; i++) {
      const stepKey = `MANUAL${String(i).padStart(2, '0')}`;
      const imgKey = `MANUAL_IMG${String(i).padStart(2, '0')}`;
      const stepText = recipe[stepKey];
      const stepImg = recipe[imgKey];
      if (stepText && stepText.trim()) {
        stepList.push({ text: stepText.replace(/^Step\d+\.\s*/, '').trim(), img: stepImg });
      }
    }
    return stepList;
  }, [recipe]);

  if (isLoading) return <div className={styles.loading}>레시피를 불러오는 중...</div>;
  if (isError) return <div className={styles.error}>레시피를 불러오는 중 오류 발생</div>;
  if (!recipe) return <div className={styles.error}>레시피를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.titleSection}>
            <div className={styles.tags}>
              {recipe.RCP_PAT2 && <span className={styles.tag}>#{recipe.RCP_PAT2}</span>}
              {recipe.RCP_WAY2 && <span className={styles.tag}>#{recipe.RCP_WAY2}</span>}
            </div>
            <h3 className={styles.title}>{recipe.RCP_NM}</h3>
          </div>
          <button className={styles.bookmarkButton} onClick={handleBookmarkClick}>
            {isBookmarked ? <FaBookmark size={28} /> : <CiBookmark size={30} />}
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className={styles.contentBody}>
        <section className={styles.memoSection}>
          {isBookmarked && (
            <div className={styles.commentContainer}>
              <div className={styles.commentHeader}>
                {!isEditing && (
                  <button
                    className={styles.commentButton}
                    onClick={() => setIsEditing(true)}
                  >
                    편집
                  </button>
                )}
                {isEditing && (
                  <button
                    className={styles.commentButton}
                    onClick={async () => {
                      try {
                        if (!clipId) return alert('클립 정보를 찾을 수 없습니다.');

                        const res = await fetch(`${ITEMS_URL}/${clipId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ comment }),
                        });

                        if (!res.ok) throw new Error('업데이트 실패');
                        setIsEditing(false);
                      } catch (err) {
                        console.error(err);
                        alert('코멘트 수정 중 오류가 발생했습니다.');
                      }
                    }}
                  >
                    완료
                  </button>
                )}
              </div>
              <div className={styles.commentBox}>
              <h2 className={styles.subTitle}>나의 메모</h2>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                readOnly={!isEditing}
                
                placeholder="메모를 입력하세요."
              />
              </div>
            </div>
          )}
        </section>

        {recipe.ATT_FILE_NO_MAIN && (
          <img src={recipe.ATT_FILE_NO_MAIN} alt={recipe.RCP_NM} className={styles.mainImage} />
        )}

        <section className={styles.section}>
          <h2 className={styles.subTitle}>재료</h2>
          <div className={styles.ingredientsList}>
            {ingredients.map((item, index) => (
              <span key={index} className={styles.ingredientItem}>
                {item.name} <strong>{item.amount}</strong>
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subTitle}>만드는 법</h2>
          <ol className={styles.stepsList}>
            {steps.map((step, index) => (
              <li key={index} className={styles.stepItem}>
                <strong className={styles.stepTitle}>Step {index + 1}</strong>
                <p className={styles.stepDescription}>{step.text}</p>
                {step.img && step.img.trim() && (
                  <img src={step.img} alt={`Step ${index + 1}`} className={styles.stepImage} />
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <ClipAddModal
          recipe={{
            id: recipe.RCP_SEQ,
            title: recipe.RCP_NM,
            description: recipe.RCP_PARTS_DTLS,
            imageUrl: recipe.ATT_FILE_NO_MAIN,
            category: recipe.RCP_PAT2,
            method: recipe.RCP_WAY2,
          }}
          onClose={handleModalClose}
          onSave={handleSaveClip} // ✅ 여기 핵심
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
