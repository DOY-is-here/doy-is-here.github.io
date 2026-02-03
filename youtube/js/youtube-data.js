// YouTube 데이터 관리
// 전체 영상 수: 115개

// GitHub 설정
const GITHUB_USER = 'DOY-is-here';
const GITHUB_REPO = 'doy-is-here.github.io';
const REELS_FOLDER = 'reels';

// 동영상 데이터 (youtube-url.txt 파싱 결과)
// type: 'video' = 일반 동영상, 'live' = 라이브
// playlist: 재생목록 카테고리
export const allVideos = [
    {
        id: 'video-1',
        title: 'Notes : NO PLAN BEHIND | NOMAD',
        youtubeId: '-vnuL8cMRVI',
        uploadDate: '2025. 12. 29.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-2',
        title: "'Soft Spot - keshi' by NOMAD DOY&SANGHA",
        youtubeId: 'Mf3YE0Tt35U',
        uploadDate: '2025. 12. 6.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-3',
        title: 'Notes : INDIA 2025 | NOMAD',
        youtubeId: 'Jh-yVBl_q8I',
        uploadDate: '2025. 8. 29.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-4',
        title: '[NOMAD DRIVE] HAPPY JUNHO DAY & NOMAD 500 DAYS 💖 | NOMAD 노매드',
        youtubeId: 'OLtNh9Ny4zQ',
        uploadDate: '2025. 8. 7.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-5',
        title: "'SOME LIKE IT HOT!!(사무라이 하트) - SPYAIR' by NOMAD",
        youtubeId: 'rNmnE_VstOU',
        uploadDate: '2025. 8. 4.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-6',
        title: 'Notes : 2025 BOF(부산 원아시아 페스티벌) | NOMAD',
        youtubeId: 'FlXllnr_-ys',
        uploadDate: '2025. 7. 15.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-7',
        title: '도의가 쏘는🔫 맛집 노트🗒️ 소개서 [도쏜트] EP.00 | NOMAD 노매드',
        youtubeId: '7xDmSk2b2UQ',
        uploadDate: '2025. 7. 1.',
        type: 'video',
        playlist: '도쏜트'
    },
    {
        id: 'video-8',
        title: '[NOMAD DRIVE] NOMAD IS HERE in SHANGHAI | NOMAD 노매드',
        youtubeId: '_VCIzXNvf3M',
        uploadDate: '2025. 6. 27.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-9',
        title: 'Notes : Random Busking in SEOUL (HANGANG) | NOMAD',
        youtubeId: 'Bw46GXvSpvU',
        uploadDate: '2025. 5. 27.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-10',
        title: '[놀이터 NORITER] 어린이날 특집 ASMR : 도의&상하&원 최애 동요 읽기 | NOMAD 노매드',
        youtubeId: 'i5ohKyAPcIs',
        uploadDate: '2025. 5. 5.',
        type: 'video',
        playlist: '놀이터 NORITER'
    },
    {
        id: 'video-11',
        title: 'HAPPY ONE DAY 💖 | NOMAD 노매드',
        youtubeId: 'sZ1FfCabMaI',
        uploadDate: '2025. 5. 1.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-12',
        title: '[놀이터 NORITER] No Pain No Game EP.03 : 일본 간식비 벌기 | NOMAD 노매드',
        youtubeId: 'cL2uRIIo3JY',
        uploadDate: '2025. 4. 25.',
        type: 'video',
        playlist: '놀이터 NORITER'
    },
    {
        id: 'video-13',
        title: '[NOMAD DRIVE] 휴먼 다큐멘터리 노매드 9일 3부 : 고생했다 노매드! 요시요시시테 | NOMAD 노매드',
        youtubeId: 'sXUTmM2fJf8',
        uploadDate: '2025. 4. 22.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-14',
        title: '[NOMAD DRIVE] 휴먼 다큐멘터리 노매드 9일 2부 : 청춘은 바로 지금 | NOMAD 노매드',
        youtubeId: 'M1LqHij8NSw',
        uploadDate: '2025. 4. 18.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-15',
        title: '[NOMAD DRIVE] 휴먼 다큐멘터리 노매드 9일 1부 : 귀엽기만 하면 안 되나요?😗 | NOMAD 노매드',
        youtubeId: 'E4d9M1X23kY',
        uploadDate: '2025. 4. 15.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-16',
        title: '[노빠꾸 NOBACKGO] EP.09 東京 特集 : 그.뭔.립 투어 | NOMAD 노매드',
        youtubeId: '755841_GUzo',
        uploadDate: '2025. 4. 11.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-17',
        title: "'LEMON - Yonezu Kenshi' by NOMAD",
        youtubeId: 'c5c6N6xCoo4',
        uploadDate: '2025. 4. 5.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-18',
        title: "[NOMAD DRIVE] 'CARNIVAL' SELFIE CAM | NOMAD 노매드",
        youtubeId: 'srUeoXocHws',
        uploadDate: '2025. 3. 21.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-19',
        title: "[NOMAD DRIVE] 'CARNIVAL' LIVE IN CARNIVAL | NOMAD 노매드",
        youtubeId: '-zFYNquWYJ0',
        uploadDate: '2025. 3. 18.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-20',
        title: '[NOMAD DRIVE] 노매드의 분좋카카 NOMAD 1st BASEcamp | NOMAD 노매드',
        youtubeId: 'un3jmHrI6Fk',
        uploadDate: '2025. 3. 14.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-21',
        title: "'CARNIVAL' Recording Behind | NOMAD 노매드",
        youtubeId: 'MobjqVjF6MA',
        uploadDate: '2025. 3. 4.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-22',
        title: "NOMAD 노매드 'CARNIVAL' Official Audio",
        youtubeId: '7hdCjdBJzd8',
        uploadDate: '2025. 2. 28.',
        type: 'video',
        playlist: 'Official'
    },
    {
        id: 'video-23',
        title: 'NOMAD 1st Anniversary YOUTUBE LIVE',
        youtubeId: 'rIhTVVRHQ6Q',
        uploadDate: '2025. 2. 28.',
        type: 'live',
        playlist: 'LIVE'
    },
    {
        id: 'video-24',
        title: '[Who Am I] 2025 DOY 도의 | NOMAD 노매드',
        youtubeId: 'vlxd3J2X6gE',
        uploadDate: '2025. 2. 23.',
        type: 'video',
        playlist: 'Who Am I'
    },
    {
        id: 'video-25',
        title: 'Notes : Our First CARNIVAL | NOMAD',
        youtubeId: 'kuXCI6g7xkk',
        uploadDate: '2025. 2. 21.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-26',
        title: 'NOMAD 1ST FAN CONCERT [CARNIVAL] SPOILER LIVE',
        youtubeId: 'sQGyw2MX1S0',
        uploadDate: '2025. 2. 2.',
        type: 'live',
        playlist: 'LIVE'
    },
    {
        id: 'video-27',
        title: '[노빠꾸 NOBACKGO] EP.08 HAPPY NEW YEAR 2025 : 설날매드 | NOMAD 노매드',
        youtubeId: 'eNA30eoYOxg',
        uploadDate: '2025. 1. 28.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-28',
        title: "2025 New Year's Greetings✨ | NOMAD 노매드",
        youtubeId: 'x0Dx8EdV4eE',
        uploadDate: '2025. 1. 28.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-29',
        title: "NOMAD 1st Fan Concert 'CARNIVAL' Official Trailer",
        youtubeId: '2fu4-sBijlY',
        uploadDate: '2025. 1. 17.',
        type: 'video',
        playlist: 'Teaser'
    },
    {
        id: 'video-30',
        title: 'Notes : Random School Attack | NOMAD',
        youtubeId: 'Qd4iMHPMNGg',
        uploadDate: '2025. 1. 10.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-31',
        title: '[노빠꾸 NOBACKGO] EP.07 GOODBYE 2024 : 노매드 송년회 | NOMAD 노매드',
        youtubeId: '799o_J7I_Ko',
        uploadDate: '2025. 1. 5.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-32',
        title: '[노가리 NO! GOT IT!] EP.09 크리스마스 만찬회 with BASE | NOMAD 노매드',
        youtubeId: 'bqOSF6DAWO0',
        uploadDate: '2024. 12. 24.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-33',
        title: "'MISTLETOE - Justin Bieber' by NOMAD",
        youtubeId: 'By7IKGRTX70',
        uploadDate: '2024. 12. 13.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-34',
        title: 'Notes : 2024 K-EXPO in JAKARTA | NOMAD',
        youtubeId: 'BLDpVfWSmVQ',
        uploadDate: '2024. 11. 28.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-35',
        title: '[노빠꾸 NOBACKGO] EP.06 직장매드 PART 2 : 아이디어 빼먹는 부장님 | NOMAD 노매드',
        youtubeId: 'QHgnyBdRPv0',
        uploadDate: '2024. 11. 22.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-36',
        title: '[노빠꾸 NOBACKGO] EP.05 직장매드 PART 1 : 마케팅팀의 하루 | NOMAD 노매드',
        youtubeId: 'NwGF9URtMJk',
        uploadDate: '2024. 11. 15.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-37',
        title: 'Notes : Random Busking in SEOUL (HONGDAE) | NOMAD',
        youtubeId: 'jRwD37rAVhs',
        uploadDate: '2024. 11. 14.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-38',
        title: 'Notes : 2024 K-Brand EXPO in RIYADH | NOMAD',
        youtubeId: '8laqOV507xU',
        uploadDate: '2024. 11. 9.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-39',
        title: 'Notes : 2024 KBEE in TOKYO | NOMAD',
        youtubeId: 'I-195EUvylE',
        uploadDate: '2024. 10. 29.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-40',
        title: '[노가리 NO! GOT IT!] Spin-off with Cha cha Malone | NOMAD 노매드',
        youtubeId: 'D_vufXrEp1k',
        uploadDate: '2024. 10. 26.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-41',
        title: "NOMAD (노매드) 'Call Me Back' Dance Practice",
        youtubeId: '4pkoIZpvZzA',
        uploadDate: '2024. 10. 22.',
        type: 'video',
        playlist: 'Dance Practice'
    },
    {
        id: 'video-42',
        title: "'Call Me Back' Listening Party (with BASE) | NOMAD 노매드",
        youtubeId: 'GW_-oLCW4is',
        uploadDate: '2024. 10. 20.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-43',
        title: "'Call Me Back' Recording Behind | NOMAD 노매드",
        youtubeId: 'ldacFE9TCZY',
        uploadDate: '2024. 10. 14.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-44',
        title: "'Call Me Back' Official MV Behind | NOMAD 노매드",
        youtubeId: 'wuwAWx37-Sk',
        uploadDate: '2024. 10. 12.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-45',
        title: "'Call Me Back' Official MV Commentary",
        youtubeId: 'TW1JERs1mI8',
        uploadDate: '2024. 10. 10.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-46',
        title: 'Compare',
        youtubeId: 'WdmIE5mZo1k',
        uploadDate: '2024. 10. 9.',
        type: 'video',
        playlist: 'Track'
    },
    {
        id: 'video-47',
        title: "NOMAD (노매드) 'Call Me Back' Official MV",
        youtubeId: 'sD44sjGm1GM',
        uploadDate: '2024. 10. 9.',
        type: 'video',
        playlist: 'Official'
    },
    {
        id: 'video-48',
        title: "NOMAD (노매드) 'Call Me Back' Official Teaser",
        youtubeId: 'YxBbHgWI-UY',
        uploadDate: '2024. 10. 8.',
        type: 'video',
        playlist: 'Teaser'
    },
    {
        id: 'video-49',
        title: "NOMAD (노매드) 'Call Me Back' Concept Trailer - 도의 (DOY)",
        youtubeId: 'kHHlb7aE8_E',
        uploadDate: '2024. 10. 7.',
        type: 'video',
        playlist: 'Teaser'
    },
    {
        id: 'video-50',
        title: "'Call Me Back' Pre-Listening Reaction | NOMAD 노매드",
        youtubeId: 'ddbN0UhPuzg',
        uploadDate: '2024. 10. 2.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-51',
        title: 'NOMAD COMEBACK SPECIAL LIVE',
        youtubeId: 'gaDplEaqvsk',
        uploadDate: '2024. 9. 30.',
        type: 'live',
        playlist: 'LIVE'
    },
    {
        id: 'video-52',
        title: '[노빠꾸 NOBACKGO] EP.04 노매드의 나가리 PART 2 : 여름방학 | NOMAD 노매드',
        youtubeId: 'B00ssxKZmMM',
        uploadDate: '2024. 9. 20.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-53',
        title: '[NOMAD DRIVE] Happy DOY day with BASE | NOMAD 노매드',
        youtubeId: '18XWAxb4ArI',
        uploadDate: '2024. 9. 19.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-54',
        title: '[노빠꾸 NOBACKGO] EP.03 노매드의 나가리 PART 1 : 낙오매드 | NOMAD 노매드',
        youtubeId: 'b7D3CcwAP7g',
        uploadDate: '2024. 9. 13.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-55',
        title: '[노가리 NO! GOT IT!] EP.08 만약 아이돌이 아니었다면? | NOMAD 노매드',
        youtubeId: 'JJccGRp8dJM',
        uploadDate: '2024. 9. 4.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-56',
        title: '[노가리 NO! GOT IT!] EP.07 DOY 형 리더 자리 저에게 주시죠? | NOMAD 노매드',
        youtubeId: '1Z-xC3rNaT4',
        uploadDate: '2024. 8. 26.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-57',
        title: '[노빠꾸 NOBACKGO] EP.02 여름 보양식 만들기 PART 2 : 요리도 노빠꾸다! | NOMAD 노매드',
        youtubeId: 'oV_Ws47ijAQ',
        uploadDate: '2024. 8. 23.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-58',
        title: '[노빠꾸 NOBACKGO] EP.01 여름 보양식 만들기 PART 1 : 빠꾸 없이 장보기! | NOMAD 노매드',
        youtubeId: 'FhCSJO6zj_M',
        uploadDate: '2024. 8. 14.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-59',
        title: 'No... Stop it..... | 노가리 NO! GOT IT! EP.06',
        youtubeId: 'cN1hPUQ3IKE',
        uploadDate: '2024. 8. 12.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-60',
        title: '[노빠꾸 NOBACKGO] TEASER 노매드는! 빠꾸없다! | NOMAD 노매드',
        youtubeId: 'ldvEbMCCtsI',
        uploadDate: '2024. 8. 9.',
        type: 'video',
        playlist: '노빠꾸 NOBACKGO'
    },
    {
        id: 'video-61',
        title: '먹는 거에 진심인 사람들🤤 | 노가리 NO! GOT IT! EP.05',
        youtubeId: 'bzyOnfgFPLQ',
        uploadDate: '2024. 8. 1.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-62',
        title: '고백을 많이 받아 봤다 손🖐️ | 노가리 NO! GOT IT! EP.04',
        youtubeId: 'U1Y_x6LOUUI',
        uploadDate: '2024. 7. 24.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-63',
        title: 'Notes : 2024 K-Brand EXPO in MEXICO [2/2] | NOMAD',
        youtubeId: 'eA-4mfEWRDE',
        uploadDate: '2024. 7. 12.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-64',
        title: 'Notes : 2024 K-Brand EXPO in MEXICO [1/2] | NOMAD',
        youtubeId: 'qjPjH4NL0ms',
        uploadDate: '2024. 7. 9.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-65',
        title: '어지럽다 어지러워😵‍💫 | 노가리 NO! GOT IT! EP.03',
        youtubeId: 'B7H3ydYvCNQ',
        uploadDate: '2024. 7. 4.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-66',
        title: "[놀이터 NORITER] No Pain No Game EP.02 : Shoppin' in OSAKA | NOMAD 노매드",
        youtubeId: 'ytGM-w5qYFc',
        uploadDate: '2024. 6. 27.',
        type: 'video',
        playlist: '놀이터 NORITER'
    },
    {
        id: 'video-67',
        title: '[놀이터 NORITER] No Pain No Game EP.01 : 오사카의 닌자들 | NOMAD 노매드',
        youtubeId: 'j5yibWu2LdI',
        uploadDate: '2024. 6. 25.',
        type: 'video',
        playlist: '놀이터 NORITER'
    },
    {
        id: 'video-68',
        title: '[NOMAD DRIVE] Vacation in OSAKA EP.02 | NOMAD 노매드',
        youtubeId: 'i-MipZGAKBA',
        uploadDate: '2024. 6. 20.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-69',
        title: '[NOMAD DRIVE] Vacation in OSAKA EP.01 | NOMAD 노매드',
        youtubeId: 'xb7clxxd8HQ',
        uploadDate: '2024. 6. 18.',
        type: 'video',
        playlist: 'NOMAD DRIVE'
    },
    {
        id: 'video-70',
        title: '그게 대체 뭐길래⁉️ | 노가리 NO! GOT IT! EP.02',
        youtubeId: 'J2t5qyHizJo',
        uploadDate: '2024. 6. 13.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-71',
        title: 'In between JAPAN SHOWCASE',
        youtubeId: 'LbTY0NNgtJQ',
        uploadDate: '2024. 6. 4.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-72',
        title: "'ベテルギウス (Betelgeuse) - Yuuri' by DOY&RIVR&JUNHO",
        youtubeId: 'IQZMBRFN-hU',
        uploadDate: '2024. 5. 31.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-73',
        title: 'Notes : SHOWCASE in Japan 2024 | NOMAD',
        youtubeId: 'qEmC09x8IrI',
        uploadDate: '2024. 5. 23.',
        type: 'video',
        playlist: 'Notes'
    },
    {
        id: 'video-74',
        title: 'Spoiler Man DOY',
        youtubeId: 'espwiVqc6ug',
        uploadDate: '2024. 5. 17.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-75',
        title: '아니 그게 아니라요 오해입니다 | 노가리 NO! GOT IT! EP.01',
        youtubeId: 'guQdaYCxO94',
        uploadDate: '2024. 5. 10.',
        type: 'video',
        playlist: '노가리 NO! GOT IT!'
    },
    {
        id: 'video-76',
        title: "[TEASER] NOMAD's 'PODCAST' 🎁 EVENT",
        youtubeId: 'k9Uv4SladXM',
        uploadDate: '2024. 5. 8.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-77',
        title: 'Chilling in VEGAS',
        youtubeId: 'ipj48n_1xVM',
        uploadDate: '2024. 4. 30.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-78',
        title: "겨울이지만 뜨거웠던 여긴 CALIFORNIA🌴 | NOMAD 노매드 'California love' 음악방송 대기실 비하인드 _03",
        youtubeId: 'U7aT6CAM0Fo',
        uploadDate: '2024. 4. 26.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-79',
        title: "어떤 압박도 날 빛나게 만들지🔥 | NOMAD 노매드 'No pressure' 음악방송 대기실 비하인드 _02",
        youtubeId: 'XdUtc0awHVw',
        uploadDate: '2024. 4. 19.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-80',
        title: 'California Love YEAH',
        youtubeId: 'pnHC_6CtNzQ',
        uploadDate: '2024. 4. 16.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-81',
        title: "No Pressure No Diamonds💎 | NOMAD 노매드 'No pressure' 음악방송 대기실 비하인드 _01",
        youtubeId: 'j2-JY6qWqqs',
        uploadDate: '2024. 4. 9.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-82',
        title: "'California love' Recording Behind | NOMAD 노매드",
        youtubeId: 'o288ROHnkTU',
        uploadDate: '2024. 3. 28.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-83',
        title: "'California love' Official MV Behind | NOMAD 노매드",
        youtubeId: 'UQVZh2bZKQc',
        uploadDate: '2024. 3. 22.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-84',
        title: "NOMAD (노매드) 'California love' Dance Practice",
        youtubeId: 'vjAVp5X68u8',
        uploadDate: '2024. 3. 21.',
        type: 'video',
        playlist: 'Dance Practice'
    },
    {
        id: 'video-85',
        title: "'California love' Official MV Commentary",
        youtubeId: '4JdhOwVfBno',
        uploadDate: '2024. 3. 20.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-86',
        title: "NOMAD (노매드) 'California love' Choreography Video (Conti ver.)",
        youtubeId: 'ktYxK7nvBCw',
        uploadDate: '2024. 3. 18.',
        type: 'video',
        playlist: 'Choreography'
    },
    {
        id: 'video-87',
        title: "NOMAD (노매드) 'NOMAD' Jacket Behind the Scene (California love ver.)",
        youtubeId: 'PkPRmEypRpQ',
        uploadDate: '2024. 3. 15.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-88',
        title: "NOMAD (노매드) 'California love' Official MV",
        youtubeId: 'bJ0xBjneKRQ',
        uploadDate: '2024. 3. 13.',
        type: 'video',
        playlist: 'Official'
    },
    {
        id: 'video-89',
        title: "NOMAD (노매드) 'No pressure' Dance Practice",
        youtubeId: 'BAwko-ztRjk',
        uploadDate: '2024. 3. 12.',
        type: 'video',
        playlist: 'Dance Practice'
    },
    {
        id: 'video-90',
        title: "'No pressure' Official MV Behind | NOMAD 노매드",
        youtubeId: '1KAAe5Uceh4',
        uploadDate: '2024. 3. 8.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-91',
        title: "'No pressure' Recording Behind | NOMAD 노매드",
        youtubeId: 'Z3WZJzPg_D8',
        uploadDate: '2024. 3. 6.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-92',
        title: "NOMAD (노매드) 'No pressure' Choreography Video (Conti ver.)",
        youtubeId: 'sHHOyFq22OY',
        uploadDate: '2024. 3. 4.',
        type: 'video',
        playlist: 'Choreography'
    },
    {
        id: 'video-93',
        title: 'NOMAD (노매드) DEBUT SHOWCASE "NOMAD IS HERE"',
        youtubeId: 'UTjy-WRoQpU',
        uploadDate: '2024. 3. 4.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-94',
        title: "NOMAD (노매드) 'NOMAD' Jacket Behind the Scene (No pressure ver.)",
        youtubeId: 'jCHTOSJ26cY',
        uploadDate: '2024. 3. 1.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-95',
        title: "NOMAD (노매드) 'No pressure' Official MV",
        youtubeId: 'MOChNMoc6Rk',
        uploadDate: '2024. 2. 28.',
        type: 'video',
        playlist: 'Official'
    },
    {
        id: 'video-96',
        title: "NOMAD (노매드) 'California love' Official Teaser",
        youtubeId: 'DssZjCtz0NM',
        uploadDate: '2024. 2. 27.',
        type: 'video',
        playlist: 'Teaser'
    },
    {
        id: 'video-97',
        title: "NOMAD (노매드) 'No pressure' Official Teaser",
        youtubeId: 'ZVL_ysSC_fc',
        uploadDate: '2024. 2. 25.',
        type: 'video',
        playlist: 'Teaser'
    },
    {
        id: 'video-98',
        title: "NOMAD (노매드) 'Let me love you' Track Video",
        youtubeId: 'JXyLeUIpmeg',
        uploadDate: '2024. 2. 23.',
        type: 'video',
        playlist: 'Track'
    },
    {
        id: 'video-99',
        title: "NOMAD (노매드) 1st EP 'NOMAD' Highlight Medley",
        youtubeId: '5VzHcHEZVHU',
        uploadDate: '2024. 2. 22.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-100',
        title: "1st EP 'NOMAD' SPOILER | DOY, SANGHA",
        youtubeId: 'hwFp4zIk0N4',
        uploadDate: '2024. 2. 16.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-101',
        title: "NOMAD (노매드) 'Oasis' Track Video",
        youtubeId: 'FcF3m-sqVMI',
        uploadDate: '2024. 2. 9.',
        type: 'video',
        playlist: 'Track'
    },
    {
        id: 'video-102',
        title: 'Producing BTS with Cha Cha Malone',
        youtubeId: 'oT-o4VYtw8g',
        uploadDate: '2024. 2. 1.',
        type: 'video',
        playlist: 'Special'
    },
    {
        id: 'video-103',
        title: "NOMAD (노매드) 'Automatic' (prod. By Cha Cha Malone) Lyric Video",
        youtubeId: 'f40cQ2Ax3h4',
        uploadDate: '2024. 1. 24.',
        type: 'video',
        playlist: 'Track'
    },
    {
        id: 'video-104',
        title: "'Mask Off - Future x HUMBLE - Kendrick Lamar' (Mix) by NOMAD DOY",
        youtubeId: 'cmkWgSbtOsU',
        uploadDate: '2024. 1. 22.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-105',
        title: '[Who Am I] DOY 도의 | NOMAD 노매드',
        youtubeId: 'xQ7jFCUBIRA',
        uploadDate: '2024. 1. 15.',
        type: 'video',
        playlist: 'Who Am I'
    },
    {
        id: 'video-106',
        title: "NOMAD (노매드) 'Eye 2 eye' (prod. By Cha Cha Malone) Lyric Video",
        youtubeId: 'ZVvTZTgT5UI',
        uploadDate: '2024. 1. 12.',
        type: 'video',
        playlist: 'Track'
    },
    {
        id: 'video-107',
        title: "'Lights on' Performance Video Behind | NOMAD 노매드",
        youtubeId: 'LG1v9tsjphE',
        uploadDate: '2024. 1. 8.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-108',
        title: "'Lights on' Recording Behind | NOMAD 노매드",
        youtubeId: 'QgSZzC_-oAk',
        uploadDate: '2024. 1. 2.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-109',
        title: "'Crew Love - Drake' by NOMAD DOY&JUNHO",
        youtubeId: 'aJnhd8r_qBg',
        uploadDate: '2023. 12. 31.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-110',
        title: "'Lights on' Dance Practice Behind | NOMAD 노매드",
        youtubeId: 'aFb62GuTnnI',
        uploadDate: '2023. 12. 29.',
        type: 'video',
        playlist: 'Behind'
    },
    {
        id: 'video-111',
        title: "NOMAD (노매드) 'Lights on' Performance Video",
        youtubeId: 'SPh6FzSjOVk',
        uploadDate: '2023. 12. 27.',
        type: 'video',
        playlist: 'Official'
    },
    {
        id: 'video-112',
        title: "'Pink matter - Frank Ocean' by NOMAD DOY&RIVR",
        youtubeId: 'JBJ532BFYUo',
        uploadDate: '2023. 12. 24.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-113',
        title: "Profile Mood Video 'DOY' | NOMAD 노매드",
        youtubeId: 'qqw-lAOiRrE',
        uploadDate: '2023. 12. 18.',
        type: 'video',
        playlist: 'Profile'
    },
    {
        id: 'video-114',
        title: "'Don't - Bryson Tiller' by NOMAD DOY",
        youtubeId: 'g1Xl96-CITc',
        uploadDate: '2023. 12. 12.',
        type: 'video',
        playlist: 'Cover'
    },
    {
        id: 'video-115',
        title: "'Blackjack - Amine' by NOMAD",
        youtubeId: 'PhTD449qHbU',
        uploadDate: '2023. 12. 8.',
        type: 'video',
        playlist: 'Cover'
    }
];

