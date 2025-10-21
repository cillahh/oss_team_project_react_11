// src/components/Header/Header.js

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/cookclip_logo.png'
import { IoBookmark } from "react-icons/io5";


const Header = () => {
  return (
    // 1. 헤더 전체를 감싸는 <header> 태그
    <header className={styles.header}>
      {/* 2. 내용물의 최대 넓이를 제한하고 중앙 정렬하는 컨테이너 */}
      <div className={styles.container}>
        
        {/* 3. 왼쪽 로고 (클릭 시 홈으로 이동) */}
        <div className={styles.logo}>
          <Link to="/"><img src={logo} alt="" /></Link>
        </div>

        {/* 4. 오른쪽 네비게이션 (버튼) */}
        <nav className={styles.navigation}>
          {/* '/cooclip' 경로로 이동하는 링크 (버튼 스타일) */}
          <Link to="/cooclip" className={styles.navButton}>
            <span>마이 쿡클립</span> <IoBookmark className={styles.IoBookmark} />
          </Link>
        </nav>

      </div>
    </header>
  );
};

export default Header;