// 🌟 parser.js — Reply / LiveEnded / Media / Search 기능 통합 완전체

document.addEventListener("DOMContentLoaded", () => {
    loadMessages();

    // 검색 버튼 클릭 시 검색창 표시/숨김
    document.addEventListener("click", (e) => {
        if (e.target.closest(".search-button")) {
            const searchBar = document.querySelector(".search-bar");

            if (!searchBar) return;

            const isHidden = searchBar.style.display === "" || searchBar.style.display === "none";
            searchBar.style.display = isHidden ? "block" : "none";

            if (isHidden) searchBar.focus();
        }
    });

    // 검색 입력 시 메시지 필터링
    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("search-bar")) {
            searchMessages(e.target.value);
        }
    });
});

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

        /* ---------------- 날짜 ---------------- */
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

        /* ---------------- 송신자 + 시간 ---------------- */
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

        /* ---------------- Reply 메시지 ---------------- */
        if (line.endsWith("님의 답장") && next && lines[i + 2]) {
            const original = next;
            const replyLine = lines[i + 2].trim();

            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                replyHeader: line,
                replyOriginal: original,
                replyText: replyLine.replace(/^↳\s*/, "")
            });

            i += 2;
            continue;
        }

        /* ---------------- 종료된 라이브 ---------------- */
        if (line === "종료된 라이브" && next) {
            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                liveTitle: next
            });
            i++;
            continue;
        }

        /* ---------------- 미디어 ---------------- */

        const pushMedia = () => {
            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                content: line,
                mediaUrl: next
            });
            i++;
        };

        if (line.startsWith("[음성메시지]") && next?.startsWith("https://")) {
            pushMedia(); continue;
        }

        if (line === "[사진]" && next?.startsWith("https://")) {
            pushMedia(); continue;
        }

        if (line.startsWith("[동영상]") && next?.startsWith("https://")) {
            pushMedia(); continue;
        }

        if (line === "[이모티콘]" && next?.startsWith("https://")) {
            pushMedia(); continue;
        }

        /* ---------------- 일반 텍스트 ---------------- */
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

/* ---------------- 검색 기능 ---------------- */

function searchMessages(keyword) {
    const items = document.querySelectorAll(".message-item");
    keyword = keyword.trim();

    if (!keyword) {
        items.forEach(m => (m.style.display = ""));
        return;
    }

    items.forEach(msg => {
        const text = msg.innerText;
        msg.style.display = text.includes(keyword) ? "" : "none";
    });
}

/* ---------------- UI 생성 ---------------- */

function createHeader() {
    const h = document.createElement("div");
    h.className = "header";
    h.innerHTML = `
        <div class="status-bar"></div>
        <div class="header-content">
            <div class="header-left"><div class="back-button"></div></div>
            <div class="header-title">
                <div class="title-row">
                    <span class="chat-name">DOY</span>
                    <span class="dropdown-icon"></span>
                </div>
                <div class="days-together">함께한지 490일</div>
            </div>
            <div class="search-button"></div>
        </div>
    `;

    // 검색창 생성
    const searchBar = document.createElement("input");
    searchBar.className = "search-bar";
    searchBar.placeholder = "검색어 입력...";
    searchBar.style.display = "none";

    h.appendChild(searchBar);
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

    messages.forEach((msg, idx) => {
        const prev = messages[idx - 1];
        const showProfile =
            idx === 0 || msg.sender !== prev?.sender || msg.time !== prev?.time;

        group.appendChild(createMessageRow(msg, showProfile));
    });

    return group;
}

function createMessageRow(message, showProfile) {
    const row = document.createElement("div");
    row.className = "message-row message-item" + (showProfile ? "" : " continued");

    if (showProfile) {
        const profile = document.createElement("div");
        profile.className = "profile-pic";
        row.appendChild(profile);
    }

    const content = document.createElement("div");
    content.className = "message-content";

    if (showProfile) {
        const header = document.createElement("div");
        header.className = "message-header";
        header.innerHTML = `
            <span class="sender-name">${message.sender}</span>
            <span class="message-time">${message.time}</span>
        `;
        content.appendChild(header);
    }

    content.appendChild(createMessageContent(message));
    row.appendChild(content);
    return row;
}

/* ---------------- 메시지 유형 분기 ---------------- */

function createMessageContent(message) {
    if (message.replyHeader) return createReplyMessage(message);
    if (message.liveTitle) return createLiveEnded(message.liveTitle);
    if (message.content?.startsWith("[음성메시지]")) return createVoiceMessage(message.content, message.mediaUrl);
    if (message.content === "[사진]") return createImage(message.mediaUrl);
    if (message.content?.startsWith("[동영상]")) return createVideo(message.content, message.mediaUrl);
    if (message.content === "[이모티콘]") return createEmoticon(message.mediaUrl);

    return createTextMessage(message.content);
}

/* ---------------- Reply UI ---------------- */

function createReplyMessage(msg) {
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

/* ---------------- 종료된 라이브 ---------------- */

function createLiveEnded(title) {
    const div = document.createElement("div");
    div.className = "live-ended";

    div.innerHTML = `
        <div class="live-icon-circle">
            <span class="phone-icon"></span>
        </div>
        <div class="live-info">
            <div class="live-status">종료된 라이브</div>
            <div class="live-title">${title}</div>
        </div>
    `;

    return div;
}

/* ---------------- 일반 텍스트 ---------------- */

function createTextMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = `<div class="message-text">${text}</div>`;
    return bubble;
}

/* ---------------- 이미지 ---------------- */

function createImage(url) {
    const div = document.createElement("div");
    div.className = "message-image";
    div.innerHTML = `<img src="${url}" style="width:260px; border-radius:18px;">`;
    return div;
}

/* ---------------- 동영상 ---------------- */

function createVideo(content, url) {
    const div = document.createElement("div");
    div.className = "message-video";
    div.innerHTML = `
        <video src="${url}" controls preload="metadata"
        style="width:200px; border-radius:18px;"></video>
    `;
    return div;
}

/* ---------------- 이모티콘 ---------------- */

function createEmoticon(url) {
    const div = document.createElement("div");
    div.className = "message-image";
    div.innerHTML = `
        <video src="${url}" autoplay loop muted playsinline
        style="width:150px; background:transparent; border-radius:18px;"></video>
    `;
    return div;
}

/* ---------------- 음성 메시지 ---------------- */

function createVoiceMessage(content, url) {
    const match = content.match(/\[음성메시지\] (\d{2}):(\d{2})/);
    const duration = match ? `${match[1]}:${match[2]}` : "00:04";

    const div = document.createElement("div");
    div.className = "voice-message";

    div.innerHTML = `
        <audio src="${url}" preload="auto"></audio>

        <div class="voice-main">
            <div class="play-button">
                <span class="play-icon"></span>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
                <div class="progress-handle"></div>
            </div>

            <span class="voice-time">${duration}</span>
        </div>

        <div class="voice-expand">
            <span class="expand-icon"></span>
        </div>
    `;

    const audio = div.querySelector("audio");
    const playBtn = div.querySelector(".play-button");
    const bar = div.querySelector(".progress-bar-fill");
    const handle = div.querySelector(".progress-handle");

    let playing = false;

    // ▶ ↔ ⏸ 전환은 JS가 아니라 CSS가 담당
    playBtn.addEventListener("click", () => {
        if (!playing) {
            audio.play();
            div.classList.add("voice-playing");
        } else {
            audio.pause();
            div.classList.remove("voice-playing");
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
        div.classList.remove("voice-playing");
        bar.style.width = "0%";
        handle.style.left = "0%";
    });

    return div;
}
