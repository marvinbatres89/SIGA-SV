const $=id=>document.getElementById(id);
const $$=sel=>[...document.querySelectorAll(sel)];
const state={helpers:[],annexes:[],captors:[]};
const CRIMES=[
{name:"Lesiones",article:"142",law:"Código Penal de El Salvador"},
{name:"Lesiones graves",article:"143",law:"Código Penal de El Salvador"},
{name:"Desobediencia en caso de medidas cautelares o de protección",article:"338-A",law:"Código Penal de El Salvador"}
];
let captorRegistry=JSON.parse(localStorage.getItem("siga_sv_captor_registry")||"[]");

const months=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const units=["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte","veintiuno","veintidós","veintitrés","veinticuatro","veinticinco","veintiséis","veintisiete","veintiocho","veintinueve"];
function numberWords(n){
  n=Number(n); if(!Number.isFinite(n)) return "";
  if(n<30) return units[n]??String(n);
  if(n<100){const t=["","","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"][Math.floor(n/10)];return n%10?t+" y "+numberWords(n%10):t}
  if(n===100)return"cien";
  if(n<200)return"ciento "+numberWords(n-100);
  if(n<1000){const h=["","","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"][Math.floor(n/100)];return n%100?h+" "+numberWords(n%100):h}
  if(n<2000)return"mil"+(n%1000?" "+numberWords(n%1000):"");
  if(n<1000000){const th=Math.floor(n/1000),r=n%1000;return numberWords(th)+" mil"+(r?" "+numberWords(r):"")}
  return String(n);
}
function digitsWords(v){return String(v||"").replace(/\D/g,"").split("").map(d=>units[Number(d)]).join(", ")}
function dateWords(v){if(!v)return"";const [y,m,d]=v.split("-").map(Number);return `${numberWords(d)} de ${months[m-1]} del año ${numberWords(y)}`}
function timeWords(v){if(!v)return"";const [h,m]=v.split(":").map(Number);return `${numberWords(h)} horas${m?` con ${numberWords(m)} minutos`:""}`}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function val(id){return ($(id)?.value||"").trim()}
function cleanText(s){return String(s??"").replace(/\s+/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/([,;:!?])(?=[^\s])/g,"$1 ").trim()}
function cleanEsc(id){return esc(cleanText(val(id)))}
function showOnly(id){["home","wizard","preview"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function showPart(id){$$(".part").forEach(p=>p.classList.add("hidden"));$(id).classList.remove("hidden");showOnly("wizard")}
function required(ids){let ok=true,first=null;ids.forEach(id=>{const e=$(id);const bad=!val(id);e?.classList.toggle("invalid",bad);if(bad&&!first)first=e;ok=ok&&!bad});if(first){first.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>first.focus(),300)}return ok}
function ageFromDate(v){if(!v)return"";const b=new Date(v+"T00:00:00"),n=new Date();let a=n.getFullYear()-b.getFullYear();const md=n.getMonth()-b.getMonth();if(md<0||(md===0&&n.getDate()<b.getDate()))a--;return a>=0?a:""}

function addHelper(data={rank:"",name:"",oni:""}){
  const i=state.helpers.length;state.helpers.push(data);
  const d=document.createElement("div");d.className="repeat-card";d.dataset.idx=i;
  d.innerHTML=`<div class="grid3"><label>Categoría / grado *<input data-h="rank" value="${esc(data.rank)}"></label><label>Nombre completo *<input data-h="name" value="${esc(data.name)}"></label><label>ONI *<input data-h="oni" value="${esc(data.oni)}"></label></div><button type="button" class="remove">Eliminar auxiliar</button>`;
  d.querySelector(".remove").onclick=()=>{state.helpers.splice(i,1);renderHelpers()};$("helpers").appendChild(d)
}
function renderHelpers(){ $("helpers").innerHTML="";const copy=[...state.helpers];state.helpers=[];copy.forEach(addHelper)}
function collectHelpers(){state.helpers=$$("#helpers .repeat-card").map(d=>({rank:d.querySelector('[data-h="rank"]').value.trim(),name:d.querySelector('[data-h="name"]').value.trim(),oni:d.querySelector('[data-h="oni"]').value.trim()}));return state.helpers.every(x=>x.rank&&x.name&&x.oni)}

function addAnnex(v=""){const i=state.annexes.length;state.annexes.push(v);const d=document.createElement("div");d.className="repeat-card";d.dataset.idx=i;d.innerHTML=`<label>Anexo ${i+1}<input data-annex value="${esc(v)}" placeholder="Ej. hoja de chequeo clínico"></label><button class="remove" type="button">Eliminar anexo</button>`;d.querySelector(".remove").onclick=()=>{state.annexes.splice(i,1);renderAnnexes()};$("annexes").appendChild(d)}
function renderAnnexes(){$("annexes").innerHTML="";const c=[...state.annexes];state.annexes=[];c.forEach(addAnnex)}
function collectAnnexes(){state.annexes=$$("[data-annex]").map(x=>x.value.trim()).filter(Boolean)}

function agentOptions(){const arr=[{name:val("leadName"),rank:val("leadRank")},...state.helpers,...captorRegistry].filter(x=>x.name);return arr.filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i)}
function addCaptor(v=""){const i=state.captors.length;state.captors.push(v);const d=document.createElement("div");d.className="repeat-card";d.dataset.idx=i;const opts=agentOptions().map(a=>`<option value="${esc(a.name)}" ${a.name===v?"selected":""}>${esc(a.rank+" "+a.name)}</option>`).join("");d.innerHTML=`<label>Captor ${i+1}<select data-captor><option value="">Seleccione agente</option>${opts}<option value="MANUAL">Otro / manual</option></select></label><input data-captor-manual class="${v&& !agentOptions().some(a=>a.name===v)?"":"hidden"}" value="${esc(v&& !agentOptions().some(a=>a.name===v)?v:"")}" placeholder="Nombre manual"><button class="remove" type="button">Eliminar captor</button>`;const s=d.querySelector("[data-captor]"),m=d.querySelector("[data-captor-manual]");s.onchange=()=>m.classList.toggle("hidden",s.value!=="MANUAL");d.querySelector(".remove").onclick=()=>{state.captors.splice(i,1);renderCaptors()};$("captors").appendChild(d)}
function renderCaptors(){$("captors").innerHTML="";const c=[...state.captors];state.captors=[];c.forEach(addCaptor)}
function collectCaptors(){state.captors=$$("#captors .repeat-card").map(d=>{const s=d.querySelector("[data-captor]");return s.value==="MANUAL"?d.querySelector("[data-captor-manual]").value.trim():s.value}).filter(Boolean)}

