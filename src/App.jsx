import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────
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


// ─── USUÁRIOS ─────────────────────────────────────────────────────
const USUARIOS_INICIAIS = [
  { nome: "John",    senha: "VB2026#@",   role: "admin" },
  { nome: "David",   senha: "VB2026#@",   role: "admin" },
  { nome: "Patrick", senha: "VB2026#@",   role: "admin" },
  { nome: "Analu",   senha: "VB2026#@!%", role: "vendedor" },
  { nome: "Thais",   senha: "VB2026#@$&", role: "vendedor" },
  { nome: "Tamires", senha: "VB2026#@*^", role: "vendedor" },
  { nome: "Carlos",  senha: "VB2026#@=+", role: "vendedor" },
  { nome: "Edson",   senha: "VB2026#@?>", role: "vendedor" },
  { nome: "Izabel",  senha: "VB2026#@~<", role: "vendedor" },
];

const getUsuarios = () => {
  try { return JSON.parse(localStorage.getItem("vb_usuarios") || "null") || USUARIOS_INICIAIS; }
  catch { return USUARIOS_INICIAIS; }
};
const saveUsuarios = (lista) => localStorage.setItem("vb_usuarios", JSON.stringify(lista));
const autenticar = (nome, senha) => getUsuarios().find(u => u.nome.toLowerCase() === nome.trim().toLowerCase() && u.senha === senha) || null;
const LOGO_URL = "https://voipdobrasil.com.br/wp-content/uploads/2024/05/act_Voip_Logo_Vertical_Amarelo_RGB1.png";
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;600&display=swap');";
const MONT = "'Montserrat', sans-serif";
const OPEN = "'Open Sans', sans-serif";

const C = {
  amarelo: "#F5C200", amareloEscuro: "#E6A800",
  preto: "#0a0a0a", branco: "#ffffff", fundo: "#f7f7f7",
  borda: "#e8e8e8", texto: "#1a1a1a", suave: "#666", claro: "#aaa",
  verde: "#1a8c4e", vermelho: "#c0392b", laranja: "#e65c00",
  azul: "#1a5fa8",
};

const corNota = (n) => n >= 8 ? C.verde : n >= 6 ? C.amareloEscuro : C.vermelho;
const emojiNota = (n) => n >= 8 ? "🏆" : n >= 6 ? "👍" : "📚";

// ─── BASE DE CONHECIMENTO VB ──────────────────────────────────────
const VB_KNOWLEDGE = `
VOIP DO BRASIL — BASE DE CONHECIMENTO COMERCIAL

EMPRESA:
- Operadora VoIP 100% nacional, fundada há mais de 10 anos
- Única operadora com certificação ISO 9001 em qualidade de atendimento
- Suporte humano 24h/7 dias (diferencial máximo — nenhum concorrente tem isso)
- 14 dias de teste grátis, sem cartão de crédito, sem compromisso
- Gerente de conta dedicado para empresas
- Equipe de onboarding para migração sem dor de cabeça
- Cobertura nacional com portabilidade para todo o Brasil
- 99,99% de uptime garantido
- Integração com os principais CRMs do mercado

PRODUTOS E PLANOS:
Planos Pessoais (número virtual):
- Básico: R$44,99/mês — 300 minutos para fixo e celular
- Plus: R$64,99/mês — 600 minutos para fixo e celular  
- Fale à Vontade: R$94,99/mês — ligações ilimitadas para fixo e celular

PABX Virtual (empresas):
- R$35/ramal/mês + plano de minutos
- Pacotes: 150, 350, 500, 1000, 1500 minutos/mês
- Plano ilimitado disponível para alto volume
- Recursos inclusos: gravação de chamadas, URA, filas, relatórios, app mobile, ramal virtual, conferência, transferência, histórico completo

DIFERENCIAIS COMPETITIVOS vs concorrentes:
- vs GoTo: mais barato, suporte 24h (GoTo não tem), sem travar
- vs Vivo/TIM/Claro: muito mais barato, recursos muito superiores, suporte humano vs robô
- vs Twilio: mais simples de usar, suporte em português, sem complexidade técnica
- vs 3CX: não precisa servidor próprio, sem manutenção, suporte incluído

PROCESSOS:
- Ativação do número: até 3 horas após contratação
- Portabilidade de fixo: 15 dias úteis em média
- Portabilidade de celular: 3 dias úteis
- Migração com equipe dedicada: sem interrupção do serviço
- Contratos: mensal (sem fidelidade) ou anual (desconto)

METODOLOGIA DE VENDAS USADA NA VB:
- Sempre qualificar ANTES de apresentar preço
- SPIN Selling: Situação → Problema → Implicação → Necessidade
- Leads grandes (25+ usuários, 3+ filiais): passar para especialista Thais
- 14 dias grátis é o principal gatilho de fechamento — sempre usar
- Nunca depreciar o que o cliente usa — comparar sem diminuir
- Suporte 24h com ISO 9001 é o argumento final para objeção de qualidade
`;

