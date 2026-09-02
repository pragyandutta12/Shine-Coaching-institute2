/**
 * Shine Coaching Institute - About Us Page Script
 * Manages timeline animations, values section, and shared booking modal controllers.
 */

document.addEventListener("DOMContentLoaded", async function() {
    // 1. Initialize Scroll Animations
    initAboutAnimations();

    // 2. Initialize Navigation & Mobile Drawer
    initAboutNavigation();

    // 3. Load Contact Placeholders
    await loadAboutContactInfo();
});

function initAboutAnimations() {
    const nodes = document.querySelectorAll(".timeline-node, .reveal, .reveal-left, .reveal-right");
    if (!("IntersectionObserver" in window)) {
        nodes.forEach(el => el.classList.add("is-visible"));
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
        threshold: 0.15,
        rootMargin: "0px 0px -30px 0px"
    });

    nodes.forEach(el => observer.observe(el));
}

function initAboutNavigation() {
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

async function loadAboutContactInfo() {
    if (!window.DB) return;
    try {
        const content = await window.DB.getSiteContent();
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
        console.error("Error loading about contact info:", e);
    }
}
