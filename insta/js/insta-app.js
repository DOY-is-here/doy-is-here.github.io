document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("insta-root");
    
    // 프로필 페이지 렌더링
    showProfile();
    
    function showProfile() {
        root.innerHTML = `
            <!-- 헤더 -->
            <div class="insta-header profile-header-bar">
    <div class="header-back"></div>
    <div class="header-title profile-title">DOY</div>
    <div class="header-icons">
        <div class="header-icon bell"></div>
        <div class="header-icon dots"></div>
    </div>
</div>

            
            <!-- 프로필 헤더 -->
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="profile-avatar-inner"></div>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-number">57</div>
                        <div class="stat-label">게시물</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">8.8만</div>
                        <div class="stat-label">팔로워</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">1</div>
                        <div class="stat-label">팔로잉</div>
                    </div>
                </div>
            </div>
            
            <!-- 프로필 정보 -->
            <div class="profile-info">
                <div class="profile-username">@nomad.is.here</div>
                <div class="profile-followers">
                    <div class="follower-avatars">
                        <div class="follower-avatar"></div>
                        <div class="follower-avatar"></div>
                        <div class="follower-avatar"></div>
                    </div>
                </div>
            </div>
            
            <!-- 프로필 버튼 -->
<div class="profile-actions">

    <button class="profile-btn">
        팔로잉
        <div class="icon-down"></div>
    </button>

    <button class="profile-btn">
        메시지
    </button>

    <button class="profile-btn small">
        <div class="icon-follow"></div>
    </button>

</div>


            
<!-- 탭 메뉴 -->
<div class="profile-tabs">
    <div class="tab-item active">
        <div class="tab-icon grid"></div>
    </div>
    <div class="tab-item">
        <div class="tab-icon reels"></div>
    </div>
    <div class="tab-item">
        <div class="tab-icon tagged"></div>
    </div>
</div>
            
            <!-- 게시물 그리드 -->
            <div class="posts-grid">
                <div class="grid-item video" onclick="showPost()"></div>
                <div class="grid-item"></div>
                <div class="grid-item video"></div>
                <div class="grid-item"></div>
                <div class="grid-item video"></div>
                <div class="grid-item video"></div>
                <div class="grid-item video"></div>
                <div class="grid-item"></div>
                <div class="grid-item video"></div>
            </div>
            
        `;
    }
    
    // 포스트 상세 페이지
window.showPost = function() {
    root.innerHTML = `
        <!-- 상단바 -->
        <div class="post-topbar">
            <div class="left-btn header-back" onclick="location.reload()"></div>

            <div class="post-topbar-title">게시물</div>
            <div class="post-topbar-subtitle">nomad.is.here</div>

            <div class="right-btn"></div>
        </div>

        <!-- 포스트 상세 -->
        <div class="post-detail">
            
            <div class="post-header">
                <div class="post-avatar"></div>
                <div class="post-user-info">
                    <div class="post-username">nomad.is.here</div>
                    <div class="post-date">11월 27일</div>
                </div>
                <div class="post-more">⋯</div>
            </div>

            <div class="post-slider">
                <div class="slider-container">
                    <div class="slider-item"></div>
                    <div class="slider-item"></div>
                    <div class="slider-item"></div>
                    <div class="slider-item"></div>
                </div>
                <div class="slider-counter">1/4</div>
                <div class="slider-dots">
                    <div class="dot active"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <div class="slider-sound"></div>
            </div>

<div class="post-actions">
    <div class="action-icon icon-heart"></div>
    <div class="action-count"></div>

    <div class="action-icon icon-chat"></div>
    <div class="action-count"></div>

    <div class="action-icon icon-loop"></div>
    <div class="action-count"></div>

    <div class="action-icon icon-send"></div>
    <div class="action-count"></div>

    <div class="action-icon action-right icon-bookmark"></div>
</div>


            <div class="post-caption">
                <span class="caption-username">nomad.is.here</span>
                📸
            </div>
        </div>
    `;
};

});