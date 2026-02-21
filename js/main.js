


/* SEARCH + PAGINATION */

let allTools = [];
let filteredTools = [];
let currentPage = 1;
const perPage = 12;


document.addEventListener("DOMContentLoaded", ()=>{

// Check if tools loaded
if(typeof tools === "undefined"){
console.error("tools-data.js not loaded!");
return;
}

// Init data
allTools = tools;
filteredTools = tools;

// First render
render();

// Search event
document.getElementById("searchTool")
.addEventListener("input", searchTools);

});


/* MAIN RENDER */
function render(){

let start = (currentPage - 1) * perPage;
let end = start + perPage;

let pageTools = filteredTools.slice(start, end);

renderTools(pageTools);
renderPagination();

}


/* SHOW TOOLS */
function renderTools(list){

let box = document.getElementById("toolsArea");

if(list.length === 0){

box.innerHTML = `
<div class="col-12 text-center text-muted mt-4">
No tools found 😔
</div>`;
return;
}

let html = "";

list.forEach(t=>{

html += `

<div class="col-lg-3 col-md-4 col-sm-6">

<div class="tool-card">

<h5>${t.name}</h5>

<p>${t.desc}</p>

<a href="${t.link}" class="btn btn-primary btn-sm">
Use Tool
</a>

</div>

</div>

`;

});

box.innerHTML = html;

}


/* PAGINATION (AUTO HIDE IF <=12) */
function renderPagination(){

let totalPages = Math.ceil(filteredTools.length / perPage);

let box = document.getElementById("pagination");

// Hide if only 1 page
if(totalPages <= 1){
box.innerHTML = "";
return;
}

let html = "";

for(let i = 1; i <= totalPages; i++){

html += `

<li class="page-item ${i===currentPage?'active':''}">
<a class="page-link" href="javascript:void(0)" onclick="goPage(${i})">${i}</a>
</li>

`;

}

box.innerHTML = html;

}


/* CHANGE PAGE */
function goPage(page){

currentPage = page;

render();

window.scrollTo({
top:250,
behavior:"smooth"
});

}


/* SEARCH */
function searchTools(){

let key = this.value.toLowerCase().trim();

filteredTools = allTools.filter(t=>{

return t.name.toLowerCase().includes(key) ||
t.desc.toLowerCase().includes(key);

});

currentPage = 1;

render();

}

// qr code generator


// qr code generator

/* ═══════════════════════════════════════════
   TechTools QR Code Generator — main.js
═══════════════════════════════════════════ */

let qrType = "url";
let qrInstance = null;

/* ─────────────────────────────────────────
   SIZE SLIDER
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {

  const sizeSlider = document.getElementById("qrSize");
  const sizeLabel  = document.getElementById("sizeLabel");

  if (sizeSlider && sizeLabel) {
    sizeSlider.addEventListener("input", function () {
      sizeLabel.textContent = sizeSlider.value;
    });
  }

  // Keyboard: Enter on inputs triggers generate
  document.querySelectorAll("input, textarea").forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) generateQR();
    });
  });

});

/* ─────────────────────────────────────────
   TYPE SELECTOR
───────────────────────────────────────── */
function selectType(type, btn) {
  qrType = type;

  document.querySelectorAll(".option-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");

  hideAll();

  if (type === "url" || type === "text") {
    document.getElementById("textBox").classList.remove("hidden");
    document.getElementById("mainLabel").textContent =
      type === "url" ? "Website URL" : "Enter Text";
    document.getElementById("mainInput").placeholder =
      type === "url" ? "https://example.com" : "Enter any text…";
  }

  if (type === "wifi")  document.getElementById("wifiBox").classList.remove("hidden");
  if (type === "email") document.getElementById("emailBox").classList.remove("hidden");
  if (type === "sms")   document.getElementById("smsBox").classList.remove("hidden");

  clearQR(true);
}

