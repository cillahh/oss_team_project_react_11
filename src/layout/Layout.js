import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // 1. useLocation 훅 import
import Header from '../components/Header/Header';
import styles from './Layout.module.css'; // 2. CSS 모듈 import

const Layout = () => {
  const location = useLocation();
  // 3. 현재 경로가 '/cooclip'인지 확인
  const isCookclipPage = location.pathname === '/cookclip';

  // 4. 페이지에 따라 <main> 태그에 다른 클래스 적용
  const mainClassName = isCookclipPage
    ? styles.mainFullWidth // 쿡클립 페이지일 때
    : styles.mainDefault;  // 나머지 페이지일 때

  return (
    <>
      <Header />
      {/* 5. 동적으로 클래스 이름 적용 */}
      <main className={mainClassName}>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default Layout;
