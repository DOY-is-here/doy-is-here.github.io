import { tweets, photoTweets, getTweetsByTab } from './tweets.js';

// 스크롤 위치 저장
let scrollPositions = {
    posts: 0,
    highlights: 0,
    photos: 0
};

let currentTab = 'posts';

// ========== 유틸리티 함수 ==========

// 날짜 포맷팅 (날짜만, 시간 제거)
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}.${month}.${day}.`;
}

// 상세 날짜 포맷팅 (날짜만)
function formatDetailDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}.${month}.${day}.`;
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
            return `<div class="media-item">
                <video src="${img}" playsinline preload="metadata"></video>
                <div class="video-overlay">
                    <svg class="play-icon" viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.9)"/>
                        <path d="M9.5 8.5l7 3.5-7 3.5z" fill="#000"/>
                    </svg>
                </div>
            </div>`;
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

// 타래 트윗 렌더링
function renderThreadTweet(tweet, isExpanded = false) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    return `
        <article class="tweet thread-tweet" data-tweet-id="${tweet.id}">
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
            </div>
        </article>
    `;
}

// 트윗 카드 렌더링 (타임라인용 - 타래도 개별로)
function renderTweet(tweet) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    // 타래인 경우 - 개별 트윗으로 펼침
    if (tweet.isThreadGroup) {
        return tweet.threadTweets.map((t) => {
            const escapedThreadText = escapeHtml(t.text);
            const highlightedThreadText = highlightHashtags(escapedThreadText);
            
            return `
        <article class="tweet" data-tweet-id="${t.id}" data-is-thread="true" data-thread-key="${tweet.threadKey}">
            <div class="tweet-avatar">
            </div>
            <div class="tweet-content">
                <div class="tweet-header">
                    <span class="tweet-author">${t.author.name}</span>
                    ${t.author.verified ? `
                        <svg viewBox="0 0 22 22" width="18" height="18" class="verified-badge">
                            <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg>
                    ` : ''}
                    <span class="tweet-username">@${t.author.username}</span>
                    <span class="tweet-date"> · ${formatDate(t.date)}</span>
                </div>
                <div class="tweet-text">${highlightedThreadText}</div>
                ${renderMedia(t.images)}
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
        }).join('');
    }
    
    // 일반 트윗
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

// 트윗 상세 렌더링 (타래 지원)
function renderTweetDetail(tweet) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    // 타래인 경우 - 전체 타래 표시
    if (tweet.isThread || tweet.threadTweets) {
        let threadTweets = [];
        
        // threadTweets가 있으면 (그룹화된 타래)
        if (tweet.threadTweets) {
            threadTweets = tweet.threadTweets;
        } else {
            // 개별 타래 트윗인 경우 - 같은 날짜의 타래 찾기
            const threadDate = tweet.rawDate;
            const allThreadTweets = tweets.flatMap(t => {
                if (t.isThreadGroup && t.rawDate === threadDate) {
                    return t.threadTweets;
                }
                return [];
            });
            threadTweets = allThreadTweets;
        }
        
        // 타래 전체를 렌더링
        return threadTweets.map((t, index) => {
            const escapedThreadText = escapeHtml(t.text);
            const highlightedThreadText = highlightHashtags(escapedThreadText);
            const isLast = index === threadTweets.length - 1;
            
            return `
        <div class="detail-thread-item ${isLast ? 'detail-thread-last' : ''}">
            <div class="detail-user">
                <div class="detail-user-avatar">
                    ${!isLast ? '<div class="detail-thread-line"></div>' : ''}
                </div>
                <div class="detail-user-info">
                <div class="detail-user-name-row">
                    <span class="detail-user-name">${t.author.name}</span>
                        ${t.author.verified ? `
                            <svg viewBox="0 0 22 22" width="18" height="18" class="verified-badge">
                                <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                            </svg> ` : ''}
                    </div>
                    <div class="detail-user-handle">@${t.author.username}</div>
                </div>
            </div>
            <div class="detail-text">${highlightedThreadText}</div>
            ${t.images && t.images.length > 0 ? `
                <div class="detail-media">
                    ${t.images.map(img => `<img src="${img}" alt="트윗 이미지">`).join('')}
                </div>
            ` : ''}
            ${isLast ? `<div class="detail-time">${formatDetailDate(t.date)}</div>` : ''}
        </div>
            `;
        }).join('') + `
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
    
    // 일반 트윗
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
function renderPhotoGrid(filteredTweets) {
    const photosOnly = filteredTweets.filter(tweet => tweet.images && tweet.images.length > 0);
    
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
    
    currentTab = tab;
    
    let filteredTweets = [];
    
    // 탭별 필터링
    if (tab === 'posts') {
        // 게시물 탭: group + photo 모두
        filteredTweets = [...tweets];
    } else if (tab === 'highlights') {
        // 하이라이트 탭: photo만
        filteredTweets = [...photoTweets];
    } else if (tab === 'photos') {
        // 미디어 탭: 사진이 있는 것만 (그리드로 표시)
        filteredTweets = tweets.filter(tweet => tweet.images && tweet.images.length > 0);
        
        timeline.innerHTML = renderPhotoGrid(filteredTweets);
        
        // 사진 클릭 이벤트
        document.querySelectorAll('.photo-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const tweetId = item.dataset.tweetId;
                
                // 타래 확인
                const threadGroup = tweets.find(t => {
                    if (t.isThreadGroup) {
                        return t.threadTweets.some(tt => tt.id === tweetId);
                    }
                    return false;
                });
                
                if (threadGroup) {
                    showTweetDetail(threadGroup);
                } else {
                    const tweet = tweets.find(t => t.id === tweetId);
                    if (tweet) {
                        showTweetDetail(tweet);
                    }
                }
            });
        });
        return;
    }
    
    // 날짜순 정렬 (최신순)
    filteredTweets.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = filteredTweets.map(renderTweet).join('');
    
    // 탭 전환 시 스크롤을 맨 위로
    setTimeout(() => {
        const profilePage = document.getElementById('profile-page');
        if (profilePage) {
            profilePage.scrollTop = 0;
        }
    }, 0);
    
    // 트윗 클릭 이벤트
    document.querySelectorAll('.tweet').forEach(tweetEl => {
        tweetEl.addEventListener('click', () => {
            const tweetId = tweetEl.dataset.tweetId;
            const isThread = tweetEl.dataset.isThread === 'true';
            
            if (isThread) {
                // 타래 트윗인 경우 - threadKey로 전체 타래 찾기
                const threadKey = tweetEl.dataset.threadKey;
                const threadGroup = tweets.find(t => t.isThreadGroup && t.threadKey === threadKey);
                
                if (threadGroup) {
                    showTweetDetail(threadGroup);
                } else {
                    // 개별 트윗으로 표시
                    const tweet = tweets.flatMap(t => t.threadTweets || [t]).find(t => t.id === tweetId);
                    if (tweet) {
                        showTweetDetail(tweet);
                    }
                }
            } else {
                // 일반 트윗
                const tweet = tweets.find(t => t.id === tweetId);
                if (tweet) {
                    showTweetDetail(tweet);
                }
            }
        });
    });
}

// ========== 트윗 상세 표시 ==========
function showTweetDetail(tweet) {
    // 현재 스크롤 위치 저장
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        scrollPositions[currentTab] = profilePage.scrollTop;
    }
    
    const detailContent = document.getElementById('tweet-detail-content');
    detailContent.innerHTML = renderTweetDetail(tweet);
    showPage('tweet-detail-page');
}

const backBtn = document.querySelector(
  "#tweet-detail-page .detail-header-icon.back"
);

if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.getElementById("tweet-detail-page")
        .classList.remove("active");

      document.getElementById("profile-page")
        .classList.add("active");
      
      // 스크롤 위치 복원
      setTimeout(() => {
          const profilePage = document.getElementById('profile-page');
          if (profilePage && scrollPositions[currentTab] !== undefined) {
              profilePage.scrollTop = scrollPositions[currentTab];
          }
      }, 0);
    });
}

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
});

// Export
export { renderTimeline, formatDate };