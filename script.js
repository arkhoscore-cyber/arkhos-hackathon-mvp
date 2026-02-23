/* =========================================================
   ARKHOS v3.5 - MOTOR FINAL COM UI DE IDIOMA
   ========================================================= */

const i18n = {
    pt: {
        labelInputPro: "INSTRUÇÃO TÉCNICA DA MINUTA (PRO)",
        labelInputGui: "RELATO DOS FATOS (ESTRUTURADO)",
        metricaViabilidade: "MÉTRICA DE VIABILIDADE",
        metricaRisco: "MARGEM DE RISCO TÉCNICO",
        metricaPena: "RISCO DE PENA / CUSTÓDIA",
        btnGerar: "GERAR MINUTA E PROTOCOLAR",
        btnExportar: "📥 EXPORTAR DOCUMENTO (PDF)",
        acervoVazio: "Acervo probatório vazio...",
        placeholderCanvas: "Aguardando instrução para compilar o documento.",
        autenticidade: "AUTENTICIDADE: REGISTRADA",
        protocolo: "PROTOCOLO",
        emissao: "MODO DE EMISSÃO"
    },
    en: {
        labelInputPro: "TECHNICAL DRAFT INSTRUCTION (PRO)",
        labelInputGui: "FACTUAL REPORT (STRUCTURAL)",
        metricaViabilidade: "VIABILITY SCORE",
        metricaRisco: "TECHNICAL RISK MARGIN",
        metricaPena: "SENTENCING / CUSTODY RISK",
        btnGerar: "GENERATE AND PROTOCOL DRAFT",
        btnExportar: "📥 EXPORT DOCUMENT (PDF)",
        acervoVazio: "Evidence vault empty...",
        placeholderCanvas: "Waiting for instructions to compile document.",
        autenticidade: "AUTHENTICITY: REGISTERED",
        protocolo: "PROTOCOL ID",
        emissao: "ISSUANCE MODE"
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
    document.getElementById('cmd-input').addEventListener('input', (e) => {
        sistema.dados[sistema.contextoAtivo].texto = e.target.value;
        salvarMemoria();
        executarAuditoria();
    });

    document.getElementById('area-direito').addEventListener('change', (e) => {
        sistema.dados[sistema.contextoAtivo].area = e.target.value;
        salvarMemoria();
        atualizarLabelsMetricas();
        executarAuditoria();
    });

    document.getElementById('file-soberano').addEventListener('change', (e) => {
        const novosArquivos = Array.from(e.target.files);
        novosArquivos.forEach(file => {
            if (!sistema.dados[sistema.contextoAtivo].arquivos.some(f => f.name === file.name)) {
                sistema.dados[sistema.contextoAtivo].arquivos.push({ name: file.name, size: file.size });
            }
        });
        atualizarInterfaceArquivos();
        executarAuditoria();
    });

    document.getElementById('btn-pista-direta').onclick = () => trocarContexto('direto');
    document.getElementById('btn-pista-guiada').onclick = () => trocarContexto('guiado');
    document.getElementById('btn-executar').onclick = gerarMinutaFinal;
    document.getElementById('btn-exportar').onclick = exportarPDFLimpo;
}

// FUNÇÃO DE TROCA DE IDIOMA (CONECTADA AOS BOTÕES)
function mudarIdioma(sigla) {
    sistema.idioma = sigla;
    localStorage.setItem('arkhos_lang', sigla);
    aplicarIdioma();
    carregarContextoUI();
}

function aplicarIdioma() {
    const t = i18n[sistema.idioma];
    document.getElementById('btn-executar').innerText = t.btnGerar;
    document.getElementById('btn-exportar').innerText = t.btnExportar;
    document.getElementById('label-metrica-2').innerText = t.metricaRisco;

    // Atualiza estados dos botões de idioma
    document.getElementById('btn-lang-pt').classList.toggle('active', sistema.idioma === 'pt');
    document.getElementById('btn-lang-en').classList.toggle('active', sistema.idioma === 'en');
}

function executarAuditoria() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const texto = contexto.texto || "";
    const arquivosCount = contexto.arquivos.length;

    let metal = Math.min(texto.length / 10, 100); 
    let estado = Math.min(arquivosCount * 33, 100); 
    let legiao = (texto.length > 50) ? 70 : 10;
    let logos = (texto.length > 30 && arquivosCount > 0) ? 90 : 20;

    document.querySelector('#e-metal .fill').style.width = metal + '%';
    document.querySelector('#e-estado .fill').style.width = estado + '%';
    document.querySelector('#e-legiao .fill').style.width = legiao + '%';
    document.querySelector('#e-logos .fill').style.width = logos + '%';

    const scoreMedio = (metal + estado + legiao + logos) / 4;
    const risco = 100 - scoreMedio;
    const expectativaBase = scoreMedio * 1200;

    // ATUALIZAÇÃO DAS MÉTRICAS NA TELA
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    const campoExpectativa = document.getElementById('val-expectativa');
    
    if (texto.length < 5) {
        campoExpectativa.innerText = "--";
    } else {
        campoExpectativa.innerText = 'R$ ' + expectativaBase.toLocaleString('pt-BR', {minimumFractionDigits: 2});
    }
    
    document.getElementById('btn-executar').disabled = (texto.length < 10);
}

