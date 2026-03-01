// 스토리 관련 모듈
import { isVideo } from './insta-utils.js';

let currentMediaIndex = 0;

// ✅ 진행 관리(끊김 없는 애니메이션)
let storyProgressRaf = null;
let storyProgressStart = 0;
let storyProgressDuration = 0;

let allMediaItems = []; // 모든 미디어 아이템 (포스트별 images를 펼침)

// 스토리 날짜 그룹 표시
export function showStoryGroup(date, allStories) {
  const dateStories = allStories.filter(story => story.date === date);

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
  const cur = allMediaItems[currentMediaIndex];

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
        <div class="story-username">${cur?.username ?? ''}</div>
        <div class="story-time">${cur?.displayDate ?? ''}</div>
        <div class="story-close" onclick="showProfile('story', true)">✕</div>
      </div>
    </div>

    <!-- 스토리 미디어 컨테이너 -->
    <div class="story-images">
      ${allMediaItems.map((item, i) => {
        if (item.isVideo) {
          return `
            <div class="story-media ${i === currentMediaIndex ? 'active' : ''}" data-index="${i}">
              <video src="${item.url}" playsinline class="story-video"></video>
            </div>
          `;
        }
        return `
          <div class="story-media ${i === currentMediaIndex ? 'active' : ''}" data-index="${i}">
            <img src="${item.url}" class="story-img">
          </div>
        `;
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

// (옵션) 외부에서 닫을 때 호출하면 안전
export function stopStoryViewer() {
  stopStoryProgress();

  // 비디오 정리
  document.querySelectorAll('.story-video').forEach(video => {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (_) {}
  });
}

// 진행 중지
function stopStoryProgress() {
  if (storyProgressRaf) {
    cancelAnimationFrame(storyProgressRaf);
    storyProgressRaf = null;
  }
}

// 진행 시작
function startStoryProgress() {
  stopStoryProgress();

  const currentMedia = allMediaItems[currentMediaIndex];
  if (!currentMedia) return;

  const progressFill = document.querySelector('.story-progress-fill.active');
  if (!progressFill) return;

  // ✅ 다음 스토리로 넘어갈 때도 0% 상태를 확실히 렌더링
  progressFill.style.width = '0%';
  progressFill.offsetWidth; // reflow(중요)

  // 기본(사진) 10초
  let duration = 10000;

  // 비디오면 실제 duration 가져와서 그걸로 진행
  if (currentMedia.isVideo) {
    const videoElement = document.querySelector(`.story-media[data-index="${currentMediaIndex}"] video`);

    if (videoElement) {
      // 재생 시도
      videoElement.play().catch(err => console.log('Video play error:', err));

      const startWithDuration = () => {
        const d = (videoElement.duration && isFinite(videoElement.duration))
          ? videoElement.duration * 1000
          : 10000;
        startProgressBarRaf(d, progressFill);
      };

      // ✅ metadata 이미 로드된 경우도 처리
      if (videoElement.readyState >= 1) startWithDuration();
      else videoElement.addEventListener('loadedmetadata', startWithDuration, { once: true });

      // 비디오 끝나면 다음으로
      videoElement.addEventListener('ended', () => window.nextStory(), { once: true });

      return; // 비디오는 duration 확보 후 시작
    }
  }

  // 사진은 바로 시작
  startProgressBarRaf(duration, progressFill);
}

// ✅ RAF 기반(부드럽게) 프로그레스바
function startProgressBarRaf(duration, progressFill) {
  stopStoryProgress();

  storyProgressStart = performance.now();
  storyProgressDuration = duration;

  const tick = (now) => {
    const elapsed = now - storyProgressStart;
    const p = Math.min(elapsed / storyProgressDuration, 1);

    progressFill.style.width = `${p * 100}%`;

    if (p >= 1) {
      stopStoryProgress();
      window.nextStory();
      return;
    }
    storyProgressRaf = requestAnimationFrame(tick);
  };

  storyProgressRaf = requestAnimationFrame(tick);
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
  stopStoryProgress();

  // 모든 비디오 리셋
  document.querySelectorAll('.story-video').forEach(video => {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (_) {}
  });

  // 미디어 active 토글
  document.querySelectorAll('.story-media').forEach((media, i) => {
    media.classList.toggle('active', i === currentMediaIndex);
  });

  // 진행바 상태 업데이트
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

  // 텍스트 업데이트
  const timeEl = document.querySelector('.story-time');
  if (timeEl) timeEl.textContent = allMediaItems[currentMediaIndex]?.displayDate ?? '';

  const userEl = document.querySelector('.story-username');
  if (userEl) userEl.textContent = allMediaItems[currentMediaIndex]?.username ?? '';

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