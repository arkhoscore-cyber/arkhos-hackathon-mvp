// ARKHOS KERNEL v2.0 - Lógica de Controlo Soberana

// 1. Alternância de Modos (Pista Rápida vs. Assistente)
function switchMode(mode) {
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

// 2. Lógica de Auditoria e Processamento
document.getElementById('btn-main-action').addEventListener('click', function() {
    const nature = document.getElementById('case-nature').value;
    const input = document.getElementById('pro-input').value;
    const outputArea = document.getElementById('output-area');
    const missionBox = document.getElementById('missions-box');
    const selo = document.getElementById('selo-genesis');
    
    // Simulação de Auditoria de Eixos (Isso será substituído pela chamada à Azure)
    let metal = input.length > 50 ? 80 : 30; // Lógica baseada no volume de factos
    let estado = document.getElementById('file-docs').files.length > 0 ? 90 : 10; // Provas
    let legiao = 50; // Pessoas/Testemunhas (Simulado)
    let logos = 60; // Direito (Simulado)

    updateBars(metal, legiao, estado, logos);

    // Cálculo de Confiança e Erro
    const score = (metal + legiao + estado + logos) / 4;
    const erro = 100 - score;
    
    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = `± ${erro.toFixed(0)}%`;
    
    // 3. Definição de Métricas (Anos vs R$)
    let metricaFinal = "";
    if (nature === 'criminal') {
        metricaFinal = (15 * (erro/100)).toFixed(1) + " Anos (Est.)";
    } else {
        let valorBase = nature === 'trabalhista' ? 50000 : 30000;
        metricaFinal = "R$ " + (valorBase * (score/100)).toLocaleString('pt-BR');
    }
    document.getElementById('val-perda').innerText = metricaFinal;

    // 4. Geração de Missões (Se a integridade for baixa)
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";
    
    if (score < 70) {
        outputArea.classList.remove('hidden');
        missionBox.classList.remove('hidden');
        selo.className = "unverified";
        selo.innerText = "AGUARDANDO INTEGRIDADE";

        if (estado < 50) addMission("Anexar prova documental (Contratos, Prints ou Fotos).");
        if (metal < 50) addMission("Detalhar melhor a cronologia dos factos no relato.");
        if (nature === 'criminal') addMission("Vincular cópia do BO ou Auto de Apreensão.");
    } else {
        missionBox.classList.add('hidden');
        selo.className = "verified";
        selo.innerText = "SELO GÊNESIS ATIVO";
    }

    // 5. Geração da Peça Jurídica (A "Mão" do Advogado)
    generateLegalText(nature, input, score);
    
    outputArea.classList.remove('hidden');
    window.scrollTo({ top: outputArea.offsetTop, behavior: 'smooth' });
});

// Funções Auxiliares
function updateBars(m, l, e, g) {
    document.querySelector('#eixo-metal .fill').style.width = m + '%';
    document.querySelector('#eixo-legiao .fill').style.width = l + '%';
    document.querySelector('#eixo-estado .fill').style.width = e + '%';
    document.querySelector('#eixo-logos .fill').style.width = g + '%';
}

function addMission(text) {
    const li = document.createElement('li');
    li.innerText = "🎯 " + text;
    document.getElementById('mission-list').appendChild(li);
}

function generateLegalText(nature, text, score) {
    const doc = document.getElementById('legal-text-output');
    const data = new Date().toLocaleDateString('pt-PT');
    
    let titulo = nature === 'criminal' ? "REQUERIMENTO DE LIBERDADE / DEFESA PRÉVIA" : "PETIÇÃO INICIAL DE REPARAÇÃO";
    
    doc.innerHTML = `
<b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA ${nature.toUpperCase()}</b>

<b>OBJETO:</b> ${titulo}
<b>PROTOCOLAR VIA ARKHOS SOBERANO v2.0</b>

<b>I. DOS FACTOS</b>
${text || "Texto não preenchido ou aguardando detalhamento..."}

<b>II. DA ANÁLISE TÉCNICA AXIOMÁTICA</b>
O presente caso foi submetido ao motor de integridade ARKHOS, apresentando um Índice de Confiança de ${score.toFixed(0)}%. 
As provas foram devidamente vinculadas ao Eixo de Estado, garantindo a rastreabilidade lógica.

<b>III. DOS PEDIDOS</b>
Face ao exposto, requer-se o processamento da presente demanda conforme as métricas de viabilidade anexas ao dossiê.

Selado eletronicamente em ${data}.
ID ÚNICO: GENESIS-${Math.random().toString(36).toUpperCase().substring(2,10)}
    `;
}

// 6. Lógica do Chat Assistente (Simples para MVP)
document.getElementById('btn-send-chat').addEventListener('click', function() {
    const msg = document.getElementById('chat-user-msg').value;
    if (!msg) return;
    
    const flow = document.getElementById('chat-flow');
    flow.innerHTML += `<div class="msg user">${msg}</div>`;
    document.getElementById('pro-input').value = msg; // Sincroniza com o input pro
    
    setTimeout(() => {
        flow.innerHTML += `<div class="msg bot">Entendido. Analisei o seu relato. Clique no botão "AUDITAR" abaixo para ver o que falta para o seu caso ficar forte.</div>`;
        flow.scrollTop = flow.scrollHeight;
    }, 1000);
    
    document.getElementById('chat-user-msg').value = "";
});
    
