
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, where, updateDoc, getDocs } from "firebase/firestore";

// --- CONFIGURATION ---
// Safely retrieve environment variables to prevent crashes
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || fallback;
    }
  } catch (e) {}
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyBRDssooB7qu15fiMekx7oUn6UvmhZvFWk"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "finha-16144.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "finha-16144"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "finha-16144.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "132401422141"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:132401422141:web:f1ab826b1cbcc6ca292f54")
};

let db: any = null;
let isFirebaseInitialized = false;

// Attempt Init
try {
  // Check if config is provided (not default placeholder)
  const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                       !firebaseConfig.apiKey.includes("YOUR_API_KEY");

  if (isConfigured) {
      console.log("Initializing Firebase with project:", firebaseConfig.projectId);
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      isFirebaseInitialized = true;
  } else {
      console.log("Using LocalStorage Fallback (No Firebase Config detected)");
      console.log("To enable DB, set VITE_FIREBASE_API_KEY in .env");
  }
} catch (error) {
  console.warn("Firebase Init Failed. Using LocalStorage Fallback.", error);
}

// --- LOCAL STORAGE HELPERS ---
const MOCK_DB_KEY = 'optima_local_db';
const getLocalDb = () => {
    try {
        return JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '{"users":{}, "reports":{}}');
    } catch { return {users:{}, reports:{}}; }
};
const saveLocalDb = (data: any) => localStorage.setItem(MOCK_DB_KEY, JSON.stringify(data));

// --- EXPORTED FUNCTIONS ---

export const saveUser = async (user: any) => {
  if (isFirebaseInitialized) {
      try {
        await setDoc(doc(db, "users", user.id), user);
        return;
      } catch (e) { 
        console.error("Firebase Save Failed", e);
        // Do not fall back to local storage if Firebase was intended but failed (prevents split brain data)
        throw e; 
      }
  }
  // Fallback
  const dbLocal = getLocalDb();
  dbLocal.users[user.id] = user;
  saveLocalDb(dbLocal);
};

export const getUser = async (id: string) => {
    if (isFirebaseInitialized) {
        try {
            const snap = await getDoc(doc(db, "users", id));
            if (snap.exists()) return snap.data();
            return null;
        } catch (e) { 
            console.error("Firebase Get Failed", e);
            throw e;
        }
    }
    // Fallback
    const dbLocal = getLocalDb();
    return dbLocal.users[id] || null;
};

export const getUserByEmail = async (email: string) => {
    if (isFirebaseInitialized) {
        try {
            const q = query(collection(db, "users"), where("email", "==", email));
            const snap = await getDocs(q);
            if (!snap.empty) return snap.docs[0].data();
            return null;
        } catch (e) {
            console.error("Firebase Get By Email Failed", e);
            throw e;
        }
    }
    // Fallback
    const dbLocal = getLocalDb();
    const users = Object.values(dbLocal.users) as any[];
    return users.find(u => u.email === email) || null;
};

// NEW: Admin Verification
export const verifyAdmin = async (email: string, pass: string) => {
    // Simulate DB delay
    await new Promise(r => setTimeout(r, 800));

    // 1. Hardcoded Secure Fallback for Demo (Always works)
    if (email === 'admin@healthiqure.in' && pass === 'admin123') {
        return { name: 'Dr. S. Gupta', role: 'admin' };
    }

    // 2. Firebase Check (Optional: You can create an 'admins' collection)
    if (isFirebaseInitialized) {
        try {
            const q = query(collection(db, "admins"), where("email", "==", email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const data = snap.docs[0].data();
                if (data.password === pass) return data; // Note: In prod, verify hash
            }
        } catch (e) { console.error(e); }
    }

    return null;
};

export const subscribeToUser = (id: string, callback: (data: any) => void) => {
  if (isFirebaseInitialized) {
      return onSnapshot(doc(db, "users", id), (doc) => {
        callback(doc.data());
      }, (error) => {
          console.error("Firebase Subscription Error", error);
      });
  }
  
  // Local Polling Fallback
  const interval = setInterval(() => {
      const dbLocal = getLocalDb();
      if (dbLocal.users[id]) callback(dbLocal.users[id]);
  }, 1000);
  
  // Initial call
  const dbLocal = getLocalDb();
  if (dbLocal.users[id]) callback(dbLocal.users[id]);
  
  return () => clearInterval(interval);
};

export const submitReport = async (report: any) => {
    if (isFirebaseInitialized) {
        try {
            await setDoc(doc(db, "reports", report.id), report);
            return;
        } catch (e) { 
            console.error("Firebase Submit Failed", e);
            throw e;
        }
    }
    const dbLocal = getLocalDb();
    dbLocal.reports[report.id] = report;
    saveLocalDb(dbLocal);
    await new Promise(r => setTimeout(r, 500)); 
};

export const subscribeToPendingReports = (callback: (data: any[]) => void) => {
    if (isFirebaseInitialized) {
        const q = query(collection(db, "reports"), where("status", "==", "ADMIN_PENDING"));
        return onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(d => d.data());
            callback(reports);
        }, (error) => {
            console.error("Firebase Pending Reports Subscription Error", error);
        });
    }

    // Local Polling
    const check = () => {
        const dbLocal = getLocalDb();
        const reports = Object.values(dbLocal.reports).filter((r: any) => r.status === 'ADMIN_PENDING');
        callback(reports);
    };
    
    const interval = setInterval(check, 1000);
    check();
    return () => clearInterval(interval);
};

export const approveReportInDb = async (reportId: string) => {
    if (isFirebaseInitialized) {
        try {
            await updateDoc(doc(db, "reports", reportId), { status: "APPROVED" });
            return;
        } catch (e) { 
            console.error("Firebase Update Failed", e);
            throw e;
        }
    }
    const dbLocal = getLocalDb();
    if (dbLocal.reports[reportId]) {
        dbLocal.reports[reportId].status = "APPROVED";
        saveLocalDb(dbLocal);
    }
};

export { db };
