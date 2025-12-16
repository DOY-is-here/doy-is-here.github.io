const fs = require('fs');
const path = require('path');

// 설정
const MEDIA_FOLDER = 'twitter-media';
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

// 이미지 파일 읽기
function getMediaFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`❌ ${dir} 폴더가 없습니다.`);
        return [];
    }
    
    const files = fs.readdirSync(dir);
    const mediaFiles = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(file));
    
    console.log(`📁 미디어 폴더 분석:`);
    console.log(`   전체 항목: ${files.length}개`);
    console.log(`   미디어 파일: ${mediaFiles.length}개`);
    
    if (mediaFiles.length > 0) {
        console.log(`   샘플 파일명:`);
        mediaFiles.slice(0, 5).forEach(file => {
            console.log(`      - ${file}`);
        });
        if (mediaFiles.length > 5) {
            console.log(`      ... 외 ${mediaFiles.length - 5}개`);
        }
    }
    
    return mediaFiles;
}

// 파일명에서 날짜, 트윗 번호, 이미지 순서 추출
function parseFileName(fileName) {
    // 251205-1.jpg -> { date: "251205", tweetNum: 1, sequence: null }
    // 251205-1 (1).jpg -> { date: "251205", tweetNum: 1, sequence: 1 }
    // 251205.jpg -> { date: "251205", tweetNum: null, sequence: null }
    const match = fileName.match(/^(\d{6})(?:-(\d+))?(?:\s*\((\d+)\))?/);
    
    if (!match) return null;
    
    return {
        date: match[1],
        tweetNum: match[2] ? parseInt(match[2]) : null,
        sequence: match[3] ? parseInt(match[3]) : null,
        fileName: fileName
    };
}

// 날짜를 ISO 형식으로 변환
function formatISODate(dateStr) {
    // 251205 -> "2025-12-05"
    const year = "20" + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    return `${year}-${month}-${day}T12:00:00Z`;
}

// 미디어 파일들을 트윗으로 그룹화
function groupMediaByTweet(mediaFiles, metadata) {
    const parsed = mediaFiles
        .map(file => {
            const filenameWithoutExt = file.replace(/\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i, '');
            return { ...parseFileName(filenameWithoutExt), originalFile: file };
        })
        .filter(p => p !== null);
    
    console.log(`   파싱 결과: ${parsed.length}/${mediaFiles.length}개 성공`);
    
    // 날짜 + 트윗 번호로 그룹화
    const grouped = {};
    
    parsed.forEach(item => {
        const tweetKey = item.tweetNum !== null 
            ? `${item.date}-${item.tweetNum}`
            : item.date;
        
        if (!grouped[tweetKey]) {
            grouped[tweetKey] = {
                date: item.date,
                tweetNum: item.tweetNum,
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
        const mediaUrls = media.map(m => `${GITHUB_RAW_BASE}/${MEDIA_FOLDER}/${encodeURIComponent(m.originalFile)}`);
        
        // 메타데이터에서 트윗 정보 가져오기
        let tweetData = { text: '' };
        
        if (group.tweetNum !== null && metadata[group.date]) {
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
            id: `tweet-${tweetKey}`,
            author: PROFILE,
            date: formatISODate(group.date),
            text: tweetData.text || '',
            images: mediaUrls,
            replies: tweetData.replies || 0,
            retweets: tweetData.retweets || 0,
            likes: tweetData.likes || 0,
            views: tweetData.views || 0,
            rawDate: group.date,
            tweetNum: group.tweetNum
        };
        
        tweets.push(tweet);
    });
    
    console.log(`   📝 메타데이터 적용: ${appliedCount}/${tweets.length}개`);
    
    return tweets;
}

// tweets.js 파일 생성
function generateTweetsJS(tweets) {
    // 날짜순 정렬 (최신순)
    tweets.sort((a, b) => {
        if (a.rawDate !== b.rawDate) {
            return b.rawDate.localeCompare(a.rawDate);
        }
        const aNum = a.tweetNum || 0;
        const bNum = b.tweetNum || 0;
        return bNum - aNum;
    });
    
    const content = `// 트윗 데이터 (자동 생성됨)

export const tweets = ${JSON.stringify(tweets, null, 4)};

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
`;
    
    // 출력 디렉토리 확인
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ tweets.js 생성 완료!');
    console.log(`📊 총 ${tweets.length}개 트윗`);
}

// 메인 실행
function main() {
    console.log('🐦 트윗 데이터 생성 중...\n');
    
    // 메타데이터 로드
    console.log('📖 메타데이터 로드 중...');
    const metadata = loadMetadata();
    console.log(`   twitter-metadata: ${Object.keys(metadata).length}개 항목\n`);
    
    // 미디어 파일 읽기
    const mediaFiles = getMediaFiles(MEDIA_FOLDER);
    
    if (mediaFiles.length === 0) {
        console.log('⚠️  미디어 파일이 없습니다.');
        // 빈 tweets.js 생성
        generateTweetsJS([]);
        return;
    }
    
    console.log('\n📝 트윗 데이터 생성 중...');
    
    // 트윗 생성
    const tweets = groupMediaByTweet(mediaFiles, metadata);
    
    console.log('\n💾 tweets.js 파일 생성 중...');
    generateTweetsJS(tweets);
    
    console.log('\n✨ 완료!');
}

main();