$("newAct").onclick=()=>{showPart("part1");if(!state.helpers.length)addHelper();if(!state.captors.length){addCaptor();addCaptor()}};
$("resumeDraft").onclick=()=>loadDraft(true);
$("homeBtn").onclick=()=>showOnly("home");
$$("[data-goto]").forEach(b=>b.onclick=()=>showPart(b.dataset.goto));
$$("[data-back]").forEach(b=>b.onclick=()=>showPart(b.dataset.back));
$$("[data-edit]").forEach(b=>b.onclick=()=>showPart(b.dataset.edit));
$("addHelper").onclick=()=>addHelper();
$("addAnnex").onclick=()=>addAnnex();
$$(`[data-annex-preset]`).forEach(b=>b.onclick=()=>{addAnnex(b.dataset.annexPreset)});
$("addCaptor").onclick=()=>addCaptor();
$("birthDate").onchange=()=>$("age").value=ageFromDate(val("birthDate"));
$("objectsMode").onchange=()=>$("objectsFields").classList.toggle("hidden",val("objectsMode")!=="yes");
$("victimMode").onchange=()=>{
  $("victimPersonFields").classList.toggle("hidden",val("victimMode")!=="person");
  $("victimPublicFields").classList.toggle("hidden",val("victimMode")!=="public");
};
$("noticeMode").onchange=()=>{
  $("noticeNobodyFields").classList.toggle("hidden",val("noticeMode")!=="nobody");
  $("noticePersonFields").classList.toggle("hidden",val("noticeMode")!=="person");
};
$("clearReference").onclick=()=>$("referenceStory").value="";
$("detaineeSigns").onchange=()=>$("noSignReasonWrap").classList.toggle("hidden",val("detaineeSigns")!=="no");
function syncAliasUI(){const has=val("aliasMode")==="yes";$("aliasWrap").classList.toggle("hidden",!has);if(!has)$("alias").classList.remove("invalid")}
$("aliasMode").onchange=syncAliasUI;
function validateAlias(){if(!val("aliasMode")){alert("Indique si el aprehendido posee alias o no posee alias.");$("aliasMode").classList.add("invalid");return false}$("aliasMode").classList.remove("invalid");if(val("aliasMode")==="yes"&&!val("alias")){alert("Escriba el alias del aprehendido.");$("alias").classList.add("invalid");$("aliasWrap").classList.remove("hidden");$("alias").focus();return false}$("alias").classList.remove("invalid");return true}

