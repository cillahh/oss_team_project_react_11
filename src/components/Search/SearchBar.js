// src/components/SearchComponent/SearchComponent.js

import React from 'react';
import styles from './SearchBar.module.css'; // CSS 모듈 불러오기
import { CiSearch } from "react-icons/ci"; // 검색 아이콘

const SearchComponent = ({ title, placeholder = "검색어를 입력하세요..." }) => {
    return (
        // 1. 전체를 감싸는 Flexbox 컨테이너
        <div className={styles.searchContainer}>

            {/* 2. Props로 받은 Title */}
            <h3 className={styles.title}>{title}</h3>

            <div className={styles.searchControls}>
                {/* 3. 필터 (Select Box) */}
                <select name="filter" className={styles.filterSelect}>
                    <option value="all">필터</option>
                    <option value="recipe">카테고리</option>
                    <option value="ingredient">조리법</option>
                </select>

                {/* 4. 검색어 입력 필드 (Props로 받은 placeholder 사용) */}
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={placeholder}
                />

                {/* 5. 검색 버튼 */}
                <button type="button" className={styles.searchButton}>
                    <CiSearch size={22} />
                </button>
            </div>

        </div>
    );
};

export default SearchComponent;