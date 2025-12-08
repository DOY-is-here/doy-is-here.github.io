import { posts, getPostCount, getReels, getPhotos, getPostById } from './posts.js';

let currentTab = 'grid'; // 'grid', 'reels', 'tagged'
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("insta-root");
    showProfile();
    
    function showProfile() {
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
                <div class="tab-item active" data-tab="grid">
                    <div class="tab-icon grid"></div>
                </div>
                <div class="tab-item" data-tab="reels">
                    <div class="tab-icon reels"></div>
                </div>
                <div class="tab-item" data-tab="tagged">
                    <div class="tab-icon tagged"></div>
                </div>
            </div>
            
            <!-- 탭 컨텐츠 컨테이너 -->
            <div class="tabs-container" id="tabs-container">
                <div class="tab-content active" data-content="grid">
                    ${renderGrid(posts)}
                </div>
                <div class="tab-content" data-content="reels">
                    ${renderReelsGrid(getReels())}
                </div>
                <div class="tab-content" data-content="tagged">
                    ${renderGrid(getPhotos())}
                </div>
            </div>
        `;
        
        initTabs();
        initSwipe();
    }
    
    // 그리드 렌더링 (3:4 비율)
    function renderGrid(postsArray) {
        return `
            <div class="posts-grid grid-34">
                ${postsArray.map(post => `
                    <div class="grid-item" onclick="showPost('${post.id}')" style="background-image: url('${post.images[0]}')">
                        ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                        ${post.type === 'reel' ? '<div class="reel-icon"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 릴스 그리드 렌더링 (9:16 비율)
    function renderReelsGrid(reelsArray) {
        return `
            <div class="posts-grid grid-916">
                ${reelsArray.map(post => `
                    <div class="grid-item reel-item" onclick="showPost('${post.id}')" style="background-image: url('${post.images[0]}')">
                        <div class="reel-icon"></div>
                        <div class="reel-views"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 탭 클릭 이벤트
    function initTabs() {
        const tabs = document.querySelectorAll('.tab-item');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
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
        
        const tabs = ['grid', 'reels', 'tagged'];
        const currentIndex = tabs.indexOf(currentTab);
        
        if (diff > 0 && currentIndex < tabs.length - 1) {
            // 왼쪽 스와이프 (다음 탭)
            switchTab(tabs[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // 오른쪽 스와이프 (이전 탭)
            switchTab(tabs[currentIndex - 1]);
        }
    }
    
    // 포스트 상세 페이지
    window.showPost = function(postId) {
        const post = getPostById(postId);
        if (!post) return;
        
        root.innerHTML = `
            <div class="post-detail-wrapper">
                ${renderPostDetail(post)}
            </div>
        `;
        
        initPostSlider(post);
        initInfiniteScroll(postId);
    };
    
    // 포스트 상세 렌더링
    function renderPostDetail(post) {
        return `
            <div class="post-detail" data-post-id="${post.id}">
                <!-- 상단바 -->
                <div class="post-topbar">
                    <div class="left-btn header-back" onclick="location.reload()"></div>
                    <div class="post-topbar-title">게시물</div>
                    <div class="post-topbar-subtitle">${post.username}</div>
                    <div class="right-btn"></div>
                </div>

                <!-- 포스트 헤더 -->
                <div class="post-header">
                    <div class="post-avatar"></div>
                    <div class="post-user-info">
                        <div class="post-username">${post.username}</div>
                        <div class="post-date">${post.displayDate}</div>
                    </div>
                    <div class="post-more">⋯</div>
                </div>

                <!-- 이미지 슬라이더 -->
                <div class="post-slider">
                    <div class="slider-container" data-slider="${post.id}">
                        ${post.images.map(img => `
                            <div class="slider-item" style="background-image: url('${img}')"></div>
                        `).join('')}
                    </div>
                    ${post.images.length > 1 ? `
                        <div class="slider-counter">1/${post.images.length}</div>
                        <div class="slider-dots">
                            ${post.images.map((_, i) => `
                                <div class="dot ${i === 0 ? 'active' : ''}"></div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- 액션 버튼 -->
                <div class="post-actions">
                    <div class="action-icon icon-heart"></div>
                    <div class="action-count"></div>
                    <div class="action-icon icon-chat"></div>
                    <div class="action-count"></div>
                    <div class="action-icon icon-loop"></div>
                    <div class="action-icon icon-send"></div>
                    <div class="action-icon action-right icon-bookmark"></div>
                </div>

                <!-- 캡션 -->
                <div class="post-caption">
                    <span class="caption-username">${post.username}</span>
                    ${post.caption}
                </div>
            </div>
        `;
    }
    
    // 이미지 슬라이더
    function initPostSlider(post) {
        if (post.images.length <= 1) return;
        
        const container = document.querySelector(`[data-slider="${post.id}"]`);
        const counter = container.parentElement.querySelector('.slider-counter');
        const dots = container.parentElement.querySelectorAll('.dot');
        
        container.addEventListener('scroll', () => {
            const index = Math.round(container.scrollLeft / container.offsetWidth);
            if (counter) counter.textContent = `${index + 1}/${post.images.length}`;
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        });
    }
    
    // 무한 스크롤
    function initInfiniteScroll(currentPostId) {
        const wrapper = document.querySelector('.post-detail-wrapper');
        let isLoading = false;
        let currentIndex = posts.findIndex(p => p.id === currentPostId);
        
        wrapper.addEventListener('scroll', () => {
            const scrollTop = wrapper.scrollTop;
            const scrollHeight = wrapper.scrollHeight;
            const clientHeight = wrapper.clientHeight;
            
            // 하단 도달 시 다음 게시물 로드
            if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
                currentIndex++;
                if (currentIndex < posts.length) {
                    isLoading = true;
                    const nextPost = posts[currentIndex];
                    wrapper.insertAdjacentHTML('beforeend', renderPostDetail(nextPost));
                    initPostSlider(nextPost);
                    setTimeout(() => { isLoading = false; }, 500);
                }
            }
        });
    }
});
