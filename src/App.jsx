import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";

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

const OPENAI_KEY = "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";

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
    const q = vendedor
      ? query(collection(db, "simulacoes_v2"), where("vendedor", "==", vendedor), orderBy("timestamp", "desc"))
      : query(collection(db, "simulacoes_v2"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
};

// ─── OPENAI API ───────────────────────────────────────────────────
const callGPT = async (messages, systemPrompt, jsonMode = false) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
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

const gerarCenario = async (segmento, perfis, dificuldade) => {
  const prompt = `${VB_KNOWLEDGE}

Você é um gerador de cenários de treinamento comercial para vendedores de VoIP.

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

QUALIFICAÇÃO (0-10):
- 9-10: Perguntou situação atual, número de ramais, dores, orçamento e prazo antes de apresentar produto
- 7-8: Qualificou parcialmente, deixou lacunas importantes
- 5-6: Apresentou produto antes de qualificar ou qualificou superficialmente
- 0-4: Não qualificou nada, foi direto para pitch ou preço

DESCOBERTA DE NECESSIDADES (0-10):
- 9-10: Usou SPIN ou equivalente, descobriu dores profundas, fez o cliente sentir o problema
- 7-8: Fez perguntas mas não aprofundou nas implicações
- 5-6: Perguntou o básico mas não explorou
- 0-4: Não investigou necessidades, assumiu o que o cliente precisava

CONHECIMENTO TÉCNICO (0-10):
- 9-10: Demonstrou domínio de SIP, PABX, portabilidade, diferenciais VB com precisão
- 7-8: Explicou bem os produtos mas com lacunas técnicas menores
- 5-6: Conhecimento superficial, evitou perguntas técnicas ou deu respostas vagas
- 0-4: Errou informações técnicas, inventou dados, não soube responder

TRATAMENTO DE OBJEÇÕES (0-10):
- 9-10: Antecipou objeções, usou argumentos específicos (suporte 24h, ISO, teste grátis), reconverteu resistência
- 7-8: Tratou objeções mas sem profundidade ou deixou alguma sem resposta
- 5-6: Cedeu rápido (ex: deu desconto sem explorar valor) ou ignorou objeções
- 0-4: Não soube tratar objeções, ficou na defensiva ou concordou com o cliente sem argumentar

FECHAMENTO (0-10):
- 9-10: Tentou fechar ativamente, usou o teste grátis de 14 dias, criou urgência real
- 7-8: Sinalizou próximos passos mas não fechou com clareza
- 5-6: Deixou a conversa sem direção clara ou próximo passo definido
- 0-4: Não tentou fechar, perdeu oportunidade clara, encerrou sem compromisso

COMUNICAÇÃO (0-10):
- 9-10: Clara, adaptada ao perfil do cliente, linguagem correta para o nível técnico, empática
- 7-8: Boa comunicação com alguns excessos técnicos ou formais
- 5-6: Comunicação mecânica, muito formal ou muito informal para o contexto
- 0-4: Comunicação confusa, mensagens longas sem objetivo, tom inadequado

PENALIZAÇÕES AUTOMÁTICAS (subtraia da nota final):
- Inventou preços, prazos ou funcionalidades que não existem na VB: -2.0
- Falou mal de concorrente diretamente (ex: "a Vivo é horrível"): -1.0
- Apresentou preço antes de qualificar: -1.5
- Prometeu coisas fora do escopo da VB: -1.5
- Conversa muito curta (menos de 4 mensagens do vendedor) sem motivo: -2.0

BÔNUS (some na nota final, máx +1.0):
- Mencionou o teste grátis de 14 dias como gatilho de fechamento: +0.5
- Usou o argumento de suporte 24h + ISO 9001 corretamente: +0.3
- Descobriu o contexto secreto do cenário: +0.5

Calcule a nota final como média dos 6 critérios + bônus - penalizações, limitada entre 1.0 e 10.0.
A nota DEVE ser diferente da média simples se houver penalizações ou bônus.
Notas finais próximas de 7.5 para todos são PROIBIDAS — diferencie com base no que realmente aconteceu.

Retorne APENAS um JSON válido:
{
  "nota": 6.2,
  "criterios": {
    "qualificacao": 7,
    "necessidades": 5,
    "tecnica": 8,
    "objecoes": 4,
    "fechamento": 6,
    "comunicacao": 7
  },
  "penalizacoes": ["descrição da penalização aplicada se houver"],
  "bonus": ["descrição do bônus aplicado se houver"],
  "fortes": ["ponto forte específico 1", "ponto forte específico 2"],
  "melhorias": ["melhoria específica e acionável 1", "melhoria específica e acionável 2", "melhoria 3"],
  "feedback": "Parágrafo único, direto e construtivo sobre o desempenho real. Citar momentos específicos da conversa.",
  "encerramento": "venda_fechada | proposta_enviada | agendamento | recusa | inconcluso",
  "recomendacao_gestor": "Uma ação concreta que o gestor deve fazer com esse vendedor na próxima semana (ex: role-play de objeções de preço, revisão de conteúdo técnico sobre portabilidade, etc.)"
}`;

  const raw = await callGPT([], prompt, true);
  return JSON.parse(raw);
};

// ─── ESTILOS ──────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: C.branco, fontFamily: OPEN, color: C.texto },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: `1px solid ${C.borda}`, background: C.branco, position: "sticky", top: 0, zIndex: 100 },
  btnAmarelo: { background: C.amarelo, border: "none", borderRadius: 10, padding: "11px 22px", color: C.preto, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: MONT },
  btnAmareloFull: { width: "100%", background: C.amarelo, border: "none", borderRadius: 10, padding: "13px 0", color: C.preto, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: MONT },
  btnGhost: { background: "none", border: `1px solid ${C.borda}`, borderRadius: 8, padding: "7px 14px", color: C.suave, cursor: "pointer", fontSize: 12, fontFamily: OPEN },
  btnGestor: { background: "none", border: `1px solid ${C.amarelo}66`, borderRadius: 8, padding: "7px 14px", color: C.amareloEscuro, cursor: "pointer", fontSize: 12, fontFamily: MONT, fontWeight: 600 },
  input: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 10, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN },
  card: { background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "22px 18px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" },
  textarea: { width: "100%", background: C.fundo, border: `1.5px solid ${C.borda}`, borderRadius: 10, padding: "13px 16px", color: C.texto, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: OPEN, resize: "none", lineHeight: 1.6 },
  tag: (cor) => ({ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: cor + "18", color: cor, border: `1px solid ${cor}33`, fontFamily: MONT, letterSpacing: 1 }),
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

