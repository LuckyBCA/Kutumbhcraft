/**
 * Kutumbh Craft - Main JavaScript Module
 * Handles core functionality, navigation, and page initialization
 */

// Global app state
const App = {
  init: false,
  currentSection: 'hero',
  scrollY: 0,
  isScrolling: false,
  isMobile: window.innerWidth <= 768
};

// DOM elements cache
const DOM = {
  nav: null,
  navToggle: null,
  navMenu: null,
  navLinks: null,
  scrollProgress: null,
  loadingScreen: null,
  main: null,
  sections: null
};

/**
 * Initialize the application
 */
function initApp() {
  if (App.init) return;
  
  cacheDOM();
  bindEvents();
  setupIntersectionObserver();
  setupSmoothScrolling();
  initializeComponents();
  hideLoadingScreen();
  
  App.init = true;
  console.log('Kutumbh Craft app initialized');
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOM() {
  DOM.nav = document.getElementById('main-nav');
  DOM.navToggle = document.getElementById('nav-toggle');
  DOM.navMenu = document.getElementById('nav-menu');
  DOM.navLinks = document.querySelectorAll('.nav-link');
  DOM.scrollProgress = document.getElementById('scroll-progress');
  DOM.loadingScreen = document.getElementById('loading-screen');
  DOM.main = document.querySelector('.main');
  DOM.sections = document.querySelectorAll('section');
}

/**
 * Bind event listeners
 */
function bindEvents() {
  // Navigation events
  if (DOM.navToggle) {
    DOM.navToggle.addEventListener('click', toggleMobileMenu);
  }
  
  if (DOM.navLinks) {
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', handleNavClick);
    });
  }
  
  // Scroll events
  window.addEventListener('scroll', throttle(handleScroll, 16)); // 60fps
  window.addEventListener('resize', debounce(handleResize, 250));
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyDown);
  
  // Page visibility
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Form events
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  
  // Modal events
  setupModalEvents();
}

/**
 * Handle scroll events
 */
function handleScroll() {
  App.scrollY = window.pageYOffset;
  
  updateNavigationState();
  updateScrollProgress();
  updateActiveSection();
  
  // Add parallax effect to hero section
  const hero = document.getElementById('hero');
  if (hero && window.innerWidth > 768) {
    const scrolled = App.scrollY;
    const parallax = scrolled * 0.5;
    hero.style.setProperty('--parallax-offset', `${parallax}px`);
  }
}

/**
 * Update navigation appearance based on scroll position
 */
function updateNavigationState() {
  if (!DOM.nav) return;
  
  if (App.scrollY > 50) {
    DOM.nav.classList.add('scrolled');
  } else {
    DOM.nav.classList.remove('scrolled');
  }
}

/**
 * Update scroll progress indicator
 */
function updateScrollProgress() {
  if (!DOM.scrollProgress) return;
  
  const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (App.scrollY / windowHeight) * 100;
  
  DOM.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
}

/**
 * Update active section in navigation
 */
function updateActiveSection() {
  if (!DOM.sections || !DOM.navLinks) return;
  
  const scrollPosition = App.scrollY + 100; // Offset for better UX
  
  DOM.sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      // Update active nav link
      DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
      
      App.currentSection = sectionId;
    }
  });
}

/**
 * Handle navigation link clicks
 */
function handleNavClick(event) {
  event.preventDefault();
  
  const href = event.target.getAttribute('href');
  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);
  
  if (targetElement) {
    scrollToElement(targetElement);
    
    // Close mobile menu if open
    if (DOM.navMenu.classList.contains('active')) {
      toggleMobileMenu();
    }
  }
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 80) {
  const elementPosition = element.offsetTop - offset;
  
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
  if (!DOM.navToggle || !DOM.navMenu) return;
  
  DOM.navToggle.classList.toggle('active');
  DOM.navMenu.classList.toggle('active');
  
  // Prevent body scrolling when menu is open
  if (DOM.navMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

/**
 * Handle window resize
 */
function handleResize() {
  const wasMobile = App.isMobile;
  App.isMobile = window.innerWidth <= 768;
  
  // Close mobile menu when resizing to desktop
  if (wasMobile && !App.isMobile && DOM.navMenu.classList.contains('active')) {
    toggleMobileMenu();
  }
  
  // Reset body overflow if menu was open
  if (!App.isMobile) {
    document.body.style.overflow = '';
  }
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {
  // ESC key to close modals/menus
  if (event.key === 'Escape') {
    // Close mobile menu
    if (DOM.navMenu && DOM.navMenu.classList.contains('active')) {
      toggleMobileMenu();
    }
    
    // Close modals
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      closeModal(activeModal);
    }
  }
  
  // Arrow keys for carousel navigation
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const activeCarousel = document.querySelector('.reviews-carousel');
    if (activeCarousel && isElementInViewport(activeCarousel)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') {
        previousReview();
      } else {
        nextReview();
      }
    }
  }
}

/**
 * Handle page visibility change
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, pause animations
    pauseAnimations();
  } else {
    // Page is visible, resume animations
    resumeAnimations();
  }
}

/**
 * Setup intersection observer for scroll animations
 */
