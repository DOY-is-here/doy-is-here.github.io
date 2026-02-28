// 그리드 렌더링 모듈

// 동영상 파일인지 확인
export function isVideo(url) {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/) !== null;
}

// YouTube 썸네일 URL 생성
function getYouTubeThumbnail(youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

// YouTube 임베드 리스트 렌더링 (동영상 탭)
export function renderVideoList(videos) {
    if (!videos || videos.length === 0) {
        return '<div class="empty-state">동영상이 없습니다</div>';
    }
    
    return `
        <div class="video-list">
            ${videos.map(video => `
                <div class="video-item" data-video-id="${video.id}" data-youtube-id="${video.youtubeId}">
                    <div class="video-thumbnail">
                        <img src="${getYouTubeThumbnail(video.youtubeId)}" alt="${video.title}" loading="lazy">
                        <div class="play-overlay">
                            <svg viewBox="0 0 24 24" width="48" height="48">
                                <path fill="white" d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-meta">${video.uploadDate}</div>
                    </div>
                    <div class="video-menu"></div>
                </div>
            `).join('')}
        </div>
    `;
}

// YouTube 임베드 플레이어 렌더링 (전체 재생 화면)
export function renderYouTubeEmbed(video) {
    return `
        <div class="video-player-page">
            <!-- 상단 헤더 -->
            <div class="video-player-header">
                <div class="header-icon back" id="closeVideoPlayer"></div>
            </div>
            
            <!-- 영상 플레이어 -->
            <div class="video-player-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            
            <!-- 영상 정보 섹션 -->
            <div class="video-info-section">
                <!-- 제목 -->
                <h1 class="video-player-title">${video.title}</h1>
                
                <!-- 채널 정보 -->
                <div class="video-channel-info">
                   <div class="video-channel-name">@NOMAD_is_here</div>
                    <div class="video-stats">${video.uploadDate}</div>
                </div>
                
                <!-- 액션 버튼들 -->
                <div class="video-actions">
                    <div class="video-channel-avatar"></div>
                    <button class="action-btn subscribe-action">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22Z" fill="currentColor"/>
                            <path d="M10.5 8V16L16.5 12L10.5 8Z" fill="white"/>
                        </svg>
                    </button>
                    <button class="action-btn like-action">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18.77 11H14.54L16.06 6.06C16.38 5.03 15.54 4 14.38 4C13.8 4 13.24 4.24 12.86 4.65L7 11H3V21H7H8H17.43C18.49 21 19.41 20.33 19.62 19.39L20.96 13.39C21.23 12.15 20.18 11 18.77 11Z" fill="currentColor"/>
                        </svg>
                        <span>5.3천</span>
                    </button>
                    <button class="action-btn dislike-action">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M17 3H7H6H3V13H6H7L12.86 19.35C13.24 19.76 13.8 20 14.38 20C15.54 20 16.38 18.97 16.06 17.94L14.54 13H18.77C20.18 13 21.23 11.85 20.96 10.61L19.62 4.61C19.41 3.67 18.49 3 17.43 3H17Z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="action-btn share-action">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 5.63L20.66 12L15 18.37V14.99C8.93 14.99 4.85 16.92 2 21C3.24 15.84 6.59 10.68 15 9.99V5.63Z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="action-btn more-action">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="5" r="2" fill="currentColor"/>
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
                            <circle cx="12" cy="19" r="2" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="action-btn bookmark-action">
                        <span>저장</span>
                    </button>
                </div>
                <div class="comment-preview">
                    <div class="comment-content">
                        <div class="comment-text">오늘 슬터뷰 보고 정말 많은 생각했습니다. 더 이상은 못하겠어요...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Shorts 그리드 렌더링 (9:16 비율)
export function renderShortsGrid(shorts) {
    console.log('renderShortsGrid called with:', shorts?.length || 0, 'items');
    
    if (!shorts || shorts.length === 0) {
        console.log('No shorts data');
        return '<div class="empty-state">Shorts가 없습니다</div>';
    }
    
    const html = `
        <div class="shorts-grid">
            ${shorts.map(short => `
                <div class="shorts-item" data-short-id="${short.id}" data-video-url="${short.videoUrl}">
                    <video 
                        src="${short.videoUrl}" 
                        preload="metadata" 
                        muted 
                        playsinline
                        loop
                    ></video>
                    <div class="shorts-overlay">
                        <div class="shorts-title">${short.title}</div>
                        <div class="shorts-date">${short.uploadDate}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return html;
}

// Shorts 전체화면 플레이어 렌더링
export function renderShortsPlayer(short) {
    return `
        <div class="shorts-player-container">
            <div class="shorts-player-header">
                <div class="header-icon back" id="closeShortsPlayer"></div>
                <div class="shorts-player-title">Shorts</div>
            </div>
            <div class="shorts-player-wrapper">
                <video 
                    src="${short.videoUrl}" 
                    autoplay 
                    loop 
                    playsinline
                    id="shortsPlayerVideo"
                ></video>
                <div class="shorts-player-info">
                    <div class="shorts-player-channel">@NOMAD_is_here</div>
                    <div class="shorts-player-desc">${short.title}</div>
                </div>
            </div>
        </div>
    `;
}

// 그리드 비디오 썸네일 초기화
export function initGridVideoThumbnails() {
    const gridVideos = document.querySelectorAll('.shorts-item video');
    gridVideos.forEach(video => {
        // 메타데이터 로드 후 영상 중간 지점으로 이동 (검은 화면 방지)
        video.addEventListener('loadedmetadata', function() {
            // 영상 길이의 10% 지점 또는 최소 1초 지점으로 이동
            const seekTime = Math.max(1, this.duration * 0.1);
            this.currentTime = Math.min(seekTime, this.duration - 0.5);
        }, { once: true });
        
        // seeked 이벤트로 썸네일 준비 완료 확인
        video.addEventListener('seeked', function() {
            // 썸네일 로드 완료
            this.closest('.shorts-item')?.classList.add('thumbnail-ready');
        }, { once: true });
        
        // 호버 시 재생
        const item = video.closest('.shorts-item');
        if (item) {
            item.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });
            item.addEventListener('mouseleave', () => {
                video.pause();
                // 다시 썸네일 위치로
                const seekTime = Math.max(1, video.duration * 0.1);
                video.currentTime = Math.min(seekTime, video.duration - 0.5);
            });
        }
    });
}

// 재생목록 그리드 렌더링
export function renderPlaylistGrid(playlists) {
    if (!playlists || playlists.length === 0) {
        return '<div class="empty-state">재생목록이 없습니다</div>';
    }
    
    return `
        <div class="playlist-list">
            ${playlists.map(playlist => `
                <div class="playlist-item" data-playlist-name="${playlist.name}">
                    <div class="playlist-thumbnail">${playlist.icon}</div>
                    <div class="playlist-info">
                        <div class="playlist-name">${playlist.name}</div>
                    </div>
                    <div class="video-menu"></div>
                </div>
            `).join('')}
        </div>
    `;
}