import { useState, useMemo, useEffect } from "react";
import { db, ADMINS, VENDEDORES_AUTH, TIME_PC, TIME_MG, VALOR_MIN_MG, salvarItem, getLancamentos, getPendentes, atualizarStatus, salvarLancamentoMes, getMetas, salvarMetas } from "./firebase.js";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart } from "recharts";
import { LayoutDashboard, Users, Settings, LogOut, TrendingUp, TrendingDown, Star, Menu, Plus, UserX, UserCheck, X, Save, Edit3, FileText, Check, Lock, Download, FileSpreadsheet, Crown, Activity, Target, PhoneCall, Phone, Calendar, AlertCircle, ClipboardCheck, Pencil, ThumbsUp, ThumbsDown, MessageSquare, Bell } from "lucide-react";

const C = {
  bg:"#F0F4FF", white:"#FFFFFF", blue:"#0057FF", blueDark:"#003DB5",
  blueLight:"#EEF3FF", blueMid:"#DDEAFF", cyan:"#00AAEE", cyanLight:"#E0F6FF",
  green:"#00A86B", greenLight:"#E6F9F1", red:"#E53E3E", redLight:"#FFF0F0",
  yellow:"#D4920A", yellowLight:"#FEF9E7", orange:"#E8650A", orangeLight:"#FEF2EB",
  purple:"#6B3FA0", purpleLight:"#F3EEFF",
  textPrimary:"#0A1628", textSecondary:"#5A6A85", textMuted:"#9AAFC5",
  border:"#E2E8F0", borderBlue:"rgba(0,87,255,0.15)",
  shadow:"0 2px 12px rgba(0,87,255,0.06)", shadowMd:"0 4px 20px rgba(0,87,255,0.10)",
  gradBlue:"linear-gradient(135deg,#0057FF,#00AAEE)",
  gradGreen:"linear-gradient(135deg,#00A86B,#00D4A0)",
  gradRed:"linear-gradient(135deg,#E53E3E,#FF7070)",
  gradYellow:"linear-gradient(135deg,#D4920A,#F5C518)",
  gradPurple:"linear-gradient(135deg,#6B3FA0,#9B6FD0)",
  gradCyan:"linear-gradient(135deg,#00AAEE,#00D4FF)",
};

const fmt = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const fmtS = v => v>=1000?`R$${(v/1000).toFixed(1)}k`:fmt(v);
const pct = (a,b) => b>0?parseFloat(((a/b)*100).toFixed(1)):0;


// Lançamentos pendentes de aprovação (simulado)
const lancamentosPendentes = [
  {id:1,vendedor:"Thais",time:"PC",tipo:"Venda",cliente:"Empresa Solar",valor:2287.96,data:"22/05/2026",status:"pendente"},
  {id:2,vendedor:"Edson",time:"MG",tipo:"Venda",cliente:"Tech Group",valor:1994.46,data:"21/05/2026",status:"pendente"},
  {id:3,vendedor:"Analu",time:"PC",tipo:"Upsell",cliente:"Grupo Alpha",valor:572.36,data:"20/05/2026",status:"pendente"},
  {id:4,vendedor:"Carlos",time:"MG",tipo:"Cancelamento",cliente:"Beta Corp",valor:978.60,data:"19/05/2026",status:"pendente"},
  {id:5,vendedor:"Tamires",time:"PC",tipo:"Venda",cliente:"Nova Sistemas",valor:1745.15,data:"18/05/2026",status:"aprovado"},
  {id:6,vendedor:"Izabel",time:"MG",tipo:"Venda",cliente:"Rio Telecom",valor:887.53,data:"17/05/2026",status:"aprovado"},
];

const allData={
  Jan:{rows:[
    {nome:"John",leads:4,chamEf:0,chamRec:0,reunioes:2,contratos:4,valor:6599.95,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Analu",leads:9,chamEf:71,chamRec:34,reunioes:3,contratos:3,valor:645.59,upsell:7,vUpsell:312.38,cancelados:3,vCancel:364.99},
    {nome:"Carlos",leads:34,chamEf:152,chamRec:13,reunioes:5,contratos:5,valor:1014.57,upsell:1,vUpsell:34.99,cancelados:1,vCancel:199.99},
    {nome:"Edson",leads:34,chamEf:89,chamRec:4,reunioes:6,contratos:13,valor:5057.93,upsell:5,vUpsell:332.98,cancelados:0,vCancel:0},
    {nome:"Izabel",leads:32,chamEf:122,chamRec:9,reunioes:4,contratos:6,valor:2998.95,upsell:2,vUpsell:83.97,cancelados:0,vCancel:0},
    {nome:"Tamires",leads:9,chamEf:110,chamRec:43,reunioes:3,contratos:8,valor:796.60,upsell:5,vUpsell:210.43,cancelados:1,vCancel:98.30},
    {nome:"Thais",leads:6,chamEf:158,chamRec:31,reunioes:4,contratos:8,valor:520.47,upsell:1,vUpsell:8.25,cancelados:0,vCancel:0},
  ]},
  Fev:{rows:[
    {nome:"John",leads:2,chamEf:0,chamRec:0,reunioes:1,contratos:2,valor:1698.99,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Analu",leads:5,chamEf:59,chamRec:30,reunioes:4,contratos:9,valor:2319.43,upsell:4,vUpsell:424.97,cancelados:7,vCancel:979.79},
    {nome:"Carlos",leads:28,chamEf:127,chamRec:12,reunioes:3,contratos:2,valor:545.84,upsell:2,vUpsell:40.99,cancelados:3,vCancel:913.89},
    {nome:"Edson",leads:27,chamEf:86,chamRec:2,reunioes:5,contratos:10,valor:5604.90,upsell:5,vUpsell:332.80,cancelados:3,vCancel:397.26},
    {nome:"Izabel",leads:28,chamEf:136,chamRec:6,reunioes:3,contratos:9,valor:3375.82,upsell:2,vUpsell:109.97,cancelados:2,vCancel:169.99},
    {nome:"Thais",leads:4,chamEf:124,chamRec:32,reunioes:5,contratos:13,valor:1597.16,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Tamires",leads:4,chamEf:160,chamRec:58,reunioes:6,contratos:14,valor:1050.12,upsell:10,vUpsell:691.97,cancelados:2,vCancel:546.97},
  ]},
  Mar:{rows:[
    {nome:"John",leads:0,chamEf:0,chamRec:0,reunioes:0,contratos:0,valor:0,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Analu",leads:11,chamEf:110,chamRec:38,reunioes:5,contratos:12,valor:3175.92,upsell:9,vUpsell:911.91,cancelados:6,vCancel:585.60},
    {nome:"Carlos",leads:44,chamEf:80,chamRec:20,reunioes:4,contratos:4,valor:1086.95,upsell:2,vUpsell:207.00,cancelados:1,vCancel:699.99},
    {nome:"Edson",leads:43,chamEf:141,chamRec:4,reunioes:7,contratos:7,valor:3531.93,upsell:3,vUpsell:195.39,cancelados:0,vCancel:0},
    {nome:"Izabel",leads:27,chamEf:108,chamRec:10,reunioes:3,contratos:4,valor:2779.96,upsell:3,vUpsell:231.94,cancelados:2,vCancel:783.84},
    {nome:"Tamires",leads:11,chamEf:141,chamRec:66,reunioes:5,contratos:19,valor:1579.79,upsell:3,vUpsell:39.39,cancelados:2,vCancel:246.76},
    {nome:"Thais",leads:12,chamEf:100,chamRec:31,reunioes:6,contratos:11,valor:1018.42,upsell:4,vUpsell:168.00,cancelados:0,vCancel:0},
  ]},
  Abr:{rows:[
    {nome:"John",leads:0,chamEf:0,chamRec:0,reunioes:0,contratos:2,valor:1699.98,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Analu",leads:9,chamEf:32,chamRec:43,reunioes:6,contratos:18,valor:5645.18,upsell:8,vUpsell:547.94,cancelados:7,vCancel:994.16},
    {nome:"Carlos",leads:17,chamEf:82,chamRec:1,reunioes:3,contratos:4,valor:1788.79,upsell:6,vUpsell:1457.76,cancelados:0,vCancel:0},
    {nome:"Edson",leads:26,chamEf:162,chamRec:2,reunioes:5,contratos:7,valor:5350.96,upsell:0,vUpsell:0,cancelados:1,vCancel:242.66},
    {nome:"Izabel",leads:26,chamEf:144,chamRec:2,reunioes:2,contratos:1,valor:269.99,upsell:6,vUpsell:1332.90,cancelados:0,vCancel:0},
    {nome:"Thais",leads:9,chamEf:146,chamRec:44,reunioes:7,contratos:12,valor:1233.84,upsell:6,vUpsell:240.89,cancelados:0,vCancel:0},
    {nome:"Tamires",leads:9,chamEf:81,chamRec:44,reunioes:4,contratos:15,valor:7876.81,upsell:1,vUpsell:12.99,cancelados:2,vCancel:422.99},
  ]},
  Mai:{rows:[
    {nome:"John",leads:0,chamEf:0,chamRec:0,reunioes:0,contratos:0,valor:0,upsell:0,vUpsell:0,cancelados:0,vCancel:0},
    {nome:"Analu",leads:1,chamEf:0,chamRec:0,reunioes:2,contratos:5,valor:1184.96,upsell:6,vUpsell:572.36,cancelados:4,vCancel:929.78},
    {nome:"Carlos",leads:9,chamEf:0,chamRec:0,reunioes:1,contratos:0,valor:0,upsell:3,vUpsell:396.97,cancelados:2,vCancel:978.60},
    {nome:"Edson",leads:13,chamEf:0,chamRec:0,reunioes:3,contratos:6,valor:1994.46,upsell:3,vUpsell:147.99,cancelados:0,vCancel:0},
    {nome:"Izabel",leads:13,chamEf:0,chamRec:0,reunioes:2,contratos:3,valor:887.53,upsell:5,vUpsell:86.32,cancelados:1,vCancel:214.92},
    {nome:"Thais",leads:1,chamEf:0,chamRec:0,reunioes:4,contratos:11,valor:2287.96,upsell:2,vUpsell:104.94,cancelados:2,vCancel:449.50},
    {nome:"Tamires",leads:2,chamEf:0,chamRec:0,reunioes:3,contratos:10,valor:1745.15,upsell:4,vUpsell:271.47,cancelados:2,vCancel:260.96},
  ]},
  Jun:{rows:[]},Jul:{rows:[]},Ago:{rows:[]},Set:{rows:[]},Out:{rows:[]},Nov:{rows:[]},Dez:{rows:[]}
};

const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const getAcum=(nomes,s,e)=>{
  let val=0,leads=0,contratos=0,cancel=0,vCancel=0,upsell=0,vUpsell=0,reunioes=0,chamEf=0,chamRec=0;
  meses.slice(s,e+1).forEach(m=>(allData[m]?.rows||[]).filter(r=>nomes.includes(r.nome)).forEach(r=>{
    val+=r.valor;leads+=r.leads;contratos+=r.contratos;cancel+=r.cancelados;
    vCancel+=r.vCancel;upsell+=r.upsell;vUpsell+=r.vUpsell;reunioes+=r.reunioes;chamEf+=r.chamEf;chamRec+=r.chamRec;
  }));
  return {val,leads,contratos,cancel,vCancel,upsell,vUpsell,reunioes,chamEf,chamRec,conv:pct(contratos,leads)};
};

const monthlyChart=meses.map(m=>{
  const rows=allData[m]?.rows||[];
  const pc=rows.filter(r=>TIME_PC.includes(r.nome));
  const mg=rows.filter(r=>TIME_MG.includes(r.nome));
  const lPC=pc.reduce((s,r)=>s+r.leads,0),cPC=pc.reduce((s,r)=>s+r.contratos,0);
  const lMG=mg.reduce((s,r)=>s+r.leads,0),cMG=mg.reduce((s,r)=>s+r.contratos,0);
  return {mes:m,total:rows.reduce((s,r)=>s+r.valor,0),meta:11667,
    pc:pc.reduce((s,r)=>s+r.valor,0),mg:mg.reduce((s,r)=>s+r.valor,0),
    convPC:pct(cPC,lPC),convMG:pct(cMG,lMG)};
});

const totalAnual=monthlyChart.reduce((s,m)=>s+m.total,0);
const metaAnual=140000;
const pctMeta=pct(totalAnual,metaAnual).toFixed(1);
const anAll=getAcum([...TIME_PC,...TIME_MG],0,11);

// ── MICRO COMPONENTS ──────────────────────────────────────

const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",boxShadow:C.shadowMd,fontSize:12}}>
    <p style={{color:C.blue,fontWeight:700,margin:"0 0 4px",fontFamily:"Exo 2"}}>{label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.color,margin:"2px 0"}}>{p.name}: {typeof p.value==="number"&&p.value>200?fmt(p.value):p.value}{p.name?.includes("Conv")||p.name==="Meta"?"%":""}</p>)}
  </div>;
};

const Badge=({val})=>{
  const n=Number(val);
  const [c,bg]=n>=25?[C.green,C.greenLight]:n>=15?[C.yellow,C.yellowLight]:[C.red,C.redLight];
  return <span style={{background:bg,color:c,borderRadius:5,padding:"2px 8px",fontWeight:700,fontSize:11}}>{val}%</span>;
};

const Spark=({data,color,h=40})=>(
  <ResponsiveContainer width="100%" height={h}>
    <AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}>
      <defs><linearGradient id={`sg${color.replace(/[^a-z0-9]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.25}/><stop offset="95%" stopColor={color} stopOpacity={0}/>
      </linearGradient></defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg${color.replace(/[^a-z0-9]/gi,"")})`} dot={false} animationDuration={800}/>
    </AreaChart>
  </ResponsiveContainer>
);

