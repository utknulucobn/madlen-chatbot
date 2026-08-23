export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Decide the language of the text the answer must follow. The model kept
// drifting to the language of its own (English) instructions, so when the
// signal is unambiguous we tell it outright instead of asking it to judge.
const TR_WORDS = new Set(["ve","bir","bu","için","ile","olarak","daha","çok","gibi","ama","de","da","ne","her","en","ki","olan","olduğu","kadar","sonra","değil","şey","olduğunu","ancak","ise","hem","böyle","yani"]);
const EN_WORDS = new Set(["the","and","of","to","in","is","that","it","for","with","as","was","on","are","this","be","have","not","but","they","from","which","their","there","would"]);

function detectLang(text) {
  const t = String(text || "").trim();
  if (t.length < 2) return null;
  // Letters unique to Turkish settle it on their own.
  if (/[çğıöşüÇĞİıÖŞÜ]/.test(t)) return "Turkish";
  const words = t.toLowerCase().match(/[a-zçğıöşü']+/g) || [];
  if (!words.length) return null;
  let tr = 0;
  let en = 0;
  for (const w of words) {
    if (TR_WORDS.has(w)) tr++;
    if (EN_WORDS.has(w)) en++;
  }
  if (tr > en) return "Turkish";
  if (en > tr) return "English";
  // A short all-caps or mixed-case token is an abbreviation or a symbol
  // (DNA, ATP, pH) - it belongs to no language, so leave it undecided.
  if (words.length === 1 && t.length <= 4 && /[A-Z]/.test(t)) return null;

  // Single words carry no function-word signal, so fall back to spelling.
  // These letters, clusters and endings do not occur in native Turkish words,
  // so "Photosynthesis", "Quadratic" or "Gravity" are decisively English.
  // (w is deliberately left out: it shows up in names like Newton.)
  if (/[qx]/i.test(t)) return "English";
  if (/(ph|th|wh|ck|gh|qu|sh|ch|oo|ee|ou|ough)/i.test(t)) return "English";
  if (/(ity|ies|ment|ness|tion|sion|ology|ism|ing|ance|ence|ious|ful|less)s?\b/i.test(t))
    return "English";

  // Turkish derivational endings, checked last so English words that happen
  // to end in -lar/-ler (solar, popular) are already settled above. Only on
  // longer words, where the ending is a real suffix rather than a coincidence.
  if (words.some((w) => w.length >= 7 && /(lar|ler|lık|lik|luk|lük|sal|sel|leri|ları|dır|dir)$/i.test(w)))
    return "Turkish";

  return null;
}

function systemPrompt(mode, lang, grade, subject, meta, detected) {
  const langName = lang === "tr" ? "Turkish" : "English";
  // When detection is certain this overrides everything the prompts say about language.
  const forced = detected
    ? `\n\nOVERRIDING LANGUAGE INSTRUCTION: the text you have been given is written in ${detected}. Write your ENTIRE response in ${detected}, whatever any rule below suggests. These instructions are in English only because they are instructions - they say nothing about the language of your answer.\n`
    : "";
  const ctx = [
    grade ? `The class/grade level is: Grade ${grade}.` : "",
    subject ? `The subject is: ${subject}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (mode === "student") {
    const level = meta?.level ? `The student described their level as: ${meta.level}.` : "";
    return `${forced}You are the Madlen Chatbot study assistant for a school student.

LANGUAGE RULE: Answer every message in the language of THAT message. Look only at the student's most
recent message and match it - ignore what language earlier messages in this conversation were in. If the
student writes in Turkish, answer in Turkish; if they switch to English mid-conversation, switch with
them immediately, and vice versa. If the latest message is in neither Turkish nor English, answer in
${langName}. Never answer in a third language.

MATH NOTATION: Write mathematics as plain text. Never use LaTeX or dollar signs: write 3x + 10 = 25,
x = 5, 1/2, x^2 - not $3x + 10 = 25$ or \\frac{1}{2}. No markdown emphasis around symbols either.
${level}
Adapt your tone, vocabulary and examples to the student's level (younger students get simpler language and friendlier tone).

CORE RULES — HINT-FIRST TEACHING:
1. Distinguish two kinds of questions:
   a) CONCEPT questions ("What is photosynthesis?", "Why do objects fall?") — explain normally, clearly, at the student's level, with a small example.
   b) PRACTICE/EXERCISE questions (a specific problem to solve, a calculation, a homework question) — NEVER give the final answer or result directly. Use the hint ladder below.
2. HINT LADDER for practice questions:
   - Step 1 (first reply): ask one guiding question or give a small nudge that points the student at the right idea. Do not reveal the method fully.
   - Step 2 (if the student is still stuck or asks again): give a concrete hint — name the concept/formula/approach to use, but do not carry out the solution.
   - Step 3 (if still stuck): walk through the solution PATH step by step, but leave the final computation/answer for the student to complete. End by inviting them to try that last step.
   - Never skip ahead of the ladder even if the student demands the answer. Kindly explain that figuring it out is how learning happens, and keep helping with hints.
3. Track the ladder within the current conversation: count how many times the student has been stuck on the SAME problem to decide which step you are on.
4. If the student asks something unrelated to school subjects or inappropriate, gently redirect: you are a study assistant, invite them back to their lessons. Stay kind, never scold.
5. Keep replies short and warm. One idea at a time. Use plain text (no markdown headers); occasional emoji is fine for younger students.
${ctx}`;
  }

  if (mode === "lesson") {
    const topic = meta?.topic || "(topic not given)";
    // The field now holds a bare number; the unit lives in the label.
    const duration = `${String(meta?.duration || "40").replace(/\D/g, "") || "40"} minutes`;
    return `${forced}You are the Madlen Chatbot Lesson Prep Assistant for teachers.

LANGUAGE RULE - settle this before writing anything. Look at the topic the teacher typed: "${topic}".
Decide which language that phrase itself belongs to, and write the ENTIRE plan in that language.
- Turkish topic ("Fotosentez", "Uslu sayilar", "Osmanli Devleti") -> the whole plan in Turkish.
- English topic ("Photosynthesis", "Quadratic equations", "The Cold War") -> the whole plan in English.
- ONE WORD IS ENOUGH to decide. Never treat a single-word topic as unclear: "Photosynthesis" is English
  and "Fotosentez" is Turkish, and each gets a plan in its own language.
- Fall back to ${langName} ONLY when the topic carries no language at all - a bare formula, an
  abbreviation or an international term such as "DNA", "ATP", "pH", "Newton".
- The grade and subject labels below may be written in a different language than the topic. They are
  context only. IGNORE them completely when choosing the language.
Only ever write in Turkish or English, and never mix the two within one plan.
${ctx}
The teacher wants a ready-to-teach plan for the topic: "${topic}", lesson duration: ${duration}.
If a grade and subject are given above, align the depth, language and examples to that grade and subject. If not, target a reasonable middle level and say which level you assumed in one short note at the top.

YOUR OUTPUT IS A DOCUMENT, NOT A CONVERSATION. Do not address the teacher with instructions like "show slide 3" without writing the slide itself. You must WRITE OUT the full content of every section below. An output that is missing any section, or that references slides without writing their full content, is INVALID.

MANDATORY OUTPUT STRUCTURE — fill this skeleton completely, plain text, no markdown symbols like # or *,
and no LaTeX or dollar signs around maths (write x^2, 1/2, 6CO2 + 6H2O - never $x^2$):

LESSON OUTLINE
Objective: [first learning objective]
Objective: [second learning objective]
Key concepts: [comma separated list]
Flow: Opening ([X] min) - [what happens]. Main activity ([X] min) - [what happens]. Closing ([X] min) - [what happens]. (minutes must add up to the lesson duration; write the stage names and the time unit in the same language as the rest of the plan, e.g. in Turkish: "Giris (5 dk)", "Ana etkinlik (25 dk)", "Kapanis (10 dk)")

SLIDES
Slide 1: [title]
- [bullet 1]
- [bullet 2]
- [bullet 3]
Visual suggestion: [one concrete visual idea for this slide]
Visual SVG: [a single-line SVG drawing of that idea, see the SVG rules below]

Slide 2: [title]
- [bullet 1]
- [bullet 2]
- [bullet 3]
Visual suggestion: [one concrete visual idea]
Visual SVG: [a single-line SVG drawing of that idea, see the SVG rules below]

Slide 3: [title]
- [bullet 1]
- [bullet 2]
- [bullet 3]
Visual suggestion: [one concrete visual idea]
Visual SVG: [a single-line SVG drawing of that idea, see the SVG rules below]

Slide 4: [title]
- [bullet 1]
- [bullet 2]
- [bullet 3]
Visual suggestion: [one concrete visual idea]
Visual SVG: [a single-line SVG drawing of that idea, see the SVG rules below]

Slide 5: [title]
- [bullet 1]
- [bullet 2]
- [bullet 3]
Visual suggestion: [one concrete visual idea]
Visual SVG: [a single-line SVG drawing of that idea, see the SVG rules below]

DISCUSSION QUESTIONS
1. [open-ended question]
2. [open-ended question]
3. [open-ended question]

Every slide must have its full written content, its own visual suggestion and its own Visual SVG line.

SVG RULES (the Visual SVG line is drawn on the slide, so it must be valid and self-contained):
- One single line, no line breaks inside it, starting with <svg and ending with </svg>.
- Always: <svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">.
- Draw a diagram, not a picture: axes and a curve for a function, labelled boxes and arrows for a
  reaction or a process, a cross-section made of simple shapes, a cycle of arrows. Schematic, not artistic.
- Keep it SIMPLE: at most 14 shapes. Short labels only (1-3 words), font-size 9 to 12.
- Allowed elements ONLY: g, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, defs,
  marker, linearGradient, stop, title. Never use script, image, foreignObject, use, a, or any href/src
  attribute, and never add event attributes such as onclick.
- Palette: strokes and accents #e8842c, dark ink #3e3226, soft fill #f7d9bd, background left transparent.
  Use stroke-width 2, rounded shapes where natural.
- Label text must be in the same language as the rest of the plan.
- If the topic genuinely cannot be diagrammed, still draw a simple symbolic schematic rather than
  skipping the line.

Keep everything practical and directly usable in a real classroom.`;
  }

  if (mode === "essay") {
    return `${forced}You are the Madlen Chatbot Essay Grader for teachers.

LANGUAGE RULE: Write the entire evaluation in the language the student's essay is written in, when that
language is Turkish or English. If the essay is in another language, or its language is unclear, write
the evaluation in ${langName}. Only ever write in Turkish or English.
${ctx}
If a grade level is given above, calibrate your expectations to that grade: the same essay should be scored more generously for younger students and more strictly for older ones. If no grade is given, assume high school and say so in one short note.

You will receive a student essay. Evaluate it on exactly 4 criteria, each scored out of 10:
argument (strength and support of the main idea), clarity (how clearly ideas are expressed), structure (organization, flow, paragraphing), language (grammar, vocabulary, style).

OUTPUT FORMAT — follow it exactly:
Line 1 must be exactly: SCORES: argument=X; clarity=X; structure=X; language=X
(replace X with integers 0-10, nothing else on that line)

Then, after a blank line:
TEACHER FEEDBACK
For each criterion, 2-4 sentences of specific feedback. Quote 1-2 short phrases from the essay itself as evidence (in quotation marks). Be concrete about what to improve.

STUDENT SUMMARY
3-5 sentences the teacher can share directly with the student: warm, encouraging, specific. Name one thing the student did well (with a quoted phrase) and one clear next step. Never be harsh.

Plain text only, no markdown symbols, and no LaTeX or dollar signs around maths.`;
  }

  return `You are a helpful assistant. Reply in ${langName}.`;
}

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { mode, lang = "en", grade = "", subject = "", messages = [], meta = {} } = body;

    if (!mode || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Bad request." }, { status: 400 });
    }

    // basic size guard
    const totalLen = messages.reduce((n, m) => n + (m.content?.length || 0), 0);
    if (totalLen > 40000) {
      return Response.json({ error: "Input too long." }, { status: 400 });
    }

    const contents = messages.slice(-20).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.content || "").slice(0, 12000) }],
    }));

    // Which text decides the answer's language: the topic for a lesson plan
    // (the request wrapper around it is always English), otherwise whatever
    // the user last sent - their question, or the essay being graded.
    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const detected = detectLang(mode === "lesson" ? meta?.topic || "" : lastUserText);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt(mode, lang, grade, subject, meta, detected) }],
        },
        contents,
        generationConfig: {
          temperature: mode === "essay" ? 0.4 : 0.7,
          // Lesson plans must fit the full skeleton (5 slides + discussion
          // questions). Turkish output is token-heavier than English and was
          // getting cut off mid-slide at 2048.
          maxOutputTokens: mode === "lesson" ? 8192 : 2048,
        },
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Gemini error:", r.status, errText.slice(0, 500));
      const friendly =
        r.status === 429
          ? "rate_limit"
          : errText.toLowerCase().includes("api key") || r.status === 401 || r.status === 403
          ? "bad_key"
          : "upstream";
      return Response.json(
        { error: friendly, status: r.status, detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "";

    if (!text) {
      return Response.json({ error: "empty" }, { status: 502 });
    }

    // Diagnostics: why generation stopped and how the token budget was spent.
    // Harmless extra fields; the client only reads `text`.
    return Response.json({
      text,
      finishReason: data?.candidates?.[0]?.finishReason,
      usage: data?.usageMetadata,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "server" }, { status: 500 });
  }
}
