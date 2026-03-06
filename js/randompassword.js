
/* ══════════════════════════════════════════════
   TechTools Password Generator
══════════════════════════════════════════════ */

/* State */
var length    = 12;
var quantity  = 1;
var opts = { upper: true, lower: true, numbers: true, symbols: true, ambiguous: false, spaces: false };
var lastPasswords = [];

/* Character sets */
var SETS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  spaces:  ' '
};
var AMBIGUOUS = '0O1lI';

/* ── Helpers ── */
function buildCharset() {
  var pool = '';
  if (opts.upper)   pool += SETS.upper;
  if (opts.lower)   pool += SETS.lower;
  if (opts.numbers) pool += SETS.numbers;
  if (opts.symbols) pool += SETS.symbols;
  if (opts.spaces)  pool += SETS.spaces;

  // Remove ambiguous
  if (opts.ambiguous) {
    pool = pool.split('').filter(function(c){ return AMBIGUOUS.indexOf(c) === -1; }).join('');
  }

  // Remove excluded chars
  var excl = document.getElementById('excludeInput').value;
  if (excl) {
    pool = pool.split('').filter(function(c){ return excl.indexOf(c) === -1; }).join('');
  }

  return pool;
}

function cryptoRandom(max) {
  var arr = new Uint32Array(1);
  var limit = Math.floor(0xFFFFFFFF / max) * max;
  do { window.crypto.getRandomValues(arr); } while (arr[0] >= limit);
  return arr[0] % max;
}

function generateOne() {
  var pool = buildCharset();
  if (!pool) return 'Select at least one character type!';

  var pwd = '';
  // Ensure at least one char from each active set
  var required = [];
  if (opts.upper)   required.push(pickFrom(opts.ambiguous ? SETS.upper.split('').filter(function(c){ return AMBIGUOUS.indexOf(c)===-1; }).join('') : SETS.upper));
  if (opts.lower)   required.push(pickFrom(opts.ambiguous ? SETS.lower.split('').filter(function(c){ return AMBIGUOUS.indexOf(c)===-1; }).join('') : SETS.lower));
  if (opts.numbers) required.push(pickFrom(opts.ambiguous ? SETS.numbers.split('').filter(function(c){ return AMBIGUOUS.indexOf(c)===-1; }).join('') : SETS.numbers));
  if (opts.symbols) required.push(pickFrom(SETS.symbols));

  // Fill rest
  var restLen = Math.max(0, length - required.length);
  for (var i = 0; i < restLen; i++) {
    pwd += pool[cryptoRandom(pool.length)];
  }

  // Combine and shuffle
  var all = (required.join('') + pwd).split('');
  for (var j = all.length - 1; j > 0; j--) {
    var k = cryptoRandom(j + 1);
    var tmp = all[j]; all[j] = all[k]; all[k] = tmp;
  }
  return all.join('');
}

function pickFrom(set) {
  if (!set || !set.length) return '';
  // remove excluded
  var excl = document.getElementById('excludeInput').value;
  var filtered = set.split('').filter(function(c){ return excl.indexOf(c) === -1; }).join('');
  if (!filtered) return '';
  return filtered[cryptoRandom(filtered.length)];
}

/* ── Strength ── */
function calcStrength(pwd) {
  if (!pwd || pwd.length < 4) return 0;
  var score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(5, score);
}

var STR_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
function updateStrength(pwd) {
  var s = calcStrength(pwd);
  var bar = document.getElementById('strengthBar');
  var lbl = document.getElementById('strengthLabel');
  bar.className = 'strength-bar str-' + s;
  lbl.className = 'strength-label str-lbl-' + s;
  lbl.textContent = STR_LABELS[s] || '—';
}

