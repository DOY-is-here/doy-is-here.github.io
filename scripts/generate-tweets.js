const fs = require('fs');
const path = require('path');

// 설정
const FOLDERS = {
    group: 'x-group',
    photo: 'x-photo'
};

const OUTPUT_FILE = 'twitter/js/tweets.js';
const METADATA_FILE = 'metadata/twitter-metadata.json';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main';

// 프로필 정보
const PROFILE = {
    name: 'NOMAD',
    username: 'NOMAD_is_here',
    avatar: 'https://pbs.twimg.com/profile_images/1863098273033805824/MvJmELpF_400x400.jpg',
    verified: true
};

// 메타데이터 로드
function loadMetadata() {
    try {
        const metadataPath = path.join(__dirname, '..', METADATA_FILE);
        if (fs.existsSync(metadataPath)) {
            return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        }
    } catch (error) {
        console.warn(`⚠️  Warning: Could not load twitter-metadata.json:`, error.message);
    }
    return {};
}

// 미디어 파일 읽기
function getMediaFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`❌ ${dir} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(dir);
    const mediaFiles = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(file));
    
    console.log(`📁 ${path.basename(dir)}: ${mediaFiles.length}개 파일`);
    
    return mediaFiles;
}

// 파일명에서 날짜, 트윗 번호, 이미지 순서, 타래 여부 추출
function parseFileName(fileName) {
    // 240405-1.jpg -> { date: "240405", tweetNum: 1, sequence: null, isThread: false }
    // 240405-1 (1).jpg -> { date: "240405", tweetNum: 1, sequence: 1, isThread: false }
    // 240405.jpg -> { date: "240405", tweetNum: null, sequence: null, isThread: false }
    // 240405-ps.jpg -> { date: "240405", tweetNum: null, sequence: null, isThread: true }
    // 240405 (1).jpg -> { date: "240405", tweetNum: null, sequence: 1, isThread: false }
    
    const match = fileName.match(/^(\d{6})(?:-(\d+|ps))?(?:\s*\((\d+)\))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        tweetNum: match[2] && match[2] !== 'ps' ? parseInt(match[2]) : null,
        isThread: match[2] === 'ps',
        sequence: match[3] ? parseInt(match[3]) : null,
        fileName: fileName
    };
}

// 날짜를 표시 형식으로 변환 (2024.4.5.)
function formatDisplayDate(dateStr) {
    const year = "20" + dateStr.substring(0, 2);
    const month = parseInt(dateStr.substring(2, 4));
    const day = parseInt(dateStr.substring(4, 6));
    return `${year}.${month}.${day}.`;
}

// 날짜를 ISO 형식으로 변환
function formatISODate(dateStr) {
    const year = "20" + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    return `${year}-${month}-${day}T12:00:00Z`;
}

// 미디어 파일들을 트윗으로 그룹화
function groupMediaByTweet(mediaFiles, folderPath, type, metadata) {
    const parsed = mediaFiles
        .map(file => {
            const filenameWithoutExt = file.replace(/\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i, '');
            return { ...parseFileName(filenameWithoutExt), originalFile: file };
        })
        .filter(p => p !== null);
    
    console.log(`   파싱 결과: ${parsed.length}/${mediaFiles.length}개 성공`);
    
    // 날짜 + 트윗 번호 + 타래로 그룹화
    const grouped = {};
    
    parsed.forEach(item => {
        let tweetKey;
        if (item.isThread) {
            tweetKey = `${item.date}-ps`;
        } else if (item.tweetNum !== null) {
            tweetKey = `${item.date}-${item.tweetNum}`;
        } else {
            tweetKey = item.date;
        }
        
        if (!grouped[tweetKey]) {
            grouped[tweetKey] = {
                date: item.date,
                tweetNum: item.tweetNum,
                isThread: item.isThread,
                media: []
            };
        }
        
        grouped[tweetKey].media.push(item);
    });
    
    // 각 그룹을 트윗으로 변환
    const tweets = [];
    let appliedCount = 0;
    
    Object.keys(grouped).forEach(tweetKey => {
        const group = grouped[tweetKey];
        const media = group.media;
        
        // 미디어를 순서대로 정렬
        media.sort((a, b) => {
            if (a.sequence === null && b.sequence === null) return 0;
            if (a.sequence === null) return -1;
            if (b.sequence === null) return 1;
            return a.sequence - b.sequence;
        });
        
        // 미디어 URL 배열 생성
        const mediaUrls = media.map(m => `${GITHUB_RAW_BASE}/${folderPath}/${encodeURIComponent(m.originalFile)}`);
        
        // 메타데이터에서 트윗 정보 가져오기
        let tweetData = { text: '' };
        
        if (group.isThread) {
            // 타래인 경우
            if (metadata[group.date] && metadata[group.date]['ps']) {
                tweetData = metadata[group.date]['ps'];
                appliedCount++;
            }
        } else if (group.tweetNum !== null && metadata[group.date]) {
            const tweetNumStr = String(group.tweetNum);
            if (metadata[group.date][tweetNumStr]) {
                tweetData = metadata[group.date][tweetNumStr];
                appliedCount++;
            }
        } else if (group.tweetNum === null && metadata[group.date]) {
            if (typeof metadata[group.date] === 'object' && metadata[group.date].text !== undefined) {
                tweetData = metadata[group.date];
                appliedCount++;
            }
        }
        
        const tweet = {
            id: `${type}-${tweetKey}`,
            author: PROFILE,
            date: formatISODate(group.date),
            displayDate: formatDisplayDate(group.date),
            text: tweetData.text || '',
            images: mediaUrls,
            type: type, // 'group' 또는 'photo'
            isThread: group.isThread,
            rawDate: group.date,
            tweetNum: group.tweetNum
        };
        
        tweets.push(tweet);
    });
    
    console.log(`   📝 메타데이터 적용: ${appliedCount}/${tweets.length}개`);
    
    return tweets;
}

// tweets.js 파일 생성
function generateTweetsJS(groupTweets, photoTweets) {
    // 모든 트윗 합치기
    const allTweets = [...groupTweets, ...photoTweets];
    
    // 날짜순 정렬 (최신순)
    allTweets.sort((a, b) => {
        if (a.rawDate !== b.rawDate) {
            return b.rawDate.localeCompare(a.rawDate);
        }
        // 같은 날짜면 tweetNum 내림차순
        const aNum = a.tweetNum || 0;
        const bNum = b.tweetNum || 0;
        return bNum - aNum;
    });
    
    const content = `// 트윗 데이터 (자동 생성됨)

