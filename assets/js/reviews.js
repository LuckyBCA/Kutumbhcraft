/**
 * Kutumbh Craft - Reviews Module
 * Handles client reviews carousel and submission functionality
 */

let reviewsData = [];
let currentReviewIndex = 0;
let reviewsCarouselInterval;

/**
 * Initialize reviews functionality
 */
function initReviews() {
  loadReviewsData()
    .then(() => {
      renderReviewsCarousel();
      setupReviewsNavigation();
      setupReviewForm();
      startAutoPlay();
    })
    .catch(error => {
      console.error('Failed to initialize reviews:', error);
      showReviewsError();
    });
}

/**
 * Load reviews data from JSON file
 */
async function loadReviewsData() {
  try {
    const response = await fetch('data/reviews.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allReviews = await response.json();
    // Only show approved reviews
    reviewsData = allReviews.filter(review => review.approved);
    console.log('Reviews data loaded:', reviewsData.length, 'reviews');
  } catch (error) {
    console.error('Error loading reviews data:', error);
    reviewsData = [];
    throw error;
  }
}

/**
 * Render reviews carousel
 */
function renderReviewsCarousel() {
  const wrapper = document.querySelector('.reviews-wrapper');
  if (!wrapper || reviewsData.length === 0) return;

  wrapper.innerHTML = '';

  reviewsData.forEach((review, index) => {
    const reviewCard = createReviewCard(review, index);
    wrapper.appendChild(reviewCard);
  });

  // Show first review
  showReview(0);
}

/**
 * Create review card element
 */
function createReviewCard(review, index) {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.dataset.index = index;

  // Generate star rating
  const stars = Array.from({ length: 5 }, (_, i) => 
    `<span class="review-star ${i < review.rating ? 'filled' : ''}">${i < review.rating ? '★' : '☆'}</span>`
  ).join('');

  card.innerHTML = `
    <div class="review-rating">
      ${stars}
    </div>
    <p class="review-text">${review.review}</p>
    <div class="review-author">${review.clientName}</div>
    <div class="review-project">${review.projectType}</div>
  `;

  return card;
}

/**
 * Setup reviews navigation
 */
function setupReviewsNavigation() {
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      previousReview();
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      nextReview();
      startAutoPlay();
    });
  }

  // Touch/swipe support for mobile
  setupTouchNavigation();
}

/**
 * Setup touch navigation for mobile
 */
function setupTouchNavigation() {
  const carousel = document.querySelector('.reviews-carousel');
  if (!carousel) return;

  let startX = 0;
  let startY = 0;
  let isScrolling = false;

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isScrolling = false;
    stopAutoPlay();
  });

  carousel.addEventListener('touchmove', (e) => {
    if (isScrolling) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - startX);
    const diffY = Math.abs(currentY - startY);

    if (diffY > diffX) {
      isScrolling = true;
      return;
    }

    e.preventDefault();
  });

  carousel.addEventListener('touchend', (e) => {
    if (isScrolling) {
      startAutoPlay();
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextReview();
      } else {
        previousReview();
      }
    }

    startAutoPlay();
  });
}

/**
 * Show specific review
 */
function showReview(index) {
  if (reviewsData.length === 0) return;

  const wrapper = document.querySelector('.reviews-wrapper');
  const cards = wrapper.querySelectorAll('.review-card');
  
  if (!cards.length) return;

  // Ensure index is within bounds
  currentReviewIndex = ((index % reviewsData.length) + reviewsData.length) % reviewsData.length;

  // Calculate transform
  const translateX = -currentReviewIndex * 100;
  wrapper.style.transform = `translateX(${translateX}%)`;

  // Update active state
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === currentReviewIndex);
  });
}

/**
 * Show next review
 */
function nextReview() {
  showReview(currentReviewIndex + 1);
}

/**
 * Show previous review
 */
function previousReview() {
  showReview(currentReviewIndex - 1);
}

/**
 * Start auto-play
 */
function startAutoPlay() {
  stopAutoPlay();
  reviewsCarouselInterval = setInterval(() => {
    nextReview();
  }, 5000); // Change review every 5 seconds
}

