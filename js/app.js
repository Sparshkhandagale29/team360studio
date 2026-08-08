/* ============================================================
   Team 360 Turnkey Projects LLP — app.js
   ============================================================
   01. Lenis Smooth Scroll
   02. Custom Cursor
   03. Nav Hide / Show on Scroll + Active Section Tracking
   04. Hamburger Mobile Menu
   05. Intersection Observer — Fade-Up Reveal
   06. Magnetic Nav Hover
   07. Portfolio Filter
   08. FAQ Accordion
   09. Admin Login Modal
   10. Smooth Anchor Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     01. LENIS SMOOTH SCROLL (DISABLED FOR PERFORMANCE)
     Native hardware scrolling is strictly enforced to guarantee stutter-free mobile frame rates.
  ============================================= */
  // if (typeof Lenis !== 'undefined') {
  //   const lenis = new Lenis({
  //     duration: 1.4,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //     smooth: true,
  //     smoothTouch: false,
  //     wheelMultiplier: 0.85,
  //   });
  //   function raf(time) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }
  //   requestAnimationFrame(raf);
  // }

  /* =============================================
     02. CUSTOM CURSOR
  ============================================= */
  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  const hasPointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorDot && cursorRing && hasPointer) {
    // Show cursors
    cursorDot.style.opacity  = '1';
    cursorRing.style.opacity = '1';

    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    // Dot follows mouse exactly
    document.addEventListener('mousemove', (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    }, { passive: true });

    // Ring follows with lerp (smooth lag)
    function animateRing() {
      ringX += (dotX - ringX) * 0.1;
      ringY += (dotY - ringY) * 0.1;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const interactiveEls = document.querySelectorAll(
      'a, button, .portfolio-item, .accordion-item, .filter-btn, .pillar-item, .founder-card, .studio-code-item, .social-link'
    );

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
      });
    });

    // Click pulse
    document.addEventListener('mousedown', () => cursorDot.classList.add('click'));
    document.addEventListener('mouseup',   () => cursorDot.classList.remove('click'));

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity  = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity  = '1';
      cursorRing.style.opacity = '1';
    });
  } else if (cursorDot && cursorRing) {
    // Touch device — hide custom cursors
    cursorDot.style.display  = 'none';
    cursorRing.style.display = 'none';
  }

  /* =============================================
     03. NAV HIDE / SHOW ON SCROLL
  ============================================= */
  const nav     = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const current = window.scrollY;

        // Hide/show nav
        if (current > 100) {
          if (current > lastScrollY + 4) {
            nav.classList.add('nav-hidden');
            nav.classList.remove('nav-visible');
          } else if (current < lastScrollY - 4) {
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
          }
        } else {
          nav.classList.remove('nav-hidden');
        }

        lastScrollY = current;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Active nav link via IntersectionObserver
  const sections = document.querySelectorAll('section[id], div[id="pillars"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));

  /* =============================================
     04. HAMBURGER MOBILE MENU
  ============================================= */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ESC key closes mobile menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  /* =============================================
     05. INTERSECTION OBSERVER — FADE-UP
  ============================================= */
  const fadeEls = document.querySelectorAll('.fade-up, .fade-left, .slide-out-left, .slide-out-right');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* =============================================
     06. MAGNETIC NAV HOVER
  ============================================= */
  document.querySelectorAll('.nav-link:not(.nav-link-admin)').forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      link.style.transform    = `translate(${x * 0.3}px, ${y * 0.45}px)`;
      link.style.transition   = 'transform 0.15s ease';
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform  = 'translate(0, 0)';
      link.style.transition = 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  });

  /* =============================================
     11. FAST NUMERICAL COUNTING ANIMATION
  ============================================= */
  const countUpEls = document.querySelectorAll('.count-up');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countUpEls.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1500; // 1.5 seconds for fraction of a second snappy feel
          const stepTime = 16;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              clearInterval(timer);
              el.innerText = target + suffix;
            } else {
              el.innerText = Math.floor(current) + suffix;
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) {
    countObserver.observe(statsSection);
  }

  /* =============================================
     07. FAQ ACCORDION LOGIC
  ============================================= */
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('active');
      const content = btn.nextElementSibling;
      
      // Close all others
      faqToggles.forEach(otherBtn => {
        otherBtn.classList.remove('active');
        otherBtn.nextElementSibling.style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        btn.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  /* =============================================
     08. CATEGORY MODAL LOGIC
  ============================================= */
  const categoryCards = document.querySelectorAll('.category-card');
  const categoryModal = document.getElementById('category-modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  const modalGrid = document.getElementById('modal-image-grid');
  const modalTitle = document.querySelector('.modal-title');

  const categoryAssets = {
    'KITCHEN': [
      'assets/kitchen/A9P03168.jpg',
      'assets/kitchen/A9P03174.jpg',
      'assets/kitchen/A9P04421.jpg',
      'assets/kitchen/Cinematrix Production CC-173.jpg',
      'assets/kitchen/DSC00317 copy.jpg',
      'assets/kitchen/DSC00329 copy.jpg',
      'assets/kitchen/DSC00784 copy.jpg',
      'assets/kitchen/DSC02433 copy.jpg',
      'assets/kitchen/LAX_2759.JPG',
      'assets/kitchen/SDS09323.jpg'
    ],
    'BEDROOM': [
      'assets/bedroom/A9D_5145.jpg',
      'assets/bedroom/A9P03245.jpg',
      'assets/bedroom/A9P03321.jpg',
      'assets/bedroom/A9P03451.jpg',
      'assets/bedroom/A9P04360.jpg',
      'assets/bedroom/Cinematrix Production CC-102 - Copy.jpg',
      'assets/bedroom/Cinematrix Production CC-26.jpg',
      'assets/bedroom/Cinematrix Production CC-89.jpg',
      'assets/bedroom/DSC00079 copy.jpg',
      'assets/bedroom/DSC00543 copy.jpg',
      'assets/bedroom/DSC01767 copy.jpg.jpeg',
      'assets/bedroom/DSC01880 copy.jpg.jpeg',
      'assets/bedroom/DSC02058 copy.jpg.jpeg',
      'assets/bedroom/DSC02549 copy.jpg',
      'assets/bedroom/DSC_4058-HDR.jpg',
      'assets/bedroom/DSC_4070-HDR.jpg',
      'assets/bedroom/SDS09380.jpg',
      'assets/bedroom/SDS09448.jpg',
      'assets/bedroom/LAX_2701.JPG',
      'assets/bedroom/LAX_2717.JPG',
      'assets/bedroom/LAX_2724.JPG',
      'assets/bedroom/LAX_2730.JPG'
    ],
    'living-room': [
      'assets/living-room/480862264_1164825535649453_7559549229460825838_n.jpg',
      'assets/living-room/488544768_1201320528666620_8161547787248359579_n (1).jpg',
      'assets/living-room/488608802_1201320531999953_1648333591619794739_n.jpg',
      'assets/living-room/488871775_1201320455333294_1345724270905868941_n (1).jpg',
      'assets/living-room/A9P03089.jpg',
      'assets/living-room/A9P03464.jpg',
      'assets/living-room/A9P04328.jpg',
      'assets/living-room/A9P04445.jpg',
      'assets/living-room/A9P04446.jpg',
      'assets/living-room/A9P04447.jpg',
      'assets/living-room/Cinematrix Production CC-56.jpg',
      'assets/living-room/Cinematrix Production CC-68.jpg',
      'assets/living-room/Cinematrix Production CC-81.jpg',
      'assets/living-room/DSC00153 copy.jpg',
      'assets/living-room/DSC00193 copy.jpg',
      'assets/living-room/DSC00898 copy.jpg',
      'assets/living-room/DSC01972 copy.jpg',
      'assets/living-room/DSC01985 copy.jpg',
      'assets/living-room/DSC_3998-HDR.jpg',
      'assets/living-room/LAX_2600.JPG'
    ],
    'BESPOKE PLACES': [
      'assets/bespoke-spaces/481663960_1175101191288554_1435476508949320963_n.jpg',
      'assets/bespoke-spaces/488040560_1201320355333304_7378132856439543647_n.jpg',
      'assets/bespoke-spaces/488647028_1201964731935533_3269025117096844731_n.jpg',
      'assets/bespoke-spaces/A9D_5180.jpg',
      'assets/bespoke-spaces/A9P03091.jpg',
      'assets/bespoke-spaces/A9P03354.jpg',
      'assets/bespoke-spaces/A9P03360.jpg',
      'assets/bespoke-spaces/A9P03418.jpg',
      'assets/bespoke-spaces/A9P04311.jpg',
      'assets/bespoke-spaces/A9P04408.jpg',
      'assets/bespoke-spaces/A9P04451.jpg',
      'assets/bespoke-spaces/Cinematrix Production CC-117.jpg',
      'assets/bespoke-spaces/Cinematrix Production CC-68.jpg',
      'assets/bespoke-spaces/Cinematrix Production CC-71.jpg',
      'assets/bespoke-spaces/Cinematrix Production CC-81.jpg',
      'assets/bespoke-spaces/DSC00133 copy.jpg',
      'assets/bespoke-spaces/DSC00367 copy.jpg',
      'assets/bespoke-spaces/DSC00517 copy.jpg',
      'assets/bespoke-spaces/DSC00922 copy.jpg',
      'assets/bespoke-spaces/DSC02156 copy.jpg',
      'assets/bespoke-spaces/DSC02214 copy.jpg',
      'assets/bespoke-spaces/DSC02262 copy.jpg',
      'assets/bespoke-spaces/DSC02345 copy.jpg',
      'assets/bespoke-spaces/SDS09399.jpg',
      'assets/bespoke-spaces/LAX_2616.JPG',
      'assets/bespoke-spaces/LAX_2778.JPG',
      'assets/bespoke-spaces/LAX_2793.JPG',
      'assets/bespoke-spaces/LAX_2821.JPG',
      'assets/bespoke-spaces/LAX_2847.JPG'
    ],
    'dining-area': [
      'assets/dining-area/A9P03058.jpg',
      'assets/dining-area/A9P03068.jpg',
      'assets/dining-area/A9P04383.jpg',
      'assets/dining-area/A9P04398.jpg',
      'assets/dining-area/DSC00334 copy.jpg',
      'assets/dining-area/DSC02020 copy.jpg',
      'assets/dining-area/DSC02165 copy.jpg',
      'assets/dining-area/DSC_4029.jpg'
    ]
  };

  function openCategoryModal(categoryName) {
    if (!categoryModal) return;
    try {
      modalTitle.textContent = categoryName;
      
      // Dynamically populate images
      if (modalGrid) {
        modalGrid.innerHTML = '';
        
        // Find matching key robustly (case-insensitive, space/hyphen agnostic)
        const targetName = categoryName.toUpperCase().replace(/\s+/g, '-');
        let matchedKey = null;
        for (const key in categoryAssets) {
          if (key.toUpperCase().replace(/\s+/g, '-') === targetName || key.toUpperCase() === categoryName.toUpperCase()) {
            matchedKey = key;
            break;
          }
        }
        
        const images = matchedKey ? categoryAssets[matchedKey] : [];
        if (images && images.length > 0) {
          images.forEach(src => {
            const img = document.createElement('img');
            const extIndex = src.lastIndexOf('.');
            const thumbSrc = extIndex !== -1 ? src.substring(0, extIndex) + '_thumb' + src.substring(extIndex) : src;
            
            img.src = thumbSrc;
            img.alt = categoryName;
            img.className = 'modal-grid-item portfolio-img-uncropped';
            img.loading = 'lazy';
            img.setAttribute('data-fullsrc', src);
            
            img.onerror = function() {
                if (this.src !== src) {
                    this.src = src;
                }
            };
            
            modalGrid.appendChild(img);
          });
        }
      }
      
      categoryModal.style.cssText = "display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 9999999 !important;";
      document.body.style.overflow = 'hidden';
    } catch (e) {
      console.error(e);
      document.body.style.overflow = '';
    }
  }

  function closeCategoryModal() {
    if (!categoryModal) return;
    categoryModal.style.cssText = "";
    categoryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  const matrixSection = document.querySelector('.portfolio-matrix-section');
  if (matrixSection) {
    matrixSection.addEventListener('click', function(e) {
      const card = e.target.closest('.category-card');
      if (!card) return;
      
      const catName = card.querySelector('.category-card-content').textContent.trim().toUpperCase();
      openCategoryModal(catName);
    });

    matrixSection.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.category-card');
        if (!card) return;
        e.preventDefault();
        
        const catName = card.querySelector('.category-card-content').textContent.trim().toUpperCase();
        openCategoryModal(catName);
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeCategoryModal);
  }

  // Close on outside click
  if (categoryModal) {
    categoryModal.addEventListener('click', (e) => {
      if (e.target === categoryModal) {
        closeCategoryModal();
      }
    });
  }

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && categoryModal && categoryModal.classList.contains('active')) {
      closeCategoryModal();
    }
  });
  /* =============================================
     09. PORTFOLIO LIGHTBOX LOGIC
  ============================================= */
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-target-img');
  const lightboxCloseBtn = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg && lightboxCloseBtn) {
    // Preload high-res image exactly when the user hovers over the thumbnail
    document.body.addEventListener('mouseover', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('portfolio-img-uncropped')) {
        const fullSrc = e.target.getAttribute('data-fullsrc');
        if (fullSrc) {
          const tempImg = new Image();
          tempImg.src = fullSrc; // Starts downloading instantly before they even click
        }
      }
    });

    // Open lightbox when an image is clicked
    document.body.addEventListener('click', (e) => {
      if (e.target.classList.contains('portfolio-img-uncropped')) {
        const fullSrc = e.target.getAttribute('data-fullsrc');
        if (fullSrc) {
          lightboxImg.src = fullSrc;
          lightboxImg.style.transform = 'scale(0.95)';
          lightboxImg.style.opacity = '0';
          lightbox.style.display = 'flex';
          
          // Force a slight delay to allow display flex to apply before scaling transition
          setTimeout(() => {
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.opacity = '1';
          }, 10);
        }
      }
    });

    function closeLightbox() {
      lightboxImg.style.transform = 'scale(0.95)';
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
      }, 300); // Matches transition
    }

    lightboxCloseBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        closeLightbox();
      }
    });
    
    // Lightbox Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const distance = touchEndX - touchStartX;
      if (Math.abs(distance) > 50) {
        // Visual feedback for swipe since we are displaying a static image subset
        lightboxImg.style.transform = 'scale(0.98)';
        setTimeout(() => lightboxImg.style.transform = 'scale(1)', 150);
      }
    }
  }

  /* =============================================
     10. COMMERCIAL AUTO-SCROLL
  ============================================= */
  const commercialTrack = document.querySelector('.commercial-scroll-track');
  if (commercialTrack) {
    let currentImgIndex = 0;
    const commercialItems = commercialTrack.querySelectorAll('.commercial-item');
    if (commercialItems.length > 0) {
      /* 
      setInterval(() => {
        // Pause on hover or touch
        if (!commercialTrack.matches(':hover') && !commercialTrack.matches(':active')) {
          currentImgIndex = (currentImgIndex + 1) % commercialItems.length;
          
          // Calculate exact pixel position of target image relative to the container track
          const targetOffset = commercialItems[currentImgIndex].offsetLeft - commercialTrack.offsetLeft;
          
          // Smooth scroll ONLY the container track internally
          commercialTrack.scrollTo({
            left: targetOffset,
            behavior: 'smooth'
          });
        }
      }, 7000); 
      */
    }
  }

  // Navigation Arrow Smooth Scrolling Logic
  const bindTrackArrows = (leftArrowSelector, rightArrowSelector, trackSelector) => {
    const leftArrow = document.querySelector(leftArrowSelector);
    const rightArrow = document.querySelector(rightArrowSelector);
    const track = document.querySelector(trackSelector);
    
    if (!track || !leftArrow || !rightArrow) return;

    rightArrow.addEventListener("click", () => {
      const slideWidth = track.clientWidth * 0.75; // Smooth scroll skip ratio
      track.scrollBy({ left: slideWidth, behavior: "smooth" });
    });

    leftArrow.addEventListener("click", () => {
      const slideWidth = track.clientWidth * 0.75;
      track.scrollBy({ left: -slideWidth, behavior: "smooth" });
    });
  };

  // Execute Symmetrical Mappings Across Containers
  bindTrackArrows(".res-arrow-left", ".res-arrow-right", ".residential-track");
  bindTrackArrows(".com-arrow-left", ".com-arrow-right", "#commercial .commercial-track");
  bindTrackArrows(".hosp-prev", ".hosp-next", "#hospitality .hospitality-track");

  // Hospitality Lightbox Binding
  window.openFullGalleryLightbox = function(src) {
      const lightbox = document.getElementById('portfolio-lightbox');
      const lightboxImg = document.getElementById('lightbox-target-img');
      if (lightbox && lightboxImg) {
          lightboxImg.src = src;
          lightboxImg.style.transform = 'scale(0.95)';
          lightboxImg.style.opacity = '0';
          lightbox.style.display = 'flex';
          setTimeout(() => {
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.opacity = '1';
          }, 10);
      }
  };

  document.querySelectorAll('#hospitality .portfolio-img-uncropped').forEach(img => {
      img.addEventListener('click', () => {
          if (typeof openFullGalleryLightbox === 'function') {
              const src = img.getAttribute('data-fullsrc') || img.src;
              openFullGalleryLightbox(src);
          }
      });
  });

}); // END DOMContentLoaded
