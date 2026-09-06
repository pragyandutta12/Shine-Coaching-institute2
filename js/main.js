/**
 * Shine Coaching Institute - Main Homepage & Public Interaction Script
 * Handles animations, dynamic DB content rendering, modal forms, achievement banners, lightbox, and 1-5 star rating selector.
 */

document.addEventListener("DOMContentLoaded", async function() {
    // 1. Initialize Scroll Animations (Intersection Observer)
    initScrollAnimations();

    // 1.1 Initialize Number / Stat Counter Animations
    initStatCounterAnimations();

    // 1.2 Initialize Interactive Card Spotlight Effects
    initInteractiveCardSpotlights();

    // 2. Initialize Navigation & Mobile Drawer
    initNavigation();

    // 3. Load Dynamic Site Content & Placeholders
    await loadSiteContent();

    // 4. Load Dynamic Subjects from DB
    await loadSubjects();

    // 4.5 Load Dynamic Faculties from DB
    await loadFaculties();

    // 5. Load Real Reviews
    await loadReviews();

    // 6. Load Real Achievers & Result Posters
    await loadToppers();

    // 7. Initialize Modals & Interactive 1-5 Star Picker
    initBookingModals();

    // 8. Initialize Lightbox
    initLightbox();

    // 9. Listen for cross-tab or runtime DB updates
    window.addEventListener("shine_db_updated", async function(e) {
        if (e.detail && (e.detail.type === "review" || e.detail.type === "review_update" || e.detail.type === "review_delete")) {
            await loadReviews();
        }
        if (e.detail && (e.detail.type === "topper" || e.detail.type === "topper_update" || e.detail.type === "topper_delete" || e.detail.type === "banner" || e.detail.type === "banner_update" || e.detail.type === "banner_delete")) {
            await loadToppers();
        }
        if (e.detail && (e.detail.type === "subject_add" || e.detail.type === "subject_update" || e.detail.type === "subject_delete")) {
            await loadSubjects();
        }
        if (e.detail && (e.detail.type === "faculty_add" || e.detail.type === "faculty_update" || e.detail.type === "faculty_delete")) {
            await loadFaculties();
        }
        if (e.detail && e.detail.type === "site_content") {
            await loadSiteContent();
        }
    });
});

/**
 * Animated Number / Stat Counters
 */
function initStatCounterAnimations() {
    const counters = document.querySelectorAll(".stat-counter");
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.getAttribute("data-target")) || 0;
                const decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                const duration = 1600;
                const startTime = performance.now();

                function updateCount(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentVal = easeProgress * target;

                    el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
                    }
                }

                requestAnimationFrame(updateCount);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
}

/**
 * Interactive Mouse Spotlight Effect for Cards
 */
function initInteractiveCardSpotlights() {
    const cards = document.querySelectorAll(".adv-card, .subject-card, .topper-card, .review-card-item");
    cards.forEach(card => {
        card.addEventListener("mousemove", function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.style.setProperty("--mouse-x", `${x}px`);
            this.style.setProperty("--mouse-y", `${y}px`);
        });
    });
}

/**
 * Scroll-triggered animations using IntersectionObserver
 */