// ─── BANCO DE QUESTÕES TÉCNICAS ───────────────────────────────────
const QUIZ_QUESTIONS = [
  // SIP
  { id: 1, topico: "SIP", dificuldade: "basica", enunciado: "O que significa a sigla SIP e qual é sua função principal em telefonia VoIP?", opcoes: [
    { texto: "Session Initiation Protocol — protocolo que inicia, mantém e encerra sessões de comunicação (voz, vídeo) pela internet", correta: true, explicacao: "Correto! SIP é o protocolo padrão para sinalização em VoIP. Ele 'conversa' com o outro lado para estabelecer e encerrar a chamada, mas não carrega o áudio em si." },
    { texto: "Signal Internet Protocol — protocolo que garante qualidade de sinal na rede", correta: false, explicacao: "Errado. SIP é Session Initiation Protocol, não Signal. Qualidade de sinal é tratada por QoS." },
    { texto: "Secure IP Protocol — protocolo de segurança para chamadas criptografadas", correta: false, explicacao: "Errado. Segurança em VoIP é feita por SRTP e TLS. SIP cuida da sinalização das chamadas." },
  ]},
  { id: 2, topico: "SIP", dificuldade: "basica", enunciado: "Quando um cliente técnico pergunta se a VB usa 'protocolo proprietário', o que você responde?", opcoes: [
    { texto: "Usamos SIP padrão aberto, compatível com qualquer equipamento do mercado — Yealink, Grandstream, Polycom, Asterisk e outros", correta: true, explicacao: "Perfeito! SIP aberto significa que o cliente não fica preso ao equipamento da VB. Isso elimina a objeção de 'lock-in'." },
    { texto: "Temos protocolo próprio mais avançado que o SIP, desenvolvido pela nossa equipe", correta: false, explicacao: "Nunca invente isso! A VB usa SIP padrão. Protocolo proprietário seria uma desvantagem, não um diferencial." },
    { texto: "Não sei dizer, precisaria consultar o técnico", correta: false, explicacao: "Todo vendedor da VB precisa saber isso: usamos SIP, protocolo aberto e padrão de mercado." },
  ]},
  // TRONCO SIP
  { id: 3, topico: "Tronco SIP", dificuldade: "basica", enunciado: "Como explicar 'Tronco SIP' para um cliente empresarial sem conhecimento técnico?", opcoes: [
    { texto: "É a conexão entre o PABX da empresa e a operadora de telefonia pela internet — substitui as linhas físicas tradicionais com muito mais flexibilidade e custo menor", correta: true, explicacao: "Ótima analogia! Tronco SIP = linhas telefônicas, só que pela internet. Mais barato, mais flexível, sem fio físico." },
    { texto: "É um cabo de rede especial que conecta os telefones IP ao servidor", correta: false, explicacao: "Errado. Tronco SIP é uma conexão lógica (protocolo), não física. Não existe 'cabo SIP'." },
    { texto: "É o número de ramais disponíveis no PABX Virtual", correta: false, explicacao: "Errado. Ramais são extensões internas. Tronco SIP é a saída para o mundo externo (fazer e receber ligações)." },
  ]},
  { id: 4, topico: "Tronco SIP", dificuldade: "intermediaria", enunciado: "Um cliente tem PABX Asterisk próprio e quer contratar só o Tronco SIP da VB. O que você faz?", opcoes: [
    { texto: "Qualificar quantos canais simultâneos ele precisa, verificar se o Asterisk está atualizado e oferecer o Tronco SIP com DID — a VB fornece credenciais SIP para configurar no Asterisk dele", correta: true, explicacao: "Exato! Tronco SIP é perfeitamente compatível com Asterisk. A VB fornece as credenciais e o cliente configura no sistema dele." },
    { texto: "Explicar que a VB só vende PABX Virtual completo, não oferece apenas Tronco SIP", correta: false, explicacao: "Errado! A VB oferece Tronco SIP para quem já tem PABX próprio. Não perder esse cliente!" },
    { texto: "Recomendar que ele abandone o Asterisk e migre para o PABX Virtual da VB", correta: false, explicacao: "Nunca force uma migração desnecessária. Se ele quer só o Tronco, ofereça o Tronco. Ganha a confiança e abre porta para mais serviços depois." },
  ]},
  // PABX VIRTUAL
  { id: 5, topico: "PABX Virtual", dificuldade: "basica", enunciado: "Qual a principal diferença entre um PABX físico tradicional e o PABX Virtual da VB?", opcoes: [
    { texto: "O PABX físico exige hardware caro instalado na empresa, manutenção técnica e limita a quantidade de ramais. O PABX Virtual funciona na nuvem — sem hardware, sem manutenção, ramais pelo app ou telefone IP, gerenciado pelo portal web", correta: true, explicacao: "Perfeito! A ausência de hardware é o argumento mais forte: zero investimento inicial, zero manutenção, acesso de qualquer lugar." },
    { texto: "São iguais tecnicamente, a diferença é só o preço", correta: false, explicacao: "Muito errado! São completamente diferentes em arquitetura. O PABX Virtual tem vantagens enormes que você precisa saber argumentar." },
    { texto: "O PABX Virtual só funciona para empresas pequenas, o físico é melhor para empresas grandes", correta: false, explicacao: "Errado. O PABX Virtual da VB atende desde 1 ramal até centenas. Grandes empresas como call centers usam soluções em nuvem." },
  ]},
  { id: 6, topico: "PABX Virtual", dificuldade: "basica", enunciado: "Um cliente pergunta: 'E se cair a internet, fico sem telefone?' Como você responde?", opcoes: [
    { texto: "Ótima pergunta! A VB tem failover automático — se a internet principal cair, a chamada pode ser redirecionada para um celular cadastrado. Além disso, a maioria das empresas hoje tem link de backup. E na prática, com fibra óptica, a estabilidade é de 99,99%", correta: true, explicacao: "Resposta completa: reconheceu a preocupação, explicou a solução técnica (failover) e deu contexto (99,99% uptime). Não minimizou a preocupação." },
    { texto: "Isso não acontece porque a internet é muito estável hoje em dia", correta: false, explicacao: "Nunca minimize uma preocupação legítima do cliente. Internet pode cair sim — o correto é explicar como a VB lida com isso." },
    { texto: "Recomendo manter uma linha analógica de backup então", correta: false, explicacao: "Nunca recomende o concorrente como backup. Fale do failover para celular e da estabilidade da VB." },
  ]},
  // PORTABILIDADE
  { id: 7, topico: "Portabilidade", dificuldade: "basica", enunciado: "Um cliente quer portar o número fixo da empresa para a VB. Qual o prazo médio e o que é necessário?", opcoes: [
    { texto: "15 dias úteis em média para fixo. Precisa: fatura recente da operadora atual, documento do titular e confirmação de titularidade. A VB cuida de todo o processo com a operadora cedente", correta: true, explicacao: "Correto! 15 dias úteis para fixo, 3 dias para celular. E reforçar que a VB gerencia o processo — o cliente não precisa lidar com a operadora atual." },
    { texto: "A portabilidade é instantânea, em até 24 horas", correta: false, explicacao: "Errado. Portabilidade de fixo leva 15 dias úteis por regulação da Anatel. Promessa falsa gera cancelamento." },
    { texto: "Portabilidade só é possível para números de celular, fixo não pode ser portado para VoIP", correta: false, explicacao: "Errado! A VB porta números fixos sim. É um diferencial importante — muitas empresas querem manter o número histórico." },
  ]},
  { id: 8, topico: "Portabilidade", dificuldade: "intermediaria", enunciado: "Durante a portabilidade, o cliente fica sem telefone? Como explicar isso?", opcoes: [
    { texto: "Não! A VB ativa um número provisório imediatamente — o cliente já começa a usar VoIP enquanto a portabilidade está em andamento. Quando o número original chegar, é só ativar", correta: true, explicacao: "Esse é um diferencial importante de processo. O cliente nunca fica sem telefone. Isso elimina a objeção de 'não posso ficar sem o serviço'." },
    { texto: "Infelizmente sim, fica em média 2-3 dias sem telefone durante a transição", correta: false, explicacao: "Errado! A VB garante continuidade com número provisório. Nunca aceite que o cliente fique sem serviço." },
    { texto: "Depende da operadora atual, às vezes tem interrupção", correta: false, explicacao: "Resposta vaga que gera insegurança. A VB tem processo estruturado para garantir continuidade — use isso como argumento." },
  ]},
  // DDR
  { id: 9, topico: "DDR", dificuldade: "basica", enunciado: "O que é DDR e quando recomendar para um cliente?", opcoes: [
    { texto: "DDR (Discagem Direta a Ramal) permite que cada ramal tenha seu próprio número externo. Ideal para empresas onde clientes precisam ligar diretamente para um colaborador específico sem passar pela recepcionista ou URA", correta: true, explicacao: "Perfeito! DDR é o número direto para o ramal. Muito valorizado em escritórios de advocacia, contabilidade, médicos — onde o cliente quer falar direto com 'seu' profissional." },
    { texto: "DDR é o sistema de discagem automática para fazer muitas ligações ao mesmo tempo — ideal para telemarketing", correta: false, explicacao: "Errado. Isso seria um discador automático. DDR é Discagem Direta a Ramal — número externo que cai direto no ramal interno." },
    { texto: "DDR é um tipo de plano de minutos com desconto para discagens de longa distância", correta: false, explicacao: "Errado. DDR não tem relação com planos de minutos. É uma funcionalidade de roteamento de chamadas." },
  ]},
  // URA
  { id: 10, topico: "URA", dificuldade: "basica", enunciado: "Como explicar URA para um cliente e quando recomendar?", opcoes: [
    { texto: "URA (Unidade de Resposta Audível) é o menu automático que atende a ligação — 'Para vendas, tecle 1; Para suporte, tecle 2'. Recomendo para empresas com mais de 3 atendentes ou que recebem muitas ligações e precisam direcionar para o setor certo", correta: true, explicacao: "Correto! URA profissionaliza o atendimento e reduz transferências erradas. Para empresas pequenas com 1-2 pessoas, pode ser desnecessário e até irritar o cliente." },
    { texto: "URA é obrigatória para qualquer empresa que contratar PABX Virtual", correta: false, explicacao: "Errado. URA é opcional. Para empresas muito pequenas pode ser inadequada — personalizar a recomendação." },
    { texto: "URA é o mesmo que secretária eletrônica — grava mensagem quando não atende", correta: false, explicacao: "Diferentes funções. Secretária eletrônica grava mensagem quando não atende. URA distribui chamadas em tempo real entre ramais/setores." },
  ]},
  // QoS
  { id: 11, topico: "QoS", dificuldade: "basica", enunciado: "Um cliente reclama de eco e travamento nas ligações VoIP. Como você explica o que pode estar causando e o que fazer?", opcoes: [
    { texto: "Eco e travamento geralmente indicam problema de QoS na rede — o VoIP está competindo com outros dados pela banda. A solução é configurar prioridade para tráfego de voz no roteador (QoS). Peço que o TI deles configure ou indico um técnico parceiro", correta: true, explicacao: "Correto! QoS (Quality of Service) prioriza pacotes de voz. Sem isso, um download ou videoconferência simultânea degrada a qualidade da chamada." },
    { texto: "Eco e travamento são problemas do aparelho de telefone — precisa trocar por um modelo melhor", correta: false, explicacao: "Pode ser, mas raramente. O mais comum é falta de QoS na rede. Sempre investigar a rede antes de culpar o equipamento." },
    { texto: "Isso é problema da operadora de internet deles, não é responsabilidade da VB", correta: false, explicacao: "Nunca culpe terceiros sem investigar. Mesmo que seja da internet, você pode ajudar a resolver — isso fideliza o cliente." },
  ]},
  { id: 12, topico: "QoS", dificuldade: "intermediaria", enunciado: "Um gestor de TI pergunta: 'Vocês suportam VLAN separada para voz?' O que você responde?", opcoes: [
    { texto: "Sim! VLAN de voz é a configuração recomendada para ambientes corporativos — garante prioridade máxima para as ligações. A VB é compatível com essa configuração e nosso suporte técnico pode orientar a implementação", correta: true, explicacao: "Perfeito! VLAN separada para voz é boa prática de TI. Confirmar compatibilidade e oferecer suporte técnico demonstra preparo e ganha a confiança do gestor técnico." },
    { texto: "VLAN é muito complexo, recomendo simplificar a rede e não usar isso", correta: false, explicacao: "Nunca diminua o conhecimento técnico do cliente. VLAN de voz é prática recomendada — demonstre que você entende e apoia." },
    { texto: "Não sei dizer, mas posso passar para o técnico responder", correta: false, explicacao: "Aceitável mas fraco. Todo vendedor VB deve saber responder 'sim, compatível com VLAN de voz' — é básico para clientes corporativos." },
  ]},
  // CODECS
  { id: 13, topico: "Codecs", dificuldade: "basica", enunciado: "Qual a diferença prática entre G.711 e G.729 que um vendedor precisa saber explicar?", opcoes: [
    { texto: "G.711 tem qualidade de voz superior (HD) mas usa mais internet. G.729 comprime mais, gasta menos banda mas pode perder um pouco de qualidade. Para empresas com boa internet, G.711 é melhor. Para conexões limitadas, G.729 resolve bem", correta: true, explicacao: "Correto! A analogia simples: G.711 = arquivo WAV (qualidade máxima), G.729 = MP3 comprimido. Importante saber isso para qualificar a conexão do cliente." },
    { texto: "G.711 e G.729 são versões diferentes do mesmo protocolo — a versão mais nova (G.729) é sempre melhor", correta: false, explicacao: "Errado. Não é questão de versão mais nova ser melhor. São codecs com tradeoffs diferentes: qualidade vs consumo de banda." },
    { texto: "Codecs são configurados automaticamente pela VB — o vendedor não precisa saber disso", correta: false, explicacao: "O vendedor precisa entender o básico para qualificar a internet do cliente e recomendar a configuração correta, especialmente para clientes técnicos." },
  ]},
  // TELEFONES IP
  { id: 14, topico: "Telefones IP", dificuldade: "basica", enunciado: "Por que recomendar telefones IP Gigabit em vez de modelos 10/100 para uma empresa?", opcoes: [
    { texto: "Telefones IP Gigabit têm porta de rede que passa 1Gbps — o computador pode se conectar através do telefone sem perder velocidade. Com modelos 10/100, a rede do computador fica limitada a 100Mbps, criando gargalo em redes corporativas modernas", correta: true, explicacao: "Exato! O telefone IP funciona como um switch de 2 portas. Se a empresa tem rede Gigabit, precisa de telefone Gigabit para não perder performance no computador conectado atrás." },
    { texto: "Telefones Gigabit têm melhor qualidade de áudio — o som fica mais nítido", correta: false, explicacao: "A qualidade de áudio não depende da velocidade da porta de rede — depende do codec. Gigabit é sobre velocidade de rede, não qualidade de voz." },
    { texto: "Não faz diferença — todos os telefones IP modernos são Gigabit automaticamente", correta: false, explicacao: "Errado. Ainda existem muitos modelos 10/100 no mercado, inclusive baratos. Sempre verificar a especificação na hora de indicar o equipamento." },
  ]},
  // VOIP GERAL
  { id: 15, topico: "VoIP Geral", dificuldade: "basica", enunciado: "Um cliente nunca ouviu falar de VoIP. Como você explica em 2 frases?", opcoes: [
    { texto: "VoIP é fazer e receber ligações pela internet em vez de pela linha telefônica tradicional. É exatamente o que o WhatsApp faz para chamadas, só que em um número de telefone profissional com todos os recursos de uma central telefônica corporativa", correta: true, explicacao: "Analogia com WhatsApp é a melhor para leigos — todo mundo entende como o WhatsApp funciona. Conecta o conceito ao mundo já conhecido do cliente." },
    { texto: "VoIP é uma tecnologia de compressão de dados que transmite pacotes de voz via protocolo IP através de redes WAN e LAN com codificação G.711 ou G.729", correta: false, explicacao: "Definição técnica correta, mas completamente inadequada para um leigo. Vai travar a conversa. Sempre adapte o vocabulário ao cliente." },
    { texto: "VoIP é um plano de telefonia mais barato que as operadoras tradicionais oferecem pela internet", correta: false, explicacao: "Incompleto e pode confundir. VoIP não é só um plano mais barato — é uma tecnologia que possibilita muito mais recursos além do preço menor." },
  ]},
  { id: 16, topico: "VoIP Geral", dificuldade: "intermediaria", enunciado: "Qual a largura de banda mínima recomendada por canal de voz VoIP simultâneo?", opcoes: [
    { texto: "Aproximadamente 100 kbps por canal simultâneo é uma referência segura. Uma empresa com 10 ligações simultâneas precisa de pelo menos 1 Mbps dedicado para voz — além da banda para os outros dados", correta: true, explicacao: "Correto! 100 kbps por canal é referência padrão (considerando G.711 e overhead de rede). Importante para qualificar se a internet do cliente suporta a operação." },
    { texto: "VoIP consome muito pouco, qualquer internet de 10 Mbps aguenta centenas de ligações simultâneas", correta: false, explicacao: "Subestimado. Cada canal consome ~100 kbps. 10 Mbps aguentaria ~100 canais teóricos, mas com outros dados competindo, a margem é menor. Sempre qualificar." },
    { texto: "Não existe padrão — depende exclusivamente da qualidade da operadora", correta: false, explicacao: "Existe sim referência técnica. Conhecer isso é fundamental para qualificar clientes e evitar problema de qualidade pós-venda." },
  ]},
  // VENDAS VB
  { id: 17, topico: "Vendas VB", dificuldade: "basica", enunciado: "Um cliente diz: 'Preciso pensar, você me manda uma proposta por e-mail.' Qual a melhor resposta?", opcoes: [
    { texto: "Claro! Mas antes de montar a proposta, posso fazer 2 perguntas rápidas para personalizar os valores? Quantos ramais você precisa e qual seu prazo ideal para implantar?", correta: true, explicacao: "Perfeito! Nunca mande proposta genérica. Qualifique antes — assim a proposta chega personalizada e você tem um motivo para ligar de volta com urgência real." },
    { texto: "Perfeito, vou montar uma proposta completa com todos os nossos planos e te envio ainda hoje!", correta: false, explicacao: "Proposta com 'todos os planos' confunde e não gera urgência. Sempre personalize — menos opções, mais assertividade." },
    { texto: "Tudo bem, mas saiba que nossos preços sobem no mês que vem, então quanto antes você decidir melhor.", correta: false, explicacao: "Urgência falsa é uma das piores técnicas. Destrói credibilidade se o cliente descobrir que não é verdade. Nunca faça isso." },
  ]},
  { id: 18, topico: "Vendas VB", dificuldade: "basica", enunciado: "Qual é o principal gatilho de fechamento que a VB recomenda usar em toda negociação?", opcoes: [
    { texto: "Os 14 dias de teste grátis, sem cartão de crédito e sem compromisso — o cliente experimenta o serviço sem risco nenhum, o que elimina a principal barreira de decisão", correta: true, explicacao: "Exato! O trial gratuito é o argumento mais poderoso da VB. Remove o risco do cliente, acelera a decisão e permite que o próprio serviço se venda durante o teste." },
    { texto: "O desconto progressivo — quanto mais ramais, menor o preço por ramal", correta: false, explicacao: "Desconto é um argumento válido mas não é o principal gatilho. Usar desconto como primeiro argumento desvaloriza o produto." },
    { texto: "O suporte 24h — diferencial que os concorrentes não têm", correta: false, explicacao: "Suporte 24h é um diferencial excelente, mas para objeção de qualidade/confiança. O gatilho de fechamento principal é o teste grátis de 14 dias." },
  ]},
  { id: 19, topico: "Vendas VB", dificuldade: "intermediaria", enunciado: "Um cliente satisfeito com a Vivo Empresas diz: 'Já tenho telefonia, não preciso trocar.' Como você aborda?", opcoes: [
    { texto: "Entendo! A maioria dos nossos clientes também achava isso antes de testar. Posso te perguntar: você usa gravação de chamadas, relatórios de ligações e app mobile hoje? Se não, você está pagando mais por menos recurso.", correta: true, explicacao: "Perfeito! Não ataque a Vivo diretamente. Faça perguntas que revelam o que ele NÃO tem. Deixe ele perceber a lacuna sozinho — muito mais eficaz que comparar preços." },
    { texto: "A Vivo é muito cara e o suporte deles é péssimo — com a VB você paga menos e tem muito mais qualidade.", correta: false, explicacao: "Falar mal de concorrente é a pior abordagem. Gera defensividade e passa imagem de desespero. Nunca deprecie o que o cliente usa." },
    { texto: "Tudo bem, quando precisar trocar pode me chamar!", correta: false, explicacao: "Desistir sem explorar é perder a venda. Sempre investigue — ele pode estar insatisfeito com algo sem perceber que existe alternativa melhor." },
  ]},
  { id: 20, topico: "Vendas VB", dificuldade: "intermediaria", enunciado: "Quando você deve passar um lead para a especialista Thais?", opcoes: [
    { texto: "Quando a empresa tem 25 ou mais usuários, ou 3 ou mais filiais — são leads grandes que exigem uma proposta técnica mais elaborada e negociação especializada", correta: true, explicacao: "Correto! Leads grandes têm complexidade diferente: múltiplos tomadores de decisão, integração com sistemas existentes, volume de minutos alto. A Thais tem o preparo para esse perfil." },
    { texto: "Quando o cliente faz muitas perguntas técnicas que você não sabe responder", correta: false, explicacao: "Não é critério de tamanho nem de dificuldade técnica — é critério de porte. Questões técnicas você deve aprender a responder. Transferir por isso demonstra despreparo." },
    { texto: "Quando o cliente pede desconto acima de 20%", correta: false, explicacao: "Desconto não é o critério. O critério é porte: 25+ usuários ou 3+ filiais. Desconto é uma negociação que qualquer vendedor deve conduzir com seu gestor." },
  ]},
  // SPIN SELLING
  { id: 21, topico: "SPIN Selling", dificuldade: "basica", enunciado: "O que significa cada letra do SPIN Selling e como aplicar na venda VoIP?", opcoes: [
    { texto: "Situação (como é hoje), Problema (o que incomoda), Implicação (o que esse problema causa no negócio), Necessidade (o que ele ganha resolvendo). Ex: S='Quantos ramais você tem?' P='A ligação cai muito?' I='Isso faz perder cliente?' N='Imagina ter estabilidade 99,99%...'", correta: true, explicacao: "Excelente! SPIN é a espinha dorsal da venda consultiva. A pergunta de Implicação é a mais poderosa — faz o cliente sentir o custo do problema atual antes de ouvir a solução." },
    { texto: "Sistema, Produto, Instalação, Negociação — as 4 etapas do processo de venda da VB", correta: false, explicacao: "Errado. SPIN é uma metodologia de perguntas criada por Neil Rackham, não etapas de processo. Situação, Problema, Implicação, Necessidade." },
    { texto: "É uma técnica de fechamento onde você apresenta o produto por partes para não assustar o cliente com o preço", correta: false, explicacao: "Errado. SPIN é sobre fazer as perguntas certas para o cliente descobrir sozinho que precisa da solução — não é técnica de apresentação." },
  ]},
  { id: 22, topico: "SPIN Selling", dificuldade: "intermediaria", enunciado: "Qual é a pergunta de IMPLICAÇÃO mais eficaz para uma clínica médica com problemas de ligação caindo?", opcoes: [
    { texto: "'Quando uma ligação cai no momento em que o paciente tenta agendar uma consulta, o que acontece? Ele tenta de novo ou vai buscar outra clínica?' — faz o cliente calcular o custo real da perda.", correta: true, explicacao: "Perfeita pergunta de implicação! Ela faz o cliente visualizar o paciente indo para o concorrente. O custo emocional e financeiro fica concreto — muito mais poderoso que falar em porcentagem de uptime." },
    { texto: "'Você sabia que 30% das ligações VoIP mal configuradas caem antes de 1 minuto?' — dado técnico que justifica a troca", correta: false, explicacao: "Dado genérico sem contexto não é implicação. Implicação é personalizada, conecta o problema do CLIENTE ao impacto no NEGÓCIO dele especificamente." },
    { texto: "'Você não acha que isso é um problema sério que precisa ser resolvido urgente?'", correta: false, explicacao: "Pergunta fechada que parece pressão. O cliente vai concordar por educação mas não vai sentir o problema. Implicação boa é aberta e faz o cliente raciocinar." },
  ]},
  // OBJEÇÕES
  { id: 23, topico: "Objeções", dificuldade: "basica", enunciado: "Cliente diz: 'Tá caro. A concorrente cobra metade do preço.' Como você responde?", opcoes: [
    { texto: "Entendo a comparação. Me fala: essa outra operadora tem suporte humano 24h? Tem ISO 9001? Qual o tempo de ativação? Às vezes o que parece mais barato acaba custando mais caro em problema, tempo parado e suporte que não aparece.", correta: true, explicacao: "Correto! Nunca brigue no preço. Mude o critério de comparação — faça o cliente comparar valor total, não só mensalidade. Suporte 24h e ISO são argumentos concretos que a maioria dos concorrentes não tem." },
    { texto: "Posso verificar se consigo um desconto especial para você — qual o preço que a concorrente cobrou exatamente?", correta: false, explicacao: "Ir direto para desconto antes de defender o valor é a pior resposta. Você perdeu margem sem nem tentar mostrar os diferenciais." },
    { texto: "Nosso preço é esse porque temos a melhor qualidade do mercado — você paga pelo que leva.", correta: false, explicacao: "Vago e arrogante. 'Melhor qualidade' sem prova não convence ninguém. Use argumentos concretos: suporte 24h, ISO 9001, 99,99% uptime, onboarding dedicado." },
  ]},
  { id: 24, topico: "Objeções", dificuldade: "intermediaria", enunciado: "Cliente diz: 'Preciso de autorização do meu sócio antes de decidir qualquer coisa.' O que você faz?", opcoes: [
    { texto: "Sem problema! Para facilitar para vocês dois, posso fazer uma apresentação rápida de 20 minutos com você e o sócio juntos. Quando seria possível? Assim ele tira as dúvidas na hora e vocês decidem juntos.", correta: true, explicacao: "Correto! Nunca deixe o processo de venda nas mãos do cliente. Você vai perder o controle. Proponha incluir o decisor na próxima conversa — você conduz, não ele." },
    { texto: "Tudo bem! Te mando um material completo que você pode encaminhar para o sócio analisar.", correta: false, explicacao: "Material sem você presente é o caminho certo para a venda morrer. O sócio vai ler por cima, não vai entender os diferenciais e vai dizer não por precaução." },
    { texto: "Você mesmo consegue me dar uma ideia do que o sócio vai perguntar? Assim eu preparo uma resposta para cada objeção.", correta: false, explicacao: "Curioso mas ineficaz. Você vai preparar respostas que nunca vão chegar ao sócio. Foque em incluir o decisor, não em preparar respostas por procuração." },
  ]},
  // TÉCNICO AVANÇADO
  { id: 25, topico: "Tronco SIP", dificuldade: "intermediaria", enunciado: "Cliente pergunta: 'Quantos canais SIP simultâneos eu preciso para um call center de 20 agentes?' Como você responde?", opcoes: [
    { texto: "Depende do perfil de uso. Se todos ligam ao mesmo tempo, precisa de 20 canais. Na prática, com pausas e tempo em fila, empresas com 20 agentes costumam usar entre 12 e 16 canais simultâneos. Recomendo começar com 15 e monitorar os relatórios de chamadas para ajustar.", correta: true, explicacao: "Resposta técnica e comercialmente inteligente! Mostrou conhecimento real (não é 1:1 necessariamente), usou os relatórios como argumento de valor e deixou margem para expansão." },
    { texto: "20 agentes = 20 canais SIP. É sempre um para um.", correta: false, explicacao: "Tecnicamente defensável mas comercialmente ingênuo. Na prática call centers têm ociosidade — nem todos ligam exatamente ao mesmo tempo. Dimensionar bem demonstra expertise." },
    { texto: "Para call center precisa de solução corporativa especial — não posso dimensionar sem visita técnica.", correta: false, explicacao: "Exagero que afasta o cliente. Um vendedor VB deve conseguir fazer uma estimativa inicial de canais com informações básicas de uso." },
  ]},
  { id: 26, topico: "PABX Virtual", dificuldade: "intermediaria", enunciado: "Um cliente pergunta se pode integrar o PABX Virtual da VB com o CRM Salesforce dele. O que você responde?", opcoes: [
    { texto: "Sim! A VB tem integração via API com os principais CRMs do mercado, incluindo Salesforce. Isso permite registrar chamadas automaticamente no histórico do cliente, clicar para ligar direto do CRM e ver quem está ligando antes de atender. Nosso time de onboarding cuida da configuração.", correta: true, explicacao: "Resposta completa! Confirmou a integração, descreveu os benefícios práticos (não só 'sim temos') e já posicionou o onboarding como suporte — elimina o medo de implantação complexa." },
    { texto: "Depende da versão do Salesforce que você usa — precisaria verificar com o técnico antes de confirmar.", correta: false, explicacao: "Resposta que gera insegurança desnecessária. A VB tem integração com os principais CRMs — confirme isso com confiança e deixe os detalhes técnicos para o onboarding." },
    { texto: "Integração com CRM é possível mas é um projeto separado com custo adicional.", correta: false, explicacao: "Errado e desmotivador. O onboarding e suporte à integração são inclusos — não é projeto separado com custo extra." },
  ]},
  { id: 27, topico: "Portabilidade", dificuldade: "intermediaria", enunciado: "Um cliente tem 5 números fixos de DDR para portar para a VB. Como você explica o processo e o que pode complicar?", opcoes: [
    { texto: "Portamos todos os 5 ao mesmo tempo no mesmo processo. O prazo é de 15 dias úteis. O que pode complicar: titular diferente entre os números, dívida com a operadora atual ou número usado como conta de energia/banco. Durante o processo, a VB ativa provisórios para zero interrupção.", correta: true, explicacao: "Completo e honesto. Mencionou as causas reais de atraso (titular, dívida, número vinculado) sem assustar — e reforçou a continuidade com provisório. Transparência aqui constrói confiança." },
    { texto: "Portabilidade de DDR é mais complexa, pode levar até 60 dias e tem custo adicional por número.", correta: false, explicacao: "Informação errada. O prazo padrão é 15 dias úteis para fixo, independente de ser DDR. Custo adicional por número também não procede." },
    { texto: "Sem problema! É simples, normalmente fica pronto em uma semana.", correta: false, explicacao: "Prometer prazo menor que o real (15 dias úteis) gera expectativa errada e reclamação garantida. Sempre seja preciso com prazos." },
  ]},
  { id: 28, topico: "VoIP Geral", dificuldade: "intermediaria", enunciado: "Um cliente pergunta o que é jitter e por que afeta a qualidade da chamada VoIP.", opcoes: [
    { texto: "Jitter é a variação no tempo de chegada dos pacotes de voz pela internet. Quando os pacotes chegam em tempos irregulares, o áudio fica entrecortado ou robótico. Se o roteador tiver QoS configurado, ele prioriza esses pacotes e o jitter cai. Menos de 30ms é o ideal para VoIP.", correta: true, explicacao: "Explicação técnica e prática. Conectou o conceito (jitter) ao sintoma (áudio entrecortado) e à solução (QoS). O dado de referência (30ms) demonstra domínio técnico sem ser pedante." },
    { texto: "Jitter é quando a internet fica lenta e as ligações travam. Acontece quando muita gente usa a rede ao mesmo tempo.", correta: false, explicacao: "Confunde jitter com congestionamento. São problemas diferentes. Jitter é variação de latência, não lentidão geral. Um cliente técnico vai perceber essa imprecisão." },
    { texto: "Jitter é um problema que a VB resolve no nosso servidor — o cliente não precisa se preocupar com isso.", correta: false, explicacao: "Errado e irresponsável. Jitter é causado pela rede local e pelo link de internet do cliente — a VB não controla isso. Atribuir a responsabilidade errada vai criar problema de suporte." },
  ]},
  { id: 29, topico: "QoS", dificuldade: "intermediaria", enunciado: "Um cliente tem 50 Mbps de internet e 10 ramais VoIP. O gerente de TI diz que mesmo assim tem queda de qualidade nas ligações. Qual o diagnóstico mais provável?", opcoes: [
    { texto: "50 Mbps é mais que suficiente para 10 ramais (precisa de ~1 Mbps para voz). O problema provavelmente é falta de QoS no roteador — o tráfego de voz está competindo com downloads, vídeos e outros dados sem priorização. Solução: configurar QoS ou VLAN de voz.", correta: true, explicacao: "Diagnóstico correto! Banda não é tudo — priorização é fundamental. Mostrar esse raciocínio ao TI demonstra que você entende de rede, não só de telefonia. Gera muita credibilidade." },
    { texto: "50 Mbps não é suficiente para VoIP corporativo. Recomendo contratar pelo menos 100 Mbps dedicados.", correta: false, explicacao: "Completamente errado. 50 Mbps aguenta facilmente 10 ramais (usa ~1 Mbps). Recomendar upgrade de link desnecessário vai destruir sua credibilidade com o TI." },
    { texto: "O problema deve ser no servidor da VB — vou abrir um chamado de qualidade para a equipe técnica investigar.", correta: false, explicacao: "Culpar o servidor antes de investigar a rede local é o erro mais comum. Com banda suficiente, o problema é quase sempre na rede do cliente. Investigue antes de abrir chamado." },
  ]},
  { id: 30, topico: "Vendas VB", dificuldade: "intermediaria", enunciado: "No fim de uma boa conversa, o cliente demonstra interesse mas não fecha. Qual a sequência ideal de próximos passos?", opcoes: [
    { texto: "Propor o teste grátis de 14 dias como próximo passo concreto, definir uma data para ligar e verificar a experiência dele, e agendar uma segunda reunião para converter o trial em contrato.", correta: true, explicacao: "Sequência perfeita! Trial → acompanhamento → conversão. Cada etapa tem um objetivo claro e um compromisso do cliente. Você mantém o controle do processo sem pressionar." },
    { texto: "Enviar a proposta por e-mail e aguardar o retorno dele quando estiver pronto para decidir.", correta: false, explicacao: "Perder o controle do processo é perder a venda. Sem próximos passos definidos, o cliente esfria, aparece um imprevisto e você nunca mais consegue reagendar." },
    { texto: "Dar um desconto de 10% se ele fechar ainda essa semana para criar urgência.", correta: false, explicacao: "Desconto sem pedido é queimar margem. Se ele não pediu desconto, não ofereça. Crie urgência real (trial, onboarding reservado) — não artificial (desconto inventado)." },
  ]},
];

