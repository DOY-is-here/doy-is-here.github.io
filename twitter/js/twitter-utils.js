// 유틸리티 함수 모듈

// 시간 포맷팅 (초 -> 분:초)
export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 날짜 포맷팅 (날짜만, 시간 제거)
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}.${month}.${day}.`;
}

// 상세 날짜 포맷팅 (날짜만)
export function formatDetailDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}.${month}.${day}.`;
}

// 해시태그 하이라이트
export function highlightHashtags(text) {
    return text.replace(/#(\S+)/g, '<span class="tweet-hashtag">#$1</span>');
}

// HTML 이스케이프
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 트윗 개수 계산
export function getTotalTweetCount(tweets) {
    return tweets.length;
}

// 트윗 개수 업데이트
export function updateTweetCount(tweets) {
    const tweetCountEl = document.getElementById('tweet-count');
    if (tweetCountEl) {
        const count = getTotalTweetCount(tweets);
        tweetCountEl.textContent = `게시물 ${count.toLocaleString()}개`;
    }
}