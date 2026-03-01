// 트윗 데이터 통합 파일
import { groups } from './data/group/group.js';
import { photos } from './data/photo/photo.js';

// 모든 트윗 합치기
export const tweets = [...groups, ...photos];

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
            return photos; // photo만
        case 'photos':
            return tweets.filter(t => t.images && t.images.length > 0);
        default:
            return tweets;
    }
}
