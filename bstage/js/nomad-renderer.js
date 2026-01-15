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

    // 단일 포스트 HTML 생성 (NOMAD 피드용)
    renderPost(post) {
        const isVideo = post.media[0]?.type === 'video';
        const isMultiple = post.media.length > 1;
        const mediaClass = isVideo ? 'post-media--video' : 'post-media--image';

        // 미디어 컨테이너 HTML
        let mediaHTML = '';
        if (isMultiple) {
            // 여러 이미지 - 슬라이드
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
            // 비디오
            const video = post.media[0];
            mediaHTML = `
                <div class="media-container ${mediaClass}">
                    <video src="${this.baseUrl}${video.src}" playsinline muted loop></video>
                    ${video.duration ? `<span class="video-time">${video.duration}</span>` : ''}
                </div>
            `;
        } else {
            // 단일 이미지
            mediaHTML = `
                <div class="media-container ${mediaClass}">
                    <img src="${this.baseUrl}${post.media[0].src}" alt="" loading="lazy">
                </div>
            `;
        }

        // 전체 포스트 HTML
        return `
            <div class="nomad-post" data-post-id="${post.id}" onclick="window.BSTApp.showNOMADPost('${post.id}')">
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

    // 상세 포스트 HTML 생성 (NOMAD Post 상세 뷰)
    renderDetailPost(post) {
        const isVideo = post.media[0]?.type === 'video';
        const isMultiple = post.media.length > 1;

        // 미디어 HTML
        let mediaHTML = '';
        if (isMultiple) {
            const imagesHTML = post.media.map(m => 
                `<img src="${this.baseUrl}${m.src}" alt="" loading="lazy">`
            ).join('');
            
            mediaHTML = `
                <div class="post-detail-media post-detail-media--image post-detail-media--multiple">
                    <div class="post-detail-media__track">
                        ${imagesHTML}
                    </div>
                </div>
            `;
        } else if (isVideo) {
            const video = post.media[0];
            mediaHTML = `
                <div class="post-detail-media post-detail-media--video post-detail-media--single">
                    <video src="${this.baseUrl}${video.src}" controls playsinline></video>
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="post-detail-media post-detail-media--image post-detail-media--single">
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

    // NOMAD 피드 전체 렌더링
    renderFeed(containerId = 'nomad-feed') {
        const container = document.querySelector(`#${containerId}`) || 
                          document.querySelector('.nomad-feed');
        
        if (!container) {
            console.error('Feed container not found');
            return;
        }

        // 최신순 정렬
        const sortedPosts = [...this.posts].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        const postsHTML = sortedPosts.map(post => this.renderPost(post)).join('');
        
        container.innerHTML = postsHTML + `
            <button class="btn-more-post">더보기</button>
        `;

        // 이미지 캐러셀 초기화
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
            const thumbnail = post.media[0];
            const isVideo = thumbnail.type === 'video';
            
            return `
                <div class="home-nomad" onclick="window.BSTApp.showNOMADPost('${post.id}')">
                    ${isVideo ? 
                        `<video src="${this.baseUrl}${thumbnail.src}" muted></video>` :
                        `<img src="${this.baseUrl}${thumbnail.src}" alt="">`
                    }
                    ${post.text ? `<div class="home-nomad-text">${post.text.substring(0, 30)}...</div>` : ''}
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

            const post = track.closest('.nomad-post');
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