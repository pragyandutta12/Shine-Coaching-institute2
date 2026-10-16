/* ==========================================================================
   SHINE COACHING INSTITUTE - TRANSFORMER MORPH & SEAMLESS ROUTING ENGINE
   Bidirectional 3D Card Flipping, Kinetic Typography Morph & Section Routing
   ========================================================================== */

(function () {
    'use strict';

    // 1. Mark preloader as bypassed if session is active
    if (sessionStorage.getItem('shine_preloader_shown')) {
        document.documentElement.classList.add('preloader-bypassed');
        const preloader = document.getElementById('site-preloader');
        if (preloader) {
            preloader.classList.add('loaded');
            preloader.style.display = 'none';
        }
        document.body.classList.add('hero-stagger-ready');
    }

    let currentMode = 'home';

    // 2. Transformer Switch Function (Home <-> About <-> Sections)
    window.transformToMode = function (targetMode, targetHash = '') {
        const cardContainer = document.getElementById('transformerCardContainer');
        const paneHome = document.getElementById('paneHome');
        const paneAbout = document.getElementById('paneAbout');
        const homeSections = document.getElementById('homeSectionsContainer');
        const aboutSections = document.getElementById('aboutSectionsContainer');

        if (!cardContainer || !paneHome || !paneAbout) return;

        const isModeChanging = (currentMode !== targetMode);
        currentMode = targetMode;

        // A. Handle 3D Card & Kinetic Text Transformation if mode is changing
        if (isModeChanging) {
            // Trigger 3D Card Flipping Animation
            cardContainer.classList.remove('transforming');
            void cardContainer.offsetWidth; // force reflow
            cardContainer.classList.add('transforming');

            if (targetMode === 'about') {
                cardContainer.classList.add('mode-about');
            } else {
                cardContainer.classList.remove('mode-about');
            }

            // Trigger Kinetic Text Stage Animation
            if (targetMode === 'about') {
                paneHome.classList.add('pane-animating-out');
                paneAbout.classList.add('pane-animating-in');
                paneAbout.classList.remove('pane-inactive');
                paneAbout.classList.add('pane-active');

                setTimeout(() => {
                    paneHome.classList.remove('pane-active', 'pane-animating-out');
                    paneHome.classList.add('pane-inactive');
                    paneAbout.classList.remove('pane-animating-in');
                }, 400);
            } else {
                paneAbout.classList.add('pane-animating-out');
                paneHome.classList.add('pane-animating-in');
                paneHome.classList.remove('pane-inactive');
                paneHome.classList.add('pane-active');

                setTimeout(() => {
                    paneAbout.classList.remove('pane-active', 'pane-animating-out');
                    paneAbout.classList.add('pane-inactive');
                    paneHome.classList.remove('pane-animating-in');
                }, 400);
            }

            // Below-Hero Content Containers Switch
            if (homeSections && aboutSections) {
                if (targetMode === 'about') {
                    homeSections.classList.remove('mode-visible');
                    homeSections.classList.add('mode-hidden');
                    aboutSections.classList.remove('mode-hidden');
                    aboutSections.classList.add('mode-visible');
                } else {
                    aboutSections.classList.remove('mode-visible');
                    aboutSections.classList.add('mode-hidden');
                    homeSections.classList.remove('mode-hidden');
                    homeSections.classList.add('mode-visible');
                }
            }
        }

        // B. Update Navigation Active Links
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (targetMode === 'about' && (href === 'about.html' || href.includes('about.html'))) {
                link.classList.add('active');
            } else if (targetMode === 'home' && !targetHash && (href === 'index.html' || href === '#' || href === 'index.html#' || href === '')) {
                link.classList.add('active');
            } else if (targetHash && (href === targetHash || href.endsWith(targetHash))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile drawer if open
        const drawer = document.getElementById('mobileDrawer');
        if (drawer) drawer.classList.remove('open');

        // C. Sync Browser URL
        const newUrl = (targetMode === 'about') ? 'about.html' : 'index.html';
        try {
            window.history.pushState({ mode: targetMode }, '', newUrl + (targetHash || ''));
        } catch (e) {}

        // D. Handle Smooth Scrolling & Spotlight Highlighting
        if (targetHash) {
            // Give DOM a frame to compute layout
            requestAnimationFrame(() => {
                const targetEl = document.querySelector(targetHash);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    targetEl.classList.remove('section-morph-highlight');
                    void targetEl.offsetWidth;
                    targetEl.classList.add('section-morph-highlight');
                }
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // E. Re-trigger Scroll Observers for newly visible content
        setTimeout(() => {
            cardContainer.classList.remove('transforming');

            if (window.ShinePageLoad) {
                window.ShinePageLoad.initTextMasking();
                window.ShinePageLoad.initImageMaskWrappers();
                window.ShinePageLoad.initScrollObserver();
            }
        }, 500);
    };

    // Alias for compatibility
    window.navigateToView = function (viewName, targetHash = '') {
        window.transformToMode(viewName === 'about' ? 'about' : 'home', targetHash);
    };

    // 3. Intercept All In-Site Navigation Clicks Universally
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip external protocols and contact actions
        if (href.startsWith('tel:') || 
            href.startsWith('mailto:') || 
            href.startsWith('https://wa.me') || 
            href.startsWith('http://') || 
            href.startsWith('https://') || 
            href.startsWith('javascript:')) {
            return;
        }

        // 1. About Us Link
        if (href === 'about.html' || href.endsWith('/about.html') || href.includes('about.html')) {
            e.preventDefault();
            const hash = href.includes('#') ? href.substring(href.indexOf('#')) : '';
            window.transformToMode('about', hash);
            return;
        }

        // 2. Home Link & Logo
        if (href === 'index.html' || href === '/' || href === './' || href === '' || href.endsWith('/index.html') || href === '#top') {
            e.preventDefault();
            window.transformToMode('home');
            return;
        }

        // 3. In-Page Section Anchor Links (#subjects, #faculty, #achievers, #location, #board-efforts)
        if (href.startsWith('#')) {
            e.preventDefault();
            // Switch to home mode where sections reside and scroll directly to the section
            window.transformToMode('home', href);
            return;
        }

        // 4. Composite Links like index.html#achievers
        if (href.includes('index.html#')) {
            e.preventDefault();
            const hash = href.substring(href.indexOf('#'));
            window.transformToMode('home', hash);
            return;
        }
    });

    // 4. Handle Browser Back / Forward History Navigation
    window.addEventListener('popstate', (e) => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (path.includes('about')) {
            window.transformToMode('about', hash);
        } else {
            window.transformToMode('home', hash);
        }
    });

    // 5. Initial Page Load Mode Setup
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        const initialMode = document.body.dataset.initialMode || (path.includes('about') ? 'about' : 'home');
        if (initialMode === 'about') {
            currentMode = 'about';
            const cardContainer = document.getElementById('transformerCardContainer');
            const paneHome = document.getElementById('paneHome');
            const paneAbout = document.getElementById('paneAbout');
            const homeSections = document.getElementById('homeSectionsContainer');
            const aboutSections = document.getElementById('aboutSectionsContainer');

            if (cardContainer) cardContainer.classList.add('mode-about');
            if (paneHome) {
                paneHome.classList.remove('pane-active');
                paneHome.classList.add('pane-inactive');
            }
            if (paneAbout) {
                paneAbout.classList.remove('pane-inactive');
                paneAbout.classList.add('pane-active');
            }
            if (homeSections) {
                homeSections.classList.remove('mode-visible');
                homeSections.classList.add('mode-hidden');
            }
            if (aboutSections) {
                aboutSections.classList.remove('mode-hidden');
                aboutSections.classList.add('mode-visible');
            }
        }
    });

})();