const MiniBar=({data,color,h=40,refLine})=>(
  <ResponsiveContainer width="100%" height={h}>
    <ComposedChart data={data} margin={{top:2,right:0,bottom:0,left:0}}>
      <Bar dataKey="v" fill={color} radius={[2,2,0,0]} opacity={0.85}/>
      {refLine&&<Line dataKey={()=>refLine} stroke={C.red} strokeWidth={1.5} strokeDasharray="4 3" dot={false}/>}
    </ComposedChart>
  </ResponsiveContainer>
);

function GaugeMini({val,max,color,size=56}){
  const r=size*0.42,cx=size/2,cy=size/2;
  const toR=d=>(d*Math.PI)/180;
  const arc=(s,e)=>{
    const x1=cx+r*Math.cos(toR(s)),y1=cy+r*Math.sin(toR(s));
    const x2=cx+r*Math.cos(toR(e)),y2=cy+r*Math.sin(toR(e));
    return `M${x1},${y1}A${r},${r},0,${e-s>180?1:0},1,${x2},${y2}`;
  };
  const p=Math.min((val/max)*100,100);
  const endAng=-135+(p/100)*270;
  return <svg width={size} height={size*0.75} viewBox={`0 0 ${size} ${size*0.75}`}>
    <path d={arc(-135,135)} fill="none" stroke={C.blueLight} strokeWidth={size*0.1} strokeLinecap="round"/>
    <path d={arc(-135,endAng)} fill="none" stroke={color} strokeWidth={size*0.1} strokeLinecap="round"/>
  </svg>;
}

function ProgressBar({val,max,color,h=6}){
  return <div style={{height:h,borderRadius:h,background:C.border,overflow:"hidden"}}>
    <div style={{height:"100%",borderRadius:h,background:color,width:`${Math.min((val/max)*100,100)}%`,transition:"width 0.8s ease"}}/>
  </div>;
}

function exportCSV(mes){
  const rows=allData[mes]?.rows||[];
  const h="Vendedor,Time,Leads,Ch.Efetuadas,Ch.Recebidas,Reunioes,Contratos,Valor Ganho,Upsell,Valor Upsell,Cancelados,Valor Cancelado,Conversao%\n";
  const b=rows.map(r=>`${r.nome},${TIME_PC.includes(r.nome)?"PC":"MG"},${r.leads},${r.chamEf},${r.chamRec},${r.reunioes},${r.contratos},${r.valor},${r.upsell},${r.vUpsell},${r.cancelados},${r.vCancel},${pct(r.contratos,r.leads)}`).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([h+b],{type:"text/csv"}));a.download=`VB_${mes}_2026.csv`;a.click();
}
function exportPDF(mes){
  const rows=allData[mes]?.rows||[];
  const w=window.open("","_blank");
  w.document.write(`<html><head><style>*{font-family:Arial}body{padding:28px;color:#0A1628}h1{color:#0057FF;font-size:20px;border-bottom:2px solid #0057FF;padding-bottom:8px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#EEF3FF;color:#0057FF;padding:9px 12px;font-size:11px;text-align:left;text-transform:uppercase}td{padding:9px 12px;border-bottom:1px solid #E2E8F0;font-size:13px}.foot{margin-top:20px;font-size:10px;color:#9AAFC5}</style></head><body><h1>Voip do Brasil — ${mes}/2026</h1><table><tr><th>Vendedor</th><th>Time</th><th>Leads</th><th>Contratos</th><th>Valor Ganho</th><th>Upsell</th><th>Cancelados</th><th>Conversão</th></tr>${rows.map(r=>`<tr><td>${r.nome}</td><td>${TIME_PC.includes(r.nome)?"Pequenas":"Méd/Grandes"}</td><td>${r.leads}</td><td>${r.contratos}</td><td>R$ ${r.valor.toFixed(2)}</td><td>${r.upsell}</td><td>${r.cancelados}</td><td>${pct(r.contratos,r.leads)}%</td></tr>`).join("")}</table><p class="foot">Gerado em ${new Date().toLocaleDateString("pt-BR")} · Sistema Comercial VB</p></body></html>`);
  w.document.close();w.print();
}

// ── CARD WRAPPER ──────────────────────────────────────────
const Card=({children,style={}})=>(
  <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:C.shadow,...style}}>
    {children}
  </div>
);

