import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout'; // 👈 부모가 될 레이아웃
// import MainPage from './pages/MainPage';
// import RecipeDetailPage from './pages/RecipeDetailPage';
// import CookclipPage from './pages/CookclipPage'; // 👈 '마이 쿡클립' 페이지
import RecipeListPage from './pages/RecipeListPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Routes>
      {/* 1. 최상위 경로의 element를 <Layout />으로 변경합니다. */}
      <Route path="/" element={<Layout />}>
        
        {/* 2. '/' 경로일 때 Layout의 <Outlet>에 MainPage를 보여줍니다. */}
        <Route index element={<RecipeListPage />} />
        
        {/* 3. '/search' 경로일 때 RecipeListPage를 보여줍니다. */}
        <Route path="search" element={<SearchPage />} />
        
        {/* 4. '/cooclip' 경로일 때 CookclipPage를 보여줍니다. (헤더 버튼) */}
        {/* <Route path="cooclip" element={<CookclipPage />} /> */}
        
        {/* 5. 동적 라우팅 (디테일 페이지) */}
        {/* <Route path="recipe/:recipeId" element={<RecipeDetailPage />} /> */}

      </Route>
      
      {/* (Layout이 필요 없는 별도 페이지들) */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;