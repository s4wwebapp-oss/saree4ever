To run the development environment end-to-end, I will start both the backend API and the frontend application in separate terminal sessions.

### **1. Start Backend Server**

* **Directory:** `backend/`

* **Command:** `npm run dev`

* **Action:** This will start the Express server using `nodemon` on port **5001**.

* **Purpose:** Handles API requests, database connections (Supabase/Prisma), and authentication.

### **2. Start Frontend Server**

* **Directory:** `frontend/`

* **Command:** `npm run dev`

* **Action:** This will start the Next.js development server on port **3000**.

* **Purpose:** Serves the user interface.

### **3. Preview**

* Once both servers are running, I will generate a preview URL for the frontend so you can interact with the application.

