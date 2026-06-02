import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6u17wV9YQHahTjlOwdZL-qmu5qETQ0dQ",
  authDomain: "indicadores-comerciais.firebaseapp.com",
  projectId: "indicadores-comerciais",
  storageBucket: "indicadores-comerciais.firebasestorage.app",
  messagingSenderId: "48304540169",
  appId: "1:48304540169:web:ff03da98167fe7166486d8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── USUARIOS ──────────────────────────────────────────────
export const ADMINS = [
  { nome: "John", senha: "VB2026#@", perfil: "admin" },
  { nome: "David", senha: "VB2026#@", perfil: "admin" },
  { nome: "Patrick", senha: "VB2026#@", perfil: "admin" },
];

export const VENDEDORES_AUTH = [
  { nome: "Analu", senha: "VB2026#@!%", time: "PC", perfil: "vendedor" },
  { nome: "Thais", senha: "VB2026#@$&", time: "PC", perfil: "vendedor" },
  { nome: "Tamires", senha: "VB2026#@*^", time: "PC", perfil: "vendedor" },
  { nome: "Carlos", senha: "VB2026#@=+", time: "MG", perfil: "vendedor" },
  { nome: "Edson", senha: "VB2026#@?>", time: "MG", perfil: "vendedor" },
  { nome: "Izabel", senha: "VB2026#@~<", time: "MG", perfil: "vendedor" },
];

export const TIME_PC = ["Analu", "Thais", "Tamires"];
export const TIME_MG = ["Carlos", "Edson", "Izabel", "John"];
export const VALOR_MIN_MG = 200;

// ── FIRESTORE HELPERS ─────────────────────────────────────

// Salvar lançamento por item
export async function salvarItem(item) {
  const semana = Math.ceil(new Date().getDate() / 7);
  await addDoc(collection(db, "itens_lancamento"), {
    ...item,
    semana,
    dataCriacao: new Date(),
    status: "pendente",
  });
}

// Buscar lançamentos por mês/ano
export async function getLancamentos(mes, ano) {
  const q = query(
    collection(db, "itens_lancamento"),
    where("mes", "==", mes),
    where("ano", "==", ano)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Buscar lançamentos pendentes
export async function getPendentes() {
  const q = query(
    collection(db, "itens_lancamento"),
    where("status", "==", "pendente")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Aprovar/rejeitar
export async function atualizarStatus(id, status, comentario, adminNome) {
  await updateDoc(doc(db, "itens_lancamento", id), {
    status,
    comentario: comentario || "",
    revisadoPor: adminNome,
    revisadoEm: new Date(),
  });
  // Log
  await addDoc(collection(db, "logs"), {
    usuario: adminNome,
    acao: `${status === "aprovado" ? "Aprovou" : "Rejeitou"} lançamento`,
    data: new Date(),
    comentario: comentario || "",
  });
}

// Salvar lançamento consolidado do mês (totais)
export async function salvarLancamentoMes(vendedorNome, mes, ano, dados, adminNome) {
  const id = `${vendedorNome}_${mes}_${ano}`;
  await setDoc(doc(db, "lancamentos", id), {
    ...dados,
    vendedorNome,
    mes,
    ano,
    atualizadoEm: new Date(),
    atualizadoPor: adminNome || vendedorNome,
  }, { merge: true });
  // Log
  if (adminNome) {
    await addDoc(collection(db, "logs"), {
      usuario: adminNome,
      acao: `Editou lançamento de ${vendedorNome} (${mes}/${ano})`,
      data: new Date(),
    });
  }
}

// Buscar config/metas
export async function getMetas() {
  const snap = await getDoc(doc(db, "config", "metas"));
  return snap.exists() ? snap.data() : {
    metaAnual: 140000, metaConversao: 25, comissaoBase: 25,
    bonusAnualMinimo: 40, penalidadeSemestralMinimo: 15,
    penalidadeAnualMinimo: 20, semVendaLimite: 200,
  };
}

// Salvar config/metas
export async function salvarMetas(dados) {
  await setDoc(doc(db, "config", "metas"), dados, { merge: true });
}
