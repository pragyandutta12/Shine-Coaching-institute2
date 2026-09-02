/**
 * Shine Coaching Institute - Admin Dashboard Script
 * Manages Master Authentication, Demo Requests, Admissions, Review Moderation & Deletion,
 * Result Poster Banners (with File Upload / Image Picker), Topper CRUD, and Site Content.
 */

let currentAdminTab = "overview";

document.addEventListener("DOMContentLoaded", async function() {
    // 1. Check Authentication Status
    checkAdminAuthState();

    // 2. Initialize Tab Switching
    initAdminNavigation();

    // 3. Initialize Password, Cloud & Image Upload Forms
    initAdminForms();

    // 4. Listen for DB updates
    window.addEventListener("shine_db_updated", function() {
        if (window.AuthManager && window.AuthManager.isAuthenticated()) {
            refreshCurrentTab();
        }
    });
});

/**
 * Check if user is logged in, or needs first-time password setup
 */
function checkAdminAuthState() {
    const authWrapper = document.getElementById("adminAuthWrapper");
    const dashboardLayout = document.getElementById("adminDashboardLayout");
    if (!authWrapper || !dashboardLayout) return;

    const isConfigured = window.AuthManager ? window.AuthManager.isPasswordConfigured() : false;
    const isAuthed = window.AuthManager ? window.AuthManager.isAuthenticated() : false;

    if (!isConfigured) {
        authWrapper.style.display = "flex";
        dashboardLayout.style.display = "none";
        document.getElementById("firstTimeSetupView").style.display = "block";
        document.getElementById("standardLoginView").style.display = "none";
    } else if (!isAuthed) {
        authWrapper.style.display = "flex";
        dashboardLayout.style.display = "none";
        document.getElementById("firstTimeSetupView").style.display = "none";
        document.getElementById("standardLoginView").style.display = "block";
    } else {
        authWrapper.style.display = "none";
        dashboardLayout.style.display = "flex";
        loadDashboardOverview();
    }
}

/**
 * Initialize Sidebar Navigation and Tab Switching
 */
function initAdminNavigation() {
    const links = document.querySelectorAll(".sidebar-link[data-tab]");
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const tab = this.getAttribute("data-tab");
            switchAdminTab(tab);
        });
    });

    const toggleBtn = document.getElementById("mobileSidebarToggle");
    const sidebar = document.getElementById("adminSidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
}

