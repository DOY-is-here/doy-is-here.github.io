// 게시물 데이터
export const posts = [
    {
        id: "251013-3",
        date: "2025-10-13",
        displayDate: "10월 13일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251013-3.jpg"
        ],
        caption: "세 번째 게시물입니다",
        type: "photo"
    },
    {
        id: "251013-2",
        date: "2025-10-13",
        displayDate: "10월 13일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251013-2.jpg"
        ],
        caption: "두 번째 게시물입니다",
        type: "reel"
    },
    {
        id: "251013-1",
        date: "2025-10-13",
        displayDate: "10월 13일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251013-1-1.jpg",
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251013-1-2.jpg",
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251013-1-3.jpg"
        ],
        caption: "첫 번째 게시물 (사진 3장)",
        type: "photo"
    },
    {
        id: "251012-2",
        date: "2025-10-12",
        displayDate: "10월 12일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251012-2.jpg"
        ],
        caption: "10월 12일 두 번째",
        type: "reel"
    },
    {
        id: "251012-1",
        date: "2025-10-12",
        displayDate: "10월 12일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251012-1-1.jpg",
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251012-1-2.jpg"
        ],
        caption: "10월 12일 첫 번째 (사진 2장)",
        type: "photo"
    },
    {
        id: "251011-2",
        date: "2025-10-11",
        displayDate: "10월 11일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251011-2.jpg"
        ],
        caption: "10월 11일 두 번째",
        type: "reel"
    },
    {
        id: "251011-1",
        date: "2025-10-11",
        displayDate: "10월 11일",
        username: "doy.is.here",
        images: [
            "https://raw.githubusercontent.com/your-username/your-repo/main/images/251011-1.jpg"
        ],
        caption: "10월 11일 첫 번째",
        type: "photo"
    }
];

// 게시물 개수 계산
export function getPostCount() {
    return posts.length;
}

// 타입별 게시물 필터링
export function getPostsByType(type) {
    if (type === "all") return posts;
    return posts.filter(post => post.type === type);
}

// 릴스만 가져오기
export function getReels() {
    return posts.filter(post => post.type === "reel");
}

// 일반 게시물만 가져오기
export function getPhotos() {
    return posts.filter(post => post.type === "photo");
}

// ID로 게시물 찾기
export function getPostById(id) {
    return posts.find(post => post.id === id);
}

// 다음 게시물 가져오기
export function getNextPost(currentId) {
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex === -1 || currentIndex === posts.length - 1) return null;
    return posts[currentIndex + 1];
}

// 이전 게시물 가져오기
export function getPrevPost(currentId) {
    const currentIndex = posts.findIndex(post => post.id === currentId);
    if (currentIndex <= 0) return null;
    return posts[currentIndex - 1];
}
