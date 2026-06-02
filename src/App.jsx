import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXmKSM3YMw5Uh6W0FMQOu_tLZcU7Y0mc8",
  authDomain: "treinamento-comercial.firebaseapp.com",
  projectId: "treinamento-comercial",
  storageBucket: "treinamento-comercial.firebasestorage.app",
  messagingSenderId: "93245852415",
  appId: "1:93245852415:web:c39dc7a19b5261e11f1aca"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── USUÁRIOS DO SISTEMA ─────────────────────────────────────────
const ADMINS = [
  { nome: "John",    senha: "VB2026#@" },
  { nome: "David",   senha: "VB2026#@" },
  { nome: "Patrick", senha: "VB2026#@" },
];

const VENDEDORES = [
  { nome: "Analu",   senha: "VB2026#@!%" },
  { nome: "Thais",   senha: "VB2026#@$&" },
  { nome: "Tamires", senha: "VB2026#@*^" },
  { nome: "Carlos",  senha: "VB2026#@=+" },
  { nome: "Edson",   senha: "VB2026#@?>" },
  { nome: "Izabel",  senha: "VB2026#@~<" },
];

const autenticarAdmin   = (nome, senha) => ADMINS.find(a => a.nome.toLowerCase() === nome.toLowerCase() && a.senha === senha) || null;
const autenticarVendedor = (nome, senha) => VENDEDORES.find(v => v.nome.toLowerCase() === nome.toLowerCase() && v.senha === senha) || null;
const LOGO_URL = "https://voipdobrasil.com.br/wp-content/uploads/2024/05/act_Voip_Logo_Vertical_Amarelo_RGB1.png";
const MONT = "'Montserrat', sans-serif";
const OPEN = "'Open Sans', sans-serif";
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;600&display=swap');";

const C = {
  amarelo: "#F5C200", amareloEscuro: "#F5A000",
  preto: "#0a0a0a", branco: "#ffffff", fundo: "#f7f7f7",
  borda: "#e8e8e8", texto: "#1a1a1a", suave: "#888", claro: "#bbb",
  verde: "#1a8c4e", vermelho: "#c0392b", laranja: "#e65c00",
};

const corNota = (n) => n >= 8 ? C.verde : n >= 6 ? C.amareloEscuro : C.vermelho;

