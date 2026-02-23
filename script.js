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

// LÓGICA DE LISTAGEM DE ARQUIVOS
document.getElementById('file-docs').addEventListener('change', function() {
    const display = document.getElementById('file-display-area');
    const files = this.files;
    
    if (files.length > 0) {
        display.innerHTML = `<strong>${files.length} Documento(s) Prontos:</strong><ul style="text-align:left; font-size:0.8rem;">`;
        for (let i = 0; i < files.length; i++) {
            display.innerHTML += `<li>📄 ${files[i].name}</li>`;
        }
        display.innerHTML += `</ul>`;
        executarAuditoria(); // Atualiza barras na hora
    }
});

function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    const files = document.getElementById('file-docs').files;
    
    // Cálculos de Eixo
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(files.length * 25, 100); // 4 arquivos = 100%
    let legiao = proInput.toLowerCase().includes("testemunha") ? 85 : 30;
    let logos = 70;

    // Atualiza Visual
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "Calculando Pena..." : "R$ " + (score * 500).toLocaleString();

    // MISSÕES
    const missionBox = document.getElementById('missions-box');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";
    let alertar = false;

    if (estado < 50) {
        alertar = true;
        missionList.innerHTML += "<li>🎯 <b>URGENTE:</b> Você aportou poucas provas. O juiz extinguirá o processo por falta de lastro. Anexe mais documentos.</li>";
    }
    if (metal < 40) {
        alertar = true;
        missionList.innerHTML += "<li>🎯 <b>DETALHAMENTO:</b> O relato está muito curto. Descreva datas, horários e nomes.</li>";
    }

    if (alertar) { missionBox.classList.remove('hidden'); } else { missionBox.classList.add('hidden'); }

    // GERAÇÃO DO PROTOCOLO
    document.getElementById('legal-text-output').innerHTML = `
        <h2 style="text-align:center">PROTOCOLO DE EXPORTAÇÃO JURÍDICA</h2>
        <p><b>DATA:</b> ${new Date().toLocaleDateString()}</p>
        <p><b>STATUS:</b> ${score > 70 ? 'APROVADO PARA PROTOCOLO' : 'REVISÃO NECESSÁRIA'}</p>
        <hr>
        <p><b>DISPOSITIVO:</b> Conforme analisado, o caso apresenta um risco de ${risco.toFixed(0)}%. 
        A viabilidade depende do cumprimento das missões listadas no dossiê.</p>
        <p><b>FATOS REGISTRADOS:</b><br>${proInput || "Sem texto."}</p>
        <p><b>EVIDÊNCIAS VINCULADAS:</b> ${files.length} arquivo(s).</p>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
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