$$("[data-next]").forEach(b=>b.onclick=()=>{
  const next=b.dataset.next;
  if(next==="part2"){
    collectHelpers();
    if(!required(["station","stationAddress","actDate","actTime","leadRank","leadName","leadOni","detaineeName","aliasMode","detaineeDui","birthDate","civilStatus","occupation","detaineeAddress","detaineeMunicipality","detaineeDepartment","physicalFeatures","clothing","motherName","fatherName","parentsAddress","crimeName","crimeArticle","crimeLaw","victimMode"]))return;
    if(!collectHelpers()){alert("Complete todos los datos de los auxiliares o elimine la fila que no utilizará.");return}
    if(!validateAlias())return;
    if(val("victimMode")==="person"&&!required(["victimName"]))return;
    if(val("victimMode")==="public"&&!required(["publicInterest"]))return;
    $("age").value=ageFromDate(val("birthDate"));showPart("part2")
  }
  if(next==="part3"){
    if(!required(["story","arrestDate","arrestTime","arrestPlace","arrestMunicipality","arrestDepartment"]))return;
    if(val("actDate")===val("arrestDate")&&val("actTime")<val("arrestTime")){alert("Revise las horas: la hora del acta está antes que la hora de aprehensión.");return}
    showPart("part3")
  }
  if(next==="part4"){
    if(!required(["rightsText","objectsMode","noticeMode","detaineeSigns"]))return;
    if(val("objectsMode")==="yes"&&!val("depositObjects")&&!val("seizedObjects")){alert("Indique al menos un objeto en depósito o incautación.");return}
    if(val("noticeMode")==="nobody"&&!required(["noticeNobodyReason"]))return;
    if(val("noticeMode")==="person"&&!required(["noticePersonName"]))return;
    if(val("detaineeSigns")==="no"&&!val("noSignReason")){alert("Indique el motivo de no firma.");return}
    renderCaptors();showPart("part4")
  }
});


