/**
 * Shine Coaching Institute - Unified Database Access Layer
 * Supports seamless integration with Supabase Cloud DB as well as a reactive local database provider.
 * Supports Result Posters / Banners, Achievers, Reviews, Demo classes, and Admissions.
 */

const DB_KEYS = {
    DEMO_REQUESTS: "shine_demo_requests_v1",
    ADMISSIONS: "shine_admissions_v1",
    REVIEWS: "shine_reviews_v1",
    TOPPERS: "shine_toppers_v1",
    ACHIEVEMENT_BANNERS: "shine_achievement_banners_v1",
    SUBJECTS: "shine_subjects_v1",
    FACULTIES: "shine_faculties_v1",
    SITE_CONTENT: "shine_site_content_v1",
    SUPABASE_CREDENTIALS: "shine_supabase_credentials_v1"
};

// Initial Seed Banners for 2026 and 2025 Results
const DEFAULT_BANNERS = [
    {
        id: "BANNER-2026-BOARD",
        title: "CBSE Class X Board Exam Result - 2026",
        batch_year: "2026",
        subtitle: "100% Success Rate • Outstanding Subject Distinctions",
        image_url: "assets/images/achievers_2026.jpg",
        description: "Congratulations to all 21 appearing students for their stellar academic performance in Class 10 CBSE Board Exams.",
        status: "active",
        created_at: new Date("2026-06-15").toISOString()
    },
    {
        id: "BANNER-2025-BOARD",
        title: "CBSE Class X Board Exam Result - 2025",
        batch_year: "2025",
        subtitle: "100% Success Rate • All 18 Candidates Successful",
        image_url: "assets/images/achievers_2025.jpg",
        description: "Our shining stars of the 2025 CBSE Class 10 Board Examinations.",
        status: "active",
        created_at: new Date("2025-06-15").toISOString()
    }
];

// Initial Seed Subjects
const DEFAULT_SUBJECTS = [
    {
        id: "SUB-MATHS",
        name: "Mathematics",
        category: "core",
        target_classes: "Classes 7, 8, 9 & 10",
        tagline: "Step-by-step mastery of formulas, proofs, and real-world mathematical applications without fear.",
        topics: [
            "Arithmetic & Algebra Mastery",
            "Geometry, Mensuration & Trigonometry",
            "Board Exam Problem Solving & Theorems",
            "Regular Practice & Speed Drills"
        ],
        icon: "maths",
        accent_color: "#2563EB",
        status: "active",
        order_index: 1,
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "SUB-SCIENCE",
        name: "General Science",
        category: "core",
        target_classes: "Classes 7, 8, 9 & 10",
        tagline: "Connecting scientific principles to natural phenomena through clear visual reasoning and experiments.",
        topics: [
            "Fundamental Physics Laws & Numericals",
            "Living Systems & Biological Processes",
            "Environmental Science & Ecosystems",
            "Concept-Driven Visual Notes"
        ],
        icon: "science",
        accent_color: "#2563EB",
        status: "active",
        order_index: 2,
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "SUB-ENGLISH",
        name: "English",
        category: "core",
        target_classes: "Classes 7, 8, 9 & 10",
        tagline: "Building impeccable grammar accuracy, expressive writing skills, and articulate board literature analysis.",
        topics: [
            "Comprehensive Grammar Rules & Editing",
            "Board Literature Chapters & Poetry Analysis",
            "Formal Essays, Letters & Reports",
            "Reading Comprehension & Vocabulary"
        ],
        icon: "english",
        accent_color: "#6366F1",
        status: "active",
        order_index: 3,
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "SUB-SOCIAL",
        name: "Social Science",
        category: "core",
        target_classes: "Classes 7, 8, 9 & 10",
        tagline: "Making historical events, civic systems, geography, and economics insightful and easy to recall.",
        topics: [
            "Chronological Historical Milestones",
            "Physical Geography & Resource Mapping",
            "Democratic Institutions & Governance",
            "Economic Concepts & Case Studies"
        ],
        icon: "social",
        accent_color: "#2563EB",
        status: "active",
        order_index: 4,
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "SUB-CHEMISTRY-ASSAMESE",
        name: "Chemistry & Assamese",
        category: "elective",
        target_classes: "Classes 9 & 10 Special Options",
        tagline: "Targeted elective options: in-depth Chemistry reactions or Assamese literature & grammar.",
        topics: [
            "🧪 Chemical Reactions, Formulas & Equations",
            "🧪 Acids, Bases, Carbon Compounds & Numericals",
            "📜 Assamese MIL Literature, Prose & Poetry",
            "📜 Assamese Byakoron (Grammar) & Essay Writing"
        ],
        icon: "chemistry",
        accent_color: "#10B981",
        status: "active",
        order_index: 5,
        created_at: new Date("2024-01-01").toISOString()
    }
];