/**
 * Stop auto-play
 */
function stopAutoPlay() {
  if (reviewsCarouselInterval) {
    clearInterval(reviewsCarouselInterval);
    reviewsCarouselInterval = null;
  }
}

/**
 * Setup review form
 */
function setupReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', handleReviewSubmit);

  // Setup star rating interaction
  setupStarRating();
}

/**
 * Setup star rating interaction
 */
function setupStarRating() {
  const ratingInputs = document.querySelectorAll('.rating-input input[type="radio"]');
  const stars = document.querySelectorAll('.rating-input .star');

  stars.forEach((star, index) => {
    star.addEventListener('mouseenter', () => {
      highlightStars(index + 1);
    });

    star.addEventListener('mouseleave', () => {
      const checkedRating = document.querySelector('.rating-input input[type="radio"]:checked');
      const rating = checkedRating ? parseInt(checkedRating.value) : 0;
      highlightStars(rating);
    });

    star.addEventListener('click', () => {
      const input = ratingInputs[4 - index]; // Reverse order (5 stars is index 0)
      input.checked = true;
      highlightStars(index + 1);
    });
  });

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.classList.toggle('highlighted', index < rating);
    });
  }
}

/**
 * Handle review form submission
 */
function handleReviewSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const reviewData = {
    name: formData.get('name'),
    projectType: formData.get('projectType'),
    rating: parseInt(formData.get('rating')),
    review: formData.get('review'),
    date: new Date().toISOString().split('T')[0]
  };

  // Validate form
  if (!validateReviewForm(reviewData)) {
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('[type="submit"]');
  showButtonLoading(submitBtn);

  // Simulate submission (replace with actual API call)
  setTimeout(() => {
    hideButtonLoading(submitBtn);
    showSuccessMessage('Thank you for your review! It will be published after approval.');
    
    // Close modal and reset form
    closeModal(document.getElementById('review-modal'));
    form.reset();
    
    // Reset star rating
    const stars = document.querySelectorAll('.rating-input .star');
    stars.forEach(star => star.classList.remove('highlighted'));
    
  }, 1500);
}

/**
 * Validate review form
 */
function validateReviewForm(data) {
  let isValid = true;

  // Check required fields
  if (!data.name || data.name.trim().length < 2) {
    showFieldError(document.getElementById('review-name'), 'Please enter your full name');
    isValid = false;
  }

  if (!data.projectType) {
    showFieldError(document.getElementById('review-project'), 'Please select a project type');
    isValid = false;
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    showFieldError(document.querySelector('.rating-input'), 'Please select a rating');
    isValid = false;
  }

  if (!data.review || data.review.trim().length < 10) {
    showFieldError(document.getElementById('review-text'), 'Please write a review (at least 10 characters)');
    isValid = false;
  }

  return isValid;
}

/**
 * Show reviews error message
 */
function showReviewsError() {
  const wrapper = document.querySelector('.reviews-wrapper');
  if (wrapper) {
    wrapper.innerHTML = `
      <div class="reviews-error">
        <h3>Unable to load reviews</h3>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Get featured reviews
 */
function getFeaturedReviews() {
  return reviewsData.filter(review => review.featured);
}

/**
 * Get reviews by rating
 */
function getReviewsByRating(rating) {
  return reviewsData.filter(review => review.rating === rating);
}

/**
 * Get average rating
 */
function getAverageRating() {
  if (reviewsData.length === 0) return 0;
  
  const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviewsData.length).toFixed(1);
}

/**
 * Get total reviews count
 */
function getTotalReviewsCount() {
  return reviewsData.length;
}

/**
 * Pause carousel when page is not visible
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
});

/**
 * Pause carousel when user hovers over it
 */
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.reviews-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
  }
});

// Initialize reviews when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviews);
} else {
  initReviews();
}

// Expose functions to global scope
window.initReviews = initReviews;
window.nextReview = nextReview;
window.previousReview = previousReview;
window.getFeaturedReviews = getFeaturedReviews;
window.getAverageRating = getAverageRating;