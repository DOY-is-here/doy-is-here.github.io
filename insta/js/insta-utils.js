// 공통 유틸리티 함수

// 영상 파일인지 확인하는 함수
export function isVideo(url) {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/) !== null;
}