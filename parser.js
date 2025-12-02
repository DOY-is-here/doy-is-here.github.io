// [parser.js]

document.addEventListener("DOMContentLoaded", loadMessages);

async function loadMessages() {
    try {
        // messages.txt 파일이 같은 폴더에 있어야 합니다.
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

    // 기본 컨테이너 생성
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

        // 1. 날짜 파싱 (예: 2025년 12월 2일)
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

        // 2. 송신자/시간 파싱 (예: DOY / 오전 10:20)
        // (텍스트 파일에서 이름 바로 다음 줄에 시간이 나온다고 가정)
        if (line === "DOY" && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.match(/^(오전|오후) \d{1,2}:\d{2}$/)) {
                if (messageGroup.length > 0) {
                    chatMessages.appendChild(createMessageGroup(messageGroup));
                    messageGroup = [];
                }
                currentSender = line;
                currentTime = nextLine;
                i++; // 시간 줄 건너뜀
                continue;
            }
        }

        const next = lines[i + 1]?.trim();

        // 헬퍼 함수: 미디어 메시지 추가
        const pushMsg = (type, content, extra = null) => {
            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                type: type,
                content: content,
                extra: extra
            });
        };

        // --- 기능별 파싱 로직 ---

        // 1) 음성 메시지: [음성메시지] 00:04 (다음줄 URL)
        if (line.startsWith("[음성메시지]") && next?.startsWith("https://")) {
            pushMsg("voice", next, line); // line에 시간 정보 포함됨
            i++; continue;
        }

        // 2) 사진: [사진] (다음줄 URL)
        if (line === "[사진]" && next?.startsWith("https://")) {
            pushMsg("image", next);
            i++; continue;
        }

        // 3) 동영상: [동영상] 03:25 (다음줄 URL) 또는 그냥 [동영상]
        // 시간 파싱 추가
        if (line.startsWith("[동영상]") && next?.startsWith("https://")) {
            let duration = "";
            const timeMatch = line.match(/(\d{2}:\d{2})/);
            if (timeMatch) duration = timeMatch[1];
            
            pushMsg("video", next, duration);
            i++; continue;
        }

        // 4) 이모티콘
        if (line === "[이모티콘]" && next?.startsWith("https://")) {
            pushMsg("emoticon", next);
            i++; continue;
        }

        // 5) 라이브 (새 기능): [라이브] 제목
        if (line.startsWith("[라이브]") || line.startsWith("[LIVE]")) {
            const title = line.replace(/^\[(라이브|LIVE)\]\s*/, "");
            pushMsg("live", title);
            continue;
        }

        // 6) 답장 (새 기능): [답장:원본이름:원본내용] 할말
        // 예: [답장:친구:밥먹자] 그래 좋아
        const replyMatch = line.match(/^\[답장:(.*?):(.*?)\]\s*(.*)/);
        if (replyMatch) {
            pushMsg("reply", replyMatch[3], {
                name: replyMatch[1],
                orgMsg: replyMatch[2]
            });
            continue;
        }

        // 7) 일반 텍스트
        pushMsg("text", line);
    }

    // 남은 메시지 처리
    if (messageGroup.length > 0) {
        chatMessages.appendChild(createMessageGroup(messageGroup));
    }

    chatContainer.appendChild(chatMessages);
    chatRoot.appendChild(chatContainer);
}

/* ---------------- UI 생성 함수들 ---------------- */

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
            <div class="search-button">🔍</div>
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
    // 첫 메시지만 프로필 표시 (idx === 0)
    messages.forEach((msg, idx) => {
        group.appendChild(createMessageRow(msg, idx === 0));
    });
    return group;
}

