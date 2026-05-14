const BASE = '/api';

const token = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: authH(), body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('seller');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!res.ok) throw new Error(data.msg || data.message || data.erro || 'Erro na requisição');
  return data;
}

export const login = (email, senha) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: senha }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.msg || d.message || d.erro || 'Credenciais inválidas'); return d; });

export const createSeller = ({ nome, cnpj, email, celular, senha }) =>
  fetch(`${BASE}/sellers`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome, cnpj, email, phone: celular, password: senha }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.msg || d.message || d.erro || 'Erro ao cadastrar'); return d; });

export const activateSeller = (celular, codigo) =>
  fetch(`${BASE}/sellers/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: celular, code: codigo }) })
  .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.msg || d.message || d.erro || 'Código inválido'); return d; });

export const uploadImage = file => {
  const form = new FormData();
  form.append('file', file);
  return fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: form })
    .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.erro || 'Erro no upload'); return d; });
};

export const listProducts      = ()      => req('GET',   '/products').then(d => d.produtos);
export const getProduct        = id      => req('GET',   `/products/${id}`).then(d => d.produto);
export const createProduct     = payload => req('POST',  '/products', payload);
export const updateProduct     = (id, p) => req('PUT',   `/products/${id}`, p);
export const inactivateProduct = id      => req('PATCH', `/products/${id}/inactivate`);
export const activateProduct   = id      => req('PATCH', `/products/${id}/activate`);
export const deleteProduct     = id      => req('DELETE', `/products/${id}`);
export const createOrder       = (items) => req('POST', '/sales', { items });
export const listOrders        = ()      => req('GET', '/sales').then(d => d.pedidos);
export const getDashboard      = ()      => req('GET', '/dashboard');

export const adminListSellers  = ()         => req('GET',    '/admin/sellers').then(d => d.mercados);
export const adminDeleteSeller = id         => req('DELETE', `/admin/sellers/${id}`);
export const adminToggleSeller = id         => req('PATCH',  `/admin/sellers/${id}/toggle`);