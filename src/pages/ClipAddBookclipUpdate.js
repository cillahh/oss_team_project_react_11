
const ITEMS_URL = 'https://68dfbc80898434f41358c319.mockapi.io/cookclip';

export default async function ClipAddBookclipUpdate(recipeId, comment, recipeData) {
    try {
        let uid = localStorage.getItem('uid');
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem('uid', uid);
        }

        const res = await fetch(ITEMS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, cookid: recipeId, comment, recipeData }),
        });

        if (!res.ok) throw new Error('북마크 저장 실패');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('북마크 저장 오류:', err);
        throw err;
    }
}

