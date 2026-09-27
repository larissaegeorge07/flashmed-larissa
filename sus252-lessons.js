// Camada didática FlashMed. Não altera enunciado, alternativas nem gabarito oficial.
const SUS252_CORES={
  "Dengue": "Na dengue, organize o raciocínio por fase clínica, sinais de alarme, gravidade e necessidade de hidratação/monitorização. Hemoconcentração, plaquetopenia e sinais de extravasamento plasmático mudam a estratificação.",
  "Rastreamento do câncer colorretal": "Rastreamento é para pessoas assintomáticas e depende de idade/risco. Testes de fezes e colonoscopia têm papéis diferentes; resultado alterado em teste de triagem costuma exigir investigação diagnóstica.",
  "Hipertensão arterial": "Confirme medidas adequadas e estratifique risco cardiovascular. A decisão terapêutica combina níveis pressóricos, comorbidades, lesão de órgão-alvo e medidas de estilo de vida.",
  "Trauma pélvico": "No trauma pélvico, pense primeiro em hemorragia e estabilidade hemodinâmica. Instabilidade muda a prioridade para controle rápido do sangramento e estabilização do anel pélvico.",
  "Lesão por pressão": "Prevenção de lesão por pressão exige redução de pressão prolongada, mudança de decúbito, avaliação da pele, mobilidade, nutrição e controle de umidade.",
  "Fratura exposta": "Fratura exposta é urgência: antibiótico precoce, profilaxia antitetânica quando indicada, cobertura estéril, avaliação neurovascular e desbridamento/estabilização conforme o caso.",
  "Divertículo de Meckel": "O divertículo de Meckel é remanescente do ducto onfalomesentérico e pode sangrar, inflamar ou causar obstrução; mucosa gástrica ectópica ajuda a explicar sangramento.",
  "Vaginose bacteriana": "Vaginose bacteriana costuma cursar com corrimento homogêneo, odor amínico, pH elevado e clue cells. É disbiose vaginal, não uma vaginite inflamatória clássica.",
  "Câncer de mama": "No câncer de mama, separe rastreamento, investigação de lesão suspeita, diagnóstico histológico e estadiamento. Conduta depende de características tumorais e extensão da doença.",
  "Contracepção na hipertensão": "Na hipertensão, o risco cardiovascular influencia a escolha contraceptiva; métodos com estrogênio exigem atenção especial conforme gravidade e controle pressórico.",
  "Contracepção hormonal": "Escolha contraceptiva depende de eficácia, contraindicações, preferências e fatores de risco. Estrogênio e progestagênio têm perfis de segurança diferentes.",
  "Contracepção de emergência": "Contracepção de emergência deve ser oferecida o mais cedo possível após relação desprotegida/falha do método; o tempo desde a relação orienta as opções.",
  "Infecção congênita e microcefalia": "Na microcefalia associada a infecção congênita, integre história gestacional, epidemiologia, achados fetais/neonatais e testes etiológicos; não conclua pelo achado isolado.",
  "Acidente escorpiônico": "No escorpionismo, gravidade é definida por manifestações locais versus sistêmicas. Crianças têm maior risco de formas graves e podem necessitar soro específico e monitorização.",
  "Vacinação contra COVID-19": "Questões de vacinação cobram indicação por faixa etária/grupo, esquema vigente, contraindicações verdadeiras e diferença entre eventos adversos e contraindicações.",
  "Puberdade masculina": "Na puberdade masculina, o aumento testicular costuma ser o primeiro sinal; a progressão é avaliada por estágios de Tanner e pela sequência esperada dos caracteres sexuais.",
  "Ginecomastia puberal": "Ginecomastia puberal é frequentemente fisiológica e transitória. Avalie simetria, duração, sinais de alarme, uso de drogas e achados que sugiram endocrinopatia.",
  "Judicialização da saúde": "Judicialização envolve acesso a tecnologias/ações de saúde pela via judicial e exige distinguir direito à saúde, evidência, incorporação tecnológica e organização do SUS.",
  "Febre tifoide": "Febre tifoide é causada por Salmonella Typhi; transmissão fecal-oral, contexto epidemiológico e métodos diagnósticos variam conforme fase da doença.",
  "Investigação de surtos": "Em surtos, defina caso, confirme existência e diagnóstico, descreva por tempo-lugar-pessoa, formule/teste hipóteses e implemente medidas de controle."
};
function applySUS252MiniLessons(){
 let changed=false;
 for(const q of SUS252){
  const core=SUS252_CORES[q.topic]||('Revise o conceito central de '+q.topic+'.');
  const isShort=q.type==='short';
  const official=isShort?(q.expected||'Padrão oficial cadastrado'):(q.alternatives?.[q.correctIndex]||'');
  const L=isShort?'':'ABCD'[q.correctIndex];
  const html=isShort?
   `<h3>📚 Mini-aula — ${q.topic}</h3><p><b>🔎 O que a questão quer de você?</b> Responder exatamente ao comando, usando os dados do caso para chegar ao conceito central.</p><p><b>🧠 O que você precisava saber:</b> ${core}</p><p><b>✅ Padrão oficial da banca:</b> ${official}.</p><p><b>🩷 Se você errou:</b> compare sua resposta com o padrão oficial e identifique se faltou o diagnóstico/conduta exata, um critério ou um termo-chave. A Anatomia dos Erros do FlashMed registra esse motivo separadamente.</p><p><b>💡 Leve para a prova:</b> ${core}</p>`:
   `<h3>📚 Mini-aula — ${q.topic}</h3><p><b>🔎 O que a questão quer de você?</b> Identifique o comando e procure no caso a pista que diferencia a alternativa correta das demais.</p><p><b>🧠 O que você precisava saber:</b> ${core}</p><p><b>✅ Gabarito preliminar oficial: ${L}.</b> ${official}</p><p><b>🩷 Se você errou:</b> volte à alternativa que marcou e compare com o conceito acima. O erro costuma estar em trocar diagnóstico por confirmação, etapa inicial por definitiva, critério por fator associado ou uma regra geral por uma exceção do caso.</p><p><b>🎯 Pegadinha da banca:</b> leia novamente as palavras de comando (como “imediata”, “mais adequada”, “confirmar”, “primeira linha” ou “principal”). Uma única palavra pode mudar a resposta.</p><p><b>💡 Leve para a prova:</b> ${core}</p>`;
  if(q.resolution!==html){q.resolution=html;changed=true}
 }
 return changed;
}
applySUS252MiniLessons();
