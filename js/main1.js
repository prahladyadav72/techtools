// payslip generator
/* LOADER */
window.addEventListener("load", ()=>{
document.getElementById("loader").style.display="none";
});
/* =====================
   INIT TABLES
===================== */
const earnTable = document.getElementById("earnTable");
const dedTable  = document.getElementById("dedTable");

const earnTotal = document.getElementById("earnTotal");
const dedTotal  = document.getElementById("dedTotal");
const netPay    = document.getElementById("netPay");

addEarn();
addDed();

/* =====================
   ADD ROWS
===================== */
function addEarn(){
  const r = earnTable.insertRow();
  r.innerHTML = `
    <td><input type="text"  value="Salary"></td>
    <td><input type="number" class="earn" value="0" oninput="calc()"></td>
    <td><button onclick="this.closest('tr').remove();calc()">−</button></td>`;
  calc();
}

function addDed(){
  const r = dedTable.insertRow();
  r.innerHTML = `
    <td><input type="text"  value="PF"></td>
    <td><input type="number" class="ded" value="0" oninput="calc()"></td>
    <td><button onclick="this.closest('tr').remove();calc()">−</button></td>`;
  calc();
}


/* =====================
   CALCULATION
===================== */
function calc(){
  let e = 0, d = 0;
  document.querySelectorAll(".earn").forEach(x => e += +x.value || 0);
  document.querySelectorAll(".ded").forEach(x => d += +x.value || 0);

  earnTotal.textContent = e.toFixed(2);
  dedTotal.textContent  = d.toFixed(2);
  netPay.textContent    = (e - d).toFixed(2);

  finalAmt.value = (e - d).toFixed(2);
}


/* =====================
   PDF (jsPDF ONLY)
===================== */
function savePDF(){

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","pt","a4");

  let y = 40;

  doc.setFontSize(16);
  doc.text(title.value || "Payslip", 300, y, {align:"center"});

  y += 20;
  doc.setFontSize(10);
  doc.text(company.value || "", 300, y, {align:"center"});
  y += 14;
  doc.text(address.value || "", 300, y, {align:"center"});

  y += 25;
  doc.setFontSize(11);
  doc.text("Pay Date: " + date.value, 40, y);
  doc.text("Employee: " + empName.value, 320, y);

  y += 14;
  doc.text("Working Days: " + days.value, 40, y);
  doc.text("Employee ID: " + empId.value, 320, y);

  y += 20;
  doc.line(40, y, 555, y);
  y += 15;

  // ---- TABLE CONFIG ----
  const x = 40;
  const rowH = 20;
  const c1 = 160, c2 = 90, c3 = 160, c4 = 90;

  // Header
  doc.text("Earnings", x+5, y+14);
  doc.text("Amount", x+c1+5, y+14);
  doc.text("Deductions", x+c1+c2+5, y+14);
  doc.text("Amount", x+c1+c2+c3+5, y+14);

  drawRow(y);
  y += rowH;

  const max = Math.max(earnTable.rows.length, dedTable.rows.length);

  for(let i=1;i<max;i++){
    const e = earnTable.rows[i]?.querySelectorAll("input");
    const d = dedTable.rows[i]?.querySelectorAll("input");

    doc.text(e?.[0]?.value||"", x+5, y+14);
    doc.text(e?.[1]?.value||"", x+c1+5, y+14);
    doc.text(d?.[0]?.value||"", x+c1+c2+5, y+14);
    doc.text(d?.[1]?.value||"", x+c1+c2+c3+5, y+14);

    drawRow(y);
    y += rowH;
  }

  y += 15;
  doc.setFontSize(12);
  doc.text("Net Pay : Rs. " + netPay.textContent, 40, y);

  doc.save("payslip.pdf");

  function drawRow(yPos){
    doc.line(x, yPos, x+c1+c2+c3+c4, yPos);
    doc.line(x, yPos+rowH, x+c1+c2+c3+c4, yPos+rowH);
    doc.line(x, yPos, x, yPos+rowH);
    doc.line(x+c1, yPos, x+c1, yPos+rowH);
    doc.line(x+c1+c2, yPos, x+c1+c2, yPos+rowH);
    doc.line(x+c1+c2+c3, yPos, x+c1+c2+c3, yPos+rowH);
    doc.line(x+c1+c2+c3+c4, yPos, x+c1+c2+c3+c4, yPos+rowH);
  }
}

/* =====================
   WORD EXPORT (SAFE)
===================== */
function saveWord(){ var content = "";
 content += "<h2 style='text-align:center;'>" + (title.value || "Payslip") + "</h2>"; content += "<p style='text-align:center;'><b>" + company.value + "</b><br>" + address.value + "</p>"; content += "<hr>"; content += "<p>"; content += "<b>Pay Date:</b> " + date.value + "<br>"; content += "<b>Working Days:</b> " + days.value + "<br>"; content += "<b>Employee Name:</b> " + empName.value + "<br>"; content += "<b>Employee ID:</b> " + empId.value; content += "</p>"; content += "<table border='1' cellpadding='6' cellspacing='0' width='100%'>"; content += "<tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr>"; var max = Math.max(earnTable.rows.length, dedTable.rows.length); for(var i=1;i<max;i++){ var e = earnTable.rows[i]?.querySelectorAll("input"); var d = dedTable.rows[i]?.querySelectorAll("input"); content += "<tr>"; content += "<td>" + (e?.[0]?.value || "") + "</td>"; content += "<td>" + (e?.[1]?.value || "") + "</td>"; content += "<td>" + (d?.[0]?.value || "") + "</td>"; content += "<td>" + (d?.[1]?.value || "") + "</td>"; content += "</tr>"; } content += "<tr>"; content += "<td><b>Total Earnings</b></td><td>" + earnTotal.textContent + "</td>"; content += "<td><b>Total Deductions</b></td><td>" + dedTotal.textContent + "</td>"; content += "</tr>"; content += "<tr>"; content += "<td colspan='3'><b>Net Pay</b></td><td><b>" + netPay.textContent + "</b></td>"; content += "</tr>"; content += "</table>"; content += "<p><b>Amount in Words:</b> " + words.value + "</p>"; var wordHTML = "<html>" + "<head><meta charset=\"UTF-8\"></head>" + "<body>" + content + "</body></html>"; var blob = new Blob([wordHTML], { type: "application/msword" }); var link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "payslip.doc"; link.click(); }
