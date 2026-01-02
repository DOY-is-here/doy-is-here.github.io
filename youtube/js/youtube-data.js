// YouTube 데이터 관리

// 동영상 데이터
export const videos = [
    {
        id: 'video-1',
        title: 'NOMAD "LIGHTS ON" Performance Video',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(1).jpg',
        duration: '3:42',
        views: '1.2만',
        uploadDate: '1일 전',
        type: 'video'
    },
    {
        id: 'video-2',
        title: 'Behind The Scenes - NOMAD',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250923%20(1).jpg',
        duration: '5:21',
        views: '8,432',
        uploadDate: '3일 전',
        type: 'video'
    },
    {
        id: 'video-3',
        title: 'NOMAD Dance Practice',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250914%20(1).jpg',
        duration: '4:15',
        views: '15.3만',
        uploadDate: '1주 전',
        type: 'video'
    }
];

// Shorts 데이터
export const shorts = [
    {
        id: 'short-1',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250930%20(1).jpg',
        views: '1.2만',
        type: 'shorts'
    },
    {
        id: 'short-2',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250923%20(2).jpg',
        views: '8.5만',
        type: 'shorts'
    },
    {
        id: 'short-3',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250914%20(2).jpg',
        views: '15.3만',
        type: 'shorts'
    },
    {
        id: 'short-4',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250823%20(1).jpg',
        views: '23.1만',
        type: 'shorts'
    },
    {
        id: 'short-5',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250814%20(1).jpg',
        views: '9.7만',
        type: 'shorts'
    },
    {
        id: 'short-6',
        thumbnail: 'https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/insta-photo/250807%20(1).jpg',
        views: '12.4만',
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
