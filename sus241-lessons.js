// Camada didática FlashMed. Não altera enunciado, alternativas nem gabarito oficial.
const SUS241_CORES={
  "Hepatite aguda": "Na hepatite aguda, transaminases indicam lesão hepatocelular, mas gravidade se relaciona principalmente à função hepática, especialmente coagulopatia/INR e encefalopatia. A etiologia é investigada com sorologias e testes dirigidos.",
  "DPOC": "Na exacerbação de DPOC, priorize oxigenação controlada, broncodilatadores e avaliação de gravidade. A longo prazo, cessação do tabagismo, vacinação e broncodilatadores de longa ação reduzem risco.",
  "Hipotireoidismo": "Hipotireoidismo primário costuma apresentar TSH elevado e T4 livre baixo; Hashimoto é causa frequente e anti-TPO apoia etiologia autoimune. Levotiroxina é o tratamento de reposição.",
  "Trauma pélvico": "No trauma pélvico, pense primeiro em hemorragia e estabilidade hemodinâmica. Instabilidade muda a prioridade para controle rápido do sangramento e estabilização do anel pélvico.",
  "Trauma geniturinário": "Sangue no meato uretral após trauma pélvico sugere lesão uretral; evite instrumentação às cegas e investigue a uretra antes de sondagem.",
  "Trauma renal": "Trauma renal é graduado pela extensão da lesão parenquimatosa e vascular/coletora; a estabilidade hemodinâmica é central para a conduta.",
  "Hérnia inguinal": "Hérnias inguinais são classificadas em relação aos vasos epigástricos inferiores: indireta lateral e direta medial. Tratamento cirúrgico moderno busca reparo sem tensão quando indicado.",
  "Câncer gástrico": "Suspeita de câncer gástrico exige endoscopia com biópsia para diagnóstico histológico e, confirmada a neoplasia, estadiamento para definir tratamento.",
  "Ciclo menstrual": "A fase folicular ovariana corresponde à fase proliferativa endometrial; após a ovulação, a fase lútea é dominada por progesterona e corresponde ao endométrio secretor.",
  "Toxoplasmose na gestação": "IgM/IgG e avidez ajudam a estimar momento da infecção. Suspeita de infecção fetal pode ser investigada por PCR no líquido amniótico; tratamento muda conforme infecção materna versus fetal.",
  "Contracepção de emergência": "Contracepção de emergência deve ser oferecida o mais cedo possível após relação desprotegida/falha do método; o tempo desde a relação orienta as opções.",
  "Sífilis": "Na sífilis, interpretação depende do contexto de exposição, testes treponêmicos/não treponêmicos e estágio clínico. Penicilina benzatina é central no tratamento das formas não neurológicas.",
  "Vacinação e alergia a ovo": "Alergia alimentar não significa contraindicação automática a todas as vacinas. A prova costuma cobrar quais vacinas têm componentes/produção relacionados a ovo e quais precauções são realmente necessárias.",
  "Vacinação do adolescente": "Calendário do adolescente deve ser conferido por idade, doses anteriores e situações especiais; não presuma esquema completo apenas por vacinação infantil.",
  "Vacinação HPV": "Vacinação contra HPV é preventiva e tem maior benefício antes da exposição; indicação é definida por faixa etária e grupos contemplados pelo PNI vigente.",
  "Reanimação cardiopulmonar pediátrica": "PCR pediátrica frequentemente decorre de hipóxia/asfixia, por isso ventilação e oxigenação têm grande importância. Compressões devem ter profundidade adequada e adrenalina segue o algoritmo conforme ritmo e acesso.",
  "Giardíase": "Giardíase pode causar diarreia fétida, distensão e síndrome de malabsorção, especialmente com exposição a água/alimentos contaminados.",
  "Diarreia por malabsorção": "Diarreia por malabsorção decorre de absorção inadequada de nutrientes/solutos e pode cursar com distensão, perda ponderal e piora com determinados alimentos.",
  "Transtorno de estresse pós-traumático": "TEPT exige exposição traumática e sintomas persistentes de intrusão/revivência, evitação, alterações cognitivas/afetivas e hiperreatividade, com impacto funcional.",
  "Polifarmácia e interação medicamentosa": "Em idosos, revise indicação, interações e efeitos adversos de cada fármaco. Antiagregantes associados a AINEs podem aumentar risco hemorrágico.",
  "Conciliação medicamentosa": "Conciliação medicamentosa é um processo formal de comparar a lista real de medicamentos com prescrições nas transições de cuidado, prevenindo omissões, duplicidades e interações.",
  "Rastreamento do câncer de próstata": "Rastreamento de próstata exige decisão compartilhada sobre benefícios e danos. Idade, história familiar e ancestralidade modificam risco, e PSA não deve ser interpretado isoladamente.",
  "AVC isquêmico": "No AVC agudo, primeiro diferencie isquemia de hemorragia com neuroimagem. Fibrilação atrial favorece etiologia cardioembólica; terapias de reperfusão dependem de tempo, imagem e contraindicações.",
  "Fecaloma": "Fecaloma é impactação de fezes endurecidas, comum com opioides. Toque retal pode confirmar impactação distal e orientar desimpactação.",
  "Constipação por opioide": "Opioides reduzem motilidade intestinal; prevenção costuma exigir esquema laxativo desde o início, ajustado ao paciente.",
  "Avaliação pré-operatória": "Avaliação perioperatória estima capacidade funcional e risco cardiovascular; exames adicionais devem ser guiados pelo risco clínico, tipo de cirurgia e possibilidade de mudar conduta.",
  "Complicação pós-operatória": "Febre e dor focal no pós-operatório exigem procurar coleção/abscesso e outras complicações. Imagem define extensão; coleções infectadas frequentemente exigem antibiótico e drenagem.",
  "Hipertensão na gestação": "Hipertensão identificada antes de 20 semanas sugere hipertensão crônica. Depois, diferencie hipertensão gestacional de pré-eclâmpsia pela presença de proteinúria ou disfunção de órgão-alvo.",
  "Prevenção de pré-eclâmpsia": "Em gestantes de alto risco, AAS em baixa dose é estratégia preventiva reconhecida; indicação e momento de início dependem da estratificação de risco.",
  "Pré-eclâmpsia": "Pré-eclâmpsia com sinais de gravidade é definida por critérios maternos/órgão-alvo, não apenas pela quantidade de proteinúria. Sintomas neurológicos são sinais de alerta.",
  "Rastreamento do câncer do colo do útero": "Rastreamento cervical depende de idade, histórico e método utilizado. Resultado normal e alterações citológicas têm intervalos de seguimento específicos segundo o protocolo adotado pela prova.",
  "ASC-US": "ASC-US é alteração citológica indeterminada; a conduta depende da idade e do protocolo vigente, podendo envolver repetição da citologia ou teste de HPV.",
  "LSIL": "LSIL representa lesão escamosa de baixo grau; seguimento depende de idade e protocolo, com repetição citológica ou avaliação adicional conforme contexto.",
  "Vasculite por IgA": "Vasculite por IgA costuma causar púrpura palpável em membros inferiores/glúteos, artralgia, dor abdominal e possível acometimento renal, geralmente sem trombocitopenia.",
  "Síndrome de Loeffler": "Síndrome de Loeffler é infiltrado pulmonar transitório com eosinofilia associado à migração larvária de helmintos, classicamente Ascaris.",
  "Ascaridíase": "Ascaris lumbricoides pode ter fase pulmonar durante migração larvária e fase intestinal; eosinofilia favorece a fase tecidual.",
  "Territorialização": "Georreferenciamento/geoprocessamento organiza informações de saúde no território e ajuda a visualizar distribuição espacial de casos, serviços e recursos.",
  "Participação comunitária": "Participação comunitária incorpora saberes e prioridades locais ao diagnóstico e planejamento, coerente com participação social e atuação territorial da ESF.",
  "Hanseníase": "O ser humano é o principal reservatório epidemiológico de Mycobacterium leprae na cadeia de transmissão humana.",
  "Diabetes mellitus tipo 2": "Falha de controle apesar de insulinização intensa e adesão pode indicar necessidade de avaliação especializada, especialmente quando o caso excede a capacidade resolutiva local.",
  "Estado nutricional": "Em adultos, IMC = peso/altura²; a classificação nutricional deve ser feita a partir desse valor, sem confundir circunferência abdominal com IMC.",
  "Telessaúde": "Telessaúde pode aproximar atenção primária e especialista por teleconsulta/teleinterconsulta/telematriciamento, reduzindo barreiras geográficas."
};
function applySUS241MiniLessons(){
 let changed=false;
 for(const q of SUS241){
  if(q.annulled)continue; // Definitive official annulments must never receive a letter-based mini-lesson.
  const core=SUS241_CORES[q.topic]||('Revise o conceito central de '+q.topic+'.');
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
applySUS241MiniLessons();
