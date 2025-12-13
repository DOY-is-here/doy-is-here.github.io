// 그리드 렌더링 모듈

// 영상 파일인지 확인하는 함수
export function isVideo(url) {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/) !== null;
}

// 그리드 렌더링 (3:4 비율) - 일반 포스트
export function renderGrid(postsArray) {
    return `
        <div class="posts-grid grid-34">
            ${postsArray.map(post => {
                const firstMedia = post.images[0];
                const isVideoFile = isVideo(firstMedia);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" onclick="showPost('${post.id}')">
                            <video src="${firstMedia}" preload="metadata" muted playsinline class="grid-video"></video>
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            <div class="video-icon"></div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" onclick="showPost('${post.id}')" style="background-image: url('${firstMedia}')">
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            ${post.type === 'reel' ? '<div class="reel-icon"></div>' : ''}
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 태그 그리드 렌더링 (insta-group)
export function renderTaggedGrid(getTaggedPosts) {
    const tagged = getTaggedPosts();
    if (tagged.length === 0) {
        return renderEmptyTag();
    }
    
    return `
        <div class="posts-grid grid-34">
            ${tagged.map(post => {
                const firstMedia = post.images[0];
                const isVideoFile = isVideo(firstMedia);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" onclick="showPost('${post.id}')">
                            <video src="${firstMedia}" preload="metadata" muted playsinline class="grid-video"></video>
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            <div class="video-icon"></div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" onclick="showPost('${post.id}')" style="background-image: url('${firstMedia}')">
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            ${isVideo(firstMedia) ? '<div class="video-icon"></div>' : ''}
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 스토리 그리드 렌더링 - 9:16 비율
export function renderStoryGrid(getStories) {
    const stories = getStories();
    if (stories.length === 0) {
        return renderEmptyTag();
    }
    
    return `
        <div class="posts-grid grid-916">
            ${stories.map(story => {
                const firstMedia = story.images[0];
                const isVideoFile = isVideo(firstMedia);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" onclick="showStoryGroup('${story.date}')">
                            <video src="${firstMedia}" preload="metadata" muted playsinline class="grid-video"></video>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" onclick="showStoryGroup('${story.date}')" style="background-image: url('${firstMedia}')">
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 리포스트 그리드 렌더링
export function renderRepostGrid(posts, getTaggedPosts) {
    const gridPosts = [...posts];
    const taggedPosts = getTaggedPosts();
    
    // 모든 포스트 합치기
    const allPosts = [...taggedPosts, ...gridPosts];
    
    // 날짜순 정렬 (최신순) - 같은 날짜면 태그가 먼저
    allPosts.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        // 같은 날짜면 태그 우선
        if (a.type === 'group' && b.type !== 'group') return -1;
        if (a.type !== 'group' && b.type === 'group') return 1;
        return 0;
    });
    
    // 중복 제거 (같은 id면 첫 번째만 유지)
    const uniquePosts = [];
    const seenIds = new Set();
    for (const post of allPosts) {
        if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            uniquePosts.push(post);
        }
    }
    
    return `
        <div class="posts-grid grid-34">
            ${uniquePosts.map(post => {
                const firstMedia = post.images[0];
                const isVideoFile = isVideo(firstMedia);
                
                if (isVideoFile) {
                    return `
                        <div class="grid-item grid-item-video" onclick="showPost('${post.id}')">
                            <video src="${firstMedia}" preload="metadata" muted playsinline class="grid-video"></video>
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            <div class="video-icon"></div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="grid-item" onclick="showPost('${post.id}')" style="background-image: url('${firstMedia}')">
                            ${post.images.length > 1 ? '<div class="multi-icon"></div>' : ''}
                            ${post.type === 'reel' ? '<div class="reel-icon"></div>' : ''}
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 빈 태그 탭 렌더링
export function renderEmptyTag() {
    return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #8e8e8e;">
            <div style="font-size: 60px; margin-bottom: 20px;">📷</div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">콘텐츠 없음</div>
            <div style="font-size: 14px;">아직 아무것도 없습니다.</div>
        </div>
    `;
}

// 그리드 비디오 썸네일 초기화
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

// 스토리 그리드 비디오 초기화
export function initStoryGridVideos() {
    const storyVideos = document.querySelectorAll('.grid-916 .grid-video');
    storyVideos.forEach(video => {
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