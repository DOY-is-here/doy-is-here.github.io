// 메인 앱 파일
import { posts, getPostCount, getTaggedPosts, getStories, getPostById } from './posts.js';
import { renderGrid, renderTaggedGrid, renderStoryGrid, renderRepostGrid, initGridVideoThumbnails, initStoryGridVideos } from './insta-grid.js';
import { showStoryGroup, renderStoryViewer, initStoryViewer, nextStory, previousStory } from './insta-story.js';
import { renderPostDetail, initPostSlider, initInfiniteScroll } from './insta-post.js';

let currentTab = 'grid'; 
let touchStartX = 0;
let touchEndX = 0;
let root;
let savedScrollPosition = 0; // 스크롤 위치 저장

document.addEventListener("DOMContentLoaded", () => {
    root = document.getElementById("insta-root");
    showProfile(); // 초기 로드
});

// showProfile을 완전한 전역 함수로
window.showProfile = function(initialTab = 'grid', restoreScroll = false) {
    currentTab = initialTab; // 전달받은 탭으로 설정
    
    root.innerHTML = `
        <!-- 헤더 -->
        <div class="insta-header">
            <div class="header-back"></div>
            <div class="header-title">doy.is.here</div>
            <div class="header-icons">
                <div class="header-icon bell"></div>
                <div class="header-icon dots"></div>
            </div>
        </div>
        
        <!-- 프로필 헤더 -->
        <div class="profile-header">
            <div class="profile-avatar">
                <div class="profile-avatar-inner"></div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-number">${getPostCount()}</div>
                    <div class="stat-label">게시물</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">8.8만</div>
                    <div class="stat-label">팔로워</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">1</div>
                    <div class="stat-label">팔로잉</div>
                </div>
            </div>
        </div>
        
        <!-- 프로필 정보 -->
        <div class="profile-info">
            <div class="profile-username">@nomad.is.here</div>
            <div class="profile-followers">
                <div class="follower-avatars">
                    <div class="follower-avatar"></div>
                    <div class="follower-avatar"></div>
                </div>
            </div>
        </div>
        
        <!-- 프로필 버튼 -->
        <div class="profile-actions">
            <button class="profile-btn">
                팔로잉
                <div class="icon-down"></div>
            </button>
            <button class="profile-btn">
                메시지
            </button>
            <button class="profile-btn small">
                <div class="icon-follow"></div>
            </button>
        </div>

        <!-- 탭 메뉴 -->
        <div class="profile-tabs" id="profile-tabs">
            <div class="tab-item ${currentTab === 'grid' ? 'active' : ''}" data-tab="grid">
                <div class="tab-icon grid"></div>
            </div>
            <div class="tab-item ${currentTab === 'tagged' ? 'active' : ''}" data-tab="tagged">
                <div class="tab-icon tagged"></div>
            </div>
            <div class="tab-item ${currentTab === 'story' ? 'active' : ''}" data-tab="story">
                <div class="tab-icon story"></div>
            </div>
            <div class="tab-item ${currentTab === 'repost' ? 'active' : ''}" data-tab="repost">
                <div class="tab-icon repost"></div>
            </div>
        </div>
        
        <!-- 탭 컨텐츠 컨테이너 -->
        <div class="tabs-container" id="tabs-container">
            <div class="tab-content ${currentTab === 'grid' ? 'active' : ''}" data-content="grid">
                ${renderGrid(posts)}
            </div>
            <div class="tab-content ${currentTab === 'tagged' ? 'active' : ''}" data-content="tagged">
                ${renderTaggedGrid(getTaggedPosts)}
            </div>
            <div class="tab-content ${currentTab === 'story' ? 'active' : ''}" data-content="story">
                ${renderStoryGrid(getStories)}
            </div>
            <div class="tab-content ${currentTab === 'repost' ? 'active' : ''}" data-content="repost">
                ${renderRepostGrid(posts, getTaggedPosts)}
            </div>                
        </div>
    `;
    
    initTabs();
    initSwipe();
    
    // 스크롤 위치 복원
    if (restoreScroll) {
        setTimeout(() => {
            window.scrollTo(0, savedScrollPosition);
        }, 0);
    }
    
    // 그리드 비디오 썸네일 초기화 (DOM 렌더링 후)
    requestAnimationFrame(() => {
        setTimeout(() => {
            initGridVideoThumbnails();
            initStoryGridVideos();
        }, 150);
    });
};

// 전역 함수로 선언
function showProfile(initialTab = 'grid') {
    window.showProfile(initialTab);
}

// 탭 클릭 이벤트
function initTabs() {
    const tabs = document.querySelectorAll(".tab-item");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            currentTab = tab.dataset.tab; // 현재 탭 업데이트
            document
                .querySelector(`.tab-content[data-content="${tab.dataset.tab}"]`)
                .classList.add("active");
            
            // 탭 전환 후 비디오 썸네일 초기화
            setTimeout(() => {
                initGridVideoThumbnails();
                initStoryGridVideos();
            }, 100);
        });
    });
}

// 탭 전환
function switchTab(tabName) {
    currentTab = tabName;
    
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.content === tabName) {
            content.classList.add('active');
        }
    });
    
    // 탭 전환 후 비디오 썸네일 초기화
    setTimeout(() => {
        initGridVideoThumbnails();
        initStoryGridVideos();
    }, 100);
}

// 스와이프 기능
function initSwipe() {
    const container = document.getElementById('tabs-container');
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    const tabs = ['grid', 'tagged', 'story', 'repost'];
    const currentIndex = tabs.indexOf(currentTab);
    
    if (diff > 0 && currentIndex < tabs.length - 1) {
        switchTab(tabs[currentIndex + 1]);
    } else if (diff < 0 && currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
    }
}

// 스토리 그룹 보기
window.showStoryGroup = function(date) {
    const stories = getStories();
    
    root.innerHTML = `
        <div class="story-viewer">
            ${showStoryGroup(date, stories)}
        </div>
    `;
    
    initStoryViewer();
};

// 스토리 네비게이션 (전역 함수)
window.nextStory = function() {
    nextStory();
};

window.previousStory = function() {
    previousStory();
};

// 포스트 상세 페이지
window.showPost = function(postId) {
    const post = getPostById(postId);
    if (!post) return;
    
    const savedTab = currentTab; // 현재 탭 저장
    savedScrollPosition = window.scrollY || window.pageYOffset; // 스크롤 위치 저장
    
    root.innerHTML = `
        <div class="post-detail-wrapper">
            ${renderPostDetail(post, savedTab)}
        </div>
    `;
    
    initPostSlider(post);
    initInfiniteScroll(postId, posts, renderPostDetail, initPostSlider);
};