// src/layout/Layout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header'; // 방금 만든 Header 컴포넌트 경로
// import Footer from '../components/Footer/Footer'; // (나중에 푸터를 만든다면 추가)

const Layout = () => {
  return (
    <>
      {/* 1. 모든 페이지 상단에 고정될 헤더 */}
      <Header />

      {/* 2. 페이지의 실제 내용이 렌더링될 영역 */}
      <main>
        {/* <Outlet />은 App.js에서 Layout 라우트의
          자식으로 있는 컴포넌트(MainPage, CooclipPage 등)가
          이 자리에 렌더링되도록 해주는 표지판입니다.
        */}
        <Outlet />
      </main>

      {/* 3. (선택) 모든 페이지 하단에 고정될 푸터 */}
      {/* <Footer /> */}
    </>
  );
};

export default Layout;