/* ── Color-code password chars ── */
function colorizePassword(pwd) {
  return pwd.split('').map(function(c) {
    if (/[A-Z]/.test(c)) return '<span class="char-upper">' + escHtml(c) + '</span>';
    if (/[a-z]/.test(c)) return '<span class="char-lower">' + escHtml(c) + '</span>';
    if (/[0-9]/.test(c)) return '<span class="char-num">' + escHtml(c) + '</span>';
    return '<span class="char-sym">' + escHtml(c) + '</span>';
  }).join('');
}
function escHtml(c) {
  return c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Generate ── */
function generateAll() {
  var passwords = [];
  for (var i = 0; i < quantity; i++) {
    passwords.push(generateOne());
  }
  lastPasswords = passwords;

  var display = document.getElementById('pwdDisplay');
  var bulk    = document.getElementById('bulkOutput');

  if (quantity === 1) {
    display.innerHTML = colorizePassword(passwords[0]);
    bulk.classList.remove('show');
    updateStrength(passwords[0]);
  } else {
    display.innerHTML = colorizePassword(passwords[0]) + '<span style="color:#475569;font-size:.7rem;display:block;margin-top:6px">' + quantity + ' passwords generated — see below</span>';
    var html = passwords.map(function(p, i) {
      return '<span><span class="pwd-num">' + (i+1) + '.</span>' + escHtml(p) + '</span>';
    }).join('');
    bulk.innerHTML = html;
    bulk.classList.add('show');
    updateStrength(passwords[0]);
  }
}

/* ── Copy ── */
function copyPassword() {
  if (!lastPasswords.length) return;
  var text = lastPasswords[0];
  navigator.clipboard.writeText(text).then(function() {
    showToast('✅ Password copied!', 'success');
    var display = document.getElementById('pwdDisplay');
    display.classList.add('copied-flash');
    document.getElementById('copyBtn').textContent = '✅';
    setTimeout(function() {
      display.classList.remove('copied-flash');
      document.getElementById('copyBtn').textContent = '📋';
    }, 1800);
  });
}

function copyAll() {
  if (!lastPasswords.length) { showToast('⚠️ Generate passwords first', 'warn'); return; }
  navigator.clipboard.writeText(lastPasswords.join('\n')).then(function() {
    showToast('✅ All ' + lastPasswords.length + ' passwords copied!', 'success');
  });
}

function downloadAll() {
  if (!lastPasswords.length) { showToast('⚠️ Generate passwords first', 'warn'); return; }
  var text = 'TechTools Password Generator\nGenerated: ' + new Date().toLocaleString() + '\nLength: ' + length + ' chars\n\n' + lastPasswords.join('\n');
  var blob = new Blob([text], { type: 'text/plain' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'techtools-passwords.txt';
  a.click();
  showToast('⬇ Downloaded!', 'success');
}

/* ── Length controls ── */
function onSliderChange(val) {
  length = parseInt(val);
  document.getElementById('lengthVal').textContent = length;
  updateQuickBtns();
  if (lastPasswords.length) generateAll();
}

function setLength(val) {
  length = val;
  document.getElementById('lengthSlider').value = val;
  document.getElementById('lengthVal').textContent = val;
  updateQuickBtns();
  generateAll();
}

function updateQuickBtns() {
  document.querySelectorAll('.ql-btn').forEach(function(btn) {
    btn.classList.toggle('active', parseInt(btn.textContent) === length);
  });
}

/* ── Option toggles ── */
function toggleOpt(key) {
  // Prevent unchecking all active types
  var active = ['upper','lower','numbers','symbols'].filter(function(k){ return opts[k]; });
  if (['upper','lower','numbers','symbols'].indexOf(key) !== -1 && active.length === 1 && opts[key]) {
    showToast('⚠️ At least one character type must be selected', 'warn');
    return;
  }
  opts[key] = !opts[key];
  var card = document.getElementById('opt-' + key);
  card.classList.toggle('active', opts[key]);
  card.setAttribute('aria-checked', String(opts[key]));
  if (lastPasswords.length) generateAll();
}

function onExcludeChange() {
  if (lastPasswords.length) generateAll();
}

/* ── Quantity ── */
function changeQty(delta) {
  quantity = Math.max(1, Math.min(50, quantity + delta));
  document.getElementById('qtyVal').textContent = quantity;
}

/* ── Toast ── */
function showToast(msg, type) {
  var old = document.getElementById('tt-toast');
  if (old) old.remove();
  var colors = { success:'#16a34a', warn:'#d97706', error:'#dc2626' };
  var t = document.createElement('div');
  t.id = 'tt-toast'; t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'28px', left:'50%',
    transform:'translateX(-50%)',
    background: colors[type] || '#2563eb',
    color:'#fff', padding:'12px 24px', borderRadius:'99px',
    fontFamily:"'Inter',sans-serif", fontSize:'.86rem',
    fontWeight:'700', zIndex:'9999',
    boxShadow:'0 8px 32px rgba(0,0,0,.2)',
    whiteSpace:'nowrap', maxWidth:'90vw',
    animation:'tt-toastIn .22s ease'
  });
  if (!document.getElementById('tt-kf')) {
    var s = document.createElement('style'); s.id = 'tt-kf';
    s.textContent = '@keyframes tt-toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){ if(t.parentNode)t.remove(); }, 320); }, 2600);
}

/* ── FAQ ── */
function toggleFaq(el) {
  var item = el.parentElement;
  document.querySelectorAll('.faq-item').forEach(function(i){ if(i!==item) i.classList.remove('open'); });
  item.classList.toggle('open');
}

/* ── Nav + Loader ── */
var hbg = document.getElementById('hbg');
var mobNav = document.getElementById('mobNav');
hbg.addEventListener('click', function() {
  var open = mobNav.classList.toggle('show');
  hbg.classList.toggle('open', open);
  hbg.setAttribute('aria-expanded', String(open));
});
window.addEventListener('load', function() {
  var l = document.getElementById('loader');
  if (l) { l.style.opacity='0'; setTimeout(function(){ l.remove(); }, 450); }
  // Auto-generate on load
  generateAll();
});

/* Keyboard: Space/Enter on opt-cards */
document.querySelectorAll('.opt-card').forEach(function(card) {
  card.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      card.click();
    }
  });
});

/* Click on password display to copy */
document.getElementById('pwdDisplay').addEventListener('click', function() {
  if (lastPasswords.length) copyPassword();
});
