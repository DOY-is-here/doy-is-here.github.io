const fs = require('fs');
const path = require('path');

// 설정
const IMAGE_DIR = 'insta-photo';
const OUTPUT_FILE = 'insta/js/posts.js';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo';

// 이미지 파일 읽기
function getImageFiles() {
    if (!fs.existsSync(IMAGE_DIR)) {
        console.log(`${IMAGE_DIR} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(IMAGE_DIR);
    return files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
}

// 파일명에서 날짜와 순서 추출
function parseFileName(fileName) {
    // 250203.jpg -> { date: "250203", sequence: null }
    // 250203 (1).jpg -> { date: "250203", sequence: 1 }
    const match = fileName.match(/^(\d{6})(?:\s*\((\d+)\))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        sequence: match[2] ? parseInt(match[2]) : null,
        fileName: fileName
    };
}

// 날짜를 표시 형식으로 변환
function formatDisplayDate(dateStr) {
    // 250203 -> "2025년 2월 3일"
    const year = "20" + dateStr.substring(0, 2);
    const month = parseInt(dateStr.substring(2, 4));
    const day = parseInt(dateStr.substring(4, 6));
    return `${year}년 ${month}월 ${day}일`;
}

// 날짜를 ISO 형식으로 변환
function formatISODate(dateStr) {
    // 250203 -> "2025-02-03"
    const year = "20" + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    return `${year}-${month}-${day}`;
}

// 이미지 파일들을 게시물로 그룹화
function groupImagesByPost(imageFiles) {
    const parsed = imageFiles
        .map(parseFileName)
        .filter(p => p !== null);
    
    // 날짜별로 그룹화
    const grouped = {};
    
    parsed.forEach(item => {
        const date = item.date;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });
    
    // 각 그룹을 게시물로 변환
    const posts = [];
    
    Object.keys(grouped).forEach(date => {
        const images = grouped[date];
        
        // 순서대로 정렬 (sequence가 없는 것이 먼저, 있으면 숫자 순)
        images.sort((a, b) => {
            if (a.sequence === null) return -1;
            if (b.sequence === null) return 1;
            return a.sequence - b.sequence;
        });
        
        // 이미지 URL 배열 생성
        const imageUrls = images.map(img => `${GITHUB_RAW_BASE}/${encodeURIComponent(img.fileName)}`);
        
        // ID 생성 (날짜만 사용)
        const postId = date;
        
        posts.push({
            id: postId,
            date: formatISODate(date),
            displayDate: formatDisplayDate(date),
            username: "doy.is.here",
            images: imageUrls,
            caption: `${formatDisplayDate(date)} 게시물`,
            type: "photo"
        });
    });
    
    // 날짜 내림차순 정렬 (최신순)
    posts.sort((a, b) => b.id.localeCompare(a.id));
    
    return posts;
}

// posts.js 파일 생성
function generatePostsJS(posts) {
    const content = `// 게시물 데이터 (자동 생성됨)
export const posts = ${JSON.stringify(posts, null, 4)};

// 게시물 개수 계산
export function getPostCount() {
    return posts.length;
}

// 타입별 게시물 필터링
export function getPostsByType(type) {
    if (type === "all") return posts;
    return posts.filter(post => post.type === type);
}

// 릴스만 가져오기
export function getReels() {
    return posts.filter(post => post.type === "reel");
}

// 일반 게시물만 가져오기
export function getPhotos() {
    return posts.filter(post => post.type === "photo");
}

// ID로 게시물 찾기
export function getPostById(id) {
    return posts.find(post => post.id === id);
}

// 다음 게시물 가져오기
export function getNextPost(currentId) {
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex === -1 || currentIndex === posts.length - 1) return null;
    return posts[currentIndex + 1];
}

// 이전 게시물 가져오기
export function getPrevPost(currentId) {
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex <= 0) return null;
    return posts[currentIndex - 1];
}
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log(`✅ ${OUTPUT_FILE} 파일이 생성되었습니다.`);
    console.log(`📊 총 ${posts.length}개의 게시물이 생성되었습니다.`);
}

// 메인 실행
function main() {
    console.log('🔍 이미지 파일 스캔 중...');
    const imageFiles = getImageFiles();
    
    if (imageFiles.length === 0) {
        console.log('⚠️  이미지 파일을 찾을 수 없습니다.');
        return;
    }
    
    console.log(`📸 ${imageFiles.length}개의 이미지 파일을 발견했습니다.`);
    
    console.log('📝 게시물 데이터 생성 중...');
    const posts = groupImagesByPost(imageFiles);
    
    console.log('💾 posts.js 파일 생성 중...');
    generatePostsJS(posts);
    
    console.log('✨ 완료!');
}

main();
