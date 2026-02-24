(() => {
"use strict";

/* =========================
   1. HELPERS
========================= */
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

/* =========================
   2. ESTADO
========================= */
const state = {
  mode: "direto",
  files: [],
  health: "CONNECTING"
};

/* =========================
   3. BOOT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  bindTabs();
  bindInput();
  bindUpload();
  bindChat();
  bindGenerate();
  fakeHealthBoot();
});

/* =========================
   4. HEALTH (SIMULADOR)
========================= */
function fakeHealthBoot(){
  setTimeout(()=>{
    state.health="OPERATIONAL";
    $("#status-core").textContent="OPERACIONAL";
    $("#badge-health").dataset.health="OPERATIONAL";
    $("#badge-health").textContent="OPERATIONAL";
  },600);
}

/* =========================
   5. TABS (PRO / CHAT)
========================= */
function bindTabs(){
  const pro=$("#btn-pista-direta");
  const chat=$("#btn-pista-guiada");

  pro.onclick=()=>setMode("direto");
  chat.onclick=()=>setMode("assistente");
}

function setMode(m){
  state.mode=m;

  $("#painel-direto").hidden = m!=="direto";
  $("#painel-chat").hidden = m!=="assistente";

  $("#btn-pista-direta").classList.toggle("ativo", m==="direto");
  $("#btn-pista-guiada").classList.toggle("ativo", m==="assistente");
}

/* =========================
   6. INPUT (HABILITA BOTÃO)
========================= */
function bindInput(){
  const txt=$("#cmd-input");
  const btn=$("#btn-executar");

  txt.addEventListener("input", ()=>{
    btn.disabled = txt.value.trim().length<5;
  });
}

/* =========================
   7. UPLOAD (LISTA)
========================= */
function bindUpload(){
  const input=$("#file-soberano");

  input.addEventListener("change", ()=>{
    const list=$("#file-display-area");
    const files=[...input.files];

    if(!files.length){
      list.innerHTML=`<p class="txt-vazio">Acervo vazio.</p>`;
      return;
    }

    state.files=files;

    list.innerHTML="";
    files.forEach(f=>{
      const div=document.createElement("div");
      div.textContent="📄 "+f.name;
      list.appendChild(div);
    });
  });
}

/* =========================
   8. GERAR MINUTA (SIMULADO)
========================= */
function bindGenerate(){
  $("#btn-executar").onclick=()=>{
    const txt=$("#cmd-input").value.trim();
    if(!txt)return;

    const canvas=$("#output-canvas");

    canvas.innerHTML=`
      <div style="color:black;font-family:serif;padding:20px">
        <h2 style="border-bottom:1px solid #000">MINUTA TÉCNICA</h2>
        <p><b>Conteúdo:</b></p>
        <p>${escapeHtml(txt)}</p>
        <p><b>Anexos:</b> ${state.files.length}</p>
      </div>
    `;
  };
}

/* =========================
   9. CHAT FUNCIONAL
========================= */
function bindChat(){
  const input=$("#chat-input");
  const send=$("#chat-send");

  send.onclick=sendChat;
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      sendChat();
    }
  });
}

function sendChat(){
  const input=$("#chat-input");
  const msg=input.value.trim();
  if(!msg)return;

  appendMsg("user",msg);

  setTimeout(()=>{
    appendMsg("assistant","Mensagem recebida. (simulador ativo)");
  },300);

  input.value="";
}

function appendMsg(role,text){
  const box=$("#chat-messages");

  const div=document.createElement("div");
  div.className="msg "+role;
  div.innerHTML=`<div class="msg-body">${escapeHtml(text)}</div>`;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

/* =========================
   10. UTILS
========================= */
function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#39;"
  }[m]));
}

})();
