// 탭 전환 관리
import { getContentByTab, loadShortsFromGitHub, allVideos, videos, shorts, lives, playlists, getVideosByPlaylist } from './youtube-data.js';
import { renderVideoList, renderShortsGrid, renderYouTubeEmbed, renderShortsPlayer, renderPlaylistGrid, initGridVideoThumbnails } from './youtube-grid.js';

let currentTab = 'home';
let shortsLoaded = false;

export async function renderContent(tab) {
    currentTab = tab;
    const content = document.getElementById('content');
    
    if (tab === 'shorts') {
        // Shorts 탭 - GitHub에서 로드 + 필터 칩
        if (!shortsLoaded) {
            await loadShortsFromGitHub();
            shortsLoaded = true;
        }
        
        const data = getContentByTab(tab);
        console.log('Rendering shorts grid with', data.length, 'items');
        content.innerHTML = `
            ${renderFilterChips()}
            ${renderShortsGrid(data)}
        `;
        
        // 비디오 썸네일 초기화
        requestAnimationFrame(() => {
            initGridVideoThumbnails();
            initShortsEvents();
        });
    } else if (tab === 'home') {
        // 홈 탭 - 전체 비디오 리스트 (필터 칩 없음)
        const data = getContentByTab(tab);
        content.innerHTML = renderVideoList(data);
        initVideoEvents();
    } else if (tab === 'videos') {
        // 동영상 탭 - 필터 칩 + 일반 동영상만
        const data = getContentByTab(tab);
        content.innerHTML = `
            ${renderFilterChips()}
            ${renderVideoList(data)}
        `;
        initVideoEvents();
    } else if (tab === 'live') {
        // 라이브 탭
        const data = getContentByTab(tab);
        if (data.length === 0) {
            content.innerHTML = '<div class="empty-state">라이브 영상이 없습니다</div>';
        } else {
            content.innerHTML = renderVideoList(data);
            initVideoEvents();
        }
    } else if (tab === 'playlists') {
        // 재생목록 탭
        const data = getContentByTab(tab);
        content.innerHTML = renderPlaylistGrid(data);
        initPlaylistEvents();
    } else {
        // 기타 탭
        content.innerHTML = '<div class="empty-state">준비 중입니다</div>';
    }
    
    // 필터 칩 이벤트 초기화
    initFilterChips();
}

// 필터 칩 렌더링
function renderFilterChips() {
    const filters = ['최신순', '날짜순'];
    
    return `
        <div class="chips">
            ${filters.map((filter, index) => `
                <button class="chip ${index === 0 ? 'active' : ''}" data-filter="${filter}">
                    ${filter}
                </button>
            `).join('')}
        </div>
    `;
}

export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // 활성 탭 변경
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 콘텐츠 렌더링
            const tabName = tab.dataset.tab;
            await renderContent(tabName);
        });
    });
}

// 필터 칩 이벤트 초기화
export function initFilterChips() {
    const chips = document.querySelectorAll('.chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
}

// 동영상 클릭 이벤트 초기화
function initVideoEvents() {
    document.querySelectorAll('.video-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // 옵션 버튼 클릭 시 동영상 열지 않기
            if (e.target.closest('.header-icon.menu')) {
                console.log('옵션 메뉴 클릭');
                return;
            }
            
            const youtubeId = item.dataset.youtubeId;
            const video = allVideos.find(v => v.youtubeId === youtubeId);
            
            if (video) {
                showYouTubeEmbed(video);
            }
        });
    });
}

// YouTube 임베드 플레이어 표시
function showYouTubeEmbed(video) {
    const root = document.getElementById('youtube-root');
    
    // 임베드 컨테이너 생성
    const embedDiv = document.createElement('div');
    embedDiv.id = 'embed-overlay';
    embedDiv.innerHTML = renderYouTubeEmbed(video.youtubeId, video.title);
    root.appendChild(embedDiv);
    
    // 닫기 버튼 이벤트
    document.getElementById('closeEmbed').addEventListener('click', () => {
        embedDiv.remove();
    });
    
    // 배경 클릭 시 닫기
    embedDiv.addEventListener('click', (e) => {
        if (e.target === embedDiv) {
            embedDiv.remove();
        }
    });
}

// Shorts 클릭 이벤트 초기화
function initShortsEvents() {
    document.querySelectorAll('.shorts-item').forEach(item => {
        item.addEventListener('click', () => {
            const shortId = item.dataset.shortId;
            const short = shorts.find(s => s.id === shortId);
            
            if (short) {
                showShortsPlayer(short);
            }
        });
    });
}

// Shorts 전체화면 플레이어 표시
function showShortsPlayer(short) {
    const root = document.getElementById('youtube-root');
    
    // 플레이어 컨테이너 생성
    const playerDiv = document.createElement('div');
    playerDiv.id = 'shorts-overlay';
    playerDiv.innerHTML = renderShortsPlayer(short);
    root.appendChild(playerDiv);
    
    // 닫기 버튼 이벤트
    document.getElementById('closeShortsPlayer').addEventListener('click', () => {
        playerDiv.remove();
    });
    
    // 비디오 클릭 시 재생/일시정지
    const video = document.getElementById('shortsPlayerVideo');
    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });
    
    // 음소거 해제 시도
    video.muted = false;
    video.play().catch(() => {
        // 자동 재생 실패 시 음소거로 재생
        video.muted = true;
        video.play();
    });
}

// 재생목록 클릭 이벤트 초기화
function initPlaylistEvents() {
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const playlistName = item.dataset.playlistName;
            showPlaylistVideos(playlistName);
        });
    });
}

// 재생목록 상세 보기
function showPlaylistVideos(playlistName) {
    const content = document.getElementById('content');
    const playlistVideos = getVideosByPlaylist(playlistName);
    
    content.innerHTML = `
        <div class="playlist-header">
            <button class="back-to-playlists">← 재생목록</button>
            <h3 class="playlist-title">${playlistName}</h3>
            <span class="playlist-count">${playlistVideos.length}개 동영상</span>
        </div>
        ${renderVideoList(playlistVideos)}
    `;
    
    // 뒤로가기 버튼 이벤트
    document.querySelector('.back-to-playlists').addEventListener('click', () => {
        renderContent('playlists');
    });
    
    initVideoEvents();
}

export function getCurrentTab() {
    return currentTab;
}