// ─── PERFIS DE CENÁRIO PARA GERAÇÃO ──────────────────────────────
const SEGMENTOS = ["Contabilidade", "Clínica médica", "Escritório de advocacia", "Transportadora", "E-commerce", "Distribuidora", "Escola/Curso", "Imobiliária", "Construtora", "Call Center", "Farmácia", "Restaurante/Rede"];
const PERFIS_CLIENTE = [
  { id: "frio", label: "Cliente frio", desc: "Nunca ouviu falar da VB, está apenas pesquisando" },
  { id: "desconfiado", label: "Cliente desconfiado", desc: "Já foi mal atendido por outras operadoras" },
  { id: "tecnico", label: "Cliente técnico", desc: "Gestor de TI, conhece SIP, codecs, Asterisk" },
  { id: "preco", label: "Focado em preço", desc: "Quer o mais barato, compara tudo por preço" },
  { id: "concorrente", label: "Satisfeito com concorrente", desc: "Usa GoTo/3CX/Vivo e não vê motivo para trocar" },
  { id: "profissional", label: "Comprador profissional", desc: "Faz cotação formal, pede proposta técnica" },
  { id: "financeiro", label: "Diretor financeiro", desc: "Só se importa com ROI e custo total" },
  { id: "empresario", label: "Empresário", desc: "Dono, decide rápido, mas precisa confiar" },
];
const DIFICULDADES_SIM = [
  { id: "facil", label: "Fácil", cor: C.verde, desc: "Cliente receptivo, poucos obstáculos" },
  { id: "medio", label: "Médio", cor: C.laranja, desc: "Algumas objeções, negociação moderada" },
  { id: "dificil", label: "Difícil", cor: C.vermelho, desc: "Cliente resistente, múltiplas objeções" },
];

// ─── FIREBASE ─────────────────────────────────────────────────────
const salvarSimulacao = async (dados) => {
  try {
    const ref = await addDoc(collection(db, "simulacoes_v2"), {
      ...dados, timestamp: new Date().toISOString(), data: new Date().toLocaleDateString("pt-BR")
    });
    return ref.id;
  } catch (e) { console.error(e); return null; }
};

const buscarSimulacoes = async (vendedor) => {
  try {
    console.log("[VB] buscarSimulacoes chamado, vendedor:", vendedor);
    const q = vendedor
      ? query(collection(db, "simulacoes_v2"), where("vendedor", "==", vendedor))
      : query(collection(db, "simulacoes_v2"));
    const snap = await getDocs(q);
    console.log("[VB] docs retornados:", snap.docs.length);
    snap.docs.slice(0, 3).forEach(d => console.log("[VB] doc exemplo:", JSON.stringify({ vendedor: d.data().vendedor, tipo: d.data().tipo, nota: d.data().nota, timestamp: d.data().timestamp })));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  } catch (e) {
    console.error("[VB] Firebase ERRO:", e.code, e.message);
    return [];
  }
};

// ─── OPENAI API ───────────────────────────────────────────────────
// Chama /api/gpt (Vercel Serverless Function) para evitar bloqueio de CORS
const callGPT = async (messages, systemPrompt, jsonMode = false) => {
  const res = await fetch("/api/gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 1000,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Erro na API OpenAI");
  return data.choices[0].message.content;
};

const gerarCenario = async (segmento, perfis, dificuldade, historicoVendedor = []) => {
  const resumoHistorico = historicoVendedor.length > 0 ? `
HISTÓRICO DO VENDEDOR (últimos ${historicoVendedor.length} simulados):
${historicoVendedor.map((s, i) => `Simulado ${i+1}: nota ${s.nota?.toFixed(1)} | pontos fracos: ${s.avaliacao?.melhorias?.join(", ") || "não informado"} | encerramento: ${s.avaliacao?.encerramento || "?"}`).join("\n")}

COM BASE NESSE HISTÓRICO:
- Se o vendedor tem nota baixa em qualificação, gere um cliente que se abre rápido só se qualificado corretamente
- Se tem nota baixa em objeções, gere objeções mais fortes que o habitual
- Se tem nota baixa em fechamento, gere um cliente que precisa ser explicitamente convidado para o trial
- Ajuste a dificuldade real do cenário para atacar os pontos fracos identificados
` : "";

  const prompt = `${VB_KNOWLEDGE}

Você é um gerador de cenários de treinamento comercial para vendedores de VoIP.
${resumoHistorico}
Gere um cenário realista para:
- Segmento: ${segmento}
- Perfil do cliente: ${perfis.join(" + ")}
- Dificuldade: ${dificuldade}

Retorne APENAS um JSON válido com esta estrutura exata:
{
  "empresa": { "nome": "string", "cidade": "string", "porte": "string (ex: 8 funcionários)", "situacao_atual": "string (o que usam hoje de telefonia)" },
  "cliente": { "nome": "string", "cargo": "string" },
  "dores": ["dor 1", "dor 2", "dor 3"],
  "objecoes_previstas": ["objeção 1", "objeção 2", "objeção 3"],
  "contexto_secreto": "Informação que o vendedor deve DESCOBRIR durante a conversa — não revelar de início",
  "abertura": "Primeira mensagem que o cliente vai enviar para iniciar a conversa"
}`;

  const raw = await callGPT([], prompt, true);
  return JSON.parse(raw);
};

