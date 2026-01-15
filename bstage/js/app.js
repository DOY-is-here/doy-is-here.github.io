import NomadRenderer from './nomad-renderer.js';
import ContentsRenderer from './contents-renderer.js';

// BST App - Tab Switching & Interactive Features
class BSTApp {
    constructor() {
        this.currentTab = 'home';
        this.previousView = null;
        this.nomadRenderer = new NomadRenderer('https://doy-is-here.github.io/');
        this.contentsRenderer = new ContentsRenderer('https://doy-is-here.github.io/');
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            // 데이터 로드
            await Promise.all([
                this.nomadRenderer.loadPosts('data/nomad-posts.json'),
                this.contentsRenderer.loadPosts('data/contents-posts.json')
            ]);
            
            this.initializeTabSwitching();
            this.initializeImageCarousels();
            this.initializeHeaderScroll();
            this.initializeContentsThumbnails();
            
            const homeTab = document.querySelector('.nav-item[data-tab="home"]');
            const homeContent = document.querySelector('.tab-content[data-tab="home"]');
            if (homeTab && homeContent) {
                homeTab.classList.add('active');
                homeContent.classList.add('active');
            }

            const savedTab = sessionStorage.getItem('bst_currentTab');
            if (savedTab) {
                this.switchTab(savedTab);
            } else {
                this.switchTab('home');
            }
        });
    }

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
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        const activeNavItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
        const activeContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);

        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        if (activeContent) {
            activeContent.style.display = 'block';
            setTimeout(() => {
                activeContent.classList.add('active');
            }, 10);
        }

        this.currentTab = tabName;
        sessionStorage.setItem('bst_currentTab', this.currentTab);
        sessionStorage.setItem('bst_previousView', this.previousView ?? '');

        this.deactivatePostHeader();
        this.updateHeaderState(tabName);
        this.initializeTabContent(tabName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeaderState(tabName) {
        const header = document.querySelector('.header');
        if (!header) return;

        if (tabName === 'home') {
            header.classList.remove('fixed-scrolled');
            if (window.scrollY <= 50) {
                header.classList.remove('scrolled');
            }
        } else {
            header.classList.add('scrolled');
            header.classList.add('fixed-scrolled');
        }
    }

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

    // ========== HOME 탭 ==========
    initializeHome() {
        console.log('Home tab initialized');
        
        // NOMAD 섹션 미리보기
        if (this.nomadRenderer.posts.length > 0) {
            this.nomadRenderer.renderHomePreview('.tab-content[data-tab="home"] .home-section:nth-of-type(1) .home-grid');
        }
        
        // Contents 섹션 미리보기
        if (this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderHomePreview('.tab-content[data-tab="home"] .home-section:nth-of-type(2) .home-grid');
        }
    }

    // ========== NOMAD 탭 ==========
    initializeNomad() {
        console.log('NOMAD tab initialized');
        
        if (this.nomadRenderer.posts.length > 0) {
            this.nomadRenderer.renderFeed();
        }
        
        this.showNOMADTab();
    }

    showNOMADTab() {
        if (this.currentTab !== 'nomad') {
            this.switchTab('nomad');
            return;
        }

        const tabNOMAD = document.querySelector('.tab-content[data-tab="nomad"]');
        const NOMADPost = document.querySelector('.tab-content[data-tab="nomad-post"]');
        
        if (tabNOMAD) tabNOMAD.style.display = 'block';
        if (NOMADPost) NOMADPost.style.display = 'none';

        this.previousView = 'main';
        this.updateHeaderState('nomad');
        this.deactivatePostHeader();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showNOMADPost(postId) {
        console.log('🔵 showNOMADPost:', postId);
        
        if (this.currentTab !== 'nomad') {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const nomadNav = document.querySelector('.nav-item[data-tab="nomad"]');
            if (nomadNav) nomadNav.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            this.currentTab = 'nomad';
            this.previousView = 'main';
        }

        const tabNOMAD = document.querySelector('.tab-content[data-tab="nomad"]');
        const NOMADPost = document.querySelector('.tab-content[data-tab="nomad-post"]');
        
        if (tabNOMAD && tabNOMAD.style.display === 'block') {
            this.previousView = 'main';
        }
        
        if (tabNOMAD) tabNOMAD.style.display = 'none';
        
        if (NOMADPost && postId) {
            const post = this.nomadRenderer.getPostById(postId);
            if (post) {
                NOMADPost.innerHTML = this.nomadRenderer.renderDetailPost(post);
            }
            NOMADPost.style.display = 'block';
            this.initializeImageCarousels();
            NOMADPost.dataset.currentPost = postId;
        }

        this.updateHeaderState('nomad');
        this.activatePostHeader();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========== CONTENTS 탭 ==========
    initializeContents() {
        console.log('Contents tab initialized');
        
        // 히어로 섹션 렌더링
        if (this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderHero('.contents-hero');
            // 카테고리별 섹션들 렌더링
            this.contentsRenderer.renderAllSections('.contents-sections-container');
        }
        
        this.initializeContentsThumbnails();
        this.initializeTagbarFade();
        this.showContentsTab();
    }

    showContentsTab() {
        const views = [
            '.tab-content[data-tab="contents"]',
            '.tab-content[data-tab="content-list"]',
            '.tab-content[data-tab="content-tag"]',
            '.tab-content[data-tab="content-img"]',
            '.tab-content[data-tab="content-video"]'
        ];
        
        views.forEach((selector, i) => {
            const el = document.querySelector(selector);
            if (el) el.style.display = i === 0 ? 'block' : 'none';
        });

        this.previousView = 'main';
        this.deactivatePostHeader();
    }

    showContentsList(category = null) {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        
        if (tabContent) tabContent.style.display = 'none';
        
        // 리스트 렌더링 (카테고리별)
        if (contentList && this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderContentsList('.tab-content[data-tab="content-list"]', category);
            contentList.style.display = 'block';
        }

        this.previousView = 'list';
        this.currentCategory = category; // 현재 카테고리 저장
        this.activatePostHeader();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showContentsTag(tagName) {
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentTag = document.querySelector('.tab-content[data-tab="content-tag"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        if (contentTag) {
            contentTag.style.display = 'block';
            const title = contentTag.querySelector('.content-tag-title');
            if (title) title.textContent = '#' + tagName;
        }

        this.previousView = 'main';
        this.activatePostHeader();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contents 상세 보기 (유튜브/이미지/비디오 자동 판별)
    showContentsDetail(contentId) {
        console.log('🟢 showContentsDetail:', contentId);
        
        const post = this.contentsRenderer.getPostById(contentId);
        if (!post) return;

        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVID = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        
        // 유튜브나 비디오면 content-video 탭 사용
        const isVideo = this.contentsRenderer.isVideoPost(post);
        
        if (isVideo) {
            if (contentIMG) contentIMG.style.display = 'none';
            if (contentVID) {
                contentVID.innerHTML = this.contentsRenderer.renderDetail(post);
                contentVID.style.display = 'block';
            }
        } else {
            if (contentVID) contentVID.style.display = 'none';
            if (contentIMG) {
                contentIMG.innerHTML = this.contentsRenderer.renderDetail(post);
                contentIMG.style.display = 'block';
            }
        }

        this.activatePostHeader();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 기존 함수들 (호환성 유지)
    showContentsIMG(contentId) {
        this.showContentsDetail(contentId);
    }

    showContentsVID(contentId) {
        this.showContentsDetail(contentId);
    }

    // ========== 헤더 관리 ==========
    activatePostHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        header.classList.add('post-view');
        
        const menuBtn = document.querySelector('.header-menu');
        if (menuBtn) {
            menuBtn.onclick = () => {
                if (this.currentTab === 'nomad') {
                    this.showNOMADTab();
                } else if (this.currentTab === 'contents') {
                    const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
                    if (contentList && contentList.style.display === 'block') {
                        this.showContentsTab();
                    } else if (this.previousView === 'list') {
                        this.showContentsList();
                    } else {
                        this.showContentsTab();
                    }
                }
            };
        }
        
        const profileBtn = document.querySelector('.header-logo');
        if (profileBtn) {
            profileBtn.onclick = () => {
                this.switchTab('home');
                this.deactivatePostHeader();
            };
        }
    }

    deactivatePostHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        header.classList.remove('post-view');
        
        const menuBtn = document.querySelector('.header-menu');
        if (menuBtn) menuBtn.onclick = null;
        
        const profileBtn = document.querySelector('.header-logo');
        if (profileBtn) profileBtn.onclick = null;
    }

    // ========== POP 탭 ==========
    initializePop() {
        console.log('POP tab initialized');
    }

    // ========== 유틸리티 ==========
    initializeImageCarousels() {
        const tracks = document.querySelectorAll('.media-container-track');
        
        tracks.forEach(track => {
            const images = track.querySelectorAll('img');
            if (images.length <= 1) return;

            const post = track.closest('.nomad-post') || track.closest('.nomad-detail-post');
            const indicators = post?.querySelector('.post-indicators');
            if (!indicators) return;

            const dots = indicators.querySelectorAll('.indicator');

            track.addEventListener('scroll', () => {
                const scrollLeft = track.scrollLeft;
                const imageWidth = track.offsetWidth;
                const currentIndex = Math.round(scrollLeft / imageWidth);

                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            });
        });
    }

    initializeHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (this.currentTab !== 'home') return;
            
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    initializeContentsThumbnails() {
        const thumbnailContainers = document.querySelectorAll('.contents-thumbnails');
        
        thumbnailContainers.forEach(container => {
            const thumbnails = container.querySelectorAll('img');
            if (thumbnails.length <= 1) return;
            
            let currentIndex = 0;
            thumbnails[0]?.classList.add('active');
            
            setInterval(() => {
                thumbnails[currentIndex]?.classList.remove('active');
                currentIndex = (currentIndex + 1) % thumbnails.length;
                thumbnails[currentIndex]?.classList.add('active');
            }, 3000);
        });
    }

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

    showMoreCards(button) {
        const grid = button.closest('.home-grid');
        const hiddenCards = grid.querySelectorAll('.home-card-contnets.hidden');
        hiddenCards.forEach(card => card.classList.remove('hidden'));
        button.closest('.home-card-contnets').style.display = 'none';
    }
}

const app = new BSTApp();
window.BSTApp = app;