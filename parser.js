// 🌟 parser.js — 완성본 (Voice / Photo / Video / Emoticon 지원)

document.addEventListener("DOMContentLoaded", loadMessages);

async function loadMessages() {
    try {
        const response = await fetch("messages.txt");
        const text = await response.text();
        parseAndRenderMessages(text);
    } catch (error) {
        console.error("메시지 파일 로드 실패:", error);
    }
}

function parseAndRenderMessages(text) {
    const lines = text.split("\n");
    const chatRoot = document.getElementById("chat-root");

    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";

    chatContainer.appendChild(createHeader());

    const chatMessages = document.createElement("div");
    chatMessages.className = "chat-messages";

    let currentDate = "";
    let currentSender = "";
    let currentTime = "";
    let messageGroup = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 날짜
        if (line.match(/^\d{4}년 \d{1,2}월 \d{1,2}일/)) {
            if (messageGroup.length > 0) {
                chatMessages.appendChild(createMessageGroup(messageGroup));
                messageGroup = [];
            }
            currentDate = line;
            chatMessages.appendChild(createDateDivider(currentDate));
            currentSender = "";
            currentTime = "";
            continue;
        }

        // 송신자 + 시간
        if (line === "DOY" && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.match(/^(오전|오후) \d{1,2}:\d{2}$/)) {
                if (messageGroup.length > 0) {
                    chatMessages.appendChild(createMessageGroup(messageGroup));
                    messageGroup = [];
                }
                currentSender = line;
                currentTime = nextLine;
                i++;
                continue;
            }
        }

        const next = lines[i + 1]?.trim();

        const pushMedia = () => {
            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                content: line,
                mediaUrl: next
            });
            i++;
        };

        // 음성
        if (line.startsWith("[음성메시지]") && next?.startsWith("https://")) {
            pushMedia();
            continue;
        }

        // 사진
        if (line === "[사진]" && next?.startsWith("https://")) {
            pushMedia();
            continue;
        }

        // 동영상
        if (line.startsWith("[동영상]") && next?.startsWith("https://")) {
            pushMedia();
            continue;
        }

        // 이모티콘
        if (line === "[이모티콘]" && next?.startsWith("https://")) {
            pushMedia();
            continue;
        }

        // 일반 텍스트
        messageGroup.push({
            sender: currentSender,
            time: currentTime,
            content: line
        });
    }

    if (messageGroup.length > 0) {
        chatMessages.appendChild(createMessageGroup(messageGroup));
    }

    chatContainer.appendChild(chatMessages);
    chatRoot.appendChild(chatContainer);
}

/* ---------------- UI 생성 ---------------- */

function createHeader() {
    const h = document.createElement("div");
    h.className = "header";
    h.innerHTML = `
        <div class="status-bar"></div>
        <div class="header-content">
            <div class="header-left"><div class="back-button">‹</div></div>
            <div class="header-title">
                <div class="title-row">
                    <span class="chat-name">DOY</span>
                    <span class="dropdown-icon">∨</span>
                </div>
                <div class="days-together">함께한지 600일</div>
            </div>
            <div class="search-button">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </div>
        </div>
    `;
    return h;
}

function createDateDivider(text) {
    const div = document.createElement("div");
    div.className = "date-divider";
    div.innerHTML = `<div class="date-badge">${text}</div>`;
    return div;
}

function createMessageGroup(messages) {
    const group = document.createElement("div");
    group.className = "message-group";
    messages.forEach((msg, idx) =>
        group.appendChild(createMessageRow(msg, idx === 0))
    );
    return group;
}

function createMessageRow(message, showProfile) {
    const row = document.createElement("div");
    row.className = "message-row" + (showProfile ? "" : " continued");

    if (showProfile) {
        const profile = document.createElement("div");
        profile.className = "profile-pic";
        row.appendChild(profile);
    }

    const content = document.createElement("div");
    content.className = "message-content";
    if (!showProfile) content.style.marginLeft = "45px";

    if (showProfile) {
        const header = document.createElement("div");
        header.className = "message-header";
        header.innerHTML = `
            <span class="sender-name">${message.sender}</span>
            <span class="message-time">${message.time}</span>
        `;
        content.appendChild(header);
    }

    content.appendChild(
        createMessageContent(message.content, message.mediaUrl)
    );

    row.appendChild(content);
    return row;
}

function createMessageContent(content, mediaUrl) {
    if (content.startsWith("[음성메시지]")) return createVoiceMessage(content, mediaUrl);
    if (content === "[사진]") return createImage(mediaUrl);
    if (content.startsWith("[동영상]")) return createVideo(content, mediaUrl);
    if (content === "[이모티콘]") return createEmoticon(mediaUrl);
    return createTextMessage(content);
}

/* ----------- 메시지 타입 ----------- */

function createTextMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const msg = document.createElement("div");
    msg.className = "message-text";
    msg.innerHTML = text;

    bubble.appendChild(msg);
    return bubble;
}

function createImage(url) {
    const div = document.createElement("div");
    div.className = "message-image";
    div.innerHTML = `<img src="${url}" style="width:260px; border-radius:18px;">`;
    return div;
}

function createVideo(content, url) {
    const div = document.createElement("div");
    div.className = "message-video";
    div.innerHTML = `
        <video src="${url}" controls preload="metadata"
        style="width:200px; border-radius:18px;"></video>
    `;
    return div;
}

function createEmoticon(url) {
    const div = document.createElement("div");
    div.className = "message-image";
    div.innerHTML = `
        <video src="${url}" autoplay loop muted playsinline
        style="width:150px; background:transparent; border-radius:18px;"></video>
    `;
    return div;
}

function createVoiceMessage(content, url) {
    const match = content.match(/\[음성메시지\] (\d{2}):(\d{2})/);
    const duration = match ? `${match[1]}:${match[2]}` : "00:04";

    const div = document.createElement("div");
    div.className = "voice-message";

    div.innerHTML = `
        <audio src="${url}" preload="auto"></audio>

        <div class="voice-main">
            <div class="play-button">
                <span class="play-icon">▶</span>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
                <div class="progress-handle"></div>
            </div>

            <span class="voice-time">${duration}</span>
        </div>

        <div class="voice-expand">
            <span class="expand-icon">↗</span>
        </div>
    `;

    const audio = div.querySelector("audio");
    const playBtn = div.querySelector(".play-button");
    const playIcon = div.querySelector(".play-icon");
    const bar = div.querySelector(".progress-bar-fill");
    const handle = div.querySelector(".progress-handle");

    let playing = false;

    playBtn.addEventListener("click", () => {
        if (!playing) {
            audio.play();
            playIcon.textContent = "⏸";
        } else {
            audio.pause();
            playIcon.textContent = "▶";
        }
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
        playIcon.textContent = "▶";
        bar.style.width = "0%";
        handle.style.left = "0%";
    });

    return div;
}

