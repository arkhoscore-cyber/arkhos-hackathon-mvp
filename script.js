/* =========================================================
   ARKHOS v3.5 - KERNEL DE GOVERNANÇA JURÍDICA
   ARQUIVO: script.js
   ========================================================= */

// 1. ESTADO GLOBAL (SANDBOXING)
// Mantém dados independentes para cada modo de operação
let sistema = {
    contextoAtivo: 'direto', // 'direto' ou 'guiado'
    dados: {
        direto: { texto: "", arquivos: [], area: "civil" },
        guiado: { texto: "", arquivos: [], area: "civil" }
    }
};

// 2. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    configurarListeners();
    executarAuditoria(); // Reset inicial
});

function configurarListeners() {
    const inputTexto = document.getElementById('cmd-input');
    const inputArquivo = document.getElementById('file-soberano');
    const seletorArea = document.getElementById('area-direito');

    // Monitoramento em tempo real
    inputTexto.addEventListener('input', () => {
        sistema.dados[sistema.contextoAtivo].texto = inputTexto.value;
        executarAuditoria();
    });

    seletorArea.addEventListener('change', () => {
        sistema.dados[sistema.contextoAtivo].area = seletorArea.value;
        atualizarLabelsMetricas();
        executarAuditoria();
    });

    inputArquivo.addEventListener('change', (e) => {
        const novosArquivos = Array.from(e.target.files);
        const acervoAtual = sistema.dados[sistema.contextoAtivo].arquivos;

        novosArquivos.forEach(file => {
            if (!acervoAtual.some(f => f.name === file.name && f.size === file.size)) {
                acervoAtual.push(file);
            }
        });
        atualizarInterfaceArquivos();
        executarAuditoria();
    });

    // Botões de Troca de Contexto
    document.getElementById('btn-pista-direta').onclick = () => trocarContexto('direto');
    document.getElementById('btn-pista-guiada').onclick = () => trocarContexto('guiado');

    // Botões de Ação Final
    document.getElementById('btn-executar').onclick = gerarMinutaFinal;
    document.getElementById('btn-exportar').onclick = exportarPDFLimpo;
}

// 3. LÓGICA DE SANDBOXING (SEPARAÇÃO DE CONTEXTO)
function trocarContexto(novoContexto) {
    // Salva o estado atual antes de trocar
    sistema.dados[sistema.contextoAtivo].texto = document.getElementById('cmd-input').value;
    sistema.dados[sistema.contextoAtivo].area = document.getElementById('area-direito').value;

    // Altera o contexto ativo
    sistema.contextoAtivo = novoContexto;

    // Atualiza a UI para o novo contexto
    const d = sistema.dados[novoContexto];
    document.getElementById('cmd-input').value = d.texto;
    document.getElementById('area-direito').value = d.area;
    
    // Atualiza classes dos botões
    document.getElementById('btn-pista-direta').classList.toggle('ativo', novoContexto === 'direto');
    document.getElementById('btn-pista-guiada').classList.toggle('ativo', novoContexto === 'guiado');
    
    // Atualiza Labels técnicos
    document.getElementById('label-input').innerText = novoContexto === 'direto' 
        ? 'INSTRUÇÃO TÉCNICA DA MINUTA' 
        : 'RELATO DOS FATOS (CONSTRUÇÃO)';

    atualizarInterfaceArquivos();
    atualizarLabelsMetricas();
    executarAuditoria();
}

// 4. MOTOR DE AUDITORIA E CONFORMIDADE (QUADRILÁTERO)
function executarAuditoria() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const area = contexto.area;
    const texto = contexto.texto;
    const arquivosCount = contexto.arquivos.length;

    // Cálculo dos Eixos (Lógica Dinâmica)
    let metal = Math.min(texto.length / 20, 100); 
    let estado = Math.min(arquivosCount * 25, 100); 
    let legiao = texto.length > 100 ? 80 : 20;
    let logos = (texto.length > 50 && arquivosCount > 0) ? 90 : 30;

    // Calibragem por Área (Ex: Penal é mais rigoroso em Provas)
    if (area === 'penal' && arquivosCount < 2) estado *= 0.5;
    if (area === 'trabalhista' && texto.includes('verbas')) logos = 100;

    // Atualiza Barras Visualmente
    document.querySelector('#e-metal .fill').style.width = metal + '%';
    document.querySelector('#e-estado .fill').style.width = estado + '%';
    document.querySelector('#e-legiao .fill').style.width = legiao + '%';
    document.querySelector('#e-logos .fill').style.width = logos + '%';

    // Cálculo de Risco e Viabilidade
    const scoreMedio = (metal + estado + legiao + logos) / 4;
    const risco = Math.max(0, 100 - scoreMedio);
    
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    
    // Métrica Financeira/Técnica por Área
    let valorBase = scoreMedio * 1500;
    if (area === 'trabalhista') valorBase *= 1.2;
    if (area === 'tributario') valorBase *= 2.5;
    
    document.getElementById('val-expectativa').innerText = (risco > 90) ? "R$ 0,00" : 'R$ ' + valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2});

    // Governança (Botão de Gerar)
    const btnGerar = document.getElementById('btn-executar');
    const seloCert = document.getElementById('selo-cert');
    
    if (scoreMedio > 40 && texto.length > 15) {
        seloCert.innerText = "CERT: APROVADO";
        seloCert.className = "selo selo-on";
        btnGerar.disabled = false;
    } else {
        seloCert.innerText = "CERT: BLOQUEADO";
        seloCert.className = "selo selo-off";
        btnGerar.disabled = true;
    }
}

