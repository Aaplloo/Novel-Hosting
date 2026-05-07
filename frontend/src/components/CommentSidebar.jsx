import React, { useState } from 'react';
const CommentSidebar = ({ isOpen, onClose, comments, onSubmit, loading, paragraphContent }) => {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        await onSubmit(newComment);
        setNewComment('');
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l-[3px] border-pencil bg-paper shadow-sketchLg transition-transform duration-300 ease-in-out sm:m-4 sm:rounded-wobblyMd sm:border-[3px]">
            <div className="flex items-center justify-between border-b-[3px] border-dashed border-pencil bg-white px-6 py-4">
                <h3 className="font-marker text-2xl font-bold text-pencil">
                    段落评论 <span className="ml-1 inline-flex min-w-8 justify-center rounded-wobblySm border-2 border-pencil bg-postit px-2 text-lg">{comments.length}</span>
                </h3>
                <button
                    onClick={onClose}
                    className="sketch-button min-h-0 px-3 py-1 text-lg"
                    aria-label="关闭评论"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="border-b-[3px] border-pencil bg-postit px-6 py-4">
                <p className="mb-2 inline-block -rotate-1 border-2 border-pencil bg-white px-2 text-sm font-bold">Selected Paragraph</p>
                <p className="line-clamp-3 border-l-[3px] border-ballpoint pl-3 text-lg leading-relaxed text-pencil/80">
                    {paragraphContent}
                </p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-10 w-10 animate-spin rounded-wobbly border-[3px] border-dashed border-correction"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="mx-auto mb-4 flex h-20 w-20 -rotate-2 items-center justify-center rounded-wobbly border-[3px] border-pencil bg-white text-pencil shadow-sketch">
                            <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-xl text-pencil/70">暂无评论，来抢沙发吧！</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="group">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 -rotate-2 items-center justify-center rounded-wobbly border-2 border-pencil bg-ballpoint text-lg font-bold text-white shadow-sketchSm">
                                    {comment.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-lg font-bold text-pencil">{comment.user.name}</p>
                                        <span className="text-sm text-pencil/50">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-lg leading-relaxed text-pencil/80">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t-[3px] border-pencil bg-white p-4">
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="写下你的想法..."
                            className="sketch-input min-h-20 resize-none pr-14"
                            rows="2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="sketch-button absolute bottom-3 right-3 min-h-0 px-2 py-2"
                            aria-label="提交评论"
                        >
                            {submitting ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentSidebar;
