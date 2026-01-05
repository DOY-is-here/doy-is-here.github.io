// YouTube 데이터 관리

// 동영상 데이터
export const videos = [
    {
        id: 'video-1',
        title: 'NOMAD "LIGHTS ON" Performance Video',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(1).jpg',
        duration: '3:42',
        uploadDate: '1일 전',
        type: 'video'
    },
    {
        id: 'video-2',
        title: 'Behind The Scenes - NOMAD',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250923%20(1).jpg',
        duration: '5:21',
        uploadDate: '3일 전',
        type: 'video'
    },
    {
        id: 'video-3',
        title: 'NOMAD Dance Practice',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250914%20(1).jpg',
        duration: '4:15',
        uploadDate: '1주 전',
        type: 'video'
    },
    {
        id: 'video-4',
        title: 'NOMAD Concept Photo Shooting',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250823%20(1).jpg',
        duration: '2:58',
        uploadDate: '2주 전',
        type: 'video'
    },
    {
        id: 'video-5',
        title: 'NOMAD Interview',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250814%20(1).jpg',
        duration: '8:12',
        uploadDate: '3주 전',
        type: 'video'
    }
];

// Shorts 데이터 (videos와 동일한 구조)
export const shorts = [
    {
        id: 'short-1',
        title: 'NOMAD "LIGHTS ON" Performance Video',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(1).jpg',
        duration: '3:42',
        uploadDate: '1일 전',
        type: 'shorts'
    },
    {
        id: 'short-2',
        title: 'Behind The Scenes - NOMAD',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250923%20(2).jpg',
        duration: '5:21',
        uploadDate: '3일 전',
        type: 'shorts'
    },
    {
        id: 'short-3',
        title: 'NOMAD Dance Practice',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250914%20(2).jpg',
        duration: '4:15',
        uploadDate: '1주 전',
        type: 'shorts'
    },
    {
        id: 'short-4',
        title: 'NOMAD Concept Photo Shooting',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250823%20(1).jpg',
        duration: '2:58',
        uploadDate: '2주 전',
        type: 'shorts'
    },
    {
        id: 'short-5',
        title: 'NOMAD Interview',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250814%20(1).jpg',
        duration: '8:12',
        uploadDate: '3주 전',
        type: 'shorts'
    },
    {
        id: 'short-6',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250807%20(1).jpg',
        duration: '3:20',
        uploadDate: '1개월 전',
        type: 'shorts'
    },
    {
        id: 'short-7',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250726%20(1).jpg',
        duration: '2:45',
        uploadDate: '1개월 전',
        type: 'shorts'
    },
    {
        id: 'short-8',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250719%20(1).jpg',
        duration: '4:30',
        uploadDate: '2개월 전',
        type: 'shorts'
    },
    {
        id: 'short-9',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250709%20(1).jpg',
        duration: '3:15',
        uploadDate: '2개월 전',
        type: 'shorts'
    }
];

// 채널 정보
export const channelInfo = {
    name: 'NOMAD',
    handle: '@NOMAD_is_here',
    subscribers: '9.16만',
    videoCount: '150',
    description: 'NOMAD OFFICIAL YouTube Channel',
    banner: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(4).jpg'
};

// 탭별 데이터 가져오기
export function getContentByTab(tab) {
    switch(tab) {
        case 'home':
            return videos;
        case 'videos':
            return videos;
        case 'shorts':
            return shorts;
        case 'playlists':
            return [];
        case 'channels':
            return [];
        case 'about':
            return [];
        default:
            return videos;
    }
}