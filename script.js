/* ============================================================
   WARGH.IN — Premium JavaScript
   Three.js 3D Hero + All Interactions
   ============================================================ */

'use strict';

// ============================================================
// 1. CUSTOM CURSOR
// ============================================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

// Smooth ring follow
function animateCursor() {
  const speed = 0.12;
  ringX += (mouseX - ringX) * speed;
  ringY += (mouseY - ringY) * speed;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor expand on hover
const hoverTargets = document.querySelectorAll('a, button, .tab-links, .filter-btn, .portfolio-card, .service-card');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});


// ============================================================
// 2. THREE.JS 3D HERO BACKGROUND
// ============================================================
(function initThreeHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // ---- Floating Particles ----
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 12;

    sizes[i] = Math.random() * 2.5 + 0.5;

    // Color: mostly red/white with occasional gold
    const rand = Math.random();
    if (rand < 0.5) {
      // White-ish
      colors[i3] = 0.9 + Math.random() * 0.1;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    } else if (rand < 0.8) {
      // Red
      colors[i3] = 1;
      colors[i3 + 1] = 0;
      colors[i3 + 2] = 0.2;
    } else {
      // Gold
      colors[i3] = 1;
      colors[i3 + 1] = 0.85;
      colors[i3 + 2] = 0;
    }
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- 3D Wireframe Geometric Shape ----
  // Large icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xff0033,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const icosahedron = new THREE.Mesh(icoGeo, icoMat);
  icosahedron.position.set(3.5, 0.5, -2);
  scene.add(icosahedron);

  // Second shape
  const torusGeo = new THREE.TorusGeometry(1.2, 0.4, 8, 30);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(-3.5, -0.5, -1.5);
  scene.add(torus);

  // Small octahedron
  const octoGeo = new THREE.OctahedronGeometry(0.7, 0);
  const octoMat = new THREE.MeshBasicMaterial({
    color: 0xff6666,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const octahedron = new THREE.Mesh(octoGeo, octoMat);
  octahedron.position.set(0, 2.5, -1);
  scene.add(octahedron);

  // ---- Grid floor ----
  const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0xff0033,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2.2;
  grid.position.y = -3.5;
  scene.add(grid);

  // ---- Mouse interaction ----
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  // ---- Connection Lines ----
  const connectionCount = 60;
  const linePositions = new Float32Array(connectionCount * 6);
  for (let i = 0; i < connectionCount; i++) {
    const idx = i * 6;
    const base = i * 3 * 2;
    const ax = (Math.random() - 0.5) * 16;
    const ay = (Math.random() - 0.5) * 10;
    const az = (Math.random() - 0.5) * 8;
    const bx = ax + (Math.random() - 0.5) * 4;
    const by = ay + (Math.random() - 0.5) * 4;
    const bz = az + (Math.random() - 0.5) * 2;
    linePositions[idx]   = ax; linePositions[idx+1] = ay; linePositions[idx+2] = az;
    linePositions[idx+3] = bx; linePositions[idx+4] = by; linePositions[idx+5] = bz;
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xff0033,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ---- Resize handler ----
  function onResize() {
    const section = document.getElementById('home');
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // ---- Animate ----
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotate particles slowly
    particles.rotation.y = elapsed * 0.03;
    particles.rotation.x = elapsed * 0.01;

    // Camera mouse parallax
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (-targetY - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Shapes
    icosahedron.rotation.y = elapsed * 0.2;
    icosahedron.rotation.x = elapsed * 0.1;
    torus.rotation.z = elapsed * 0.15;
    torus.rotation.x = elapsed * 0.1;
    octahedron.rotation.y = elapsed * 0.3;
    octahedron.rotation.z = elapsed * 0.2;

    // Grid subtle sway
    grid.rotation.z = Math.sin(elapsed * 0.2) * 0.02;

    renderer.render(scene, camera);
  }
  animate();
})();


// ============================================================
// 3. TYPED TEXT EFFECT
// ============================================================
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const words = ['Wargh.', 'Developer.', 'AI Builder.', 'Innovator.', 'Creator.'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let delay = 150;

  function type() {
    const current = words[wordIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      delay = 80;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      delay = 150;
    }

    if (!isDeleting && charIndex === current.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  // Delay start until h1 animation finishes
  setTimeout(type, 3700);
})();


// ============================================================
// 4. NAVBAR SCROLL BEHAVIOR
// ============================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active-nav');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ============================================================
// 5. HAMBURGER / MOBILE MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
  const spans = hamburger ? hamburger.querySelectorAll('span') : [];
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}


// ============================================================
// 6. SCROLL REVEAL ANIMATION (Intersection Observer)
// ============================================================
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sibling, idx) => {
          if (sibling === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  });

  revealEls.forEach(el => observer.observe(el));
})();


