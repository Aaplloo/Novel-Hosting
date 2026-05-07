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
        <div className="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <p className="mx-auto mb-3 w-fit rotate-1 border-2 border-pencil bg-postit px-3 py-1 text-lg font-bold shadow-sketchSm">member note</p>
                <h2 className="mt-6 text-center text-5xl leading-tight">
                    登录您的账户
                </h2>
                <p className="mt-2 text-center text-xl text-pencil/70">
                    或者{' '}
                    <Link to="/register" className="sketch-link font-bold">
                        注册新账户
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="sketch-panel bg-white px-5 py-8 sm:px-10">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        {error && <div className="border-[3px] border-correction bg-white px-4 py-3 text-center text-lg text-correction shadow-sketchSm" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>{error}</div>}

                        <div>
                            <label htmlFor="email" className="block text-lg font-bold text-pencil">
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
                                    className="sketch-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-lg font-bold text-pencil">
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
                                    className="sketch-input"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="sketch-button w-full"
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
