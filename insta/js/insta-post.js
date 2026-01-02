// 포스트 상세 렌더링 및 관리
import { isVideo, initVideoThumbnails } from './insta-utils.js';
import { getPostsByTab, posts, getTaggedPosts } from './insta-data.js';
import { getCurrentTab } from './insta-tabs.js';
import { saveScrollPosition, getSavedScrollPosition, showProfile } from './insta-profile.js';

// 포스트 상세 렌더링
export function renderPostDetail(post, savedTab = 'grid') {
    const isTaggedStyle = savedTab === 'tagged' || (savedTab === 'repost' && post.type === 'group');
    const tabClass = isTaggedStyle ? 'from-tagged' : '';
    
    const postHeaderHTML = isTaggedStyle ? `
        <div class="post-coauthor">
            <div class="coauthor-avatars">
                <div class="coauthor-avatar"></div>
                <div class="coauthor-avatar overlap"></div>
            </div>
            <div class="coauthor-info">
                <div class="coauthor-text">
                    <span class="username">nomad.is.here</span>님과 <span class="username">${post.username}</span>님
                </div>
                <div class="post-date">${post.displayDate}</div>
            </div>
            <div class="post-more">⋯</div>
        </div>
    ` : `
        <div class="post-header">
            <div class="post-avatar"></div>
            <div class="post-user-info">
                <div class="post-username">${post.username}</div>
                <div class="post-date">${post.displayDate}</div>
            </div>
            <div class="post-more">⋯</div>
        </div>
    `;
    
    return `
        <div class="post-detail ${tabClass}" data-post-id="${post.id}">
            ${postHeaderHTML}
            <div class="post-slider">
                <div class="slider-container" data-slider="${post.id}">
                    ${post.images.map(mediaUrl => {
                        if (isVideo(mediaUrl)) {
                            return `<div class="slider-item"><video src="${mediaUrl}" controls playsinline preload="metadata" class="post-video"></video></div>`;
                        } else {
                            return `<div class="slider-item"><img src="${mediaUrl}" alt="${post.caption}"></div>`;
                        }
                    }).join('')}
                </div>
                ${post.images.length > 1 ? `
                    <div class="slider-counter">1/${post.images.length}</div>
                    <div class="slider-dots">
                        ${post.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="post-actions">
                <div class="action-icon icon-heart"></div>
                <div class="action-icon icon-chat"></div>
                <div class="action-icon icon-loop"></div>
                <div class="action-icon icon-send"></div>
                <div class="action-icon action-right icon-bookmark"></div>
            </div>
            <div class="post-caption">
                <span class="caption-username">${post.username}</span>
                ${post.caption}
            </div>
        </div>
    `;
}

// 포스트 슬라이더 초기화
export function initPostSlider(post, initialSlide = 0) {
    initVideoThumbnailsForPost(post);
    if (post.images.length <= 1) return;
    
    const container = document.querySelector(`[data-slider="${post.id}"]`);
    if (!container) return;
    
    const counter = container.parentElement.querySelector('.slider-counter');
    const dots = container.parentElement.querySelectorAll('.dot');
    
    if (initialSlide > 0 && initialSlide < post.images.length) {
        setTimeout(() => {
            container.scrollLeft = container.offsetWidth * initialSlide;
            if (counter) counter.textContent = `${initialSlide + 1}/${post.images.length}`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === initialSlide));
        }, 0);
    }
    
    container.addEventListener('scroll', () => {
        const index = Math.round(container.scrollLeft / container.offsetWidth);
        if (counter) counter.textContent = `${index + 1}/${post.images.length}`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    });
}

// 포스트 비디오 썸네일 초기화
function initVideoThumbnailsForPost(post) {
    const videos = document.querySelectorAll(`[data-slider="${post.id}"] video`);
    videos.forEach(video => {
        video.addEventListener('loadedmetadata', function() {
            this.currentTime = 0.1;
        }, { once: true });
    });
}

// 포스트 상세 보기
export function showPost(postId, initialSlide = 0) {
    const savedTab = getCurrentTab();
    saveScrollPosition();
    
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
    
    const root = window.instaRoot;
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
}

// 양방향 스크롤 초기화
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
        
        // 위쪽 스크롤
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
        
        // 아래쪽 스크롤
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

// window에 함수 등록
window.showPost = showPost;