const avaliarConversa = async (cenario, mensagens) => {
  const conversa = mensagens.map(m => `${m.role === "vendedor" ? "VENDEDOR" : "CLIENTE"}: ${m.content}`).join("\n");
  const totalMsgsVendedor = mensagens.filter(m => m.role === "vendedor").length;
  const prompt = `${VB_KNOWLEDGE}

Você é um avaliador RIGOROSO e DIFERENCIADO de vendas consultivas B2B de telefonia VoIP.
Sua missão é dar notas REAIS que reflitam diferenças genuínas entre vendedores.
JAMAIS dê notas iguais ou próximas para critérios diferentes — isso não ajuda o gestor.

CENÁRIO:
- Empresa: ${cenario.empresa.nome} (${cenario.empresa.porte}, ${cenario.empresa.situacao_atual})
- Cliente: ${cenario.cliente.nome}, ${cenario.cliente.cargo}
- Dores reais do cliente: ${cenario.dores.join(", ")}
- Objeções previstas: ${cenario.objecoes_previstas?.join(", ") || "não informadas"}
- Contexto secreto que o vendedor deveria descobrir: ${cenario.contexto_secreto}

CONVERSA COMPLETA (${totalMsgsVendedor} mensagens do vendedor):
${conversa}

RUBRICA DE AVALIAÇÃO — aplique com rigor:

QUALIFICACAO (0-10):
- 9-10: Perguntou situação atual, ramais, dores, orçamento e prazo ANTES de apresentar produto
- 7-8: Qualificou parcialmente, deixou lacunas importantes
- 5-6: Apresentou produto antes de qualificar ou qualificou superficialmente
- 0-4: Não qualificou nada, foi direto para pitch ou preço

NECESSIDADES (0-10):
- 9-10: Usou SPIN ou equivalente, descobriu dores profundas, fez o cliente sentir o problema
- 7-8: Fez perguntas mas não aprofundou nas implicações
- 5-6: Perguntou o básico mas não explorou
- 0-4: Não investigou necessidades, assumiu o que o cliente precisava

TECNICA (0-10):
- 9-10: Demonstrou domínio de SIP, PABX, portabilidade, diferenciais VB com precisão
- 7-8: Explicou bem os produtos mas com lacunas técnicas menores
- 5-6: Conhecimento superficial, evitou perguntas técnicas ou deu respostas vagas
- 0-4: Errou informações técnicas, inventou dados, não soube responder

OBJECOES (0-10):
- 9-10: Antecipou objeções, usou suporte 24h/ISO/teste grátis, reconverteu resistência
- 7-8: Tratou objeções mas sem profundidade ou deixou alguma sem resposta
- 5-6: Cedeu rápido (ex: deu desconto sem explorar valor) ou ignorou objeções
- 0-4: Não soube tratar objeções, ficou na defensiva ou concordou sem argumentar

FECHAMENTO (0-10):
- 9-10: Tentou fechar ativamente, usou o teste grátis de 14 dias, criou urgência real
- 7-8: Sinalizou próximos passos mas não fechou com clareza
- 5-6: Deixou a conversa sem direção clara ou próximo passo definido
- 0-4: Não tentou fechar, perdeu oportunidade clara, encerrou sem compromisso

COMUNICACAO (0-10):
- 9-10: Clara, adaptada ao perfil, linguagem correta para o nível técnico, empática
- 7-8: Boa comunicação com alguns excessos técnicos ou formais
- 5-6: Mecânica, muito formal ou informal para o contexto
- 0-4: Confusa, mensagens longas sem objetivo, tom inadequado

PENALIZACOES (subtraia da nota final):
- Inventou preços, prazos ou funcionalidades inexistentes na VB: -2.0
- Falou mal de concorrente diretamente: -1.0
- Apresentou preço antes de qualificar: -1.5
- Prometeu coisas fora do escopo da VB: -1.5
- Conversa muito curta (menos de 4 msgs do vendedor) sem motivo: -2.0

BONUS (some na nota final, máx +1.0):
- Mencionou o teste grátis de 14 dias como gatilho de fechamento: +0.5
- Usou o argumento de suporte 24h + ISO 9001 corretamente: +0.3
- Descobriu o contexto secreto do cenário: +0.5

Calcule a nota final como média dos 6 critérios + bônus - penalizações, limitada entre 1.0 e 10.0.
Notas próximas de 7.5 para todos são PROIBIDAS — diferencie com base no que realmente aconteceu.

Retorne APENAS um JSON válido:
{
  "nota": 6.2,
  "criterios": { "qualificacao": 7, "necessidades": 5, "tecnica": 8, "objecoes": 4, "fechamento": 6, "comunicacao": 7 },
  "penalizacoes": ["descrição se houver, senão array vazio"],
  "bonus": ["descrição se houver, senão array vazio"],
  "fortes": ["ponto forte específico 1", "ponto forte específico 2"],
  "melhorias": ["melhoria acionável 1", "melhoria acionável 2", "melhoria 3"],
  "feedback": "Parágrafo único, direto e construtivo. Citar momentos específicos da conversa.",
  "encerramento": "venda_fechada | proposta_enviada | agendamento | recusa | inconcluso",
  "recomendacao_gestor": "Ação concreta que o gestor deve fazer com esse vendedor na próxima semana."
}`;

  const raw = await callGPT([], prompt, true);
  return JSON.parse(raw);
};

// ─── ESTILOS ──────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: C.branco, fontFamily: OPEN, color: C.texto },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: `1px solid ${C.borda}`, background: C.branco, position: "sticky", top: 0, zIndex: 100 },
  btnAmarelo: { background: C.amarelo, border: "none", borderRadius: 0, padding: "11px 22px", color: C.preto, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: MONT },
  btnAmareloFull: { width: "100%", background: C.amarelo, border: "none", borderRadius: 0, padding: "13px 0", color: C.preto, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: MONT },
  btnGhost: { background: "none", border: `1px solid ${C.borda}`, borderRadius: 0, padding: "7px 14px", color: C.suave, cursor: "pointer", fontSize: 12, fontFamily: OPEN },
  btnGestor: { background: "none", border: `1px solid ${C.amarelo}66`, borderRadius: 0, padding: "7px 14px", color: C.amareloEscuro, cursor: "pointer", fontSize: 12, fontFamily: MONT, fontWeight: 600 },
  input: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN },
  card: { background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "22px 18px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" },
  textarea: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN, resize: "none", lineHeight: 1.6 },
  tag: (cor) => ({ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 0, background: cor + "18", color: cor, border: `1px solid ${cor}33`, fontFamily: MONT, letterSpacing: 1 }),
};

// ─── COMPONENTES BASE ─────────────────────────────────────────────
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img src={LOGO_URL} alt="VB" style={{ height: 36, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.texto, letterSpacing: 2, fontFamily: MONT }}>VOIP DO BRASIL</div>
      <div style={{ fontSize: 9, color: C.amareloEscuro, letterSpacing: 3, textTransform: "uppercase", fontFamily: MONT }}>Treinamento Comercial</div>
    </div>
  </div>
);

const Topbar = ({ usuario, onHome, onHistorico, onRanking, onGestor, onTrocarSenha, onSair }) => (
  <div style={s.topbar}>
    <div style={{ cursor: "pointer" }} onClick={onHome}><Logo /></div>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {usuario && <span style={{ fontSize: 12, color: C.claro }}>Olá, <span style={{ color: C.amareloEscuro, fontWeight: 700 }}>{usuario.nome}</span></span>}
      {usuario && <button style={s.btnGhost} onClick={onHistorico}>Meus resultados</button>}
      {usuario && <button style={s.btnGhost} onClick={onTrocarSenha}>🔑 Senha</button>}
      {usuario?.role === "admin" && <button style={s.btnGestor} onClick={onGestor}>Painel Gestor</button>}
      {usuario && <button style={{ ...s.btnGhost, color: C.vermelho, borderColor: C.vermelho + "44" }} onClick={onSair}>Sair</button>}
    </div>
  </div>
);

const Spinner = ({ texto = "Aguardando..." }) => (
  <div style={{ textAlign: "center", padding: "32px 0", color: C.suave }}>
    <div style={{ width: 36, height: 36, border: `3px solid ${C.borda}`, borderTopColor: C.amarelo, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
    <div style={{ fontSize: 13 }}>{texto}</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── QUIZ TÉCNICO ─────────────────────────────────────────────────
const Quiz = ({ vendedor, onVoltar, onConcluir }) => {
  const topicos = [...new Set(QUIZ_QUESTIONS.map(q => q.topico))];
  const [topicoSel, setTopicoSel] = useState(null);
  const [dificuldade, setDificuldade] = useState("basica");
  const [questoes, setQuestoes] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [detalhes, setDetalhes] = useState([]);
  const [fase, setFase] = useState("config"); // config | quiz | resultado

  const iniciar = () => {
    const filtradas = QUIZ_QUESTIONS.filter(q =>
      (topicoSel ? q.topico === topicoSel : true) && q.dificuldade === dificuldade
    ).sort(() => Math.random() - 0.5).slice(0, 10);
    if (filtradas.length === 0) { alert("Nenhuma questão encontrada para essa combinação."); return; }
    setQuestoes(filtradas);
    setIdx(0); setSelecionada(null); setPontos(0); setDetalhes([]);
    setFase("quiz");
  };

  const responder = async (opcao) => {
    if (selecionada !== null) return;
    setSelecionada(opcao);
    const pts = opcao.correta ? 10 : 0;
    const novosPontos = pontos + pts;
    const novosDetalhes = [...detalhes, { enunciado: questoes[idx].enunciado, topico: questoes[idx].topico, resposta: opcao.texto, correta: opcao.correta, explicacao: opcao.explicacao, pontos: pts }];
    setPontos(novosPontos);
    setDetalhes(novosDetalhes);
    setTimeout(async () => {
      if (idx + 1 >= questoes.length) {
        const nota = parseFloat(((novosPontos / (questoes.length * 10)) * 10).toFixed(1));
        await salvarSimulacao({ vendedor, tipo: "quiz", topico: topicoSel || "Todos", dificuldade, nota, pontos: novosPontos, total_possivel: questoes.length * 10, questoes: questoes.length, detalhes: novosDetalhes });
        setFase("resultado");
      } else { setIdx(idx + 1); setSelecionada(null); }
    }, 2000);
  };

  const nota = questoes.length > 0 ? Math.round((pontos / (questoes.length * 10)) * 10) : 0;

  if (fase === "config") return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <button style={{ ...s.btnGhost, marginBottom: 24 }} onClick={onVoltar}>← Voltar</button>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 6 }}>Treino Técnico VoIP</h2>
      <p style={{ fontSize: 13, color: C.suave, marginBottom: 32 }}>Domine os conceitos técnicos que fazem diferença na hora de vender.</p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>TÓPICO</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => setTopicoSel(null)} style={{ ...s.btnGhost, ...(topicoSel === null ? { borderColor: C.amarelo, color: C.amareloEscuro, background: "#FFF8E1" } : {}) }}>Todos os tópicos</button>
          {topicos.map(t => (
            <button key={t} onClick={() => setTopicoSel(t)} style={{ ...s.btnGhost, ...(topicoSel === t ? { borderColor: C.amarelo, color: C.amareloEscuro, background: "#FFF8E1" } : {}) }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>DIFICULDADE</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: "basica", label: "Básica", desc: "Conceitos essenciais para qualquer vendedor" }, { id: "intermediaria", label: "Intermediária", desc: "Para responder clientes técnicos" }].map(d => (
            <div key={d.id} onClick={() => setDificuldade(d.id)} style={{ flex: 1, padding: "14px 16px", borderRadius: 0, border: `1.5px solid ${dificuldade === d.id ? C.amarelo : C.borda}`, background: dificuldade === d.id ? "#FFF8E1" : C.branco, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.texto, fontFamily: MONT, marginBottom: 4 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: C.suave }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <button style={s.btnAmareloFull} onClick={iniciar}>Iniciar treino →</button>
    </div>
  );

  if (fase === "quiz") {
    const q = questoes[idx];
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.claro, letterSpacing: 1, fontFamily: MONT, fontWeight: 700 }}>{q.topico}</div>
          <div style={{ fontSize: 11, color: C.claro }}>{idx + 1} / {questoes.length}</div>
        </div>
        <div style={{ height: 4, background: C.borda, borderRadius: 0, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(idx / questoes.length) * 100}%`, background: C.amarelo, borderRadius: 0, transition: "width 0.4s" }} />
        </div>
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "22px 24px", marginBottom: 22 }}>
          <div style={{ fontSize: 15, color: C.texto, lineHeight: 1.6, fontWeight: 600 }}>{q.enunciado}</div>
        </div>
        <div style={{ marginBottom: 8, fontSize: 10, color: C.claro, letterSpacing: 2, fontFamily: MONT, fontWeight: 700 }}>SELECIONE A MELHOR RESPOSTA:</div>
        {q.opcoes.map((op, i) => {
          let bg = C.branco, border = C.borda, cor = C.texto;
          if (selecionada !== null) {
            if (op === selecionada) { bg = op.correta ? "#EAFAF1" : "#FEECEC"; border = op.correta ? "#1a8c4e44" : "#c0392b44"; cor = op.correta ? C.verde : C.vermelho; }
            else if (op.correta) { bg = "#EAFAF1"; border = "#1a8c4e44"; cor = C.verde; }
          }
          return (
            <div key={i} onClick={() => responder(op)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 0, padding: "14px 18px", marginBottom: 10, cursor: selecionada ? "default" : "pointer", color: cor, fontSize: 13, lineHeight: 1.6, transition: "all 0.2s" }}>
              <span style={{ fontWeight: 700, marginRight: 8, fontFamily: MONT }}>{String.fromCharCode(65 + i)}.</span>{op.texto}
              {selecionada !== null && (
                <div style={{ marginTop: 8, fontSize: 12, color: op.correta ? C.verde : (op === selecionada ? C.vermelho : C.claro), lineHeight: 1.5 }}>{op.explicacao}</div>
              )}
            </div>
          );
        })}
        <div style={{ textAlign: "right", marginTop: 12, fontSize: 20, fontWeight: 900, color: C.amareloEscuro, fontFamily: MONT }}>{pontos} pts</div>
      </div>
    );
  }

  if (fase === "resultado") {
    const cor = corNota(nota);
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: cor, fontFamily: MONT, lineHeight: 1 }}>{nota}</div>
          <div style={{ fontSize: 13, color: C.suave }}>{emojiNota(nota)} {nota >= 8 ? "Excelente domínio técnico!" : nota >= 6 ? "Bom! Continue praticando." : "Precisa revisar os conceitos."}</div>
        </div>
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, overflow: "hidden", marginBottom: 24 }}>
          {detalhes.map((d, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: i < detalhes.length - 1 ? `1px solid ${C.borda}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={s.tag(d.correta ? C.verde : C.vermelho)}>{d.topico}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: d.correta ? C.verde : C.vermelho, fontFamily: MONT }}>{d.correta ? "+10 pts ✓" : "0 pts ✗"}</span>
              </div>
              <div style={{ fontSize: 12, color: C.texto, marginBottom: 4 }}>{d.enunciado}</div>
              <div style={{ fontSize: 12, color: C.suave, fontStyle: "italic" }}>→ {d.resposta}</div>
              <div style={{ fontSize: 11, color: d.correta ? C.verde : C.vermelho, marginTop: 4 }}>{d.explicacao}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnAmarelo} onClick={() => setFase("config")}>Praticar de novo</button>
          <button style={{ ...s.btnGhost }} onClick={onVoltar}>← Início</button>
        </div>
      </div>
    );
  }
  return null;
};

