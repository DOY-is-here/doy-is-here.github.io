// 그리드 렌더링 모듈 (Instagram 스타일)

// 동영상 파일인지 확인
export function isVideo(url) {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/) !== null;
}

// 일반 동영상 리스트 렌더링
export function renderVideoList(videos) {
    if (!videos || videos.length === 0) {
        return '<div class="empty-state">동영상이 없습니다</div>';
    }
    
    return `
        <div class="video-list">
            ${videos.map(video => `
                <div class="video-item" data-video-id="${video.id}">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <div class="video-duration">${video.duration}</div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-meta">
                            조회수 ${video.views} • ${video.uploadDate}
                        </div>
                    </div>
                    <div class="video-options">
                        <div class="header-icon menu"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Shorts 그리드 렌더링 (9:16 비율 - Instagram 스토리 그리드와 동일)
export function renderShortsGrid(shorts) {
    if (!shorts || shorts.length === 0) {
        return '<div class="empty-state">Shorts가 없습니다</div>';
    }
    
    return `
        <div class="shorts-grid grid-916">
            ${shorts.map(short => {
                const isVideoFile = isVideo(short.thumbnail);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" data-short-id="${short.id}">
                            <video src="${short.thumbnail}" preload="metadata" muted playsinline class="grid-video"></video>
                            <div class="shorts-views">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                    <path d="M8 3C4.5 3 1.73 5.61 1 9c.73 3.39 3.5 6 7 6s6.27-2.61 7-6c-.73-3.39-3.5-6-7-6zm0 10c-2.76 0-5.14-1.95-5.93-4.5C2.86 5.95 5.24 4 8 4s5.14 1.95 5.93 4.5C13.14 11.05 10.76 13 8 13zm0-7c-1.38 0-2.5 1.12-2.5 2.5S6.62 11 8 11s2.5-1.12 2.5-2.5S9.38 6 8 6z"/>
                                </svg>
                                ${short.views}
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" data-short-id="${short.id}" style="background-image: url('${short.thumbnail}')">
                            <div class="shorts-views">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                    <path d="M8 3C4.5 3 1.73 5.61 1 9c.73 3.39 3.5 6 7 6s6.27-2.61 7-6c-.73-3.39-3.5-6-7-6zm0 10c-2.76 0-5.14-1.95-5.93-4.5C2.86 5.95 5.24 4 8 4s5.14 1.95 5.93 4.5C13.14 11.05 10.76 13 8 13zm0-7c-1.38 0-2.5 1.12-2.5 2.5S6.62 11 8 11s2.5-1.12 2.5-2.5S9.38 6 8 6z"/>
                                </svg>
                                ${short.views}
                            </div>
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 그리드 비디오 썸네일 초기화 (Instagram과 동일)
export function initGridVideoThumbnails() {
    const gridVideos = document.querySelectorAll('.grid-video');
    gridVideos.forEach(video => {
        // 이미 메타데이터가 로드된 경우 즉시 설정
        if (video.readyState >= 1) {
            video.currentTime = 0.1;
        }
        
        // 아직 로드 안 된 경우 이벤트 리스너 추가
        video.addEventListener('loadedmetadata', function() {
            this.currentTime = 0.1;
        }, { once: true });
    });
}
