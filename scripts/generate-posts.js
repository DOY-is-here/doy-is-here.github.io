/**
 * 폴더 스캔 → JSON 자동 생성 스크립트
 * 
 * 사용법: node scripts/generate-posts.js
 * 
 * - 새 파일만 추가 (기존 데이터 유지)
 * - text, category, youtube 등 수동 입력한 값 보존
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
    nomad: {
        folder: 'bstage-nomad',
        output: 'bstage/data/nomad-posts.json',
        type: 'nomad'
    },
    contents: {
        folder: 'bstage-madzip',
        output: 'bstage/data/contents-posts.json',
        type: 'contents'
    }
};

// 파일명에서 날짜 추출 (YYMMDD → YYYY-MM-DD)
function parseDate(filename) {
    const match = filename.match(/^(\d{6})/);
    if (!match) return null;
    
    const dateStr = match[1];
    const year = '20' + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    
    return `${year}-${month}-${day}`;
}

// 파일명에서 순번 추출
function parseIndex(filename) {
    const match = filename.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
}

// 파일 타입 확인
function getMediaType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        return 'image';
    } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
        return 'video';
    }
    return null;
}

// 기존 JSON 로드
function loadExistingPosts(outputPath) {
    try {
        if (fs.existsSync(outputPath)) {
            const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            return data.posts || [];
        }
    } catch (error) {
        console.log(`   ⚠️  기존 JSON 로드 실패: ${error.message}`);
    }
    return [];
}

// 폴더 스캔 → JSON 생성
function generatePostsJSON(config) {
    const folderPath = config.folder;
    
    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  폴더 없음: ${folderPath}`);
        return null;
    }
    
    // 파일 목록 읽기
    const files = fs.readdirSync(folderPath)
        .filter(f => getMediaType(f) !== null)
        .sort();
    
    console.log(`📁 ${folderPath}: ${files.length}개 파일 발견`);
    
    // 날짜별로 그룹화
    const postsByDate = {};
    
    files.forEach(filename => {
        const date = parseDate(filename);
        if (!date) {
            console.log(`   ⚠️  날짜 파싱 실패: ${filename}`);
            return;
        }
        
        if (!postsByDate[date]) {
            postsByDate[date] = [];
        }
        
        postsByDate[date].push({
            filename,
            index: parseIndex(filename),
            type: getMediaType(filename)
        });
    });
    
    // 각 날짜 내에서 순번 정렬
    Object.keys(postsByDate).forEach(date => {
        postsByDate[date].sort((a, b) => a.index - b.index);
    });
    
    // 기존 포스트 로드
    const existingPosts = loadExistingPosts(config.output);
    const existingPostsMap = {};
    existingPosts.forEach(p => {
        existingPostsMap[p.id] = p;
    });
    
    // 새 포스트 생성 (기존 데이터 유지)
    const allDates = Object.keys(postsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    const posts = allDates.map(date => {
        const mediaFiles = postsByDate[date];
        const dateId = date.replace(/-/g, '').substring(2);
        const postId = `post-${dateId}`;
        
        // 기존 포스트가 있으면 데이터 유지
        const existing = existingPostsMap[postId];
        
        const newPost = {
            id: postId,
            date: date,
            text: existing?.text || "",
            media: mediaFiles.map(f => {
                const item = {
                    type: f.type,
                    src: `${config.folder}/${f.filename}`
                };
                if (f.type === 'video') {
                    item.duration = "";
                }
                return item;
            }),
            comments: existing?.comments || 0
        };
        
        // Contents 타입이면 category, youtube 필드 추가
        if (config.type === 'contents') {
            newPost.category = existing?.category || "madzip";
            newPost.youtube = existing?.youtube || "";
        }
        
        return newPost;
    });
    
    const result = { posts };
    
    // 출력 폴더 생성
    const outputDir = path.dirname(config.output);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // JSON 파일 저장
    fs.writeFileSync(config.output, JSON.stringify(result, null, 2), 'utf8');
    
    const newCount = posts.filter(p => !existingPostsMap[p.id]).length;
    console.log(`✅ ${config.output} 저장 완료`);
    console.log(`   총 ${posts.length}개 포스트 (새로 추가: ${newCount}개)`);
    
    return result;
}

// 메인 실행
console.log('🚀 JSON 생성 시작\n');

generatePostsJSON(CONFIG.nomad);
console.log('');
generatePostsJSON(CONFIG.contents);

console.log('\n✨ 완료!');
console.log('\n📝 수동 입력이 필요한 필드:');
console.log('   - text: 포스트 본문/제목');
console.log('   - category: madzip, behind, vlog, interview, etc (Contents만)');
console.log('   - youtube: 유튜브 URL (Contents만)');
console.log('   - duration: 비디오 재생시간 (예: "0:32")');