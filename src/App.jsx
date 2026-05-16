import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomQuestions } from "./questions";
import { sendResultToTelegram, sendLoginToTelegram } from "./telegram";
import { getRandomFromPool } from "./pdfParser";
import { getQuestionsFromFirebase } from "./firebase";
import AdminPage from "./AdminPage";

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin, onAdmin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [shaking, setShaking] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("998")) val = val.slice(3);
    if (val.length > 9) val = val.slice(0, 9);
    setPhone(val);
  };

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim() || firstName.trim().length < 2) newErrors.firstName = "Ismingizni kiriting (kamida 2 harf)";
    if (!lastName.trim() || lastName.trim().length < 2) newErrors.lastName = "Familiyangizni kiriting (kamida 2 harf)";
    if (phone.length < 9) newErrors.phone = "To'liq telefon raqamini kiriting";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    onLogin({ firstName: firstName.trim(), lastName: lastName.trim(), phone: `+998${phone}` });
  };

  const adminQuestionsCount = (() => {
    try { const q = localStorage.getItem("admin_questions"); return q ? JSON.parse(q).length : 0; } catch { return 0; }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className={`relative z-10 w-full max-w-md ${shaking ? "animate-shake" : ""}`}>
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
              <span className="text-4xl">🧮</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">MathTest</h1>
            <p className="text-white/60 text-sm">30 ta savol • 90 daqiqa • Matematika imtihoni</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2"><span className="mr-2">👤</span>Ism</label>
              <input id="firstName" type="text" value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ""})); }}
                placeholder="Masalan: Jasur"
                className={`w-full bg-white/10 border ${errors.firstName ? "border-red-400" : "border-white/20"} text-white placeholder-white/30 rounded-xl px-4 py-3.5 outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200 text-sm`}
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2"><span className="mr-2">👤</span>Familiya</label>
              <input id="lastName" type="text" value={lastName}
                onChange={(e) => { setLastName(e.target.value); setErrors(p => ({...p, lastName: ""})); }}
                placeholder="Masalan: Xasanov"
                className={`w-full bg-white/10 border ${errors.lastName ? "border-red-400" : "border-white/20"} text-white placeholder-white/30 rounded-xl px-4 py-3.5 outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200 text-sm`}
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2"><span className="mr-2">📱</span>Telefon raqam</label>
              <div className={`flex items-center bg-white/10 border ${errors.phone ? "border-red-400" : "border-white/20"} rounded-xl overflow-hidden focus-within:border-purple-400 focus-within:bg-white/15 transition-all duration-200`}>
                <span className="px-4 py-3.5 text-purple-300 font-bold text-sm border-r border-white/20 bg-white/5 whitespace-nowrap">🇺🇿 +998</span>
                <input id="phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="90 123 45 67"
                  className="flex-1 bg-transparent text-white placeholder-white/30 px-4 py-3.5 outline-none text-sm"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.phone}</p>}
            </div>
            <button id="loginBtn" type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] text-base mt-2">
              🚀 Imtihonni boshlash
            </button>
          </form>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: "📝", label: adminQuestionsCount > 0 ? `${Math.min(30, adminQuestionsCount)} savol` : "30 savol" },
              { icon: "⏱️", label: "90 daqiqa" },
              { icon: adminQuestionsCount > 0 ? "📄" : "🎯", label: adminQuestionsCount > 0 ? "PDF test" : "Random" },
            ].map((item) => (
              <div key={item.label} className="text-center bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-lg sm:text-xl mb-1">{item.icon}</div>
                <div className="text-white/60 text-[10px] sm:text-xs leading-tight">{item.label}</div>
              </div>
            ))}
          </div>

          <button onClick={onAdmin} className="mt-4 w-full text-white/20 hover:text-white/50 text-xs transition-colors py-2 text-center">
            🔐 Admin panel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== QUIZ PAGE ====================
