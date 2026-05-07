import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getDashboard, listSales } from '../services/api';

const fmt   = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
const fmtDt = s => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
};
const fmtDia = s => {
  const [, m, d] = s.split('-');
  return `${d}/${m}`;
};

const COLORS = ['#6aaf3d','#4a8f2d','#8ecf5a','#3d7a20','#a8e070'];

const TooltipMoeda = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1a2a14', border:'1px solid #4a6a34', borderRadius:4, padding:'6px 10px', fontSize:11 }}>
      <div style={{ color:'#aaa', marginBottom:2 }}>{label}</div>
      <div style={{ color:'#8ecf5a', fontWeight:700 }}>{fmt(payload[0].value)}</div>
    </div>
  );
};

const TooltipQtd = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1a2a14', border:'1px solid #4a6a34', borderRadius:4, padding:'6px 10px', fontSize:11 }}>
      <div style={{ color:'#aaa', marginBottom:2 }}>{label}</div>
      <div style={{ color:'#8ecf5a', fontWeight:700 }}>{payload[0].value} un.</div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, v] = await Promise.all([getDashboard(), listSales()]);
      setStats(s);
      setSales(v.slice(0, 5));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="toolbar">
        <span className="toolbar-title">Dashboard</span>
        <div className="toolbar-right">
          <button className="btn btn-sm btn-sec" onClick={load}>↺ Atualizar</button>
        </div>
      </div>

      <div className="page-content" style={{ flex:1, overflowY:'auto' }}>
        {error && <div className="err-msg" style={{ marginBottom:10 }}>⚠ {error}</div>}

        {loading ? (
          <div className="empty"><span className="spinner" /></div>
        ) : stats && (
          <>
            {/* Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div>
                  <div className="stat-val">{stats.total_produtos}</div>
                  <div className="stat-lbl">Produtos Ativos</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div>
                  <div className="stat-val">{stats.total_estoque}</div>
                  <div className="stat-lbl">Itens em Estoque</div>
                  <div className="stat-sub">unidades totais</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div>
                  <div className="stat-val">{fmt(stats.total_vendido)}</div>
                  <div className="stat-lbl">Total Vendido</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div>
                  <div className="stat-val">{stats.num_vendas}</div>
                  <div className="stat-lbl">Vendas Realizadas</div>
                </div>
              </div>
              {stats.baixo_estoque > 0 && (
                <div className="stat-card" style={{ borderColor:'#c0392b' }}>
                  <div className="stat-icon">⚠️</div>
                  <div>
                    <div className="stat-val" style={{ color:'#c0392b' }}>{stats.baixo_estoque}</div>
                    <div className="stat-lbl">Estoque Baixo</div>
                    <div className="stat-sub">precisam reposição</div>
                  </div>
                </div>
              )}
            </div>

            {/* Gráficos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>

              {/* Vendas por dia */}
              <div className="groupbox">
                <div className="groupbox-title">Vendas — Últimos 7 dias</div>
                <div className="groupbox-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.vendas_por_dia} margin={{ top:4, right:8, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1a" />
                      <XAxis dataKey="dia" tickFormatter={fmtDia} tick={{ fontSize:10, fill:'#888' }} />
                      <YAxis tickFormatter={v => 'R$'+v} tick={{ fontSize:10, fill:'#888' }} width={48} />
                      <Tooltip content={<TooltipMoeda />} />
                      <Line type="monotone" dataKey="total" stroke="#6aaf3d" strokeWidth={2} dot={{ r:3, fill:'#6aaf3d' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top produtos */}
              <div className="groupbox">
                <div className="groupbox-title">Top Produtos Mais Vendidos</div>
                <div className="groupbox-body">
                  {stats.top_produtos.length === 0 ? (
                    <div className="empty" style={{ height:200 }}>Sem vendas ainda.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.top_produtos} margin={{ top:4, right:8, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1a" />
                        <XAxis dataKey="nome" tick={{ fontSize:10, fill:'#888' }} />
                        <YAxis tick={{ fontSize:10, fill:'#888' }} />
                        <Tooltip content={<TooltipQtd />} />
                        <Bar dataKey="quantidade" radius={[3,3,0,0]}>
                          {stats.top_produtos.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Últimas vendas */}
            <div className="groupbox" style={{ marginTop:12 }}>
              <div className="groupbox-title">Últimas Vendas</div>
              <div className="groupbox-body" style={{ padding:0 }}>
                {sales.length === 0 ? (
                  <div className="empty">Nenhuma venda registrada.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd.</th>
                        <th>Total</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(v => (
                        <tr key={v.id}>
                          <td style={{ fontWeight:600 }}>{v.product_nome ?? '-'}</td>
                          <td>{v.quantidade}</td>
                          <td style={{ fontFamily:'monospace', fontWeight:700 }}>{fmt(v.total)}</td>
                          <td style={{ fontSize:11, color:'#777' }}>{fmtDt(v.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