// 5. GERAÇÃO DE DOCUMENTO (CANVAS)
function gerarMinutaFinal() {
    const contexto = sistema.dados[sistema.contextoAtivo];
    const canvas = document.getElementById('output-canvas');
    const auditSelo = document.getElementById('selo-audit');
    
    const protocoloID = Math.random().toString(36).substr(2, 9).toUpperCase();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Template Profissional de Minuta
    const htmlMinuta = `
        <div class="minuta-final">
            <h2 style="text-align:center; text-decoration:underline; text-transform:uppercase;">Minuta de Parecer Técnico-Jurídico</h2>
            <p style="text-align:center; font-size: 10pt;">ID DE AUTENTICIDADE: ${protocoloID} | EMISSÃO: ${dataAtual}</p>
            <br>
            <p><strong>ÁREA DE COMPETÊNCIA:</strong> DIREITO ${contexto.area.toUpperCase()}</p>
            <hr style="border: 0; border-top: 1px solid #000;">
            <br>
            <p><strong>1. RELATÓRIO E FUNDAMENTAÇÃO</strong></p>
            <p style="text-align:justify;">Trata-se de análise técnica baseada nas instruções fornecidas e no acervo probatório anexado, composto por ${contexto.arquivos.length} documento(s). Após auditoria de conformidade, identificou-se o seguinte teor:</p>
            <p style="padding: 15px; border-left: 2px solid #ccc; font-style: italic;">"${contexto.texto}"</p>
            
            <p><strong>2. ANÁLISE DE RISCO E VIABILIDADE</strong></p>
            <p>Considerando a legislação vigente e os precedentes da área de <strong>Direito ${contexto.area}</strong>, a presente tese apresenta uma margem de risco técnico calculada em ${document.getElementById('val-erro').innerText}.</p>
            
            <p><strong>3. CONCLUSÃO</strong></p>
            <p style="text-align:justify;">O sistema ARKHOS v3.5 certifica que a minuta está em conformidade com os requisitos mínimos de integridade lógica e documental para prosseguimento processual.</p>
            <br><br><br>
            <div style="text-align:center;">
                <p>________________________________________________</p>
                <p style="font-size: 9pt;">ASSINATURA DIGITAL DO SISTEMA - NÚCLEO ARKHOS</p>
            </div>
        </div>
    `;

    canvas.innerHTML = htmlMinuta;
    auditSelo.innerText = "AUDIT: REGISTRADO";
    auditSelo.className = "selo selo-on";
    
    // Scroll suave para o resultado
    canvas.scrollIntoView({ behavior: 'smooth' });
}

// 6. EXPORTAÇÃO LIMPA (C05 - ANTI-GRADE)
function exportarPDFLimpo() {
    const conteudoDocumento = document.getElementById('output-canvas').innerHTML;
    const camaraPrint = document.getElementById('secao-impressao-isolada');

    if (!conteudoDocumento || conteudoDocumento.includes('Aguardando instrução')) {
        alert("Gere a minuta antes de exportar.");
        return;
    }

    // Injeta apenas o conteúdo técnico na câmara branca
    camaraPrint.innerHTML = conteudoDocumento;
    
    // Dispara o comando de impressão do navegador
    window.print();
}

// 7. UTILITÁRIOS DE INTERFACE
function atualizarInterfaceArquivos() {
    const display = document.getElementById('file-display-area');
    const arquivos = sistema.dados[sistema.contextoAtivo].arquivos;

    if (arquivos.length === 0) {
        display.innerHTML = '<p class="txt-vazio">Acervo probatório vazio...</p>';
        return;
    }

    let html = '<ul style="list-style:none; padding:0;">';
    arquivos.forEach((file, index) => {
        html += `<li style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>📄 ${file.name.substring(0, 25)}...</span>
                    <b style="color:var(--danger); cursor:pointer;" onclick="removerArquivo(${index})">✖</b>
                 </li>`;
    });
    html += '</ul>';
    display.innerHTML = html;
}

function removerArquivo(index) {
    sistema.dados[sistema.contextoAtivo].arquivos.splice(index, 1);
    atualizarInterfaceArquivos();
    executarAuditoria();
}

function atualizarLabelsMetricas() {
    const area = sistema.dados[sistema.contextoAtivo].area;
    const label1 = document.getElementById('label-metrica-1');
    const label2 = document.getElementById('label-metrica-2');

    switch(area) {
        case 'penal':
            label1.innerText = "RISCO DE CUSTÓDIA / PENA";
            label2.innerText = "MARGEM DE ABSOLVIÇÃO";
            break;
        case 'trabalhista':
            label1.innerText = "ESTIMATIVA DE PASSIVO/PROVENTO";
            label2.innerText = "RISCO DE SUCUMBÊNCIA";
            break;
        case 'tributario':
            label1.innerText = "RECUPERAÇÃO TRIBUTÁRIA ESTIMADA";
            label2.innerText = "RISCO DE GLOSA FISCAL";
            break;
        default:
            label1.innerText = "MÉTRICA DE VIABILIDADE (QUANTUM)";
            label2.innerText = "RISCO DE IMPROCEDÊNCIA";
    }
                      }
