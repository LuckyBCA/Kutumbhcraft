/**
 * Kutumbh Craft - Animations Module
 * Handles scroll animations, interactions, and visual effects
 */

let animationObserver;
let parallaxElements = [];
let isReducedMotion = false;

/**
 * Initialize animations
 */
function initAnimations() {
  checkReducedMotion();
  setupScrollAnimations();
  setupParallaxEffects();
  setupHoverAnimations();
  setupLoadingAnimations();
  setupCounterAnimations();
  setupProgressBarAnimations();
  
  console.log('Animations initialized');
}

/**
 * Check for reduced motion preference
 */
function checkReducedMotion() {
  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (isReducedMotion) {
    document.body.classList.add('reduced-motion');
    console.log('Reduced motion enabled');
  }
}

/**
 * Setup scroll-triggered animations
 */
function setupScrollAnimations() {
  if (isReducedMotion) return;

  const observerOptions = {
    threshold: [0.1, 0.2, 0.5],
    rootMargin: '0px 0px -50px 0px'
  };

  animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerElementAnimation(entry.target, entry.intersectionRatio);
      }
    });
  }, observerOptions);

  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll(`
    .animate-on-scroll,
    .fade-in-up,
    .fade-in-left,
    .fade-in-right,
    .fade-in,
    .scale-in,
    .portfolio-item,
    .service-card,
    .review-card
  `);

  animatedElements.forEach(el => {
    animationObserver.observe(el);
  });
}

/**
 * Trigger element animation
 */
function triggerElementAnimation(element, ratio) {
  // Add basic animation class
  element.classList.add('animate');

  // Handle specific animation types
  if (element.classList.contains('portfolio-item')) {
    setTimeout(() => {
      element.classList.add('show');
    }, Math.random() * 200); // Random stagger
  }

  if (element.classList.contains('service-card')) {
    const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
    setTimeout(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    }, delay);
  }

  // Trigger special animations based on element type
  if (element.classList.contains('counter')) {
    animateCounter(element);
  }

  if (element.classList.contains('progress-bar')) {
    animateProgressBar(element);
  }
}

/**
 * Setup parallax effects
 */
function setupParallaxEffects() {
  if (isReducedMotion || window.innerWidth <= 768) return;

  parallaxElements = document.querySelectorAll('.parallax-element, .hero-background');

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', throttle(updateParallax, 16));
  }
}

/**
 * Update parallax elements
 */
function updateParallax() {
  const scrollY = window.pageYOffset;

  parallaxElements.forEach(element => {
    const speed = parseFloat(element.dataset.speed) || 0.5;
    const yPos = -(scrollY * speed);
    
    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
  });
}

/**
 * Setup hover animations
 */
function setupHoverAnimations() {
  // Portfolio hover effects
  document.addEventListener('mouseenter', (event) => {
    if (event.target.closest('.portfolio-item')) {
      const item = event.target.closest('.portfolio-item');
      animatePortfolioHover(item, true);
    }

    if (event.target.closest('.service-card')) {
      const card = event.target.closest('.service-card');
      animateServiceHover(card, true);
    }
  }, true);

  document.addEventListener('mouseleave', (event) => {
    if (event.target.closest('.portfolio-item')) {
      const item = event.target.closest('.portfolio-item');
      animatePortfolioHover(item, false);
    }

    if (event.target.closest('.service-card')) {
      const card = event.target.closest('.service-card');
      animateServiceHover(card, false);
    }
  }, true);
}

/**
 * Animate portfolio item hover
 */
function animatePortfolioHover(item, isHover) {
  const image = item.querySelector('.portfolio-image');
  const overlay = item.querySelector('.portfolio-overlay');

  if (isHover) {
    item.style.transform = 'translateY(-8px) scale(1.02)';
    if (image) image.style.transform = 'scale(1.1)';
    if (overlay) overlay.style.opacity = '1';
  } else {
    item.style.transform = 'translateY(0) scale(1)';
    if (image) image.style.transform = 'scale(1)';
    if (overlay) overlay.style.opacity = '0';
  }
}

/**
 * Animate service card hover
 */
function animateServiceHover(card, isHover) {
  const icon = card.querySelector('.service-icon');

  if (isHover) {
    card.style.transform = 'translateY(-12px)';
    if (icon) {
      icon.style.transform = 'scale(1.15) rotate(10deg)';
      icon.style.animation = 'icon-bounce 0.6s ease-out';
    }
  } else {
    card.style.transform = 'translateY(0)';
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
      icon.style.animation = '';
    }
  }
}

/**
 * Setup loading animations
 */
function setupLoadingAnimations() {
  // Image lazy loading with fade-in effect
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        loadImageWithAnimation(img);
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Load image with animation
 */
function loadImageWithAnimation(img) {
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.3s ease-out';
  
  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = img.dataset.src;
    img.style.opacity = '1';
    img.classList.remove('lazyload');
  };
  tempImg.src = img.dataset.src;
}

/**
 * Setup counter animations
 */
