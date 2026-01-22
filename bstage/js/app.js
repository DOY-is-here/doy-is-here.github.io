import NomadRenderer from './nomad-renderer.js';
import ContentsRenderer from './contents-renderer.js';

// BST App - Tab Switching & Interactive Features
class BSTApp {
    constructor() {
        this.currentTab = 'home';
        this.previousView = null;
        this.previousTab = null;
        this.currentCategory = null;
        this.currentTag = null;
        this.scrollPositions = {};
        this.returningFromPost = false;
        this.nomadRenderer = new NomadRenderer('https://doy-is-here.github.io/');
        this.contentsRenderer = new ContentsRenderer('https://doy-is-here.github.io/');
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await Promise.all([
                this.nomadRenderer.loadPosts('data/nomad-posts.json'),
                this.contentsRenderer.loadPosts('data/contents-posts.json', 'data/youtube-posts.json')
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

    // ========== 스크롤 위치 관리 ==========
    saveScrollPosition(viewKey) {
        this.scrollPositions[viewKey] = window.scrollY;
    }

    restoreScrollPosition(viewKey) {
        const savedPosition = this.scrollPositions[viewKey];
        if (savedPosition !== undefined) {
            setTimeout(() => {
                window.scrollTo({ top: savedPosition, behavior: 'instant' });
            }, 10);
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'instant' });
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

        // 탭 이동 시 해당 탭의 스크롤 위치 초기화
        this.clearTabScrollPositions(tabName);

        this.deactivatePostHeader();
        this.updateHeaderState(tabName);
        this.initializeTabContent(tabName);
        this.scrollToTop();
    }

    clearTabScrollPositions(tabName) {
        // 포스트에서 돌아올 때만 홈 스크롤 보존, 그 외 탭 이동은 전체 초기화
        if (this.returningFromPost) {
            const homeScroll = this.scrollPositions['home'];
            const homeNomadGrid = this.scrollPositions['home-nomad-grid'];
            const homeContentsGrid = this.scrollPositions['home-contents-grid'];
            this.scrollPositions = {};
            if (homeScroll !== undefined) this.scrollPositions['home'] = homeScroll;
            if (homeNomadGrid !== undefined) this.scrollPositions['home-nomad-grid'] = homeNomadGrid;
            if (homeContentsGrid !== undefined) this.scrollPositions['home-contents-grid'] = homeContentsGrid;
        } else {
            this.scrollPositions = {};
        }
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
        
        // 포스트에서 돌아온 경우 그리드 스크롤 위치 저장
        const savedNomadGridScroll = this.returningFromPost ? this.scrollPositions['home-nomad-grid'] : 0;
        const savedContentsGridScroll = this.returningFromPost ? this.scrollPositions['home-contents-grid'] : 0;
        
        if (this.nomadRenderer.posts.length > 0) {
            this.nomadRenderer.renderHomePreview('#home-nomad-grid');
        }
        
        if (this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderHomePreview('#home-contents-grid');
        }
        
        // 포스트에서 돌아온 경우 그리드 스크롤 위치 복원, 아니면 초기화
        setTimeout(() => {
            const nomadGrid = document.querySelector('#home-nomad-grid');
            const contentsGrid = document.querySelector('#home-contents-grid');
            if (this.returningFromPost) {
                if (nomadGrid && savedNomadGridScroll) nomadGrid.scrollLeft = savedNomadGridScroll;
                if (contentsGrid && savedContentsGridScroll) contentsGrid.scrollLeft = savedContentsGridScroll;
            } else {
                if (nomadGrid) nomadGrid.scrollLeft = 0;
                if (contentsGrid) contentsGrid.scrollLeft = 0;
            }
            this.returningFromPost = false;
        }, 10);
    }

    saveHomeGridScroll() {
        const nomadGrid = document.querySelector('#home-nomad-grid');
        const contentsGrid = document.querySelector('#home-contents-grid');
        if (nomadGrid) this.scrollPositions['home-nomad-grid'] = nomadGrid.scrollLeft;
        if (contentsGrid) this.scrollPositions['home-contents-grid'] = contentsGrid.scrollLeft;
    }

    resetHomeGridScroll() {
        const grids = document.querySelectorAll('.home-grid, #home-nomad-grid, #home-contents-grid');
        grids.forEach(grid => {
            if (grid) grid.scrollLeft = 0;
        });
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
        this.previousTab = 'nomad';
        this.updateHeaderState('nomad');
        this.deactivatePostHeader();
        
        this.restoreScrollPosition('nomad-main');
    }

    showNOMADPost(postId) {
        console.log('🔵 showNOMADPost:', postId);
        
        const fromHome = this.currentTab === 'home';
        
        if (fromHome) {
            this.saveScrollPosition('home');
            this.saveHomeGridScroll();
            this.previousTab = 'home';
            this.previousView = 'home';
            
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
        } else if (this.currentTab === 'nomad') {
            this.saveScrollPosition('nomad-main');
            this.previousView = 'main';
            this.previousTab = 'nomad';
        }

        const tabNOMAD = document.querySelector('.tab-content[data-tab="nomad"]');
        const NOMADPost = document.querySelector('.tab-content[data-tab="nomad-post"]');
        
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
        this.scrollToTop();
    }
    
    // ========== CONTENTS 탭 ==========
    initializeContents() {
        console.log('Contents tab initialized');
        
        if (this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderHero('.contents-hero', {postIds: ['yt-250223'], subtitle: 'Who Am I', title: '2025 DOY'});
            this.contentsRenderer.renderHero('.contents-hero', {postIds: ['yt-250223'], subtitle: 'Who Am I', title: '2025 DOY'});
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
        this.previousTab = 'contents';
        this.currentCategory = null;
        this.currentTag = null;
        this.deactivatePostHeader();
        
        this.restoreScrollPosition('contents-main');
    }

    showContentsList(category = null) {
        if (this.previousView === 'main') {
            this.saveScrollPosition('contents-main');
        }
        
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVID = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVID) contentVID.style.display = 'none';
        
        if (contentList && this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderContentsList('.tab-content[data-tab="content-list"]', category);
            contentList.style.display = 'block';
        }

        this.previousView = 'list';
        this.previousTab = 'contents';
        this.currentCategory = category;
        this.currentTag = null;
        this.activatePostHeader();
        
        const listKey = `contents-list-${category || 'all'}`;
        if (this.scrollPositions[listKey] !== undefined) {
            this.restoreScrollPosition(listKey);
        } else {
            this.scrollToTop();
        }
    }

    showTagList(tagName) {
        if (this.previousView === 'main') {
            this.saveScrollPosition('contents-main');
        }
        
        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVID = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentIMG) contentIMG.style.display = 'none';
        if (contentVID) contentVID.style.display = 'none';
        
        if (contentList && this.contentsRenderer.posts.length > 0) {
            this.contentsRenderer.renderTagList('.tab-content[data-tab="content-list"]', tagName);
            contentList.style.display = 'block';
        }

        this.previousView = 'tag';
        this.previousTab = 'contents';
        this.currentTag = tagName;
        this.currentCategory = null;
        this.activatePostHeader();
        
        const tagKey = `contents-tag-${tagName}`;
        if (this.scrollPositions[tagKey] !== undefined) {
            this.restoreScrollPosition(tagKey);
        } else {
            this.scrollToTop();
        }
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
        this.scrollToTop();
    }

    showContentsDetail(contentId) {
        console.log('🟢 showContentsDetail:', contentId);
        
        const post = this.contentsRenderer.getPostById(contentId);
        if (!post) return;

        const fromHome = this.currentTab === 'home';
        
        if (fromHome) {
            this.saveScrollPosition('home');
            this.saveHomeGridScroll();
            this.previousTab = 'home';
            this.previousView = 'home';
            
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const contentsNav = document.querySelector('.nav-item[data-tab="contents"]');
            if (contentsNav) contentsNav.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            this.currentTab = 'contents';
        } else {
            if (this.previousView === 'list') {
                const listKey = `contents-list-${this.currentCategory || 'all'}`;
                this.saveScrollPosition(listKey);
            } else if (this.previousView === 'tag') {
                const tagKey = `contents-tag-${this.currentTag}`;
                this.saveScrollPosition(tagKey);
            } else if (this.previousView === 'main') {
                this.saveScrollPosition('contents-main');
            }
        }

        const tabContent = document.querySelector('.tab-content[data-tab="contents"]');
        const contentList = document.querySelector('.tab-content[data-tab="content-list"]');
        const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
        const contentVID = document.querySelector('.tab-content[data-tab="content-video"]');
        
        if (tabContent) tabContent.style.display = 'none';
        if (contentList) contentList.style.display = 'none';
        
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
        this.scrollToTop();
    }

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
                    if (this.previousView === 'home') {
                        this.returningFromPost = true;
                        this.switchTab('home');
                        this.restoreScrollPosition('home');
                    } else {
                        this.showNOMADTab();
                    }
                } else if (this.currentTab === 'contents') {
                    const contentIMG = document.querySelector('.tab-content[data-tab="content-img"]');
                    const contentVID = document.querySelector('.tab-content[data-tab="content-video"]');
                    const isPostView = (contentIMG && contentIMG.style.display === 'block') || 
                                       (contentVID && contentVID.style.display === 'block');
                    
                    if (isPostView) {
                        if (this.previousView === 'home') {
                            this.returningFromPost = true;
                            this.switchTab('home');
                            this.restoreScrollPosition('home');
                        } else if (this.previousView === 'list') {
                            this.showContentsList(this.currentCategory);
                        } else if (this.previousView === 'tag') {
                            this.showTagList(this.currentTag);
                        } else {
                            this.showContentsTab();
                        }
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