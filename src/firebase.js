import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDu4Fi3Htv-MXiok367EIHet_W40Wnq60k",
  authDomain: "mathtestbaza.firebaseapp.com",
  projectId: "mathtestbaza",
  storageBucket: "mathtestbaza.firebasestorage.app",
  messagingSenderId: "232560532530",
  appId: "1:232560532530:web:87bcdab16716e92012f02b",
  measurementId: "G-TM3FWD0ZL9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Admin savollarni Firebase ga saqlash
export async function saveQuestionsToFirebase(questions) {
  try {
    await setDoc(doc(db, "mathtest", "questions"), {
      items: questions,
      updatedAt: new Date().toISOString(),
      count: questions.length
    });
    return { success: true };
  } catch (err) {
    console.error("Firebase save error:", err);
    return { success: false, error: err.message };
  }
}

// Firebase dan savollarni olish
export async function getQuestionsFromFirebase() {
  try {
    const snap = await getDoc(doc(db, "mathtest", "questions"));
    if (snap.exists()) {
      const data = snap.data();
      return { success: true, questions: data.items, count: data.count, updatedAt: data.updatedAt };
    }
    return { success: false, questions: [] };
  } catch (err) {
    console.error("Firebase get error:", err);
    return { success: false, questions: [] };
  }
}
