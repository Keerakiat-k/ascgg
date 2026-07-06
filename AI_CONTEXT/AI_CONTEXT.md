# AI Context for ASCG_G Project

This document provides context for AI assistants (ChatGPT, Gemini, Claude) to understand the ASCG_G project architecture, tech stack, and conventions, enabling seamless continuation of work.

## 1. Project Overview
ASCG_G is an internal corporate web application primarily functioning as an HR Information System (HRIS) and an IT Helpdesk (Ticketing System). It supports multi-company structures via company prefixes.

## 2. Tech Stack
- **Frontend**: React 19, Vite, React Router 7, TailwindCSS 4.
- **Backend**: Node.js, Express 5.
- **Database**: MySQL (using `mysql2` driver in Node).
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.

## 3. Directory Structure
```text
ascg_g/
├── backend/
│   ├── config/       # DB connections (e.g., db.js)
│   ├── controllers/  # Business logic (e.g., employeeController.js)
│   ├── middlewares/  # Express middlewares (e.g., authMiddleware.js)
│   ├── routes/       # Express routes linking to controllers
│   ├── server.js     # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level components (Views)
│   │   ├── App.jsx     # Main React Router setup
│   │   └── main.jsx    # React DOM entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── ascg_g_db.sql     # Database schema and initial seed data
```

## 4. Coding Conventions
- **Backend Controllers**: Uses CommonJS (`require`/`module.exports`). Controller functions are typically exported directly using `exports.functionName = async (req, res) => {...}`.
- **Backend Database Responses**: Uses `mysql2` with Promises. Queries usually look like `const [rows] = await pool.query(...)`.
- **Frontend UI**: Built with TailwindCSS utility classes. Icons from `lucide-react`. Modals/Alerts generally use `sweetalert2`.
- **Frontend API Calls**: Made directly from React components (likely using `fetch` or `axios`, though not explicitly seen, check individual files).

## 5. Code Quality Analysis & Recommendations

Upon analyzing the repository, here are insights and suggestions for architectural improvements:

### Positives (What's Good)
1. **Clean Separation of Concerns**: The backend cleanly separates Routes and Controllers. The frontend separates Pages and Components.
2. **Database Transactions**: The `createEmployee` function uses database transactions (`connection.beginTransaction()`, `commit()`, `rollback()`) correctly to handle multiple inserts across related tables, ensuring data integrity.
3. **Stateless Auth**: Proper use of JWT and Bcrypt for authentication.

### Areas for Improvement (Technical Debt & Refactoring)
1. **Code Duplication in Controllers**: 
   - *Issue*: In `backend/controllers/employeeController.js`, the `updateEmployee` function is declared twice. The second declaration overwrites the first.
   - *Fix*: Remove the duplicate declaration and consolidate the logic.
2. **Error Handling Mechanism**:
   - *Issue*: Currently, errors are caught in `try-catch` blocks in every controller, logged via `console.error`, and a generic 500 JSON is returned.
   - *Fix*: Implement a centralized error-handling middleware (`app.use((err, req, res, next) => {...})`) in `server.js` and use an async wrapper or `express-async-errors` to avoid repeating try-catch blocks everywhere.
3. **Input Validation**:
   - *Issue*: Input validation (e.g., checking if email is valid, required fields are present) is done manually in controllers or not at all.
   - *Fix*: Integrate a validation library like `Zod` or `Joi` and create a validation middleware to validate `req.body` before it reaches the controller.
4. **Environment Variables**:
   - Ensure a `.env.example` file is provided, as `.env` is (correctly) git-ignored.
5. **Frontend State Management**:
   - Depending on complexity, if data like "Current User Profile" needs to be accessed deeply within the component tree, consider using React Context or a lightweight state manager (Zustand) to avoid prop drilling.
