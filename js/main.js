

/* LOADER */
window.addEventListener("load", ()=>{
document.getElementById("loader").style.display="none";
});


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

