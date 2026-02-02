'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import './Sidebar.css';

const menuItems = [
  {
    name: 'Home',
    href: '/pages/home',
    icon: <HomeIcon />,
  },
  {
    name: 'Condomínios',
    href: '/pages/condominios',
    icon: <BusinessIcon />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Usuário');
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
      }
    }
  }, []);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {!collapsed && (
            <h1 className="sidebar-title">Condomínio</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle-button"
          >
            <ChevronLeftIcon 
              className={`sidebar-toggle-icon ${collapsed ? 'rotated' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="sidebar-menu-item">
                <Link
                  href={item.href}
                  className={`sidebar-menu-link ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-menu-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sidebar-menu-text">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer/User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <PersonIcon />
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{userName}</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('workspaceId');
                  localStorage.removeItem('user');
                  window.location.href = '/pages/login';
                }}
                className="sidebar-logout-button"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}