(() => {
  "use strict";

  /* =========================
     0) Helpers + Guard
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const isoNow = () => new Date().toISOString();

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  window.addEventListener("error", (e) => console.error("[ARKHOS_UI] error:", e?.error || e?.message || e));
  window.addEventListener("unhandledrejection", (e) => console.error("[ARKHOS_UI] promise:", e?.reason || e));

  /* =========================
     1) Storage + State
     ========================= */
  const STORAGE = {
    lang: "arkhos_lang_v1",
    archive: "arkhos_archive_v1"
  };

  const state = {
    lang: localStorage.getItem(STORAGE.lang) || "pt",
    mode: "direto", // direto | chat
    files: [],      // {name,size,type,lastModified}
    lastAudit: null,
    lastDraft: null,
    lastArchive: null
  };

  /* =========================
     2) i18n (mínimo)
     ========================= */
  const i18n = {
    pt: {
      subtitle: "ESTAÇÃO DE INTELIGÊNCIA JURÍDICA",
      proTab: "MODO PROFISSIONAL (MINUTA)",
      chatTab: "ASSISTENTE JURÍDICO (CHAT)",
      labelArea: "COMPETÊNCIA / ÁREA DE ATUAÇÃO",
      labelInput: "INSTRUÇÃO TÉCNICA DA MINUTA",
      labelAnexo: "📎 APORTAR LASTRO DOCUMENTAL (ACERVO)",
      analiseTitle: "ANÁLISE DE CONFORMIDADE PROCESSUAL",
      eixoMetal: "LÓGICA (Estrutura)",
      eixoEstado: "PROVAS (Acervo)",
      eixoLegiao: "CONTEXTO (Jurisprudência)",
      eixoLogos: "DIREITO (Fundamentação)",
      btnGerar: "GERAR MINUTA E PROTOCOLAR",
      placeholderCanvas: "Aguardando instrução técnica e acervo probatório para compilar o documento.",
      acervoVazio: "Acervo probatório vazio. Aguardando documentos...",
      certWait: "CERT: AGUARDANDO",
      auditWait: "AUTENTICIDADE: PENDENTE",
      metrica1: "MÉTRICA DE VIABILIDADE",
      metrica2: "MARGEM DE RISCO TÉCNICO",
      exportBtn: "📥 EXPORTAR DOCUMENTO (PDF LIMPO)",
      salvarBtn: "💾 ARQUIVAR NO SISTEMA",
      chatEmpty: "Digite sua consulta. O assistente vai conduzir as perguntas necessárias e apontar o que falta para “passar” no fail-closed.",
      chatPh: "Escreva sua consulta jurídica...",
      chatSend: "Enviar",
      needMoreInfo: "Faltam informações (fail-closed).",
      archivedOk: "Arquivado (registro local gerado)."
    },
    en: {
      subtitle: "LEGAL INTELLIGENCE STATION",
      proTab: "PROFESSIONAL MODE (DRAFT)",
      chatTab: "LEGAL ASSISTANT (CHAT)",
      labelArea: "JURISDICTION / FIELD",
      labelInput: "TECHNICAL DRAFT INSTRUCTION",
      labelAnexo: "📎 ATTACH EVIDENCE (VAULT)",
      analiseTitle: "PROCEDURAL COMPLIANCE ANALYSIS",
      eixoMetal: "LOGIC (Structure)",
      eixoEstado: "EVIDENCE (Assets)",
      eixoLegiao: "CONTEXT (Case Law)",
      eixoLogos: "LAW (Legal Basis)",
      btnGerar: "GENERATE AND PROTOCOL DRAFT",
      placeholderCanvas: "Waiting for instructions and evidence to compile document.",
      acervoVazio: "Evidence vault empty. Waiting for documents...",
      certWait: "CERT: WAITING",
      auditWait: "AUTHENTICITY: PENDING",
      metrica1: "VIABILITY SCORE",
      metrica2: "TECHNICAL RISK MARGIN",
      exportBtn: "📥 EXPORT DOCUMENT (CLEAN PDF)",
      salvarBtn: "💾 ARCHIVE IN SYSTEM",
      chatEmpty: "Type your request. The assistant will ask what’s missing to pass fail-closed.",
      chatPh: "Write your legal request...",
      chatSend: "Send",
      needMoreInfo: "More information required (fail-closed).",
      archivedOk: "Archived (local record generated)."
    }
  };

  /* =========================
     3) Boot
     ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    bindTabs();
    bindLanguage();
    bindDirectInputs();
    bindUpload();
    bindGenerate();
    bindExport();
    bindArchive();
    bindChat();

    applyLanguage();
    setMode(state.mode);

    setHealthLocalOperational();
    renderAcervo();
    renderAudit(null);
    ensureCanvasPlaceholder();
    ensureChatEmpty();
  });

  /* =========================
     4) Health (local)
     ========================= */
  function setHealthLocalOperational() {
    const status = $("#status-core");
    const badgeHealth = $("#badge-health");
    const badgeRuntime = $("#badge-runtime");

    if (status) status.textContent = state.lang === "pt" ? "OPERACIONAL" : "OPERATIONAL";
    if (badgeHealth) {
      badgeHealth.hidden = false;
      badgeHealth.dataset.health = "OPERATIONAL";
      badgeHealth.textContent = "OPERATIONAL";
    }
    if (badgeRuntime) {
      badgeRuntime.hidden = false;
      badgeRuntime.dataset.runtime = "LOCAL_SIMULADOR";
      badgeRuntime.textContent = state.lang === "pt" ? "LOCAL SIMULADOR" : "LOCAL SIMULATOR";
    }
  }

  /* =========================
     5) Tabs (separar telas)
     ========================= */
  function bindTabs() {
    const proBtn = $("#btn-pista-direta");
    const chatBtn = $("#btn-pista-guiada");
    if (proBtn) proBtn.addEventListener("click", () => setMode("direto"));
    if (chatBtn) chatBtn.addEventListener("click", () => setMode("chat"));
  }

  function setMode(mode) {
    state.mode = mode;

    const pro = $("#painel-direto");
    const chat = $("#painel-chat");
    const proBtn = $("#btn-pista-direta");
    const chatBtn = $("#btn-pista-guiada");

    if (pro) pro.hidden = mode !== "direto";
    if (chat) chat.hidden = mode !== "chat";

    if (proBtn) {
      proBtn.classList.toggle("ativo", mode === "direto");
      proBtn.setAttribute("aria-selected", mode === "direto" ? "true" : "false");
    }
    if (chatBtn) {
      chatBtn.classList.toggle("ativo", mode === "chat");
      chatBtn.setAttribute("aria-selected", mode === "chat" ? "true" : "false");
    }
  }

  /* =========================
     6) Language
     ========================= */
  function bindLanguage() {
    const pt = $("#btn-lang-pt");
    const en = $("#btn-lang-en");
    if (pt) pt.addEventListener("click", () => setLang("pt"));
    if (en) en.addEventListener("click", () => setLang("en"));
  }

  function setLang(lang) {
    state.lang = lang === "en" ? "en" : "pt";
    localStorage.setItem(STORAGE.lang, state.lang);
    applyLanguage();
    renderAudit(state.lastAudit);
    ensureCanvasPlaceholder(true);
    ensureChatEmpty(true);
    setHealthLocalOperational();
  }

  function applyLanguage() {
    const t = i18n[state.lang];

    const subtitle = $("#subtitle") || $(".subtitle");
    if (subtitle) subtitle.textContent = t.subtitle;

    const proBtn = $("#btn-pista-direta");
    const chatBtn = $("#btn-pista-guiada");
    if (proBtn) proBtn.textContent = t.proTab;
    if (chatBtn) chatBtn.textContent = t.chatTab;

    const la = $("#label-area");
    const li = $("#label-input");
    const lan = $("#label-anexo");
    if (la) la.textContent = t.labelArea;
    if (li) li.textContent = t.labelInput;
    if (lan) lan.textContent = t.labelAnexo;

    // título do monitor (se existir id, senão mantém h3)
    const h3 = $(".monitor-integridade h3");
    if (h3) h3.textContent = t.analiseTitle;

    // labels dos eixos (se existirem)
    const em = $("#e-metal label");
    const es = $("#e-estado label");
    const el = $("#e-legiao label");
    const eo = $("#e-logos label");
    if (em) em.textContent = t.eixoMetal;
    if (es) es.textContent = t.eixoEstado;
    if (el) el.textContent = t.eixoLegiao;
    if (eo) eo.textContent = t.eixoLogos;

    const btn = $("#btn-executar");
    if (btn) btn.textContent = t.btnGerar;

    const m1 = $("#label-metrica-1");
    const m2 = $("#label-metrica-2");
    if (m1) m1.textContent = t.metrica1;
    if (m2) m2.textContent = t.metrica2;

    const bx = $("#btn-exportar");
    const bs = $("#btn-salvar");
    if (bx) bx.textContent = t.exportBtn;
    if (bs) bs.textContent = t.salvarBtn;

    const chatInput = $("#chat-input");
    if (chatInput) chatInput.placeholder = t.chatPh;
    const chatSend = $("#chat-send");
    if (chatSend) chatSend.textContent = t.chatSend;

    const ptBtn = $("#btn-lang-pt");
    const enBtn = $("#btn-lang-en");
    if (ptBtn) ptBtn.classList.toggle("active", state.lang === "pt");
    if (enBtn) enBtn.classList.toggle("active", state.lang === "en");
  }

  /* =========================
     7) Upload + remover
     ========================= */
  function bindUpload() {
    const input = $("#file-soberano");
    if (!input) return;

    input.addEventListener("change", () => {
      const picked = Array.from(input.files || []).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified
      }));

      picked.forEach((nf) => {
        if (!state.files.some((x) => x.name === nf.name)) state.files.push(nf);
      });

      input.value = "";
      renderAcervo();
      runAudit();
    });
  }

  function renderAcervo() {
    const box = $("#file-display-area");
    if (!box) return;

    const t = i18n[state.lang];
    box.innerHTML = "";

    if (!state.files.length) {
      const p = document.createElement("p");
      p.className = "txt-vazio";
      p.textContent = t.acervoVazio;
      box.appendChild(p);
      return;
    }

    state.files.forEach((f, idx) => {
      const row = document.createElement("div");
      row.className = "file-item";
      row.innerHTML = `
        <span class="file-name">${escapeHtml(f.name)}</span>
        <button type="button" class="file-remove" aria-label="Remover arquivo">✖</button>
      `;
      row.querySelector(".file-remove").addEventListener("click", () => {
        state.files.splice(idx, 1);
        renderAcervo();
        runAudit();
      });
      box.appendChild(row);
    });
  }

  /* =========================
     8) Auditoria (simulador)
     ========================= */
  function bindDirectInputs() {
    const txt = $("#cmd-input");
    const area = $("#area-direito");
    if (txt) txt.addEventListener("input", runAudit);
    if (area) area.addEventListener("change", runAudit);
  }

  function runAudit() {
    const txtEl = $("#cmd-input");
    const btn = $("#btn-executar");

    const caseText = (txtEl?.value || "").trim();

    if (btn) btn.disabled = caseText.length < 10;

    if (caseText.length < 10) {
      const audit = {
        status: "NEED_MORE_INFO",
        axes: { metal: 0, estado: clamp(state.files.length * 33, 0, 100), legiao: 0, logos: 0 },
        score: 0,
        risk: 100,
        viability: 0
      };
      state.lastAudit = audit;
      renderAudit(audit);
      return;
    }

    const metal = clamp(Math.floor(caseText.length / 10), 0, 100);
    const estado = clamp(state.files.length * 33, 0, 100);
    const legiao = clamp(Math.floor(caseText.split(/\s+/).length / 3), 0, 100);
    const logos = clamp(caseText.length > 120 ? 60 : caseText.length > 40 ? 35 : 10, 0, 100);

    const score = Math.floor((metal + estado + legiao + logos) / 4);
    const risk = clamp(100 - score, 0, 100);

    const audit = {
      status: "OK",
      axes: { metal, estado, legiao, logos },
      score,
      risk,
      viability: score
    };

    state.lastAudit = audit;
    renderAudit(audit);
  }

  function renderAudit(audit) {
    const t = i18n[state.lang];

    setFill("#e-metal .fill", audit?.axes?.metal ?? 0);
    setFill("#e-estado .fill", audit?.axes?.estado ?? 0);
    setFill("#e-legiao .fill", audit?.axes?.legiao ?? 0);
    setFill("#e-logos .fill", audit?.axes?.logos ?? 0);

    const cert = $("#selo-cert");
    const aut = $("#selo-audit");

    if (!audit) {
      if (cert) { cert.className = "selo selo-off"; cert.textContent = t.certWait; }
      if (aut) { aut.className = "selo selo-off"; aut.textContent = t.auditWait; }
      setMetric("--", "--");
      return;
    }

    if (audit.status !== "OK") {
      if (cert) { cert.className = "selo selo-off"; cert.textContent = "CERT: FAIL-CLOSED"; }
      if (aut) { aut.className = "selo selo-off"; aut.textContent = t.needMoreInfo; }
      setMetric(audit.viability, audit.risk);
      return;
    }

    if (cert) {
      cert.className = "selo selo-on";
      cert.textContent = `CERT: ${audit.score}/100`;
    }
    if (aut) {
      aut.className = "selo selo-on";
      aut.textContent = "AUTENTICIDADE: OK";
    }
    setMetric(audit.viability, audit.risk);
  }

  function setFill(sel, pct) {
    const el = $(sel);
    if (!el) return;
    el.style.width = `${clamp(Number(pct) || 0, 0, 100)}%`;
  }

  function setMetric(viab, risk) {
    const v = $("#val-expectativa");
    const r = $("#val-erro");
    if (v) v.textContent = viab === "--" ? "--" : String(viab);
    if (r) r.textContent = risk === "--" ? "--" : String(risk);
  }

  /* =========================
     9) Gerar minuta (simulado)
     ========================= */
  function bindGenerate() {
    const btn = $("#btn-executar");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const txt = ($("#cmd-input")?.value || "").trim();
      const area = ($("#area-direito")?.value || "civil").trim();

      if (txt.length < 10) {
        alert(i18n[state.lang].needMoreInfo);
        return;
      }

      const protocolId = genProtocolId();
      const html = buildDraftHtml({ txt, area, protocolId, files: state.files });

      state.lastDraft = { protocolId, html, ts: isoNow() };
      renderDraft(html);
    });
  }

  function genProtocolId() {
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase();
    return `ARK-${ts}-${rnd}`;
  }

  function buildDraftHtml({ txt, area, protocolId, files }) {
    const title = state.lang === "pt" ? "MINUTA TÉCNICA" : "LEGAL DRAFT";
    const labelProto = state.lang === "pt" ? "PROTOCOLO" : "PROTOCOL";
    const labelAnx = state.lang === "pt" ? "ANEXOS" : "ATTACHMENTS";

    return `
      <div style="color:#000;font-family:Times New Roman,serif;padding:24px;">
        <h2 style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin:0 0 14px 0;">
          ${escapeHtml(title)} — ${escapeHtml(area.toUpperCase())}
        </h2>
        <p style="margin:6px 0;"><strong>${escapeHtml(labelProto)}:</strong> ${escapeHtml(protocolId)}</p>
        <p style="margin:14px 0 0 0;"><strong>${escapeHtml(labelAnx)}:</strong> ${files.length}</p>
        <hr style="border:0;border-top:1px solid #000;margin:14px 0;">
        <div style="white-space:pre-wrap;line-height:1.45;text-align:justify;">
          ${escapeHtml(txt)}
        </div>
      </div>
    `;
  }

  function renderDraft(html) {
    const canvas = $("#output-canvas");
    if (!canvas) return;
    canvas.innerHTML = html;
  }

  function ensureCanvasPlaceholder(force = false) {
    const canvas = $("#output-canvas");
    const ph = $("#txt-placeholder");
    if (!canvas || !ph) return;

    const hasDraft = !!state.lastDraft?.html;
    if (hasDraft && !force) return;

    const placeholder = canvas.querySelector(".placeholder-msg");
    if (placeholder) {
      ph.textContent = i18n[state.lang].placeholderCanvas;
    }
  }

  /* =========================
     10) Chat (simulador)
     ========================= */
  function bindChat() {
    const send = $("#chat-send");
    const input = $("#chat-input");

    if (send) send.addEventListener("click", sendChat);
    if (input) {
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          sendChat();
        }
      });
    }

    $$(".chip-action").forEach((chip) => {
      chip.addEventListener("click", () => {
        const intent = chip.dataset.intent || "";
        const i = $("#chat-input");
        if (!i) return;
        i.value = state.lang === "pt" ? `Quero ${intent}. Contexto: ` : `I want ${intent}. Context: `;
        i.focus();
      });
    });
  }

  function ensureChatEmpty(force = false) {
    const box = $("#chat-messages");
    if (!box) return;

    const hasMsg = box.querySelector(".msg");
    if (hasMsg && !force) return;

    box.innerHTML = `
      <div class="chat-empty">
        <p>${escapeHtml(i18n[state.lang].chatEmpty)}</p>
      </div>
    `;

    const input = $("#chat-input");
    if (input) input.placeholder = i18n[state.lang].chatPh;
  }

  function sendChat() {
    const input = $("#chat-input");
    const msg = (input?.value || "").trim();
    if (!msg) return;

    appendMsg("user", msg);
    input.value = "";

    setTimeout(() => {
      const reply =
        state.lang === "pt"
          ? "Recebido. (Simulador ativo) Se quiser registrar, use Arquivar/Exportar/Gerar."
          : "Received. (Simulator) To persist, use Archive/Export/Generate.";
      appendMsg("assistant", reply);
    }, 160);
  }

  function appendMsg(role, text) {
    const box = $("#chat-messages");
    if (!box) return;

    const empty = box.querySelector(".chat-empty");
    if (empty) empty.remove();

    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = `<div class="msg-body">${escapeHtml(text)}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  /* =========================
     11) Export (print)
     ========================= */
  function bindExport() {
    const btn = $("#btn-exportar");
    if (!btn) return;
    btn.addEventListener("click", () => window.print());
  }

  /* =========================
     12) Archive (localStorage)
     ========================= */
  function bindArchive() {
    const btn = $("#btn-salvar");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const protocolId = state.lastDraft?.protocolId || genProtocolId();

      const archive = loadArchive();
      archive.unshift({
        protocolId,
        ts: isoNow(),
        draft: state.lastDraft?.html || null,
        audit: state.lastAudit || null,
        files: [...state.files]
      });
      saveArchive(archive);

      state.lastArchive = { protocolId, ts: isoNow() };
      alert(i18n[state.lang].archivedOk);
    });
  }

  function loadArchive() {
    try {
      const raw = localStorage.getItem(STORAGE.archive);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveArchive(arr) {
    try {
      localStorage.setItem(STORAGE.archive, JSON.stringify(arr.slice(0, 50)));
    } catch (e) {
      console.error("[ARKHOS_UI] archive save error:", e);
    }
  }
})();
