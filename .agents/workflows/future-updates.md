---
description: How to implement and verify future updates for Taskion
---

# Development Workflow for Future Updates

Follow these steps to ensure consistent quality and security when updating the Taskion application.

## 1. System Architecture Review
Before making changes, familiarize yourself with the core stack:
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **State Management**: Zustand (with persistence in `useAppStore.ts`)
- **Backend/Auth**: Supabase (PostgreSQL + RLS)
- **AI**: Local LLM (Ollama/LM Studio compatible) via `localAi.ts` or Gemini API

## 2. Setting Up Local Environment
// turbo
1. Ensure your `.env.local` is encoded in **UTF-8 (no BOM)**.
2. Run `npm install` to update dependencies.
3. Start the dev server: `npm run dev`.

## 3. Implementing UI Changes
- Use the **Dark Mode First** principle. The default background is `#0A0A0B`.
- Use the `isDarkMode` flag from `useAppStore` to toggle styles.
- Ensure all interactive elements have hover states and match the premium aesthetic.

## 4. Feature Roadmap (Implemented vs. Planned)

### ✅ Implemented Features (MVP)
- **Task Management**: Create, edit, delete tasks; Priority levels (low, medium, high); Status (todo, in progress, done).
- **Time Tracking**: Manual time entry via "Log Time" modal.
- **Project Management**: Group tasks into projects; List view / Dashboard view.
- **Auth & Profiles**: Google Auth & Email login; Admin/Manager/User roles via `is_admin`; Profile editing (Name/Avatar).
- **AI Core**: Chat interface; Local/Gemini toggle; Basic task query answering.
- **UX**: Persistent Dark Mode; Responsive Sidebar; Interactive Modals.

### ⏳ Planned Core Enhancements (Active Backlog)
- [ ] **Advanced Task Control**: Subtasks and task dependencies; Assign tasks to specific users.
- [ ] **Smart Time Tracking**: Start/Stop live timer per task; Billable vs non-billable hours toggle; Exportable Timesheets.
- [ ] **Project Milestones**: Progress tracking (% complete calculation); Deadline management and countdowns; Kanban board view.
- [ ] **Collaboration**: Comments on tasks (@mentions); File attachments; Team shared workspaces.

### 🚀 Future Productivity & Analytics
- [ ] **Activity Intelligence**: Idle time detection; Performance analytics (Productivity scores).
- [ ] **Reporting Nexus**: Exportable PDF/CSV reports; Visual charts (Graphs/Heatmaps).
- [ ] **Goal Tracking**: Daily/Weekly milestone setting; Completion rate trends.
- [ ] **Automations**: Notification rules (Overdue alerts); Recurring task logic (Daily/Weekly auto-rollover).

### 🤖 Advanced AI Roadmap
- [ ] **Natural Language Interaction**: Detect "Create task" intent in chat to auto-populate forms.
- [ ] **Behavioral Intelligence**: Burnout pattern detection; Identifying productivity peaks.
- [ ] **Smart Suggestions**: Deadline recommendations based on historical data.

## 5. Verification Checklist
- [ ] **Linting**: Run `npm run lint` to check for JSX errors.
- [ ] **Theme Check**: Verify UI consistency in both Light and Dark modes.
- [ ] **Auth/RLS Check**: Confirm data is isolated via Supabase RLS policies.
- [ ] **Persistence**: Verify that API keys and Local Model URLs persist after refresh.

## 6. Deployment
After verifying locally, ensure any SQL changes are applied to the Supabase production environment before deploying the frontend build.
