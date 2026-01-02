// 탭 전환 관리
import { getContentByTab } from './youtube-data.js';
import { renderVideoList, renderShortsGrid, initGridVideoThumbnails } from './youtube-grid.js';

let currentTab = 'home';

export function renderContent(tab) {
    currentTab = tab;
    const content = document.getElementById('content');
    const data = getContentByTab(tab);
    
    if (tab === 'shorts') {
        // Shorts 탭 - 9:16 그리드
        content.innerHTML = renderShortsGrid(data);
        
        // 비디오 썸네일 초기화
        requestAnimationFrame(() => {
            initGridVideoThumbnails();
        });
    } else if (tab === 'home' || tab === 'videos') {
        // 홈/동영상 탭 - 리스트
        content.innerHTML = renderVideoList(data);
    } else {
        // 기타 탭
        content.innerHTML = '<div class="empty-state">준비 중입니다</div>';
    }
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
        });
    });
}

export function getCurrentTab() {
    return currentTab;
}
