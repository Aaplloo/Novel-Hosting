import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AuthContext from '../context/AuthContext';

const NovelPage = () => {
    const { novelId } = useParams();
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [novel, setNovel] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait for auth check

        if (!isAuthenticated) {
            setError('Please login to view content');
            setLoading(false);
            return;
        }

        const fetchNovel = async () => {
            try {
                const novelRes = await axios.get(`https://novel-hosting.onrender.com/api/novels/${novelId}`);
                setNovel(novelRes.data);

                if (novelRes.data.fileType === 'md') {
                    const contentRes = await axios.get(`https://novel-hosting.onrender.com/${novelRes.data.filePath}`);
                    setContent(contentRes.data);
                }
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Please login to view content');
                } else {
                    setError('无法加载小说内容。');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNovel();
    }, [novelId, isAuthenticated, authLoading]);

    const renderContent = () => {
        if (!novel) return null;

        if (novel.fileType === 'pdf') {
            return (
                <div className="w-full h-screen rounded-xl overflow-hidden shadow-lg">
                    <iframe
                        src={`https://novel-hosting.onrender.com/${novel.filePath}`}
                        title={novel.title}
                        className="w-full h-full"
                    ></iframe>
                </div>
            );
        }

        if (novel.fileType === 'md') {
            return (
                <article className="prose lg:prose-xl max-w-none bg-white p-8 sm:p-12 rounded-xl shadow-md">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            );
        }

        return <p>不支持的文件格式。</p>;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-4 mt-8">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>

            {error === 'Please login to view content' ? (
                <Link to="/login" className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600 transition">去登录</Link>
            ) : (
                <Link to="/" className="mt-4 inline-block text-sky-500 hover:underline">返回首页</Link>
            )}
        </div>;
    }

    return (
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {novel && (
                <div className="text-center mb-8">
                    {novel.coverImage && (
                        <img
                            src={`https://novel-hosting.onrender.com/${novel.coverImage}`}
                            alt={novel.title}
                            className="mx-auto h-64 object-cover rounded-lg shadow-lg mb-6"
                        />
                    )}
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{novel.title}</h1>
                    <p className="mt-4 text-lg text-slate-500">作者: {novel.author.name}</p>
                </div>
            )}
            {renderContent()}
        </main>
    );
};

export default NovelPage;
