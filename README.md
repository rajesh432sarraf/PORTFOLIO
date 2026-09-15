# Rajesh Sarraf — Creative Developer Portfolio

A production-ready personal developer portfolio for **Rajesh Sarraf** (B.Tech Computer Science & Engineering student, Developer • Builder • Problem Solver).

Built with a dark creative visual identity, oversized typography, Lenis smooth scrolling, Framer Motion editorial reveals, GSAP-enhanced interactions, magnetic controls, database integrations, and a secure Admin CMS.

---

## 🚀 Technology Stack

### Frontend & Visual System
* **Core**: React 18 (JavaScript ES6+, Vite)
* **Styling**: Tailwind CSS, Vanilla CSS design tokens
* **Typography**: Kanit (Google Fonts weights 300–900)
* **Motion & Animation**: Framer Motion, GSAP
* **Smooth Scrolling**: Lenis
* **Icons**: Lucide React & Custom SVG marks

### Backend & Database Architecture
* **MongoDB**: Serverless persistence for visitor messages with lifecycle status tracking (`new`, `read`, `replied`, `archived`).
* **MySQL**: Normalized relational schema for `projects`, `technologies`, `project_technologies`, `experience`, `achievements`, and `certifications`.
* **Supabase**: Admin authentication session management and asset storage (`portfolio-assets`).
* **Serverless Functions**: Vercel API endpoints (`/api/contact`, `/api/content`) keeping database credentials and API secrets strictly on the server.
* **Email Communication**: Resend API integration with Web3Forms fallback.

---

## 📂 Project Architecture

```
portfolio/
├── api/
│   ├── contact.js               # Serverless function for contact submissions
│   └── content.js               # Serverless content provider with caching
│
├── database/
│   ├── mysql-schema.sql         # Normalized relational DDL schema
│   └── mongodb-schema.js        # Mongoose contact message schema
│
├── public/
│   ├── images/
│   │   ├── projects/            # Project showcase screenshots
│   │   └── rajesh-portrait.jpg  # Studio hero portrait
│   ├── icons/
│   │   └── favicon.svg          # RS monogram favicon
│   ├── certificates/            # Verified credentials
│   └── og-image.png             # 1200x630 Social card preview
│
├── src/
│   ├── admin/
│   │   ├── AdminLogin.jsx       # Protected CMS portal
│   │   ├── AdminDashboard.jsx   # Tabbed CMS workspace
│   │   ├── ProjectManager.jsx   # Project CRUD & feature toggle
│   │   └── MessageManager.jsx   # Submissions manager
│   │
│   ├── components/
│   │   ├── Navbar.jsx           # Active navigation with IntersectionObserver
│   │   ├── Hero.jsx             # Massive Kanit typography & centered portrait
│   │   ├── Marquee.jsx          # Bi-directional scroll-synced technology stream
│   │   ├── About.jsx            # 4 floating abstract visuals & scroll reveal
│   │   ├── AnimatedText.jsx     # Scroll-driven character opacity reveal
│   │   ├── Skills.jsx           # Oversized numbered capability rows
│   │   ├── BuildSection.jsx     # Contrasting white rounded section
│   │   ├── Projects.jsx         # Sticky stacking card showcase & archive
│   │   ├── ProjectCard.jsx      # Asymmetric 3-image editorial gallery
│   │   ├── Experience.jsx       # Vertical editorial internship timeline
│   │   ├── Achievements.jsx     # 3rd place AI Agentic Hackathon highlight
│   │   ├── Certifications.jsx   # Technical credential cards
│   │   ├── Profiles.jsx         # GitHub, LinkedIn & LeetCode cards
│   │   ├── Contact.jsx          # Validation, honeypot & submission UX
│   │   ├── Footer.jsx           # Dynamic copyright & quick links
│   │   ├── BackToTop.jsx        # Smooth scroll-to-top button
│   │   ├── CustomCursor.jsx     # Desktop-only spring cursor
│   │   ├── MagneticButton.jsx   # Physics-based hover attraction
│   │   ├── FadeIn.jsx           # Viewport animation wrapper
│   │   └── NotFound.jsx         # Custom 404 page
│   │
│   ├── data/
│   │   ├── projects.js          # Verified project data & gallery paths
│   │   ├── experience.js        # Work & internship milestones
│   │   ├── achievements.js      # Hackathon awards & SIH experience
│   │   ├── certifications.js    # Verified credentials
│   │   ├── profiles.js          # Coding profiles
│   │   ├── skills.js            # Capability categories
│   │   └── buildAreas.js        # Service/build classifications
│   │
│   ├── services/
│   │   └── dataService.js       # Unified data fetcher with resilient fallback
│   │
│   ├── hooks/
│   │   ├── useLenis.js          # Lenis smooth scroll hook
│   │   └── useMousePosition.js  # Pointer tracking hook
│   │
│   ├── lib/
│   │   └── animations.js        # Shared easing curves & variants
│   │
│   ├── App.jsx                  # Client-side router & master view
│   ├── main.jsx                 # React root entry
│   └── index.css                # Global CSS & gradient tokens
│
├── index.html                   # Complete Open Graph, Twitter & SEO tags
├── tailwind.config.js           # Design system tokens
├── postcss.config.js            # PostCSS configuration
├── vercel.json                  # SPA rewrites & security headers
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your database and API credentials (optional for local testing; the site automatically operates with resilient verified fallback data if APIs are offline).

### 3. Start Vite Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Admin CMS Access
Navigate to `/admin` or `/admin/login` to access the protected content management system.

---

## 📦 Production Build & Deployment

### 1. Build for Production
```bash
npm run build
```

### 2. Preview Production Bundle Locally
```bash
npm run preview
```

### 3. Deploy to Vercel
Deploy seamlessly using the Vercel CLI or by connecting your GitHub repository:
```bash
vercel
```
The included `vercel.json` automatically configures SPA route rewrites and security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