window.switchAdminTab = function(tabName) {
    currentAdminTab = tabName;
    
    document.querySelectorAll(".sidebar-link[data-tab]").forEach(link => {
        if (link.getAttribute("data-tab") === tabName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    
    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) {
        targetPane.classList.add("active");
    }

    const titleEl = document.getElementById("adminPageTitle");
    const titles = {
        overview: "Dashboard Overview",
        demoRequests: "Demo Class Requests",
        admissions: "Student Admissions",
        reviews: "Review Moderation",
        toppers: "Result Posters & Achievers",
        subjects: "Curriculum & Subjects Management",
        faculties: "Faculty & Teachers Management",
        content: "Website Content Editor",
        settings: "Password & Security"
    };
    if (titleEl) titleEl.textContent = titles[tabName] || "Admin Dashboard";

    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) sidebar.classList.remove("open");

    refreshCurrentTab();
};

function refreshCurrentTab() {
    switch (currentAdminTab) {
        case "overview":
            loadDashboardOverview();
            break;
        case "demoRequests":
            loadDemoRequestsTable();
            break;
        case "admissions":
            loadAdmissionsTable();
            break;
        case "reviews":
            loadReviewsModerationTable();
            break;
        case "toppers":
            loadToppersManagement();
            break;
        case "subjects":
            loadSubjectsManagementTable();
            break;
        case "faculties":
            loadFacultiesManagementTable();
            break;
        case "content":
            loadContentEditorForm();
            break;
        case "settings":
            loadSettingsForm();
            break;
    }
}

/**
 * 1. DASHBOARD OVERVIEW TAB
 */
async function loadDashboardOverview() {
    if (!window.DB) return;
    try {
        const stats = await window.DB.getStats();
        
        const demoEl = document.getElementById("statDemoCount");
        const admEl = document.getElementById("statAdmissionCount");
        const revEl = document.getElementById("statReviewCount");
        const banEl = document.getElementById("statBannerCount");

        if (demoEl) demoEl.textContent = stats.demoCount;
        if (admEl) admEl.textContent = stats.admissionCount;
        if (revEl) revEl.textContent = stats.reviewCount;
        if (banEl) {
            banEl.textContent = stats.bannerCount;
            document.getElementById("statBannerSub").textContent = `${stats.activeBanners} active posters`;
        }

        const dSub = document.getElementById("statDemoSub");
        const aSub = document.getElementById("statAdmissionSub");
        const rSub = document.getElementById("statReviewSub");

        if (dSub) dSub.textContent = `${stats.newDemos} uncontacted requests`;
        if (aSub) aSub.textContent = `${stats.newAdmissions} new applications`;
        if (rSub) rSub.textContent = `${stats.approvedReviews} published reviews`;

        const demoBadge = document.getElementById("badgeDemoRequests");
        if (demoBadge) {
            demoBadge.textContent = stats.newDemos;
            demoBadge.style.display = stats.newDemos > 0 ? "inline-block" : "none";
        }
        const admBadge = document.getElementById("badgeAdmissions");
        if (admBadge) {
            admBadge.textContent = stats.newAdmissions;
            admBadge.style.display = stats.newAdmissions > 0 ? "inline-block" : "none";
        }

        const recentDemos = await window.DB.getDemoRequests();
        const container = document.getElementById("recentActivityList");
        if (container) {
            if (recentDemos.length === 0) {
                container.innerHTML = `<div class="admin-empty-table">No recent requests recorded yet.</div>`;
            } else {
                let html = '<div class="table-responsive"><table class="admin-table"><thead><tr><th>Student</th><th>Class</th><th>Subject</th><th>Parent Phone</th><th>Date</th><th>Action</th></tr></thead><tbody>';
                recentDemos.slice(0, 5).forEach(item => {
                    const dateStr = new Date(item.created_at).toLocaleDateString();
                    html += `
                        <tr>
                            <td><strong>${escapeHtml(item.student_name)}</strong></td>
                            <td>${escapeHtml(item.student_class)}</td>
                            <td>${escapeHtml(item.subject)}</td>
                            <td>${escapeHtml(item.student_phone)}</td>
                            <td>${dateStr}</td>
                            <td><button class="btn-action" onclick="viewDemoDetails('${item.id}')">View</button></td>
                        </tr>
                    `;
                });
                html += '</tbody></table></div>';
                container.innerHTML = html;
            }
        }
    } catch (e) {
        console.error("Error loading overview stats:", e);
    }
}

/**
 * 2. DEMO CLASSES TAB
 */
async function loadDemoRequestsTable() {
    const tbody = document.getElementById("demoRequestsTableBody");
    if (!tbody || !window.DB) return;

    try {
        const list = await window.DB.getDemoRequests();
        const searchVal = (document.getElementById("demoSearchInput")?.value || "").toLowerCase();
        const filterVal = document.getElementById("demoStatusFilter")?.value || "all";

        const filtered = list.filter(item => {
            const matchSearch = item.student_name.toLowerCase().includes(searchVal) ||
                                item.parent_name.toLowerCase().includes(searchVal) ||
                                item.student_phone.includes(searchVal);
            const matchFilter = filterVal === "all" || item.status.toLowerCase() === filterVal.toLowerCase();
            return matchSearch && matchFilter;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-table">No demo class requests found.</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(item => {
            const dateStr = new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            const badgeClass = item.status === "New" ? "status-new" : "status-contacted";
            html += `
                <tr>
                    <td><strong>${escapeHtml(item.student_name)}</strong></td>
                    <td>${escapeHtml(item.student_class)}</td>
                    <td>${escapeHtml(item.subject)}</td>
                    <td>${escapeHtml(item.parent_name)}<br><small style="color:var(--admin-text-light)">${escapeHtml(item.student_phone)}</small></td>
                    <td><span class="status-badge ${badgeClass}">${escapeHtml(item.status)}</span></td>
                    <td>${dateStr}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action" title="View Full Details" onclick="viewDemoDetails('${item.id}')">View</button>
                            ${item.status === "New" ? `<button class="btn-action" title="Mark Contacted" onclick="markDemoContacted('${item.id}')">Contacted</button>` : ""}
                            <button class="btn-action btn-danger-action" title="Delete" onclick="deleteDemo('${item.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error loading demo requests:", e);
    }
}

window.viewDemoDetails = async function(id) {
    const list = await window.DB.getDemoRequests();
    const item = list.find(d => d.id === id);
    if (!item) return;

    const modalBody = document.getElementById("adminViewModalBody");
    const modalTitle = document.getElementById("adminViewModalTitle");
    if (modalTitle) modalTitle.textContent = "Demo Request Details";

    if (modalBody) {
        modalBody.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:14px;">
                <div><strong>Reference ID:</strong> <span style="font-family:monospace; color:var(--admin-primary);">${item.id}</span></div>
                <div><strong>Student Name:</strong> ${escapeHtml(item.student_name)}</div>
                <div><strong>Class:</strong> ${escapeHtml(item.student_class)}</div>
                <div><strong>Subject Requested:</strong> ${escapeHtml(item.subject)}</div>
                <div><strong>Parent / Guardian:</strong> ${escapeHtml(item.parent_name)}</div>
                <div><strong>Student Phone:</strong> <a href="tel:${escapeHtml(item.student_phone)}" style="color:var(--admin-primary);">${escapeHtml(item.student_phone)}</a></div>
                <div><strong>WhatsApp Number:</strong> <a href="https://wa.me/${escapeHtml(item.student_whatsapp).replace(/[^0-9]/g, '')}" target="_blank" style="color:#10B981;">${escapeHtml(item.student_whatsapp)} (Open Chat)</a></div>
                <div><strong>Status:</strong> <span class="status-badge ${item.status === 'New' ? 'status-new' : 'status-contacted'}">${escapeHtml(item.status)}</span></div>
                <div><strong>Submitted At:</strong> ${new Date(item.created_at).toLocaleString()}</div>
            </div>
            <div style="margin-top:24px; display:flex; justify-content:flex-end; gap:10px;">
                ${item.status === "New" ? `<button class="btn btn-primary btn-sm" onclick="markDemoContacted('${item.id}'); closeModal('adminViewModal');">Mark Contacted</button>` : ""}
                <button class="btn btn-outline btn-sm" onclick="closeModal('adminViewModal')">Close</button>
            </div>
        `;
    }
    window.openModal("adminViewModal");
};

window.markDemoContacted = async function(id) {
    await window.DB.updateDemoRequestStatus(id, "Contacted");
    showToast("Request marked as Contacted.", "success");
    loadDemoRequestsTable();
    loadDashboardOverview();
};

window.deleteDemo = async function(id) {
    if (confirm("Are you sure you want to delete this demo request?")) {
        await window.DB.deleteDemoRequest(id);
        showToast("Demo request deleted.", "info");
        loadDemoRequestsTable();
        loadDashboardOverview();
    }
};

/**
 * 3. ADMISSIONS TAB
 */
async function loadAdmissionsTable() {
    const tbody = document.getElementById("admissionsTableBody");
    if (!tbody || !window.DB) return;

    try {
        const list = await window.DB.getAdmissions();
        const searchVal = (document.getElementById("admissionSearchInput")?.value || "").toLowerCase();
        const filterVal = document.getElementById("admissionStatusFilter")?.value || "all";

        const filtered = list.filter(item => {
            const matchSearch = item.student_name.toLowerCase().includes(searchVal) ||
                                item.parent_name.toLowerCase().includes(searchVal) ||
                                item.parent_whatsapp.includes(searchVal);
            const matchFilter = filterVal === "all" || item.status.toLowerCase() === filterVal.toLowerCase();
            return matchSearch && matchFilter;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-table">No admission applications found.</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(item => {
            const dateStr = new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const subjectsStr = Array.isArray(item.subjects) ? item.subjects.join(", ") : item.subjects;
            html += `
                <tr>
                    <td><strong>${escapeHtml(item.student_name)}</strong></td>
                    <td>${escapeHtml(item.student_class)}</td>
                    <td style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(subjectsStr)}</td>
                    <td>${escapeHtml(item.parent_name)}<br><small style="color:var(--admin-text-light)">WA: ${escapeHtml(item.parent_whatsapp)}</small></td>
                    <td>
                        <select class="form-control" style="padding:4px 8px; font-size:0.82rem;" onchange="updateAdmStatus('${item.id}', this.value)">
                            <option value="New" ${item.status === 'New' ? 'selected' : ''}>New</option>
                            <option value="Under Review" ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="Enrolled" ${item.status === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
                            <option value="Rejected" ${item.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </td>
                    <td>${dateStr}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action" onclick="viewAdmissionDetails('${item.id}')">Details</button>
                            <button class="btn-action btn-danger-action" onclick="deleteAdmission('${item.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error loading admissions:", e);
    }
}

window.viewAdmissionDetails = async function(id) {
    const list = await window.DB.getAdmissions();
    const item = list.find(a => a.id === id);
    if (!item) return;

    const modalBody = document.getElementById("adminViewModalBody");
    const modalTitle = document.getElementById("adminViewModalTitle");
    if (modalTitle) modalTitle.textContent = "Admission Application Details";

    const subjectsHtml = Array.isArray(item.subjects) 
        ? item.subjects.map(s => `<span class="badge-pill" style="margin:0 4px 4px 0;">${escapeHtml(s)}</span>`).join("")
        : escapeHtml(item.subjects);

    if (modalBody) {
        modalBody.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:14px;">
                <div><strong>Application ID:</strong> <span style="font-family:monospace; color:var(--admin-primary);">${item.id}</span></div>
                <div><strong>Student Name:</strong> ${escapeHtml(item.student_name)}</div>
                <div><strong>Class Applied:</strong> ${escapeHtml(item.student_class)}</div>
                <div><strong>Selected Subjects:</strong><div style="margin-top:6px;">${subjectsHtml}</div></div>
                <div><strong>Parent / Guardian:</strong> ${escapeHtml(item.parent_name)}</div>
                <div><strong>Parent WhatsApp:</strong> <a href="https://wa.me/${escapeHtml(item.parent_whatsapp).replace(/[^0-9]/g, '')}" target="_blank" style="color:#10B981;">${escapeHtml(item.parent_whatsapp)} (Open Chat)</a></div>
                <div><strong>Parent Phone:</strong> <a href="tel:${escapeHtml(item.parent_phone)}" style="color:var(--admin-primary);">${escapeHtml(item.parent_phone)}</a></div>
                <div><strong>Current Status:</strong> <strong>${escapeHtml(item.status)}</strong></div>
                <div><strong>Submitted Date:</strong> ${new Date(item.created_at).toLocaleString()}</div>
            </div>
            <div style="margin-top:24px; display:flex; justify-content:flex-end; gap:10px;">
                <button class="btn btn-primary btn-sm" onclick="closeModal('adminViewModal')">Done</button>
            </div>
        `;
    }
    window.openModal("adminViewModal");
};

window.updateAdmStatus = async function(id, newStatus) {
    await window.DB.updateAdmissionStatus(id, newStatus);
    showToast(`Application updated to ${newStatus}.`, "success");
    loadDashboardOverview();
};

window.deleteAdmission = async function(id) {
    if (confirm("Are you sure you want to delete this admission application?")) {
        await window.DB.deleteAdmission(id);
        showToast("Application deleted.", "info");
        loadAdmissionsTable();
        loadDashboardOverview();
    }
};

/**
 * 4. ACHIEVERS & RESULT POSTERS MANAGEMENT TAB
 */
async function loadToppersManagement() {
    const bannersGrid = document.getElementById("adminBannersGrid");
    const toppersGrid = document.getElementById("adminToppersGrid");
    if (!window.DB) return;

    // 1. Load Result Banners
    if (bannersGrid) {
        try {
            const banners = await window.DB.getAchievementBanners("all");
            if (banners.length === 0) {
                bannersGrid.innerHTML = `
                    <div class="admin-empty-table" style="grid-column: 1 / -1;">
                        <p>No result poster images added yet.</p>
                        <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="openAddBannerModal()">+ Upload Result Poster</button>
                    </div>
                `;
            } else {
                let html = "";
                banners.forEach(b => {
                    const isHidden = b.status === "hidden";
                    html += `
                        <div class="achievement-banner-card" style="opacity: ${isHidden ? '0.6' : '1'};">
                            <div class="banner-img-wrapper" style="height:200px;">
                                <img src="${escapeHtml(b.image_url)}" class="banner-preview-img" style="height:100%; object-fit:cover;">
                            </div>
                            <div class="banner-card-body" style="padding:16px;">
                                <span class="banner-batch-badge">Batch ${escapeHtml(b.batch_year)}</span>
                                <h4 style="font-size:1.05rem; margin-bottom:4px;">${escapeHtml(b.title)}</h4>
                                ${b.subtitle ? `<div style="font-size:0.82rem; color:var(--primary);">${escapeHtml(b.subtitle)}</div>` : ''}
                                <div style="margin-top:14px; padding-top:10px; border-top:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
                                    <span class="status-badge ${isHidden ? 'status-hidden' : 'status-approved'}">${isHidden ? 'Hidden' : 'Visible'}</span>
                                    <div class="action-btn-group">
                                        <button class="btn-action" onclick="toggleBannerStatus('${b.id}', '${isHidden ? 'active' : 'hidden'}')">${isHidden ? 'Show' : 'Hide'}</button>
                                        <button class="btn-action" onclick="openEditBannerModal('${b.id}')">Edit</button>
                                        <button class="btn-action btn-danger-action" onclick="deleteBannerItem('${b.id}')">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                bannersGrid.innerHTML = html;
            }
        } catch (e) {
            console.error("Error loading banners:", e);
        }
    }

    // 2. Load Individual Student Toppers
    if (toppersGrid) {
        try {
            const list = await window.DB.getToppers("all");
            if (list.length === 0) {
                toppersGrid.innerHTML = `
                    <div class="admin-empty-table" style="grid-column: 1 / -1;">
                        <p>No individual achiever cards added yet.</p>
                        <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="openAddTopperModal()">+ Add Student Card</button>
                    </div>
                `;
            } else {
                let html = "";
                list.forEach(top => {
                    const isHidden = top.status === "hidden";
                    html += `
                        <div class="topper-card" style="opacity: ${isHidden ? '0.6' : '1'};">
                            <div class="topper-header">
                                ${top.photo_url ? `<img src="${escapeHtml(top.photo_url)}" class="topper-avatar">` : `<div class="topper-avatar">${top.student_name.charAt(0)}</div>`}
                                <div class="topper-info">
                                    <h4>${escapeHtml(top.student_name)}</h4>
                                    <div class="topper-class">${escapeHtml(top.student_class)}</div>
                                </div>
                            </div>
                            <div class="topper-body">
                                <div class="topper-badge">${escapeHtml(top.percentage)}%</div>
                                <div class="topper-achievement">${escapeHtml(top.subject_achievement)}</div>
                                ${top.review ? `<p class="topper-quote">"${escapeHtml(top.review)}"</p>` : ""}
                                <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--admin-border); display:flex; justify-content:space-between; align-items:center;">
                                    <span class="status-badge ${isHidden ? 'status-hidden' : 'status-approved'}">${isHidden ? 'Hidden' : 'Visible'}</span>
                                    <div class="action-btn-group">
                                        <button class="btn-action" onclick="toggleTopperStatus('${top.id}', '${isHidden ? 'active' : 'hidden'}')">${isHidden ? 'Show' : 'Hide'}</button>
                                        <button class="btn-action" onclick="openEditTopperModal('${top.id}')">Edit</button>
                                        <button class="btn-action btn-danger-action" onclick="deleteTopperItem('${top.id}')">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                toppersGrid.innerHTML = html;
            }
        } catch (e) {
            console.error("Error loading toppers:", e);
        }
    }
}

// ---------------- Banner Modal Controls ----------------
window.openAddBannerModal = function() {
    const form = document.getElementById("bannerForm");
    if (form) {
        form.reset();
        document.getElementById("bannerFormId").value = "";
        document.getElementById("bannerModalTitle").textContent = "Add Result Poster Image";
        document.getElementById("bannerImagePreviewBox").style.display = "none";
    }
    openModal("bannerModal");
};

window.openEditBannerModal = async function(id) {
    const list = await window.DB.getAchievementBanners("all");
    const item = list.find(b => b.id === id);
    if (!item) return;

    const form = document.getElementById("bannerForm");
    if (form) {
        document.getElementById("bannerFormId").value = item.id;
        form.title.value = item.title || "";
        form.batchYear.value = item.batch_year || "";
        form.subtitle.value = item.subtitle || "";
        form.imageUrl.value = item.image_url || "";
        form.description.value = item.description || "";
        document.getElementById("bannerModalTitle").textContent = "Edit Result Poster";

        if (item.image_url) {
            const preview = document.getElementById("bannerImagePreview");
            const box = document.getElementById("bannerImagePreviewBox");
            if (preview && box) {
                preview.src = item.image_url;
                box.style.display = "block";
            }
        }
    }
    openModal("bannerModal");
};

window.toggleBannerStatus = async function(id, newStatus) {
    await window.DB.updateAchievementBanner(id, { status: newStatus });
    showToast("Poster visibility updated.", "success");
    loadToppersManagement();
    loadDashboardOverview();
};

window.deleteBannerItem = async function(id) {
    if (confirm("Are you sure you want to delete this result poster banner?")) {
        await window.DB.deleteAchievementBanner(id);
        showToast("Poster banner deleted.", "info");
        loadToppersManagement();
        loadDashboardOverview();
    }
};

// ---------------- Individual Topper Controls ----------------
window.openAddTopperModal = function() {
    const form = document.getElementById("topperForm");
    if (form) {
        form.reset();
        document.getElementById("topperFormId").value = "";
        document.getElementById("topperModalTitle").textContent = "Add Shine Achiever";
    }
    openModal("topperModal");
};

window.openEditTopperModal = async function(id) {
    const list = await window.DB.getToppers("all");
    const top = list.find(t => t.id === id);
    if (!top) return;

    const form = document.getElementById("topperForm");
    if (form) {
        document.getElementById("topperFormId").value = top.id;
        form.studentName.value = top.student_name || "";
        form.studentClass.value = top.student_class || "";
        form.percentage.value = top.percentage || "";
        form.subjectAchievement.value = top.subject_achievement || "";
        form.review.value = top.review || "";
        form.photoUrl.value = top.photo_url || "";
        document.getElementById("topperModalTitle").textContent = "Edit Achiever";
    }
    openModal("topperModal");
};

window.toggleTopperStatus = async function(id, newStatus) {
    await window.DB.updateTopper(id, { status: newStatus });
    showToast(`Achiever visibility updated.`, "success");
    loadToppersManagement();
};

window.deleteTopperItem = async function(id) {
    if (confirm("Are you sure you want to delete this achiever card?")) {
        await window.DB.deleteTopper(id);
        showToast("Achiever deleted.", "info");
        loadToppersManagement();
        loadDashboardOverview();
    }
};

/**
 * 5. REVIEWS MODERATION & DELETION TAB (ENHANCED)
 */
async function loadReviewsModerationTable() {
    const tbody = document.getElementById("reviewsTableBody");
    if (!tbody || !window.DB) return;

    try {
        const list = await window.DB.getReviews("all");
        const searchVal = (document.getElementById("reviewSearchInput")?.value || "").toLowerCase();
        const ratingFilter = document.getElementById("reviewRatingFilter")?.value || "all";
        const statusFilter = document.getElementById("reviewStatusFilter")?.value || "all";

        const filtered = list.filter(rev => {
            const matchSearch = (rev.name || "").toLowerCase().includes(searchVal) ||
                                (rev.review_text || "").toLowerCase().includes(searchVal) ||
                                (rev.role || "").toLowerCase().includes(searchVal);
            
            const matchRating = ratingFilter === "all" || String(rev.rating) === String(ratingFilter);
            const matchStatus = statusFilter === "all" || rev.status === statusFilter;

            return matchSearch && matchRating && matchStatus;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="admin-empty-table">No reviews found matching your filter criteria.</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(rev => {
            const stars = "â˜…".repeat(rev.rating) + "â˜†".repeat(5 - rev.rating);
            const dateStr = new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const isApproved = rev.status === "approved";
            const ratingColor = rev.rating <= 2 ? "#EF4444" : rev.rating === 3 ? "#F59E0B" : "#10B981";

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(rev.name)}</strong>
                        <br>
                        <small style="color:var(--admin-text-light)">${escapeHtml(rev.role || "Student / Parent")}</small>
                    </td>
                    <td>
                        <div style="color:${ratingColor}; font-size:1.15rem; font-weight:700; display:flex; align-items:center; gap:4px;">
                            <span>${stars}</span>
                            <span style="font-size:0.82rem; color:var(--admin-text-light);">(${rev.rating}/5)</span>
                        </div>
                    </td>
                    <td style="max-width:340px; line-height:1.5;">
                        <em style="color:var(--admin-text-main);">"${escapeHtml(rev.review_text)}"</em>
                    </td>
                    <td>
                        <span class="status-badge ${isApproved ? 'status-approved' : 'status-hidden'}">
                            ${isApproved ? 'Approved (Visible)' : 'Hidden'}
                        </span>
                    </td>
                    <td><small style="color:var(--admin-text-subtle);">${dateStr}</small></td>
                    <td>
                        <div class="action-btn-group">
                            ${isApproved 
                                ? `<button class="btn-action" title="Hide this review from the website" onclick="toggleReviewStatus('${rev.id}', 'hidden')">Hide</button>`
                                : `<button class="btn-action" style="color:#10B981;" title="Approve and show on website" onclick="toggleReviewStatus('${rev.id}', 'approved')">Approve</button>`
                            }
                            <button class="btn-action btn-danger-action" title="Permanently delete this review" onclick="deleteReviewItem('${rev.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; vertical-align:-1px; margin-right:2px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error loading reviews:", e);
    }
}

window.toggleReviewStatus = async function(id, newStatus) {
    await window.DB.updateReviewStatus(id, newStatus);
    showToast(`Review is now ${newStatus === 'approved' ? 'Approved & Visible on website' : 'Hidden from website'}.`, "success");
    loadReviewsModerationTable();
    loadDashboardOverview();
};

window.deleteReviewItem = async function(id) {
    if (confirm("Are you sure you want to permanently DELETE this review? It will be removed immediately from both the website and database.")) {
        await window.DB.deleteReview(id);
        showToast("Review deleted permanently.", "info");
        loadReviewsModerationTable();
        loadDashboardOverview();
    }
};

/**
 * 6. CONTENT EDITOR TAB
 */
async function loadContentEditorForm() {
    if (!window.DB) return;
    try {
        const content = await window.DB.getSiteContent();
        
        const ht = document.getElementById("editHeroTitle");
        const hs = document.getElementById("editHeroSubtitle");
        const mq = document.getElementById("editMotQuote");
        const ms = document.getElementById("editMotSub");
        const ip1 = document.getElementById("editIntroP1");
        const ip2 = document.getElementById("editIntroP2");
        const ch = document.getElementById("editCtaHead");
        const cs = document.getElementById("editCtaSub");

        if (ht) ht.value = content.hero_title || "";
        if (hs) hs.value = content.hero_subtitle || "";
        if (mq) mq.value = content.motivational_quote || "";
        if (ms) ms.value = content.motivational_sub || "";
        if (ip1) ip1.value = content.intro_p1 || "";
        if (ip2) ip2.value = content.intro_p2 || "";
        if (ch) ch.value = content.cta_heading || "";
        if (cs) cs.value = content.cta_subtitle || "";

        if (content.contact) {
            const p = document.getElementById("editPhone");
            const w = document.getElementById("editWhatsapp");
            const ad = document.getElementById("editAddress");

            if (p) p.value = content.contact.phone || "";
            if (w) w.value = content.contact.whatsapp || "";
            if (ad) ad.value = content.contact.address || "";
        }
    } catch (e) {
        console.error("Error loading content editor:", e);
    }
}

/**
 * 6.5 SUBJECTS MANAGEMENT MODULE
 */
async function loadSubjectsManagementTable() {
    if (!window.DB) return;
    const tbody = document.getElementById("subjectsTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--admin-text-muted);">Loading curriculum subjects...</td></tr>`;

    try {
        const subjects = await window.DB.getSubjects("all");
        const searchVal = (document.getElementById("subjectSearchInput") ? document.getElementById("subjectSearchInput").value.trim().toLowerCase() : "");
        const categoryFilter = (document.getElementById("subjectCategoryFilter") ? document.getElementById("subjectCategoryFilter").value : "all");

        let filtered = subjects.filter(sub => {
            const matchesSearch = !searchVal || 
                (sub.name && sub.name.toLowerCase().includes(searchVal)) || 
                (sub.tagline && sub.tagline.toLowerCase().includes(searchVal)) ||
                (sub.target_classes && sub.target_classes.toLowerCase().includes(searchVal));

            const matchesCategory = (categoryFilter === "all") || (sub.category === categoryFilter);

            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:40px; color:var(--admin-text-muted);">
                        No subjects match your criteria. Click <strong>+ Add New Subject</strong> above to add one.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(sub => {
            const isElective = (sub.category === "elective");
            const typeBadge = isElective 
                ? `<span class="badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-weight:600;">Class 9/10 Elective</span>`
                : `<span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:600;">Core Subject</span>`;

            const statusBadge = (sub.status === "active")
                ? `<span class="badge badge-success" style="cursor:pointer;" onclick="toggleSubjectStatus('${sub.id}')">Active (Visible)</span>`
                : `<span class="badge badge-warning" style="cursor:pointer;" onclick="toggleSubjectStatus('${sub.id}')">Hidden</span>`;

            const topicsList = (sub.topics && sub.topics.length > 0)
                ? `<div style="font-size:0.75rem; color:var(--admin-text-muted); margin-top:4px;">${sub.topics.slice(0, 2).map(t => `• ${escapeHtml(t)}`).join(" ")}${sub.topics.length > 2 ? ` (+${sub.topics.length - 2} more)` : ''}</div>`
                : '';

            return `
                <tr>
                    <td style="font-weight:700; color:var(--admin-text-main);">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${sub.accent_color || '#2563EB'};"></span>
                            ${escapeHtml(sub.name)}
                        </div>
                    </td>
                    <td>${typeBadge}</td>
                    <td><span style="font-size:0.85rem; font-weight:600; color:var(--admin-text-main);">${escapeHtml(sub.target_classes || 'All Classes')}</span></td>
                    <td style="max-width:280px;">
                        <div style="font-size:0.85rem; color:var(--admin-text-main); line-height:1.4;">${escapeHtml(sub.tagline || '—')}</div>
                        ${topicsList}
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-outline btn-sm" onclick="openEditSubjectModal('${sub.id}')" title="Edit Subject">Edit</button>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#FECACA;" onclick="deleteSubjectHandler('${sub.id}')" title="Delete Subject">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--danger);">Error loading subjects: ${escapeHtml(err.message)}</td></tr>`;
    }
}

window.openAddSubjectModal = function() {
    const form = document.getElementById("subjectForm");
    if (!form) return;
    form.reset();
    document.getElementById("subjectFormId").value = "";
    document.getElementById("subjectModalTitle").textContent = "Add New Subject";
    document.getElementById("subClasses").value = "Classes 7, 8, 9 & 10";
    openModal("subjectModal");
};

window.openEditSubjectModal = async function(id) {
    const subjects = await window.DB.getSubjects("all");
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    document.getElementById("subjectFormId").value = sub.id;
    document.getElementById("subName").value = sub.name || "";
    document.getElementById("subCategory").value = sub.category || "core";
    document.getElementById("subClasses").value = sub.target_classes || "Classes 7, 8, 9 & 10";
    document.getElementById("subTagline").value = sub.tagline || "";
    document.getElementById("subTopics").value = (sub.topics && Array.isArray(sub.topics)) ? sub.topics.join("\n") : "";
    document.getElementById("subAccentColor").value = sub.accent_color || "#2563EB";
    document.getElementById("subStatus").value = sub.status || "active";
    document.getElementById("subjectModalTitle").textContent = "Edit Subject: " + sub.name;
    openModal("subjectModal");
};

window.toggleSubjectStatus = async function(id) {
    const subjects = await window.DB.getSubjects("all");
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    const newStatus = (sub.status === "active") ? "hidden" : "active";
    await window.DB.updateSubject(id, { status: newStatus });
    showToast(`Subject "${sub.name}" is now ${newStatus === 'active' ? 'visible' : 'hidden'}.`, "success");
    loadSubjectsManagementTable();
};

window.deleteSubjectHandler = async function(id) {
    const subjects = await window.DB.getSubjects("all");
    const sub = subjects.find(s => s.id === id);
    const subName = sub ? sub.name : "this subject";

    if (confirm(`Are you sure you want to permanently remove "${subName}" from the curriculum?`)) {
        await window.DB.deleteSubject(id);
        showToast(`Subject "${subName}" deleted successfully.`, "success");
        loadSubjectsManagementTable();
        loadDashboardOverview();
    }
};

/**
 * 6.8 FACULTY & TEACHERS MANAGEMENT MODULE
 */
async function loadFacultiesManagementTable() {
    if (!window.DB) return;
    const tbody = document.getElementById("facultiesTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--admin-text-muted);">Loading faculty mentors...</td></tr>`;

    try {
        const faculties = await window.DB.getFaculties("all");
        const searchVal = (document.getElementById("facultySearchInput") ? document.getElementById("facultySearchInput").value.trim().toLowerCase() : "");

        let filtered = faculties.filter(fac => {
            return !searchVal ||
                (fac.name && fac.name.toLowerCase().includes(searchVal)) ||
                (fac.subject && fac.subject.toLowerCase().includes(searchVal)) ||
                (fac.graduation && fac.graduation.toLowerCase().includes(searchVal)) ||
                (fac.bio && fac.bio.toLowerCase().includes(searchVal));
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:40px; color:var(--admin-text-muted);">
                        No faculty members found. Click <strong>+ Add New Faculty</strong> above to add one.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(fac => {
            const photoSrc = fac.photo_url || "assets/images/about_teachers.jpg";
            const statusBadge = (fac.status === "active")
                ? `<span class="badge badge-success" style="cursor:pointer;" onclick="toggleFacultyStatus('${fac.id}')">Active (Visible)</span>`
                : `<span class="badge badge-warning" style="cursor:pointer;" onclick="toggleFacultyStatus('${fac.id}')">Hidden</span>`;

            const framingNames = {
                "circle-lg": "Large Circle (150px)",
                "circle-xl": "XL Circle (180px)",
                "circle-full": "Jumbo Circle (200px)",
                "portrait-rect": "Portrait 3:4",
                "square-rounded": "Squircle (160px)"
            };
            const framingBadgeText = framingNames[fac.framing] || "Large Circle";

            return `
                <tr>
                    <td style="font-weight:700; color:var(--admin-text-main);">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(fac.name)}" style="width:52px; height:52px; min-width:52px; object-fit:cover; border-radius:50%; border:2px solid #CBD5E1; background:#F8FAFC; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                            <div>
                                <div>${escapeHtml(fac.name)}</div>
                                <div style="font-size:0.72rem; color:var(--admin-text-muted); margin-top:2px; font-weight:500;">
                                    <span style="background:#F1F5F9; padding:2px 6px; border-radius:4px; border:1px solid #E2E8F0;">📐 ${escapeHtml(framingBadgeText)}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:600;">
                            ${escapeHtml(fac.subject)}
                        </span>
                    </td>
                    <td>
                        <span style="font-size:0.85rem; color:var(--admin-text-muted); font-weight:500;">
                            ${escapeHtml(fac.graduation || '—')}
                        </span>
                    </td>
                    <td style="max-width:240px; font-size:0.84rem; color:var(--admin-text-muted);">
                        ${escapeHtml(fac.bio || '—')}
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-outline btn-sm" onclick="openEditFacultyModal('${fac.id}')" title="Edit Faculty">Edit</button>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#FECACA;" onclick="deleteFacultyHandler('${fac.id}')" title="Delete Faculty">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--danger);">Error loading faculty: ${escapeHtml(err.message)}</td></tr>`;
    }
}

window.openAddFacultyModal = function() {
    const form = document.getElementById("facultyForm");
    if (!form) return;
    form.reset();
    const idEl = document.getElementById("facultyFormId");
    if (idEl) idEl.value = "";
    const titleEl = document.getElementById("facultyModalTitle");
    if (titleEl) titleEl.textContent = "Add Faculty Member";
    if (document.getElementById("facFraming")) document.getElementById("facFraming").value = "circle-lg";
    if (document.getElementById("facPhotoFit")) document.getElementById("facPhotoFit").value = "top";
    const previewBox = document.getElementById("facultyImagePreviewBox");
    if (previewBox) previewBox.style.display = "none";
    openModal("facultyModal");
};

window.openEditFacultyModal = async function(id) {
    const faculties = await window.DB.getFaculties("all");
    const fac = faculties.find(f => f.id === id);
    if (!fac) return;

    if (document.getElementById("facultyFormId")) document.getElementById("facultyFormId").value = fac.id;
    if (document.getElementById("facName")) document.getElementById("facName").value = fac.name || "";
    if (document.getElementById("facSubject")) document.getElementById("facSubject").value = fac.subject || "";
    if (document.getElementById("facGraduation")) document.getElementById("facGraduation").value = fac.graduation || "";
    if (document.getElementById("facPhotoUrl")) document.getElementById("facPhotoUrl").value = fac.photo_url || "";
    if (document.getElementById("facFraming")) document.getElementById("facFraming").value = fac.framing || "circle-lg";
    if (document.getElementById("facPhotoFit")) document.getElementById("facPhotoFit").value = fac.photo_fit || "top";
    if (document.getElementById("facBio")) document.getElementById("facBio").value = fac.bio || "";
    if (document.getElementById("facStatus")) document.getElementById("facStatus").value = fac.status || "active";
    if (document.getElementById("facultyModalTitle")) document.getElementById("facultyModalTitle").textContent = "Edit Faculty: " + fac.name;

    const previewBox = document.getElementById("facultyImagePreviewBox");
    const previewImg = document.getElementById("facultyImagePreview");
    if (fac.photo_url && previewImg && previewBox) {
        previewImg.src = fac.photo_url;
        previewBox.style.display = "block";
        if (typeof window.updateFacultyLivePreview === "function") {
            window.updateFacultyLivePreview();
        }
    } else if (previewBox) {
        previewBox.style.display = "none";
    }

    openModal("facultyModal");
};

window.toggleFacultyStatus = async function(id) {
    const faculties = await window.DB.getFaculties("all");
    const fac = faculties.find(f => f.id === id);
    if (!fac) return;

    const newStatus = (fac.status === "active") ? "hidden" : "active";
    await window.DB.updateFaculty(id, { status: newStatus });
    showToast(`Faculty "${fac.name}" is now ${newStatus === 'active' ? 'visible' : 'hidden'}.`, "success");
    loadFacultiesManagementTable();
};

window.deleteFacultyHandler = async function(id) {
    const faculties = await window.DB.getFaculties("all");
    const fac = faculties.find(f => f.id === id);
    const facName = fac ? fac.name : "this faculty member";

    if (confirm(`Are you sure you want to delete "${facName}" from the faculty list?`)) {
        await window.DB.deleteFaculty(id);
        showToast(`Faculty member "${facName}" deleted.`, "success");
        loadFacultiesManagementTable();
        loadDashboardOverview();
    }
};

/**
 * 7. FORMS & IMAGE UPLOADS INITIALIZATION
 */
function initAdminForms() {
    // 1. Image File Upload Preview for Banners
    const bannerFileInput = document.getElementById("bannerFileInput");
    const bannerUrlInput = document.getElementById("bannerImageUrl");
    const previewBox = document.getElementById("bannerImagePreviewBox");
    const previewImg = document.getElementById("bannerImagePreview");

    if (bannerFileInput) {
        bannerFileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const dataUrl = evt.target.result;
                    if (bannerUrlInput) bannerUrlInput.value = dataUrl;
                    if (previewImg && previewBox) {
                        previewImg.src = dataUrl;
                        previewBox.style.display = "block";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (bannerUrlInput) {
        bannerUrlInput.addEventListener("input", function() {
            const val = this.value.trim();
            if (val && previewImg && previewBox) {
                previewImg.src = val;
                previewBox.style.display = "block";
            }
        });
    }

    // 2. Image File Upload for Individual Topper Photo
    const topperFileInput = document.getElementById("topperFileInput");
    const topperPhotoUrlInput = document.getElementById("topPhoto");
    if (topperFileInput) {
        topperFileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    if (topperPhotoUrlInput) topperPhotoUrlInput.value = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Save Banner Poster Form
    const bannerForm = document.getElementById("bannerForm");
    if (bannerForm) {
        bannerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const id = document.getElementById("bannerFormId").value;
            const bannerData = {
                title: bannerForm.title.value,
                batchYear: bannerForm.batchYear.value,
                subtitle: bannerForm.subtitle.value,
                imageUrl: bannerForm.imageUrl.value,
                description: bannerForm.description.value
            };

            if (!bannerData.imageUrl) {
                showToast("Please upload or enter an image URL for the result poster.", "error");
                return;
            }

            try {
                if (id) {
                    await window.DB.updateAchievementBanner(id, {
                        title: bannerData.title,
                        batch_year: bannerData.batchYear,
                        subtitle: bannerData.subtitle,
                        image_url: bannerData.imageUrl,
                        description: bannerData.description
                    });
                    showToast("Result poster updated successfully!", "success");
                } else {
                    await window.DB.addAchievementBanner(bannerData);
                    showToast("New result poster added successfully!", "success");
                }
                closeModal("bannerModal");
                loadToppersManagement();
                loadDashboardOverview();
            } catch (err) {
                showToast(err.message || "Failed to save poster.", "error");
            }
        });
    }

    // 4. Save Topper Form
    const topperForm = document.getElementById("topperForm");
    if (topperForm) {
        topperForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const id = document.getElementById("topperFormId").value;
            const topperData = {
                studentName: topperForm.studentName.value,
                studentClass: topperForm.studentClass.value,
                percentage: topperForm.percentage.value,
                subjectAchievement: topperForm.subjectAchievement.value,
                review: topperForm.review.value,
                photoUrl: topperForm.photoUrl.value
            };

            try {
                if (id) {
                    await window.DB.updateTopper(id, {
                        student_name: topperData.studentName,
                        student_class: topperData.studentClass,
                        percentage: topperData.percentage,
                        subject_achievement: topperData.subjectAchievement,
                        review: topperData.review,
                        photo_url: topperData.photoUrl
                    });
                    showToast("Achiever details updated.", "success");
                } else {
                    await window.DB.addTopper(topperData);
                    showToast("New achiever added successfully!", "success");
                }
                closeModal("topperModal");
                loadToppersManagement();
                loadDashboardOverview();
            } catch (err) {
                showToast(err.message || "Failed to save topper.", "error");
            }
        });
    }

    // 4.5 Save Subject Form
    const subjectForm = document.getElementById("subjectForm");
    if (subjectForm) {
        subjectForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const id = document.getElementById("subjectFormId").value;
            const subjectData = {
                name: subjectForm.name.value,
                category: subjectForm.category.value,
                target_classes: subjectForm.target_classes.value,
                tagline: subjectForm.tagline.value,
                topics: subjectForm.topics.value,
                accent_color: subjectForm.accent_color.value,
                status: subjectForm.status.value
            };

            if (!subjectData.name) {
                showToast("Please enter the subject name.", "error");
                return;
            }

            try {
                if (id) {
                    await window.DB.updateSubject(id, subjectData);
                    showToast("Subject details updated.", "success");
                } else {
                    await window.DB.addSubject(subjectData);
                    showToast("New subject added to curriculum!", "success");
                }
                closeModal("subjectModal");
                loadSubjectsManagementTable();
                loadDashboardOverview();
            } catch (err) {
                showToast(err.message || "Failed to save subject.", "error");
            }
        });
    }

    const subSearch = document.getElementById("subjectSearchInput");
    if (subSearch) subSearch.addEventListener("input", loadSubjectsManagementTable);

    const subCategoryFilter = document.getElementById("subjectCategoryFilter");
    if (subCategoryFilter) subCategoryFilter.addEventListener("change", loadSubjectsManagementTable);

    // 4.8 Faculty Photo File Upload & Framing Form
    const facultyFileInput = document.getElementById("facultyFileInput");
    const facPhotoUrlInput = document.getElementById("facPhotoUrl");
    const facFramingSelect = document.getElementById("facFraming");
    const facPhotoFitSelect = document.getElementById("facPhotoFit");
    const facPreviewBox = document.getElementById("facultyImagePreviewBox");
    const facPreviewImg = document.getElementById("facultyImagePreview");
    const facFrameWrapper = document.getElementById("facultyPreviewFrameWrapper");
    const facFramingLabel = document.getElementById("facultyPreviewFramingLabel");

    window.updateFacultyLivePreview = function() {
        const framing = (document.getElementById("facFraming") ? document.getElementById("facFraming").value : "circle-lg");
        const fit = (document.getElementById("facPhotoFit") ? document.getElementById("facPhotoFit").value : "top");
        const photoUrl = (document.getElementById("facPhotoUrl") ? document.getElementById("facPhotoUrl").value.trim() : "");
        const previewBox = document.getElementById("facultyImagePreviewBox");
        const previewImg = document.getElementById("facultyImagePreview");
        const frameWrapper = document.getElementById("facultyPreviewFrameWrapper");
        const framingLabel = document.getElementById("facultyPreviewFramingLabel");

        if (!photoUrl && (!previewImg || !previewImg.src || previewImg.src === window.location.href)) {
            if (previewBox) previewBox.style.display = "none";
            return;
        }

        if (previewImg && photoUrl) {
            previewImg.src = photoUrl;
        }

        if (previewBox) {
            previewBox.style.display = "block";
        }

        if (frameWrapper && previewImg) {
            if (framing === "circle-xl") {
                frameWrapper.style.width = "165px";
                frameWrapper.style.height = "165px";
                frameWrapper.style.borderRadius = "50%";
                previewImg.style.borderRadius = "50%";
                if (framingLabel) framingLabel.textContent = "Framing: Extra Large Circle (180px)";
            } else if (framing === "circle-full") {
                frameWrapper.style.width = "180px";
                frameWrapper.style.height = "180px";
                frameWrapper.style.borderRadius = "50%";
                previewImg.style.borderRadius = "50%";
                if (framingLabel) framingLabel.textContent = "Framing: Jumbo Circle (200px)";
            } else if (framing === "portrait-rect") {
                frameWrapper.style.width = "150px";
                frameWrapper.style.height = "190px";
                frameWrapper.style.borderRadius = "18px";
                previewImg.style.borderRadius = "14px";
                if (framingLabel) framingLabel.textContent = "Framing: Portrait Rectangle (3:4 Studio)";
            } else if (framing === "square-rounded") {
                frameWrapper.style.width = "150px";
                frameWrapper.style.height = "150px";
                frameWrapper.style.borderRadius = "22px";
                previewImg.style.borderRadius = "18px";
                if (framingLabel) framingLabel.textContent = "Framing: Rounded Squircle (160px)";
            } else {
                // Default circle-lg
                frameWrapper.style.width = "140px";
                frameWrapper.style.height = "140px";
                frameWrapper.style.borderRadius = "50%";
                previewImg.style.borderRadius = "50%";
                if (framingLabel) framingLabel.textContent = "Framing: Large Circle (150px) [Standard]";
            }

            if (fit === "center") {
                previewImg.style.objectPosition = "center center";
                previewImg.style.objectFit = "cover";
            } else if (fit === "contain") {
                previewImg.style.objectPosition = "center center";
                previewImg.style.objectFit = "contain";
            } else {
                previewImg.style.objectPosition = "center top";
                previewImg.style.objectFit = "cover";
            }
        }
    };

    if (facultyFileInput) {
        facultyFileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const dataUrl = evt.target.result;
                    if (facPhotoUrlInput) facPhotoUrlInput.value = dataUrl;
                    if (facPreviewImg) facPreviewImg.src = dataUrl;
                    window.updateFacultyLivePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (facPhotoUrlInput) {
        facPhotoUrlInput.addEventListener("input", function() {
            window.updateFacultyLivePreview();
        });
    }

    if (facFramingSelect) {
        facFramingSelect.addEventListener("change", function() {
            window.updateFacultyLivePreview();
        });
    }

    if (facPhotoFitSelect) {
        facPhotoFitSelect.addEventListener("change", function() {
            window.updateFacultyLivePreview();
        });
    }

    const facultyForm = document.getElementById("facultyForm");
    if (facultyForm) {
        facultyForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const idEl = document.getElementById("facultyFormId");
            const nameEl = document.getElementById("facName");
            const subEl = document.getElementById("facSubject");
            const gradEl = document.getElementById("facGraduation");
            const photoEl = document.getElementById("facPhotoUrl");
            const framingEl = document.getElementById("facFraming");
            const fitEl = document.getElementById("facPhotoFit");
            const bioEl = document.getElementById("facBio");
            const statusEl = document.getElementById("facStatus");

            const id = idEl ? idEl.value.trim() : "";
            const facultyData = {
                name: nameEl ? nameEl.value.trim() : "",
                subject: subEl ? subEl.value.trim() : "",
                graduation: gradEl ? gradEl.value.trim() : "",
                photo_url: photoEl ? photoEl.value.trim() : "",
                framing: framingEl ? framingEl.value : "circle-lg",
                photo_fit: fitEl ? fitEl.value : "top",
                bio: bioEl ? bioEl.value.trim() : "",
                status: statusEl ? statusEl.value : "active"
            };

            if (!facultyData.name) {
                showToast("Please enter the faculty member's full name.", "error");
                if (nameEl) nameEl.focus();
                return;
            }
            if (!facultyData.subject) {
                showToast("Please enter the subject(s) taught.", "error");
                if (subEl) subEl.focus();
                return;
            }

            try {
                if (id) {
                    await window.DB.updateFaculty(id, facultyData);
                    showToast("Faculty details updated successfully!", "success");
                } else {
                    await window.DB.addFaculty(facultyData);
                    showToast("New faculty member added successfully!", "success");
                }
                closeModal("facultyModal");
                loadFacultiesManagementTable();
                loadDashboardOverview();
            } catch (err) {
                showToast(err.message || "Failed to save faculty member.", "error");
            }
        });
    }

    const facSearch = document.getElementById("facultySearchInput");
    if (facSearch) facSearch.addEventListener("input", loadFacultiesManagementTable);

    // 5. First Time Master Password Setup Form
    const setupForm = document.getElementById("firstTimeSetupForm");
    if (setupForm) {
        setupForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const pass = setupForm.initialPassword.value;
            const confirm = setupForm.confirmInitialPassword.value;
            const secPass = setupForm.initialSecPassword ? setupForm.initialSecPassword.value : "44332211";

            if (pass !== confirm) {
                showToast("Master passwords do not match.", "error");
                return;
            }
            if (pass.length < 6) {
                showToast("Master Password must be at least 6 characters.", "error");
                return;
            }

            const submitBtn = setupForm.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Setting Credentials...";
            }

            try {
                await window.AuthManager.setupInitialPassword(pass, secPass);
                showToast("Credentials created successfully! Welcome to Shine Admin.", "success");
                checkAdminAuthState();
            } catch (err) {
                showToast(err.message || "Failed to setup password.", "error");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Set Credentials & Enter Dashboard";
                }
            }
        });
    }

    // 6. Standard Dual-Password Login Form
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const masterPass = loginForm.loginPassword.value;
            const secPass = loginForm.loginSecondaryPassword ? loginForm.loginSecondaryPassword.value : "";

            if (!masterPass) {
                showToast("Please enter Primary Master Password.", "error");
                return;
            }
            if (!secPass) {
                showToast("Please enter Secondary Security PIN.", "error");
                return;
            }

            const submitBtn = loginForm.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Verifying Dual Credentials...</span>`;
            }

            try {
                await window.AuthManager.verifyDualAuthentication(masterPass, secPass);
                window.AuthManager.createSession();
                showToast("Authentication successful. Welcome Admin!", "success");
                loginForm.reset();
                checkAdminAuthState();
            } catch (err) {
                showToast(err.message || "Authentication failed. Please verify credentials.", "error");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Verify Credentials &amp; Log In</span>`;
                }
            }
        });
    }

    // 7. Change Primary Master Password Form
    const changePassForm = document.getElementById("changePasswordForm");
    if (changePassForm) {
        changePassForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const currentPass = changePassForm.currentPassword.value;
            const newPass = changePassForm.newPassword.value;
            const confirmPass = changePassForm.confirmNewPassword.value;

            if (newPass !== confirmPass) {
                showToast("New master passwords do not match.", "error");
                return;
            }

            try {
                await window.AuthManager.changePassword(currentPass, newPass);
                showToast("Primary Master Password updated successfully!", "success");
                changePassForm.reset();
            } catch (err) {
                showToast(err.message || "Failed to change master password.", "error");
            }
        });
    }

    // 7.1 Change Secondary Security Password (PIN) Form
    const changeSecPassForm = document.getElementById("changeSecondaryPasswordForm");
    if (changeSecPassForm) {
        changeSecPassForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const currentSecPass = changeSecPassForm.currentSecondaryPassword.value;
            const newSecPass = changeSecPassForm.newSecondaryPassword.value;
            const confirmSecPass = changeSecPassForm.confirmNewSecondaryPassword.value;

            if (newSecPass !== confirmSecPass) {
                showToast("New security passwords do not match.", "error");
                return;
            }

            try {
                await window.AuthManager.changeSecondaryPassword(currentSecPass, newSecPass);
                showToast("Secondary Security Password (PIN) updated successfully!", "success");
                changeSecPassForm.reset();
            } catch (err) {
                showToast(err.message || "Failed to change secondary security password.", "error");
            }
        });
    }

    // 8. Save Website Content Form
    const contentForm = document.getElementById("siteContentForm");
    if (contentForm) {
        contentForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const updated = {
                hero_title: document.getElementById("editHeroTitle").value,
                hero_subtitle: document.getElementById("editHeroSubtitle").value,
                motivational_quote: document.getElementById("editMotQuote").value,
                motivational_sub: document.getElementById("editMotSub").value,
                intro_p1: document.getElementById("editIntroP1").value,
                intro_p2: document.getElementById("editIntroP2").value,
                cta_heading: document.getElementById("editCtaHead").value,
                cta_subtitle: document.getElementById("editCtaSub").value,
                contact: {
                    phone: document.getElementById("editPhone").value,
                    whatsapp: document.getElementById("editWhatsapp").value,
                    address: document.getElementById("editAddress").value
                }
            };

            try {
                await window.DB.updateSiteContent(updated);
                showToast("Website content updated successfully!", "success");
            } catch (err) {
                showToast(err.message || "Failed to update content.", "error");
            }
        });
    }

    // 9. Reset Website Content Button
    const resetContentBtn = document.getElementById("resetContentBtn");
    if (resetContentBtn) {
        resetContentBtn.addEventListener("click", async function() {
            if (confirm("Reset all website text to institute defaults?")) {
                await window.DB.resetSiteContent();
                showToast("Website content reset to defaults.", "info");
                loadContentEditorForm();
            }
        });
    }

    // 10. Logout
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            window.AuthManager.logout();
            showToast("Logged out securely.", "info");
            checkAdminAuthState();
        });
    }

    // Live search & filters for all tabs
    document.getElementById("demoSearchInput")?.addEventListener("input", loadDemoRequestsTable);
    document.getElementById("demoStatusFilter")?.addEventListener("change", loadDemoRequestsTable);
    document.getElementById("admissionSearchInput")?.addEventListener("input", loadAdmissionsTable);
    document.getElementById("admissionStatusFilter")?.addEventListener("change", loadAdmissionsTable);
    
    // Reviews Live Filters
    document.getElementById("reviewSearchInput")?.addEventListener("input", loadReviewsModerationTable);
    document.getElementById("reviewRatingFilter")?.addEventListener("change", loadReviewsModerationTable);
    document.getElementById("reviewStatusFilter")?.addEventListener("change", loadReviewsModerationTable);
}

function loadSettingsForm() {
    // Password settings pane ready
}

/**
 * Global Admin Modal & Toast Helpers
 */
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

window.openAdminModal = window.openModal;
window.closeAdminModal = window.closeModal;

window.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

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
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}


window.resetMasterPasswordPrompt = function() {
    if (confirm("Reset administrative access and create a new master password?")) {
        localStorage.removeItem("shine_admin_auth_v1");
        localStorage.removeItem("shine_admin_sec_auth_v1");
        sessionStorage.removeItem("shine_admin_session_v1");
        if (window.AuthManager) window.AuthManager.initSecondaryPassword();
        showToast("Admin credentials reset. Please set up your credentials.", "info");
        checkAdminAuthState();
    }
};