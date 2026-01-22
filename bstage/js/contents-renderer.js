// Contents Renderer - 카테고리 + 태그 + 유튜브 임베드 지원
class ContentsRenderer {
    constructor(baseUrl = 'https://doy-is-here.github.io/') {
        this.baseUrl = baseUrl;
        this.posts = [];
        
        // 카테고리 설정
        this.categories = {
            whoami: { name: 'WHO AM I', tag: '#WHOAMI' },
            nomad: { name: '1st EP NOMAD', tag: '#NOMAD' },
            callmeback: { name: '1st Single Call Me Back', tag: '#CallMeBack' },
            carnival: { name: 'Digital Single CARNIVAL', tag: '#CARNIVAL' },
            'MAD.zip': { name: 'MAD.zip', tag: '#MAD.zip' },
            behind: { name: 'BEHIND', tag: '#BEHIND' },
            cover: { name: 'COVER', tag: '#COVER' },
            nobackgo: { name: 'NOBACKGO', tag: '#NOBACKGO' },
            nogotit: { name: 'NO! GOT IT!', tag: '#NOGOTIT' },
            noriter: { name: 'NORITER', tag: '#NORITER' },
            nomaddrive: { name: 'NOMAD DRIVE', tag: '#NOMADDRIVE' },
            '도쏜트': { name: '도쏜트', tag: '#도쏜트' },
        };
    }

