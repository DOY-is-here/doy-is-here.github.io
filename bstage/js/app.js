// Tab switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            const targetTab = navItem.getAttribute('data-tab');

            // Remove active class from all nav items and tab contents
            navItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked nav item and corresponding tab content
            navItem.classList.add('active');
            const targetContent = document.querySelector(`.tab-content[data-tab="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Image carousel for posts
    initializeImageCarousels();
    
    // Header scroll effect
    initializeHeaderScroll();
});

function initializeImageCarousels() {
    const postImages = document.querySelectorAll('.post-images');
    
    postImages.forEach(container => {
        const images = container.querySelectorAll('img');
        if (images.length <= 1) return;

        const indicators = container.nextElementSibling;
        if (!indicators || !indicators.classList.contains('post-indicators')) return;

        const dots = indicators.querySelectorAll('.indicator');
        let currentIndex = 0;

        container.addEventListener('scroll', () => {
            const scrollLeft = container.scrollLeft;
            const imageWidth = images[0].offsetWidth;
            const newIndex = Math.round(scrollLeft / imageWidth);
            
            if (newIndex !== currentIndex) {
                dots[currentIndex].classList.remove('active');
                currentIndex = newIndex;
                dots[currentIndex].classList.add('active');
            }
        });
    });
}

function initializeHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}