// ARKHOS KERNEL v2.6 - PROTOCOLO DE PERSISTÊNCIA DE EVIDÊNCIAS
let listaMenteSoberana = []; // Aqui ficam guardados todos os arquivos

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

// LÓGICA DE ACUMULAÇÃO (O Segredo para segurar vários arquivos)
document.getElementById('file-docs').addEventListener('change', function(e) {
    const display = document.getElementById('file-display-area');
    const novosArquivos = Array.from(e.target.files);
    
    // Adiciona à mente soberana apenas se não for repetido
    novosArquivos.forEach(file => {
        if (!listaMenteSoberana.some(item => item.name === file.name && item.size === file.size)) {
            listaMenteSoberana.push(file);
        }
    });

    atualizarInterfaceArquivos();
    executarAuditoria();
});

function atualizarInterfaceArquivos() {
    const display = document.getElementById('file-display-area');
    if (listaMenteSoberana.length > 0) {
        let htmlLista = `<div class="file-counter"><b>${listaMenteSoberana.length} Documentos na Mente Soberana</b></div><ul class="lista-doc-arkhos">`;
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

function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    
    // Cálculos de Eixo baseados na Mente Soberana
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(listaMenteSoberana.length * 20, 100); // 5 arquivos = 100% de Prova
    let legiao = proInput.toLowerCase().includes("testemunha") ? 90 : 30;
    let logos = 75;

    // Atualiza as Barras de Integridade
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    
    // Cálculo de Métrica Financeira/Punitiva
    let valorEstimado = nature === 'criminal' ? "Risco de Custódia Elevado" : "R$ " + (score * 750).toLocaleString('pt-BR');
    document.getElementById('val-perda').innerText = valorEstimado;

    // Gestão de Missões e Protocolo
    const missionBox = document.getElementById('missions-box');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";

    if (estado < 60) {
        missionBox.classList.remove('hidden');
        missionList.innerHTML += `<li>🎯 <b>MISSÃO:</b> O Eixo de Estado (Provas) está insuficiente. Aporte mais evidências para reduzir o risco de ${risco.toFixed(0)}%.</li>`;
    } else {
        missionBox.classList.add('hidden');
    }

    document.getElementById('legal-text-output').innerHTML = `
        <div class="protocolo-final">
            <h2 style="text-align:center">PROTOCOLO SOBERANO DE EXPORTAÇÃO</h2>
            <p style="text-align:center; font-size:12px;">GERADO VIA ARKHOS KERNEL v2.6</p>
            <hr>
            <p><b>DOCUMENTOS VINCULADOS:</b> ${listaMenteSoberana.length}</p>
            <p><b>INTEGRIDADE DO CASO:</b> ${score.toFixed(0)}%</p>
            <p><b>PARECER:</b> ${score > 70 ? "Alta viabilidade de êxito jurídico." : "Revisão obrigatória das provas aportadas."}</p>
            <div class="relato-box"><b>RELATO REGISTRADO:</b><br>${proInput || "Nenhum dado informado."}</div>
        </div>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
}

// Inicializadores de Eventos
document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);
document.getElementById('btn-send-chat').addEventListener('click', () => {
    const chatMsg = document.getElementById('chat-user-msg');
    if (chatMsg.value) {
        document.getElementById('chat-flow').innerHTML += `<div class="msg user"><b>Você:</b> ${chatMsg.value}</div>`;
        document.getElementById('pro-input').value += "\n" + chatMsg.value;
        chatMsg.value = "";
        executarAuditoria();
    }
});
                                                                                       
