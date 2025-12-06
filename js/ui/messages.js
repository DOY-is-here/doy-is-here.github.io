import { createContent } from "../media.js"; // 미디어 생성 함수 불러오기

// 파싱된 데이터를 받아서 전체 채팅창 DOM을 반환
export function renderMessages(parsedData) {
    const container = document.createElement("div");
    container.className = "chat-messages"; // CSS 클래스

    parsedData.forEach(block => {
        if (block.type === "date") {
            container.appendChild(createDateDivider(block.text));
        } else if (block.type === "group") {
            container.appendChild(createMessageGroup(block.messages));
        }
    });

    return container;
}

// 날짜 구분선 생성
function createDateDivider(text) {
    const div = document.createElement("div");
    div.className = "date-divider";
    div.innerHTML = `<div class="date-badge">${text}</div>`;
    return div;
}

// 메시지 그룹 생성 (프로필 사진 처리)
function createMessageGroup(messages) {
    const group = document.createElement("div");
    group.className = "message-group";

    messages.forEach((msg, idx) => {
        // 이전 메시지와 송신자/시간이 같으면 프로필 생략
        const prev = messages[idx - 1];
        const showProfile = idx === 0 || msg.sender !== prev?.sender || msg.time !== prev?.time;

        group.appendChild(createMessageRow(msg, showProfile));
    });

    return group;
}

// 개별 메시지 줄 생성
function createMessageRow(message, showProfile) {
    const row = document.createElement("div");
    // 프로필이 없으면 'continued' 클래스 추가 (여백 조절용)
    row.className = "message-row message-item" + (showProfile ? "" : " continued");

    // 프로필 사진
    if (showProfile) {
        const profile = document.createElement("div");
        profile.className = "profile-pic";
        row.appendChild(profile);
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    // 이름과 시간
    if (showProfile) {
        const header = document.createElement("div");
        header.className = "message-header";
        header.innerHTML = `
            <span class="sender-name">${message.sender}</span>
            <span class="message-time">${message.time}</span>
        `;
        contentDiv.appendChild(header);
    }

    // 내용물 (텍스트, 사진, 동영상 등) -> media.js의 createContent 사용
    contentDiv.appendChild(createContent(message));
    row.appendChild(contentDiv);

    return row;
}