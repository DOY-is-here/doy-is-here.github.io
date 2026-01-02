// YouTube 프로필 페이지 생성
import { channelInfo } from './youtube-data.js';

export function createChannelPage() {
    return `
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="header-icon back"></div>
                <div class="channel-name">${channelInfo.name}</div>
            </div>
            <div class="header-right">
                <div class="header-icon rss"></div>
                <div class="header-icon search"></div>
                <div class="header-icon menu"></div>
            </div>
        </div>

        <!-- Channel Info -->
        <div class="channel-info">
            <div class="channel-banner">
                <img src="${channelInfo.banner}" alt="채널 배너">
            </div>
            <div class="channel-details">
                <div class="channel-avatar"></div>
                <div class="channel-meta">
                    <div class="channel-title">${channelInfo.name}</div>
                    <div class="channel-handle">${channelInfo.handle}</div>
                    <div class="channel-stats">
                        구독자 ${channelInfo.subscribers}<span class="separator">•</span>동영상 ${channelInfo.videoCount}개
                    </div>
                    <div class="channel-description">${channelInfo.description}</div>
                </div>
            </div>
            <button class="subscribe-btn">구독</button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button class="tab active" data-tab="home">홈</button>
            <button class="tab" data-tab="videos">동영상</button>
            <button class="tab" data-tab="shorts">Shorts</button>
            <button class="tab" data-tab="playlists">재생목록</button>
            <button class="tab" data-tab="channels">채널</button>
            <button class="tab" data-tab="about">정보</button>
        </div>

        <!-- Content -->
        <div class="content" id="content"></div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <button class="nav-item active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z"/>
                </svg>
                <span>홈</span>
            </button>
            <button class="nav-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86l-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z"/>
                </svg>
                <span>Shorts</span>
            </button>
            <button class="nav-item add-btn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4c.55 0 1 .45 1 1v6h6c.55 0 1 .45 1 1s-.45 1-1 1h-6v6c0 .55-.45 1-1 1s-1-.45-1-1v-6H5c-.55 0-1-.45-1-1s.45-1 1-1h6V5c0-.55.45-1 1-1z"/>
                </svg>
            </button>
            <button class="nav-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20H5v2h5v2l3-3-3-3v2zm4 0v2h5v-2h-5zm3-20H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 14H7V2h10v12z"/>
                </svg>
                <span>구독</span>
            </button>
            <button class="nav-item">
                <div class="profile-pic"></div>
                <span>나</span>
            </button>
        </div>
    `;
}

export function initChannelPage() {
    const root = document.getElementById('youtube-root');
    root.innerHTML = createChannelPage();
}
