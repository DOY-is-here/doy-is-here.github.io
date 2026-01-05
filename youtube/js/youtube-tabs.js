// 탭 전환 관리
import { getContentByTab } from './youtube-data.js';
import { renderVideoList, renderShortsGrid, initGridVideoThumbnails } from './youtube-grid.js';

let currentTab = 'home';

export function renderContent(tab) {
    currentTab = tab;
    const content = document.getElementById('content');
    const data = getContentByTab(tab);
    
    console.log('renderContent:', tab, 'data length:', data?.length);
    
    if (tab === 'shorts') {
        // Shorts 탭 - 9:16 그리드
        console.log('Rendering shorts grid with', data.length, 'items');
        content.innerHTML = renderShortsGrid(data);
        
        // 비디오 썸네일 초기화
        requestAnimationFrame(() => {
            initGridVideoThumbnails();
        });
    } else if (tab === 'home') {
        // 홈 탭 - 필터 칩 + 비디오 리스트
        content.innerHTML = `
            ${renderFilterChips()}
            ${renderVideoList(data)}
        `;
    } else if (tab === 'videos') {
        // 동영상 탭 - 리스트
        content.innerHTML = renderVideoList(data);
    } else {
        // 기타 탭
        content.innerHTML = '<div class="empty-state">준비 중입니다</div>';
    }
}

// 필터 칩 렌더링
function renderFilterChips() {
    const filters = ['전체', '최근에 업로드된 동영상', '인기 급상승', '음악', '라이브', '게시물'];
    
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
        tab.addEventListener('click', () => {
            // 활성 탭 변경
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 콘텐츠 렌더링
            const tabName = tab.dataset.tab;
            renderContent(tabName);
            
            // 필터 칩 이벤트 초기화
            initFilterChips();
            
            // 콘텐츠 클릭 이벤트 초기화
            initContentEvents(tabName);
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

// 콘텐츠 클릭 이벤트 초기화
export function initContentEvents(tab) {
    // 필터 칩 이벤트 초기화
    initFilterChips();
    
    if (tab === 'shorts') {
        // Shorts 아이템 클릭
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const shortId = item.dataset.shortId;
                console.log('Shorts 클릭:', shortId);
                // TODO: Shorts 상세 페이지 표시
            });
        });
    } else if (tab === 'home' || tab === 'videos') {
        // 비디오 아이템 클릭
        document.querySelectorAll('.video-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 옵션 버튼 클릭 시 동영상 열지 않기
                if (e.target.closest('.video-options')) {
                    console.log('옵션 메뉴 클릭');
                    return;
                }
                
                const videoId = item.dataset.videoId;
                console.log('비디오 클릭:', videoId);
                // TODO: 비디오 상세 페이지 표시
            });
        });
    }
}

export function getCurrentTab() {
    return currentTab;
}