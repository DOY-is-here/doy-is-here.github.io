// NOMAD Posts Renderer - JSON 데이터를 HTML로 렌더링
class NomadRenderer {
    constructor(baseUrl = 'https://doy-is-here.github.io/') {
        this.baseUrl = baseUrl;
        this.posts = [];
    }

    // JSON 데이터 로드 (경로 수정: bstage/data)
    async loadPosts(jsonPath = 'bstage/data/nomad-posts.json') {
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

    // 댓글 렌더링
    renderComments(commentList) {
        if (!commentList || commentList.length === 0) {
            return '';
        }

        const commentsHTML = commentList.map(comment => {
            // base가 있으면 표시, 없으면 생략
            const baseHTML = comment.base 
                ? `<div class="post-comment-base">${comment.base}</div>` 
                : '';
            
            // doy가 있으면 표시, 없으면 생략
            const doyHTML = comment.doy 
                ? `<div class="post-comment-doy">${comment.doy}</div>` 
                : '';
            
            // 둘 다 없으면 아이템 자체를 생략
            if (!comment.base && !comment.doy) return '';

            return `
                <div class="post-comment-list">
                    <div class="profile-ring">
                        <div class="post-profile-comment"></div>
                    </div>
                    <div class="post-comment">
                        <div class="post-comment-user">
                            <span class="post-comment-name">도의</span>
                            <span class="profile-icon-check"></span>
                        </div>
                        <div class="post-comment-box">
                            <div class="post-comment-text">
                                ${baseHTML}
                                ${doyHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="nomad-comment-feed">
                <div class="post-comments">
                    <div class="post-comment-star">스타댓글</div>
                    ${commentsHTML}
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

        // 댓글 렌더링
        const commentsHTML = this.renderComments(post.commentList);

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
                            <span class="post-date">${this.formatDate(post.date)}</span>
                        </div>
                        <div class="post-right">
                            <button class="profile-more-detail"></button>
                        </div>
                    </div>

                    ${mediaHTML}

                    ${post.text ? `<div class="detail-text">${post.text}</div>` : ''}
                </div>
            </div>
            ${commentsHTML}
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

// 홈 탭 미리보기 렌더링 (흔들림 방지 + 정지 화면 + 마스킹 + GPU 가속)
    renderHomePreview(containerSelector = '.home-section .home-grid') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // 최신 10개 포스트
        const latestPosts = [...this.posts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 9);

        const previewHTML = latestPosts.map(post => {
            const hasMedia = post.media && post.media.length > 0;
            const thumbnail = hasMedia ? post.media[0] : null;
            const isVideo = thumbnail?.type === 'video';
            
            let contentHTML = '';
            
            // 공통 스타일: 꽉 채우기 + GPU 가속(translateZ)
            const commonStyle = "width: 100%; height: 100%; object-fit: cover; display: block; transform: translateZ(0);";
            
            if (thumbnail) {
                if (isVideo) {
                    // 동영상: #t=0.01 (정지화면), pointer-events: none, will-change 최적화
                    contentHTML = `<video src="${this.baseUrl}${thumbnail.src}#t=0.01" 
                                    muted preload="metadata" playsinline 
                                    style="${commonStyle} pointer-events: none; will-change: transform;">
                                   </video>`;
                } else {
                    // 이미지
                    contentHTML = `<img src="${this.baseUrl}${thumbnail.src}" alt="" 
                                    style="${commonStyle}">`;
                }
            } else {
                // 미디어 없음: 텍스트 노출
                const textSnippet = post.text 
                    ? `<div class="home-nomad-text" style="position: relative; bottom: auto; padding: 10px; color: rgba(255,255,255,0.8);">
                        ${post.text.substring(0, 30)}${post.text.length > 30 ? '...' : ''}
                       </div>` 
                    : '';
                
                contentHTML = `
                    <div style="${commonStyle} background: #333; display: flex; align-items: center; justify-content: center; text-align: center;">
                        ${textSnippet}
                    </div>
                `;
            }
            
            // 부모 div 스타일: 마스킹(-webkit-mask-image) 적용으로 모바일 둥근 모서리 흔들림 방지
            return `
                <div class="home-nomad" onclick="window.BSTApp.showNOMADPost('${post.id}')" 
                     style="border-radius: 10px; overflow: hidden; background: #000; transform: translateZ(0); -webkit-mask-image: -webkit-radial-gradient(white, black);">
                    ${contentHTML}
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