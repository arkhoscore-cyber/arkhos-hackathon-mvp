/* ⟐ ARKHOS v3.5 - KERNEL DE EXECUÇÃO SOBERANA ⟐ */

// 1. ESTADO GLOBAL (MENTE SOBERANA)
let listaMenteSoberana = [];
let modoPista = 'direta'; // 'direta' ou 'guiada'

// 2. INICIALIZADORES DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-soberano');
    const btnExecutar = document.getElementById('btn-executar');
    const cmdInput = document.getElementById('cmd-input');

    // Listener de Arquivos (Acumulação)
    fileInput.addEventListener('change', (e) => {
        const novosArquivos = Array.from(e.target.files);
        novosArquivos.forEach(file => {
            // Evita duplicatas por nome e tamanho
            if (!listaMenteSoberana.some(f => f.name === file.name && f.size === file.size)) {
                listaMenteSoberana.push(file);
            }
        });
        atualizarInterfaceArquivos();
        executarAuditoria();
    });

    // Listener de Texto
    cmdInput.addEventListener('input', () => {
        executarAuditoria();
    });

    // Troca de Pistas
    document.getElementById('btn-pista-direta').onclick = () => alternarPista('direta');
    document.getElementById('btn-pista-guiada').onclick = () => alternarPista('guiada');

    // Botão de Execução
    btnExecutar.onclick = () => processarOrdem();
});

// 3. GESTÃO DA MENTE SOBERANA
function atualizarInterfaceArquivos() {
    const display = document.getElementById('file-display-area');
    if (listaMenteSoberana.length === 0) {
        display.innerHTML = '<p class="txt-vazio">Mente Soberana vazia. Aguardando base de prova...</p>';
        return;
    }

    let html = `<ul style="list-style:none; padding:0; margin:0;">`;
    listaMenteSoberana.forEach((file, index) => {
        html += `<li style="margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                    <span>📄 ${file.name}</span>
                    <b style="color:var(--danger); cursor:pointer;" onclick="removerArquivo(${index})">✖</b>
                 </li>`;
    });
    html += `</ul>`;
    display.innerHTML = html;
}

function removerArquivo(index) {
    listaMenteSoberana.splice(index, 1);
    atualizarInterfaceArquivos();
    executarAuditoria();
}

// 4. MOTOR DE AUDITORIA (QUADRILÁTERO)
function executarAuditoria() {
    const texto = document.getElementById('cmd-input').value;
    const btnExecutar = document.getElementById('btn-executar');

    // Cálculo dos Eixos
    let metal = Math.min(texto.length / 15, 100); // Lógica baseada no volume
    let estado = Math.min(listaMenteSoberana.length * 25, 100); // 4 arquivos = 100% de prova
    let legiao = texto.toLowerCase().includes('testemunha') || texto.toLowerCase().includes('grupo') ? 90 : 30;
    let logos = texto.length > 50 ? 75 : 20; // Consistência do Direito

    // Atualiza Barras
    document.querySelector('#e-metal .fill').style.width = metal + '%';
    document.querySelector('#e-estado .fill').style.width = estado + '%';
    document.querySelector('#e-legiao .fill').style.width = legiao + '%';
    document.querySelector('#e-logos .fill').style.width = logos + '%';

    // Score e Risco
    const scoreMedio = (metal + estado + legiao + logos) / 4;
    const risco = 100 - scoreMedio;

    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    
    // LCU (Expectativa Financeira Simulada)
    const valorEstimado = (scoreMedio * 1250);
    document.getElementById('val-expectativa').innerText = 'R$ ' + valorEstimado.toLocaleString('pt-BR', {minimumFractionDigits: 2});

    // Governança (Fail-Closed)
    const cert = document.getElementById('selo-cert');
    if (estado >= 25 && texto.length > 20) {
        cert.innerText = 'CERT: APROVADO';
        cert.className = 'selo selo-on';
        btnExecutar.disabled = false;
    } else {
        cert.innerText = 'CERT: BLOQUEADO';
        cert.className = 'selo selo-off';
        btnExecutar.disabled = true;
    }
}

// 5. PROCESSAMENTO DE ORDEM
function processarOrdem() {
    const input = document.getElementById('cmd-input').value;
    const canvas = document.getElementById('output-canvas');
    const printArea = document.getElementById('print-area');
    
    // Simulação de "Inteligência" gerando a peça
    const protocoloID = Math.random().toString(36).substr(2, 9).toUpperCase();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const conteudoHTML = `
        <div class="peca-juridica">
            <h2 style="text-align:center; text-decoration:underline;">DOSSIÊ DE ESTRATÉGIA JURÍDICA</h2>
            <p style="text-align:center; font-size: 0.8rem;">PROTOCOLO SOBERANO: ${protocoloID} | EMISSÃO: ${dataAtual}</p>
            <br>
            <p><b>OBJETO DA ORDEM:</b> EXECUÇÃO DE ANÁLISE ESTRUTURADA</p>
            <hr>
            <p><b>1. RELATÓRIO DE CONFORMIDADE</b></p>
            <p>O sistema processou a ordem sob a governança do Quadrilátero. Identificou-se uma base probatória de ${listaMenteSoberana.length} documento(s) vinculados à Mente Soberana.</p>
            
            <p><b>2. FUNDAMENTAÇÃO ESTRATÉGICA</b></p>
            <p style="text-align:justify;">Com base nos fatos narrados ("${input.substring(0, 100)}..."), o motor de inteligência recomenda o prosseguimento da tese, observando uma margem de risco de ${document.getElementById('val-erro').innerText}.</p>
            
            <p><b>3. CONCLUSÃO E CERTIFICAÇÃO</b></p>
            <p>Este documento possui certificação digital local e rastreabilidade via Ledger Interno. A viabilidade financeira (LCU) está estimada em ${document.getElementById('val-expectativa').innerText}.</p>
            <br><br>
            <div style="text-align:center; border-top: 1px solid #000; width: 250px; margin: auto;">
                <p style="font-size:0.7rem;">ARKHOS v3.5 - NÚCLEO SOBERANO</p>
            </div>
        </div>
    `;

    // Atualiza a tela e a área de impressão
    canvas.innerHTML = conteudoHTML;
    printArea.innerHTML = conteudoHTML;
    
    // Feedback visual
    const ledger = document.getElementById('selo-ledger');
    ledger.innerText = 'LEDGER: REGISTRADO';
    ledger.className = 'selo selo-on';
}

function alternarPista(modo) {
    modoPista = modo;
    const btnD = document.getElementById('btn-pista-direta');
    const btnG = document.getElementById('btn-pista-guiada');
    const input = document.getElementById('cmd-input');

    if (modo === 'direta') {
        btnD.classList.add('ativo');
        btnG.classList.remove('ativo');
        input.placeholder = "Ex: 'Elabore uma petição...'";
    } else {
        btnG.classList.add('ativo');
        btnD.classList.remove('ativo');
        input.placeholder = "[MODO GUIADO] Descreva os fatos detalhadamente para construção da base...";
    }
}

function guardarNoSistema() {
    alert("Protocolo registrado com sucesso na Memória Institucional do Escritório.");
}
