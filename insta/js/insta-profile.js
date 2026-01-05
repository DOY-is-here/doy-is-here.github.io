// 프로필 UI 생성 모듈

// 프로필 전체 HTML 생성
export function createProfileHTML(currentTab, getPostCount) {
    return `
        <div class="insta-header">
            <div class="header-back"></div>
            <div class="header-title">doy.is.here</div>
            <div class="header-icons">
                <div class="header-icon bell"></div>
                <div class="header-icon dots"></div>
            </div>
        </div>
        
        ${createProfileHeader(getPostCount)}
        ${createProfileInfo()}
        ${createProfileActions()}
        ${createProfileTabs(currentTab)}
    `;
}

// 프로필 헤더 (아바타 + 통계)
function createProfileHeader(getPostCount) {
    return `
        <div class="profile-header">
            <div class="profile-avatar">
                <div class="profile-avatar-inner"></div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-number">${getPostCount()}</div>
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

// 프로필 정보
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

// 프로필 액션 버튼
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

// 프로필 탭 UI
export function createProfileTabs(currentTab) {
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