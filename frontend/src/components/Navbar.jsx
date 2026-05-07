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
      <li className="hidden text-pencil/80 lg:block">
        欢迎, {user?.name}
      </li>
      {(user?.isAdmin || user?.canUpload) && (
        <li>
          <Link className="sketch-link" to="/admin">管理后台</Link>
        </li>
      )}
      <li>
        <a onClick={onLogout} href="#!" className="sketch-link cursor-pointer">
          退出登录
        </a>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li>
        <Link className="sketch-link" to="/login">登录</Link>
      </li>
      <li>
        <Link to="/register" className="sketch-button min-h-0 px-4 py-1 text-base">
          注册
        </Link>
      </li>
    </>
  );

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav className="mx-auto w-full max-w-5xl border-[3px] border-pencil bg-white/90 shadow-sketch backdrop-blur-sm" style={{ borderRadius: '30px 12px 28px 14px / 14px 30px 12px 28px' }}>
        <div className="px-4 sm:px-6">
          <div className="flex min-h-16 items-center justify-between gap-4 py-3">
            <div className="flex-shrink-0">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="block">
              <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3 text-lg font-bold">
                <li>
                  <Link className="sketch-link" to="/">首页</Link>
                </li>
                {isAuthenticated ? authLinks : guestLinks}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
