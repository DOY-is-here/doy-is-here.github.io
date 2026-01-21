/**
 * 폴더 스캔 → JSON 자동 생성 스크립트 (병합 모드 + 댓글 지원)
 * 
 * 사용법: node scripts/generate-posts.js
 * 
 * 특징:
 * - 기존 JSON과 비교하여 새로운 파일만 추가
 * - 삭제된 파일만 제거
 * - 기존 text, tags, category, youtube 등 수동 입력 데이터 보존
 * - bstage-nomad-comment 폴더의 댓글 파일 자동 파싱
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
    nomad: {
        folder: 'bstage-nomad',
        commentFolder: 'bstage-nomad-comment',
        output: 'bstage/data/nomad-posts.json',
        type: 'nomad'
    },
    contents: {
        folder: 'bstage-madzip',
        output: 'bstage/data/contents-posts.json',
        type: 'contents'
    },
    youtube: {
        youtubeFile: 'bstage-madzip/youtube-url.txt',
        output: 'bstage/data/youtube-posts.json',
        type: 'youtube'
    }
};

// 유튜브 txt 파일 파싱
function parseYoutubeFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return [];
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const posts = [];
        const dateCount = {}; // 같은 날짜 카운트용
        
        let currentDate = null;
        let currentTitle = null;
        let currentUrl = null;
        let currentDesc = [];
        let urlFound = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 날짜 패턴: 2025. 12. 29. 또는 2024. 1. 8.
            const dateMatch = line.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*$/);
            if (dateMatch) {
                // 이전 항목 저장
                if (currentDate && currentUrl) {
                    const dateStr = currentDate.replace(/-/g, '').substring(2);
                    dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;
                    const count = dateCount[dateStr];
                    const postId = count > 1 ? `yt-${dateStr}-${count}` : `yt-${dateStr}`;
                    
                    posts.push({
                        id: postId,
                        date: currentDate,
                        text: currentTitle || '',
                        description: currentDesc.join('\n').trim() || '',
                        youtube: currentUrl.split('?')[0], // si= 파라미터 제거
                        media: [],
                        category: 'etc',
                        tags: []
                    });
                }
                
                // 새 항목 시작
                const year = dateMatch[1];
                const month = dateMatch[2].padStart(2, '0');
                const day = dateMatch[3].padStart(2, '0');
                currentDate = `${year}-${month}-${day}`;
                currentTitle = null;
                currentUrl = null;
                currentDesc = [];
                urlFound = false;
                continue;
            }
            
            // 유튜브 URL 패턴
            if (line.includes('youtube.com') || line.includes('youtu.be')) {
                currentUrl = line;
                urlFound = true;
                continue;
            }
            
            // 제목 (날짜 다음 줄, URL 전)
            if (currentDate && !currentTitle && line && !urlFound) {
                currentTitle = line;
                continue;
            }
            
            // 설명 (URL 다음 줄들)
            if (urlFound && line) {
                currentDesc.push(line);
            }
        }
        
        // 마지막 항목 저장
        if (currentDate && currentUrl) {
            const dateStr = currentDate.replace(/-/g, '').substring(2);
            dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;
            const count = dateCount[dateStr];
            const postId = count > 1 ? `yt-${dateStr}-${count}` : `yt-${dateStr}`;
            
            posts.push({
                id: postId,
                date: currentDate,
                text: currentTitle || '',
                description: currentDesc.join('\n').trim() || '',
                youtube: currentUrl.split('?')[0],
                media: [],
                category: 'etc',
                tags: []
            });
        }
        
        return posts;
    } catch (error) {
        console.log(`   ⚠️  유튜브 파일 읽기 실패: ${filePath}`);
        return [];
    }
}

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

// 댓글 파일 파싱 (B와 D를 쌍으로 묶기)
function parseComments(commentFolder, date) {
    if (!commentFolder) return [];
    
    const dateStr = date.replace(/-/g, '').substring(2); // 2024-04-08 → 240408
    const commentFile = path.join(commentFolder, `comment_${dateStr}.txt`);
    
    if (!fs.existsSync(commentFile)) {
        return [];
    }
    
    try {
        const content = fs.readFileSync(commentFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const comments = [];
        
        let currentPair = { base: '', doy: '' };
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // [B] 또는 [D]로 시작하는지 확인
            const match = line.match(/^\[([BD])\](.*)$/);
            if (match) {
                const type = match[1]; // B 또는 D
                const text = match[2].trim();
                
                if (type === 'B') {
                    // 새로운 쌍 시작
                    if (currentPair.base || currentPair.doy) {
                        // 이전 쌍 저장
                        comments.push({ ...currentPair });
                    }
                    currentPair = { base: text, doy: '' };
                } else if (type === 'D') {
                    currentPair.doy = text;
                    // D가 오면 쌍 완성, 저장
                    comments.push({ ...currentPair });
                    currentPair = { base: '', doy: '' };
                }
            }
        }
        
        // 마지막 쌍이 남아있으면 저장 (D 없이 B만 있는 경우)
        if (currentPair.base || currentPair.doy) {
            comments.push({ ...currentPair });
        }
        
        return comments;
    } catch (error) {
        console.log(`   ⚠️  댓글 파일 읽기 실패: ${commentFile}`);
        return [];
    }
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

// 댓글 폴더에서 날짜 목록 추출
function getCommentDates(commentFolder) {
    if (!commentFolder || !fs.existsSync(commentFolder)) {
        return [];
    }
    
    const files = fs.readdirSync(commentFolder);
    const dates = [];
    
    files.forEach(file => {
        // comment_240408.txt 형식에서 날짜 추출
        const match = file.match(/^comment_(\d{6})\.txt$/);
        if (match) {
            const dateStr = match[1];
            const year = '20' + dateStr.substring(0, 2);
            const month = dateStr.substring(2, 4);
            const day = dateStr.substring(4, 6);
            dates.push(`${year}-${month}-${day}`);
        }
    });
    
    return dates;
}

// 미디어 파일들을 포스트로 그룹화
function groupIntoPosts(mediaFiles, folderPath, commentFolder) {
    const groups = {};
    
    // 1. 미디어 파일로 포스트 생성
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
    
    // 2. 댓글 파일만 있고 미디어가 없는 날짜도 포스트 생성
    if (commentFolder) {
        const commentDates = getCommentDates(commentFolder);
        commentDates.forEach(date => {
            const postId = `post-${date.replace(/-/g, '').substring(2)}`;
            if (!groups[postId]) {
                // 미디어 없이 댓글만 있는 포스트 생성
                groups[postId] = {
                    id: postId,
                    date: date,
                    media: []
                };
            }
        });
    }
    
    // 각 포스트 내 미디어 정렬 (slideIndex 기준) + 댓글 파싱
    Object.values(groups).forEach(post => {
        post.media.sort((a, b) => a.slideIndex - b.slideIndex);
        // slideIndex 필드 제거
        post.media.forEach(m => delete m.slideIndex);
        
        // 댓글 파싱 (nomad만)
        if (commentFolder) {
            post.commentList = parseComments(commentFolder, post.date);
        }
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
            const merged = {
                id: newPost.id,
                date: newPost.date,
                text: existing.text || '',
                media: newPost.media,  // 미디어는 새로 스캔한 것으로 업데이트
                comments: existing.comments || 0
            };
            
            // contents 타입이면 카테고리, 태그 보존
            if (type === 'contents') {
                merged.category = existing.category || newPost.category || 'etc';
                merged.tags = existing.tags || [];
                // youtube는 새 값 우선, 없으면 기존 값
                if (newPost.youtube) merged.youtube = newPost.youtube;
                else if (existing.youtube) merged.youtube = existing.youtube;
                // description도 새 값 우선
                if (newPost.description) merged.description = newPost.description;
                else if (existing.description) merged.description = existing.description;
            }
            
            // youtube 타입
            if (type === 'youtube') {
                merged.text = existing.text || newPost.text || '';
                merged.category = existing.category || newPost.category || 'etc';
                merged.tags = existing.tags || [];
                merged.youtube = newPost.youtube || existing.youtube;
                merged.description = newPost.description || existing.description || '';
                delete merged.media;
                delete merged.comments;
            }
            
            // nomad 타입이면 댓글 목록 업데이트 + 개수 자동 계산
            if (type === 'nomad') {
                merged.commentList = newPost.commentList || [];
                merged.comments = merged.commentList.length;
            }
            
            result.push(merged);
            
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
            
            // nomad 타입이면 댓글 목록 추가 + 개수 자동 계산
            if (type === 'nomad') {
                post.commentList = newPost.commentList || [];
                post.comments = post.commentList.length;
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
    console.log('🚀 JSON 생성 시작 (병합 모드 + 댓글/유튜브 지원)\n');
    
    Object.entries(CONFIG).forEach(([key, config]) => {
        // youtube 타입은 별도 처리
        if (config.type === 'youtube') {
            console.log(`🎬 유튜브 파일 스캔 중...`);
            
            const youtubePosts = parseYoutubeFile(config.youtubeFile);
            console.log(`   ${youtubePosts.length}개 유튜브 영상 발견`);
            
            // 기존 JSON 로드
            const existing = loadExistingJSON(config.output);
            
            // 병합
            const { posts, added, updated, removed } = mergePosts(
                existing.posts, 
                youtubePosts,
                config.type
            );
            
            // 저장
            saveJSON(config.output, { posts });
            
            console.log(`✅ ${config.output} 저장 완료`);
            console.log(`   총 ${posts.length}개 포스트`);
            if (added > 0) console.log(`   ➕ 추가: ${added}개`);
            if (removed > 0) console.log(`   ➖ 삭제: ${removed}개`);
            console.log('');
            return;
        }
        
        console.log(`📁 ${config.folder} 스캔 중...`);
        
        // 폴더 스캔
        const mediaFiles = scanFolder(config.folder);
        console.log(`   ${mediaFiles.length}개 미디어 파일 발견`);
        
        // 포스트로 그룹화 (댓글 폴더 전달)
        let newPosts = groupIntoPosts(
            mediaFiles, 
            config.folder, 
            config.commentFolder || null
        );
        
        // 댓글 통계 (nomad만)
        if (config.commentFolder) {
            const totalComments = newPosts.reduce((sum, p) => sum + (p.commentList?.length || 0), 0);
            console.log(`   💬 ${totalComments}개 댓글 파싱됨`);
        }
        
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