const fs = require('fs');
const path = require('path');

// 날짜 파싱 함수
function parseDate(filename) {
    const match = filename.match(/^(\d{6})(-\d+)?/);
    if (!match) return null;
    
    return {
        rawDate: match[1],
        videoNum: match[2] ? parseInt(match[2].substring(1)) : null
    };
}

// 기존 metadata 로드
function loadExistingMetadata() {
    const metadataPath = path.join(__dirname, '..', 'metadata', 'videos-metadata.json');
    
    if (fs.existsSync(metadataPath)) {
        try {
            const content = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️  기존 videos-metadata.json 읽기 실패:`, error.message);
            return {};
        }
    }
    
    return {};
}

// 실제 파일 구조 분석
function analyzeFileStructure(folderPath) {
    if (!fs.existsSync(folderPath)) {
        return {};
    }
    
    const items = fs.readdirSync(folderPath);
    const structure = {};
    
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);
        
        let dateInfo;
        
        if (stat.isFile() && /\.(mp4|webm|mov|avi|mkv)$/i.test(item)) {
            const filenameWithoutExt = item.replace(/\.(mp4|webm|mov|avi|mkv)$/i, '');
            dateInfo = parseDate(filenameWithoutExt);
        }
        
        if (dateInfo) {
            const { rawDate, videoNum } = dateInfo;
            
            if (!structure[rawDate]) {
                structure[rawDate] = {
                    hasMultiple: false,
                    videoNums: []
                };
            }
            
            if (videoNum !== null) {
                structure[rawDate].hasMultiple = true;
                if (!structure[rawDate].videoNums.includes(videoNum)) {
                    structure[rawDate].videoNums.push(videoNum);
                }
            } else {
                structure[rawDate].hasSingle = true;
            }
        }
    }
    
    return structure;
}

// 메타데이터 구조 업데이트 (title, duration 보존)
function updateMetadataStructure(existingMetadata, fileStructure) {
    const updatedMetadata = {};
    const changes = [];
    
    for (const [rawDate, structure] of Object.entries(fileStructure)) {
        const existing = existingMetadata[rawDate];
        
        // Case 1: 다중 videoNum 구조 필요 (240504-1, 240504-2 등)
        if (structure.hasMultiple) {
            // 기존이 단일 구조였다면 → 다중 구조로 변환
            if (existing && typeof existing === 'object' && existing.title !== undefined) {
                console.log(`🔄 구조 변경: ${rawDate} (단일 → 다중)`);
                changes.push(`${rawDate}: 단일 → 다중`);
                
                updatedMetadata[rawDate] = {};
                structure.videoNums.sort((a, b) => a - b);
                
                // 첫 번째 videoNum에 기존 데이터 이동
                structure.videoNums.forEach((num, index) => {
                    if (index === 0 && existing.title) {
                        updatedMetadata[rawDate][num] = {
                            title: existing.title,
                            duration: existing.duration || "0:00"
                        };
                    } else if (existing && existing[num]) {
                        updatedMetadata[rawDate][num] = existing[num];
                    } else {
                        updatedMetadata[rawDate][num] = {
                            title: "",
                            duration: "0:00"
                        };
                    }
                });
            }
            // 기존이 이미 다중 구조였다면 → 데이터 보존
            else if (existing && typeof existing === 'object' && !existing.title) {
                updatedMetadata[rawDate] = {};
                structure.videoNums.sort((a, b) => a - b);
                
                structure.videoNums.forEach(num => {
                    if (existing[num]) {
                        updatedMetadata[rawDate][num] = existing[num];
                    } else {
                        updatedMetadata[rawDate][num] = {
                            title: "",
                            duration: "0:00"
                        };
                        changes.push(`${rawDate}-${num}: 새로 추가`);
                    }
                });
            }
            // 기존 데이터가 없다면 → 새로 생성
            else {
                updatedMetadata[rawDate] = {};
                structure.videoNums.sort((a, b) => a - b);
                
                structure.videoNums.forEach(num => {
                    updatedMetadata[rawDate][num] = {
                        title: "",
                        duration: "0:00"
                    };
                });
                changes.push(`${rawDate}: 새로 추가 (다중)`);
            }
        }
        // Case 2: 단일 구조 필요 (240504.mp4)
        else if (structure.hasSingle) {
            // 기존이 다중 구조였다면 → 단일 구조로 변환
            if (existing && typeof existing === 'object' && !existing.title) {
                console.log(`🔄 구조 변경: ${rawDate} (다중 → 단일)`);
                changes.push(`${rawDate}: 다중 → 단일`);
                
                // 첫 번째 videoNum의 데이터 가져오기
                const firstVideoNum = Object.keys(existing).sort()[0];
                const firstVideo = existing[firstVideoNum];
                
                updatedMetadata[rawDate] = {
                    title: firstVideo?.title || "",
                    duration: firstVideo?.duration || "0:00"
                };
            }
            // 기존이 이미 단일 구조였다면 → 데이터 보존
            else if (existing && existing.title !== undefined) {
                updatedMetadata[rawDate] = existing;
            }
            // 기존 데이터가 없다면 → 새로 생성
            else {
                updatedMetadata[rawDate] = {
                    title: "",
                    duration: "0:00"
                };
                changes.push(`${rawDate}: 새로 추가 (단일)`);
            }
        }
    }
    
    return { updatedMetadata, changes };
}

// 템플릿 생성 함수
function generateTemplate() {
    const folderPath = path.join(__dirname, '..', 'reels');
    
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ ${folderPath} 폴더가 없습니다.`);
        return;
    }
    
    console.log(`\n🔍 동영상 파일 처리 중...`);
    
    // 1. 기존 메타데이터 로드
    const existingMetadata = loadExistingMetadata();
    console.log(`   기존 메타데이터: ${Object.keys(existingMetadata).length}개 항목`);
    
    // 2. 실제 파일 구조 분석
    const fileStructure = analyzeFileStructure(folderPath);
    console.log(`   실제 파일 구조: ${Object.keys(fileStructure).length}개 날짜`);
    
    // 3. 메타데이터 구조 업데이트 (title, views 등 보존)
    const { updatedMetadata, changes } = updateMetadataStructure(existingMetadata, fileStructure);
    
    // 4. 정렬
    const sortedMetadata = {};
    Object.keys(updatedMetadata)
        .sort((a, b) => b.localeCompare(a))
        .forEach(key => {
            if (typeof updatedMetadata[key] === 'object' && !updatedMetadata[key].title) {
                const sorted = {};
                Object.keys(updatedMetadata[key])
                    .sort((a, b) => {
                        const numA = parseInt(a);
                        const numB = parseInt(b);
                        if (isNaN(numA) || isNaN(numB)) return 0;
                        return numA - numB;
                    })
                    .forEach(subKey => {
                        sorted[subKey] = updatedMetadata[key][subKey];
                    });
                sortedMetadata[key] = sorted;
            } else {
                sortedMetadata[key] = updatedMetadata[key];
            }
        });
    
    // 5. 저장
    const metadataDir = path.join(__dirname, '..', 'metadata');
    if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir);
    }
    
    const outputPath = path.join(metadataDir, 'videos-metadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedMetadata, null, 2), 'utf8');
    
    console.log(`✅ videos-metadata.json 업데이트 완료!`);
    console.log(`   총 ${Object.keys(sortedMetadata).length}개 항목`);
    
    if (changes.length > 0) {
        console.log(`   변경사항 ${changes.length}개:`);
        changes.slice(0, 5).forEach(change => {
            console.log(`      - ${change}`);
        });
        if (changes.length > 5) {
            console.log(`      ... 외 ${changes.length - 5}개`);
        }
    } else {
        console.log(`   변경사항 없음`);
    }
}

console.log('🔍 YouTube 메타데이터 스마트 업데이트 중...\n');
console.log('💡 이 스크립트는:');
console.log('   - reels 폴더의 동영상 파일을 분석합니다');
console.log('   - 구조 변경을 자동 감지합니다');
console.log('   - 기존 title, duration을 최대한 보존합니다');
console.log('   - mp4, webm, mov, avi, mkv를 모두 지원합니다\n');

generateTemplate();

console.log('\n✨ 메타데이터 업데이트 완료!');
console.log('📁 metadata/ 폴더를 확인하세요.');