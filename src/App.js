import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import MainPage from './pages/MainPage';
import SearchPage from './pages/SearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CookclipPage from './pages/CookclipPage';
import RecipeListPage from './pages/RecipeListPage';

function App() {
  return (
    <Routes>
      {/* Layout 컴포넌트를 부모 라우트로 사용 */}
      <Route path="/" element={<RecipeListPage />}>
       
      </Route>
      
      {/* 예: 헤더/푸터가 없는 별도 페이지 (로그인 페이지 등) */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;