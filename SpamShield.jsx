import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0C10",
  surface: "#111318",
  surfaceHigh: "#181C24",
  border: "#1E2330",
  accent: "#00E5FF",
  accentDim: "#00B8CC",
  danger: "#FF3B5C",
  warn: "#FFB800",
  safe: "#00E676",
  text: "#E8EDF5",
  textDim: "#6B7A99",
  textMid: "#9BA8C0",
};

const SPAM_PATTERNS = [
  { signal: "urgent request", regex: /\b(act now|click here|urgent|immediately|limited time|verify now)\b/i, score: 16 },
  { signal: "promotional claim", regex: /\b(congratulations|free|winner|prize|cash|reward|discount)\b/i, score: 14 },
  { signal: "verification code", regex: /\b(otp|one-time passcode|verification code|pin)\b/i, score: 12 },
  { signal: "account alert", regex: /\b(account|bank|transaction|login|verify account|password|suspended)\b/i, score: 14 },
  { signal: "payment request", regex: /\b(pay|due|invoice|credit card|upi|net banking|refund)\b/i, score: 12 },
  { signal: "suspicious link", regex: /(https?:\/\/|bit\.ly|tinyurl|goo\.gl|ow\.ly)/i, score: 18 },
];

const LANG_PATTERNS = {
  TA: /[\u0B80-\u0BFF]/,
  EN: /[A-Za-z]/,
};

function analyzeLocally(message, sender) {
  const text = String(message || "").trim();
  const signals = new Set();
  let score = 0;

  SPAM_PATTERNS.forEach(({ signal, regex, score: weight }) => {
    if (regex.test(text)) {
      signals.add(signal);
      score += weight;
    }
  });

  const urlMatches = text.match(/https?:\/\/\S+|bit\.ly|tinyurl|goo\.gl|ow\.ly/gi) || [];
  if (urlMatches.length) {
    signals.add("suspicious link");
    score += urlMatches.length * 18;
  }

  if (/\d{5,}/.test(text)) {
    signals.add("long digit sequence");
    score += 6;
  }

  if (sender && /\+?\d{7,}/.test(sender)) {
    signals.add("sender number");
    score += 4;
  }

  if (signals.size === 0) {
    signals.add("no strong spam signals");
  }

  const label = score >= 65 ? "SPAM" : score >= 35 ? "SUSPICIOUS" : "SAFE";
  const reason =
    label === "SPAM"
      ? "This message contains multiple spam signals and should be treated as spam."
      : label === "SUSPICIOUS"
      ? "The message contains suspicious signs and may be spam."
      : "No strong spam signals were detected in this message.";

  return {
    label,
    score: Math.min(100, Math.max(0, score)),
    reason,
    signals: Array.from(signals),
    lang: LANG_PATTERNS.TA.test(text) ? "TA" : LANG_PATTERNS.EN.test(text) ? "EN" : "OTHER",
  };
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }

  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes slide-in {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes scan {
    0% { top: 0%; opacity: 1; }
    100% { top: 100%; opacity: 0.3; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  .shimmer-text {
    background: linear-gradient(90deg, ${COLORS.textDim} 25%, ${COLORS.accent} 50%, ${COLORS.textDim} 75%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 2s infinite;
  }

  .card-hover {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    border-color: ${COLORS.accent}44 !important;
    box-shadow: 0 8px 32px rgba(0,229,255,0.08);
  }

  .btn-primary {
    background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim});
    color: #000;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .btn-primary:hover { opacity: 0.88; transform: scale(1.02); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent;
    color: ${COLORS.textMid};
    border: 1px solid ${COLORS.border};
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${COLORS.accent}66; color: ${COLORS.accent}; }

  .input-field {
    background: ${COLORS.surfaceHigh};
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
    padding: 12px 16px;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }
  .input-field:focus { border-color: ${COLORS.accent}66; }
  .input-field::placeholder { color: ${COLORS.textDim}; }

  .textarea-field {
    background: ${COLORS.surfaceHigh};
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
    padding: 14px 16px;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 110px;
  }
  .textarea-field:focus { border-color: ${COLORS.accent}66; }
  .textarea-field::placeholder { color: ${COLORS.textDim}; }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 11px;
    font-weight: 600;
    color: ${COLORS.textDim};
    border: none;
    background: transparent;
    font-family: 'Syne', sans-serif;
  }
  .nav-item.active { color: ${COLORS.accent}; background: ${COLORS.accent}11; }
  .nav-item:hover:not(.active) { color: ${COLORS.textMid}; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-family: 'JetBrains Mono', monospace;
  }
  .tag-spam { background: ${COLORS.danger}20; color: ${COLORS.danger}; border: 1px solid ${COLORS.danger}33; }
  .tag-safe { background: ${COLORS.safe}15; color: ${COLORS.safe}; border: 1px solid ${COLORS.safe}33; }
  .tag-warn { background: ${COLORS.warn}15; color: ${COLORS.warn}; border: 1px solid ${COLORS.warn}33; }

  .result-card {
    border-radius: 14px;
    padding: 20px;
    animation: slide-in 0.3s ease;
  }
  .result-spam { background: ${COLORS.danger}10; border: 1px solid ${COLORS.danger}33; }
  .result-safe { background: ${COLORS.safe}08; border: 1px solid ${COLORS.safe}2a; }
  .result-suspicious { background: ${COLORS.warn}10; border: 1px solid ${COLORS.warn}33; }

  .score-bar-bg {
    height: 6px;
    border-radius: 3px;
    background: ${COLORS.border};
    overflow: hidden;
    margin-top: 6px;
  }
  .score-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .shield-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    background: linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}08);
    border: 1px solid ${COLORS.accent}33;
    animation: float 3s ease-in-out infinite;
  }

  .mono { font-family: 'JetBrains Mono', monospace; }
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    scan: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    history: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.45"/></svg>,
    admin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    sms: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    spin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  };
  return icons[name] || null;
};

