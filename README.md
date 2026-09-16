# NextClass 🎓

> **Tagline**: *"Know what's next."*

NextClass is a smart, local-first academic schedule application designed for college and university students. It combines a recurring weekly timetable with academic calendar events (holidays, special timetable days like *"Monday schedule on Thursday"*), and date-specific student overrides (swapped hours, cancellations, room changes, extra review sessions) into an accurate, unified daily schedule.

---

## 🚀 Live Demo & Presentation

- **Web Application URL**: [https://mithun54.github.io/nextclass/](https://mithun54.github.io/nextclass/)
- **GitHub Repository**: [https://github.com/mithun54/nextclass](https://github.com/mithun54/nextclass)
- **Zero Installation Required**: Runs directly in Safari (iOS), Chrome (Android), or desktop browsers.

---

## 💡 The Core Problem

Students face daily schedule confusion:
- Institutional holidays interrupt regular classes.
- Academic calendars reassign weekdays (e.g. *Oct 1 Thursday follows Monday's timetable*).
- Faculty swap lecture hours, cancel lectures, shift rooms, or call extra sessions.
- Static screenshots or timetable PDFs cannot adjust dynamically to these date-specific variations.

### The NextClass Formula

$$\begin{aligned}
&\text{Recurring Weekly Baseline} \\
+\ &\text{Academic Calendar (Holidays \& Events)} \\
+\ &\text{Official Special Timetable Instructions} \\
+\ &\text{User Date-Specific Overrides (Swaps, Cancels, Rooms)} \\
=\ &\mathbf{Actual\ Schedule\ For\ Today}
\end{aligned}$$

---

## ✨ Key Features

1. **Today View & Happening Now Hero Banner**:
   - Live badge highlighting the currently ongoing lecture/lab with real-time remaining minutes and progress bar.
   - Immediate detection of the upcoming class.
   - Comprehensive day timeline showing periods, breaks, and room numbers.
2. **Ahead-of-Time Tomorrow Preview**:
   - Integrated forecast on the home screen showing tomorrow's classes or holiday status without navigating elsewhere.
3. **Monthly Interactive Calendar**:
   - Visual color-coded day indicators: Green (Classes), Emerald (Holiday), Amber (Special Timetable), Purple (User Overrides).
   - Single-click date inspection drawer.
4. **Permanent Baseline vs. Temporary Overrides (Core Invariant)**:
   - Date-specific overrides (swapping NLP and CN, cancelling a lab) apply strictly to their designated date.
   - Subsequent weeks remain on the untouched baseline schedule.
5. **Interactive Time Simulator (Professor Grading Tool)**:
   - One-click presets to simulate key academic dates:
     - **Sep 21**: Swapped NLP & CN classes.
     - **Sep 23**: Cancelled Computer Networks lecture.
     - **Sep 25**: Relocated lecture from Room C404 to A406.
     - **Sep 14**: Ganesh Chaturthi holiday.
     - **Oct 01**: Official Special Timetable day (Thursday following Monday schedule).
     - **Oct 31**: Saturday following Friday schedule.
6. **Data Backup (JSON Import/Export)**:
   - Full schedule backup export and schema-validated JSON import.
7. **Bundled Sample Data**:
   - Pre-loaded with realistic engineering semester data (extracted from the supplied college PDFs) with a 1-click reload button.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite 6 (lightning-fast development and optimized production bundling).
- **Styling**: Tailwind CSS 3.4 (mobile-first, responsive, accessible).
- **Icons**: Lucide React.
- **Testing**: Vitest 3.0 (22 automated test scenarios).
- **Persistence**: Browser LocalStorage with schema validation.

---

## 🧠 Central Schedule Engine (`scheduleEngine.ts`)

The schedule engine evaluates each day deterministically via `getScheduleForDate(date)`:

```
1. Check Academic Calendar for Holiday/Vacation -> If holiday, suppress routine classes.
2. Check for Special Timetable Instructions (e.g. Oct 1 -> Monday Timetable).
3. Check for User Date-Specific Source Day Overrides.
4. Clone baseline classes for the resolved effective day.
5. Apply Date-Specific Overrides in sequence:
   - Cancel: Filter out cancelled class ID.
   - Swap: Exchange times and slots between two classes.
   - Room Change: Update room number on that specific date.
   - Time Change: Adjust start and end times.
   - Extra Class: Append new session for that day.
6. Sort chronologically by start time.
7. Mark statuses ('happening', 'upcoming', 'completed') relative to current/simulated time.
8. Detect gap intervals (breaks >= 15 minutes) and label Lunch/Recess.
```

---

## 📦 Setup & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone repository
git clone https://github.com/mithun54/nextclass.git
cd nextclass

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Tests
```bash
npm run test
```
Executes all 22 automated test cases in Vitest.

### Production Build
```bash
npm run build
```
Generates a static distribution in the `dist/` directory.

---

## 🧪 Acceptance Test Scenario (Verified in Tests)

1. **Recurring Monday**:
   - `09:00` — Machine Learning
   - `09:50` — Natural Language Processing
   - `11:00` — Computer Networks
2. **Create Date Override for Sep 21**:
   - Action: Swap NLP and Computer Networks
   - Result on `2026-09-21`:
     - `09:00` — Machine Learning
     - `09:50` — Computer Networks
     - `11:00` — Natural Language Processing
3. **Inspect Next Monday (Sep 28)**:
   - Result on `2026-09-28`:
     - `09:00` — Machine Learning
     - `09:50` — Natural Language Processing
     - `11:00` — Computer Networks
   - **Baseline is 100% preserved.**

---

## 🔒 Security & Privacy

- **Local-First**: All timetable data remains inside the user's browser.
- **Zero Analytics / Tracking**: No cookies, third-party trackers, or server logging.
- **Safe Rendering**: All inputs are sanitized and safely rendered via React JSX.
- **Defensive JSON Ingestion**: Malformed imported JSON files are rejected with informative error messages before updating local storage.

---

## 📚 Project Documentation

- [AGENTS.md](AGENTS.md): Architectural invariants and instructions for future coding agents.
- [SKILLS.md](SKILLS.md): Technical competencies and engineering patterns.
- [PRD.md](PRD.md): Product requirements document, user stories, and acceptance criteria.
- [DATA.md](DATA.md): Data schemas, entity models, and storage mapping.
- [PHASES.md](PHASES.md): Phased execution roadmap and implementation milestones.
- [API.md](API.md): Internal application interfaces and helper functions.
- [LOGS.md](LOGS.md): Concise development engineering logs.

---

## 📄 License
MIT License. Built for academic scheduling and student productivity.
