const fs = require('fs');
const path = require('path');

// 설정
const REELS_FOLDER = 'reels';
const OUTPUT_FILE = 'js/youtube-data.js';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main';

// 메타데이터 로드 함수
function loadMetadata() {
    try {
        const metadataPath = path.join(__dirname, '..', 'metadata', 'videos-metadata.json');
        if (fs.existsSync(metadataPath)) {
            return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        }
    } catch (error) {
        console.warn(`⚠️  Warning: Could not load videos-metadata.json:`, error.message);
    }
    return {};
}

// 메타데이터 적용 함수
function applyMetadata(video, metadata) {
    const rawDate = video.rawDate;
    const videoNum = video.videoNum;
    
    let meta = null;
    
    // videoNum이 있는 경우 (예: 240504-2)
    if (videoNum !== null && metadata[rawDate] && metadata[rawDate][videoNum]) {
        meta = metadata[rawDate][videoNum];
    }
    // videoNum이 없고 메타데이터가 객체이지만 title이 없는 경우 (다중 videoNum 구조)
    else if (metadata[rawDate] && typeof metadata[rawDate] === 'object' && !metadata[rawDate].title) {
        return video;
    }
    // videoNum이 없고 메타데이터가 단일 구조인 경우
    else if (metadata[rawDate]) {
        meta = metadata[rawDate];
    }
    
    // 메타데이터 적용 (undefined가 아니면 적용, 빈 문자열도 적용)
    if (meta) {
        if (meta.title !== undefined) video.title = meta.title;
        if (meta.duration !== undefined) video.duration = meta.duration;
    }
    
    return video;
}

// 동영상 파일 읽기
function getVideoFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`${dir} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(dir);
    return files.filter(file => /\.(mp4|webm|mov|avi|mkv)$/i.test(file));
}

// 파일명에서 날짜, 동영상 번호 추출
function parseFileName(fileName) {
    // 240504-1.mp4 -> { date: "240504", videoNum: 1 }
    // 240504.mp4 -> { date: "240504", videoNum: null }
    const match = fileName.match(/^(\d{6})(?:-(\d+))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        videoNum: match[2] ? parseInt(match[2]) : null,
        fileName: fileName
    };
}

// 날짜를 표시 형식으로 변환
function formatDisplayDate(dateStr) {
    // 240504 -> "2024년 5월 4일"
    const year = "20" + dateStr.substring(0, 2);
    const month = parseInt(dateStr.substring(2, 4));
    const day = parseInt(dateStr.substring(4, 6));
    return `${year}년 ${month}월 ${day}일`;
}

// 날짜를 ISO 형식으로 변환
function formatISODate(dateStr) {
    // 240504 -> "2024-05-04"
    const year = "20" + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    return `${year}-${month}-${day}`;
}

// 업로드 날짜 계산 (오늘 기준)
function calculateUploadDate(dateStr) {
    const videoDate = new Date(formatISODate(dateStr));
    const today = new Date();
    const diffTime = Math.abs(today - videoDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "방금";
    if (diffDays === 1) return "1일 전";
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
}

// 동영상 파일들을 데이터로 변환
function createVideosData(videoFiles, folderPath, metadata) {
    const parsed = videoFiles
        .map(parseFileName)
        .filter(p => p !== null);
    
    const videos = [];
    
    parsed.forEach(item => {
        // 동영상 키 생성: "240504-1", "240504" (번호 없으면)
        const videoKey = item.videoNum !== null 
            ? `${item.date}-${item.videoNum}`
            : item.date;
        
        // 동영상 URL
        const videoUrl = `${GITHUB_RAW_BASE}/${folderPath}/${encodeURIComponent(item.fileName)}`;
        
        // 썸네일 URL (동영상과 동일)
        const thumbnailUrl = videoUrl;
        
        // 기본 동영상 데이터 생성
        let video = {
            id: `video-${videoKey}`,
            title: "",  // ✅ 기본값은 빈 문자열
            thumbnail: thumbnailUrl,
            duration: "0:00",
            uploadDate: calculateUploadDate(item.date),
            date: formatISODate(item.date),
            displayDate: formatDisplayDate(item.date),
            type: 'video',
            rawDate: item.date,  // 정렬용
            videoNum: item.videoNum
        };
        
        // 메타데이터 적용 (title, duration 덮어쓰기)
        video = applyMetadata(video, metadata);
        
        videos.push(video);
    });
    
    // 정렬: 날짜 내림차순, 같은 날짜면 videoNum 내림차순
    videos.sort((a, b) => {
        if (a.rawDate !== b.rawDate) {
            return b.rawDate.localeCompare(a.rawDate);
        }
        const aNum = a.videoNum || 0;
        const bNum = b.videoNum || 0;
        return bNum - aNum;
    });
    
    return videos;
}

// Shorts 데이터 생성 (동영상과 동일하지만 type만 다름)
function createShortsData(videos) {
    return videos.map((video, index) => ({
        ...video,
        id: `short-${index}`,
        type: 'shorts',
        originalId: video.id
    }));
}

// youtube-data.js 파일 생성
function generateYouTubeDataJS(videos, shorts) {
    const content = `// YouTube 데이터 관리 (자동 생성됨)

