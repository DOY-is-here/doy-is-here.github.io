// 캘린더 관련 로직
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let chatDates = new Set();

// 파싱된 데이터에서 날짜 추출
export function initCalendar(parsedData) {
    parsedData.forEach(block => {
        if (block.type === "date") {
            const match = block.text.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
            if (match) {
                const dateKey = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
                chatDates.add(dateKey);
            }
        }
    });
}

// 캘린더 HTML 생성
export function createCalendar() {
    const header = document.querySelector(".header");
    if (!header) return;
    
    // 🔥 어두운 배경 생성
    const overlay = document.createElement("div");
    overlay.className = "calendar-overlay";
    overlay.id = "calendar-overlay";
    overlay.style.display = "none";
    
    // 🔥 배경 클릭하면 캘린더 닫기
    overlay.addEventListener("click", toggleCalendar);
    
    document.body.appendChild(overlay);
    
    // 캘린더 생성
    const cal = document.createElement("div");
    cal.className = "calendar-popup";
    cal.id = "calendar-popup";
    cal.style.display = "none";
    cal.innerHTML = `
        <div class="calendar-header">
            <button class="calendar-nav" id="prev-month">‹</button>
            <div class="calendar-title">
                <span id="calendar-year-month"></span>
            </div>
            <button class="calendar-nav" id="next-month">›</button>
        </div>
        <div class="calendar-weekdays">
            <div>일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div>토</div>
        </div>
        <div class="calendar-days" id="calendar-days"></div>
    `;
    
    cal.addEventListener("click", (e) => {
        e.stopPropagation();
    });
    
    header.appendChild(cal);
    renderCalendar();
    attachCalendarEvents();
}

// 캘린더 렌더링
function renderCalendar() {
    const yearMonth = document.getElementById("calendar-year-month");
    const daysContainer = document.getElementById("calendar-days");
    
    if (!yearMonth || !daysContainer) return;
    
    yearMonth.textContent = `${currentYear}년 ${currentMonth + 1}월`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    daysContainer.innerHTML = "";
    
    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        daysContainer.appendChild(empty);
    }
    
    // 날짜 추가
    for (let day = 1; day <= lastDate; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = day;
        
        if (chatDates.has(dateKey)) {
            dayDiv.classList.add("has-chat");
            dayDiv.dataset.date = dateKey;
            dayDiv.addEventListener("click", (e) => {
                e.stopPropagation();
                scrollToDate(dateKey);
            });
        } else {
            dayDiv.classList.add("no-chat");
        }
        
        daysContainer.appendChild(dayDiv);
    }
}

// 이전/다음 달 이동
function attachCalendarEvents() {
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
    
    if (!prevBtn || !nextBtn) return;
    
    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

// 해당 날짜로 스크롤
function scrollToDate(dateKey) {
    const [year, month, day] = dateKey.split("-");
    const targetText = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    
    toggleCalendar(); // 캘린더 닫기
    
    const dateDividers = document.querySelectorAll(".date-badge");
    for (let divider of dateDividers) {
        if (divider.textContent.includes(targetText)) {
            // 헤더 높이 계산
            const header = document.querySelector(".header");
            const headerHeight = header ? header.offsetHeight : 0;
            
            // 날짜 구분선 위치 계산
            const dividerTop = divider.getBoundingClientRect().top + window.scrollY;
            
            // 헤더 바로 아래에 오도록 스크롤
            const targetPosition = dividerTop - headerHeight - 8;
            
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
            
            break;
        }
    }
}

// 캘린더 토글
export function toggleCalendar() {
    const cal = document.getElementById("calendar-popup");
    const overlay = document.getElementById("calendar-overlay");
    
    if (!cal) return;
    
    if (cal.style.display === "none") {
        // 열기
        cal.style.display = "block";
        if (overlay) overlay.style.display = "block";
    } else {
        // 닫기
        cal.style.display = "none";
        if (overlay) overlay.style.display = "none";
    }
}
