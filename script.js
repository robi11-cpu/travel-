// DOM Elements
const header = document.querySelector('.main-header');
const mobileMenuBtn = document.querySelector('.mobile-menu-icon');
const navMenu = document.querySelector('.nav-menu');
const dropdownMenus = document.querySelectorAll('.has-dropdown');
const body = document.body;

// Sticky Header Function
function handleStickyHeader() {
    if (window.scrollY > 100) {
        header.classList.add('header-sticky');
    } else {
        header.classList.remove('header-sticky');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
    
    // Toggle menu icon animation
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Handle Dropdown Menus
function setupDropdownMenus() {
    if (window.innerWidth <= 992) { // Mobile View
        dropdownMenus.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const submenu = dropdown.querySelector('.dropdown');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('active');
                
                // Slide Toggle Animation
                if (dropdown.classList.contains('active')) {
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                } else {
                    submenu.style.maxHeight = '0';
                }
            });
        });
    } else { // Desktop View
        dropdownMenus.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => {
                const submenu = dropdown.querySelector('.dropdown');
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                submenu.style.opacity = '1';
            });

            dropdown.addEventListener('mouseleave', () => {
                const submenu = dropdown.querySelector('.dropdown');
                submenu.style.maxHeight = '0';
                submenu.style.opacity = '0';
            });
        });
    }
}

// Close Mobile Menu When Clicking Outside
function handleClickOutside(event) {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(event.target) && 
        !mobileMenuBtn.contains(event.target)) {
        toggleMobileMenu();
    }
}

// Handle Window Resize
function handleResize() {
    if (window.innerWidth > 992) {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans.forEach(span => span.style.transform = 'none');
        spans[1].style.opacity = '1';
    }
    setupDropdownMenus();
}

// Smooth Scroll for Navigation Links
function smoothScroll(event) {
    if (event.target.hash !== '') {
        event.preventDefault();
        const hash = event.target.hash;
        const targetElement = document.querySelector(hash);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - header.offsetHeight,
                behavior: 'smooth'
            });
            
            // Close mobile menu after clicking
            if (window.innerWidth <= 992) {
                toggleMobileMenu();
            }
        }
    }
}

// Initialize Functions
function init() {
    // Event Listeners
    window.addEventListener('scroll', handleStickyHeader);
    window.addEventListener('resize', handleResize);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    document.addEventListener('click', handleClickOutside);
    
    // Setup smooth scroll for all navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // Initial setup
    setupDropdownMenus();
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', init);

// Add loading animation
window.addEventListener('load', () => {
    const preloader = document.querySelector('.loading');
    if (preloader) {
        preloader.style.display = 'none';
    }
    body.classList.add('loaded');
});

// Performance Optimization
let scrollTimer;
window.addEventListener('scroll', () => {
    if (scrollTimer) {
        clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(handleStickyHeader, 15);
}, { passive: true });
// Hero Slider Configuration
const sliderConfig = {
    autoPlay: true,
    interval: 5000,
    transition: 1000
};

// Slider Class
class HeroSlider {
    constructor() {
        this.slider = document.querySelector('.hero-slider');
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.slideCount = this.slides.length;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (this.slideCount > 1) {
            this.createNavigation();
            this.setupEventListeners();
            if (sliderConfig.autoPlay) {
                this.startAutoPlay();
            }
        }
    }
    
    createNavigation() {
        // Create navigation dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('data-slide', i);
            if (i === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
        
        // Create prev/next buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-button prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-button next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        this.slider.appendChild(dotsContainer);
        this.slider.appendChild(prevButton);
        this.slider.appendChild(nextButton);
        
        // Store references
        this.dots = dotsContainer.querySelectorAll('.slider-dot');
        this.prevButton = prevButton;
        this.nextButton = nextButton;
    }
    
    setupEventListeners() {
        this.prevButton.addEventListener('click', () => this.prevSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                this.goToSlide(slideIndex);
            });
        });
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        
        this.isTransitioning = true;
        
        // Update slides
        const currentSlide = this.slides[this.currentSlide];
        const nextSlide = this.slides[index];
        
        // Transition animation
        currentSlide.style.opacity = '0';
        nextSlide.style.opacity = '1';
        
        // Update dots
        this.dots[this.currentSlide].classList.remove('active');
        this.dots[index].classList.add('active');
        
        // Update current slide index
        this.currentSlide = index;
        
        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, sliderConfig.transition);
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slideCount;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slideCount) % this.slideCount;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, sliderConfig.interval);
        
        // Pause on hover
        this.slider.addEventListener('mouseenter', () => {
            clearInterval(this.autoPlayInterval);
        });
        
        this.slider.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }
}

