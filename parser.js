// messages.txt 로드
fetch("messages.txt")
  .then(res => res.text())
  .then(text => parseChat(text))
  .catch(err => console.error("Failed to load messages:", err));

function parseChat(text) {
    const lines = text.split("\n").map(l => l.trim());
    const root = document.getElementById("chat-root");

    let currentGroup = null;
    let currentMessage = [];

    // 메시지 하나 완성
    function flushMessage() {
        if (currentMessage.length === 0 || !currentGroup) return;

        const msgHTML = currentMessage.join("<br>");

        const row = document.createElement("div");
        row.className = "message-row continued";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.innerHTML = `<div class="message-text">${msgHTML}</div>`;

        row.appendChild(bubble);
        currentGroup.appendChild(row);

        currentMessage = [];
    }

    lines.forEach((line, index) => {
        const nextLine = lines[index + 1] || "";

        // 📌 날짜 감지
        if (/^\d{4}년 \d{1,2}월 \d{1,2}일/.test(line)) {
            flushMessage();
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<div class="date-badge">${line}</div>`;
            root.appendChild(dateDiv);
            return;
        }

        // 📌 발신자 감지 (정확하게 수정됨)
        // 조건: 다음 줄이 "오전/오후 HH:MM"
        if (/^[A-Za-z가-힣]+$/.test(line) &&
            /^(오전|오후) \d{1,2}:\d{2}$/.test(nextLine)) {

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

        // 📌 시간 라인
        if (/^(오전|오후) \d{1,2}:\d{2}$/.test(line)) {
            const timeSpan = document.createElement("span");
            timeSpan.className = "message-time";
            timeSpan.textContent = line;
            currentGroup?.querySelector(".message-header")?.appendChild(timeSpan);
            return;
        }

        // 📌 사진/이모티콘/동영상
        if (/^\[.*?\]/.test(line)) {
            flushMessage();
            currentMessage.push(line);
            flushMessage();
            return;
        }

        // 📌 일반 메시지
        if (line !== "") {
            currentMessage.push(line);
            return;
        }

        // 빈 줄 → 메시지 종료
        if (line === "") {
            flushMessage();
        }
    });

    // 파일 끝
    flushMessage();
}