// 일반 동영상만 (라이브 제외)
export const videos = allVideos.filter(v => v.type === 'video');

// 라이브만
export const lives = allVideos.filter(v => v.type === 'live');

// 재생목록 카테고리 목록
export const playlists = [
    { id: 'official', name: 'Official', icon: '🎵' },
    { id: 'nomad-drive', name: 'NOMAD DRIVE', icon: '🚗' },
    { id: 'nobackgo', name: '노빠꾸 NOBACKGO', icon: '🎮' },
    { id: 'nogotit', name: '노가리 NO! GOT IT!', icon: '🎤' },
    { id: 'noriter', name: '놀이터 NORITER', icon: '🎪' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'cover', name: 'Cover', icon: '🎸' },
    { id: 'behind', name: 'Behind', icon: '🎬' },
    { id: 'dance-practice', name: 'Dance Practice', icon: '💃' },
    { id: 'who-am-i', name: 'Who Am I', icon: '👤' },
    { id: 'dossont', name: '도쏜트', icon: '🍽️' },
    { id: 'special', name: 'Special', icon: '✨' },
    { id: 'teaser', name: 'Teaser', icon: '🎬' },
    { id: 'track', name: 'Track', icon: '🎧' },
    { id: 'choreography', name: 'Choreography', icon: '🕺' },
    { id: 'profile', name: 'Profile', icon: '📸' }
];

