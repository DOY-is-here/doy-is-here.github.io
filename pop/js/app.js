import { loadText, parseMessages } from "./parser.js";
import { createHeader, initHeaderEvents } from "./header.js";
import { renderMessages } from "./ui/messages.js";
import { createCalendar, initCalendar } from "./calendar.js";
import { initDaysCounter } from "./daysCounter.js";
import { createSearchNav } from "./search.js";

document.addEventListener("DOMContentLoaded", async () => {
    const text = await loadText();
    const parsedData = parseMessages(text);

    const root = document.getElementById("chat-container");
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";

    chatContainer.appendChild(createHeader());
    const messagesDOM = renderMessages(parsedData);
    chatContainer.appendChild(messagesDOM);
    root.appendChild(chatContainer);

    // 캘린더 초기화
    initCalendar(parsedData);
    createCalendar();

    // 검색 네비게이션 생성
    createSearchNav();

    // 헤더 이벤트 초기화
    initHeaderEvents();
    
    // 날짜 카운터 초기화
    initDaysCounter();
});