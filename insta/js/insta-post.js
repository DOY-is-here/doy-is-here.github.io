// 포스트 상세 관련 모듈

import { isVideo } from './insta-grid.js';

// 포스트 상세 렌더링 (영상 지원)
export function renderPostDetail(post, savedTab = 'grid') {
    // 태그탭 또는 리포스트탭의 그룹 포스트는 태그 스타일
    const isTaggedStyle = savedTab === 'tagged' || (savedTab === 'repost' && post.type === 'group');
    const tabClass = isTaggedStyle ? 'from-tagged' : '';
    
    // 태그탭 포스트 헤더 (공동 작성자 스타일)
    const postHeaderHTML = isTaggedStyle ? `
        <!-- 포스트 헤더 - 태그탭 -->
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
        <!-- 포스트 헤더 - 일반 -->
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
            <!-- 상단바 -->
            <div class="post-topbar">
                <div class="left-btn header-back" onclick="showProfile('${savedTab}', true)"></div>
                <div class="post-topbar-title">게시물</div>
                <div class="post-topbar-subtitle">${post.username}</div>
                <div class="right-btn"></div>
            </div>

            ${postHeaderHTML}

            <!-- 이미지/영상 슬라이더 -->
            <div class="post-slider">
                <div class="slider-container" data-slider="${post.id}">
                    ${post.images.map(mediaUrl => {
                        if (isVideo(mediaUrl)) {
                            return `
                                <div class="slider-item">
                                    <video src="${mediaUrl}" controls playsinline preload="metadata" class="post-video">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="slider-item">
                                    <img src="${mediaUrl}" alt="${post.caption}">
                                </div>
                            `;
                        }
                    }).join('')}
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
                <div class="action-icon icon-chat"></div>
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

// 이미지 슬라이더 초기화
export function initPostSlider(post) {
    // 비디오 썸네일은 항상 초기화
    initVideoThumbnails(post);
    
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

// 비디오 첫 프레임 표시
function initVideoThumbnails(post) {
    const videos = document.querySelectorAll(`[data-slider="${post.id}"] video`);
    videos.forEach(video => {
        video.addEventListener('loadedmetadata', function() {
            // 첫 프레임으로 이동 (썸네일 표시용)
            this.currentTime = 0.1;
        });
    });
}

// 무한 스크롤 초기화
export function initInfiniteScroll(currentPostId, posts, renderPostDetail, initPostSlider, savedTab = 'grid') {
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
                wrapper.insertAdjacentHTML('beforeend', renderPostDetail(nextPost, savedTab));
                initPostSlider(nextPost);
                setTimeout(() => { isLoading = false; }, 500);
            }
        }
    });
}