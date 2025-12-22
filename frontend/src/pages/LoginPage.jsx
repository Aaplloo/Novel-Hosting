import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { login, isAuthenticated, error: authError, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { email, password } = formData;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            setError('请填写所有字段');
        } else {
            try {
                await login(formData);
            } catch (err) {
                setError(err.response?.data?.msg || '登录失败，请检查凭证');
            }
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                    登录您的账户
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    或者{' '}
                    <Link to="/register" className="font-medium text-sky-500 hover:text-sky-400">
                        注册新账户
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm text-center">{error}</div>}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                邮箱地址
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={onChange}
                                    className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                密码
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={onChange}
                                    className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md border border-transparent bg-sky-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                            >
                                登录
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
