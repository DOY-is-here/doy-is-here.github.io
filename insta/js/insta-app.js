// 메인 앱 파일
import { posts, getPostCount, getTaggedPosts, getStories, getPostById, getPostsByTab } from './posts.js';
import { renderGrid, renderTaggedGrid, renderStoryGrid, renderRepostGrid, initGridVideoThumbnails, initStoryGridVideos } from './insta-grid.js';
import { showStoryGroup, renderStoryViewer, initStoryViewer, nextStory, previousStory } from './insta-story.js';
import { renderPostDetail, initPostSlider } from './insta-post.js';

let currentTab = 'grid'; 
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let root;
let savedScrollPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
    root = document.getElementById("insta-root");
    showProfile();
});

window.showProfile = function(initialTab = 'grid', restoreScroll = false) {
    currentTab = initialTab;
    
    root.innerHTML = `
        <div class="insta-header">
            <div class="header-back"></div>
            <div class="header-title">doy.is.here</div>
            <div class="header-icons">
                <div class="header-icon bell"></div>
                <div class="header-icon dots"></div>
            </div>
        </div>
        
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
                    <div class="stat-number">9.16만</div>
                    <div class="stat-label">팔로워</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">1</div>
                    <div class="stat-label">팔로잉</div>
                </div>
            </div>
        </div>
        
        <div class="profile-info">
            <div class="profile-username">@nomad.is.here</div>
            <div class="profile-followers">
                <div class="follower-avatars">
                    <div class="follower-avatar"></div>
                    <div class="follower-avatar"></div>
                </div>

            </div>
        </div>
        
        <div class="profile-actions">
            <div class="profile-btn">
                팔로잉
                <div class="icon-down"></div>
            </div>
            <div class="profile-btn">
                메시지
            </div>
            <div class="profile-btn small">
                <div class="icon-follow"></div>
            </div>
        </div>

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
    
    if (restoreScroll) {
        setTimeout(() => window.scrollTo(0, savedScrollPosition), 0);
    }
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            initGridVideoThumbnails();
            initStoryGridVideos();
        }, 150);
    });
};

function initTabs() {
    const tabs = document.querySelectorAll(".tab-item");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab;
            document.querySelector(`.tab-content[data-content="${tab.dataset.tab}"]`).classList.add("active");
            
            // 스크롤 맨 위로 초기화
            window.scrollTo(0, 0);
            
            setTimeout(() => {
                initGridVideoThumbnails();
                initStoryGridVideos();
            }, 100);
        });
    });
    
    const tabsContainer = document.getElementById('tabs-container');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', function(e) {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem && gridItem.dataset.postId) {
                e.preventDefault();
                e.stopPropagation();
                window.showPost(gridItem.dataset.postId, parseInt(gridItem.dataset.imageIndex) || 0);
            }
        });
    }
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // 탭 UI 업데이트
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.content === tabName);
    });
    
    // 스크롤 맨 위로 초기화
    window.scrollTo(0, 0);
    
    // 비디오 썸네일 초기화
    setTimeout(() => {
        initGridVideoThumbnails();
        initStoryGridVideos();
    }, 100);
}

function initSwipe() {
    const container = document.getElementById('tabs-container');
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) < swipeThreshold || Math.abs(diffY) > Math.abs(diffX)) return;
    
    const tabs = ['grid', 'tagged', 'story', 'repost'];
    const currentIndex = tabs.indexOf(currentTab);
    if (diffX > 0 && currentIndex < tabs.length - 1) {
        switchTab(tabs[currentIndex + 1]);
    } else if (diffX < 0 && currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
    }
}

window.showStoryGroup = function(date) {
    const stories = getStories();
    savedScrollPosition = window.scrollY || window.pageYOffset;
    root.innerHTML = `<div class="story-viewer">${showStoryGroup(date, stories)}</div>`;
    initStoryViewer();
};

window.nextStory = nextStory;
window.previousStory = previousStory;

window.showPost = function(postId, initialSlide = 0) {
    const savedTab = currentTab;
    savedScrollPosition = window.scrollY || window.pageYOffset;
    
    let tabPosts = getPostsByTab(savedTab);
    
    // 리포스트 탭: photo + group 합쳐서 정렬
    if (savedTab === 'repost') {
        const gridPosts = [...posts];
        const taggedPosts = getTaggedPosts();
        tabPosts = [...taggedPosts, ...gridPosts];
        
        tabPosts.sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            if (a.type === 'group' && b.type !== 'group') return -1;
            if (a.type !== 'group' && b.type === 'group') return 1;
            return 0;
        });
        
        const uniquePosts = [];
        const seenIds = new Set();
        for (const p of tabPosts) {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                uniquePosts.push(p);
            }
        }
        tabPosts = uniquePosts;
    }
    
    const post = tabPosts.find(p => p.id === postId);
    if (!post) {
        console.error('게시물을 찾을 수 없습니다:', postId);
        return;
    }
    
    const currentIndex = tabPosts.findIndex(p => p.id === postId);
    const startIndex = Math.max(0, currentIndex - 3);
    const endIndex = Math.min(tabPosts.length, currentIndex + 3);
    
    let initialHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
        initialHTML += renderPostDetail(tabPosts[i], savedTab);
    }
    
    root.innerHTML = `
        <div class="post-topbar-fixed">
            <div class="left-btn header-back" onclick="showProfile('${savedTab}', true)"></div>
            <div class="post-topbar-title">게시물</div>
            <div class="post-topbar-subtitle">${post.username}</div>
            <div class="right-btn"></div>
        </div>
        <div class="post-detail-wrapper">${initialHTML}</div>
    `;
    
    for (let i = startIndex; i < endIndex; i++) {
        initPostSlider(tabPosts[i], i === currentIndex ? initialSlide : 0);
    }
    
    setTimeout(() => {
        const clickedPost = document.querySelector(`[data-post-id="${postId}"]`);
        if (clickedPost) clickedPost.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 0);
    
    initBidirectionalScroll(currentIndex, tabPosts, savedTab);
};

function initBidirectionalScroll(currentIndex, posts, savedTab) {
    const wrapper = document.querySelector('.post-detail-wrapper');
    if (!wrapper) return;
    
    let isLoading = false;
    let topIndex = Math.max(0, currentIndex - 3);
    let bottomIndex = Math.min(posts.length, currentIndex + 3);
    
    wrapper.addEventListener('scroll', () => {
        const scrollTop = wrapper.scrollTop;
        const scrollHeight = wrapper.scrollHeight;
        const clientHeight = wrapper.clientHeight;
        
        if (scrollTop < 200 && !isLoading && topIndex > 0) {
            isLoading = true;
            topIndex--;
            const prevPost = posts[topIndex];
            const oldScrollHeight = wrapper.scrollHeight;
            
            wrapper.insertAdjacentHTML('afterbegin', renderPostDetail(prevPost, savedTab));
            initPostSlider(prevPost);
            
            setTimeout(() => {
                wrapper.scrollTop = scrollTop + (wrapper.scrollHeight - oldScrollHeight);
                isLoading = false;
            }, 50);
        }
        
        if (scrollTop + clientHeight >= scrollHeight - 200 && !isLoading && bottomIndex < posts.length) {
            isLoading = true;
            const nextPost = posts[bottomIndex];
            bottomIndex++;
            
            wrapper.insertAdjacentHTML('beforeend', renderPostDetail(nextPost, savedTab));
            initPostSlider(nextPost);
            
            setTimeout(() => { isLoading = false; }, 500);
        }
    });
}