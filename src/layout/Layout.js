import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // 1. useLocation import
import Header from '../components/Header/Header';
import styles from './Layout.module.css'; // 2. CSS 모듈 import

const Layout = () => {
  // 3. 현재 페이지 경로(pathname)를 가져옵니다.
  const location = useLocation();

  // 4. 경로가 /cooclip 또는 /recipe/로 시작하는지 확인합니다.
  const isFullWidthPage = location.pathname.startsWith('/cookclip') || 
                          location.pathname.startsWith('/recipe/');

  return (
    <>
      <Header />
      {/* 5. isFullWidthPage 값에 따라 다른 className을 적용합니다. */}
      <main className={isFullWidthPage ? styles.mainFullWidth : styles.mainDefault}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;

