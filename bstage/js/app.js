// BST App - Tab Switching & Interactive Features
class BSTApp {
    constructor() {
        this.currentTab = 'home';
        this.previousView = null; 
        this.init();
    }

    init() {
        // 페이지 로드 시 초기화
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeTabSwitching();
            this.initializeImageCarousels();
            this.initializeHeaderScroll();
            this.initializeContentsThumbnails();
            
            // 초기 로드시 Home 탭 활성화
            const homeTab = document.querySelector('.nav-item[data-tab="home"]');
            const homeContent = document.querySelector('.tab-content[data-tab="home"]');
            if (homeTab && homeContent) {
                homeTab.classList.add('active');
                homeContent.classList.add('active');
            }
            
            // 새로고침 시 항상 Home 탭으로
            // this.switchTab('home');
            

            // 나중에 지우기
            const savedTab = sessionStorage.getItem('bst_currentTab');

            if (savedTab) {
            this.switchTab(savedTab);
            } else {
            this.switchTab('home');
            }
            //

        });
    }

    // 탭 전환 기능
    initializeTabSwitching() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = navItem.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // 모든 네비게이션 아이템에서 active 제거
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        // 모든 탭 콘텐츠 숨기기
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // 선택된 탭 활성화
        const activeNavItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
        const activeContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);

        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        if (activeContent) {
            activeContent.style.display = 'block';
            // 약간의 딜레이 후 active 클래스 추가 (애니메이션 효과)
            setTimeout(() => {
                activeContent.classList.add('active');
            }, 10);
        }

        // 현재 탭 저장
        this.currentTab = tabName;

        // 나중에 지우기
        sessionStorage.setItem('bst_currentTab', this.currentTab);
        sessionStorage.setItem('bst_previousView', this.previousView ?? '');
        //


        // 포스트 헤더 비활성화 (다른 탭으로 이동 시)
        this.deactivatePostHeader();

        // 헤더 상태 업데이트 (Home이 아니면 항상 scrolled)
        this.updateHeaderState(tabName);

        // 탭별 초기화 함수 실행
        this.initializeTabContent(tabName);

        // 스크롤 최상단으로
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 헤더 상태 업데이트
    updateHeaderState(tabName) {
        const header = document.querySelector('.header');
        if (!header) return;

        if (tabName === 'home') {
            // Home 탭: 스크롤에 따라 동적으로 변경
            header.classList.remove('fixed-scrolled');
            if (window.scrollY <= 50) {
                header.classList.remove('scrolled');
            }
        } else {
            // 다른 탭: 항상 scrolled 상태 고정
            header.classList.add('scrolled');
            header.classList.add('fixed-scrolled');
        }
    }

    // 탭별 콘텐츠 초기화
    initializeTabContent(tabName) {
        switch(tabName) {
            case 'home':
                this.initializeHome();
                break;
            case 'nomad':
                this.initializeNomad();
                break;
            case 'contents':
                this.initializeContents();
                break;
            case 'pop':
                this.initializePop();
                break;
        }
    }

    // 홈 탭 초기화
    initializeHome() {
        console.log('Home tab initialized');
        // 홈 탭 관련 추가 기능
    }

    // NOMAD 탭 초기화
    initializeNomad() {
        console.log('NOMAD tab initialized');
        // NOMAD 포스트 이미지 캐러셀 재초기화
        this.initializeImageCarousels();

        this.showNOMADTab();
    }

    // NOMAD 탭 메인 뷰 
    showNOMADTab() {
        if (this.currentTab !== 'nomad') {
            this.switchTab('nomad');
            return; 
        }


        const tabNOMAD = document.querySelector('.tab-content[data-tab="nomad"]');
        const NOMADPost = document.querySelector('.tab-content[data-tab="nomad-post"]');
        
        if (tabNOMAD) tabNOMAD.style.display = 'block';
        if (NOMADPost) NOMADPost.style.display = 'none';

        // 이전 뷰 저장 (메인으로 왔음)
        this.previousView = 'main';

        // 헤더 상태 유지 (nomad 탭이므로 항상 scrolled)
        this.updateHeaderState('nomad');

        // 포스트 헤더 비활성화
        this.deactivatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // NOMAD 탭 Post 뷰
    showNOMADPost(postId) {
        console.log('🔵 showNOMADPost 호출됨, postId:', postId);
        
        // 다른 탭에서 호출된 경우 직접 탭 전환 처리
        if (this.currentTab !== 'nomad') {
            console.log('⚠️ 다른 탭에서 호출됨 → 직접 처리');
            
            // 1. 모든 네비게이션 업데이트
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const nomadNav = document.querySelector('.nav-item[data-tab="nomad"]');
            if (nomadNav) nomadNav.classList.add('active');
            
            // 2. 모든 탭 콘텐츠 숨기기
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 3. 현재 탭 업데이트
            this.currentTab = 'nomad';
            this.previousView = 'main';
        }

        const tabNOMAD = document.querySelector('.tab-content[data-tab="nomad"]');
        const NOMADPost = document.querySelector('.tab-content[data-tab="nomad-post"]');
        
        // 현재 어느 뷰가 표시되고 있는지 확인하여 previousView 저장
        if (tabNOMAD && tabNOMAD.style.display === 'block') {
            this.previousView = 'main';
        }
        
        if (tabNOMAD) tabNOMAD.style.display = 'none';
        if (NOMADPost) {
            NOMADPost.style.display = 'block';
            // 포스트 ID 저장
            if (postId) NOMADPost.dataset.currentPost = postId;
        }

        // 헤더 상태 유지 (nomad 탭이므로 항상 scrolled)
        this.updateHeaderState('nomad');

        // 포스트 헤더 활성화
        this.activatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }



    // Contents 탭 초기화
    initializeContents() {
        console.log('Contents tab initialized');
        // Contents 썸네일 인터랙션 재초기화
        this.initializeContentsThumbnails();

        // 태그바 페이드
        this.initializeTagbarFade();
        
        // 기본적으로 tab-content만 표시
        this.showContentsTab();
    }

    // Contents 탭 메인 뷰 (.tab-content)
    showContentsTab() {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVIDEO = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'block';
        if (contentList) contentList.style.display = 'none';
        if (contentTag) contentTag.style.display = 'none';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVIDEO) contentVIDEO.style.display = 'none';
        
        // 헤더 상태 유지 (Contents 탭이므로 항상 scrolled)
        this.updateHeaderState('contents');

        // 포스트 헤더 비활성화
        this.deactivatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contents 리스트 뷰 (.content-list) - 전체보기
    showContentsList() {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');        
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVIDEO = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'block';
        if (contentTag) contentTag.style.display = 'none';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVIDEO) contentVIDEO.style.display = 'none';
        
        this.previousView = 'list'; //  이전 뷰 저장
        
        // 헤더 상태 유지 (Contents 탭이므로 항상 scrolled)
        this.updateHeaderState('contents');

        // 포스트 뷰 헤더 활성화
        this.activatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contents 리스트 뷰 (.content-list) - 전체보기
    showContentsTag() {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');        
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVIDEO = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        if (contentTag) contentTag.style.display = 'block';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVIDEO) contentVIDEO.style.display = 'none';
        
        this.previousView = 'tag'; //  이전 뷰 저장
        
        // 헤더 상태 유지 (Contents 탭이므로 항상 scrolled)
        this.updateHeaderState('contents');

        // 포스트 뷰 헤더 활성화
        this.activatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contents 포스트 이미지 상세 뷰 (.content-img)
    showContentsIMG(postId) {
        console.log('showContentsIMG 호출됨, postId:', postId);
        
        // 다른 탭에서 호출된 경우 직접 탭 전환 처리
        if (this.currentTab !== 'contents') {
            console.log('다른 탭에서 호출됨 → 직접 처리');
            
            // 1. 모든 네비게이션 업데이트
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const contentsNav = document.querySelector('.nav-item[data-tab="contents"]');
            if (contentsNav) contentsNav.classList.add('active');
            
            // 2. 모든 탭 콘텐츠 숨기기
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 3. 현재 탭 업데이트
            this.currentTab = 'contents';
            this.previousView = 'main';
        }

        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVIDEO = document.querySelector('.tab-content[data-tab="content-video"]');
        
        // 현재 뷰 확인
        if (contentList && contentList.style.display === 'block') {
            this.previousView = 'list';
        } else if (tabContent && tabContent.style.display === 'block') {
            this.previousView = 'main';
        }
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        if (contentTag) contentTag.style.display = 'none';
        if (contentVIDEO) contentVIDEO.style.display = 'none';
        if (contentIMG) {
            contentIMG.style.display = 'block';
            // 포스트 ID 저장
            if (postId) contentIMG.dataset.currentPost = postId;
        }
        
        // 헤더 상태 유지 (Contents 탭이므로 항상 scrolled)
        this.updateHeaderState('contents');

        // 포스트 뷰 헤더 활성화
        this.activatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contents 포스트 비디오 상세 뷰 (.content-viedo)
    showContentsVIDEO(postId) {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVIDEO = document.querySelector('.tab-content[data-tab="content-video"]');
        
        // 현재 뷰 확인
        if (contentList && contentList.style.display === 'block') {
            this.previousView = 'list';
        } else if (tabContent && tabContent.style.display === 'block') {
            this.previousView = 'main';
        }
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        if (contentTag) contentTag.style.display = 'none';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVIDEO) {
            contentVIDEO.style.display = 'block';
            // 포스트 ID 저장
            if (postId) contentVIDEO.dataset.currentPost = postId;
        }
        
        // 헤더 상태 유지 (Contents 탭이므로 항상 scrolled)
        this.updateHeaderState('contents');

        // 포스트 뷰 헤더 활성화
        this.activatePostHeader();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 포스트 헤더 활성화
    activatePostHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        header.classList.add('post-view');
        
        // 메뉴 버튼 클릭 이벤트 변경 (뒤로가기)
        const menuBtn = document.querySelector('.header-menu');
        if (menuBtn) {
            menuBtn.onclick = () => {
                const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
                
                // 리스트 뷰에서 뒤로가기 → 메인으로
                if (contentList && contentList.style.display === 'block') {
                    this.showContentsTab();
                } else {
                    // 포스트 뷰에서 뒤로가기 → 이전 뷰로
                    if (this.currentTab === 'nomad') {
                        this.showNOMADTab(); // NOMAD 포스트 → 메인
                    } else if (this.currentTab === 'contents') {
                        if (this.previousView === 'list') {
                            this.showContentsList();
                        } else {
                            this.showContentsTab();
                        }
                    }
                }
            };
        }
        
        // 프로필 버튼 클릭 이벤트 변경 (홈으로)
        const profileBtn = document.querySelector('.header-logo');
        if (profileBtn) {
            profileBtn.onclick = () => {
                this.switchTab('home');
                this.deactivatePostHeader();
            };
        }
    }

    // 포스트 헤더 비활성화
    deactivatePostHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        header.classList.remove('post-view');
        
        // 메뉴 버튼 클릭 이벤트 제거
        const menuBtn = document.querySelector('.header-menu');
        if (menuBtn) {
            menuBtn.onclick = null;
        }
        
        // 프로필 버튼 클릭 이벤트 제거
        const profileBtn = document.querySelector('.header-logo');
        if (profileBtn) {
            profileBtn.onclick = null;
        }
    }

    // POP 탭 초기화
    initializePop() {
        console.log('POP tab initialized');
        // POP 관련 추가 기능
    }

    // 이미지 캐러셀 (NOMAD 포스트)
    initializeImageCarousels() {
        const postImages = document.querySelectorAll('.post-images');
        
        postImages.forEach(container => {
            const images = container.querySelectorAll('img');
            if (images.length <= 1) return;

            const indicators = container.nextElementSibling;
            if (!indicators || !indicators.classList.contains('post-indicators')) return;

            const dots = indicators.querySelectorAll('.indicator');
            let currentIndex = 0;

            // 스크롤 이벤트
            container.addEventListener('scroll', () => {
                const scrollLeft = container.scrollLeft;
                const imageWidth = images[0].offsetWidth;
                const newIndex = Math.round(scrollLeft / imageWidth);
                
                if (newIndex !== currentIndex && newIndex < dots.length) {
                    dots[currentIndex]?.classList.remove('active');
                    currentIndex = newIndex;
                    dots[currentIndex]?.classList.add('active');
                }
            });

            // 터치/클릭으로 이미지 전환
            images.forEach((img, index) => {
                img.addEventListener('click', () => {
                    const nextIndex = (index + 1) % images.length;
                    container.scrollTo({
                        left: nextIndex * images[0].offsetWidth,
                        behavior: 'smooth'
                    });
                });
            });
        });
    }

    // 헤더 스크롤 효과
    initializeHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            // Home 탭이 아니면 스크롤 이벤트 무시
            if (this.currentTab !== 'home') return;
            
            // Home 탭에서만 스크롤에 따라 헤더 변경
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Contents 썸네일 자동 재생
    initializeContentsThumbnails() {
        const thumbnailContainers = document.querySelectorAll('.contents-thumbnails');
        
        thumbnailContainers.forEach(container => {
            const thumbnails = container.querySelectorAll('img');
            if (thumbnails.length <= 1) return;
            
            let currentIndex = 0;
            
            // 첫 번째 썸네일에 active 추가
            thumbnails[0].classList.add('active');
            
            // 자동 재생 (3초마다)
            setInterval(() => {
                // 현재 썸네일에서 active 제거
                thumbnails[currentIndex].classList.remove('active');
                
                // 다음 썸네일로 이동
                currentIndex = (currentIndex + 1) % thumbnails.length;
                
                // 새 썸네일에 active 추가 (내부 테두리 표시)
                thumbnails[currentIndex].classList.add('active');
            }, 3000);
        });
    }

    // 태그 필터링 (Contents 탭)
    initializeTagFiltering() {
        const tagButtons = document.querySelectorAll('.tag-btn');
        const contentCards = document.querySelectorAll('.content-card');

        tagButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tag = button.textContent.trim();
                
                // 버튼 active 상태 토글
                button.classList.toggle('active');

                // 필터링 로직 (실제 태그 데이터가 있다면)
                contentCards.forEach(card => {
                    // 예: card.dataset.tags에 태그 정보가 있다고 가정
                    // if (card.dataset.tags.includes(tag)) {
                    //     card.style.display = 'block';
                    // } else {
                    //     card.style.display = 'none';
                    // }
                });
            });
        });
    }

    // 공유 버튼 (Home 탭)
    initializeShareButton() {
        const shareButton = document.querySelector('.home-share-btn');
        
        if (shareButton) {
            shareButton.addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'BST NOMAD',
                            text: 'Check out BST NOMAD!',
                            url: window.location.href
                        });
                    } catch (err) {
                        console.log('Share cancelled or failed:', err);
                    }
                } else {
                    // Fallback: 클립보드에 URL 복사
                    navigator.clipboard.writeText(window.location.href);
                    alert('링크가 클립보드에 복사되었습니다!');
                }
            });
        }
    }

    // 더보기 버튼
    initializeMoreButtons() {
        const moreButtons = document.querySelectorAll('.section-header button');
        
        moreButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.closest('.contents-section, .home-section');
                const grid = section?.querySelector('.contents-grid, .home-grid');
                
                if (grid) {
                    grid.classList.toggle('expanded');
                    button.textContent = grid.classList.contains('expanded') ? '접기' : '더보기';
                }
            });
        });
    }

    // 더보기 카드 표시 (숨겨진 카드 보이기)
    showMoreCards(button) {
        const grid = button.closest('.home-grid');
        const hiddenCards = grid.querySelectorAll('.home-card-contnets.hidden');
    
        // 숨겨진 카드 모두 보이기
        hiddenCards.forEach(card => {
            card.classList.remove('hidden');
        });
    
        // 더보기 버튼 숨기기
        button.closest('.home-card-contnets').style.display = 'none';
    }


    // 태그바 페이드
    initializeTagbarFade() {
        const tagbar = document.querySelector('.contents-tagbar');
        const wrap = document.querySelector('.contents-tagbar-wrap');

        if (!tagbar || !wrap) return;

        function updateFade() {
            const maxScroll = tagbar.scrollWidth - tagbar.clientWidth;

            wrap.classList.toggle('fade-left', tagbar.scrollLeft > 4);
            wrap.classList.toggle('fade-right', tagbar.scrollLeft < maxScroll - 4);
        }

        tagbar.addEventListener('scroll', updateFade);
        updateFade();
    }


}

// 앱 인스턴스 생성
const app = new BSTApp();

// 전역 함수로 노출 (필요시)
window.BSTApp = app;