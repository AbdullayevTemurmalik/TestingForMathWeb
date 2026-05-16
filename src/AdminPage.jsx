import React, { useState, useRef, useEffect } from "react";
import { parsePDFQuestions } from "./pdfParser";
import { saveQuestionsToFirebase, getQuestionsFromFirebase } from "./firebase";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [firebaseInfo, setFirebaseInfo] = useState(null);
  const [error, setError] = useState("");
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const fileRef = useRef(null);

  // Firebase dagi mavjud savollarni yuklash
  useEffect(() => {
    if (!authed) return;
    setLoadingCurrent(true);
    getQuestionsFromFirebase().then((res) => {
      setLoadingCurrent(false);
      if (res.success && res.questions?.length > 0) {
        setFirebaseInfo({ count: res.count, updatedAt: res.updatedAt });
      }
    });
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) setAuthed(true);
    else setPassError("Parol noto'g'ri!");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Faqat PDF fayl!"); return; }
    setPdfFile(file);
    setError("");
    setParsing(true);
    const result = await parsePDFQuestions(file);
    setParsing(false);
    if (result.success && result.questions.length > 0) {
      setQuestions(result.questions);
    } else {
      setError(result.error || "Savollar topilmadi. Formatni tekshiring.");
      setQuestions(null);
    }
  };

  const handleSaveToFirebase = async () => {
    if (!questions) return;
    setSaving(true);
    const result = await saveQuestionsToFirebase(questions);
    setSaving(false);
    if (result.success) {
      setFirebaseInfo({ count: questions.length, updatedAt: new Date().toISOString() });
      alert(`✅ ${questions.length} ta savol muvaffaqiyatli saqlandi! Endi barcha o'quvchilar shu savollardan test ishlaydi.`);
    } else {
      setError("Firebase ga saqlashda xatolik: " + result.error);
    }
  };

  const handleClearFirebase = async () => {
    if (!window.confirm("Firebase dagi savollarni o'chirmoqchimisiz?")) return;
    setSaving(true);
    await saveQuestionsToFirebase([]);
    setSaving(false);
    setFirebaseInfo(null);
    setQuestions(null);
    setPdfFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Admin Panel</h1>
            <p className="text-white/50 text-sm">Kirish uchun parol kiriting</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={pass}
              onChange={(e) => { setPass(e.target.value); setPassError(""); }}
              placeholder="Parol"
              className={`w-full bg-white/10 border ${passError ? "border-red-400" : "border-white/20"} text-white placeholder-white/30 rounded-xl px-4 py-3.5 outline-none focus:border-orange-400 text-sm`}
            />
            {passError && <p className="text-red-400 text-xs">{passError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-all">
              🔓 Kirish
            </button>
            <button type="button" onClick={onBack} className="w-full text-white/40 hover:text-white/70 text-sm transition-colors py-2">
              ← Orqaga
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-xl">🔐</div>
            <div>
              <h1 className="text-white font-black text-xl">Admin Panel</h1>
              <p className="text-white/40 text-xs">MathTest • Firebase boshqaruvi</p>
            </div>
          </div>
          <button onClick={onBack} className="text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-xl text-sm transition-all">
            ← Chiqish
          </button>
        </div>

        {/* Firebase status */}
        <div className={`rounded-2xl border p-5 mb-5 ${firebaseInfo?.count > 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"}`}>
          {loadingCurrent ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-white/50 text-sm">Firebase tekshirilmoqda...</span>
            </div>
          ) : firebaseInfo?.count > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">Firebase da {firebaseInfo.count} ta savol bor</p>
                  <p className="text-emerald-300/50 text-xs">
                    Yangilangan: {new Date(firebaseInfo.updatedAt).toLocaleString("uz-UZ")}
                  </p>
                  <p className="text-emerald-300/60 text-xs mt-0.5">✅ Barcha o'quvchilar shu savollardan ishlaydi</p>
                </div>
              </div>
              <button onClick={handleClearFirebase} disabled={saving} className="text-red-400/60 hover:text-red-400 text-xs border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all">
                🗑️ O'chirish
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-white/60 font-medium text-sm">Firebase bo'sh — savollar yuklanmagan</p>
                <p className="text-white/30 text-xs">Hozir standart 30 ta savol ishlatilmoqda</p>
              </div>
            </div>
          )}
        </div>

        {/* PDF Upload */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-5">
          <h2 className="text-white font-bold mb-1">📄 PDF Yuklash</h2>
          <p className="text-white/40 text-xs mb-4">PDF fayldan savollar o'qiladi → Firebase ga saqlanadi → barcha o'quvchilarga tarqaladi</p>

          <label className="flex flex-col items-center gap-3 border-2 border-dashed border-white/20 hover:border-purple-400 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/5">
            <span className="text-4xl">📂</span>
            <span className="text-white/60 text-sm text-center">PDF faylni bu yerga tashlang yoki tanlang</span>
            <span className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-lg">FAYL TANLASH</span>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleUpload} className="hidden" />
          </label>

          {parsing && (
            <div className="flex items-center justify-center gap-3 mt-4 py-3 bg-white/5 rounded-xl">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-white/60 text-sm">PDF o'qilmoqda...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-xs mb-2">❌ {error}</p>
              <details className="text-white/40 text-[10px] cursor-pointer">
                <summary className="hover:text-white/60">To'g'ri PDF formati qanday?</summary>
                <pre className="mt-2 bg-white/5 rounded-lg p-3 leading-5 overflow-auto">{`1. Savol matni?
A) Variant 1
B) Variant 2
C) Variant 3
D) Variant 4
Javob: A

2. Keyingi savol?
A) ...`}</pre>
              </details>
            </div>
          )}

          {questions && !parsing && (
            <div className="mt-4 space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-xs font-semibold">✅ {pdfFile?.name}</p>
                <p className="text-emerald-300/60 text-[10px]">{questions.length} ta savol o'qildi — Firebase ga saqlashga tayyor</p>
              </div>

              <button onClick={handleSaveToFirebase} disabled={saving}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${saving ? "bg-white/10 text-white/40" : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/30"}`}>
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Firebase ga saqlanmoqda...
                  </span>
                ) : "🔥 Firebase ga saqlash va tarqatish"}
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        {questions && questions.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <h2 className="text-white font-bold mb-4">📝 Ko'rib chiqish ({questions.length} ta)</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {questions.slice(0, 15).map((q, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-white/80 text-xs font-medium mb-2">{i + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {q.options.map((opt, j) => (
                      <span key={j} className={`text-[10px] px-2 py-1 rounded-lg ${opt === q.answer ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40"}`}>
                        {["A", "B", "C", "D"][j]}) {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length > 15 && (
                <p className="text-white/30 text-xs text-center py-2">...va yana {questions.length - 15} ta savol</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
