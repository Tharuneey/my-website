document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // ==========================================================================
    // CUSTOM CURSOR & TRAIL
    // ==========================================================================
    const cursor = document.getElementById('customCursor');
    const trail = document.getElementById('cursorTrail');
    
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    // Detect touch/mobile devices
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (cursor && trail && !isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Move immediate cursor dot instantly
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Smooth frame-rate trail follow
        const animateTrail = () => {
            // Lerp (Linear Interpolation) calculation: 10% movement per frame
            trailX += (mouseX - trailX) * 0.12;
            trailY += (mouseY - trailY) * 0.12;

            trail.style.left = trailX + 'px';
            trail.style.top = trailY + 'px';

            requestAnimationFrame(animateTrail);
        };
        animateTrail();

        // Mouse hover interactions for cursors
        const hoverElements = document.querySelectorAll('a, button, input, textarea, [data-tilt], .magnetic');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    } else if (isTouchDevice && cursor && trail) {
        // Hide cursor elements completely on touch devices
        cursor.style.display = 'none';
        trail.style.display = 'none';
    }

    // ==========================================================================
    // STICKY NAVBAR
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Navbar Overlay Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileNavOverlay) {
        const toggleMenu = () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.classList.toggle('overflow-hidden');
        };

        mobileMenuBtn.addEventListener('click', toggleMenu);
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // ==========================================================================
    // FLOATING CANVAS PARTICLES
    // ==========================================================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Particle configuration
        const isMobile = window.innerWidth <= 768;
        const particleCount = Math.min(isMobile ? 30 : 60, Math.floor((width * height) / (isMobile ? 50000 : 25000)));
        const connectionDistance = 110;
        const mouseRadius = 150;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off borders
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction (repel/attract)
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius;
                    // Subtly push particles away from mouse
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(123, 92, 240, 0.4)'; // Subtle purple tone
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw and update particle points
            particles.forEach((p) => {
                p.update();
                p.draw();
            });

            // Connect nearby particles with thin lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < connectionDistance) {
                        const alpha = (connectionDistance - dist) / connectionDistance;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(29, 184, 127, ${alpha * 0.15})`; // Subtle secondary teal links
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    // ==========================================================================
    // MAGNETIC BUTTONS
    // ==========================================================================
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const bounds = el.getBoundingClientRect();
            const elX = bounds.left + bounds.width / 2;
            const elY = bounds.top + bounds.height / 2;
            
            const pull = parseFloat(el.getAttribute('data-dist')) || 0.2;
            
            const x = (e.clientX - elX) * pull;
            const y = (e.clientY - elY) * pull;
            
            // Move item slightly towards cursor
            el.style.transform = `translate(${x}px, ${y}px)`;
            
            // If button has nested span/inner elements, translate them even more to emphasize depth
            const inner = el.querySelector('span, i');
            if (inner) {
                inner.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            const inner = el.querySelector('span, i');
            if (inner) {
                inner.style.transform = 'translate(0, 0)';
            }
        });
    });

    // ==========================================================================
    // 3D CARD PERSPECTIVE TILT
    // ==========================================================================
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    // Only enable 3D tilt on non-touch devices
    if (!isTouchDevice) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const bounds = card.getBoundingClientRect();
                const width = bounds.width;
                const height = bounds.height;
                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;

                // Normalize coordinate offsets (-0.5 to 0.5)
                const xPct = (mouseX / width) - 0.5;
                const yPct = (mouseY / height) - 0.5;

                // Maximum tilt angle (in degrees)
                const maxTilt = 12;
                const tiltX = (yPct * maxTilt).toFixed(2); // rotation about horizontal axis
                const tiltY = -(xPct * maxTilt).toFixed(2); // rotation about vertical axis

                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // ==========================================================================
    // HERO TAGLINE ROTATOR
    // ==========================================================================
    const taglines = document.querySelectorAll('.tagline-item');
    let currentTaglineIndex = 0;

    if (taglines.length > 0) {
        setInterval(() => {
            const currentTag = taglines[currentTaglineIndex];
            currentTag.classList.remove('active');
            currentTag.classList.add('exit');

            currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
            const nextTag = taglines[currentTaglineIndex];

            // Reset classes on exit node after duration finishes
            setTimeout(() => {
                currentTag.classList.remove('exit');
            }, 600);

            nextTag.classList.add('active');
        }, 3000);
    }

    // ==========================================================================
    // INTERSECTION OBSERVER (SCROLL REVEALS)
    // ==========================================================================
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Stop observing once animation triggers to lock state
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Observe standard scroll-reveal blocks
    const revealTargets = document.querySelectorAll('.scroll-reveal, .experience-card');
    revealTargets.forEach(target => {
        revealObserver.observe(target);
    });

    // Heading reveal underline animations
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.5 });

    const headerTargets = document.querySelectorAll('.section-header');
    headerTargets.forEach(target => {
        headerObserver.observe(target);
    });

    // ==========================================================================
    // FORM VALIDATION & INTERACTIVE STATE
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccessMsg');

    if (contactForm && successMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const submitBtnText = submitBtn.querySelector('span');
            const submitBtnIcon = submitBtn.querySelector('i');
            
            // Loading state mockup
            submitBtnText.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                // Success state response
                submitBtnText.textContent = 'Send Message';
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'all';
                successMsg.style.display = 'inline-flex';
                
                // Clear Form
                contactForm.reset();

                // Fade out success notification
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }
});
