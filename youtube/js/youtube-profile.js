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
            <div class="channel-banner"></div>
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

    `;
}

export function initChannelPage() {
    const root = document.getElementById('youtube-root');
    root.innerHTML = createChannelPage();
}
