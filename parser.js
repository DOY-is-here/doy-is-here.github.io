// messages.txt 로드
fetch("messages.txt")
  .then(res => res.text())
  .then(text => parseChat(text))
  .catch(err => console.error("Failed to load messages:", err));

// POP 파서
function parseChat(text) {
    const lines = text.split("\n");

    const root = document.getElementById("chat-root");
    let currentGroup = null;
    let currentMessage = [];

    function flushMessage() {
        if (currentMessage.length === 0) return;
        const msgText = currentMessage.join("<br>");

        const row = document.createElement("div");
        row.className = "message-row continued";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.innerHTML = `<div class="message-text">${msgText}</div>`;

        row.appendChild(bubble);
        currentGroup.appendChild(row);

        currentMessage = [];
    }

    lines.forEach((rawLine, index) => {
        const line = rawLine.trim();

        // 날짜 줄
        if (/^\d{4}년/.test(line)) {
            flushMessage();

            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<div class="date-badge">${line}</div>`;
            root.appendChild(dateDiv);
            return;
        }

        // 발신자 줄
        if (/^[A-Za-z가-힣]+$/.test(line) &&
            !/^(오전|오후)/.test(lines[index + 1] || "")) {

            flushMessage();

            currentGroup = document.createElement("div");
            currentGroup.className = "message-group";

            const header = document.createElement("div");
            header.className = "message-header";
            header.innerHTML = `<span class="sender-name">${line}</span>`;

            currentGroup.appendChild(header);
            root.appendChild(currentGroup);
            return;
        }

        // 시간 줄
        if (/^(오전|오후) \d{1,2}:\d{2}$/.test(line)) {
            const timeSpan = document.createElement("span");
            timeSpan.className = "message-time";
            timeSpan.textContent = line;

            currentGroup.querySelector(".message-header").appendChild(timeSpan);
            return;
        }

        // 메시지 라인
        if (line !== "") {
            currentMessage.push(line);
            return;
        }

        // 빈 줄 → 메시지 하나 끝남
        if (line === "") {
            flushMessage();
        }
    });

    // 파일 끝났을 때 마지막 메시지 추가
    flushMessage();
}
