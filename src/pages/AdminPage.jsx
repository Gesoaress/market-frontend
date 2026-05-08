import { useState, useEffect, useCallback } from 'react';
import { adminListSellers, adminDeleteSeller, adminToggleSeller } from '../services/api';

export default function AdminPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setSellers(await adminListSellers()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async id => {
    if (!window.confirm('Apagar este mercado permanentemente?')) return;
    try { await adminDeleteSeller(id); await load(); }
    catch (e) { alert(e.message); }
  };

  const handleToggle = async id => {
    try { await adminToggleSeller(id); await load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="toolbar">
        <span className="toolbar-title">Gerenciar Mercados</span>
        <div className="toolbar-right">
          <button className="btn btn-sm btn-sec" onClick={load}>↺ Atualizar</button>
        </div>
      </div>

      <div className="page-content" style={{ flex: 1, overflowY: 'auto' }}>
        {error && <div className="err-msg" style={{ marginBottom: 10 }}>⚠ {error}</div>}

        {loading ? (
          <div className="empty"><span className="spinner" /></div>
        ) : sellers.length === 0 ? (
          <div className="empty">Nenhum mercado cadastrado.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#777' }}>
                      {String(s.id).padStart(4, '0')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.cnpj}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-ok' : 'badge-off'}`}>
                        {s.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-sm btn-sec"
                          onClick={() => handleToggle(s.id)}
                          title={s.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                          style={{ padding: '2px 7px' }}
                        >
                          {s.status === 'ACTIVE' ? '⏸' : '▶'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(s.id)}
                          title="Apagar"
                          style={{ padding: '2px 7px' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
