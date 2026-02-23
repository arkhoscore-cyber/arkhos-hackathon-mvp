function executarAuditoria() {
    const nature = document.getElementById('case-nature').value;
    const proInput = document.getElementById('pro-input').value;
    
    let metal = Math.min(proInput.length / 8, 100);
    let estado = Math.min(listaMenteSoberana.length * 20, 100); 
    let legiao = proInput.toLowerCase().includes("testemunha") ? 90 : 30;
    let logos = 75;

    // ... (mantenha a parte das barras que você já tem) ...

    const score = (metal + estado + legiao + logos) / 4;
    const risco = 100 - score;

    // GERAÇÃO DO DOCUMENTO LIMPO PARA EXPORTAÇÃO
    document.getElementById('legal-text-output').innerHTML = `
        <div class="relatorio-oficial">
            <h1 style="text-align:center; color:#D4AF37; margin-bottom:5px;">PARECER TÉCNICO DE AUDITORIA</h1>
            <p style="text-align:center; font-size:10pt;">ID SOBERANO: ${Math.random().toString(36).toUpperCase().substring(2,12)} | DATA: ${new Date().toLocaleDateString()}</p>
            <hr style="border:1px solid #D4AF37;">
            
            <table style="width:100%; margin-top:20px; border-collapse: collapse;">
                <tr>
                    <td style="padding:10px; border:1px solid #ddd;"><b>NATUREZA:</b> ${nature.toUpperCase()}</td>
                    <td style="padding:10px; border:1px solid #ddd;"><b>CONFIANÇA:</b> ${score.toFixed(0)}%</td>
                </tr>
                <tr>
                    <td style="padding:10px; border:1px solid #ddd;"><b>DOCUMENTOS:</b> ${listaMenteSoberana.length} Anexos</td>
                    <td style="padding:10px; border:1px solid #ddd;"><b>RISCO:</b> ${risco.toFixed(0)}%</td>
                </tr>
            </table>

            <h3 style="color:#D4AF37; margin-top:30px;">1. RELATO DOS FATOS</h3>
            <p style="text-align:justify; line-height:1.6;">${proInput || "Nenhum relato fornecido."}</p>

            <h3 style="color:#D4AF37; margin-top:30px;">2. ANÁLISE DE EVIDÊNCIAS (EIXO DE ESTADO)</h3>
            <p>Lista de arquivos vinculados à Mente Soberana:</p>
            <ul>
                ${listaMenteSoberana.map(f => `<li>${f.name}</li>`).join('')}
            </ul>

            <h3 style="color:#D4AF37; margin-top:30px;">3. CONCLUSÃO E DIRETRIZES</h3>
            <p>${score > 70 ? 
                "O caso apresenta alta viabilidade jurídica e integridade lógica, estando apto para protocolo imediato." : 
                "O caso requer saneamento imediato conforme as missões de reforço listadas no painel de controle."}</p>
            
            <div style="margin-top:50px; text-align:center;">
                <p>___________________________________________________</p>
                <p><b>VALIDAÇÃO SISTÊMICA ARKHOS</b></p>
            </div>
        </div>
    `;
    
    document.getElementById('output-area').classList.remove('hidden');
}
