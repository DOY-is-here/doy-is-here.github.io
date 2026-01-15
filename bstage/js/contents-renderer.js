// Contents Renderer - 카테고리 + 유튜브 임베드 지원
class ContentsRenderer {
    constructor(baseUrl = 'https://doy-is-here.github.io/') {
        this.baseUrl = baseUrl;
        this.posts = [];
        
        // 카테고리 설정
        this.categories = {
            madzip: { name: 'MAD.zip', tag: '#MAD.zip' },
            behind: { name: 'Behind', tag: '#Behind' },
            vlog: { name: 'V-log', tag: '#V-log' },
            interview: { name: 'Interview', tag: '#Interview' },
            etc: { name: '기타', tag: '#기타' }
        };
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

    // 유튜브 URL → 임베드 URL 변환
    getYoutubeEmbedUrl(url) {
        if (!url) return null;
        
        // youtube.com/watch?v=VIDEO_ID 형식
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        
        // youtu.be/VIDEO_ID 형식
        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        
        // 이미 embed URL인 경우
        if (url.includes('/embed/')) return url;
        
        return null;
    }

    // 유튜브 썸네일 URL 가져오기
    getYoutubeThumbnail(url) {
        if (!url) return null;
        
        let videoId = null;
        
        // youtube.com/watch?v=VIDEO_ID 형식
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
        
        // youtu.be/VIDEO_ID 형식
        if (!videoId) {
            match = url.match(/youtu\.be\/([^?&]+)/);
            if (match) videoId = match[1];
        }
        
        // embed URL에서 추출
        if (!videoId) {
            match = url.match(/embed\/([^?&]+)/);
            if (match) videoId = match[1];
        }
        
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        
        return null;
    }

    // 카테고리별 포스트 필터링
    getPostsByCategory(category) {
        return this.posts.filter(p => p.category === category)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // 카테고리 이름 가져오기
    getCategoryName(category) {
        return this.categories[category]?.name || category;
    }

    // 카테고리 태그 가져오기
    getCategoryTag(category) {
        return this.categories[category]?.tag || `#${category}`;
    }

    // 썸네일 소스 결정 (이미지 > 유튜브 썸네일)
    getThumbnailSrc(post) {
        // 미디어에 이미지가 있으면 사용
        const image = post.media?.find(m => m.type === 'image');
        if (image) {
            return { type: 'local', src: `${this.baseUrl}${image.src}` };
        }
        
        // 유튜브 썸네일 사용
        if (post.youtube) {
            const thumb = this.getYoutubeThumbnail(post.youtube);
            if (thumb) return { type: 'youtube', src: thumb };
        }
        
        // 비디오 있으면 사용
        const video = post.media?.find(m => m.type === 'video');
        if (video) {
            return { type: 'video', src: `${this.baseUrl}${video.src}` };
        }
        
        return null;
    }

    // Contents 메인 그리드 카드 렌더링
    renderGridCard(post, onClick) {
        const thumbnail = this.getThumbnailSrc(post);
        const hasYoutube = !!post.youtube;
        
        let mediaHTML = '';
        if (thumbnail) {
            if (thumbnail.type === 'video') {
                mediaHTML = `<video src="${thumbnail.src}" muted></video>`;
            } else {
                mediaHTML = `<img src="${thumbnail.src}" alt="" loading="lazy">`;
            }
        }
        
        return `
            <div class="content-item">
                <div class="content-card" onclick="${onClick}">
                    ${mediaHTML}
                    ${hasYoutube ? '<span class="content-youtube">YouTube</span>' : ''}
                </div>
                <span class="content-data">${post.text || this.formatDate(post.date)}</span>
            </div>
        `;
    }

    // Contents 섹션 렌더링 (카테고리별)
    renderContentsSection(containerSelector, category, limit = 4) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const posts = category ? 
            this.getPostsByCategory(category).slice(0, limit) :
            [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

        const cardsHTML = posts.map(post => 
            this.renderGridCard(post, `window.BSTApp.showContentsDetail('${post.id}')`)
        ).join('');

        container.innerHTML = cardsHTML;
    }

    // 전체 Contents 메인 탭 렌더링 (카테고리별 섹션들)
    renderAllSections(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // 카테고리별로 포스트가 있는 것만 섹션 생성
        const sectionsHTML = Object.keys(this.categories)
            .filter(cat => this.getPostsByCategory(cat).length > 0)
            .map(cat => {
                const posts = this.getPostsByCategory(cat).slice(0, 4);
                const cardsHTML = posts.map(post => 
                    this.renderGridCard(post, `window.BSTApp.showContentsDetail('${post.id}')`)
                ).join('');

                return `
                    <div class="contents-section" data-category="${cat}">
                        <div class="section-header">
                            <span class="section-header-title">${this.getCategoryName(cat)}</span>
                            <button onclick="window.BSTApp.showContentsList('${cat}')">더보기</button>
                        </div>
                        <div class="contents-grid">
                            ${cardsHTML}
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = sectionsHTML;
    }

    // Contents 리스트 렌더링 (카테고리별 전체보기)
    renderContentsList(containerSelector, category = null) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const posts = category ? 
            this.getPostsByCategory(category) :
            [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));

        const categoryName = category ? this.getCategoryName(category) : '전체';

        const listHTML = posts.map(post => {
            const thumbnail = this.getThumbnailSrc(post);
            const hasYoutube = !!post.youtube;
            
            let mediaHTML = '';
            if (thumbnail) {
                if (thumbnail.type === 'video') {
                    mediaHTML = `<video src="${thumbnail.src}" muted></video>`;
                } else {
                    mediaHTML = `<img src="${thumbnail.src}" alt="" loading="lazy">`;
                }
            }
            
            return `
                <div class="content-list-item">
                    <div class="content-list-card" onclick="window.BSTApp.showContentsDetail('${post.id}')">
                        ${mediaHTML}
                        ${hasYoutube ? '<span class="content-youtube">YouTube</span>' : ''}
                    </div>
                    <div class="content-list-info">
                        <span class="content-list-data">${post.text || categoryName}</span>
                        <span class="content-list-time">${this.formatDate(post.date)}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="contents-section-post">
                <div class="section-post-header">
                    <span class="content-list-title">${categoryName}</span>
                    <span class="content-list-count">${posts.length}개 콘텐츠</span>
                </div>
                <div class="contents-list-grid">
                    ${listHTML}
                </div>
            </div>
        `;
    }

    // 상세 포스트 렌더링 (유튜브 임베드 지원)
    renderDetail(post) {
        if (!post) return '';

        const category = post.category || 'etc';
        const categoryTag = this.getCategoryTag(category);

        // 유튜브가 있으면 임베드
        if (post.youtube) {
            const embedUrl = this.getYoutubeEmbedUrl(post.youtube);
            return `
                <div class="contents-section-post">
                    <div class="post-vid">
                        <iframe 
                            src="${embedUrl}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="post-vid-info">
                        <div class="post-vid-title">${post.text || this.getCategoryName(category)}</div>
                        <div class="post-vid-time">${this.formatDate(post.date)}</div>
                    </div>
                    <div class="post-img-tags">
                        <span class="post-img-tag">${categoryTag}</span>
                        <span class="post-img-tag">#NOMAD</span>
                    </div>
                </div>
            `;
        }

        // 비디오가 있으면 비디오 플레이어
        const video = post.media?.find(m => m.type === 'video');
        if (video) {
            return `
                <div class="contents-section-post">
                    <div class="post-vid">
                        <video src="${this.baseUrl}${video.src}" controls playsinline></video>
                    </div>
                    <div class="post-vid-info">
                        <div class="post-vid-title">${post.text || this.getCategoryName(category)}</div>
                        <div class="post-vid-time">${this.formatDate(post.date)}</div>
                    </div>
                    <div class="post-img-tags">
                        <span class="post-img-tag">${categoryTag}</span>
                        <span class="post-img-tag">#NOMAD</span>
                    </div>
                </div>
            `;
        }

        // 이미지만 있으면 이미지 갤러리
        const images = post.media?.filter(m => m.type === 'image') || [];
        const imagesHTML = images
            .map(m => `<div class="post-img-card"><img src="${this.baseUrl}${m.src}" alt="" loading="lazy"></div>`)
            .join('');

        return `
            <div class="contents-section-post">
                <div class="post-img-info">
                    <div class="post-img-title">${post.text || this.getCategoryName(category)}</div>
                    <div class="post-img-time">${this.formatDate(post.date)}</div>
                </div>
                <div class="post-img-grid">
                    ${imagesHTML}
                </div>
                <div class="post-img-tags">
                    <span class="post-img-tag">${categoryTag}</span>
                    <span class="post-img-tag">#NOMAD</span>
                </div>
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
            const thumbnail = this.getThumbnailSrc(post);
            
            let mediaHTML = '';
            if (thumbnail) {
                if (thumbnail.type === 'video') {
                    mediaHTML = `<video src="${thumbnail.src}" muted></video>`;
                } else {
                    mediaHTML = `<img src="${thumbnail.src}" alt="" loading="lazy">`;
                }
            }
            
            return `
                <div class="home-card-contnets" onclick="window.BSTApp.showContentsDetail('${post.id}')">
                    ${mediaHTML}
                </div>
            `;
        }).join('');

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

        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);

        const heroThumb = this.getThumbnailSrc(latestPosts[0]);
        const thumbnails = latestPosts.map(post => {
            const thumb = this.getThumbnailSrc(post);
            return `<img src="${thumb?.src || ''}" alt="" loading="lazy" onclick="window.BSTApp.showContentsDetail('${post.id}')">`;
        }).join('');

        container.innerHTML = `
            <img class="contents-hero-img" src="${heroThumb?.src || ''}" alt="">
            <div class="contents-hero-item">
                <div class="contents-hero-text">
                    <p class="contents-hero-exp">Latest</p>
                    <h2 class="contents-hero-title">Contents</h2>
                </div>
                    <div class="contents-thumbnails">
                    ${thumbnails}
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
        return post.youtube || post.media?.some(m => m.type === 'video');
    }
}

window.ContentsRenderer = ContentsRenderer;

export default ContentsRenderer;