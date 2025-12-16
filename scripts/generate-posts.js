const fs = require('fs');
const path = require('path');

// 설정
const FOLDERS = {
    photo: 'insta-photo',    // 그리드용
    group: 'insta-group',    // 태그용
    story: 'insta-story'     // 스토리용
};

const OUTPUT_FILE = 'insta/js/posts.js';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main';

// 메타데이터 로드 함수
function loadMetadata(type) {
    try {
        const metadataPath = path.join(__dirname, '..', 'metadata', `${type}-metadata.json`);
        if (fs.existsSync(metadataPath)) {
            return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        }
    } catch (error) {
        console.warn(`⚠️  Warning: Could not load ${type}-metadata.json:`, error.message);
    }
    return {};
}

// 메타데이터 적용 함수
function applyMetadata(post, metadata) {
    const rawDate = post.rawDate;
    const postNum = post.postNum;
    
    let meta = null;
    
    // postNum이 있는 경우 (예: 240111-2)
    if (postNum !== null && metadata[rawDate] && metadata[rawDate][postNum]) {
        meta = metadata[rawDate][postNum];
    }
    // postNum이 없고 메타데이터가 객체이지만 caption이 없는 경우 (다중 postNum 구조)
    else if (metadata[rawDate] && typeof metadata[rawDate] === 'object' && !metadata[rawDate].caption) {
        return post;
    }
    // postNum이 없고 메타데이터가 단일 구조인 경우
    else if (metadata[rawDate]) {
        meta = metadata[rawDate];
    }
    
    // 메타데이터 적용 (undefined가 아니면 적용, 빈 문자열도 적용)
    if (meta) {
        if (meta.caption !== undefined) post.caption = meta.caption;
        if (meta.username !== undefined) post.username = meta.username;
        if (meta.displayDate !== undefined) post.displayDate = meta.displayDate;
    }
    
    return post;
}

// 이미지 파일 읽기
function getImageFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`${dir} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(dir);
    return files.filter(file => /\.(jpg|jpeg|png|gif|mp4|webp)$/i.test(file));
}

// 파일명에서 날짜, 게시물 번호, 이미지 순서 추출
function parseFileName(fileName) {
    // 240202-1.jpg -> { date: "240202", postNum: 1, sequence: null }
    // 240202-1 (1).jpg -> { date: "240202", postNum: 1, sequence: 1 }
    // 240202-2.jpg -> { date: "240202", postNum: 2, sequence: null }
    // 240202.jpg -> { date: "240202", postNum: null, sequence: null }
    const match = fileName.match(/^(\d{6})(?:-(\d+))?(?:\s*\((\d+)\))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        postNum: match[2] ? parseInt(match[2]) : null,
        sequence: match[3] ? parseInt(match[3]) : null,
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
function groupImagesByPost(imageFiles, folderPath, type, metadata) {
    const parsed = imageFiles
        .map(parseFileName)
        .filter(p => p !== null);
    
    // 날짜 + 게시물 번호로 그룹화
    const grouped = {};
    
    parsed.forEach(item => {
        // 게시물 키 생성: "240202-1", "240202-2", "240202" (번호 없으면)
        const postKey = item.postNum !== null 
            ? `${item.date}-${item.postNum}`
            : item.date;
        
        if (!grouped[postKey]) {
            grouped[postKey] = {
                date: item.date,
                postNum: item.postNum,
                images: []
            };
        }
        
        grouped[postKey].images.push(item);
    });
    
    // 각 그룹을 게시물로 변환
    const posts = [];
    
    Object.keys(grouped).forEach(postKey => {
        const group = grouped[postKey];
        const images = group.images;
        
        // 이미지를 순서대로 정렬 (sequence가 없는 것이 먼저, 있으면 숫자 순)
        images.sort((a, b) => {
            if (a.sequence === null && b.sequence === null) return 0;
            if (a.sequence === null) return -1;
            if (b.sequence === null) return 1;
            return a.sequence - b.sequence;
        });
        
        // 이미지 URL 배열 생성
        const imageUrls = images.map(img => `${GITHUB_RAW_BASE}/${folderPath}/${encodeURIComponent(img.fileName)}`);
        
        // 기본 게시물 생성 (caption은 빈 문자열)
        let post = {
            id: `${type}-${postKey}`,  // "photo-240202-1", "group-240202", "story-240202"
            date: formatISODate(group.date),
            displayDate: formatDisplayDate(group.date),
            username: "doy.is.here",
            images: imageUrls,
            caption: "",  // ✅ 기본값은 빈 문자열
            type: type,
            rawDate: group.date,  // 정렬용
            postNum: group.postNum
        };
        
        // 메타데이터 적용 (caption, username, displayDate 덮어쓰기)
        post = applyMetadata(post, metadata);
        
        posts.push(post);
    });
    
    return posts;
}

// 리포스트용 데이터 생성 (photo + group 합치기, 같은 날짜면 group 우선)
function createRepostData(photoPosts, groupPosts) {
    const combined = [...groupPosts, ...photoPosts];
    
    // 정렬: 날짜 내림차순, 같은 날짜면 group이 먼저(type 오름차순), 같은 타입이면 postNum 내림차순
    combined.sort((a, b) => {
        // 날짜 비교 (내림차순)
        if (a.rawDate !== b.rawDate) {
            return b.rawDate.localeCompare(a.rawDate);
        }
        
        // 같은 날짜면 group이 먼저 (group < photo)
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        }
        
        // 같은 타입이면 postNum 내림차순
        const aNum = a.postNum || 0;
        const bNum = b.postNum || 0;
        return bNum - aNum;
    });
    
    // ID를 repost로 변경
    return combined.map((post, index) => ({
        ...post,
        id: `repost-${index}`,
        originalId: post.id
    }));
}

// posts.js 파일 생성
function generatePostsJS(photoPosts, groupPosts, storyPosts, repostPosts) {
    // 각 타입별로 정렬
    const sortPosts = (posts) => {
        return posts.sort((a, b) => {
            if (a.rawDate !== b.rawDate) {
                return b.rawDate.localeCompare(a.rawDate);
            }
            const aNum = a.postNum || 0;
            const bNum = b.postNum || 0;
            return bNum - aNum;
        });
    };
    
    photoPosts = sortPosts(photoPosts);
    groupPosts = sortPosts(groupPosts);
    storyPosts = sortPosts(storyPosts);
    
    const content = `// 게시물 데이터 (자동 생성됨)

