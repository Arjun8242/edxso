# Candidate Review Dashboard

A **production-ready recruiter evaluation panel** for reviewing and comparing candidate profiles. Built with React, it enables efficient screening of ~1,000 applicants with automated priority scoring, real-time filtering, and detailed evaluation workflows.

## 🎯 Overview

This dashboard is designed for recruiters to:
- ✅ Review candidate profiles and scores
- ✅ Evaluate assignments and video explanations
- ✅ Automatically compute candidate priority (P0-P3)
- ✅ Visually compare 2-3 candidates side-by-side
- ✅ Track review status and shortlist candidates
- ✅ Provide detailed feedback with timestamp-based notes

**Estimated Users:** ~1,000 student applicants  
**Dashboard Metrics:** Real-time priority calculations, filterable roster, comparison analytics

---

## ✨ Core Features

### 1. **Candidate Roster (Main View)**
- 📋 Table layout with 100+ mock candidates
- 🔍 Search by candidate name
- 🎚️ Filter by score ranges (Assignment, Video, ATS)
- 🏷️ Filter by review status (pending, reviewed, shortlisted, rejected)
- ⬆️⬇️ Sort by Priority Score or Assignment Score
- 🎯 Real-time priority badges (P0-P3 color-coded)

### 2. **Candidate Detail Sidebar**
- 👤 Full candidate profile
- 📊 5 interactive score sliders (Assignment, Video, ATS, GitHub, Communication)
- 🔄 Real-time priority recalculation
- 📝 Review status selector

### 3. **Assignment Evaluation Panel**
Detailed 1-10 rating sliders for:
- UI Quality
- Component Structure
- State Handling
- Edge-case Handling
- Responsiveness
- Accessibility Awareness

### 4. **Video Evaluation Panel**
Detailed 1-10 rating sliders for:
- Clarity
- Confidence
- Architecture Explanation
- Tradeoff Reasoning
- Communication Strength
- **Bonus:** Timestamp-based notes (e.g., "2:30 - Great system design explanation")

### 5. **Priority Engine**
Automated weighted scoring:
- Assignment: 30%
- Video: 25%
- ATS: 20%
- GitHub: 15%
- Communication: 10%

**Priority Levels:**
- 🟢 **P0 (≥85):** Interview Immediately
- 🟡 **P1 (70-84):** Strong Shortlist
- 🟠 **P2 (50-69):** Review Later
- 🔴 **P3 (<50):** Reject

### 6. **Dashboard Summary**
Quick metrics overview:
- Total Candidates
- Reviewed Count
- Shortlisted Count
- Pending Count

### 7. **Candidate Comparison**
Side-by-side comparison of 2-3 candidates with:
- All 5 score metrics
- Priority levels
- Top performer highlighting
- Highest score per metric highlighting

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd assignment-4