const CardHeader=({grad,icon,label})=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
    <span style={{fontSize:11,color:C.textSecondary,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>{label}</span>
    <div style={{width:26,height:26,borderRadius:7,background:grad,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
  </div>
);

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard(){
  const [mes,setMes]=useState("Mai");
  const rows=allData[mes]?.rows||[];
  const tot={val:rows.reduce((s,r)=>s+r.valor,0),leads:rows.reduce((s,r)=>s+r.leads,0),contratos:rows.reduce((s,r)=>s+r.contratos,0),upsell:rows.reduce((s,r)=>s+r.upsell,0),vUpsell:rows.reduce((s,r)=>s+r.vUpsell,0),cancel:rows.reduce((s,r)=>s+r.cancelados,0),vCancel:rows.reduce((s,r)=>s+r.vCancel,0),chamEf:rows.reduce((s,r)=>s+r.chamEf,0),chamRec:rows.reduce((s,r)=>s+r.chamRec,0),reu:rows.reduce((s,r)=>s+r.reunioes,0)};
  const topPC=rows.filter(r=>TIME_PC.includes(r.nome)).sort((a,b)=>b.valor-a.valor)[0]||{nome:"—",valor:0};
  const topMG=rows.filter(r=>TIME_MG.includes(r.nome)).sort((a,b)=>b.valor-a.valor)[0]||{nome:"—",valor:0};
  const sparkData=monthlyChart.filter(m=>m.total>0).map(m=>({v:m.total}));
  const convSparkPC=monthlyChart.filter(m=>m.convPC>0).map(m=>({v:m.convPC}));
  const convSparkMG=monthlyChart.filter(m=>m.convMG>0).map(m=>({v:m.convMG}));

  const rankPC=[...TIME_PC].map(n=>{const a=getAcum([n],0,11);return{nome:n,...a};}).sort((a,b)=>b.val-a.val);
  const rankMG=[...TIME_MG].map(n=>{const a=getAcum([n],0,11);return{nome:n,...a};}).sort((a,b)=>b.val-a.val);
  const cancelAcum=[...TIME_PC,...TIME_MG].map(n=>{const a=getAcum([n],0,11);return{nome:n,tot:a.vCancel,qtd:a.cancel};}).sort((a,b)=>b.tot-a.tot);

  const periodos=[...TIME_PC,...TIME_MG].map(nome=>({nome,
    q1:getAcum([nome],0,2),q2:getAcum([nome],3,5),
    q3:getAcum([nome],6,8),q4:getAcum([nome],9,11),
    s1:getAcum([nome],0,5),s2:getAcum([nome],6,11),
    an:getAcum([nome],0,11),isLider:nome==="John"
  }));

  return <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14}}>

    {/* ── REALIZADO DO MÊS — destaque no topo ── */}
    <div style={{gridColumn:"span 5",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,borderRadius:16,padding:"18px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:C.shadowMd,marginBottom:0}}>
      <div>
        <p style={{margin:"0 0 4px",fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Realizado em {meses[new Date().getMonth()]} / 2026</p>
        <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:32,margin:"0 0 2px",color:"#fff"}}>{fmt(monthlyChart[new Date().getMonth()].total)}</p>
        <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.75)"}}>Meta do mês: {fmt(11667)} · <span style={{color:"#fff",fontWeight:700}}>{pct(monthlyChart[new Date().getMonth()].total,11667).toFixed(1)}% atingido</span></p>
      </div>
      <div style={{display:"flex",gap:24,alignItems:"center"}}>
        <div style={{textAlign:"center"}}>
          <p style={{margin:"0 0 2px",fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",fontWeight:700}}>PC</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,margin:0,color:"#fff"}}>{fmt(monthlyChart[new Date().getMonth()].pc)}</p>
        </div>
        <div style={{width:1,height:40,background:"rgba(255,255,255,0.2)"}}/>
        <div style={{textAlign:"center"}}>
          <p style={{margin:"0 0 2px",fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",fontWeight:700}}>MG</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,margin:0,color:"#fff"}}>{fmt(monthlyChart[new Date().getMonth()].mg)}</p>
        </div>
        <div style={{width:1,height:40,background:"rgba(255,255,255,0.2)"}}/>
        <div style={{textAlign:"center"}}>
          <p style={{margin:"0 0 2px",fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",fontWeight:700}}>Pendentes</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,margin:0,color:C.yellow}}>{lancamentosPendentes.filter(l=>l.status==="pendente").length}</p>
        </div>
      </div>
    </div>

    {/* ── ROW 1: 4 KPI GRANDES ── */}
    {/* Meta Anual — velocímetro moderno */}
    <Card style={{padding:18,gridColumn:"span 1"}}>
      <CardHeader grad={C.gradBlue} icon={<Target size={13} color="#fff"/>} label="Meta Anual 2026"/>
      {(()=>{
        const mesesRestantes = 12 - new Date().getMonth();
        const falta = Math.max(0, metaAnual - totalAnual);
        const mediaNecessaria = mesesRestantes > 0 ? falta / mesesRestantes : 0;
        const col = parseFloat(pctMeta)>=100?C.green:parseFloat(pctMeta)>=70?C.yellow:C.blue;
        return <>
          {/* Velocímetro SVG moderno */}
          <svg width="100%" viewBox="0 0 160 100" style={{display:"block",margin:"0 auto 4px"}}>
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={C.red}/>
                <stop offset="50%" stopColor={C.yellow}/>
                <stop offset="100%" stopColor={C.green}/>
              </linearGradient>
            </defs>
            {/* Track */}
            <path d="M 20 85 A 60 60 0 0 1 140 85" fill="none" stroke={C.border} strokeWidth="12" strokeLinecap="round"/>
            {/* Progress */}
            <path d="M 20 85 A 60 60 0 0 1 140 85" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${Math.min(parseFloat(pctMeta)/100,1)*188} 188`}/>
            {/* Needle */}
            {(()=>{
              const ang = -180 + (Math.min(parseFloat(pctMeta),100)/100)*180;
              const rad = ang * Math.PI / 180;
              const nx = 80 + 48*Math.cos(rad), ny = 85 + 48*Math.sin(rad);
              return <line x1="80" y1="85" x2={nx} y2={ny} stroke={col} strokeWidth="2.5" strokeLinecap="round"/>;
            })()}
            <circle cx="80" cy="85" r="5" fill={col}/>
            <text x="80" y="72" textAnchor="middle" fill={col} fontSize="18" fontWeight="800" fontFamily="Exo 2">{pctMeta}%</text>
            <text x="22" y="98" fill={C.textMuted} fontSize="8">0%</text>
            <text x="132" y="98" fill={C.textMuted} fontSize="8">100%</text>
          </svg>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:18,margin:"0 0 1px",color:C.textPrimary}}>{fmt(totalAnual)}</p>
          <p style={{margin:"0 0 6px",fontSize:11,color:C.textSecondary}}>de {fmt(metaAnual)}</p>
          <ProgressBar val={totalAnual} max={metaAnual} color={col} h={5}/>
          <div style={{background:C.blueLight,borderRadius:8,padding:"8px 10px",marginTop:8}}>
            <p style={{margin:"0 0 2px",fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase"}}>Falta para meta</p>
            <p style={{margin:"0 0 4px",fontFamily:"Exo 2",fontWeight:800,fontSize:15,color:C.red}}>{fmt(falta)}</p>
            <p style={{margin:0,fontSize:10,color:C.textSecondary}}>Média mensal necessária</p>
            <p style={{margin:0,fontFamily:"Exo 2",fontWeight:700,fontSize:13,color:C.blue}}>{fmt(mediaNecessaria)}/mês</p>
          </div>
        </>;
      })()}
    </Card>

    {/* Receita */}
    <Card style={{padding:18}}>
      <CardHeader grad={C.gradGreen} icon={<TrendingUp size={13} color="#fff"/>} label="Receita Jan–Mai"/>
      <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 2px",color:C.textPrimary}}>{fmt(totalAnual)}</p>
      <p style={{margin:"0 0 8px",fontSize:12,color:C.textSecondary}}>Upsell: <span style={{color:C.cyan,fontWeight:700}}>{fmt(anAll.vUpsell)}</span></p>
      <Spark data={sparkData} color={C.green}/>
    </Card>

    {/* Leads x Convertidos PC */}
    <Card style={{padding:18,borderTop:`3px solid ${C.green}`}}>
      <CardHeader grad={C.gradGreen} icon={<Activity size={13} color="#fff"/>} label="Leads × Convertidos — PC"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",marginBottom:12,alignItems:"center"}}>
        <div style={{textAlign:"center",padding:"0 8px"}}>
          <p style={{margin:"0 0 3px",fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Recebidos</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:28,margin:"0 0 2px",color:C.textPrimary,lineHeight:1}}>{getAcum(TIME_PC,0,11).leads}</p>
          <p style={{margin:0,fontSize:10,color:C.textMuted}}>leads</p>
        </div>
        <div style={{background:C.border,alignSelf:"stretch"}}/>
        <div style={{textAlign:"center",padding:"0 8px"}}>
          <p style={{margin:"0 0 3px",fontSize:10,color:C.green,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Convertidos</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:28,margin:"0 0 2px",color:C.green,lineHeight:1}}>{getAcum(TIME_PC,0,11).contratos}</p>
          <p style={{margin:0,fontSize:10,color:C.textMuted}}>contratos</p>
        </div>
      </div>
      <ProgressBar val={getAcum(TIME_PC,0,11).contratos} max={Math.max(getAcum(TIME_PC,0,11).leads,1)} color={C.green} h={7}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        <span style={{fontSize:10,color:C.textMuted}}>Taxa de conversão</span>
        <span style={{fontSize:13,fontWeight:800,color:getAcum(TIME_PC,0,11).conv>=25?C.green:C.red}}>{getAcum(TIME_PC,0,11).conv.toFixed(1)}% {getAcum(TIME_PC,0,11).conv>=25?"✓":"✗"}</span>
      </div>
    </Card>

    {/* Leads x Convertidos MG */}
    <Card style={{padding:18,borderTop:`3px solid ${C.blue}`}}>
      <CardHeader grad={C.gradBlue} icon={<Activity size={13} color="#fff"/>} label="Leads × Convertidos — MG"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",marginBottom:12,alignItems:"center"}}>
        <div style={{textAlign:"center",padding:"0 8px"}}>
          <p style={{margin:"0 0 3px",fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Recebidos</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:28,margin:"0 0 2px",color:C.textPrimary,lineHeight:1}}>{getAcum(TIME_MG,0,11).leads}</p>
          <p style={{margin:0,fontSize:10,color:C.textMuted}}>leads</p>
        </div>
        <div style={{background:C.border,alignSelf:"stretch"}}/>
        <div style={{textAlign:"center",padding:"0 8px"}}>
          <p style={{margin:"0 0 3px",fontSize:10,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Convertidos</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:28,margin:"0 0 2px",color:C.blue,lineHeight:1}}>{getAcum(TIME_MG,0,11).contratos}</p>
          <p style={{margin:0,fontSize:10,color:C.textMuted}}>contratos</p>
        </div>
      </div>
      <ProgressBar val={getAcum(TIME_MG,0,11).contratos} max={Math.max(getAcum(TIME_MG,0,11).leads,1)} color={C.blue} h={7}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        <span style={{fontSize:10,color:C.textMuted}}>Taxa de conversão</span>
        <span style={{fontSize:13,fontWeight:800,color:getAcum(TIME_MG,0,11).conv>=25?C.green:C.red}}>{getAcum(TIME_MG,0,11).conv.toFixed(1)}% {getAcum(TIME_MG,0,11).conv>=25?"✓":"✗"}</span>
      </div>
    </Card>

    {/* Cancelamentos */}
    <Card style={{padding:18}}>
      <CardHeader grad={C.gradRed} icon={<TrendingDown size={13} color="#fff"/>} label="Cancelamentos Ano"/>
      <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 2px",color:C.red}}>{fmt(anAll.vCancel)}</p>
      <p style={{margin:"0 0 8px",fontSize:12,color:C.textSecondary}}>{anAll.cancel} cancelamentos · {pct(anAll.vCancel,totalAnual).toFixed(1)}% receita</p>
      <Spark data={monthlyChart.filter(m=>m.total>0).map(m=>({v:m.total*0.12}))} color={C.red}/>
    </Card>

    {/* ── ROW 2: TOP MES + CONV TIMES + CHAMADAS + REUNIOES ── */}
    {/* Top Mês PC */}
    <Card style={{padding:18,borderTop:`3px solid ${C.green}`}}>
      <CardHeader grad={C.gradGreen} icon={<Star size={13} color="#fff"/>} label="🏅 Top Mês — PC"/>
      <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 2px",color:C.textPrimary}}>{topPC.nome}</p>
      <p style={{margin:"0 0 6px",fontSize:14,color:C.green,fontWeight:700}}>{fmt(topPC.valor)}</p>
      <p style={{margin:0,fontSize:11,color:C.textMuted}}>Pequenas Contas · {mes}/2026</p>
    </Card>

    {/* Top Mês MG */}
    <Card style={{padding:18,borderTop:`3px solid ${C.blue}`}}>
      <CardHeader grad={C.gradBlue} icon={<Crown size={13} color="#fff"/>} label="🏅 Top Mês — MG"/>
      <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 2px",color:C.textPrimary}}>{topMG.nome}</p>
      <p style={{margin:"0 0 6px",fontSize:14,color:C.blue,fontWeight:700}}>{fmt(topMG.valor)}</p>
      <p style={{margin:0,fontSize:11,color:C.textMuted}}>Médias & Grandes · {mes}/2026</p>
    </Card>

    {/* Conversão PC + MG */}
    <Card style={{padding:18}}>
      <CardHeader grad={C.gradPurple} icon={<Activity size={13} color="#fff"/>} label="Conversão por Time"/>
      <div style={{display:"flex",gap:16,marginBottom:10}}>
        <div style={{flex:1}}>
          <p style={{margin:"0 0 2px",fontSize:10,color:C.green,fontWeight:700,textTransform:"uppercase"}}>PC</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,margin:"0 0 2px",color:C.green}}>{monthlyChart.find(m=>m.mes===mes)?.convPC||0}%</p>
          <MiniBar data={convSparkPC} color={C.green} refLine={25}/>
        </div>
        <div style={{width:1,background:C.border}}/>
        <div style={{flex:1}}>
          <p style={{margin:"0 0 2px",fontSize:10,color:C.blue,fontWeight:700,textTransform:"uppercase"}}>MG</p>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,margin:"0 0 2px",color:C.blue}}>{monthlyChart.find(m=>m.mes===mes)?.convMG||0}%</p>
          <MiniBar data={convSparkMG} color={C.blue} refLine={25}/>
        </div>
      </div>
      <p style={{margin:0,fontSize:10,color:C.textMuted}}>linha vermelha = meta 25%</p>
    </Card>

    {/* Chamadas + Reuniões */}
    <Card style={{padding:18}}>
      <CardHeader grad={C.gradYellow} icon={<PhoneCall size={13} color="#fff"/>} label="Atividades — Acumulado"/>
      {[
        {l:"Chamadas Efetuadas",v:anAll.chamEf,max:4000,c:C.blue},
        {l:"Chamadas Recebidas",v:anAll.chamRec,max:1000,c:C.cyan},
        {l:"Reuniões Realizadas",v:anAll.reunioes,max:200,c:C.purple},
      ].map((item,i)=><div key={i} style={{marginBottom:i<2?10:0}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:11,color:C.textSecondary}}>{item.l}</span>
          <span style={{fontSize:12,fontWeight:700,color:item.c}}>{item.v}</span>
        </div>
        <ProgressBar val={item.v} max={item.max} color={item.c} h={5}/>
      </div>)}
    </Card>

    {/* ── ROW 3: TABELA MENSAL (full width) ── */}
    <Card style={{padding:22,gridColumn:"span 4"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:16,margin:0,color:C.textPrimary}}>📋 Resultado por Vendedor</h2>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {meses.map(m=>{
              const tem=allData[m]?.rows?.length>0;
              return <button key={m} onClick={()=>tem&&setMes(m)} style={{padding:"4px 12px",borderRadius:7,border:"none",cursor:tem?"pointer":"default",fontSize:13,fontWeight:700,fontFamily:"Exo 2",background:mes===m?C.blue:tem?C.blueLight:C.bg,color:mes===m?"#fff":tem?C.blue:C.border,transition:"all 0.15s"}}>{m}</button>;
            })}
          </div>
          <button onClick={()=>exportCSV(mes)} style={{display:"flex",alignItems:"center",gap:5,background:C.greenLight,color:C.green,border:`1px solid rgba(0,168,107,0.25)`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontWeight:700,fontSize:12}}><FileSpreadsheet size={13}/> Excel</button>
          <button onClick={()=>exportPDF(mes)} style={{display:"flex",alignItems:"center",gap:5,background:C.redLight,color:C.red,border:`1px solid rgba(229,62,62,0.25)`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontWeight:700,fontSize:12}}><Download size={13}/> PDF</button>
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:C.bg}}>
              {["Vendedor","Leads","Chamadas\nEfetuadas","Chamadas\nRecebidas","Reuniões\nRealizadas","Contratos\nGanhos","Valor\nGanho","Upsell\nQtd","Valor\nUpsell","Cancel.\nQtd","Valor\nCancelado","Conversão"].map((h,i)=>(
                <th key={i} style={{padding:"9px 11px",textAlign:i===0?"left":"center",color:C.textSecondary,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:0.3,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,whiteSpace:"pre-line",lineHeight:1.35}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={12} style={{padding:"4px 11px",background:C.greenLight,color:C.green,fontWeight:700,fontSize:10,letterSpacing:1,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>🟢 Pequenas Contas — Analu · Thais · Tamires</td></tr>
            {rows.filter(r=>TIME_PC.includes(r.nome)).map((v,i)=>{
              const cv=pct(v.contratos,v.leads);
              return <tr key={i} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.blueMid} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"10px 11px",fontWeight:700,color:C.textPrimary,fontSize:13,borderRight:`2px solid ${C.blue}`}}>{v.nome}</td>
                {[v.leads,v.chamEf,v.chamRec,v.reunioes,v.contratos].map((n,j)=><td key={j} style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{n}</td>)}
                <td style={{padding:"10px 11px",textAlign:"center",color:C.blue,fontWeight:700,borderRight:`1px solid ${C.border}`}}>{fmt(v.valor)}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{v.upsell}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{fmt(v.vUpsell)}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{v.cancelados}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.red,borderRight:`1px solid ${C.border}`}}>{fmt(v.vCancel)}</td>
                <td style={{padding:"10px 11px",textAlign:"center"}}><span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Badge val={cv}/><span style={{fontSize:14}}>{Number(cv)>=25?"👍":"👎"}</span></span></td>
              </tr>;
            })}
            <tr><td colSpan={12} style={{padding:"4px 11px",background:C.blueLight,color:C.blue,fontWeight:700,fontSize:10,letterSpacing:1,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>🔵 Médias & Grandes — Carlos · Edson · Izabel · John (Líder)</td></tr>
            {rows.filter(r=>TIME_MG.includes(r.nome)).map((v,i)=>{
              const cv=pct(v.contratos,v.leads);
              const isL=v.nome==="John";
              return <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:isL?"rgba(107,63,160,0.02)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=C.blueMid} onMouseLeave={e=>e.currentTarget.style.background=isL?"rgba(107,63,160,0.02)":"transparent"}>
                <td style={{padding:"10px 11px",fontWeight:700,color:C.textPrimary,fontSize:13,borderRight:`2px solid ${C.blue}`}}><span style={{display:"flex",alignItems:"center",gap:4}}>{v.nome}{isL&&<Crown size={11} color={C.yellow}/>}</span></td>
                {[v.leads,v.chamEf,v.chamRec,v.reunioes,v.contratos].map((n,j)=><td key={j} style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{n}</td>)}
                <td style={{padding:"10px 11px",textAlign:"center",color:C.blue,fontWeight:700,borderRight:`1px solid ${C.border}`}}>{fmt(v.valor)}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{v.upsell}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{fmt(v.vUpsell)}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.textSecondary,borderRight:`1px solid ${C.border}`}}>{v.cancelados}</td>
                <td style={{padding:"10px 11px",textAlign:"center",color:C.red,borderRight:`1px solid ${C.border}`}}>{fmt(v.vCancel)}</td>
                <td style={{padding:"10px 11px",textAlign:"center"}}><span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Badge val={cv}/><span style={{fontSize:14}}>{Number(cv)>=25?"👍":"👎"}</span></span></td>
              </tr>;
            })}
            <tr style={{background:C.blueMid,borderTop:`2px solid ${C.blue}`}}>
              <td style={{padding:"10px 11px",fontWeight:800,color:C.textPrimary,fontFamily:"Exo 2",fontSize:13,borderRight:`1px solid ${C.border}`}}>Total</td>
              {[tot.leads,tot.chamEf,tot.chamRec,tot.reu,tot.contratos].map((n,j)=><td key={j} style={{padding:"10px 11px",textAlign:"center",fontWeight:700,borderRight:`1px solid ${C.border}`}}>{n}</td>)}
              <td style={{padding:"10px 11px",textAlign:"center",fontWeight:800,color:C.blue,borderRight:`1px solid ${C.border}`}}>{fmt(tot.val)}</td>
              <td style={{padding:"10px 11px",textAlign:"center",fontWeight:700,borderRight:`1px solid ${C.border}`}}>{tot.upsell}</td>
              <td style={{padding:"10px 11px",textAlign:"center",fontWeight:700,borderRight:`1px solid ${C.border}`}}>{fmt(tot.vUpsell)}</td>
              <td style={{padding:"10px 11px",textAlign:"center",fontWeight:700,borderRight:`1px solid ${C.border}`}}>{tot.cancel}</td>
              <td style={{padding:"10px 11px",textAlign:"center",fontWeight:700,color:C.red,borderRight:`1px solid ${C.border}`}}>{fmt(tot.vCancel)}</td>
              <td style={{padding:"10px 11px",textAlign:"center"}}><Badge val={pct(tot.contratos,tot.leads).toFixed(1)}/></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    {/* ── ROW 4: RANKING PC + MG + CANCELAMENTOS + GRAFICO TENDENCIA ── */}
    {/* Ranking PC */}
    <Card style={{padding:18}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,margin:"0 0 12px",color:C.green}}>🟢 Ranking Ano — PC</h3>
      {rankPC.map((v,i)=><div key={i} style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontWeight:700,color:C.textPrimary,fontSize:13,display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:12,color:i===0?C.yellow:"#ccc",width:16}}>{i+1}</span>{v.nome}
          </span>
          <span style={{fontSize:12,fontWeight:700,color:C.green}}>{fmtS(v.val)}</span>
        </div>
        <ProgressBar val={v.val} max={rankPC[0].val} color={C.green}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
          <span style={{fontSize:10,color:C.textMuted}}>{v.contratos} contratos</span>
          <Badge val={v.conv.toFixed(0)}/>
        </div>
      </div>)}
    </Card>

    {/* Ranking MG */}
    <Card style={{padding:18}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,margin:"0 0 12px",color:C.blue}}>🔵 Ranking Ano — MG</h3>
      {rankMG.map((v,i)=><div key={i} style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontWeight:700,color:C.textPrimary,fontSize:13,display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:12,color:i===0?C.yellow:"#ccc",width:16}}>{i+1}</span>
            {v.nome}{v.nome==="John"&&<Crown size={11} color={C.yellow}/>}
          </span>
          <span style={{fontSize:12,fontWeight:700,color:C.blue}}>{fmtS(v.val)}</span>
        </div>
        <ProgressBar val={v.val} max={rankMG[0].val} color={C.blue}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
          <span style={{fontSize:10,color:C.textMuted}}>{v.contratos} contratos</span>
          <Badge val={v.conv.toFixed(0)}/>
        </div>
      </div>)}
    </Card>

    {/* Cancelamentos */}
    <Card style={{padding:18}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,margin:"0 0 12px",color:C.red}}>⚠️ Cancelamentos Acumulados</h3>
      <div style={{display:"flex",gap:10,marginBottom:12}}>
        <div style={{flex:1,background:C.redLight,borderRadius:8,padding:"10px 12px"}}>
          <p style={{margin:"0 0 1px",fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase"}}>Total</p>
          <p style={{margin:0,fontFamily:"Exo 2",fontWeight:800,fontSize:16,color:C.red}}>{fmtS(cancelAcum.reduce((s,v)=>s+v.tot,0))}</p>
        </div>
        <div style={{flex:1,background:C.orangeLight,borderRadius:8,padding:"10px 12px"}}>
          <p style={{margin:"0 0 1px",fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase"}}>Qtd</p>
          <p style={{margin:0,fontFamily:"Exo 2",fontWeight:800,fontSize:16,color:C.orange}}>{cancelAcum.reduce((s,v)=>s+v.qtd,0)}</p>
        </div>
      </div>
      {cancelAcum.map((v,i)=><div key={i} style={{marginBottom:7}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{v.nome}</span>
          <span style={{fontSize:11,fontWeight:700,color:C.red}}>{fmt(v.tot)}</span>
        </div>
        <ProgressBar val={v.tot} max={cancelAcum[0].tot} color={C.red} h={4}/>
      </div>)}
    </Card>

    {/* ── GRAFICO META ANO FULL WIDTH ── */}
    <Card style={{padding:24,gridColumn:"span 4"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:17,margin:"0 0 4px",color:C.textPrimary}}>📈 Meta Ano × Realizado — 2026</h2>
          <p style={{margin:0,fontSize:12,color:C.textSecondary}}>Meta mensal: {fmt(11667)} · Meta anual: {fmt(metaAnual)} · Acumulado: {fmt(totalAnual)}</p>
        </div>
        <div style={{display:"flex",gap:16,fontSize:12}}>
          <span style={{display:"flex",alignItems:"center",gap:6,color:C.textSecondary}}><div style={{width:10,height:10,borderRadius:2,background:C.blue}}/> PC — Pequenas Contas</span>
          <span style={{display:"flex",alignItems:"center",gap:6,color:C.textSecondary}}><div style={{width:10,height:10,borderRadius:2,background:C.cyan}}/> MG — Médias & Grandes</span>
          <span style={{display:"flex",alignItems:"center",gap:6,color:C.textSecondary}}><div style={{width:14,height:2,background:C.red}}/> Meta mensal</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={monthlyChart} margin={{top:24,right:8,bottom:0,left:8}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
          <XAxis dataKey="mes" tick={{fill:C.textSecondary,fontSize:13}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:C.textSecondary,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/>
          <Tooltip content={<TT/>}/>
          <Bar dataKey="pc" name="PC" fill={C.blue} radius={[0,0,0,0]} stackId="a"/>
          <Bar dataKey="mg" name="MG" fill={C.cyan} radius={[4,4,0,0]} stackId="a"
            label={{position:"top", formatter:(v,entry)=>{
              const total=(entry?.pc||0)+(v||0);
              return total>0?fmt(total):"";
            }, fill:C.textPrimary, fontSize:11, fontWeight:700, fontFamily:"Exo 2"}}/>
          <Line dataKey="meta" name="Meta" stroke={C.red} strokeWidth={2} strokeDasharray="6 3" dot={false}/>
        </ComposedChart>
      </ResponsiveContainer>
    </Card>

    {/* ── ROW 5: PERIODOS FULL WIDTH ── */}
    <Card style={{padding:20,gridColumn:"span 4"}}>
      <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:16,margin:"0 0 14px",color:C.textPrimary}}>📅 Resultado por Período — Trimestral · Semestral · Anual</h2>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{background:C.bg}}>
              <th rowSpan={2} style={{padding:"7px 11px",textAlign:"left",color:C.textSecondary,fontWeight:700,fontSize:10,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`}}>Vendedor</th>
              {[{l:"Q1 Jan–Mar",c:C.blue},{l:"Q2 Abr–Jun",c:C.cyan},{l:"Q3 Jul–Set",c:C.purple},{l:"Q4 Out–Dez",c:C.orange},{l:"S1 Jan–Jun",c:C.green},{l:"S2 Jul–Dez",c:C.yellow},{l:"Anual",c:C.textPrimary}].map((p,i)=>(
                <th key={i} colSpan={2} style={{padding:"7px 10px",textAlign:"center",color:p.c,fontWeight:700,fontSize:10,borderBottom:`1px solid ${C.border}`,borderLeft:`2px solid ${C.border}`}}>{p.l}</th>
              ))}
            </tr>
            <tr style={{background:C.bg}}>
              {Array(7).fill(0).flatMap((_,i)=>[
                <th key={`v${i}`} style={{padding:"5px 10px",textAlign:"right",color:C.textMuted,fontWeight:600,fontSize:9,borderBottom:`2px solid ${C.border}`,borderLeft:`2px solid ${C.border}`}}>Valor</th>,
                <th key={`c${i}`} style={{padding:"5px 10px",textAlign:"center",color:C.textMuted,fontWeight:600,fontSize:9,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`}}>Conv.</th>
              ])}
            </tr>
          </thead>
          <tbody>
            {[{label:"🟢 Pequenas Contas",nomes:TIME_PC,color:C.green,bg:C.greenLight},{label:"🔵 Médias & Grandes",nomes:TIME_MG,color:C.blue,bg:C.blueLight}].map(grp=>[
              <tr key={grp.label}><td colSpan={15} style={{padding:"4px 11px",background:grp.bg,color:grp.color,fontWeight:700,fontSize:9,letterSpacing:1,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{grp.label}</td></tr>,
              ...periodos.filter(p=>grp.nomes.includes(p.nome)).map((v,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.blueLight} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 11px",fontWeight:700,color:C.textPrimary,fontSize:12,borderRight:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                    <span style={{display:"flex",alignItems:"center",gap:3}}>{v.nome}{v.isLider&&<Crown size={10} color={C.yellow}/>}</span>
                  </td>
                  {[v.q1,v.q2,v.q3,v.q4,v.s1,v.s2,v.an].flatMap((p,j)=>[
                    <td key={`v${j}`} style={{padding:"9px 10px",textAlign:"right",color:j>=4?grp.color:C.textPrimary,fontWeight:j>=4?700:400,fontSize:11,borderLeft:`2px solid ${C.border}`}}>{fmt(p.val)}</td>,
                    <td key={`c${j}`} style={{padding:"9px 10px",textAlign:"center",borderRight:`1px solid ${C.border}`}}><Badge val={p.conv.toFixed(0)}/></td>
                  ])}
                </tr>
              ))
            ])}
          </tbody>
        </table>
      </div>
    </Card>

    {/* ── GRÁFICO META 25% — TRIMESTRE E SEMESTRE ── */}
    <Card style={{padding:24,gridColumn:"span 4"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:17,margin:"0 0 4px",color:C.textPrimary}}>🎯 Quanto Falta para a Meta de 25%?</h2>
          <p style={{margin:0,fontSize:12,color:C.textSecondary}}>Conversão atual vs meta — por vendedor · Trimestre e Semestre</p>
        </div>
        <div style={{display:"flex",gap:12,fontSize:12}}>
          <span style={{display:"flex",alignItems:"center",gap:5,color:C.textSecondary}}><div style={{width:10,height:10,borderRadius:2,background:C.blue}}/> Trimestre (Q1)</span>
          <span style={{display:"flex",alignItems:"center",gap:5,color:C.textSecondary}}><div style={{width:10,height:10,borderRadius:2,background:C.cyan}}/> Semestre (S1)</span>
          <span style={{display:"flex",alignItems:"center",gap:5,color:C.textSecondary}}><div style={{width:14,height:2,background:C.red}}/> Meta 25%</span>
        </div>
      </div>
      {[{label:"🟢 Pequenas Contas",nomes:TIME_PC,colorQ:C.green,colorS:"#00D4A0"},{label:"🔵 Médias & Grandes",nomes:TIME_MG,colorQ:C.blue,colorS:C.cyan}].map(grp=>(
        <div key={grp.label} style={{marginBottom:24}}>
          <p style={{fontFamily:"Exo 2",fontWeight:700,fontSize:12,color:grp.colorQ,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:1}}>{grp.label}</p>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${grp.nomes.length},1fr)`,gap:16}}>
            {grp.nomes.map(nome=>{
              const q1=getAcum([nome],0,2);
              const s1=getAcum([nome],0,5);
              const faltaQ=Math.max(0,25-q1.conv).toFixed(1);
              const faltaS=Math.max(0,25-s1.conv).toFixed(1);
              const okQ=q1.conv>=25, okS=s1.conv>=25;
              return <div key={nome} style={{background:C.bg,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,color:C.textPrimary}}>{nome}</span>
                  {nome==="John"&&<Crown size={12} color={C.yellow}/>}
                </div>
                {/* Trimestre Q1 */}
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase"}}>Trimestre Q1</span>
                    <span style={{fontSize:12,fontWeight:800,color:okQ?C.green:C.red}}>{q1.conv.toFixed(1)}% {okQ?"👍":"👎"}</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:C.border,position:"relative",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:okQ?C.green:grp.colorQ,width:`${Math.min((q1.conv/50)*100,100)}%`,transition:"width 0.8s"}}/>
                    <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:2,background:C.red,opacity:0.6}}/>
                  </div>
                  {!okQ&&<p style={{margin:"4px 0 0",fontSize:13,color:C.red,fontWeight:700}}>📉 Falta {faltaQ}% para a meta</p>}
                  {okQ&&<p style={{margin:"4px 0 0",fontSize:13,color:C.green,fontWeight:700}}>✅ +{(q1.conv-25).toFixed(1)}% acima da meta</p>}
                </div>
                {/* Semestre S1 */}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:10,color:C.textSecondary,fontWeight:700,textTransform:"uppercase"}}>Semestre S1</span>
                    <span style={{fontSize:12,fontWeight:800,color:okS?C.green:C.red}}>{s1.conv.toFixed(1)}% {okS?"👍":"👎"}</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:C.border,position:"relative",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:okS?C.green:grp.colorS,width:`${Math.min((s1.conv/50)*100,100)}%`,transition:"width 0.8s"}}/>
                    <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:2,background:C.red,opacity:0.6}}/>
                  </div>
                  {!okS&&<p style={{margin:"4px 0 0",fontSize:13,color:C.red,fontWeight:700}}>📉 Falta {faltaS}% para a meta</p>}
                  {okS&&<p style={{margin:"4px 0 0",fontSize:13,color:C.green,fontWeight:700}}>✅ +{(s1.conv-25).toFixed(1)}% acima da meta</p>}
                </div>
              </div>;
            })}
          </div>
        </div>
      ))}
    </Card>
  </div>;
}