// 그리드 탭 (insta-photo)
export const photoPosts = ${JSON.stringify(photoPosts, null, 4)};

// 태그 탭 (insta-group)
export const groupPosts = ${JSON.stringify(groupPosts, null, 4)};

// 스토리 탭 (insta-story)
export const storyPosts = ${JSON.stringify(storyPosts, null, 4)};

// 리포스트 탭 (photo + group 합침, 같은 날짜면 group 우선)
export const repostPosts = ${JSON.stringify(repostPosts, null, 4)};

// 탭별 게시물 가져오기
export function getPostsByTab(tab) {
    switch(tab) {
        case 'grid':
            return photoPosts;
        case 'tagged':
            return groupPosts;
        case 'story':
            return storyPosts;
        case 'repost':
            return repostPosts;
        default:
            return photoPosts;
    }
}

// 게시물 개수
export function getPostCount(tab = 'grid') {
    return getPostsByTab(tab).length;
}

// ID로 게시물 찾기
export function getPostById(id) {
    const allPosts = [...photoPosts, ...groupPosts, ...storyPosts, ...repostPosts];
    return allPosts.find(post => post.id === id);
}

// 다음 게시물
export function getNextPost(currentId, tab = 'grid') {
    const posts = getPostsByTab(tab);
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex === -1 || currentIndex === posts.length - 1) return null;
    return posts[currentIndex + 1];
}

// 이전 게시물
export function getPrevPost(currentId, tab = 'grid') {
    const posts = getPostsByTab(tab);
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex <= 0) return null;
    return posts[currentIndex - 1];
}

// 추가 호환성 함수들
export function getPhotos() {
    return photoPosts;
}

export function getReels() {
    return []; // 릴스가 없으면 빈 배열 반환
}

export function getTaggedPosts() {
    return groupPosts;
}

export function getStories() {
    return storyPosts;
}

// posts 변수 (기존 코드와의 호환성)
export const posts = photoPosts;
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ posts.js 생성 완료!');
    console.log(`📊 그리드: ${photoPosts.length}개`);
    console.log(`📊 태그: ${groupPosts.length}개`);
    console.log(`📊 스토리: ${storyPosts.length}개`);
    console.log(`📊 리포스트: ${repostPosts.length}개`);
}

// 메인 실행
function main() {
    console.log('🔍 이미지 파일 스캔 중...');
    
    // 메타데이터 로드
    console.log('📖 메타데이터 로드 중...');
    const photoMetadata = loadMetadata('photo');
    const groupMetadata = loadMetadata('group');
    const storyMetadata = loadMetadata('story');
    
    console.log(`   photo-metadata: ${Object.keys(photoMetadata).length}개 항목`);
    console.log(`   group-metadata: ${Object.keys(groupMetadata).length}개 항목`);
    console.log(`   story-metadata: ${Object.keys(storyMetadata).length}개 항목`);
    
    // 각 폴더에서 이미지 파일 읽기
    const photoFiles = getImageFiles(FOLDERS.photo);
    const groupFiles = getImageFiles(FOLDERS.group);
    const storyFiles = getImageFiles(FOLDERS.story);
    
    console.log(`📸 그리드: ${photoFiles.length}개 파일`);
    console.log(`📸 태그: ${groupFiles.length}개 파일`);
    console.log(`📸 스토리: ${storyFiles.length}개 파일`);
    
    console.log('📝 게시물 데이터 생성 중...');
    
    // 각 타입별로 게시물 생성 (메타데이터 적용)
    const photoPosts = groupImagesByPost(photoFiles, FOLDERS.photo, 'photo', photoMetadata);
    const groupPosts = groupImagesByPost(groupFiles, FOLDERS.group, 'group', groupMetadata);
    const storyPosts = groupImagesByPost(storyFiles, FOLDERS.story, 'story', storyMetadata);
    
    // 리포스트 데이터 생성
    const repostPosts = createRepostData(photoPosts, groupPosts);
    
    console.log('💾 posts.js 파일 생성 중...');
    generatePostsJS(photoPosts, groupPosts, storyPosts, repostPosts);
    
    console.log('✨ 완료!');
}

main();