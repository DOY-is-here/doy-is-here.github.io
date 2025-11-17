// messages.txt → POP 채팅 HTML 자동 렌더링

fetch("messages.txt")
  .then(res => res.text())
  .then(text => parseChat(text));

function parseChat(text) {
  const lines = text.split("\n").map(l => l.trim());
  const root = document.getElementById("chat-root");

  let currentGroup = null;
  let currentSender = null;

  const dateRegex = /^\d{4}년 \d{1,2}월 \d{1,2}일/;
  const timeRegex = /^(오전|오후) \d{1,2}:\d{2}$/;
  const durationRegex = /^\d{1,2}:\d{2}$/;
  const imageRegex = /(jpeg|jpg|png|webp|gif)/i;
  const urlRegex = /(http|https):\/\//;

  lines.forEach((line, i) => {
    if (!line) return;

    // ---------- 1) 날짜 ----------
    if (dateRegex.test(line)) {
      const dateDiv = document.createElement("div");
      dateDiv.className = "date-divider";
      dateDiv.innerHTML = `<div class="date-badge">${line}</div>`;
      root.appendChild(dateDiv);
      currentSender = null;
      return;
    }

    // ---------- 2) 발신자 ----------
    if (/^[A-Za-z가-힣]+$/.test(line) && !timeRegex.test(lines[i+1])) {
      currentSender = line;
      currentGroup = document.createElement("div");
      currentGroup.className = "message-group";

      const header = document.createElement("div");
      header.className = "message-header";
      header.innerHTML = `<span class="sender-name">${line}</span>`;

      currentGroup.appendChild(header);
      root.appendChild(currentGroup);
      return;
    }

    // ---------- 3) 시간 ----------
    if (timeRegex.test(line)) {
      if (currentGroup) {
        const timeSpan = document.createElement("span");
        timeSpan.className = "message-time";
        timeSpan.innerText = line;
        currentGroup.querySelector(".message-header").appendChild(timeSpan);
      }
      return;
    }

    // ---------- 4) 사진/이미지 ----------
    if (imageRegex.test(line) || (urlRegex.test(line) && !durationRegex.test(line))) {
      const imgDiv = document.createElement("div");
      imgDiv.className = "message-image landscape";
      imgDiv.innerHTML = `<img src="${line}" alt="image">`;

      currentGroup.appendChild(imgDiv);
      return;
    }

    // ---------- 5) 영상 ----------
    if (durationRegex.test(line)) {
      const vDiv = document.createElement("div");
      vDiv.className = "message-video";
      vDiv.innerHTML = `
        <img src="https://via.placeholder.com/240x400/000/FFFFFF?text=Video" class="video-thumbnail">
        <div class="video-overlay">
            <span class="video-play-icon">▶</span>
            <span class="video-time">${line}</span>
        </div>
      `;
      currentGroup.appendChild(vDiv);
      return;
    }

    // ---------- 6) 답장 ----------
    if (line.startsWith("↳")) {
      const replyDiv = document.createElement("div");
      replyDiv.className = "reply-bubble";
      replyDiv.innerHTML = `
        <div class="reply-header">${currentSender}님의 답장</div>
        <div class="reply-text"><span class="reply-arrow">↳</span> ${line.substring(1).trim()}</div>
      `;
      currentGroup.appendChild(replyDiv);
      return;
    }

    // ---------- 7) 일반 텍스트 메시지 ----------
    const row = document.createElement("div");
    row.className = "message-row continued";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = `<div class="message-text">${line}</div>`;

    row.appendChild(bubble);
    currentGroup.appendChild(row);
  });
}