function renderCrimeSuggestions(){const q=val("crimeName").toLowerCase(),box=$("crimeSuggestions");box.innerHTML="";if(!q)return;CRIMES.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>{const b=document.createElement("button");b.type="button";b.textContent=`${c.name} — Art. ${c.article}`;b.onclick=()=>{$("crimeName").value=c.name;$("crimeArticle").value=c.article;$("crimeLaw").value=c.law;box.innerHTML=""};box.appendChild(b)})}
$("crimeName").addEventListener("input",()=>{const c=CRIMES.find(x=>x.name.toLowerCase()===val("crimeName").toLowerCase());$("crimeArticle").value=c?.article||"";$("crimeLaw").value=c?.law||"";renderCrimeSuggestions()});
function renderCaptorRegistry(){const box=$("captorRegistry");box.innerHTML="";captorRegistry.forEach((c,i)=>{const d=document.createElement("div");d.className="registry-item";d.innerHTML=`<span><b>${esc(c.name)}</b><br><small>${esc(c.rank||"")} ${c.oni?"· ONI "+esc(c.oni):""}</small></span><span class="registry-actions"><button data-use>Usar</button><button data-edit>Editar</button><button data-del>Borrar</button></span>`;d.querySelector("[data-use]").onclick=()=>{state.captors.push(c.name);renderCaptors()};d.querySelector("[data-edit]").onclick=()=>{$("registryRank").value=c.rank||"";$("registryName").value=c.name;$("registryOni").value=c.oni||"";captorRegistry.splice(i,1);saveRegistry()};d.querySelector("[data-del]").onclick=()=>{if(confirm("¿Borrar este captor?")){captorRegistry.splice(i,1);saveRegistry()}};box.appendChild(d)})}
function saveRegistry(){localStorage.setItem("siga_sv_captor_registry",JSON.stringify(captorRegistry));renderCaptorRegistry()}
$("saveCaptorName").onclick=()=>{if(!val("registryName")){alert("Escriba el nombre del captor.");return}captorRegistry.push({rank:val("registryRank"),name:val("registryName"),oni:val("registryOni")});saveRegistry();$("registryRank").value=$("registryName").value=$("registryOni").value=""};renderCaptorRegistry();
// Escáner DUI: captura con cámara. La lectura automática usa TextDetector solo si el navegador lo admite.
$("scanDui").onclick=()=>$("duiCamera").click();
$("duiCamera").onchange=()=>{const f=$("duiCamera").files[0];if(!f)return;$("duiPreview").src=URL.createObjectURL(f);$("duiScanPanel").classList.remove("hidden")};
$("discardDuiImage").onclick=()=>{$("duiPreview").src="";$("duiCamera").value="";$("duiScanPanel").classList.add("hidden")};
$("tryReadDui").onclick=async()=>{if(!("TextDetector" in window)){$("duiScanStatus").textContent="Este navegador no admite lectura automática de texto. Puede observar la imagen y escribir el DUI manualmente.";return}try{const det=new TextDetector();const blocks=await det.detect($("duiPreview"));const text=blocks.map(b=>b.rawValue).join(" ");const m=text.match(/\b\d{8}[- ]?\d\b/);if(m){$("detaineeDui").value=m[0].replace(" ","-");$("duiScanStatus").textContent="DUI detectado. Revíselo y confírmelo antes de continuar."}else $("duiScanStatus").textContent="No se detectó un número de DUI con suficiente claridad. Escríbalo manualmente."}catch(e){$("duiScanStatus").textContent="No fue posible leer el DUI automáticamente. Escríbalo manualmente."}};

