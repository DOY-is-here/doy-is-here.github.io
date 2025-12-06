
.search-wrapper {
    display: none;
    position: relative;
    align-items: center;
    padding: 30px 0px;
}    

.search-bar {
    width: 325px;
    margin: 8px 8px 8px 0px; 
    padding: 8px 12px 8px 18px;
    border-radius: 20px;
    padding-right: 80px; 
    border: 1px solid #C0C4D3;
    font-size: 16px;
    line-height: 20px;
    outline: none;
    background: #FFFFFF;
    box-sizing: border-box;   
}

.search-bar-container {
    left: 16px;
    position: absolute;
    display: flex;
    align-items: center;
}

.calendar-btn {
    position: absolute;
    right: 16px;

    width: 20px;
    height: 20px;
    border: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 4V12M16 4V12M6 20H42M10 8H38C40.2091 8 42 9.79086 42 12V40C42 42.2091 40.2091 44 38 44H10C7.79086 44 6 42.2091 6 40V12C6 9.79086 7.79086 8 10 8Z' stroke='%2350535D' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-color: transparent;
}

/* 
.calendar-picker {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
    pointer-events: none;
}
*/

.highlight {
    background: rgba(231, 181, 191, 0.5);
}

.active-highlight {
    background: #E7B5BF;
}

/* 검색 네비 */
.search-nav {
    position: absolute; 
    right: 8px;
    display: none;
    align-items: center;
    padding: 8px 12px;
    border-radius: 12px;
}

#next-result,
#prev-result {
    width: 13px;
    height: 13px;
    border: none;
    background: transparent;
    cursor: pointer;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    flex-shrink: 0;
}

#next-result {
    background-image: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 18L24 30L36 18' stroke='%231E1E1E' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

#prev-result {
    background-image: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 30L24 18L12 30' stroke='%231E1E1E' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

#search-index {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    min-width: 35px;
    text-align: center;
}
