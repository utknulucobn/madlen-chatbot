"use client";

import { useEffect, useRef, useState } from "react";

/* ---------------- i18n ---------------- */
const T = {
  en: {
    appName: "Madlen Chatbot",
    heroTitle: "Welcome to Madlen Chatbot",
    heroSub: "AI mini-tools for the classroom. Who are you?",
    teacher: "Teacher",
    student: "Student",
    teacherDesc: "Prepare lessons in minutes and grade essays with structured feedback.",
    studentDesc: "A study buddy that gives you hints, not answers.",
    pickTool: "What would you like to do?",
    lesson: "Lesson Prep Assistant",
    lessonDesc: "Topic + grade in, ready-to-teach plan out: outline, 5 slides, discussion questions.",
    essay: "Essay Grader",
    essayDesc: "Paste an essay, get scores on 4 criteria with quoted feedback and a kind student summary.",
    welcome: "Hello, how can I help you?",
    welcomeStudentSub: "Ask me anything about your lessons. I'll guide you with hints so the \"aha!\" moment is yours.",
    welcomeLessonSub: "Tell me your topic and I'll build the lesson with you.",
    welcomeEssaySub: "Paste a student essay below and I'll grade it with structured feedback.",
    inputPlaceholder: "Write your question...",
    send: "Send",
    thinking: "Thinking...",
    newChat: "+ New chat",
    history: "History",
    noHistory: "No conversations yet.",
    deleteChat: "Delete chat",
    deleteAsk: "Delete this chat?",
    deleteYes: "Delete",
    deleteNo: "Cancel",
    grade: "Grade",
    subject: "Subject",
    gradeNone: "Grade (optional)",
    subjectNone: "Subject (optional)",
    contextHint: "Pick a grade and subject to tailor outputs to your class.",
    level: "Your level",
    levels: ["Primary school", "Middle school", "High school"],
    subjects: ["Math", "Physics", "Chemistry", "Biology", "Science", "Turkish", "Literature", "English", "History", "Geography", "Other"],
    topic: "Topic",
    topicPh: "e.g. Photosynthesis",
    duration: "Lesson duration",
    durationPh: "e.g. 40 minutes",
    generatePlan: "Create lesson plan",
    essayLabel: "Student essay",
    essayPh: "Paste the essay here...",
    gradeEssay: "Grade the essay",
    copy: "Copy",
    copied: "Copied!",
    scoreLabels: { argument: "Argument", clarity: "Clarity", structure: "Structure", language: "Language" },
    outlineTitle: "Lesson outline",
    slidesTitle: "Slides",
    questionsTitle: "Discussion questions",
    slideWord: "Slide",
    visualLabel: "Visual",
    translating: "Translating this output...",
    errGeneric: "Something went wrong. Please try again.",
    errRate: "This demo runs on Google's free AI tier, which allows a limited number of requests per day — and today's allowance is used up. It resets daily.",
    errKey: "The server API key seems invalid.",
  },
  tr: {
    appName: "Madlen Chatbot",
    heroTitle: "Madlen Chatbot'a hoş geldin",
    heroSub: "Sınıf için yapay zekâ mini araçları. Sen kimsin?",
    teacher: "Öğretmen",
    student: "Öğrenci",
    teacherDesc: "Dakikalar içinde ders hazırla, kompozisyonları yapılandırılmış geri bildirimle değerlendir.",
    studentDesc: "Cevabı değil, ipucunu veren bir çalışma arkadaşı.",
    pickTool: "Ne yapmak istersin?",
    lesson: "Ders Hazırlık Asistanı",
    lessonDesc: "Konu + sınıf gir, derse hazır plan al: taslak, 5 slayt, tartışma soruları.",
    essay: "Kompozisyon Değerlendirici",
    essayDesc: "Kompozisyonu yapıştır; 4 kriterde puan, alıntılı geri bildirim ve öğrenciye şefkatli özet al.",
    welcome: "Merhaba, nasıl yardımcı olabilirim?",
    welcomeStudentSub: "Derslerinle ilgili her şeyi sorabilirsin. Sana ipuçlarıyla yol göstereceğim; \"buldum!\" anı senin olacak.",
    welcomeLessonSub: "Konunu söyle, dersi birlikte kuralım.",
    welcomeEssaySub: "Aşağıya bir öğrenci kompozisyonu yapıştır, yapılandırılmış geri bildirimle değerlendireyim.",
    inputPlaceholder: "Sorunu yaz...",
    send: "Gönder",
    thinking: "Düşünüyor...",
    newChat: "+ Yeni sohbet",
    history: "Geçmiş",
    noHistory: "Henüz sohbet yok.",
    deleteChat: "Sohbeti sil",
    deleteAsk: "Bu sohbet silinsin mi?",
    deleteYes: "Sil",
    deleteNo: "Vazgeç",
    grade: "Sınıf",
    subject: "Ders",
    gradeNone: "Sınıf (isteğe bağlı)",
    subjectNone: "Ders (isteğe bağlı)",
    contextHint: "Sınıf ve ders seçersen çıktılar sınıfına özel olur.",
    level: "Seviyen",
    levels: ["İlkokul", "Ortaokul", "Lise"],
    subjects: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Fen Bilimleri", "Türkçe", "Edebiyat", "İngilizce", "Tarih", "Coğrafya", "Diğer"],
    topic: "Konu",
    topicPh: "örn. Fotosentez",
    duration: "Ders süresi",
    durationPh: "örn. 40 dakika",
    generatePlan: "Ders planı oluştur",
    essayLabel: "Öğrenci kompozisyonu",
    essayPh: "Kompozisyonu buraya yapıştır...",
    gradeEssay: "Kompozisyonu değerlendir",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    scoreLabels: { argument: "Argüman", clarity: "Açıklık", structure: "Yapı", language: "Dil" },
    outlineTitle: "Ders taslağı",
    slidesTitle: "Slaytlar",
    questionsTitle: "Tartışma soruları",
    slideWord: "Slayt",
    visualLabel: "Görsel",
    translating: "Bu çıktı çevriliyor...",
    errGeneric: "Bir şeyler ters gitti. Lütfen tekrar dene.",
    errRate: "Bu demo Google'ın ücretsiz yapay zekâ katmanında çalışıyor; günlük istek hakkı şu an dolu. Limit her gün yenileniyor.",
    errKey: "Sunucudaki API anahtarı geçersiz görünüyor.",
  },
};

