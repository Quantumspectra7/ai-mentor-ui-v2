# Project Documentation: Adaptive AI Study Mentor with Stress-Aware Planning

## 1. Title Page Content
**Project Title:** Adaptive AI Study Mentor with Stress-Aware Planning
**Subtitle:** A Personalized, Student-Centric Web Platform for Academic Excellence and Mental Well-being
**Prepared For:** Hackathon / Final Submission

---

## 2. Abstract / Overview
The **Adaptive AI Study Mentor with Stress-Aware Planning** is a comprehensive, student-focused web application designed to bridge the gap between academic rigor and student well-being. As students transition into complex academic environments, they frequently face overwhelming workloads, a lack of personalized guidance, and high stress levels. This project resolves these challenges by collecting structured input regarding a student's academic profile, habits, and emotional state to generate a dynamic, personalized dashboard. The platform features an AI-driven mentor chat, structured daily task tracking, curated video resources, and immediate stress-relief interventions (e.g., a "Panic Button"). By combining rule-based structure with Large Language Model (LLM) contextual understanding, the system provides an adaptive, holistic approach to student success.

---

## 3. Objective
The primary objective of this project is to create an intelligent, adaptive digital companion that:
1. **Personalizes Academic Guidance:** Tailors study plans and resource recommendations based on the individual student's branch, interests, and current phase of learning.
2. **Mitigates Academic Burnout:** Actively monitors and responds to student stress through specialized interventions and empathetic AI dialogue.
3. **Enhances Productivity:** Provides actionable, day-by-day task tracking to build consistent habits.
4. **Simplifies Campus Life:** Offers centralized information on campus facilities and study techniques.

---

## 4. Problem Statement
In modern educational institutions, students are subjected to immense pressure. The transition to university life or the approach of critical exam seasons often results in burnout, anxiety, and suboptimal academic performance. Traditional study applications focus solely on productivity (e.g., to-do lists, timers) without accounting for the user's emotional or mental state. Conversely, wellness apps lack context regarding academic deadlines and curriculum structures. **There is a critical need for an integrated system that understands the student's academic obligations while simultaneously acting as a stress-aware mentor.**

---

## 5. Proposed Solution
We propose a unified web platform that integrates academic planning with emotional intelligence. The system acts as a personalized "AI Mentor" that:
- **Onboards** students through a structured profiling questionnaire to understand their academic background, goals, and baseline stress levels.
- **Generates** a custom dashboard tailored to their specific "user type" (e.g., incoming freshman, exam-prep student).
- **Engages** the student via a conversational AI interface that infers mood from user input and adjusts its tone—offering motivation when the student is pumped, and empathetic, actionable advice when the student is stressed.
- **Intervenes** during acute anxiety episodes via a dedicated "Panic Button" that provides immediate, actionable grounding exercises.

---

## 6. System Workflow
1. **Authentication:** User logs in via secure authentication (Email/Password or OAuth).
2. **Onboarding (Initial Setup):** User fills out a detailed profile (Branch, Hostel, Interests, Extracurriculars, Current Stress Level).
3. **Evaluation Engine:** The system processes the inputs to categorize the user and determine the appropriate curriculum phase (e.g., Day 1 to Day 90).
4. **Dashboard Generation:** The user is presented with a personalized workspace including Daily Tasks, Video Hub, and Study Helper.
5. **Continuous Interaction:** User interacts with the AI Mentor Chat. The chat analyzes the user's text to infer mood (Neutral, Stressed, Motivated) and provides contextual responses.
6. **Adaptive Replanning:** As days progress, tasks update automatically. If the user uses the Panic Button or expresses high stress, the AI advises scaling back and focusing on mental recovery.

### Workflow / Flowchart Description
*(For diagram conversion)*
*   **Start** -> **Login/Register** -> **Is New User?**
    *   *Yes:* -> **Onboarding Questionnaire** -> **Profile Processing Engine** -> **Dashboard**
    *   *No:* -> **Dashboard**
*   **From Dashboard:**
    *   Path A: -> **Daily Tasks** -> Check off tasks -> Update Progress Database.
    *   Path B: -> **Mentor Chat** -> Send Query -> **Mood Inference Logic** -> LLM API -> Receive Adaptive Response.
    *   Path C: -> **Panic Button** -> Trigger Immediate Grounding Modal -> Select Recovery Action.
    *   Path D: -> **Video Hub / Campus Guide / Study Helper** -> Consume curated content.

*[Insert Flowchart Diagram Here]*

---

## 7. User Input / Registration Form Design
The onboarding process is deliberately structured to gather context without causing survey fatigue.
*   **Full Name & Contact:** Basic identification.
*   **Academic Branch / Major:** Used to tailor technical resources (e.g., Coding tutorials vs. Business resources) and map out the relevant 90-day journey.
*   **Hostel / Commuter Status:** Helps the system recommend localized campus resources and manage time-management expectations.
*   **Interests & Extracurriculars:** Allows the AI to draw personalized analogies and suggest relevant clubs.
*   **Current Module/Goal:** Identifies whether the student is focusing on exam prep, placement readiness, or general onboarding.

---

