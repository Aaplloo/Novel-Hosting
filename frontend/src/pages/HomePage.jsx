import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="relative w-full max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
        </div>
        <input
            type="text"
            placeholder="搜索书名或作者..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
        />
    </div>
);

const FilterButtons = ({ activeFilter, setFilter }) => {
    const filters = [
        { key: 'all', name: '全部' },
        { key: 'md', name: 'MD' },
        { key: 'pdf', name: 'PDF' },
    ];
    return (
        <div className="flex items-center space-x-2 bg-slate-200 p-1 rounded-lg">
            {filters.map(filter => (
                <button
                    key={filter.key}
                    onClick={() => setFilter(filter.key)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeFilter === filter.key
                        ? 'bg-white text-sky-500 shadow'
                        : 'text-slate-600 hover:bg-slate-300/50'
                        }`}
                >
                    {filter.name}
                </button>
            ))}
        </div>
    );
};


const HomePage = () => {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState('all');

    useEffect(() => {
        const fetchNovels = async () => {
            try {
                const res = await axios.get('https://novel-hosting.onrender.com/api/novels');
                setNovels(res.data);
            } catch (err) {
                setError('无法加载小说列表。');
            } finally {
                setLoading(false);
            }
        };
        fetchNovels();
    }, []);

    const filteredNovels = useMemo(() => {
        return novels
            .filter(novel => {
                if (fileTypeFilter === 'all') return true;
                return novel.fileType === fileTypeFilter;
            })
            .filter(novel => {
                const term = searchTerm.toLowerCase();
                return (
                    novel.title.toLowerCase().includes(term) ||
                    novel.author.name.toLowerCase().includes(term)
                );
            });
    }, [novels, searchTerm, fileTypeFilter]);


    const renderSkeleton = () => (
        Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-slate-200"></div>
                <div className="mt-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        ))
    );

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <FilterButtons activeFilter={fileTypeFilter} setFilter={setFileTypeFilter} />
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                {loading ? renderSkeleton() : (
                    filteredNovels.length > 0 ? (
                        filteredNovels.map((novel) => (
                            <Link to={`/novel/${novel._id}`} key={novel._id} className="group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl rounded-xl">
                                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-slate-100">
                                    <img src={novel.coverImage.startsWith('http') ? novel.coverImage : `https://novel-hosting.onrender.com/${novel.coverImage}`} className="w-full h-full object-cover object-center" alt={`${novel.title} 封面`} />
                                </div>
                                <div className="mt-2">
                                    <h2 className="text-base font-bold text-slate-900 truncate">{novel.title}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{novel.author.name}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-slate-500 col-span-full text-center py-10">没有找到符合条件的小说。</p>
                    )
                )}
            </div>
        </main>
    );
};

export default HomePage;