/* ---------------- storage helpers ---------------- */
const load = (k, d) => {
  if (typeof window === "undefined") return d;
  try {
    const v = localStorage.getItem(k);
    return v === null ? d : JSON.parse(v);
  } catch {
    return d;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/* ---------------- component ---------------- */
export default function App() {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("home"); // home | teacherPick | student | lesson | essay
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // student chat state
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // lesson form
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [lessonOut, setLessonOut] = useState("");

  // essay form
  const [essay, setEssay] = useState("");
  const [essayOut, setEssayOut] = useState("");
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const endRef = useRef(null);
  const prevLang = useRef(null);
  // Translations of the document currently on screen, keyed by language.
  // Free-tier quota is tight, so a language already produced is never
  // requested from the model twice.
  const lessonCache = useRef({});
  const essayCache = useRef({});
  const t = T[lang];

  // Where the user currently is, shown in the top bar so the screen is never
  // ambiguous: Teacher > Lesson Prep Assistant, Teacher > Essay Grader, Student.
  const crumbs =
    view === "student"
      ? [t.student]
      : view === "teacherPick"
      ? [t.teacher]
      : view === "lesson"
      ? [t.teacher, t.lesson]
      : view === "essay"
      ? [t.teacher, t.essay]
      : [];

  /* ---- init from localStorage ---- */
  useEffect(() => {
    setLang(load("mc_lang", "en"));
    setGrade(load("mc_grade", ""));
    setSubject(load("mc_subject", ""));
    setLevel(load("mc_level", ""));
    setHistory(load("mc_history", []));
  }, []);

  useEffect(() => save("mc_lang", lang), [lang]);
  useEffect(() => save("mc_grade", grade), [grade]);
  useEffect(() => save("mc_subject", subject), [subject]);
  useEffect(() => save("mc_level", level), [level]);
  useEffect(() => save("mc_history", history), [history]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  /* ---- history helpers ---- */
  const pushHistory = (mode, title, messages) => {
    const id = activeId || Date.now().toString(36);
    setActiveId(id);
    setHistory((h) => {
      const rest = h.filter((x) => x.id !== id);
      return [{ id, mode, title: title.slice(0, 48), messages, ts: Date.now() }, ...rest].slice(0, 40);
    });
    return id;
  };

  const openHistory = (item) => {
    setActiveId(item.id);
    setErr("");
    if (item.mode === "student") {
      setMsgs(item.messages);
      setView("student");
    } else if (item.mode === "lesson") {
      setLessonFresh(item.messages[item.messages.length - 1]?.content || "");
      setTopic(item.title);
      setView("lesson");
    } else {
      setEssayFresh(item.messages[item.messages.length - 1]?.content || "");
      setView("essay");
    }
  };

  const removeHistory = (id) => {
    setHistory((h) => h.filter((x) => x.id !== id));
    setConfirmDelete(null);
    // Clear the screen too if the chat being deleted is the one open.
    if (activeId === id) newChat();
  };

  const newChat = () => {
    setActiveId(null);
    setMsgs([]);
    setInput("");
    setLessonFresh("");
    setEssayFresh("");
    setEssay("");
    setTopic("");
    setErr("");
    setView("home");
  };

  /* ---- API call ---- */
  const callApi = async (mode, messages, meta) => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, lang, grade, subject, messages, meta }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        const map = { rate_limit: t.errRate, bad_key: t.errKey };
        setErr(map[data.error] || t.errGeneric);
        return null;
      }
      return data.text;
    } catch {
      setErr(t.errGeneric);
      return null;
    } finally {
      setBusy(false);
    }
  };

  /* ---- re-translate visible output when the language is switched ----
     Switching TR/EN used to relabel the UI while leaving the generated
     document in the old language. Send it back through the model instead,
     preserving the structural labels the renderer parses. Each language is
     translated at most once per document: the result is cached, so toggling
     back and forth costs no further requests. */
  useEffect(() => {
    if (prevLang.current === null) {
      prevLang.current = lang;
      return;
    }
    const from = prevLang.current;
    if (from === lang) return;
    prevLang.current = lang;
    if (!lessonOut && !essayOut) return;

    let cancelled = false;
    (async () => {
      // Remember what is on screen under the language it was written in.
      if (lessonOut) lessonCache.current[from] = lessonOut;
      if (essayOut) essayCache.current[from] = essayOut;

      const lessonHit = lessonOut ? lessonCache.current[lang] : null;
      const essayHit = essayOut ? essayCache.current[lang] : null;

      // Anything already translated is swapped in without touching the API.
      if (lessonHit) setLessonOut(lessonHit);
      if (essayHit) setEssayOut(essayHit);

      const needLesson = lessonOut && !lessonHit;
      const needEssay = essayOut && !essayHit;
      if (!needLesson && !needEssay) return;

      setTranslating(true);
      if (needLesson) {
        const out = await callApi("translate", [{ role: "user", content: lessonOut }], {});
        if (!cancelled && out) {
          lessonCache.current[lang] = out;
          setLessonOut(out);
        }
      }
      if (needEssay) {
        const out = await callApi("translate", [{ role: "user", content: essayOut }], {});
        if (!cancelled && out) {
          essayCache.current[lang] = out;
          setEssayOut(out);
        }
      }
      if (!cancelled) setTranslating(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ---- student send ---- */
  const sendStudent = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    const reply = await callApi("student", next, { level });
    if (reply) {
      const full = [...next, { role: "assistant", content: reply }];
      setMsgs(full);
      pushHistory("student", next[0].content, full);
    }
  };

  /* ---- lesson generate ---- */
  const makeLesson = async () => {
    if (!topic.trim() || busy) return;
    setLessonFresh("");
    const messages = [{ role: "user", content: `Please create the lesson plan for: ${topic.trim()}` }];
    const reply = await callApi("lesson", messages, { topic: topic.trim(), duration: duration.trim() || undefined });
    if (reply) {
      setLessonFresh(reply);
      pushHistory("lesson", topic.trim(), [...messages, { role: "assistant", content: reply }]);
    }
  };

  /* ---- essay grade ---- */
  const gradeIt = async () => {
    if (!essay.trim() || busy) return;
    setEssayFresh("");
    const messages = [{ role: "user", content: essay.trim().slice(0, 12000) }];
    const reply = await callApi("essay", messages, {});
    if (reply) {
      setEssayFresh(reply);
      const title = (lang === "tr" ? "Kompozisyon: " : "Essay: ") + essay.trim().slice(0, 30);
      pushHistory("essay", title, [...messages, { role: "assistant", content: reply }]);
    }
  };

  const doCopy = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  /* ---- output setters: a new document resets its translation cache ---- */
  const setLessonFresh = (text) => {
    lessonCache.current = text ? { [lang]: text } : {};
    setLessonOut(text);
  };
  const setEssayFresh = (text) => {
    essayCache.current = text ? { [lang]: text } : {};
    setEssayOut(text);
  };

  /* ---- essay score parsing ---- */
  const parseScores = (out) => {
    const m = out.match(/SCORES:\s*([^\n]+)/i);
    if (!m) return null;
    const scores = {};
    const re = /(argument|clarity|structure|language)\s*=\s*(\d{1,2})/gi;
    let x;
    while ((x = re.exec(m[1]))) scores[x[1].toLowerCase()] = Math.min(10, parseInt(x[2], 10));
    return Object.keys(scores).length === 4 ? scores : null;
  };
  const essayBody = (out) => out.replace(/SCORES:[^\n]*\n?/i, "").trim();

  /* ---- lesson plan parsing ----
     Turns the model's plain-text skeleton into an outline, slide cards and
     discussion questions. Label-tolerant: the model keeps the English labels
     even when writing Turkish, but may translate them. Returns null on any
     unexpected shape so the raw text is rendered instead. */
  const OUTLINE_LABELS = {
    objective: { en: "Objective", tr: "Hedef" },
    "key concepts": { en: "Key concepts", tr: "Anahtar kavramlar" },
    flow: { en: "Flow", tr: "Akış" },
    hedef: { en: "Objective", tr: "Hedef" },
    "anahtar kavramlar": { en: "Key concepts", tr: "Anahtar kavramlar" },
    akış: { en: "Flow", tr: "Akış" },
  };

  /* ---- SVG safety gate ----
     The drawing arrives as model-generated markup, so it is never trusted.
     Anything outside a small drawing-only allowlist rejects the whole figure
     and the slide falls back to its written visual suggestion. */
  const SVG_ALLOWED = new Set([
    "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
    "polygon", "text", "tspan", "defs", "marker", "lineargradient", "stop", "title",
  ]);

  const safeSvg = (raw) => {
    const svg = (raw || "").trim();
    if (!svg || svg.length > 6000) return "";
    if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>$/i.test(svg)) return "";
    // No scripting, no navigation, no external or embedded resources.
    if (/\son[a-z]+\s*=/i.test(svg)) return "";
    if (/(href|src|xlink:href|javascript:|data:text\/html|<!--|<!\[CDATA)/i.test(svg)) return "";
    // Every element must be on the allowlist.
    const tags = svg.match(/<\/?\s*([a-zA-Z][\w:.-]*)/g) || [];
    for (const tag of tags) {
      const name = tag.replace(/[<\/\s]/g, "").toLowerCase();
      if (!SVG_ALLOWED.has(name)) return "";
    }
    return svg;
  };

  const parseLesson = (out) => {
    if (!out) return null;

    const slideRe = /^\s*(?:slide|slayt)\s*(\d+)\s*[:.)\-–]\s*(.*)$/i;
    const visualRe = /^\s*(?:visual suggestion|g[öo]rsel [öo]nerisi|visual|g[öo]rsel)\s*:\s*(.*)$/i;
    const svgRe = /^\s*(?:visual svg|g[öo]rsel svg|svg)\s*:\s*(<svg[\s\S]*<\/svg>)\s*$/i;
    const bulletRe = /^\s*[-•*]\s*(.+)$/;
    const numberedRe = /^\s*\d+\s*[.)]\s*(.+)$/;
    const outlineRe = /^\s*([^:]{2,40}?)\s*:\s*(.+)$/;
    const isHead = (line, words) =>
      words.some((w) => new RegExp(`^\\s*${w}\\s*:?\\s*$`, "i").test(line));

    const outline = [];
    const slides = [];
    const questions = [];
    let section = "outline";
    let cur = null;

    const closeSlide = () => {
      if (cur) slides.push(cur);
      cur = null;
    };

    for (const raw of out.split("\n")) {
      const line = raw.trim();
      if (!line) continue;

      if (isHead(line, ["slides", "slaytlar"])) {
        closeSlide();
        section = "slides";
        continue;
      }
      if (isHead(line, ["discussion questions", "tart[ıi][şs]ma sorular[ıi]"])) {
        closeSlide();
        section = "questions";
        continue;
      }
      if (isHead(line, ["lesson outline", "ders tasla[ğg][ıi]", "outline"])) {
        section = "outline";
        continue;
      }

      if (section === "outline") {
        const m = line.match(outlineRe);
        if (m) {
          const key = m[1].trim().toLowerCase();
          const label = OUTLINE_LABELS[key] ? OUTLINE_LABELS[key][lang] : m[1].trim();
          outline.push({ label, value: m[2].trim() });
        } else {
          outline.push({ label: "", value: line });
        }
        continue;
      }

      if (section === "slides") {
        const m = line.match(slideRe);
        if (m) {
          closeSlide();
          cur = { n: m[1], title: m[2].trim(), bullets: [], visual: "", svg: "" };
          continue;
        }
        const g = line.match(svgRe);
        if (g && cur) {
          cur.svg = safeSvg(g[1]);
          continue;
        }
        const v = line.match(visualRe);
        if (v && cur) {
          cur.visual = v[1].trim();
          continue;
        }
        const b = line.match(bulletRe);
        if (b && cur) {
          cur.bullets.push(b[1].trim());
          continue;
        }
        if (cur) cur.bullets.push(line);
        continue;
      }

      const q = line.match(numberedRe);
      questions.push(q ? q[1].trim() : line);
    }
    closeSlide();

    // Not the expected shape - let the caller fall back to raw text.
    if (!slides.length) return null;
    return { outline, slides, questions };
  };

  /* ---- context bar (teacher tools) ---- */
  const ContextBar = () => (
    <div className="context-bar">
      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        <option value="">{t.gradeNone}</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
          <option key={g} value={g}>
            {t.grade} {g}
          </option>
        ))}
      </select>
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="">{t.subjectNone}</option>
        {t.subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {!grade && !subject && <span className="context-hint">{t.contextHint}</span>}
    </div>
  );

  /* ---------------- render ---------------- */
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={newChat} title={t.appName}>
          <span className="shell">🐚</span> {t.appName}
        </div>
        <button className="new-chat" onClick={newChat}>
          {t.newChat}
        </button>
        <div className="history-title">{t.history}</div>
        <div className="history">
          {history.length === 0 && <div className="history-empty">{t.noHistory}</div>}
          {history.map((h) =>
            confirmDelete === h.id ? (
              <div className="history-confirm" key={h.id}>
                <span>{t.deleteAsk}</span>
                <div className="history-confirm-actions">
                  <button className="confirm-yes" onClick={() => removeHistory(h.id)}>
                    {t.deleteYes}
                  </button>
                  <button className="confirm-no" onClick={() => setConfirmDelete(null)}>
                    {t.deleteNo}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={"history-row" + (h.id === activeId ? " active" : "")}
                key={h.id}
              >
                <button className="history-item" onClick={() => openHistory(h)}>
                  {h.title}
                </button>
                <button
                  className="history-del"
                  onClick={() => setConfirmDelete(h.id)}
                  title={t.deleteChat}
                  aria-label={t.deleteChat}
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          {crumbs.length > 0 && (
            <div className="crumbs">
              {crumbs.map((c, i) => (
                <span key={i} className="crumb-item">
                  {i > 0 && <span className="crumb-sep">›</span>}
                  <span className={i === crumbs.length - 1 ? "crumb-now" : "crumb-up"}>{c}</span>
                </span>
              ))}
            </div>
          )}
          <div className="lang-toggle">
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
              EN
            </button>
            <button className={lang === "tr" ? "on" : ""} onClick={() => setLang("tr")}>
              TR
            </button>
          </div>
        </div>

        <div className="content">
          <div className="inner">
            {/* HOME */}
            {view === "home" && (
              <>
                <div className="hero">
                  <h1>{t.heroTitle}</h1>
                  <p>{t.heroSub}</p>
                </div>
                <div className="cards">
                  <button className="role-card" onClick={() => setView("teacherPick")}>
                    <div className="emoji">📚</div>
                    <h3>{t.teacher}</h3>
                    <p>{t.teacherDesc}</p>
                  </button>
                  <button
                    className="role-card"
                    onClick={() => {
                      setMsgs([]);
                      setActiveId(null);
                      setView("student");
                    }}
                  >
                    <div className="emoji">🎒</div>
                    <h3>{t.student}</h3>
                    <p>{t.studentDesc}</p>
                  </button>
                </div>
              </>
            )}

            {/* TEACHER PICK */}
            {view === "teacherPick" && (
              <>
                <div className="hero">
                  <h1>{t.pickTool}</h1>
                </div>
                <div className="cards">
                  <button
                    className="role-card"
                    onClick={() => {
                      setLessonFresh("");
                      setActiveId(null);
                      setView("lesson");
                    }}
                  >
                    <div className="emoji">📝</div>
                    <h3>{t.lesson}</h3>
                    <p>{t.lessonDesc}</p>
                  </button>
                  <button
                    className="role-card"
                    onClick={() => {
                      setEssayFresh("");
                      setEssay("");
                      setActiveId(null);
                      setView("essay");
                    }}
                  >
                    <div className="emoji">📊</div>
                    <h3>{t.essay}</h3>
                    <p>{t.essayDesc}</p>
                  </button>
                </div>
              </>
            )}

            {/* STUDENT CHAT */}
            {view === "student" && (
              <>
                {msgs.length === 0 && (
                  <>
                    <div className="welcome">{t.welcome}</div>
                    <div className="welcome-sub">{t.welcomeStudentSub}</div>
                    <div className="cards" style={{ marginTop: 8 }}>
                      <select
                        className="history-item"
                        style={{ background: "var(--white)", border: "1.5px solid #e0d3bc", borderRadius: 999, padding: "8px 14px", fontWeight: 600 }}
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="">{t.level}</option>
                        {t.levels.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="msgs">
                  {msgs.map((m, i) => (
                    <div key={i} className={"msg " + (m.role === "user" ? "user" : "bot")}>
                      {m.content}
                    </div>
                  ))}
                  {busy && <div className="thinking">{t.thinking}</div>}
                  {err && <div className="error">{err}</div>}
                  <div ref={endRef} />
                </div>
              </>
            )}

            {/* LESSON PREP */}
            {view === "lesson" && (
              <>
                <div className="welcome">{t.welcome}</div>
                <div className="welcome-sub">{t.welcomeLessonSub}</div>
                <div className="tool-form">
                  <div className="row">
                    <div>
                      <label>{t.topic}</label>
                      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t.topicPh} maxLength={200} />
                    </div>
                    <div>
                      <label>{t.duration}</label>
                      <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={t.durationPh} maxLength={40} />
                    </div>
                  </div>
                  <ContextBar />
                  <button className="primary" onClick={makeLesson} disabled={busy || !topic.trim()}>
                    {busy ? t.thinking : t.generatePlan}
                  </button>
                  {err && <div className="error">{err}</div>}
                </div>
                {translating && <div className="translating">{t.translating}</div>}
                {lessonOut &&
                  (() => {
                    const L = parseLesson(lessonOut);
                    // Unexpected shape: fall back to the plain text output.
                    if (!L)
                      return (
                        <div className="result">
                          {lessonOut}
                          {"\n"}
                          <button className="copy-btn" onClick={() => doCopy(lessonOut)}>
                            {copied ? t.copied : t.copy}
                          </button>
                        </div>
                      );
                    return (
                      <div className="lesson-doc">
                        {L.outline.length > 0 && (
                          <div className="lesson-block">
                            <div className="block-title">{t.outlineTitle}</div>
                            {L.outline.map((o, i) => (
                              <div className="outline-row" key={i}>
                                {o.label && <span className="outline-label">{o.label}</span>}
                                <span>{o.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="block-title deck-title">{t.slidesTitle}</div>
                        <div className="slide-deck">
                          {L.slides.map((sl, i) => (
                            <div className="slide-card" key={i}>
                              <span className="slide-num">
                                {t.slideWord} {sl.n}
                              </span>
                              <div className="slide-title">{sl.title}</div>
                              <ul className="slide-bullets">
                                {sl.bullets.map((b, j) => (
                                  <li key={j}>{b}</li>
                                ))}
                              </ul>
                              {sl.svg && (
                                <div
                                  className="slide-figure"
                                  dangerouslySetInnerHTML={{ __html: sl.svg }}
                                />
                              )}
                              {sl.visual && (
                                <div className="slide-visual">
                                  <span className="visual-tag">{t.visualLabel}</span>
                                  <span>{sl.visual}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {L.questions.length > 0 && (
                          <div className="lesson-block">
                            <div className="block-title">{t.questionsTitle}</div>
                            <ol className="question-list">
                              {L.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <button className="copy-btn" onClick={() => doCopy(lessonOut)}>
                          {copied ? t.copied : t.copy}
                        </button>
                      </div>
                    );
                  })()}
              </>
            )}

            {/* ESSAY GRADER */}
            {view === "essay" && (
              <>
                <div className="welcome">{t.welcome}</div>
                <div className="welcome-sub">{t.welcomeEssaySub}</div>
                <div className="tool-form">
                  <label>{t.essayLabel}</label>
                  <textarea value={essay} onChange={(e) => setEssay(e.target.value)} placeholder={t.essayPh} maxLength={12000} />
                  <ContextBar />
                  <button className="primary" onClick={gradeIt} disabled={busy || !essay.trim()}>
                    {busy ? t.thinking : t.gradeEssay}
                  </button>
                  {err && <div className="error">{err}</div>}
                </div>
                {translating && <div className="translating">{t.translating}</div>}
                {essayOut && (
                  <div className="result">
                    {(() => {
                      const s = parseScores(essayOut);
                      return s ? (
                        <div className="scores">
                          {Object.entries(s).map(([k, v]) => (
                            <div className="score-row" key={k}>
                              <div className="score-label">{t.scoreLabels[k]}</div>
                              <div className="score-track">
                                <div className="score-fill" style={{ width: `${v * 10}%` }} />
                              </div>
                              <div className="score-num">{v}/10</div>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                    {essayBody(essayOut)}
                    {"\n"}
                    <button className="copy-btn" onClick={() => doCopy(essayBody(essayOut))}>
                      {copied ? t.copied : t.copy}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed bottom input bar (student chat only) */}
        {view === "student" && (
          <div className="bottom">
            <div className="inner">
              <div className="input-bar">
                <textarea
                  rows={1}
                  value={input}
                  maxLength={4000}
                  placeholder={t.inputPlaceholder}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendStudent();
                    }
                  }}
                />
                <button className="send" onClick={sendStudent} disabled={busy || !input.trim()}>
                  {t.send}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
