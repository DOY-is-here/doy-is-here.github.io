// messages.txt 파일을 파싱하여 채팅 UI를 생성하는 스크립트

async function loadMessages() {
    try {
        const response = await fetch('messages.txt');
        const text = await response.text();
        parseAndRenderMessages(text);
    } catch (error) {
        console.error('메시지 파일을 불러오는데 실패했습니다:', error);
    }
}

function parseAndRenderMessages(text) {
    const lines = text.split('\n');
    const chatRoot = document.getElementById('chat-root');
    
    // 채팅 컨테이너 생성
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // 헤더 생성
    chatContainer.appendChild(createHeader());
    
    // 채팅 메시지 영역 생성
    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages';
    
    let currentDate = '';
    let currentSender = '';
    let currentTime = '';
    let messageGroup = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 빈 줄 건너뛰기
        if (line === '') continue;
        
        // 날짜 구분선 감지 (예: "2024년 8월 01일 목요일")
        if (line.match(/^\d{4}년 \d{1,2}월 \d{1,2}일 [월화수목금토일]요일$/)) {
            // 이전 메시지 그룹 처리
            if (messageGroup.length > 0) {
                chatMessages.appendChild(createMessageGroup(messageGroup));
                messageGroup = [];
            }
            
            currentDate = line;
            chatMessages.appendChild(createDateDivider(currentDate));
            currentSender = '';
            currentTime = '';
            continue;
        }
        
        // 발신자 + 시간 감지
        if (line === 'DOY' && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.match(/^(오전|오후) \d{1,2}:\d{2}$/)) {
                const newSender = line;
                const newTime = nextLine;
                
                // 시간이 바뀌면 이전 그룹 렌더링
                if (currentTime !== newTime || currentSender !== newSender) {
                    if (messageGroup.length > 0) {
                        chatMessages.appendChild(createMessageGroup(messageGroup));
                        messageGroup = [];
                    }
                }
                
                currentSender = newSender;
                currentTime = newTime;
                i++; // 시간 줄 건너뛰기
                continue;
            }
        }
        
        // 메시지 내용 수집
        if (currentSender && currentTime) {
            messageGroup.push({
                sender: currentSender,
                time: currentTime,
                content: line
            });
        }
    }
    
    // 마지막 메시지 그룹 처리
    if (messageGroup.length > 0) {
        chatMessages.appendChild(createMessageGroup(messageGroup));
    }
    
    chatContainer.appendChild(chatMessages);
    chatRoot.appendChild(chatContainer);
}

function createHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    
    header.innerHTML = `
        <div class="status-bar">
        </div>
        <div class="header-content">
            <div class="header-left">
                <div class="back-button">‹</div>
                <div class="header-title">
                    <div class="title-row">
                        <span class="chat-name">DOY</span>
                        <span class="dropdown-icon">∨</span>
                    </div>
                    <div class="days-together">함께한지 600일</div>
                </div>
            </div>
            <div class="search-button">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </div>
        </div>
    `;
    
    return header;
}

function createDateDivider(dateText) {
    const divider = document.createElement('div');
    divider.className = 'date-divider';
    divider.innerHTML = `<div class="date-badge">${dateText}</div>`;
    return divider;
}

function createMessageGroup(messages) {
    const group = document.createElement('div');
    group.className = 'message-group';
    
    messages.forEach((msg, index) => {
        const isFirstMessage = index === 0;
        const messageRow = createMessageRow(msg, isFirstMessage);
        group.appendChild(messageRow);
    });
    
    return group;
}