// ─── SIMULADO IA ──────────────────────────────────────────────────
const SimuladoIA = ({ vendedor, onVoltar, historicoVendedor = [] }) => {
  const [fase, setFase] = useState("config"); // config | gerando | chat | avaliando | resultado
  const [segmento, setSegmento] = useState(SEGMENTOS[0]);
  const [perfis, setPerfis] = useState(["frio"]);
  const [dificuldade, setDificuldade] = useState("medio");
  const [cenario, setCenario] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avaliacao, setAvaliacao] = useState(null);
  const [simId, setSimId] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensagens, loading]);

  const togglePerfil = (id) => {
    setPerfis(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const iniciarSimulado = async () => {
    if (perfis.length === 0) { alert("Selecione pelo menos um perfil de cliente."); return; }
    setFase("gerando");
    try {
      const seg = segmento === "Aleatório" ? SEGMENTOS[Math.floor(Math.random() * SEGMENTOS.length)] : segmento;
      const perfilLabels = perfis.map(p => PERFIS_CLIENTE.find(x => x.id === p)?.label || p);
      const c = await gerarCenario(seg, perfilLabels, dificuldade, historicoVendedor.slice(0, 5));
      setCenario(c);
      const primeiraMsg = { role: "lead", content: c.abertura, ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
      setMensagens([primeiraMsg]);
      setFase("chat");
    } catch (e) {
      alert("Erro ao gerar cenário: " + e.message);
      setFase("config");
    }
  };

  const enviarMensagem = async () => {
    if (!input.trim() || loading) return;
    const texto = input.trim();
    setInput("");
    const novaMsgVendedor = { role: "vendedor", content: texto, ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    const novasMensagens = [...mensagens, novaMsgVendedor];
    setMensagens(novasMensagens);
    setLoading(true);

    try {
      const systemPrompt = `${VB_KNOWLEDGE}

Você é ${cenario.cliente.nome}, ${cenario.cliente.cargo} da empresa ${cenario.empresa.nome} (${cenario.empresa.porte}, ${cenario.empresa.cidade}).

SITUAÇÃO ATUAL: ${cenario.empresa.situacao_atual}
SUAS DORES (não revele todas de uma vez): ${cenario.dores.join("; ")}
CONTEXTO ADICIONAL: ${cenario.contexto_secreto}

PERFIL DE COMPORTAMENTO:
${perfis.map(p => {
  const pf = PERFIS_CLIENTE.find(x => x.id === p);
  return pf ? `- ${pf.label}: ${pf.desc}` : "";
}).join("\n")}

DIFICULDADE: ${dificuldade}
${dificuldade === "dificil" ? "- Seja muito resistente, questione tudo, crie objeções fortes" : dificuldade === "facil" ? "- Seja receptivo, mas não compre sem entender o produto" : "- Tenha objeções moderadas, negocie"}

REGRAS ABSOLUTAS:
1. Fique 100% no personagem — você é o cliente, não um assistente
2. NUNCA corrija o vendedor, NUNCA dê dicas, NUNCA saia do personagem
3. Adapte sua resistência: argumentos fracos = mais objeções; argumentos fortes = mais abertura
4. Só encerre a conversa após pelo menos 20 trocas de mensagens entre você e o vendedor. Antes disso, NUNCA adicione [ENCERRADO], mesmo que haja sinais de fechamento, proposta solicitada ou agendamento. Após as 20 trocas, se a conversa chegar ao fim (venda fechada, recusa definitiva ou agendamento confirmado), adicione exatamente [ENCERRADO:motivo] ao final
5. Seja natural, use linguagem do dia a dia, não seja formal demais
6. Resposta máxima: 3 frases. Seja conciso como no WhatsApp.`;

      const gptMsgs = novasMensagens.map(m => ({
        role: m.role === "vendedor" ? "user" : "assistant",
        content: m.content
      }));

      const resposta = await callGPT(gptMsgs, systemPrompt);
      const encerrado = resposta.includes("[ENCERRADO:");
      const conteudoLimpo = resposta.replace(/\[ENCERRADO:[^\]]*\]/g, "").trim();

      const novaMsgLead = { role: "lead", content: conteudoLimpo, ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
      const todasMensagens = [...novasMensagens, novaMsgLead];
      setMensagens(todasMensagens);

      if (encerrado) {
        setTimeout(() => encerrarSimulado(todasMensagens), 1000);
      }
    } catch (e) {
      setMensagens(prev => [...prev, { role: "lead", content: "⚠️ Erro de conexão. Tente novamente.", ts: "" }]);
    }
    setLoading(false);
  };

  const encerrarSimulado = async (msgs) => {
    setFase("avaliando");
    try {
      const av = await avaliarConversa(cenario, msgs || mensagens);
      setAvaliacao(av);
      const id = await salvarSimulacao({
        vendedor, tipo: "simulado_ia", segmento, perfis, dificuldade,
        cenario, mensagens: msgs || mensagens, avaliacao: av, nota: av.nota
      });
      setSimId(id);
      setFase("resultado");
    } catch (e) {
      alert("Erro na avaliação: " + e.message);
      setFase("chat");
    }
  };

  // ── CONFIG ──
  if (fase === "config") return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 20px" }}>
      <button style={{ ...s.btnGhost, marginBottom: 24 }} onClick={onVoltar}>← Voltar</button>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 6 }}>Simulado com Cliente IA</h2>
      <p style={{ fontSize: 13, color: C.suave, marginBottom: 32, lineHeight: 1.6 }}>O GPT-4o vai interpretar um cliente real. Sem roteiro fixo — a conversa se adapta às suas respostas.</p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>SEGMENTO DA EMPRESA</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => setSegmento("Aleatório")} style={{ ...s.btnGhost, ...(segmento === "Aleatório" ? { borderColor: C.amarelo, color: C.amareloEscuro, background: "#FFF8E1" } : {}) }}>🎲 Aleatório</button>
          {SEGMENTOS.map(sg => (
            <button key={sg} onClick={() => setSegmento(sg)} style={{ ...s.btnGhost, ...(segmento === sg ? { borderColor: C.amarelo, color: C.amareloEscuro, background: "#FFF8E1" } : {}) }}>{sg}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>PERFIL DO CLIENTE (pode combinar)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PERFIS_CLIENTE.map(p => (
            <button key={p.id} onClick={() => togglePerfil(p.id)} style={{ ...s.btnGhost, ...(perfis.includes(p.id) ? { borderColor: C.amarelo, color: C.amareloEscuro, background: "#FFF8E1" } : {}) }} title={p.desc}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>DIFICULDADE</div>
        <div style={{ display: "flex", gap: 10 }}>
          {DIFICULDADES_SIM.map(d => (
            <div key={d.id} onClick={() => setDificuldade(d.id)} style={{ flex: 1, padding: "14px 16px", borderRadius: 0, border: `1.5px solid ${dificuldade === d.id ? d.cor : C.borda}`, background: dificuldade === d.id ? d.cor + "12" : C.branco, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: dificuldade === d.id ? d.cor : C.texto, fontFamily: MONT, marginBottom: 4 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: C.suave }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <button style={s.btnAmareloFull} onClick={iniciarSimulado}>Gerar cenário e iniciar →</button>
    </div>
  );

  // ── GERANDO ──
  if (fase === "gerando") return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <Spinner texto="GPT-4o gerando o cenário e o perfil do cliente..." />
      <p style={{ fontSize: 12, color: C.claro, marginTop: 8 }}>Criando empresa, histórico e personalidade do cliente...</p>
    </div>
  );

  // ── AVALIANDO ──
  if (fase === "avaliando") return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <Spinner texto="GPT-4o analisando sua performance..." />
      <p style={{ fontSize: 12, color: C.claro, marginTop: 8 }}>Avaliando qualificação, técnica, objeções, fechamento...</p>
    </div>
  );

  // ── CHAT ──
  if (fase === "chat" && cenario) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", height: "calc(100vh - 70px)" }}>
      {/* Cabeçalho do chat */}
      <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "14px 18px", marginBottom: 14, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, color: C.texto, fontFamily: MONT, fontSize: 14 }}>{cenario.cliente.nome} · {cenario.cliente.cargo}</div>
            <div style={{ fontSize: 12, color: C.suave }}>{cenario.empresa.nome} · {cenario.empresa.cidade} · {cenario.empresa.porte}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {perfis.map(p => {
              const pf = PERFIS_CLIENTE.find(x => x.id === p);
              return <span key={p} style={s.tag(C.azul)}>{pf?.label}</span>;
            })}
          </div>
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#FFF8E1", borderRadius: 0, fontSize: 11, color: C.amareloEscuro }}>
          <strong>Situação atual:</strong> {cenario.empresa.situacao_atual}
        </div>
      </div>

      {/* Mensagens */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {mensagens.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "vendedor" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: 0, background: m.role === "vendedor" ? C.amarelo : C.fundo, color: m.role === "vendedor" ? C.preto : C.texto, fontSize: 13, lineHeight: 1.6 }}>
              {m.content}
            </div>
            {m.ts && <div style={{ fontSize: 10, color: C.claro, marginTop: 3, marginLeft: m.role === "vendedor" ? 0 : 4, marginRight: m.role === "vendedor" ? 4 : 0 }}>{m.role === "vendedor" ? "Você" : cenario.cliente.nome.split(" ")[0]} · {m.ts}</div>}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ padding: "10px 14px", borderRadius: 0, background: C.fundo, fontSize: 13 }}>
              <span style={{ animation: "pulse 1s infinite" }}>●</span> <span style={{ color: C.claro, fontSize: 12 }}>digitando...</span>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0 }}>
        <textarea
          style={{ ...s.textarea, minHeight: 72, marginBottom: 8 }}
          placeholder="Digite sua resposta... (Enter para nova linha, Ctrl+Enter para enviar)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) enviarMensagem(); }}
          disabled={loading}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btnGhost, fontSize: 11 }} onClick={() => encerrarSimulado()}>Encerrar e avaliar</button>
            <button style={{ ...s.btnGhost, fontSize: 11, color: C.vermelho, borderColor: C.vermelho + "44" }} onClick={onVoltar}>Abandonar</button>
          </div>
          <button style={{ ...s.btnAmarelo, opacity: (!input.trim() || loading) ? 0.5 : 1 }} onClick={enviarMensagem} disabled={!input.trim() || loading}>
            Enviar →
          </button>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: C.claro, marginTop: 4 }}>{mensagens.filter(m => m.role === "vendedor").length} mensagens enviadas</div>
      </div>
    </div>
  );

  // ── RESULTADO ──
  if (fase === "resultado" && avaliacao) {
    const criterioLabels = { qualificacao: "Qualificação", necessidades: "Descoberta de necessidades", tecnica: "Conhecimento técnico", objecoes: "Tratamento de objeções", fechamento: "Fechamento", comunicacao: "Comunicação" };
    const cor = corNota(avaliacao.nota);
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
        {/* Nota geral */}
        <div style={{ textAlign: "center", marginBottom: 32, padding: "32px 20px", background: cor + "10", border: `1.5px solid ${cor}33`, borderRadius: 0 }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: cor, lineHeight: 1, fontFamily: MONT }}>{avaliacao.nota.toFixed(1)}</div>
          <div style={{ fontSize: 14, color: cor, fontWeight: 700, fontFamily: MONT, marginTop: 4 }}>{emojiNota(avaliacao.nota)} {avaliacao.nota >= 8 ? "Excelente performance!" : avaliacao.nota >= 6 ? "Bom trabalho!" : "Continue praticando!"}</div>
          <div style={{ fontSize: 12, color: C.suave, marginTop: 8 }}>
            {cenario.cliente.nome} · {cenario.empresa.nome} · {mensagens.filter(m => m.role === "vendedor").length} mensagens
          </div>
        </div>

        {/* Critérios */}
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>AVALIAÇÃO POR CRITÉRIO</div>
          {Object.entries(avaliacao.criterios).map(([key, val]) => (
            <div key={key} style={{ padding: "12px 20px", borderBottom: `1px solid ${C.borda}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, fontSize: 13, color: C.texto }}>{criterioLabels[key]}</div>
              <div style={{ width: 160, height: 6, background: C.fundo, borderRadius: 0, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${val * 10}%`, background: corNota(val), borderRadius: 0, transition: "width 0.8s" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: corNota(val), fontFamily: MONT, width: 28, textAlign: "right" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Pontos fortes e melhorias */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ background: "#EAFAF1", border: "1px solid #1a8c4e22", borderRadius: 0, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.verde, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 10 }}>✅ PONTOS FORTES</div>
            {avaliacao.fortes.map((f, i) => <div key={i} style={{ fontSize: 12, color: C.texto, marginBottom: 6, lineHeight: 1.5 }}>· {f}</div>)}
          </div>
          <div style={{ background: "#FEECEC", border: "1px solid #c0392b22", borderRadius: 0, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.vermelho, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 10 }}>📈 MELHORIAS</div>
            {avaliacao.melhorias.map((m, i) => <div key={i} style={{ fontSize: 12, color: C.texto, marginBottom: 6, lineHeight: 1.5 }}>· {m}</div>)}
          </div>
        </div>

        {/* Feedback geral */}
        <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}44`, borderRadius: 0, padding: "18px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.amareloEscuro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 8 }}>ANÁLISE GERAL</div>
          <div style={{ fontSize: 13, color: C.texto, lineHeight: 1.7 }}>{avaliacao.feedback}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnAmarelo} onClick={() => { setCenario(null); setMensagens([]); setAvaliacao(null); setFase("config"); }}>Novo simulado</button>
          <button style={s.btnGhost} onClick={onVoltar}>← Início</button>
        </div>
      </div>
    );
  }
  return null;
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────
export default function App() {
  const usuarioSalvo = (() => { try { return JSON.parse(localStorage.getItem("vb_sessao") || "null"); } catch { return null; } })();
  const [tela, setTela] = useState(usuarioSalvo ? "home" : "login");
  const [usuario, setUsuario] = useState(usuarioSalvo); // { nome, senha, role }
  const [nomeInput, setNomeInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relatorioVendedor, setRelatorioVendedor] = useState(null);
  // troca de senha
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [okSenha, setOkSenha] = useState("");

  const entrar = () => {
    setErroLogin("");
    const u = autenticar(nomeInput, senhaInput);
    if (!u) { setErroLogin("Nome ou senha incorretos."); return; }
    localStorage.setItem("vb_sessao", JSON.stringify(u));
    setUsuario(u);
    setTela("home");
    if (u.role === "admin") carregarTodos();
    else { buscarSimulacoes(u.nome).then(dados => setHistorico(dados)); }
  };

  const sair = () => { localStorage.removeItem("vb_sessao"); setUsuario(null); setNomeInput(""); setSenhaInput(""); setTela("login"); };

  const trocarSenha = () => {
    setErroSenha(""); setOkSenha("");
    if (senhaAtual !== usuario.senha) { setErroSenha("Senha atual incorreta."); return; }
    if (senhaNova.length < 6) { setErroSenha("Nova senha deve ter ao menos 6 caracteres."); return; }
    if (senhaNova !== senhaConfirm) { setErroSenha("As senhas não coincidem."); return; }
    const lista = getUsuarios().map(u => u.nome === usuario.nome ? { ...u, senha: senhaNova } : u);
    saveUsuarios(lista);
    const atualizado = { ...usuario, senha: senhaNova };
    setUsuario(atualizado);
    localStorage.setItem("vb_sessao", JSON.stringify(atualizado));
    setOkSenha("Senha alterada com sucesso!");
    setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm("");
  };

  const carregarTodos = async () => { setLoading(true); const dados = await buscarSimulacoes(null); setHistorico(dados); setLoading(false); return dados; };
  const verMeus = async () => { setTela("historico"); setLoading(true); const dados = await buscarSimulacoes(null); setHistorico(dados); setLoading(false); };

  // Sempre carregar todos para o ranking funcionar para todos
  useEffect(() => {
    if (usuarioSalvo) { carregarTodos(); }
  }, []);

  const Nav = () => (
    <Topbar
      usuario={usuario}
      onHome={() => setTela(usuario ? "home" : "login")}
      onHistorico={verMeus}
      onRanking={() => setTela("ranking")}
      onGestor={async () => { const dados = await carregarTodos(); setTela("gestor"); }}
      onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }}
      onSair={sair}
    />
  );

  // ── MODAL TROCA DE SENHA ──
  const ModalSenha = () => !modalSenha ? null : (
    <div style={{ position: "fixed", inset: 0, background: "#0008", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.branco, borderRadius: 0, padding: "32px 28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px #0003" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 6 }}>Alterar senha</div>
        <div style={{ fontSize: 12, color: C.suave, marginBottom: 24 }}>Usuário: <strong>{usuario?.nome}</strong></div>
        {["senhaAtual", "senhaNova", "senhaConfirm"].map((campo, i) => (
          <div key={campo} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.claro, letterSpacing: 1, fontFamily: MONT, fontWeight: 700, marginBottom: 6 }}>
              {["SENHA ATUAL", "NOVA SENHA", "CONFIRMAR NOVA SENHA"][i]}
            </div>
            <input
              style={s.input} type="password"
              placeholder={["Digite sua senha atual", "Mínimo 6 caracteres", "Repita a nova senha"][i]}
              value={[senhaAtual, senhaNova, senhaConfirm][i]}
              onChange={e => [setSenhaAtual, setSenhaNova, setSenhaConfirm][i](e.target.value)}
            />
          </div>
        ))}
        {erroSenha && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, padding: "8px 12px", background: "#FEECEC", borderRadius: 0 }}>{erroSenha}</div>}
        {okSenha && <div style={{ fontSize: 12, color: C.verde, marginBottom: 10, padding: "8px 12px", background: "#EAFAF1", borderRadius: 0 }}>{okSenha}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={s.btnAmarelo} onClick={trocarSenha}>Salvar senha</button>
          <button style={s.btnGhost} onClick={() => setModalSenha(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──
  if (tela === "login") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <ModalSenha />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 32 }}><Logo /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.texto, margin: "0 0 6px", fontFamily: MONT }}>Boas-vindas!</h2>
        <p style={{ fontSize: 13, color: C.suave, margin: "0 0 28px" }}>Plataforma de treinamento comercial · VoIP do Brasil</p>
        <div style={{ height: 1, background: C.borda, marginBottom: 24 }} />
        <div style={{ fontSize: 11, color: C.claro, marginBottom: 8, letterSpacing: 1, fontFamily: MONT, fontWeight: 700 }}>NOME</div>
        <input style={{ ...s.input, marginBottom: 12 }} placeholder="Seu nome" value={nomeInput} onChange={e => setNomeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && entrar()} autoFocus />
        <div style={{ fontSize: 11, color: C.claro, marginBottom: 8, letterSpacing: 1, fontFamily: MONT, fontWeight: 700 }}>SENHA</div>
        <input style={{ ...s.input, marginBottom: 6 }} placeholder="Sua senha" type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && entrar()} />
        {erroLogin && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, padding: "8px 12px", background: "#FEECEC", borderRadius: 0 }}>{erroLogin}</div>}
        <button style={{ ...s.btnAmareloFull, marginTop: 12 }} onClick={entrar}>Entrar →</button>
      </div>
    </div>
  );

  // ── HOME ──
  if (tela === "home") {
    // Calcular posição no ranking para vendedores
    const todosVendedoresRanking = [...new Set(historico.map(r => r.vendedor))].map(v => {
      const sims = historico.filter(r => r.vendedor === v && r.tipo === "simulado_ia" && r.nota);
      const qzs = historico.filter(r => r.vendedor === v && r.tipo === "quiz" && r.nota);
      const mediaSim = sims.length > 0 ? sims.reduce((a, b) => a + b.nota, 0) / sims.length : 0;
      const mediaQz = qzs.length > 0 ? qzs.reduce((a, b) => a + b.nota, 0) / qzs.length : 0;
      const media = sims.length > 0 ? mediaSim : mediaQz;
      return { nome: v, media: parseFloat(media.toFixed(1)), total: sims.length + qzs.length };
    }).sort((a, b) => b.media - a.media);
    const posicao = todosVendedoresRanking.findIndex(v => v.nome === usuario?.nome) + 1;
    const totalRanking = todosVendedoresRanking.length;
    const meusDados = todosVendedoresRanking.find(v => v.nome === usuario?.nome);

    return (
    <div style={s.page}>
      <style>{FONTS}</style>
      <ModalSenha />
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: "#FFF8E1", border: `1px solid ${C.amarelo}66`, color: C.amareloEscuro, fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 0, marginBottom: 18, letterSpacing: 2, fontFamily: MONT }}>PLATAFORMA DE TREINAMENTO · IA</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.texto, margin: "0 0 12px", lineHeight: 1.25, fontFamily: MONT }}>Treine com inteligência artificial<br /><span style={{ color: C.amareloEscuro }}>antes de atender de verdade</span></h1>
          <p style={{ fontSize: 13, color: C.suave, lineHeight: 1.8 }}>Dois módulos: quiz técnico VoIP para dominar os conceitos, e simulado com cliente IA para praticar vendas reais.</p>
        </div>

        {/* Badge de posição no ranking — visível para todos */}
        {posicao > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 36, padding: "18px 28px", background: posicao === 1 ? C.amarelo : posicao <= 3 ? "#FFF8E1" : C.fundo, border: `1.5px solid ${posicao === 1 ? C.amareloEscuro : C.borda}` }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: posicao === 1 ? C.preto : C.amareloEscuro, fontFamily: MONT, lineHeight: 1 }}>
              {posicao === 1 ? "🏆" : posicao === 2 ? "🥈" : posicao === 3 ? "🥉" : `#${posicao}`}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.texto, fontFamily: MONT }}>
                Você está em <span style={{ color: posicao <= 3 ? C.amareloEscuro : C.texto }}>{posicao}º lugar</span> no ranking da equipe
              </div>
              <div style={{ fontSize: 11, color: C.suave, marginTop: 3 }}>
                Média geral: <strong style={{ color: corNota(meusDados?.media || 0) }}>{meusDados?.media?.toFixed(1) || "—"}</strong>
                {" · "}{meusDados?.total || 0} atividades realizadas
                {usuario?.role === "admin" && <span>{" · "}<span style={{ color: C.azul, cursor: "pointer", textDecoration: "underline" }} onClick={() => setTela("ranking")}>Ver ranking completo →</span></span>}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Treino Técnico */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "32px 28px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.amarelo; e.currentTarget.style.boxShadow = `0 6px 24px ${C.amarelo}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borda; e.currentTarget.style.boxShadow = "none"; }}
            onClick={() => setTela("quiz")}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.azul }} />
            <div style={{ fontSize: 32, marginBottom: 14 }}>🎯</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 10 }}>Treino Técnico VoIP</div>
            <div style={{ fontSize: 13, color: C.suave, lineHeight: 1.7, marginBottom: 20 }}>Quiz com questões sobre SIP, PABX Virtual, Tronco SIP, Portabilidade, DDR, URA, QoS, Codecs, Vendas e SPIN Selling. Feedback imediato com explicação detalhada.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {["SIP", "PABX", "Portabilidade", "Codecs", "QoS", "DDR", "Vendas"].map(t => (
                <span key={t} style={s.tag(C.azul)}>{t}</span>
              ))}
            </div>
            <button style={s.btnAmareloFull}>Iniciar quiz →</button>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.claro }}>30 questões · 2 níveis de dificuldade</div>
          </div>

          {/* Simulado IA */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.amarelo}`, borderRadius: 0, padding: "32px 28px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${C.amarelo}33`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            onClick={() => setTela("simulado")}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.amarelo }} />
            <div style={{ fontSize: 32, marginBottom: 14 }}>🤖</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 10 }}>Simulado com Cliente IA</div>
            <div style={{ fontSize: 13, color: C.suave, lineHeight: 1.7, marginBottom: 20 }}>GPT-4o interpreta um cliente real com perfil e dores gerados dinamicamente. Conversa livre sem roteiro fixo. Avaliação automática ao final com nota por critério.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {["Cliente técnico", "Focado em preço", "Desconfiado", "Comprador profissional"].map(t => (
                <span key={t} style={s.tag(C.amareloEscuro)}>{t}</span>
              ))}
            </div>
            <button style={s.btnAmareloFull}>Iniciar simulado →</button>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.claro }}>Conversa livre · Avaliação automática por IA · Cenário adaptado ao seu histórico</div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  // ── RANKING PÚBLICO ──
  if (tela === "ranking") {
    const rankingData = [...new Set(historico.map(r => r.vendedor))].map(v => {
      const sims = historico.filter(r => r.vendedor === v && r.tipo === "simulado_ia" && r.nota);
      const qzs = historico.filter(r => r.vendedor === v && r.tipo === "quiz" && r.nota);
      const mediaSim = sims.length > 0 ? sims.reduce((a, b) => a + b.nota, 0) / sims.length : 0;
      const mediaQz = qzs.length > 0 ? qzs.reduce((a, b) => a + b.nota, 0) / qzs.length : 0;
      const media = sims.length > 0 ? mediaSim : (mediaQz > 0 ? mediaQz : 0);
      const ultimoSim = sims[0];
      const tendencia = sims.length >= 2 ? (sims[0].nota - sims[1].nota) : 0;
      return { nome: v, media: parseFloat(media.toFixed(1)), mediaSim: parseFloat(mediaSim.toFixed(1)), mediaQz: parseFloat(mediaQz.toFixed(1)), totalSim: sims.length, totalQz: qzs.length, tendencia, ultimaNota: ultimoSim?.nota };
    }).filter(v => v.media > 0).sort((a, b) => b.media - a.media);

    const medalhas = ["🥇", "🥈", "🥉"];
    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Nav />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontFamily: MONT, fontWeight: 700, marginBottom: 6 }}>RANKING DA EQUIPE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.texto, fontFamily: MONT }}>Classificação Geral</div>
              <div style={{ fontSize: 12, color: C.suave, marginTop: 4 }}>{rankingData.length} vendedores · atualizado agora</div>
            </div>
            <button style={s.btnGhost} onClick={() => setTela("home")}>← Voltar</button>
          </div>

          {/* Top 3 destaque */}
          {rankingData.length >= 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
              {[rankingData[1], rankingData[0], rankingData[2]].map((v, i) => {
                const posReal = i === 0 ? 2 : i === 1 ? 1 : 3;
                const alturas = [120, 150, 110];
                const isEu = v.nome === usuario?.nome;
                return (
                  <div key={v.nome} style={{ background: posReal === 1 ? C.amarelo : C.branco, border: `1.5px solid ${posReal === 1 ? C.amareloEscuro : C.borda}`, padding: "20px 16px", textAlign: "center", height: alturas[i], display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                    <div style={{ fontSize: 28 }}>{medalhas[posReal - 1]}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: posReal === 1 ? C.preto : C.texto, fontFamily: MONT }}>{v.nome}{isEu ? " 👈" : ""}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: posReal === 1 ? C.preto : corNota(v.media), fontFamily: MONT }}>{v.media.toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: posReal === 1 ? "#0006" : C.claro }}>{v.totalSim}s · {v.totalQz}q</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lista completa */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 80px 70px", gap: 8, padding: "10px 18px", background: C.fundo, borderBottom: `1px solid ${C.borda}` }}>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700 }}>#</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700 }}>VENDEDOR</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>SIMULADOS</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>QUIZ</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>TENDÊNCIA</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "right" }}>MÉDIA</div>
            </div>
            {rankingData.map((v, i) => {
              const isEu = v.nome === usuario?.nome;
              return (
                <div key={v.nome} style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 80px 70px", gap: 8, padding: "14px 18px", borderBottom: i < rankingData.length - 1 ? `1px solid ${C.borda}` : "none", alignItems: "center", background: isEu ? "#FFF8E1" : "transparent" }}>
                  <div style={{ width: 24, height: 24, background: i < 3 ? C.amarelo : C.fundo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 14 : 11, fontWeight: 800, color: i < 3 ? C.preto : C.suave, fontFamily: MONT }}>
                    {i < 3 ? medalhas[i] : i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.texto, fontFamily: MONT }}>{v.nome}{isEu ? <span style={{ fontSize: 10, color: C.amareloEscuro, marginLeft: 6 }}>← você</span> : ""}</div>
                    <div style={{ fontSize: 10, color: C.claro }}>{v.totalSim + v.totalQz} atividades</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: v.mediaSim > 0 ? corNota(v.mediaSim) : C.claro, fontFamily: MONT }}>{v.mediaSim > 0 ? v.mediaSim.toFixed(1) : "—"}</div>
                    <div style={{ fontSize: 9, color: C.claro }}>{v.totalSim} sim</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: v.mediaQz > 0 ? corNota(v.mediaQz) : C.claro, fontFamily: MONT }}>{v.mediaQz > 0 ? v.mediaQz.toFixed(1) : "—"}</div>
                    <div style={{ fontSize: 9, color: C.claro }}>{v.totalQz} quiz</div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: v.tendencia > 0 ? C.verde : v.tendencia < 0 ? C.vermelho : C.claro, fontFamily: MONT }}>
                    {v.tendencia > 0 ? `↑ +${v.tendencia.toFixed(1)}` : v.tendencia < 0 ? `↓ ${v.tendencia.toFixed(1)}` : "—"}
                  </div>
                  <div style={{ textAlign: "right", fontSize: 20, fontWeight: 900, color: corNota(v.media), fontFamily: MONT }}>{v.media.toFixed(1)}</div>
                </div>
              );
            })}
          </div>

          <button style={{ ...s.btnAmareloFull, marginTop: 20 }} onClick={() => setTela("home")}>← Voltar ao início</button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (tela === "quiz") return (
    <div style={{ ...s.page, background: C.fundo }}>
      <style>{FONTS}</style>
      <ModalSenha />
      <Nav />
      <Quiz vendedor={usuario?.nome} onVoltar={() => setTela("home")} />
    </div>
  );

  // ── SIMULADO ──
  if (tela === "simulado") return (
    <div style={{ ...s.page }}>
      <style>{FONTS}</style>
      <ModalSenha />
      <Nav />
      <SimuladoIA vendedor={usuario?.nome} onVoltar={() => setTela("home")} historicoVendedor={historico.filter(r => r.tipo === "simulado_ia" && r.vendedor === usuario?.nome && r.nota)} />
    </div>
  );

  // ── HISTÓRICO (relatório completo do próprio vendedor) ──
  if (tela === "historico") {
    const nomeV = usuario?.nome || "";
    const simsV = historico.filter(r => r.tipo === "simulado_ia" && r.nota && r.vendedor === nomeV);
    const qzsV = historico.filter(r => r.tipo === "quiz" && r.nota && r.vendedor === nomeV);
    const criteriosNomesCompletos = { qualificacao: "Qualificação", necessidades: "Descoberta de Necessidades", tecnica: "Conhecimento Técnico", objecoes: "Tratamento de Objeções", fechamento: "Fechamento", comunicacao: "Comunicação" };
    const mediaSim = simsV.length > 0 ? simsV.reduce((a, b) => a + b.nota, 0) / simsV.length : 0;
    const mediaQz = qzsV.length > 0 ? qzsV.reduce((a, b) => a + b.nota, 0) / qzsV.length : 0;
    const mediaCriterios = {};
    Object.keys(criteriosNomesCompletos).forEach(k => {
      const vals = simsV.filter(s => s.avaliacao?.criterios?.[k]).map(s => s.avaliacao.criterios[k]);
      mediaCriterios[k] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    });
    const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    // Mostrar spinner enquanto carrega
    if (loading) return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Nav />
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <Spinner texto="Carregando seus resultados..." />
        </div>
      </div>
    );

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Nav />
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 24px" }}>

          {/* Cabeçalho */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "26px 30px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontFamily: MONT, fontWeight: 700, marginBottom: 6 }}>MEU RELATÓRIO DE DESEMPENHO</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.texto, fontFamily: MONT }}>{nomeV}</div>
                <div style={{ fontSize: 13, color: C.suave, marginTop: 4 }}>Gerado em {dataHoje} · {simsV.length} simulados · {qzsV.length} treinos técnicos</div>
              </div>
              <img src={LOGO_URL} alt="VB" style={{ height: 44, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
          </div>

          {/* Cards resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
            {[
              { label: "MÉDIA SIMULADOS IA", value: mediaSim > 0 ? mediaSim.toFixed(1) : "—", sub: emojiNota(mediaSim) + " " + (mediaSim >= 8 ? "Excelente" : mediaSim >= 6 ? "Bom" : mediaSim > 0 ? "Continue praticando" : "Sem dados"), cor: corNota(mediaSim) },
              { label: "MÉDIA TREINO TÉCNICO", value: mediaQz > 0 ? mediaQz.toFixed(1) : "—", sub: `${qzsV.length} quizzes realizados`, cor: corNota(mediaQz) },
              { label: "TOTAL DE ATIVIDADES", value: simsV.length + qzsV.length, sub: `${simsV.length} simulados + ${qzsV.length} treinos`, cor: C.azul },
            ].map((m, i) => (
              <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: m.cor, fontFamily: MONT }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: C.suave, marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Critérios médios */}
          {Object.values(mediaCriterios).some(v => v !== null) && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>AVALIAÇÃO POR CRITÉRIO — MÉDIA DO PERÍODO</div>
              {Object.entries(criteriosNomesCompletos).map(([k, label]) => {
                const val = mediaCriterios[k];
                if (!val) return null;
                return (
                  <div key={k} style={{ padding: "13px 20px", borderBottom: `1px solid ${C.borda}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, fontSize: 13, color: C.texto }}>{label}</div>
                    <div style={{ width: 180, height: 7, background: C.fundo, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${val * 10}%`, background: corNota(val) }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: corNota(val), fontFamily: MONT, width: 28, textAlign: "right" }}>{val}</div>
                    <div style={{ fontSize: 11, color: C.suave, width: 76 }}>{val >= 8 ? "✅ Forte" : val >= 6 ? "⚠️ Regular" : "🔴 Fraco"}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Evolução */}
          {simsV.length > 1 && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 14 }}>MINHA EVOLUÇÃO — DO MAIS ANTIGO AO MAIS RECENTE</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                {[...simsV].reverse().map((sim, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                    <div style={{ width: "100%", height: Math.max(10, (sim.nota / 10) * 70), background: corNota(sim.nota), opacity: 0.85 }} />
                    <div style={{ fontSize: 9, color: C.claro, textAlign: "center" }}>{sim.data}</div>
                  </div>
                ))}
              </div>
              {(() => { const delta = simsV[0]?.nota - simsV[simsV.length - 1]?.nota; return <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: delta >= 0 ? C.verde : C.vermelho }}>{delta >= 0 ? `↑ Evolução de +${delta.toFixed(1)} pontos no período` : `↓ Queda de ${Math.abs(delta).toFixed(1)} pontos no período`}</div>; })()}
            </div>
          )}

          {/* Análise de cada simulado */}
          {simsV.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 12 }}>ANÁLISE DETALHADA DAS MINHAS CONVERSAS</div>
              {simsV.map((sim, i) => (
                <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "20px 22px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.texto, fontFamily: MONT }}>{sim.cenario?.empresa?.nome} · {sim.cenario?.cliente?.nome}</div>
                      <div style={{ fontSize: 12, color: C.suave, marginTop: 2 }}>{sim.cenario?.cliente?.cargo} · {sim.data}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <span style={s.tag(C.suave)}>{sim.dificuldade?.toUpperCase()}</span>
                        {sim.avaliacao?.encerramento && <span style={s.tag(sim.avaliacao.encerramento === "venda_fechada" ? C.verde : sim.avaliacao.encerramento === "recusa" ? C.vermelho : C.azul)}>{sim.avaliacao.encerramento.replace("_", " ").toUpperCase()}</span>}
                        <span style={s.tag(C.suave)}>{sim.mensagens?.filter(m => m.role === "vendedor").length || 0} MSG</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: C.claro }}>nota final</div>
                    </div>
                  </div>
                  {sim.avaliacao?.criterios && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {Object.entries(sim.avaliacao.criterios).map(([k, val]) => (
                        <div key={k} style={{ fontSize: 11, padding: "3px 10px", background: corNota(val) + "18", color: corNota(val), fontFamily: MONT, fontWeight: 700 }}>
                          {criteriosNomesCompletos[k]?.split(" ")[0]} {val}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ background: "#EAFAF1", border: "1px solid #1a8c4e22", padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: C.verde, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>✅ PONTOS FORTES</div>
                      {(sim.avaliacao?.fortes || []).map((f, j) => <div key={j} style={{ fontSize: 12, color: C.texto, marginBottom: 4, lineHeight: 1.5 }}>· {f}</div>)}
                    </div>
                    <div style={{ background: "#FEECEC", border: "1px solid #c0392b22", padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: C.vermelho, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>📈 O QUE MELHORAR</div>
                      {(sim.avaliacao?.melhorias || []).map((m, j) => <div key={j} style={{ fontSize: 12, color: C.texto, marginBottom: 4, lineHeight: 1.5 }}>· {m}</div>)}
                    </div>
                  </div>
                  {sim.avaliacao?.feedback && (
                    <div style={{ borderLeft: `3px solid ${C.amarelo}`, paddingLeft: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: C.amareloEscuro, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>ANÁLISE DA CONVERSA</div>
                      <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.7 }}>{sim.avaliacao.feedback}</div>
                    </div>
                  )}
                  {sim.mensagens?.length > 0 && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ fontSize: 12, color: C.azul, cursor: "pointer", fontWeight: 700, fontFamily: MONT }}>Ver transcrição completa ({sim.mensagens.length} mensagens)</summary>
                      <div style={{ marginTop: 10, maxHeight: 280, overflowY: "auto", border: `1px solid ${C.borda}`, padding: 12, background: C.fundo }}>
                        {sim.mensagens.map((m, j) => (
                          <div key={j} style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: m.role === "vendedor" ? C.azul : C.suave, fontFamily: MONT, flexShrink: 0, width: 60, paddingTop: 2 }}>
                              {m.role === "vendedor" ? nomeV.split(" ")[0] : sim.cenario?.cliente?.nome?.split(" ")[0]}
                            </div>
                            <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.5 }}>{m.content}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Quizzes */}
          {qzsV.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 12, marginTop: 8 }}>TREINOS TÉCNICOS REALIZADOS</div>
              {qzsV.map((r, i) => (
                <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "16px 20px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={s.tag(C.azul)}>QUIZ TÉCNICO</span>
                        {r.dificuldade && <span style={s.tag(C.suave)}>{r.dificuldade.toUpperCase()}</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>Tópico: {r.topico}</div>
                      <div style={{ fontSize: 11, color: C.claro, marginTop: 2 }}>{r.data} · {r.questoes} questões</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: corNota(r.nota), fontFamily: MONT }}>{r.nota}</div>
                  </div>
                  {r.detalhes?.length > 0 && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ fontSize: 12, color: C.azul, cursor: "pointer", fontWeight: 700, fontFamily: MONT }}>Ver detalhes das questões</summary>
                      <div style={{ marginTop: 10 }}>
                        {r.detalhes.map((d, j) => (
                          <div key={j} style={{ padding: "10px 0", borderBottom: j < r.detalhes.length - 1 ? `1px solid ${C.borda}` : "none" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={s.tag(d.correta ? C.verde : C.vermelho)}>{d.topico}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: d.correta ? C.verde : C.vermelho, fontFamily: MONT }}>{d.correta ? "+10 pts ✓" : "0 pts ✗"}</span>
                            </div>
                            <div style={{ fontSize: 12, color: C.texto, marginBottom: 3 }}>{d.enunciado}</div>
                            <div style={{ fontSize: 11, color: C.suave, fontStyle: "italic" }}>→ {d.resposta}</div>
                            <div style={{ fontSize: 11, color: d.correta ? C.verde : C.vermelho, marginTop: 3 }}>{d.explicacao}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </>
          )}

          {loading && <div style={{ textAlign: "center", color: C.suave, padding: 40 }}>Carregando...</div>}
          {!loading && simsV.length === 0 && qzsV.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.suave }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>Sem resultados ainda</div>
              <div style={{ fontSize: 12 }}>Complete simulados e quizzes para ver seu relatório aqui.</div>
            </div>
          )}
          <button style={{ ...s.btnAmareloFull, marginTop: 16 }} onClick={() => setTela("home")}>← Voltar ao início</button>
        </div>
      </div>
    );
  }

  // ── PAINEL GESTOR ──
  if (tela === "gestor") {
    if (loading) return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Topbar usuario={usuario} onHome={() => setTela("home")} onHistorico={() => {}} onGestor={() => {}} onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }} onSair={sair} />
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <Spinner texto="Carregando dados da equipe..." />
        </div>
      </div>
    );
    const simulados = historico.filter(r => r.tipo === "simulado_ia" && r.nota);
    const quizzes = historico.filter(r => r.tipo === "quiz" && r.nota);
    const vendedores = [...new Set(historico.map(r => r.vendedor))];
    const criteriosNomes = { qualificacao: "Qualif.", necessidades: "Necessid.", tecnica: "Técnica", objecoes: "Objeções", fechamento: "Fecham.", comunicacao: "Comunic." };

    const stats = vendedores.map(v => {
      const sims = simulados.filter(r => r.vendedor === v);
      const qzs = quizzes.filter(r => r.vendedor === v);
      const mediaSim = sims.length > 0 ? (sims.reduce((a, b) => a + b.nota, 0) / sims.length) : 0;
      const mediaQz = qzs.length > 0 ? (qzs.reduce((a, b) => a + b.nota, 0) / qzs.length) : 0;
      const media = sims.length > 0 ? mediaSim : mediaQz;
      const criterios = {};
      if (sims.length > 0) {
        Object.keys(criteriosNomes).forEach(k => {
          const vals = sims.filter(s => s.avaliacao?.criterios?.[k]).map(s => s.avaliacao.criterios[k]);
          criterios[k] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
        });
      }
      return { vendedor: v, totalSim: sims.length, totalQz: qzs.length, media: parseFloat(media.toFixed(1)), mediaSim: parseFloat(mediaSim.toFixed(1)), mediaQz: parseFloat(mediaQz.toFixed(1)), criterios };
    }).sort((a, b) => b.media - a.media);

    const mediaGeral = simulados.length > 0 ? (simulados.reduce((a, b) => a + b.nota, 0) / simulados.length).toFixed(1) : "—";
    const criterioPior = (() => {
      const totais = {};
      simulados.forEach(r => { if (r.avaliacao?.criterios) Object.entries(r.avaliacao.criterios).forEach(([k, v]) => { totais[k] = (totais[k] || []).concat(v); }); });
      let pior = null, menor = 99;
      Object.entries(totais).forEach(([k, vals]) => { const m = vals.reduce((a, b) => a + b, 0) / vals.length; if (m < menor) { menor = m; pior = k; } });
      return pior ? criteriosNomes[pior] : "—";
    })();

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Topbar usuario={usuario} onHome={() => setTela("home")} onHistorico={() => {}} onGestor={() => {}} onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }} onSair={sair} />
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.texto, fontFamily: MONT }}>Painel do Gestor</div>
              <div style={{ fontSize: 13, color: C.suave }}>{historico.length} registros · {vendedores.length} vendedores ativos</div>
            </div>
            <button style={{ ...s.btnGhost, fontSize: 12 }} onClick={() => carregarTodos()}>↻ Atualizar</button>
          </div>

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "MÉDIA GERAL", value: mediaGeral, cor: corNota(parseFloat(mediaGeral) || 0) },
              { label: "SIMULADOS IA", value: simulados.length, cor: C.azul },
              { label: "TREINOS TÉCNICOS", value: quizzes.length, cor: C.suave },
              { label: "CRITÉRIO MAIS FRACO", value: criterioPior, cor: C.vermelho },
            ].map((m, i) => (
              <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "16px 18px" }}>
                <div style={{ fontSize: i === 3 ? 15 : 26, fontWeight: 800, color: m.cor, fontFamily: MONT, lineHeight: 1.2 }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 6, fontFamily: MONT, fontWeight: 700 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Ranking completo da equipe */}
          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>🏆 RANKING DA EQUIPE</div>

          {/* Pódio top 3 */}
          {stats.length >= 3 && (() => {
            const medalhas = ["🥇", "🥈", "🥉"];
            const ordem = [stats[1], stats[0], stats[2]];
            const alturas = [110, 140, 100];
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 10, marginBottom: 16, alignItems: "flex-end" }}>
                {ordem.map((v, i) => {
                  const posReal = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const sims = simulados.filter(r => r.vendedor === v.vendedor);
                  const tendencia = sims.length >= 2 ? (sims[0].nota - sims[1].nota) : null;
                  return (
                    <div key={v.vendedor} style={{ background: posReal === 1 ? C.amarelo : C.branco, border: `1.5px solid ${posReal === 1 ? C.amareloEscuro : C.borda}`, padding: "16px 12px", textAlign: "center", height: alturas[i], display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                      <div style={{ fontSize: 22 }}>{medalhas[posReal - 1]}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: posReal === 1 ? C.preto : C.texto, fontFamily: MONT }}>{v.vendedor}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: posReal === 1 ? C.preto : corNota(v.media), fontFamily: MONT }}>{v.media.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: posReal === 1 ? "#0006" : C.claro }}>{v.totalSim}s · {v.totalQz}q</div>
                      {tendencia !== null && <div style={{ fontSize: 10, fontWeight: 700, color: tendencia > 0 ? C.verde : tendencia < 0 ? C.vermelho : C.claro }}>{tendencia > 0 ? `↑ +${tendencia.toFixed(1)}` : tendencia < 0 ? `↓ ${tendencia.toFixed(1)}` : "→ estável"}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Lista completa */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, overflow: "hidden", marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 140px 1fr repeat(6,44px) 60px 70px 110px", gap: 6, padding: "10px 16px", borderBottom: `1.5px solid ${C.borda}`, background: C.fundo, alignItems: "center" }}>
              <div /><div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700 }}>VENDEDOR</div>
              <div />
              {Object.values(criteriosNomes).map(n => <div key={n} style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>{n.toUpperCase()}</div>)}
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>MÉDIA</div>
              <div style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>TEND.</div>
              <div />
            </div>
            {!loading && stats.length === 0 && <div style={{ padding: 24, color: C.suave, textAlign: "center" }}>Nenhum resultado ainda.</div>}
            {stats.map((v, i) => {
              const sims = simulados.filter(r => r.vendedor === v.vendedor);
              const tendencia = sims.length >= 2 ? (sims[0].nota - sims[1].nota) : null;
              const medalhas = ["🥇", "🥈", "🥉"];
              return (
                <div key={v.vendedor} style={{ display: "grid", gridTemplateColumns: "36px 140px 1fr repeat(6,44px) 60px 70px 110px", gap: 6, padding: "12px 16px", borderBottom: i < stats.length - 1 ? `1px solid ${C.borda}` : "none", alignItems: "center", background: i === 0 ? "#FFF8E1" : "transparent" }}>
                  <div style={{ fontSize: i < 3 ? 16 : 11, fontWeight: 800, color: i < 3 ? C.amareloEscuro : C.claro, fontFamily: MONT, textAlign: "center" }}>{i < 3 ? medalhas[i] : i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.texto, fontFamily: MONT }}>{v.vendedor}</div>
                    <div style={{ fontSize: 10, color: C.claro }}>{v.totalSim}s · {v.totalQz}q</div>
                  </div>
                  <div style={{ height: 5, background: C.fundo, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(v.media / 10) * 100}%`, background: corNota(v.media) }} />
                  </div>
                  {Object.keys(criteriosNomes).map(k => (
                    <div key={k} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: v.criterios[k] ? corNota(v.criterios[k]) : C.claro, fontFamily: MONT }}>
                      {v.criterios[k] ?? "—"}
                    </div>
                  ))}
                  <div style={{ textAlign: "center", fontSize: 18, fontWeight: 900, color: corNota(v.media), fontFamily: MONT }}>{v.media.toFixed(1)}</div>
                  <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: tendencia !== null ? (tendencia > 0 ? C.verde : tendencia < 0 ? C.vermelho : C.claro) : C.claro, fontFamily: MONT }}>
                    {tendencia !== null ? (tendencia > 0 ? `↑+${tendencia.toFixed(1)}` : tendencia < 0 ? `↓${tendencia.toFixed(1)}` : "→") : "—"}
                  </div>
                  <button onClick={() => { setRelatorioVendedor(v.vendedor); setTela("relatorio"); }} style={{ ...s.btnGhost, fontSize: 11, padding: "5px 10px", color: C.amareloEscuro, borderColor: C.amarelo + "88" }}>
                    Relatório →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Gráfico de Evolução por Vendedor */}
          {(() => {
            const CORES_VENDEDOR = [C.amarelo, C.azul, C.verde, C.vermelho, C.laranja, "#9b59b6", "#1abc9c", "#e67e22", "#2c3e50"];

            // Incluir todos vendedores que têm pelo menos 1 simulado_ia
            const dadosVendedor = vendedores.map((v, vi) => {
              const sims = historico
                .filter(r => r.vendedor === v && r.tipo === "simulado_ia" && r.nota)
                .sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
              return { nome: v, cor: CORES_VENDEDOR[vi % CORES_VENDEDOR.length], sims };
            }).filter(v => v.sims.length > 0);

            if (dadosVendedor.length === 0) return null;

            const CHART_W = 900, CHART_H = 220, PAD_L = 40, PAD_R = 20, PAD_T = 20, PAD_B = 40;
            const W = CHART_W - PAD_L - PAD_R;
            const H = CHART_H - PAD_T - PAD_B;
            const yPos = (nota) => PAD_T + H - ((nota / 10) * H);

            return (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>EVOLUÇÃO DA EQUIPE — SIMULADOS IA</div>
                <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, padding: "20px 20px 12px" }}>
                  {/* Legenda */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                    {dadosVendedor.map(v => (
                      <div key={v.nome} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 24, height: 3, background: v.cor }} />
                        <span style={{ fontSize: 11, color: C.texto, fontFamily: MONT, fontWeight: 700 }}>{v.nome} ({v.sims.length})</span>
                      </div>
                    ))}
                  </div>
                  {/* SVG Chart — cada vendedor no seu próprio eixo sequencial */}
                  <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ overflow: "visible" }}>
                    {/* Grid horizontal */}
                    {[0, 2, 4, 6, 8, 10].map(n => (
                      <g key={n}>
                        <line x1={PAD_L} y1={yPos(n)} x2={CHART_W - PAD_R} y2={yPos(n)} stroke={C.borda} strokeWidth="1" strokeDasharray={n === 0 ? "0" : "4,4"} />
                        <text x={PAD_L - 6} y={yPos(n) + 4} fontSize="9" fill={C.claro} textAnchor="end" fontFamily={MONT}>{n}</text>
                      </g>
                    ))}
                    {/* Linha de referência nota 6 */}
                    <line x1={PAD_L} y1={yPos(6)} x2={CHART_W - PAD_R} y2={yPos(6)} stroke={C.amareloEscuro} strokeWidth="1" strokeDasharray="2,4" opacity="0.4" />

                    {dadosVendedor.map(v => {
                      const n = v.sims.length;
                      if (n === 0) return null;

                      // Distribuir pontos uniformemente no eixo X
                      const xPos = (i) => n === 1 ? PAD_L + W / 2 : PAD_L + (i / (n - 1)) * W;
                      const pts = v.sims.map((sim, i) => ({ x: xPos(i), y: yPos(sim.nota), nota: sim.nota, data: sim.data }));

                      const pathD = pts.length === 1
                        ? null
                        : pts.map((p, i) => {
                            if (i === 0) return `M ${p.x} ${p.y}`;
                            const prev = pts[i - 1];
                            const cx = (prev.x + p.x) / 2;
                            return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
                          }).join(" ");

                      return (
                        <g key={v.nome}>
                          {pathD && <path d={pathD} fill="none" stroke={v.cor} strokeWidth="2.5" />}
                          {pts.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="5" fill={v.cor} stroke={C.branco} strokeWidth="2" />
                              <text x={p.x} y={p.y - 10} fontSize="9" fill={v.cor} textAnchor="middle" fontWeight="700" fontFamily={MONT}>{p.nota.toFixed ? p.nota.toFixed(1) : p.nota}</text>
                            </g>
                          ))}
                        </g>
                      );
                    })}

                    {/* Eixo X — datas do primeiro vendedor como referência */}
                    {dadosVendedor[0]?.sims.map((sim, i) => {
                      const n = dadosVendedor[0].sims.length;
                      const x = n === 1 ? PAD_L + W / 2 : PAD_L + (i / (n - 1)) * W;
                      return <text key={i} x={x} y={CHART_H - 6} fontSize="9" fill={C.claro} textAnchor="middle" fontFamily={MONT}>{sim.data}</text>;
                    })}
                  </svg>
                </div>
              </div>
            );
          })()}

          {/* Últimas atividades */}
          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>ÚLTIMAS ATIVIDADES</div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, overflow: "hidden", marginBottom: 24 }}>
            {historico.slice(0, 15).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 18px", borderBottom: i < 14 ? `1px solid ${C.borda}` : "none", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.tipo === "simulado_ia" ? C.amareloEscuro : C.azul, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>{r.vendedor}</span>
                  <span style={{ color: C.suave, fontSize: 12 }}> · {r.tipo === "simulado_ia" ? (r.cenario?.empresa?.nome || "Simulado IA") : `Quiz · ${r.topico || "Técnico"}`}</span>
                </div>
                <div style={{ fontSize: 11, color: C.claro }}>{r.data}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.nota ? corNota(r.nota) : C.claro, fontFamily: MONT, width: 36, textAlign: "right" }}>
                  {r.nota ? (typeof r.nota === "number" ? r.nota.toFixed(1) : r.nota) : "—"}
                </div>
              </div>
            ))}
          </div>

          <button style={s.btnAmarelo} onClick={() => setTela("home")}>🎯 Ir para Treinamento</button>
          <button style={{ ...s.btnGhost, marginLeft: 10 }} onClick={sair}>← Sair do painel</button>
        </div>
      </div>
    );
  }

  // ── RELATÓRIO INDIVIDUAL ──
  if (tela === "relatorio" && relatorioVendedor) {
    const nomeV = relatorioVendedor;
    const simsV = historico.filter(r => r.tipo === "simulado_ia" && r.vendedor === nomeV && r.nota);
    const qzsV = historico.filter(r => r.tipo === "quiz" && r.vendedor === nomeV && r.nota);
    const criteriosNomesCompletos = { qualificacao: "Qualificação", necessidades: "Descoberta de Necessidades", tecnica: "Conhecimento Técnico", objecoes: "Tratamento de Objeções", fechamento: "Fechamento", comunicacao: "Comunicação" };
    const mediaSim = simsV.length > 0 ? simsV.reduce((a, b) => a + b.nota, 0) / simsV.length : 0;
    const mediaQz = qzsV.length > 0 ? qzsV.reduce((a, b) => a + b.nota, 0) / qzsV.length : 0;
    const mediaCriterios = {};
    Object.keys(criteriosNomesCompletos).forEach(k => {
      const vals = simsV.filter(s => s.avaliacao?.criterios?.[k]).map(s => s.avaliacao.criterios[k]);
      mediaCriterios[k] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    });
    const recomendacoes = simsV.filter(s => s.avaliacao?.recomendacao_gestor).map(s => s.avaliacao.recomendacao_gestor);
    const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const printCSS = `@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS + printCSS}</style>
        <ModalSenha />
        <div className="no-print">
          <Topbar usuario={usuario} onHome={() => setTela("home")} onHistorico={() => {}} onGestor={() => setTela("gestor")} onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }} onSair={sair} />
        </div>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 24px" }}>

          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <button style={s.btnGhost} onClick={() => setTela("gestor")}>← Voltar ao Painel</button>
            <button style={s.btnAmarelo} onClick={() => window.print()}>🖨️ Exportar PDF</button>
          </div>

          {/* Cabeçalho */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "26px 30px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontFamily: MONT, fontWeight: 700, marginBottom: 6 }}>RELATÓRIO SEMANAL DE DESEMPENHO</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.texto, fontFamily: MONT }}>{nomeV}</div>
                <div style={{ fontSize: 13, color: C.suave, marginTop: 4 }}>Gerado em {dataHoje} · {simsV.length} simulados · {qzsV.length} treinos técnicos</div>
              </div>
              <img src={LOGO_URL} alt="VB" style={{ height: 44, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
          </div>

          {/* Cards resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
            {[
              { label: "MÉDIA SIMULADOS IA", value: mediaSim > 0 ? mediaSim.toFixed(1) : "—", sub: emojiNota(mediaSim) + " " + (mediaSim >= 8 ? "Excelente" : mediaSim >= 6 ? "Bom" : mediaSim > 0 ? "Precisa evoluir" : "Sem dados"), cor: corNota(mediaSim) },
              { label: "MÉDIA TREINO TÉCNICO", value: mediaQz > 0 ? mediaQz.toFixed(1) : "—", sub: `${qzsV.length} quizzes realizados`, cor: corNota(mediaQz) },
              { label: "TOTAL DE ATIVIDADES", value: simsV.length + qzsV.length, sub: `${simsV.length} simulados + ${qzsV.length} treinos`, cor: C.azul },
            ].map((m, i) => (
              <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: m.cor, fontFamily: MONT }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: C.suave, marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Critérios médios */}
          {Object.values(mediaCriterios).some(v => v !== null) && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>AVALIAÇÃO POR CRITÉRIO — MÉDIA DO PERÍODO</div>
              {Object.entries(criteriosNomesCompletos).map(([k, label]) => {
                const val = mediaCriterios[k];
                if (!val) return null;
                return (
                  <div key={k} style={{ padding: "13px 20px", borderBottom: `1px solid ${C.borda}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, fontSize: 13, color: C.texto }}>{label}</div>
                    <div style={{ width: 180, height: 7, background: C.fundo, borderRadius: 0, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${val * 10}%`, background: corNota(val), borderRadius: 0 }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: corNota(val), fontFamily: MONT, width: 28, textAlign: "right" }}>{val}</div>
                    <div style={{ fontSize: 11, color: C.suave, width: 76 }}>{val >= 8 ? "✅ Forte" : val >= 6 ? "⚠️ Regular" : "🔴 Fraco"}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Evolução */}
          {simsV.length > 1 && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 14 }}>EVOLUÇÃO — DO MAIS ANTIGO AO MAIS RECENTE</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                {[...simsV].reverse().map((sim, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                    <div style={{ width: "100%", height: Math.max(10, (sim.nota / 10) * 70), background: corNota(sim.nota), borderRadius: 0, opacity: 0.85 }} />
                    <div style={{ fontSize: 9, color: C.claro, textAlign: "center" }}>{sim.data}</div>
                  </div>
                ))}
              </div>
              {(() => { const delta = simsV[0]?.nota - simsV[simsV.length - 1]?.nota; return <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: delta >= 0 ? C.verde : C.vermelho }}>{delta >= 0 ? `↑ Evolução de +${delta.toFixed(1)} pontos no período` : `↓ Queda de ${Math.abs(delta).toFixed(1)} pontos no período`}</div>; })()}
            </div>
          )}

          {/* Análise de cada simulado */}
          {simsV.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 12 }}>ANÁLISE DETALHADA DAS CONVERSAS</div>
              {simsV.map((sim, i) => (
                <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 0, padding: "20px 22px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.texto, fontFamily: MONT }}>{sim.cenario?.empresa?.nome} · {sim.cenario?.cliente?.nome}</div>
                      <div style={{ fontSize: 12, color: C.suave, marginTop: 2 }}>{sim.cenario?.cliente?.cargo} · {sim.data}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <span style={s.tag(C.suave)}>{sim.dificuldade?.toUpperCase()}</span>
                        {sim.avaliacao?.encerramento && <span style={s.tag(sim.avaliacao.encerramento === "venda_fechada" ? C.verde : sim.avaliacao.encerramento === "recusa" ? C.vermelho : C.azul)}>{sim.avaliacao.encerramento.replace("_", " ").toUpperCase()}</span>}
                        <span style={s.tag(C.suave)}>{sim.mensagens?.filter(m => m.role === "vendedor").length || 0} MSG</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: C.claro }}>nota final</div>
                    </div>
                  </div>

                  {/* Chips de critério */}
                  {sim.avaliacao?.criterios && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {Object.entries(sim.avaliacao.criterios).map(([k, val]) => (
                        <div key={k} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 0, background: corNota(val) + "18", color: corNota(val), fontFamily: MONT, fontWeight: 700 }}>
                          {criteriosNomesCompletos[k]?.split(" ")[0]} {val}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Penalizações */}
                  {sim.avaliacao?.penalizacoes?.filter(p => p && p !== "array vazio").length > 0 && (
                    <div style={{ background: "#FEECEC", borderRadius: 0, padding: "8px 12px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.vermelho, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>⚠️ PENALIZAÇÕES APLICADAS</div>
                      {sim.avaliacao.penalizacoes.map((p, j) => <div key={j} style={{ fontSize: 12, color: C.vermelho }}>· {p}</div>)}
                    </div>
                  )}

                  {/* Bônus */}
                  {sim.avaliacao?.bonus?.filter(b => b && b !== "array vazio").length > 0 && (
                    <div style={{ background: "#EAFAF1", borderRadius: 0, padding: "8px 12px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.verde, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>✅ BÔNUS APLICADOS</div>
                      {sim.avaliacao.bonus.map((b, j) => <div key={j} style={{ fontSize: 12, color: C.verde }}>· {b}</div>)}
                    </div>
                  )}

                  {/* Fortes e melhorias */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.verde, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>PONTOS FORTES</div>
                      {(sim.avaliacao?.fortes || []).map((f, j) => <div key={j} style={{ fontSize: 12, color: C.texto, marginBottom: 4, lineHeight: 1.5 }}>· {f}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.vermelho, fontWeight: 700, fontFamily: MONT, marginBottom: 6 }}>PONTOS A MELHORAR</div>
                      {(sim.avaliacao?.melhorias || []).map((m, j) => <div key={j} style={{ fontSize: 12, color: C.texto, marginBottom: 4, lineHeight: 1.5 }}>· {m}</div>)}
                    </div>
                  </div>

                  {/* Feedback */}
                  {sim.avaliacao?.feedback && (
                    <div style={{ borderLeft: `3px solid ${C.amarelo}`, paddingLeft: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.7 }}>{sim.avaliacao.feedback}</div>
                    </div>
                  )}

                  {/* Recomendação ao gestor */}
                  {sim.avaliacao?.recomendacao_gestor && (
                    <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}44`, borderRadius: 0, padding: "10px 14px" }}>
                      <div style={{ fontSize: 10, color: C.amareloEscuro, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>💡 AÇÃO RECOMENDADA PARA O GESTOR</div>
                      <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.6 }}>{sim.avaliacao.recomendacao_gestor}</div>
                    </div>
                  )}

                  {/* Transcrição */}
                  {sim.mensagens?.length > 0 && (
                    <details style={{ marginTop: 14 }}>
                      <summary style={{ fontSize: 12, color: C.azul, cursor: "pointer", fontWeight: 700, fontFamily: MONT }}>Ver transcrição completa ({sim.mensagens.length} mensagens)</summary>
                      <div style={{ marginTop: 10, maxHeight: 280, overflowY: "auto", border: `1px solid ${C.borda}`, borderRadius: 0, padding: 12, background: C.fundo }}>
                        {sim.mensagens.map((m, j) => (
                          <div key={j} style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: m.role === "vendedor" ? C.azul : C.suave, fontFamily: MONT, flexShrink: 0, width: 60, paddingTop: 2 }}>
                              {m.role === "vendedor" ? nomeV.split(" ")[0] : sim.cenario?.cliente?.nome?.split(" ")[0]}
                            </div>
                            <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.5 }}>{m.content}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Plano de ação consolidado */}
          {recomendacoes.length > 0 && (
            <div style={{ background: C.branco, border: `2px solid ${C.amarelo}`, borderRadius: 0, padding: "22px 24px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: C.amareloEscuro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 14 }}>📋 PLANO DE AÇÃO — REUNIÃO SEMANAL</div>
              {recomendacoes.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.amarelo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.preto, flexShrink: 0, fontFamily: MONT }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: C.texto, lineHeight: 1.6 }}>{r}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: 11, color: C.claro, paddingTop: 16, borderTop: `1px solid ${C.borda}`, marginBottom: 24 }}>
            VoIP do Brasil · Plataforma de Treinamento Comercial · {dataHoje}
          </div>

          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <button style={s.btnGhost} onClick={() => setTela("gestor")}>← Voltar ao Painel</button>
            <button style={s.btnAmarelo} onClick={() => window.print()}>🖨️ Exportar PDF</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
