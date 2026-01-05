// 탭 관련 기능 모듈
import { initGridVideoThumbnails, initStoryGridVideos } from './insta-grid.js';

let currentTab = 'grid';
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

// 탭 초기화
export function initTabs() {
    const tabs = document.querySelectorAll(".tab-item");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab;
            document.querySelector(`.tab-content[data-content="${tab.dataset.tab}"]`).classList.add("active");
            
            // 스크롤 맨 위로 초기화
            window.scrollTo(0, 0);
            
            setTimeout(() => {
                initGridVideoThumbnails();
                initStoryGridVideos();
            }, 100);
        });
    });
    
    const tabsContainer = document.getElementById('tabs-container');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', function(e) {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem && gridItem.dataset.postId) {
                e.preventDefault();
                e.stopPropagation();
                window.showPost(gridItem.dataset.postId, parseInt(gridItem.dataset.imageIndex) || 0);
            }
        });
    }
}

// 탭 전환
export function switchTab(tabName) {
    currentTab = tabName;
    
    // 탭 UI 업데이트
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.content === tabName);
    });
    
    // 스크롤 맨 위로 초기화
    window.scrollTo(0, 0);
    
    // 비디오 썸네일 초기화
    setTimeout(() => {
        initGridVideoThumbnails();
        initStoryGridVideos();
    }, 100);
}

// 스와이프 초기화
export function initSwipe() {
    const container = document.getElementById('tabs-container');
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
}

// 스와이프 처리
function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) < swipeThreshold || Math.abs(diffY) > Math.abs(diffX)) return;
    
    const tabs = ['grid', 'tagged', 'story', 'repost'];
    const currentIndex = tabs.indexOf(currentTab);
    if (diffX > 0 && currentIndex < tabs.length - 1) {
        switchTab(tabs[currentIndex + 1]);
    } else if (diffX < 0 && currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
    }
}

// 현재 탭 가져오기
export function getCurrentTab() {
    return currentTab;
}

// 현재 탭 설정
export function setCurrentTab(tab) {
    currentTab = tab;
}