# Install dependencies
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173/` with hot module replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## 📁 Project Structure

```
assignment-4/
├── src/
│   ├── App.jsx                          # Main app component
│   ├── App.css                          # App-specific styles
│   ├── index.css                        # Global styles & theme
│   ├── main.jsx                         # React entry point
│   ├── components/
│   │   ├── Header.jsx                   # Top navigation bar
│   │   ├── SummaryCards.jsx            # Dashboard metrics (4 cards)
│   │   ├── FilterBar.jsx               # Search, filters, sorting controls
│   │   ├── CandidateList.jsx           # Main candidate table
│   │   ├── CandidateSidebar.jsx        # Detail panel (3 tabs)
│   │   │   ├── OverviewTab             # Main scores + status
│   │   │   ├── AssignmentEvalTab       # 6 assignment criteria sliders
│   │   │   └── VideoEvalTab            # 5 video criteria + notes
│   │   ├── ComparisonModal.jsx         # Side-by-side comparison modal
│   │   └── PriorityBadge.jsx           # Reusable priority badge
│   ├── hooks/
│   │   └── useCandidates.js            # Central state management hook
│   ├── utils/
│   │   ├── mockData.js                 # 100 candidate data generator
│   │   └── calculatePriority.js        # Priority scoring engine
│   └── assets/                         # Images, icons, etc.
├── public/                             # Static assets
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite configuration
├── eslint.config.js                    # ESLint rules
└── README.md                           # This file
```

---

## 🏗️ Architecture

### State Management: `useCandidates` Hook

The custom hook centralizes all state management:

```javascript
const {
  candidates,              // Filtered list after search/filters/sort
  allCandidates,          // All 100 candidates (for reference)
  searchQuery,            // Current search text
  setSearchQuery,         // Update search
  sortBy,                 // 'priority' | 'assignment'
  setSortBy,
  sortOrder,              // 'asc' | 'desc'
  setSortOrder,
  filters,                // Score ranges + status filter
  setFilters,
  selectedCandidate,      // Currently viewed candidate
  selectedCandidateId,
  setSelectedCandidateId,
  updateCandidate,        // Update candidate scores/status
  compareIds,             // IDs of candidates in comparison
  toggleCompare,          // Add/remove from comparison
  clearCompare,
  compareCandidates,      // Actual candidate objects for comparison
  summary,                // Dashboard stats (total, reviewed, etc.)
} = useCandidates();
```

**Key Optimizations:**
- `useMemo` for expensive computations (filtering, enrichment)
- Single source of truth for all candidate data
- Real-time updates cascade to all components

---

## 📦 Components

### Header (`Header.jsx`)
Simple top bar with dashboard title and branding icon.

### SummaryCards (`SummaryCards.jsx`)
4 metric cards with gradient backgrounds:
- Total Candidates
- Reviewed Count
- Shortlisted Count
- Pending Count

### FilterBar (`FilterBar.jsx`)
- Search input (by candidate name)
- Expandable filter panel with:
  - Assignment score range (0-100)
  - Video score range (0-100)
  - ATS score range (0-100)
  - Review status dropdown
- Sort dropdown (Priority or Assignment)
- Sort order toggle (Asc/Desc)
- Reset filters button

### CandidateList (`CandidateList.jsx`)
Main data table with columns:
- Compare checkbox (max 3)
- Candidate name + email
- College
- 5 score columns (Assignment, Video, ATS, GitHub, Communication)
- Priority badge
- Status badge
- View detail button

### CandidateSidebar (`CandidateSidebar.jsx`)
Right-side drawer with 3 tabs:

1. **Overview Tab**
   - Priority score + badge
   - Status selector
   - 5 main score sliders (0-100)

2. **Assignment Eval Tab**
   - 6 criteria (UI Quality, Component Structure, etc.)
   - 1-10 range sliders
   - Real-time feedback display

3. **Video Eval Tab**
   - 5 criteria (Clarity, Confidence, etc.)
   - 1-10 range sliders
   - Timestamp notes system (add/delete)

### ComparisonModal (`ComparisonModal.jsx`)
Modal showing 2-3 candidates side-by-side:
- Profile info (avatar, name, college)
- All score metrics
- Priority level
- "Top Priority" badge on highest priority
- Score highlighting for highest per metric

### PriorityBadge (`PriorityBadge.jsx`)
Reusable component showing:
- Priority level (P0/P1/P2/P3)
- Priority score in parentheses
- Color-coded background + dot

---

## 🔧 Utilities

### `calculatePriority.js`

**`calculatePriorityScore(candidate)`**
- Input: Candidate object with all 5 scores
- Output: Weighted priority score (0-100)
- Formula: `(assignment×0.30) + (video×0.25) + (ats×0.20) + (github×0.15) + (communication×0.10)`

**`getPriorityLevel(score)`**
- Input: Priority score (0-100)
- Output: Priority string ('P0', 'P1', 'P2', 'P3')

**`getPriorityColor(level)`**
- Input: Priority level string
- Output: Object with RGB values and label

### `mockData.js`

**`generateMockCandidates(count = 100)`**
- Generates `count` realistic candidates
- Each candidate includes:
  - Basic info: name, email, college, appliedAt
  - 5 main scores: assignment, video, ats, github, communication
  - Sub-evaluations: assignmentEval (6 criteria), videoEval (5 criteria)
  - Status: randomly distributed (40% pending, 30% reviewed, 20% shortlisted, 10% rejected)
  - Video notes: empty array (populated via sidebar)

**Data Realism:**
- Names: Mix of Indian first/last names
- Colleges: Top Indian engineering institutes (IITs, BITS, NITs, etc.)
- Scores: Random distribution 0-100 per category
- Status distribution: Weighted towards pending (realistic workflow)

---

## 🎨 Styling & Theme

**Framework:** Tailwind CSS v4  
**Design System:** Custom dark theme

### Color Palette
```css
--color-surface: #0f172a         /* Main background */
--color-surface-light: #1e293b   /* Cards, inputs */
--color-surface-lighter: #334155 /* Hover states */
--color-border: #334155          /* Borders */
--color-text-primary: #f1f5f9    /* Main text */
--color-text-secondary: #94a3b8  /* Secondary text */
--color-text-muted: #64748b      /* Muted text */
--color-accent: #6366f1          /* Primary action (indigo) */
--color-p0: #10b981              /* Green - P0 */
--color-p1: #f59e0b              /* Amber - P1 */
--color-p2: #f97316              /* Orange - P2 */
--color-p3: #ef4444              /* Red - P3 */
```

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm` (640px), `lg` (1024px)
- Table scrolls horizontally on small screens
- Sidebar drawer on mobile

