let textCache = [];
let htmlCache = [];
let elements = [];
let initialized = false;

let highlightPositions = [];
let currentIndex = -1;

function initCache() {
    if (initialized) return;

    elements = Array.from(document.querySelectorAll(".message-text"));
    textCache = elements.map(el => el.innerText);
    htmlCache = elements.map(el => el.innerHTML);

    initialized = true;
}

export function handleSearch(input) {
    const keyword = input.value.trim().toLowerCase();
    initCache();

    highlight(keyword);
    collectHighlights();

    if (!keyword || highlightPositions.length === 0) {
        hideSearchNav();
        updateIndexDisplay();
        return;
    }

    showSearchNav();

    currentIndex = 0;
    scrollToHighlight(0);
    updateIndexDisplay();
}

// 하이라이트 렌더링 - HTML 보존
function highlight(keyword) {
    if (!keyword) {
        elements.forEach((el, i) => el.innerHTML = htmlCache[i]);
        highlightPositions = [];
        currentIndex = -1;
        updateIndexDisplay();
        return;
    }

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reg = new RegExp(`(${escaped})`, "gi");

    elements.forEach((el, i) => {
        const originalHTML = htmlCache[i];
        const newHTML = originalHTML.replace(reg, `<mark class="highlight">$1</mark>`);

        if (el.innerHTML !== newHTML) {
            el.innerHTML = newHTML;
        }
    });
}

// 하이라이트 위치 수집
function collectHighlights() {
    highlightPositions = Array.from(document.querySelectorAll("mark.highlight"));
    currentIndex = highlightPositions.length > 0 ? 0 : -1;
}

// 이동 기능
export function nextResult() {
    if (highlightPositions.length === 0) return;

    currentIndex = (currentIndex + 1) % highlightPositions.length;
    scrollToHighlight(currentIndex);
    updateIndexDisplay();
}

export function prevResult() {
    if (highlightPositions.length === 0) return;

    currentIndex = (currentIndex - 1 + highlightPositions.length) % highlightPositions.length;
    scrollToHighlight(currentIndex);
    updateIndexDisplay();
}

// 해당 하이라이트로 스크롤 이동
function scrollToHighlight(index) {
    const el = highlightPositions[index];
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    highlightPositions.forEach(h => h.classList.remove("active-highlight"));
    el.classList.add("active-highlight");
}

// UI 업데이트
function updateIndexDisplay() {
    const counter = document.getElementById("search-index");
    if (!counter) return;

    if (highlightPositions.length === 0) {
        counter.textContent = "";
        return;
    }

    counter.textContent = `${currentIndex + 1} / ${highlightPositions.length}`;
}

// 검색 초기화 함수
export function clearSearch() {
    if (!initialized) return;
    
    // 하이라이트 제거
    elements.forEach((el, i) => el.innerHTML = htmlCache[i]);
    
    // 검색바 비우기
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
        searchBar.value = "";
    }
    
    // 상태 초기화
    highlightPositions = [];
    currentIndex = -1;
    
    // 네비게이션 숨기기
    hideSearchNav();
    updateIndexDisplay();
}

// 네비게이션 보이기/숨기기 기능
function showSearchNav() {
    const nav = document.querySelector(".search-nav");
    if (nav) nav.style.display = "flex";
}

function hideSearchNav() {
    const nav = document.querySelector(".search-nav");
    if (nav) nav.style.display = "none";
}