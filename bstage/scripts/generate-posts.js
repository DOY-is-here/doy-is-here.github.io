/**
 * 폴더 스캔 → JSON 자동 생성 스크립트
 * 
 * 사용법: node generate-posts.js
 * 
 * bstage-nomad/ → data/nomad-posts.json (NOMAD 탭)
 * bstage-madzip/ → data/contents-posts.json (Contents 탭)
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
    nomad: {
        folder: 'bstage-nomad',
        output: 'data/nomad-posts.json',
        name: 'NOMAD'
    },
    contents: {
        folder: 'bstage-madzip',
        output: 'data/contents-posts.json',
        name: 'MAD.zip'
    }
};

// 파일명에서 날짜 추출 (YYMMDD → YYYY-MM-DD)
function parseDate(filename) {
    // 240402.jpeg 또는 240402 (1).jpeg 형태에서 날짜 추출
    const match = filename.match(/^(\d{6})/);
    if (!match) return null;
    
    const dateStr = match[1];
    const year = '20' + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    
    return `${year}-${month}-${day}`;
}

// 파일명에서 순번 추출 (없으면 0)
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

// 폴더 스캔 → JSON 생성
function generatePostsJSON(config) {
    const folderPath = config.folder;
    
    // 폴더 존재 확인
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
    
    // JSON 구조 생성
    const posts = Object.keys(postsByDate)
        .sort((a, b) => new Date(b) - new Date(a)) // 최신순 정렬
        .map(date => {
            const mediaFiles = postsByDate[date];
            const dateId = date.replace(/-/g, '').substring(2); // 2024-04-02 → 240402
            
            return {
                id: `post-${dateId}`,
                date: date,
                text: "",
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
                comments: 0
            };
        });
    
    const result = { posts };
    
    // 출력 폴더 생성
    const outputDir = path.dirname(config.output);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // JSON 파일 저장
    fs.writeFileSync(config.output, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`✅ ${config.output} 생성 완료 (${posts.length}개 포스트)`);
    
    return result;
}

// 메인 실행
console.log('🚀 JSON 생성 시작\n');

// NOMAD 포스트 생성
generatePostsJSON(CONFIG.nomad);

console.log('');

// Contents 포스트 생성
generatePostsJSON(CONFIG.contents);

console.log('\n✨ 완료!');
console.log('\n📝 다음 단계:');
console.log('   1. data/nomad-posts.json에서 "text" 필드에 본문 입력');
console.log('   2. data/contents-posts.json에서 "text" 필드에 제목/설명 입력');
console.log('   3. 비디오의 경우 "duration" 필드에 재생시간 입력 (예: "0:32")');