import { useState, useEffect, useCallback } from 'react';
import { listSales } from '../services/api';

const fmt    = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
const fmtDt  = s => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
};

export default function SalesListPage() {
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setSales(await listSales()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalGeral = sales.reduce((s, v) => s + v.total, 0);

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
              <div className="stat-val">{sales.length}</div>
              <div className="stat-lbl">Total de Vendas</div>
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

        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span className="spinner" /></div>
          ) : sales.length === 0 ? (
            <div className="empty">Nenhuma venda registrada.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Qtd.</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily:'monospace', fontSize:11, color:'#777' }}>{String(v.id).padStart(5,'0')}</td>
                    <td style={{ fontWeight:600 }}>{v.product_nome ?? '-'}</td>
                    <td>{v.quantidade}</td>
                    <td style={{ fontFamily:'monospace' }}>{fmt(v.preco_unitario)}</td>
                    <td style={{ fontFamily:'monospace', fontWeight:700 }}>{fmt(v.total)}</td>
                    <td style={{ fontSize:11, color:'#777' }}>{fmtDt(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
