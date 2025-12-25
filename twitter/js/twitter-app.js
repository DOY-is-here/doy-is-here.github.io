import { tweets } from './tweets.js';

// ========== 유틸리티 함수 ==========

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

// 상세 날짜 포맷팅
function formatDetailDate(dateStr) {
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const hour12 = hours % 12 || 12;
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${ampm} ${hour12}:${minutes} · ${year}년 ${month}월 ${day}일`;
}

// 숫자 포맷팅
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
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

// ========== 렌더링 함수 ==========

// 미디어 그리드 렌더링
function renderMedia(images) {
    if (!images || images.length === 0) return '';
    
    const count = images.length;
    const countClass = `count-${Math.min(count, 4)}`;
    
    const mediaItems = images.slice(0, 4).map(img => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(img);
        
        if (isVideo) {
            return `<div class="media-item"><video src="${img}" controls playsinline></video></div>`;
        } else {
            return `<div class="media-item"><img src="${img}" alt="트윗 이미지" loading="lazy"></div>`;
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
                <div class="tweet-actions-left">
                <span class="tweet-icon comment"></span>
                <span class="tweet-icon retweet"></span>
                <span class="tweet-icon like"></span>
                <span class="tweet-icon views"></span>
                <span class="tweet-icon bookmark"></span>
                </div>
                <div class="tweet-actions-right">
                <span class="tweet-icon share"></span>
                </div>
            </div>
            </div>
        </article>
    `;
}

// 트윗 상세 렌더링
function renderTweetDetail(tweet) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    return `
        <div class="detail-user">
            <div class="detail-user-avatar"></div>
            <div class="detail-user-info">
            <div class="detail-user-name-row">
                <span class="detail-user-name">${tweet.author.name}</span>
                    ${tweet.author.verified ? `
                        <svg viewBox="0 0 22 22" width="18" height="18" class="verified-badge">
                            <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg> ` : ''}
                </div>
                <div class="detail-user-handle">@${tweet.author.username}</div>
            </div>
        </div>
        <div class="detail-text">${highlightedText}</div>
        ${tweet.images && tweet.images.length > 0 ? `
            <div class="detail-media">
                ${tweet.images.map(img => `<img src="${img}" alt="트윗 이미지">`).join('')}
            </div>
        ` : ''}
        <div class="detail-time">${formatDetailDate(tweet.date)}</div>
        <div class="detail-actions">
            <div class="detail-actions-left">
            <span class="detail-icon comment"></span>
            <span class="detail-icon retweet"></span>
            <span class="detail-icon like"></span>
            <span class="detail-icon bookmark"></span>
            </div>
            <div class="detail-actions-right">
            <span class="detail-icon share"></span>
            </div>
        </div>
    `;
}

// 사진 그리드 렌더링
function renderPhotoGrid() {
    const photosOnly = tweets.filter(tweet => tweet.images && tweet.images.length > 0);
    
    const html = photosOnly.flatMap(tweet => 
        tweet.images.map(img => `
            <div class="photo-grid-item" data-tweet-id="${tweet.id}">
                <img src="${img}" alt="사진">
            </div>
        `)
    ).join('');
    
    return `<div class="photo-grid">${html}</div>`;
}

// ========== 페이지 전환 ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// ========== 타임라인 렌더링 ==========
function renderTimeline(tab = 'posts') {
    const timeline = document.getElementById('timeline');
    
    if (!timeline) return;
    
    let filteredTweets = [...tweets];
    
    // 탭별 필터링
    if (tab === 'videos') {
        filteredTweets = tweets.filter(tweet => 
            tweet.images && tweet.images.some(img => /\.(mp4|webm|mov)$/i.test(img))
        );
    } else if (tab === 'photos') {
        // 사진 탭은 그리드로 표시
        timeline.innerHTML = renderPhotoGrid();
        
        // 사진 클릭 이벤트
        document.querySelectorAll('.photo-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const tweetId = item.dataset.tweetId;
                const tweet = tweets.find(t => t.id === tweetId);
                if (tweet) {
                    showTweetDetail(tweet);
                }
            });
        });
        return;
    } else if (tab === 'highlights') {
        // 하이라이트는 좋아요 많은 순
        filteredTweets = tweets.filter(tweet => tweet.likes > 50);
    }
    
    // 날짜순 정렬 (최신순)
    filteredTweets.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = filteredTweets.map(renderTweet).join('');
    
    // 트윗 클릭 이벤트
    document.querySelectorAll('.tweet').forEach(tweetEl => {
        tweetEl.addEventListener('click', () => {
            const tweetId = tweetEl.dataset.tweetId;
            const tweet = tweets.find(t => t.id === tweetId);
            if (tweet) {
                showTweetDetail(tweet);
            }
        });
    });
}

// ========== 트윗 상세 표시 ==========
function showTweetDetail(tweet) {
    const detailContent = document.getElementById('tweet-detail-content');
    detailContent.innerHTML = renderTweetDetail(tweet);
    showPage('tweet-detail-page');
}

const backBtn = document.querySelector(
  "#tweet-detail-page .detail-header-icon.back"
);

backBtn.addEventListener("click", () => {
  document.getElementById("tweet-detail-page")
    .classList.remove("active");

  document.getElementById("profile-page")
    .classList.add("active");
});

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 초기 타임라인 렌더링
    renderTimeline('posts');
    
    // 탭 전환 이벤트
    document.querySelectorAll('.tabs span').forEach(tab => {
        tab.addEventListener('click', () => {
            // 활성 탭 변경
            document.querySelectorAll('.tabs span').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 타임라인 렌더링
            const tabName = tab.dataset.tab;
            renderTimeline(tabName);
        });
    });
    
    // 뒤로가기 버튼 (상세 페이지)
    document.getElementById('detail-back')?.addEventListener('click', () => {
        showPage('profile-page');
    });
    
    // 트윗 작성 버튼
    document.getElementById('compose-btn')?.addEventListener('click', () => {
        showPage('compose-page');
        document.getElementById('compose-textarea').focus();
    });
    
    // 작성 닫기 버튼
    document.getElementById('compose-close')?.addEventListener('click', () => {
        showPage('profile-page');
        document.getElementById('compose-textarea').value = '';
    });
    
    // 작성 게시 버튼 활성화
    const textarea = document.getElementById('compose-textarea');
    const postBtn = document.getElementById('compose-post-btn');
    
    if (textarea && postBtn) {
        textarea.addEventListener('input', () => {
            if (textarea.value.trim().length > 0) {
                postBtn.classList.add('active');
            } else {
                postBtn.classList.remove('active');
            }
        });
        
        postBtn.addEventListener('click', () => {
            if (textarea.value.trim().length > 0) {
                alert('트윗 게시 기능은 데모입니다!');
                showPage('profile-page');
                textarea.value = '';
                postBtn.classList.remove('active');
            }
        });
    }
});

// Export
export { renderTimeline, formatDate, formatNumber };

