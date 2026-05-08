import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WinWindow from '../components/WinWindow';

const NAV_SELLER = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard'        },
  { to: '/produtos',     icon: '📦', label: 'Produtos'         },
  { to: '/produtos/novo',icon: '➕', label: 'Novo Produto'     },
  { to: '/vendas/nova',  icon: '🛒', label: 'Registrar Venda'  },
  { to: '/vendas',       icon: '📋', label: 'Histórico'        },
];

const NAV_ADMIN = [
  { to: '/admin/mercados', icon: '🏪', label: 'Mercados' },
];

export default function AppLayout() {
  const { seller, signOut } = useAuth();
  const NAV = seller?.role === 'ADMIN' ? NAV_ADMIN : NAV_SELLER;
  const navigate = useNavigate();
  const marketName = seller?.name ?? 'MiniMkt';

  useEffect(() => {
    document.title = `${marketName} – Gestão de Estoque`;
  }, [marketName]);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-icon">🏪</div>
          <div>
            <div className="sb-logo-name">{marketName}</div>
            <div className="sb-logo-sub">GESTÃO DE ESTOQUE</div>
          </div>
        </div>

        <nav className="sb-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/produtos'}
              className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
            >
              <span className="sb-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sb-user">
          <div className="sb-avatar">👤</div>
          <div>
            <div className="sb-user-name">{marketName}</div>
            <div className="sb-user-role">{seller?.role === 'ADMIN' ? 'Admin' : 'Mercado'}</div>
          </div>
          <button className="sb-logout" onClick={() => { signOut(); navigate('/login'); }}>sair</button>
        </div>
      </aside>

      {/* Conteúdo principal como janela XP */}
      <div className="main-area">
        <WinWindow title={marketName} icon="🪟">
          <Outlet />
        </WinWindow>
      </div>
    </div>
  );
}