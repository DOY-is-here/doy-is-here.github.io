// 메인 앱 파일
import { posts, getPostCount, getTaggedPosts, getStories, getPostsByTab } from './posts.js';
import { renderGrid, renderTaggedGrid, renderStoryGrid, renderRepostGrid, initGridVideoThumbnails, initStoryGridVideos } from './insta-grid.js';
import { showStoryGroup, renderStoryViewer, initStoryViewer, nextStory, previousStory } from './insta-story.js';
import { renderPostDetail, initPostSlider } from './insta-post.js';
import { createProfileHTML } from './insta-profile.js';
import { initTabs, initSwipe, getCurrentTab, setCurrentTab } from './insta-tabs.js';
import { initBidirectionalScroll } from './insta-navigation.js';

let root;
let savedScrollPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
    root = document.getElementById("insta-root");
    showProfile();
});

window.showProfile = function(initialTab = 'grid', restoreScroll = false) {
    setCurrentTab(initialTab);
    
    root.innerHTML = `
        ${createProfileHTML(initialTab, getPostCount)}
        
        <div class="tabs-container" id="tabs-container">
            <div class="tab-content ${initialTab === 'grid' ? 'active' : ''}" data-content="grid">
                ${renderGrid(posts)}
            </div>
            <div class="tab-content ${initialTab === 'tagged' ? 'active' : ''}" data-content="tagged">
                ${renderTaggedGrid(getTaggedPosts)}
            </div>
            <div class="tab-content ${initialTab === 'story' ? 'active' : ''}" data-content="story">
                ${renderStoryGrid(getStories)}
            </div>
            <div class="tab-content ${initialTab === 'repost' ? 'active' : ''}" data-content="repost">
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

window.showStoryGroup = function(date) {
    const stories = getStories();
    savedScrollPosition = window.scrollY || window.pageYOffset;
    root.innerHTML = `<div class="story-viewer">${showStoryGroup(date, stories)}</div>`;
    initStoryViewer();
};

window.nextStory = nextStory;
window.previousStory = previousStory;

window.showPost = function(postId, initialSlide = 0) {
    const savedTab = getCurrentTab();
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