// ── VENDEDORES ────────────────────────────────────────────
function Vendedores(){
  const [lista,setLista]=useState([
    {id:1,nome:"Analu",codigo:"2042",ativo:true,time:"PC"},
    {id:2,nome:"Thais",codigo:"2044",ativo:true,time:"PC"},
    {id:3,nome:"Tamires",codigo:"2041",ativo:true,time:"PC"},
    {id:4,nome:"Carlos",codigo:"2014",ativo:true,time:"MG"},
    {id:5,nome:"Edson",codigo:"2029",ativo:true,time:"MG"},
    {id:6,nome:"Izabel",codigo:"2029",ativo:true,time:"MG"},
    {id:7,nome:"John",codigo:"2018",ativo:true,time:"MG",lider:true},
  ]);
  const [modal,setModal]=useState(false);
  const [novo,setNovo]=useState({nome:"",codigo:"",time:"PC"});
  const toggle=id=>setLista(l=>l.map(v=>v.id===id?{...v,ativo:!v.ativo}:v));
  const add=()=>{if(!novo.nome||!novo.codigo)return;setLista(l=>[...l,{id:l.length+1,...novo,ativo:true}]);setNovo({nome:"",codigo:"",time:"PC"});setModal(false);};
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div><h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:20,margin:"0 0 4px",color:C.textPrimary}}>Gestão de Vendedores</h2>
        <p style={{margin:0,fontSize:13,color:C.textSecondary}}>{lista.filter(v=>v.ativo).length} ativos · {lista.filter(v=>!v.ativo).length} inativos</p></div>
      <button onClick={()=>setModal(true)} style={{display:"flex",alignItems:"center",gap:8,background:C.gradBlue,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:14}}><Plus size={16}/> Novo Vendedor</button>
    </div>
    {[{label:"🟢 Pequenas Contas",f:"PC",c:C.green,g:C.gradGreen},{label:"🔵 Médias & Grandes",f:"MG",c:C.blue,g:C.gradBlue}].map(grp=>(
      <div key={grp.f} style={{marginBottom:22}}>
        <p style={{fontFamily:"Exo 2",fontWeight:700,fontSize:12,color:grp.c,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:1}}>{grp.label}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {lista.filter(v=>v.time===grp.f).map(v=>(
            <Card key={v.id} style={{padding:18,opacity:v.ativo?1:0.65,borderTop:`3px solid ${v.lider?C.yellow:grp.c}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:v.ativo?(grp.f==="PC"?C.greenLight:C.blueLight):C.redLight,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Exo 2",fontWeight:800,fontSize:16,color:v.ativo?grp.c:C.red}}>{v.nome[0]}</div>
                  <div>
                    <p style={{margin:"0 0 2px",fontWeight:700,color:C.textPrimary,fontSize:14,display:"flex",alignItems:"center",gap:4}}>{v.nome}{v.lider&&<Crown size={12} color={C.yellow}/>}</p>
                    <span style={{fontSize:11,background:C.bg,borderRadius:5,padding:"1px 7px",color:C.textSecondary,fontWeight:700,letterSpacing:2}}>#{v.codigo}</span>
                  </div>
                </div>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:v.ativo?C.greenLight:C.redLight,color:v.ativo?C.green:C.red}}>{v.ativo?"Ativo":"Inativo"}</span>
              </div>
              <button onClick={()=>toggle(v.id)} style={{width:"100%",padding:"7px",borderRadius:7,border:`1px solid ${v.ativo?C.red:C.green}`,background:"transparent",color:v.ativo?C.red:C.green,cursor:"pointer",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                {v.ativo?<><UserX size={12}/> Desativar</>:<><UserCheck size={12}/> Reativar</>}
              </button>
            </Card>
          ))}
        </div>
      </div>
    ))}
    {modal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.white,borderRadius:16,padding:30,width:400,boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:17,margin:0,color:C.textPrimary}}>Novo Vendedor</h3>
          <button onClick={()=>setModal(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary}}><X size={18}/></button>
        </div>
        {[{k:"nome",l:"Nome"},{k:"codigo",l:"Código"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>{f.l}</label>
            <input value={novo[f.k]} onChange={e=>setNovo(n=>({...n,[f.k]:e.target.value}))} style={{width:"100%",padding:"10px 13px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.textPrimary,outline:"none",boxSizing:"border-box",fontFamily:"DM Sans",fontWeight:600}}/>
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Time</label>
          <div style={{display:"flex",gap:8}}>
            {[{v:"PC",l:"Pequenas Contas"},{v:"MG",l:"Médias & Grandes"}].map(t=>(
              <button key={t.v} onClick={()=>setNovo(n=>({...n,time:t.v}))} style={{flex:1,padding:"9px",borderRadius:8,border:`2px solid ${novo.time===t.v?C.blue:C.border}`,background:novo.time===t.v?C.blueLight:"transparent",color:novo.time===t.v?C.blue:C.textSecondary,cursor:"pointer",fontWeight:700,fontSize:12}}>{t.l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setModal(false)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.textSecondary,cursor:"pointer",fontWeight:700}}>Cancelar</button>
          <button onClick={add} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:C.gradBlue,color:"#fff",cursor:"pointer",fontWeight:700}}>Adicionar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ── LANÇAR ────────────────────────────────────────────────
const mesAtual=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][new Date().getMonth()]+"/2026";

const historico=[
  {tipo:"Venda",cliente:"Empresa Alpha",valor:1994.46,data:"05/05/2026"},
  {tipo:"Upsell",cliente:"Tech Solutions",valor:147.99,data:"08/05/2026"},
  {tipo:"Venda",cliente:"Grupo Beta",valor:887.53,data:"12/05/2026"},
];

function ItemLancamento({tipo,isMG,onAdd}){
  const [items,setItems]=useState([]);
  const [erro,setErro]=useState("");
  const cores={Venda:C.blue,Upsell:C.cyan,Cancelamento:C.red};
  const cor=cores[tipo];

  const addItem=()=>setItems(i=>[...i,{cliente:"",valor:"",id:Date.now()}]);
  const removeItem=id=>setItems(i=>i.filter(x=>x.id!==id));
  const updateItem=(id,field,val)=>setItems(i=>i.map(x=>x.id===id?{...x,[field]:val}:x));

  const total=items.reduce((s,i)=>s+parseFloat(i.valor||0),0);

  const salvar=()=>{
    setErro("");
    for(const item of items){
      if(!item.cliente){setErro("Informe o nome do cliente em todos os itens.");return;}
      if(!item.valor||isNaN(item.valor)){setErro("Informe o valor em todos os itens.");return;}
      if(tipo==="Venda"&&isMG&&parseFloat(item.valor)<VALOR_MIN_MG){
        setErro(`Venda abaixo do perfil de gestor de contas. Valor mínimo: R$ 200,00`);return;
      }
    }
    onAdd(items,total);
    setItems([]);
  };

  return <div style={{background:C.bg,borderRadius:10,padding:16,border:`1px solid ${C.border}`,marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,color:cor}}>+ {tipo}s</span>
      {total>0&&<span style={{fontSize:12,fontWeight:700,color:cor}}>Total: {fmt(total)}</span>}
    </div>
    {items.map((item,i)=>(
      <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 32px",gap:8,marginBottom:8,alignItems:"center"}}>
        <input value={item.cliente} onChange={e=>updateItem(item.id,"cliente",e.target.value)} placeholder="Nome do cliente"
          style={{padding:"8px 12px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,color:C.textPrimary,outline:"none",fontFamily:"DM Sans"}}/>
        <input type="number" value={item.valor} onChange={e=>updateItem(item.id,"valor",e.target.value)} placeholder="R$ 0,00"
          style={{padding:"8px 12px",borderRadius:7,border:`1px solid ${tipo==="Venda"&&isMG&&parseFloat(item.valor)>0&&parseFloat(item.valor)<VALOR_MIN_MG?C.red:C.border}`,fontSize:13,color:C.textPrimary,outline:"none",fontFamily:"DM Sans",fontWeight:600}}/>
        <button onClick={()=>removeItem(item.id)} style={{width:32,height:32,borderRadius:7,border:"none",background:C.redLight,color:C.red,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
    ))}
    {erro&&<p style={{color:C.red,fontSize:12,fontWeight:700,margin:"4px 0 8px",padding:"8px 12px",background:C.redLight,borderRadius:7}}>{erro}</p>}
    <div style={{display:"flex",gap:8,marginTop:8}}>
      <button onClick={addItem} style={{flex:1,padding:"8px",borderRadius:7,border:`1px dashed ${cor}`,background:"transparent",color:cor,cursor:"pointer",fontWeight:700,fontSize:13}}>+ Adicionar {tipo}</button>
      {items.length>0&&<button onClick={salvar} style={{padding:"8px 16px",borderRadius:7,border:"none",background:cor,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}><Check size={13}/> Salvar</button>}
    </div>
  </div>;
}

function Lancar({usuarioExterno=null,onLogout=null}){
  const vends=[{nome:"Analu",c:"2042",time:"PC"},{nome:"Thais",c:"2044",time:"PC"},{nome:"Tamires",c:"2041",time:"PC"},{nome:"Carlos",c:"2014",time:"MG"},{nome:"Edson",c:"2029",time:"MG"},{nome:"Izabel",c:"2029",time:"MG"}];
  const [cod,setCod]=useState("");
  const [vend,setVend]=useState(usuarioExterno);
  const [erro,setErro]=useState("");
  const [salvos,setSalvos]=useState([]);
  const [reunioes,setReunioes]=useState("");
  const [okReu,setOkReu]=useState(false);
  const isMG=vend&&TIME_MG_NOMES.includes(vend.nome);

  const buscar=()=>{const f=vends.find(v=>v.c===cod);if(f){setVend(f);setErro("");}else setErro("Código não encontrado.");};
  const onAdd=(items,total,tipo)=>{setSalvos(s=>[...s,...items.map(i=>({...i,tipo,data:new Date().toLocaleDateString("pt-BR")}))]);};
  const salvarReu=()=>{setOkReu(true);setTimeout(()=>setOkReu(false),2000);};

  if(!vend) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400}}>
    <Card style={{padding:40,width:360,textAlign:"center",boxShadow:C.shadowMd}}>
      <div style={{width:60,height:60,borderRadius:"50%",background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><Lock size={26} color={C.blue}/></div>
      <h2 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:21,margin:"0 0 6px",color:C.textPrimary}}>Acesso do Vendedor</h2>
      <p style={{margin:"0 0 22px",color:C.textSecondary,fontSize:14}}>Informe seu código numérico</p>
      <input value={cod} onChange={e=>setCod(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()} placeholder="0000"
        style={{width:"100%",padding:"13px",borderRadius:10,border:`2px solid ${erro?C.red:C.border}`,fontSize:24,textAlign:"center",letterSpacing:8,fontFamily:"Exo 2",fontWeight:800,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      {erro&&<p style={{color:C.red,fontSize:12,margin:"0 0 10px"}}>{erro}</p>}
      <button onClick={buscar} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:C.gradBlue,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:"Exo 2"}}>Entrar</button>
    </Card>
  </div>;

  return <div style={{maxWidth:680,margin:"0 auto"}}>
    {/* Header */}
    <Card style={{padding:22,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h2 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:21,margin:"0 0 3px",color:C.textPrimary}}>Olá, {vend.nome}! 👋</h2>
          <p style={{margin:0,fontSize:13,color:C.textSecondary}}>Lançamento — {mesAtual} · Time {vend.time}</p>
        </div>
        <button onClick={()=>setVend(null)} style={{background:C.redLight,border:"none",borderRadius:7,padding:"7px 14px",color:C.red,cursor:"pointer",fontSize:13,fontWeight:700}}>Sair</button>
      </div>
    </Card>

    {/* Histórico do mês — somente leitura */}
    <Card style={{padding:20,marginBottom:16}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,margin:"0 0 12px",color:C.textSecondary,textTransform:"uppercase",letterSpacing:0.8}}>📋 Lançamentos do mês (somente leitura)</h3>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:C.bg}}>
          {["Tipo","Cliente","Valor","Data"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:h==="Valor"?"right":"left",color:C.textSecondary,fontWeight:700,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {historico.map((h,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg}}>
            <td style={{padding:"8px 10px"}}><span style={{background:h.tipo==="Venda"?C.blueLight:h.tipo==="Upsell"?C.cyanLight:C.redLight,color:h.tipo==="Venda"?C.blue:h.tipo==="Upsell"?C.cyan:C.red,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700}}>{h.tipo}</span></td>
            <td style={{padding:"8px 10px",color:C.textPrimary,fontWeight:500}}>{h.cliente}</td>
            <td style={{padding:"8px 10px",textAlign:"right",color:C.blue,fontWeight:700}}>{fmt(h.valor)}</td>
            <td style={{padding:"8px 10px",color:C.textMuted,fontSize:12}}>{h.data}</td>
          </tr>)}
          {salvos.map((h,i)=><tr key={`n${i}`} style={{borderBottom:`1px solid ${C.border}`,background:C.greenLight}}>
            <td style={{padding:"8px 10px"}}><span style={{background:h.tipo==="Venda"?C.blueLight:h.tipo==="Upsell"?C.cyanLight:C.redLight,color:h.tipo==="Venda"?C.blue:h.tipo==="Upsell"?C.cyan:C.red,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700}}>{h.tipo}</span></td>
            <td style={{padding:"8px 10px",color:C.textPrimary,fontWeight:500}}>{h.cliente}</td>
            <td style={{padding:"8px 10px",textAlign:"right",color:C.blue,fontWeight:700}}>{fmt(parseFloat(h.valor||0))}</td>
            <td style={{padding:"8px 10px",color:C.textMuted,fontSize:12}}>{h.data} <span style={{color:C.green,fontWeight:700}}>✓ novo</span></td>
          </tr>)}
        </tbody>
      </table>
      {isMG&&<div style={{marginTop:10,padding:"8px 12px",background:C.blueLight,borderRadius:8,fontSize:12,color:C.blue,fontWeight:600}}>ℹ️ Time Médias & Grandes: valor mínimo por venda R$ 200,00</div>}
    </Card>

    {/* Novos lançamentos */}
    <Card style={{padding:20}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:14,margin:"0 0 16px",color:C.textPrimary,textTransform:"uppercase",letterSpacing:0.8}}>➕ Novo Lançamento</h3>
      <ItemLancamento tipo="Venda" isMG={isMG} onAdd={(items,total)=>onAdd(items,total,"Venda")}/>
      <ItemLancamento tipo="Upsell" isMG={false} onAdd={(items,total)=>onAdd(items,total,"Upsell")}/>
      <ItemLancamento tipo="Cancelamento" isMG={false} onAdd={(items,total)=>onAdd(items,total,"Cancelamento")}/>

      {/* Reuniões — campo simples */}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,marginTop:4}}>
        <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Reuniões Realizadas hoje</label>
        <div style={{display:"flex",gap:8}}>
          <input type="number" value={reunioes} onChange={e=>setReunioes(e.target.value)} placeholder="0"
            style={{width:100,padding:"10px 13px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:15,color:C.textPrimary,outline:"none",fontFamily:"DM Sans",fontWeight:600}}/>
          <button onClick={salvarReu} style={{padding:"10px 18px",borderRadius:7,border:"none",background:okReu?C.green:C.gradBlue,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            {okReu?<><Check size={13}/> Salvo!</>:<><Save size={13}/> Salvar</>}
          </button>
        </div>
      </div>
    </Card>
  </div>;
}


// ── APROVACOES ────────────────────────────────────────────
function Aprovacoes(){
  const [lista,setLista]=useState(lancamentosPendentes);
  const [comentario,setComentario]=useState({});
  const [editModal,setEditModal]=useState(null);
  const [editForm,setEditForm]=useState({});
  const pendentes=lista.filter(l=>l.status==="pendente");
  const revisados=lista.filter(l=>l.status!=="pendente");
  const aprovar=id=>setLista(l=>l.map(x=>x.id===id?{...x,status:"aprovado",comentario:comentario[id]||""}:x));
  const rejeitar=id=>{if(!comentario[id]){alert("Informe o motivo.");return;}setLista(l=>l.map(x=>x.id===id?{...x,status:"rejeitado",comentario:comentario[id]}:x));};
  const salvarEd=()=>{setLista(l=>l.map(x=>x.id===editModal.id?{...x,...editForm}:x));setEditModal(null);};
  const SB=({s})=>{const m={pendente:[C.yellow,C.yellowLight,"Pendente"],aprovado:[C.green,C.greenLight,"Aprovado"],rejeitado:[C.red,C.redLight,"Rejeitado"]};const[c,bg,lb]=m[s]||[C.textSecondary,C.bg,s];return <span style={{background:bg,color:c,borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:12}}>{lb}</span>;};
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:20,margin:0,color:C.textPrimary}}>Aprovacao de Lancamentos</h2>
      <div style={{display:"flex",gap:10}}>
        {[{l:"Pendentes",v:pendentes.length,c:C.yellow,bg:C.yellowLight},{l:"Aprovados",v:lista.filter(x=>x.status==="aprovado").length,c:C.green,bg:C.greenLight},{l:"Rejeitados",v:lista.filter(x=>x.status==="rejeitado").length,c:C.red,bg:C.redLight}].map(s=>(
          <div key={s.l} style={{background:s.bg,borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
            <p style={{margin:"0 0 2px",fontFamily:"Exo 2",fontWeight:800,fontSize:20,color:s.c}}>{s.v}</p>
            <p style={{margin:0,fontSize:11,color:C.textSecondary,fontWeight:600}}>{s.l}</p>
          </div>
        ))}
      </div>
    </div>
    {pendentes.length>0&&<div style={{marginBottom:24}}>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:13,color:C.yellow,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:1}}>Aguardando Revisao</h3>
      {pendentes.map(l=>(
        <div key={l.id} style={{background:C.white,borderRadius:14,border:`2px solid ${C.yellowLight}`,padding:20,marginBottom:12,boxShadow:C.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:l.time==="PC"?C.greenLight:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Exo 2",fontWeight:800,fontSize:15,color:l.time==="PC"?C.green:C.blue}}>{l.vendedor[0]}</div>
              <div>
                <p style={{margin:"0 0 2px",fontWeight:700,color:C.textPrimary,fontSize:15}}>{l.vendedor} <span style={{fontSize:11,color:l.time==="PC"?C.green:C.blue,fontWeight:700}}>({l.time})</span></p>
                <p style={{margin:0,fontSize:12,color:C.textSecondary}}>{l.data} · {l.tipo} · {l.cliente}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:20,color:C.blue,margin:0}}>{fmt(l.valor)}</p>
              <button onClick={()=>{setEditModal(l);setEditForm({cliente:l.cliente,valor:l.valor,tipo:l.tipo});}} style={{padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,color:C.textSecondary,fontWeight:600}}>
                <Pencil size={12}/> Editar
              </button>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input value={comentario[l.id]||""} onChange={e=>setComentario(c=>({...c,[l.id]:e.target.value}))} placeholder="Comentario (obrigatorio para rejeitar)..."
              style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"DM Sans"}}/>
            <button onClick={()=>aprovar(l.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:"none",background:C.green,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}><ThumbsUp size={14}/> Aprovar</button>
            <button onClick={()=>rejeitar(l.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:"none",background:C.red,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}><ThumbsDown size={14}/> Rejeitar</button>
          </div>
        </div>
      ))}
    </div>}
    {revisados.length>0&&<div>
      <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:13,color:C.textSecondary,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:1}}>Historico</h3>
      <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.bg}}>{["Data","Vendedor","Tipo","Cliente","Valor","Status","Comentario"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",color:C.textSecondary,fontWeight:700,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{revisados.map((l,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.blueLight} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"10px 14px",color:C.textSecondary,fontSize:12}}>{l.data}</td>
              <td style={{padding:"10px 14px",fontWeight:600}}>{l.vendedor}</td>
              <td style={{padding:"10px 14px"}}>{l.tipo}</td>
              <td style={{padding:"10px 14px",color:C.textSecondary}}>{l.cliente}</td>
              <td style={{padding:"10px 14px",fontWeight:700,color:C.blue}}>{fmt(l.valor)}</td>
              <td style={{padding:"10px 14px"}}><SB s={l.status}/></td>
              <td style={{padding:"10px 14px",color:C.textSecondary,fontSize:12}}>{l.comentario||"—"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}
    {editModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.white,borderRadius:16,padding:30,width:420,boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:17,margin:0,color:C.textPrimary}}>Editar Lancamento</h3>
          <button onClick={()=>setEditModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary}}><X size={18}/></button>
        </div>
        <p style={{margin:"0 0 16px",fontSize:13,color:C.textSecondary}}>{editModal.vendedor} · {editModal.data}</p>
        {[{k:"cliente",l:"Cliente"},{k:"tipo",l:"Tipo"},{k:"valor",l:"Valor (R$)",t:"number"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>{f.l}</label>
            <input type={f.t||"text"} value={editForm[f.k]||""} onChange={e=>setEditForm(ef=>({...ef,[f.k]:e.target.value}))}
              style={{width:"100%",padding:"10px 13px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.textPrimary,outline:"none",boxSizing:"border-box",fontFamily:"DM Sans",fontWeight:600}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>setEditModal(null)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.textSecondary,cursor:"pointer",fontWeight:700}}>Cancelar</button>
          <button onClick={salvarEd} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:C.blue,color:"#fff",cursor:"pointer",fontWeight:700}}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ── LOG ───────────────────────────────────────────────────
function Log(){
  const logs=[
    {u:"David",a:"Editou lançamento de Thais (Mai)",de:"Contratos: 11",para:"Contratos: 13",d:"20/05/2026 14:32"},
    {u:"Admin",a:"Alterou meta anual",de:"R$ 120.000",para:"R$ 140.000",d:"01/05/2026 09:10"},
    {u:"Patrick",a:"Desativou vendedor John",de:"Ativo",para:"Inativo",d:"15/04/2026 11:45"},
  ];
  return <div>
    <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:19,margin:"0 0 18px",color:C.textPrimary}}>Log de Alterações</h2>
    <Card>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:C.bg}}>{["Data","Usuário","Ação","De","Para"].map(h=><th key={h} style={{padding:"12px 15px",textAlign:"left",color:C.textSecondary,fontWeight:700,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{logs.map((l,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.blueLight} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"12px 15px",color:C.textSecondary,whiteSpace:"nowrap",fontSize:12}}>{l.d}</td>
          <td style={{padding:"12px 15px"}}><span style={{background:C.blueLight,color:C.blue,borderRadius:6,padding:"2px 9px",fontWeight:700,fontSize:12}}>{l.u}</span></td>
          <td style={{padding:"12px 15px",color:C.textPrimary}}>{l.a}</td>
          <td style={{padding:"12px 15px",color:C.red,fontSize:12}}>{l.de}</td>
          <td style={{padding:"12px 15px",color:C.green,fontSize:12,fontWeight:700}}>{l.para}</td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>;
}

// ── CONFIG ────────────────────────────────────────────────
function Config(){
  const [cfg,setCfg]=useState({metaAnual:"140000",metaConversao:"25",bonusAnual:"40",penalidadeSemestral:"15",penalidadeAnual:"20",semVendaLimite:"200"});
  const [ok,setOk]=useState(false);
  return <div style={{maxWidth:600}}>
    <h2 style={{fontFamily:"Exo 2",fontWeight:700,fontSize:19,margin:"0 0 18px",color:C.textPrimary}}>Configurações</h2>
    <Card style={{padding:28}}>
      {ok&&<div style={{background:C.greenLight,border:`1px solid rgba(0,168,107,0.3)`,borderRadius:9,padding:"11px 15px",marginBottom:18,display:"flex",alignItems:"center",gap:9}}><Check size={15} color={C.green}/><span style={{color:C.green,fontWeight:700,fontSize:13}}>Salvo!</span></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {[{k:"metaAnual",l:"Meta Anual (R$)",h:"Valor total esperado no ano"},{k:"metaConversao",l:"Meta Conversão (%)",h:"Contratos ÷ Leads"},{k:"bonusAnual",l:"Bônus Anual acima (%)",h:"Mínimo para bônus"},{k:"penalidadeSemestral",l:"Mínimo Semestral (%)",h:"Abaixo = -5% comissão"},{k:"penalidadeAnual",l:"Mínimo Anual (%)",h:"Abaixo = redução"},{k:"semVendaLimite",l:"Venda mínima (R$)",h:"Abaixo = mês sem venda"}].map(f=>(
          <div key={f.k}>
            <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{f.l}</label>
            <input value={cfg[f.k]} onChange={e=>setCfg(c=>({...c,[f.k]:e.target.value}))} style={{width:"100%",padding:"10px 13px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.textPrimary,outline:"none",boxSizing:"border-box",fontFamily:"DM Sans",fontWeight:600}}/>
            <p style={{margin:"3px 0 0",fontSize:11,color:C.textSecondary}}>{f.h}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>{setOk(true);setTimeout(()=>setOk(false),3000);}} style={{marginTop:22,padding:"11px 26px",borderRadius:9,border:"none",background:C.gradBlue,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"Exo 2",display:"flex",alignItems:"center",gap:7}}><Save size={15}/> Salvar</button>
    </Card>
  </div>;
}

// ── CREDENCIAIS ───────────────────────────────────────────
const ADMINS=[
  {nome:"John",email:"john@vb.internal",senha:"VB2026#@"},
  {nome:"David",email:"david@vb.internal",senha:"VB2026#@"},
  {nome:"Patrick",email:"patrick@vb.internal",senha:"VB2026#@"},
];

// ── TELA INICIAL ──────────────────────────────────────────
function TelaInicial({onSelectAdmin,onSelectVendedor}){
  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
    {/* Logo */}
    <div style={{textAlign:"center",marginBottom:48}}>
      <div style={{width:64,height:64,borderRadius:16,background:C.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Exo 2",fontWeight:800,fontSize:26,color:"#fff",margin:"0 auto 16px"}}>VB</div>
      <h1 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:28,margin:"0 0 6px",color:C.textPrimary}}>Voip do Brasil</h1>
      <p style={{margin:0,fontSize:15,color:C.textSecondary}}>Sistema Comercial 2026</p>
    </div>
    {/* Dois botões grandes */}
    <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
      {/* Admin */}
      <button onClick={onSelectAdmin} style={{width:220,padding:"36px 24px",borderRadius:20,border:`2px solid ${C.blue}`,background:C.white,cursor:"pointer",boxShadow:C.shadowBlue,transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}
        onMouseEnter={e=>{e.currentTarget.style.background=C.blueLight;e.currentTarget.style.transform="translateY(-4px)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.transform="translateY(0)";}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:C.gradBlue,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M20 21a8 8 0 1 0-16 0"/>
            <circle cx="19" cy="8" r="3" fill="#fff" stroke="none"/><line x1="19" y1="6" x2="19" y2="10" stroke={C.blue} strokeWidth="1.5"/><line x1="17" y1="8" x2="21" y2="8" stroke={C.blue} strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{textAlign:"center"}}>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:18,margin:"0 0 4px",color:C.blue}}>Acesso Admin</p>
          <p style={{margin:0,fontSize:12,color:C.textSecondary}}>John · David · Patrick</p>
        </div>
      </button>
      {/* Vendedor */}
      <button onClick={onSelectVendedor} style={{width:220,padding:"36px 24px",borderRadius:20,border:`2px solid ${C.green}`,background:C.white,cursor:"pointer",boxShadow:"0 4px 24px rgba(0,168,107,0.12)",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}
        onMouseEnter={e=>{e.currentTarget.style.background=C.greenLight;e.currentTarget.style.transform="translateY(-4px)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.transform="translateY(0)";}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:C.gradGreen,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style={{textAlign:"center"}}>
          <p style={{fontFamily:"Exo 2",fontWeight:800,fontSize:18,margin:"0 0 4px",color:C.green}}>Acesso Vendedor</p>
          <p style={{margin:0,fontSize:12,color:C.textSecondary}}>Analu · Thais · Tamires<br/>Carlos · Edson · Izabel</p>
        </div>
      </button>
    </div>
  </div>;
}

// ── LOGIN ADMIN ───────────────────────────────────────────
function LoginAdmin({onBack,onLogin}){
  const [nome,setNome]=useState("");
  const [senha,setSenha]=useState("");
  const [erro,setErro]=useState("");
  const entrar=()=>{
    const u=ADMINS.find(a=>a.nome===nome&&a.senha===senha);
    if(u)onLogin(u);else setErro("Nome ou senha incorretos.");
  };
  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
    <div style={{background:C.white,borderRadius:20,padding:40,width:380,boxShadow:C.shadowMd,border:`1px solid ${C.border}`}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.textSecondary,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:4}}>← Voltar</button>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:C.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        </div>
        <h2 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 4px",color:C.textPrimary}}>Acesso Admin</h2>
        <p style={{margin:0,fontSize:13,color:C.textSecondary}}>Voip do Brasil · 2026</p>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Nome</label>
        <select value={nome} onChange={e=>setNome(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.textPrimary,outline:"none",fontFamily:"DM Sans",fontWeight:600,background:C.white}}>
          <option value="">Selecione...</option>
          {ADMINS.map(a=><option key={a.nome} value={a.nome}>{a.nome}</option>)}
        </select>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Senha</label>
        <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&entrar()} placeholder="••••••••"
          style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1px solid ${erro?C.red:C.border}`,fontSize:14,color:C.textPrimary,outline:"none",boxSizing:"border-box",fontFamily:"DM Sans",fontWeight:600}}/>
      </div>
      {erro&&<p style={{color:C.red,fontSize:12,margin:"0 0 14px",fontWeight:600}}>{erro}</p>}
      <button onClick={entrar} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:C.gradBlue,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:"Exo 2"}}>Entrar</button>
    </div>
  </div>;
}

// ── LOGIN VENDEDOR ────────────────────────────────────────
function LoginVendedor({onBack,onLogin}){
  const [nome,setNome]=useState("");
  const [senha,setSenha]=useState("");
  const [erro,setErro]=useState("");
  const entrar=()=>{
    const u=VENDEDORES_AUTH.find(v=>v.nome===nome&&v.senha===senha);
    if(u)onLogin(u);else setErro("Nome ou senha incorretos.");
  };
  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
    <div style={{background:C.white,borderRadius:20,padding:40,width:380,boxShadow:"0 4px 24px rgba(0,168,107,0.12)",border:`1px solid rgba(0,168,107,0.2)`}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.textSecondary,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:4}}>← Voltar</button>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:C.gradGreen,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h2 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:22,margin:"0 0 4px",color:C.green}}>Acesso Vendedor</h2>
        <p style={{margin:0,fontSize:13,color:C.textSecondary}}>Voip do Brasil · 2026</p>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Seu nome</label>
        <select value={nome} onChange={e=>setNome(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.textPrimary,outline:"none",fontFamily:"DM Sans",fontWeight:600,background:C.white}}>
          <option value="">Selecione...</option>
          {VENDEDORES_AUTH.map(v=><option key={v.nome} value={v.nome}>{v.nome}</option>)}
        </select>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{fontSize:11,fontWeight:700,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Senha</label>
        <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&entrar()} placeholder="••••••••"
          style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1px solid ${erro?C.red:C.border}`,fontSize:14,color:C.textPrimary,outline:"none",boxSizing:"border-box",fontFamily:"DM Sans",fontWeight:600}}/>
      </div>
      {erro&&<p style={{color:C.red,fontSize:12,margin:"0 0 14px",fontWeight:600}}>{erro}</p>}
      <button onClick={entrar} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:C.gradGreen,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:"Exo 2"}}>Entrar</button>
    </div>
  </div>;
}

// ── APP ───────────────────────────────────────────────────
export default function App(){
  const [tela,setTela]=useState("inicial"); // inicial | loginAdmin | loginVendedor | admin | vendedor
  const [usuario,setUsuario]=useState(null);
  const [active,setActive]=useState("dashboard");
  const [open,setOpen]=useState(true);
  const [ano,setAno]=useState("2026");

  if(tela==="inicial") return <TelaInicial onSelectAdmin={()=>setTela("loginAdmin")} onSelectVendedor={()=>setTela("loginVendedor")}/>;
  if(tela==="loginAdmin") return <LoginAdmin onBack={()=>setTela("inicial")} onLogin={u=>{setUsuario(u);setTela("admin");}}/>;
  if(tela==="loginVendedor") return <LoginVendedor onBack={()=>setTela("inicial")} onLogin={u=>{setUsuario(u);setTela("vendedor");}}/>;
  if(tela==="vendedor") return <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh",color:C.textPrimary}}><link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/><div style={{padding:"20px 24px"}}><Lancar usuarioExterno={usuario} onLogout={()=>{setUsuario(null);setTela("inicial");}}/></div></div>;
  const menu=[
    {id:"dashboard",icon:<LayoutDashboard size={17}/>,label:"Dashboard"},
    {id:"aprovacoes",icon:<ClipboardCheck size={17}/>,label:"Aprovações",badge:lancamentosPendentes.filter(l=>l.status==="pendente").length},
    {id:"lancar",icon:<Edit3 size={17}/>,label:"Lançar (Vendedor)"},
    {id:"vendedores",icon:<Users size={17}/>,label:"Vendedores"},
    {id:"log",icon:<FileText size={17}/>,label:"Log de Alterações"},
    {id:"config",icon:<Settings size={17}/>,label:"Configurações"},
  ];
  const screens={dashboard:<Dashboard/>,aprovacoes:<Aprovacoes/>,lancar:<Lancar/>,vendedores:<Vendedores/>,log:<Log/>,config:<Config/>};
  return <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh",display:"flex",color:C.textPrimary}}>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
    <div style={{width:open?224:60,minHeight:"100vh",background:C.white,borderRight:`1px solid ${C.border}`,transition:"width 0.3s",display:"flex",flexDirection:"column",position:"fixed",zIndex:100,top:0,left:0,bottom:0,boxShadow:"2px 0 14px rgba(0,87,255,0.06)"}}>
      <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:34,height:34,borderRadius:8,background:C.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Exo 2",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>VB</div>
        {open&&<div><p style={{margin:0,fontFamily:"Exo 2",fontWeight:700,fontSize:13,color:C.textPrimary}}>Voip do Brasil</p><p style={{margin:0,fontSize:10,color:C.textSecondary}}>Comercial {ano}</p></div>}
      </div>
      <nav style={{flex:1,padding:"8px 6px"}}>
        {menu.map(item=><button key={item.id} onClick={()=>setActive(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 11px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:active===item.id?C.blueLight:"transparent",color:active===item.id?C.blue:C.textSecondary,transition:"all 0.15s",fontFamily:"DM Sans",fontSize:13,fontWeight:active===item.id?700:500}}>
          {item.icon}{open&&<span style={{whiteSpace:"nowrap",flex:1}}>{item.label}</span>}{open&&item.badge>0&&<span style={{background:C.red,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{item.badge}</span>}
        </button>)}
      </nav>
      <div style={{padding:"8px 6px",borderTop:`1px solid ${C.border}`}}>
        <button style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 11px",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:C.red,fontFamily:"DM Sans",fontSize:13}}>
          <LogOut size={17}/>{open&&<span>Sair</span>}
        </button>
      </div>
    </div>
    <div style={{marginLeft:open?224:60,flex:1,transition:"margin-left 0.3s"}}>
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(10px)",borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:C.textSecondary,cursor:"pointer"}}><Menu size={19}/></button>
          <div>
            <h1 style={{fontFamily:"Exo 2",fontWeight:800,fontSize:17,margin:0,color:C.textPrimary}}>{menu.find(m=>m.id===active)?.label}</h1>
            <p style={{margin:0,fontSize:11,color:C.textSecondary}}>Voip do Brasil · {ano}</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <select value={ano} onChange={e=>setAno(e.target.value)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:C.textPrimary,padding:"6px 11px",fontSize:13,fontFamily:"DM Sans",fontWeight:600}}>
            {["2024","2025","2026","2027","2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <div style={{display:"flex",alignItems:"center",gap:7,background:C.blueLight,borderRadius:8,padding:"6px 12px",border:`1px solid ${C.borderBlue}`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>AD</div>
            <span style={{fontSize:13,color:C.blue,fontWeight:700}}>Admin</span>
          </div>
        </div>
      </div>
      <div style={{padding:"20px 24px"}}>{screens[active]}</div>
    </div>
  </div>;
}
