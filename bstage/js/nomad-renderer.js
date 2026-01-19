// NOMAD Posts Renderer - JSON 데이터를 HTML로 렌더링
class NomadRenderer {
    constructor(baseUrl = 'https://doy-is-here.github.io/') {
        this.baseUrl = baseUrl;
        this.posts = [];
    }

    // JSON 데이터 로드
    async loadPosts(jsonPath = 'data/nomad-posts.json') {
        try {
            const response = await fetch(jsonPath);
            const data = await response.json();
            this.posts = data.posts;
            return this.posts;
        } catch (error) {
            console.error('Failed to load posts:', error);
            return [];
        }
    }

    // 날짜 포맷팅 (YYYY.MM.DD)
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    // 피드용 포스트 렌더링
    renderPost(post) {
        const hasMedia = post.media && post.media.length > 0;
        const isVideo = post.media[0]?.type === 'video';
        const isMultiple = post.media.length > 1;
        const mediaClass = isVideo ? 'post-media--video' : 'post-media--image';

        let mediaHTML = '';

        if (!hasMedia) {
            // 미디어 없음 - 텍스트만
            mediaHTML = '';
        } else if (isMultiple) {
            const imagesHTML = post.media.map(m =>
                `<img src="${this.baseUrl}${m.src}" alt="" loading="lazy">`
            ).join('');

            mediaHTML = `
                <div class="media-container ${mediaClass}">
                    <div class="media-container-track">
                        ${imagesHTML}
                    </div>
                </div>
                <div class="post-indicators">
                    ${post.media.map((_, i) =>
                        `<span class="indicator${i === 0 ? ' active' : ''}"></span>`
                    ).join('')}
                </div>
            `;
        } else if (isVideo) {
            const video = post.media[0];
            mediaHTML = `
                <div class="media-container ${mediaClass}">
                    <video src="${this.baseUrl}${video.src}" playsinline muted loop></video>
                    ${video.duration ? `<span class="video-time">${video.duration}</span>` : ''}
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="media-container ${mediaClass}">
                    <img src="${this.baseUrl}${post.media[0].src}" alt="" loading="lazy">
                </div>
            `;
        }

        return `
            <div class="nomad-post" data-post-id="${post.id}"
                 onclick="window.BSTApp.showNOMADPost('${post.id}')">
                <div class="post-header">
                    <div class="profile-pic"></div>
                    <div class="profile-user">
                        <span class="profile-name">도의</span>
                        <span class="profile-icon-check"></span>
                    </div>
                    <div class="post-right">
                        <button class="profile-more"></button>
                    </div>
                </div>
                ${mediaHTML}
                ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
                <div class="post-meta">
                    <span>${this.formatDate(post.date)}</span>
                    <span>댓글 ${post.comments}개</span>
                </div>
            </div>
        `;
    }

    // 상세 포스트 렌더링
    renderDetailPost(post) {       
        const hasMedia = post.media && post.media.length > 0;
        const isVideo = post.media[0]?.type === 'video';
        const isMultiple = post.media.length > 1;

        let mediaHTML = '';
        
        if (!hasMedia) {
            // 미디어 없음
            mediaHTML = '';
        } 
        // 여러 이미지 → 피드와 동일한 캐러셀 구조
        else if (isMultiple) {
            const imagesHTML = post.media.map(m =>
                `<img src="${this.baseUrl}${m.src}" alt="" loading="lazy">`
            ).join('');

            mediaHTML = `
                <div class="media-container post-detail-media post-media--image post-media--multiple">
                    <div class="media-container-track">
                        ${imagesHTML}
                    </div>
                </div>
                <div class="post-indicators">
                    ${post.media.map((_, i) =>
                        `<span class="indicator${i === 0 ? ' active' : ''}"></span>`
                    ).join('')}
                </div>
            `;
        }
        // 비디오
        else if (isVideo) {
            const video = post.media[0];
            mediaHTML = `
                <div class="media-container post-detail-media post-media--video">
                    <video src="${this.baseUrl}${video.src}" controls playsinline></video>
                </div>
            `;
        }
        // 단일 이미지
        else {
            mediaHTML = `
                <div class="media-container post-detail-media post-media--image">
                    <img src="${this.baseUrl}${post.media[0].src}" alt="" loading="lazy">
                </div>
            `;
        }

        return `
            <div class="nomad-feed-detail">
                <div class="nomad-detail-post">
                    <div class="post-header">
                        <div class="profile-pic"></div>
                        <div class="profile-user-detail">
                            <div class="profile-user">
                                <span class="profile-name">도의</span>
                                <span class="profile-icon-check"></span>
                            </div>
                            <div class="post-date">
                                <span>${this.formatDate(post.date)}</span>
                            </div>
                        </div>
                        <div class="post-right">
                            <button class="profile-more-detail"></button>
                        </div>
                    </div>

                    ${mediaHTML}

                    ${post.text ? `<div class="detail-text">${post.text}</div>` : ''}
                </div>
            </div>
        `;
    }

    // 피드 전체 렌더링
    renderFeed(containerId = 'nomad-feed') {
        const container =
            document.querySelector(`#${containerId}`) ||
            document.querySelector('.nomad-feed');

        if (!container) {
            console.error('Feed container not found');
            return;
        }

        const sortedPosts = [...this.posts].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        container.innerHTML =
            sortedPosts.map(post => this.renderPost(post)).join('');
        this.initializeCarousels();
    }

    // 홈 탭 미리보기 렌더링
    renderHomePreview(containerSelector = '.home-section .home-grid') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // 최신 2개 포스트
        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 2);

        const previewHTML = latestPosts.map(post => {
            const hasMedia = post.media && post.media.length > 0;
            const thumbnail = hasMedia ? post.media[0] : null;
            const isVideo = thumbnail?.type === 'video';
            
            let mediaHTML = '';
            if (thumbnail) {
                mediaHTML = isVideo ? 
                    `<video src="${this.baseUrl}${thumbnail.src}" muted></video>` :
                    `<img src="${this.baseUrl}${thumbnail.src}" alt="">`;
            }
            
            return `
                <div class="home-nomad" onclick="window.BSTApp.showNOMADPost('${post.id}')">
                    ${mediaHTML}
                    ${post.text ? `<div class="home-nomad-text">${post.text.substring(0, 30)}${post.text.length > 30 ? '...' : ''}</div>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = previewHTML + `
            <div class="home-nomad">
                <div class="card-all" onclick="window.BSTApp.showNOMADTab()">전체보기</div>
            </div>
        `;
    }

    // 캐러셀 초기화
    initializeCarousels() {
        const tracks = document.querySelectorAll('.media-container-track');
        
        tracks.forEach(track => {
            const images = track.querySelectorAll('img');
            if (images.length <= 1) return;

            const post = track.closest('.nomad-post') || track.closest('.nomad-detail-post');
            const indicators = post?.querySelector('.post-indicators');
            if (!indicators) return;

            const dots = indicators.querySelectorAll('.indicator');

            track.addEventListener('scroll', () => {
                const scrollLeft = track.scrollLeft;
                const imageWidth = track.offsetWidth;
                const currentIndex = Math.round(scrollLeft / imageWidth);

                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            });
        });
    }

    // ID로 포스트 찾기
    getPostById(postId) {
        return this.posts.find(p => p.id === postId);
    }
}

// 전역으로 노출
window.NomadRenderer = NomadRenderer;

export default NomadRenderer;
