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

function collectHighlights() {
    highlightPositions = Array.from(document.querySelectorAll("mark.highlight"));
    currentIndex = highlightPositions.length > 0 ? 0 : -1;
}

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

function updateIndexDisplay() {
    const counter = document.getElementById("search-index");
    if (!counter) return;

    if (highlightPositions.length === 0) {
        counter.textContent = "";
        return;
    }

    counter.textContent = `${currentIndex + 1} / ${highlightPositions.length}`;
}

export function clearSearch() {
    if (!initialized) return;
    
    elements.forEach((el, i) => el.innerHTML = htmlCache[i]);
    
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
        searchBar.value = "";
    }
    
    highlightPositions = [];
    currentIndex = -1;
    
    hideSearchNav();
    updateIndexDisplay();
}

function showSearchNav() {
    const nav = document.querySelector(".search-nav");
    if (nav) nav.style.display = "flex";
}

function hideSearchNav() {
    const nav = document.querySelector(".search-nav");
    if (nav) nav.style.display = "none";
}