function hideAll() {
  ["textBox", "wifiBox", "emailBox", "smsBox"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

/* ─────────────────────────────────────────
   BUILD QR TEXT from inputs
───────────────────────────────────────── */
function buildQRText() {
  if (qrType === "url" || qrType === "text") {
    return document.getElementById("mainInput").value.trim();
  }

  if (qrType === "wifi") {
    const ssid = document.getElementById("wifiName").value.trim();
    const pass = document.getElementById("wifiPass").value.trim();
    const sec  = document.getElementById("wifiType").value;
    if (!ssid) { showToast("⚠️ Please enter the WiFi network name (SSID)", "warn"); return null; }
    return "WIFI:T:" + sec + ";S:" + ssid + ";P:" + pass + ";;";
  }

  if (qrType === "email") {
    const to  = document.getElementById("emailTo").value.trim();
    const sub = document.getElementById("emailSub").value.trim();
    const msg = document.getElementById("emailMsg").value.trim();
    if (!to) { showToast("⚠️ Please enter an email address", "warn"); return null; }
    return "mailto:" + to + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(msg);
  }

  if (qrType === "sms") {
    const num = document.getElementById("smsNum").value.trim();
    const msg = document.getElementById("smsMsg").value.trim();
    if (!num) { showToast("⚠️ Please enter a phone number", "warn"); return null; }
    return "sms:" + num + "?body=" + encodeURIComponent(msg);
  }

  return null;
}

/* ─────────────────────────────────────────
   RENDER LABEL below QR
───────────────────────────────────────── */
function renderLabel() {
  // Remove any existing label
  var old = document.getElementById("qr-label");
  if (old) old.remove();

  var labelText = (document.getElementById("qrLabel").value || "").trim();
  if (!labelText) return;

  var labelEl = document.createElement("div");
  labelEl.id = "qr-label";
  labelEl.textContent = labelText;

  Object.assign(labelEl.style, {
    width:          "100%",
    background:     "#ffffff",
    textAlign:      "center",
    padding:        "10px 16px",
    fontSize:       ".84rem",
    fontWeight:     "700",
    color:          "#111827",
    fontFamily:     "'Inter', sans-serif",
    letterSpacing:  "-.01em",
    lineHeight:     "1.4",
    borderTop:      "1px solid #e5e7eb",
    boxSizing:      "border-box"
  });

  document.getElementById("qr").appendChild(labelEl);
}

/* ─────────────────────────────────────────
   GENERATE QR
───────────────────────────────────────── */
function generateQR() {
  const text = buildQRText();

  if (text === null) return;

  if (!text) {
    showToast("⚠️ Please fill in the required details", "warn");
    return;
  }

  const size       = parseInt(document.getElementById("qrSize").value) || 256;
  const colorDark  = document.getElementById("qrColor").value || "#000000";
  const colorLight = document.getElementById("bgColor").value || "#ffffff";

  const qrContainer = document.getElementById("qrcode");

  // Clear previous
  qrContainer.innerHTML = "";
  if (qrInstance) {
    try { qrInstance.clear(); } catch(e) {}
    qrInstance = null;
  }

  // Remove old label
  var oldLabel = document.getElementById("qr-label");
  if (oldLabel) oldLabel.remove();

  try {
    qrInstance = new QRCode("qrcode", {
      text:         text,
      width:        size,
      height:       size,
      colorDark:    colorDark,
      colorLight:   colorLight,
      correctLevel: QRCode.CorrectLevel.H
    });

    // Render label after a short delay so QR canvas is ready
    setTimeout(renderLabel, 80);

    showToast("✅ QR code generated!", "success");

    if (window.innerWidth < 820) {
      document.getElementById("qr").scrollIntoView({ behavior: "smooth", block: "center" });
    }

  } catch (err) {
    showToast("❌ Failed to generate QR. Try shorter input.", "error");
    console.error("QR Error:", err);
  }
}

/* ─────────────────────────────────────────
   DOWNLOAD QR as PNG
   Always uses html2canvas so label is included
───────────────────────────────────────── */
function downloadQR() {
  const qrContainer = document.getElementById("qrcode");
  const canvas      = qrContainer.querySelector("canvas");
  const img         = qrContainer.querySelector("img");
  const labelEl     = document.getElementById("qr-label");

  if (!canvas && !img) {
    showToast("⚠️ Please generate a QR code first", "warn");
    return;
  }

  // If no label present — direct canvas download (faster, no html2canvas needed)
  if (!labelEl && canvas) {
    const a    = document.createElement("a");
    a.href     = canvas.toDataURL("image/png");
    a.download = "techtools-qrcode.png";
    a.click();
    showToast("✅ QR code downloaded!", "success");
    return;
  }

  // With label — capture full #qr div via html2canvas so label is baked in
  if (typeof html2canvas !== "undefined") {
    const box = document.getElementById("qr");
    html2canvas(box, {
      backgroundColor: "#ffffff",
      scale:           2,
      useCORS:         true,
      logging:         false
    }).then(function (c) {
      const a    = document.createElement("a");
      a.href     = c.toDataURL("image/png");
      a.download = "techtools-qrcode.png";
      a.click();
      showToast("✅ QR code downloaded!", "success");
    });
    return;
  }

  // Last resort — img src
  if (img) {
    const a    = document.createElement("a");
    a.href     = img.src;
    a.download = "techtools-qrcode.png";
    a.click();
  }
}

/* ─────────────────────────────────────────
   CLEAR
───────────────────────────────────────── */
function clearQR(silent) {
  const qrContainer = document.getElementById("qrcode");

  if (qrInstance) {
    try { qrInstance.clear(); } catch(e) {}
    qrInstance = null;
  }

  // Remove label
  var labelEl = document.getElementById("qr-label");
  if (labelEl) labelEl.remove();

  // Restore placeholder
  qrContainer.innerHTML = `
    <div class="qr-empty">
      <span class="qr-empty-icon">📱</span>
      <span>Your QR code<br>will appear here</span>
    </div>`;

  // Clear all inputs
  document.querySelectorAll(
    "#textBox input, #wifiBox input, #emailBox input, #emailBox textarea, #smsBox input, #smsBox textarea"
  ).forEach(function (el) { el.value = ""; });

  if (!silent) showToast("🗑 Cleared", "info");
}

/* ─────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────── */
function showToast(msg, type) {
  var old = document.getElementById("tt-toast");
  if (old) old.remove();

  var colors = {
    success: "#16a34a",
    warn:    "#d97706",
    error:   "#dc2626",
    info:    "#6b7280"
  };

  var toast = document.createElement("div");
  toast.id = "tt-toast";
  toast.textContent = msg;

  Object.assign(toast.style, {
    position:     "fixed",
    bottom:       "28px",
    left:         "50%",
    transform:    "translateX(-50%)",
    background:   colors[type] || colors.info,
    color:        "#fff",
    padding:      "12px 24px",
    borderRadius: "99px",
    fontFamily:   "'Inter', sans-serif",
    fontSize:     ".86rem",
    fontWeight:   "700",
    zIndex:       "9999",
    boxShadow:    "0 8px 32px rgba(0,0,0,.2)",
    whiteSpace:   "nowrap",
    maxWidth:     "90vw",
    textAlign:    "center",
    transition:   "opacity .3s",
    animation:    "tt-toastIn .22s ease"
  });

  if (!document.getElementById("tt-toast-kf")) {
    var s = document.createElement("style");
    s.id = "tt-toast-kf";
    s.textContent = "@keyframes tt-toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}";
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);

  setTimeout(function () {
    toast.style.opacity = "0";
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
  }, 2600);
}



