import { classifyRatio } from "./utils.js";

// 메시지 타입에 따라 알맞은 HTML 요소를 만들어주는 공장 함수
export function createContent(msg) {
    switch (msg.type) {
        case "reply": return createReplyBubble(msg);
        case "live": return createLiveEnded(msg.liveTitle);
        case "voice": return createVoiceMessage(msg.content, msg.url);
        case "image": return createImage(msg.url);
        case "video": return createVideo(msg.content, msg.url);
        case "emoticon": return createEmoticon(msg.url);
        default: return createTextMessage(msg.text);
    }
}

// 텍스트
function createTextMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = `<div class="message-text">${text}</div>`;
    return bubble;
}

// 답장
function createReplyBubble(msg) {
    const div = document.createElement("div");
    div.className = "reply-bubble";
    div.innerHTML = `
        <div class="reply-header">${msg.replyHeader}</div>
        <div class="reply-quoted">${msg.replyOriginal}</div>
        <div class="reply-text">
            <span class="reply-arrow"></span>
            <span class="reply-text-content">${msg.replyText}</span>
        </div>
    `;
    return div;
}

// 라이브 종료
function createLiveEnded(title) {
    const div = document.createElement("div");
    div.className = "live-ended";
    div.innerHTML = `
        <div class="live-icon-circle"><span class="phone-icon"></span></div>
        <div class="live-info">
            <div class="live-status">종료된 라이브</div>
            <div class="live-title">${title}</div>
        </div>
    `;
    return div;
}

// 이미지
function createImage(url) {
    const div = document.createElement("div");
    div.className = "message-image";
    const img = new Image();
    img.src = url;
    img.loading = "lazy";
    img.onload = () => {
        if(typeof classifyRatio === 'function') {
             const type = classifyRatio(img.width, img.height);
             div.classList.add(type);
        }
        div.appendChild(img);
    };
    return div;
}

// 동영상
function createVideo(content, url) {
    const container = document.createElement("div");
    container.className = "message-video";

    const video = document.createElement("video");
    video.className = "video-thumbnail";
    video.src = url;
    video.preload = "none";
    video.loading = "lazy";
    video.preload = "metadata";
    video.controls = false;

    const match = content.match(/\[동영상\]\s*(\d{2}:\d{2})/);
    const timeText = match ? match[1] : "00:00";

    const timeBadge = document.createElement("div");
    timeBadge.className = "video-time";
    timeBadge.innerHTML = `<span class="video-time-icon"></span><span>${timeText}</span>`;

    if(typeof classifyRatio === 'function') {
        video.onloadedmetadata = function() {
            const ratioClass = classifyRatio(this.videoWidth, this.videoHeight);
            container.classList.add(ratioClass);
        };
    }

    container.onclick = function() {
        if (video.paused) {
            video.play();
            video.controls = true;
            timeBadge.style.display = "none";
        }
    };

    container.appendChild(video);
    container.appendChild(timeBadge);
    return container;
}

// 이모티콘
function createEmoticon(url) {
    const div = document.createElement("div");
    div.className = "message-emoticon";
    
    const img = document.createElement("img");
    img.src = url;
    img.className = "emoticon-image";
    
    div.appendChild(img);
    return div;
}

// 음성 메시지
function createVoiceMessage(content, url) {
    const match = content.match(/\[음성메시지\] (\d{2}):(\d{2})/);
    const duration = match ? `${match[1]}:${match[2]}` : "00:04";

    const div = document.createElement("div");
    div.className = "voice-message";
    div.innerHTML = `
        <audio src="${url}" preload="auto"></audio>
        <div class="voice-main">
            <div class="play-button"><span class="play-icon"></span></div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
                <div class="progress-handle"></div>
            </div>
            <span class="voice-time">${duration}</span>
        </div>
        <div class="voice-expand"><span class="expand-icon"></span></div>
    `;

    const audio = div.querySelector("audio");
    const playBtn = div.querySelector(".play-button");
    const bar = div.querySelector(".progress-bar-fill");
    const handle = div.querySelector(".progress-handle");
    let playing = false;

    playBtn.addEventListener("click", () => {
        if (!playing) { audio.play(); div.classList.add("voice-playing"); }
        else { audio.pause(); div.classList.remove("voice-playing"); }
        playing = !playing;
    });

    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        bar.style.width = percent + "%";
        handle.style.left = percent + "%";
    });

    audio.addEventListener("ended", () => {
        playing = false;
        div.classList.remove("voice-playing");
        bar.style.width = "0%";
        handle.style.left = "0%";
    });

    return div;
}