const TOTAL_QUESTIONS = 30;
const TIME_PER_QUESTION = 3 * 60; // 3 daqiqa (soniyalarda)
const TOTAL_TIME = 90 * 60; // 90 daqiqa

function QuizPage({ user, onFinish }) {
  const [loading, setLoading] = useState(!localStorage.getItem("mathweb_questions"));
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem("mathweb_questions");
    if (saved) return JSON.parse(saved);
    return null;
  });

  // Firebase dan savollarni yuklash (faqat birinchi kirganida)
  useEffect(() => {
    if (questions) return; // allaqachon bor
    getQuestionsFromFirebase().then((res) => {
      if (res.success && res.questions?.length > 0) {
        const selected = getRandomFromPool(res.questions, TOTAL_QUESTIONS);
        setQuestions(selected);
      } else {
        // Firebase bo'sh - standart savollar
        setQuestions(getRandomQuestions(TOTAL_QUESTIONS));
      }
      setLoading(false);
    }).catch(() => {
      setQuestions(getRandomQuestions(TOTAL_QUESTIONS));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Savollar yuklanmoqda...</p>
          <p className="text-white/40 text-sm">Firebase dan o'qilmoqda</p>
        </div>
      </div>
    );
  }

  const [currentIdx, setCurrentIdx] = useState(() => parseInt(localStorage.getItem("mathweb_currentIdx") || "0", 10));
  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem("mathweb_answers") || "{}"));
  const [selectedOption, setSelectedOption] = useState(() => JSON.parse(localStorage.getItem("mathweb_selectedOption") || "null"));
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => parseInt(localStorage.getItem("mathweb_questionTimeLeft") || String(TIME_PER_QUESTION), 10));
  const [totalTimeLeft, setTotalTimeLeft] = useState(() => parseInt(localStorage.getItem("mathweb_totalTimeLeft") || String(TOTAL_TIME), 10));
  const [isAnswered, setIsAnswered] = useState(() => localStorage.getItem("mathweb_isAnswered") === "true");
  const [startTime] = useState(() => parseInt(localStorage.getItem("mathweb_startTime") || String(Date.now()), 10));
  const [warningFlash, setWarningFlash] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Save state
  useEffect(() => {
    localStorage.setItem("mathweb_questions", JSON.stringify(questions));
    localStorage.setItem("mathweb_currentIdx", currentIdx.toString());
    localStorage.setItem("mathweb_answers", JSON.stringify(answers));
    localStorage.setItem("mathweb_selectedOption", JSON.stringify(selectedOption));
    localStorage.setItem("mathweb_questionTimeLeft", questionTimeLeft.toString());
    localStorage.setItem("mathweb_totalTimeLeft", totalTimeLeft.toString());
    localStorage.setItem("mathweb_isAnswered", isAnswered.toString());
    localStorage.setItem("mathweb_startTime", startTime.toString());
  }, [questions, currentIdx, answers, selectedOption, questionTimeLeft, totalTimeLeft, isAnswered, startTime]);

  // Anti-cheat: tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Anti-cheat: right click, copy/paste, keyboard shortcuts
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        (e.ctrlKey && ["c","v","a","u","s","p"].includes(e.key.toLowerCase())) ||
        e.key === "F12" || e.key === "F5" ||
        (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // Total timer
  useEffect(() => {
    if (totalTimeLeft <= 0) {
      handleFinish(true);
      return;
    }
    const t = setInterval(() => setTotalTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [totalTimeLeft]);

  // Per-question timer setup when moving to next question
  useEffect(() => {
    // Only reset if we just moved to a new question and it hasn't been answered yet
    // If it's a reload, we don't want to reset it.
    // The trick is we only reset when currentIdx changes and it's a "fresh" state
    // But since currentIdx is in dependency array, we need to be careful.
    // A simple check: if we just loaded from localStorage, we don't want to reset.
    // Actually, we can rely on handleSelect and goNext to reset these states manually!
  }, [currentIdx]);

  useEffect(() => {
    if (questionTimeLeft <= 0) {
      if (answers[currentIdx] === undefined) {
        setAnswers((p) => ({ ...p, [currentIdx]: selectedOption || null }));
      }
      goNext();
      return;
    }
    if (questionTimeLeft <= 30) setWarningFlash(true);
    else setWarningFlash(false);
    const t = setInterval(() => setQuestionTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [questionTimeLeft, currentIdx, answers, selectedOption]);

  const handleFinish = useCallback((timeOut = false) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const durationStr = `${mins} daqiqa ${secs} soniya`;

    let correct = 0;
    let wrong = 0;
    const finalAnswers = timeOut ? answers : answers;

    questions.forEach((q, idx) => {
      const given = finalAnswers[idx];
      if (given === null || given === undefined) {
        wrong++;
      } else if (given === q.answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    onFinish({ correct, wrong, total: TOTAL_QUESTIONS, duration: durationStr, answers: finalAnswers });
  }, [answers, questions, startTime, onFinish]);

  const goNext = useCallback(() => {
    if (currentIdx < TOTAL_QUESTIONS - 1) {
      setCurrentIdx((p) => p + 1);
      setQuestionTimeLeft(TIME_PER_QUESTION);
      setSelectedOption(null);
    } else {
      handleFinish(false);
    }
  }, [currentIdx, handleFinish]);

  const handleSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    setAnswers((p) => ({ ...p, [currentIdx]: selectedOption }));
    goNext();
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    let correct = 0, wrong = 0;
    questions.forEach((q, idx) => {
      const given = answers[idx];
      if (!given || given === null) wrong++;
      else if (given === q.answer) correct++;
      else wrong++;
    });
    const BOT_TOKEN = "8522851670:AAHH9UfKSTFf5H8BaMCniBo3jCaDZ_U6rsU";
    const CHAT_IDS = ["5387795208", "1158150944"];
    const text = `🚪 <b>TEST DAN CHIQDI</b>\n\n👤 <b>Ism:</b> ${user.firstName}\n👤 <b>Familiya:</b> ${user.lastName}\n📱 <b>Telefon:</b> ${user.phone}\n\n📊 Ishlangan: ${currentIdx + 1}/${TOTAL_QUESTIONS} savol\n✅ To'g'ri: ${correct} ta\n❌ Noto'g'ri: ${wrong} ta\n⏱️ Vaqt: ${mins} daqiqa ${secs} soniya\n\n⚠️ <b>Test yakunlanmay chiqib ketdi!</b>`.trim();
    CHAT_IDS.forEach(chatId => fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }) }));
    localStorage.clear();
    window.location.reload();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const q = questions[currentIdx];
  const questionProgress = ((TIME_PER_QUESTION - questionTimeLeft) / TIME_PER_QUESTION) * 100;
  const totalProgress = ((currentIdx) / TOTAL_QUESTIONS) * 100;

  const getOptionStyle = (option) => {
    if (option === selectedOption) return "bg-purple-500/30 border-purple-400 scale-[1.01]";
    return "bg-white/10 border-white/20 hover:bg-white/20 hover:border-purple-400 hover:scale-[1.01] cursor-pointer";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none">
      {/* Exit confirm modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🚪</div>
              <h2 className="text-white font-black text-xl mb-1">Testdan chiqasizmi?</h2>
              <p className="text-white/50 text-sm">Siz hali {TOTAL_QUESTIONS - currentIdx - 1} ta savolni ishlashingiz qolgan. Chiqsangiz natijalar Telegramga yuboriladi.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExitModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">
                Davom etish
              </button>
              <button onClick={confirmExit} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl transition-all">
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab warning overlay */}
      {tabWarning && (
        <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-black mb-2">OGOHLANTIRISH!</h2>
            <p className="text-xl">Boshqa tabga o'tish taqiqlangan!</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2 sm:gap-0">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-white/60 text-xs sm:text-sm font-medium line-clamp-1">
                👤 {user.firstName} {user.lastName}
              </span>
              <button onClick={handleExit} className="sm:hidden text-red-400/70 hover:text-red-400 text-xs border border-red-500/20 hover:border-red-500/50 px-2 py-1 rounded-lg transition-all">
                Chiqish
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
              {/* Exit button (desktop) */}
              <button onClick={handleExit} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/60 text-xs transition-all">
                🚪 Chiqish
              </button>
              {/* Question timer */}
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border ${questionTimeLeft <= 30 ? "bg-red-500/20 border-red-400 text-red-300 animate-pulse" : "bg-white/10 border-white/20 text-white"}`}>
                <span className="text-[10px] sm:text-xs hidden sm:inline">⏱️ Savol:</span>
                <span className="text-[10px] sm:text-xs sm:hidden">⏱️</span>
                <span className="font-bold tabular-nums text-xs sm:text-sm">{formatTime(questionTimeLeft)}</span>
              </div>
              {/* Total timer */}
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border ${totalTimeLeft <= 300 ? "bg-red-500/20 border-red-400 text-red-300" : "bg-purple-500/20 border-purple-400/50 text-purple-300"}`}>
                <span className="text-[10px] sm:text-xs hidden sm:inline">⏰ Jami:</span>
                <span className="text-[10px] sm:text-xs sm:hidden">⏰</span>
                <span className="font-bold tabular-nums text-xs sm:text-sm">{formatTime(totalTimeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Total progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs whitespace-nowrap">
              {currentIdx + 1}/{TOTAL_QUESTIONS}
            </span>
            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Question timer bar */}
        <div className="mb-4 sm:mb-6">
          <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${questionTimeLeft <= 30 ? "bg-red-500" : questionTimeLeft <= 60 ? "bg-yellow-500" : "bg-gradient-to-r from-purple-500 to-cyan-500"}`}
              style={{ width: `${100 - questionProgress}%` }}
            />
          </div>
          <div className="text-right text-[10px] sm:text-xs text-white/40 mt-1">Savol uchun vaqt: {formatTime(questionTimeLeft)}</div>
        </div>

        {/* Question card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 p-5 sm:p-8 mb-5 sm:mb-6 shadow-2xl">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm mt-1 sm:mt-0">
              {currentIdx + 1}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">{q.question}</h2>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              id={`option-${idx}`}
              onClick={() => handleSelect(option)}
              className={`relative text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border text-white font-medium text-sm sm:text-base transition-all duration-200 ${getOptionStyle(option)}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border ${option === selectedOption ? "bg-purple-500 border-purple-400 text-white" : "bg-white/10 border-white/20 text-white/70"}`}>
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setSelectedOption(null);
              setAnswers((p) => ({ ...p, [currentIdx]: null }));
              goNext();
            }}
            className="w-full sm:w-auto text-white/50 hover:text-white/90 text-xs sm:text-sm transition-colors border border-white/10 hover:border-white/30 px-4 sm:px-5 py-3 rounded-lg sm:rounded-xl bg-white/5"
          >
            ⏭ O'tkazib yuborish
          </button>
          
          <button
            onClick={handleNextClick}
            disabled={!selectedOption}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${selectedOption ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] text-white" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
          >
            {currentIdx < TOTAL_QUESTIONS - 1 ? "Keyingi savol ➡" : "Testni yakunlash 🏁"}
          </button>
        </div>

        {/* Mini progress dots */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                idx === currentIdx
                  ? "bg-purple-400 scale-125"
                  : answers[idx] !== undefined
                  ? "bg-white/80"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== RESULT PAGE ====================
function ResultPage({ user, result, onRetry }) {
  const { correct, wrong, total, duration } = result;
  const percentage = Math.round((correct / total) * 100);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(true);

  useEffect(() => {
    sendResultToTelegram({ ...user, ...result })
      .then(() => { setSent(true); setSending(false); })
      .catch(() => { setSending(false); });
  }, []);

  const grade =
    percentage >= 90 ? { label: "A'LO", color: "from-yellow-400 to-orange-400", emoji: "🏆" } :
    percentage >= 70 ? { label: "YAXSHI", color: "from-emerald-400 to-cyan-400", emoji: "🥇" } :
    percentage >= 50 ? { label: "QONIQARLI", color: "from-blue-400 to-purple-400", emoji: "🥈" } :
    { label: "YOMON", color: "from-red-400 to-pink-400", emoji: "📚" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
          {/* Grade badge */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${grade.color} rounded-2xl sm:rounded-3xl shadow-2xl mb-3 sm:mb-4 text-4xl sm:text-5xl`}>
              {grade.emoji}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{grade.label}</h1>
            <p className="text-white/60 text-xs sm:text-sm">Imtihon yakunlandi</p>
          </div>

          {/* User info */}
          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 border border-white/10">
            <p className="text-white font-semibold text-center text-base sm:text-lg">{user.firstName} {user.lastName}</p>
            <p className="text-white/50 text-center text-xs sm:text-sm">{user.phone}</p>
          </div>

          {/* Score circle */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br ${grade.color} flex items-center justify-center shadow-2xl`}>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white">{percentage}%</div>
                <div className="text-white/80 text-xs sm:text-sm">{correct}/{total}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-5 text-center">
              <div className="text-4xl font-black text-emerald-400 mb-1">{correct}</div>
              <div className="text-emerald-300/70 text-sm font-medium">✅ To'g'ri</div>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-5 text-center">
              <div className="text-4xl font-black text-red-400 mb-1">{wrong}</div>
              <div className="text-red-300/70 text-sm font-medium">❌ Noto'g'ri</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <span className="text-white/60 text-sm">⏱️ Sarflangan vaqt</span>
              <span className="text-white font-semibold text-sm">{duration}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <span className="text-white/60 text-sm">📊 Jami savollar</span>
              <span className="text-white font-semibold text-sm">{total} ta</span>
            </div>
          </div>

          {/* Telegram status */}
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border mb-6 ${sent ? "bg-emerald-500/10 border-emerald-500/30" : sending ? "bg-white/5 border-white/10" : "bg-red-500/10 border-red-500/30"}`}>
            <span className="text-xl">{sent ? "✅" : sending ? "⏳" : "❌"}</span>
            <span className={`text-sm font-medium ${sent ? "text-emerald-400" : sending ? "text-white/60" : "text-red-400"}`}>
              {sent ? "Natija Telegramga yuborildi!" : sending ? "Natija yuborilmoqda..." : "Yuborishda xatolik yuz berdi"}
            </span>
          </div>

          {/* Retry */}
          <button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            🔄 Qayta urinish
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem("mathweb_page") || "login");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("mathweb_user") || "null"));
  const [result, setResult] = useState(() => JSON.parse(localStorage.getItem("mathweb_result") || "null"));

  useEffect(() => {
    localStorage.setItem("mathweb_page", page);
    if (user) localStorage.setItem("mathweb_user", JSON.stringify(user));
    if (result) localStorage.setItem("mathweb_result", JSON.stringify(result));
  }, [page, user, result]);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("quiz");
    sendLoginToTelegram(userData);
  };

  const handleFinish = (resultData) => {
    setResult(resultData);
    setPage("result");
  };

  const handleRetry = () => {
    localStorage.clear();
    setPage("login");
    setUser(null);
    setResult(null);
  };

  if (page === "admin") return <AdminPage onBack={() => setPage("login")} />;
  if (page === "login") return <LoginPage onLogin={handleLogin} onAdmin={() => setPage("admin")} />;
  if (page === "quiz") return <QuizPage user={user} onFinish={handleFinish} />;
  if (page === "result") return <ResultPage user={user} result={result} onRetry={handleRetry} />;
}
