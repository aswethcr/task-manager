# AI Usage Summary

## 1. AI Tools Used

- **Google Antigravity** (AI coding agent, Gemini model): generated the project scaffold, app code, Firestore rules and initial documentation.
- **Claude (Anthropic)**: used to write and refine the prompt for Antigravity, and to troubleshoot setup, Firebase configuration, deployment and documentation.

## 2. How I Used Them

1. Read the assessment and identified gaps in the requirements (data ownership, task fields, default status, validation, empty and error states, ordering).
2. Used Claude to turn those decisions into a compact prompt, since Antigravity tokens were limited.
3. Ran the prompt in Antigravity to scaffold a React + Vite app with Firebase Auth (Google) and Firestore.
4. Created the Firebase project, enabled Google sign-in, created Firestore and published the security rules myself.
5. Used Claude to debug the login error and to plan GitHub and Vercel deployment.
6. Reviewed and tested the app manually: sign in, create task, change status, refresh, sign out and sign in again.

## 3. Example Prompts

**Prompt given to Antigravity (shortened):**

```
Build a minimal Task Management web app. Keep scope small, do NOT add extra features.
Stack: React + Vite, Firebase Auth (Google Sign-In), Firestore.
Features: Google sign in/out, create task, view task list, update status
(Planned / In Progress / Complete).
Decisions: title required (max 100 chars, trimmed), default status Planned,
each user sees only their own tasks (Firestore rules on userId), newest first,
status dropdown with colored badges, loading/empty/error states,
prevent double submit, keys in .env with .env.example, firestore.rules file.
Also create README.md and AI_USAGE.md.
```

**Prompts used with Claude (examples):**

- "Provide me the prompt to paste in Antigravity, I have limited tokens."
- "The app shows 'Failed to sign in with Google Firebase. Please check your .env credentials.' Help me fix it."
- "Give me the steps to deploy on Vercel."

## 4. AI-Generated Code I Modified or Corrected Manually

Fill in or edit these with your own experience before submitting.

| Issue | What the AI produced | What I changed |
|---|---|---|
| App showed "Local Dev Mode" | The app fell back to a mock login when Firebase keys were missing | Created a Firebase project and added the real keys to `.env`, then restarted the dev server |
| "Failed to sign in with Google" error | The generic error message pointed at `.env` credentials, but the keys were correct | Found the real cause: the Google provider was not enabled in Firebase Authentication. Enabled it |
| `.env.example` contained real keys | Real project keys were written into the example file | Replaced them with placeholder values so no project config is exposed in the repo |
| Deployment configuration | `.env` is not pushed to GitHub, so the build had no keys on Vercel | Added the `VITE_FIREBASE_*` variables in Vercel during import |
| Google login failed on the live Vercel site | The same generic "check your .env credentials" error appeared even though the keys were correct | Added `task-manager-frxe.vercel.app` to Firebase Authentication, Settings, Authorized domains. Login then worked |
| _Add your own_ | | |

## 5. Reflection

AI tools sped up scaffolding and documentation, but I still had to verify configuration, test every flow, read the error messages carefully, and fix issues the generated code could not know about (cloud console settings, domains, environment variables).
