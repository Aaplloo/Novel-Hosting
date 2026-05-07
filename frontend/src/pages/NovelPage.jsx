import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AuthContext from '../context/AuthContext';
import CommentSidebar from '../components/CommentSidebar';

const API_BASE_URL = 'https://novel-hosting.onrender.com';

const normalizePath = (value = '') => value.replace(/\\/g, '/');

const buildAssetUrl = (assetPath = '') => {
    if (/^(https?:|data:|blob:)/i.test(assetPath)) {
        return assetPath;
    }

    return `${API_BASE_URL}/${normalizePath(assetPath).replace(/^\/+/, '')}`;
};

const getDirectoryPath = (filePath = '') => {
    const normalizedPath = normalizePath(filePath);
    const slashIndex = normalizedPath.lastIndexOf('/');
    return slashIndex === -1 ? '' : normalizedPath.slice(0, slashIndex + 1);
};

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
                const novelRes = await axios.get(`${API_BASE_URL}/api/novels/${novelId}`);
                setNovel(novelRes.data);

                if (novelRes.data.fileType === 'md') {
                    const contentRes = await axios.get(buildAssetUrl(novelRes.data.filePath));
                    setContent(contentRes.data);
                } else if (novelRes.data.fileType === 'pdf') {
                    const pdfRes = await axios.get(buildAssetUrl(novelRes.data.filePath), {
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
                const res = await axios.get(`${API_BASE_URL}/api/comments?novelId=${novelId}&chapterIndex=1`);
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

            const res = await axios.post(`${API_BASE_URL}/api/comments`, body, config);

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
                <div className="h-screen w-full overflow-hidden border-[3px] border-pencil bg-white shadow-sketch" style={{ borderRadius: '42px 16px 38px 18px / 18px 40px 16px 36px' }}>
                    <iframe
                        src={pdfUrl}
                        title={novel.title}
                        className="w-full h-full"
                    ></iframe>
                </div>
            );
        }

        if (novel.fileType === 'md') {
            const markdownDirectory = getDirectoryPath(novel.filePath);
            const resolveMarkdownImage = (src = '') => {
                if (/^(https?:|data:|blob:)/i.test(src)) {
                    return src;
                }

                if (src.startsWith('/')) {
                    return `${API_BASE_URL}${src}`;
                }

                return new URL(normalizePath(src), buildAssetUrl(markdownDirectory)).href;
            };
            const markdownComponents = {
                p: 'span',
                img: ({ src, alt }) => (
                    <img
                        src={resolveMarkdownImage(src)}
                        alt={alt || ''}
                        className="mx-auto my-6 max-h-[70vh] border-[3px] border-pencil bg-white object-contain p-2 shadow-sketch"
                        style={{ borderRadius: '30px 12px 28px 14px / 14px 30px 12px 28px' }}
                        loading="lazy"
                    />
                ),
            };

            return (
                <article className="prose prose-lg max-w-none border-[3px] border-pencil bg-white p-6 shadow-sketch prose-headings:font-marker prose-headings:text-pencil prose-p:text-pencil prose-strong:text-pencil sm:p-10 lg:prose-xl" style={{ borderRadius: '42px 16px 38px 18px / 18px 40px 16px 36px' }}>
                    {paragraphs.map((paragraph, index) => {
                        const paraComments = getParagraphComments(index);
                        const commentCount = paraComments.length;

                        return (
                            <div
                                key={index}
                                className="group relative -mx-2 mb-4 cursor-pointer px-2 pb-2 transition-colors duration-100 hover:bg-postit/60"
                                style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}
                                onClick={() => handleParagraphClick(index)}
                            >
                                <ReactMarkdown components={markdownComponents}>{paragraph}</ReactMarkdown>

                                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-full items-center pl-2 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                                    <button
                                        className="flex items-center gap-1 border-2 border-pencil bg-white p-2 text-pencil shadow-sketchSm transition-all hover:bg-correction hover:text-white"
                                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                        title="添加/查看评论"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        {commentCount > 0 && (
                                            <span className="pr-1 text-sm font-bold">{commentCount}</span>
                                        )}
                                    </button>
                                </div>

                                {commentCount > 0 && (
                                    <span className="ml-2 inline-flex items-center border-2 border-pencil bg-postit px-2 py-0.5 align-middle text-sm font-bold text-pencil shadow-sketchSm" style={{ borderRadius: '18px 8px 16px 10px / 10px 18px 8px 16px' }}>
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
            <div className="mx-auto max-w-4xl animate-pulse px-4 py-12">
                <div className="mb-4 h-10 w-3/4 bg-erased"></div>
                <div className="space-y-4 mt-8">
                    <div className="h-4 w-full bg-erased"></div>
                    <div className="h-4 w-full bg-erased"></div>
                    <div className="h-4 w-5/6 bg-erased"></div>
                    <div className="h-4 w-full bg-erased"></div>
                    <div className="h-4 w-4/6 bg-erased"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="px-4 py-10 text-center">
            <p className="mb-6 text-2xl text-correction">{error}</p>

            {error === 'Please login to view content' ? (
                <Link to="/login" className="sketch-button">去登录</Link>
            ) : (
                <Link to="/" className="sketch-link mt-4 inline-block text-xl font-bold">返回首页</Link>
            )}
        </div>;
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            {novel && (
                <div className="mb-10 text-center">
                    {novel.coverImage && (
                        <div className="mx-auto mb-6 w-fit rotate-1 border-[3px] border-pencil bg-white p-2 shadow-sketch">
                            <img
                                src={buildAssetUrl(novel.coverImage)}
                                alt={novel.title}
                                className="h-64 object-cover"
                                style={{ borderRadius: '24px 10px 20px 12px / 12px 24px 10px 20px' }}
                            />
                        </div>
                    )}
                    <h1 className="text-5xl leading-tight sm:text-6xl">{novel.title}</h1>
                    <p className="mt-4 text-2xl text-pencil/70">作者: {novel.author.name}</p>
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