// Initial Seed Faculty Mentors
const DEFAULT_FACULTIES = [
    {
        id: "FAC-SCIENCE-DIPJYOTI",
        name: "Dipjyoti Deka",
        subject: "Science Faculty",
        graduation: "",
        photo_url: "assets/images/faculty_dipjyoti_deka.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Specializes in building deep conceptual clarity in Science, interactive demonstrations, and step-by-step problem solving.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "FAC-SST-PARAG",
        name: "Parag Sarma",
        subject: "Social Science Faculty",
        graduation: "",
        photo_url: "assets/images/faculty_parag_sarma.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Expert in chronological history analysis, geography mapping techniques, and structured board exam answer writing.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "FAC-MATHS-HIMANGSHU",
        name: "Himangshu Baishya",
        subject: "Mathematics Faculty",
        graduation: "",
        photo_url: "assets/images/faculty_himangshu_baishya.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Dedicated to eliminating maths fear through step-by-step formula derivations, speed drills, and rigorous board practice.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "FAC-ENGLISH-SIDDHARTHA",
        name: "Siddhartha Sarma",
        subject: "English Faculty",
        graduation: "",
        photo_url: "assets/images/faculty_sidharth_sarma.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Focuses on impeccable grammatical precision, creative essay composition, and in-depth board literature understanding.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "GUEST-CHEM-SUSHMITA",
        name: "Sushmita Barman",
        subject: "Chemistry Faculty (Guest)",
        graduation: "",
        photo_url: "assets/images/faculty_guest_sushmita_barman.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Specialized guidance in chemical reactions, molecular equations, periodic classification, and board numericals.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "GUEST-ASSAMESE-AJIJUR",
        name: "Ajijur Rahman",
        subject: "Assamese Faculty (Guest)",
        graduation: "",
        photo_url: "assets/images/faculty_guest_ajijur_rahman.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "In-depth mentoring in Assamese MIL literature, Byakoron (grammar rules), and structured board writing skills.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    },
    {
        id: "GUEST-CHEM-YUVARAJ",
        name: "Yuvaraj Konwar",
        subject: "Chemistry Faculty (Guest)",
        graduation: "",
        photo_url: "assets/images/faculty_guest_yuvaraj_konwar.jpg",
        framing: "circle-lg",
        photo_fit: "center",
        bio: "Expert in conceptual chemical equations, experimental reasoning, and high-scoring board exam preparation.",
        status: "active",
        created_at: new Date("2024-01-01").toISOString()
    }
];

