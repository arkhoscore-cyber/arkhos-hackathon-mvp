/* =========================================================
   ARKHOS v3.5 - INTERFACE GLOBALIZADA (UI ONLY)
   ========================================================= */

const i18n = {
    pt: {
        cabecalhoSub: "ESTAÇÃO DE CONFORMIDADE E MINUTAGEM TÉCNICA",
        auditoriaStatus: "NÚCLEO DE AUDITORIA: ",
        statusOn: "OPERACIONAL",
        modoPro: "MODO PROFISSIONAL (MINUTA)",
        modoGui: "MODO ESTRUTURADO (RELATO)",
        labelArea: "COMPETÊNCIA / ÁREA DE ATUAÇÃO",
        labelInputPro: "INSTRUÇÃO TÉCNICA DA MINUTA (PRO)",
        labelInputGui: "RELATO DOS FATOS (ESTRUTURADO)",
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
        btnExport: "📥 EXPORTAR DOCUMENTO (PDF LIMPO)",
        btnSalvar: "💾 ARQUIVAR NO SISTEMA",
        minutaProtocolo: "PROTOCOLO",
        minutaEmissao: "MODO DE EMISSÃO",
        minutaDetalhe: "DETALHAMENTO",
        minutaLastro: "LASTRO DE PROVAS",
        acervoVazio: "Acervo probatório vazio..."
    },
    en: {
        cabecalhoSub: "COMPLIANCE STATION AND TECHNICAL DRAFTING",
        auditoriaStatus: "AUDIT CORE: ",
        statusOn: "OPERATIONAL",
        modoPro: "PROFESSIONAL MODE (DRAFT)",
        modoGui: "STRUCTURED MODE (REPORT)",
        labelArea: "JURISDICTION / FIELD OF PRACTICE",
        labelInputPro: "TECHNICAL DRAFT INSTRUCTION (PRO)",
        labelInputGui: "FACTUAL REPORT (STRUCTURAL)",
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
        btnExport: "📥 EXPORT DOCUMENT (CLEAN PDF)",
        btnSalvar: "💾 ARCHIVE IN SYSTEM",
        minutaProtocolo: "PROTOCOL ID",
        minutaEmissao: "ISSUANCE MODE",
        minutaDetalhe: "LEGAL ANALYSIS",
        minutaLastro: "EVIDENCE VAULT",
        acervoVazio: "Evidence vault empty..."
    }
};

let sistema = {
    idioma: localStorage.getItem('arkhos_lang') || 'pt',
    contextoAtivo: 'direto',
    dados: {
        direto: { texto: "", arquivos: [], area: "civil", minutaHTML: "" },
        guiado: { texto: "", arquivos: [], area: "civil", minutaHTML: "" }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const memoria = localStorage.getItem('arkhos_v35_data');
    if (memoria) sistema.dados = JSON.parse(memoria);
    configurarListeners();
    aplicarIdioma(); 
    carregarContextoUI();
});

function configurarListeners() {
    document.getElementById('cmd-input').oninput = (e) => {
        sistema.dados[sistema.contextoAtivo].texto = e.target.value;
        salvarMemoria();
        executarAuditoria();
    };

    document.getElementById('area-direito').onchange = (e) => {
        sistema.dados[sistema.contextoAtivo].area = e.target.value;
        salvarMemoria();
        atualizarLabelsMetricas();
        executarAuditoria();
    };

    document.getElementById('file-soberano').onchange = (e) => {
        const novos = Array.from(e.target.files);
        novos.forEach(f => {
            if (!sistema.dados[sistema.contextoAtivo].arquivos.some(x => x.name === f.name)) {
                sistema.dados[sistema.contextoAtivo].arquivos.push({ name: f.name });
            }
        });
        atualizarInterfaceArquivos();
        executarAuditoria();
    };

    document.getElementById('btn-pista-direta').onclick = () => trocarContexto('direto');
    document.getElementById('btn-pista-guiada').onclick = () => trocarContexto('guiado');
    document.getElementById('btn-executar').onclick = gerarMinutaFinal;
    document.getElementById('btn-exportar').onclick = () => { window.print(); };
}

function mudarIdioma(sigla) {
    sistema.idioma = sigla;
    localStorage.setItem('arkhos_lang', sigla);
    aplicarIdioma();
    carregarContextoUI();
}

