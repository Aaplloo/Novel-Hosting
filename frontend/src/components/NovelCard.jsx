import React from 'react';
import { Link } from 'react-router-dom';

const NovelCard = ({ novel }) => {
    return (
        <Link
            to={`/novel/${novel._id}`}
            className="group block bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200 overflow-hidden"
        >
            {/* 封面图片容器 - 2:3 固定比例 */}
            <div className="aspect-[2/3] w-full relative overflow-hidden rounded-t-2xl bg-slate-50">
                <img
                    src={novel.coverImage.startsWith('http') ? novel.coverImage : `https://novel-hosting.onrender.com/${novel.coverImage}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={`${novel.title} 封面`}
                    loading="lazy"
                />
            </div>

            {/* 内容信息 */}
            <div className="p-4">
                {/* 标题 */}
                <h3 className="font-bold text-lg text-gray-800 truncate leading-snug group-hover:text-sky-500 transition-colors">
                    {novel.title}
                </h3>

                {/* 作者 */}
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                    {novel.author.name}
                </p>
            </div>
        </Link>
    );
};

export default NovelCard;
