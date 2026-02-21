const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
let keywords = new Set();
let lastRenderedKeywords = [];

/* ─────────────────────────────────────────
   FETCH YouTube autocomplete suggestions
───────────────────────────────────────── */
function fetchSuggest(q) {
  return new Promise((resolve) => {
    const callback = "yt_" + Math.random().toString(36).slice(2);

    window[callback] = function (data) {
      const suggestions = (data[1] || []).map(item =>
        Array.isArray(item) ? item[0] : item
      );
      resolve(suggestions);
      delete window[callback];
      script.remove();
    };

    const script = document.createElement("script");
    script.src =
      "https://suggestqueries.google.com/complete/search" +
      "?client=youtube&ds=yt" +
      "&callback=" + callback +
      "&q=" + encodeURIComponent(q);

    script.onerror = () => {
      resolve([]);
      delete window[callback];
      script.remove();
    };

    document.body.appendChild(script);
  });
}

/* ─────────────────────────────────────────
   GENERATE — fetch + render
───────────────────────────────────────── */
async function generate() {
  const base = document.getElementById("kw").value.trim();
  if (!base) {
    showToast("⚠️ Please enter a keyword first", "warn");
    return;
  }

  keywords.clear();
  lastRenderedKeywords = [];

  // Show animated loading state
  document.getElementById("result").innerHTML = `
    <div style="text-align:center;padding:32px 20px">
      <div class="tt-spinner"></div>
      <p style="margin-top:14px;font-size:.88rem;color:var(--sub);font-weight:600">
        Fetching real YouTube keywords…
      </p>
    </div>
  `;

  // Update counts while loading
  setCountDisplay("", "");

  // Base keyword suggestions
  (await fetchSuggest(base)).forEach(k => keywords.add(k));

  // Alphabet expansion A–Z + 0–9
  for (const ch of alphabet) {
    const list = await fetchSuggest(base + " " + ch);
    list.forEach(k => keywords.add(k));
  }

  render([...keywords]);
}

/* ─────────────────────────────────────────
   RENDER — display tag chips
───────────────────────────────────────── */
function render(list) {
  const box         = document.getElementById("result");
  const limitSelect = document.getElementById("tagLimit");

  box.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    box.innerHTML = `
      <div style="text-align:center;padding:28px;color:var(--sub);font-size:.88rem">
        😕 No keywords found. Try a different keyword.
      </div>`;
    lastRenderedKeywords = [];
    setCountDisplay("", "");
    return;
  }

  const limitValue = limitSelect?.value || "500";
  let finalList = [];

  // Character limit logic
  if (limitValue !== "all") {
    const maxChars = parseInt(limitValue);
    let charCount  = 0;

    for (const tag of list) {
      const extra = tag.length + (finalList.length ? 2 : 0); // ", " separator
      if (charCount + extra > maxChars) break;
      finalList.push(tag);
      charCount += extra;
    }
  } else {
    finalList = [...list];
  }

  lastRenderedKeywords = finalList;

  // Render tag chips
  const fragment = document.createDocumentFragment();

  finalList.forEach(k => {
    const chip = document.createElement("span");
    chip.className   = "tag-chip";
    chip.textContent = k;
    chip.title       = "Click to copy this tag";

    chip.addEventListener("click", function () {
      navigator.clipboard.writeText(k).then(() => {
        chip.classList.add("copied");
        chip.textContent = "✓ " + k;
        setTimeout(() => {
          chip.classList.remove("copied");
          chip.textContent = k;
        }, 1400);
      });
    });

    fragment.appendChild(chip);
  });

  box.appendChild(fragment);

  // Update character + tag count display
  const usedChars  = finalList.join(", ").length;
  const totalTags  = finalList.length;
  const charLabel  = limitValue === "all"
    ? `${usedChars} chars`
    : `${usedChars} / ${limitValue} chars`;

  setCountDisplay(charLabel, `${totalTags} tags`);
}

/* ─────────────────────────────────────────
   COPY ALL TAGS
───────────────────────────────────────── */
function copyAllTags() {
  if (lastRenderedKeywords.length === 0) {
    showToast("⚠️ No tags to copy. Generate tags first.", "warn");
    return;
  }

  navigator.clipboard.writeText(lastRenderedKeywords.join(", "))
    .then(() => {
      showToast("✅ " + lastRenderedKeywords.length + " tags copied to clipboard!", "success");
    })
    .catch(() => {
      // Fallback for browsers that block clipboard
      const ta = document.createElement("textarea");
      ta.value = lastRenderedKeywords.join(", ");
      ta.style.position = "fixed";
      ta.style.opacity  = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("✅ Tags copied!", "success");
    });
}

/* ─────────────────────────────────────────
   APPLY LIMIT  (called on select change)
───────────────────────────────────────── */
function applyLimit() {
  if (keywords.size > 0) {
    render([...keywords]);
  }
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function setCountDisplay(charText, tagText) {
  const charEl  = document.getElementById("charCount");
  const totalEl = document.getElementById("totalCount");
  if (charEl)  charEl.textContent  = charText;
  if (totalEl) totalEl.textContent = tagText;
}

function showToast(msg, type) {
  // Remove existing toast
  const old = document.getElementById("tt-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "tt-toast";
  toast.textContent = msg;

  const bg = type === "success" ? "#16a34a" : type === "warn" ? "#d97706" : "#2563eb";

  Object.assign(toast.style, {
    position:     "fixed",
    bottom:       "28px",
    left:         "50%",
    transform:    "translateX(-50%)",
    background:   bg,
    color:        "#fff",
    padding:      "12px 24px",
    borderRadius: "99px",
    fontFamily:   "'Inter', sans-serif",
    fontSize:     ".86rem",
    fontWeight:   "700",
    zIndex:       "9999",
    boxShadow:    "0 8px 32px rgba(0,0,0,.2)",
    animation:    "tt-toastIn .25s ease",
    whiteSpace:   "nowrap",
    maxWidth:     "90vw",
    textAlign:    "center",
  });

  // Inject keyframes once
  if (!document.getElementById("tt-toast-style")) {
    const s = document.createElement("style");
    s.id = "tt-toast-style";
    s.textContent = `
      @keyframes tt-toastIn {
        from { opacity:0; transform:translateX(-50%) translateY(12px); }
        to   { opacity:1; transform:translateX(-50%) translateY(0); }
      }
      .tag-chip.copied {
        background: #dcfce7 !important;
        color: #16a34a !important;
        border-color: #86efac !important;
      }
      .tt-spinner {
        width: 36px; height: 36px;
        border: 3px solid rgba(37,99,235,.15);
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: tt-spin .7s linear infinite;
        margin: 0 auto;
      }
      @keyframes tt-spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .3s";
    setTimeout(() => toast.remove(), 320);
  }, 2800);
}

/* ─────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  // Tag limit change
  document.getElementById("tagLimit")?.addEventListener("change", applyLimit);

  // Enter key on input
  document.getElementById("kw")?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") generate();
  });
});