function setupCounterAnimations() {
  const counters = document.querySelectorAll('.counter');
  
  counters.forEach(counter => {
    counter.style.opacity = '0';
    counter.style.transform = 'translateY(20px)';
  });
}

/**
 * Animate counter
 */
function animateCounter(element) {
  const target = parseInt(element.dataset.target || element.textContent);
  const duration = parseInt(element.dataset.duration) || 2000;
  const startValue = 0;
  const increment = target / (duration / 16);
  
  let currentValue = startValue;
  
  // Fade in counter
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
  
  const timer = setInterval(() => {
    currentValue += increment;
    const displayValue = Math.floor(currentValue);
    element.textContent = displayValue.toLocaleString();
    
    if (currentValue >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
      
      // Add completion effect
      element.style.animation = 'pulse 0.5s ease-out';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    }
  }, 16);
}

/**
 * Setup progress bar animations
 */
function setupProgressBarAnimations() {
  const progressBars = document.querySelectorAll('.progress-bar-animated');
  
  progressBars.forEach(bar => {
    bar.style.width = '0%';
  });
}

/**
 * Animate progress bar
 */
function animateProgressBar(element) {
  const targetWidth = element.dataset.progress || '100';
  
  setTimeout(() => {
    element.style.width = `${targetWidth}%`;
    element.classList.add('animate');
  }, 200);
}

/**
 * Text reveal animation
 */
function animateTextReveal(element) {
  const text = element.textContent;
  const words = text.split(' ');
  
  element.innerHTML = words.map((word, index) => 
    `<span style="opacity: 0; transform: translateY(20px); transition-delay: ${index * 0.1}s">${word}</span>`
  ).join(' ');
  
  setTimeout(() => {
    const spans = element.querySelectorAll('span');
    spans.forEach(span => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    });
  }, 100);
}

/**
 * Modal animation
 */
function animateModalOpen(modal) {
  if (isReducedMotion) return;

  const container = modal.querySelector('.modal-container');
  if (container) {
    container.style.transform = 'scale(0.8) translateY(50px)';
    container.style.opacity = '0';
    
    setTimeout(() => {
      container.style.transform = 'scale(1) translateY(0)';
      container.style.opacity = '1';
    }, 50);
  }
}

/**
 * Modal close animation
 */
function animateModalClose(modal) {
  if (isReducedMotion) return;

  const container = modal.querySelector('.modal-container');
  if (container) {
    container.style.transform = 'scale(0.8) translateY(50px)';
    container.style.opacity = '0';
  }
}

/**
 * Form step animation
 */
function animateFormStep(fromStep, toStep, direction = 'forward') {
  if (isReducedMotion) return;

  const translateFrom = direction === 'forward' ? '-30px' : '30px';
  const translateTo = direction === 'forward' ? '30px' : '-30px';

  // Animate out current step
  if (fromStep) {
    fromStep.style.transform = `translateX(${translateTo})`;
    fromStep.style.opacity = '0';
  }

  // Animate in new step
  if (toStep) {
    toStep.style.transform = `translateX(${translateFrom})`;
    toStep.style.opacity = '0';
    
    setTimeout(() => {
      toStep.style.transform = 'translateX(0)';
      toStep.style.opacity = '1';
    }, 150);
  }
}

/**
 * Button click animation
 */
function animateButtonClick(button) {
  if (isReducedMotion) return;

  button.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 150);
}

/**
 * Notification animation
 */
function animateNotification(notification) {
  if (isReducedMotion) {
    notification.style.opacity = '1';
    return;
  }

  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 100);
}

/**
 * Carousel transition animation
 */
function animateCarouselTransition(wrapper, direction = 'next') {
  if (isReducedMotion) return;

  wrapper.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
}

/**
 * Loading state animation
 */
function animateLoadingState(element, isLoading) {
  if (isLoading) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
    element.classList.add('loading');
  } else {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
    element.classList.remove('loading');
  }
}

/**
 * Stagger animation for multiple elements
 */
function staggerAnimation(elements, animationClass, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, index * delay);
  });
}

/**
 * Cleanup animations on page unload
 */
window.addEventListener('beforeunload', () => {
  if (animationObserver) {
    animationObserver.disconnect();
  }
  
  // Clear any running intervals
  parallaxElements.forEach(element => {
    element.style.transform = '';
  });
});

/**
 * Update animations on resize
 */
window.addEventListener('resize', debounce(() => {
  // Recalculate parallax for mobile
  if (window.innerWidth <= 768) {
    parallaxElements.forEach(element => {
      element.style.transform = '';
    });
  } else {
    setupParallaxEffects();
  }
}, 250));

/**
 * Utility: Throttle function
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
 * Utility: Debounce function
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

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Expose functions to global scope
window.initAnimations = initAnimations;
window.animateTextReveal = animateTextReveal;
window.animateModalOpen = animateModalOpen;
window.animateModalClose = animateModalClose;
window.animateFormStep = animateFormStep;
window.animateButtonClick = animateButtonClick;
window.animateNotification = animateNotification;
window.staggerAnimation = staggerAnimation;