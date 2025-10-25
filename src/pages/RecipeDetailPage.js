import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRecipes } from '../api/recipeAPI';
import styles from './RecipeDetailPage.module.css';
import { CiBookmark } from 'react-icons/ci';
import { FaBookmark } from 'react-icons/fa';

const RecipeDetailPage = () => {
    const { recipeId } = useParams();
    const [isBookmarked, setIsBookmarked] = useState(false);

    const { data: recipe, isLoading, isError } = useQuery({
        queryKey: ['allRecipes'],
        queryFn: fetchAllRecipes,
        select: (allRecipes) =>
            allRecipes.find(r => String(r.RCP_SEQ) === String(recipeId))
    });

    // ... (ingredients, steps 로직은 동일)
    const ingredients = useMemo(() => {
        if (!recipe?.RCP_PARTS_DTLS) return [];
        const items = recipe.RCP_PARTS_DTLS.split(',');
        const result = [];
        items.forEach(item => {
            const parts = item.split('(');
            if (parts.length === 2 && parts[1].includes('g)')) {
                result.push({ name: parts[0].trim(), amount: `(${parts[1].trim()}` });
            } else {
                result.push({ name: item.trim(), amount: '' });
            }
        });
        return result;
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
    if (isError) return <div className={styles.error}>오류가 발생했습니다.</div>;
    if (!recipe) return <div className={styles.error}>레시피를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.pageContainer}>

            {/* 1. [수정] 전체 너비 페이지 헤더 (흰색 배경) */}
            <header className={styles.header}>
                {/* 헤더의 '내용물'만 중앙 정렬시킴 */}
                <div className={styles.headerInner}>
                    <div className={styles.titleSection}>
                        <div className={styles.tags}>
                            {recipe.RCP_PAT2 && <span className={styles.tag}>{recipe.RCP_PAT2}</span>}
                            {recipe.RCP_WAY2 && <span className={styles.tag}>{recipe.RCP_WAY2}</span>}
                        </div>
                        <h3 className={styles.title}>{recipe.RCP_NM}</h3>
                    </div>
                    <button
                        className={styles.bookmarkButton}
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        {isBookmarked ? <FaBookmark size={28} /> : <CiBookmark size={30} />}
                    </button>
                </div>
            </header>

            {/* 2. [신규] 중앙 정렬 컨텐츠 바디 */}
            <div className={styles.contentBody}>
                {/* 메인 이미지 */}
                {recipe.ATT_FILE_NO_MAIN &&
                    <img src={recipe.ATT_FILE_NO_MAIN} alt={recipe.RCP_NM} className={styles.mainImage} />
                }

                {/* 재료 */}
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

                {/* 만드는 법 */}
                <section className={styles.section}>
                    <h2 className={styles.subTitle}>만드는 법</h2>
                    <ol className={styles.stepsList}>
                        {steps.map((step, index) => (
                            <li key={index} className={styles.stepItem}>
                                <strong className={styles.stepTitle}>Step {index + 1}</strong>
                                <p className={styles.stepDescription}>{step.text}</p>
                                {step.img && step.img.trim() &&
                                    <img src={step.img} alt={`Step ${index + 1}`} className={styles.stepImage} />
                                }
                            </li>
                        ))}
                    </ol>
                </section>
            </div> {/* .contentBody 닫기 */}

        </div> // .pageContainer 닫기
    );
};

export default RecipeDetailPage;

