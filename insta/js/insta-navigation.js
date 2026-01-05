// 포스트 상세 양방향 스크롤 모듈
import { renderPostDetail, initPostSlider } from './insta-post.js';

// 양방향 스크롤 초기화
export function initBidirectionalScroll(currentIndex, posts, savedTab) {
    const wrapper = document.querySelector('.post-detail-wrapper');
    if (!wrapper) return;
    
    let isLoading = false;
    let topIndex = Math.max(0, currentIndex - 3);
    let bottomIndex = Math.min(posts.length, currentIndex + 3);
    
    wrapper.addEventListener('scroll', () => {
        const scrollTop = wrapper.scrollTop;
        const scrollHeight = wrapper.scrollHeight;
        const clientHeight = wrapper.clientHeight;
        
        if (scrollTop < 200 && !isLoading && topIndex > 0) {
            isLoading = true;
            topIndex--;
            const prevPost = posts[topIndex];
            const oldScrollHeight = wrapper.scrollHeight;
            
            wrapper.insertAdjacentHTML('afterbegin', renderPostDetail(prevPost, savedTab));
            initPostSlider(prevPost);
            
            setTimeout(() => {
                wrapper.scrollTop = scrollTop + (wrapper.scrollHeight - oldScrollHeight);
                isLoading = false;
            }, 50);
        }
        
        if (scrollTop + clientHeight >= scrollHeight - 200 && !isLoading && bottomIndex < posts.length) {
            isLoading = true;
            const nextPost = posts[bottomIndex];
            bottomIndex++;
            
            wrapper.insertAdjacentHTML('beforeend', renderPostDetail(nextPost, savedTab));
            initPostSlider(nextPost);
            
            setTimeout(() => { isLoading = false; }, 500);
        }
    });
}
