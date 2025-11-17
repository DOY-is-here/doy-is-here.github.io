// messages.txt를 불러와서 처리
fetch("messages.txt")
  .then(res => res.text())
  .then(text => parseChat(text));

// POP 채팅 렌더링 함수
function parseChat(text) {
    const lines = text.split("\n");
    const root = document.getElementById("chat-root");

    let currentGroup = null;

    lines.forEach((line, index) => {
        line = line.trim();

        // 날짜 줄 인식: "2024년 8월 01일 목요일"
        if (/^\d{4}년/.test(line)) {
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<div class="date-badge">${line}</div>`;
            root.appendChild(dateDiv);
            return;
        }

        // 발신자 줄 (DOY 또는 네 이름)
        if (/^[A-Za-z가-힣]+$/.test(line) && lines[index + 1]?.includes(":") === false) {
            currentGroup = document.createElement("div");
            currentGroup.className = "message-group";

            const header = document.createElement("div");
            header.className = "message-header";
            header.innerHTML = `<span class="sender-name">${line}</span>`;

            currentGroup.appendChild(header);
            root.appendChild(currentGroup);
            return;
        }

        // 시간 줄 인식 (오전 1:23, 오후 12:20 등)
        if (/^(오전|오후) \d{1,2}:\d{2}$/.test(line)) {
            const timeSpan = document.createElement("span");
            timeSpan.className = "message-time";
            timeSpan.innerText = line;
            currentGroup.querySelector(".message-header").appendChild(timeSpan);
            return;
        }

        // 메시지 내용 (여러 줄 가능)
        if (line !== "") {
            const row = document.createElement("div");
            row.className = "message-row continued";

            const bubble = document.createElement("div");
            bubble.className = "message-bubble";

            bubble.innerHTML = `<div class="message-text">${line.replace(/\n/g, "<br>")}</div>`;

            row.appendChild(bubble);
            currentGroup.appendChild(row);
        }
    });
}