function initScrollAnimations() {
    const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (!("IntersectionObserver" in window)) {
        reveals.forEach(el => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    reveals.forEach(el => observer.observe(el));
}

/**
 * Sticky Navbar & Mobile Drawer
 */
function initNavigation() {
    const navbar = document.querySelector(".navbar");
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");

    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 20) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    if (mobileBtn && mobileDrawer) {
        mobileBtn.addEventListener("click", () => {
            mobileDrawer.classList.toggle("open");
        });

        mobileDrawer.querySelectorAll("a, button").forEach(item => {
            item.addEventListener("click", () => {
                mobileDrawer.classList.remove("open");
            });
        });
    }
}

/**
 * Load Dynamic Content from DB / Config
 */
async function loadSiteContent() {
    if (!window.DB) return;
    try {
        const content = await window.DB.getSiteContent();
        
        // Hero
        const heroTitle = document.getElementById("heroTitle");
        const heroSub = document.getElementById("heroSubtitle");
        if (heroTitle && content.hero_title) heroTitle.innerHTML = formatHighlight(content.hero_title);
        if (heroSub && content.hero_subtitle) heroSub.textContent = content.hero_subtitle;

        // Motivational
        const motQuote = document.getElementById("motivationalQuote");
        const motSub = document.getElementById("motivationalSub");
        if (motQuote && content.motivational_quote) motQuote.textContent = `"${content.motivational_quote}"`;
        if (motSub && content.motivational_sub) motSub.textContent = content.motivational_sub;

        // Intro
        const introP1 = document.getElementById("introP1");
        const introP2 = document.getElementById("introP2");
        if (introP1 && content.intro_p1) introP1.textContent = content.intro_p1;
        if (introP2 && content.intro_p2) introP2.textContent = content.intro_p2;

        // CTA
        const ctaHead = document.getElementById("ctaHeading");
        const ctaSub = document.getElementById("ctaSubtitle");
        if (ctaHead && content.cta_heading) ctaHead.textContent = content.cta_heading;
        if (ctaSub && content.cta_subtitle) ctaSub.textContent = content.cta_subtitle;

        // Contact Placeholders & Links
        if (content.contact) {
            const phone = content.contact.phone || "9365915462";
            const whatsapp = content.contact.whatsapp || phone;
            const address = content.contact.address || "Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353";
            const cleanWhatsapp = whatsapp.replace(/\D/g, "");

            document.querySelectorAll(".site-phone").forEach(el => el.textContent = phone);
            document.querySelectorAll(".site-address").forEach(el => el.textContent = address);
            document.querySelectorAll("a[href^='tel:']").forEach(a => a.href = `tel:${phone}`);
            document.querySelectorAll("a[href*='wa.me']").forEach(a => {
                a.href = `https://wa.me/91${cleanWhatsapp.startsWith("91") ? cleanWhatsapp.slice(2) : cleanWhatsapp}`;
            });
        }
    } catch (e) {
        console.error("Error loading site content:", e);
    }
}

function formatHighlight(text) {
    if (text.includes(".")) {
        const parts = text.split(".");
        return `<span class="highlight">${parts[0]}.</span> ${parts.slice(1).join(".")}`;
    }
    return text;
}

/**
 * Load Dynamic Subjects into Homepage Grid
 */
async function loadSubjects() {
    if (!window.DB) return;
    const grid = document.getElementById("subjectsGrid");
    if (!grid) return;

    try {
        const subjects = await window.DB.getSubjects("active");
        if (!subjects || subjects.length === 0) return;

        const iconSvgMap = {
            maths: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line></svg>`,
            science: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.31 20.35A2 2 0 0 0 6 23h12a2 2 0 0 0 1.69-2.65L14 9.31V2h-4z"></path><line x1="8.5" y1="2" x2="15.5" y2="2"></line><line x1="10" y1="14" x2="14" y2="14"></line></svg>`,
            english: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
            social: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
            chemistry: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v6l-4 9a2 2 0 0 0 1.8 2.9h16.4a2 2 0 0 0 1.8-2.9l-4-9V2"></path><line x1="6" y1="2" x2="18" y2="2"></line><line x1="10" y1="12" x2="14" y2="12"></line></svg>`
        };

        grid.innerHTML = subjects.map(sub => {
            const isElective = (sub.category === "elective");
            const accent = sub.accent_color || (isElective ? "#10B981" : "#2563EB");
            const iconSvg = iconSvgMap[sub.icon] || (isElective ? iconSvgMap.chemistry : iconSvgMap.science);

            const topicsHtml = (sub.topics && sub.topics.length > 0)
                ? `<ul class="subject-topics">${sub.topics.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
                : '';

            const topBorderStyle = isElective ? `border-top: 3px solid ${accent};` : '';

            return `
                <div class="subject-card reveal" style="${topBorderStyle}">
                    <div class="subject-header">
                        <div class="subject-icon" style="color:${accent};">
                            ${iconSvg}
                        </div>
                        <div>
                            <h3>${escapeHtml(sub.name)}</h3>
                            <span style="font-size:0.8rem; color:${accent}; font-weight:700;">${escapeHtml(sub.target_classes || 'Core')}</span>
                        </div>
                    </div>
                    <p class="subject-tagline">${escapeHtml(sub.tagline || '')}</p>
                    ${topicsHtml}
                </div>
            `;
        }).join("");

        // Re-initialize animations & spotlight effects
        initScrollAnimations();
        initInteractiveCardSpotlights();

    } catch (e) {
        console.error("Error rendering dynamic subjects:", e);
    }
}

/**
 * 4.5 Load Dynamic Faculties from DB
 */
async function loadFaculties() {
    const grid = document.getElementById("facultiesGrid");
    if (!grid || !window.DB) return;

    try {
        const faculties = await window.DB.getFaculties("active");
        if (!faculties || faculties.length === 0) {
            return;
        }

        grid.innerHTML = faculties.map(fac => {
            const hasPhoto = Boolean(fac.photo_url && fac.photo_url.trim());
            const framingClass = fac.framing ? `frame-${fac.framing}` : 'frame-circle-lg';
            const fitClass = fac.photo_fit ? `fit-${fac.photo_fit}` : 'fit-top';

            const photoHtml = hasPhoto
                ? `<img src="${escapeHtml(fac.photo_url)}" alt="${escapeHtml(fac.name)}" class="faculty-photo ${fitClass}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'faculty-avatar-placeholder\\'>👨‍🏫</div>';">`
                : `<div class="faculty-avatar-placeholder"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;

            const gradHtml = fac.graduation ? `<div class="faculty-graduation">${escapeHtml(fac.graduation)}</div>` : '';
            const bioHtml = fac.bio ? `<p class="faculty-bio">${escapeHtml(fac.bio)}</p>` : '';

            return `
                <div class="faculty-card reveal">
                    <div class="faculty-photo-wrapper ${framingClass}">
                        ${photoHtml}
                    </div>
                    <h3 class="faculty-name">${escapeHtml(fac.name)}</h3>
                    <div class="faculty-subject-badge">${escapeHtml(fac.subject)}</div>
                    ${gradHtml}
                    ${bioHtml}
                </div>
            `;
        }).join("");

        // Re-initialize animations & card spotlights
        initScrollAnimations();
        initInteractiveCardSpotlights();

    } catch (e) {
        console.error("Error rendering faculties:", e);
    }
}

/**
 * Load Real Reviews (Consolidated single "Write a Review" button)
 */
async function loadReviews() {
    const container = document.getElementById("reviewsContainer");
    if (!container || !window.DB) return;

    try {
        const reviews = await window.DB.getReviews("approved");
        
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state-box reveal is-visible">
                    <div class="empty-state-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <h4 class="empty-state-title">No Reviews Published Yet</h4>
                    <p class="empty-state-text">We believe in complete honesty with zero fake reviews. Be the very first student or parent to share your learning experience with Shine Coaching Institute!</p>
                    <button class="btn btn-primary" onclick="openModal('reviewModal')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Write a Review
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div class="reviews-grid">';
        reviews.forEach(rev => {
            const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
            const dateStr = rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
            html += `
                <div class="review-card reveal is-visible">
                    <div class="review-stars" aria-label="${rev.rating} out of 5 stars">${stars}</div>
                    <p class="review-text">"${escapeHtml(rev.review_text)}"</p>
                    <div class="review-author">
                        <div>
                            <div class="author-name">${escapeHtml(rev.name)}</div>
                            <div class="author-role">${escapeHtml(rev.role || "Student / Parent")}</div>
                        </div>
                        <span style="font-size: 0.76rem; color: var(--text-light);">${dateStr}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        // Single clean Write a Review button below the reviews
        html += `
            <div style="text-align: center; margin-top: 36px;" class="reveal is-visible">
                <button class="btn btn-outline-primary" onclick="openModal('reviewModal')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Write a Review
                </button>
            </div>
        `;

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading reviews:", e);
    }
}

/**
 * Load Real Achievers / Result Posters
 */
async function loadToppers() {
    const container = document.getElementById("toppersContainer");
    if (!container || !window.DB) return;

    try {
        const [banners, toppers] = await Promise.all([
            window.DB.getAchievementBanners("active"),
            window.DB.getToppers("active")
        ]);
        
        // If container already has pre-rendered static poster cards in HTML, keep them intact!
        const existingBanners = container.querySelector(".achievement-banners-grid");
        if (existingBanners) {
            // Re-initialize animations
            initScrollAnimations();
            return;
        }

        if ((!banners || banners.length === 0) && (!toppers || toppers.length === 0)) {
            return;
        }

        let html = '';

        // 1. Render Official Result Posters / Banners
        if (banners && banners.length > 0) {
            html += '<div class="achievement-banners-grid">';
            banners.forEach(banner => {
                html += `
                    <div class="achievement-banner-card reveal is-visible">
                        <div class="banner-img-wrapper" onclick="openLightbox('${escapeHtml(banner.image_url)}', '${escapeHtml(banner.title)}')">
                            <img src="${escapeHtml(banner.image_url)}" alt="${escapeHtml(banner.title)}" class="banner-preview-img" loading="lazy">
                            <div class="banner-overlay-hint">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                <span>Click to View Full Poster</span>
                            </div>
                        </div>
                        <div class="banner-card-body">
                            <span class="banner-batch-badge">Batch ${escapeHtml(banner.batch_year)}</span>
                            <h3 class="banner-card-title">${escapeHtml(banner.title)}</h3>
                            ${banner.subtitle ? `<div class="banner-card-subtitle">${escapeHtml(banner.subtitle)}</div>` : ''}
                            ${banner.description ? `<p class="banner-card-desc">${escapeHtml(banner.description)}</p>` : ''}
                            <div class="banner-card-footer">
                                <span style="font-size:0.82rem; color:var(--text-subtle);">Shine Coaching Institute, Nalbari</span>
                                <button class="btn btn-outline-primary btn-sm" onclick="openLightbox('${escapeHtml(banner.image_url)}', '${escapeHtml(banner.title)}')">
                                    View High-Res
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 2. Render Individual Topper Cards if any exist
        if (toppers && toppers.length > 0) {
            html += '<h3 style="font-size: 1.3rem; margin: 32px 0 20px; font-weight:700;">Individual Subject Toppers &amp; Top Scorers</h3>';
            html += '<div class="toppers-grid">';
            toppers.forEach(top => {
                const initial = top.student_name ? top.student_name.charAt(0).toUpperCase() : "S";
                const avatarHtml = top.photo_url 
                    ? `<img src="${escapeHtml(top.photo_url)}" alt="${escapeHtml(top.student_name)}" class="topper-avatar">`
                    : `<div class="topper-avatar">${initial}</div>`;
                    
                html += `
                    <div class="topper-card reveal is-visible">
                        <div class="topper-header">
                            ${avatarHtml}
                            <div class="topper-info">
                                <h4>${escapeHtml(top.student_name)}</h4>
                                <div class="topper-class">${escapeHtml(top.student_class)}</div>
                            </div>
                        </div>
                        <div class="topper-body">
                            <div class="topper-badge">${escapeHtml(top.percentage)}% Score</div>
                            <div class="topper-achievement">${escapeHtml(top.subject_achievement || "Academic Excellence")}</div>
                            ${top.review ? `<p class="topper-quote">"${escapeHtml(top.review)}"</p>` : ""}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading toppers:", e);
    }
}

/**
 * Lightbox Modal Controller for High-Res Poster Viewing
 */
function initLightbox() {
    let modal = document.getElementById("imageLightboxModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "imageLightboxModal";
        modal.className = "lightbox-modal";
        modal.innerHTML = `
            <div class="lightbox-dialog">
                <button class="lightbox-close-btn" onclick="closeLightbox()" aria-label="Close high-resolution viewer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <img src="" alt="Full Resolution Result Poster" id="lightboxFullImg" class="lightbox-img">
                <div class="lightbox-caption" id="lightboxFullCaption"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener("click", function(e) {
            if (e.target === modal || e.target.classList.contains("lightbox-dialog")) {
                closeLightbox();
            }
        });
    }
}

window.openLightbox = function(imgSrc, caption) {
    initLightbox();
    const modal = document.getElementById("imageLightboxModal");
    const img = document.getElementById("lightboxFullImg");
    const cap = document.getElementById("lightboxFullCaption");

    if (modal && img) {
        img.src = imgSrc;
        if (cap) cap.textContent = caption || "Shine Coaching Institute - Result Achievement";
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
};

window.closeLightbox = function() {
    const modal = document.getElementById("imageLightboxModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
};

/**
 * Global 1 to 5 Star Rating Setter
 */
window.setReviewRating = function(val) {
    val = Math.max(1, Math.min(5, parseInt(val, 10) || 5));
    const ratingInput = document.getElementById("reviewRatingInput");
    const ratingText = document.getElementById("ratingTextDisplay");
    const starBtns = document.querySelectorAll(".star-btn");
    const pillBtns = document.querySelectorAll(".star-pill-btn");

    const labels = [
        "",
        "1 Star - Poor",
        "2 Stars - Fair",
        "3 Stars - Good",
        "4 Stars - Very Good",
        "5 Stars - Excellent (Highly Recommended)"
    ];

    if (ratingInput) ratingInput.value = val;
    if (ratingText) ratingText.textContent = labels[val] || `${val} Stars`;

    if (starBtns.length > 0) {
        starBtns.forEach(s => {
            const sVal = parseInt(s.getAttribute("data-value"), 10);
            if (sVal <= val) {
                s.classList.add("active");
            } else {
                s.classList.remove("active");
            }
        });
    }

    if (pillBtns.length > 0) {
        pillBtns.forEach((p, idx) => {
            if (idx + 1 === val) {
                p.classList.add("active");
            } else {
                p.classList.remove("active");
            }
        });
    }
};

/**
 * Initialize Modals and Forms
 */
function initBookingModals() {
    const starBtns = document.querySelectorAll(".star-btn");
    if (starBtns.length > 0) {
        starBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                const val = parseInt(this.getAttribute("data-value"), 10);
                window.setReviewRating(val);
            });

            btn.addEventListener("mouseenter", function() {
                const val = parseInt(this.getAttribute("data-value"), 10);
                starBtns.forEach(s => {
                    const sVal = parseInt(s.getAttribute("data-value"), 10);
                    if (sVal <= val) {
                        s.classList.add("hovered");
                    } else {
                        s.classList.remove("hovered");
                    }
                });
            });

            btn.addEventListener("mouseleave", function() {
                starBtns.forEach(s => s.classList.remove("hovered"));
            });
        });
    }

    // Set initial 5 stars
    window.setReviewRating(5);

    // Demo Form
    const demoForm = document.getElementById("demoClassForm");
    if (demoForm) {
        demoForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            if (!validateDemoForm(demoForm)) return;

            const submitBtn = demoForm.querySelector("button[type='submit']");
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Submitting Request...</span>`;

            try {
                const formData = {
                    studentName: demoForm.studentName.value,
                    studentClass: demoForm.studentClass.value,
                    subject: demoForm.subject.value,
                    parentName: demoForm.parentName.value,
                    studentPhone: demoForm.studentPhone.value,
                    studentWhatsApp: demoForm.studentWhatsApp.value
                };

                const saved = await window.DB.addDemoRequest(formData);
                closeModal("demoModal");
                demoForm.reset();

                showSuccessModal(
                    "Demo Class Booked Successfully!",
                    `Thank you, <strong>${escapeHtml(formData.studentName)}</strong>. Your demo class request has been recorded. Our academic counselor will reach out to <strong>${escapeHtml(formData.studentPhone)}</strong> shortly.`,
                    saved.id
                );
            } catch (err) {
                showToast(err.message || "Failed to submit demo request.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Admission Form
    const admissionForm = document.getElementById("admissionForm");
    if (admissionForm) {
        admissionForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            if (!validateAdmissionForm(admissionForm)) return;

            const selectedSubjects = Array.from(admissionForm.querySelectorAll("input[name='subjects']:checked")).map(cb => cb.value);
            if (selectedSubjects.length === 0) {
                showToast("Please select at least one subject for admission.", "error");
                return;
            }

            const submitBtn = admissionForm.querySelector("button[type='submit']");
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Processing Admission...</span>`;

            try {
                const formData = {
                    studentName: admissionForm.studentName.value,
                    studentClass: admissionForm.studentClass.value,
                    subjects: selectedSubjects,
                    parentName: admissionForm.parentName.value,
                    parentWhatsApp: admissionForm.parentWhatsApp.value,
                    parentPhone: admissionForm.parentPhone.value
                };

                const saved = await window.DB.addAdmission(formData);
                closeModal("admissionModal");
                admissionForm.reset();

                showSuccessModal(
                    "Admission Application Submitted!",
                    `Thank you, <strong>${escapeHtml(formData.studentName)}</strong>. Your application for <strong>${formData.studentClass} (${selectedSubjects.join(", ")})</strong> has been received with high priority.`,
                    saved.id
                );
            } catch (err) {
                showToast(err.message || "Failed to submit admission application.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Review Form
    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const name = reviewForm.reviewerName.value.trim();
            const text = reviewForm.reviewText.value.trim();
            const rating = parseInt(reviewForm.reviewRating.value, 10) || 5;
            const role = reviewForm.reviewerRole.value.trim();

            if (!name || !text) {
                showToast("Please fill in your name and review message.", "error");
                return;
            }

            const submitBtn = reviewForm.querySelector("button[type='submit']");
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Publishing Review...</span>`;

            try {
                await window.DB.addReview({
                    name: name,
                    role: role,
                    rating: rating,
                    reviewText: text
                });

                closeModal("reviewModal");
                reviewForm.reset();
                window.setReviewRating(5);
                showToast("Thank you! Your review has been submitted successfully.", "success");
                await loadReviews();
            } catch (err) {
                showToast(err.message || "Failed to save review.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
}

function validateDemoForm(form) {
    let isValid = true;
    const phoneRegex = /^[0-9+ \-()]{7,15}$/;

    if (!form.studentName.value.trim()) {
        highlightError(form.studentName, "Student name is required.");
        isValid = false;
    } else {
        clearError(form.studentName);
    }

    if (!form.studentClass.value) {
        highlightError(form.studentClass, "Please select a class.");
        isValid = false;
    } else {
        clearError(form.studentClass);
    }

    if (!form.subject.value) {
        highlightError(form.subject, "Please select a subject.");
        isValid = false;
    } else {
        clearError(form.subject);
    }

    if (!form.parentName.value.trim()) {
        highlightError(form.parentName, "Parent / Guardian name is required.");
        isValid = false;
    } else {
        clearError(form.parentName);
    }

    if (!phoneRegex.test(form.studentPhone.value.trim())) {
        highlightError(form.studentPhone, "Enter a valid phone number.");
        isValid = false;
    } else {
        clearError(form.studentPhone);
    }

    return isValid;
}

function validateAdmissionForm(form) {
    let isValid = true;
    const phoneRegex = /^[0-9+ \-()]{7,15}$/;

    if (!form.studentName.value.trim()) {
        highlightError(form.studentName, "Student name is required.");
        isValid = false;
    } else {
        clearError(form.studentName);
    }

    if (!form.studentClass.value) {
        highlightError(form.studentClass, "Please select a class.");
        isValid = false;
    } else {
        clearError(form.studentClass);
    }

    if (!form.parentName.value.trim()) {
        highlightError(form.parentName, "Parent / Guardian name is required.");
        isValid = false;
    } else {
        clearError(form.parentName);
    }

    if (!phoneRegex.test(form.parentWhatsApp.value.trim())) {
        highlightError(form.parentWhatsApp, "Enter a valid WhatsApp number.");
        isValid = false;
    } else {
        clearError(form.parentWhatsApp);
    }

    return isValid;
}

function highlightError(inputElement, msg) {
    inputElement.classList.add("error");
    const parent = inputElement.closest(".form-group");
    if (parent) {
        let errEl = parent.querySelector(".form-error-msg");
        if (errEl) {
            errEl.textContent = msg;
            errEl.classList.add("visible");
        }
    }
}

function clearError(inputElement) {
    inputElement.classList.remove("error");
    const parent = inputElement.closest(".form-group");
    if (parent) {
        let errEl = parent.querySelector(".form-error-msg");
        if (errEl) {
            errEl.classList.remove("visible");
        }
    }
}

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
};

window.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

function showSuccessModal(title, message, refCode) {
    const modalTitle = document.getElementById("successModalTitle");
    const modalMsg = document.getElementById("successModalMsg");
    const modalRef = document.getElementById("successModalRef");

    if (modalTitle) modalTitle.textContent = title;
    if (modalMsg) modalMsg.innerHTML = message;
    if (modalRef && refCode) {
        modalRef.textContent = `Reference ID: ${refCode}`;
        modalRef.style.display = "block";
    } else if (modalRef) {
        modalRef.style.display = "none";
    }

    openModal("successModal");
}

window.showToast = function(message, type = "info") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button style="background:none;border:none;cursor:pointer;margin-left:12px;font-size:1.1rem;color:inherit;" onclick="this.parentElement.remove()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 4500);
};

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.handleAdmissionClassChange = function(selectedClass) {
    const electiveBox = document.getElementById("class910ElectiveBox");
    if (!electiveBox) return;

    if (selectedClass === "Class 9" || selectedClass === "Class 10") {
        electiveBox.classList.add("visible");
    } else {
        electiveBox.classList.remove("visible");
        const chem = document.getElementById("subChemistry");
        const assam = document.getElementById("subAssamese");
        if (chem) chem.checked = false;
        if (assam) assam.checked = false;
    }
};

window.selectElectiveOption = function(type) {
    const chemBox = document.getElementById("subChemistry");
    const assamBox = document.getElementById("subAssamese");
    if (!chemBox || !assamBox) return;

    document.querySelectorAll(".elective-pill-btn").forEach(btn => btn.classList.remove("active"));

    if (type === "both") {
        chemBox.checked = true;
        assamBox.checked = true;
        const btn = document.getElementById("pillBoth");
        if (btn) btn.classList.add("active");
    } else if (type === "chemistry") {
        chemBox.checked = true;
        assamBox.checked = false;
        const btn = document.getElementById("pillChem");
        if (btn) btn.classList.add("active");
    } else if (type === "assamese") {
        chemBox.checked = false;
        assamBox.checked = true;
        const btn = document.getElementById("pillAssam");
        if (btn) btn.classList.add("active");
    } else if (type === "none") {
        chemBox.checked = false;
        assamBox.checked = false;
        const btn = document.getElementById("pillNone");
        if (btn) btn.classList.add("active");
    }
};

// ==========================================================================
// GOOGLE ANALYTICS 4 (GA4) INTERACTION TRACKING
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. WhatsApp clicks
    document.querySelectorAll("a[href*='wa.me']").forEach(el => {
        el.addEventListener("click", () => {
            if (typeof window.gtag === "function") {
                window.gtag("event", "whatsapp_click", {
                    event_category: "Engagement",
                    event_label: "WhatsApp Chat"
                });
            }
        });
    });

    // 2. Phone call clicks
    document.querySelectorAll("a[href^='tel:']").forEach(el => {
        el.addEventListener("click", () => {
            if (typeof window.gtag === "function") {
                window.gtag("event", "phone_call_click", {
                    event_category: "Engagement",
                    event_label: "Phone Call Direct"
                });
            }
        });
    });
});

