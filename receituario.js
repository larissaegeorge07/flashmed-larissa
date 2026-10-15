/* FlashMed — Receituário de referência
 * Primeiro lote: transcrição de 3 itens do arquivo "Medicações no PS 2.pdf".
 * Não é prescrição validada. Confirmar protocolo institucional, indicação,
 * dose, diluição, contraindicações e monitorização antes de qualquer uso.
 */
(function(){
  const itens = [
    {
      id: 'sf09-500-aberto',
      nome: 'Soro fisiológico 0,9% — 500 mL',
      categoria: 'Hidratação',
      via: 'Endovenosa (EV)',
      textoFonte: 'SF 0,9% - 500 ML, EV, CORRER ABERTO',
      observacao: 'A fonte não especifica indicação, volume total necessário nem critérios de reavaliação. “Correr aberto” não deve ser interpretado como velocidade universal.',
      status: 'Conferir indicação e velocidade'
    },
    {
      id: 'dipirona-ev-1g',
      nome: 'Dipirona 1 g/2 mL — intravenosa',
      categoria: 'Analgésico',
      via: 'Endovenosa (EV)',
      textoFonte: 'DIPIRONA 1000MG/2ML – 01 AMP + 08 ML AD, EV, 6/6H, SE DOR OU TAX >= 37,8 ºC',
      observacao: 'Transcrição literal do documento. Confirmar dose, diluente compatível, velocidade de administração, indicação, alergias/contraindicações e protocolo local antes do uso.',
      status: 'Revisão clínica necessária'
    },
    {
      id: 'buscopan-composto-ev',
      nome: 'Buscopan composto — intravenoso',
      categoria: 'Analgésico / antiespasmódico',
      via: 'Endovenosa (EV)',
      textoFonte: 'BUSCOPAN COMPOSTO (4 MG/ML + 500MG/ML) – 01 AMP + 10 ML AD, EV, 8/8h, SN',
      observacao: 'A fonte não esclarece todos os critérios de uso “SN”. Confirmar apresentação disponível, indicação, diluição, velocidade, contraindicações e protocolo institucional.',
      status: 'Revisão clínica necessária'
    }
  ];
  window.receituarioView = function(){
    const escText = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const cards = itens.map((item, i) => `
      <article class="rcCard" style="border:1px solid var(--border,#ddd);border-radius:14px;padding:14px;margin:12px 0;background:var(--card,#fff)">
        <div style="font-size:12px;opacity:.75;margin-bottom:5px">${escText(item.categoria)} · Lote inicial</div>
        <h3 style="margin:0 0 10px;font-size:17px">${escText(item.nome)}</h3>
        <p style="margin:5px 0"><strong>Via registrada:</strong> ${escText(item.via)}</p>
        <p style="margin:5px 0"><strong>Texto original do documento:</strong></p>
        <blockquote style="margin:5px 0 10px;padding:9px 12px;border-left:3px solid var(--accent,#888);background:var(--surface,#f5f5f5);border-radius:4px">${escText(item.textoFonte)}</blockquote>
        <p style="margin:7px 0"><strong>Conferência:</strong> ${escText(item.observacao)}</p>
        <p style="margin:7px 0;font-size:12px;font-weight:600">Status: ${escText(item.status)}</p>
        <button type="button" onclick="receituarioCopy(${i})" style="padding:8px 12px;border-radius:9px;border:1px solid var(--border,#ccc);background:transparent;color:inherit;cursor:pointer">Copiar texto original</button>
      </article>`).join('');
    return `<section class="receituarioPage">
      <div style="padding:14px;border-radius:12px;border:1px solid #c98b39;background:var(--card,#fff);margin-bottom:14px">
        <strong>Material de referência — não é prescrição validada.</strong>
        <p style="margin:6px 0 0">Conteúdo transcrito de “Medicações no PS 2.pdf”. A inclusão no FlashMed não confirma segurança ou adequação clínica. Confira o protocolo institucional e os dados do paciente antes de usar.</p>
      </div>
      <p>Primeiro lote: 3 itens. Os textos originais são mantidos para facilitar a conferência; observações de revisão não substituem validação clínica.</p>
      ${cards}
    </section>`;
  };
  window.receituarioCopy = async function(index){
    const item = itens[index]; if(!item) return;
    const text = item.nome + '\\n' + item.textoFonte + '\\nFonte: Medicações no PS 2.pdf — transcrição de referência, não validada.';
    try {
      if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area=document.createElement('textarea'); area.value=text; area.style.position='fixed'; area.style.opacity='0';
        document.body.appendChild(area); area.select(); const ok=document.execCommand('copy'); area.remove();
        if(!ok) throw new Error('cópia indisponível');
      }
      alert('Texto original copiado. Confira e valide antes do uso clínico.');
    } catch(e) { alert('Não foi possível copiar automaticamente. Selecione o texto original e copie manualmente.'); }
  };
})();