function keyPerson(name){return `<span class="person-key">${esc(name.toUpperCase())}</span>`}
function buildAct(){
  collectHelpers();collectAnnexes();collectCaptors();
  if(!state.captors.length){alert("Agregue al menos un captor en la Parte 4.");return false}
  const helperText=state.helpers.length?`, auxiliado por ${state.helpers.map(h=>`${esc(h.rank)} ${keyPerson(h.name)}, con Orden Numérico Institucional ${digitsWords(h.oni)}`).join("; ")}`:"";
  const parentAges=`${val("motherAge")?`, de ${numberWords(val("motherAge"))} años de edad`:""} y del señor ${keyPerson(val("fatherName"))}${val("fatherAge")?`, de ${numberWords(val("fatherAge"))} años de edad`:""}`;
  const arrestLoc=[val("arrestPlace"),val("arrestHamlet")&&`caserío ${val("arrestHamlet")}`,val("arrestCanton")&&`cantón ${val("arrestCanton")}`,`distrito o municipio ${val("arrestMunicipality")}`,`departamento ${val("arrestDepartment")}`].filter(Boolean).join(", ");
  const objectText=val("objectsMode")==="none"?"no deja nada en calidad de depósito ni en calidad de incautación":`deja${val("depositObjects")?` en calidad de depósito: ${esc(val("depositObjects"))}`:""}${val("depositObjects")&&val("seizedObjects")?"; y":""}${val("seizedObjects")?` en calidad de incautación: ${esc(val("seizedObjects"))}`:""}`;
  const signText=val("detaineeSigns")==="yes"?"firmando también el aprehendido":"no así el aprehendido "+esc(val("noSignReason"));
  const aliasText=val("aliasMode")==="yes"&&val("alias")?` alias ${esc(cleanText(val("alias")).toUpperCase())}`:` sin alias`;
  let victimText="";
  if(val("victimMode")==="person") victimText=` En perjuicio de la señora ${keyPerson(val("victimName"))}${val("victimAge")?` de ${numberWords(val("victimAge"))} años de edad`:""}${val("victimAddress")?`, residente en ${esc(val("victimAddress"))}`:""},`;
  if(val("victimMode")==="public") victimText=` En perjuicio de ${esc(val("publicInterest"))},`;
  let noticeText="";
  if(val("noticeMode")==="nobody") noticeText=` al preguntarle a quien se le puede dar aviso de su aprehensión, este manifestó que a nadie ${esc(val("noticeNobodyReason"))},`;
  if(val("noticeMode")==="person") noticeText=` al preguntarle a quien se le puede dar aviso de su aprehensión, este manifestó que a ${keyPerson(val("noticePersonName"))}${val("noticeRelation")?`, ${esc(val("noticeRelation"))}`:""},`;
  const observationText=val("finalObservation")?` ${cleanEsc("finalObservation")}`:"";

  const annexText=state.annexes.length?`Se anexa a la presente acta: ${state.annexes.map(esc).join("; ")}.`:"";
  const sigs=[`<div class="signature"><div class="line">APREHENDIDO</div></div>`,...state.captors.map((c,i)=>`<div class="signature"><div class="line">CAPTOR ${i+1}</div><div>${esc(c.toUpperCase())}</div></div>`)].join("");

  $("acta").innerHTML=`
  <p><span class="heading">EN EL INTERIOR DE LA ${esc(val("station"))}, ${esc(val("stationAddress"))}; A LAS ${timeWords(val("actTime")).toUpperCase()} DEL DÍA ${dateWords(val("actDate")).toUpperCase()}.</span> Presente el suscrito ${esc(val("leadRank").toUpperCase())} ${keyPerson(val("leadName"))}, CON ORDEN NUMÉRICO INSTITUCIONAL ${digitsWords(val("leadOni")).toUpperCase()}${helperText.toUpperCase()}, DE GENERALES CONOCIDAS POR LABORAR TEMPORALMENTE EN LA ${esc(val("station").toUpperCase())}, DEJAMOS CONSTANCIA DE LA APREHENSIÓN EN FLAGRANCIA DEL SEÑOR ${keyPerson(val("detaineeName"))}${aliasText}, de ${numberWords(val("age"))} AÑOS DE EDAD, ${esc(val("civilStatus"))}, ${esc(val("occupation"))}, RESIDENTE EN ${esc(val("detaineeAddress"))}, ${esc(val("detaineeMunicipality"))}, DEPARTAMENTO DE ${esc(val("detaineeDepartment"))}, QUIEN AL MOMENTO DE SU APREHENSIÓN SE IDENTIFICÓ CON SU DOCUMENTO ÚNICO DE IDENTIDAD NÚMERO ${digitsWords(val("detaineeDui"))}, DE LAS CARACTERÍSTICAS FÍSICAS SIGUIENTES: ${cleanEsc("physicalFeatures")}; QUIEN VESTÍA DE LA SIGUIENTE MANERA: ${cleanEsc("clothing")}; SIENDO HIJO DE LA SEÑORA ${keyPerson(val("motherName"))}${val("motherAge")?`, de ${numberWords(val("motherAge"))} años de edad`:""} Y DEL SEÑOR ${keyPerson(val("fatherName"))}${val("fatherAge")?`, de ${numberWords(val("fatherAge"))} años de edad`:""}, AMBOS RESIDENTES EN ${cleanEsc("parentsAddress")}. DEJANDO CONSTANCIA DE LA APREHENSIÓN EN FLAGRANCIA DEL SEÑOR ${keyPerson(val("detaineeName"))}, POR EL DELITO DE ${esc(val("crimeName").toUpperCase())}, SEGÚN LO ESTABLECIDO EN EL ARTÍCULO ${numberWords(val("crimeArticle"))} DE ${esc(val("crimeLaw"))}.${victimText}</p>

  <p><span class="section-title">RELATO DE LOS HECHOS.</span> ${cleanEsc("story")}</p>

  <p class="arrest-key">a su aprehensión en flagrancia a las ${timeWords(val("arrestTime"))} del día ${dateWords(val("arrestDate"))}, en ${esc(arrestLoc)}, por el delito ya mencionado.</p>

  <p>${cleanEsc("rightsText")} ${objectText}.${noticeText} Y no habiendo nada más que hacer constar en la presente acta de aprehensión, se da por terminada la cual para mayor constancia firmamos ${signText}.${annexText?` ${annexText}`:""}${observationText}</p>

  <div class="signatures">${sigs}</div>`;
  return true
}

