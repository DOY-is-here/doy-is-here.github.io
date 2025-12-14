// 포스트 상세 관련 모듈
import { isVideo } from './insta-grid.js';

// 포스트 상세 렌더링 - HTML 간소화 (5번 해결)
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
                    <span class="username">lee_gecko</span>님과 <span class="username">${post.username}</span>님
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

export function initPostSlider(post, initialSlide = 0) {
    initVideoThumbnails(post);
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

function initVideoThumbnails(post) {
    const videos = document.querySelectorAll(`[data-slider="${post.id}"] video`);
    videos.forEach(video => {
        video.addEventListener('loadedmetadata', function() {
            this.currentTime = 0.1;
        }, { once: true });
    });
}