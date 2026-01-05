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
                            ${video.uploadDate}
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
    console.log('renderShortsGrid called with:', shorts);
    
    if (!shorts || shorts.length === 0) {
        console.log('No shorts data');
        return '<div class="empty-state">Shorts가 없습니다</div>';
    }
    
    const html = `
        <div class="shorts-grid grid-916">
            ${shorts.map(short => {
                const isVideoFile = isVideo(short.thumbnail);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" data-short-id="${short.id}">
                            <video src="${short.thumbnail}" preload="metadata" muted playsinline class="grid-video"></video>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" data-short-id="${short.id}" style="background-image: url('${short.thumbnail}')">
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
    
    console.log('Generated HTML length:', html.length);
    return html;
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