// 스크롤 효과

const HEADER_MAX_HEIGHT = 132;
const HEADER_MIN_HEIGHT = 55;
const SHRINK_RANGE = 40;
const AVATAR_END = 60;
const SHRINK_Z_RANGE = 20;
const DARKEN_RANGE = 50;

let ticking = false;

function getScrollTop() {
    const profilePage = document.getElementById("profile-page");
    if (profilePage && profilePage.scrollHeight > profilePage.clientHeight) {
        return profilePage.scrollTop;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
}

function update() {
    ticking = false;
    const scrollTop = Math.max(0, getScrollTop());
    
    const avatar = document.querySelector(".profile-avatar");
    const topbar = document.querySelector(".topbar");
    const topbarBg = document.querySelector(".topbar-bg");
    const topbarHeader = document.querySelector(".topbar-header");
    const topbarTitle = document.querySelector(".topbar-title");
    const contentWrapper = document.querySelector(".content-wrapper");

    /* 프로필 사진 scale + z-index */
    if (avatar) {
        // scale
        if (scrollTop === 0) {
            avatar.style.transform = "scale(1)";
        } else if (scrollTop >= AVATAR_END) {
            avatar.style.transform = "scale(0.676)";
        } else {
            const raw = Math.min(scrollTop / AVATAR_END, 1);
            const eased = 1 - Math.pow(1 - raw, 10);
            const scale = 1 - eased * 0.324;
            avatar.style.transform = `scale(${scale.toFixed(4)})`;
        }

        // z-index
        if (scrollTop < SHRINK_Z_RANGE) {
            avatar.style.zIndex = "20";
        } else {
            avatar.style.zIndex = "1";
        }
    }

    /* 헤더 높이 */
    let currentHeight;
    if (scrollTop >= SHRINK_RANGE) {
        currentHeight = HEADER_MIN_HEIGHT;
    } else {
        const raw = Math.min(Math.max(scrollTop / SHRINK_RANGE, 0), 1);
        const eased = 1 - Math.pow(1 - raw, 6);
        currentHeight = Math.round(
            HEADER_MAX_HEIGHT - eased * (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT)
        );
    }

    if (topbar) topbar.style.height = `${currentHeight}px`;
    if (topbarBg) topbarBg.style.height = `${currentHeight}px`;

    /* 콘텐츠 위치 */
    if (contentWrapper) {
        if (scrollTop < AVATAR_END) {
            contentWrapper.style.transform = `translateY(${scrollTop}px)`;
        } else {
            contentWrapper.style.transform = `translateY(${AVATAR_END}px)`;
        }
    }

    /* 헤더 배경 & 타이틀 */
    if (topbarHeader && topbarTitle) {
        if (scrollTop < SHRINK_RANGE) {
            topbarHeader.style.background = "transparent";
            topbarHeader.style.backdropFilter = "blur(0px)";
            topbarTitle.style.opacity = "0";
            topbarTitle.style.transform = "translateY(-5px)";
            topbarTitle.style.pointerEvents = "none";
        } else {
            const extraScroll = scrollTop - SHRINK_RANGE;
            const progress = Math.min(extraScroll / DARKEN_RANGE, 1);
            const bgOpacity = 0 + progress * 0.2;
            
            topbarHeader.style.background = `rgba(0,0,0,${bgOpacity})`;
            topbarHeader.style.backdropFilter = "blur(10px)";
            topbarTitle.style.opacity = "1";
            topbarTitle.style.transform = "translateY(0)";
            topbarTitle.style.pointerEvents = "auto";
        }
    }
}

function onScroll() {
    if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
    }
}

export function initScroll() {
    const profilePage = document.getElementById("profile-page");
    
    if (profilePage) {
        profilePage.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // 초기 실행
    update();
}
