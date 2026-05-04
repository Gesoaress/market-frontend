const BASE = 'http://localhost:5000/api';

const token = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: authH(), body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.erro || 'Erro na requisição');
  return data;
}

export const login = (email, senha) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: senha }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || d.erro || 'Credenciais inválidas'); return d; });

export const createSeller = ({ nome, cnpj, email, celular, senha }) =>
  fetch(`${BASE}/sellers`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome, cnpj, email, phone: celular, password: senha }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || d.erro || 'Erro ao cadastrar'); return d; });

export const activateSeller = (celular, codigo) =>
  fetch(`${BASE}/sellers/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: celular, code: codigo }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || d.erro || 'Código inválido'); return d; });

export const listProducts      = ()      => req('GET',   '/products');
export const getProduct        = id      => req('GET',   `/products/${id}`);
export const createProduct     = payload => req('POST',  '/products', payload);
export const updateProduct     = (id, p) => req('PUT',   `/products/${id}`, p);
export const inactivateProduct = id      => req('PATCH', `/products/${id}/inactivate`);
export const createSale        = (produtoId, quantidade) => req('POST', '/sales', { product_id: produtoId, quantity: quantidade });