    // JSON 데이터 로드 (contents + youtube 합쳐서)
    async loadPosts(contentsPath = 'bstage/data/contents-posts.json', youtubePath = 'bstage/data/youtube-posts.json') {
        try {
            // contents와 youtube 동시 로드
            const [contentsRes, youtubeRes] = await Promise.all([
                fetch(contentsPath).catch(() => null),
                fetch(youtubePath).catch(() => null)
            ]);
            
            let contentsPosts = [];
            let youtubePosts = [];
            
            if (contentsRes && contentsRes.ok) {
                const contentsData = await contentsRes.json();
                contentsPosts = contentsData.posts || [];
            }
            
            if (youtubeRes && youtubeRes.ok) {
                const youtubeData = await youtubeRes.json();
                youtubePosts = youtubeData.posts || [];
            }
            
            // 합쳐서 날짜순 정렬
            this.posts = [...contentsPosts, ...youtubePosts]
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
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
        
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        
        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        
        if (url.includes('/embed/')) return url;
        
        return null;
    }

    // 유튜브 썸네일 URL 가져오기
    getYoutubeThumbnail(url) {
        if (!url) return null;
        
        let videoId = null;
        
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
        
        if (!videoId) {
            match = url.match(/youtu\.be\/([^?&]+)/);
            if (match) videoId = match[1];
        }
        
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

    // 태그별 포스트 필터링
getPostsByTag(tag) {
    const searchTag = tag.replace('#', '').toLowerCase();
    return this.posts.filter(p => {
        // 카테고리 매칭
        if (p.category && p.category.toLowerCase() === searchTag) {
            return true;
        }
        // 태그 매칭
        if (p.tags) {
            return p.tags.some(t => t.replace('#', '').toLowerCase() === searchTag);
        }
        return false;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

    // 모든 태그 가져오기 (중복 제거)
    getAllTags() {
        const tagSet = new Set();
        this.posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
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
        const image = post.media?.find(m => m.type === 'image');
        if (image) {
            return { type: 'local', src: `${this.baseUrl}${image.src}` };
        }
        
        if (post.youtube) {
            const thumb = this.getYoutubeThumbnail(post.youtube);
            if (thumb) return { type: 'youtube', src: thumb };
        }
        
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

        // 카테고리 표시
        const categoryName = this.getCategoryName(post.category);
        
        return `
            <div class="content-item">
                <div class="content-card" onclick="${onClick}">
                    ${mediaHTML}
                    ${hasYoutube ? '<span class="content-youtube">YouTube</span>' : ''}
                </div>
                <div class="content-info">
                    <div class="content-category">
                        <span class="content-folder-icon"></span>
                        <span class="content-category-name">${categoryName}</span>
                    </div>
                    <span class="content-data">${post.text || ''}</span>
                </div>
            </div>
        `;
    }

    // Contents 섹션 렌더링 (카테고리별)
    renderContentsSection(containerSelector, category) {
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

        const sectionsHTML = Object.keys(this.categories)
            .filter(cat => this.getPostsByCategory(cat).length > 0)
            .map(cat => {
                const posts = this.getPostsByCategory(cat).slice(0);
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

    // 태그별 리스트 렌더링
    renderTagList(containerSelector, tag) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const posts = this.getPostsByTag(tag);

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
                        <span class="content-list-data">${post.text || this.formatDate(post.date)}</span>
                        <span class="content-list-time">${this.formatDate(post.date)}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="contents-section-post">
                <div class="section-post-header">
                    <span class="content-tag-title">#${tag}</span>
                </div>
                <div class="contents-list-grid">
                    ${listHTML}
                </div>
            </div>
        `;
    }

    // 태그 렌더링 (클릭 가능한 태그 버튼들)
    renderTags(post) {
        const tags = post.tags || [];
        const category = post.category || 'etc';
        const categoryTag = this.getCategoryTag(category);
        
        // 카테고리 태그 + 사용자 정의 태그
        const allTags = [categoryTag];
        tags.forEach(tag => {
            const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
            if (!allTags.includes(formattedTag)) {
                allTags.push(formattedTag);
            }
        });
        
        return allTags.map(tag => {
            const tagName = tag.replace('#', '');
            return `<span class="post-tag" onclick="window.BSTApp.showTagList('${tagName}')">${tag}</span>`;
        }).join('');
    }

    // 상세 포스트 렌더링 (유튜브 임베드 + 태그 + 설명 표시)
    renderDetail(post) {
        if (!post) return '';

        const category = post.category || 'etc';
        const tagsHTML = this.renderTags(post);
        const descHTML = post.description 
            ? `<div class="post-vid-exp">${post.description.replace(/\n/g, '<br>')}</div>` 
            : '';

        // 유튜브가 있으면 임베드
        if (post.youtube) {
            const embedUrl = this.getYoutubeEmbedUrl(post.youtube);
            return `
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
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                    ${descHTML}
                </div>
            `;
        }

        // 비디오가 있으면 비디오 플레이어
        const video = post.media?.find(m => m.type === 'video');
        if (video) {
            return `
                <div class="post-vid">
                    <video src="${this.baseUrl}${video.src}" controls playsinline></video>
                </div>
                <div class="post-vid-info">
                    <div class="post-vid-title">${post.text || this.getCategoryName(category)}</div>
                    <div class="post-vid-time">${this.formatDate(post.date)}</div>
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                    ${descHTML}
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
                <div class="post-tags">
                    ${tagsHTML}
                </div>
            </div>
        `;
    }

// 홈 탭 미리보기 렌더링 (흔들림 방지 + 사이즈 고정)
    renderHomePreview(containerSelector, limit = 9) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        const previewHTML = latestPosts.map(post => {
            const thumbnail = this.getThumbnailSrc(post);
            
            let mediaHTML = '';
            // [핵심] display: block으로 하단 여백 제거, GPU 가속(translateZ)으로 흔들림 방지
            const commonStyle = "width: 100%; height: 100%; object-fit: cover; display: block; transform: translateZ(0); pointer-events: none;";

            if (thumbnail) {
                if (thumbnail.type === 'video') {
                    // 비디오: #t=0.01로 첫 프레임 고정 (깜빡임 방지)
                    mediaHTML = `<video src="${thumbnail.src}#t=0.01" muted preload="metadata" 
                                    style="${commonStyle}"></video>`;
                } else {
                    // 이미지
                    mediaHTML = `<img src="${thumbnail.src}" alt="" loading="lazy" 
                                    style="${commonStyle}">`;
                }
            } else {
                 mediaHTML = `<div style="width: 100%; height: 100%; background: #333;"></div>`;
            }
            
            // 부모 div에 border-radius와 overflow: hidden을 적용하여 이미지를 틀 안에 가둠
            return `
                <div class="home-card-contnets" onclick="window.BSTApp.showContentsDetail('${post.id}')" 
                     style="cursor: pointer; border-radius: 8px; overflow: hidden; background: #000; transform: translateZ(0); -webkit-mask-image: -webkit-radial-gradient(white, black);">
                    ${mediaHTML}
                </div>
            `;
        }).join('');

        container.innerHTML = previewHTML + `
            <div class="home-card-contnets">
                <div class="card-more" onclick="window.BSTApp.switchTab('contents')" 
                     style="cursor: pointer; border-radius: 8px; overflow: hidden; transform: translateZ(0);">        
                    <span class="card-icon-more"></span>
                    <span>더보기</span>
                </div>
            </div>
        `;
    }

    // 히어로 섹션 렌더링 (madzip 카테고리 제외)
    renderHero(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container || this.posts.length === 0) return;

        // madzip 카테고리 제외한 포스트만 필터링
        const filteredPosts = this.posts.filter(p => p.category !== 'madzip');
        
        if (filteredPosts.length === 0) {
            container.innerHTML = '';
            return;
        }

        const latestPosts = [...filteredPosts]
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