// 메인 진입점 - 초기화만 담당
import { showProfile } from './insta-profile.js';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("insta-root");
    window.instaRoot = root;
    showProfile();
});
