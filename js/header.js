import { handleSearch, nextResult, prevResult } from "./search.js";
import { toggleCalendar } from "./calendar.js";

export function createHeader() {
    const h = document.createElement("div");
    h.className = "header";

    h.innerHTML = `
        <div class="status-bar"></div>

        <div class="header-content">
            <div class="header-left"><div class="back-button"></div></div>

            <div class="header-title">
                <div class="title-row">
                    <span class="chat-name">DOY</span>
                    <span class="dropdown-icon"></span>
                </div>
                <div class="days-together">함께한지 490일</div>
            </div>

            <div class="header-right"><div class="search-button"></div></div>
        </div>

        <div class="search-wrapper">
            <div class="search-bar-container">
                <input type="text" class="search-bar" id="searchBar" placeholder="검색..." />
                <div class="search-nav">
                    <button id="prev-result"></button>
                    <span id="search-index"></span>
                    <button id="next-result"></button>
                </div>
            </div>
            
            <button id="calendar-btn" class="calendar-btn"></button>
        </div>
    `;
    return h;
}

export function initHeaderEvents() {
    document.addEventListener("click", (e) => {
        if (e.target.closest(".search-button")) {
            toggleSearchBar();
            return;
        }
        if (e.target.closest(".calendar-btn")) {
            toggleCalendar();
            return;
        }
        if (e.target.id === "prev-result") {
            prevResult();
            return;
        }
        if (e.target.id === "next-result") {
            nextResult();
            return;
        }
    });

    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("search-bar")) {
            handleSearch(e.target);
        }
    });
}

function toggleSearchBar() {
    const wrapper = document.querySelector(".search-wrapper");
    const hidden = !wrapper.style.display || wrapper.style.display === "none";

    wrapper.style.display = hidden ? "flex" : "none";

    if (hidden) {
        const bar = wrapper.querySelector(".search-bar");
        bar.focus();
    }
}