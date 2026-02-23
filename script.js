// ARKHOS KERNEL v2.2 - CORREÇÃO DE MISSÕES E UPLOAD

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

// 1. CORREÇÃO DO UPLOAD: Atualiza assim que o usuário seleciona
document.getElementById('file-docs').addEventListener('change', function() {
    const fileList = document.getElementById('file-list');
    const files = this.files;
    
    if (files.length > 0) {
        fileList.innerHTML = `<strong>${files.length} arquivo(s) detectados.</strong><br>`;
        for(let i=0; i < files.length; i++) {
            fileList.innerHTML += `<small>✅ ${files[i].name}</small><br>`;
        }
        // Força o cálculo imediato das barras
        executarAuditoria();
    } else {
        fileList.innerHTML = "Nenhum arquivo aportado.";
    }
});

// 2. FUNÇÃO DE AUDITORIA REVISADA
function executarAuditoria() {
    console.log("Iniciando auditoria completa...");
    
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    const fileInput = document.getElementById('file-docs');
    const outputArea = document.getElementById('output-area');
    const missionBox = document.getElementById('missions-box');
    const missionList = document.getElementById('mission-list');
    const legalOutput = document.getElementById('legal-text-output');

    // Cálculo real baseado nos dados presentes
    let metal = Math.min((proInput.length / 10), 100); 
    let estado = Math.min((fileInput.files.length * 34), 100); // 3 arquivos = 100%
    let legiao = proInput.toLowerCase().includes("testemunha") ? 90 : 30;
    let logos = 70;

    // Atualiza as barras visualmente
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    // Cálculo do Score Final
    const score = (metal + estado + legiao + logos) / 4;
    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = `± ${(100 - score).toFixed(0)}%`;
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "12 Anos (Est.)" : "R$ 45.000,00";

    // 3. CORREÇÃO DAS MISSÕES: Limpa e reconstrói
    missionList.innerHTML = "";
    let temMissao = false;

    if (estado < 70) {
        const li = document.createElement('li');
        li.innerHTML = "🎯 <b>REFORÇO DE PROVA:</b> O Eixo de Estado está fraco. Aporte mais documentos (PDFs, fotos ou prints).";
        missionList.appendChild(li);
        temMissao = true;
    }

    if (metal < 50) {
        const li = document.createElement('li');
        li.innerHTML = "🎯 <b>REFORÇO DE NARRATIVA:</b> O Eixo Metal indica pouca clareza. Detalhe melhor as datas e os fatos.";
        missionList.appendChild(li);
        temMissao = true;
    }

    // Mostra ou esconde a caixa de missões
    if (temMissao) {
        missionBox.classList.remove('hidden');
    } else {
        missionBox.classList.add('hidden');
    }

    // Relatório Final
    legalOutput.innerHTML = `
        <h2 style="text-align:center">DIAGNÓSTICO ARKHOS</h2>
        <p><b>Parecer Técnico:</b> ${score > 70 ? "Caso com alta integridade." : "Atenção necessária às missões de reforço."}</p>
        <hr>
        <p><b>Relato Processado:</b><br>${proInput || "Nenhum relato fornecido."}</p>
        <p style="font-size:10px; color:#888;">ID: ${Math.random().toString(36).toUpperCase().substring(2,10)}</p>
    `;

    outputArea.classList.remove('hidden');
    console.log("Auditoria Finalizada.");
}

// 4. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);
    
    document.getElementById('btn-send-chat').addEventListener('click', () => {
        const chatInput = document.getElementById('chat-user-msg');
        if (chatInput.value.trim() !== "") {
            document.getElementById('chat-flow').innerHTML += `<div class="msg user">${chatInput.value}</div>`;
            document.getElementById('pro-input').value += "\n" + chatInput.value;
            chatInput.value = "";
            executarAuditoria(); // Atualiza na hora
        }
    });
});
                          
