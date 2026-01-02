// 메인 앱 파일
import { initChannelPage } from './youtube-profile.js';
import { renderContent, initTabs } from './youtube-tabs.js';

document.addEventListener('DOMContentLoaded', () => {
    // 채널 페이지 생성
    initChannelPage();
    
    // 초기 콘텐츠 렌더링 (홈)
    renderContent('home');
    
    // 탭 이벤트 초기화
    initTabs();
});
