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
                    <div class="header-icon menu"></div>
                </div>
            `).join('')}
        </div>
    `;
}

// YouTube 임베드 플레이어 렌더링
export function renderYouTubeEmbed(youtubeId, title) {
    return `
        <div class="youtube-embed-container">
            <div class="youtube-embed-header">
                <div class="header-icon back" id="closeEmbed"></div>
                <div class="embed-title">${title}</div>
            </div>
            <div class="youtube-embed-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
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
        <div class="playlist-grid">
            ${playlists.map(playlist => `
                <div class="playlist-item" data-playlist-name="${playlist.name}">
                    <div class="playlist-icon">${playlist.icon}</div>
                    <div class="playlist-info">
                        <div class="playlist-name">${playlist.name}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}