// Newsletter Form Handling
class NewsletterForm {
    constructor() {
        this.form = document.querySelector('.subscribe-form');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.form.querySelector('input[type="email"]').value;
        const submitButton = this.form.querySelector('button');
        
        if (this.validateEmail(email)) {
            try {
                submitButton.disabled = true;
                submitButton.innerHTML = 'প্রক্রিয়াকরণ হচ্ছে...';
                
                // Simulate API call
                await this.subscribeUser(email);
                
                this.showMessage('সফলভাবে সাবস্ক্রাইব করা হয়েছে!', 'success');
                this.form.reset();
            } catch (error) {
                this.showMessage('দুঃখিত, কিছু সমস্যা হয়েছে।', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'সাবস্ক্রাইব';
            }
        } else {
            this.showMessage('অনুগ্রহ করে সঠিক ইমেইল দিন।', 'error');
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    async subscribeUser(email) {
        // Replace with actual API call
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        this.form.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize slider
    const heroSlider = new HeroSlider();
    
    // Initialize newsletter
    const newsletter = new NewsletterForm();
    
    // Initialize lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});
// Search Functionality
class SearchHandler {
    constructor() {
        this.searchForm = document.querySelector('.search-form');
        this.searchInput = document.querySelector('.search-form input');
        this.searchResults = document.querySelector('.search-results');
        this.posts = document.querySelectorAll('.post-card');
        this.typingTimer;
        this.init();
    }

    init() {
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => this.handleSubmit(e));
            this.searchInput.addEventListener('keyup', () => this.handleKeyup());
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.performSearch();
    }

    handleKeyup() {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.performSearch();
        }, 500);
    }

    async performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.clearResults();
            return;
        }

        this.showLoader();
        
        try {
            const results = await this.searchPosts(query);
            this.displayResults(results);
        } catch (error) {
            this.showError('সার্চ করতে সমস্যা হচ্ছে।');
        }
    }

    async searchPosts(query) {
        // Simulate API call with local search
        return new Promise(resolve => {
            setTimeout(() => {
                const results = Array.from(this.posts).filter(post => {
                    const title = post.querySelector('h3').textContent.toLowerCase();
                    const content = post.querySelector('p')?.textContent.toLowerCase() || '';
                    return title.includes(query) || content.includes(query);
                });
                resolve(results);
            }, 500);
        });
    }

    displayResults(results) {
        this.clearResults();
        
        if (results.length === 0) {
            this.showError('কোন ফলাফল পাওয়া যায়নি।');
            return;
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container';

        results.forEach((result, index) => {
            const clone = result.cloneNode(true);
            clone.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
            resultsContainer.appendChild(clone);
        });

        this.searchResults.appendChild(resultsContainer);
    }

    clearResults() {
        this.searchResults.innerHTML = '';
    }

    showLoader() {
        this.clearResults();
        const loader = document.createElement('div');
        loader.className = 'loading';
        this.searchResults.appendChild(loader);
    }

    showError(message) {
        this.clearResults();
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        this.searchResults.appendChild(error);
    }
}

// Post Filter Functionality
class PostFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.posts = document.querySelectorAll('.post-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => this.filterPosts(button));
        });
    }

    filterPosts(clickedButton) {
        const category = clickedButton.dataset.category;

        // Update active button
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        clickedButton.classList.add('active');

        // Filter posts
        this.posts.forEach(post => {
            const postCategory = post.dataset.category;
            
            if (category === 'all' || postCategory === category) {
                post.style.display = 'block';
                post.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                post.style.display = 'none';
            }
        });
    }
}

// Animation Handler
class AnimationHandler {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-animate]');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.handleScrollAnimation();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    animateElement(element) {
        const animation = element.dataset.animate;
        element.classList.add(animation, 'animated');
    }

    handleScrollAnimation() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', () => {
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const offset = window.pageYOffset * speed;
                element.style.transform = `translateY(${offset}px)`;
            });
        }, { passive: true });
    }
}

// Loading Effect
class LoadingEffect {
    constructor() {
        this.loader = document.querySelector('.loading');
        this.init();
    }

    init() {
        if (this.loader) {
            window.addEventListener('load', () => this.hideLoader());
        }
    }

    hideLoader() {
        this.loader.style.opacity = '0';
        setTimeout(() => {
            this.loader.style.display = 'none';
            document.body.classList.add('loaded');
        }, 500);
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize search
    const search = new SearchHandler();
    
    // Initialize post filter
    const filter = new PostFilter();
    
    // Initialize animations
    const animations = new AnimationHandler();
    
    // Initialize loading effect
    const loading = new LoadingEffect();
    
    // Add scroll to top button functionality
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
