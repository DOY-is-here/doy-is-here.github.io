// 유틸리티 함수들

// 영상 파일인지 확인하는 함수
export function isVideo(url) {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/) !== null;
}

// 비디오 썸네일 초기화 (재사용 가능한 헬퍼)
export function initVideoThumbnails(selector) {
    const videos = document.querySelectorAll(selector);
    videos.forEach(video => {
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
