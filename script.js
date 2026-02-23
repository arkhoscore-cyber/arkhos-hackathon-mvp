// ARKHOS KERNEL v2.0 - Lógica de Controle Total (CORREÇÃO DE BOTÕES)

// 1. Alternância de Modos (Garante que os botões de troca funcionem)
function switchMode(mode) {
    console.log("Trocando para o modo:", mode);
    const fastPanel = document.getElementById('panel-fast');
    const genesisPanel = document.getElementById('panel-genesis');
    const btnFast = document.getElementById('btn-fast-track');
    const btnGenesis = document.getElementById('btn-genesis-assist');

    if (mode === 'fast') {
        fastPanel.classList.remove('hidden');
        genesisPanel.classList.add('hidden');
        btnFast.classList.add('active');
        btnGenesis.classList.remove('active');
    } else {
        fastPanel.classList.add('hidden');
        genesisPanel.classList.remove('hidden');
        btnFast.classList.remove('active');
        btnGenesis.classList.add('active');
    }
}

// 2. Função de Auditoria (O Motor)
function executarAuditoria() {
    console.log("Executando Auditoria...");
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    const outputArea = document.getElementById('output-area');
    const missionBox = document.getElementById('missions-box');
    const selo = document.getElementById('selo-genesis');
    
    if (!proInput || proInput.length < 5) {
        alert("Por favor, descreva o caso antes de auditar.");
        return;
    }

    // Cálculo dos Eixos
    let metal = proInput.length > 100 ? 90 : 40;
    let estado = document.getElementById('file-docs').files.length > 0 ? 95 : 15;
    let legiao = 50; 
    let logos = 70;

    // Atualiza Barras
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + legiao + estado + logos) / 4;
    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = `± ${(100 - score).toFixed(0)}%`;
    
    // Métricas
    let metricaFinal = nature === 'criminal' ? "12 Anos (Est.)" : "R$ 35.000,00";
    document.getElementById('val-perda').innerText = metricaFinal;

    // Exibe Resultados
    outputArea.classList.remove('hidden');
    
    // Gera texto da peça
    document.getElementById('legal-text-output').innerHTML = `<b>RELATÓRIO GERADO:</b><br>${proInput}`;
    
    console.log("Auditoria concluída com sucesso.");
}

// 3. Inicialização dos Listeners (Onde o erro costuma estar)
document.addEventListener('DOMContentLoaded', () => {
    console.log("ARKHOS Iniciado.");

    // Botão Principal de Relatório
    const btnMain = document.getElementById('btn-main-action');
    if (btnMain) {
        btnMain.addEventListener('click', executarAuditoria);
    }

    // Botão de Enviar no Chat
    const btnSendChat = document.getElementById('btn-send-chat');
    if (btnSendChat) {
        btnSendChat.addEventListener('click', () => {
            const inputChat = document.getElementById('chat-user-msg');
            const flow = document.getElementById('chat-flow');
            if (inputChat.value) {
                flow.innerHTML += `<div class="msg user"><b>Você:</b> ${inputChat.value}</div>`;
                document.getElementById('pro-input').value += "\n" + inputChat.value;
                inputChat.value = "";
                setTimeout(executarAuditoria, 500); // Atualiza barras automaticamente
            }
        });
    }
});