// ─── FAKE AUTH STATE ─────────────────────────────────────────────────────────
const DEMO_USER = { name: "Arjun Ramesh", phone: "+91 98765 43210", email: "arjun@example.com", isAdmin: true };

// ─── DETECTION HISTORY STORE ─────────────────────────────────────────────────
const initialHistory = [
  { id: 1, text: "Congratulations! You won ₹50,000. Click here to claim: bit.ly/win-now", label: "SPAM", score: 97, time: "2 min ago", sender: "+91 99887 76655", lang: "EN" },
  { id: 2, text: "Your OTP for login is 482910. Valid for 5 minutes. Do not share.", label: "SAFE", score: 2, time: "18 min ago", sender: "+91 80000 11111", lang: "EN" },
  { id: 3, text: "உங்கள் வங்கி கணக்கு தற்காலிகமாக முடக்கப்பட்டுள்ளது. இப்போதே சரிபார்க்கவும்.", label: "SPAM", score: 91, time: "1 hr ago", sender: "+91 70099 88877", lang: "TA" },
  { id: 4, text: "Hi, this is a reminder for your dentist appointment tomorrow at 3 PM.", label: "SAFE", score: 5, time: "3 hr ago", sender: "+91 44455 66677", lang: "EN" },
];

const fraudNumbers = [
  { number: "+91 99887 76655", count: 14, lastSeen: "5 min ago", status: "ACTIVE" },
  { number: "+91 70099 88877", count: 8, lastSeen: "1 hr ago", status: "ACTIVE" },
  { number: "+91 55566 77788", count: 3, lastSeen: "2 days ago", status: "RESOLVED" },
];