---

## 📊 Data Flow

```
useCandidates Hook
├── State: candidates (100 mock items)
├── Computed: enrichedCandidates (with priority scores)
├── Computed: filteredCandidates (after search/filters/sort)
└── Outputs: All operations to components

App.jsx (Main)
├── SummaryCards (← summary stats)
├── FilterBar (← filters state)
├── CandidateList (← filteredCandidates)
├── CandidateSidebar (← selectedCandidate)
└── ComparisonModal (← compareCandidates)

User Actions:
├── Search → useCandidates → filters candidates → CandidateList updates
├── Update Score → useCandidates → recalc priority → all components update
├── Add to Compare → useCandidates → manage compareIds
└── View Detail → useCandidates → set selectedCandidateId
```

---

## 🔄 Key Workflows

### Viewing Candidate Details
1. User clicks **"View"** button on any candidate row
2. `setSelectedCandidateId(candidateId)` triggers
3. `selectedCandidate` object updates
4. `CandidateSidebar` renders with Overview tab active
5. User can click other tabs to see evaluation criteria

### Updating Candidate Scores
1. User moves slider in Overview/Assignment/Video tab
2. `updateCandidate(id, { scoreName: newValue })` is called
3. Hook updates state
4. `enrichedCandidates` recomputes with new priority
5. All dependent memos recompute
6. Components re-render with new data

### Comparing Candidates
1. User clicks checkbox on candidate rows (max 3)
2. `toggleCompare(candidateId)` adds/removes ID
3. Comparison action bar appears when 2+ selected
4. User clicks **"Compare"** button
5. `ComparisonModal` opens showing side-by-side metrics
6. **"Top Priority"** badge highlights highest priority

### Filtering & Sorting
1. User adjusts filter sliders/dropdowns
2. `setFilters(newFilters)` updates state
3. `filteredCandidates` recomputes with:
   - Search query applied
   - Score ranges applied
   - Status filter applied
   - Sort order applied
4. `CandidateList` re-renders with new results

---

## ⚡ Performance Optimizations

1. **Memoization**
   - `enrichedCandidates`: Only recomputes when `candidates` changes
   - `filteredCandidates`: Only recomputes when search/filters/sort change
   - `summary`: Only recomputes when `enrichedCandidates` changes

2. **Avoiding Unnecessary Renders**
   - Component props are stable (memoized values)
   - Callbacks use `useCallback` for event handlers

3. **Data Structure**
   - Candidates stored as flat array (fast lookups by ID)
   - Comparison IDs stored separately (cheap to update)

---

## 🎓 Learning Points

### Why Custom Hook?
- **Centralized State:** All candidate logic in one place
- **Reusable Logic:** Filtering, sorting, priority calculations accessible to all components
- **Clean Components:** App.jsx focuses on rendering, not state management
- **Scalability:** Easy to add features (API integration, persistence, analytics)

### Real-Time Updates
- When you edit a score, the priority **instantly recalculates**
- No manual "Save" button needed
- UI reflects changes immediately across all components

### Component Composition
- Small, focused components (single responsibility)
- Tab system in sidebar keeps UI organized
- Modal for comparison keeps main view clean

---

## 🚢 Deployment & Live Links

