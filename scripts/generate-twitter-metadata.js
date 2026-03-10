const fs = require('fs');
const path = require('path');

// 날짜 파싱 함수
function parseDate(filename) {
    const match = filename.match(/^(\d{6})(-\d+)?/);
    if (!match) return null;
    
    return {
        rawDate: match[1],
        tweetNum: match[2] ? parseInt(match[2].substring(1)) : null
    };
}

// 기존 metadata 로드
function loadExistingMetadata(filename) {
    const metadataPath = path.join(__dirname, '..', 'metadata', filename);
    
    if (fs.existsSync(metadataPath)) {
        try {
            const content = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️ 기존 ${filename} 읽기 실패:`, error.message);
            return {};
        }
    }
    
    return {};
}

// 실제 파일 구조 분석 (특정 폴더만)
function analyzeFileStructure(folderName) {
    const structure = {};
    const folderPath = path.join(__dirname, '..', folderName);
    
    if (!fs.existsSync(folderPath)) {
        console.log(`   ⚠️ 폴더가 존재하지 않습니다: ${folderPath}`);
        return structure;
    }
    
    const items = fs.readdirSync(folderPath);
    console.log(`   📂 ${folderName}: ${items.length}개 항목 발견`);
    
    let processedCount = 0;
    
    for (const item of items) {
        const stat = fs.statSync(path.join(folderPath, item));
        
        if (stat.isFile() && /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(item)) {
            const filenameWithoutExt = item.replace(/\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i, '');
            const dateInfo = parseDate(filenameWithoutExt);
            
            if (dateInfo) {
                const { rawDate, tweetNum } = dateInfo;
                
                if (!structure[rawDate]) {
                    structure[rawDate] = {
                        hasMultiple: false,
                        tweetNums: []
                    };
                }
                
                if (tweetNum !== null) {
                    structure[rawDate].hasMultiple = true;
                    if (!structure[rawDate].tweetNums.includes(tweetNum)) {
                        structure[rawDate].tweetNums.push(tweetNum);
                    }
                } else {
                    structure[rawDate].hasSingle = true;
                }
                
                processedCount++;
                
                if (processedCount <= 5) {
                    console.log(`   📄 파일: ${item} → ${rawDate}${tweetNum ? '-'+tweetNum : ''}`);
                }
            }
        }
    }
    
    if (processedCount > 5) {
        console.log(`   ... 외 ${processedCount - 5}개 처리됨`);
    }
    
    return structure;
}

// 메타데이터 구조 업데이트
function updateMetadataStructure(existingMetadata, fileStructure) {
    const updatedMetadata = {};
    const changes = [];
    
    console.log(`   🔄 메타데이터 업데이트 시작...`);
    console.log(`      기존: ${Object.keys(existingMetadata).length}개`);
    console.log(`      파일: ${Object.keys(fileStructure).length}개`);
    
    for (const [rawDate, structure] of Object.entries(fileStructure)) {
        const existing = existingMetadata[rawDate];
        
        // Case 1: 다중 tweetNum 구조 필요
        if (structure.hasMultiple) {
            if (existing && typeof existing === 'object' && existing.text !== undefined) {
                // 단일 → 다중 변환
                console.log(`   🔄 ${rawDate}: 단일 → 다중 (텍스트 보존)`);
                changes.push(`${rawDate}: 단일 → 다중`);
                
                if (!updatedMetadata[rawDate]) {
                    updatedMetadata[rawDate] = {};
                }
                
                structure.tweetNums.sort((a, b) => a - b);
                
                structure.tweetNums.forEach((num, index) => {
                    if (index === 0 && existing.text) {
                        updatedMetadata[rawDate][num] = existing;
                    } else if (existing && existing[num]) {
                        updatedMetadata[rawDate][num] = existing[num];
                    } else {
                        updatedMetadata[rawDate][num] = { text: '' };
                    }
                });
            } else if (existing && typeof existing === 'object' && !existing.text) {
                // 이미 다중 구조
                if (!updatedMetadata[rawDate]) {
                    updatedMetadata[rawDate] = {};
                }
                
                structure.tweetNums.sort((a, b) => a - b);
                
                structure.tweetNums.forEach(num => {
                    if (existing[num]) {
                        updatedMetadata[rawDate][num] = existing[num];
                    } else {
                        updatedMetadata[rawDate][num] = { text: '' };
                        changes.push(`${rawDate}-${num}: 새로 추가`);
                    }
                });
            } else {
                // 새로 생성
                updatedMetadata[rawDate] = {};
                structure.tweetNums.sort((a, b) => a - b);
                
                structure.tweetNums.forEach(num => {
                    updatedMetadata[rawDate][num] = { text: '' };
                });
                changes.push(`${rawDate}: 새로 추가 (다중)`);
            }
        }
        // Case 2: 단일 구조 필요
        else if (structure.hasSingle) {
            if (existing && typeof existing === 'object' && !existing.text) {
                // 다중 → 단일 변환
                console.log(`   🔄 ${rawDate}: 다중 → 단일 (텍스트 보존)`);
                changes.push(`${rawDate}: 다중 → 단일`);
                
                const firstTweetNum = Object.keys(existing).sort()[0];
                updatedMetadata[rawDate] = existing[firstTweetNum] || { text: '' };
            } else if (existing && existing.text !== undefined) {
                // 이미 단일 구조
                updatedMetadata[rawDate] = existing;
            } else {
                // 새로 생성
                updatedMetadata[rawDate] = { text: '' };
                changes.push(`${rawDate}: 새로 추가 (단일)`);
            }
        }
    }

    // ✅ 파일이 없어도 text가 있는 기존 항목 보존 (텍스트 전용 트윗)
    for (const [rawDate, existing] of Object.entries(existingMetadata)) {
        if (updatedMetadata[rawDate]) continue; // 이미 처리된 날짜는 스킵

        // 단일 구조에 text가 있는 경우
        if (typeof existing === 'object' && existing.text !== undefined && existing.text !== '') {
            updatedMetadata[rawDate] = existing;
            console.log(`   💾 텍스트 전용 항목 보존: ${rawDate}`);
        }
        // 다중 구조에 text가 있는 경우
        else if (typeof existing === 'object' && !existing.text) {
            const hasText = Object.values(existing).some(v => v.text && v.text !== '');
            if (hasText) {
                updatedMetadata[rawDate] = existing;
                console.log(`   💾 텍스트 전용 항목 보존 (다중): ${rawDate}`);
            }
        }
    }

    console.log(`   ✅ 업데이트 완료: ${Object.keys(updatedMetadata).length}개`);
    
    return { updatedMetadata, changes };
}

// 메타데이터 저장
function saveMetadata(metadata, filename) {
    // 정렬
    const sortedMetadata = {};
    Object.keys(metadata)
        .sort((a, b) => b.localeCompare(a))
        .forEach(key => {
            if (typeof metadata[key] === 'object' && !metadata[key].text) {
                const sorted = {};
                Object.keys(metadata[key])
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .forEach(subKey => {
                        sorted[subKey] = metadata[key][subKey];
                    });
                sortedMetadata[key] = sorted;
            } else {
                sortedMetadata[key] = metadata[key];
            }
        });
    
    // 저장
    const metadataDir = path.join(__dirname, '..', 'metadata');
    if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir);
        console.log(`   📁 metadata 폴더 생성`);
    }
    
    const outputPath = path.join(metadataDir, filename);
    const jsonContent = JSON.stringify(sortedMetadata, null, 2);
    
    console.log(`   💾 저장 중: ${filename}`);
    console.log(`   📊 파일 크기: ${(jsonContent.length / 1024).toFixed(2)} KB`);
    
    fs.writeFileSync(outputPath, jsonContent, 'utf8');
    
    // 저장 확인
    if (fs.existsSync(outputPath)) {
        const savedContent = fs.readFileSync(outputPath, 'utf8');
        const savedData = JSON.parse(savedContent);
        console.log(`   ✅ 저장 확인: ${Object.keys(savedData).length}개 항목`);
    } else {
        console.log(`   ❌ 저장 실패!`);
    }
    
    return sortedMetadata;
}

// 메인 실행
function main() {
    console.log('🦋 트위터 메타데이터 업데이트 중...\n');
    
    const folders = [
        { name: 'x-group', metadataFile: 'twitter-group-metadata.json' },
        { name: 'x-photo', metadataFile: 'twitter-photo-metadata.json' }
    ];
    
    folders.forEach(({ name, metadataFile }) => {
        console.log(`\n📦 ${name} 처리 중...`);
        
        // 1. 기존 메타데이터 로드
        const existingMetadata = loadExistingMetadata(metadataFile);
        console.log(`   기존 메타데이터: ${Object.keys(existingMetadata).length}개 항목`);
        
        // 2. 실제 파일 구조 분석
        const fileStructure = analyzeFileStructure(name);
        console.log(`   📊 분석 완료: ${Object.keys(fileStructure).length}개 날짜`);
        
        // 3. 메타데이터 구조 업데이트
        const { updatedMetadata, changes } = updateMetadataStructure(existingMetadata, fileStructure);
        
        // 4. 저장
        const savedMetadata = saveMetadata(updatedMetadata, metadataFile);
        
        console.log(`\n✅ ${metadataFile} 업데이트 완료!`);
        console.log(`   총 ${Object.keys(savedMetadata).length}개 항목`);
        
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
    });
    
    console.log('\n\n✨ 모든 메타데이터 업데이트 완료!');
}

main();