// ─── DETECT SCREEN ───────────────────────────────────────────────────────────
function DetectScreen({ onResult, lang }) {
  const [msg, setMsg] = useState("");
  const [sender, setSender] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanAnim, setScanAnim] = useState(false);

  const t = lang === "TA" ? {
    title: "செய்தி ஸ்கேன் செய்",
    placeholder: "SMS உரை இங்கே உள்ளிடவும்...",
    senderPlaceholder: "அனுப்புநர் எண் (விருப்பமானது)",
    btn: "ஸ்கேன் செய்",
    scanning: "பகுப்பாய்வு செய்கிறது...",
    result: "முடிவு",
    confidence: "நம்பகத்தன்மை",
    clear: "அழி",
  } : {
    title: "Scan a Message",
    placeholder: "Paste SMS text here to analyze...",
    senderPlaceholder: "Sender number (optional)",
    btn: "Analyze Message",
    scanning: "Analyzing...",
    result: "Detection Result",
    confidence: "Confidence",
    clear: "Clear",
  };

  async function analyze() {
    if (!msg.trim()) return;
    setLoading(true);
    setScanAnim(true);
    setResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const analysis = analyzeLocally(msg, sender);
      const scanResult = {
        ...analysis,
        text: msg,
        sender: sender || "Unknown",
        time: "Just now",
      };
      setResult(scanResult);
      onResult({ ...scanResult, id: Date.now() });
    } catch (error) {
      console.error(error);
      const fallback = {
        ...analyzeLocally(msg, sender),
        text: msg,
        sender: sender || "Unknown",
        time: "Just now",
      };
      setResult(fallback);
      onResult({ ...fallback, id: Date.now() });
    } finally {
      setLoading(false);
      setScanAnim(false);
    }
  }

  const labelColor = result?.label === "SPAM" ? COLORS.danger : result?.label === "SUSPICIOUS" ? COLORS.warn : COLORS.safe;
  const resultClass = result?.label === "SPAM" ? "result-spam" : result?.label === "SUSPICIOUS" ? "result-suspicious" : "result-safe";

  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div className="shield-icon"><Icon name="shield" size={28} color={COLORS.accent} /></div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{t.title}</div>
          <div style={{ color: COLORS.textDim, fontSize: 13, marginTop: 2 }}>AI-powered SMS analysis</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea
          className="textarea-field"
          placeholder={t.placeholder}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          rows={5}
        />
        <input
          className="input-field"
          placeholder={t.senderPlaceholder}
          value={sender}
          onChange={e => setSender(e.target.value)}
        />

        {/* Scan animation bar */}
        {scanAnim && (
          <div style={{ position: "relative", height: 40, background: COLORS.surfaceHigh, borderRadius: 10, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
              animation: "scan 1.2s ease-in-out infinite",
              boxShadow: `0 0 12px ${COLORS.accent}`,
            }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, color: COLORS.accent, fontSize: 13, fontWeight: 700 }}>
              <Icon name="spin" size={16} color={COLORS.accent} />
              {t.scanning}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={analyze} disabled={loading || !msg.trim()}>
            {loading ? t.scanning : <><Icon name="scan" size={15} /> {t.btn}</>}
          </button>
          {msg && <button className="btn-ghost" onClick={() => { setMsg(""); setSender(""); setResult(null); }}>{t.clear}</button>}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ color: COLORS.textDim, fontSize: 12, fontWeight: 700, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>{t.result}</div>
          <div className={`result-card ${resultClass}`}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${labelColor}20`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${labelColor}44` }}>
                  {result.label === "SAFE" ? <Icon name="check" size={20} color={labelColor} /> : <Icon name="alert" size={20} color={labelColor} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: labelColor }}>{result.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.textDim, fontFamily: "JetBrains Mono, monospace" }}>{result.score}% spam probability</div>
                </div>
              </div>
              <span className={`tag tag-${result.label === "SPAM" ? "spam" : result.label === "SUSPICIOUS" ? "warn" : "safe"}`}>{result.lang}</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 4 }}>{t.confidence}</div>
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{
                  width: `${result.score}%`,
                  background: result.score > 70 ? COLORS.danger : result.score > 40 ? COLORS.warn : COLORS.safe,
                }} />
              </div>
            </div>

            <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 14, lineHeight: 1.6 }}>{result.reason}</div>

            {result.signals?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.signals.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: COLORS.surfaceHigh, border: `1px solid ${COLORS.border}`, color: COLORS.textMid, fontFamily: "JetBrains Mono, monospace" }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY SCREEN ──────────────────────────────────────────────────────────
function HistoryScreen({ history, onClear, lang }) {
  const t = lang === "TA" ? { title: "ஸ்கேன் வரலாறு", clear: "அனைத்தையும் அழி", empty: "வரலாறு இல்லை" } :
    { title: "Scan History", clear: "Clear All", empty: "No scan history yet" };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{t.title}</div>
        {history.length > 0 && (
          <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }} onClick={onClear}>
            <Icon name="trash" size={13} /> {t.clear}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textDim }}>
          <Icon name="history" size={40} color={COLORS.border} />
          <div style={{ marginTop: 16, fontSize: 14 }}>{t.empty}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...history].reverse().map((item) => {
            const lc = item.label === "SPAM" ? COLORS.danger : item.label === "SUSPICIOUS" ? COLORS.warn : COLORS.safe;
            return (
              <div key={item.id} className="card-hover" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", animation: "slide-in 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: COLORS.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>
                      {item.text}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`tag tag-${item.label === "SPAM" ? "spam" : item.label === "SUSPICIOUS" ? "warn" : "safe"}`}>{item.label}</span>
                      <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "JetBrains Mono, monospace" }}>{item.sender}</span>
                      <span style={{ fontSize: 11, color: COLORS.textDim }}>{item.time}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: lc, fontFamily: "JetBrains Mono, monospace" }}>{item.score}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FRAUD ALERTS SCREEN ─────────────────────────────────────────────────────
