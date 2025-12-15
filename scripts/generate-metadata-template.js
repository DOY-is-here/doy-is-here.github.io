const fs = require('fs');
const path = require('path');

// 날짜 파싱 함수
function parseDate(filename) {
    const match = filename.match(/^(\d{6})(-\d+)?/);
    if (!match) return null;
    
    return {
        rawDate: match[1],
        postNum: match[2] ? parseInt(match[2].substring(1)) : null
    };
}

// 기존 metadata 로드
function loadExistingMetadata(type) {
    const metadataPath = path.join(__dirname, '..', 'metadata', `${type}-metadata.json`);
    
    if (fs.existsSync(metadataPath)) {
        try {
            const content = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️  기존 ${type}-metadata.json 읽기 실패:`, error.message);
            return {};
        }
    }
    
    return {};
}

// 템플릿 생성 함수 (병합 방식)
function generateTemplate(type) {
    const folderPath = path.join(__dirname, '..', `insta-${type}`);
    
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ ${folderPath} 폴더가 없습니다.`);
        return;
    }
    
    const existingMetadata = loadExistingMetadata(type);
    console.log(`📂 기존 ${type}-metadata.json 로드: ${Object.keys(existingMetadata).length}개 항목`);
    
    const items = fs.readdirSync(folderPath);
    const newDates = [];
    
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);
        
        let dateInfo;
        
        if (stat.isDirectory()) {
            dateInfo = parseDate(item);
        } else if (stat.isFile() && /\.(jpg|jpeg|png|gif|mp4|webp)$/i.test(item)) {
            const filenameWithoutExt = item.replace(/\.(jpg|jpeg|png|gif|mp4|webp)$/i, '');
            dateInfo = parseDate(filenameWithoutExt);
        }
        
        if (dateInfo) {
            const { rawDate, postNum } = dateInfo;
            
            if (postNum !== null) {
                if (!existingMetadata[rawDate]) {
                    existingMetadata[rawDate] = {};
                }
                
                if (!existingMetadata[rawDate][postNum]) {
                    existingMetadata[rawDate][postNum] = { caption: "" };
                    newDates.push(`${rawDate}-${postNum}`);
                }
            } else {
                if (!existingMetadata[rawDate]) {
                    existingMetadata[rawDate] = { caption: "" };
                    newDates.push(rawDate);
                } else if (typeof existingMetadata[rawDate] === 'object' && 
                          !existingMetadata[rawDate].caption && 
                          Object.keys(existingMetadata[rawDate]).length === 0) {
                    existingMetadata[rawDate] = { caption: "" };
                    newDates.push(rawDate);
                }
            }
        }
    }
    
    const sortedMetadata = {};
    Object.keys(existingMetadata)
        .sort((a, b) => b.localeCompare(a))
        .forEach(key => {
            if (typeof existingMetadata[key] === 'object' && !existingMetadata[key].caption) {
                const sorted = {};
                Object.keys(existingMetadata[key])
                    .sort((a, b) => {
                        const numA = parseInt(a);
                        const numB = parseInt(b);
                        if (isNaN(numA) || isNaN(numB)) return 0;
                        return numB - numA;
                    })
                    .forEach(subKey => {
                        sorted[subKey] = existingMetadata[key][subKey];
                    });
                sortedMetadata[key] = sorted;
            } else {
                sortedMetadata[key] = existingMetadata[key];
            }
        });
    
    const metadataDir = path.join(__dirname, '..', 'metadata');
    if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir);
    }
    
    const outputPath = path.join(metadataDir, `${type}-metadata.json`);
    fs.writeFileSync(outputPath, JSON.stringify(sortedMetadata, null, 2), 'utf8');
    
    const totalCount = Object.keys(sortedMetadata).length;
    const newCount = newDates.length;
    
    console.log(`✅ ${type}-metadata.json 업데이트 완료!`);
    console.log(`   총 ${totalCount}개 항목 (신규 ${newCount}개 추가)`);
    
    if (newCount > 0) {
        console.log(`   새로 추가된 날짜: ${newDates.slice(0, 5).join(', ')}${newCount > 5 ? '...' : ''}`);
    }
}

console.log('📝 메타데이터 템플릿 생성/업데이트 중...\n');

generateTemplate('photo');
generateTemplate('group');
generateTemplate('story');

console.log('\n✨ 모든 템플릿 업데이트 완료!');
console.log('📁 metadata/ 폴더를 확인하세요.');
console.log('\n💡 기존 caption은 그대로 유지되고, 새로운 날짜만 추가되었습니다.');