function createMessageRow(message, showProfile) {
    const row = document.createElement('div');
    row.className = 'message-row' + (showProfile ? '' : ' continued');
    
    // 프로필 사진 (첫 메시지에만 표시)
    if (showProfile) {
        const profile = document.createElement('div');
        profile.className = 'profile-pic';
        row.appendChild(profile);
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // 연속 메시지는 프로필 공간만큼 왼쪽 여백 추가 (50px = 40px 프로필 + 10px gap)
    if (!showProfile) {
        content.style.marginLeft = '50px';
    }
    
    // 발신자 이름과 시간 (첫 메시지에만 표시)
    if (showProfile) {
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `
            <span class="sender-name">${message.sender}</span>
            <span class="message-time">${message.time}</span>
        `;
        content.appendChild(header);
    }
    
    // 메시지 내용 생성
    const messageElement = createMessageContent(message.content);
    content.appendChild(messageElement);
    
    row.appendChild(content);
    return row;
}

function createMessageContent(content) {
    // 답장 메시지 처리
    if (content.includes('DOY님의 답장')) {
        return createReplyMessage(content);
    }
    
    // 음성 메시지 처리
    if (content.match(/^\[음성메시지\] \d{2}:\d{2}$/)) {
        return createVoiceMessage(content);
    }
    
    // 종료된 라이브 처리
    if (content === '종료된 라이브') {
        return createLiveEnded();
    }
    
    // 이모티콘 처리
    if (content === '[이모티콘]') {
        return createEmoticon();
    }
    
    // 사진 처리
    if (content === '[사진]') {
        return createImage();
    }
    
    // 동영상 처리
    if (content.match(/^\[동영상\] \d{2}:\d{2}$/)) {
        return createVideo(content);
    }
    
    // 일반 텍스트 메시지
    return createTextMessage(content);
}

function createTextMessage(text) {
    const bubble = document.createElement('div');
    
    // 짧은 메시지 판별 (15자 이하)
    const isShort = text.length <= 15 && !text.includes('<br>');
    
    bubble.className = 'message-bubble' + (isShort ? ' small' : '');
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = text.replace(/<br>/g, '<br>');
    
    bubble.appendChild(messageText);
    return bubble;
}

function createReplyMessage(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const replyBubble = document.createElement('div');
    replyBubble.className = 'reply-bubble';
    
    // 답장 헤더와 인용문을 하나의 영역으로
    const replyQuoted = document.createElement('div');
    replyQuoted.className = 'reply-quoted-section';
    
    const header = document.createElement('div');
    header.className = 'reply-header';
    header.textContent = 'DOY님의 답장';
    
    const quoted = document.createElement('div');
    quoted.className = 'reply-quoted-text';
    if (lines.length > 1) {
        quoted.textContent = lines[1];
    }
    
    replyQuoted.appendChild(header);
    replyQuoted.appendChild(quoted);
    replyBubble.appendChild(replyQuoted);
    
    // 답장 내용
    if (lines.length > 2) {
        const replyText = document.createElement('div');
        replyText.className = 'reply-content';
        replyText.innerHTML = `↳ ${lines.slice(2).join('<br>')}`;
        replyBubble.appendChild(replyText);
    }
    
    return replyBubble;
}

function createVoiceMessage(content) {
    const match = content.match(/\[음성메시지\] (\d{2}):(\d{2})/);
    const duration = match ? `${match[1]}:${match[2]}` : '00:04';
    
    const voiceDiv = document.createElement('div');
    voiceDiv.className = 'voice-message';
    
    voiceDiv.innerHTML = `
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
    
    return voiceDiv;
}

function createLiveEnded() {
    const liveDiv = document.createElement('div');
    liveDiv.className = 'live-ended';
    
    liveDiv.innerHTML = `
        <div class="live-container">
            <div class="live-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.7-6.5-6.5l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/>
                </svg>
            </div>
            <div class="live-info">
                <div class="live-title">종료된 라이브</div>
                <div class="live-time">ㅡ,ㅡ</div>
            </div>
        </div>
    `;
    
    return liveDiv;
}

function createEmoticon() {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble small';
    bubble.innerHTML = '<div class="message-text">🎉</div>';
    return bubble;
}

function createImage() {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'message-image landscape';
    imageDiv.innerHTML = `
        <img src="https://via.placeholder.com/284x200/C9D0EA/646774?text=사진" alt="사진">
    `;
    return imageDiv;
}

function createVideo(content) {
    const match = content.match(/\[동영상\] (\d{2}):(\d{2})/);
    const duration = match ? `${match[1]}:${match[2]}` : '00:02';
    
    const videoDiv = document.createElement('div');
    videoDiv.className = 'message-video';
    
    videoDiv.innerHTML = `
        <img src="https://via.placeholder.com/174x300/C9D0EA/646774?text=동영상" alt="동영상" class="video-thumbnail">
        <div class="video-overlay">
            <span class="video-play-icon">▶</span>
        </div>
        <div class="video-duration">${duration}</div>
    `;
    
    return videoDiv;
}

// 페이지 로드시 실행
document.addEventListener('DOMContentLoaded', loadMessages);