// ─── CENÁRIOS MÚLTIPLA ESCOLHA ────────────────────────────────────
const CENARIOS_RAPIDOS = [
  {
    id: 1, titulo: "Cenário 01", dificuldade: "Fácil", corDif: C.verde, bgDif: "#EAFAF1", bordaDif: "#1a8c4e33",
    tema: "Plano Pessoal",
    roteiro: [
      { lead: "Boa tarde, queria saber sobre os planos de vocês", opcoes: [
        { texto: "Boa tarde! Claro! É para uso pessoal ou empresa?", pontos: 10, feedback: "Perfeito! Qualificar antes de apresentar é o caminho certo." },
        { texto: "Temos planos a partir de R$44,99!", pontos: 2, feedback: "Jogou preço antes de entender a necessidade. Sempre qualifique primeiro." },
        { texto: "Boa tarde! Em que posso ajudar?", pontos: 5, feedback: "Ok, mas poderia já ter direcionado com uma pergunta de qualificação." },
      ]},
      { lead: "É pessoal, quero usar no celular", opcoes: [
        { texto: "Legal! Você liga mais para fixo ou celular? E tem ideia de quantos minutos usa por mês?", pontos: 10, feedback: "Excelente! Entender o perfil de uso é essencial para indicar o plano certo." },
        { texto: "Então o Fale à Vontade por R$94,99 é pra você!", pontos: 3, feedback: "Calma! Sem entender o volume você pode oferecer algo errado." },
        { texto: "Temos ótimas opções para você!", pontos: 5, feedback: "Entusiasmo bom, mas ainda falta qualificar." },
      ]},
      { lead: "Uso bastante, principalmente celular", opcoes: [
        { texto: "Para quem usa bastante o Fale à Vontade é o ideal — R$94,99/mês com ligações ilimitadas. Posso te enviar o link agora?", pontos: 10, feedback: "Produto certo, justificado e com próximo passo. Perfeito!" },
        { texto: "R$84,99 com 1060 minutos então.", pontos: 5, feedback: "Para quem usa bastante o ilimitado é mais seguro e vende melhor." },
        { texto: "Entendi, você precisa de muitos minutos.", pontos: 3, feedback: "Reconheceu mas não avançou para o fechamento." },
      ]},
      { lead: "Tem teste grátis?", opcoes: [
        { texto: "Sim! 14 dias grátis, sem compromisso. Posso cadastrar você agora, o que acha?", pontos: 10, feedback: "Usou o diferencial da VB e fechou com call to action. Perfeito!" },
        { texto: "Não temos teste grátis.", pontos: 0, feedback: "Incorreto! A VB oferece 14 dias grátis. Sempre use esse diferencial!" },
        { texto: "Pode cancelar quando quiser.", pontos: 4, feedback: "Não é o melhor argumento. A VB tem 14 dias grátis — use!" },
      ]},
    ],
  },
  {
    id: 2, titulo: "Cenário 02", dificuldade: "Fácil", corDif: C.verde, bgDif: "#EAFAF1", bordaDif: "#1a8c4e33",
    tema: "Portabilidade",
    roteiro: [
      { lead: "Quero portar meu número fixo para o celular. É possível?", opcoes: [
        { texto: "É sim! Para verificar a cobertura, qual o DDD e cidade do número?", pontos: 10, feedback: "Direto ao ponto! Pediu a informação necessária sem enrolar." },
        { texto: "É possível mas leva 15 dias úteis e precisa de documentos...", pontos: 2, feedback: "Despejou informação demais. O cliente vai travar. Vá por partes." },
        { texto: "Claro, temos essa solução!", pontos: 6, feedback: "Boa confirmação, mas já poderia ter pedido o DDD." },
      ]},
      { lead: "DDD 51, Porto Alegre", opcoes: [
        { texto: "Porto Alegre portamos sim! É para PF ou PJ?", pontos: 10, feedback: "Confirmou a cobertura e foi para a próxima qualificação. Eficiente!" },
        { texto: "Portamos! Para portabilidade precisa de fatura recente, documento pessoal...", pontos: 4, feedback: "Tudo de uma vez. Vá aos poucos." },
        { texto: "Ótimo, essa região tem cobertura!", pontos: 6, feedback: "Confirmou mas perdeu a chance de qualificar PF ou PJ." },
      ]},
      { lead: "PJ, empresa minha", opcoes: [
        { texto: "Perfeito! Quantos ramais vai precisar? Só receber ou também fazer ligações?", pontos: 10, feedback: "Ótimo! Aprofundou para entender o tamanho real da necessidade." },
        { texto: "Para PJ precisa de CNPJ, fatura recente e documento do responsável.", pontos: 5, feedback: "Foi direto para documentos sem entender a operação." },
        { texto: "Certo, vou te passar os documentos necessários.", pontos: 4, feedback: "Adiantou o processo sem entender a necessidade." },
      ]},
      { lead: "Só um número, para receber mesmo", opcoes: [
        { texto: "Entendido! Número virtual com portabilidade, foco em recebimento. Me passa seu e-mail para eu te enviar a proposta!", pontos: 10, feedback: "Fechamento perfeito! Resumiu, confirmou e pediu o próximo passo." },
        { texto: "Ok! Em até 15 dias úteis está pronto.", pontos: 6, feedback: "Boa explicação, mas não conduziu para o fechamento." },
        { texto: "Temos o plano Controle que é ideal para você.", pontos: 7, feedback: "Boa indicação, mas poderia ter avançado para o fechamento." },
      ]},
    ],
  },
  {
    id: 3, titulo: "Cenário 03", dificuldade: "Médio", corDif: C.laranja, bgDif: "#FFF3E0", bordaDif: "#e65c0033",
    tema: "PABX para Equipe",
    roteiro: [
      { lead: "Preciso de sistema de telefonia para minha equipe de vendas", opcoes: [
        { texto: "Quantas pessoas na equipe e como fazem as ligações hoje?", pontos: 10, feedback: "Entender o cenário atual é o primeiro passo antes de qualquer proposta." },
        { texto: "Temos PABX Virtual com 35+ recursos! R$35/ramal/mês.", pontos: 2, feedback: "Vendeu antes de entender. Proponha solução depois de conhecer o problema." },
        { texto: "Pode me falar mais sobre sua operação?", pontos: 8, feedback: "Boa pergunta, mas poderia ser mais específico." },
      ]},
      { lead: "São 4 vendedores, hoje usam celular pessoal e tá uma bagunça", opcoes: [
        { texto: "Com PABX cada vendedor tem ramal próprio, ligações passam pela empresa, dá para gravar e ver relatórios. Resolve exatamente isso. Faz sentido?", pontos: 10, feedback: "Conectou a dor com os benefícios. Muito bom!" },
        { texto: "São 4 ramais, fica R$140/mês mais os minutos.", pontos: 4, feedback: "Jogou preço antes de convencer o valor." },
        { texto: "Sim, celular pessoal é complicado mesmo.", pontos: 5, feedback: "Validou a dor mas não apresentou a solução." },
      ]},
      { lead: "Faz sentido. Ligam muito para celular", opcoes: [
        { texto: "Para volume alto de ligações para celular o plano ilimitado é o mais indicado. Posso montar uma simulação de custo para os 4 vendedores?", pontos: 10, feedback: "Identificou a necessidade e ofereceu proposta personalizada. Excelente!" },
        { texto: "Temos pacotes de 150, 350, 500, 1000 e 1500 minutos.", pontos: 4, feedback: "Despejou tabela sem recomendar. O cliente fica perdido." },
        { texto: "Os pacotes são personalizados.", pontos: 6, feedback: "Poderia ter recomendado algo específico." },
      ]},
      { lead: "Monta a simulação. Tem suporte? Não quero ficar na mão", opcoes: [
        { texto: "Suporte humano 24h é nosso maior diferencial — somos a única operadora com ISO 9001 em qualidade. Manda seu e-mail que te envio a simulação agora!", pontos: 10, feedback: "Diferencial certo para a objeção certa. Fechou com call to action. Perfeito!" },
        { texto: "Sim temos suporte.", pontos: 3, feedback: "Fraco! Suporte 24h com ISO 9001 é enorme — use!" },
        { texto: "Temos suporte técnico disponível.", pontos: 5, feedback: "Confirmou mas não aproveitou o diferencial competitivo." },
      ]},
    ],
  },
  {
    id: 4, titulo: "Cenário 04", dificuldade: "Médio", corDif: C.laranja, bgDif: "#FFF3E0", bordaDif: "#e65c0033",
    tema: "Cliente Irritado",
    roteiro: [
      { lead: "5 clientes reclamando que não conseguem falar comigo. Liguei no suporte às 9h e até agora ninguém me respondeu!", opcoes: [
        { texto: "Entendo sua frustração e me desculpe pela demora. Vou verificar sua conta agora e acionar o suporte com prioridade. Um momento?", pontos: 10, feedback: "Reconheceu a falha, se desculpou e tomou ação. Exatamente o que o cliente precisa." },
        { texto: "Vou verificar o seu caso.", pontos: 3, feedback: "Resposta fria. O cliente irritado precisa sentir que você está do lado dele." },
        { texto: "Qual o seu CNPJ?", pontos: 1, feedback: "Pediu dado sem reconhecer a situação. Vai irritar ainda mais." },
      ]},
      { lead: "Ramais conectados mas clientes não conseguem falar", opcoes: [
        { texto: "Ramal conectado mas sem receber ligação pode ser problema de rota. Confirma o CNPJ para eu localizar e acionar o técnico agora?", pontos: 10, feedback: "Demonstrou conhecimento técnico e pediu o dado necessário." },
        { texto: "Estranho, se está conectado deveria funcionar.", pontos: 2, feedback: "Nunca questione o problema do cliente — investigue." },
        { texto: "Preciso verificar. Qual o CNPJ?", pontos: 6, feedback: "Ok, mas poderia ter dado uma explicação técnica para tranquilizar." },
      ]},
      { lead: "CNPJ 065.812.065/0001-99. Isso me prejudica muito!", opcoes: [
        { texto: "Localizei! Acionando suporte técnico com prioridade máxima agora. A Larissa vai te chamar no WhatsApp em minutos. Aguarda?", pontos: 10, feedback: "Ação concreta, prazo e nome responsável. Cliente sente que está sendo cuidado." },
        { texto: "Vou abrir um chamado para o suporte.", pontos: 5, feedback: "Encaminhou sem urgência, sem dar nome ou prazo." },
        { texto: "Vou verificar e retorno em breve.", pontos: 2, feedback: "'Em breve' é o que ele ouviu o dia todo. Seja específico." },
      ]},
      { lead: "Espero que resolvam logo, isso é inadmissível", opcoes: [
        { texto: "Concordo. A Larissa já está te chamando agora. Se não chegar em 5 minutos me ligue de volta — vou acompanhar pessoalmente.", pontos: 10, feedback: "Assumiu responsabilidade, deu prazo concreto e se comprometeu. Excelente recuperação!" },
        { texto: "Peço desculpas pelo transtorno.", pontos: 5, feedback: "Desculpa ok, mas precisava de ação concreta." },
        { texto: "Estamos trabalhando para resolver.", pontos: 3, feedback: "Vago demais. Seja específico e se comprometa." },
      ]},
    ],
  },
  {
    id: 5, titulo: "Cenário 05", dificuldade: "Médio", corDif: C.laranja, bgDif: "#FFF3E0", bordaDif: "#e65c0033",
    tema: "Migração de Concorrente",
    roteiro: [
      { lead: "Uso GoTo hoje mas quero trocar. Suporte péssimo", opcoes: [
        { texto: "Entendo! Suporte é crítico. Quantas pessoas usam e qual o maior problema hoje?", pontos: 10, feedback: "Validou a dor e aprofundou para entender melhor." },
        { texto: "Na VB temos suporte 24h, somos os melhores!", pontos: 4, feedback: "Rápido demais para o pitch. Entenda antes de vender." },
        { texto: "Posso te mostrar nossa solução!", pontos: 3, feedback: "Pulou para o produto sem entender o problema." },
      ]},
      { lead: "4 vendedores fazendo ligações. O GoTo trava muito", opcoes: [
        { texto: "4 vendedores, ligações, suporte ruim — resolvemos. 99,99% de estabilidade e suporte 24h com ISO 9001. Posso fazer um teste grátis de 14 dias?", pontos: 10, feedback: "Conectou os problemas com os diferenciais da VB. Cirúrgico!" },
        { texto: "Nossa plataforma não trava.", pontos: 5, feedback: "Use números: 99,99% de estabilidade, ISO 9001." },
        { texto: "Temos ótima solução para isso!", pontos: 3, feedback: "Vago. O cliente quer especificidades." },
      ]},
      { lead: "14 dias grátis? Sem pagar nada?", opcoes: [
        { texto: "Real! 14 dias, sem cartão, sem compromisso. Testa com toda a equipe e decide. Quer começar hoje?", pontos: 10, feedback: "Confirmou com entusiasmo e fechou com urgência. Perfeito!" },
        { texto: "Sim, leia os termos no site.", pontos: 2, feedback: "Desanimou o cliente mandando para os termos." },
        { texto: "Sim, oferecemos um período de teste.", pontos: 6, feedback: "Confirmou mas sem conduzir para o próximo passo." },
      ]},
      { lead: "A migração é complicada?", opcoes: [
        { texto: "Sem dor de cabeça! Equipe dedicada de onboarding, sem taxa de instalação e gerente de conta acompanha tudo. Em quanto tempo quer estar operando?", pontos: 10, feedback: "Eliminou a objeção com fatos e conduziu para o fechamento." },
        { texto: "Não é complicado, depende da sua estrutura.", pontos: 4, feedback: "Gerou dúvida. Seja assertivo." },
        { texto: "Cuidamos de toda a migração.", pontos: 7, feedback: "Boa afirmação mas poderia detalhar os diferenciais." },
      ]},
    ],
  },
  {
    id: 6, titulo: "Cenário 06", dificuldade: "Difícil", corDif: C.vermelho, bgDif: "#FEECEC", bordaDif: "#c0392b33",
    tema: "Lead Grande — Thais",
    roteiro: [
      { lead: "Precisamos de telefonia para empresa com 3 filiais e 25 colaboradores", opcoes: [
        { texto: "Uma operação desse porte merece atenção especial. Vou conectar você com nossa especialista em contas corporativas, a Thais. Me passa seu e-mail?", pontos: 10, feedback: "Reconheceu o porte e fez a passagem correta para a Thais." },
        { texto: "PABX Virtual, R$35/ramal. Para 25 pessoas seria R$875/mês.", pontos: 1, feedback: "Erro grave! Lead desse porte precisa ir para a Thais." },
        { texto: "Pode me contar mais sobre a operação?", pontos: 5, feedback: "Com 3 filiais e 25 colaboradores já deveria pensar em passar para a Thais." },
      ]},
      { lead: "Precisamos de PABX, CRM integrado e suporte dedicado", opcoes: [
        { texto: "Exatamente o que nossa equipe de contas corporativas atende. A Thais monta a proposta completa. Qual o melhor horário para ela te ligar hoje?", pontos: 10, feedback: "Reconheceu que é conta grande e conduziu para a Thais com urgência." },
        { texto: "Temos integração com CRM sim! Posso te passar os detalhes.", pontos: 3, feedback: "Está tentando fechar sem a especialista. Passe para a Thais!" },
        { texto: "Vou verificar o que temos disponível.", pontos: 2, feedback: "Passe para a Thais — você pode perder esse lead." },
      ]},
      { lead: "Me passa uma ideia de valor", opcoes: [
        { texto: "Propostas desse porte são personalizadas — a Thais analisa sua operação e monta sob medida. Confirmo seu contato para ela chegar preparada?", pontos: 10, feedback: "Não entrou em preço sem a especialista e avançou corretamente." },
        { texto: "Fica em torno de R$35 por ramal, uns R$875/mês.", pontos: 2, feedback: "Nunca cite preços em contas corporativas sem a Thais." },
        { texto: "Os valores variam dependendo da configuração.", pontos: 6, feedback: "Não entrou em número, ok. Mas conduza melhor para a Thais." },
      ]},
      { lead: "Ok, pode passar meu contato para ela", opcoes: [
        { texto: "Ótimo! Nome completo e e-mail? A Thais entra em contato até as 14h de hoje. Obrigado pela confiança!", pontos: 10, feedback: "Fechamento perfeito da passagem! Coletou dados, deu prazo e agradeceu." },
        { texto: "Ótimo, vou passar para ela.", pontos: 6, feedback: "Ok mas não coletou dados nem deu prazo." },
        { texto: "Perfeito, obrigado!", pontos: 3, feedback: "Passagem incompleta — sem dados e sem prazo." },
      ]},
    ],
  },
  {
    id: 7, titulo: "Cenário 07", dificuldade: "Difícil", corDif: C.vermelho, bgDif: "#FEECEC", bordaDif: "#c0392b33",
    tema: "Objeção de Preço",
    roteiro: [
      { lead: "Achei os planos caros comparado com o que uso hoje", opcoes: [
        { texto: "O que você usa hoje? Quero entender o que está comparando para ter certeza que é justo.", pontos: 10, feedback: "Não se defendeu — pediu informação para comparação justa." },
        { texto: "Nossos preços são competitivos e incluem suporte 24h!", pontos: 4, feedback: "Defendeu o preço sem entender o que está sendo comparado." },
        { texto: "O que está incluso justifica o investimento.", pontos: 5, feedback: "Sem entender o que o cliente usa, o argumento é fraco." },
      ]},
      { lead: "Uso solução básica, pago R$30/mês", opcoes: [
        { texto: "Faz sentido a diferença! Mas essa solução tem suporte 24h? Gravação de chamadas? App para celular? Com a VB você tem tudo isso incluído.", pontos: 10, feedback: "Não brigou com o preço — mostrou o que o preço mais alto entrega." },
        { texto: "R$30 é muito básico, não tem os recursos que precisa.", pontos: 3, feedback: "Nunca diminua o que o cliente usa. Compare sem depreciar." },
        { texto: "Nossa solução tem muito mais recursos.", pontos: 6, feedback: "Liste os recursos específicos, não seja vago." },
      ]},
      { lead: "Não tem essas coisas. Mas preciso mesmo?", opcoes: [
        { texto: "Boa pergunta! Você já perdeu uma ligação importante? Já precisou ouvir uma gravação para resolver um conflito? Se sim, cada recurso se paga sozinho.", pontos: 10, feedback: "Fez o cliente refletir com perguntas práticas. Muito eficaz!" },
        { texto: "Com certeza precisa! Todos os nossos clientes usam.", pontos: 2, feedback: "Pressão sem embasamento. Faça o cliente refletir." },
        { texto: "Depende do tamanho da operação.", pontos: 5, feedback: "Poderia ter aprofundado com perguntas." },
      ]},
      { lead: "Verdade, já tive problema com isso. Têm teste grátis?", opcoes: [
        { texto: "14 dias grátis, sem cartão. Compara na prática e decide. Posso cadastrar agora?", pontos: 10, feedback: "Confirmou e fechou com urgência. Perfeito!" },
        { texto: "Sim, acesse o site para se cadastrar.", pontos: 4, feedback: "Mandou para o site. Conduza o fechamento você mesmo!" },
        { texto: "Sim temos período de teste.", pontos: 6, feedback: "Confirmou mas perdeu o momento de fechar." },
      ]},
    ],
  },
  {
    id: 8, titulo: "Cenário 08", dificuldade: "Difícil", corDif: C.vermelho, bgDif: "#FEECEC", bordaDif: "#c0392b33",
    tema: "WhatsApp Business",
    roteiro: [
      { lead: "Preciso de número fixo que funcione no WhatsApp Business", opcoes: [
        { texto: "Temos essa solução! É para uso individual ou equipe atender pelo WhatsApp?", pontos: 10, feedback: "Confirmou que tem e já qualificou o uso." },
        { texto: "Temos número virtual compatível com WhatsApp Business! Fica R$X/mês.", pontos: 4, feedback: "Jogou preço sem qualificar." },
        { texto: "Sim temos essa opção!", pontos: 6, feedback: "Confirmou mas não qualificou." },
      ]},
      { lead: "Individual, vou usar para atender clientes", opcoes: [
        { texto: "Só para confirmar — quer receber ligações nesse número também ou é só para o WhatsApp?", pontos: 10, feedback: "Qualificação essencial! Muda a configuração e o plano indicado." },
        { texto: "O número virtual PJ resolve isso!", pontos: 6, feedback: "Não confirmou se quer ligações também." },
        { texto: "Vou te passar as opções.", pontos: 4, feedback: "Não qualificou completamente antes de apresentar." },
      ]},
      { lead: "Quero receber e fazer ligações também", opcoes: [
        { texto: "Perfeito! Número virtual + Fale à Vontade por R$94,99 com tudo incluso. Quer fazer o teste de 14 dias grátis?", pontos: 10, feedback: "Montou a solução completa baseada na necessidade e fechou. Excelente!" },
        { texto: "Precisa do plano com minutos. Temos várias opções.", pontos: 5, feedback: "Apresente uma recomendação clara, não 'várias opções'." },
        { texto: "Planos a partir de R$44,99.", pontos: 3, feedback: "Começou pelo mais barato sem entender o volume." },
      ]},
      { lead: "Como faço para ativar hoje mesmo?", opcoes: [
        { texto: "Acesse voipdobrasil.com.br, cadastro rápido e número ativo em até 3 horas. Posso te enviar o link direto agora?", pontos: 10, feedback: "Fechamento impecável! Passo a passo, prazo e se ofereceu para facilitar." },
        { texto: "Acessa o site e faz o cadastro.", pontos: 5, feedback: "Funcional, mas seja proativo: envie o link." },
        { texto: "Vou te enviar as informações por e-mail.", pontos: 6, feedback: "Cliente quer ativar hoje — dê o link direto." },
      ]},
    ],
  },
];

