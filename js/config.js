/**
 * Shine Coaching Institute - System Configuration & Default Static Content
 * Address: Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353
 * Phone: 9365915462
 */

const SHINE_CONFIG = {
    institute: {
        name: "Shine Coaching Institute",
        shortName: "Shine Coaching",
        tagline: "Quality & Affordable Education",
        location: "Nalbari, Assam",
        establishedYear: 2024,
        
        // Exact and only verified contact details
        contact: {
            phone: "9365915462",
            whatsapp: "9365915462",
            address: "Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353"
        }
    },
    
    // Default Site Content
    defaultSiteContent: {
        hero_title: "Building Strong Students. Creating Brighter Futures.",
        hero_subtitle: "Quality education, personal attention, and strong academic foundations at a value that every student can afford.",
        motivational_quote: "Every student has the potential to shine.",
        motivational_sub: "Learn today. Grow tomorrow. Strong foundations create strong futures.",
        intro_heading: "Quality Education Made Truly Affordable",
        intro_p1: "Shine Coaching Institute in Nalbari was founded with a singular, clear purpose: to deliver high-quality, student-centered education at an affordable price that every family can comfortably manage.",
        intro_p2: "We believe that quality education should never be an expensive luxury. Every student deserves knowledgeable teachers who care, personalized academic guidance, and an encouraging learning space where questions are always welcomed.",
        cta_heading: "Ready to Help Your Child Shine?",
        cta_subtitle: "Take the first step toward better learning, clear conceptual understanding, and stronger academic foundations.",
        contact: {
            phone: "9365915462",
            whatsapp: "9365915462",
            address: "Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353"
        }
    },

    supabase: {
        url: "",
        anonKey: ""
    }
};

if (typeof window !== "undefined") {
    window.SHINE_CONFIG = SHINE_CONFIG;
    window.APP_CONFIG = {
        DEFAULT_CONTENT: SHINE_CONFIG.defaultSiteContent,
        CONTACT: SHINE_CONFIG.institute.contact,
        SUPABASE_URL: SHINE_CONFIG.supabase.url,
        SUPABASE_ANON_KEY: SHINE_CONFIG.supabase.anonKey
    };
}