// messages.txt 파일을 읽어오는 함수
export async function loadText() {
    try {
        const response = await fetch("messages.txt");
        return await response.text();
    } catch (error) {
        console.error("파일 로드 실패:", error);
        return "";
    }
}

// 텍스트를 분석해서 데이터 덩어리(배열)로 만드는 함수
export function parseMessages(text) {
    const lines = text.split("\n");
    const parsedData = []; // 최종 데이터를 담을 배열

    let currentSender = "";
    let currentTime = "";
    let messageBuffer = []; // 같은 사람/시간대의 메시지를 모으는 버퍼

    // 버퍼에 있는 메시지를 최종 데이터에 저장하는 함수
    const flushBuffer = () => {
        if (messageBuffer.length > 0) {
            parsedData.push({ type: "group", messages: messageBuffer });
            messageBuffer = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. 날짜 파싱
        if (line.match(/^\d{4}년 \d{1,2}월 \d{1,2}일/)) {
            flushBuffer(); // 이전 메시지 저장
            parsedData.push({ type: "date", text: line });
            currentSender = "";
            currentTime = "";
            continue;
        }

        // 2. 송신자 + 시간 파싱 (DOY 오전 12:00)
        if (line === "도의" && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.match(/^(오전|오후) \d{1,2}:\d{2}$/)) {
                flushBuffer(); // 이전 메시지 저장
                currentSender = line;
                currentTime = nextLine;
                i++;
                continue;
            }
        }

        const next = lines[i + 1]?.trim();

        // 3. 답장 (Reply)
        if (line.endsWith("님의 답장") && next && lines[i + 2]) {
            messageBuffer.push({
                type: "reply",
                sender: currentSender,
                time: currentTime,
                replyHeader: line,
                replyOriginal: next,
                replyText: lines[i + 2].trim().replace(/^↳\s*/, "")
            });
            i += 2;
            continue;
        }

        // 4. 라이브 종료
        if (line === "종료된 라이브" && next) {
            messageBuffer.push({
                type: "live",
                sender: currentSender,
                time: currentTime,
                liveTitle: next
            });
            i++;
            continue;
        }

        // 5. 미디어 (음성, 사진, 동영상, 이모티콘)
        // 공통 처리를 위한 헬퍼 함수
        const addMedia = (type, content, url) => {
            messageBuffer.push({ type, sender: currentSender, time: currentTime, content, url });
            i++;
        };

        if (line.startsWith("[음성메시지]") && next?.startsWith("https://")) {
            addMedia("voice", line, next); continue;
        }
        if (line === "[사진]" && next?.startsWith("https://")) {
            addMedia("image", line, next); continue;
        }
        if (line.startsWith("[동영상]") && next?.startsWith("https://")) {
            addMedia("video", line, next); continue;
        }
        if (line === "[이모티콘]" && next?.startsWith("https://")) {
            addMedia("emoticon", line, next); continue;
        }

        // 6. 일반 텍스트
        messageBuffer.push({
            type: "text",
            sender: currentSender,
            time: currentTime,
            text: line
        });
    }

    flushBuffer(); // 마지막 남은 메시지 저장
    return parsedData;
}
