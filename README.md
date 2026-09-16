# NextClass 🎓

> **Tagline**: *"Know what's next."*

NextClass is a high-precision, cross-platform academic schedule mobile application built with **React Native**, **Expo**, and **TypeScript**. It helps college and university students navigate daily schedules with complete clarity by combining:
1. An immutable, recurring **Weekly Timetable Baseline**
2. An institutional **Academic Calendar** (holidays, vacations, exams, and special timetable days like *"Wednesday follows Monday's schedule"*)
3. Real-time, date-specific **Student Overrides** (cancelled lectures, room changes, period time changes, and extra tutorial sessions)

---

## 🚀 Live Demo & Presentation

- **Web Live Application**: [https://mithunvisvesh.github.io/nextclass/](https://mithunvisvesh.github.io/nextclass/)
- **GitHub Repository**: [https://github.com/Mithunvisvesh/nextclass](https://github.com/Mithunvisvesh/nextclass)
- **Zero Installation Required**: Runs directly in mobile Safari (iOS), mobile Chrome (Android), and desktop browsers via React Native Web.

---

## 📱 Mobile Architecture & Engineering Standards

- **Genuine React Native Components**: Built with pure React Native primitives (`View`, `Text`, `ScrollView`, `TouchableOpacity`, `StyleSheet`) — **no WebView or iframe wrappers**.
- **Cross-Platform Target**: iOS, Android, and Web preview via Expo SDK 52 and React Native Web.
- **Safe Area Insets**: Handled natively with `react-native-safe-area-context` for modern edge-to-edge phone displays and notches.
- **Data Isolation & Clean Onboarding**:
  - Fresh installs start with a completely blank schedule and an onboarding flow.
  - **Dual Namespaces**: `userData` and `demoData` live in strictly isolated storage keys.
  - Exploring demo mode or resetting demo data **never** overwrites or deletes personal user data.
- **Design System & Theme**:
  - Professional Academic Palette (Sapphire & Royal Cobalt `#2563EB` with Slate neutrals) — strictly avoids generic purple AI aesthetics.
  - Full support for Light Mode, Dark Mode, and System Theme preferences.

---

## 🏛️ Authoritative Schedule Ground Truth

Extracted directly from the official institutional schedule:
- **Reference File**: `docs/reference/Timetable_Sem5_CSE_C.pdf`
- **Class Start Time**: Weekdays start strictly at **08:10 AM** (Period 1: 08:10 – 09:00).
- **Multi-Hour Lab Sessions**: Includes genuine multi-period lab sessions (e.g. Tuesday 08:10 – 10:25 Operating Systems Lab; Tuesday 10:50 – 13:05 Embedded Systems Lab) — **not** normalized into generic 50-minute periods.
- **Official Breaks**: Morning Tea Break (10:40 – 11:00 AM) and Lunch Break (12:40 – 01:25 PM) automatically computed and rendered.

---

## ✨ Core Screens & Navigation

1. **Today View**:
   - **Happening Now Hero**: Real-time progress bar and countdown showing minutes remaining in the ongoing class or break.
   - **Next Class Alert**: Immediate banner displaying the next scheduled class and room number.
   - **Chronological Timeline**: Interleaved timeline of periods and breaks with live status badges.
   - **Ahead-of-Time Tomorrow Preview**: Integrated glance at tomorrow's schedule and holiday status without changing tabs.
2. **Tomorrow View**:
   - Dedicated tomorrow view resolving special day order shifts or holidays.
3. **Weekly Timetable (Protected Master Baseline)**:
   - Monday through Saturday tabs.
   - Explicit invariant badge: date-specific overrides never mutate this master schedule.
   - Full CRUD modal to add, edit, or delete recurring lectures and labs.
4. **Interactive Calendar**:
   - Monthly grid with color-coded status indicators (Holidays, Day Orders, Exams, Overrides).
   - Date selection drawer revealing projected schedule for any day in the term.
   - Quick "Simulate Day" button.
5. **Schedule Changes Manager**:
   - Date-specific override manager supporting 5 change types: Cancellation, Room Relocation, Period Reschedule, Extra Class, and Day Order Shift.
6. **Settings & Simulator**:
   - Student Profile management (Name, Department, Semester, Section).
   - App Mode switcher with Data Isolation guarantee.
   - Time Simulator with quick presets (OS Lab, Tea Break, Lunch, End of Day).
   - JSON Backup Import and Export.

---

## 🛠️ Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/Mithunvisvesh/nextclass.git
cd nextclass

# Install dependencies
npm install
```

### Running with Expo (iOS / Android / Web)
```bash
# Start Expo development server
npm run start

# Run on Android device / emulator
npm run android

# Run on iOS simulator (macOS)
npm run ios

# Run React Native Web preview
npm run expo:web
```

### Running the Web Application (Vite)
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Automated Test Suite
```bash
npm run test
```
Executes all 24 automated unit and integration tests covering the schedule engine, override precedence, and baseline invariance.

### Production Build
```bash
npm run build
```
Generates a static web bundle in `dist/` ready for hosting on GitHub Pages.

---

## 🧪 Verified Automated Test Cases

The test suite in `src/tests/scheduleEngine.test.ts` validates 24 test scenarios:
- Normal weekday routine (starting at 8:10 AM)
- Weekend schedule detection (no routine classes on Sunday)
- Official institutional holidays (Ganesh Chaturthi, Diwali) suppressing routine classes
- Multi-day vacations (Dussehra break)
- Special timetable instructions (e.g., Oct 1 Thursday following Monday schedule)
- Date-specific cancellation without altering subsequent weeks
- Date-specific room relocations
- Date-specific time shifts
- Date-specific extra classes
- Date-specific source-day reassignment
- Real-time happening/upcoming/completed status computation
- Gap detection for morning tea and afternoon lunch breaks

---

## 🔒 Security & Privacy

- **Local-First & Offline Capable**: All timetable and profile data persists locally via AsyncStorage / LocalStorage.
- **Zero Analytics / Tracking**: No third-party trackers, cookies, or external server calls.
- **Defensive Ingestion**: Imported JSON backups undergo schema validation before updating the store.

---

## 📚 Project Documentation

- [PRD.md](PRD.md): Product requirements, user stories, and acceptance criteria.
- [DATA.md](DATA.md): Data schemas, entity models, and storage specifications.
- [docs/reference/](docs/reference/): Authoritative source academic calendar and timetable PDFs.

---

## 📄 License
MIT License. Built for academic scheduling and student productivity.
