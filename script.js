// ARKHOS KERNEL v3.0 - PROTOCOLO SOBERANO E EXTRAÇÃO PURA
let listaMenteSoberana = []; 

function switchMode(mode) {
    const panels = { fast: document.getElementById('panel-fast'), genesis: document.getElementById('panel-genesis') };
    const btns = { fast: document.getElementById('btn-fast-track'), genesis: document.getElementById('btn-genesis-assist') };
    if (mode === 'fast') {
        panels.fast.classList.remove('hidden'); panels.genesis.classList.add('hidden');
        btns.fast.classList.add('active'); btns.genesis.classList.remove('active');
    } else {
        panels.fast.classList.add('hidden'); panels.genesis.classList.remove('hidden');
        btns.fast.classList.remove('active'); btns.genesis.classList.add('active');
    }
}

// LÓGICA DE ARQUIVOS (Mente Soberana)
document.getElementById('file-docs').addEventListener('change', function(e) {
    const novosArquivos = Array.from(e.target.files);
    novosArquivos.forEach(file => {
        if (!listaMenteSoberana.some(item => item.name === file.name)) {
            listaMenteSoberana.push(file);
        }
    });
    atualizarInterfaceArquivos();
    executarAuditoria();
});

function atualizarInterfaceArquivos() {
    const display = document.getElementById('file-display-area');
    if (listaMenteSoberana.length > 0) {
        let htmlLista = `<div class="file-counter"><b>${listaMenteSoberana.length} Documentos Detectados</b></div><ul class="lista-doc-arkhos">`;
        listaMenteSoberana.forEach((file, index) => {
            htmlLista += `<li>📄 ${file.name} <span class="btn-remove" onclick="removerDoc(${index})">✖</span></li>`;
        });
        htmlLista += `</ul>`;
        display.innerHTML = htmlLista;
    } else {
        display.innerHTML = `<p id="file-status">Nenhum arquivo anexado.</p>`;
    }
}

function removerDoc(index) {
    listaMenteSoberana.splice(index, 1);
    atualizarInterfaceArquivos();
    executarAuditoria();
}

// MOTOR DE AUDITORIA
function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(listaMenteSoberana.length * 20, 100); 
    let legiao = proInput.toLowerCase().includes("testemunha") ? 90 : 30;
    let logos = 75;

    // Atualiza Barras na Interface
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "Risco de Custódia" : "R$ " + (score * 750).toLocaleString('pt-BR');

    // Missões
    const missionBox = document.getElementById('missions-box');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";
    if (estado < 60) {
        missionBox.classList.remove('hidden');
        missionList.innerHTML += `<li>🎯 <b>REFORÇO:</b> Aporte mais documentos para baixar o risco de ${risco.toFixed(0)}%.</li>`;
    } else {
        missionBox.classList.add('hidden');
    }

    // Mostra o preview simples na tela
    document.getElementById('legal-text-output').innerHTML = `<strong>Protocolo Gerado com ${score.toFixed(0)}% de Confiança.</strong><br>Pronto para extração oficial.`;
    document.getElementById('output-area').classList.remove('hidden');
}

// --- A JOGADA MESTRE: FUNÇÃO DE EXPORTAÇÃO LIMPA ---
function exportarPDF() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    const score = document.querySelector('#confidence-score span').innerText;
    const arquivos = listaMenteSoberana.map(f => `<li>📄 ${f.name}</li>`).join('');

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>ARKHOS - Exportação Oficial</title>
            <style>
                body { font-family: 'Segoe UI', serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
                .header { text-align: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; }
                .logo { color: #D4AF37; font-size: 35px; font-weight: bold; letter-spacing: 10px; }
                .meta { display: flex; justify-content: space-between; margin-top: 20px; font-size: 14px; background: #f9f9f9; padding: 10px; border: 1px solid #ddd; }
                h2 { color: #D4AF37; text-transform: uppercase; font-size: 18px; margin-top: 30px; border-left: 5px solid #D4AF37; padding-left: 10px; }
                .content { background: #fff; padding: 20px; border: 1px solid #eee; min-height: 200px; }
                .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">♈ ARKHOS ∞</div>
                <div style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Protocolo de Extração Soberana</div>
            </div>
            
            <div class="meta">
                <span><b>DATA:</b> ${new Date().toLocaleDateString()}</span>
                <span><b>NATUREZA:</b> ${nature.toUpperCase()}</span>
                <span><b>CONFIANÇA:</b> ${score}</span>
            </div>

            <h2>1. Relato dos Fatos</h2>
            <div class="content">${proInput.replace(/\n/g, '<br>') || "Nenhum dado informado."}</div>

            <h2>2. Evidências Vinculadas (Mente Soberana)</h2>
            <div class="content"><ul>${arquivos || "Nenhum arquivo anexado."}</ul></div>

            <div class="footer">
                Este documento é uma extração oficial do sistema ARKHOS. A autenticidade dos dados é de responsabilidade do auditor.
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.print();
}

// Inicializadores
document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);
document.getElementById('btn-send-chat').addEventListener('click', () => {
    const chatMsg = document.getElementById('chat-user-msg');
    if (chatMsg.value) {
        document.getElementById('chat-flow').innerHTML += `<div class="msg user">${chatMsg.value}</div>`;
        document.getElementById('pro-input').value += "\n" + chatMsg.value;
        chatMsg.value = "";
        executarAuditoria();
    }
});
                    
