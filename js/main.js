


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



let qrType="url";
let qr;


const sizeSlider=document.getElementById("qrSize");
const sizeLabel=document.getElementById("sizeLabel");

sizeSlider.oninput=()=>{
    sizeLabel.innerText=sizeSlider.value;
};


function selectType(type,btn){

    qrType=type;

    document.querySelectorAll(".option-btn")
    .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    hideAll();

    if(type==="url"||type==="text"){

        textBox.classList.remove("hidden");

        mainLabel.innerText=
        type==="url"?"Website URL":"Enter Text";

    }

    if(type==="wifi") wifiBox.classList.remove("hidden");
    if(type==="email") emailBox.classList.remove("hidden");
    if(type==="sms") smsBox.classList.remove("hidden");
}


function hideAll(){

    textBox.classList.add("hidden");
    wifiBox.classList.add("hidden");
    emailBox.classList.add("hidden");
    smsBox.classList.add("hidden");
}


function generateQR(){

    let text="";


    if(qrType==="url"||qrType==="text"){
        text=mainInput.value;
    }


    if(qrType==="wifi"){
        text=`WIFI:T:${wifiType.value};S:${wifiName.value};P:${wifiPass.value};;`;
    }


    if(qrType==="email"){
        text=`mailto:${emailTo.value}?subject=${encodeURIComponent(emailSub.value)}&body=${encodeURIComponent(emailMsg.value)}`;
    }


    if(qrType==="sms"){
        text=`sms:${smsNum.value}?body=${encodeURIComponent(smsMsg.value)}`;
    }


    if(text.trim()===""){
        alert("Please fill details");
        return;
    }


    qrcode.innerHTML="";


    qr=new QRCode("qrcode",{

        text:text,

        width:qrSize.value,

        height:qrSize.value,

        colorDark:qrColor.value,

        colorLight:bgColor.value,

        correctLevel:QRCode.CorrectLevel.H
    });
}


function downloadQR(){

    const box = document.getElementById("qr"); // Full card

    html2canvas(box,{
        backgroundColor: null, // keep CSS bg
        scale: 2 // HD quality
    }).then(canvas=>{

        const a = document.createElement("a");

        a.href = canvas.toDataURL("image/png");
        a.download = "qrcode.png";

        a.click();
    });
}



function clearQR(){

    qrcode.innerHTML="";

    document.querySelectorAll("input,textarea")
    .forEach(i=>i.value="");
}


