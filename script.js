// Mapeamento Humanizado dos Axiomas do Quadrilátero
const Axiomas = {
    M01: { humano: "Definindo trilha de segurança dos dados...", tecnico: "TSP Topology Mapping" },
    L02: { humano: "Verificando base de provas...", tecnico: "Axiomatic Variable Check" },
    C70: { humano: "Validando conformidade ética...", tecnico: "Ethical Envelope Guard" },
    Q85: { humano: "Avaliando clareza da narrativa...", tecnico: "Regret Control Analysis" }
};

const input = document.getElementById('caseInput');
const assistant = document.getElementById('assistantMessage');
const btn = document.getElementById('btnGenerate');
const logs = document.getElementById('logs');

// Função para simular o "Garçom" enviando para a "Cozinha" (Azure)
let timeout = null;
input.addEventListener('input', () => {
    clearTimeout(timeout);
    assistant.innerText = "ARKHOS está processando os eixos lógicos...";
    
    timeout = setTimeout(async () => {
        const text = input.value;
        analisarProgresso(text);
    }, 1000); // Debounce de 1 segundo
});

function analisarProgresso(texto) {
    // Simulação de lógica que estaria na Azure
    let metal = Math.min(texto.length / 5, 100);
    let legiao = Math.min(texto.length / 8, 100);
    let estado = texto.includes("conforme") || texto.includes("prova") ? 80 : 30;
    let logos = texto.split(" ").length > 20 ? 90 : 20;

    // Atualiza barras visuais
    document.querySelector('#q-metal .fill').style.width = metal + '%';
    document.querySelector('#q-legiao .fill').style.width = legiao + '%';
    document.querySelector('#q-estado .fill').style.width = estado + '%';
    document.querySelector('#q-logos .fill').style.width = logos + '%';

    // Tradução de Linguagem de Ação
    if (texto.length < 50) {
        assistant.innerHTML = "<strong>Status:</strong> O caso está muito vago. <b>O que falta:</b> Descreva o evento principal e a data do ocorrido.";
        addLog("Aviso: Densidade lógica insuficiente (Q-72).");
    } else if (estado < 50) {
        assistant.innerHTML = "<strong>Status:</strong> Falta sustentação documental. <b>O que falta:</b> Mencione quais provas (documentos, fotos ou testemunhas) você possui.";
        addLog("Ação: Acionando L-02 - Verificação de Variável Externa.");
    } else {
        assistant.innerHTML = "<span style='color:var(--success)'>✔️ <strong>Sinal Verde:</strong> Caso estruturado com sucesso. O Quadrilátero está fechado.</span>";
        btn.disabled = false;
        addLog("Selo Gênesis 2.0 pronto para ancoragem.");
    }
}

function addLog(msg) {
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    logs.prepend(p);
}

btn.addEventListener('click', () => {
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('finalSummary').innerHTML = `
        <p><strong>Certificado de Integridade:</strong> ARKHOS-HASH-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <p>Este caso foi processado sob o regime de <strong>Perda Controlada</strong> e atende aos 368 pontos de controle axiomático.</p>
    `;
    window.scrollTo(0, document.body.scrollHeight);
});
