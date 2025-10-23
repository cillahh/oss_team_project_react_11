// src/components/SearchComponent/SearchComponent.js

import React from 'react';
import styles from './SearchBar.module.css'; // 유저가 사용한 파일 이름
import { CiSearch } from "react-icons/ci";

// '제어'를 위한 5개의 props
const SearchComponent = ({ 
  title, 
  placeholder = "검색어를 입력하세요...",
  inputValue,      // input에 표시될 값
  onInputChange,   // input이 변경될 때 호출될 함수
  filterValue,     // select에 표시될 값
  onFilterChange,  // select가 변경될 때 호출될 함수
  onSearchSubmit   // 검색 버튼 클릭(form submit) 시 호출될 함수
}) => {
  return (
    <form className={styles.searchContainer} onSubmit={onSearchSubmit}>

      <h3 className={styles.title}>{title}</h3>

      <div className={styles.searchControls}>
        
        {/* 3. ⬇️ select에 value와 onChange를 연결합니다. */}
        <select 
          name="filter" 
          className={styles.filterSelect}
          value={filterValue}
          onChange={onFilterChange}
        >
          {/* [중요] value는 API가 기대하는 값과 일치해야 합니다. */}
          {/* (예: 'recipe'는 API의 RCP_NM, 'ingredient'는 RCP_PARTS_DTLS) */}
          <option value="recipe">카테고리</option>
          <option value="ingredient">조리법</option>
        </select>

        {/* input에 value와 onChange를 연결합니다. */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={inputValue}
          onChange={onInputChange}
        />

        <button type="submit" className={styles.searchButton}>
          <CiSearch size={22} />
        </button>
      </div>

    </form>
  );
};

export default SearchComponent;