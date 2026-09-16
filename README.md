# NextClass 🎓

> **Tagline**: *"Know what's next."*

NextClass is a high-precision, cross-platform academic schedule mobile application built with **React Native**, **Expo SDK 52**, and **TypeScript**. It helps college and university students navigate daily schedules with complete clarity by combining:
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

- **Genuine React Native Components**: Built with pure React Native primitives (`View`, `Text`, `ScrollView`, `TouchableOpacity`, `Modal`, `TextInput`, `StyleSheet`) — **strictly no WebView or iframe wrappers**.
- **Cross-Platform Target**: iOS, Android, and Web preview via Expo SDK 52 and React Native Web (`@expo/metro-runtime`).
- **Safe Area Insets**: Handled natively with `react-native-safe-area-context` for modern edge-to-edge displays and notches.
- **Local Profile System (No Cloud Auth)**:
  - NextClass uses a **Local Profile** stored directly in local device storage.
  - **No backend authentication** (Firebase, Supabase, Cognito, etc.) is used or required.
  - Profile attributes (Name, Department, Semester, Section) persist across app launches and customize schedule headers and titles.
- **Data Isolation & Clean Onboarding**:
  - Fresh installs start with a completely blank schedule and an onboarding flow.
  - **Dual Namespaces**: `userData` and `demoData` live in strictly isolated storage keys.
  - Exploring demo mode or resetting demo data **never** overwrites, mutates, or deletes personal user data.
- **Design System & Theme**:
  - Professional Academic Palette (Sapphire & Royal Cobalt `#2563EB` with Slate neutrals) — strictly avoids generic purple AI aesthetics.
  - Full support for Light Mode, Dark Mode, and System Theme preferences across all screens.

---

## 🏛️ Authoritative Schedule Ground Truth

Extracted directly from the official institutional schedule:
- **Reference File**: `docs/reference/Timetable_Sem5_CSE_C.pdf`
- **Class Start Time**: Weekdays start strictly at **08:10 AM** (Period 1: 08:10 – 09:00).
- **Multi-Hour Lab Sessions**: Includes genuine multi-period lab sessions:
  - **Tuesday 08:10 – 10:25**: Computer Networks Lab (B LAB — 2h 15m)
  - **Tuesday 10:50 – 13:05**: Machine Learning Lab (A LAB — 2h 15m)
  - **Monday 13:25 – 15:40**: Embedded Systems Lab (D LAB — 2h 15m)
  - Multi-hour lab blocks are preserved as continuous instructional blocks — **not** normalized into generic 50-minute periods.
- **Official Breaks**: Morning Tea Break (10:40 – 11:00 AM) and Lunch Break (12:40 – 01:25 PM) automatically computed and rendered.

---

## ✨ Core Screens & Capabilities

1. **Local Profile & Onboarding**:
   - First-time setup allows students to enter Name, Department, Semester, and Section.
   - Student can choose to start with a blank personal timetable or opt into Demo Mode.
2. **User Timetable Setup (Manual Editor)**:
   - Full manual weekly timetable creation and management.
   - Weekday selector (Monday to Saturday).
   - Add/edit class modal supporting Course Code, Name, Start/End time, Room, Faculty, Class Type (Lecture, Lab, Tutorial, Activity, Counselling), and Color.
   - Baseline Invariant Badge: explicitly informs the student that their master baseline is protected from temporary date overrides.
3. **User Academic Calendar Setup (Manual Editor)**:
   - Manual academic calendar event creation via modal.
   - Supports: Holidays, Working Days, Special Timetable Days (remapping to another weekday schedule), Exams, Vacations, and Milestones.
4. **Today View**:
   - **Happening Now Hero**: Real-time progress bar and countdown showing minutes remaining in the ongoing class or break.
   - **Next Class Alert**: Immediate banner displaying the next scheduled class and room number.
   - **Chronological Timeline**: Interleaved timeline of periods and breaks with live status badges.
   - **Ahead-of-Time Tomorrow Preview**: Integrated glance at tomorrow's schedule and holiday status without changing tabs.
5. **Tomorrow View**:
   - Dedicated tomorrow view resolving special day order shifts or holidays with a single tap to return to Today.
6. **Interactive Calendar**:
   - Monthly grid with color-coded status indicators (Holidays, Day Orders, Exams, Overrides).
   - Date selection drawer revealing projected schedule for any day in the term.
   - "Add Event" button and "Simulate Day" button.
7. **Schedule Changes Manager**:
   - Date-specific override manager supporting 5 change types: Cancellation, Room Relocation, Period Reschedule, Extra Class, and Day Order Shift.
8. **Settings & Simulator**:
   - Student Profile management (Name, Department, Semester, Section).
   - App Mode switcher with Data Isolation guarantee.
   - Time Simulator with quick presets (Networks Lab, Tea Break, Lunch, End of Day).
   - JSON Backup Import and Export with defensive schema validation.

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

# Run on Android device / emulator (requires Android Studio / SDK)
npm run android

# Run on iOS simulator (requires macOS / Xcode)
npm run ios

# Run React Native Web preview via Expo Metro
npm run expo:web
```

### Running the Web Application (Vite Preview)
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Automated Test Suite
```bash
npm run test
```
Executes all 26 automated unit and integration tests covering the schedule engine, override precedence, baseline invariance, and user/demo data isolation.

### Production Build
```bash
npm run build
```
Generates a static web bundle in `dist/` ready for hosting on GitHub Pages.

---

## 🧪 Verified Automated Test Cases

The test suite validates 26 automated test scenarios across two test files:
- `src/tests/scheduleEngine.test.ts` (24 tests):
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
- `src/tests/dataIsolation.test.ts` (2 tests):
  - Fresh install starts completely unconfigured without demo data
  - Full 7-step isolation scenario: creating user profile, adding timetable, adding calendar event, entering demo mode, mutating demo data, resetting demo data, exiting demo mode, and asserting 100% preservation of original user data.

---

## 🔍 Implementation Status & Known Limitations

| Feature / Area | Status | Technical Details |
| :--- | :--- | :--- |
| **Local Profile** | ✅ Implemented & Tested | Persisted in local device storage; no cloud auth. |
| **Manual Timetable Setup** | ✅ Implemented & Tested | Add/edit/delete classes across Monday–Saturday via modal. |
| **Manual Calendar Setup** | ✅ Implemented & Tested | Add/edit/delete holidays, day orders, exams, vacations via modal. |
| **PDF Timetable Import** | ❌ Not Implemented | Untested/unreliable for non-standard visual grids; manual editor + JSON import/export is the supported path. |
| **PDF Calendar Import** | ❌ Not Implemented | Untested/unreliable for complex table layouts; manual event editor + JSON import/export is the supported path. |
| **User / Demo Isolation** | ✅ Implemented & Tested | Strictly isolated storage namespaces; verified in automated tests. |
| **Theme (Light/Dark/System)** | ✅ Implemented & Tested | Sapphire & Royal Cobalt palette with full theme switching. |
| **Expo Metro Bundle** | ✅ Implemented & Tested | Exported via `npx expo export -p web` (2,097 modules bundled). |
| **Android APK Status** | ⚠️ Blocked Locally | Local build blocked by missing Android SDK (`ANDROID_HOME`) and Gradle in this Windows environment; cloud EAS build requires interactive Expo login. JavaScript bundle and assets are verified and buildable. |
| **iOS Status** | ⚠️ Configured Only | Configured for iOS bundle identifier and safe area; native compilation requires macOS/Xcode. |

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
