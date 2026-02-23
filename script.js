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

// Atualiza a lista de arquivos na tela
document.getElementById('file-docs').addEventListener('change', function() {
    const list = document.getElementById('file-list');
    const files = this.files;
    if (files.length > 0) {
        list.innerHTML = `<strong>${files.length} arquivo(s) aportado(s):</strong><br>`;
        for(let i=0; i<files.length; i++) { list.innerHTML += `- ${files[i].name}<br>`; }
        executarAuditoria(); // Atualiza barras automaticamente
    }
});

function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    const files = document.getElementById('file-docs').files;
    
    // Eixos de Cálculo
    let metal = Math.min(proInput.length / 5, 100); 
    let estado = Math.min(files.length * 30, 100); // 3+ arquivos já dão 90%+
    let legiao = proInput.includes("testemunha") ? 80 : 40;
    let logos = 70;

    // Atualiza barras
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = `± ${(100 - score).toFixed(0)}%`;
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "12 Anos (Est.)" : "R$ 42.500,00";

    // Lógica de Orientação (Instrução de Advogado)
    let orientacao = "";
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";

    if (estado < 60) {
        orientacao += "<b>PARECER:</b> Identificamos fragilidade probatória. <br>";
        const li = document.createElement('li');
        li.innerText = "MISSÃO: Aportar mais documentos (prints, áudios ou contratos) para fortalecer o Eixo de Estado.";
        missionList.appendChild(li);
        document.getElementById('missions-box').classList.remove('hidden');
    } else {
        orientacao += "<b>PARECER:</b> Caso com robustez documental satisfatória. <br>";
        document.getElementById('missions-box').classList.add('hidden');
    }

    document.getElementById('legal-text-output').innerHTML = `
        <h2>RELATÓRIO DE ORIENTAÇÃO JURÍDICA</h2>
        <p>${orientacao}</p>
        <hr>
        <p><b>RESUMO DOS FATOS:</b> ${proInput || "Aguardando relato detalhado..."}</p>
        <p><small>ID DE VIGÍLIA: ${Math.random().toString(36).toUpperCase().substring(2,10)}</small></p>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);
    document.getElementById('btn-send-chat').addEventListener('click', () => {
        const inputChat = document.getElementById('chat-user-msg');
        if (inputChat.value) {
            document.getElementById('chat-flow').innerHTML += `<div class="msg user">${inputChat.value}</div>`;
            document.getElementById('pro-input').value += "\n" + inputChat.value;
            inputChat.value = "";
            executarAuditoria();
        }
    });
});
                                                                                      
