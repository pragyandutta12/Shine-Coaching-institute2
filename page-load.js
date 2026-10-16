/* ==========================================================================
   SHINE COACHING INSTITUTE - PAGE-LOAD, BIDIRECTIONAL SCROLL-REVEAL, MASK & TYPOGRAPHY
   1. Page-Load Sequence: Logo -> Thin Line -> Staggered Hero Elements
   2. Reversible Scroll-Reveal: Animate IN on scroll-down, REVERSE on scroll-up
   3. Image Mask Reveal: Rectangular Curtain Slides Away (and resets on scroll-up)
   4. Text Masking Reveal: Kinetic Typography emerges upward behind invisible masks
   ========================================================================== */

(function () {
    'use strict';

    // 1. Text Masking Initializer (Splits headings into invisible masked word containers)
    function initTextMasking() {
        const headings = document.querySelectorAll(`
            h1.hero-title, 
            .section-title, 
            .about-intro-content h2, 
            .about-intro-content h3, 
            .cta-box h2,
            header.section-alt h1
        `);

        headings.forEach(heading => {
            if (heading.dataset.masked) return;
            heading.dataset.masked = 'true';

            let wordCount = 0;

            function wrapWords(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    if (!text.trim()) return document.createTextNode(text);

                    const words = text.split(/(\s+)/);
                    const frag = document.createDocumentFragment();

                    words.forEach(w => {
                        if (w.trim().length > 0) {
                            wordCount++;
                            const wrap = document.createElement('span');
                            wrap.className = 'text-mask-wrapper';

                            const item = document.createElement('span');
                            item.className = `text-mask-item tw-${Math.min(12, wordCount)}`;
                            item.textContent = w;

                            wrap.appendChild(item);
                            frag.appendChild(wrap);
                        } else if (w.length > 0) {
                            frag.appendChild(document.createTextNode(w));
                        }
                    });

                    return frag;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const childNodes = Array.from(node.childNodes);
                    node.innerHTML = '';

                    childNodes.forEach(child => {
                        node.appendChild(wrapWords(child));
                    });

                    return node;
                }
                return node;
            }

            const children = Array.from(heading.childNodes);
            heading.innerHTML = '';
            children.forEach(child => {
                heading.appendChild(wrapWords(child));
            });
        });
    }

    // 2. Rectangular Image Mask Setup
    function initImageMaskWrappers() {
        const imageContainers = document.querySelectorAll(`
            .hero-visual-card,
            .about-intro-visual > div,
            .faculty-photo-wrapper,
            .achiever-img-wrapper,
            .gallery-item,
            .about-photo-badge,
            .about-intro-visual
        `);

        imageContainers.forEach((container) => {
            if (container.querySelector('img') && !container.classList.contains('mask-reveal-wrap')) {
                container.classList.add('mask-reveal-wrap');

                if (container.classList.contains('faculty-photo-wrapper')) {
                    container.classList.add('mask-variant-vertical');
                } else if (container.classList.contains('achiever-img-wrapper')) {
                    container.classList.add('mask-variant-center');
                }

                if (!container.querySelector('.mask-curtain')) {
                    const curtain = document.createElement('div');
                    curtain.className = 'mask-curtain';
                    container.appendChild(curtain);
                }
            }
        });
    }

    // 3. Bidirectional (Reversible) Scroll-Reveal & Mask Reveal Observer
    let activeScrollObserver = null;

    function initScrollObserver() {
        const staggeredContainers = document.querySelectorAll(`
            .advantages-grid, 
            .courses-grid, 
            .faculty-grid, 
            .achievers-grid, 
            .reviews-grid, 
            .about-intro-grid, 
            .about-values-grid,
            .location-details-list,
            .hero-trust-row,
            .values-checklist,
            .achievement-banners-grid,
            .parent-features-list
        `);

        staggeredContainers.forEach(container => {
            const children = Array.from(container.children);
            children.forEach((child, index) => {
                if (!child.classList.contains('scroll-reveal')) {
                    child.classList.add('scroll-reveal');
                }
                const staggerIndex = (index % 10) + 1;
                child.classList.add(`stagger-${staggerIndex}`);
            });
        });

        const standaloneSections = document.querySelectorAll(`
            .section-header,
            .about-intro-content,
            .about-intro-visual,
            .cta-box,
            .location-info-card,
            .map-container-box,
            .motivation-banner,
            .parent-content,
            .parent-card-wrapper,
            .footer-grid > div
        `);

        standaloneSections.forEach(el => {
            if (!el.classList.contains('scroll-reveal')) {
                el.classList.add('scroll-reveal');
            }
        });

        const allRevealElements = document.querySelectorAll('.scroll-reveal, .mask-reveal-wrap, .reveal, .reveal-left, .reveal-right');

        if ('IntersectionObserver' in window) {
            if (activeScrollObserver) {
                activeScrollObserver.disconnect();
            }

            activeScrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const target = entry.target;

                    if (entry.isIntersecting) {
                        // SCROLLING INTO VIEW (DOWN OR UP): Trigger Reveal Animation
                        target.classList.add('revealed');
                        target.classList.add('is-visible');

                        if (target.classList.contains('mask-reveal-wrap')) {
                            setTimeout(() => {
                                if (target.classList.contains('revealed') || target.classList.contains('is-visible')) {
                                    target.classList.add('mask-revealed');
                                }
                            }, 80);
                        }

                        const nestedMasks = target.querySelectorAll('.mask-reveal-wrap');
                        nestedMasks.forEach((m, idx) => {
                            setTimeout(() => {
                                if (target.classList.contains('revealed') || target.classList.contains('is-visible')) {
                                    m.classList.add('mask-revealed');
                                }
                            }, 80 + (idx * 100));
                        });
                    } else {
                        // SCROLLING OUT OF VIEW: Smoothly Reverse and Reset Animation
                        target.classList.remove('revealed');
                        target.classList.remove('is-visible');
                        target.classList.remove('mask-revealed');

                        const nestedMasks = target.querySelectorAll('.mask-reveal-wrap');
                        nestedMasks.forEach(m => m.classList.remove('mask-revealed'));
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -10px 0px'
            });

            allRevealElements.forEach(el => activeScrollObserver.observe(el));
        } else {
            allRevealElements.forEach(el => {
                el.classList.add('revealed');
                el.classList.add('is-visible');
                el.classList.add('mask-revealed');
            });
        }
    }

    // 4. Page-Load Sequence & Session Check
    function initPageLoadSequence() {
        const preloader = document.getElementById('site-preloader');
        const alreadyVisited = sessionStorage.getItem('shine_preloader_shown');

        if (alreadyVisited) {
            // Instant bypass for internal transitions / revisits
            if (preloader) {
                preloader.classList.add('loaded');
                preloader.style.display = 'none';
            }
            document.documentElement.classList.add('preloader-bypassed');
            document.body.classList.add('hero-stagger-ready');
            initTextMasking();
            initImageMaskWrappers();
            initScrollObserver();

            setTimeout(() => {
                const heroImg = document.querySelector('.transformer-face');
                if (heroImg) heroImg.classList.add('mask-revealed');
            }, 50);
            return;
        }

        // First Visit: Run Premium 0.85s Sequence
        sessionStorage.setItem('shine_preloader_shown', 'true');
        const startTime = Date.now();
        const minDisplayDuration = 850;

        function dismissPreloader() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDisplayDuration - elapsed);

            setTimeout(() => {
                if (preloader) {
                    preloader.classList.add('loaded');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 600);
                }

                document.body.classList.add('hero-stagger-ready');
                initTextMasking();
                initImageMaskWrappers();
                initScrollObserver();

                setTimeout(() => {
                    const heroImg = document.querySelector('.transformer-face');
                    if (heroImg) heroImg.classList.add('mask-revealed');
                }, 350);
            }, remaining);
        }

        if (document.readyState === 'complete') {
            dismissPreloader();
        } else {
            window.addEventListener('load', dismissPreloader);
            setTimeout(dismissPreloader, 1400); // Safety fallback
        }
    }

    // Expose helpers globally
    window.ShinePageLoad = {
        initTextMasking,
        initImageMaskWrappers,
        initScrollObserver
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageLoadSequence);
    } else {
        initPageLoadSequence();
    }
})();