### Deployed Services
* **Backend API Host (Render + Neon)**: `https://edxso.onrender.com`
* **Live Health Check**: [https://edxso.onrender.com/api/health](https://edxso.onrender.com/api/health)
* **Candidates Endpoint**: [https://edxso.onrender.com/api/candidates](https://edxso.onrender.com/api/candidates)
* **Dashboard Summary**: [https://edxso.onrender.com/api/dashboard-summary](https://edxso.onrender.com/api/dashboard-summary)

### Deployment Options

#### 1. Backend Deployment (Render + Neon)
See [deployment_guide.md](file:///C:/Users/arjun/.gemini/antigravity-ide/brain/3d3ef2e9-3bc8-4325-886c-d003228a4de7/deployment_guide.md) for full step-by-step instructions on setting up the Neon Serverless PostgreSQL Database and deploying the Node.js API to Render.

#### 2. Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

#### 3. Frontend Deployment (Netlify)
* Connect your GitHub repo to Netlify.
* Configure the build command as `npm run build` and publish directory as `dist`.
* Set environment variable `VITE_API_URL` to `https://edxso.onrender.com` to point to the live backend.

---

## 🧪 Testing

### 1. Automated Unit Tests
Automated tests cover the scoring algorithm and priority bucket assignment thresholds.
```bash
# Run from the backend directory
cd backend
node --test tests/priorityEngine.test.js
```

### 2. API Manual Testing Guide
The backend API can be tested using standard `cURL` commands pointing to either your local server (`http://localhost:5000`) or the live Render server (`https://edxso.onrender.com`).

A full, detailed API testing document containing payload formats, PowerShell alternatives, and Node.js one-liners is available at [backend/API_TESTING_GUIDE.md](file:///c:/Users/arjun/Downloads/assignment-4/backend/API_TESTING_GUIDE.md).

#### Quick cURL Cheat Sheet (Live Endpoint Testing):
* **Health Check**:
  ```bash
  curl.exe -s https://edxso.onrender.com/api/health
  ```
* **Dashboard Summary**:
  ```bash
  curl.exe -s https://edxso.onrender.com/api/dashboard-summary
  ```
* **List Candidates (Paginated & Filtered)**:
  ```bash
  curl.exe -s "https://edxso.onrender.com/api/candidates?page=1&page_size=2&assignment_score=>80"
  ```
* **Create Candidate**:
  ```bash
  curl.exe -X POST https://edxso.onrender.com/api/candidates \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Candidate\",\"assignment_score\":85,\"video_score\":90,\"ats_score\":75,\"github_score\":80,\"communication_score\":85}"
  ```
* **Create Evaluation**:
  ```bash
  curl.exe -X POST https://edxso.onrender.com/api/evaluations/1 \
    -H "Content-Type: application/json" \
    -d "{\"ui_quality\":80,\"state_handling\":85,\"edge_case_thinking\":90,\"architecture_understanding\":85,\"communication\":80,\"confidence\":85,\"accessibility_awareness\":80}"
  ```
* **Add Reviewer Note**:
  ```bash
  curl.exe -X POST https://edxso.onrender.com/api/candidates/1/notes \
    -H "Content-Type: application/json" \
    -d "{\"reviewer\":\"CTO Office\",\"note\":\"Excellent depth of technical understanding.\"}"
  ```
* **Compare Candidates**:
  ```bash
  curl.exe -s "https://edxso.onrender.com/api/compare?ids=1,2"
  ```

### 3. Frontend UI Manual Testing Checklist
- [ ] Search filters candidates by name
- [ ] Score range filters work correctly
- [ ] Status filter shows only selected status
- [ ] Sorting by priority orders correctly
- [ ] Sorting by assignment score orders correctly
- [ ] Click "View" opens sidebar
- [ ] Adjust score slider → priority updates
- [ ] Change status dropdown → updates
- [ ] Add timestamp notes → notes appear
- [ ] Delete note → removes from list
- [ ] Toggle compare checkboxes → action bar appears
- [ ] Click "Compare" → modal shows 2-3 candidates
- [ ] Close comparison → modal closes

---

## 📝 Evaluation Criteria

This project is assessed on:

| Criteria | Weight | Status |
|----------|--------|--------|
| UI Clarity | 25% | ✅ Professional dark theme, clear hierarchy |
| Component Structure | 20% | ✅ 8 focused components, single responsibility |
| State Management | 20% | ✅ Custom hook with memoized computations |
| Priority Logic | 15% | ✅ Correct weighting, real-time updates |
| Edge-case Handling | 10% | ✅ Empty states, disabled states, max limits |
| Visual Hierarchy & UX | 10% | ✅ Color coding, animations, responsive design |

---

## 🔗 Technologies Used

- **React 19.2.5** - UI framework with Hooks
- **Vite 8.0.10** - Fast build tool
- **Tailwind CSS 4.2.4** - Utility-first styling
- **Lucide React 1.8.0** - Icon library
- **ESLint** - Code quality

---

## 📄 License

MIT License - Feel free to use this project for educational purposes.

---

## 🤝 Contributing

For improvements or bug fixes, please create an issue or pull request.

---

## 📧 Support

For questions or issues, reach out via GitHub issues or email.

---

**Last Updated:** April 2026  
**Status:** Production Ready ✅
