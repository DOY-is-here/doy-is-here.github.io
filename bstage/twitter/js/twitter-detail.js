// 트윗 상세 페이지
import { formatDetailDate, highlightHashtags, escapeHtml } from './twitter-utils.js';

export function createDetailPage() {
    return `
        <div id="tweet-detail-page" class="page">
            <header class="detail-header">
                <span class="detail-header-icon back"></span> 
                <span class="detail-header-title">게시</span>
                <span class="detail-header-icon more"></span>
            </header>
            
            <main id="tweet-detail-content" class="tweet-detail"></main>
        </div>
    `;
}

export function renderTweetDetail(tweet) {
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
                        </svg>
                    ` : ''}
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

export function showTweetDetail(tweet, scrollPositions, currentTab) {
    // 현재 타임라인 스크롤 위치 저장
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        scrollPositions[currentTab] = profilePage.scrollTop;
    }
    
    // 상세 내용 렌더링
    const detailContent = document.getElementById('tweet-detail-content');
    detailContent.innerHTML = renderTweetDetail(tweet);
    
    // 페이지 전환
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('tweet-detail-page').classList.add('active');
    
    // 트윗 상세 페이지 스크롤 초기화
    const detailPage = document.getElementById('tweet-detail-page');
    if (detailPage) {
        detailPage.scrollTop = 0;
        
        requestAnimationFrame(() => {
            detailPage.scrollTop = 0;
            
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
    }
}

export function initDetailPageBackButton(scrollPositions, getCurrentTab) {
    const backBtn = document.querySelector("#tweet-detail-page .detail-header-icon.back");
    
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            // 페이지 전환
            document.getElementById("tweet-detail-page").classList.remove("active");
            document.getElementById("profile-page").classList.add("active");
            
            // 저장된 스크롤 위치 복원
            const profilePage = document.getElementById('profile-page');
            const currentTab = getCurrentTab();
            const savedPosition = scrollPositions[currentTab];
            
            if (profilePage && savedPosition !== undefined) {
                profilePage.scrollTop = savedPosition;
                
                requestAnimationFrame(() => {
                    profilePage.scrollTop = savedPosition;
                    
                    setTimeout(() => {
                        profilePage.scrollTop = savedPosition;
                    }, 10);
                });
            }
        });
    }
}
