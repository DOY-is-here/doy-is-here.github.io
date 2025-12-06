// 시작 날짜 설정 (2024년 8월 1일)
const START_DATE = new Date(2024, 7, 1);

// 두 날짜 사이의 일수 계산
function getDaysBetween(startDate, endDate) {
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// "함께한지 X일" 업데이트
function updateDaysDisplay(days) {
    const daysElement = document.querySelector(".days-together");
    if (daysElement) {
        daysElement.textContent = `함께한지 ${days}일`;
    }
}

// 날짜 구분바 감시 및 업데이트
export function initDaysCounter() {
    // 초기값 1일
    updateDaysDisplay(1);
    
    setTimeout(() => {
        const dateBadges = document.querySelectorAll(".date-badge");
        
        if (dateBadges.length === 0) return;
        
        const header = document.querySelector(".header");
        if (!header) return;
        
        let isRunning = false;
        
        const checkDatePosition = () => {
            if (isRunning) return;
            isRunning = true;
            
            requestAnimationFrame(() => {
                const headerHeight = header.offsetHeight;
                const targetY = headerHeight + 15; // 헤더 아래 15px 지점
                const screenHalfY = window.innerHeight / 2; // 화면 절반 지점
                
                let closestBadge = null;
                let closestDistance = Infinity;
                
                // 화면 상단 절반에 있는 날짜 중 가장 가까운 것 찾기
                dateBadges.forEach(badge => {
                    const rect = badge.getBoundingClientRect();
                    const badgeCenter = (rect.top + rect.bottom) / 2;
                    const distance = Math.abs(badgeCenter - targetY);
                    
                    // 화면 상단 절반에 있고, 화면에 보이는 날짜만 고려
                    if (badgeCenter >= 0 && badgeCenter <= screenHalfY) {
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestBadge = badge;
                        }
                    }
                });
                
                // 가장 가까운 날짜로 업데이트
                if (closestBadge) {
                    const dateText = closestBadge.textContent;
                    const match = dateText.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
                    
                    if (match) {
                        const year = parseInt(match[1]);
                        const month = parseInt(match[2]) - 1;
                        const day = parseInt(match[3]);
                        
                        const currentDate = new Date(year, month, day);
                        const daysTogether = getDaysBetween(START_DATE, currentDate);
                        
                        updateDaysDisplay(daysTogether);
                    }
                }
                
                isRunning = false;
            });
        };
        
        window.addEventListener("scroll", checkDatePosition, { passive: true });
        
        // 초기 체크
        checkDatePosition();
        
    }, 500);
}