// ============================================================
// 7. COUNTER ANIMATION (Stats)
// ============================================================
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        let count = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          count += step;
          if (count >= target) {
            el.textContent = target;
            clearInterval(interval);
          } else {
            el.textContent = count;
          }
        }, 45);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


// ============================================================
// 8. SKILL BARS ANIMATION
// ============================================================
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.getAttribute('data-width');
        fill.style.width = width + '%';
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => observer.observe(f));
})();


// ============================================================
// 9. ABOUT IMAGE 3D TILT EFFECT
// ============================================================
(function initImageTilt() {
  const tiltEl = document.getElementById('imgTilt');
  if (!tiltEl) return;

  tiltEl.addEventListener('mousemove', (e) => {
    const rect = tiltEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    tiltEl.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });

  tiltEl.addEventListener('mouseleave', () => {
    tiltEl.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
  });
})();


// ============================================================
// 10. TAB SYSTEM (About Section)
// ============================================================
const tablinks = document.getElementsByClassName('tab-links');
const tabcontents = document.getElementsByClassName('tab-contents');

function opentab(tabname, el) {
  for (let tablink of tablinks) {
    tablink.classList.remove('active-link');
  }
  for (let tabcontent of tabcontents) {
    tabcontent.classList.remove('active-tab');
  }
  if (el) el.classList.add('active-link');
  const tab = document.getElementById(tabname);
  if (tab) tab.classList.add('active-tab');
}


// ============================================================
// 11. PORTFOLIO FILTER
// ============================================================
(function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card, i) => {
        const category = card.getAttribute('data-category');
        const matches = filter === 'all' || category === filter;

        if (matches) {
          card.style.display = '';
          setTimeout(() => {
            card.classList.add('visible');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 60);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();


// 12. CONTACT FORM HANDLER
// ============================================================
async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const successMsg = document.getElementById('formSuccess');

  // Show loading state
  const originalBtnContent = btnText.innerHTML;
  btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // YOU NEED TO REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
  const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

  try {
    const formData = new FormData(e.target);
    
    // Check if URL is placeholder
    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      console.warn('Google Sheets SCRIPT_URL is not set. Simulating success...');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
    }

    // Success state
    btnText.innerHTML = originalBtnContent;
    btn.disabled = false;
    btn.style.opacity = '1';
    successMsg.style.display = 'flex';
    successMsg.style.color = '#2dd4b3'; // Ensure color is consistent
    e.target.reset();

    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);

  } catch (error) {
    console.error('Error!', error.message);
    btnText.innerHTML = 'Error! Try Again';
    btn.disabled = false;
    btn.style.opacity = '1';
    
    // Show error message (temporary)
    setTimeout(() => {
      btnText.innerHTML = originalBtnContent;
    }, 3000);
  }
}



// ============================================================
// 13. SERVICE CARDS 3D TILT ON MOUSE MOVE
// ============================================================
(function initCardTilt() {
  const cards = document.querySelectorAll('.service-card, .portfolio-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-12px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


// ============================================================
// 14. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ============================================================
// 15. PAGE LOAD ANIMATION
// ============================================================
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});


// ============================================================
// 16. PARTICLE MOUSE INTERACTION INDICATOR
// ============================================================
// Add a subtle glow ring that follows on mouse
(function initGlowRing() {
  const hero = document.getElementById('home');
  if (!hero) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,0,51,0.06) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 1;
    transition: opacity 0.3s;
  `;
  hero.appendChild(glow);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top = (e.clientY - rect.top) + 'px';
  });

  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  hero.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
  });
})();