// ─── CENÁRIOS SIMULADO REAL ───────────────────────────────────────
const CENARIOS_REAIS = [
  {
    id: "R1",
    titulo: "Simulado Real 01",
    dificuldade: "Avançado",
    tema: "Venda Consultiva — SPIN Selling",
    descricao: "Aplique a metodologia SPIN: Situação, Problema, Implicação e Necessidade. O lead tem uma central analógica e nunca ouviu falar de VoIP.",
    contexto: `PERFIL DO LEAD: Marcos Oliveira, gerente administrativo de uma distribuidora em São Paulo com 15 funcionários.
Situação atual: PABX analógico antigo (Intelbras), conta telefônica alta, sem relatórios, sem gravação.
Ele nunca ouviu falar de VoIP direito. Desconfia de tecnologia nova.
Sua missão: Usar SPIN Selling para conduzir a conversa — primeiro entender a situação (S), identificar o problema (P), mostrar as implicações (I) e criar a necessidade da solução (N).
Dica: Não jogue produto antes de ter feito pelo menos 3 perguntas de diagnóstico.`,
    mensagensLead: [
      "Oi, vi o anúncio de vocês. O que é esse tal de VoIP?",
      "Ah entendi. E é melhor que o meu telefone normal?",
      "Uso um PABX antigo aqui, Intelbras. Funciona mas a conta é cara",
      "É cara sim, uns R$800 por mês só de telefone",
      "Nunca calculei direito não. Tem relatório de ligações?",
      "Não tenho nada disso. E se cair a internet?",
      "Temos fibra óptica aqui, mas fico com medo de ficar sem telefone",
      "E o PABX de vocês funciona no celular também?",
      "Interessante. E a migração, é complicada?",
      "Minha central atual tem 8 anos, começou a dar problema",
      "Quanto custa pra eu ter uns 10 ramais com vocês?",
      "E tem gravação de chamadas?",
      "Posso testar antes de contratar?",
      "14 dias grátis? Isso é real mesmo?",
      "E o suporte? Já fui muito mal atendido em outras empresas",
      "Vocês têm certificação? Algum selo de qualidade?",
      "Pode me mandar uma proposta formal?",
      "Qual o prazo para começar a funcionar após contratar?",
      "Preciso falar com meu sócio antes. Como fica?",
      "Ok, vou falar com ele e te dou uma resposta. O que você me recomenda?"
    ],
  },
  {
    id: "R2",
    titulo: "Simulado Real 02",
    dificuldade: "Avançado",
    tema: "Suporte Técnico — Cliente em Crise",
    descricao: "Uma empresa está há 3 horas sem telefone. O cliente está no limite da paciência. Você precisa resolver e recuperar a confiança.",
    contexto: `PERFIL DO LEAD: Rossana, diretora de uma empresa de contabilidade em SC com 12 funcionários.
Situação: 3 horas sem telefone. Já abriu 2 chamados que não foram resolvidos. Clientes ligando e não conseguindo falar.
Ela está muito irritada mas precisa de solução, não de desculpas.
Sua missão: Acolher sem ser genérico, investigar o problema com perguntas técnicas certas, dar transparência sobre o que está acontecendo e dar um encaminhamento concreto com prazo.
Técnica: Escuta ativa + empatia genuína + ação concreta. Nunca diga "vou verificar" sem dar um prazo.`,
    mensagensLead: [
      "Preciso de ajuda URGENTE. Estamos há 3 horas sem telefone!",
      "Já abri 2 chamados e ninguém resolveu nada!",
      "São 12 funcionários parados aqui, isso é um absurdo",
      "Meu CNPJ é 16.416.528/0001-86, já localizou?",
      "Os ramais mostram que estão online mas não recebe nem faz ligação",
      "Usamos telefone IP, modelo Yealink T46S",
      "A internet está normal, outros sistemas funcionando",
      "Já reiniciei os aparelhos e nada",
      "Quanto tempo isso vai levar para resolver?",
      "Que problema técnico é esse? Me explica direito",
      "Isso é problema de vocês ou da operadora?",
      "Preciso de um número alternativo para meus clientes ligarem enquanto isso",
      "Minha conta está em dia, né? Não quero ouvir que é financeiro",
      "Tem como acionar alguém mais sênior?",
      "Já estou pensando em trocar de operadora",
      "O que exatamente está sendo feito agora?",
      "Me passa um número de protocolo oficial",
      "Quando exatamente vou ter retorno?",
      "Se não resolver até as 17h vou cancelar o contrato",
      "Ok. Mas me explica o que causou esse problema para não acontecer de novo"
    ],
  },
  {
    id: "R3",
    titulo: "Simulado Real 03",
    dificuldade: "Avançado",
    tema: "Técnico Avançado — Asterisk e SIP Trunk",
    descricao: "Um cliente técnico quer migrar do Asterisk próprio para a VB. Ele sabe muito de telefonia. Você precisa demonstrar conhecimento técnico e valor.",
    contexto: `PERFIL DO LEAD: Fernando Gomes, gerente de TI de uma empresa com 80 funcionários.
Situação: Hoje usam Asterisk próprio com SIP Trunk de outro provedor. Tiveram problemas de qualidade de voz e instabilidade. O gerente de TI é técnico e vai testar seu conhecimento.
Ele vai perguntar sobre SIP, codecs, QoS, failover e integração com o sistema deles.
Sua missão: Demonstrar conhecimento técnico suficiente para transmitir confiança, sem inventar respostas. Quando não souber algo específico, seja honesto e comprometa-se a buscar a informação.
Dica: A VB usa protocolo SIP, suporta os principais codecs (G.711, G.729), tem redundância e suporte técnico especializado 24h.`,
    mensagensLead: [
      "Olá, nossa empresa usa Asterisk próprio com SIP Trunk. Estamos avaliando migrar para vocês",
      "Antes de mais nada: vocês usam SIP ou algum protocolo proprietário?",
      "Ok, e quais codecs suportam? Usamos G.729 aqui por conta da largura de banda",
      "E tem QoS? Nossa rede tem VLAN separada para voz",
      "Temos hoje 30 ramais ativos com o Asterisk. Vocês suportam isso tranquilo?",
      "E em termos de redundância? Nosso sistema atual fica fora às vezes",
      "Quanto de latência vocês garantem? Já tivemos problema de eco e atraso",
      "E failover automático? Se cair a internet principal tem contingência?",
      "Nosso Asterisk está integrado com nosso CRM via AMI. Vocês têm API?",
      "E gravação de chamadas? Precisamos por compliance",
      "O SIP Trunk de vocês aceita o prefixo de discagem que já usamos?",
      "Quanto custa o SIP Trunk por DID?",
      "E portabilidade dos 12 números que temos hoje é possível?",
      "Qual o prazo para portabilidade de números fixos?",
      "Temos filiais em 3 estados. Vocês atendem todo o Brasil?",
      "E o suporte técnico? Nosso time de TI trabalha até às 22h às vezes",
      "Tem SLA documentado? Preciso apresentar para o diretor",
      "Vocês têm cases de migração de Asterisk para a plataforma de vocês?",
      "O que eu precisaria para fazer um teste piloto com 5 ramais?",
      "Qual seria o processo de migração para não impactar a operação?"
    ],
  },
  {
    id: "R4",
    titulo: "Simulado Real 04",
    dificuldade: "Avançado",
    tema: "Negociação — Renovação e Retenção",
    descricao: "Um cliente ativo há 2 anos quer cancelar porque recebeu proposta mais barata do concorrente. Você precisa reter sem entrar em guerra de preço.",
    contexto: `PERFIL DO LEAD: Juliana Mendes, gestora de uma clínica médica, cliente da VB há 2 anos.
Situação: Recebeu proposta de concorrente 30% mais barata. Está avaliando se cancela. Nunca teve problema sério com a VB, mas o preço está pesando no orçamento.
Sua missão: Primeiro entender o que a proposta do concorrente inclui (geralmente não inclui tudo). Depois mostrar o valor do que ela já tem e o risco de migrar. Não entre em guerra de preço — mostre o custo total e o risco.
Técnica: Retenção consultiva. Pergunte antes de defender.`,
    mensagensLead: [
      "Oi, preciso falar sobre meu contrato. Estou pensando em cancelar",
      "Recebi uma proposta mais barata de outra operadora",
      "30% mais barato. São uns R$180 de diferença por mês",
      "Sei que vocês têm qualidade mas orçamento está apertado",
      "Já sou cliente há 2 anos, nunca tive problema sério",
      "A proposta deles inclui 5 ramais e minutos ilimitados",
      "Eles disseram que a migração é grátis e sem interrupção",
      "Mas fiquei com dúvida sobre o suporte deles, são novos no mercado",
      "Vocês conseguem me dar algum desconto?",
      "E se eu renovar por 12 meses, tem algum benefício?",
      "Me preocupa perder os números que tenho hoje na portabilidade",
      "E o histórico de gravações que tenho com vocês, perco tudo?",
      "Nunca precisei muito do suporte de vocês, mas quando precisei foi ótimo",
      "Quanto tempo levaria para eu voltar para vocês se o concorrente não prestar?",
      "Essa diferença de R$180 por mês parece pouco mas em 12 meses é R$2160",
      "O que vocês têm que eles definitivamente não têm?",
      "Vocês têm ISO 9001 né? Eles têm isso?",
      "Se eu cancelar agora tem multa?",
      "Preciso decidir essa semana. O que você me sugere?",
      "Ok, me manda uma proposta de renovação com o que conversamos"
    ],
  },
];