$("previewBtn").onclick=()=>{collectCaptors();if(!state.captors.length){alert("Agregue al menos un captor.");return}if(buildAct())showOnly("preview")};

$("floatingTools").onclick=()=>$("floatingMenu").classList.toggle("hidden");
$("exportWord").onclick=()=>{const html=`<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 13in;margin:.55in .65in}body{font-family:Arial;font-size:11pt;line-height:1.35;text-align:left;word-spacing:normal;letter-spacing:normal}.person-key{text-transform:uppercase;text-decoration:underline;font-weight:bold}.arrest-key{font-weight:bold;text-decoration:underline}.section-title{text-transform:uppercase;font-weight:bold;text-align:center}</style></head><body>${$("acta").innerHTML}</body></html>`;const blob=new Blob(["\ufeff",html],{type:"application/msword"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="SIGA_SV_Acta.doc";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
let utter=null;
$("speak").onclick=()=>{speechSynthesis.cancel();utter=new SpeechSynthesisUtterance($("acta").innerText);utter.lang="es-SV";utter.rate=.95;speechSynthesis.speak(utter)};
$("pauseVoice").onclick=()=>speechSynthesis.pause();
$("resumeVoice").onclick=()=>speechSynthesis.resume();
$("stopVoice").onclick=()=>speechSynthesis.cancel();

$("fontFamily").onchange=()=>$("acta").style.fontFamily=$("fontFamily").value;
$("fontSize").onchange=()=>$("acta").style.fontSize=$("fontSize").value+"pt";
$("selectAllAct").onclick=()=>{const r=document.createRange();r.selectNodeContents($("acta"));const s=getSelection();s.removeAllRanges();s.addRange(r)};
$$("[data-format]").forEach(b=>b.onclick=()=>document.execCommand(b.dataset.format,false,null));
$("uppercaseSelection").onclick=()=>{const s=getSelection();if(!s.rangeCount||s.isCollapsed)return;const r=s.getRangeAt(0);const span=document.createElement("span");span.textContent=s.toString().toUpperCase();r.deleteContents();r.insertNode(span);s.removeAllRanges()};
$("resetFormat").onclick=()=>{buildAct();$("acta").style.fontFamily="Arial";$("acta").style.fontSize="11pt";$("fontFamily").value="Arial";$("fontSize").value="11"};

const COMMON_TYPOS={
  "aprehencion":"aprehensión","aprehension":"aprehensión","flagransia":"flagrancia","flagransia":"flagrancia",
  "incautasion":"incautación","incautacion":"incautación","derehos":"derechos","imputadoo":"imputado",
  "municipo":"municipio","departameto":"departamento","residensia":"residencia","identifico":"identificó",
  "manifesto":"manifestó","aprehendidoo":"aprehendido","institusional":"institucional","caracteristicas":"características"
};
function reviewActText(){
  const text=$("acta").innerText||"";const issues=[];
  if(/ {2,}/.test(text))issues.push("hay espacios dobles");
  if(/\s+[,.;:!?]/.test(text))issues.push("hay espacios antes de signos de puntuación");
  const words=[...new Set((text.toLowerCase().match(/[a-záéíóúñü]+/g)||[]))];
  const typos=words.filter(w=>COMMON_TYPOS[w]).map(w=>`${w} → ${COMMON_TYPOS[w]}`);
  const st=$("reviewStatus");
  if(typos.length)issues.push(`posibles palabras por revisar: ${typos.join(", ")}`);
  if(issues.length){st.textContent="Revisión: "+issues.join("; ")+". Corrija directamente en el acta antes de exportar.";st.className="review-status warning"}
  else{st.textContent="Revisión básica completada: no se detectaron problemas de espaciado ni errores frecuentes. El corrector ortográfico del navegador continúa activo.";st.className="review-status ok"}
}
$("reviewText").onclick=reviewActText;

$("printAct").onclick=()=>window.print();

function draftData(){
  collectHelpers();collectAnnexes();collectCaptors();
  const ids=["station","stationAddress","actDate","actTime","leadRank","leadName","leadOni","detaineeName","aliasMode","alias","detaineeDui","birthDate","age","civilStatus","occupation","detaineeAddress","detaineeMunicipality","detaineeDepartment","physicalFeatures","clothing","motherName","motherAge","fatherName","fatherAge","parentsAddress","crimeName","crimeArticle","crimeLaw","victimMode","story","arrestDate","arrestTime","arrestPlace","arrestHamlet","arrestCanton","arrestMunicipality","arrestDepartment","rightsText","objectsMode","depositObjects","seizedObjects","noticeMode","noticeNobodyReason","noticePersonName","noticeRelation","detaineeSigns","noSignReason","finalObservation"];
  return {fields:Object.fromEntries(ids.map(id=>[id,val(id)])),helpers:state.helpers,annexes:state.annexes,captors:state.captors}
}
$("saveDraft").onclick=()=>{localStorage.setItem("siga_sv_v3_draft",JSON.stringify(draftData()));alert("Borrador guardado en este dispositivo.")};
function loadDraft(open=false){
  try{
    const d=JSON.parse(localStorage.getItem("siga_sv_v3_draft")||"null");if(!d){if(open)alert("No hay borrador guardado.");return}
    Object.entries(d.fields||{}).forEach(([id,v])=>{if($(id))$(id).value=v});
    state.helpers=d.helpers||[];state.annexes=d.annexes||[];state.captors=d.captors||[];
    renderHelpers();renderAnnexes();renderCaptors();
    $("objectsFields").classList.toggle("hidden",val("objectsMode")!=="yes");
    $("victimMode").dispatchEvent(new Event("change"));
    $("noticeMode").dispatchEvent(new Event("change"));
    $("noSignReasonWrap").classList.toggle("hidden",val("detaineeSigns")!=="no");
    syncAliasUI();
    if(open)showPart("part1")
  }catch(e){console.error(e)}
}
loadDraft(false);
if(!$("actDate").value){const d=new Date(),iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;$("actDate").value=iso}
