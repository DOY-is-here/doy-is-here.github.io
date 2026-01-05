// 스토리 관련 모듈
import { isVideo } from './insta-utils.js';

let currentMediaIndex = 0;
let storyProgressInterval = null;
let allMediaItems = []; // 모든 미디어 아이템 (포스트별 images를 펼침)

// 스토리 날짜 그룹 표시
export function showStoryGroup(date, allStories) {
    // 해당 날짜의 모든 스토리 찾기
    const dateStories = allStories.filter(story => story.date === date);
    
    // 각 스토리의 모든 이미지를 개별 미디어로 펼치기
    allMediaItems = [];
    dateStories.forEach(story => {
        story.images.forEach(mediaUrl => {
            allMediaItems.push({
                url: mediaUrl,
                isVideo: isVideo(mediaUrl),
                displayDate: story.displayDate,
                username: story.username
            });
        });
    });
    
    currentMediaIndex = 0;
    return renderStoryViewer();
}

// 스토리 뷰어 렌더링
export function renderStoryViewer() {
    return `
        <!-- 스토리 헤더 -->
        <div class="story-header">
            <div class="story-progress-bars">
                ${allMediaItems.map((_, i) => `
                    <div class="story-progress-bar">
                        <div class="story-progress-fill ${i === currentMediaIndex ? 'active' : ''} ${i < currentMediaIndex ? 'completed' : ''}"></div>
                    </div>
                `).join('')}
            </div>
            <div class="story-top-info">
                <div class="story-avatar"></div>
                <div class="story-username">${allMediaItems[currentMediaIndex].username}</div>
                <div class="story-time">${allMediaItems[currentMediaIndex].displayDate}</div>
                <div class="story-close" onclick="showProfile('story', true)">✕</div>
            </div>
        </div>
        
        <!-- 스토리 미디어 컨테이너 -->
        <div class="story-images">
            ${allMediaItems.map((item, i) => {
                if (item.isVideo) {
                    return `
                        <div class="story-media ${i === currentMediaIndex ? 'active' : ''}" data-index="${i}">
                            <video src="${item.url}" playsinline class="story-video" data-duration="0"></video>
                        </div>
                    `;
                } else {
                    return `
                        <div class="story-media ${i === currentMediaIndex ? 'active' : ''}" data-index="${i}">
                            <img src="${item.url}" class="story-img">
                        </div>
                    `;
                }
            }).join('')}
        </div>
        
        <!-- 스토리 네비게이션 영역 -->
        <div class="story-nav-left" onclick="previousStory()"></div>
        <div class="story-nav-right" onclick="nextStory()"></div>
    `;
}

// 스토리 뷰어 초기화
export function initStoryViewer() {
    startStoryProgress();
}

// 스토리 진행 시작
function startStoryProgress() {
    if (storyProgressInterval) {
        clearInterval(storyProgressInterval);
    }
    
    const currentMedia = allMediaItems[currentMediaIndex];
    const progressFill = document.querySelector('.story-progress-fill.active');
    if (!progressFill) return;
    
    let duration = 10000; // 사진 기본 10초
    
    // 비디오인 경우 실제 길이 가져오기
    if (currentMedia.isVideo) {
        const videoElement = document.querySelector(`.story-media[data-index="${currentMediaIndex}"] video`);
        if (videoElement) {
            // 비디오 재생
            videoElement.play().catch(err => console.log('Video play error:', err));
            
            // 비디오 길이 확인
            videoElement.addEventListener('loadedmetadata', function() {
                duration = this.duration * 1000; // 초를 밀리초로
                startProgressBar(duration, progressFill);
            }, { once: true });
            
            // 비디오 종료 시 다음으로
            videoElement.addEventListener('ended', function() {
                window.nextStory();
            }, { once: true });
            
            return; // 비디오는 loadedmetadata에서 프로그레스바 시작
        }
    }
    
    // 사진인 경우 바로 프로그레스바 시작
    startProgressBar(duration, progressFill);
}

// 프로그레스바 애니메이션
function startProgressBar(duration, progressFill) {
    let progress = 0;
    const interval = 50;
    const increment = (interval / duration) * 100;
    
    storyProgressInterval = setInterval(() => {
        progress += increment;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(storyProgressInterval);
            window.nextStory();
        }
    }, interval);
}

// 다음 스토리
export function nextStory() {
    if (currentMediaIndex < allMediaItems.length - 1) {
        currentMediaIndex++;
        updateStory();
    } else {
        window.showProfile('story', true);
    }
}

// 이전 스토리
export function previousStory() {
    if (currentMediaIndex > 0) {
        currentMediaIndex--;
        updateStory();
    }
}

// 스토리 업데이트
function updateStory() {
    // 모든 비디오 일시정지
    document.querySelectorAll('.story-video').forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
    
    // 모든 미디어 숨기기
    document.querySelectorAll('.story-media').forEach((media, i) => {
        media.classList.remove('active');
        if (i === currentMediaIndex) {
            media.classList.add('active');
        }
    });
    
    // 프로그레스바 업데이트
    document.querySelectorAll('.story-progress-fill').forEach((bar, i) => {
        bar.classList.remove('active', 'completed');
        if (i === currentMediaIndex) {
            bar.classList.add('active');
            bar.style.width = '0%';
        } else if (i < currentMediaIndex) {
            bar.classList.add('completed');
            bar.style.width = '100%';
        } else {
            bar.style.width = '0%';
        }
    });
    
    // 시간 업데이트
    document.querySelector('.story-time').textContent = allMediaItems[currentMediaIndex].displayDate;
    
    // 새 스토리 진행 시작
    startStoryProgress();
}

// 현재 인덱스 가져오기 (외부에서 사용)
export function getCurrentMediaIndex() {
    return currentMediaIndex;
}

// 전체 미디어 아이템 가져오기
export function getAllMediaItems() {
    return allMediaItems;
}