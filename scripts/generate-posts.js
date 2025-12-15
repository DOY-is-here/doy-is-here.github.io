const fs = require('fs');
const path = require('path');

// 메타데이터 로드 함수
function loadMetadata(type) {
    try {
        const metadataPath = path.join(__dirname, '..', 'metadata', `${type}-metadata.json`);
        if (fs.existsSync(metadataPath)) {
            return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        }
    } catch (error) {
        console.warn(`Warning: Could not load ${type}-metadata.json:`, error.message);
    }
    return {};
}

// 메타데이터 가져오기
const photoMetadata = loadMetadata('photo');
const groupMetadata = loadMetadata('group');
const storyMetadata = loadMetadata('story');

// 메타데이터 적용 함수
function applyMetadata(post, metadata) {
    const rawDate = post.rawDate;
    const postNum = post.postNum;
    
    let meta = null;
    
    if (postNum !== null && metadata[rawDate] && metadata[rawDate][postNum]) {
        meta = metadata[rawDate][postNum];
    } else if (metadata[rawDate] && typeof metadata[rawDate] === 'object' && !metadata[rawDate].caption) {
        return post;
    } else if (metadata[rawDate]) {
        meta = metadata[rawDate];
    }
    
    if (meta) {
        if (meta.caption) post.caption = meta.caption;
        if (meta.username) post.username = meta.username;
        if (meta.displayDate) post.displayDate = meta.displayDate;
    }
    
    return post;
}

// 날짜 파싱 함수
function parseDate(filename) {
    const match = filename.match(/^(\d{6})(-\d+)?/);
    if (!match) return null;
    
    const rawDate = match[1];
    const year = rawDate.startsWith('23') ? '2023' : 
                 rawDate.startsWith('24') ? '2024' : '2025';
    const month = rawDate.substring(2, 4);
    const day = rawDate.substring(4, 6);
    
    return {
        rawDate,
        year,
        month,
        day,
        date: `${year}-${month}-${day}`,
        postNum: match[2] ? parseInt(match[2].substring(1)) : null
    };
}

// 한글 날짜 변환
function toKoreanDate(date) {
    const [year, month, day] = date.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

// 게시물 생성 함수
function createPost(folderName, files, type) {
    const dateInfo = parseDate(folderName);
    if (!dateInfo) return null;
    
    const images = files
        .filter(f => /\.(jpg|jpeg|png|gif|mp4|webp)$/i.test(f))
        .sort((a, b) => {
            const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || '0');
            const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || '0');
            return numA - numB;
        })
        .map(f => `https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-${type}/${encodeURIComponent(folderName)}/${encodeURIComponent(f)}`);
    
    if (images.length === 0) return null;
    
    const idSuffix = dateInfo.postNum ? `-${dateInfo.postNum}` : '';
    
    let post = {
        id: `${type}-${dateInfo.rawDate}${idSuffix}`,
        date: dateInfo.date,
        displayDate: toKoreanDate(dateInfo.date),
        username: 'doy.is.here',
        images: images,
        caption: `${toKoreanDate(dateInfo.date)} 게시물`,
        type: type,
        rawDate: dateInfo.rawDate,
        postNum: dateInfo.postNum
    };
    
    // 메타데이터 적용
    const metadata = type === 'photo' ? photoMetadata : 
                     type === 'group' ? groupMetadata : storyMetadata;
    post = applyMetadata(post, metadata);
    
    return post;
}