// 전체 트윗 (게시물 탭용 - group + photo)
export const tweets = ${JSON.stringify(allTweets, null, 4)};

// 포토만 (하이라이트 탭용)
export const photoTweets = ${JSON.stringify(photoTweets, null, 4)};

// 그룹만
export const groupTweets = ${JSON.stringify(groupTweets, null, 4)};

// 트윗 개수
export function getTweetCount() {
    return tweets.length;
}

// ID로 트윗 찾기
export function getTweetById(id) {
    return tweets.find(tweet => tweet.id === id);
}

// 날짜별 트윗 가져오기
export function getTweetsByDate(date) {
    return tweets.filter(tweet => tweet.rawDate === date);
}

// 탭별 트윗 가져오기
export function getTweetsByTab(tab) {
    switch(tab) {
        case 'posts':
            return tweets; // group + photo 모두
        case 'highlights':
            return photoTweets; // photo만
        case 'photos':
            return tweets.filter(t => t.images && t.images.length > 0);
        default:
            return tweets;
    }
}
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ tweets.js 생성 완료!');
    console.log(`📊 그룹: ${groupTweets.length}개`);
    console.log(`📊 포토: ${photoTweets.length}개`);
    console.log(`📊 전체: ${allTweets.length}개`);
}

// 메인 실행
function main() {
    console.log('🐦 트윗 데이터 생성 중...\n');
    
    // 메타데이터 로드
    console.log('📖 메타데이터 로드 중...');
    const metadata = loadMetadata();
    console.log(`   twitter-metadata: ${Object.keys(metadata).length}개 항목\n`);
    
    // 미디어 파일 읽기
    console.log('📁 미디어 파일 스캔 중...');
    const groupFiles = getMediaFiles(FOLDERS.group);
    const photoFiles = getMediaFiles(FOLDERS.photo);
    
    console.log('\n📝 트윗 데이터 생성 중...');
    
    // 트윗 생성
    const groupTweets = groupMediaByTweet(groupFiles, FOLDERS.group, 'group', metadata);
    const photoTweets = groupMediaByTweet(photoFiles, FOLDERS.photo, 'photo', metadata);
    
    console.log('\n💾 tweets.js 파일 생성 중...');
    generateTweetsJS(groupTweets, photoTweets);
    
    console.log('\n✨ 완료!');
}

main();