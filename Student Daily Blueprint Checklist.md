# Technical Specification: Kid Daily Routine Interactive Checklist

This specification details a lightweight, mobile-friendly, static web application designed for **Seth (5 years old)** and **April (8 years old)** to track their daily routines [1]. It is structured specifically for a coding agent to build and deploy as a single-page app on GitHub Pages with fully client-side state management.

---

## 1. Project Overview & UX Objectives
- **Target Audience:** Seth (5yo, visual learner) and April (8yo, independent reader) [1].
- **Tech Stack:** Tailwind CSS (via CDN), Vanilla HTML5/ES6 JavaScript, `canvas-confetti` (via CDN for rewards).
- **Core Goal:** Transform the physical routine sheet into an engaging daily game where kids can check off their tasks, earn daily stars, and maintain a streak.
- **Client-Side Storage:** Zero backend. All progress, preferences, and streaks are persisted in `localStorage` [1].

---

## 2. Dynamic UI & Theme Specifications
The interface should be highly visual, using custom color profiles and icons for each child to make it personalized and engaging:

### Profile Themes
- **Seth's Profile (Blue/Teal Adventure Theme):** Designed for a 5-year-old with larger tap targets, bold fonts, and heavy use of descriptive emojis/icons.
- **April's Profile (Purple/Pink Creative Theme):** Designed for an 8-year-old with more detailed task text and streak tracking.

---

## 3. Grounded Routine Lists (Data Layer)
The app must display tasks categorized into three daily phases. The task list is strictly sourced from their daily schedule [1]:

### Phase 1: BEFORE SCHOOL
1. 🍳 **Breakfast**
2. 👕 **Get Dressed**
3. 🪥 **Brush Teeth**
4. 🧹 **Brush Hair**
5. 🎒 **Pack Bag:** Lunchbox, water bottle, homework
6. 💧 **Drink Water**

### Phase 2: AFTER SCHOOL
1. 🎒 **Unpack Bag:** Water bottle, lunchbox
2. 🍎 **Snack**
3. 💬 **Parent's School Question:** "Parent asks you an interesting question about your school day" (Provide an interactive prompt generator with sample kid-friendly questions)
4. ✏️ **Homework**
5. 🎹 **Music Practice**
6. 👟 **Get Ready for Activities:** Soccer, dance, softball, etc.

### Phase 3: BEFORE BED
1. 🍽️ **Have Dinner**
2. 🧸 **Put Toys Away**
3. 🛁 **Bath**
4. 💤 **Get in Pyjamas**
5. 🪥 **Brush Teeth**
6. 🚽 **Pee**
7. 📚 **Story-time**
8. 😴 **Go to Sleep**

---

## 4. Feature Requirements

### A. Kid-Friendly Navigation & Layout
- **Splash Screen:** Profile selection screen with avatar cards for "Seth 🦖" (5yo) and "April 🎨" (8yo).
- **Dashboard View:**
  - Selected profile header with current streak count and total stars.
  - Three distinct collapsible sections corresponding to the daily phases: "🌅 Before School", "🌇 After School", and "🌙 Before Bed" [1].
  - Large interactive checkboxes (minimum 48x48px hit-box) that toggle cross-out styles.

### B. Parent-Kid Question Modal / Prompt (After-School Phase)
- Clicking the **"Parent's School Question"** task launches a friendly modal [1].
- It displays a randomized prompt to spark conversation (e.g., *"What was the funniest thing that happened today?"*, *"What game did you play at recess?"*, *"What did you learn today that surprised you?"*).
- Features a "Mark Complete" button in the modal to close and check off the item [1].

### C. Reward & Streak Engine
- **Task Confetti:** Tapping a checkbox triggers a mini confetti burst (`canvas-confetti` explosion).
- **Phase Complete Celebration:** Completing all tasks in a phase triggers a major star animation.
- **Daily Streak System:**
  - If all 3 phases are completed in a day, increment the current profile's streak by 1 and log a completed day.
  - **Auto-Reset:** On page load, the app must check the current date against the last active date. If a new day has started:
    - Save the completed status to history.
    - Reset checkboxes for the new day.
    - If a full calendar day was skipped, reset the current streak to 0, but preserve "Lifetime Stars".

---

## 5. Technical Architecture & Schemas

### Folder Structure (GitHub Pages-Compatible)
```text
/
├── index.html       # Single-entry viewport
├── styles.css       # Tailwind configuration & custom animations
└── app.js           # Core JS controller & state logic
```

### LocalStorage Schema
Save the profile state under a single key: `kidRoutineAppState`:
```json
{
  "activeProfile": "seth", // or "april"
  "profiles": {
    "seth": {
      "streak": 5,
      "lifetimeStars": 24,
      "lastActiveDate": "2026-08-15",
      "history": {
        "2026-08-14": { "beforeSchool": true, "afterSchool": true, "beforeBed": true }
      },
      "currentDayTasks": {
        "beforeSchool": { "Breakfast": true, "Get Dressed": false, "Brush Teeth": false, "Brush Hair": false, "Pack Bag": false, "Drink Water": false },
        "afterSchool": { "Unpack Bag": false, "Snack": false, "Parent Question": false, "Homework": false, "Music Practice": false, "Get Ready": false },
        "beforeBed": { "Dinner": false, "Put Toys Away": false, "Bath": false, "Pyjamas": false, "Brush Teeth": false, "Pee": false, "Story-time": false, "Go to Sleep": false }
      }
    },
    "april": {
      "streak": 12,
      "lifetimeStars": 52,
      "lastActiveDate": "2026-08-15",
      "history": {
        "2026-08-14": { "beforeSchool": true, "afterSchool": true, "beforeBed": true }
      },
      "currentDayTasks": {
        "beforeSchool": { "Breakfast": true, "Get Dressed": true, "Brush Teeth": true, "Brush Hair": true, "Pack Bag": true, "Drink Water": true },
        "afterSchool": { "Unpack Bag": true, "Snack": true, "Parent Question": true, "Homework": true, "Music Practice": true, "Get Ready": true },
        "beforeBed": { "Dinner": true, "Put Toys Away": true, "Bath": true, "Pyjamas": true, "Brush Teeth": true, "Pee": true, "Story-time": true, "Go to Sleep": false }
      }
    }
  }
}
```

---

## 6. Development Instructions for the Coding Agent

1. **Responsive Implementation:** Use a robust mobile-first design system. Ensure the interface works beautifully on both iPads (regular kid tablet) and smaller smartphone viewports.
2. **Accessible Visual Cues:** Use distinct, colorful SVG icons or emojis alongside task labels. This ensures the 5-year-old profile can be operated independently through visual indicators.
3. **Sound/Feedback (Optional but Recommended):** Utilize standard browser synthesis or subtle audio clips for task completion tones.
4. **Offline Capability:** Write fully standard-compliant JS without external npm dependencies, enabling local file-running and seamless GitHub Pages rendering.
