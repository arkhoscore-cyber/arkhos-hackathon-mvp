// ==========================================
// ARKHOS - MOTOR DE INTELIGÊNCIA OFFLINE
// ==========================================

const modulos = {
    penal: {
        titulo: "Módulo Penal - Art. 157",
        html: `
            <p><strong>Cenário:</strong> Roubo com dúvida sobre a arma.</p>
            <label class="checkbox-linha"><input type="checkbox" id="p_brilho"> Vítima afirma ter visto 'brilho metálico'</label>
            <label class="checkbox-linha"><input type="checkbox" id="p_confissao"> Réu alega apenas 'mão sob a blusa'</label>
            <button class="btn-executar" onclick="executarArkhos('penal')">Simular Veredito</button>
        `
    },
    trabalhista: {
        titulo: "Módulo Trabalhista - Discriminação",
        html: `
            <p><strong>Cenário:</strong> Dispensa de egresso do sistema prisional.</p>
            <label class="checkbox-linha"><input type="checkbox" id="t_nexo"> Demissão no 1º dia após consulta de antecedentes</label>
            <label class="checkbox-linha"><input type="checkbox" id="t_presenca"> Presença de advogado da empresa no ato da dispensa</label>
            <button class="btn-executar" onclick="executarArkhos('trabalhista')">Simular Veredito</button>
        `
    },
    consumidor: {
        titulo: "Módulo Consumidor - Fraude de Meta",
        html: `
            <p><strong>Cenário:</strong> Alteração unilateral de pacote (60GB para 35GB).</p>
            <label class="checkbox-linha"><input type="checkbox" id="c_fraude"> Vendedora alterou contrato para ganhar comissão</label>
            <label class="checkbox-linha"><input type="checkbox" id="c_dano"> Cliente ficou incomunicável (perda de tempo útil)</label>
            <button class="btn-executar" onclick="executarArkhos('consumidor')">Simular Veredito</button>
        `
    }
};

// Função para trocar de módulo na tela
function carregarModulo(tipo) {
    const area = document.getElementById('area-analise');
    const selecao = modulos[tipo];
    
    area.innerHTML = `<h2>${selecao.titulo}</h2>${selecao.html}`;
    
    // Esconde o resultado anterior ao trocar de módulo
    document.getElementById('painel-resultado').classList.add('escondido');
}

// Função que processa a lógica jurídica (O coração do ARKHOS)
function executarArkhos(tipo) {
    const painel = document.getElementById('painel-resultado');
    const fundo = document.getElementById('texto-fundamentacao');
    const decisao = document.getElementById('texto-decisao');
    
    painel.classList.remove('escondido');

    if (tipo === 'penal') {
        const brilho = document.getElementById('p_brilho').checked;
        if (brilho) {
            fundo.innerText = "Protocolo Baseado em Jurisprudência do STJ: A palavra da vítima que descreve objeto com 'brilho metálico' supre a ausência de apreensão da arma para fins de majorante (Art. 157, § 2º-A, I).";
            decisao.innerText = "RISCO DE PENA ELEVADA: Aplicação de aumento de 2/3 (Causa de aumento por arma de fogo).";
        } else {
            fundo.innerText = "Princípio In Dubio Pro Reo: Sem a prova do brilho ou apreensão, configura-se apenas o Roubo Simples (Caput).";
            decisao.innerText = "PENA BASE: 04 a 10 anos, sem majorantes.";
        }
    } 
    
    else if (tipo === 'trabalhista') {
        const nexo = document.getElementById('t_nexo').checked;
        if (nexo) {
            fundo.innerText = "Aplicação da Lei 9.029/95 e Princípio da Dignidade Humana. O nexo temporal entre a consulta de antecedentes e a dispensa gera presunção relativa de ato discriminatório.";
            decisao.innerText = "ILICITUDE PROVÁVEL: Sugestão de Reintegração ou Indenização em Dobro por Dano Moral.";
        } else {
            fundo.innerText = "Análise de Direito Potestativo de dispensa sem justa causa.";
            decisao.innerText = "RISCO MODERADO: Necessária prova de motivação técnica para afastar discriminação.";
        }
    } 
    
    else if (tipo === 'consumidor') {
        const fraude = document.getElementById('c_fraude').checked;
        if (fraude) {
            fundo.innerText = "Violação do Art. 30 e 34 do CDC (Responsabilidade por ato de preposto). A alteração de 60GB para 35GB pelo mesmo preço configura vício de qualidade e má-fé.";
            decisao.innerText = "DANO CONFIGURADO: Restituição do valor em dobro e Dano Moral por Desvio Produtivo.";
        }
    }
}

// Simulação de busca externa (Para a Demo)
function simularModoLivre() {
    const caso = document.getElementById('caso-livre').value;
    if (!caso) {
        alert("Por favor, descreva um caso para busca.");
        return;
    }
    alert("ARKHOS conectando aos servidores do Planalto e STJ para analisar: " + caso + "\n\n(Aguardando ativação dos créditos Azure para processamento via IA)");
}
