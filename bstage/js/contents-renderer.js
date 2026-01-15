// Contents Renderer - MAD.zip 등 Contents 탭용 렌더러
class ContentsRenderer {
    constructor(baseUrl = 'https://doy-is-here.github.io/') {
        this.baseUrl = baseUrl;
        this.posts = [];
    }

    // JSON 데이터 로드
    async loadPosts(jsonPath = 'data/contents-posts.json') {
        try {
            const response = await fetch(jsonPath);
            const data = await response.json();
            this.posts = data.posts;
            return this.posts;
        } catch (error) {
            console.error('Failed to load contents:', error);
            return [];
        }
    }

    // 날짜 포맷팅
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    // Contents 메인 그리드 카드 렌더링
    renderGridCard(post, onClick) {
        const thumbnail = post.media[0];
        const isVideo = thumbnail.type === 'video';
        
        return `
            <div class="content-item">
                <div class="content-card" onclick="${onClick}">
                    ${isVideo ? 
                        `<video src="${this.baseUrl}${thumbnail.src}" muted></video>` :
                        `<img src="${this.baseUrl}${thumbnail.src}" alt="" loading="lazy">`
                    }
                    ${isVideo ? '<span class="content-youtube">Video</span>' : ''}
                </div>
                <span class="content-data">${post.text || this.formatDate(post.date)}</span>
            </div>
        `;
    }

    // Contents 섹션 렌더링 (메인 탭)
    renderContentsSection(containerSelector, limit = 4) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        const cardsHTML = latestPosts.map(post => 
            this.renderGridCard(post, `window.BSTApp.showContentsDetail('${post.id}')`)
        ).join('');

        container.innerHTML = cardsHTML;
    }

    // Contents 리스트 렌더링 (전체보기)
    renderContentsList(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const sortedPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const listHTML = sortedPosts.map(post => {
            const thumbnail = post.media[0];
            const isVideo = thumbnail.type === 'video';
            
            return `
                <div class="content-list-item">
                    <div class="content-list-card" onclick="window.BSTApp.showContentsDetail('${post.id}')">
                        ${isVideo ? 
                            `<video src="${this.baseUrl}${thumbnail.src}" muted></video>` :
                            `<img src="${this.baseUrl}${thumbnail.src}" alt="" loading="lazy">`
                        }
                        ${isVideo ? '<span class="content-youtube">Video</span>' : ''}
                    </div>
                    <div class="content-list-info">
                        <span class="content-list-data">${post.text || 'MAD.zip'}</span>
                        <span class="content-list-time">${this.formatDate(post.date)}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="contents-section-post">
                <div class="section-post-header">
                    <span class="content-list-title">MAD.zip</span>
                    <span class="content-list-count">${sortedPosts.length}개 콘텐츠</span>
                </div>
                <div class="contents-list-grid">
                    ${listHTML}
                </div>
            </div>
        `;
    }

    // 상세 포스트 렌더링 (이미지)
    renderDetailIMG(post) {
        const imagesHTML = post.media
            .filter(m => m.type === 'image')
            .map(m => `<div class="post-img-card"><img src="${this.baseUrl}${m.src}" alt="" loading="lazy"></div>`)
            .join('');

        return `
            <div class="contents-section-post">
                <div class="post-img-info">
                    <div class="post-img-title">${post.text || 'MAD.zip'}</div>
                    <div class="post-img-time">${this.formatDate(post.date)}</div>
                </div>
                <div class="post-img-grid">
                    ${imagesHTML}
                </div>
                <div class="post-img-tags">
                    <span class="post-img-tag">#MAD.zip</span>
                    <span class="post-img-tag">#NOMAD</span>
                </div>
            </div>
        `;
    }

    // 상세 포스트 렌더링 (비디오)
    renderDetailVID(post) {
        const video = post.media.find(m => m.type === 'video');
        if (!video) return '';

        return `
            <div class="post-vid">
                <video src="${this.baseUrl}${video.src}" controls playsinline></video>
            </div>
            <div class="post-vid-info">
                <div class="post-vid-title">${post.text || 'MAD.zip'}</div>
                <div class="post-vid-time">${this.formatDate(post.date)}</div>
            </div>
        `;
    }

    // 홈 탭 미리보기 렌더링
    renderHomePreview(containerSelector, limit = 2) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        const previewHTML = latestPosts.map(post => {
            const thumbnail = post.media[0];
            const isVideo = thumbnail.type === 'video';
            
            return `
                <div class="home-card-contnets" onclick="window.BSTApp.showContentsDetail('${post.id}')">
                    ${isVideo ? 
                        `<video src="${this.baseUrl}${thumbnail.src}" muted></video>` :
                        `<img src="${this.baseUrl}${thumbnail.src}" alt="" loading="lazy">`
                    }
                </div>
            `;
        }).join('');

        // 더보기 버튼 추가
        container.innerHTML = previewHTML + `
            <div class="home-card-contnets">
                <div class="card-more" onclick="window.BSTApp.switchTab('contents')">        
                    <span class="card-icon-more"></span>
                    <span>더보기</span>
                </div>
            </div>
        `;
    }

    // 히어로 섹션 렌더링
    renderHero(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container || this.posts.length === 0) return;

        // 최신 포스트에서 썸네일 추출
        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);

        const heroImg = latestPosts[0]?.media[0];
        const thumbnails = latestPosts.map(post => {
            const thumb = post.media[0];
            return `<img src="${this.baseUrl}${thumb.src}" alt="" loading="lazy" onclick="window.BSTApp.showContentsDetail('${post.id}')">`;
        }).join('');

        container.innerHTML = `
            <img class="contents-hero-img" src="${this.baseUrl}${heroImg?.src || ''}" alt="">
            <div class="contents-hero-item">
                <div class="contents-thumbnails">
                    ${thumbnails}
                </div>
                <div class="contents-hero-text">
                    <p class="contents-hero-exp">Latest</p>
                    <h2 class="contents-hero-title">MAD.zip</h2>
                </div>
            </div>
        `;
    }

    // ID로 포스트 찾기
    getPostById(postId) {
        return this.posts.find(p => p.id === postId);
    }

    // 미디어 타입 확인
    isVideoPost(post) {
        return post.media.some(m => m.type === 'video');
    }
}

window.ContentsRenderer = ContentsRenderer;

export default ContentsRenderer;