function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        
        // Trigger any custom animations
        if (entry.target.classList.contains('counter')) {
          animateCounter(entry.target);
        }
        
        if (entry.target.classList.contains('progress-bar')) {
          animateProgressBar(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Observe elements with animation classes
  const animateElements = document.querySelectorAll('.animate-on-scroll, .fade-in-up, .fade-in-left, .fade-in-right, .scale-in');
  animateElements.forEach(el => observer.observe(el));
  
  // Observe counters and progress bars
  const counters = document.querySelectorAll('.counter');
  const progressBars = document.querySelectorAll('.progress-bar');
  
  counters.forEach(el => observer.observe(el));
  progressBars.forEach(el => observer.observe(el));
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
  // Enhanced smooth scrolling for browsers that support it
  if ('scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
}

/**
 * Initialize component modules
 */
function initializeComponents() {
  // Initialize portfolio if module is loaded
  if (typeof initPortfolio === 'function') {
    initPortfolio();
  }
  
  // Initialize reviews if module is loaded
  if (typeof initReviews === 'function') {
    initReviews();
  }
  
  // Initialize animations if module is loaded
  if (typeof initAnimations === 'function') {
    initAnimations();
  }
  
  // Initialize forms
  initForms();
}

/**
 * Initialize form functionality
 */
function initForms() {
  // Multi-step contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    initMultiStepForm(contactForm);
  }
  
  // Review form will be initialized by reviews.js module
}

/**
 * Initialize multi-step form
 */
function initMultiStepForm(form) {
  const steps = form.querySelectorAll('.form-step');
  const nextBtns = form.querySelectorAll('.form-next');
  const prevBtns = form.querySelectorAll('.form-prev');
  
  let currentStep = 0;
  
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(steps[currentStep])) {
        goToStep(currentStep + 1);
      }
    });
  });
  
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });
  
  function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    steps[currentStep].classList.remove('active');
    steps[stepIndex].classList.add('active');
    currentStep = stepIndex;
  }
  
  function validateStep(step) {
    const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        showFieldError(input, 'This field is required');
        isValid = false;
      } else {
        clearFieldError(input);
      }
    });
    
    return isValid;
  }
}

/**
 * Handle contact form submission
 */
function handleContactSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading state
  const submitBtn = form.querySelector('[type="submit"]');
  showButtonLoading(submitBtn);
  
  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    hideButtonLoading(submitBtn);
    showSuccessMessage('Thank you! Your message has been sent successfully.');
    form.reset();
    
    // Reset to first step
    const steps = form.querySelectorAll('.form-step');
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === 0);
    });
  }, 2000);
}

/**
 * Setup modal events
 */
function setupModalEvents() {
  // Modal close events
  document.addEventListener('click', (event) => {
    if (event.target.matches('[data-modal-close]')) {
      const modal = event.target.closest('.modal');
      if (modal) {
        closeModal(modal);
      }
    }
  });
  
  // Portfolio modal triggers
  document.addEventListener('click', (event) => {
    if (event.target.matches('.portfolio-item, .portfolio-item *')) {
      const portfolioItem = event.target.closest('.portfolio-item');
      if (portfolioItem) {
        const projectId = portfolioItem.dataset.projectId;
        openPortfolioModal(projectId);
      }
    }
  });
  
  // Review modal trigger
  const addReviewBtn = document.getElementById('add-review-btn');
  if (addReviewBtn) {
    addReviewBtn.addEventListener('click', () => {
      openModal('review-modal');
    });
  }
}

/**
 * Open modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    const focusableElement = modal.querySelector('input, button, textarea, select');
    if (focusableElement) {
      focusableElement.focus();
    }
  }
}

/**
 * Close modal
 */
function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Show field error
 */
function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = '#ef4444';
  errorElement.style.fontSize = 'var(--font-sm)';
  errorElement.style.marginTop = 'var(--space-1)';
  errorElement.style.display = 'block';
  
  field.parentNode.appendChild(errorElement);
}

/**
 * Clear field error
 */
function clearFieldError(field) {
  field.classList.remove('error');
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Show button loading state
 */
function showButtonLoading(button) {
  button.classList.add('btn-loading');
  button.disabled = true;
}

/**
 * Hide button loading state
 */
function hideButtonLoading(button) {
  button.classList.remove('btn-loading');
  button.disabled = false;
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification success';
  notification.innerHTML = `
    <div class="notification-content">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  // Add styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#10b981',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '400px',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-out'
  });
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  if (DOM.loadingScreen) {
    setTimeout(() => {
      DOM.loadingScreen.classList.add('hidden');
      setTimeout(() => {
        DOM.loadingScreen.remove();
      }, 500);
    }, 1500); // Show loading for at least 1.5 seconds
  }
}

/**
 * Utility functions
 */

/**
 * Throttle function execution
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function execution
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Animate counter
 */
function animateCounter(element) {
  const target = parseInt(element.dataset.target || element.textContent);
  const duration = parseInt(element.dataset.duration) || 2000;
  const start = 0;
  const increment = target / (duration / 16);
  
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    element.textContent = Math.floor(current);
    
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

/**
 * Animate progress bar
 */
function animateProgressBar(element) {
  const target = parseInt(element.dataset.progress) || 100;
  element.style.setProperty('--progress-width', `${target}%`);
  element.classList.add('animate');
}

/**
 * Pause animations for performance
 */
function pauseAnimations() {
  document.body.classList.add('animations-paused');
}

/**
 * Resume animations
 */
function resumeAnimations() {
  document.body.classList.remove('animations-paused');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Expose necessary functions to global scope
window.App = App;
window.openModal = openModal;
window.closeModal = closeModal;
window.showSuccessMessage = showSuccessMessage;