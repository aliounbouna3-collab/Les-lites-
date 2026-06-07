import { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://itraeulzkoidnygomxem.supabase.co";
const SUPABASE_KEY = "sb_publishable_Bp2DpaPi2r4pFMDnOisGrQ_Yud5vPn_";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cmFldWx6a29pZG55Z29teGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc1MjkzMywiZXhwIjoyMDk2MzI4OTMzfQ.wNArugAic48xasnrxGT3m44emt3vsxhiH22nEvz68Pg";
const REST = `${SUPABASE_URL}/rest/v1`;

const headers = () => ({
  "Content-Type": "application/json",
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
});

// ─── Supabase helpers ─────────────────────────────────────────────────────────
const sb = {
  // Phone-based auth — query users table directly
  async loginByPhone(phone, password) {
    const r = await fetch(
      `${REST}/users?phone=eq.${encodeURIComponent(phone)}&password_hash=eq.${encodeURIComponent(password)}&select=*`,
      { headers: headers() }
    );
    const d = await r.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  },
  async phoneExists(phone) {
    const r = await fetch(`${REST}/users?phone=eq.${encodeURIComponent(phone)}&select=id`, { headers: headers() });
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
  },

  // Users
  async getUser(id) {
    const r = await fetch(`${REST}/users?id=eq.${id}&select=*`, { headers: headers() });
    const d = await r.json();
    return d[0];
  },
  async createUser(data) {
    const r = await fetch(`${REST}/users`, {
      method: "POST", headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async updateUser(id, data) {
    const r = await fetch(`${REST}/users?id=eq.${id}`, {
      method: "PATCH", headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  // Subjects
  async getSubjects(bacType) {
    const r = await fetch(
      `${REST}/subjects?is_published=eq.true&bac_types=cs.{"${bacType}"}&order=order_index`,
      { headers: headers() }
    );
    return r.json();
  },

  // Chapters
  async getChapters(subjectId) {
    const r = await fetch(
      `${REST}/chapters?subject_id=eq.${subjectId}&order=order_index`,
      { headers: headers() }
    );
    return r.json();
  },

  // Progress
  async getProgress(userId) {
    const r = await fetch(`${REST}/progress?user_id=eq.${userId}&select=*`, { headers: headers() });
    return r.json();
  },
  async upsertProgress(data) {
    const r = await fetch(`${REST}/progress`, {
      method: "POST",
      headers: { ...headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  // Exams
  async getExams(subjectId) {
    const r = await fetch(
      `${REST}/exams?subject_id=eq.${subjectId}&is_published=eq.true&order=order_index`,
      { headers: headers() }
    );
    return r.json();
  },
  async getQuestions(examId) {
    const r = await fetch(
      `${REST}/questions?exam_id=eq.${examId}&order=order_index`,
      { headers: headers() }
    );
    return r.json();
  },
  async createSession(data) {
    const r = await fetch(`${REST}/exam_sessions`, {
      method: "POST", headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    return d[0];
  },
  async updateSession(id, data) {
    const r = await fetch(`${REST}/exam_sessions?id=eq.${id}`, {
      method: "PATCH", headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async saveAnswer(data) {
    await fetch(`${REST}/exam_answers`, {
      method: "POST", headers: headers(),
      body: JSON.stringify(data),
    });
  },

  // AI messages
  async getAiMessages(userId, chapterId) {
    const r = await fetch(
      `${REST}/ai_messages?user_id=eq.${userId}&chapter_id=eq.${chapterId}&order=created_at`,
      { headers: headers() }
    );
    return r.json();
  },
  async saveAiMessage(data) {
    await fetch(`${REST}/ai_messages`, {
      method: "POST", headers: headers(),
      body: JSON.stringify(data),
    });
  },

  // Books
  async getBooks() {
    const r = await fetch(`${REST}/books?is_published=eq.true&order=order_index`, { headers: headers() });
    return r.json();
  },

  // Payments
  async submitPayment(data) {
    const r = await fetch(`${REST}/payments`, {
      method: "POST", headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async getUserPayments(userId) {
    const r = await fetch(`${REST}/payments?user_id=eq.${userId}&order=submitted_at.desc`, { headers: headers() });
    return r.json();
  },
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T_ALL = {
  fr: {
    welcome:"Bienvenue", tagline:"La plateforme d'excellence pour le Baccalauréat",
    chooseLanguage:"Choisissez votre langue", login:"Se connecter", register:"Créer un compte",
    email:"Adresse e-mail", phone:"Numéro de téléphone", password:"Mot de passe",
    confirmPassword:"Confirmer", fullName:"Nom complet", firstName:"Prénom", lastName:"Nom",
    bacCategory:"Filière du Baccalauréat", next:"Suivant", confirm:"Confirmer",
    otpTitle:"Vérification", otpDesc:"Entrez le code envoyé à votre e-mail",
    enterOtp:"Code de vérification", subjects:"Matières", levelTest:"Test de niveau",
    payment:"Paiement", settings:"Paramètres", chapters:"Chapitres", lessons:"Leçons",
    lessonSummary:"Résumé du cours (PDF)", askAI:"Poser une question à l'IA",
    paymentTitle:"Choisissez votre banque", accountNumber:"Numéro de compte à créditer",
    transactionRef:"Référence de transaction", uploadScreenshot:"Joindre la capture d'écran",
    verifying:"Vérification en cours...", profileSettings:"Profil", changePhone:"Modifier le téléphone",
    changePassword:"Modifier le mot de passe", logout:"Se déconnecter", theme:"Thème",
    back:"Retour", watchLesson:"Regarder", freeContent:"Gratuit", lockedContent:"Verrouillé",
    unlockNow:"Débloquer", aiPlaceholder:"Posez votre question sur ce cours...",
    aiThinking:"L'IA réfléchit...", step:"Étape", of:"sur", createAccount:"Créer un compte",
    haveAccount:"Déjà inscrit ?", loading:"Chargement...", error:"Erreur", retry:"Réessayer",
    noContent:"Aucun contenu disponible", paymentPending:"Paiement en attente de validation",
    paymentValidated:"Compte activé ✓", paymentRejected:"Paiement refusé",
    submitPayment:"Soumettre le paiement", paymentSuccess:"Paiement soumis !",
    paymentSuccessDesc:"Votre paiement est en cours de vérification.", explore:"Explorer →",
    startExam:"Commencer", score:"Score", correct:"Correcte", wrong:"Incorrecte",
    finish:"Terminer", result:"Résultats", yourScore:"Votre score", next_q:"Suivant",
    prev_q:"Précédent", saveProgress:"Progression sauvegardée", watchedVideo:"Vidéo vue ✓",
    amount:"Montant (MRU)", required:"Champ requis", invalidEmail:"E-mail invalide",
    passwordShort:"Minimum 6 caractères", passwordMismatch:"Les mots de passe ne correspondent pas",
    loginError:"Identifiants incorrects", signupError:"Erreur lors de l'inscription",
    noExams:"Aucun examen disponible", free:"Gratuit", locked:"Verrouillé",
    books:"Bibliothèque", booksDesc:"Tous les livres scolaires", openBook:"Ouvrir",
    downloadVideo:"Télécharger", downloaded:"Téléchargé ✓", downloading:"Téléchargement...",
    noBooks:"Aucun livre disponible", videosTab:"Vidéos hors-ligne",
    savedVideos:"Vidéos téléchargées", noSavedVideos:"Aucune vidéo téléchargée",
    deleteVideo:"Supprimer", download:"Télécharger pour hors-ligne",
  },
  ar: {
    welcome:"أهلاً وسهلاً", tagline:"منصة التميز لطلاب البكالوريا",
    chooseLanguage:"اختر لغتك", login:"تسجيل الدخول", register:"إنشاء حساب",
    email:"البريد الإلكتروني", phone:"رقم الهاتف", password:"كلمة السر",
    confirmPassword:"تأكيد", fullName:"الاسم الكامل", firstName:"الاسم", lastName:"اللقب",
    bacCategory:"فئة البكالوريا", next:"التالي", confirm:"تأكيد",
    otpTitle:"التحقق", otpDesc:"أدخل الرمز المرسل إلى بريدك",
    enterOtp:"رمز التحقق", subjects:"المواد", levelTest:"قياس المستوى",
    payment:"الدفع", settings:"الإعدادات", chapters:"الفهارس", lessons:"الدروس",
    lessonSummary:"ملخص الدرس (PDF)", askAI:"اسأل الذكاء الاصطناعي",
    paymentTitle:"اختر البنك", accountNumber:"رقم الحساب للتحويل",
    transactionRef:"رقم المعاملة", uploadScreenshot:"أرفق لقطة الشاشة",
    verifying:"جارٍ التحقق...", profileSettings:"الملف الشخصي",
    changePhone:"تغيير الهاتف", changePassword:"تغيير كلمة السر",
    logout:"تسجيل الخروج", theme:"التصميم", back:"رجوع",
    watchLesson:"مشاهدة", freeContent:"مجاني", lockedContent:"مقفل",
    unlockNow:"افتح الآن", aiPlaceholder:"اسأل عن هذا الدرس...",
    aiThinking:"الذكاء الاصطناعي يفكر...", step:"خطوة", of:"من",
    createAccount:"إنشاء حساب جديد", haveAccount:"لديك حساب؟",
    loading:"جارٍ التحميل...", error:"خطأ", retry:"إعادة المحاولة",
    noContent:"لا يوجد محتوى", paymentPending:"الدفع قيد المراجعة",
    paymentValidated:"الحساب مفعل ✓", paymentRejected:"تم رفض الدفع",
    submitPayment:"إرسال الدفع", paymentSuccess:"تم إرسال الدفع!",
    paymentSuccessDesc:"دفعتك قيد المراجعة.", explore:"استكشف →",
    startExam:"ابدأ", score:"النتيجة", correct:"صحيح", wrong:"خطأ",
    finish:"إنهاء", result:"النتائج", yourScore:"نتيجتك", next_q:"التالي",
    prev_q:"السابق", saveProgress:"تم حفظ التقدم", watchedVideo:"تمت مشاهدة الفيديو ✓",
    amount:"المبلغ (أوقية)", required:"حقل مطلوب", invalidEmail:"البريد غير صحيح",
    passwordShort:"6 أحرف على الأقل", passwordMismatch:"كلمتا السر غير متطابقتين",
    loginError:"بيانات الدخول غير صحيحة", signupError:"خطأ في التسجيل",
    noExams:"لا توجد امتحانات", free:"مجاني", locked:"مقفل",
    books:"المكتبة", booksDesc:"جميع الكتب المدرسية", openBook:"فتح",
    downloadVideo:"تحميل", downloaded:"تم التحميل ✓", downloading:"جارٍ التحميل...",
    noBooks:"لا توجد كتب", videosTab:"فيديوهات بدون إنترنت",
    savedVideos:"الفيديوهات المحملة", noSavedVideos:"لا توجد فيديوهات محملة",
    deleteVideo:"حذف", download:"تحميل للاستخدام بدون إنترنت",
  },
  en: {
    welcome:"Welcome", tagline:"The excellence platform for BAC students",
    chooseLanguage:"Choose your language", login:"Log In", register:"Create Account",
    email:"Email address", phone:"Phone number", password:"Password",
    confirmPassword:"Confirm password", fullName:"Full name", firstName:"First name", lastName:"Last name",
    bacCategory:"BAC Category", next:"Next", confirm:"Confirm",
    otpTitle:"Verification", otpDesc:"Enter the code sent to your email",
    enterOtp:"Verification code", subjects:"Subjects", levelTest:"Level Test",
    payment:"Payment", settings:"Settings", chapters:"Chapters", lessons:"Lessons",
    lessonSummary:"Lesson Summary (PDF)", askAI:"Ask AI",
    paymentTitle:"Choose your bank", accountNumber:"Account number to transfer to",
    transactionRef:"Transaction reference", uploadScreenshot:"Attach screenshot",
    verifying:"Verifying...", profileSettings:"Profile", changePhone:"Change phone",
    changePassword:"Change password", logout:"Log Out", theme:"Theme",
    back:"Back", watchLesson:"Watch", freeContent:"Free", lockedContent:"Locked",
    unlockNow:"Unlock now", aiPlaceholder:"Ask about this lesson...",
    aiThinking:"AI is thinking...", step:"Step", of:"of", createAccount:"Create account",
    haveAccount:"Already registered?", loading:"Loading...", error:"Error", retry:"Retry",
    noContent:"No content available", paymentPending:"Payment pending validation",
    paymentValidated:"Account activated ✓", paymentRejected:"Payment rejected",
    submitPayment:"Submit payment", paymentSuccess:"Payment submitted!",
    paymentSuccessDesc:"Your payment is being verified.", explore:"Explore →",
    startExam:"Start", score:"Score", correct:"Correct", wrong:"Wrong",
    finish:"Finish", result:"Results", yourScore:"Your score", next_q:"Next",
    prev_q:"Previous", saveProgress:"Progress saved", watchedVideo:"Video watched ✓",
    amount:"Amount (MRU)", required:"Required field", invalidEmail:"Invalid email",
    passwordShort:"Minimum 6 characters", passwordMismatch:"Passwords don't match",
    loginError:"Incorrect credentials", signupError:"Registration error",
    noExams:"No exams available", free:"Free", locked:"Locked",
    books:"Library", booksDesc:"All school books", openBook:"Open",
    downloadVideo:"Download", downloaded:"Downloaded ✓", downloading:"Downloading...",
    noBooks:"No books available", videosTab:"Offline Videos",
    savedVideos:"Downloaded videos", noSavedVideos:"No downloaded videos",
    deleteVideo:"Delete", download:"Download for offline use",
  },
};

const BANKS = [
  { id:"bankily",  name:"Bankily",  color:"#00A651", logo:"B",  account:"2234 5678 9012" },
  { id:"masrivi",  name:"Masrivi",  color:"#E4002B", logo:"M",  account:"3345 6789 0123" },
  { id:"sedad",    name:"Sedad",    color:"#1A478A", logo:"S",  account:"4456 7890 1234" },
  { id:"amanty",   name:"Amanty",   color:"#8B5CF6", logo:"Am", account:"5567 8901 2345" },
  { id:"other",    name:"BimBank",  color:"#FF6B00", logo:"Bi", account:"6678 9012 3456" },
  { id:"other",    name:"Click",    color:"#00B4D8", logo:"CL", account:"7789 0123 4567" },
  { id:"other",    name:"BCIPay",   color:"#059669", logo:"BC", account:"8890 1234 5678" },
];

const THEMES = [
  { id:"dark",     bg:"#0A0A0F", accent:"#C9A84C", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
  { id:"midnight", bg:"#0D1B2A", accent:"#4FC3F7", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
  { id:"forest",   bg:"#0F2518", accent:"#4ADE80", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
  { id:"rose",     bg:"#1A0A0F", accent:"#FB7185", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
  { id:"light",    bg:"#F5F3EE", accent:"#B8860B", card:"rgba(0,0,0,0.04)",       border:"rgba(0,0,0,0.1)" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("lang");          // lang|auth|otp|home
  const [lang, setLang]               = useState("fr");
  const [theme, setTheme]             = useState(THEMES[0]);
  const [authMode, setAuthMode]       = useState("login");         // login|register
  const [regStep, setRegStep]         = useState(1);
  const [activeTab, setActiveTab]     = useState("subjects");
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeExam, setActiveExam]   = useState(null);
  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions]     = useState([]);
  const [qIndex, setQIndex]           = useState(0);
  const [answers, setAnswers]         = useState({});
  const [examDone, setExamDone]       = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [payStep, setPayStep]         = useState(1);
  const [payTimer, setPayTimer]       = useState(5);

  // Supabase auth state
  const [token, setToken]             = useState(null);
  const [authUser, setAuthUser]       = useState(null);   // supabase auth user
  const [profile, setProfile]         = useState(null);   // users table row

  // Data
  const [subjects, setSubjects]       = useState([]);
  const [chapters, setChapters]       = useState([]);
  const [aiMessages, setAiMessages]   = useState([]);
  const [progress, setProgress]       = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [exams, setExams]             = useState([]);
  const [books, setBooks]             = useState([]);
  const [activeBook, setActiveBook]   = useState(null);
  const [downloadedVideos, setDownloadedVideos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("elites_videos") || "[]"); } catch { return []; }
  });
  const [downloadingId, setDownloadingId] = useState(null);

  // Form state
  const [form, setForm]               = useState({ firstName:"", lastName:"", phone:"", email:"", password:"", confirm:"", bac:"", amount:"" });
  const [transactionRef, setTransactionRef] = useState("");
  const [aiQuestion, setAiQuestion]   = useState("");
  const [aiLoading, setAiLoading]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errMsg, setErrMsg]           = useState("");
  const [toast, setToast]             = useState("");

  const T = T_ALL[lang];
  const isRTL = lang === "ar";
  const isDark = !theme.bg.startsWith("#F");
  const textColor = isDark ? "#F0EDE8" : "#1A1710";
  const subColor  = isDark ? "#7A7670" : "#6B6560";

  const S = {
    app:   { width:"100%", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:theme.bg, color:textColor,
              fontFamily:"'Cormorant Garamond','Noto Naskh Arabic',serif", direction:isRTL?"rtl":"ltr", position:"relative" },
    page:  { minHeight:"100vh", display:"flex", flexDirection:"column", padding:"0 22px 110px" },
    head:  { padding:"52px 0 20px" },
    logo:  { fontSize:46, fontWeight:700, color:theme.accent, letterSpacing:-2, lineHeight:1 },
    logoS: { fontSize:11, letterSpacing:6, color:subColor, marginTop:5, textTransform:"uppercase", fontFamily:"sans-serif" },
    title: { fontSize:26, fontWeight:700, lineHeight:1.2 },
    sub:   { fontSize:14, color:subColor, fontFamily:"sans-serif", lineHeight:1.5 },
    card:  { background:theme.card, border:`1px solid ${theme.border}`, borderRadius:14, padding:18, marginBottom:10 },
    inp:   { width:"100%", background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
              border:`1px solid ${theme.border}`, borderRadius:10, padding:"13px 14px",
              fontSize:15, color:textColor, outline:"none", boxSizing:"border-box", marginBottom:10,
              fontFamily:"sans-serif" },
    btn:   { width:"100%", background:theme.accent, color:"#0A0A0F", border:"none",
              borderRadius:10, padding:"15px 22px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" },
    btnO:  { width:"100%", background:"transparent", color:theme.accent, border:`1.5px solid ${theme.accent}`,
              borderRadius:10, padding:"13px 22px", fontSize:14, cursor:"pointer", fontFamily:"sans-serif" },
    back:  { background:"none", border:"none", color:theme.accent, cursor:"pointer", fontSize:13,
              fontFamily:"sans-serif", padding:"6px 0", display:"flex", alignItems:"center", gap:5 },
    tag:   { display:"inline-block", background:theme.accent+"22", color:theme.accent,
              borderRadius:20, padding:"3px 10px", fontSize:11, fontFamily:"sans-serif" },
    nav:   { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430,
              background:isDark?"rgba(10,10,15,0.96)":"rgba(245,243,238,0.96)", backdropFilter:"blur(20px)",
              borderTop:`1px solid ${theme.border}`, display:"flex", justifyContent:"space-around",
              padding:"10px 0 20px", zIndex:100 },
  };

  // ── Toast ───────────────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Payment timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (payStep === 3) {
      const t = setInterval(() => setPayTimer(p => {
        if (p <= 1) { clearInterval(t); setPayStep(4); return 5; }
        return p - 1;
      }), 1000);
      return () => clearInterval(t);
    }
  }, [payStep]);

  // ── Load subjects when user logs in ─────────────────────────────────────────
  useEff