// ─── FIREBASE ────────────────────────────────────────────────────
const salvar = async (dados) => {
  try {
    await addDoc(collection(db, "simulacoes"), { ...dados, timestamp: new Date().toISOString(), data: new Date().toLocaleDateString("pt-BR") });
  } catch (e) { console.error(e); }
};

const buscar = async (vendedor) => {
  try {
    const q = vendedor
      ? query(collection(db, "simulacoes"), where("vendedor", "==", vendedor), orderBy("timestamp", "desc"))
      : query(collection(db, "simulacoes"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
};

// ─── ESTILOS ─────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: C.branco, fontFamily: OPEN, color: C.texto },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: `1px solid ${C.borda}`, background: C.branco, position: "sticky", top: 0, zIndex: 100 },
  btnAmarelo: { background: C.amarelo, border: "none", borderRadius: 10, padding: "12px 24px", color: C.preto, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: MONT },
  btnAmareloFull: { width: "100%", background: C.amarelo, border: "none", borderRadius: 10, padding: "13px 0", color: C.preto, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: MONT },
  btnGhost: { background: "none", border: `1px solid ${C.borda}`, borderRadius: 8, padding: "7px 14px", color: C.suave, cursor: "pointer", fontSize: 12, fontFamily: OPEN },
  btnGestor: { background: "none", border: `1px solid ${C.amarelo}66`, borderRadius: 8, padding: "7px 14px", color: C.amareloEscuro, cursor: "pointer", fontSize: 12, fontFamily: MONT, fontWeight: 600 },
  input: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 10, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN },
  card: { background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "22px 18px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" },
  opcao: { background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "15px 18px", marginBottom: 10, fontSize: 13, color: C.texto, lineHeight: 1.6, cursor: "pointer", fontFamily: OPEN, transition: "all 0.15s" },
  statCard: { background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "18px 20px" },
  textarea: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 10, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN, resize: "vertical", minHeight: 90, lineHeight: 1.6 },
};

