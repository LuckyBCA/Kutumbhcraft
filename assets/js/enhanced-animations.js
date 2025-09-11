/**
 * Kutumbh Craft - Enhanced Animations & Effects
 * Advanced visual effects for 10x better presentation
 */

// Particle System Class
class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 50,
      particleColor: options.particleColor || 'rgba(212, 175, 55, 0.6)',
      particleSize: options.particleSize || 2,
      speed: options.speed || 0.5,
      connectionDistance: options.connectionDistance || 100,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * this.config.particleSize + 1
      });
    }
  }
  
  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections
    this.particles.forEach((particle, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = particle.x - this.particles[j].x;
        const dy = particle.y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(212, 175, 55, ${0.3 * (1 - distance / this.config.connectionDistance)})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.fill();
    });
  }
  
  animate() {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Parallax Effect Handler
class ParallaxController {
  constructor() {
    this.elements = [];
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.collectElements();
  }
  
  collectElements() {
    this.elements = [
      { element: document.querySelector('.hero-image'), speed: 0.5 },
      { element: document.querySelector('.hero-overlay'), speed: 0.3 },
      ...document.querySelectorAll('.parallax-element')
    ].filter(item => item.element);
  }
  
  bindEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  updateParallax() {
    const scrollY = window.pageYOffset;
    
    this.elements.forEach(({ element, speed }) => {
      const yPos = -(scrollY * speed);
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

// Text Animation Controller
class TextAnimationController {
  constructor() {
    this.init();
  }
  
  init() {
    this.animateHeroText();
    this.setupScrollAnimations();
  }
  
  animateHeroText() {
    const animatedElements = document.querySelectorAll('.animate-text');
    
    animatedElements.forEach((element, index) => {
      const delay = parseInt(element.dataset.delay) || index * 200;
      
      setTimeout(() => {
        element.classList.add('animate-in');
      }, delay);
    });
  }
  
  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            this.animateChildren(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    // Observe elements with scroll animations
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
  
  animateChildren(parent) {
    const children = parent.querySelectorAll('.stagger-child');
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('animate-in');
      }, index * 100);
    });
  }
}

// Cursor Effect Controller
class CustomCursor {
  constructor() {
    this.cursor = null;
    this.cursorFollower = null;
    this.init();
  }
  
  init() {
    this.createCursor();
    this.bindEvents();
  }
  
  createCursor() {
    // Create cursor dot
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    document.body.appendChild(this.cursor);
    
    // Create cursor follower
    this.cursorFollower = document.createElement('div');
    this.cursorFollower.className = 'custom-cursor-follower';
    document.body.appendChild(this.cursorFollower);
  }
  
  bindEvents() {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      this.cursor.style.left = mouseX + 'px';
      this.cursor.style.top = mouseY + 'px';
    });
    
    // Smooth follower animation
    const animateFollower = () => {
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;
      
      followerX += dx * 0.1;
      followerY += dy * 0.1;
      
      this.cursorFollower.style.left = followerX + 'px';
      this.cursorFollower.style.top = followerY + 'px';
      
      requestAnimationFrame(animateFollower);
    };
    animateFollower();
    
    // Hover effects
    document.querySelectorAll('a, button, .portfolio-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursor.classList.add('cursor-hover');
        this.cursorFollower.classList.add('cursor-hover');
      });
      
      el.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('cursor-hover');
        this.cursorFollower.classList.remove('cursor-hover');
      });
    });
  }
}

// Smooth Scroll Controller
class SmoothScrollController {
  constructor() {
    this.init();
  }
  
  init() {
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          const offset = 80; // Account for fixed header
          const targetPosition = target.offsetTop - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Theme Controller
class ThemeController {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }
  
  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
  }
  
  bindEvents() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }
  
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.classList.toggle('dark-mode', theme === 'dark');
    }
  }
}

// Loading Screen Animation
class LoadingScreenController {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.init();
  }
  
  init() {
    if (this.loadingScreen) {
      this.animateLoading();
    }
  }
  
  animateLoading() {
    const progressBar = this.loadingScreen.querySelector('.progress-bar');
    let progress = 0;
    
    const updateProgress = () => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        progressBar.style.width = '100%';
        
        setTimeout(() => {
          this.hideLoadingScreen();
        }, 500);
      } else {
        progressBar.style.width = progress + '%';
        setTimeout(updateProgress, Math.random() * 200 + 100);
      }
    };
    
    updateProgress();
  }
  
  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 600);
    }
  }
}

// Enhanced Page Transition Effects
class PageTransitionController {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupSectionTransitions();
    this.setupModalTransitions();
  }
  
  setupSectionTransitions() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-animate');
            this.animateSectionContent(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    sections.forEach(section => observer.observe(section));
  }
  
  animateSectionContent(section) {
    const elements = section.querySelectorAll('.fade-up, .fade-in, .slide-in');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 100);
    });
  }
  
  setupModalTransitions() {
    // Enhanced modal animations
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('show', () => {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('modal-show'), 10);
      });
      
      modal.addEventListener('hide', () => {
        modal.classList.remove('modal-show');
        setTimeout(() => modal.style.display = 'none', 300);
      });
    });
  }
}

// Initialize Enhanced Animations
function initEnhancedAnimations() {
  // Initialize particle system for hero section
  const heroCanvas = document.getElementById('particles-canvas');
  if (heroCanvas) {
    new ParticleSystem(heroCanvas, {
      particleCount: 80,
      particleColor: 'rgba(212, 175, 55, 0.4)',
      connectionDistance: 120,
      speed: 0.3
    });
  }
  
  // Initialize all controllers
  new ParallaxController();
  new TextAnimationController();
  new CustomCursor();
  new SmoothScrollController();
  new ThemeController();
  new LoadingScreenController();
  new PageTransitionController();
  
  console.log('Enhanced animations initialized - 10x better experience activated!');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedAnimations);
} else {
  initEnhancedAnimations();
}

// Export for use in other modules
window.initEnhancedAnimations = initEnhancedAnimations;