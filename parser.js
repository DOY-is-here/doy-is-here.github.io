// 채팅 로그 파서 스크립트 - parser.js (UTF-8 인코딩)
console.log("챗로그 파서를 시작합니다.");

const 채팅루트 = document.getElementById('chat-root');

// 채팅 메시지 전체를 담을 컨테이너 생성 (.chat-messages 클래스 적용)
const 채팅메시지컨테이너 = document.createElement('div');
채팅메시지컨테이너.classList.add('chat-messages');
채팅루트.appendChild(채팅메시지컨테이너);

// 메시지.txt 파일을 불러오기
fetch('messages.txt')
  .then(response => response.text())
  .then(text => {
    // 텍스트 데이터를 줄 단위로 분리
    const 모든줄 = text.split(/\r?\n/);

    // 파싱한 채팅 데이터를 저장할 구조
    const 날짜별채팅 = [];    // 각 날짜별 객체 { date: 'YYYY년 M월 D일 ...', messages: [...] }

    let 현재날짜섹션 = null;  // 현재 처리 중인 날짜 섹션 객체
    let 이전발신자 = null;    // 이전 메시지의 발신자 이름 (그룹화 용도)

    // 유틸리티 함수: 날짜 형식 식별
    const 라인이다날짜 = (line) => /\d{4}년\s\d+월\s\d+일/.test(line);
    // 유틸리티 함수: 시간 형식 식별 (오전/오후 HH:MM)
    const 라인이다시간 = (line) => /^(오전|오후)\s\d{1,2}:\d{2}/.test(line);
    // 유틸리티 함수: 발신자 이름 행 식별 (다음 줄이 시간인 경우)
    const 라인이다이름 = (line, nextLine) => {
      return line !== '' && !라인이다날짜(line) && nextLine && 라인이다시간(nextLine);
    };

    // 각 줄을 순회하며 파싱
    for (let i = 0; i < 모든줄.length; i++) {
      const 줄 = 모든줄[i].trim();
      if (줄 === '') {
        // 빈 줄은 건너뛰기
        continue;
      }

      if (라인이다날짜(줄)) {
        // 날짜 구분 행일 경우, 새로운 날짜 섹션 생성
        현재날짜섹션 = { date: 줄, messages: [] };
        날짜별채팅.push(현재날짜섹션);
        이전발신자 = null;
      } else if (라인이다이름(줄, 모든줄[i+1] ? 모든줄[i+1].trim() : '')) {
        // 새로운 메시지의 시작 (발신자 이름 행)
        const 발신자 = 줄;
        const 시간 = 모든줄[i+1] ? 모든줄[i+1].trim() : '';
        i += 1;  // 시간 행을 소비했으므로 인덱스 추가로 이동

        // 메시지 내용 수집 (한 줄 이상일 수 있음)
        const 내용라인들 = [];
        // 다음 줄부터 내용을 모두 모읍니다 (빈 줄, 새 날짜, 또는 다음 이름 행이 나오기 전까지)
        while (i + 1 < 모든줄.length) {
          const 다음줄 = 모든줄[i+1].trim();
          if (다음줄 === '' || 라인이다날짜(다음줄) || 라인이다이름(다음줄, 모든줄[i+2] ? 모든줄[i+2].trim() : '')) {
            break;
          }
          // 내용 줄을 추가하고 진행
          내용라인들.push(다음줄);
          i += 1;
        }
        // 내용 라인이 하나도 없을 경우 (이론상 거의 없지만) 빈 문자열로 처리
        if (내용라인들.length === 0) {
          내용라인들.push(''); 
        }

        // 현재 날짜 섹션에 메시지 객체 추가
        if (현재날짜섹션) {
          현재날짜섹션.messages.push({
            sender: 발신자,
            time: 시간,
            contentLines: 내용라인들
          });
        }
        이전발신자 = 발신자;
      } else {
        // 이 경우 줄이 이름도 날짜도 아니므로, 이전 메시지의 다중 라인 내용으로 간주
        // (만약 로그 포맷이 정확하다면 이 블록은 잘 발생하지 않습니다.)
        if (현재날짜섹션 && 현재날짜섹션.messages.length > 0) {
          현재날짜섹션.messages[현재날짜섹션.messages.length - 1].contentLines.push(줄);
        }
      }
    }

    // 파싱된 데이터를 기반으로 DOM 생성
    날짜별채팅.forEach(날짜섹션 => {
      // 날짜 구분 요소 생성 (date-divider + date-badge)
      const 날짜구분 = document.createElement('div');
      날짜구분.classList.add('date-divider');
      const 날짜배지 = document.createElement('span');
      날짜배지.classList.add('date-badge');
      날짜배지.textContent = 날짜섹션.date;
      날짜구분.appendChild(날짜배지);
      // 채팅 메시지 컨테이너에 날짜 구분 추가
      채팅메시지컨테이너.appendChild(날짜구분);

      // 같은 날짜의 메시지들을 발신자별 그룹으로 묶어 출력
      let 현재그룹엘리먼트 = null;
      let 현재그룹발신자 = null;

      날짜섹션.messages.forEach((메시지, idx) => {
        const { sender: 발신자, time: 시간, contentLines: 내용라인들 } = 메시지;
        const 첫메시지인가 = (idx === 0 || 발신자 !== 현재그룹발신자);
        // 새로운 그룹 시작 조건: 첫 메시지이거나, 이전 메시지와 발신자가 달라진 경우
        if (첫메시지인가) {
          // 새로운 메시지 그룹 컨테이너 생성
          현재그룹엘리먼트 = document.createElement('div');
          현재그룹엘리먼트.classList.add('message-group');
          채팅메시지컨테이너.appendChild(현재그룹엘리먼트);
          현재그룹발신자 = 발신자;
        }

        // 메시지 한 개 행 생성 (.message-row)
        const 메시지행 = document.createElement('div');
        메시지행.classList.add('message-row');
        if (!첫메시지인가) {
          // 동일 발신자의 연속 메시지인 경우 continued 클래스 추가
          메시지행.classList.add('continued');
        }

        // 메시지 내용 컨테이너 생성 (.message-content)
        const 메시지컨텐츠 = document.createElement('div');
        메시지컨텐츠.classList.add('message-content');

        // 첫 메시지일 때만 메시지 헤더 (이름+시간) 생성
        if (첫메시지인가) {
          const 메시지헤더 = document.createElement('div');
          메시지헤더.classList.add('message-header');
          const 보낸사람이름 = document.createElement('span');
          보낸사람이름.classList.add('sender-name');
          보낸사람이름.textContent = 발신자;
          const 메시지시간 = document.createElement('span');
          메시지시간.classList.add('message-time');
          메시지시간.textContent = 시간;
          메시지헤더.appendChild(보낸사람이름);
          메시지헤더.appendChild(메시지시간);
          메시지컨텐츠.appendChild(메시지헤더);
        } else {
          // 연속 메시지인 경우 이름 없이 시간만 표시 (헤더 재사용)
          const 메시지헤더 = document.createElement('div');
          메시지헤더.classList.add('message-header');
          const 메시지시간 = document.createElement('span');
          메시지시간.classList.add('message-time');
          메시지시간.textContent = 시간;
          // 발신자 이름 span은 추가하지 않음 (연속 메시지이므로)
          메시지헤더.appendChild(메시지시간);
          메시지컨텐츠.appendChild(메시지헤더);
        }

        // 메시지 말풍선 요소 생성 (.message-bubble)
        const 말풍선 = document.createElement('div');
        말풍선.classList.add('message-bubble');

        // 메시지 텍스트 요소 생성 (.message-text)
        const 텍스트엘리먼트 = document.createElement('span');
        텍스트엘리먼트.classList.add('message-text');
        // 내용 라인들을 모두 추가 (라인 사이에 <br> 삽입하여 줄바꿈 유지)
        내용라인들.forEach((line, index) => {
          텍스트엘리먼트.appendChild(document.createTextNode(line));
          if (index < 내용라인들.length - 1) {
            텍스트엘리먼트.appendChild(document.createElement('br'));
          }
        });

        // 텍스트를 말풍선에 추가하고, 말풍선을 컨텐츠에 추가
        말풍선.appendChild(텍스트엘리먼트);
        메시지컨텐츠.appendChild(말풍선);

        // 컨텐츠를 메시지 행에 추가하고, 메시지 행을 현재 그룹에 추가
        메시지행.appendChild(메시지컨텐츠);
        현재그룹엘리먼트.appendChild(메시지행);
      });
    });

    console.log("챗로그 파싱 및 DOM 생성이 완료되었습니다.");
  })
  .catch(error => {
    console.error("메시지 파일을 불러오는 중 오류 발생:", error);
  });