// 핵심 수정: 시간 정렬 오류 해결을 위한 DOM 구조 변경
function createMessageRow(msg, showProfile) {
    const row = document.createElement("div");
    row.className = "message-row";

    // 1. 프로필 사진 (그룹의 첫 메시지일 때만)
    if (showProfile) {
        const profile = document.createElement("div");
        profile.className = "profile-pic";
        // 실제 이미지가 있다면 src 변경
        profile.innerHTML = `<img src="https://via.placeholder.com/40" alt="profile">`;
        row.appendChild(profile);
    } else {
        // 프로필 없을 때 들여쓰기 (프로필 너비 40px + gap 10px)
        const spacer = document.createElement("div");
        spacer.style.width = "50px"; 
        // row.appendChild(spacer); // Flex gap으로 처리하거나 margin-left 사용
        row.style.marginLeft = "50px"; 
    }

    // 2. 메시지 컨텐츠 영역
    const contentArea = document.createElement("div");
    contentArea.className = "message-content";

    // 2-1. 이름 (프로필 있는 경우에만 표시)
    if (showProfile) {
        const name = document.createElement("div");
        name.className = "sender-name";
        name.innerText = msg.sender;
        contentArea.appendChild(name);
    }

    // 2-2. 말풍선 + 시간 래퍼 (하단 정렬을 위해 div로 감쌈)
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper";

    // 내용 생성 (말풍선 등)
    const bubble = createContentByType(msg);
    
    // 시간 생성
    const timeSpan = document.createElement("span");
    timeSpan.className = "msg-time";
    timeSpan.innerText = msg.time;

    // 래퍼에 추가 (내용 + 시간)
    wrapper.appendChild(bubble);
    wrapper.appendChild(timeSpan);

    contentArea.appendChild(wrapper);
    row.appendChild(contentArea);

    return row;
}

// 메시지 타입별 내용 생성
function createContentByType(msg) {
    switch (msg.type) {
        case "text":
            return createTextBubble(msg.content);
        case "image":
            return createMediaBubble(`<img src="${msg.content}">`);
        case "video":
            return createVideoBubble(msg.content, msg.extra); // extra is duration
        case "live":
            return createLiveCard(msg.content);
        case "reply":
            return createReplyBubble(msg.content, msg.extra); // extra is {name, orgMsg}
        case "voice":
            return createVoiceBubble(msg.content, msg.extra);
        case "emoticon":
            return createMediaBubble(`<img src="${msg.content}" style="width:150px;">`);
        default:
            return createTextBubble("알 수 없는 메시지");
    }
}

/* --- 세부 UI 컴포넌트 --- */

function createTextBubble(text) {
    const div = document.createElement("div");
    div.className = "message-bubble";
    div.innerText = text;
    return div;
}

function createMediaBubble(html) {
    const div = document.createElement("div");
    div.className = "message-image";
    div.innerHTML = html;
    return div;
}

// 동영상 UI (시간 표시 추가)
function createVideoBubble(url, duration) {
    const div = document.createElement("div");
    div.className = "message-video";
    
    let timeBadge = "";
    if (duration) {
        timeBadge = `<div class="video-time-badge">${duration}</div>`;
    }

    div.innerHTML = `
        <video src="${url}" preload="metadata"></video>
        <div class="video-play-icon">▶</div>
        ${timeBadge}
    `;
    return div;
}

// 라이브 UI
function createLiveCard(title) {
    const div = document.createElement("div");
    div.className = "live-card";
    div.innerHTML = `
        <div class="live-icon">LIVE</div>
        <div class="live-text">
            <span class="live-title">${title}</span>
            <span class="live-desc">방송 보러가기</span>
        </div>
    `;
    return div;
}

// 답장 UI
function createReplyBubble(text, info) {
    const div = document.createElement("div");
    div.className = "reply-container";
    div.innerHTML = `
        <div class="reply-header">
            <span class="reply-user">${info.name}에게 답장</span>
            <span class="reply-org-msg">${info.orgMsg}</span>
        </div>
        <div class="reply-text">${text}</div>
    `;
    return div;
}

// 음성 UI
function createVoiceBubble(url, rawText) {
    // rawText 예: [음성메시지] 00:04
    const match = rawText.match(/(\d{2}:\d{2})/);
    const duration = match ? match[1] : "00:04";

    const div = document.createElement("div");
    div.className = "voice-message";
    div.innerHTML = `
        <div class="voice-icon">▶</div>
        <div class="voice-bar-container">
            <div class="voice-bar-fill"></div>
        </div>
        <div class="voice-duration">${duration}</div>
        <audio src="${url}"></audio>
    `;

    // 간단 재생 로직
    const icon = div.querySelector(".voice-icon");
    const audio = div.querySelector("audio");
    icon.onclick = () => {
        if (audio.paused) {
            audio.play();
            icon.innerText = "⏸";
        } else {
            audio.pause();
            icon.innerText = "▶";
        }
    };
    audio.onended = () => { icon.innerText = "▶"; };

    return div;
}
