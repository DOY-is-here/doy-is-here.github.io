const fs = require('fs');
const path = require('path');

// 설정
const GITHUB_USER = 'DOY-is-here';
const GITHUB_REPO = 'doy-is-here.github.io';
const REELS_FOLDER = 'reels';
const OUTPUT_FILE = 'js/youtube-data.js';
const METADATA_FILE = 'metadata/videos-metadata.json';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

// 메타데이터 로드
function loadMetadata() {
    const metadataPath = path.join(__dirname, '..', METADATA_FILE);
    
    if (fs.existsSync(metadataPath)) {
        try {
            const content = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️  메타데이터 로드 실패:`, error.message);
            return {};
        }
    }
    
    console.log('📝 메타데이터 파일이 없습니다. generate-youtube-metadata.js를 먼저 실행하세요.');
    return {};
}

// 비디오 파일 목록 가져오기
function getVideoFiles(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ ${folderPath} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(folderPath);
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    
    return files.filter(file => 
        videoExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
}

// 파일명에서 날짜, postNum 추출
function parseFileName(fileName) {
    const match = fileName.match(/^(\d{6})(?:-(\d+))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        postNum: match[2] ? parseInt(match[2]) : null,
        fileName: fileName
    };
}

// 날짜를 상대 시간으로 변환
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

// 메타데이터 적용
function applyMetadata(short, metadata) {
    const rawDate = short.rawDate;
    const postNum = short.postNum;
    
    let meta = null;
    
    // postNum이 있는 경우
    if (postNum !== null && metadata[rawDate] && metadata[rawDate][postNum]) {
        meta = metadata[rawDate][postNum];
    }
    // postNum이 없고 메타데이터가 객체이지만 title이 없는 경우 (다중 postNum 구조)
    else if (metadata[rawDate] && typeof metadata[rawDate] === 'object' && !metadata[rawDate].title) {
        return short;
    }
    // postNum이 없고 메타데이터가 단일 구조인 경우
    else if (metadata[rawDate]) {
        meta = metadata[rawDate];
    }
    
    // 메타데이터 적용
    if (meta) {
        if (meta.title !== undefined) short.title = meta.title;
        if (meta.duration !== undefined) short.duration = meta.duration;
        if (meta.description !== undefined) short.description = meta.description;
    }
    
    return short;
}

// Shorts 데이터 생성
function generateShortsData(videoFiles, folderPath, metadata) {
    const parsed = videoFiles
        .map(parseFileName)
        .filter(p => p !== null);
    
    // 날짜 + postNum으로 정렬 (최신순)
    parsed.sort((a, b) => {
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        const aNum = a.postNum || 0;
        const bNum = b.postNum || 0;
        return bNum - aNum;
    });
    
    // Shorts 배열 생성
    const shorts = parsed.map((item, index) => {
        const postKey = item.postNum !== null 
            ? `${item.date}-${item.postNum}`
            : item.date;
        
        let short = {
            id: `short-${index + 1}`,
            title: item.fileName.replace(/\.(mp4|mov|avi|webm|mkv)$/i, ''),
            thumbnail: `${GITHUB_RAW_BASE}/${folderPath}/${encodeURIComponent(item.fileName)}`,
            duration: '0:00',
            uploadDate: getRelativeTime(item.date),
            type: 'shorts',
            rawDate: item.date,
            postNum: item.postNum,
            description: ''
        };
        
        // 메타데이터 적용
        short = applyMetadata(short, metadata);
        
        return short;
    });
    
    return shorts;
}

// youtube-data.js 파일 생성
function generateYoutubeDataJS(shorts) {
    const content = `// YouTube 데이터 관리 (자동 생성됨)

// 동영상 데이터
export const videos = [
    {
        id: 'video-1',
        title: 'NOMAD "LIGHTS ON" Performance Video',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(1).jpg',
        duration: '3:42',
        uploadDate: '1일 전',
        type: 'video'
    },
    {
        id: 'video-2',
        title: 'Behind The Scenes - NOMAD',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250923%20(1).jpg',
        duration: '5:21',
        uploadDate: '3일 전',
        type: 'video'
    },
    {
        id: 'video-3',
        title: 'NOMAD Dance Practice',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250914%20(1).jpg',
        duration: '4:15',
        uploadDate: '1주 전',
        type: 'video'
    },
    {
        id: 'video-4',
        title: 'NOMAD Concept Photo Shooting',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250823%20(1).jpg',
        duration: '2:58',
        uploadDate: '2주 전',
        type: 'video'
    },
    {
        id: 'video-5',
        title: 'NOMAD Interview',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250814%20(1).jpg',
        duration: '8:12',
        uploadDate: '3주 전',
        type: 'video'
    }
];

// Shorts 데이터 (자동 생성됨)
export const shorts = ${JSON.stringify(shorts, null, 4)};

// 채널 정보
export const channelInfo = {
    name: 'NOMAD',
    handle: '@NOMAD_is_here',
    subscribers: '9.16만',
    videoCount: '${shorts.length}',
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
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ youtube-data.js 생성 완료!');
    console.log(`📊 Shorts: ${shorts.length}개`);
}

// 메인 실행
function main() {
    console.log('🎬 YouTube Shorts 데이터 생성 중...\n');
    
    // 1. 메타데이터 로드
    console.log('📖 메타데이터 로드 중...');
    const metadata = loadMetadata();
    console.log(`   ${Object.keys(metadata).length}개 항목 로드됨`);
    
    // 2. 비디오 파일 스캔
    const folderPath = path.join(__dirname, '..', REELS_FOLDER);
    console.log(`\n🔍 ${REELS_FOLDER} 폴더 스캔 중...`);
    const videoFiles = getVideoFiles(folderPath);
    console.log(`   ${videoFiles.length}개 영상 파일 발견`);
    
    if (videoFiles.length === 0) {
        console.log('\n❌ 영상 파일이 없습니다!');
        return;
    }
    
    // 3. Shorts 데이터 생성
    console.log('\n📝 Shorts 데이터 생성 중...');
    const shorts = generateShortsData(videoFiles, REELS_FOLDER, metadata);
    
    // 4. youtube-data.js 파일 생성
    console.log('\n💾 youtube-data.js 파일 저장 중...');
    generateYoutubeDataJS(shorts);
    
    console.log('\n✨ 완료!');
    console.log(`📂 ${OUTPUT_FILE} 파일이 생성되었습니다.`);
}

main();