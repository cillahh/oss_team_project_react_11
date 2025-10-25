import React, { useState, useEffect } from 'react';
import styles from './UserProfileSidebar.module.css';
import { FaUserCircle } from "react-icons/fa"; // 유저 기본 아이콘

const UserProfileSidebar = () => {
    // localStorage에서 UID를 가져오기 위한 state
    const [uid, setUid] = useState(null);

    // 컴포넌트가 처음 렌더링될 때 localStorage에서 UID를 읽어옵니다.
    useEffect(() => {
        const storedUid = localStorage.getItem('cookclip_user_uid');
        if (storedUid) {
            setUid(storedUid);
        }
    }, []); // 빈 배열: 처음 한 번만 실행

    return (
        <div className={styles.sidebarBox}>
            {/* 1. 프로필 이미지 영역 */}
            <div className={styles.profileImage}>
                <FaUserCircle size={75} />
            </div>
            
            {/* 2. 유저 정보 */}
            <h3 className={styles.username}>방문자 님</h3>
            
            <p className={styles.uidLabel}>고유 ID</p>
            <span className={styles.uidValue}>
                {uid ? uid : 'ID를 불러오는 중...'}
            </span>
        </div>
    );
};

export default UserProfileSidebar;
