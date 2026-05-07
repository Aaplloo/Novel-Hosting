import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NovelCard from '../components/NovelCard';

const SearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="relative w-full max-w-lg -rotate-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-6 w-6 text-pencil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
        </div>
        <input
            type="text"
            placeholder="搜索书名或作者..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sketch-input pl-12"
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
        <div className="flex rotate-1 items-center gap-2 border-[3px] border-pencil bg-erased p-1 shadow-sketchSm" style={{ borderRadius: '24px 10px 20px 12px / 12px 24px 10px 20px' }}>
            {filters.map(filter => (
                <button
                    key={filter.key}
                    onClick={() => setFilter(filter.key)}
                    className={`min-h-10 px-4 py-1 text-lg font-bold transition-all duration-100 ${activeFilter === filter.key
                        ? 'border-2 border-pencil bg-white text-correction shadow-sketchSm'
                        : 'text-pencil/70 hover:bg-white'
                        }`}
                    style={{ borderRadius: '18px 8px 16px 10px / 10px 18px 8px 16px' }}
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
            <div key={index} className="animate-pulse overflow-hidden border-[3px] border-pencil bg-white shadow-paper" style={{ borderRadius: '34px 12px 30px 16px / 16px 32px 12px 28px' }}>
                <div className="aspect-[2/3] bg-erased"></div>
                <div className="mt-2">
                    <div className="mb-2 ml-3 h-4 w-3/4 bg-erased"></div>
                    <div className="mb-4 ml-3 h-3 w-1/2 bg-erased"></div>
                </div>
            </div>
        ))
    );

    return (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <section className="relative mb-10">
                <div className="absolute -right-2 top-2 hidden h-20 w-20 animate-floaty rounded-wobbly border-[3px] border-dashed border-correction bg-postit md:block" />
                <p className="mb-3 inline-block -rotate-2 border-2 border-pencil bg-postit px-3 py-1 text-lg font-bold shadow-sketchSm">library desk</p>
                <h1 className="max-w-3xl text-5xl leading-tight md:text-6xl">
                    挑一本故事，像翻开桌上的手稿。
                </h1>
                <div className="mt-4 h-4 max-w-xl border-b-[3px] border-dashed border-pencil" />
            </section>

            <div className="mb-10 flex flex-col items-stretch justify-between gap-5 md:flex-row md:items-center">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <FilterButtons activeFilter={fileTypeFilter} setFilter={setFileTypeFilter} />
            </div>

            {error && <div className="mb-8 border-[3px] border-correction bg-white px-4 py-3 text-xl text-correction shadow-sketch" style={{ borderRadius: '22px 10px 20px 12px / 12px 22px 10px 20px' }}>{error}</div>}

            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loading ? renderSkeleton() : (
                    filteredNovels.length > 0 ? (
                        filteredNovels.map((novel) => (
                            <NovelCard key={novel._id} novel={novel} />
                        ))
                    ) : (
                        <p className="sketch-card col-span-full py-10 text-center text-2xl text-pencil/70">没有找到符合条件的小说。</p>
                    )
                )}
            </div>
        </main>
    );
};

export default HomePage;
