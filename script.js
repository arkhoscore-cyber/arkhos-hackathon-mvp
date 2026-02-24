/* ARKHOS_UI — script.js (offline-first, sem libs, LOCAL_SIMULADOR) */
(() => {
  'use strict';

  // =============== C1) STATE / STORAGE ===============
  const LS = {
    lang: 'arkhos_lang_v1',
    tab: 'arkhos_tab_v1',
    archive: 'arkhos_archive_v1',
    session: 'arkhos_session_v1'
  };

  const MAX_ARCHIVE = 50;

  const state = {
    lang: 'pt',
    tab: 'pro',
    areaValue: 'civil',
    files: [], // {id,name,size,type,lastModified}
    draftHtml: '',
    audit: null, // {scores:{metal,estado,legiao,logos}, certScore, status, motivo, evidencias:[], ledger:[]}
    chat: [] // {role:'me'|'bot', text, ts}
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Safe get element; returns null (no throw)
  const el = {
    btnLangPt: () => $('#btn-lang-pt'),
    btnLangEn: () => $('#btn-lang-en'),
    btnAjuda: () => $('#btn-ajuda'),
    btnConfig: () => $('#btn-config'),
    modalAjuda: () => $('#modal-ajuda'),
    modalConfig: () => $('#modal-config'),
    btnAjudaFechar: () => $('#btn-ajuda-fechar'),
    btnConfigFechar: () => $('#btn-config-fechar'),
    btnLimparSessao: () => $('#btn-limpar-sessao'),
    btnCompartilhar: () => $('#btn-compartilhar'),

    btnTabPro: () => $('#btn-tab-pro'),
    btnTabChat: () => $('#btn-tab-chat'),
    telaPro: () => $('#tela-pro'),
    telaChat: () => $('#tela-chat'),

    area: () => $('#area-direito'),
    cmd: () => $('#cmd-input'),
    btnGerar: () => $('#btn-executar'),
    btnExportar: () => $('#btn-exportar'),
    btnArquivar: () => $('#btn-arquivar'),

    fileInput: () => $('#file-soberano'),
    btnLimparAnexos: () => $('#btn-limpar-anexos'),
    tplFile: () => $('#tpl-file-item'),
    listaArquivos: () => $('#lista-arquivos'),
    filesEmpty: () => $('#files-empty'),

    seloCert: () => $('#selo-cert'),
    seloAuth: () => $('#selo-auth'),
    barMetal: () => $('#bar-metal'),
    barEstado: () => $('#bar-estado'),
    barLegiao: () => $('#bar-legiao'),
    barLogos: () => $('#bar-logos'),
    vMetal: () => $('#v-metal'),
    vEstado: () => $('#v-estado'),
    vLegiao: () => $('#v-legiao'),
    vLogos: () => $('#v-logos'),
    auditMotivo: () => $('#audit-motivo'),

    certResumo: () => $('#cert-resumo'),
    ledgerResumo: () => $('#ledger-resumo'),
    evidenciasResumo: () => $('#evidencias-resumo'),

    out: () => $('#output-canvas'),
    placeholder: () => $('#txt-placeholder'),
    printOnly: () => $('#secao-impressao-isolada'),

    listaArquivados: () => $('#lista-arquivados'),
    archiveEmpty: () => $('#archive-empty'),
    btnLimparArchive: () => $('#btn-limpar-archive'),

    chatMessages: () => $('#chat-messages'),
    chatInput: () => $('#chat-input'),
    chatSend: () => $('#chat-send'),
    chatArquivar: () => $('#chat-arquivar'),
    chatLimpar: () => $('#chat-limpar'),
  };

  function nowTs() { return Date.now(); }

  function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  function loadLS(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return safeJsonParse(raw, fallback);
  }

  function saveLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // =============== C2) i18n + ARIA PRESSED ===============
  const I18N = {
    pt: {
      proTitle: 'Modo Profissional',
      chatTitle: 'Assistente Jurídico',
      area: 'Área',
      instrucao: 'Instrução',
      instrucaoPh: 'Descreva o caso e o que você precisa (mín. 10 caracteres).',
      gerar: 'GERAR MINUTA',
      exportar: 'EXPORTAR PDF',
      arquivar: 'ARQUIVAR SESSÃO',
      failClosed: 'Fail-closed: informe uma instrução válida para habilitar a geração.',
      acervo: 'Acervo Probatório',
      removerTodos: 'REMOVER TODOS',
      auditoria: 'Auditoria (Simulador)',
      rastreio: 'Rastreabilidade',
      aguardando: 'Aguardando…',
      aguardandoGeracao: 'Aguardando geração para auditoria.',
      documento: 'Documento',
      aguardandoDoc: 'Aguardando geração…',
      enviar: 'ENVIAR',
      chatPh: 'Escreva sua mensagem…',
      arquivarChat: 'ARQUIVAR CHAT',
      limparChat: 'LIMPAR CHAT',
      arquivados: 'Arquivados',
      nenhumArquivado: 'Nenhum arquivado.',
      nenhumArquivo: 'Nenhum arquivo anexado.',
      ajuda: 'Ajuda',
      config: 'Config',
      limparSessao: 'LIMPAR SESSÃO',
      compartilhar: 'COMPARTILHAR',
      shareHint: '“Compartilhar” usa recursos nativos quando disponíveis (Android) ou fallback para copiar texto.',
      alertArquivado: 'Arquivado.',
      alertLimpo: 'Limpo.',
      alertCopiado: 'Copiado para a área de transferência.',
      exportFalha: 'Export falhou. Tente novamente.',
      precisaGerar: 'Gere uma minuta antes de exportar.',
      precisaInstrucao: 'Instrução insuficiente (mín. 10 caracteres).'
    },
    en: {
      proTitle: 'Professional Mode',
      chatTitle: 'Legal Assistant',
      area: 'Area',
      instrucao: 'Instruction',
      instrucaoPh: 'Describe the case and what you need (min 10 characters).',
      gerar: 'GENERATE DRAFT',
      exportar: 'EXPORT PDF',
      arquivar: 'ARCHIVE SESSION',
      failClosed: 'Fail-closed: provide a valid instruction to enable generation.',
      acervo: 'Evidence Collection',
      removerTodos: 'REMOVE ALL',
      auditoria: 'Audit (Simulator)',
      rastreio: 'Traceability',
      aguardando: 'Waiting…',
      aguardandoGeracao: 'Waiting for generation to audit.',
      documento: 'Document',
      aguardandoDoc: 'Waiting for generation…',
      enviar: 'SEND',
      chatPh: 'Type your message…',
      arquivarChat: 'ARCHIVE CHAT',
      limparChat: 'CLEAR CHAT',
      arquivados: 'Archived',
      nenhumArquivado: 'No archives.',
      nenhumArquivo: 'No files attached.',
      ajuda: 'Help',
      config: 'Config',
      limparSessao: 'CLEAR SESSION',
      compartilhar: 'SHARE',
      shareHint: '“Share” uses native features when available (Android) or clipboard fallback.',
      alertArquivado: 'Archived.',
      alertLimpo: 'Cleared.',
      alertCopiado: 'Copied to clipboard.',
      exportFalha: 'Export failed. Try again.',
      precisaGerar: 'Generate a draft before exporting.',
      precisaInstrucao: 'Insufficient instruction (min 10 characters).'
    }
  };

  function t(key) {
    const pack = I18N[state.lang] || I18N.pt;
    return pack[key] ?? I18N.pt[key] ?? key;
  }

  function applyI18n() {
    document.documentElement.lang = state.lang === 'pt' ? 'pt-BR' : 'en';

    // aria-pressed
    const pt = el.btnLangPt();
    const en = el.btnLangEn();
    if (pt && en) {
      pt.setAttribute('aria-pressed', String(state.lang === 'pt'));
      en.setAttribute('aria-pressed', String(state.lang === 'en'));
      pt.classList.toggle('active', state.lang === 'pt');
      en.classList.toggle('active', state.lang === 'en');
    }

    // Text nodes
    const proTitle = $('#pro-title'); if (proTitle) proTitle.textContent = t('proTitle');
    const chatTitle = $('#chat-title'); if (chatTitle) chatTitle.textContent = t('chatTitle');
    const lblArea = $('#lbl-area'); if (lblArea) lblArea.textContent = t('area');
    const lblInstr = $('#lbl-instrucao'); if (lblInstr) lblInstr.textContent = t('instrucao');
    const cmd = el.cmd(); if (cmd) cmd.placeholder = t('instrucaoPh');

    const btnGerar = el.btnGerar(); if (btnGerar) btnGerar.textContent = t('gerar');
    const btnExportar = el.btnExportar(); if (btnExportar) btnExportar.textContent = t('exportar');
    const btnArquivar = el.btnArquivar(); if (btnArquivar) btnArquivar.textContent = t('arquivar');
    const hint = $('#hint-failclosed'); if (hint) hint.textContent = t('failClosed');

    const ttlAcervo = $('#ttl-acervo'); if (ttlAcervo) ttlAcervo.textContent = t('acervo');
    const btnLimparAnexos = el.btnLimparAnexos(); if (btnLimparAnexos) btnLimparAnexos.textContent = t('removerTodos');

    const ttlAud = $('#ttl-auditoria'); if (ttlAud) ttlAud.textContent = t('auditoria');
    const ttlRas = $('#ttl-rastreio'); if (ttlRas) ttlRas.textContent = t('rastreio');

    const ttlCanvas = $('#ttl-canvas'); if (ttlCanvas) ttlCanvas.textContent = t('documento');
    const placeholder = el.placeholder(); if (placeholder && !state.draftHtml) placeholder.textContent = t('aguardandoDoc');

    const chatInput = el.chatInput(); if (chatInput) chatInput.placeholder = t('chatPh');
    const chatSend = el.chatSend(); if (chatSend) chatSend.textContent = t('enviar');

    const chatArquivar = el.chatArquivar(); if (chatArquivar) chatArquivar.textContent = t('arquivarChat');
    const chatLimpar = el.chatLimpar(); if (chatLimpar) chatLimpar.textContent = t('limparChat');

    const ttlArquivados = $('#ttl-arquivados'); if (ttlArquivados) ttlArquivados.textContent = t('arquivados');
    const archiveEmpty = el.archiveEmpty(); if (archiveEmpty) archiveEmpty.textContent = t('nenhumArquivado');

    const filesEmpty = el.filesEmpty(); if (filesEmpty) filesEmpty.textContent = t('nenhumArquivo');

    const btnAjuda = el.btnAjuda(); if (btnAjuda) btnAjuda.textContent = t('ajuda').toUpperCase();
    const btnConfig = el.btnConfig(); if (btnConfig) btnConfig.textContent = t('config').toUpperCase();

    const modalAjTitle = $('#modal-ajuda-title'); if (modalAjTitle) modalAjTitle.textContent = t('ajuda');
    const modalCfgTitle = $('#modal-config-title'); if (modalCfgTitle) modalCfgTitle.textContent = t('config');
    const btnLimparSessao = el.btnLimparSessao(); if (btnLimparSessao) btnLimparSessao.textContent = t('limparSessao');
    const btnCompartilhar = el.btnCompartilhar(); if (btnCompartilhar) btnCompartilhar.textContent = t('compartilhar');
    const cfgHint = $('#config-hint'); if (cfgHint) cfgHint.textContent = t('shareHint');

    // Audit fallback texts
    const auditMotivo = el.auditMotivo();
    if (auditMotivo && (!state.audit || !state.audit.motivo)) auditMotivo.textContent = t('aguardandoGeracao');

    // Trace placeholders if empty
    if (!state.audit) {
      const cr = el.certResumo(); if (cr) cr.textContent = t('aguardando');
      const lr = el.ledgerResumo(); if (lr) lr.textContent = t('aguardando');
      const er = el.evidenciasResumo(); if (er) er.textContent = t('aguardando');
    }
  }

  // =============== C3) TABS ===============
  function setTab(tab) {
    state.tab = tab === 'chat' ? 'chat' : 'pro';
    saveLS(LS.tab, state.tab);

    const btnPro = el.btnTabPro();
    const btnChat = el.btnTabChat();
    const telaPro = el.telaPro();
    const telaChat = el.telaChat();

    if (btnPro && btnChat) {
      btnPro.classList.toggle('active', state.tab === 'pro');
      btnChat.classList.toggle('active', state.tab === 'chat');
      btnPro.setAttribute('aria-selected', String(state.tab === 'pro'));
      btnChat.setAttribute('aria-selected', String(state.tab === 'chat'));
    }
    if (telaPro && telaChat) {
      telaPro.classList.toggle('hidden', state.tab !== 'pro');
      telaChat.classList.toggle('hidden', state.tab !== 'chat');
    }
  }

  // =============== C12) AUTO-REPAIR GUARDS ===============
  function onClick(selectorOrEl, fn) {
    const node = (typeof selectorOrEl === 'string') ? $(selectorOrEl) : selectorOrEl;
    if (!node) return;
    node.addEventListener('click', (e) => {
      try { fn(e); } catch (err) { console.error(err); }
    });
  }

  function onInput(selectorOrEl, fn) {
    const node = (typeof selectorOrEl === 'string') ? $(selectorOrEl) : selectorOrEl;
    if (!node) return;
    node.addEventListener('input', (e) => {
      try { fn(e); } catch (err) { console.error(err); }
    });
  }

  // =============== Sanitização ===============
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // =============== Fail-closed ===============
  function isValidInstruction() {
    const v = (el.cmd()?.value || '').trim();
    return v.length >= 10;
  }

  function refreshButtons() {
    const ok = isValidInstruction();
    const btnGerar = el.btnGerar();
    if (btnGerar) btnGerar.disabled = !ok;

    const hasDraft = !!state.draftHtml;
    const btnExportar = el.btnExportar();
    const btnArquivar = el.btnArquivar();
    if (btnExportar) btnExportar.disabled = !hasDraft;
    if (btnArquivar) btnArquivar.disabled = !(hasDraft || state.chat.length || state.files.length);

    const chatSend = el.chatSend();
    const chatInput = el.chatInput();
    if (chatSend && chatInput) chatSend.disabled = chatInput.value.trim().length === 0;

    const btnLimparAnexos = el.btnLimparAnexos();
    if (btnLimparAnexos) btnLimparAnexos.disabled = state.files.length === 0;
  }

  // =============== C4) Upload / Render files (usa template) ===============
  function fileIdFrom(f) {
    return `${f.name}|${f.size}|${f.type}|${f.lastModified}`;
  }

  function renderFiles() {
    const ul = el.listaArquivos();
    const empty = el.filesEmpty();
    if (!ul || !empty) return;

    ul.innerHTML = '';
    if (state.files.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    const tpl = el.tplFile();
    for (const f of state.files) {
      let li;
      if (tpl && tpl.content) {
        li = tpl.content.firstElementChild.cloneNode(true);
        li.querySelector('.file-name').textContent = f.name;
        li.querySelector('.file-sub').textContent = `${formatBytes(f.size)} • ${f.type || '—'} • ${new Date(f.lastModified).toLocaleString()}`;
        const btn = li.querySelector('.file-remove');
        btn.addEventListener('click', () => {
          state.files = state.files.filter(x => x.id !== f.id);
          persistSession();
          renderFiles();
          refreshButtons();
        });
      } else {
        li = document.createElement('li');
        li.className = 'file-item';
        li.textContent = f.name;
      }
      ul.appendChild(li);
    }
  }

  function formatBytes(n) {
    const num = Number(n) || 0;
    if (num < 1024) return `${num} B`;
    const kb = num / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  // =============== C5) Auditoria simulada ===============
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function simulateAudit(instruction, files) {
    // Heurística simples offline (simulador): usa tamanho do texto + quantidade de anexos
    const len = instruction.length;
    const fcount = files.length;
    const signal = clamp01((len / 600) + (fcount / 8) * 0.35);

    const metal = clamp01(signal * 0.85 + (Math.random() * 0.10));
    const estado = clamp01(signal * 0.75 + (Math.random() * 0.18));
    const legiao = clamp01(signal * 0.70 + (Math.random() * 0.22));
    const logos = clamp01(signal * 0.80 + (Math.random() * 0.14));

    const scores = {
      metal: Math.round(metal * 100),
      estado: Math.round(estado * 100),
      legiao: Math.round(legiao * 100),
      logos: Math.round(logos * 100)
    };

    const certScore = Math.round((scores.metal + scores.estado + scores.legiao + scores.logos) / 4);
    const status = certScore >= 55 ? 'OK' : 'FAIL';

    const evidencias = [];
    if (fcount) {
      for (const f of files.slice(0, 8)) {
        evidencias.push({
          tipo: 'ARQUIVO',
          nome: f.name,
          meta: `${formatBytes(f.size)} • ${f.type || '—'} • lastModified=${f.lastModified}`
        });
      }
    } else {
      evidencias.push({ tipo: 'AUSENTE', nome: 'Sem anexos', meta: 'Acervo não informado.' });
    }

    const ledger = [
      { etapa: 'INPUT', detalhe: `instrucao_len=${len}` },
      { etapa: 'FILES', detalhe: `qtd=${fcount}` },
      { etapa: 'AUDIT', detalhe: `cert=${certScore} status=${status}` }
    ];

    let motivo = status === 'OK'
      ? 'CERT aprovado (simulador): consistência mínima atingida.'
      : 'CERT reprovado (simulador): instrução/acervo insuficientes para robustez.';

    return { scores, certScore, status, motivo, evidencias, ledger };
  }

  function renderAudit(audit) {
    if (!audit) return;
    const { scores, certScore, status, motivo } = audit;

    const setBar = (barEl, val) => { if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, val))}%`; };
    setBar(el.barMetal(), scores.metal);
    setBar(el.barEstado(), scores.estado);
    setBar(el.barLegiao(), scores.legiao);
    setBar(el.barLogos(), scores.logos);

    const setText = (node, txt) => { if (node) node.textContent = txt; };
    setText(el.vMetal(), String(scores.metal));
    setText(el.vEstado(), String(scores.estado));
    setText(el.vLegiao(), String(scores.legiao));
    setText(el.vLogos(), String(scores.logos));

    const seloCert = el.seloCert();
    const seloAuth = el.seloAuth();
    if (seloCert) seloCert.textContent = `CERT: ${certScore}/100`;
    if (seloAuth) seloAuth.textContent = `AUTENTICIDADE: ${status === 'OK' ? 'OK' : 'FAIL'}`;

    const auditMotivo = el.auditMotivo();
    if (auditMotivo) auditMotivo.textContent = motivo;
  }

  // =============== C6) Draft generator (minuta) ===============
  function areaLabel() {
    const sel = el.area();
    if (!sel) return state.areaValue;
    const opt = sel.options[sel.selectedIndex];
    return (opt && opt.textContent) ? opt.textContent.trim() : sel.value;
  }

  function buildDraftHtml() {
    if (!isValidInstruction()) return '';

    const instr = (el.cmd()?.value || '').trim();
    const areaTxt = areaLabel();
    const files = state.files;

    // Sanitização: todo texto do usuário passa por escapeHtml
    const safeInstr = escapeHtml(instr);

    const fileList = files.length
      ? `<ul>${files.map(f => `<li><strong>${escapeHtml(f.name)}</strong> — ${escapeHtml(formatBytes(f.size))} — ${escapeHtml(f.type || '—')}</li>`).join('')}</ul>`
      : `<p><em>Sem anexos informados.</em></p>`;

    const audit = state.audit;
    const auditBlock = audit
      ? `<div class="draft-block">
          <h3>Auditoria (Simulador)</h3>
          <ul>
            <li>METAL: ${audit.scores.metal}</li>
            <li>ESTADO: ${audit.scores.estado}</li>
            <li>LEGIÃO: ${audit.scores.legiao}</li>
            <li>LOGOS: ${audit.scores.logos}</li>
            <li><strong>CERT:</strong> ${audit.certScore}/100 (${escapeHtml(audit.status)})</li>
          </ul>
          <p>${escapeHtml(audit.motivo)}</p>
        </div>`
      : '';

    const dt = new Date();
    const dtStr = dt.toLocaleString();

    // Documento “minuta técnica” (simulada)
    return `
      <section class="draft">
        <h1>Minuta Técnica — ${escapeHtml(areaTxt)}</h1>
        <p><strong>Modo:</strong> LOCAL_SIMULADOR</p>
        <p><strong>Carimbo:</strong> ${escapeHtml(dtStr)}</p>

        <div class="draft-block">
          <h2>Instrução</h2>
          <p>${safeInstr.replaceAll('\n', '<br>')}</p>
        </div>

        <div class="draft-block">
          <h2>Acervo Probatório (metadados)</h2>
          ${fileList}
        </div>

        ${auditBlock}

        <div class="draft-block">
          <h2>Protocolo (Simulador)</h2>
          <ul>
            <li>Fail-closed: geração somente com instrução válida.</li>
            <li>Sanitização: texto do usuário escapado (sem injeção HTML).</li>
            <li>Offline-first: sem dependências externas.</li>
            <li>Export: impressão isolada do documento.</li>
          </ul>
        </div>
      </section>
    `.trim();
  }

  function renderDraft() {
    const out = el.out();
    const ph = el.placeholder();
    if (!out) return;
    out.innerHTML = state.draftHtml || '';
    if (ph) ph.textContent = state.draftHtml ? '' : t('aguardandoDoc');
  }

  // =============== C7) Rastreabilidade ===============
  function renderTraceability(audit) {
    const cr = el
