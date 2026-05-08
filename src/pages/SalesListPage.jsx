import { useState, useEffect, useCallback } from 'react';
import { listOrders } from '../services/api';

const fmt   = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
const fmtDt = s => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
};

export default function SalesListPage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setOrders(await listOrders()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalGeral = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="toolbar">
        <span className="toolbar-title">Histórico de Vendas</span>
        <div className="toolbar-right">
          <button className="btn btn-sm btn-sec" onClick={load}>↺ Atualizar</button>
        </div>
      </div>

      <div className="page-content" style={{ flex:1, overflowY:'auto' }}>
        {error && <div className="err-msg" style={{ marginBottom:10 }}>⚠ {error}</div>}

        <div className="stats-grid" style={{ marginBottom:16 }}>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <div className="stat-val">{orders.length}</div>
              <div className="stat-lbl">Vendas Realizadas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <div className="stat-val">{fmt(totalGeral)}</div>
              <div className="stat-lbl">Valor Total</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty"><span className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty">Nenhuma venda registrada.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {orders.map(o => (
              <div key={o.id} style={{ border:'1px solid #2a3a1a', borderRadius:6, overflow:'hidden' }}>

                {/* Cabeçalho do pedido */}
                <div
                  onClick={() => toggle(o.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                    background:'#111a0d', cursor:'pointer',
                    borderBottom: expanded[o.id] ? '1px solid #2a3a1a' : 'none'
                  }}
                >
                  <span style={{ fontFamily:'monospace', fontSize:12, color:'#6aaf3d', fontWeight:700 }}>
                    #{String(o.id).padStart(5,'0')}
                  </span>
                  <span style={{ flex:1, fontSize:12, color:'#aaa' }}>
                    {o.itens.length} produto(s)
                  </span>
                  <span style={{ fontFamily:'monospace', fontWeight:700, color:'#6aaf3d', fontSize:13 }}>
                    {fmt(o.total)}
                  </span>
                  <span style={{ fontSize:11, color:'#555', minWidth:110, textAlign:'right' }}>
                    {fmtDt(o.created_at)}
                  </span>
                  <span style={{ fontSize:11, color:'#555', marginLeft:6 }}>
                    {expanded[o.id] ? '▲' : '▼'}
                  </span>
                </div>

                {/* Itens do pedido */}
                {expanded[o.id] && (
                  <table style={{ width:'100%' }}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd.</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.itens.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight:600 }}>{item.product_nome ?? '-'}</td>
                          <td>{item.quantidade}</td>
                          <td style={{ fontFamily:'monospace' }}>{fmt(item.preco_unitario)}</td>
                          <td style={{ fontFamily:'monospace', fontWeight:700, color:'#6aaf3d' }}>{fmt(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
