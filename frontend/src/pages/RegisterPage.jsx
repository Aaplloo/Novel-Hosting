import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        invitationCode: '',
    });

    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { name, email, password, confirmPassword, invitationCode } = formData;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            await axios.post('https://novel-hosting.onrender.com/api/auth/register', { name, email, password, invitationCode }, config);
            // Login after register
            await login({ email, password });
        } catch (err) {
            setError(err.response?.data?.msg || '注册失败');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <p className="mx-auto mb-3 w-fit -rotate-1 border-2 border-pencil bg-postit px-3 py-1 text-lg font-bold shadow-sketchSm">invite slip</p>
                <h2 className="mt-6 text-center text-5xl leading-tight">
                    注册新账户
                </h2>
                <p className="mt-2 text-center text-xl text-pencil/70">
                    或者{' '}
                    <Link to="/login" className="sketch-link font-bold">
                        登录现有账户
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="sketch-panel bg-white px-5 py-8 sm:px-10">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        {error && <div className="border-[3px] border-correction bg-white px-4 py-3 text-center text-lg text-correction shadow-sketchSm" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>{error}</div>}

                        <div>
                            <label htmlFor="name" className="block text-lg font-bold text-pencil">
                                用户名
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={onChange}
                                    className="sketch-input"
                                />
                            </div>
                        </div>

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
                                    required
                                    value={password}
                                    onChange={onChange}
                                    className="sketch-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-lg font-bold text-pencil">
                                确认密码
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={onChange}
                                    className="sketch-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="invitationCode" className="block text-lg font-bold text-pencil">
                                邀请码
                            </label>
                            <div className="mt-1">
                                <input
                                    id="invitationCode"
                                    name="invitationCode"
                                    type="text"
                                    required
                                    value={invitationCode}
                                    onChange={onChange}
                                    className="sketch-input"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="sketch-button w-full"
                            >
                                {loading ? '注册中...' : '注册'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
