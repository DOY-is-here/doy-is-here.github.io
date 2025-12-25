// 트윗 데이터 (자동 생성됨)

export const tweets = [
    {
        "id": "tweet-251205-2",
        "author": {
            "name": "NOMAD",
            "username": "NOMAD_is_here",
            "verified": true
        },
        "date": "2025-12-05T12:00:00Z",
        "text": "[#원]\n출지 않게 따뜻하게 입기!\n오늘 하루도 고생했고 미리 꽃잠~🌸🐼\n\n#NOMAD #노매드\n#ONE #원",
        "images": [],
        "replies": 10,
        "retweets": 31,
        "likes": 92,
        "views": 2073,
        "rawDate": "251205",
        "tweetNum": 2
    },
    {
        "id": "tweet-251205-2",
        "author": {
            "name": "NOMAD",
            "username": "NOMAD_is_here",
            "verified": true
        },
        "date": "2025-12-05T12:00:00Z",
        "text": "[#원]\n출지 않게 따뜻하게 입기!\n오늘 하루도 고생했고 미리 꽃잠~🌸🐼\n\n#NOMAD #노매드\n#ONE #원",
        "images": [],
        "replies": 10,
        "retweets": 31,
        "likes": 92,
        "views": 2073,
        "rawDate": "251205",
        "tweetNum": 2
    },
    {
        "id": "tweet-251205-2",
        "author": {
            "name": "NOMAD",
            "username": "NOMAD_is_here",
            "verified": true
        },
        "date": "2025-12-05T12:00:00Z",
        "text": "[#원]\n출지 않게 따뜻하게 입기!\n오늘 하루도 고생했고 미리 꽃잠~🌸🐼\n\n#NOMAD #노매드\n#ONE #원",
        "images": [],
        "replies": 10,
        "retweets": 31,
        "likes": 92,
        "views": 2073,
        "rawDate": "251205",
        "tweetNum": 2
    },
    {
        "id": "tweet-251205-1",
        "author": {
            "name": "NOMAD",
            "username": "NOMAD_is_here",
            "verified": true
        },
        "date": "2025-12-05T12:00:00Z",
        "text": "[📢 알림] 잠시 후 5시 45분 #니다김지_원 팬선파티가 진행됩니다.\n\n✅ 필수 해시태그 : #니다김지_원\n\n본 글에 필수 해시태그와 함께 멘션을 보내주세요!\n\n#NOMAD #노매드",
        "images": [],
        "replies": 52,
        "retweets": 10,
        "likes": 63,
        "views": 4046,
        "rawDate": "251205",
        "tweetNum": 1
    },
    {
        "id": "tweet-251105",
        "author": {
            "name": "NOMAD",
            "username": "NOMAD_is_here",
            "verified": true
        },
        "date": "2025-11-05T12:00:00Z",
        "text": "[#상하]\n베이스 좋은 하루 보내고 있어~? 🤔\n\n#NOMAD #노매드\n#SANGHA #상하",
        "images": [
            "https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/twitter-media/251105.jpg",
            "https://raw.githubusercontent.com/DOY-is-here/doy-is-here.github.io/main/twitter-media/251105%20(1).jpg"
        ],
        "replies": 10,
        "retweets": 57,
        "likes": 284,
        "views": 7554,
        "rawDate": "251105",
        "tweetNum": null
    }
    
];

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