## 8. Core Logic / Evaluation Engine
The system utilizes a hybrid approach:
*   **Rule-Based Phasing:** A structured algorithm maps the user's current day (1-90) to a specific "Phase" (e.g., Phase 1: Foundation, Phase 2: Exploration). This ensures the user receives consistent, structured tasks regardless of AI variance.
*   **Mood Inference Engine:** A lightweight lexical analysis runs on chat inputs before they reach the LLM. It detects keywords related to stress ("anxious," "failing," "overwhelmed") or motivation ("pumped," "grinding"). 
*   **Context Injection:** The user's profile data, current day, phase, and inferred mood are bundled into a system prompt. The LLM (Groq API) evaluates this payload and generates a response that is highly tailored. For example, if a user is "stressed", the prompt forces the LLM to prioritize emotional support over strict academic nagging.

---

## 9. Feature Breakdown
### Core Features
| Feature | Description |
| :--- | :--- |
| **AI Mentor Chat** | Real-time conversational interface powered by an LLM, featuring mood detection and context-aware advice. |
| **Daily Tasks Tracking** | Gamified, day-by-day task lists that update based on the user's progression timeline. Tracks streaks and completion percentages. |
| **Panic Button** | An always-accessible emergency intervention tool offering immediate breathing exercises, perspective checks, and micro-actions for acute stress. |
| **Video Hub** | A categorized library of curated video resources (Campus Tours, Academics, Coding) tailored to the student's profile. |
| **Study Helper** | Structured study techniques (Pomodoro, Spaced Repetition) and subject-specific learning roadmaps. |
| **Campus Guide** | Interactive directory of campus buildings, facilities, and practical navigation tips. |

---

## 10. UI/UX Breakdown
The application employs a **Premium SaaS Aesthetic** (inspired by platforms like Vercel and Stripe).
*   **Visual Language:** Clean, minimalist, and highly legible. We actively removed distracting legacy "glassmorphism" in favor of crisp borders, semantic background/foreground contrasts, and subtle shadows.
*   **Typography:** Modern sans-serif fonts ensure readability during long study sessions.
*   **Color System:** A robust Tailwind-based semantic color palette supporting perfect Light/Dark mode transitions, reducing eye strain for late-night studying.
*   **User Journey:** The dashboard acts as a central hub with clear, non-overwhelming entry points to features. Gamification elements (streaks, percentages) encourage retention without inducing anxiety.

*[Insert UI/UX Dashboard Screenshot Here]*
*[Insert Panic Button Interface Screenshot Here]*

---

## 11. Technology Stack with Significance

| Technology | Role | Significance |
| :--- | :--- | :--- |
| **Next.js (React)** | Frontend Framework | Enables fast server-side rendering, seamless routing, and an optimized, app-like user experience. |
| **Tailwind CSS** | Styling | Allows for rapid, consistent styling using semantic tokens, ensuring perfect responsive design and dark mode. |
| **MongoDB** | Database | A flexible NoSQL database ideal for storing unstructured user progress, chat history, and dynamic profiles. |
| **NextAuth.js** | Authentication | Provides secure, scalable session management and OAuth (Google) integration. |
| **Groq API (Llama 3)** | AI Engine | Delivers lightning-fast LLM inference, crucial for maintaining natural, real-time conversational flow in the Mentor Chat. |
| **Lucide React** | Iconography | Lightweight, consistent vector icons that enhance the professional SaaS aesthetic. |

---

## 12. Uniqueness / Innovation
Most academic tools fall into two disjointed categories: rigid task managers (like Notion or Todoist) or generic conversational bots (like standard ChatGPT). 
This project is unique because it **fuses structured curriculum progression with emotional intelligence**. The inclusion of the **Panic Button** and the underlying **Mood Inference Engine** represents a paradigm shift from "relentless productivity" to "sustainable, stress-aware growth." The system knows *when* to push the student to study and *when* to advise them to take a walk.

---

## 13. Real-World Applications
*   **Freshman Onboarding:** Universities can deploy this to help incoming students navigate their first 90 days, reducing dropout rates and transition anxiety.
*   **Exam Season Support:** Acts as a 24/7 study companion when human counselors are unavailable or overwhelmed.
*   **Personal Productivity:** Helps individual students build consistent habits through gamified, realistic daily tracking.

---

## 14. Limitations
*   **API Dependency:** The conversational depth relies on third-party LLM APIs (Groq). If the API is down or rate-limited, the system falls back on generic, rule-based responses.
*   **Internet Requirement:** Core AI features cannot function entirely offline.
*   **Not a Medical Tool:** While it handles stress, it is a supportive academic tool, not a replacement for professional psychiatric or medical counseling.

---

## 15. Future Scope
*   **LMS Integration:** Connecting directly to university systems (Canvas, Blackboard) to auto-import assignments and deadlines.
*   **Predictive ML Burnout Modeling:** Analyzing chat patterns and task completion rates over time to predict burnout *before* it happens and preemptively suggest rest days.
*   **Mobile Application:** Porting the Next.js web application to React Native for native iOS/Android experiences with push notifications.
*   **Peer Matchmaking:** Connecting users with similar academic goals or stress profiles for mutual support.

---

## 16. Conclusion
The **Adaptive AI Study Mentor** successfully demonstrates how modern web technologies and Large Language Models can be harnessed to create a holistic educational tool. By treating the student not just as a data point meant to consume information, but as a human susceptible to stress and burnout, this platform provides a much-needed evolution in EdTech. It is structurally sound, visually premium, and highly practical—ready to make a tangible difference in a student's academic journey.
