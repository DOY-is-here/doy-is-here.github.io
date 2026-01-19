/**
 * 폴더 스캔 → JSON 자동 생성 스크립트 (병합 모드)
 * 
 * 사용법: node scripts/generate-posts.js
 * 
 * 특징:
 * - 기존 JSON과 비교하여 새로운 파일만 추가
 * - 삭제된 파일만 제거
 * - 기존 text, tags, category, youtube 등 수동 입력 데이터 보존
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

// 지원 확장자
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const VIDEO_EXTS = ['.mp4', '.mov', '.webm'];

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

// 파일명에서 게시물 번호 추출 (240202-1 → 1)
function parsePostNumber(filename) {
    const match = filename.match(/^(\d{6})-(\d+)/);
    return match ? parseInt(match[2]) : 0;
}

// 파일명에서 슬라이드 순번 추출 (240202 (1) → 1)
function parseSlideIndex(filename) {
    const match = filename.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
}

// 폴더 스캔
function scanFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  폴더 없음: ${folderPath}`);
        return [];
    }
    
    const files = fs.readdirSync(folderPath);
    const mediaFiles = [];
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const isImage = IMAGE_EXTS.includes(ext);
        const isVideo = VIDEO_EXTS.includes(ext);
        
        if (!isImage && !isVideo) return;
        
        const date = parseDate(file);
        if (!date) return;
        
        const postNumber = parsePostNumber(file);
        const slideIndex = parseSlideIndex(file);
        
        mediaFiles.push({
            filename: file,
            date,
            postNumber,
            slideIndex,
            type: isVideo ? 'video' : 'image',
            ext
        });
    });
    
    return mediaFiles;
}

// 미디어 파일들을 포스트로 그룹화
function groupIntoPosts(mediaFiles, folderPath) {
    const groups = {};
    
    mediaFiles.forEach(file => {
        // 포스트 ID 생성: 날짜-번호 또는 날짜만
        const postId = file.postNumber > 0 
            ? `post-${file.date.replace(/-/g, '').substring(2)}-${file.postNumber}`
            : `post-${file.date.replace(/-/g, '').substring(2)}`;
        
        if (!groups[postId]) {
            groups[postId] = {
                id: postId,
                date: file.date,
                media: []
            };
        }
        
        groups[postId].media.push({
            type: file.type,
            src: `${folderPath}/${file.filename}`,
            slideIndex: file.slideIndex
        });
    });
    
    // 각 포스트 내 미디어 정렬 (slideIndex 기준)
    Object.values(groups).forEach(post => {
        post.media.sort((a, b) => a.slideIndex - b.slideIndex);
        // slideIndex 필드 제거
        post.media.forEach(m => delete m.slideIndex);
    });
    
    return Object.values(groups).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
}

// 기존 JSON 로드
function loadExistingJSON(outputPath) {
    if (!fs.existsSync(outputPath)) {
        return { posts: [] };
    }
    
    try {
        const content = fs.readFileSync(outputPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log(`⚠️  기존 JSON 파싱 실패, 새로 생성: ${outputPath}`);
        return { posts: [] };
    }
}

// 포스트 병합 (기존 데이터 보존)
function mergePosts(existingPosts, newPosts, type) {
    const existingMap = new Map();
    existingPosts.forEach(post => existingMap.set(post.id, post));
    
    const newMap = new Map();
    newPosts.forEach(post => newMap.set(post.id, post));
    
    const result = [];
    let added = 0;
    let updated = 0;
    let removed = 0;
    
    // 새 포스트 처리
    newPosts.forEach(newPost => {
        const existing = existingMap.get(newPost.id);
        
        if (existing) {
            // 기존 포스트 있음 → 수동 입력 데이터 보존
            result.push({
                id: newPost.id,
                date: newPost.date,
                text: existing.text || '',
                category: existing.category || (type === 'contents' ? 'etc' : undefined),
                tags: existing.tags || [],
                youtube: existing.youtube || undefined,
                media: newPost.media,  // 미디어는 새로 스캔한 것으로 업데이트
                comments: existing.comments || 0
            });
            
            // 미디어 변경 체크
            const existingMedia = JSON.stringify(existing.media);
            const newMedia = JSON.stringify(newPost.media);
            if (existingMedia !== newMedia) {
                updated++;
            }
        } else {
            // 새 포스트
            const post = {
                id: newPost.id,
                date: newPost.date,
                text: '',
                media: newPost.media,
                comments: 0
            };
            
            // contents 타입이면 기본 카테고리, 빈 태그 추가
            if (type === 'contents') {
                post.category = 'etc';
                post.tags = [];
            }
            
            result.push(post);
            added++;
        }
    });
    
    // 삭제된 포스트 카운트
    existingPosts.forEach(existing => {
        if (!newMap.has(existing.id)) {
            removed++;
        }
    });
    
    // 날짜순 정렬 (최신순)
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // undefined 필드 제거
    result.forEach(post => {
        Object.keys(post).forEach(key => {
            if (post[key] === undefined) {
                delete post[key];
            }
        });
    });
    
    return { posts: result, added, updated, removed };
}

// JSON 저장
function saveJSON(outputPath, data) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
}

// 메인 실행
function main() {
    console.log('🚀 JSON 생성 시작 (병합 모드)\n');
    
    Object.entries(CONFIG).forEach(([key, config]) => {
        console.log(`📁 ${config.folder} 스캔 중...`);
        
        // 폴더 스캔
        const mediaFiles = scanFolder(config.folder);
        console.log(`   ${mediaFiles.length}개 미디어 파일 발견`);
        
        // 포스트로 그룹화
        const newPosts = groupIntoPosts(mediaFiles, config.folder);
        
        // 기존 JSON 로드
        const existing = loadExistingJSON(config.output);
        
        // 병합
        const { posts, added, updated, removed } = mergePosts(
            existing.posts, 
            newPosts,
            config.type
        );
        
        // 저장
        saveJSON(config.output, { posts });
        
        console.log(`✅ ${config.output} 저장 완료`);
        console.log(`   총 ${posts.length}개 포스트`);
        if (added > 0) console.log(`   ➕ 추가: ${added}개`);
        if (updated > 0) console.log(`   🔄 미디어 변경: ${updated}개`);
        if (removed > 0) console.log(`   ➖ 삭제: ${removed}개`);
        console.log('');
    });
    
    console.log('✨ 완료!');
}

main();