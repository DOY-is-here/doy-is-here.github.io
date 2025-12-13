import { posts, getPostCount, getReels, getPhotos, getPostById, getTaggedPosts, getStories } from './posts.js';

let currentTab = 'grid'; 
let touchStartX = 0;
let touchEndX = 0;
let currentStoryIndex = 0;
let storyProgressInterval = null;

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
                    </div>
                    <div class="follower-text">
                        <span class="follower-name">j__nnie</span>님과 <span class="follower-name">roses_are_rosie</span>님이 팔로우합니다
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
    <!-- 그리드 -->
    <div class="tab-item active" data-tab="grid">
        <div class="tab-icon grid"></div>
    </div>
    <!-- 태그 -->
    <div class="tab-item" data-tab="tagged">
        <div class="tab-icon tagged"></div>
    </div>
    <!-- 스토리 -->
    <div class="tab-item" data-tab="story">
        <div class="tab-icon story"></div>
    </div>
    <!-- 리포스트  -->
    <div class="tab-item" data-tab="repost">
        <div class="tab-icon repost"></div>
    </div>
</div>

            
            <!-- 탭 컨텐츠 컨테이너 -->
            <div class="tabs-container" id="tabs-container">
                <div class="tab-content active" data-content="grid">
                    ${renderGrid(posts)}
                </div>

                <div class="tab-content" data-content="tagged">
                    ${renderTaggedGrid()}
                </div>
                <div class="tab-content" data-content="story">
                    ${renderStoryGrid()}
                </div>
                <div class="tab-content" data-content="repost">
                    ${renderRepostGrid()}
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
    
    // 태그 그리드 렌더링
    function renderTaggedGrid() {
        const tagged = getTaggedPosts();
        if (tagged.length === 0) {
            return renderEmptyTag();
        }
        
        return `
            <div class="posts-grid grid-34">
                ${tagged.map(tag => `
                    <div class="grid-item" onclick="showPost('${tag.postId}')" style="background-image: url('${tag.image}')">
                        <div class="tagged-icon"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 스토리 그리드 렌더링
    function renderStoryGrid() {
        const stories = getStories();
        if (stories.length === 0) {
            return renderEmptyTag();
        }
        
        return `
            <div class="posts-grid grid-34">
                ${stories.map((story, index) => `
                    <div class="grid-item story-grid-item" onclick="showStory(${index})" style="background-image: url('${story.image}')">
                        <div class="story-date">${story.displayDate}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 리포스트 그리드 렌더링
    function renderRepostGrid() {
        const allPosts = [...posts];
        const tagged = getTaggedPosts();
        
        const repostItems = [];
        
        // 모든 일반 포스트의 모든 이미지 추가
        allPosts.forEach(post => {
            post.images.forEach((img, idx) => {
                repostItems.push({
                    id: `${post.id}-${idx}`,
                    postId: post.id,
                    image: img,
                    isMulti: post.images.length > 1,
                    type: post.type
                });
            });
        });
        
        // 태그된 포스트도 추가
        tagged.forEach(tag => {
            repostItems.push({
                id: tag.id,
                postId: tag.postId,
                image: tag.image,
                isTagged: true
            });
        });
        
        return `
            <div class="posts-grid grid-34">
                ${repostItems.map(item => `
                    <div class="grid-item" onclick="showPost('${item.postId}')" style="background-image: url('${item.image}')">
                        ${item.isMulti ? '<div class="multi-icon"></div>' : ''}
                        ${item.type === 'reel' ? '<div class="reel-icon"></div>' : ''}
                        ${item.isTagged ? '<div class="tagged-icon"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 빈 태그 탭 렌더링
    function renderEmptyTag() {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #8e8e8e;">
                <div style="font-size: 60px; margin-bottom: 20px;">📷</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">콘텐츠 없음</div>
                <div style="font-size: 14px;">아직 아무것도 없습니다.</div>
            </div>
        `;
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
            document
                .querySelector(`.tab-content[data-content="${tab.dataset.tab}"]`)
                .classList.add("active");
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
        
        const tabs = ['grid', 'tagged', 'story', 'repost'];
        const currentIndex = tabs.indexOf(currentTab);
        
        if (diff > 0 && currentIndex < tabs.length - 1) {
            // 왼쪽 스와이프 (다음 탭)
            switchTab(tabs[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // 오른쪽 스와이프 (이전 탭)
            switchTab(tabs[currentIndex - 1]);
        }
    }
    
    // 스토리 보기
    window.showStory = function(index) {
        currentStoryIndex = index;
        const stories = getStories();
        
        root.innerHTML = `
            <div class="story-viewer">
                ${renderStoryViewer(stories)}
            </div>
        `;
        
        initStoryViewer(stories);
    };
    
    // 스토리 뷰어 렌더링
    function renderStoryViewer(stories) {
        return `
            <!-- 스토리 헤더 -->
            <div class="story-header">
                <div class="story-progress-bars">
                    ${stories.map((_, i) => `
                        <div class="story-progress-bar">
                            <div class="story-progress-fill ${i === currentStoryIndex ? 'active' : ''} ${i < currentStoryIndex ? 'completed' : ''}"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="story-top-info">
                    <div class="story-avatar"></div>
                    <div class="story-username">doy.is.here</div>
                    <div class="story-time">${stories[currentStoryIndex].displayDate}</div>
                    <div class="story-close" onclick="location.reload()">✕</div>
                </div>
            </div>
            
            <!-- 스토리 이미지 컨테이너 -->
            <div class="story-images">
                ${stories.map((story, i) => `
                    <div class="story-image ${i === currentStoryIndex ? 'active' : ''}" style="background-image: url('${story.image}')"></div>
                `).join('')}
            </div>
            
            <!-- 스토리 네비게이션 영역 -->
            <div class="story-nav-left" onclick="previousStory()"></div>
            <div class="story-nav-right" onclick="nextStory()"></div>
        `;
    }
    
    // 스토리 뷰어 초기화
    function initStoryViewer(stories) {
        startStoryProgress(stories);
    }
    
    // 스토리 진행 시작
    function startStoryProgress(stories) {
        if (storyProgressInterval) {
            clearInterval(storyProgressInterval);
        }
        
        const progressFill = document.querySelector('.story-progress-fill.active');
        if (!progressFill) return;
        
        let progress = 0;
        const duration = stories[currentStoryIndex].duration;
        const interval = 50;
        const increment = (interval / duration) * 100;
        
        storyProgressInterval = setInterval(() => {
            progress += increment;
            progressFill.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                clearInterval(storyProgressInterval);
                window.nextStory();
            }
        }, interval);
    }
    
    // 다음 스토리
    window.nextStory = function() {
        const stories = getStories();
        
        if (currentStoryIndex < stories.length - 1) {
            currentStoryIndex++;
            updateStory(stories);
        } else {
            location.reload();
        }
    };
    
    // 이전 스토리
    window.previousStory = function() {
        const stories = getStories();
        
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            updateStory(stories);
        }
    };
    
    // 스토리 업데이트
    function updateStory(stories) {
        // 모든 스토리 숨기기
        document.querySelectorAll('.story-image').forEach((img, i) => {
            img.classList.remove('active');
            if (i === currentStoryIndex) {
                img.classList.add('active');
            }
        });
        
        // 프로그레스바 업데이트
        document.querySelectorAll('.story-progress-fill').forEach((bar, i) => {
            bar.classList.remove('active', 'completed');
            if (i === currentStoryIndex) {
                bar.classList.add('active');
                bar.style.width = '0%';
            } else if (i < currentStoryIndex) {
                bar.classList.add('completed');
                bar.style.width = '100%';
            } else {
                bar.style.width = '0%';
            }
        });
        
        // 시간 업데이트
        document.querySelector('.story-time').textContent = stories[currentStoryIndex].displayDate;
        
        // 새 스토리 진행 시작
        startStoryProgress(stories);
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
                            <div class="slider-item">
                                <img src="${img}" alt="${post.caption}">
                            </div>
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