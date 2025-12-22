import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <>
      <li className="text-slate-700">
        欢迎, {user?.name}
      </li>
      {user?.isAdmin && (
        <li>
          <Link className="hover:text-sky-500 transition-colors" to="/admin">管理后台</Link>
        </li>
      )}
      <li>
        <a onClick={onLogout} href="#!" className="hover:text-sky-500 transition-colors cursor-pointer">
          退出登录
        </a>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li>
        <Link className="hover:text-sky-500 transition-colors" to="/login">登录</Link>
      </li>
      <li>
        <Link to="/register" className="bg-gradient-to-r from-sky-400 to-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition-opacity">
          注册
        </Link>
      </li>
    </>
  );

  return (
    <header className="sticky top-0 z-50">
      <nav className="w-full bg-white/70 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="hidden md:block">
              <ul className="ml-10 flex items-center space-x-8 font-medium">
                <li>
                  <Link className="hover:text-sky-500 transition-colors" to="/">首页</Link>
                </li>
                {isAuthenticated ? authLinks : guestLinks}
              </ul>
            </div>
            {/* Mobile menu button can be added here if needed */}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
