// ARKHOS KERNEL v2.0 - Lógica de Controlo Soberana (CORRIGIDA)

// 1. Alternância de Modos
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

// 2. Função de Auditoria (O Motor de Cálculo)
function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    
    // Pega o texto de onde quer que ele esteja (no pro ou no chat)
    const proInput = document.getElementById('pro-input').value;
    const chatContent = document.getElementById('chat-flow').innerText;
    const relatoFinal = proInput.length > chatContent.length ? proInput : chatContent;

    const outputArea = document.getElementById('output-area');
    const missionBox = document.getElementById('missions-box');
    const selo = document.getElementById('selo-genesis');
    
    // Cálculo dos Eixos (Lógica do Quadrilátero)
    let metal = relatoFinal.length > 100 ? 90 : (relatoFinal.length > 20 ? 50 : 20);
    let estado = document.getElementById('file-docs').files.length > 0 ? 95 : 10;
    let legiao = relatoFinal.toLowerCase().includes("testemunha") || relatoFinal.toLowerCase().includes("colega") ? 80 : 40;
    let logos = 70; // Base legal simulada

    // Atualiza Visualmente as Barras
    updateBars(metal, legiao, estado, logos);

    // Cálculo de Confiança
    const score = (metal + legiao + estado + logos) / 4;
    const erro = 100 - score;
    
    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = `± ${erro.toFixed(0)}%`;
    
    // Métricas Financeiras/Penais
    let metricaFinal = "";
    if (nature === 'criminal') {
        metricaFinal = (12 * (erro/100)).toFixed(1) + " Anos (Est.)";
    } else {
        let valorBase = nature === 'trabalhista' ? 45000 : 25000;
        metricaFinal = "R$ " + (valorBase * (score/100)).toLocaleString('pt-BR');
    }
    document.getElementById('val-perda').innerText = metricaFinal;

    // Gestão de Missões
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = "";
    
    if (score < 75) {
        missionBox.classList.remove('hidden');
        selo.className = "selo-genesis unverified";
        selo.innerText = "INTEGRIDADE BAIXA";
        
        if (estado < 50) addMission("Urgente: Anexar documentos comprobatórios (Eixo de Estado).");
        if (metal < 50) addMission("Melhorar o relato: Faltam detalhes cronológicos dos fatos.");
        if (legiao < 50) addMission("Identificar possíveis testemunhas ou envolvidos.");
    } else {
        missionBox.classList.add('hidden');
        selo.className = "selo-genesis verified";
        selo.innerText = "SELO GÊNESIS ATIVO";
    }

    // Gera a Peça
    generateLegalText(nature, relatoFinal, score);
    
    // Mostra o Resultado
    outputArea.classList.remove('hidden');
    outputArea.scrollIntoView({ behavior: 'smooth' });
}

// 3. Listeners de Eventos
document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);

document.getElementById('btn-send-chat').addEventListener('click', function() {
    const msgInput = document.getElementById('chat-user-msg');
    const msg = msgInput.value;
    if (!msg) return;
    
    const flow = document.getElementById('chat-flow');
    flow.innerHTML += `<div class="msg user"><b>Você:</b> ${msg}</div>`;
    
    // Sincroniza com o input invisível para o motor processar
    document.getElementById('pro-input').value += "\n" + msg;
    
    setTimeout(() => {
        flow.innerHTML += `<div class="msg bot"><b>ARKHOS:</b> Entendido. Já estou mapeando os riscos. Quando terminar de contar, clique no botão <b>AUDITAR</b> lá embaixo.</div>`;
        flow.scrollTop = flow.scrollHeight;
        // Atualiza as barras em tempo real conforme ele fala
        executarAuditoria(); 
    }, 600);
    
    msgInput.value = "";
});

// Funções de Suporte
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
    const data = new Date().toLocaleDateString('pt-BR');
    let titulo = nature === 'criminal' ? "NOTÍCIA CRIME / DEFESA" : "PETIÇÃO INICIAL ESTRUTURADA";
    
    doc.innerHTML = `
<b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DA COMARCA COMPETENTE</b>

<b>REF: PROCESSO AUDITADO VIA SISTEMA ARKHOS</b>
<b>NATUREZA:</b> ${nature.toUpperCase()}
<b>SITUAÇÃO:</b> ${score > 75 ? 'ALTA VIABILIDADE' : 'ANÁLISE DE RISCO'}

<b>I. DOS FATOS</b>
${text || "Aguardando detalhamento dos fatos para geração da peça..."}

<b>II. DOS FUNDAMENTOS</b>
O caso foi processado sob o Kernel Axiomático v2.0, atingindo índice de confiança de ${score.toFixed(0)}%.
Requer-se a análise com base nos precedentes monitorados pelo Radar de Vigília.

<b>III. DOS PEDIDOS</b>
Termos em que, pede deferimento.

${data}
<b>AUTENTICAÇÃO:</b> GENESIS-${Math.random().toString(36).toUpperCase().substring(2,12)}
    `;
}
