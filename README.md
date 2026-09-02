# Shine Coaching Institute Website

A production-ready, highly polished, and fully functional website designed specifically for **Shine Coaching Institute**. Built for students and parents, the platform communicates high quality, transparency, academic rigor, and affordability.

---

## Key Features & Highlights

### 1. Two Main Public Pages
- **Home (`index.html`)**:
  - **Hero Section**: "Building Strong Students. Creating Brighter Futures." with working *Book a Demo Class* and *Get Admission* buttons.
  - **Institute Introduction**: Story of affordable, student-focused education.
  - **10 Core Advantages**: Cards with subtle icons and micro-interactions.
  - **Motivational Message**: Educational quotes ("Every student has the potential to shine").
  - **4 Core Subjects**: Mathematics, Science, Social Science, and English with topic breakdowns and conceptual focus.
  - **Real Student Reviews**: Starts with zero fake data; includes interactive 5-star rating submission modal.
  - **Shine Achievers / Toppers**: Starts with clean empty state; displays genuine achievers added by the admin.
  - **Parent Connection**: Highlights open communication, regular feedback, and progress updates.
  - **Footer**: Institute details, navigation, contact placeholders, and a subtle **Admin Panel** link at the bottom.
- **About Us (`about.html`)**:
  - **Timeline Story**: Started by 4 teachers sharing the vision of affordable education; expanded by welcoming 2 new faculty members.
  - **Core Values**: Dedicated to personal attention, conceptual clarity, and continuous improvement.

### 2. Interactive Booking & Forms
- **Book a Demo Class**: Full validation for student name, class, subject, parent name, student phone, and WhatsApp. Generates a unique tracking reference ID and stores data immediately.
- **Get Admission**: Multi-subject selection checkboxes (Math, Science, Social Science, English), parent contact, student details, and tracking code.
- **Write a Review**: Interactive 1–5 star rating selector, name, role (Student/Parent), and review text submitted to the moderation queue.

### 3. Secure Admin Panel (`admin.html`)
- **Discrete Access**: Accessible **strictly** via the subtle footer link.
- **Web Crypto Master Authentication**: Military-grade PBKDF2 with SHA-256 and cryptographic salt. No hard-coded passwords, no plain text.
- **First-Time Password Setup**: Detects first launch and prompts admin to set their master password.
- **Live Statistics Overview**: Counters for Demo requests, Admissions, Reviews, and Achievers (shows 0 when empty).
- **Demo Requests Management**: Search, filter, view details modal, mark as contacted, delete.
- **Admissions Management**: Search, filter, view full application details, update status (New, Under Review, Enrolled, Rejected), delete.
- **Review Moderation**: Approve, hide, or delete submitted reviews.
- **Achievers & Toppers CRUD**: Add new toppers with score, subject distinction, testimonial, photo, edit, toggle visibility, and delete.
- **Website Content Editor**: Customize Hero headline, subtitle, motivational quote, about paragraphs, CTA, and contact details live without touching code.
- **Change Master Password**: Secure password update with current password verification and strength check.

### 4. Database & Cloud Backend Architecture
- **Dual-Mode System**:
  1. **Built-in Reactive Database Engine**: Works immediately out of the box offline or on any static server with zero setup.
  2. **Supabase Cloud DB Integration**: Ready to connect with `supabase-schema.sql` (PostgreSQL tables, indexes, and Row-Level Security policies).

---

## Project Structure

```
D:\downloads\shine-coaching-institute\
├── index.html              # Main Public Homepage
├── about.html              # About Us Page (Timeline & Story)
├── admin.html              # Secure Admin Panel & Dashboard
├── css/
│   ├── main.css            # Core design system, typography, animations, responsive breakpoints
│   └── admin.css           # Admin dashboard styling, charts, tables, moderation UI
├── js/
│   ├── config.js           # Supabase & Application configuration
│   ├── db.js               # Unified Data Access Layer (Supabase + reactive Fallback Provider)
│   ├── auth.js             # Web Crypto PBKDF2/SHA-256 secure admin authentication
│   ├── main.js             # Home page logic, modals, form validations, animations
│   ├── about.js            # About page story animations & interactions
│   └── admin.js            # Admin dashboard CRUD, review moderation, toppers, content editor
├── assets/
│   ├── images/             # Realistic educational visuals (hero-classroom.svg, about-story.svg, parent-teacher.svg)
│   └── icons/              # Subject and feature icons
├── supabase-schema.sql     # PostgreSQL database schema with Row Level Security (RLS)
└── README.md               # Complete documentation
```

---

## How to Run & View Locally

1. Open your file explorer and navigate to `D:\downloads\shine-coaching-institute`.
2. Double click **`index.html`** to open the website in any web browser (Chrome, Edge, Firefox, Safari).
3. Click **About Us** in the navigation bar to read the story and expansion timeline.
4. Test **Book a Demo Class** and **Get Admission** forms.
5. Click **Admin Panel** at the bottom of the footer:
   - On first launch, create your master password.
   - Access the dashboard to view submitted requests, moderate reviews, add toppers, or edit site content!

---

## Connecting to Supabase Cloud (Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the script in `supabase-schema.sql`.
3. Copy your **Project URL** and **Anon API Key** from *Project Settings -> API*.
4. In the Shine Admin Panel, navigate to **Security & Cloud** tab and paste your Supabase URL and Key, then click **Save Cloud Configuration**.
