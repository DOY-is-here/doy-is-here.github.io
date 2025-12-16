import { tweets } from './tweets.js';

// 날짜 포맷팅
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return `${seconds}초`;
    if (minutes < 60) return `${minutes}분`;
    if (hours < 24) return `${hours}시간`;
    if (days < 7) return `${days}일`;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (date.getFullYear() === now.getFullYear()) {
        return `${month}월 ${day}일`;
    }
    
    return `${date.getFullYear()}년 ${month}월 ${day}일`;
}

// 숫자 포맷팅 (1000 → 1K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 해시태그 하이라이트
function highlightHashtags(text) {
    return text.replace(/#(\S+)/g, '<span class="tweet-hashtag">#$1</span>');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 미디어 그리드 렌더링
function renderMedia(images) {
    if (!images || images.length === 0) return '';
    
    const count = images.length;
    const countClass = `count-${Math.min(count, 4)}`;
    
    const mediaItems = images.slice(0, 4).map(img => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(img);
        
        if (isVideo) {
            return `
                <div class="media-item">
                    <video src="${img}" controls></video>
                </div>
            `;
        } else {
            return `
                <div class="media-item">
                    <img src="${img}" alt="트윗 이미지" loading="lazy">
                </div>
            `;
        }
    }).join('');
    
    return `
        <div class="tweet-media">
            <div class="media-grid ${countClass}">
                ${mediaItems}
            </div>
        </div>
    `;
}

// 트윗 카드 렌더링
function renderTweet(tweet) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    return `
        <article class="tweet" data-tweet-id="${tweet.id}">
            <div class="tweet-avatar">
                <img src="${tweet.author.avatar}" alt="${tweet.author.name}">
            </div>
            <div class="tweet-content">
                <div class="tweet-header">
                    <span class="tweet-author">${tweet.author.name}</span>
                    ${tweet.author.verified ? `
                        <svg viewBox="0 0 22 22" width="18" height="18" class="verified-badge">
                            <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg>
                    ` : ''}
                    <span class="tweet-username">@${tweet.author.username}</span>
                    <span class="tweet-date"> · ${formatDate(tweet.date)}</span>
                </div>
                <div class="tweet-text">${highlightedText}</div>
                ${renderMedia(tweet.images)}
                <div class="tweet-actions">
                    <button class="action-button reply">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                        </svg>
                        ${tweet.replies > 0 ? formatNumber(tweet.replies) : ''}
                    </button>
                    <button class="action-button retweet">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                        </svg>
                        ${tweet.retweets > 0 ? formatNumber(tweet.retweets) : ''}
                    </button>
                    <button class="action-button like">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                        </svg>
                        ${tweet.likes > 0 ? formatNumber(tweet.likes) : ''}
                    </button>
                    <button class="action-button views">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                        </svg>
                        ${tweet.views > 0 ? formatNumber(tweet.views) : ''}
                    </button>
                </div>
            </div>
        </article>
    `;
}

// 타임라인 렌더링
function renderTimeline() {
    const timeline = document.getElementById('timeline');
    
    if (!timeline) {
        console.error('Timeline element not found');
        return;
    }
    
    if (!tweets || tweets.length === 0) {
        timeline.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                트윗이 없습니다
            </div>
        `;
        return;
    }
    
    // 날짜순 정렬 (최신순)
    const sortedTweets = [...tweets].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    timeline.innerHTML = sortedTweets.map(renderTweet).join('');
    
    console.log(`✅ ${sortedTweets.length}개의 트윗 렌더링 완료`);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderTimeline();
});

// Export for potential reuse
export { renderTimeline, formatDate, formatNumber };