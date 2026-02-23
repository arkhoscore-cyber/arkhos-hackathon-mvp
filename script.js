// ARKHOS KERNEL v2.5 - SISTEMA DE ACUMULAÇÃO DE EVIDÊNCIAS
let arquivosAcumulados = []; // Esta é a "Mente Soberana" que guarda tudo

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

// LÓGICA DE ACUMULAÇÃO DE ARQUIVOS (CORREÇÃO DEFINITIVA)
document.getElementById('file-docs').addEventListener('change', function(e) {
    const display = document.getElementById('file-display-area');
    const novosArquivos = Array.from(e.target.files);
    
    // Adiciona os novos arquivos aos que já estavam lá
    novosArquivos.forEach(file => {
        // Evita duplicados pelo nome
        if (!arquivosAcumulados.some(ar => ar.name === file.name)) {
            arquivosAcumulados.push(file);
        }
    });

    renderizarLista();
    executarAuditoria();
});

function renderizarLista() {
    const display = document.getElementById('file-display-area');
    if (arquivosAcumulados.length > 0) {
        display.innerHTML = `<strong>${arquivosAcumulados.length} Documento(s) na Mente Soberana:</strong><ul style="text-align:left; font-size:0.8rem; list-style:none; padding:10px;">`;
        arquivosAcumulados.forEach((file, index) => {
            display.innerHTML += `<li>📄 ${file.name} <span style="color:red; cursor:pointer; margin-left:10px;" onclick="removerArquivo(${index})">[remover]</span></li>`;
        });
        display.innerHTML += `</ul>`;
    } else {
        display.innerHTML = `<p id="file-status">Nenhum arquivo anexado.</p>`;
    }
}

function removerArquivo(index) {
    arquivosAcumulados.splice(index, 1);
    renderizarLista();
    executarAuditoria();
}

function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    
    // Cálculos de Eixo baseados na variável global arquivosAcumulados
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(arquivosAcumulados.length * 20, 100); // 5 arquivos = 100%
    let legiao = proInput.toLowerCase().includes("testemunha") ? 85 : 30;
    let logos = 70;

    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "Risco de Reclusão" : "R$ " + (score * 800).toLocaleString();

    // Protocolo e Missões
    const missionBox = document.getElementById('missions-box');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";
    
    if (estado < 60) {
        missionBox.classList.remove('hidden');
        missionList.innerHTML += "<li>🎯 <b>MISSÃO:</b> O Eixo de Estado precisa de mais lastro. Continue aportando provas.</li>";
    } else {
        missionBox.classList.add('hidden');
    }

    document.getElementById('legal-text-output').innerHTML = `
        <h2 style="text-align:center">PROTOCOLO SOBERANO DE EXPORTAÇÃO</h2>
        <p><b>AUDITORIA ARKHOS v2.5</b></p>
        <hr>
        <p><b>ARQUIVOS VINCULADOS NA MENTE SOBERANA:</b> ${arquivosAcumulados.length}</p>
        <p><b>PARECER:</b> O caso foi processado com ${score.toFixed(0)}% de integridade. A margem de erro (risco) é de ${risco.toFixed(0)}%.</p>
        <p><b>RELATO:</b><br>${proInput || "Aguardando entrada..."}</p>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
}

// Inicializadores
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
