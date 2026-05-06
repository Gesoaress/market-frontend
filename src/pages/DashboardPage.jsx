import { useState, useEffect, useCallback } from 'react';
import { listProducts } from '../services/api';

const BASE = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

async function listSales() {
  const res = await fetch(`${BASE}/sales`, { headers: authH() });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(data.message || 'Erro ao buscar vendas');
  return data;
}

const fmt = p => 'R$ ' + Number(p).toFixed(2).replace('.', ',');
const EMOJI = ['📦','🥛','🍚','🫘','🥕','🧀','🍳','🌽','🥜','🧅'];
const em = n => { let h=0; for(const c of n) h=(h*31+c.charCodeAt(0))&0xffff; return EMOJI[h%EMOJI.length]; };

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [sales,    setSales]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [p, s] = await Promise.all([listProducts(), listSales()]);
      setProducts(p);
      setSales(s);
      setLastUpdate(new Date());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh a cada 30s
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  // Indicadores
  const totalEstoque   = products.reduce((s, p) => s + p.quantidade, 0);
  const prodAtivos     = products.filter(p => p.status === 'Ativo').length;
  const prodBaixo      = products.filter(p => p.status === 'Ativo' && p.quantidade > 0 && p.quantidade < 15).length;
  const semEstoque     = products.filter(p => p.quantidade === 0).length;

  const totalVendido   = sales.reduce((s, v) => s + (v.precoUnitario ?? v.preco_unitario ?? 0) * (v.quantidade ?? 1), 0);
  const qtdVendas      = sales.length;

  // Top 5 produtos mais vendidos
  const vendaPorProd = {};
  sales.forEach(v => {
    const id = v.produtoId ?? v.produto_id;
    vendaPorProd[id] = (vendaPorProd[id] || 0) + (v.quantidade ?? 1);
  });
  const topProdutos = Object.entries(vendaPorProd)
    .map(([id, qtd]) => ({ id, qtd, prod: products.find(p => String(p.id) === String(id)) }))
    .filter(x => x.prod)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  // Últimas 5 vendas
  const ultimasVendas = [...sales].reverse().slice(0, 5);

  // Produtos com estoque baixo
  const baixoEstoque = products
    .filter(p => p.status === 'Ativo' && p.quantidade < 15)
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, 6);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="toolbar"><span className="toolbar-title">Dashboard</span></div>
      <div className="page-content"><div className="empty"><span className="spinner" /></div></div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Toolbar */}
      <div className="toolbar">
        <span className="toolbar-title">📊 Dashboard</span>
        <div className="toolbar-right">
          <span style={{ fontSize:10, color:'#888' }}>
            Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
          </span>
          <button className="btn btn-sm btn-sec" onClick={load}>↺ Atualizar</button>
        </div>
      </div>

      <div className="page-content" style={{ flex:1, overflowY:'auto' }}>
        {error && <div className="err-msg" style={{ marginBottom:10 }}>⚠ {error}</div>}

        {/* KPIs principais */}
        <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:14 }}>
          {[
            { icon:'💰', val: fmt(totalVendido), lbl:'Valor Total Vendido',    sub:`${qtdVendas} vendas registradas`,     color:'#2d6a1f' },
            { icon:'📦', val: totalEstoque,      lbl:'Unidades em Estoque',    sub:`${prodAtivos} produtos ativos`,        color:'#0055cc' },
            { icon:'⚠️', val: prodBaixo,         lbl:'Produtos Estoque Baixo', sub:'menos de 15 unidades',                color:'#8a6000' },
            { icon:'🚫', val: semEstoque,         lbl:'Sem Estoque',            sub:'precisam reposição urgente',           color:'#cc2222' },
          ].map(s => (
            <div className="stat-card" key={s.lbl}>
              <div className="stat-icon">{s.icon}</div>
              <div>
                <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Segunda linha: Top produtos + Últimas vendas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>

          {/* Top Produtos mais vendidos */}
          <div className="groupbox">
            <div className="groupbox-title">🏆 Produtos Mais Vendidos</div>
            <div style={{ padding:'8px 0' }}>
              {topProdutos.length === 0 ? (
                <div className="empty" style={{ padding:20 }}>Nenhuma venda registrada.</div>
              ) : topProdutos.map((item, i) => {
                const maxQtd = topProdutos[0].qtd;
                const pct = Math.round((item.qtd / maxQtd) * 100);
                return (
                  <div key={item.id} style={{ padding:'6px 12px', borderBottom: i < topProdutos.length-1 ? '1px solid #e8f0e0' : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{
                        width:18, height:18, borderRadius:'50%',
                        background: i === 0 ? 'linear-gradient(135deg,#ffd700,#b8860b)' : i === 1 ? 'linear-gradient(135deg,#c0c0c0,#808080)' : i === 2 ? 'linear-gradient(135deg,#cd7f32,#8b4513)' : '#e0e8d8',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:700, color: i < 3 ? '#fff' : '#666', flexShrink:0
                      }}>{i+1}</span>
                      <span style={{ fontSize:14 }}>{item.prod.img
                        ? <img src={item.prod.img} alt="" style={{ width:16,height:16,objectFit:'cover',borderRadius:2 }} />
                        : em(item.prod.nome)}</span>
                      <span style={{ flex:1, fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.prod.nome}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#2d6a1f' }}>{item.qtd} un.</span>
                    </div>
                    <div style={{ height:5, background:'#e8f0e0', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#76c442,#3a8c2a)', borderRadius:3, transition:'width .4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimas vendas */}
          <div className="groupbox">
            <div className="groupbox-title">🕐 Últimas Vendas</div>
            {ultimasVendas.length === 0 ? (
              <div className="empty" style={{ padding:20 }}>Nenhuma venda registrada.</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>
                    <th style={{ padding:'5px 10px', textAlign:'left', fontSize:11, fontWeight:700, color:'#2d6a1f', borderBottom:'1px solid #a8c090', background:'linear-gradient(180deg,#d4e8bc,#c0d8a4)' }}>Produto</th>
                    <th style={{ padding:'5px 10px', textAlign:'center', fontSize:11, fontWeight:700, color:'#2d6a1f', borderBottom:'1px solid #a8c090', background:'linear-gradient(180deg,#d4e8bc,#c0d8a4)' }}>Qtd</th>
                    <th style={{ padding:'5px 10px', textAlign:'right', fontSize:11, fontWeight:700, color:'#2d6a1f', borderBottom:'1px solid #a8c090', background:'linear-gradient(180deg,#d4e8bc,#c0d8a4)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVendas.map((v, i) => {
                    const prod = products.find(p => String(p.id) === String(v.produtoId ?? v.produto_id));
                    const total = (v.precoUnitario ?? v.preco_unitario ?? 0) * (v.quantidade ?? 1);
                    return (
                      <tr key={v.id ?? i}>
                        <td style={{ padding:'5px 10px', borderBottom:'1px solid #e8f0e0', background: i%2===0?'#fff':'#f8fbf4' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ fontSize:13 }}>{prod ? (prod.img ? <img src={prod.img} alt="" style={{ width:14,height:14,objectFit:'cover',borderRadius:2 }} /> : em(prod.nome)) : '📦'}</span>
                            <span style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:130 }}>{prod?.nome ?? `Produto #${v.produtoId ?? v.produto_id}`}</span>
                          </div>
                        </td>
                        <td style={{ padding:'5px 10px', textAlign:'center', fontWeight:700, borderBottom:'1px solid #e8f0e0', background: i%2===0?'#fff':'#f8fbf4' }}>{v.quantidade ?? 1}</td>
                        <td style={{ padding:'5px 10px', textAlign:'right', fontWeight:700, color:'#2d6a1f', fontFamily:'monospace', borderBottom:'1px solid #e8f0e0', background: i%2===0?'#fff':'#f8fbf4' }}>{fmt(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Estoque crítico */}
        {baixoEstoque.length > 0 && (
          <div className="groupbox">
            <div className="groupbox-title" style={{ color:'#8a6000' }}>⚠️ Monitoramento de Estoque — Itens Críticos</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0 }}>
              {baixoEstoque.map((p, i) => {
                const pct = Math.min(100, Math.round((p.quantidade / 15) * 100));
                const cor = p.quantidade === 0 ? '#cc2222' : p.quantidade < 5 ? '#cc2222' : '#8a6000';
                return (
                  <div key={p.id} style={{
                    padding:'10px 14px',
                    borderRight: i%3 < 2 ? '1px solid #e8f0e0' : 'none',
                    borderBottom: i < baixoEstoque.length - 3 ? '1px solid #e8f0e0' : 'none',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <span style={{ fontSize:16 }}>{p.img ? <img src={p.img} alt="" style={{ width:18,height:18,objectFit:'cover',borderRadius:3 }} /> : em(p.nome)}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nome}</div>
                        <div style={{ fontSize:11, color: cor, fontWeight:700 }}>
                          {p.quantidade === 0 ? '🚫 Sem estoque' : `${p.quantidade} unidades`}
                        </div>
                      </div>
                    </div>
                    <div style={{ height:6, background:'#e8f0e0', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: p.quantidade === 0 ? '#cc2222' : p.quantidade < 5 ? 'linear-gradient(90deg,#e05050,#cc2222)' : 'linear-gradient(90deg,#e6c460,#b8860b)', borderRadius:3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
