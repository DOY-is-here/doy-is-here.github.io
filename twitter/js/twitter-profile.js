// 프로필 페이지 HTML 생성
import { tweets } from './twitter-data.js';
import { updateTweetCount } from './twitter-utils.js';

export function createProfilePage() {
    const tweetCount = tweets.length;
    
    return `
        <div id="profile-page" class="page active">
            <div class="topbar-header">
                <div class="topbar-left">
                    <button class="topbar-icon back"></button>   
                    <p class="topbar-title">NOMAD<br><b id="tweet-count">게시물 ${tweetCount}개</b></p>
                </div>
                <div class="topbar-right">
                    <button class="topbar-icon grok"></button>
                    <button class="topbar-icon search"></button>
                    <button class="topbar-icon more"></button>
                </div>
            </div>
     
            <div class="topbar-bg"></div>
        
            <header class="profile-header">
                <div class="profile-body">
                    <div class="profile-avatar"></div>
                    <div class="content-wrapper"></div>

                    <div class="profile-actions">
                        <button class="profile-btn icon-only">
                            <div class="icon icon-notion"></div>
                        </button>
                        <button class="profile-btn icon-only">
                            <div class="icon icon-dm"></div>
                        </button>
                        <button class="profile-btn text-btn">팔로잉</button>
                    </div>

                    <h2 class="profile-name">
                        NOMAD <span class="verified"></span>
                    </h2>

                    <p class="profile-handle">@NOMAD_is_here</p>
                    <p class="profile-bio">NOMAD OFFICIAL X</p>
                    <div class="profil-date">
                        <div class="profil-date-cal"></div>
                        <p class="profile-meta">2023년 12월에 가입함</p>
                        <div class="profil-date-drop"></div>
                    </div>

                    <div class="profile-meta">
                        <span class="following"><b>0</b> 팔로잉</span>
                        <span class="followers"><b>99,916</b> 팔로워</span>
                    </div>          
                </div>
            </header>

            <nav class="profile-tabs">
                <div class="tabs">
                    <span data-tab="posts" class="active">게시물</span>
                    <span data-tab="highlights">하이라이트</span>
                    <span data-tab="photos">미디어</span>
                </div>
            </nav>

            <main id="timeline" class="timeline"></main>
        </div>
    `;
}

export function initProfilePage() {
    const root = document.getElementById('twitter-root');
    root.innerHTML = createProfilePage();
    
    // 트윗 개수 업데이트
    updateTweetCount(tweets);
}
