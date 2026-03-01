// 타임라인 렌더링
import { tweets, getTweetsByTab } from './twitter-data.js';
import { formatDate, highlightHashtags, escapeHtml } from './twitter-utils.js';
import { renderMedia, loadVideoDurations, setupVideoAutoplay, initPhotoGridVideos } from './twitter-media.js';
import { showTweetDetail } from './twitter-detail.js';

// 트윗 카드 렌더링
export function renderTweet(tweet) {
    const escapedText = escapeHtml(tweet.text);
    const highlightedText = highlightHashtags(escapedText);
    
    return `
        <article class="tweet" data-tweet-id="${tweet.id}">
            <div class="tweet-avatar"></div>
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

// 타임라인 렌더링
export function renderTimeline(tab, scrollPositions, currentTab) {
    const timeline = document.getElementById('timeline');
    const filteredTweets = getTweetsByTab(tab);
    
    if (tab === 'photos') {
        // 사진 그리드
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
                                <video src="${item.imageUrl}" 
                                       preload="metadata" 
                                       muted 
                                       playsinline 
                                       class="grid-video"
                                       style="will-change: auto;"></video>
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
        
        requestAnimationFrame(() => {
            loadVideoDurations();
            initPhotoGridVideos();
        });
        
        // 사진 그리드 클릭 이벤트
        document.querySelectorAll('.photo-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const tweetId = item.dataset.tweetId;
                const tweet = tweets.find(t => t.id === tweetId);
                if (tweet) {
                    showTweetDetail(tweet, scrollPositions, currentTab);
                }
            });
        });
        
        return;
    }
    
    // 날짜순 정렬 (최신순)
    filteredTweets.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = filteredTweets.map(renderTweet).join('');
    
    // 동영상 처리
    requestAnimationFrame(() => {
        loadVideoDurations();
        setupVideoAutoplay();
    });
    
    // 스크롤 초기화
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        profilePage.scrollTop = 0;
        requestAnimationFrame(() => {
            profilePage.scrollTop = 0;
            setTimeout(() => profilePage.scrollTop = 0, 10);
        });
    }
    
    // 트윗 클릭 이벤트
    document.querySelectorAll('.tweet').forEach(tweetEl => {
        tweetEl.addEventListener('click', () => {
            const tweetId = tweetEl.dataset.tweetId;
            const tweet = tweets.find(t => t.id === tweetId);
            if (tweet) {
                showTweetDetail(tweet, scrollPositions, currentTab);
            }
        });
    });
}

// 탭 이벤트 초기화
export function initTabs(scrollPositions, setCurrentTab) {
    document.querySelectorAll('.tabs span').forEach(tab => {
        tab.addEventListener('click', () => {
            // 활성 탭 변경
            document.querySelectorAll('.tabs span').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 스크롤 초기화
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                profilePage.scrollTop = 0;
            }
            
            // 타임라인 렌더링
            const tabName = tab.dataset.tab;
            setCurrentTab(tabName);
            renderTimeline(tabName, scrollPositions, tabName);
        });
    });
}