// 폴더 스캔 함수
function scanFolder(type) {
    const folderPath = path.join(__dirname, '..', `insta-${type}`);
    if (!fs.existsSync(folderPath)) return [];
    
    const items = fs.readdirSync(folderPath);
    const posts = [];
    
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            const files = fs.readdirSync(itemPath);
            const post = createPost(item, files, type);
            if (post) posts.push(post);
        } else if (stat.isFile() && /\.(jpg|jpeg|png|gif|mp4|webp)$/i.test(item)) {
            const post = createPost(item.replace(/\.(jpg|jpeg|png|gif|mp4|webp)$/i, ''), [item], type);
            if (post) {
                post.images = [`https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-${type}/${encodeURIComponent(item)}`];
                posts.push(post);
            }
        }
    }
    
    return posts.sort((a, b) => {
        // 날짜 비교 (최신순)
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        // 같은 날짜면 postNum 비교 (1 < 2 < 3)
        if (a.postNum !== null && b.postNum !== null) {
            return a.postNum - b.postNum;
        }
        if (a.postNum !== null) return -1;
        if (b.postNum !== null) return 1;
        
        return 0;
    });
}

// 리포스트 탭 생성 (모든 이미지를 개별 게시물로 펼침)
function createRepostPosts(photoPosts, groupPosts) {
    const expandedPosts = [];
    
    // groupPosts와 photoPosts를 합침
    const allPosts = [...groupPosts, ...photoPosts];
    
    // 각 게시물의 이미지를 개별 게시물로 펼침
    for (const post of allPosts) {
        for (let i = 0; i < post.images.length; i++) {
            expandedPosts.push({
                ...post,
                images: [post.images[i]], // 단일 이미지
                imageIndex: i, // 원본에서 몇 번째 이미지인지
                originalId: post.id
            });
        }
    }
    
    // 정렬: 날짜 최신순 → group 우선 → postNum 순서 → 이미지 인덱스 순서
    expandedPosts.sort((a, b) => {
        // 1. 날짜 비교 (최신순)
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        // 2. 같은 날짜면 group 우선
        if (a.type === 'group' && b.type !== 'group') return -1;
        if (a.type !== 'group' && b.type === 'group') return 1;
        
        // 3. 같은 타입이면 postNum 비교 (1 < 2 < 3)
        if (a.postNum !== null && b.postNum !== null) {
            const postNumCompare = a.postNum - b.postNum;
            if (postNumCompare !== 0) return postNumCompare;
        }
        if (a.postNum !== null) return -1;
        if (b.postNum !== null) return 1;
        
        // 4. 같은 게시물이면 이미지 인덱스 순서
        return a.imageIndex - b.imageIndex;
    });
    
    // ID 재할당
    return expandedPosts.map((post, index) => ({
        ...post,
        id: `repost-${index}`
    }));
}

// posts.js 생성
function generatePostsJS() {
    const photoPosts = scanFolder('photo');
    const groupPosts = scanFolder('group');
    const storyPosts = scanFolder('story');
    const repostPosts = createRepostPosts(photoPosts, groupPosts);
    
    const output = `// 게시물 데이터 (자동 생성됨)

// 그리드 탭 (insta-photo)
export const photoPosts = ${JSON.stringify(photoPosts, null, 4)};

// 태그 탭 (insta-group)
export const groupPosts = ${JSON.stringify(groupPosts, null, 4)};

// 스토리 탭 (insta-story)
export const storyPosts = ${JSON.stringify(storyPosts, null, 4)};

// 리포스트 탭 (photo + group 모든 이미지 개별 표시)
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

// 전체 게시물 (모든 탭 합침)
export const posts = [...photoPosts, ...groupPosts, ...storyPosts, ...repostPosts];

// 태그 탭 게시물만 가져오기
export function getTaggedPosts() {
    return groupPosts;
}

// 스토리 탭 게시물만 가져오기
export function getStories() {
    return storyPosts;
}
`;
    
    const outputPath = path.join(__dirname, '..', 'insta', 'js', 'posts.js');
    fs.writeFileSync(outputPath, output, 'utf8');
    
    console.log('✅ posts.js 생성 완료!');
    console.log(`📸 Photo: ${photoPosts.length}개 게시물`);
    console.log(`👥 Group: ${groupPosts.length}개 게시물`);
    console.log(`📖 Story: ${storyPosts.length}개 게시물`);
    console.log(`🔄 Repost: ${repostPosts.length}개 이미지 (개별 표시)`);
}

generatePostsJS();