import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AuthContext from '../context/AuthContext';
import CommentSidebar from '../components/CommentSidebar';

const NovelPage = () => {
    const { novelId } = useParams();
    const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
    const [novel, setNovel] = useState(null);
    const [content, setContent] = useState('');
    const [paragraphs, setParagraphs] = useState([]); // Store parsed paragraphs
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Comments State
    const [comments, setComments] = useState([]); // All comments for the chapter
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeParagraphIndex, setActiveParagraphIndex] = useState(null);
    const [sidebarLoading, setSidebarLoading] = useState(false);

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
                } else if (novelRes.data.fileType === 'pdf') {
                    const pdfRes = await axios.get(`https://novel-hosting.onrender.com/${novelRes.data.filePath}`, {
                        responseType: 'blob'
                    });
                    const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
                    setPdfUrl(url);
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

        const fetchComments = async () => {
            // Assuming chapterIndex is 1 for now (MVP). In real app, we need chapter support.
            // Using chapterIndex=1 as default
            try {
                const res = await axios.get(`https://novel-hosting.onrender.com/api/comments?novelId=${novelId}&chapterIndex=1`);
                setComments(res.data);
            } catch (err) {
                console.error("Failed to fetch comments", err);
            }
        };

        if (novelId && isAuthenticated) {
            fetchNovel();
            fetchComments();
        }
    }, [novelId, isAuthenticated, authLoading]);

    // Parse Markdown content into paragraphs when content changes
    useEffect(() => {
        if (content) {
            // Split by double newline (standard markdown paragraph break) or single newline if prefer line-by-line
            // Using logic: split by newline, filter empty lines
            const parsed = content.split('\n').filter(line => line.trim() !== '');
            setParagraphs(parsed);
        }
    }, [content]);

    // Helper to get comments for a specific paragraph
    const getParagraphComments = (index) => {
        return comments.filter(c => c.paragraphIndex === index);
    };

    const handleParagraphClick = (index) => {
        setActiveParagraphIndex(index);
        setIsSidebarOpen(true);
    };

    const handleSubmitComment = async (newComment) => {
        if (activeParagraphIndex === null) return;

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                }
            };
            const body = {
                novelId,
                chapterIndex: 1, // Defaulting to 1
                paragraphIndex: activeParagraphIndex,
                content: newComment
            };

            const res = await axios.post('https://novel-hosting.onrender.com/api/comments', body, config);

            // Optimistically update comments
            setComments([res.data, ...comments]);

        } catch (err) {
            console.error("Failed to post comment", err);
            alert("Failed to post comment");
        }
    };

    const renderContent = () => {
        if (!novel) return null;

        if (novel.fileType === 'pdf') {
            return (
                <div className="w-full h-screen rounded-xl overflow-hidden shadow-lg">
                    <iframe
                        src={pdfUrl}
                        title={novel.title}
                        className="w-full h-full"
                    ></iframe>
                </div>
            );
        }

        if (novel.fileType === 'md') {
            return (
                <article className="prose lg:prose-xl max-w-none bg-white p-8 sm:p-12 rounded-xl shadow-md">
                    {paragraphs.map((paragraph, index) => {
                        const paraComments = getParagraphComments(index);
                        const commentCount = paraComments.length;

                        return (
                            <div
                                key={index}
                                className="group relative mb-4 transition-colors duration-200 hover:bg-slate-50 rounded px-2 -mx-2 cursor-pointer pb-2"
                                onClick={() => handleParagraphClick(index)}
                            >
                                <ReactMarkdown components={{ p: 'span' }}>{paragraph}</ReactMarkdown>

                                {/* Comment Badge & Icon */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-full pl-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                    <button
                                        className="p-1.5 bg-white border border-slate-200 shadow-sm rounded-full text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-all flex items-center space-x-1"
                                        title="添加/查看评论"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        {commentCount > 0 && (
                                            <span className="text-xs font-bold text-sky-500 pr-1">{commentCount}</span>
                                        )}
                                    </button>
                                </div>

                                {/* Inline Badge (Always visible if comments exist) */}
                                {commentCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800 align-middle">
                                        {commentCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
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
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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

            <CommentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                comments={activeParagraphIndex !== null ? getParagraphComments(activeParagraphIndex) : []}
                onSubmit={handleSubmitComment}
                loading={sidebarLoading}
                paragraphContent={activeParagraphIndex !== null ? paragraphs[activeParagraphIndex] : ''}
            />
        </main>
    );
};

export default NovelPage;
