import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout'; // 👈 부모가 될 레이아웃
// import MainPage from './pages/MainPage';
// import RecipeDetailPage from './pages/RecipeDetailPage';
// import CookclipPage from './pages/CookclipPage'; // 👈 '마이 쿡클립' 페이지
import React, { useEffect } from 'react';
import RecipeListPage from './pages/RecipeListPage';
import SearchPage from './pages/SearchPage';
import CookclipPage from './pages/CookclipPage';

function App() {

  useEffect(() => {
    const UID_KEY = 'cookclip_user_uid';

    // localStorage에서 기존 UID를 불러오기
    let existingUid = localStorage.getItem(UID_KEY);

    // 첫 방문시
    if (!existingUid) {
      //랜덤 uid 생성
      const newUid = crypto.randomUUID();

      localStorage.setItem(UID_KEY, newUid);
      console.log('New user UID generated and stored:', newUid);
    } else {
      console.log('Existing user UID found:', existingUid);
    }

  }, []); 

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<RecipeListPage />} />
        <Route path="search" element={<SearchPage />} />
        {/* <Route path="cooclip" element={<CookclipPage />} /> */}
        {/* <Route path="recipe/:recipeId" element={<RecipeDetailPage />} /> */}

      </Route>

      {/* (Layout이 필요 없는 별도 페이지들) */}
      <Route path="/cookclip" element={<CookclipPage />} />

      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;