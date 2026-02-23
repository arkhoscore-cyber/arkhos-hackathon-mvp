/* =========================================================
   ARKHOS v3.5 - MOTOR LÓGICO COM MEMÓRIA E SANDBOXING
   ========================================================= */

// 1. OBJETO DE ESTADO E PERSISTÊNCIA
let sistema = {
    contextoAtivo: 'direto',
    dados: {
        direto: { texto: "", arquivos: [], area: "civil", minutaHTML: "" },
        guiado: { texto: "", arquivos: [], area: "civil", minutaHTML: "" }
    }
};

// 2. INICIALIZAÇÃO COM CARREGAMENTO DE MEMÓRIA
document.addEventListener('DOMContentLoaded', () => {
    // Tenta recuperar dados salvos anteriormente
    const memoria = localStorage.getItem('arkhos_v35_data');
    if (memoria) {
        sistema.dados = JSON.parse(memoria);
    }
    
    configurarListeners();
    carregarContextoUI(); // Inicia a interface com o que está na memória
});

function configurarListeners() {
    const inputTexto = document.getElementById('cmd-input');
    const inputArquivo = document.getElementById('file-soberano');
    const seletorArea = document.getElementById('area-direito');

    // Monitoramento de Texto
    inputTexto.addEventListener('input', () => {
        sistema.dados[sistema.contextoAtivo].texto = inputTexto.value;
        salvarMemoria();
        executarAuditoria();
    });

    // Monitoramento de Área do Direito
    seletorArea.addEventListener('change', () => {
        sistema.dados[sistema.contextoAtivo].area = seletorArea.value;
        salvarMemoria();
        atualizarLabelsMetricas();
        executarAuditoria();
    });

    // Monitoramento de Arquivos (Acervo)
    inputArquivo.addEventListener('change', (e) => {
        // Nota: Objetos File não podem ser salvos no localStorage diretamente (limitação de segurança).
        // Eles persistem nesta sessão. Para persistência permanente de PDFs, seria necessário um servidor.
        const novosArquivos = Array.from(e.target.files);
        const acervoAtual = sistema.dados[sistema.contextoAtivo].arquivos;

        novosArquivos.forEach(file => {
            if (!acervoAtual.some(f => f.name === file.name)) {
                acervoAtual.push({ name: file.name, size: file.size });
            }
        });
        atualizarInterfaceArquivos();
        executarAuditoria();
    });

    // Botões de Navegação (Separador de Modos)
    document.getElementById('btn-pista-direta').onclick = () => trocarContexto('direto');
    document.getElementById('btn-pista-guiada').onclick = () => trocarContexto('guiado');

    // Botões de Execução e PDF
    document.getElementById('btn-executar').onclick = gerarMinutaFinal;
    document.getElementById('btn-exportar').onclick = exportarPDFLimpo;
}

// 3. LÓGICA DE SEPARAÇÃO (SANDBOXING)
function trocarContexto(novoContexto) {
    if (sistema.contextoAtivo === novoContexto) return;

    // A. Salva o que está na tela no contexto que está saindo
    sistema.dados[sistema.contextoAtivo].texto = document.getElementById('cmd-input').value;
    sistema.dados[sistema.contextoAtivo].area = document.getElementById('area-direito').value;

    // B. Muda a chave
    sistema.contextoAtivo = novoContexto;

    // C. Carrega a UI com os dados do NOVO contexto
    carregarContextoUI();
}

function carregarContextoUI() {
    const d = sistema.dados[sistema.contextoAtivo];
    
    // Atualiza Inputs
    document.getElementById('cmd-input').value = d.texto;
    document.getElementById('area-direito').value = d.area;
    
    // Atualiza Visual do Canvas (O que já foi gerado antes)
    if (d.minutaHTML) {
        document.getElementById('output-canvas').innerHTML = d.minutaHTML;
    } else {
        document.getElementById('output-canvas').innerHTML = `
            <div class="placeholder-msg">
                <span class="icon">📄</span>
                <p>Aguardando nova instrução para este modo.</p>
            </div>`;
    }

    // Atualiza Botões e Labels
    document.getElementById('btn-pista-direta').classList.toggle('ativo', sistema.contextoAtivo === 'direto');
    document.getElementById('btn-pista-guiada').classList.toggle('ativo', sistema.contextoAtivo === 'guiado');
    
    document.getElementById('label-input').innerText = sistema.contextoAtivo === 'direto' 
        ? 'INSTRUÇÃO TÉCNICA DA MINUTA (PRO)' 
        : 'RELATO DOS FATOS (ESTRUTURADO)';

    atualizarInterfaceArquivos();
    atualizarLabelsMetricas();
    executarAuditoria();
}