// 재생목록별 영상 가져오기
export function getVideosByPlaylist(playlistName) {
    return allVideos.filter(v => v.playlist === playlistName);
}

// Shorts 데이터 (동적으로 로드됨)
export let shorts = [];

// 날짜 형식 변환 (YYMMDD -> 상대 시간)
function getRelativeTime(dateStr) {
    const year = parseInt('20' + dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1;
    const day = parseInt(dateStr.substring(4, 6));
    
    const postDate = new Date(year, month, day);
    const today = new Date();
    const diffTime = Math.abs(today - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
}

// 비디오 확장자 체크
function isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// 메타데이터 로드
let reelsMetadata = {};

async function loadReelsMetadata() {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/metadata/reels-metadata.json`
        );
        
        if (response.ok) {
            reelsMetadata = await response.json();
            console.log('✅ 메타데이터 로드 완료:', Object.keys(reelsMetadata).length, '개');
        }
    } catch (error) {
        console.log('메타데이터 파일 없음 (파일명이 제목으로 사용됩니다)');
    }
}

// 파일명에서 메타데이터 키 추출 (231228-1.mp4 -> 231228-1)
function getMetadataKey(filename) {
    return filename.replace(/\.(mp4|mov|avi|webm|mkv)$/i, '');
}

// GitHub에서 reels 폴더의 영상 목록 가져오기
export async function loadShortsFromGitHub() {
    try {
        // 먼저 메타데이터 로드
        await loadReelsMetadata();
        
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${REELS_FOLDER}`
        );
        
        if (!response.ok) {
            console.error('GitHub API 요청 실패:', response.status);
            return [];
        }
        
        const files = await response.json();
        
        // 영상 파일만 필터링하고 정렬
        const videoFiles = files
            .filter(file => isVideoFile(file.name))
            .sort((a, b) => {
                const dateA = a.name.match(/^(\d{6})/);
                const dateB = b.name.match(/^(\d{6})/);
                if (dateA && dateB) {
                    return dateB[1].localeCompare(dateA[1]); // 최신순 정렬
                }
                return b.name.localeCompare(a.name);
            });
        
        // shorts 배열로 변환
        shorts = videoFiles.map((file, index) => {
            const dateMatch = file.name.match(/^(\d{6})/);
            const dateStr = dateMatch ? dateMatch[1] : '';
            const metaKey = getMetadataKey(file.name);
            const metadata = reelsMetadata[metaKey] || {};
            
            return {
                id: `short-${index + 1}`,
                // 메타데이터에 제목이 있으면 사용, 없으면 파일명 사용
                title: metadata.title || metaKey,
                videoUrl: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${REELS_FOLDER}/${file.name}`,
                uploadDate: dateStr ? getRelativeTime(dateStr) : '',
                type: 'shorts'
            };
        });
        
        console.log(`✅ ${shorts.length}개의 Shorts 로드 완료`);
        return shorts;
    } catch (error) {
        console.error('GitHub에서 reels 로드 실패:', error);
        return [];
    }
}

// 채널 정보
export const channelInfo = {
    name: 'NOMAD',
    handle: '@NOMAD_is_here',
    subscribers: '9.16만',
    videoCount: allVideos.length.toString(),
    description: 'NOMAD OFFICIAL YouTube Channel',
    banner: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(4).jpg'
};

// 탭별 데이터 가져오기
export function getContentByTab(tab) {
    switch(tab) {
        case 'home':
            return allVideos;
        case 'videos':
            return videos;
        case 'shorts':
            return shorts;
        case 'live':
            return lives;
        case 'playlists':
            return playlists;
        default:
            return allVideos;
    }
}