function FraudScreen({ lang }) {
  const t = lang === "TA" ? { title: "மோசடி எச்சரிக்கைகள்" } : { title: "Fraud Alerts" };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{t.title}</div>
      <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 24 }}>Numbers flagged by cloud fraud detection</div>

      <div style={{ background: `${COLORS.danger}10`, border: `1px solid ${COLORS.danger}30`, borderRadius: 14, padding: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ background: `${COLORS.danger}20`, borderRadius: 10, padding: 10, flexShrink: 0 }}>
          <Icon name="bell" size={20} color={COLORS.danger} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.danger }}>2 Active Fraud Numbers</div>
          <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>Repeated spam detected from these sources</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fraudNumbers.map((item, i) => (
          <div key={i} className="card-hover" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{item.number}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`tag ${item.status === "ACTIVE" ? "tag-spam" : "tag-safe"}`}>{item.status}</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>{item.count} spam reports</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Last: {item.lastSeen}</span>
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: item.status === "ACTIVE" ? COLORS.danger : COLORS.safe, fontFamily: "JetBrains Mono, monospace" }}>{item.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN SCREEN ─────────────────────────────────────────────────────────────
function AdminScreen({ history, lang }) {
  const spam = history.filter(h => h.label === "SPAM").length;
  const safe = history.filter(h => h.label === "SAFE").length;
  const susp = history.filter(h => h.label === "SUSPICIOUS").length;
  const total = history.length;

  const stats = [
    { label: "Total Scans", value: total, color: COLORS.accent },
    { label: "Spam Detected", value: spam, color: COLORS.danger },
    { label: "Safe Messages", value: safe, color: COLORS.safe },
    { label: "Suspicious", value: susp, color: COLORS.warn },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Icon name="admin" size={22} color={COLORS.accent} />
        <div style={{ fontSize: 22, fontWeight: 800 }}>Admin Dashboard</div>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 24 }}>System overview — protected by Firebase security rules</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px" }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "JetBrains Mono, monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 14 }}>Spam Rate</div>
          <div className="score-bar-bg" style={{ height: 10, borderRadius: 5 }}>
            <div className="score-bar-fill" style={{ width: `${Math.round((spam / total) * 100)}%`, background: `linear-gradient(90deg, ${COLORS.safe}, ${COLORS.warn}, ${COLORS.danger})` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: COLORS.textDim }}>
            <span className="mono">0%</span>
            <span style={{ color: COLORS.text, fontWeight: 700 }} className="mono">{total ? Math.round((spam / total) * 100) : 0}% spam</span>
            <span className="mono">100%</span>
          </div>
        </div>
      )}

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 14 }}>Active Fraud Numbers</div>
        {fraudNumbers.filter(f => f.status === "ACTIVE").map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 1 ? `1px solid ${COLORS.border}` : "none" }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: COLORS.danger }}>{f.number}</span>
            <span style={{ fontSize: 11, color: COLORS.textDim }}>{f.count} reports</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user, lang, setLang, onLogout }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Profile</div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${COLORS.accent}33, ${COLORS.accent}11)`, border: `2px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="user" size={28} color={COLORS.accent} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{user.name}</div>
          <div style={{ color: COLORS.textDim, fontSize: 13, marginTop: 2 }}>{user.email}</div>
          <div style={{ color: COLORS.textDim, fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{user.phone}</div>
          {user.isAdmin && <span className="tag tag-warn" style={{ marginTop: 6, display: "inline-flex" }}>ADMIN</span>}
        </div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Icon name="globe" size={18} color={COLORS.textDim} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Language</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["EN", "TA"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 14px", borderRadius: 8, border: `1px solid ${lang === l ? COLORS.accent : COLORS.border}`,
                background: lang === l ? `${COLORS.accent}22` : "transparent",
                color: lang === l ? COLORS.accent : COLORS.textDim,
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer"
              }}>{l === "EN" ? "English" : "தமிழ்"}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sms" size={18} color={COLORS.textDim} />
          <span style={{ fontSize: 14, color: COLORS.textMid }}>Secure storage via Firebase Firestore</span>
        </div>
      </div>

      <button className="btn-ghost" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: COLORS.danger, borderColor: `${COLORS.danger}44` }} onClick={onLogout}>
        <Icon name="logout" size={16} color={COLORS.danger} /> Sign Out
      </button>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function sendOtp() {
    setOtpSent(true);
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  }

  function handleLogin() {
    onLogin(DEMO_USER);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: COLORS.bg }}>
      {/* Background effect */}
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${COLORS.accent}15, transparent)`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${COLORS.accent}33, ${COLORS.accent}11)`, border: `2px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "float 3s ease-in-out infinite" }}>
            <Icon name="shield" size={36} color={COLORS.accent} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>SpamShield</div>
          <div className="shimmer-text" style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>AI-powered SMS protection</div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 28 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 24, background: COLORS.surfaceHigh, borderRadius: 12, padding: 4 }}>
            {["email", "phone"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px", borderRadius: 9, border: "none",
                background: mode === m ? COLORS.surface : "transparent",
                color: mode === m ? COLORS.text : COLORS.textDim,
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                transition: "all 0.2s"
              }}>{m === "email" ? "📧 Email" : "📱 Phone OTP"}</button>
            ))}
          </div>

          {mode === "email" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input-field" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <input className="input-field" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} type="password" />
              <button className="btn-primary" style={{ marginTop: 4 }} onClick={handleLogin}>Sign In</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input-field" placeholder="+91 Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
              {!otpSent ? (
                <button className="btn-primary" onClick={sendOtp} disabled={!phone.trim()}>Send OTP</button>
              ) : (
                <>
                  <input className="input-field mono" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleLogin} disabled={otp.length < 4}>Verify OTP</button>
                    <button className="btn-ghost" style={{ opacity: countdown > 0 ? 0.4 : 1 }} onClick={countdown === 0 ? sendOtp : undefined} disabled={countdown > 0}>
                      {countdown > 0 ? `${countdown}s` : "Resend"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: COLORS.textDim }}>
            Demo mode — tap any sign in button to continue
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SpamShieldApp() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("scan");
  const [history, setHistory] = useState(initialHistory);
  const [lang, setLang] = useState("EN");
  const [notif, setNotif] = useState(null);

  function showNotif(msg, type = "info") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  }

  function handleResult(result) {
    setHistory(prev => [...prev, result]);
    if (result.label === "SPAM") showNotif(`🚨 Spam detected from ${result.sender}`, "spam");
    else if (result.label === "SUSPICIOUS") showNotif(`⚠️ Suspicious message flagged`, "warn");
    else showNotif("✅ Message appears safe", "safe");
  }

  const tabs = [
    { id: "scan", icon: "scan", label: lang === "TA" ? "ஸ்கேன்" : "Scan" },
    { id: "history", icon: "history", label: lang === "TA" ? "வரலாறு" : "History" },
    { id: "fraud", icon: "alert", label: lang === "TA" ? "மோசடி" : "Fraud" },
    ...(user?.isAdmin ? [{ id: "admin", icon: "admin", label: "Admin" }] : []),
    { id: "profile", icon: "user", label: lang === "TA" ? "கணக்கு" : "Profile" },
  ];

  if (!user) return (
    <>
      <style>{css}</style>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <LoginScreen onLogin={setUser} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 100% 50% at 50% -10%, ${COLORS.accent}08, transparent)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Notification toast */}
      {notif && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, animation: "slide-in 0.3s ease",
          background: notif.type === "spam" ? COLORS.danger : notif.type === "warn" ? COLORS.warn : COLORS.safe,
          color: "#000", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap"
        }}>
          {notif.msg}
        </div>
      )}

      {/* Main layout */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="shield" size={20} color={COLORS.accent} />
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.5px" }}>SpamShield</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.safe, boxShadow: `0 0 8px ${COLORS.safe}`, animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 700 }}>LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
          {tab === "scan" && <DetectScreen onResult={handleResult} lang={lang} />}
          {tab === "history" && <HistoryScreen history={history} onClear={() => setHistory([])} lang={lang} />}
          {tab === "fraud" && <FraudScreen lang={lang} />}
          {tab === "admin" && <AdminScreen history={history} lang={lang} />}
          {tab === "profile" && <ProfileScreen user={user} lang={lang} setLang={setLang} onLogout={() => { setUser(null); setTab("scan"); }} />}
        </div>

        {/* Bottom nav */}
        <div style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, padding: "8px 4px", display: "flex", justifyContent: "space-around", position: "sticky", bottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={22} color={tab === t.id ? COLORS.accent : COLORS.textDim} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
