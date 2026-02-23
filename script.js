let listaMenteSoberana = []; // A "Mente" que não esquece os arquivos

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

// GESTÃO DE ARQUIVOS (ACUMULADOR)
document.getElementById('file-docs').addEventListener('change', function(e) {
    const display = document.getElementById('file-display-area');
    const novos = Array.from(e.target.files);
    
    novos.forEach(file => {
        if (!listaMenteSoberana.some(f => f.name === file.name)) {
            listaMenteSoberana.push(file);
        }
    });

    display.innerHTML = `<strong>${listaMenteSoberana.length} Docs na Mente Soberana:</strong><ul>` + 
        listaMenteSoberana.map((f, i) => `<li>📄 ${f.name} <span onclick="removerDoc(${i})" style="color:red; cursor:pointer;">[x]</span></li>`).join('') + `</ul>`;
    
    executarAuditoria();
});

function removerDoc(i) {
    listaMenteSoberana.splice(i, 1);
    document.getElementById('file-docs').dispatchEvent(new Event('change'));
}

// O MOTOR DE AUDITORIA E GERAÇÃO DE RELATÓRIO
function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(listaMenteSoberana.length * 20, 100); 
    let legiao = proInput.toLowerCase().includes("testemunha") ? 90 : 30;
    let logos = 75;

    // Atualiza barras visuais
    document.querySelector('#eixo-metal .fill').style.width = metal + '%';
    document.querySelector('#eixo-estado .fill').style.width = estado + '%';
    document.querySelector('#eixo-legiao .fill').style.width = legiao + '%';
    document.querySelector('#eixo-logos .fill').style.width = logos + '%';

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    document.querySelector('#confidence-score span').innerText = score.toFixed(0) + '%';
    document.getElementById('val-erro').innerText = risco.toFixed(0) + '%';
    document.getElementById('val-perda').innerText = nature === 'criminal' ? "Risco de Custódia" : "R$ " + (score * 650).toLocaleString();

    // GERAÇÃO DO DOCUMENTO LIMPO PARA O PAPEL (EXTRAÇÃO)
    document.getElementById('legal-text-output').innerHTML = `
        <div class="relatorio-oficial" style="color: black; font-family: serif; padding: 20px;">
            <h1 style="text-align:center; color:#D4AF37; margin-bottom:5px; border-bottom: 2px solid #D4AF37;">♈ ARKHOS ∞</h1>
            <h2 style="text-align:center; margin-top:0;">PARECER TÉCNICO DE EXTRAÇÃO</h2>
            <p style="text-align:right;">DATA: ${new Date().toLocaleDateString()}</p>
            
            <div style="background: #f0f0f0; padding: 15px; border: 1px solid #D4AF37; margin: 20px 0;">
                <b>MÉTRICAS DO SISTEMA:</b><br>
                NATUREZA: ${nature.toUpperCase()} | CONFIANÇA: ${score.toFixed(0)}% | RISCO: ${risco.toFixed(0)}%
            </div>

            <h3>1. EXTRATO DO RELATO</h3>
            <p style="text-align:justify;">${proInput || "Aguardando descrição..."}</p>

            <h3>2. EVIDÊNCIAS VINCULADAS (${listaMenteSoberana.length})</h3>
            <ul>${listaMenteSoberana.map(f => `<li>${f.name}</li>`).join('')}</ul>

            <div style="margin-top:50px; text-align:center; border-top: 1px solid #ccc; padding-top: 10px;">
                <p><small>Este documento é uma extração fiel da Mente Soberana ARKHOS.</small></p>
            </div>
        </div>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
}

// FUNÇÃO DE EXPORTAÇÃO (ABRE SÓ O RELATÓRIO)
function exportarApenasDados() {
    window.print(); // O CSS @media print cuidará de esconder a grade
}

// Adiciona o listener no botão de exportar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-main-action').addEventListener('click', executarAuditoria);
    // Se o seu botão de PDF tiver uma classe ou ID, vincule aqui:
    // document.querySelector('.btn-exp').onclick = exportarApenasDados;
});
        