function gerarMinutaFinal() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const t = i18n[sistema.idioma];
    const protocoloID = Math.random().toString(36).substr(2, 9).toUpperCase();

    const titulo = sistema.idioma === 'pt' ? `MINUTA TÉCNICA: ${contexto.area.toUpperCase()}` : `LEGAL DRAFT: ${contexto.area.toUpperCase()}`;
    const detalheLabel = sistema.idioma === 'pt' ? "DETALHAMENTO" : "LEGAL ANALYSIS";

    const template = `
        <div class="minuta-final" style="color: black !important; font-family: serif; padding: 40px;">
            <h2 style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px;">${titulo}</h2>
            <p><strong>${t.protocolo}:</strong> ${protocoloID}</p>
            <p><strong>${t.emissao}:</strong> ${sistema.contextoAtivo.toUpperCase()}</p>
            <hr>
            <p style="margin-top:20px;"><strong>${detalheLabel}:</strong></p>
            <p style="text-align: justify; line-height: 1.6;">${contexto.texto}</p>
            <p style="margin-top: 30px; font-size: 0.8rem; text-align: center;">Documento gerado por ARKHOS v3.5 - Inteligência de Governança</p>
        </div>
    `;

    contexto.minutaHTML = template;
    document.getElementById('output-canvas').innerHTML = template;
    document.getElementById('selo-audit').innerText = t.autenticidade;
    document.getElementById('selo-audit').className = "selo selo-on";
    salvarMemoria();
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

    if (!d.minutaHTML) {
        document.getElementById('output-canvas').innerHTML = `<div class="placeholder-msg"><p>${t.placeholderCanvas}</p></div>`;
    } else {
        document.getElementById('output-canvas').innerHTML = d.minutaHTML;
    }

    document.getElementById('btn-pista-direta').classList.toggle('ativo', sistema.contextoAtivo === 'direto');
    document.getElementById('btn-pista-guiada').classList.toggle('ativo', sistema.contextoAtivo === 'guiado');

    atualizarLabelsMetricas();
    atualizarInterfaceArquivos();
    executarAuditoria();
}

function atualizarLabelsMetricas() {
    const area = sistema.dados[sistema.contextoAtivo].area;
    const t = i18n[sistema.idioma];
    document.getElementById('label-metrica-1').innerText = area === 'penal' ? t.metricaPena : t.metricaViabilidade;
}

function atualizarInterfaceArquivos() {
    const t = i18n[sistema.idioma];
    const display = document.getElementById('file-display-area');
    const arquivos = sistema.dados[sistema.contextoAtivo].arquivos;
    display.innerHTML = arquivos.length === 0 ? `<p class="txt-vazio">${t.acervoVazio}</p>` : 
        arquivos.map((f, i) => `<div style="font-size:11px; margin-bottom: 5px;">📄 ${f.name} <b onclick="removerArquivo(${i})" style="color:red;cursor:pointer;margin-left:10px;">✖</b></div>`).join('');
}

function salvarMemoria() { localStorage.setItem('arkhos_v35_data', JSON.stringify(sistema.dados)); }
function removerArquivo(i) { sistema.dados[sistema.contextoAtivo].arquivos.splice(i, 1); atualizarInterfaceArquivos(); executarAuditoria(); }
function exportarPDFLimpo() { document.getElementById('secao-impressao-isolada').innerHTML = document.getElementById('output-canvas').innerHTML; window.print(); }
   
