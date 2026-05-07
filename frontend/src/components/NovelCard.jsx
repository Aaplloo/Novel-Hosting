import React from 'react';
import { Link } from 'react-router-dom';

const NovelCard = ({ novel }) => {
    const rotation = novel.title.length % 2 === 0 ? '-rotate-1 hover:rotate-1' : 'rotate-1 hover:-rotate-1';

    return (
        <Link
            to={`/novel/${novel._id}`}
            className={`group relative block overflow-hidden border-[3px] border-pencil bg-white shadow-sketch transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sketchSm ${rotation}`}
            style={{ borderRadius: '34px 12px 30px 16px / 16px 32px 12px 28px' }}
        >
            <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-1/2 rotate-2 bg-erased/80" />
            <div className="relative aspect-[2/3] w-full overflow-hidden border-b-[3px] border-pencil bg-postit">
                <img
                    src={novel.coverImage.startsWith('http') ? novel.coverImage : `https://novel-hosting.onrender.com/${novel.coverImage}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={`${novel.title} 封面`}
                    loading="lazy"
                />
            </div>

            <div className="bg-white p-4">
                <h3 className="truncate font-marker text-xl font-bold leading-snug text-pencil transition-colors group-hover:text-correction">
                    {novel.title}
                </h3>
                <p className="mt-1 flex items-center text-base text-pencil/70">
                    作者: {novel.author.name}
                </p>
            </div>
        </Link>
    );
};

export default NovelCard;
