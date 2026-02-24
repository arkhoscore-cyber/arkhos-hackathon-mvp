(() => {
  "use strict";

  /* =========================
     A) Guard + Error Hooks
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const safe = (fn) => { try { return fn(); } catch (e) { console.error(e); return null; } };

  window.addEventListener("error", (e) => {
    console.error("[ARKHOS_UI] window.error:", e?.error || e?.message || e);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[ARKHOS_UI] unhandledrejection:", e?.reason || e);
  });

  /* =========================
     B) SSOT (State)
     ========================= */
  const STORAGE = {
    lang: "arkhos_lang_v1",
    archive: "arkhos_archive_v1"
  };

  const state = {
    idioma: localStorage.getItem(STORAGE.lang) || "pt",
    tela: "pro", // pro | chat
    files: [], // {name,size,type,lastModified}
    lastAudit: null, // {axes, score, risk, viability, status}
    lastDraft: null, // {html, protocolId}
    lastArchive: null // {protocolId, ts}
  };

  /* =========================
     I18N (mínimo necessário)
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
      ajudaMsg: "AJUDA: Use PRO para minuta e CHAT para orientação. Arquivar salva um registro local (simulado).",
      configMsg: "CONFIG: Runtime local (simulador). Integração remota entra via STAR_SOCKET (futuro).",
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
      ajudaMsg: "HELP: Use PRO for draft and CHAT for guidance. Archive saves a local record (simulated).",
      configMsg: "CONFIG: Local runtime (simulator). Remote integration via STAR_SOCKET (future).",
      needMoreInfo: "More information required (fail-closed).",
      archivedOk: "Archived (local record generated)."
    }
  };

  /* =========================
     C) Boot
     ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    bindTabs();
    bindLanguage();
    bindTopActions();
    bindDirectInputs();
    bindUpload();
    bindChat();
    bindGenerate();
    bindArchive();
    bindExport();

    applyLanguage();
    setTela(state.tela);
    setHealthLocalOperational();
    renderAcervo();
    renderAudit(null); // limpa auditoria
    renderCanvasPlaceholder();
    renderChatEmpty();
    renderArchivePanel();
  });

  /* =========================
     L) Health (simples)
     ========================= */
  function setHealthLocalOperational() {
    const el = $("#status-core");
    if (!el) return;
    el.textContent = state.idioma === "pt" ? "OPERACIONAL" : "OPERATIONAL";
    el.classList.add("badge");
    el.dataset.health = "OPERATIONAL";
  }

  /* =========================
     C) Tabs / “tela separada”
     ========================= */
  function bindTabs() {
    const proBtn = $("#btn-pista-direta");
    const chatBtn = $("#btn-pista-guiada");

    if (proBtn) proBtn.addEventListener("click", () => setTela("pro"));
    if (chatBtn) chatBtn.addEventListener("click", () => setTela("chat"));
  }

  function setTela(which) {
    state.tela = which;

    const telaPro = $("#tela-pro");
    const telaChat = $("#tela-chat");
    const proBtn = $("#btn-pista-direta");
    const chatBtn = $("#btn-pista-guiada");

    if (telaPro) telaPro.hidden = which !== "pro";
    if (telaChat) telaChat.hidden = which !== "chat";

    if (proBtn) {
      proBtn.classList.toggle("ativo", which === "pro");
      proBtn.setAttribute("aria-selected", which === "pro" ? "true" : "false");
    }
    if (chatBtn) {
      chatBtn.classList.toggle("ativo", which === "chat");
      chatBtn.setAttribute("aria-selected", which === "chat" ? "true" : "false");
    }
  }

  /* =========================
     D) Language
     ========================= */
  function bindLanguage() {
    const pt = $("#btn-lang-pt");
    const en = $("#btn-lang-en");

    if (pt) pt.addEventListener("click", () => setLang("pt"));
    if (en) en.addEventListener("click", () => setLang("en"));
  }

  function setLang(lang) {
    state.idioma = lang === "en" ? "en" : "pt";
    localStorage.setItem(STORAGE.lang, state.idioma);
    applyLanguage();
    renderAudit(state.lastAudit); // reescreve textos de selos
    renderChatEmpty(); // reescreve placeholder
    renderCanvasPlaceholder(); // se estiver placeholder
    renderArchivePanel(); // reescreve mensagens
  }

  function applyLanguage() {
    const t = i18n[state.idioma];

    safe(() => { const el = $("#subtitle"); if (el) el.textContent = t.subtitle; });
    safe(() => { const el = $("#btn-pista-direta"); if (el) el.textContent = t.proTab; });
    safe(() => { const el = $("#btn-pista-guiada"); if (el) el.textContent = t.chatTab; });

    safe(() => { const el = $("#label-area"); if (el) el.textContent = t.labelArea; });
    safe(() => { const el = $("#label-input"); if (el) el.textContent = t.labelInput; });
    safe(() => { const el = $("#label-anexo"); if (el) el.textContent = t.labelAnexo; });

    safe(() => { const el = $("#titulo-analise"); if (el) el.textContent = t.analiseTitle; });
    safe(() => { const el = $("#lbl-e-metal"); if (el) el.textContent = t.eixoMetal; });
    safe(() => { const el = $("#lbl-e-estado"); if (el) el.textContent = t.eixoEstado; });
    safe(() => { const el = $("#lbl-e-legiao"); if (el) el.textContent = t.eixoLegiao; });
    safe(() => { const el = $("#lbl-e-logos"); if (el) el.textContent = t.eixoLogos; });

    safe(() => { const el = $("#btn-executar"); if (el) el.textContent = t.btnGerar; });
    safe(() => { const el = $("#label-metrica-1"); if (el) el.textContent = t.metrica1; });
    safe(() => { const el = $("#label-metrica-2"); if (el) el.textContent = t.metrica2; });
    safe(() => { const el = $("#btn-exportar"); if (el) el.textContent = t.exportBtn; });
    safe(() => { const el = $("#btn-salvar"); if (el) el.textContent = t.salvarBtn; });

    safe(() => {
      const input = $("#chat-input");
      if (input) input.placeholder = t.chatPh;
    });
    safe(() => { const el = $("#chat-send"); if (el) el.textContent = t.chatSend; });

    // Toggle active lang buttons
    safe(() => {
      const pt = $("#btn-lang-pt");
      const en = $("#btn-lang-en");
      if (pt) {
        pt.classList.toggle("active", state.idioma === "pt");
        pt.setAttribute("aria-pressed", state.idioma === "pt" ? "true" : "false");
      }
      if (en) {
        en.classList.toggle("active", state.idioma === "en");
        en.setAttribute("aria-pressed", state.idioma === "en" ? "true" : "false");
      }
    });

    // Health label language
    setHealthLocalOperational();
  }

  /* =========================
     K) Top actions
     ========================= */
  function bindTopActions() {
    const ajuda = $("#btn-top-ajuda");
    const config = $("#btn-top-config");
    if (ajuda) ajuda.addEventListener("click", () => alert(i18n[state.idioma].ajudaMsg));
    if (config) config.addEventListener("click", () => alert(i18n[state.idioma].configMsg));
  }

  /* =========================
     E) Upload (list + remove)
     ========================= */
  function bindUpload() {
    const input = $("#file-soberano");
    if (!input) return;

    input.addEventListener("change", () => {
      const files = Array.from(input.files || []).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified
      }));

      // merge sem duplicar por nome
      files.forEach((nf) => {
        if (!state.files.some((x) => x.name === nf.name)) state.files.push(nf);
      });

      // limpa input para permitir re-selecionar o mesmo arquivo depois
      input.value = "";

      renderAcervo();
      runAudit(); // acervo influencia eixo PROVAS
    });
  }

  function renderAcervo() {
    const box = $("#file-display-area");
    if (!box) return;

    const t = i18n[state.idioma];
    const tpl = $("#tpl-file-item");

    box.innerHTML = "";

    if (!state.files.length) {
      const p = document.createElement("p");
      p.className = "txt-vazio";
      p.textContent = t.acervoVazio;
      box.appendChild(p);

      // recoloca template (para não “sumir”)
      if (tpl) box.appendChild(tpl);
      return;
    }

    state.files.forEach((f, idx) => {
      if (tpl && tpl.content) {
        const node = tpl.content.cloneNode(true);
        const name = node.querySelector(".file-name");
        const rm = node.querySelector(".file-remove");

        if (name) name.textContent = f.name;
        if (rm) {
          rm.dataset.removeIndex = String(idx);
          rm.addEventListener("click", () => {
            state.files.splice(idx, 1);
            renderAcervo();
            runAudit();
          });
        }
        box.appendChild(node);
      } else {
        // fallback (se template não existir)
        const row = document.createElement("div");
        row.className = "file-item";
        row.innerHTML = `<span>${escapeHtml(f.name)}</span> <button type="button" data-remove-index="${idx}">✖</button>`;
        row.querySelector("button").addEventListener("click", () => {
          state.files.splice(idx, 1);
          renderAcervo();
          runAudit();
        });
        box.appendChild(row);
      }
    });

    // recoloca template no fim
    if (tpl) box.appendChild(tpl);
  }

  /* =========================
     F) Auditoria (simulada)
     ========================= */
  function bindDirectInputs() {
    const txt = $("#cmd-input");
    const area = $("#area-direito");

    if (txt) txt.addEventListener("input", () => runAudit());
    if (area) area.addEventListener("change", () => runAudit());
  }

  function runAudit() {
    const txtEl = $("#cmd-input");
    const areaEl = $("#area-direito");
    const btn = $("#btn-executar");

    const caseText = (txtEl?.value || "").trim();
    const area = (areaEl?.value || "civil").trim();

    // habilita botão por critério mínimo
    if (btn) btn.disabled = caseText.length < 10;

    // sem texto mínimo -> zera UI e fail-closed
    if (caseText.length < 10) {
      const audit = {
        status: "NEED_MORE_INFO",
        axes: { metal: 0, estado: clamp(state.files.length * 33, 0, 100), legiao: 0, logos: 0 },
        score: 0,
        risk: 100,
        viability: 0,
        area
      };
      state.lastAudit = audit;
      renderAudit(audit);
      return;
    }

    // simulador simples (coerente)
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
      viability: score,
      area
    };

    state.lastAudit = audit;
    renderAudit(audit);
  }

  function renderAudit(audit) {
    const t = i18n[state.idioma];

    // Barras
    setFill("#e-metal .fill", audit?.axes?.metal ?? 0);
    setFill("#e-estado .fill", audit?.axes?.estado ?? 0);
    setFill("#e-legiao .fill", audit?.axes?.legiao ?? 0);
    setFill("#e-logos .fill", audit?.axes?.logos ?? 0);

    // Selos
    const cert = $("#selo-cert");
    const aut = $("#selo-audit");

    if (!audit) {
      if (cert) { cert.className = "selo selo-off"; cert.textContent = t.certWait; }
      if (aut) { aut.className = "selo selo-off"; aut.textContent = t.auditWait; }
      setMetric("--", "--");
      return;
    }

    if (audit.status !== "OK") {
      if (cert) { cert.className = "selo selo-off"; cert.textContent = `CERT: FAIL-CLOSED`; }
      if (aut) { aut.className = "selo selo-off"; aut.textContent = t.needMoreInfo; }
      setMetric(audit.viability, audit.risk);
      return;
    }

    // OK
    if (cert) {
      cert.className = "selo selo-on";
      cert.textContent = `CERT: ${audit.score}/100`;
    }
    if (aut) {
      aut.className = "selo selo-on";
      aut.textContent = `AUTENTICIDADE: OK`;
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
    if (v) v.textContent = (viab === "--") ? "--" : String(viab);
    if (r) r.textContent = (risk === "--") ? "--" : String(risk);
  }

  /* =========================
     G) Gerar minuta (simulado)
     ========================= */
  function bindGenerate() {
    const btn = $("#btn-executar");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const txt = ($("#cmd-input")?.value || "").trim();
      const area = ($("#area-direito")?.value || "civil").trim();

      if (txt.length < 10) {
        // fail-closed
        renderAudit({ ...(state.lastAudit || {}), status: "NEED_MORE_INFO" });
        alert(i18n[state.idioma].needMoreInfo);
        return;
      }

      const protocolId = genProtocolId();
      const html = buildDraftHtml({ txt, area, protocolId, files: state.files });

      state.lastDraft = { html, protocolId };
      renderDraft(html);
      renderRastreioAfterDraft(protocolId);
    });
  }

  function buildDraftHtml({ txt, area, protocolId, files }) {
    const title = state.idioma === "pt" ? "MINUTA TÉCNICA" : "LEGAL DRAFT";
    const labelProto = state.idioma === "pt" ? "PROTOCOLO" : "PROTOCOL";
    const labelArea = state.idioma === "pt" ? "ÁREA" : "FIELD";
    const labelAnx = state.idioma === "pt" ? "ANEXOS" : "ATTACHMENTS";

    return `
      <div style="color:#000;font-family:Times New Roman,serif;padding:24px;">
        <h2 style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin:0 0 14px 0;">
          ${escapeHtml(title)} — ${escapeHtml(area.toUpperCase())}
        </h2>

        <p style="margin:6px 0;"><strong>${escapeHtml(labelProto)}:</strong> ${escapeHtml(protocolId)}</p>
        <p style="margin:6px 0;"><strong>${escapeHtml(labelArea)}:</strong> ${escapeHtml(area)}</p>

        <hr style="border:0;border-top:1px solid #000;margin:14px 0;">

        <p style="margin:6px 0;"><strong>${state.idioma === "pt" ? "CONTEÚDO" : "CONTENT"}:</strong></p>
        <div style="white-space:pre-wrap;text-align:justify;line-height:1.45;">
          ${escapeHtml(txt)}
        </div>

        <p style="margin:14px 0 0 0;"><strong>${escapeHtml(labelAnx)}:</strong> ${files.length}</p>
      </div>
    `;
  }

  function renderDraft(html) {
    const canvas = $("#output-canvas");
    if (!canvas) return;
    canvas.innerHTML = html;
  }

  function renderCanvasPlaceholder() {
    const canvas = $("#output-canvas");
    const ph = $("#txt-placeholder");
    if (!canvas || !ph) return;

    // só reescreve se estiver no placeholder (não sobrescreve minuta)
    const isPlaceholder = canvas.querySelector(".placeholder-msg");
    if (isPlaceholder) {
      ph.textContent = i18n[state.idioma].placeholderCanvas;
    }
  }

  /* =========================
     H) Chat
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

    // chips
    $$(".chip-action").forEach((chip) => {
      chip.addEventListener("click", () => {
        const intent = chip.dataset.intent || "";
        const i = $("#chat-input");
        if (!i) return;
        i.value = state.idioma === "pt" ? `Quero ${intent}. Contexto: ` : `I want ${intent}. Context: `;
        i.focus();
      });
    });
  }

  function renderChatEmpty() {
    const box = $("#chat-messages");
    if (!box) return;

    // se já tiver mensagens reais, não apaga
    const hasMsg = box.querySelector(".msg");
    if (hasMsg) return;

    box.innerHTML = `
      <div class="chat-empty">
        <p>${escapeHtml(i18n[state.idioma].chatEmpty)}</p>
      </div>
    `;

    const input = $("#chat-input");
    if (input) input.placeholder = i18n[state.idioma].chatPh;
  }

  function sendChat() {
    const input = $("#chat-input");
    const msg = (input?.value || "").trim();
    if (!msg) return;

    appendMsg("user", msg);
    input.value = "";

    // simulador: resposta curta
    setTimeout(() => {
      const reply = state.idioma === "pt"
        ? "Recebido. (Simulador) Se quiser registrar, use Arquivar/Exportar/Gerar."
        : "Received. (Simulator) To persist, use Archive/Export/Generate.";
      appendMsg("assistant", reply);
    }, 180);
  }

  function appendMsg(role, text) {
    const box = $("#chat-messages");
    if (!box) return;

    // se estava vazio, remove placeholder
    const empty = box.querySelector(".chat-empty");
    if (empty) empty.remove();

    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = `<div class="msg-body">${escapeHtml(text)}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  /* =========================
     I) Archive
     ========================= */
  function bindArchive() {
    const btn = $("#btn-salvar");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const protocolId = state.lastDraft?.protoc