// 4. MEMÓRIA LOCAL
function salvarMemoria() {
    localStorage.setItem('arkhos_v35_data', JSON.stringify(sistema.dados));
}

// 5. MOTOR DE AUDITORIA
function executarAuditoria() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const texto = contexto.texto || "";
    const arquivosCount = contexto.arquivos.length;

    // Cálculos Proporcionais
    let metal = Math.min(texto.length / 10, 100); 
    let estado = Math.min(arquivosCount * 33, 100); 
    let legiao = (texto.length > 50) ? 70 : 10;
    let logos = (texto.length > 30 && arquivosCount > 0) ? 90 : 20;

    // UI Feedback
    document.querySelector('#e-metal .fill').style.width = metal + '%';
    document.querySelector('#e-estado .fill').style.width = estado + '%';
    document.querySelector('#e-legiao .fill').style.width = legiao + '%';
    document.querySelector('#e-logos .fill').style.width = logos + '%';

    const risco = 100 - ((metal + estado + legiao + logos) / 4);
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    
    const btnGerar = document.getElementById('btn-executar');
    btnGerar.disabled = (texto.length < 10);
}

// 6. GERAÇÃO E EXPORTAÇÃO (PDF LIMPO)
function gerarMinutaFinal() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const canvas = document.getElementById('output-canvas');
    const protocoloID = Math.random().toString(36).substr(2, 9).toUpperCase();

    const template = `
        <div class="minuta-final" style="color: black !important;">
            <h2 style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px;">MINUTA TÉCNICA: ${contexto.area.toUpperCase()}</h2>
            <p><strong>PROTOCOLO:</strong> ${protocoloID}</p>
            <p><strong>MODO DE EMISSÃO:</strong> ${sistema.contextoAtivo.toUpperCase()}</p>
            <hr>
            <p style="margin-top: 20px;"><strong>DETALHAMENTO:</strong></p>
            <p style="text-align: justify; line-height: 1.6;">${contexto.texto}</p>
            <p style="margin-top: 20px;"><strong>LASTRO DE PROVAS:</strong> ${contexto.arquivos.length} item(ns) analisado(s).</p>
        </div>
    `;

    contexto.minutaHTML = template;
    canvas.innerHTML = template;
    salvarMemoria();
    
    // Alerta de Auditoria
    document.getElementById('selo-audit').className = "selo selo-on";
    document.getElementById('selo-audit').innerText = "AUTENTICIDADE: REGISTRADA";
}

function exportarPDFLimpo() {
    const canvas = document.getElementById('output-canvas');
    const camara = document.getElementById('secao-impressao-isolada');

    if (canvas.innerHTML.includes('placeholder-msg')) {
        alert("Primeiro, clique em 'GERAR MINUTA'.");
        return;
    }

    // Alimenta a câmara de impressão e dispara
    camara.innerHTML = canvas.innerHTML;
    window.print();
}

// 7. FUNÇÕES DE APOIO
function atualizarInterfaceArquivos() {
    const display = document.getElementById('file-display-area');
    const arquivos = sistema.dados[sistema.contextoAtivo].arquivos;
    display.innerHTML = arquivos.length === 0 ? '<p class="txt-vazio">Acervo vazio...</p>' : 
        arquivos.map((f, i) => `<div style="font-size:11px;">📄 ${f.name} <b onclick="removerArquivo(${i})" style="color:red;cursor:pointer">✖</b></div>`).join('');
}

function removerArquivo(i) {
    sistema.dados[sistema.contextoAtivo].arquivos.splice(i, 1);
    atualizarInterfaceArquivos();
    executarAuditoria();
}

function atualizarLabelsMetricas() {
    const area = sistema.dados[sistema.contextoAtivo].area;
    document.getElementById('label-metrica-1').innerText = area === 'penal' ? "RISCO DE PENA" : "MÉTRICA DE VIABILIDADE";
}
   
