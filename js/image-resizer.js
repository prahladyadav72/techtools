const uploadInput = document.getElementById("upload");
const dropZone = document.getElementById("dropZone");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const lockBtn = document.getElementById("lockBtn");

let img = new Image();
let ratio = 1;
let locked = true;
let bgColor = "#fff";

/* Upload */
dropZone.onclick = () => uploadInput.click();

dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add("dragover"); };
dropZone.ondragleave = () => dropZone.classList.remove("dragover");
dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
};

uploadInput.onchange = e => handleFile(e.target.files[0]);

function handleFile(file){
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e=>{
    img.onload = ()=>{
      ratio = img.width / img.height;

      // SHOW PREVIEW
      const preview = document.getElementById("uploadPreview");
      const placeholder = document.getElementById("uploadPlaceholder");

      preview.src = e.target.result;
      preview.classList.remove("d-none");
      placeholder.style.display = "none";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


/* Lock */
lockBtn.onclick = ()=>{
  locked = !locked;
  lockBtn.textContent = locked ? "🔒" : "🔓";
};

widthInput.oninput = ()=>{
  if(locked) heightInput.value = Math.round(widthInput.value / ratio);
};
heightInput.oninput = ()=>{
  if(locked) widthInput.value = Math.round(heightInput.value * ratio);
};

/* Background */
document.querySelectorAll(".tt-bg-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".tt-bg-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    bgColor = btn.dataset.color;
  };
});

/* Resize */
function resizeImage(){
  if(!img.src) return alert("Select image first");

  const dpiVal = +document.getElementById("dpi").value || 72;
  let w = +widthInput.value;
  let h = +heightInput.value;

  if(unit.value==="percent"){
    w = img.width * w / 100;
    h = img.height * h / 100;
  } else if(unit.value==="cm"){
    w = w * dpiVal / 2.54;
    h = h * dpiVal / 2.54;
  } else if(unit.value==="in"){
    w = w * dpiVal;
    h = h * dpiVal;
  }

  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";


  if(format.value === "image/jpeg"){
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(img, 0, 0, w, h);

  const url = canvas.toDataURL(format.value, quality.value / 100);
  preview.src = url;
  download.href = url;

  new bootstrap.Modal(previewModal).show();
}
