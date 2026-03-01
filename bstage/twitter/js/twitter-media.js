// 미디어 관련 함수 모듈
import { formatDuration } from './twitter-utils.js';

// 미디어 그리드 렌더링 (타임라인용)
export function renderMedia(images) {
    if (!images || images.length === 0) return '';
    
    const count = images.length;
    const countClass = `count-${Math.min(count, 4)}`;
    
    const mediaItems = images.slice(0, 4).map((img, index) => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(img);
        
        if (isVideo) {
            return `<div class="media-item video-thumbnail" data-video-src="${img}">
                <video src="${img}" 
                       class="timeline-video"
                       playsinline 
                       muted 
                       loop 
                       preload="metadata"
                       data-autoplay="true"></video>
                <div class="video-play-icon"></div>
                <div class="video-duration-overlay" data-video-url="${img}">0:00</div>
            </div>`;
        } else {
            return `<div class="media-item"><img src="${img}" alt="트윗 이미지" loading="lazy"></div>`;
        }
    }).join('');
    
    return `
        <div class="tweet-media">
            <div class="media-grid ${countClass}">
                ${mediaItems}
            </div>
        </div>
    `;
}

// 동영상 길이 로드 및 표시
export function loadVideoDurations() {
    const overlays = document.querySelectorAll('.video-duration-overlay[data-video-url]');
    
    overlays.forEach((overlay, index) => {
        const videoUrl = overlay.dataset.videoUrl;
        
        // 이미 로드된 경우 건너뛰기
        if (overlay.dataset.loaded === 'true') return;
        
        overlay.dataset.loaded = 'loading';
        
        // 각 비디오를 순차적으로 로드 (50ms 간격)
        setTimeout(() => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.crossOrigin = 'anonymous';
            
            video.addEventListener('loadedmetadata', function() {
                const duration = this.duration;
                if (duration && !isNaN(duration)) {
                    overlay.textContent = formatDuration(duration);
                    overlay.dataset.loaded = 'true';
                }
                // ✅ landscape/portrait 클래스 추가 코드 삭제!
                // CSS에서 이미 aspect-ratio로 고정했으므로 불필요
            }, { once: true });
            
            video.addEventListener('error', function() {
                console.warn('비디오 메타데이터 로드 실패:', videoUrl);
                overlay.textContent = '0:00';
                overlay.dataset.loaded = 'error';
            }, { once: true });
            
            video.src = videoUrl;
        }, index * 50);
    });
}

// 타임라인 동영상 자동재생 설정
export function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.timeline-video');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
                // 75% 이상 보이면 재생
                video.play().catch(err => {
                    console.log('자동재생 실패:', err);
                });
            } else {
                // 화면에서 벗어나면 일시정지
                video.pause();
            }
        });
    }, {
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
    });
    
    videos.forEach(video => {
        observer.observe(video);
        
        // 첫 프레임 표시
        video.addEventListener('loadedmetadata', function() {
            this.currentTime = 0.1;
        }, { once: true });
    });
}

// 사진 그리드 비디오 썸네일 초기화
export function initPhotoGridVideos() {
    const gridVideos = document.querySelectorAll('.photo-grid-item video');
    gridVideos.forEach(video => {
        // 로드 완료 표시 - 중복 초기화 방지
        if (video.dataset.initialized === 'true') return;
        
        // 이미 메타데이터가 로드된 경우 즉시 설정
        if (video.readyState >= 1) {
            video.currentTime = 0.1;
            video.pause(); // 완전히 정지
            video.dataset.initialized = 'true';
        }
        
        // 아직 로드 안 된 경우 이벤트 리스너 추가
        video.addEventListener('loadedmetadata', function() {
            this.currentTime = 0.1;
            this.pause(); // 완전히 정지
            this.dataset.initialized = 'true';
            // 썸네일 설정 후 더 이상 로드하지 않도록
            this.preload = 'none';
        }, { once: true });
        
        // seeked 이벤트로 확실하게 정지
        video.addEventListener('seeked', function() {
            this.pause();
        }, { once: true });
    });
}