const DB = {
    /**
     * Get active Supabase configuration
     */
    getSupabaseConfig: function() {
        try {
            const stored = localStorage.getItem(DB_KEYS.SUPABASE_CREDENTIALS);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.url && parsed.key) return parsed;
            }
        } catch (e) {}

        if (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL && window.APP_CONFIG.SUPABASE_ANON_KEY) {
            return {
                url: window.APP_CONFIG.SUPABASE_URL,
                key: window.APP_CONFIG.SUPABASE_ANON_KEY
            };
        }
        return null;
    },

    setSupabaseConfig: function(url, key) {
        if (url && key) {
            localStorage.setItem(DB_KEYS.SUPABASE_CREDENTIALS, JSON.stringify({ url: url.trim(), key: key.trim() }));
        } else {
            localStorage.removeItem(DB_KEYS.SUPABASE_CREDENTIALS);
        }
    },

    isCloudActive: function() {
        const cfg = this.getSupabaseConfig();
        return !!(cfg && cfg.url && cfg.key);
    },

    supabaseFetch: async function(table, options = {}) {
        const cfg = this.getSupabaseConfig();
        if (!cfg) throw new Error("Supabase is not configured.");

        const cleanUrl = cfg.url.replace(/\/$/, "");
        let endpoint = `${cleanUrl}/rest/v1/${table}`;
        
        if (options.params) {
            endpoint += `?${options.params}`;
        }

        const headers = {
            "apikey": cfg.key,
            "Authorization": `Bearer ${cfg.key}`,
            "Content-Type": "application/json",
            "Prefer": options.prefer || "return=representation"
        };

        const response = await fetch(endpoint, {
            method: options.method || "GET",
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Supabase Error (${response.status}): ${errText}`);
        }

        return await response.json();
    },

    generateId: function(prefix = "SCI") {
        const rand = Math.floor(1000 + Math.random() * 9000);
        const time = Date.now().toString(36).toUpperCase();
        return `${prefix}-${time}-${rand}`;
    },

    notifyChange: function(type, data) {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("shine_db_updated", { detail: { type, data, timestamp: Date.now() } }));
        }
    },

    // ----------------------------------------------------
    // 1. ACHIEVEMENT RESULT POSTERS / BANNERS
    // ----------------------------------------------------
    getAchievementBanners: async function(filter = "active") {
        if (this.isCloudActive()) {
            try {
                const params = filter === "all" ? "order=created_at.desc" : `status=eq.${filter}&order=created_at.desc`;
                return await this.supabaseFetch("achievement_banners", { params: params });
            } catch (e) {
                console.warn("Cloud fetch failed for banners, using local:", e);
            }
        }

        const data = localStorage.getItem(DB_KEYS.ACHIEVEMENT_BANNERS);
        let list = [];
        if (!data) {
            // First time initialize with official 2026 and 2025 result banners
            list = [...DEFAULT_BANNERS];
            localStorage.setItem(DB_KEYS.ACHIEVEMENT_BANNERS, JSON.stringify(list));
        } else {
            list = JSON.parse(data);
        }

        if (filter === "all") return list;
        return list.filter(b => b.status === filter);
    },

    addAchievementBanner: async function(formData) {
        const newRecord = {
            id: this.generateId("BAN"),
            title: formData.title.trim(),
            batch_year: formData.batchYear ? formData.batchYear.trim() : "2026",
            subtitle: formData.subtitle ? formData.subtitle.trim() : "",
            image_url: formData.imageUrl.trim(),
            description: formData.description ? formData.description.trim() : "",
            status: formData.status || "active", // active | hidden
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                const res = await this.supabaseFetch("achievement_banners", {
                    method: "POST",
                    body: newRecord
                });
                this.notifyChange("banner", newRecord);
                return res[0] || newRecord;
            } catch (e) {
                console.warn("Cloud save banner failed, saving locally:", e);
            }
        }

        const list = await this.getAchievementBanners("all");
        list.unshift(newRecord);
        localStorage.setItem(DB_KEYS.ACHIEVEMENT_BANNERS, JSON.stringify(list));
        this.notifyChange("banner", newRecord);
        return newRecord;
    },

    updateAchievementBanner: async function(id, data) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("achievement_banners", {
                    method: "PATCH",
                    params: `id=eq.${id}`,
                    body: { ...data, updated_at: new Date().toISOString() }
                });
            } catch (e) {
                console.warn("Cloud update banner failed:", e);
            }
        }
        const list = await this.getAchievementBanners("all");
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem(DB_KEYS.ACHIEVEMENT_BANNERS, JSON.stringify(list));
            this.notifyChange("banner_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteAchievementBanner: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("achievement_banners", {
                    method: "DELETE",
                    params: `id=eq.${id}`
                });
            } catch (e) {
                console.warn("Cloud delete banner failed:", e);
            }
        }
        const list = await this.getAchievementBanners("all");
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.ACHIEVEMENT_BANNERS, JSON.stringify(filtered));
        this.notifyChange("banner_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 2. DEMO REQUESTS
    // ----------------------------------------------------
    getDemoRequests: async function() {
        if (this.isCloudActive()) {
            try {
                return await this.supabaseFetch("demo_requests", { params: "order=created_at.desc" });
            } catch (e) {
                console.warn("Cloud fetch failed, falling back to local:", e);
            }
        }
        const data = localStorage.getItem(DB_KEYS.DEMO_REQUESTS);
        return data ? JSON.parse(data) : [];
    },

    addDemoRequest: async function(formData) {
        const newRecord = {
            id: this.generateId("DEMO"),
            student_name: formData.studentName.trim(),
            student_class: formData.studentClass.trim(),
            subject: formData.subject.trim(),
            parent_name: formData.parentName.trim(),
            student_phone: formData.studentPhone.trim(),
            student_whatsapp: (formData.studentWhatsApp || formData.studentPhone).trim(),
            status: "New",
            notes: "",
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                const res = await this.supabaseFetch("demo_requests", {
                    method: "POST",
                    body: newRecord
                });
                this.notifyChange("demo_request", newRecord);
                return res[0] || newRecord;
            } catch (e) {
                console.warn("Cloud save failed, saving locally:", e);
            }
        }

        const list = await this.getDemoRequests();
        list.unshift(newRecord);
        localStorage.setItem(DB_KEYS.DEMO_REQUESTS, JSON.stringify(list));
        this.notifyChange("demo_request", newRecord);
        return newRecord;
    },

    updateDemoRequestStatus: async function(id, status) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("demo_requests", {
                    method: "PATCH",
                    params: `id=eq.${id}`,
                    body: { status: status, updated_at: new Date().toISOString() }
                });
            } catch (e) {}
        }
        const list = await this.getDemoRequests();
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index].status = status;
            list[index].updated_at = new Date().toISOString();
            localStorage.setItem(DB_KEYS.DEMO_REQUESTS, JSON.stringify(list));
            this.notifyChange("demo_request_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteDemoRequest: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("demo_requests", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }
        const list = await this.getDemoRequests();
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.DEMO_REQUESTS, JSON.stringify(filtered));
        this.notifyChange("demo_request_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 3. ADMISSIONS
    // ----------------------------------------------------
    getAdmissions: async function() {
        if (this.isCloudActive()) {
            try {
                return await this.supabaseFetch("admissions", { params: "order=created_at.desc" });
            } catch (e) {}
        }
        const data = localStorage.getItem(DB_KEYS.ADMISSIONS);
        return data ? JSON.parse(data) : [];
    },

    addAdmission: async function(formData) {
        const subjectsArray = Array.isArray(formData.subjects) ? formData.subjects : [formData.subjects];
        const newRecord = {
            id: this.generateId("ADM"),
            student_name: formData.studentName.trim(),
            student_class: formData.studentClass.trim(),
            subjects: subjectsArray,
            parent_name: formData.parentName.trim(),
            parent_whatsapp: formData.parentWhatsApp.trim(),
            parent_phone: (formData.parentPhone || formData.parentWhatsApp).trim(),
            status: "New",
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                const res = await this.supabaseFetch("admissions", { method: "POST", body: newRecord });
                this.notifyChange("admission", newRecord);
                return res[0] || newRecord;
            } catch (e) {}
        }

        const list = await this.getAdmissions();
        list.unshift(newRecord);
        localStorage.setItem(DB_KEYS.ADMISSIONS, JSON.stringify(list));
        this.notifyChange("admission", newRecord);
        return newRecord;
    },

    updateAdmissionStatus: async function(id, status) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("admissions", { method: "PATCH", params: `id=eq.${id}`, body: { status: status, updated_at: new Date().toISOString() } });
            } catch (e) {}
        }
        const list = await this.getAdmissions();
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index].status = status;
            list[index].updated_at = new Date().toISOString();
            localStorage.setItem(DB_KEYS.ADMISSIONS, JSON.stringify(list));
            this.notifyChange("admission_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteAdmission: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("admissions", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }
        const list = await this.getAdmissions();
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.ADMISSIONS, JSON.stringify(filtered));
        this.notifyChange("admission_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 4. REVIEWS
    // ----------------------------------------------------
    getReviews: async function(filter = "approved") {
        if (this.isCloudActive()) {
            try {
                const params = filter === "all" ? "order=created_at.desc" : `status=eq.${filter}&order=created_at.desc`;
                return await this.supabaseFetch("reviews", { params: params });
            } catch (e) {}
        }
        const data = localStorage.getItem(DB_KEYS.REVIEWS);
        const allReviews = data ? JSON.parse(data) : [];
        if (filter === "all") return allReviews;
        return allReviews.filter(r => r.status === filter);
    },

    addReview: async function(formData) {
        const newRecord = {
            id: this.generateId("REV"),
            name: formData.name.trim(),
            role: formData.role ? formData.role.trim() : "Student / Parent",
            rating: parseInt(formData.rating, 10) || 5,
            review_text: formData.reviewText.trim(),
            status: "approved",
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                const res = await this.supabaseFetch("reviews", { method: "POST", body: newRecord });
                this.notifyChange("review", newRecord);
                return res[0] || newRecord;
            } catch (e) {}
        }

        const list = await this.getReviews("all");
        list.unshift(newRecord);
        localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(list));
        this.notifyChange("review", newRecord);
        return newRecord;
    },

    updateReviewStatus: async function(id, status) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("reviews", { method: "PATCH", params: `id=eq.${id}`, body: { status: status, updated_at: new Date().toISOString() } });
            } catch (e) {}
        }
        const list = await this.getReviews("all");
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index].status = status;
            list[index].updated_at = new Date().toISOString();
            localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(list));
            this.notifyChange("review_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteReview: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("reviews", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }
        const list = await this.getReviews("all");
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(filtered));
        this.notifyChange("review_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 5. TOPPERS / INDIVIDUAL ACHIEVERS
    // ----------------------------------------------------
    getToppers: async function(filter = "active") {
        if (this.isCloudActive()) {
            try {
                const params = filter === "all" ? "order=created_at.desc" : `status=eq.${filter}&order=created_at.desc`;
                return await this.supabaseFetch("toppers", { params: params });
            } catch (e) {}
        }
        const data = localStorage.getItem(DB_KEYS.TOPPERS);
        const allToppers = data ? JSON.parse(data) : [];
        if (filter === "all") return allToppers;
        return allToppers.filter(t => t.status === filter);
    },

    addTopper: async function(formData) {
        const newRecord = {
            id: this.generateId("TOP"),
            student_name: formData.studentName.trim(),
            student_class: formData.studentClass.trim(),
            percentage: formData.percentage.toString().trim(),
            subject_achievement: formData.subjectAchievement.trim(),
            review: formData.review ? formData.review.trim() : "",
            photo_url: formData.photoUrl ? formData.photoUrl.trim() : "",
            status: formData.status || "active",
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                const res = await this.supabaseFetch("toppers", { method: "POST", body: newRecord });
                this.notifyChange("topper", newRecord);
                return res[0] || newRecord;
            } catch (e) {}
        }

        const list = await this.getToppers("all");
        list.unshift(newRecord);
        localStorage.setItem(DB_KEYS.TOPPERS, JSON.stringify(list));
        this.notifyChange("topper", newRecord);
        return newRecord;
    },

    updateTopper: async function(id, data) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("toppers", { method: "PATCH", params: `id=eq.${id}`, body: { ...data, updated_at: new Date().toISOString() } });
            } catch (e) {}
        }
        const list = await this.getToppers("all");
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem(DB_KEYS.TOPPERS, JSON.stringify(list));
            this.notifyChange("topper_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteTopper: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("toppers", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }
        const list = await this.getToppers("all");
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.TOPPERS, JSON.stringify(filtered));
        this.notifyChange("topper_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 6. SUBJECTS MANAGEMENT
    // ----------------------------------------------------
    getSubjects: async function(filter = "all") {
        if (this.isCloudActive()) {
            try {
                let params = "order=order_index.asc,created_at.desc";
                if (filter === "active") params += "&status=eq.active";
                const data = await this.supabaseFetch("subjects", { params });
                if (data && data.length > 0) return data;
            } catch (e) {}
        }

        try {
            const stored = localStorage.getItem(DB_KEYS.SUBJECTS);
            if (stored) {
                const list = JSON.parse(stored);
                if (filter === "active") {
                    return list.filter(item => item.status === "active");
                }
                return list;
            }
        } catch (e) {}

        // Seed with default subjects
        localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
        return filter === "active" ? DEFAULT_SUBJECTS.filter(s => s.status === "active") : DEFAULT_SUBJECTS;
    },

    addSubject: async function(subjectData) {
        const id = "SUB-" + Date.now();
        const newSubject = {
            id,
            name: (subjectData.name || "").trim(),
            category: subjectData.category || "core",
            target_classes: subjectData.target_classes || "Classes 7, 8, 9 & 10",
            tagline: subjectData.tagline ? subjectData.tagline.trim() : "",
            topics: Array.isArray(subjectData.topics) ? subjectData.topics : (subjectData.topics ? subjectData.topics.split("\n").map(t => t.trim()).filter(Boolean) : []),
            icon: subjectData.icon || "science",
            accent_color: subjectData.accent_color || "#2563EB",
            status: subjectData.status || "active",
            order_index: Number(subjectData.order_index) || 99,
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("subjects", { method: "POST", body: newSubject });
            } catch (e) {}
        }

        const list = await this.getSubjects("all");
        list.push(newSubject);
        localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify(list));
        this.notifyChange("subject_add", newSubject);
        return newSubject;
    },

    updateSubject: async function(id, data) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("subjects", { method: "PATCH", body: data, params: `id=eq.${id}` });
            } catch (e) {}
        }

        const list = await this.getSubjects("all");
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify(list));
            this.notifyChange("subject_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteSubject: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("subjects", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }

        const list = await this.getSubjects("all");
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify(filtered));
        this.notifyChange("subject_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 7. FACULTY & TEACHERS MANAGEMENT
    // ----------------------------------------------------
    getFaculties: async function(filter = "all") {
        if (this.isCloudActive()) {
            try {
                let params = "order=created_at.asc";
                if (filter === "active") params += "&status=eq.active";
                const data = await this.supabaseFetch("faculties", { params });
                if (data && data.length > 0) return data;
            } catch (e) {}
        }

        try {
            const stored = localStorage.getItem(DB_KEYS.FACULTIES);
            if (stored) {
                const list = JSON.parse(stored);
                if (filter === "active") {
                    return list.filter(item => item.status === "active");
                }
                return list;
            }
        } catch (e) {}

        // Seed with default faculties
        localStorage.setItem(DB_KEYS.FACULTIES, JSON.stringify(DEFAULT_FACULTIES));
        return filter === "active" ? DEFAULT_FACULTIES.filter(f => f.status === "active") : DEFAULT_FACULTIES;
    },

    addFaculty: async function(facultyData) {
        const id = "FAC-" + Date.now();
        const newFaculty = {
            id,
            name: (facultyData.name || "").trim(),
            subject: (facultyData.subject || "").trim(),
            graduation: (facultyData.graduation || "").trim(),
            photo_url: (facultyData.photo_url || "").trim(),
            framing: facultyData.framing || "circle-lg",
            photo_fit: facultyData.photo_fit || "top",
            bio: (facultyData.bio || "").trim(),
            status: facultyData.status || "active",
            created_at: new Date().toISOString()
        };

        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("faculties", { method: "POST", body: newFaculty });
            } catch (e) {}
        }

        const list = await this.getFaculties("all");
        list.push(newFaculty);
        localStorage.setItem(DB_KEYS.FACULTIES, JSON.stringify(list));
        this.notifyChange("faculty_add", newFaculty);
        return newFaculty;
    },

    updateFaculty: async function(id, data) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("faculties", { method: "PATCH", body: data, params: `id=eq.${id}` });
            } catch (e) {}
        }

        const list = await this.getFaculties("all");
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem(DB_KEYS.FACULTIES, JSON.stringify(list));
            this.notifyChange("faculty_update", list[index]);
            return list[index];
        }
        return null;
    },

    deleteFaculty: async function(id) {
        if (this.isCloudActive()) {
            try {
                await this.supabaseFetch("faculties", { method: "DELETE", params: `id=eq.${id}` });
            } catch (e) {}
        }

        const list = await this.getFaculties("all");
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEYS.FACULTIES, JSON.stringify(filtered));
        this.notifyChange("faculty_delete", { id });
        return true;
    },

    // ----------------------------------------------------
    // 8. SITE CONTENT
    // ----------------------------------------------------
    getSiteContent: async function() {
        const defaults = (window.SHINE_CONFIG && window.SHINE_CONFIG.defaultSiteContent)
            ? window.SHINE_CONFIG.defaultSiteContent
            : ((window.APP_CONFIG && window.APP_CONFIG.DEFAULT_CONTENT) ? window.APP_CONFIG.DEFAULT_CONTENT : {
                hero_title: "Building Strong Students. Creating Brighter Futures.",
                hero_subtitle: "Quality education, personal attention, and strong academic foundations at a value that every student can afford.",
                motivational_quote: "Every student has the potential to shine.",
                motivational_sub: "Learn today. Grow tomorrow. Strong foundations create strong futures.",
                intro_p1: "Shine Coaching Institute in Nalbari was founded with a singular, clear purpose: to deliver high-quality, student-centered education at an affordable price that every family can comfortably manage.",
                intro_p2: "We believe that quality education should never be an expensive luxury. Every student deserves knowledgeable teachers who care, personalized academic guidance, and an encouraging learning space where questions are always welcomed.",
                cta_heading: "Ready to Help Your Child Shine?",
                cta_subtitle: "Take the first step toward better learning, clear conceptual understanding, and stronger academic foundations.",
                contact: {
                    phone: "9365915462",
                    whatsapp: "9365915462",
                    address: "Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353"
                }
            });

        const defaultContact = (window.SHINE_CONFIG && window.SHINE_CONFIG.institute && window.SHINE_CONFIG.institute.contact)
            ? window.SHINE_CONFIG.institute.contact
            : (defaults.contact || {
                phone: "9365915462",
                whatsapp: "9365915462",
                address: "Gopal Mandir, Gopal Bazar, Near, Palla Road, Nalbari, Assam 781353"
            });
        
        try {
            const localStored = localStorage.getItem(DB_KEYS.SITE_CONTENT);
            if (localStored) {
                const parsed = JSON.parse(localStored);
                return { ...defaults, ...parsed, contact: { ...defaultContact, ...(parsed.contact || {}) } };
            }
        } catch (e) {}

        return { ...defaults, contact: defaultContact };
    },

    updateSiteContent: async function(contentData) {
        const current = await this.getSiteContent();
        const updated = { ...current, ...contentData, updated_at: new Date().toISOString() };
        localStorage.setItem(DB_KEYS.SITE_CONTENT, JSON.stringify(updated));
        this.notifyChange("site_content", updated);
        return updated;
    },

    resetSiteContent: async function() {
        localStorage.removeItem(DB_KEYS.SITE_CONTENT);
        const defaults = await this.getSiteContent();
        this.notifyChange("site_content", defaults);
        return defaults;
    },

    // ----------------------------------------------------
    // 9. DASHBOARD STATS
    // ----------------------------------------------------
    getStats: async function() {
        const [demos, admissions, allReviews, allToppers, allBanners, allSubjects, allFaculties] = await Promise.all([
            this.getDemoRequests(),
            this.getAdmissions(),
            this.getReviews("all"),
            this.getToppers("all"),
            this.getAchievementBanners("all"),
            this.getSubjects("all"),
            this.getFaculties("all")
        ]);

        return {
            demoCount: demos.length,
            admissionCount: admissions.length,
            reviewCount: allReviews.length,
            topperCount: allToppers.length,
            bannerCount: allBanners.length,
            subjectCount: allSubjects.length,
            facultyCount: allFaculties.length,
            newDemos: demos.filter(d => d.status === "New").length,
            newAdmissions: admissions.filter(a => a.status === "New").length,
            approvedReviews: allReviews.filter(r => r.status === "approved").length,
            activeToppers: allToppers.filter(t => t.status === "active").length,
            activeBanners: allBanners.filter(b => b.status === "active").length,
            activeSubjects: allSubjects.filter(s => s.status === "active").length,
            activeFaculties: allFaculties.filter(f => f.status === "active").length
        };
    }
};

if (typeof window !== "undefined") {
    window.DB = DB;
}
