/* =========================================================
   ARKHOS v3.5 - MOTOR LÓGICO COM INTERFACE BILÍNGUE
   ========================================================= */

const i18n = {
    pt: {
        cabecalho: "ESTAÇÃO DE CONFORMIDADE E MINUTAGEM TÉCNICA",
        auditoriaStatus: "NÚCLEO DE AUDITORIA: OPERACIONAL",
        modoPro: "MODO PROFISSIONAL (MINUTA)",
        modoGui: "MODO ESTRUTURADO (RELATO)",
        labelArea: "COMPETÊNCIA / ÁREA DE ATUAÇÃO",
        labelInputPro: "INSTRUÇÃO TÉCNICA DA MINUTA (PRO)",
        labelInputGui: "RELATO DOS FATOS (ESTRUTURADO)",
        btnAnexo: "📎 APORTAR LASTRO DOCUMENTAL (ACERVO)",
        acervoVazio: "Acervo probatório vazio...",
        tituloAudit: "ANÁLISE DE CONFORMIDADE PROCESSUAL",
        metricaViabilidade: "MÉTRICA DE VIABILIDADE",
        metricaRisco: "MARGEM DE RISCO TÉCNICO",
        metricaPena: "RISCO DE PENA / CUSTÓDIA",
        btnGerar: "GERAR MINUTA E PROTOCOLAR",
        btnExportar: "📥 EXPORTAR DOCUMENTO (PDF LIMPO)",
        btnSalvar: "💾 ARQUIVAR NO SISTEMA",
        placeholderCanvas: "Aguardando instrução técnica para compilar o documento.",
        // Termos internos da Minuta (Labels do PDF)
        minutaTitulo: "MINUTA TÉCNICA",
        minutaProtocolo: "PROTOCOLO",
        minutaEmissao: "MODO DE EMISSÃO",
        minutaDetalhe: "DETALHAMENTO",
        minutaLastro: "LASTRO DE PROVAS",
        autenticidade: "AUTENTICIDADE: REGISTRADA"
    },
    en: {
        cabecalho: "COMPLIANCE AND TECHNICAL DRAFTING STATION",
        auditoriaStatus: "AUDIT CORE: OPERATIONAL",
        modoPro: "PROFESSIONAL MODE (DRAFT)",
        modoGui: "STRUCTURED MODE (REPORT)",
        labelArea: "JURISDICTION / FIELD OF PRACTICE",
        labelInputPro: "TECHNICAL DRAFT INSTRUCTION (PRO)",
        labelInputGui: "FACTUAL REPORT (STRUCTURAL)",
        btnAnexo: "📎 UPLOAD SUPPORTING EVIDENCE (VAULT)",
        acervoVazio: "Evidence vault empty...",
        tituloAudit: "PROCEDURAL COMPLIANCE ANALYSIS",
        metricaViabilidade: "VIABILITY SCORE",
        metricaRisco: "TECHNICAL RISK MARGIN",
        metricaPena: "SENTENCING / CUSTODY RISK",
        btnGerar: "GENERATE AND PROTOCOL DRAFT",
        btnExportar: "📥 EXPORT DOCUMENT (CLEAN PDF)",
        btnSalvar: "💾 ARCHIVE IN SYSTEM",
        placeholderCanvas: "Waiting for technical instructions to compile document.",
        // Termos internos da Minuta (Labels do PDF)
        minutaTitulo: "LEGAL DRAFT",
        minutaProtocolo: "PROTOCOL ID",
        minutaEmissao: "ISSUANCE MODE",
        minutaDetalhe: "LEGAL ANALYSIS",
        minutaLastro: "EVIDENCE VAULT",
        autenticidade: "AUTHENTICITY: REGISTERED"
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

function mudarIdioma(sigla) {
    sistema.idioma = sigla;
    localStorage.setItem('arkhos_lang', sigla);
    aplicarIdioma();
    carregarContextoUI();
}

function aplicarIdioma() {
    const t = i18n[sistema.idioma];
    
    // Traduzindo a Interface (Labels e Botões)
    document.querySelector('.subtitle').innerText = t.cabecalho;
    document.getElementById('status-core').innerText = "OPERACIONAL"; 
    document.getElementById('btn-pista-direta').innerText = t.modoPro;
    document.getElementById('btn-pista-guiada').innerText = t.modoGui;
    document.querySelector('label[for="area-direito"]').innerText = t.labelArea;
    document.getElementById('label-anexo').innerText = t.btnAnexo;
    document.querySelector('.monitor-integridade h3').innerText = t.tituloAudit;
    document.getElementById('btn-executar').innerText = t.btnGerar;
    document.getElementById('btn-exportar').innerText = t.btnExportar;
    document.getElementById('btn-salvar').innerText = t.btnSalvar;
    document.getElementById('label-metrica-2').innerText = t.metricaRisco;

    // Atualiza botões de idioma na UI
    document.getElementById('btn-lang-pt').classList.toggle('active', sistema.idioma === 'pt');
    document.getElementById('btn-lang-en').classList.toggle('active', sistema.idioma === 'en');
}

function gerarMinutaFinal() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const t = i18n[sistema.idioma];
    const protocoloID = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Aqui os rótulos mudam, mas o "contexto.texto" (o que você escreveu) fica IGUAL
    const template = `
        <div class="minuta-final" style="color: black !important; font-family: serif; padding: 40px;">
            <h2 style="text-align:center; border-bottom: 2px solid #000;">${t.minutaTitulo}: ${contexto.area.toUpperCase()}</h2>
            <p><strong>${t.minutaProtocolo}:</strong> ${protocoloID}</p>
            <p><strong>${t.minutaEmissao}:</strong> ${sistema.contextoAtivo.toUpperCase()}</p>
            <hr>
            <p style="margin-top:20px;"><strong>${t.minutaDetalhe}:</strong></p>
            <div style="text-align: justify; line-height: 1.6;">${contexto.texto}</div>
            <p style="margin-top: 20px;"><strong>${t.minutaLastro}:</strong> ${contexto.arquivos.length} item(ns).</p>
        </div>
    `;

    contexto.minutaHTML = template;
    document.getElementById('output-canvas').innerHTML = template;
    document.getElementById('selo-audit').innerText = t.autenticidade;
    document.getElementById('selo-audit').className = "selo selo-on";
    salvarMemoria();
}

// ... (Mantenha as funções carregarContextoUI, configurarListeners e auditoria que já corrigimos antes)
