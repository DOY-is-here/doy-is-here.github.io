import { tweets, photoTweets, getTweetsByTab } from './tweets.js';

// 각 탭별 스크롤 위치 저장 (profile-page 내부)
let scrollPositions = {
    posts: 0,
    highlights: 0,
    photos: 0
};

let currentTab = 'posts';

// ========== 유틸리티 함수 ==========

// 시간 포맷팅 (초 -> 분:초)
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 트윗 개수 계산
function getTotalTweetCount() {
    return tweets.length;
}

// 트윗 개수 업데이트
function updateTweetCount() {
    const tweetCountEl = document.getElementById('tweet-count');
    if (tweetCountEl) {
        const count = getTotalTweetCount();
        tweetCountEl.textContent = `게시물 ${count.toLocaleString()}개`;
    }
}

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

// 미디어 그리드 렌더링 (타임라인용)
function renderMedia(images) {
    if (!images || images.length === 0) return '';
    
    const count = images.length;
    const countClass = `count-${Math.min(count, 4)}`;
    
    const mediaItems = images.slice(0, 4).map((img, index) => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(img);
        
        if (isVideo) {
            return `<div class="media-item video-thumbnail" data-video-src="${img}">
                <img src="${img}" 
                     alt="동영상 썸네일" 
                     loading="lazy"
                     style="width: 100%; height: 100%; object-fit: cover; display: block;">
                <div class="video-play-icon"></div>
                <div class="video-duration-overlay" data-video-url="${img}">0:00</div>
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

// 동영상 길이 로드 및 표시
function loadVideoDurations() {
    const overlays = document.querySelectorAll('.video-duration-overlay[data-video-url]');
    
    overlays.forEach((overlay, index) => {
        const videoUrl = overlay.dataset.videoUrl;
        
        // 이미 로드된 경우 건너뛰기
        if (overlay.dataset.loaded === 'true') return;
        
        overlay.dataset.loaded = 'loading';
        
        // 각 비디오를 순차적으로 로드 (50ms 간격)
        setTimeout(() => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.crossOrigin = 'anonymous';
            
            video.addEventListener('loadedmetadata', function() {
                const duration = this.duration;
                if (duration && !isNaN(duration)) {
                    overlay.textContent = formatDuration(duration);
                    overlay.dataset.loaded = 'true';
                }
            }, { once: true });
            
            video.addEventListener('error', function() {
                console.warn('비디오 메타데이터 로드 실패:', videoUrl);
                overlay.textContent = '0:00';
                overlay.dataset.loaded = 'error';
            }, { once: true });
            
            video.src = videoUrl;
        }, index * 50);
    });
}

// 트윗 카드 렌더링 (타임라인용)
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
                ${tweet.images.map(img => {
                    const isVideo = /\.(mp4|webm|mov)$/i.test(img);
                    if (isVideo) {
                        return `<video src="${img}" playsinline muted loop preload="auto" controls onloadeddata="this.currentTime=0.1"></video>`;
                    } else {
                        return `<img src="${img}" alt="트윗 이미지">`;
                    }
                }).join('')}
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

// 페이지 전환
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// ========== 타임라인 렌더링 ==========
function renderTimeline(tab) {
    currentTab = tab;
    const timeline = document.getElementById('timeline');
    const filteredTweets = getTweetsByTab(tab);
    
    if (tab === 'photos') {
        // 사진 그리드로 변환
        const photoGridItems = filteredTweets.flatMap(tweet => {
            return (tweet.images || []).map((img, index) => ({
                tweetId: tweet.id,
                imageUrl: img,
                imageIndex: index
            }));
        });
        
        timeline.innerHTML = `
            <div class="photo-grid">
                ${photoGridItems.map(item => {
                    const isVideo = /\.(mp4|webm|mov)$/i.test(item.imageUrl);
                    if (isVideo) {
                        return `
                            <div class="photo-grid-item video-thumbnail" data-tweet-id="${item.tweetId}" data-image-index="${item.imageIndex}">
                                <img src="${item.imageUrl}" alt="동영상 썸네일" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                                <div class="video-play-icon"></div>
                                <div class="video-duration-overlay" data-video-url="${item.imageUrl}">0:00</div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="photo-grid-item" data-tweet-id="${item.tweetId}" data-image-index="${item.imageIndex}">
                                <img src="${item.imageUrl}" alt="트윗 이미지" loading="lazy">
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
        
        // DOM 렌더링 후 동영상 길이 로드
        requestAnimationFrame(() => {
            loadVideoDurations();
        });
        
        // 사진 그리드 클릭 이벤트
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
    }
    
    // 날짜순 정렬 (최신순)
    filteredTweets.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = filteredTweets.map(renderTweet).join('');
    
    // 동영상 길이 로드
    requestAnimationFrame(() => {
        loadVideoDurations();
    });
    
    // 탭 전환 시 profile-page 스크롤 강제 초기화
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        // 즉시 초기화
        profilePage.scrollTop = 0;
        
        // 한 프레임 후
        requestAnimationFrame(() => {
            profilePage.scrollTop = 0;
            
            // 한 프레임 더
            requestAnimationFrame(() => {
                profilePage.scrollTop = 0;
                
                // 완전히 확실하게
                setTimeout(() => {
                    profilePage.scrollTop = 0;
                }, 10);
            });
        });
    }
    
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
    // 현재 타임라인 스크롤 위치 저장 (profile-page의 스크롤)
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        scrollPositions[currentTab] = profilePage.scrollTop;
    }
    
    // 상세 내용 렌더링
    const detailContent = document.getElementById('tweet-detail-content');
    detailContent.innerHTML = renderTweetDetail(tweet);
    
    // 페이지 전환
    showPage('tweet-detail-page');
    
    // 트윗 상세 페이지(tweet-detail-page)는 항상 맨 위에서 시작
    const detailPage = document.getElementById('tweet-detail-page');
    if (detailPage) {
        // 즉시 초기화
        detailPage.scrollTop = 0;
        
        // 한 프레임 후
        requestAnimationFrame(() => {
            detailPage.scrollTop = 0;
            
            // 한 프레임 더
            requestAnimationFrame(() => {
                detailPage.scrollTop = 0;
                
                // 완전히 확실하게
                setTimeout(() => {
                    detailPage.scrollTop = 0;
                    
                    // 비디오 첫 프레임 표시
                    document.querySelectorAll('#tweet-detail-page video').forEach(video => {
                        video.addEventListener('loadedmetadata', function() {
                            this.currentTime = 0.1;
                        });
                        
                        video.addEventListener('click', function(e) {
                            e.stopPropagation();
                            if (this.paused) {
                                this.play();
                            } else {
                                this.pause();
                            }
                        });
                    });
                }, 10);
            });
        });
    }
}

const backBtn = document.querySelector(
  "#tweet-detail-page .detail-header-icon.back"
);

if (backBtn) {
    backBtn.addEventListener("click", () => {
      // 페이지 전환
      document.getElementById("tweet-detail-page").classList.remove("active");
      document.getElementById("profile-page").classList.add("active");
      
      // profile-page의 저장된 스크롤 위치 복원
      const profilePage = document.getElementById('profile-page');
      const savedPosition = scrollPositions[currentTab];
      if (profilePage && savedPosition !== undefined) {
          // 즉시 복원
          profilePage.scrollTop = savedPosition;
          
          // 한 프레임 후
          requestAnimationFrame(() => {
              profilePage.scrollTop = savedPosition;
              
              // 한 프레임 더
              requestAnimationFrame(() => {
                  profilePage.scrollTop = savedPosition;
                  
                  // 완전히 확실하게
                  setTimeout(() => {
                      profilePage.scrollTop = savedPosition;
                  }, 10);
              });
          });
      }
    });
}

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 트윗 개수 업데이트
    updateTweetCount();
    
    // 초기 타임라인 렌더링
    renderTimeline('posts');
    
    // 탭 전환 이벤트
    document.querySelectorAll('.tabs span').forEach(tab => {
        tab.addEventListener('click', () => {
            // 활성 탭 변경
            document.querySelectorAll('.tabs span').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 즉시 스크롤 초기화
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                profilePage.scrollTop = 0;
            }
            
            // 타임라인 렌더링 (스크롤 초기화는 renderTimeline에서도 처리)
            const tabName = tab.dataset.tab;
            renderTimeline(tabName);
        });
    });
});

// Export
export { renderTimeline, formatDate };