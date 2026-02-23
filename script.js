// ... seus cálculos de score e barras ...

const relatorioHTML = `
    <div style="text-align:center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px;">
        <h1 style="color: #D4AF37;">♈ ARKHOS ∞</h1>
        <h2>EXTRAÇÃO DE DADOS JURÍDICOS</h2>
    </div>
    <p><b>DATA:</b> ${new Date().toLocaleDateString()}</p>
    <p><b>CONFIANÇA:</b> ${score.toFixed(0)}% | <b>RISCO:</b> ${(100-score).toFixed(0)}%</p>
    <hr>
    <h3>RELATO DOS FATOS:</h3>
    <p>${proInput}</p>
    <h3>EVIDÊNCIAS:</h3>
    <ul>${listaMenteSoberana.map(f => `<li>${f.name}</li>`).join('')}</ul>
`;

// Injeta o conteúdo na área que SÓ APARECE NA IMPRESSÃO
document.getElementById('area-impressao-soberana').innerHTML = relatorioHTML;
