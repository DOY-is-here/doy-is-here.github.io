// 메인 앱 파일
import { initProfilePage } from './twitter-profile.js';
import { createDetailPage, initDetailPageBackButton } from './twitter-detail.js';
import { renderTimeline, initTabs } from './twitter-timeline.js';
import { initScroll } from './twitter-scroll.js';

// 탭별 스크롤 위치 저장
let scrollPositions = {
    posts: 0,
    highlights: 0,
    photos: 0
};

let currentTab = 'posts';

function setCurrentTab(tab) {
    currentTab = tab;
}

function getCurrentTab() {
    return currentTab;
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('twitter-root');
    
    // 프로필 페이지 생성
    initProfilePage();
    
    // 디테일 페이지 추가
    root.insertAdjacentHTML('beforeend', createDetailPage());
    
    // 초기 타임라인 렌더링
    renderTimeline('posts', scrollPositions, currentTab);
    
    // 탭 이벤트 초기화
    initTabs(scrollPositions, setCurrentTab);
    
    // 상세 페이지 뒤로가기 버튼 초기화
    initDetailPageBackButton(scrollPositions, getCurrentTab);
    
    // 스크롤 효과 초기화
    initScroll();
});
