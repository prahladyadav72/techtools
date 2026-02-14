window.addEventListener("load", ()=>{
document.getElementById("loader").style.display="none";
});
const platformLimits = {
  youtube: 15,
  shorts: 7,
  instagram: 20,
  reels: 15,
  tiktok: 10,
  twitter: 5
};

// Neutral autocomplete suffixes (text-based)
const suffixes = [
  "video","shorts","status","lyrics",
  "edit","reel","clip","trend"
];

function generate() {
  const input = document.getElementById("keyword").value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g,"");

  if (!input) {
    alert("Please enter a keyword");
    return;
  }

  const platform = document.getElementById("platform").value;
  const limit = platformLimits[platform];

  const words = input.split(/\s+/);
  let tags = [];

  // Exact phrase
  tags.push("#" + words.join(""));
  tags.push("#" + words.join("_"));

  // Autocomplete expansions (FROM TEXT ONLY)
  suffixes.forEach(s => {
    let phrase = input + " " + s;
    tags.push("#" + phrase.replace(/\s+/g,""));
    tags.push("#" + phrase.replace(/\s+/g,"_"));
  });

  // Individual words
  words.forEach(w => tags.push("#" + w));

  // Platform system tags (minimal & correct)
  if (platform === "shorts") tags.push("#ytshorts","#shorts");
  if (platform === "reels") tags.push("#reels","#instagramreels");
  if (platform === "tiktok") tags.push("#tiktok","#fyp");
  if (platform === "twitter") tags.push("#twitter");

  // Remove duplicates & apply limit
  tags = [...new Set(tags)].slice(0, limit);

  render(tags);
}

function render(tags){
  const result = document.getElementById("result");
  const finalBox = document.getElementById("finalTags");
  const info = document.getElementById("info");

  result.innerHTML = "";

  tags.forEach(tag => {
    const span = document.createElement("span");
   span.className = "tt-hg-tag";
    span.innerText = tag;
    result.appendChild(span);
  });

  finalBox.value = tags.join(" ");
  info.innerText = "Total hashtags: " + tags.length +
                   " | Characters: " + tags.join(" ").length;
}

function copyTags(){
  const t = document.getElementById("finalTags");
  t.select();
  document.execCommand("copy");
  alert("Hashtags copied!");
}