/* ARKHOS_UI — script.js (offline-first, sem libs, LOCAL_SIMULADOR) */
(() => {
  'use strict';

 

  // =============== STORAGE KEYS ===============
  const LS = {
    lang: 'arkhos_lang_v1',
    tab: 'arkhos_tab_v1',
    archive: 'arkhos_archive_v1',
    session: 'arkhos_session_v1'
  };

  const MAX_ARCHIVE = 50;

  // =============== STATE (SSOT) ===============
  const state = {
  lang: 'pt',
  tab: 'pro',
  areaValue: 'civil',

  // PRO
  files: [],
  draftHtml: '',
  audit: null,

  // CHAT
  chat: [],
  chatDraftHtml: '',
  chatFiles: [],

  // Blobs (não persistem no localStorage; só em runtime)
  fileBlobs: new Map(),      // PRO: id -> File
  chatFileBlobs: new Map()   // CHAT: id -> File
};

  // =============== DOM HELPERS ===============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Safe element getters (never throw)
  const el = {
    // Topbar
    btnLangPt: () => $('#btn-lang-pt'),
    btnLangEn: () => $('#btn-lang-en'),
    btnAjuda: () => $('#btn-ajuda'),
    btnConfig: () => $('#btn-config'),
    btnConectarMotor: () => $('#btn-conectar-motor'),

    modalAjuda: () => $('#modal-ajuda'),
    modalConfig: () => $('#modal-config'),
    btnAjudaFechar: () => $('#btn-ajuda-fechar'),
    btnConfigFechar: () => $('#btn-config-fechar'),
    btnLimparSessao: () => $('#btn-limpar-sessao'),
    btnCompartilhar: () => $('#btn-compartilhar'),

    // Badges (HTML usa: badge-operacional e badge-runtime)
    badgeHealth: () => $('#badge-operacional'),
    badgeRuntime: () => $('#badge-runtime'),

    // Tabs
    btnTabPro: () => $('#btn-tab-pro'),
    btnTabChat: () => $('#btn-tab-chat'),
    telaPro: () => $('#tela-pro'),
    telaChat: () => $('#tela-chat'),

    // PRO inputs/actions
    area: () => $('#area-direito'),
    cmd: () => $('#cmd-input'),
    btnGerar: () => $('#btn-executar'),
    btnExportar: () => $('#btn-exportar'),
    btnArquivar: () => $('#btn-arquivar'),
    btnEnviar: () => $('#btn-enviar'),

    // PRO files
    fileInput: () => $('#file-soberano'),
    btnLimparAnexos: () => $('#btn-limpar-anexos'),
    tplFile: () => $('#tpl-file-item'),
    listaArquivos: () => $('#lista-arquivos'),
    filesEmpty: () => $('#files-empty'),

    // Audit UI
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

    // Canvas/print
    out: () => $('#output-canvas'),
    placeholder: () => $('#txt-placeholder'),
    printOnly: () => $('#secao-impressao-isolada'),

    // Archive
    listaArquivados: () => $('#lista-arquivados'),
    archiveEmpty: () => $('#archive-empty'),
    btnLimparArchive: () => $('#btn-limpar-archive'),

    // CHAT
    chatMessages: () => $('#chat-messages'),
    chatInput: () => $('#chat-input'),
    chatSend: () => $('#chat-send'),
    chatGerarDoc: () => $('#chat-gerar-doc'),
    chatEnviarDoc: () => $('#chat-enviar-doc'),
    chatArquivar: () => $('#chat-arquivar'),
    chatLimpar: () => $('#chat-limpar'),
    chatFileInput: () => $('#chat-file'),
    btnChatLimparAnexos: () => $('#btn-chat-limpar-anexos'),
    chatFilesEmpty: () => $('#chat-files-empty')
  };

  // =============== FAIL-LOUD HELPERS ===============
  function toast(msg) {
    try { alert(String(msg)); } catch { /* noop */ }
  }

  function toastError(err) {
    const msg = (err && err.message) ? err.message : String(err || 'Erro');
    toast(msg);
  }

  function onClick(nodeOrSelector, fn) {
    const node = (typeof nodeOrSelector === 'string') ? $(nodeOrSelector) : nodeOrSelector;
    if (!node) return;
    node.addEventListener('click', (e) => {
      try { fn(e); } catch (err) { console.error(err); toastError(err); }
    });
  }

  function onInput(nodeOrSelector, fn) {
    const node = (typeof nodeOrSelector === 'string') ? $(nodeOrSelector) : nodeOrSelector;
    if (!node) return;
    node.addEventListener('input', (e) => {
      try { fn(e); } catch (err) { console.error(err); toastError(err); }
    });
  }

  // =============== JSON / LS ===============
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

  function nowTs() { return Date.now(); }

  // =============== Sanitização ===============
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // =============== Fail-closed PRO ===============
  function isValidInstruction() {
    const v = (el.cmd()?.value || '').trim();
    return v.length >= 10;
  }

  // =============== i18n ===============
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
      nenhumAnexoChat: 'Nenhum anexo no chat.',
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
      precisaInstrucao: 'Instrução insuficiente (mín. 10 caracteres).',
      abrir: 'ABRIR',
      excluir: 'EXCLUIR'
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
      nenhumAnexoChat: 'No chat attachments.',
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
      precisaInstrucao: 'Insufficient instruction (min 10 characters).',
      abrir: 'OPEN',
      excluir: 'DELETE'
    }
  };

  function t(key) {
    const pack = I18N[state.lang] || I18N.pt;
    return pack[key] ?? I18N.pt[key] ?? key;
  }

  function applyI18n() {
    document.documentElement.lang = (state.lang === 'pt') ? 'pt-BR' : 'en';

    // aria-pressed
    const ptBtn = el.btnLangPt();
    const enBtn = el.btnLangEn();
    if (ptBtn && enBtn) {
      ptBtn.setAttribute('aria-pressed', String(state.lang === 'pt'));
      enBtn.setAttribute('aria-pressed', String(state.lang === 'en'));
      ptBtn.classList.toggle('active', state.lang === 'pt');
      enBtn.classList.toggle('active', state.lang === 'en');
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
    const btnEnviar = el.btnEnviar(); if (btnEnviar) btnEnviar.textContent = t('enviar');

    const hint = $('#hint-failclosed'); if (hint) hint.textContent = t('failClosed');

    const ttlAcervo = $('#ttl-acervo'); if (ttlAcervo) ttlAcervo.textContent = t('acervo');
    const btnLimparAnexos = el.btnLimparAnexos(); if (btnLimparAnexos) btnLimparAnexos.textContent = t('removerTodos');

    const ttlAud = $('#ttl-auditoria'); if (ttlAud) ttlAud.textContent = t('auditoria');
    const ttlRas = $('#ttl-rastreio'); if (ttlRas) ttlRas.textContent = t('rastreio');
    const ttlCanvas = $('#ttl-canvas'); if (ttlCanvas) ttlCanvas.textContent = t('documento');

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

    const auditMotivo = el.auditMotivo();
    if (auditMotivo && (!state.audit || !state.audit.motivo)) auditMotivo.textContent = t('aguardandoGeracao');

    if (!state.audit) {
      const cr = el.certResumo(); if (cr) cr.textContent = t('aguardando');
      const lr = el.ledgerResumo(); if (lr) lr.textContent = t('aguardando');
      const er = el.evidenciasResumo(); if (er) er.textContent = t('aguardando');
    }

    const chatFilesEmpty = el.chatFilesEmpty();
    if (chatFilesEmpty) chatFilesEmpty.textContent = t('nenhumAnexoChat');

    // Placeholder do canvas (depende do doc da aba)
    const ph = el.placeholder();
    if (ph) {
      const hasDoc = (state.tab === 'chat') ? !!state.chatDraftHtml : !!state.draftHtml;
      ph.textContent = hasDoc ? '' : t('aguardandoDoc');
    }
  }

  // =============== Tabs ===============
  function setTab(tab) {
    state.tab = (tab === 'chat') ? 'chat' : 'pro';
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

    // Isolamento visual (função existe no bloco 2)
    if (typeof syncViewForTab === 'function') syncViewForTab();
    applyI18n();
  }

  // =============== Files utils ===============
  function fileIdFrom(f) {
    return `${f.name}|${f.size}|${f.type}|${f.lastModified}`;
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

  // PRO: render lista de anexos
  function renderFiles() {
    const ul = el.listaArquivos();
    const empty = el.filesEmpty();
    if (!ul || !empty) return;

    ul.innerHTML = '';
    if (!state.files.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    const tpl = el.tplFile();
    for (const f of state.files) {
      let li;

      if (tpl && tpl.content && tpl.content.firstElementChild) {
        li = tpl.content.firstElementChild.cloneNode(true);

        const nameEl = li.querySelector('.file-name');
        const subEl = li.querySelector('.file-sub');
        if (nameEl) nameEl.textContent = f.name;
        if (subEl) subEl.textContent = `${formatBytes(f.size)} • ${f.type || '—'} • ${new Date(f.lastModified).toLocaleString()}`;

        const btn = li.querySelector('.file-remove');
        if (btn) {
          btn.addEventListener('click', () => {
            state.files = state.files.filter(x => x.id !== f.id);
            if (typeof persistSession === 'function') persistSession();
            renderFiles();
            if (typeof refreshButtons === 'function') refreshButtons();
          });
        }
      } else {
        li = document.createElement('li');
        li.className = 'file-item';
        li.textContent = f.name;
      }

      ul.appendChild(li);
    }
  }

  // CHAT: simples (não quebra se não existir lista visual)
  function renderChatFiles() {
    // Seu HTML atual NÃO tem lista; então só atualiza o hint/disabled via refreshButtons no bloco 3.
    const empty = el.chatFilesEmpty();
    if (!empty) return;
    empty.classList.toggle('hidden', !!(state.chatFiles && state.chatFiles.length));
  }

  // =============== Badges ===============
  function setHealthBadge(text) {
    const b = el.badgeHealth();
    if (b) b.textContent = String(text || 'OPERACIONAL');
  }

  function setRuntimeBadge(text) {
    const b = el.badgeRuntime();
    if (b) b.textContent = String(text || 'MODO: OFFLINE');
  }



// =============== Auditoria determinística ===============
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// FNV-1a 32-bit
function hash32(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 PRNG
function prng(seedU32) {
  let a = seedU32 >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function auditSeed(instruction, files) {
  const ids = (files || []).map(f => f.id).join('||');
  return hash32(`${instruction}__${ids}__${state.areaValue}__v1`);
}

function simulateAudit(instruction, files) {
  const rnd = prng(auditSeed(instruction, files));

  const len = instruction.length;
  const fcount = (files || []).length;
  const signal = clamp01((len / 600) + (fcount / 8) * 0.35);

  const metal = clamp01(signal * 0.85 + (rnd() * 0.10));
  const estado = clamp01(signal * 0.75 + (rnd() * 0.18));
  const legiao = clamp01(signal * 0.70 + (rnd() * 0.22));
  const logos = clamp01(signal * 0.80 + (rnd() * 0.14));

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
    for (const f of (files || []).slice(0, 8)) {
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

  const motivo = (status === 'OK')
    ? 'CERT aprovado (simulador): consistência mínima atingida.'
    : 'CERT reprovado (simulador): instrução/acervo insuficientes para robustez.';

  return { scores, certScore, status, motivo, evidencias, ledger };
}

function renderAudit(audit) {
  if (!audit) return;

  const setBar = (barEl, val) => {
    if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, val))}%`;
  };

  setBar(el.barMetal(), audit.scores.metal);
  setBar(el.barEstado(), audit.scores.estado);
  setBar(el.barLegiao(), audit.scores.legiao);
  setBar(el.barLogos(), audit.scores.logos);

  const setText = (node, txt) => { if (node) node.textContent = txt; };

  setText(el.vMetal(), String(audit.scores.metal));
  setText(el.vEstado(), String(audit.scores.estado));
  setText(el.vLegiao(), String(audit.scores.legiao));
  setText(el.vLogos(), String(audit.scores.logos));

  const seloCert = el.seloCert();
  const seloAuth = el.seloAuth();
  if (seloCert) seloCert.textContent = `CERT: ${audit.certScore}/100`;
  if (seloAuth) seloAuth.textContent = `AUTENTICIDADE: ${audit.status}`;

  const auditMotivo = el.auditMotivo();
  if (auditMotivo) auditMotivo.textContent = audit.motivo;

  const cr = el.certResumo();
  const lr = el.ledgerResumo();
  const er = el.evidenciasResumo();

  if (cr) cr.textContent = `CERT=${audit.certScore}/100 | STATUS=${audit.status}\n${audit.motivo}`;
  if (lr) lr.textContent = (Array.isArray(audit.ledger) ? audit.ledger : []).map(x => `- ${x.etapa}: ${x.detalhe}`).join('\n') || t('aguardando');
  if (er) er.textContent = (Array.isArray(audit.evidencias) ? audit.evidencias : []).map(x => `- ${x.tipo}: ${x.nome} (${x.meta})`).join('\n') || t('aguardando');
}

// =============== Draft PRO ===============
function areaLabel() {
  const sel = el.area();
  if (!sel) return state.areaValue;
  const opt = sel.options[sel.selectedIndex];
  return (opt && opt.textContent) ? opt.textContent.trim() : sel.value;
}

function buildDraftHtml() {
  if (!isValidInstruction()) return '';

  const instr = (el.cmd()?.value || '').trim();
  const safeInstr = escapeHtml(instr);

  const areaTxt = areaLabel();
  const files = state.files || [];

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

  const dtStr = new Date().toLocaleString();

  return `
<section class="draft">
  <h1>Minuta Técnica — ${escapeHtml(areaTxt)}</h1>
  <p><strong>Modo:</strong> LOCAL_SIMULADOR</p>
  <p><strong>Carimbo:</strong> ${escapeHtml(dtStr)}</p>

  <div class="draft-block">
    <h2>Instrução</h2>
    <p>${safeInstr.replaceAll('\n','<br>')}</p>
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

// =============== Draft CHAT (separado do PRO) ===============
function buildChatDraftHtml() {
  // prioridade: última msg do usuário; fallback: input digitado
  const input = el.chatInput();
  const typed = (input?.value || '').trim();

  const lastMe = [...(state.chat || [])].reverse().find(m => m.role === 'me');
  const baseText = (lastMe?.text || typed || '').trim();

  if (baseText.length < 10) return '';

  const dtStr = new Date().toLocaleString();
  const safe = escapeHtml(baseText);

  return `
<section class="draft">
  <h1>Documento — CHAT</h1>
  <p><strong>Modo:</strong> LOCAL_SIMULADOR</p>
  <p><strong>Carimbo:</strong> ${escapeHtml(dtStr)}</p>

  <div class="draft-block">
    <h2>Entrada (CHAT)</h2>
    <p>${safe.replaceAll('\n','<br>')}</p>
  </div>

  <div class="draft-block">
    <h2>Saída (Simulador)</h2>
    <p><em>Documento gerado a partir da última mensagem do chat.</em></p>
  </div>
</section>
`.trim();
}

function renderChatDraft() {
  const out = el.out();
  const ph = el.placeholder();
  if (!out) return;

  out.innerHTML = state.chatDraftHtml || '';
  if (ph) ph.textContent = state.chatDraftHtml ? '' : t('aguardandoDoc');
}

// =============== Isolamento PRO / CHAT (visual) ===============
function syncViewForTab() {
  if (state.tab === 'pro') {
    renderFiles();
    renderDraft();
  } else {
    renderChatFiles();
    renderChatDraft();
  }
  if (typeof refreshButtons === 'function') refreshButtons();
  applyI18n();
}

// =============== Geração PRO ===============
function generateAll() {
  if (!isValidInstruction()) { toast(t('precisaInstrucao')); return; }

  state.areaValue = el.area()?.value || state.areaValue;
  const instr = (el.cmd()?.value || '').trim();

  state.audit = simulateAudit(instr, state.files || []);
  renderAudit(state.audit);

  state.draftHtml = buildDraftHtml();
  renderDraft();

  persistSession();
  refreshButtons();
}

// =============== Geração CHAT ===============
function generateFromChat() {
  state.chatDraftHtml = buildChatDraftHtml();
  renderChatDraft();
  persistSession();
  refreshButtons();
}



// =============== Buttons / Session (PRO+CHAT) ===============
function refreshButtons() {
  const okProInstr = isValidInstruction();

  const btnGerar = el.btnGerar();
  if (btnGerar) btnGerar.disabled = !okProInstr;

  const hasProDraft = !!state.draftHtml;

  const btnExportar = el.btnExportar();
  if (btnExportar) btnExportar.disabled = !hasProDraft;

  const btnEnviar = el.btnEnviar();
  if (btnEnviar) btnEnviar.disabled = !hasProDraft;

  const btnArquivar = el.btnArquivar();
  if (btnArquivar) {
    const canArchive =
      (state.tab === 'pro' && (hasProDraft || (state.files && state.files.length))) ||
      (state.tab === 'chat' && ((!!state.chatDraftHtml) || (state.chat && state.chat.length) || (state.chatFiles && state.chatFiles.length)));
    btnArquivar.disabled = !canArchive;
  }

  const btnLimparAnexos = el.btnLimparAnexos();
  if (btnLimparAnexos) btnLimparAnexos.disabled = !(state.files && state.files.length);

  // CHAT send habilita só se tiver texto
  const chatInput = el.chatInput();
  const chatSend = el.chatSend();
  if (chatSend && chatInput) chatSend.disabled = (chatInput.value.trim().length === 0);

  // CHAT gerar doc: precisa msg do usuário ou texto digitado >=10
  const chatGerar = el.chatGerarDoc();
  const typedLen = (chatInput?.value || '').trim().length;
  const hasMeMsg = Array.isArray(state.chat) && state.chat.some(m => m.role === 'me' && String(m.text || '').trim().length >= 10);
  if (chatGerar) chatGerar.disabled = !(typedLen >= 10 || hasMeMsg);

  const chatEnviar = el.chatEnviarDoc();
  if (chatEnviar) chatEnviar.disabled = !state.chatDraftHtml;

  const btnChatLimpar = el.btnChatLimparAnexos();
  if (btnChatLimpar) btnChatLimpar.disabled = !(state.chatFiles && state.chatFiles.length);
}

function persistSession() {
  const payload = {
    v: 1,
    lang: state.lang,
    tab: state.tab,
    areaValue: state.areaValue,

    // PRO
    files: state.files,
    draftHtml: state.draftHtml,
    audit: state.audit,

    // CHAT
    chat: state.chat,
    chatDraftHtml: state.chatDraftHtml,
    chatFiles: state.chatFiles
  };
  try { saveLS(LS.session, payload); } catch (e) { console.error(e); }
}

function restoreSession() {
  const payload = loadLS(LS.session, null);
  if (!payload || typeof payload !== 'object') return;

  if (payload.lang) state.lang = payload.lang;
  if (payload.tab) state.tab = payload.tab;
  if (payload.areaValue) state.areaValue = payload.areaValue;

  if (Array.isArray(payload.files)) state.files = payload.files;
  state.draftHtml = typeof payload.draftHtml === 'string' ? payload.draftHtml : '';
  state.audit = payload.audit && typeof payload.audit === 'object' ? payload.audit : null;

  state.chat = Array.isArray(payload.chat) ? payload.chat : [];
  state.chatDraftHtml = typeof payload.chatDraftHtml === 'string' ? payload.chatDraftHtml : '';
  state.chatFiles = Array.isArray(payload.chatFiles) ? payload.chatFiles : [];
}

// =============== PRINT / EXPORT (CANVAS) ===============
function copyToPrintSection() {
  const out = el.out();
  const printArea = el.printOnly();
  if (!out || !printArea) return false;

  const html = String(out.innerHTML || '').trim();
  if (!html) return false;

  printArea.innerHTML = html;
  return true;
}

function exportPdfPrint() {
  const out = el.out();
  const currentHtml = String(out?.innerHTML || '').trim();
  if (!currentHtml) { toast(t('precisaGerar')); return; }

  const ok = copyToPrintSection();
  if (!ok) { toast(t('exportFalha')); return; }

  try { window.print(); } catch (e) { console.error(e); toast(t('exportFalha')); }
}

// =============== Share helpers ===============
function htmlToText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = String(html || '');
  return (tmp.textContent || tmp.innerText || '').trim();
}

async function copyToClipboard(text) {
  const s = String(text || '');
  if (!s) return false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(s);
    return true;
  }

  const ta = document.createElement('textarea');
  ta.value = s;
  ta.setAttribute('readonly', 'true');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return !!ok;
}

// PRO share
async function shareCurrent() {
  const html = state.draftHtml || '';
  const text = html ? htmlToText(html) : '';
  if (!text) { toast(t('precisaGerar')); return; }

  const title = 'ARKHOS — Documento';

  // cria um arquivo do documento (HTML)
  const docName = `ARKHOS_${new Date().toISOString().slice(0,19).replaceAll(':','-')}.html`;
  const docFile = new File([html], docName, { type: 'text/html' });

  // pega anexos reais selecionados (se existirem)
  const anexos = [];
  try {
    for (const meta of (state.files || [])) {
      const f = state.fileBlobs.get(meta.id);
      if (f) anexos.push(f);
    }
  } catch {}

  // tenta compartilhar arquivo(s)
  try {
    if (navigator.share) {
      // Web Share Level 2 (files)
      if (navigator.canShare && navigator.canShare({ files: [docFile] })) {
        const filesToSend = [docFile, ...anexos].slice(0, 10);
        await navigator.share({
          title,
          text: 'Documento ARKHOS em anexo.',
          files: filesToSend
        });
        return;
      }

      // fallback: share texto
      await navigator.share({ title, text });
      return;
    }
  } catch (e) {
    console.error(e);
  }

  // fallback geral: copiar texto
  try {
    const ok = await copyToClipboard(text);
    if (ok) toast(t('alertCopiado')); else throw new Error('Clipboard falhou');
  } catch (e) {
    console.error(e);
    try { prompt('Copie o texto:', text); } catch { toast(t('exportFalha')); }
  }
}

// CHAT share
async function shareChatDoc() {
  const text = state.chatDraftHtml ? htmlToText(state.chatDraftHtml) : '';
  if (!text) { toast(t('precisaGerar')); return; }
  const title = 'ARKHOS — Documento (CHAT)';

  try { if (navigator.share) { await navigator.share({ title, text }); return; } }
  catch (e) { console.error(e); }

  try {
    const ok = await copyToClipboard(text);
    if (ok) toast(t('alertCopiado')); else throw new Error('Clipboard falhou');
  } catch (e) {
    console.error(e);
    try { prompt('Copie o texto:', text); } catch { toast(t('exportFalha')); }
  }
}

// =============== Archive ===============
function loadArchive() {
  const arr = loadLS(LS.archive, []);
  return Array.isArray(arr) ? arr : [];
}
function saveArchive(list) { try { saveLS(LS.archive, list); } catch (e) { console.error(e); } }

function archiveItemTitle(item) {
  const mode = item.mode === 'chat' ? 'CHAT' : 'PRO';
  const area = item.areaLabel || item.areaValue || '—';
  const dt = new Date(item.ts || nowTs()).toLocaleString();
  return `${mode} • ${area} • ${dt}`;
}

function renderArchiveList() {
  const ul = el.listaArquivados();
  const empty = el.archiveEmpty();
  if (!ul || !empty) return;

  const list = loadArchive();
  ul.innerHTML = '';

  if (!list.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  for (const item of list) {
    const li = document.createElement('li');
    li.className = 'archive-item';

    const meta = document.createElement('div');
    meta.className = 'archive-meta';

    const title = document.createElement('div');
    title.className = 'archive-title';
    title.textContent = archiveItemTitle(item);

    const sub = document.createElement('div');
    sub.className = 'archive-sub';

    const fcount = Array.isArray(item.filesMeta) ? item.filesMeta.length : 0;
    const ccount = Array.isArray(item.chat) ? item.chat.length : 0;
    const hasDoc = item.mode === 'chat' ? !!item.chatDraftHtml : !!item.draftHtml;

    // mostra “chat=0” quando for PRO e “anexos=0” quando não houver
    sub.textContent = `doc=${hasDoc ? 'SIM' : 'NÃO'} • anexos=${fcount} • chat=${ccount}`;

    meta.appendChild(title);
    meta.appendChild(sub);

    const actions = document.createElement('div');
    actions.className = 'archive-actions';

    const btnOpen = document.createElement('button');
    btnOpen.className = 'btn-secundario';
    btnOpen.type = 'button';
    btnOpen.textContent = t('abrir');

    const btnDel = document.createElement('button');
    btnDel.className = 'btn-top';
    btnDel.type = 'button';
    btnDel.textContent = t('excluir');

    btnOpen.addEventListener('click', () => { try { openArchived(item.id); } catch (e) { console.error(e); toastError(e); } });
    btnDel.addEventListener('click', () => { try { deleteArchived(item.id); } catch (e) { console.error(e); toastError(e); } });

    actions.appendChild(btnOpen);
    actions.appendChild(btnDel);

    li.appendChild(meta);
    li.appendChild(actions);
    ul.appendChild(li);
  }
}

function archiveCurrentSession(modeHint) {
  const mode = (modeHint === 'chat' || state.tab === 'chat') ? 'chat' : 'pro';
  const list = loadArchive();

  const proCmd = (el.cmd()?.value || '').trim();

  const item = {
    id: `a_${nowTs()}_${hash32(`${mode}|${state.areaValue}|${proCmd}|${(state.files || []).map(f => f.id).join(',')}|${(state.chat || []).length}`)}`,
    ts: nowTs(),
    mode,
    lang: state.lang,
    areaValue: state.areaValue,
    areaLabel: areaLabel(),

    // PRO snapshot (somente PRO)
    cmd: mode === 'pro' ? proCmd : '',
    audit: mode === 'pro' ? state.audit : null,
    draftHtml: mode === 'pro' ? state.draftHtml : '',

    // CHAT snapshot (somente CHAT)
    chat: mode === 'chat' ? (state.chat || []).slice() : [],
    chatDraftHtml: mode === 'chat' ? state.chatDraftHtml : '',

    // files snapshot por modo
    filesMeta: (mode === 'chat')
      ? (state.chatFiles || []).slice()
      : (state.files || []).slice()
  };

  const next = [item, ...list].slice(0, MAX_ARCHIVE);
  saveArchive(next);
  renderArchiveList();
  toast(t('alertArquivado'));
}

function openArchived(id) {
  const list = loadArchive();
  const item = list.find(x => x.id === id);
  if (!item) return;

  // base
  state.lang = item.lang || state.lang;
  state.areaValue = item.areaValue || state.areaValue;

  const isChat = item.mode === 'chat';

  if (isChat) {
    // RESTORE CHAT
    state.chat = Array.isArray(item.chat) ? item.chat : [];
    state.chatDraftHtml = typeof item.chatDraftHtml === 'string' ? item.chatDraftHtml : '';
    state.chatFiles = Array.isArray(item.filesMeta) ? item.filesMeta : [];

    // LIMPA PRO (anti-vazamento)
    state.files = [];
    state.draftHtml = '';
    state.audit = null;

    const cmd = el.cmd(); if (cmd) cmd.value = '';
  } else {
    // RESTORE PRO
    state.files = Array.isArray(item.filesMeta) ? item.filesMeta : [];
    state.draftHtml = typeof item.draftHtml === 'string' ? item.draftHtml : '';
    state.audit = item.audit && typeof item.audit === 'object' ? item.audit : null;

    const cmd = el.cmd(); if (cmd) cmd.value = item.cmd || '';

    // LIMPA CHAT (anti-vazamento)
    state.chat = [];
    state.chatDraftHtml = '';
    state.chatFiles = [];
  }

  const area = el.area();
  if (area) area.value = state.areaValue;

  applyI18n();
  setTab(isChat ? 'chat' : 'pro');

  if (!isChat) {
    renderFiles();
    if (state.audit) renderAudit(state.audit);
    renderDraft();
  } else {
    renderChatFiles();
    renderChatDraft();
  }

  chatRender();
  renderArchiveList();
  refreshButtons();
  persistSession();

  // foco para continuar editando
  if (isChat) {
    const ci = el.chatInput(); if (ci) { try { ci.focus(); } catch {} }
  } else {
    const cm = el.cmd(); if (cm) { try { cm.focus(); } catch {} }
  }
}

function deleteArchived(id) {
  const list = loadArchive();
  const next = list.filter(x => x.id !== id);
  saveArchive(next);
  renderArchiveList();
}

function clearArchive() {
  try { localStorage.removeItem(LS.archive); } catch (e) { console.error(e); }
  renderArchiveList();
}

// =============== CHAT core ===============
function chatSave() { persistSession(); }

function chatAddMessage(role, text) {
  state.chat.push({ role: role === 'bot' ? 'bot' : 'me', text: String(text || ''), ts: nowTs() });
  chatSave();
  chatRender();
  refreshButtons();
}

function chatClear() {
  state.chat = [];
  state.chatDraftHtml = '';
  state.chatFiles = [];
  chatSave();
  chatRender();
  if (state.tab === 'chat') renderChatDraft();
  refreshButtons();
  toast(t('alertLimpo'));
}

function chatRender() {
  const box = el.chatMessages();
  if (!box) return;

  box.innerHTML = '';
  for (const m of state.chat) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${m.role === 'bot' ? 'bot' : 'me'}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date(m.ts || nowTs()).toLocaleString();

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = m.text;

    wrap.appendChild(meta);
    wrap.appendChild(text);
    box.appendChild(wrap);
  }
  try { box.scrollTop = box.scrollHeight; } catch { /* noop */ }
}

function simulateChatReply(userText) {
  const trimmed = String(userText || '').trim();
  const seed = hash32(`${trimmed}__${state.areaValue}__${state.lang}`);
  const rnd = prng(seed);

  const variantsPt = [
    'Entendi. Se você quiser, posso transformar isso em um documento no CHAT.',
    'Certo. Você prefere um resumo objetivo ou uma versão mais detalhada?',
    'Ok. Para fortalecer, inclua datas, nomes e o que exatamente quer que a autoridade determine.'
  ];
  const variantsEn = [
    'Got it. If you want, I can turn this into a document in CHAT.',
    'Okay. Do you prefer a concise summary or a more detailed version?',
    'Alright. To strengthen it, include dates, names, and what exactly you want decided.'
  ];

  const pool = state.lang === 'en' ? variantsEn : variantsPt;
  return pool[Math.floor(rnd() * pool.length)] || pool[0];
}

// =============== MODALS ===============
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('hidden');
  modalEl.setAttribute('aria-hidden', 'false');
}
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  modalEl.setAttribute('aria-hidden', 'true');
}
function closeAllModals() {
  closeModal(el.modalAjuda());
  closeModal(el.modalConfig());
}

// =============== Clear Session ===============
function clearSession() {
  // PRO
  state.files = [];
  state.draftHtml = '';
  state.audit = null;

  // CHAT
  state.chat = [];
  state.chatDraftHtml = '';
  state.chatFiles = [];

  const cmd = el.cmd(); if (cmd) cmd.value = '';
  const fileInput = el.fileInput(); if (fileInput) fileInput.value = '';
  const chatFile = el.chatFileInput(); if (chatFile) chatFile.value = '';
  const chatInput = el.chatInput(); if (chatInput) chatInput.value = '';

  try { localStorage.removeItem(LS.session); } catch (e) { console.error(e); }

  applyI18n();
  syncViewForTab();
  chatRender();
  renderArchiveList();
  refreshButtons();

  toast(t('alertLimpo'));
}

// =============== Bind UI (ÚNICO) ===============
function bindUi() {
  // Language
  onClick(el.btnLangPt(), () => { state.lang = 'pt'; saveLS(LS.lang, state.lang); applyI18n(); renderArchiveList(); });
  onClick(el.btnLangEn(), () => { state.lang = 'en'; saveLS(LS.lang, state.lang); applyI18n(); renderArchiveList(); });

  // Tabs
  onClick(el.btnTabPro(), () => { setTab('pro'); });
  onClick(el.btnTabChat(), () => { setTab('chat'); });

  // Inputs
  onInput(el.cmd(), () => { refreshButtons(); persistSession(); });
  onInput(el.area(), () => { state.areaValue = el.area()?.value || state.areaValue; persistSession(); });

  // PRO files
  const fi = el.fileInput();
if (fi) {
  fi.addEventListener('change', () => {
    const files = Array.from(fi.files || []);

    for (const f of files) {
      const id = fileIdFrom(f);

      if (state.files.some(x => x.id === id)) continue;

      // salva metadados (persistem)
      state.files.push({
        id: id,
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified
      });

      // salva arquivo real (runtime para compartilhar)
      state.fileBlobs.set(id, f);
    }

    persistSession();
    renderFiles();
    refreshButtons();
  });
}
  onClick(el.btnLimparAnexos(), () => {
  state.files = [];
  state.fileBlobs.clear(); // limpa os Files reais também
  const fileInput = el.fileInput(); if (fileInput) fileInput.value = '';
  persistSession();
  renderFiles();
  refreshButtons();
});

  // PRO actions
  onClick(el.btnGerar(), () => { generateAll(); });
  onClick(el.btnExportar(), () => { exportPdfPrint(); });
  onClick(el.btnEnviar(), () => { shareCurrent(); });
  onClick(el.btnArquivar(), () => { archiveCurrentSession(state.tab); });

  // Archive
  onClick(el.btnLimparArchive(), () => { clearArchive(); });

  // CHAT input/send
  onInput(el.chatInput(), () => { refreshButtons(); });

  onClick(el.chatSend(), () => {
    const input = el.chatInput();
    if (!input) return;
    const txt = input.value.trim();
    if (!txt) return;

    chatAddMessage('me', txt);
    input.value = '';
    refreshButtons();

    setTimeout(() => {
      const reply = simulateChatReply(txt);
      chatAddMessage('bot', reply);
    }, 400);
  });

  // Chips
  $$('.chip-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chip = btn.getAttribute('data-chip') || '';
      const input = el.chatInput();
      if (!input) return;

      const mapPt = {
        peticao: 'Quero uma petição inicial objetiva. Contexto: ',
        resumo: 'Resuma este caso em tópicos: ',
        revisao: 'Revise e melhore o texto abaixo (clareza e força): ',
        relatorio: 'Gere um relatório estruturado (fatos, pedidos, riscos): '
      };
      const mapEn = {
        peticao: 'I want a concise initial petition. Context: ',
        resumo: 'Summarize this case in bullet points: ',
        revisao: 'Review and improve the text below (clarity and strength): ',
        relatorio: 'Generate a structured report (facts, requests, risks): '
      };
      const map = state.lang === 'en' ? mapEn : mapPt;

      input.value = map[chip] || input.value;
      input.focus();
      refreshButtons();
    });
  });

  // CHAT doc actions
  onClick(el.chatGerarDoc(), () => { generateFromChat(); });
  onClick(el.chatEnviarDoc(), () => { shareChatDoc(); });
  onClick(el.chatArquivar(), () => { archiveCurrentSession('chat'); });
  onClick(el.chatLimpar(), () => { chatClear(); });

  // CHAT files
  const cfi = el.chatFileInput();