const Topbar = ({ usuario, onHome, onHistorico, onGestor, onTrocarSenha, onSair }) => (
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
    ).sort(() => Math.random() - 0.5).slice(0, 8);
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
        const nota = Math.round((novosPontos / (questoes.length * 10)) * 10);
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
            <div key={d.id} onClick={() => setDificuldade(d.id)} style={{ flex: 1, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${dificuldade === d.id ? C.amarelo : C.borda}`, background: dificuldade === d.id ? "#FFF8E1" : C.branco, cursor: "pointer" }}>
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
        <div style={{ height: 4, background: C.borda, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(idx / questoes.length) * 100}%`, background: C.amarelo, borderRadius: 2, transition: "width 0.4s" }} />
        </div>
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "22px 24px", marginBottom: 22 }}>
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
            <div key={i} onClick={() => responder(op)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 10, cursor: selecionada ? "default" : "pointer", color: cor, fontSize: 13, lineHeight: 1.6, transition: "all 0.2s" }}>
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
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
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
const SimuladoIA = ({ vendedor, onVoltar }) => {
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
      const c = await gerarCenario(seg, perfilLabels, dificuldade);
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
4. Quando a conversa chegar ao fim (venda fechada, recusa definitiva, proposta solicitada, agendamento confirmado), adicione exatamente [ENCERRADO:motivo] ao final
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
            <div key={d.id} onClick={() => setDificuldade(d.id)} style={{ flex: 1, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${dificuldade === d.id ? d.cor : C.borda}`, background: dificuldade === d.id ? d.cor + "12" : C.branco, cursor: "pointer" }}>
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
      <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "14px 18px", marginBottom: 14, flexShrink: 0 }}>
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
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#FFF8E1", borderRadius: 8, fontSize: 11, color: C.amareloEscuro }}>
          <strong>Situação atual:</strong> {cenario.empresa.situacao_atual}
        </div>
      </div>

      {/* Mensagens */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {mensagens.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "vendedor" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "vendedor" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "vendedor" ? C.amarelo : C.fundo, color: m.role === "vendedor" ? C.preto : C.texto, fontSize: 13, lineHeight: 1.6 }}>
              {m.content}
            </div>
            {m.ts && <div style={{ fontSize: 10, color: C.claro, marginTop: 3, marginLeft: m.role === "vendedor" ? 0 : 4, marginRight: m.role === "vendedor" ? 4 : 0 }}>{m.role === "vendedor" ? "Você" : cenario.cliente.nome.split(" ")[0]} · {m.ts}</div>}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: C.fundo, fontSize: 13 }}>
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
        <div style={{ textAlign: "center", marginBottom: 32, padding: "32px 20px", background: cor + "10", border: `1.5px solid ${cor}33`, borderRadius: 16 }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: cor, lineHeight: 1, fontFamily: MONT }}>{avaliacao.nota.toFixed(1)}</div>
          <div style={{ fontSize: 14, color: cor, fontWeight: 700, fontFamily: MONT, marginTop: 4 }}>{emojiNota(avaliacao.nota)} {avaliacao.nota >= 8 ? "Excelente performance!" : avaliacao.nota >= 6 ? "Bom trabalho!" : "Continue praticando!"}</div>
          <div style={{ fontSize: 12, color: C.suave, marginTop: 8 }}>
            {cenario.cliente.nome} · {cenario.empresa.nome} · {mensagens.filter(m => m.role === "vendedor").length} mensagens
          </div>
        </div>

        {/* Critérios */}
        <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>AVALIAÇÃO POR CRITÉRIO</div>
          {Object.entries(avaliacao.criterios).map(([key, val]) => (
            <div key={key} style={{ padding: "12px 20px", borderBottom: `1px solid ${C.borda}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, fontSize: 13, color: C.texto }}>{criterioLabels[key]}</div>
              <div style={{ width: 160, height: 6, background: C.fundo, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${val * 10}%`, background: corNota(val), borderRadius: 3, transition: "width 0.8s" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: corNota(val), fontFamily: MONT, width: 28, textAlign: "right" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Pontos fortes e melhorias */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ background: "#EAFAF1", border: "1px solid #1a8c4e22", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.verde, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 10 }}>✅ PONTOS FORTES</div>
            {avaliacao.fortes.map((f, i) => <div key={i} style={{ fontSize: 12, color: C.texto, marginBottom: 6, lineHeight: 1.5 }}>· {f}</div>)}
          </div>
          <div style={{ background: "#FEECEC", border: "1px solid #c0392b22", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.vermelho, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 10 }}>📈 MELHORIAS</div>
            {avaliacao.melhorias.map((m, i) => <div key={i} style={{ fontSize: 12, color: C.texto, marginBottom: 6, lineHeight: 1.5 }}>· {m}</div>)}
          </div>
        </div>

        {/* Feedback geral */}
        <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}44`, borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
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
  const [tela, setTela] = useState("login");
  const [usuario, setUsuario] = useState(null); // { nome, senha, role }
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
    setUsuario(u);
    setTela("home");
    if (u.role === "admin") carregarTodos();
  };

  const sair = () => { setUsuario(null); setNomeInput(""); setSenhaInput(""); setTela("login"); };

  const trocarSenha = () => {
    setErroSenha(""); setOkSenha("");
    if (senhaAtual !== usuario.senha) { setErroSenha("Senha atual incorreta."); return; }
    if (senhaNova.length < 6) { setErroSenha("Nova senha deve ter ao menos 6 caracteres."); return; }
    if (senhaNova !== senhaConfirm) { setErroSenha("As senhas não coincidem."); return; }
    const lista = getUsuarios().map(u => u.nome === usuario.nome ? { ...u, senha: senhaNova } : u);
    saveUsuarios(lista);
    const atualizado = { ...usuario, senha: senhaNova };
    setUsuario(atualizado);
    setOkSenha("Senha alterada com sucesso!");
    setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm("");
  };

  const carregarTodos = async () => { setLoading(true); setHistorico(await buscarSimulacoes(null)); setLoading(false); };
  const verMeus = async () => { setLoading(true); setHistorico(await buscarSimulacoes(usuario.nome)); setLoading(false); setTela("historico"); };

  const Nav = () => (
    <Topbar
      usuario={usuario}
      onHome={() => setTela(usuario ? "home" : "login")}
      onHistorico={verMeus}
      onGestor={() => { carregarTodos(); setTela("gestor"); }}
      onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }}
      onSair={sair}
    />
  );

  // ── MODAL TROCA DE SENHA ──
  const ModalSenha = () => !modalSenha ? null : (
    <div style={{ position: "fixed", inset: 0, background: "#0008", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.branco, borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px #0003" }}>
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
        {erroSenha && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, padding: "8px 12px", background: "#FEECEC", borderRadius: 8 }}>{erroSenha}</div>}
        {okSenha && <div style={{ fontSize: 12, color: C.verde, marginBottom: 10, padding: "8px 12px", background: "#EAFAF1", borderRadius: 8 }}>{okSenha}</div>}
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
        {erroLogin && <div style={{ fontSize: 12, color: C.vermelho, marginBottom: 10, padding: "8px 12px", background: "#FEECEC", borderRadius: 8 }}>{erroLogin}</div>}
        <button style={{ ...s.btnAmareloFull, marginTop: 12 }} onClick={entrar}>Entrar →</button>
      </div>
    </div>
  );

  // ── HOME ──
  if (tela === "home") return (
    <div style={s.page}>
      <style>{FONTS}</style>
      <ModalSenha />
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: "#FFF8E1", border: `1px solid ${C.amarelo}66`, color: C.amareloEscuro, fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 18, letterSpacing: 2, fontFamily: MONT }}>PLATAFORMA DE TREINAMENTO · IA</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.texto, margin: "0 0 12px", lineHeight: 1.25, fontFamily: MONT }}>Treine com inteligência artificial<br /><span style={{ color: C.amareloEscuro }}>antes de atender de verdade</span></h1>
          <p style={{ fontSize: 13, color: C.suave, lineHeight: 1.8 }}>Dois módulos: quiz técnico VoIP para dominar os conceitos, e simulado com cliente IA para praticar vendas reais.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Treino Técnico */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 16, padding: "32px 28px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.amarelo; e.currentTarget.style.boxShadow = `0 6px 24px ${C.amarelo}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borda; e.currentTarget.style.boxShadow = "none"; }}
            onClick={() => setTela("quiz")}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.azul }} />
            <div style={{ fontSize: 32, marginBottom: 14 }}>🎯</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.texto, fontFamily: MONT, marginBottom: 10 }}>Treino Técnico VoIP</div>
            <div style={{ fontSize: 13, color: C.suave, lineHeight: 1.7, marginBottom: 20 }}>Quiz com questões sobre SIP, PABX Virtual, Tronco SIP, Portabilidade, DDR, URA, QoS, Codecs e mais. Feedback imediato com explicação detalhada.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {["SIP", "PABX", "Portabilidade", "Codecs", "QoS", "DDR", "URA"].map(t => (
                <span key={t} style={s.tag(C.azul)}>{t}</span>
              ))}
            </div>
            <button style={s.btnAmareloFull}>Iniciar quiz →</button>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.claro }}>16 questões · 2 níveis de dificuldade</div>
          </div>

          {/* Simulado IA */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.amarelo}`, borderRadius: 16, padding: "32px 28px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
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
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.claro }}>Conversa livre · Avaliação automática por IA</div>
          </div>
        </div>
      </div>
    </div>
  );

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
      <SimuladoIA vendedor={usuario?.nome} onVoltar={() => setTela("home")} />
    </div>
  );

  // ── HISTÓRICO ──
  if (tela === "historico") {
    const simulados = historico.filter(r => r.tipo === "simulado_ia" && r.nota);
    const quizzes = historico.filter(r => r.tipo === "quiz" && r.nota);
    const mediaSimulados = simulados.length > 0 ? (simulados.reduce((a, b) => a + b.nota, 0) / simulados.length).toFixed(1) : "—";
    const mediaQuiz = quizzes.length > 0 ? (quizzes.reduce((a, b) => a + b.nota, 0) / quizzes.length).toFixed(1) : "—";
    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Nav />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: corNota(parseFloat(mediaSimulados) || 0), fontFamily: MONT }}>{mediaSimulados}</div>
              <div style={{ fontSize: 11, color: C.claro, letterSpacing: 1, fontFamily: MONT }}>MÉDIA SIMULADOS IA</div>
              <div style={{ fontSize: 12, color: C.suave, marginTop: 4 }}>{simulados.length} simulações</div>
            </div>
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: corNota(parseFloat(mediaQuiz) || 0), fontFamily: MONT }}>{mediaQuiz}</div>
              <div style={{ fontSize: 11, color: C.claro, letterSpacing: 1, fontFamily: MONT }}>MÉDIA TREINO TÉCNICO</div>
              <div style={{ fontSize: 12, color: C.suave, marginTop: 4 }}>{quizzes.length} quizzes</div>
            </div>
          </div>
          {loading && <div style={{ textAlign: "center", color: C.suave, padding: 40 }}>Carregando...</div>}
          {historico.map((r, i) => (
            <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={s.tag(r.tipo === "simulado_ia" ? C.amareloEscuro : C.azul)}>
                      {r.tipo === "simulado_ia" ? "SIMULADO IA" : "QUIZ TÉCNICO"}
                    </span>
                    {r.dificuldade && <span style={s.tag(C.suave)}>{r.dificuldade.toUpperCase()}</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: C.texto, fontSize: 13, fontFamily: MONT }}>
                    {r.tipo === "simulado_ia" ? `${r.cenario?.empresa?.nome || ""} · ${r.cenario?.cliente?.nome || ""}` : `Quiz · ${r.topico}`}
                  </div>
                  <div style={{ fontSize: 11, color: C.claro, marginTop: 2 }}>{r.data}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: r.nota ? corNota(r.nota) : C.claro, fontFamily: MONT }}>{r.nota ? r.nota.toFixed ? r.nota.toFixed(1) : r.nota : "—"}</div>
              </div>
            </div>
          ))}
          <button style={{ ...s.btnAmareloFull, marginTop: 16 }} onClick={() => setTela("home")}>← Voltar</button>
        </div>
      </div>
    );
  }

  // ── PAINEL GESTOR ──
  if (tela === "gestor") {
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
    const criterioPiorKey = (() => {
      const totais = {};
      simulados.forEach(r => { if (r.avaliacao?.criterios) Object.entries(r.avaliacao.criterios).forEach(([k, v]) => { totais[k] = (totais[k] || []).concat(v); }); });
      let pior = null, menorMedia = 99;
      Object.entries(totais).forEach(([k, vals]) => { const m = vals.reduce((a, b) => a + b, 0) / vals.length; if (m < menorMedia) { menorMedia = m; pior = k; } });
      return pior;
    })();

    const abrirRelatorio = (nomeVendedor) => {
      setRelatorioVendedor(nomeVendedor);
      setTela("relatorio");
    };

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS}</style>
        <ModalSenha />
        <Topbar usuario={usuario} onHome={() => setTela("home")} onHistorico={() => {}} onGestor={() => {}} onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }} onSair={sair} />
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.texto, fontFamily: MONT }}>Painel do Gestor</div>
              <div style={{ fontSize: 13, color: C.suave }}>{historico.length} registros · {vendedores.length} vendedores ativos</div>
            </div>
            <button style={{ ...s.btnGhost, fontSize: 12 }} onClick={() => { carregarTodos(); }}>↻ Atualizar</button>
          </div>

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "MÉDIA GERAL", value: mediaGeral, cor: corNota(parseFloat(mediaGeral) || 0) },
              { label: "SIMULADOS IA", value: simulados.length, cor: C.azul },
              { label: "TREINOS TÉCNICOS", value: quizzes.length, cor: C.suave },
              { label: "CRITÉRIO MAIS FRACO", value: criterioPiorKey ? criteriosNomes[criterioPiorKey] : "—", cor: C.vermelho },
            ].map((m, i) => (
              <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: i === 3 ? 16 : 26, fontWeight: 800, color: m.cor, fontFamily: MONT, lineHeight: 1.2 }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 6, fontFamily: MONT, fontWeight: 700 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Ranking compacto */}
          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>RANKING DA EQUIPE</div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
            {/* Cabeçalho */}
            <div style={{ display: "grid", gridTemplateColumns: "32px 140px 1fr repeat(6,52px) 70px 100px", gap: 8, padding: "10px 16px", borderBottom: `1.5px solid ${C.borda}`, background: C.fundo }}>
              <div style={{ fontSize: 10, color: C.claro, fontFamily: MONT, fontWeight: 700 }}>#</div>
              <div style={{ fontSize: 10, color: C.claro, fontFamily: MONT, fontWeight: 700 }}>VENDEDOR</div>
              <div />
              {Object.values(criteriosNomes).map(n => (
                <div key={n} style={{ fontSize: 9, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>{n.toUpperCase()}</div>
              ))}
              <div style={{ fontSize: 10, color: C.claro, fontFamily: MONT, fontWeight: 700, textAlign: "center" }}>MÉDIA</div>
              <div />
            </div>
            {loading && <div style={{ padding: 24, color: C.suave, textAlign: "center" }}>Carregando...</div>}
            {!loading && stats.length === 0 && <div style={{ padding: 24, color: C.suave, textAlign: "center" }}>Nenhum resultado ainda.</div>}
            {stats.map((v, i) => (
              <div key={v.vendedor} style={{ display: "grid", gridTemplateColumns: "32px 140px 1fr repeat(6,52px) 70px 100px", gap: 8, padding: "12px 16px", borderBottom: i < stats.length - 1 ? `1px solid ${C.borda}` : "none", alignItems: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? C.amarelo : C.fundo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? C.preto : C.suave, fontFamily: MONT }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.texto, fontFamily: MONT }}>{v.vendedor}</div>
                  <div style={{ fontSize: 10, color: C.claro }}>{v.totalSim}s · {v.totalQz}q</div>
                </div>
                {/* Barra visual da média */}
                <div style={{ height: 6, background: C.fundo, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(v.media / 10) * 100}%`, background: corNota(v.media), borderRadius: 3 }} />
                </div>
                {/* Notas por critério */}
                {Object.keys(criteriosNomes).map(k => {
                  const val = v.criterios[k];
                  return (
                    <div key={k} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: val ? corNota(val) : C.claro, fontFamily: MONT }}>
                      {val ?? "—"}
                    </div>
                  );
                })}
                {/* Média geral */}
                <div style={{ textAlign: "center", fontSize: 20, fontWeight: 900, color: corNota(v.media), fontFamily: MONT }}>{v.media || "—"}</div>
                {/* Botão relatório */}
                <button onClick={() => abrirRelatorio(v.vendedor)} style={{ ...s.btnGhost, fontSize: 11, padding: "5px 10px", color: C.amareloEscuro, borderColor: C.amarelo + "88" }}>
                  Ver relatório →
                </button>
              </div>
            ))}
          </div>

          {/* Últimas atividades */}
          <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, marginBottom: 12, fontWeight: 700, fontFamily: MONT }}>ÚLTIMAS ATIVIDADES</div>
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
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

          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btnAmarelo} onClick={() => setTela("home")}>← Treinamento</button>
            <button style={s.btnGhost} onClick={sair}>Sair</button>
          </div>
        </div>
      </div>
    );
  }

  // ── RELATÓRIO INDIVIDUAL ──
  if (tela === "relatorio" && relatorioVendedor) {
    const nomeV = relatorioVendedor;
    const simsV = historico.filter(r => r.tipo === "simulado_ia" && r.vendedor === nomeV && r.nota);
    const qzsV = historico.filter(r => r.tipo === "quiz" && r.vendedor === nomeV && r.nota);
    const criteriosNomes = { qualificacao: "Qualificação", necessidades: "Descoberta de Necessidades", tecnica: "Conhecimento Técnico", objecoes: "Tratamento de Objeções", fechamento: "Fechamento", comunicacao: "Comunicação" };

    const mediaSim = simsV.length > 0 ? (simsV.reduce((a, b) => a + b.nota, 0) / simsV.length) : 0;
    const mediaQz = qzsV.length > 0 ? (qzsV.reduce((a, b) => a + b.nota, 0) / qzsV.length) : 0;

    // Médias por critério
    const mediaCriterios = {};
    Object.keys(criteriosNomes).forEach(k => {
      const vals = simsV.filter(s => s.avaliacao?.criterios?.[k]).map(s => s.avaliacao.criterios[k]);
      mediaCriterios[k] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    });

    // Todas as recomendações do gestor
    const recomendacoes = simsV.filter(s => s.avaliacao?.recomendacao_gestor).map(s => s.avaliacao.recomendacao_gestor);

    const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    const printStyles = `
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
      }
    `;

    return (
      <div style={{ ...s.page, background: C.fundo }}>
        <style>{FONTS + printStyles}</style>
        <ModalSenha />
        <div className="no-print">
          <Topbar usuario={usuario} onHome={() => setTela("home")} onHistorico={() => {}} onGestor={() => setTela("gestor")} onTrocarSenha={() => { setModalSenha(true); setErroSenha(""); setOkSenha(""); }} onSair={sair} />
        </div>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 24px" }}>

          {/* Ações */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <button style={s.btnGhost} onClick={() => setTela("gestor")}>← Voltar ao Painel</button>
            <button style={s.btnAmarelo} onClick={() => window.print()}>🖨️ Exportar PDF</button>
          </div>

          {/* Cabeçalho do relatório */}
          <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "28px 32px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: C.claro, letterSpacing: 2, fontFamily: MONT, fontWeight: 700, marginBottom: 6 }}>RELATÓRIO SEMANAL DE DESEMPENHO</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.texto, fontFamily: MONT }}>{nomeV}</div>
                <div style={{ fontSize: 13, color: C.suave, marginTop: 4 }}>Gerado em {dataHoje} · {simsV.length} simulados · {qzsV.length} treinos técnicos</div>
              </div>
              <img src={LOGO_URL} alt="VB" style={{ height: 48, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
          </div>

          {/* Cards de resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: corNota(mediaSim), fontFamily: MONT }}>{mediaSim > 0 ? mediaSim.toFixed(1) : "—"}</div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>MÉDIA SIMULADOS IA</div>
              <div style={{ fontSize: 11, color: C.suave, marginTop: 4 }}>{emojiNota(mediaSim)} {mediaSim >= 8 ? "Excelente" : mediaSim >= 6 ? "Bom" : mediaSim > 0 ? "Precisa evoluir" : "Sem dados"}</div>
            </div>
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: corNota(mediaQz), fontFamily: MONT }}>{mediaQz > 0 ? mediaQz.toFixed(1) : "—"}</div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>MÉDIA TREINO TÉCNICO</div>
              <div style={{ fontSize: 11, color: C.suave, marginTop: 4 }}>{qzsV.length} quiz{qzsV.length !== 1 ? "zes" : ""} realizados</div>
            </div>
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.azul, fontFamily: MONT }}>{simsV.length + qzsV.length}</div>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 1, marginTop: 4, fontFamily: MONT, fontWeight: 700 }}>TOTAL DE ATIVIDADES</div>
              <div style={{ fontSize: 11, color: C.suave, marginTop: 4 }}>{simsV.length} simulados + {qzsV.length} treinos</div>
            </div>
          </div>

          {/* Avaliação por critério */}
          {Object.keys(mediaCriterios).some(k => mediaCriterios[k] !== null) && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borda}`, fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT }}>AVALIAÇÃO POR CRITÉRIO — MÉDIA DO PERÍODO</div>
              {Object.entries(criteriosNomes).map(([k, label]) => {
                const val = mediaCriterios[k];
                if (!val) return null;
                return (
                  <div key={k} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borda}`, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1, fontSize: 13, color: C.texto }}>{label}</div>
                    <div style={{ width: 200, height: 8, background: C.fundo, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${val * 10}%`, background: corNota(val), borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: corNota(val), fontFamily: MONT, width: 32, textAlign: "right" }}>{val}</div>
                    <div style={{ fontSize: 11, color: C.suave, width: 80 }}>{val >= 8 ? "✅ Forte" : val >= 6 ? "⚠️ Regular" : "🔴 Fraco"}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Evolução de notas */}
          {simsV.length > 1 && (
            <div style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 14 }}>EVOLUÇÃO — SIMULADOS IA (DO MAIS ANTIGO AO MAIS RECENTE)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
                {[...simsV].reverse().map((sim, i) => {
                  const altura = Math.max(12, (sim.nota / 10) * 80);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                      <div style={{ width: "100%", height: altura, background: corNota(sim.nota), borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
                      <div style={{ fontSize: 9, color: C.claro, textAlign: "center" }}>{sim.data}</div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const primeiro = simsV[simsV.length - 1]?.nota || 0;
                const ultimo = simsV[0]?.nota || 0;
                const delta = ultimo - primeiro;
                return (
                  <div style={{ marginTop: 10, fontSize: 12, color: delta >= 0 ? C.verde : C.vermelho, fontWeight: 700 }}>
                    {delta >= 0 ? `↑ Evolução de +${delta.toFixed(1)} pontos no período` : `↓ Queda de ${Math.abs(delta).toFixed(1)} pontos no período`}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Análise detalhada de cada simulado */}
          {simsV.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: C.claro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 12 }}>ANÁLISE DETALHADA DAS CONVERSAS</div>
              {simsV.map((sim, i) => (
                <div key={i} style={{ background: C.branco, border: `1.5px solid ${C.borda}`, borderRadius: 14, padding: "20px 22px", marginBottom: 14 }}>
                  {/* Header do simulado */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.texto, fontFamily: MONT }}>{sim.cenario?.empresa?.nome} · {sim.cenario?.cliente?.nome}</div>
                      <div style={{ fontSize: 12, color: C.suave, marginTop: 2 }}>{sim.cenario?.cliente?.cargo} · {sim.cenario?.empresa?.cidade} · {sim.data}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <span style={{ ...s.tag(C.suave), fontSize: 10 }}>{sim.dificuldade?.toUpperCase()}</span>
                        {sim.avaliacao?.encerramento && (
                          <span style={{ ...s.tag(sim.avaliacao.encerramento === "venda_fechada" ? C.verde : sim.avaliacao.encerramento === "recusa" ? C.vermelho : C.azul), fontSize: 10 }}>
                            {sim.avaliacao.encerramento.replace("_", " ").toUpperCase()}
                          </span>
                        )}
                        <span style={{ ...s.tag(C.suave), fontSize: 10 }}>{sim.mensagens?.filter(m => m.role === "vendedor").length || 0} MSG</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: corNota(sim.nota), fontFamily: MONT }}>{sim.nota.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: C.claro }}>nota final</div>
                    </div>
                  </div>

                  {/* Critérios deste simulado */}
                  {sim.avaliacao?.criterios && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {Object.entries(sim.avaliacao.criterios).map(([k, val]) => (
                        <div key={k} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: corNota(val) + "18", color: corNota(val), fontFamily: MONT, fontWeight: 700 }}>
                          {criteriosNomes[k]?.split(" ")[0]} {val}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Penalizações e bônus */}
                  {sim.avaliacao?.penalizacoes?.length > 0 && (
                    <div style={{ background: "#FEECEC", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.vermelho, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>⚠️ PENALIZAÇÕES APLICADAS</div>
                      {sim.avaliacao.penalizacoes.map((p, j) => <div key={j} style={{ fontSize: 12, color: C.vermelho }}>· {p}</div>)}
                    </div>
                  )}
                  {sim.avaliacao?.bonus?.length > 0 && (
                    <div style={{ background: "#EAFAF1", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
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
                    <div style={{ background: "#FFF8E1", border: `1px solid ${C.amarelo}44`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 10, color: C.amareloEscuro, fontWeight: 700, fontFamily: MONT, marginBottom: 4 }}>💡 AÇÃO RECOMENDADA PARA O GESTOR</div>
                      <div style={{ fontSize: 12, color: C.texto, lineHeight: 1.6 }}>{sim.avaliacao.recomendacao_gestor}</div>
                    </div>
                  )}

                  {/* Transcrição da conversa */}
                  {sim.mensagens && sim.mensagens.length > 0 && (
                    <details style={{ marginTop: 14 }}>
                      <summary style={{ fontSize: 12, color: C.azul, cursor: "pointer", fontWeight: 700, fontFamily: MONT }}>Ver transcrição completa ({sim.mensagens.length} mensagens)</summary>
                      <div style={{ marginTop: 10, maxHeight: 300, overflowY: "auto", border: `1px solid ${C.borda}`, borderRadius: 8, padding: 12, background: C.fundo }}>
                        {sim.mensagens.map((m, j) => (
                          <div key={j} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: m.role === "vendedor" ? C.azul : C.suave, fontFamily: MONT, flexShrink: 0, width: 64, paddingTop: 2 }}>
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
            <div style={{ background: C.branco, border: `2px solid ${C.amarelo}`, borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: C.amareloEscuro, letterSpacing: 2, fontWeight: 700, fontFamily: MONT, marginBottom: 14 }}>📋 PLANO DE AÇÃO — REUNIÃO SEMANAL</div>
              {recomendacoes.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.amarelo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.preto, flexShrink: 0, fontFamily: MONT }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: C.texto, lineHeight: 1.6 }}>{r}</div>
                </div>
              ))}
            </div>
          )}

          {/* Rodapé impressão */}
          <div style={{ textAlign: "center", fontSize: 11, color: C.claro, paddingTop: 16, borderTop: `1px solid ${C.borda}` }}>
            VoIP do Brasil · Plataforma de Treinamento Comercial · {dataHoje}
          </div>

          <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button style={s.btnGhost} onClick={() => setTela("gestor")}>← Voltar ao Painel</button>
            <button style={s.btnAmarelo} onClick={() => window.print()}>🖨️ Exportar PDF</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
