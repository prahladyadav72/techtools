const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
let keywords = new Set();
let lastRenderedKeywords = [];

function fetchSuggest(q){
  return new Promise((resolve) => {
    const callback = "yt_" + Math.random().toString(36).slice(2);

    window[callback] = function(data){
      const suggestions = (data[1] || []).map(item => {
        // item can be string OR array
        return Array.isArray(item) ? item[0] : item;
      });

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


async function generate(){
  const base = document.getElementById("kw").value.trim();
  if(!base) return alert("Enter a keyword");

  keywords.clear();

  document.getElementById("result").innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border text-danger"></div>
      <div class="mt-2">Loading real YouTube keywords…</div>
    </div>
  `;

  (await fetchSuggest(base)).forEach(k => keywords.add(k));

  for(const ch of alphabet){
    const list = await fetchSuggest(base + " " + ch);
    list.forEach(k => keywords.add(k));
  }

  render([...keywords]);
}

function render(list){
  const box = document.getElementById("result");
  const limitSelect = document.getElementById("tagLimit");

  box.innerHTML = "";

  if(!Array.isArray(list) || list.length === 0){
    box.innerHTML = "<p>No keywords found</p>";
    lastRenderedKeywords = [];
    return;
  }

  const limitValue = limitSelect?.value || "500";
  let finalList = [];

  // CHARACTER LIMIT LOGIC
  if(limitValue !== "all"){
    const maxChars = parseInt(limitValue);
    let charCount = 0;

    for(const tag of list){
      const extra = tag.length + (finalList.length ? 2 : 0); // ", "
      if(charCount + extra > maxChars) break;

      finalList.push(tag);
      charCount += extra;
    }
  } else {
    finalList = [...list];
  }

  lastRenderedKeywords = finalList;

  finalList.forEach(k=>{
    const s = document.createElement("span");
    s.className = "tag";
    s.innerText = k;
    s.title = "Click to copy";
    s.onclick = () => navigator.clipboard.writeText(k);
    box.appendChild(s);
  });

  const countBox = document.getElementById("charCount");
if(countBox){
  countBox.innerText =
    limitValue === "all"
      ? `Characters: ${finalList.join(", ").length}`
      : `Characters: ${finalList.join(", ").length} / ${limitValue}`;
}

}


function copyAllTags(){
  if(lastRenderedKeywords.length === 0){
    alert("No tags to copy");
    return;
  }
  alert("tags to copy to clipbord");
  navigator.clipboard.writeText(lastRenderedKeywords.join(", "));
}

// 🔥 THIS MAKES TAG LIMIT WORK
document.getElementById("tagLimit")?.addEventListener("change", ()=>{
  render([...keywords]);
});
document.getElementById("kw").addEventListener("keydown",e=>{
  if(e.key==="Enter") generate();
});

