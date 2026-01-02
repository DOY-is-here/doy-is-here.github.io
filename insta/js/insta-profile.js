// 프로필 화면 렌더링 및 관리
import { getPostCount, posts, getTaggedPosts, getStories } from './insta-data.js';
import { renderGrid, renderTaggedGrid, renderStoryGrid, renderRepostGrid, initGridVideoThumbnails, initStoryGridVideos } from './insta-grid.js';
import { initTabs } from './insta-tabs.js';

let savedScrollPosition = 0;

export function showProfile(initialTab = 'grid', restoreScroll = false) {
    const root = window.instaRoot;
    
    root.innerHTML = `
        ${createHeader()}
        ${createProfileHeader()}
        ${createProfileInfo()}
        ${createProfileActions()}
        ${createTabs(initialTab)}
        ${createTabsContainer(initialTab)}
    `;
    
    initTabs(initialTab);
    
    if (restoreScroll) {
        setTimeout(() => window.scrollTo(0, savedScrollPosition), 0);
    }
    
    // 비디오 썸네일 초기화
    requestAnimationFrame(() => {
        setTimeout(() => {
            initGridVideoThumbnails();
            initStoryGridVideos();
        }, 150);
    });
}

function createHeader() {
    return `
        <div class="insta-header">
            <div class="header-back"></div>
            <div class="header-title">doy.is.here</div>
            <div class="header-icons">
                <div class="header-icon bell"></div>
                <div class="header-icon dots"></div>
            </div>
        </div>
    `;
}

function createProfileHeader() {
    return `
        <div class="profile-header">
            <div class="profile-avatar">
                <div class="profile-avatar-inner"></div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-number">${getPostCount('grid')}</div>
                    <div class="stat-label">게시물</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">9.16만</div>
                    <div class="stat-label">팔로워</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">1</div>
                    <div class="stat-label">팔로잉</div>
                </div>
            </div>
        </div>
    `;
}

function createProfileInfo() {
    return `
        <div class="profile-info">
            <div class="profile-username">@nomad.is.here</div>
            <div class="profile-followers">
                <div class="follower-avatars">
                    <div class="follower-avatar"></div>
                    <div class="follower-avatar"></div>
                </div>
            </div>
        </div>
    `;
}

function createProfileActions() {
    return `
        <div class="profile-actions">
            <div class="profile-btn">
                팔로잉
                <div class="icon-down"></div>
            </div>
            <div class="profile-btn">
                메시지
            </div>
            <div class="profile-btn small">
                <div class="icon-follow"></div>
            </div>
        </div>
    `;
}

function createTabs(currentTab) {
    return `
        <div class="profile-tabs" id="profile-tabs">
            <div class="tab-item ${currentTab === 'grid' ? 'active' : ''}" data-tab="grid">
                <div class="tab-icon grid"></div>
            </div>
            <div class="tab-item ${currentTab === 'tagged' ? 'active' : ''}" data-tab="tagged">
                <div class="tab-icon tagged"></div>
            </div>
            <div class="tab-item ${currentTab === 'story' ? 'active' : ''}" data-tab="story">
                <div class="tab-icon story"></div>
            </div>
            <div class="tab-item ${currentTab === 'repost' ? 'active' : ''}" data-tab="repost">
                <div class="tab-icon repost"></div>
            </div>
        </div>
    `;
}

function createTabsContainer(currentTab) {
    return `
        <div class="tabs-container" id="tabs-container">
            <div class="tab-content ${currentTab === 'grid' ? 'active' : ''}" data-content="grid">
                ${renderGrid(posts)}
            </div>
            <div class="tab-content ${currentTab === 'tagged' ? 'active' : ''}" data-content="tagged">
                ${renderTaggedGrid(getTaggedPosts)}
            </div>
            <div class="tab-content ${currentTab === 'story' ? 'active' : ''}" data-content="story">
                ${renderStoryGrid(getStories)}
            </div>
            <div class="tab-content ${currentTab === 'repost' ? 'active' : ''}" data-content="repost">
                ${renderRepostGrid(posts, getTaggedPosts)}
            </div>                
        </div>
    `;
}

export function saveScrollPosition() {
    savedScrollPosition = window.scrollY || window.pageYOffset;
}

export function getSavedScrollPosition() {
    return savedScrollPosition;
}

// window에 함수 등록
window.showProfile = showProfile;