// 동영상 데이터
export const videos = ${JSON.stringify(videos, null, 4)};

// Shorts 데이터 (동영상과 동일)
export const shorts = ${JSON.stringify(shorts, null, 4)};

// 채널 정보
export const channelInfo = {
    name: 'NOMAD',
    handle: '@NOMAD_is_here',
    subscribers: '9.16만',
    videoCount: '${videos.length}',
    description: 'NOMAD OFFICIAL YouTube Channel',
    banner: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(4).jpg'
};

// 탭별 데이터 가져오기
export function getContentByTab(tab) {
    switch(tab) {
        case 'home':
            return videos;
        case 'videos':
            return videos;
        case 'shorts':
            return shorts;
        case 'playlists':
            return [];
        case 'channels':
            return [];
        case 'about':
            return [];
        default:
            return videos;
    }
}

// 동영상 개수
export function getVideoCount() {
    return videos.length;
}

// ID로 동영상 찾기
export function getVideoById(id) {
    const allVideos = [...videos, ...shorts];
    return allVideos.find(video => video.id === id);
}

// 다음 동영상
export function getNextVideo(currentId, tab = 'videos') {
    const items = getContentByTab(tab);
    const currentIndex = items.findIndex(item => item.id === currentId);
    if (currentIndex === -1 || currentIndex === items.length - 1) return null;
    return items[currentIndex + 1];
}

// 이전 동영상
export function getPrevVideo(currentId, tab = 'videos') {
    const items = getContentByTab(tab);
    const currentIndex = items.findIndex(item => item.id === currentId);
    if (currentIndex <= 0) return null;
    return items[currentIndex - 1];
}
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ youtube-data.js 생성 완료!');
    console.log(`📊 동영상: ${videos.length}개`);
    console.log(`📊 Shorts: ${shorts.length}개`);
}

// 메인 실행
function main() {
    console.log('🔍 동영상 파일 스캔 중...');
    
    // 메타데이터 로드
    console.log('📖 메타데이터 로드 중...');
    const metadata = loadMetadata();
    console.log(`   videos-metadata: ${Object.keys(metadata).length}개 항목`);
    
    // reels 폴더에서 동영상 파일 읽기
    const videoFiles = getVideoFiles(REELS_FOLDER);
    console.log(`📹 동영상: ${videoFiles.length}개 파일`);
    
    console.log('🔧 동영상 데이터 생성 중...');
    
    // 동영상 데이터 생성 (메타데이터 적용)
    const videos = createVideosData(videoFiles, REELS_FOLDER, metadata);
    
    // Shorts 데이터 생성 (동영상과 동일)
    const shorts = createShortsData(videos);
    
    console.log('💾 youtube-data.js 파일 생성 중...');
    generateYouTubeDataJS(videos, shorts);
    
    console.log('✨ 완료!');
}

main();