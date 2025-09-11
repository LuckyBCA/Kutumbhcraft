/**
 * Kutumbh Craft - Portfolio Module
 * Handles portfolio gallery, filtering, and modal functionality
 */

let portfolioData = [];
let filteredProjects = [];
let currentFilter = 'all';
let visibleProjects = 6; // Initial number of projects to show
const projectsPerLoad = 6; // Number of projects to load when "Load More" is clicked

/**
 * Initialize portfolio functionality
 */
function initPortfolio() {
  loadPortfolioData()
    .then(() => {
      setupPortfolioFilters();
      renderPortfolioGrid();
      setupPortfolioModal();
      setupLoadMoreButton();
    })
    .catch(error => {
      console.error('Failed to initialize portfolio:', error);
      showPortfolioError();
    });
}

/**
 * Load portfolio data from JSON file
 */
async function loadPortfolioData() {
  try {
    const response = await fetch('data/portfolio.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    portfolioData = await response.json();
    filteredProjects = [...portfolioData];
    console.log('Portfolio data loaded:', portfolioData.length, 'projects');
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    // Fallback to empty array
    portfolioData = [];
    filteredProjects = [];
    throw error;
  }
}

/**
 * Setup portfolio filter functionality
 */
function setupPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      // Get filter value
      const filter = event.target.dataset.filter;
      currentFilter = filter;
      
      // Filter projects
      filterProjects(filter);
      
      // Reset visible projects count
      visibleProjects = projectsPerLoad;
      
      // Re-render grid
      renderPortfolioGrid();
    });
  });
}

/**
 * Filter projects based on category
 */
function filterProjects(filter) {
  if (filter === 'all') {
    filteredProjects = [...portfolioData];
  } else {
    filteredProjects = portfolioData.filter(project => project.category === filter);
  }
  
  console.log(`Filtered projects for "${filter}":`, filteredProjects.length);
}

/**
 * Render portfolio grid
 */
function renderPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) {
    console.error('Portfolio grid element not found');
    return;
  }
  
  // Clear existing items
  grid.innerHTML = '';
  
  // Get projects to display
  const projectsToShow = filteredProjects.slice(0, visibleProjects);
  
  // Render each project
  projectsToShow.forEach((project, index) => {
    const projectElement = createPortfolioItem(project);
    grid.appendChild(projectElement);
    
    // Animate in with stagger
    setTimeout(() => {
      projectElement.classList.add('show');
    }, index * 100);
  });
  
  // Update load more button visibility
  updateLoadMoreButton();
  
  // Setup intersection observer for animations
  observePortfolioItems();
}

/**
 * Create portfolio item element
 */
function createPortfolioItem(project) {
  const item = document.createElement('div');
  item.className = 'portfolio-item animate-on-scroll';
  item.dataset.projectId = project.id;
  item.dataset.category = project.category;
  
  // Get the first image for the main display
  const mainImage = project.images[0];
  const imageUrl = getImageUrl(mainImage.src);
  const thumbnailUrl = getImageUrl(mainImage.thumbnail);
  
  item.innerHTML = `
    <div class="portfolio-image-container">
      <img 
        src="${thumbnailUrl}" 
        data-src="${imageUrl}"
        alt="${mainImage.alt}"
        class="portfolio-image lazyload"
        loading="lazy"
      >
      <div class="portfolio-overlay">
        <div class="portfolio-overlay-content">
          <span class="portfolio-category">${getCategoryDisplayName(project.category)}</span>
          <h3 class="portfolio-overlay-title">${project.title}</h3>
          <button class="portfolio-view-btn" aria-label="View ${project.title} details">
            View Details
          </button>
        </div>
      </div>
    </div>
    <div class="portfolio-content">
      <h3 class="portfolio-title">${project.title}</h3>
      <p class="portfolio-description">${project.description}</p>
      <div class="portfolio-details">
        <span class="portfolio-location">${project.details.location}</span>
        <span class="portfolio-year">${project.details.year}</span>
      </div>
    </div>
  `;
  
  // Add click handler
  item.addEventListener('click', () => {
    openPortfolioModal(project.id);
  });
  
  // Add keyboard support
  item.setAttribute('tabindex', '0');
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPortfolioModal(project.id);
    }
  });
  
  return item;
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category) {
  const categoryNames = {
    'interior': 'Interior Design',
    'exterior': 'Exterior Design',
    '3d-model': '3D Visualization',
    'site-plan': 'Site Planning'
  };
  
  return categoryNames[category] || category;
}

/**
 * Get image URL with fallback
 */
function getImageUrl(imagePath) {
  // Return the actual image path
  return imagePath;
}

/**
 * Setup load more button
 */
function setupLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;
  
  loadMoreBtn.addEventListener('click', () => {
    // Show loading state
    showButtonLoading(loadMoreBtn);
    
    // Simulate loading delay
    setTimeout(() => {
      visibleProjects += projectsPerLoad;
      renderPortfolioGrid();
      hideButtonLoading(loadMoreBtn);
    }, 800);
  });
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;
  
  if (visibleProjects >= filteredProjects.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-flex';
  }
}

/**
 * Setup portfolio modal functionality
 */
function setupPortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  
  // Setup gallery navigation
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => navigateModalGallery('prev'));
    nextBtn.addEventListener('click', () => navigateModalGallery('next'));
  }
  
  // Setup keyboard navigation
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      navigateModalGallery('prev');
    } else if (event.key === 'ArrowRight') {
      navigateModalGallery('next');
    }
  });
}

/**
 * Open portfolio modal
 */
function openPortfolioModal(projectId) {
  const project = portfolioData.find(p => p.id === projectId);
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }
  
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  
  // Update modal content
  updateModalContent(project);
  
  // Open modal
  openModal('portfolio-modal');
  
  // Initialize gallery
  initializeModalGallery(project);
}

/**
 * Update modal content with project data
 */
function updateModalContent(project) {
  // Update title
  const title = document.getElementById('portfolio-modal-title');
  if (title) {
    title.textContent = project.title;
  }
  
  // Update main image
  const mainImage = document.getElementById('modal-main-image');
  if (mainImage && project.images[0]) {
    mainImage.src = getImageUrl(project.images[0].src);
    mainImage.alt = project.images[0].alt;
  }
  
  // Update thumbnails
  const thumbnailsContainer = document.getElementById('modal-thumbnails');
  if (thumbnailsContainer) {
    thumbnailsContainer.innerHTML = '';
    
    project.images.forEach((image, index) => {
      const thumbnail = document.createElement('img');
      thumbnail.className = `gallery-thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.src = getImageUrl(image.thumbnail);
      thumbnail.alt = image.alt;
      thumbnail.dataset.index = index;
      
      thumbnail.addEventListener('click', () => {
        setActiveImage(index, project);
      });
      
      thumbnailsContainer.appendChild(thumbnail);
    });
  }
  
  // Update project details
  const detailsContainer = document.getElementById('modal-project-details');
  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="detail-item">
        <div class="detail-label">Location</div>
        <div class="detail-value">${project.details.location}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Year</div>
        <div class="detail-value">${project.details.year}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Area</div>
        <div class="detail-value">${project.details.area}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Client</div>
        <div class="detail-value">${project.details.client}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Category</div>
        <div class="detail-value">${getCategoryDisplayName(project.category)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Description</div>
        <div class="detail-value">${project.description}</div>
      </div>
    `;
  }
}

/**
 * Initialize modal gallery
 */
function initializeModalGallery(project) {
  const modal = document.getElementById('portfolio-modal');
  if (modal) {
    modal.currentProject = project;
    modal.currentImageIndex = 0;
  }
}

/**
 * Navigate modal gallery
 */
function navigateModalGallery(direction) {
  const modal = document.getElementById('portfolio-modal');
  if (!modal || !modal.currentProject) return;
  
  const project = modal.currentProject;
  const currentIndex = modal.currentImageIndex || 0;
  let newIndex;
  
  if (direction === 'prev') {
    newIndex = currentIndex > 0 ? currentIndex - 1 : project.images.length - 1;
  } else {
    newIndex = currentIndex < project.images.length - 1 ? currentIndex + 1 : 0;
  }
  
  setActiveImage(newIndex, project);
}

/**
 * Set active image in modal gallery
 */
function setActiveImage(index, project) {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  
  modal.currentImageIndex = index;
  
  // Update main image
  const mainImage = document.getElementById('modal-main-image');
  if (mainImage) {
    mainImage.classList.add('changing');
    
    setTimeout(() => {
      mainImage.src = getImageUrl(project.images[index].src);
      mainImage.alt = project.images[index].alt;
      mainImage.classList.remove('changing');
    }, 150);
  }
  
  // Update active thumbnail
  const thumbnails = document.querySelectorAll('.gallery-thumbnail');
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

/**
 * Observe portfolio items for animations
 */
function observePortfolioItems() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        
        // Lazy load images
        const lazyImage = entry.target.querySelector('.lazyload');
        if (lazyImage && lazyImage.dataset.src) {
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazyload');
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach(item => observer.observe(item));
}

/**
 * Show portfolio error message
 */
function showPortfolioError() {
  const grid = document.getElementById('portfolio-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="portfolio-error">
        <h3>Unable to load portfolio</h3>
        <p>Please try refreshing the page or contact us if the problem persists.</p>
        <button class="btn-primary" onclick="location.reload()">
          <span class="btn-text">Refresh Page</span>
        </button>
      </div>
    `;
  }
}

/**
 * Search portfolio projects
 */
function searchPortfolio(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    filteredProjects = [...portfolioData];
  } else {
    filteredProjects = portfolioData.filter(project => 
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.details.location.toLowerCase().includes(term) ||
      getCategoryDisplayName(project.category).toLowerCase().includes(term)
    );
  }
  
  visibleProjects = projectsPerLoad;
  renderPortfolioGrid();
}

/**
 * Get featured projects
 */
function getFeaturedProjects() {
  return portfolioData.filter(project => project.featured);
}

/**
 * Get projects by category
 */
function getProjectsByCategory(category) {
  return portfolioData.filter(project => project.category === category);
}

/**
 * Get random projects
 */
function getRandomProjects(count = 3) {
  const shuffled = [...portfolioData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Initialize portfolio when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

// Expose functions to global scope
window.initPortfolio = initPortfolio;
window.openPortfolioModal = openPortfolioModal;
window.searchPortfolio = searchPortfolio;
window.getFeaturedProjects = getFeaturedProjects;