function aplicarIdioma() {
    const t = i18n[sistema.idioma];
    
    // Títulos e Cabeçalho
    document.querySelector('.subtitle').innerText = t.cabecalhoSub;
    document.getElementById('status-core').innerText = t.statusOn;
    
    // Botões de Modo
    document.getElementById('btn-pista-direta').innerText = t.modoPro;
    document.getElementById('btn-pista-guiada').innerText = t.modoGui;
    
    // Labels de Input
    document.querySelector('label[for="area-direito"]').innerText = t.labelArea;
    document.getElementById('label-anexo').innerText = t.labelAnexo;
    
    // Auditoria
    document.querySelector('.monitor-integridade h3').innerText = t.tituloAnalise;
    document.querySelector('#e-metal label').innerText = t.eixoLogica;
    document.querySelector('#e-estado label').innerText = t.eixoProvas;
    document.querySelector('#e-legiao label').innerText = t.eixoContexto;
    document.querySelector('#e-logos label').innerText = t.eixoDireito;
    
    // Botões Finais
    document.getElementById('btn-executar').innerText = t.btnGerar;
    document.getElementById('btn-exportar').innerText = t.btnExport;
    document.getElementById('btn-salvar').innerText = t.btnSalvar;
    document.getElementById('label-metrica-2').innerText = t.metricaRisco;

    // Atualiza botões de idioma na UI
    document.getElementById('btn-lang-pt').classList.toggle('active', sistema.idioma === 'pt');
    document.getElementById('btn-lang-en').classList.toggle('active', sistema.idioma === 'en');
}

function executarAuditoria() {
    const d = sistema.dados[sistema.contextoAtivo];
    const txt = d.texto || "";
    
    let metal = Math.min(txt.length / 10, 100);
    let estado = Math.min(d.arquivos.length * 33, 100);
    let score = (metal + estado + 40) / 3;

    document.querySelector('#e-metal .fill').style.width = metal + '%';
    document.querySelector('#e-estado .fill').style.width = estado + '%';
    
    document.getElementById('val-erro').innerText = (100 - score).toFixed(0) + '%';
    document.getElementById('val-expectativa').innerText = txt.length < 5 ? "--" : "R$ " + (score * 800).toLocaleString('pt-BR');
    document.getElementById('btn-executar').disabled = txt.length < 10;
}

function gerarMinutaFinal() {
    const d = sistema.dados[sistema.contextoAtivo];
    const t = i18n[sistema.idioma];
    const protocolo = Math.random().toString(36).substr(2, 9).toUpperCase();

    const html = `
        <div style="color:black; font-family:serif; padding:20px;">
            <h2 style="text-align:center; border-bottom:2px solid #000;">${sistema.idioma === 'pt' ? 'MINUTA TÉCNICA' : 'LEGAL DRAFT'}: ${d.area.toUpperCase()}</h2>
            <p><strong>${t.minutaProtocolo}:</strong> ${protocolo}</p>
            <p><strong>${t.minutaEmissao}:</strong> ${sistema.contextoAtivo.toUpperCase()}</p>
            <hr>
            <p><strong>${t.minutaDetalhe}:</strong></p>
            <p style="text-align:justify;">${d.texto}</p>
            <p><strong>${t.minutaLastro}:</strong> ${d.arquivos.length} item(s).</p>
        </div>
    `;
    document.getElementById('output-canvas').innerHTML = html;
    document.getElementById('secao-impressao-isolada').innerHTML = html;
}

function trocarContexto(novo) {
    sistema.contextoAtivo = novo;
    carregarContextoUI();
}

function carregarContextoUI() {
    const d = sistema.dados[sistema.contextoAtivo];
    const t = i18n[sistema.idioma];
    document.getElementById('cmd-input').value = d.texto;
    document.getElementById('area-direito').value = d.area;
    document.getElementById('label-input').innerText = sistema.contextoAtivo === 'direto' ? t.labelInputPro : t.labelInputGui;
    
    if(!d.minutaHTML) {
        document.getElementById('output-canvas').innerHTML = `<p style="color:#999; text-align:center; margin-top:100px;">${t.placeholderCanvas}</p>`;
    }
    
    atualizarLabelsMetricas();
    atualizarInterfaceArquivos();
    executarAuditoria();
}

function atualizarLabelsMetricas() {
    const t = i18n[sistema.idioma];
    const area = sistema.dados[sistema.contextoAtivo].area;
    document.getElementById('label-metrica-1').innerText = area === 'penal' ? (sistema.idioma === 'pt' ? "RISCO DE PENA" : "CUSTODY RISK") : t.metricaViabilidade;
}

function atualizarInterfaceArquivos() {
    const t = i18n[sistema.idioma];
    const lista = sistema.dados[sistema.contextoAtivo].arquivos;
    const area = document.getElementById('file-display-area');
    area.innerHTML = lista.length === 0 ? `<p>${t.acervoVazio}</p>` : lista.map(f => `<div>📄 ${f.name}</div>`).join('');
}

function salvarMemoria() { localStorage.setItem('arkhos_v35_data', JSON.stringify(sistema.dados)); }
       
