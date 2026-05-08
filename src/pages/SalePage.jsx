import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProducts, createOrder } from '../services/api';

const fmt   = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
const EMOJI = ['📦','🥛','🍚','🫘','🥕','🧀','🍳','🌽','🥜','🧅'];
const em    = n => { let h=0; for(const c of n) h=(h*31+c.charCodeAt(0))&0xffff; return EMOJI[h%EMOJI.length]; };
const CATS  = ['Todas','Bebidas','Alimentos','Laticínios','Higiene','Limpeza','Hortifruti','Cereais e Grãos','Outros'];

export default function SalePage() {
  const navigate = useNavigate();
  const [products,   setProducts]   = useState([]);
  const [categoria,  setCategoria]  = useState('Todas');
  const [loading,    setLoading]    = useState(true);
  const [cart,       setCart]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await listProducts();
      setProducts(d.filter(p => p.status === 'Ativo' && p.quantidade > 0));
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addToCart = p => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) {
        if (existing.qty >= p.quantidade) return prev;
        return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.product.id === id ? { ...i, qty: Math.max(1, Math.min(i.product.quantidade, i.qty + delta)) } : i)
    );
  };

  const removeFromCart = id => setCart(prev => prev.filter(i => i.product.id !== id));

  const total = cart.reduce((s, i) => s + i.product.preco * i.qty, 0);

  const confirm = async () => {
    if (cart.length === 0) return;
    setError(''); setSubmitting(true);
    try {
      await createOrder(cart.map(i => ({ product_id: i.product.id, quantity: i.qty })));
      setSuccess(true);
      setCart([]);
      await load();
      setTimeout(() => setSuccess(false), 3000);
    } catch(e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const visible = products.filter(p => categoria === 'Todas' || p.categoria === categoria);
  const activeCats = ['Todas', ...Array.from(new Set(products.map(p => p.categoria || 'Outros')))];
  const inCart = id => cart.find(i => i.product.id === id);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button className="btn btn-sm btn-sec" onClick={() => navigate('/dashboard')}>← Voltar</button>
          <span className="toolbar-title">Registrar Venda</span>
        </div>
        {cart.length > 0 && (
          <div style={{ fontSize:12, color:'#6aaf3d', fontWeight:600 }}>
            {cart.length} produto(s) no carrinho — {fmt(total)}
          </div>
        )}
      </div>

      {/* Barra de categorias */}
      <div style={{ display:'flex', gap:6, padding:'8px 12px', borderBottom:'1px solid #2a3a1a', overflowX:'auto', flexShrink:0 }}>
        {activeCats.map(c => (
          <button key={c} onClick={() => setCategoria(c)} style={{
            padding:'4px 12px', borderRadius:14, fontSize:11, whiteSpace:'nowrap', cursor:'pointer',
            border: categoria === c ? 'none' : '1px solid #4a6a34',
            background: categoria === c ? '#6aaf3d' : 'transparent',
            color: categoria === c ? '#fff' : '#aaa',
            fontFamily:'var(--font)'
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Grade de produtos */}
      <div style={{ flex:1, overflowY:'auto', padding:12 }}>
        {success && <div className="success-bar" style={{ marginBottom:10 }}>✅ Venda finalizada com sucesso!</div>}
        {loading ? (
          <div className="empty"><span className="spinner" /></div>
        ) : visible.length === 0 ? (
          <div className="empty">Nenhum produto nesta categoria.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
            {visible.map(p => {
              const item = inCart(p.id);
              const sel  = !!item;
              return (
                <div key={p.id} onClick={() => addToCart(p)} style={{
                  border: sel ? '2px solid #6aaf3d' : '1px solid #2a3a1a',
                  borderRadius:6, padding:10, cursor:'pointer',
                  background: sel ? '#1a3a10' : '#111a0d',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  position:'relative', transition:'border 0.15s'
                }}>
                  {sel && (
                    <div style={{
                      position:'absolute', top:5, right:5, background:'#6aaf3d', color:'#fff',
                      borderRadius:'50%', width:18, height:18, fontSize:10, fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>{item.qty}</div>
                  )}
                  <div style={{ fontSize:28 }}>
                    {p.img
                      ? <img src={p.img} alt="" style={{ width:36,height:36,objectFit:'cover',borderRadius:4 }} />
                      : em(p.nome)}
                  </div>
                  <div style={{ fontWeight:600, fontSize:11, textAlign:'center', color:'#ddd' }}>{p.nome}</div>
                  <div style={{ fontSize:10, color:'#666' }}>{p.categoria || 'Outros'}</div>
                  <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#6aaf3d' }}>{fmt(p.preco)}</div>
                  <div style={{ fontSize:10, color: p.quantidade <= 5 ? '#c0392b' : '#555' }}>
                    {p.quantidade} em estoque
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé — carrinho */}
      <div style={{ borderTop:'2px solid #2a3a1a', background:'#0d1a08', flexShrink:0 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign:'center', color:'#444', fontSize:12, padding:'10px 0' }}>
            Clique nos produtos para adicioná-los à venda
          </div>
        ) : (
          <>
            {/* Lista de itens do carrinho */}
            <div style={{ maxHeight:140, overflowY:'auto', borderBottom:'1px solid #1a2a14' }}>
              {cart.map(i => (
                <div key={i.product.id} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'6px 14px',
                  borderBottom:'1px solid #1a2a14', fontSize:12
                }}>
                  <span style={{ flex:1, fontWeight:600, color:'#ccc' }}>{i.product.nome}</span>
                  <span style={{ fontSize:10, color:'#666', minWidth:60 }}>{fmt(i.product.preco)}/un</span>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <button className="qty-btn" onClick={e => { e.stopPropagation(); changeQty(i.product.id, -1); }}>−</button>
                    <span className="qty-num" style={{ minWidth:24, textAlign:'center' }}>{i.qty}</span>
                    <button className="qty-btn" onClick={e => { e.stopPropagation(); changeQty(i.product.id, 1); }}>+</button>
                  </div>
                  <span style={{ fontFamily:'monospace', fontWeight:700, color:'#6aaf3d', minWidth:72, textAlign:'right' }}>
                    {fmt(i.product.preco * i.qty)}
                  </span>
                  <button onClick={e => { e.stopPropagation(); removeFromCart(i.product.id); }}
                    style={{ background:'none', border:'none', color:'#c0392b', cursor:'pointer', fontSize:14, padding:'0 4px' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total + botão */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px' }}>
              <div>
                {error && <div className="err-msg" style={{ fontSize:11, marginBottom:4 }}>⚠ {error}</div>}
                <span style={{ fontSize:11, color:'#888' }}>{cart.length} item(s) · </span>
                <span style={{ fontSize:15, fontFamily:'monospace', fontWeight:700, color:'#6aaf3d' }}>{fmt(total)}</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm btn-sec" onClick={() => setCart([])}>🗑 Limpar</button>
                <button className="btn btn-sm" onClick={confirm} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : '✅ Finalizar Venda'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
