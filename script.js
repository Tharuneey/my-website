document.addEventListener('DOMContentLoaded', () => {
    // --- BACKGROUND STARFIELD GENERATION ---
    const starfield = document.getElementById('starfield');
    const starCount = window.innerWidth < 768 ? 120 : 200;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        star.style.left = `${x}vw`;
        star.style.top = `${y}vh`;
        
        // Random size 1px to 2px
        const size = Math.random() * 1 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random drift direction for some stars (about 30%)
        if (Math.random() < 0.3) {
            const duration = Math.random() * 50 + 50; // 50 to 100s
            star.style.animation = `star-drift ${duration}s linear infinite, star-twinkle ${Math.random()*3+2}s ease-in-out ${Math.random()*5}s infinite alternate`;
        } else {
            star.style.animation = `star-twinkle ${Math.random()*3+2}s ease-in-out ${Math.random()*5}s infinite alternate`;
        }
        
        starfield.appendChild(star);
    }
    
    // Add keyframes dynamically for stars
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes star-twinkle { 0% { opacity: 0.1; } 100% { opacity: 0.9; } }
        @keyframes star-drift { 0% { transform: translateX(0); } 100% { transform: translateX(200px); } }
    `;
    document.head.appendChild(style);

    // --- NAVIGATION LOGIC ---
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressDotsContainer = document.getElementById('progress-dots');
    const slideCounterText = document.getElementById('slide-counter-text');
    const slideWatermark = document.getElementById('slide-watermark');
    const navProgressFill = document.getElementById('nav-progress-fill');
    const transitionFlash = document.getElementById('transition-flash');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;

    // Initialize nav dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('progress-dot', 'clickable');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => { if (!isTransitioning) goToSlide(i); });
        progressDotsContainer.appendChild(dot);
    }
    const dots = document.querySelectorAll('.progress-dot');

    function updateNavUI(index) {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        const slideNumStr = String(index + 1).padStart(2, '0');
        const totalStr = String(totalSlides).padStart(2, '0');
        slideCounterText.textContent = `${slideNumStr} / ${totalStr}`;
        slideWatermark.textContent = slideNumStr;
        navProgressFill.style.width = `${(index / (totalSlides - 1)) * 100}%`;
    }

    // Trigger staggered entrance for content
    function triggerStaggerEnter(slide) {
        const elements = slide.querySelectorAll('.stagger-enter');
        elements.forEach(el => el.classList.remove('show')); // reset
        
        // Force reflow
        void slide.offsetWidth;

        elements.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('show');
            }, i * 80);
        });
    }

    function doTransition(fromIndex, toIndex, direction) {
        if (isTransitioning || fromIndex === toIndex) return;
        isTransitioning = true;
        
        // Disable nav
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        
        const fromSlide = slides[fromIndex];
        const toSlide = slides[toIndex];
        
        // Clean classes
        slides.forEach(s => s.classList.remove('leave-forward', 'enter-forward', 'leave-backward', 'enter-backward', 'active'));
        
        // 1. Current slide starts leaving immediately
        fromSlide.classList.add('active');
        fromSlide.classList.add(direction === 'forward' ? 'leave-forward' : 'leave-backward');
        
        // 2. Flash at 200ms
        setTimeout(() => {
            transitionFlash.classList.add('active');
            setTimeout(() => transitionFlash.classList.remove('active'), 80);
        }, 200);

        // 3. New slide enters at 200ms (overlap dissolve)
        setTimeout(() => {
            toSlide.classList.add('active');
            toSlide.classList.add(direction === 'forward' ? 'enter-forward' : 'enter-backward');
            triggerStaggerEnter(toSlide);
            updateNavUI(toIndex);
        }, 200);

        // 4. End transition lock at 600ms (200 delay + 400 duration)
        setTimeout(() => {
            fromSlide.classList.remove('active', 'leave-forward', 'leave-backward');
            toSlide.classList.remove('enter-forward', 'enter-backward');
            isTransitioning = false;
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }, 600);
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1 && !isTransitioning) {
            doTransition(currentSlide, currentSlide + 1, 'forward');
            currentSlide++;
        }
    }

    function prevSlide() {
        if (currentSlide > 0 && !isTransitioning) {
            doTransition(currentSlide, currentSlide - 1, 'backward');
            currentSlide--;
        }
    }

    function goToSlide(index) {
        if (index === currentSlide || isTransitioning) return;
        const dir = index > currentSlide ? 'forward' : 'backward';
        doTransition(currentSlide, index, dir);
        currentSlide = index;
    }

    // Init UI
    slides[0].classList.add('active');
    triggerStaggerEnter(slides[0]);
    updateNavUI(0);

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
        else if (e.key === 'ArrowLeft') prevSlide();
    });

    // --- TOUCH NAVIGATION (SWIPE GESTURES) ---
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
        if (isTransitioning) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < -50) {
                nextSlide();
            } else if (diffX > 50) {
                prevSlide();
            }
        }
    }, { passive: true });

    // --- CUSTOM CURSOR & TRAILS ---
    const cursorCore = document.getElementById('cursor-core');
    const cursorGlow = document.getElementById('cursor-glow');
    const trailsContainer = document.getElementById('cursor-trails');
    const rippleContainer = document.getElementById('ripple-container');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let lastTrailTime = 0;

    document.addEventListener('mouseover', (e) => {
        if ('ontouchstart' in window) return;
        if (e.target.closest('.clickable') || e.target.closest('button')) {
            cursorGlow.classList.add('hover-active');
            cursorCore.classList.add('hover-active');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if ('ontouchstart' in window) return;
        if (e.target.closest('.clickable') || e.target.closest('button')) {
            cursorGlow.classList.remove('hover-active');
            cursorCore.classList.remove('hover-active');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if ('ontouchstart' in window) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorCore.style.left = mouseX + 'px';
        cursorCore.style.top = mouseY + 'px';

        if (!cursorGlow.classList.contains('hover-active')) {
            const ratio = mouseX / window.innerWidth;
            const r = Math.round(124 + ratio * (20 - 124));
            const g = Math.round(58 + ratio * (184 - 58));
            const b = Math.round(237 + ratio * (166 - 237));
            cursorGlow.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        const now = Date.now();
        if (now - lastTrailTime > 50) { 
            spawnTrail(mouseX, mouseY, cursorGlow.style.backgroundColor);
            lastTrailTime = now;
        }
    });

    function animateCursor() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function spawnTrail(x, y, color) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail-dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.background = color;
        trailsContainer.appendChild(dot);
        setTimeout(() => { if(trailsContainer.contains(dot)) trailsContainer.removeChild(dot); }, 600);
    }

    document.addEventListener('mousedown', (e) => {
        if ('ontouchstart' in window) return;
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        rippleContainer.appendChild(ripple);
        setTimeout(() => { if(rippleContainer.contains(ripple)) rippleContainer.removeChild(ripple); }, 600);
    });

    // --- MAGNETIC 3D TILT, ANTI-GRAVITY & SHAPE PROXIMITY ---
    const floatingElements = document.querySelectorAll('.floating-element');
    const floatingShapes = document.querySelectorAll('.floating-shape');
    
    let time = 0;
    function animateFloating() {
        time += 0.02;
        
        floatingShapes.forEach(shape => {
            if (window.innerWidth < 768 || 'ontouchstart' in window) {
                shape.classList.remove('hover-proximity');
                return;
            }
            const rect = shape.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dist = Math.hypot(mouseX - cx, mouseY - cy);
            
            if (dist < 120) shape.classList.add('hover-proximity');
            else shape.classList.remove('hover-proximity');
        });

        floatingElements.forEach((el, index) => {
            if(el.classList.contains('fixed-nav')) return; 

            let repelX = 0, repelY = 0, tiltX = 0, tiltY = 0;
            
            if (window.innerWidth >= 768 && !('ontouchstart' in window)) {
                const rect = el.getBoundingClientRect();
                const elCenterX = rect.left + rect.width / 2;
                const elCenterY = rect.top + rect.height / 2;
                
                const dx = mouseX - elCenterX;
                const dy = mouseY - elCenterY;
                const distance = Math.hypot(dx, dy);
                
                if (distance < 150) {
                    const force = (150 - distance) / 150; 
                    repelX = -(dx / distance) * force * 30; 
                    repelY = -(dy / distance) * force * 30;
                }
                
                if (distance < 400 && el.classList.contains('glass-card')) {
                    tiltX = -(dy / rect.height) * 15; 
                    tiltY = (dx / rect.width) * 15;   
                    tiltX = Math.max(-15, Math.min(15, tiltX));
                    tiltY = Math.max(-15, Math.min(15, tiltY));
                } else if (distance < 200 && !el.classList.contains('glass-card')) {
                    tiltX = -(dy / rect.height) * 20;
                    tiltY = (dx / rect.width) * 20;
                    tiltX = Math.max(-20, Math.min(20, tiltX));
                    tiltY = Math.max(-20, Math.min(20, tiltY));
                }
            }
            
            const bobOffset = Math.sin(time + index) * 8; 

            // Preserve existing inline transforms like scale if necessary, but we manage them via CSS mostly
            el.style.transform = `
                translate3d(${repelX}px, ${repelY + bobOffset}px, 0)
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
            `;
        });
        requestAnimationFrame(animateFloating);
    }
    animateFloating();
});
