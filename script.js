/* =========================================================
   ARKHOS UI v0 — Script (UI Controller + STAR_SOCKET)
   Objetivo: Interface pronta para Motor Remoto (Azure) sem quebrar o simulador local.
   - Modo Direto: pode usar rascunho local (opcional) + auditoria/minuta via Adapter
   - Assistente (Chat): VOLÁTIL por padrão (não persiste automático)
   - Portas abertas: health/audit/draft/chat/archive (STAR_SOCKET_V0)
   ========================================================= */

(() => {
  "use strict";

  /* =========================
     0) I18N (PT/EN)
     ========================= */
  const i18n = {
    pt: {
      cabecalhoSub: "ESTAÇÃO DE CONFORMIDADE E MINUTAGEM TÉCNICA",
      motorConnecting: "CONECTANDO",
      motorOperational: "OPERACIONAL",
      motorOffline: "OFFLINE",
      motorDegraded: "DEGRADADO",
      modoPro: "MODO PROFISSIONAL (MINUTA)",
      modoAssistente: "ASSISTENTE JURÍDICO (CHAT)",
      labelArea: "COMPETÊNCIA / ÁREA DE ATUAÇÃO",
      labelInputPro: "INSTRUÇÃO TÉCNICA DA MINUTA",
      labelAnexo: "📎 APORTAR LASTRO DOCUMENTAL (ACERVO)",
      tituloAnalise: "ANÁLISE DE CONFORMIDADE PROCESSUAL",
      eixoLogica: "LÓGICA (Estrutura)",
      eixoProvas: "PROVAS (Acervo)",
      eixoContexto: "CONTEXTO (Jurisprudência)",
      eixoDireito: "DIREITO (Fundamentação)",
      btnGerar: "GERAR MINUTA E PROTOCOLAR",
      metricaViabilidade: "MÉTRICA DE VIABILIDADE",
      metricaRisco: "MARGEM DE RISCO TÉCNICO",
      placeholderCanvas: "Aguardando instrução técnica e acervo probatório para compilar o documento.",
      acervoVazio: "Acervo probatório vazio. Aguardando documentos...",
      btnExport: "📥 EXPORTAR DOCUMENTO (PDF LIMPO)",
      btnSalvar: "💾 ARQUIVAR NO SISTEMA",
      rastreioWaiting: "Aguardando resposta do motor para emitir CERT e selos.",
      ledgerEmpty: "Nenhum protocolo registrado nesta sessão.",
      evidenciasEmpty: "Sem evidências anexadas ao resultado (ainda).",
      chatEmpty: "Digite sua consulta. O assistente vai conduzir as perguntas necessárias e apontar o que falta para “passar” no fail-closed.",
      chatInputPh: "Escreva sua consulta jurídica...",
      chatSend: "Enviar",
      runtimeLocal: "LOCAL SIMULADOR",
      runtimeRemote: "REMOTO GOVERNADO",
      healthConnecting: "CONNECTING",
      healthOperational: "OPERATIONAL",
      healthOffline: "OFFLINE",
      healthDegraded: "DEGRADED",
      archivedOk: "Arquivado no sistema (registro gerado).",
      needMoreInfo: "Faltam informações para prosseguir (fail-closed).",
      errorGeneric: "Falha na operação. Tente novamente."
    },
    en: {
      cabecalhoSub: "COMPLIANCE STATION AND TECHNICAL DRAFTING",
      motorConnecting: "CONNECTING",
      motorOperational: "OPERATIONAL",
      motorOffline: "OFFLINE",
      motorDegraded: "DEGRADED",
      modoPro: "PROFESSIONAL MODE (DRAFT)",
      modoAssistente: "LEGAL ASSISTANT (CHAT)",
      labelArea: "JURISDICTION / FIELD OF PRACTICE",
      labelInputPro: "TECHNICAL DRAFT INSTRUCTION",
      labelAnexo: "📎 ATTACH PROBATORY ASSETS (VAULT)",
      tituloAnalise: "PROCEDURAL COMPLIANCE ANALYSIS",
      eixoLogica: "LOGIC (Structure)",
      eixoProvas: "EVIDENCE (Assets)",
      eixoContexto: "CONTEXT (Case Law)",
      eixoDireito: "LAW (Legal Basis)",
      btnGerar: "GENERATE AND PROTOCOL DRAFT",
      metricaViabilidade: "VIABILITY SCORE",
      metricaRisco: "TECHNICAL RISK MARGIN",
      placeholderCanvas: "Waiting for technical instructions and evidence to compile document.",
      acervoVazio: "Evidence vault empty. Waiting for documents...",
      btnExport: "📥 EXPORT DOCUMENT (CLEAN PDF)",
      btnSalvar: "💾 ARCHIVE IN SYSTEM",
      rastreioWaiting: "Waiting for engine response to issue CERT and seals.",
      ledgerEmpty: "No protocol registered in this session.",
      evidenciasEmpty: "No evidence linked to the output (yet).",
      chatEmpty: "Type your request. The assistant will ask what’s missing to pass fail-closed.",
      chatInputPh: "Write your legal request...",
      chatSend: "Send",
      runtimeLocal: "LOCAL SIMULATOR",
      runtimeRemote: "REMOTE GOVERNED",
      healthConnecting: "CONNECTING",
      healthOperational: "OPERATIONAL",
      healthOffline: "OFFLINE",
      healthDegraded: "DEGRADED",
      archivedOk: "Archived (record generated).",
      needMoreInfo: "More information required (fail-closed).",
      errorGeneric: "Operation failed. Try again."
    }
  };

  /* =========================
     1) DOM Helpers
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function safeText(el, txt) { if (el) el.innerText = txt; }
  function safeHtml(el, html) { if (el) el.innerHTML = html; }
  function setHidden(el, hidden) { if (el) el.hidden = !!hidden; }

  /* =========================
     2) Estado do Sistema (UI)
     ========================= */
  const STORAGE = {
    lang: "arkhos_lang",
    uiData: "arkhos_ui_data_v0" // usado só para MODO DIRETO (rascunho), se quiser
  };

  const sistema = {
    idioma: localStorage.getItem(STORAGE.lang) || "pt",

    // Modo de UI: 'direto' | 'assistente'
    modo: "direto",

    // Runtime: 'LOCAL_SIMULADOR' | 'REMOTO_GOVERNADO'
    runtime: document.documentElement?.dataset?.uiMode === "REMOTO_GOVERNADO"
      ? "REMOTO_GOVERNADO"
      : "LOCAL_SIMULADOR",

    // Health state: CONNECTING | OPERATIONAL | OFFLINE | DEGRADED
    health: "CONNECTING",

    dados: {
      // Persistência opcional (apenas rascunho do modo direto)
      direto: {
        texto: "",
        area: "civil",
        anexos: [] // metadados: {name, size?, type?, lastModified?}
      }
    },

    // Chat volátil
    chat: {
      mensagens: [] // {role: 'user'|'assistant'|'system', content, ts}
    },

    // Último resultado do motor (para rastreabilidade)
    last: {
      protocolId: null,
      cert: null,
      ledger: [],
      evidence: []
    }
  };

  /* =========================
     3) Portas (STAR_SOCKET_V0)
     ========================= */
  function readStarSocket() {
    const port = $("#motor-port");
    if (!port) return null;

    return {
      id: port.dataset.port || "STAR_SOCKET_V0",
      endpoints: {
        health: port.dataset.healthEndpoint || "/health",
        audit: port.dataset.auditEndpoint || "/audit",
        draft: port.dataset.draftEndpoint || "/draft",
        chat: port.dataset.chatEndpoint || "/chat",
        archive: port.dataset.archiveEndpoint || "/archive"
      },
      auth: port.dataset.auth || "GATEWAY_TOKEN",
      runtime: port.dataset.runtime || "LOCAL_SIMULADOR"
    };
  }

  const STAR_SOCKET = readStarSocket();

  /* =========================
     4) MotorAdapter (LOCAL stub + REMOTO placeholder)
     ========================= */
  const MotorAdapter = {
    async health() {
      // Porta pronta: se runtime for REMOTO, aqui entra fetch real.
      if (sistema.runtime === "REMOTO_GOVERNADO") {
        // Placeholder seguro: tenta, mas se falhar, degrada.
        try {
          const res = await fetch(STAR_SOCKET?.endpoints?.health || "/health", { method: "GET" });
          if (!res.ok) throw new Error("health_not_ok");
          const data = await res.json();
          return {
            ok: true,
            state: data.state || "OPERATIONAL",
            latencyMs: data.latency_ms ?? null,
            engineVersion: data.engine_version ?? null
          };
        } catch {
          return { ok: false, state: "OFFLINE", latencyMs: null, engineVersion: null };
        }
      }

      // LOCAL: sempre operacional (simulador)
      return { ok: true, state: "OPERATIONAL", latencyMs: 0, engineVersion: "LOCAL_SIM" };
    },

    async audit(payload) {
      if (sistema.runtime === "REMOTO_GOVERNADO") {
        try {
          const res = await fetch(STAR_SOCKET?.endpoints?.audit || "/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          return data;
        } catch {
          return { status: "ERROR", fail_closed_reason: "NETWORK_OR_ENGINE_ERROR" };
        }
      }

      // LOCAL: auditoria simples (simulador)
      const txt = (payload.case_text || "").trim();
      const anexos = payload.attachments || [];

      const metal = clamp(Math.floor(txt.length / 10), 0, 100);
      const estado = clamp(anexos.length * 33, 0, 100);
      const legiao = clamp(Math.floor(txt.split(/\s+/).length / 3), 0, 100);
      const logos = clamp(txt.length > 120 ? 60 : txt.length > 40 ? 35 : 10, 0, 100);

      const score = Math.floor((metal + estado + legiao + logos) / 4);
      const risk = clamp(100 - score, 0, 100);

      if (txt.length < 10) {
        return {
          status: "NEED_MORE_INFO",
          fail_closed_reason: "INSUFFICIENT_CASE_TEXT",
          result: { audit: { axes: { metal, estado, legiao, logos }, score, risk } },
          cert: { score, selos: ["FAIL_CLOSED"], integridade: "LOW" },
          evidence: [],
          causal_chain: [{ event: "AUDIT", decision: "NEED_MORE_INFO", ts: isoNow() }],
          warnings: ["Texto insuficiente para auditoria mínima."]
        };
      }

      return {
        status: "OK",
        result: {
          audit: { axes: { metal, estado, legiao, logos }, score, risk, viability: score }
        },
        cert: {
          score,
          selos: score > 70 ? ["CERT_OK", "BASE_MINIMA"] : ["CERT_PAR", "BASE_INCOMPLETA"],
          integridade: score > 70 ? "HIGH" : "MEDIUM"
        },
        evidence: anexos.map((a, idx) => ({ id: `ATT-${idx + 1}`, hash: a.hash || "", trecho: a.name })),
        causal_chain: [{ event: "AUDIT", decision: "OK", ts: isoNow() }],
        warnings: score < 50 ? ["Base fraca: risco técnico elevado."] : []
      };
    },

    async draft(payload) {
      if (sistema.runtime === "REMOTO_GOVERNADO") {
        try {
          const res = await fetch(STAR_SOCKET?.endpoints?.draft || "/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          return await res.json();
        } catch {
          return { status: "ERROR", fail_closed_reason: "NETWORK_OR_ENGINE_ERROR" };
        }
      }

      // LOCAL: minuta simples (simulador)
      const txt = (payload.case_text || "").trim();
      if (txt.length < 10) {
        return {
          status: "NEED_MORE_INFO",
          fail_closed_reason: "INSUFFICIENT_CASE_TEXT",
          warnings: ["Texto insuficiente para gerar minuta mínima."]
        };
      }

      const protocolo = genProtocol();
      const area = (payload.case_meta?.area || "civil").toUpperCase();
      const anexos = payload.attachments || [];

      const html = `
        <div style="color:black; font-family:serif; padding:20px;">
          <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px;">
            ${sistema.idioma === "pt" ? "MINUTA TÉCNICA" : "LEGAL DRAFT"}: ${area}
          </h2>
          <p><strong>${sistema.idioma === "pt" ? "PROTOCOLO" : "PROTOCOL ID"}:</strong> ${protocolo}</p>
          <p><strong>${sistema.idioma === "pt" ? "MODO DE EMISSÃO" : "ISSUANCE MODE"}:</strong> ${payload.mode || "rascunho"}</p>
          <hr>
          <p><strong>${sistema.idioma === "pt" ? "DETALHAMENTO" : "LEGAL ANALYSIS"}:</strong></p>
          <p style="text-align:justify; white-space:pre-wrap;">${escapeHtml(txt)}</p>
          <p><strong>${sistema.idioma === "pt" ? "LASTRO DE PROVAS" : "EVIDENCE VAULT"}:</strong> ${anexos.length} item(s).</p>
        </div>
      `;

      return {
        status: "OK",
        result: { draft: { html, protocol_id: protocolo } },
        cert: { score: 70, selos: ["DRAFT_OK"], integridade: "MEDIUM" },
        evidence: anexos.map((a, idx) => ({ id: `ATT-${idx + 1}`, hash: a.hash || "", trecho: a.name })),
        causal_chain: [{ event: "DRAFT", decision: "OK", ts: isoNow() }],
        warnings: []
      };
    },

    async chat(payload) {
      if (sistema.runtime === "REMOTO_GOVERNADO") {
        try {
          const res = await fetch(STAR_SOCKET?.endpoints?.chat || "/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          return await res.json();
        } catch {
          return { status: "ERROR", fail_closed_reason: "NETWORK_OR_ENGINE_ERROR" };
        }
      }

      // LOCAL: “assistente” simples (simulador)
      const msg = (payload.message || "").trim();
      if (!msg) return { status: "REJECT", warnings: ["Mensagem vazia."] };

      const need = msg.length < 30;
      if (need) {
        return {
          status: "NEED_MORE_INFO",
          result: {
            chat: {
              reply:
                sistema.idioma === "pt"
                  ? "Preciso de mais base: descreva fatos, datas, partes e o que você quer (petição, resumo, revisão ou relatório)."
                  : "I need more details: facts, dates, parties, and your goal (draft, summary, review, report).",
              intent: "NEED_MORE_INFO",
              actions: ["ASK_FACTS", "ASK_PARTIES"]
            }
          },
          cert: { score: 35, selos: ["FAIL_CLOSED"], integridade: "LOW" },
          causal_chain: [{ event: "CHAT", decision: "NEED_MORE_INFO", ts: isoNow() }],
          evidence: [],
          warnings: []
        };
      }

      const intent = detectIntent(msg);
      return {
        status: "OK",
        result: {
          chat: {
            reply:
              sistema.idioma === "pt"
                ? `Entendido. Vou atuar como assistente jurídico. Intenção detectada: ${intent}. Se quiser registrar, use Arquivar/Exportar/Gerar.`
                : `Understood. I’ll act as your legal assistant. Detected intent: ${intent}. To persist, use Archive/Export/Generate.`,
            intent,
            actions: ["SUGGEST_DRAFT", "SUGGEST_AUDIT"]
          }
        },
        cert: { score: 55, selos: ["CHAT_OK"], integridade: "MEDIUM" },
        causal_chain: [{ event: "CHAT", decision: "OK", ts: isoNow() }],
        evidence: [],
        warnings: []
      };
    },

    async archive(payload) {
      // No hackathon: pode ser só “simulado” local. Remoto: endpoint real.
      if (sistema.runtime === "REMOTO_GOVERNADO") {
        try {
          const res = await fetch(STAR_SOCKET?.endpoints?.archive || "/archive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          return await res.json();
        } catch {
          return { status: "ERROR" };
        }
      }

      return {
        status: "OK",
        result: { archive: { protocol_id: payload.protocol_id || genProtocol(), stored: true } }
      };
    }
  };

  /* =========================
     5) Boot
     ========================= */
  document.addEventListener("DOMContentLoaded", async () => {
    carregarRascunhoDireto(); // opcional: mantém só o modo direto
    bindUI();
    aplicarIdioma();
    renderModo();
    atualizarAcervoUI();
    renderRastreabilidade(null); // limpa

    // Health inicial
    await refreshHealth();
    // Auditoria inicial (se tiver texto)
    await auditarSeDer();
  });

  /* =========================
     6) Binds UI
     ========================= */
  function bindUI() {
    // Idioma (compat com onclick do HTML)
    window.mudarIdioma = (sigla) => {
      sistema.idioma = sigla === "en" ? "en" : "pt";
      localStorage.setItem(STORAGE.lang, sistema.idioma);
      aplicarIdioma();
      // re-render do placeholder e labels
      renderModo();
      renderRastreabilidade(null, true);
    };

    // Tabs / Modo
    const btnDireto = $("#btn-pista-direta");
    const btnChat = $("#btn-pista-guiada");

    if (btnDireto) btnDireto.onclick = () => setModo("direto");
    if (btnChat) btnChat.onclick = () => setModo("assistente");

    // Direto: inputs
    const cmd = $("#cmd-input");
    if (cmd) {
      cmd.oninput = async (e) => {
        sistema.dados.direto.texto = e.target.value;
        salvarRascunhoDireto();
        await auditarSeDer();
      };
    }

    const area = $("#area-direito");
    if (area) {
      area.onchange = async (e) => {
        sistema.dados.direto.area = e.target.value;
        salvarRascunhoDireto();
        atualizarLabelsMetricas();
        await auditarSeDer();
      };
    }

    // Upload (metadados apenas)
    const file = $("#file-soberano");
    if (file) {
      file.onchange = async (e) => {
        const novos = Array.from(e.target.files || []);
        novos.forEach((f) => {
          if (!sistema.dados.direto.anexos.some((x) => x.name === f.name)) {
            sistema.dados.direto.anexos.push({
              name: f.name,
              size: f.size,
              type: f.type,
              lastModified: f.lastModified
            });
          }
        });
        salvarRascunhoDireto();
        atualizarAcervoUI();
        await auditarSeDer();
      };
    }

    // Gerar minuta
    const btnGerar = $("#btn-executar");
    if (btnGerar) {
      btnGerar.onclick = async () => {
        await gerarMinuta();
      };
    }

    // Exportar (print)
    const btnExport = $("#btn-exportar");
    if (btnExport) btnExport.onclick = () => window.print();

    // Arquivar
    const btnSalvar = $("#btn-salvar");
    if (btnSalvar) {
      btnSalvar.onclick = async () => {
        await arquivar();
      };
    }

    // Chat input (volátil)
    const chatSend = $("#chat-send");
    const chatInput = $("#chat-input");
    if (chatSend) chatSend.onclick = () => enviarChat();
    if (chatInput) {
      chatInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          enviarChat();
        }
      });
    }

    // Chips de intenção
    $$(".chip-action").forEach((chip) => {
      chip.addEventListener("click", () => {
        const intent = chip.dataset.intent || "";
        if (chatInput) {
          const t = i18n[sistema.idioma];
          const seed =
            sistema.idioma === "pt"
              ? `Quero ${intent}. Contexto: `
              : `I want ${intent}. Context: `;
          chatInput.value = seed;
          chatInput.focus();
        }
      });
    });
  }

  /* =========================
     7) UI: Idioma / Labels
     ========================= */
  function aplicarIdioma() {
    const t = i18n[sistema.idioma];

    safeText($(".subtitle"), t.cabecalhoSub);

    // Botões de modo
    safeText($("#btn-pista-direta"), t.modoPro);
    safeText($("#btn-pista-guiada"), t.modoAssistente);

    // Labels e auditoria
    safeText($("#label-area"), t.labelArea);
    safeText($("#label-input"), t.labelInputPro);
    safeText($("#label-anexo"), t.labelAnexo);

    safeText($(".monitor-integridade h3"), t.tituloAnalise);
    safeText($("#e-metal label"), t.eixoLogica);
    safeText($("#e-estado label"), t.eixoProvas);
    safeText($("#e-legiao label"), t.eixoContexto);
    safeText($("#e-logos label"), t.eixoDireito);

    // Botões
    safeText($("#btn-executar"), t.btnGerar);
    safeText($("#btn-exportar"), t.btnExport);
    safeText($("#btn-salvar"), t.btnSalvar);

    // Métricas
    safeText($("#label-metrica-2"), t.metricaRisco);
    atualizarLabelsMetricas();

    // Chat
    const chatInput = $("#chat-input");
    if (chatInput) chatInput.placeholder = t.chatInputPh;
    safeText($("#chat-send"), t.chatSend);

    // Botões de idioma UI
    const ptBtn = $("#btn-lang-pt");
    const enBtn = $("#btn-lang-en");
    if (ptBtn) ptBtn.classList.toggle("active", sistema.idioma === "pt");
    if (enBtn) enBtn.classList.toggle("active", sistema.idioma === "en");
  }

  function atualizarLabelsMet