if (cfi) {
  cfi.addEventListener('change', () => {
    const files = Array.from(cfi.files || []);
    for (const f of files) {
      const id = fileIdFrom(f);
      if (state.chatFiles.some(x => x.id === id)) continue;

      // guarda o File real (pra poder compartilhar no CHAT)
      state.chatFileBlobs.set(id, f);

      state.chatFiles.push({ id, name: f.name, size: f.size, type: f.type, lastModified: f.lastModified });
    }
    persistSession();
    renderChatFiles();
    refreshButtons();
  });
    }

  onClick(el.btnChatLimparAnexos(), () => {
    state.chatFiles = [];
    const chatFile = el.chatFileInput(); if (chatFile) chatFile.value = '';
    persistSession();
    renderChatFiles();
    refreshButtons();
  });

  // Modals
  onClick(el.btnAjuda(), () => { openModal(el.modalAjuda()); });
  onClick(el.btnConfig(), () => { openModal(el.modalConfig()); });
  onClick(el.btnAjudaFechar(), () => { closeModal(el.modalAjuda()); });
  onClick(el.btnConfigFechar(), () => { closeModal(el.modalConfig()); });

  onClick(el.btnLimparSessao(), () => { clearSession(); closeModal(el.modalConfig()); });
  onClick(el.btnCompartilhar(), () => { shareCurrent(); });

  const modalA = el.modalAjuda();
  const modalC = el.modalConfig();
  if (modalA) modalA.addEventListener('click', (e) => { if (e.target === modalA) closeModal(modalA); });
  if (modalC) modalC.addEventListener('click', (e) => { if (e.target === modalC) closeModal(modalC); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });
}

// =============== Boot ===============
function boot() {
  const savedLang = loadLS(LS.lang, null);
  if (savedLang === 'pt' || savedLang === 'en') state.lang = savedLang;

  const savedTab = loadLS(LS.tab, null);
  if (savedTab === 'pro' || savedTab === 'chat') state.tab = savedTab;

  restoreSession();

  const area = el.area();
  if (area) area.value = state.areaValue || area.value;

  setHealthBadge('HEALTH: OK');
  setRuntimeBadge('RUNTIME: LOCAL');

  applyI18n();
  setTab(state.tab);

  // Render inicial coerente
  if (state.audit && state.tab === 'pro') renderAudit(state.audit);
  syncViewForTab();
  chatRender();
  renderArchiveList();
  refreshButtons();

  bindUi();
}

// =============== Global error hooks ===============
window.addEventListener('error', (e) => {
  try { console.error(e.error || e.message || e); } catch { /* noop */ }
});
window.addEventListener('unhandledrejection', (e) => {
  try { console.error(e.reason || e); } catch { /* noop */ }
});

boot();

// =========================
// ===== FIM BLOCO 3/3 =====
// =========================
})(); // fecha IIFE do BLOCO 1
