// messages.txt 로드
fetch("messages.txt")
  .then(res => res.text())
  .then(text => parseChat(text))
  .catch(err => console.error("Failed to load messages:", err));

// 도이 프로필 이미지
const DOY_PROFILE = "profile/doy.png";  // ← 이미지 파일명

function parseChat(text) {
    const lines = text.split("\n").map(l => l.trim());
    const root = document.getElementById("chat-root");

    let currentGroup = null;
    let currentMessages = [];

    function flushMessages() {
        if (!currentGroup || currentMessages.length === 0) return;

        currentMessages.forEach(msg => {
            const row = document.createElement("div");
            row.className = "message-row";

            const bubble = document.createElement("div");
            bubble.className = "message-bubble continued";
            bubble.innerHTML = msg.replace(/\n/g, "<br>");

            row.appendChild(bubble);
            currentGroup.appendChild(row);
        });

        currentMessages = [];
    }

    lines.forEach((line, index) => {
        const nextLine = lines[index + 1] || "";

        // 날짜 처리
        if (/^\d{4}년 \d{1,2}월 \d{1,2}일/.test(line)) {
            flushMessages();

            const div = document.createElement("div");
            div.className = "date-divider";
            div.innerHTML = `<div class="date-badge">${line}</div>`;
            root.appendChild(div);
            return;
        }

        // DOY + 시간 → 새 메시지 그룹
        if (line === "DOY" && /^(오전|오후) \d{1,2}:\d{2}$/.test(nextLine)) {
            flushMessages();

            const group = document.createElement("div");
            group.className = "message-group";

            const header = document.createElement("div");
            header.className = "message-header";

            header.innerHTML = `
                <img class="profile-img" src="${DOY_PROFILE}">
                <span class="sender-name">DOY</span>
                <span class="message-time">${nextLine}</span>
            `;

            group.appendChild(header);
            root.appendChild(group);

            currentGroup = group;
            return;
        }

        // 시간 줄 자체는 header에 넣었으므로 무시
        if (/^(오전|오후) \d{1,2}:\d{2}$/.test(line)) {
            return;
        }

        // 실제 메시지 줄
        if (line !== "") {
            currentMessages.push(line);
            return;
        }

        // 빈 줄 → 메시지 flush
        flushMessages();
    });

    flushMessages();
}