// ─── COMPONENTES ─────────────────────────────────────────────────
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img src={LOGO_URL} alt="VB" style={{ height: 36, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.texto, letterSpacing: 2, fontFamily: MONT }}>VOIP DO BRASIL</div>
      <div style={{ fontSize: 9, color: C.amareloEscuro, letterSpacing: 3, textTransform: "uppercase", fontFamily: MONT }}>Treinamento Comercial</div>
    </div>
  </div>
);

const Topbar = ({ vendedor, onHome, onHistorico, onGestor }) => (
  <div style={s.topbar}>
    <div style={{ cursor: "pointer" }} onClick={onHome}><Logo /></div>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {vendedor && <span style={{ fontSize: 12, color: C.claro }}>Olá, <span style={{ color: C.amareloEscuro, fontWeight: 700 }}>{vendedor}</span></span>}
      {vendedor && <button style={s.btnGhost} onClick={onHistorico}>Meus resultados</button>}
      <button style={s.btnGestor} onClick={onGestor}>Painel Gestor</button>
    </div>
  </div>
);

// ─── APP ─────────────────────────────────────────────────────────
export default function App() {
  const [tela, setTela] = useState("login");
  const [vendedor, setVendedor] = useState("");
  const [nomeInput, setNomeInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [nomeGestorInput, setNomeGestorInput] = useState("");
  const [senhaGestorInput, setSenhaGestorInput] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [cenario, setCenario] = useState(null);
  const [modoReal, setModoReal] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [ultimaOpcao, setUltimaOpcao] = useState(null);
  const [detalhes, setDetalhes] = useState([]);
  const [respostasReais, setRespostasReais] = useState([]);
  const [inputReal, setInputReal] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [respostasReais, etapa]);

  const entrar = () => {
    setErroLogin("");
    if (!nomeInput.trim() || !senhaInput.trim()) { setErroLogin("Preencha nome e senha."); return; }
    const usuario = autenticarVendedor(nomeInput.trim(), senhaInput) || autenticarAdmin(nomeInput.trim(), senhaInput);
    if (usuario) { setVendedor(usuario.nome); setTela("home"); }
    else { setErroLogin("Nome ou senha incorretos."); }
  };

  const entrarGestor = () => {
    setErroLogin("");
    if (!nomeGestorInput.trim() || !senhaGestorInput.trim()) { setErroLogin("Preencha nome e senha."); return; }
    const admin = autenticarAdmin(nomeGestorInput.trim(), senhaGestorInput);
    if (admin) { carregarTodos(); setTela("gestor"); }
    else { setErroLogin("Nome ou senha incorretos."); }
  };

  const carregarTodos = async () => {
    setLoading(true);
    setHistorico(await buscar(null));
    setLoading(false);
  };

  const verMeus = async () => {
    setLoading(true);
    setHistorico(await buscar(vendedor));
    setLoading(false);
    setTela("historico");
  };

  const iniciarRapido = (c) => {
    setCenario(c); setModoReal(false); setEtapa(0); setPontos(0);
    setUltimaOpcao(null); setDetalhes([]);
    setTela("simulacao");
  };

  const iniciarReal = (c) => {
    setCenario(c); setModoReal(true); setEtapa(0);
    setRespostasReais([]); setInputReal("");
    setTela("simulacaoReal");
  };

  const escolher = async (op) => {
    const novosPontos = pontos + op.pontos;
    const novoDetalhe = { lead: cenario.roteiro[etapa].lead, resposta: op.texto, pontos: op.pontos, feedback: op.feedback };
    setUltimaOpcao(op);
    setPontos(novosPontos);
    const novosDetalhes = [...detalhes, novoDetalhe];
    setDetalhes(novosDetalhes);
    setTimeout(async () => {
      if (etapa + 1 >= cenario.roteiro.length) {
        const total = cenario.roteiro.length * 10;
        const nota = Math.round((novosPontos / total) * 10);
        await salvar({ vendedor, tipo: "rapido", cenario_id: cenario.id, cenario_titulo: cenario.titulo, tema: cenario.tema, dificuldade: cenario.dificuldade, nota, pontos: novosPontos, total_possivel: total, detalhes: novosDetalhes });
        setTela("resultado");
      } else { setEtapa(etapa + 1); setUltimaOpcao(null); }
    }, 1800);
  };

  const enviarReal = async () => {
    if (!inputReal.trim()) return;
    const novaResposta = { etapa, lead: cenario.mensagensLead[etapa], resposta: inputReal.trim(), timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    const novasRespostas = [...respostasReais, novaResposta];
    setRespostasReais(novasRespostas);
    setInputReal("");
    if (etapa + 1 >= cenario.mensagensLead.length) {
      await salvar({ vendedor, tipo: "real", cenario_id: cenario.id, cenario_titulo: cenario.titulo, tema: cenario.tema, dificuldade: cenario.dificuldade, respostas: novasRespostas, aguardando_avaliacao: true });
      setTela("aguardando");
    } else { setEtapa(etapa + 1); }
  };

  const gerarArquivo = () => {
    const conteudo = [
      `VOIP DO BRASIL — SIMULADO REAL`,
      `Vendedor: ${vendedor}`,
      `Cenário: ${cenario.titulo} — ${cenario.tema}`,
      `Data: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
      `Mensagens: ${respostasReais.length} de ${cenario.mensagensLead.length}`,
      ``,
      `═══════════════════════════════════════`,
      `CONTEXTO DO CENÁRIO`,
      `═══════════════════════════════════════`,
      cenario.contexto,
      ``,
      `═══════════════════════════════════════`,
      `CONVERSA`,
      `═══════════════════════════════════════`,
      ...respostasReais.map((r, i) => [``, `[${i + 1}] LEAD: ${r.lead}`, `    VENDEDOR: ${r.resposta}`]).flat(),
    ].join("\n");
    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VB_Simulado_${vendedor.replace(/ /g, "_")}_${cenario.id}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPossivel = cenario && !modoReal ? cenario.roteiro.length * 10 : 0;
  const notaFinal = totalPossivel > 0 ? Math.round((pontos / totalPossivel) * 10) : 0;

  const Nav = ({ extra } = {}) => (
    <Topbar vendedor={vendedor} onHome={() => setTela(vendedor ? "home" : "login")} onHistorico={verMeus} onGestor={() => setTela("loginGestor")} />
  );

  // ── LOGIN ──
  if (tela === "login") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{FONTS}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 32 }}><Logo /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.texto, margin: "0 0 6px", fontFamily: MONT }}>Boas-vindas!</h2>
        <p style={{ fontSize: 13, color: C.suave, margin: "0 0 28px" }}>Simulador de atendimento comercial · VB</p>
        <div style={{ height: 1, background: C.borda, marginBottom: 24 }} />

        <div style={{ fontSize: 11, color: C.claro, marginBottom: 8, letterSpacing: 1, fontFamily: MONT, fontWeight: 700 }}>ACESSO VENDEDOR</div>
        <input style={{ ...s.input, marginBottom: 10 }} placeholder="Seu nome" value={nomeInput} onChange={e => { setNomeInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrar()} autoFocus />
        <input style={{ ...s.input, marginBottom: 12 }} placeholder="Senha" type="password" value={senhaInput} onChange={e => { setSenhaInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrar()} />
        {erroLogin && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, fontWeight: 600 }}>{erroLogin}</div>}
        <button style={s.btnAmareloFull} onClick={entrar}>Entrar no treinamento →</button>

        <div style={{ height: 1, background: C.borda, margin: "24px 0" }} />
        <div style={{ fontSize: 11, color: C.claro, marginBottom: 8, letterSpacing: 1, fontFamily: MONT, fontWeight: 700 }}>ACESSO GESTOR</div>
        <input style={{ ...s.input, marginBottom: 10 }} placeholder="Nome do gestor" value={nomeGestorInput} onChange={e => { setNomeGestorInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrarGestor()} />
        <input style={{ ...s.input, marginBottom: 12 }} placeholder="Senha do gestor" type="password" value={senhaGestorInput} onChange={e => { setSenhaGestorInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrarGestor()} />
        <button style={{ ...s.btnAmareloFull, background: C.fundo, color: C.amareloEscuro, border: `1.5px solid ${C.amarelo}66` }} onClick={entrarGestor}>Acessar painel gestor</button>
      </div>
    </div>
  );

  // ── HOME ──
  if (tela === "home") return (
    <div style={s.page}>
      <style>{FONTS}</style>
      <Nav />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-block", background: "#FFF8E1", border: `1px solid ${C.amarelo}66`, color: C.amareloEscuro, fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 18, letterSpacing: 2, fontFamily: MONT }}>PLATAFORMA DE TREINAMENTO</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: C.texto, margin: "0 0 12px", lineHeight: 1.2, fontFamily: MONT }}>Desenvolva suas habilidades<br /><span style={{ color: C.amareloEscuro }}>antes de atender de verdade</span></h1>
          <p style={{ fontSize: 13, color: C.suave, lineHeight: 1.8 }}>Dois modos de treinamento: rápido com feedback imediato ou simulado real para avaliação aprofundada.</p>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 40, background: C.fundo, borderRadius: 16, padding: 20 }}>
          <div style={{ flex: 1, background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 6 }}>Treino Rápido</div>
            <div style={{ fontSize: 12, color: C.suave, lineHeight: 1.6 }}>Escolha entre opções de resposta e receba feedback imediato a cada decisão. Ideal para revisar técnicas rapidamente.</div>
          </div>
          <div style={{ flex: 1, background: C.branco, border: `1.5px solid ${C.amarelo}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 6 }}>Simulado Real</div>
            <div style={{ fontSize: 12, color: C.suave, lineHeight: 1.6 }}>Digite suas respostas como faria no atendimento real. 25 mensagens por simulado. Resultado avaliado pelo gestor.</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 16, fontWeight: 700, fontFamily: MONT }}>⚡ TREINO RÁPIDO — 8 CENÁRIOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginBottom: 40 }}>
          {CENARIOS_RAPIDOS.map(c => (
            <div key={c.id} style={s.card}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.amarelo; e.currentTarget.style.boxShadow = `0 4px 20px ${C.amarelo}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borda; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: c.corDif }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: C.amareloEscuro, marginBottom: 8, fontFamily: MONT }}>{c.titulo}</div>
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 12, background: c.bgDif, color: c.corDif, border: `1px solid ${c.bordaDif}`, fontFamily: MONT, letterSpacing: 1 }}>{c.dificuldade.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: C.texto, fontWeight: 700, fontFamily: MONT, marginBottom: 16 }}>{c.tema}</div>
              <button style={{ ...s.btnAmareloFull, padding: "10px 0", fontSize: 12 }} onClick={() => iniciarRapido(c)}>Iniciar →</button>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borda}`, fontSize: 11, color: C.claro }}>{c.roteiro.length} situações · {c.roteiro.length * 10} pts</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 16, fontWeight: 700, fontFamily: MONT }}>📝 SIMULADO REAL — 4 CENÁRIOS AVANÇADOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {CENARIOS_REAIS.map(c => (
            <div key={c.id} style={{ ...s.card, borderColor: C.amarelo + "44" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.amarelo; e.currentTarget.style.boxShadow = `0 4px 20px ${C.amarelo}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.amarelo + "44"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.amarelo }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: C.amareloEscuro, marginBottom: 8, fontFamily: MONT }}>{c.titulo}</div>
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 12, background: "#FFF8E1", color: C.amareloEscuro, border: `1px solid ${C.amarelo}66`, fontFamily: MONT, letterSpacing: 1 }}>{c.dificuldade.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: C.texto, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>{c.tema}</div>
              <div style={{ fontSize: 11, color: C.suave, lineHeight: 1.5, marginBottom: 16 }}>{c.descricao}</div>
              <button style={{ ...s.btnAmareloFull, padding: "10px 0", fontSize: 12 }} onClick={() => iniciarReal(c)}>Iniciar simulado real →</button>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borda}`, fontSize: 11, color: C.claro }}>25 mensagens · Avaliação pelo gestor</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SIMULAÇÃO RÁPIDA ──
  if (tela === "simulacao" && cenario) {
    const rodada = cenario.roteiro[etapa];
    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: C.amareloEscuro, fontWeight: 700, letterSpacing: 2, marginBottom: 4, fontFamily: MONT }}>{cenario.titulo} · {cenario.dificuldade.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.texto, fontFamily: MONT }}>{cenario.tema}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.claro, marginBottom: 2 }}>Situação {etapa + 1} de {cenario.roteiro.length}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.amareloEscuro, fontFamily: MONT }}>{pontos} pts</div>
            </div>
          </div>
          <div style={{ height: 4, background: C.borda, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(etapa / cenario.roteiro.length) * 100}%`, background: C.amarelo, transition: "width 0.5s", borderRadius: 2 }} />
          </div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "20px 22px", marginBottom: 22 }}>
            <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 10, fontFamily: MONT, fontWeight: 700 }}>CLIENTE DIZ:</div>
            <div style={{ fontSize: 15, color: C.texto, lineHeight: 1.6, fontStyle: "italic" }}>"{rodada.lead}"</div>
          </div>
          {ultimaOpcao ? (
            <div style={{ background: ultimaOpcao.pontos >= 8 ? "#EAFAF1" : ultimaOpcao.pontos >= 5 ? "#FFF8E1" : "#FEECEC", border: `1.5px solid ${ultimaOpcao.pontos >= 8 ? "#1a8c4e33" : ultimaOpcao.pontos >= 5 ? "#F5C20033" : "#c0392b33"}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{ultimaOpcao.pontos >= 8 ? "✅" : ultimaOpcao.pontos >= 5 ? "⚠️" : "❌"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: corNota(ultimaOpcao.pontos), fontFamily: MONT }}>+{ultimaOpcao.pontos} pontos</span>
              </div>
              <div style={{ fontSize: 13, color: C.texto, lineHeight: 1.6 }}>{ultimaOpcao.feedback}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 14, fontFamily: MONT, fontWeight: 700 }}>COMO VOCÊ RESPONDERIA?</div>
              {rodada.opcoes.map((op, i) => (
                <div key={i} style={s.opcao}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.amarelo; e.currentTarget.style.background = "#FFFDF0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.borda; e.currentTarget.style.background = C.branco; }}
                  onClick={() => escolher(op)}>
                  <span style={{ color: C.amareloEscuro, fontWeight: 700, marginRight: 10, fontFamily: MONT }}>{String.fromCharCode(65 + i)}.</span>{op.texto}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button style={{ ...s.btnGhost, fontSize: 11 }} onClick={() => setTela("home")}>← Abandonar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIMULADO REAL ──
  if (tela === "simulacaoReal" && cenario) {
    const totalMsgs = cenario.mensagensLead.length;
    const progresso = (etapa / totalMsgs) * 100;
    return (
      <div style={{ ...s.page, background: C.fundo, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <style>{FONTS}</style>
        <Nav />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px", flex: 1, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: C.amareloEscuro, fontWeight: 700, letterSpacing: 2, marginBottom: 4, fontFamily: MONT }}>{cenario.titulo} · SIMULADO REAL</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.texto, fontFamily: MONT }}>{cenario.tema}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.claro, marginBottom: 2 }}>Mensagem {etapa + 1} de {totalMsgs}</div>
              <div style={{ fontSize: 12, color: C.amareloEscuro, fontWeight: 700, fontFamily: MONT }}>{Math.round(progresso)}% concluído</div>
            </div>
          </div>
          <div style={{ height: 4, background: C.borda, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progresso}%`, background: C.amarelo, transition: "width 0.5s", borderRadius: 2 }} />
          </div>

          <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 11, color: C.amareloEscuro, lineHeight: 1.5 }}>
            <strong style={{ fontFamily: MONT }}>Contexto:</strong> {cenario.descricao}
          </div>

          <div ref={chatRef} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: 20, marginBottom: 16, maxHeight: 400, overflowY: "auto" }}>
            {respostasReais.map((r, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ background: C.fundo, borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13, color: C.texto, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 10, color: C.claro, marginBottom: 4, fontFamily: MONT, fontWeight: 700 }}>CLIENTE · {r.timestamp}</div>
                  {r.lead}
                </div>
                <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}33`, borderRadius: 10, padding: "10px 14px", marginLeft: 24, fontSize: 13, color: C.texto, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 10, color: C.amareloEscuro, marginBottom: 4, fontFamily: MONT, fontWeight: 700 }}>VOCÊ · {r.timestamp}</div>
                  {r.resposta}
                </div>
              </div>
            ))}
            {etapa < totalMsgs && (
              <div style={{ background: C.fundo, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.texto, lineHeight: 1.5 }}>
                <div style={{ fontSize: 10, color: C.claro, marginBottom: 4, fontFamily: MONT, fontWeight: 700 }}>CLIENTE</div>
                {cenario.mensagensLead[etapa]}
              </div>
            )}
          </div>

          {etapa < totalMsgs && (
            <div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 8, fontFamily: MONT, fontWeight: 700 }}>SUA RESPOSTA</div>
              <textarea
                style={s.textarea}
                placeholder="Digite sua resposta como faria no WhatsApp..."
                value={inputReal}
                onChange={e => setInputReal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) enviarReal(); }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ fontSize: 11, color: C.claro }}>Ctrl+Enter para enviar</div>
                <button style={s.btnAmarelo} onClick={enviarReal} disabled={!inputReal.trim()}>Enviar →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── AGUARDANDO AVALIAÇÃO ──
  if (tela === "aguardando") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 12 }}>Simulado concluído!</h2>
        <p style={{ fontSize: 15, color: C.suave, lineHeight: 1.7, marginBottom: 28 }}>
          Seu atendimento foi registrado com sucesso.<br />
          <strong style={{ color: C.texto }}>O resultado será analisado e divulgado em breve pelo seu gestor.</strong>
        </p>
        <div style={{ background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: 20, marginBottom: 28, textAlign: "left" }}>
          <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontFamily: MONT, fontWeight: 700 }}>RESUMO DO SIMULADO</div>
          <div style={{ fontSize: 13, color: C.texto, marginBottom: 6 }}><strong>Cenário:</strong> {cenario?.titulo} — {cenario?.tema}</div>
          <div style={{ fontSize: 13, color: C.texto, marginBottom: 6 }}><strong>Vendedor:</strong> {vendedor}</div>
          <div style={{ fontSize: 13, color: C.texto }}><strong>Mensagens respondidas:</strong> {respostasReais.length}</div>
        </div>
        <button style={{ ...s.btnAmarelo, marginBottom: 12, width: "100%" }} onClick={gerarArquivo}>⬇️ Baixar arquivo para o gestor</button>
        <button style={{ ...s.btnAmareloFull, background: C.fundo, color: C.texto, border: `1.5px solid ${C.borda}` }} onClick={() => setTela("home")}>← Voltar ao início</button>
      </div>
    </div>
  );

  // ── RESULTADO RÁPIDO ──
  if (tela === "resultado" && cenario) {
    const cor = corNota(notaFinal);
    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: cor, lineHeight: 1, fontFamily: MONT }}>{notaFinal}</div>
            <div style={{ fontSize: 14, color: C.suave, marginBottom: 6 }}>de 10 — {cenario.titulo}</div>
            <div style={{ fontSize: 14, color: cor, fontWeight: 700, fontFamily: MONT }}>
              {notaFinal >= 8 ? "🏆 Excelente performance!" : notaFinal >= 6 ? "👍 Bom trabalho, pode melhorar!" : "📚 Precisa praticar mais!"}
            </div>
          </div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>ANÁLISE DETALHADA</div>
            {detalhes.map((d, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < detalhes.length - 1 ? `1px solid ${C.borda}` : "none" }}>
                <div style={{ fontSize: 11, color: C.claro, marginBottom: 4, fontFamily: MONT }}>Situação {i + 1}</div>
                <div style={{ fontSize: 12, color: C.suave, marginBottom: 6, fontStyle: "italic" }}>"{d.lead}"</div>
                <div style={{ fontSize: 13, color: C.texto, marginBottom: 6 }}>→ {d.resposta}</div>
                <div style={{ fontSize: 12, color: corNota(d.pontos), fontWeight: 700, fontFamily: MONT }}>+{d.pontos}pts — <span style={{ color: C.suave, fontWeight: 400, fontFamily: OPEN }}>{d.feedback}</span></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={s.btnAmarelo} onClick={() => iniciarRapido(cenario)}>Tentar novamente</button>
            <button style={{ ...s.btnAmarelo, background: C.fundo, color: C.texto, border: `1.5px solid ${C.borda}` }} onClick={() => setTela("home")}>Outros cenários</button>
          </div>
        </div>
      </div>
    );
  }

  // ── HISTÓRICO ──
  if (tela === "historico") {
    const media = historico.length > 0 ? (historico.filter(r => r.nota).reduce((a, b) => a + (b.nota || 0), 0) / historico.filter(r => r.nota).length || 0).toFixed(1) : "—";
    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${corNota(parseFloat(media) || 0)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: corNota(parseFloat(media) || 0), fontFamily: MONT }}>{media}</div>
              <div style={{ fontSize: 9, color: C.claro }}>média</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.texto, fontFamily: MONT }}>{vendedor}</div>
              <div style={{ fontSize: 12, color: C.suave }}>{historico.length} simulações · {historico.filter(r => r.tipo === "real").length} simulados reais</div>
            </div>
          </div>
          {loading && <div style={{ textAlign: "center", color: C.suave, padding: 40 }}>Carregando...</div>}
          {historico.map((r, i) => (
            <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: r.tipo === "real" ? "#FFF8E1" : C.fundo, color: r.tipo === "real" ? C.amareloEscuro : C.suave, border: `1px solid ${r.tipo === "real" ? C.amarelo + "44" : C.borda}`, fontFamily: MONT }}>{r.tipo === "real" ? "SIMULADO REAL" : "TREINO RÁPIDO"}</span>
                </div>
                <div style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>{r.cenario_titulo} — {r.tema}</div>
                <div style={{ fontSize: 11, color: C.claro }}>{r.dificuldade} · {r.data}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {r.nota ? <div style={{ fontSize: 24, fontWeight: 900, color: corNota(r.nota), fontFamily: MONT }}>{r.nota}</div> : <div style={{ fontSize: 11, color: C.amarelo, fontFamily: MONT }}>Aguardando</div>}
              </div>
            </div>
          ))}
          <button style={{ ...s.btnAmareloFull, marginTop: 16 }} onClick={() => setTela("home")}>← Voltar</button>
        </div>
      </div>
    );
  }

  // ── LOGIN GESTOR ──
  if (tela === "loginGestor") return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{FONTS}</style>
      <div style={{ width: "100%", maxWidth: 360, padding: 20 }}>
        <div style={{ marginBottom: 28 }}><Logo /></div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.texto, fontFamily: MONT, marginBottom: 20 }}>Acesso Gestor</div>
        <input style={{ ...s.input, marginBottom: 10 }} placeholder="Nome do gestor" value={nomeGestorInput} onChange={e => { setNomeGestorInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrarGestor()} autoFocus />
        <input style={{ ...s.input, marginBottom: 12 }} placeholder="Senha do gestor" type="password" value={senhaGestorInput} onChange={e => { setSenhaGestorInput(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrarGestor()} />
        {erroLogin && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, fontWeight: 600 }}>{erroLogin}</div>}
        <button style={s.btnAmareloFull} onClick={entrarGestor}>Acessar painel</button>
        <button style={{ ...s.btnAmareloFull, marginTop: 10, background: C.fundo, color: C.suave, border: `1px solid ${C.borda}` }} onClick={() => setTela(vendedor ? "home" : "login")}>← Voltar</button>
      </div>
    </div>
  );

  // ── PAINEL GESTOR ──
  if (tela === "gestor") {
    const todos = historico;
    const rapidos = todos.filter(r => r.tipo !== "real" && r.nota);
    const reais = todos.filter(r => r.tipo === "real");
    const vendedores = [...new Set(todos.map(r => r.vendedor))];
    const stats = vendedores.map(v => {
      const sims = rapidos.filter(r => r.vendedor === v);
      const simReais = reais.filter(r => r.vendedor === v);
      const media = sims.length > 0 ? (sims.reduce((a, b) => a + b.nota, 0) / sims.length).toFixed(1) : "—";
      return { vendedor: v, totalRapido: sims.length, totalReal: simReais.length, media: parseFloat(media) || 0, melhor: sims.length > 0 ? Math.max(...sims.map(s => s.nota)) : 0, aguardando: simReais.filter(r => r.aguardando_avaliacao).length };
    }).sort((a, b) => b.media - a.media);
    const mediaGeral = rapidos.length > 0 ? (rapidos.reduce((a, b) => a + b.nota, 0) / rapidos.length).toFixed(1) : "—";
    const aguardandoTotal = reais.filter(r => r.aguardando_avaliacao).length;

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <Topbar vendedor="Gestor" onHome={() => setTela("login")} onHistorico={() => {}} onGestor={() => {}} />
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.texto, fontFamily: MONT }}>Painel do Gestor</div>
              <div style={{ fontSize: 13, color: C.suave }}>{todos.length} simulações · {vendedores.length} vendedores</div>
            </div>
            {aguardandoTotal > 0 && (
              <div style={{ background: "#FFF8E1", border: `1.5px solid ${C.amarelo}66`, borderRadius: 10, padding: "10px 16px", fontSize: 13, color: C.amareloEscuro, fontFamily: MONT, fontWeight: 700 }}>
                📝 {aguardandoTotal} simulado{aguardandoTotal > 1 ? "s" : ""} real aguardando avaliação
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
            {[
              { label: "MÉDIA GERAL", value: mediaGeral, cor: C.amareloEscuro },
              { label: "TREINOS RÁPIDOS", value: rapidos.length, cor: C.verde },
              { label: "SIMULADOS REAIS", value: reais.length, cor: C.texto },
              { label: "AGUARDANDO", value: aguardandoTotal, cor: aguardandoTotal > 0 ? C.vermelho : C.claro },
            ].map((s2, i) => (
              <div key={i} style={s.statCard}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s2.cor, fontFamily: MONT }}>{s2.value}</div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>{s2.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 14, fontWeight: 700, fontFamily: MONT }}>RANKING DA EQUIPE</div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
            {loading && <div style={{ padding: 24, color: C.suave, textAlign: "center" }}>Carregando...</div>}
            {!loading && stats.length === 0 && <div style={{ padding: 24, color: C.suave, textAlign: "center" }}>Nenhum resultado ainda.</div>}
            {stats.map((v, i) => (
              <div key={v.vendedor} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: i < stats.length - 1 ? `1px solid ${C.borda}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? C.amarelo : C.fundo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i === 0 ? C.preto : C.suave, marginRight: 16, flexShrink: 0, fontFamily: MONT }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.texto, fontFamily: MONT }}>{v.vendedor}</div>
                  <div style={{ fontSize: 11, color: C.claro }}>{v.totalRapido} treinos · {v.totalReal} simulados reais · melhor: {v.melhor || "—"} {v.aguardando > 0 && `· ${v.aguardando} aguardando`}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: corNota(v.media), fontFamily: MONT }}>{v.media || "—"}</div>
                  <div style={{ fontSize: 10, color: C.claro }}>média</div>
                </div>
              </div>
            ))}
          </div>

          {reais.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 14, fontWeight: 700, fontFamily: MONT }}>SIMULADOS REAIS — PARA ANÁLISE</div>
              <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
                {reais.map((r, i) => (
                  <div key={i} style={{ padding: "16px 20px", borderBottom: i < reais.length - 1 ? `1px solid ${C.borda}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>{r.vendedor}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: r.aguardando_avaliacao ? "#FFF8E1" : "#EAFAF1", color: r.aguardando_avaliacao ? C.amareloEscuro : C.verde, border: `1px solid ${r.aguardando_avaliacao ? C.amarelo + "44" : "#1a8c4e33"}`, fontFamily: MONT }}>
                            {r.aguardando_avaliacao ? "Aguardando avaliação" : "Avaliado"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: C.suave }}>{r.cenario_titulo} — {r.tema}</div>
                        <div style={{ fontSize: 11, color: C.claro, marginTop: 2 }}>{r.data} · {r.respostas?.length || 0} mensagens respondidas</div>
                      </div>
                      <button
                        style={{ background: C.amarelo, border: "none", borderRadius: 8, padding: "8px 16px", color: C.preto, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: MONT, flexShrink: 0 }}
                        onClick={() => {
                          const linhas = [
                            `VOIP DO BRASIL — SIMULADO REAL`,
                            `════════════════════════════════════`,
                            `Vendedor: ${r.vendedor}`,
                            `Cenário: ${r.cenario_titulo} — ${r.tema}`,
                            `Dificuldade: ${r.dificuldade}`,
                            `Data: ${r.data}`,
                            `Mensagens: ${r.respostas?.length || 0} de 25`,
                            `Status: ${r.aguardando_avaliacao ? "Aguardando avaliação" : "Avaliado"}`,
                            ``,
                            `════════════════════════════════════`,
                            `CONVERSA COMPLETA`,
                            `════════════════════════════════════`,
                            ...(r.respostas || []).map((resp, idx) => [
                              ``,
                              `[${idx + 1}] CLIENTE:`,
                              `    ${resp.lead}`,
                              ``,
                              `    VENDEDOR:`,
                              `    ${resp.resposta}`,
                            ]).flat(),
                          ];
                          const blob = new Blob([linhas.join("\n")], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `VB_Simulado_${r.vendedor?.replace(/ /g, "_")}_${r.cenario_id}_${r.data?.replace(/\//g, "-")}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        ⬇ Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 14, fontWeight: 700, fontFamily: MONT }}>ÚLTIMAS ATIVIDADES</div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden" }}>
            {todos.slice(0, 15).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${C.borda}` }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>{r.vendedor}</span>
                  <span style={{ color: C.suave, fontSize: 12 }}> · {r.cenario_titulo}</span>
                  <span style={{ fontSize: 10, color: r.tipo === "real" ? C.amareloEscuro : C.claro, marginLeft: 6 }}>{r.tipo === "real" ? "● REAL" : "● RÁPIDO"}</span>
                </div>
                <div style={{ fontSize: 11, color: C.claro, marginRight: 16 }}>{r.data}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.nota ? corNota(r.nota) : C.amarelo, fontFamily: MONT }}>{r.nota || "—"}</div>
              </div>
            ))}
          </div>

          <button style={{ ...s.btnAmarelo, marginTop: 24 }} onClick={() => setTela("login")}>← Sair do painel</button>
        </div>
      </div>
    );
  }

  return null;
}
