import React from "react";
import type { ShortItem } from "../types/domain";
import { formatRelativeDate } from "../utils/date";

import fallbackThumb from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

interface ShortCardProps {
  short: ShortItem;
}

const ShortCard: React.FC<ShortCardProps> = ({ short }) => {
  return (
    <a
      href={short.publicUrl}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col w-60"
    >
      <div className="relative">
        <img
          src={short.thumbnailUrl ?? fallbackThumb}
          alt={short.title}
          className="rounded-4xl w-60 h-90 object-cover"
          loading="eager"
        />
        <div className="absolute h-full w-full top-0 left-0"></div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl font-medium">{short.title}</h2>
        <div className="flex items-center gap-2">
          <p className="text-[#555] text-sm">{short.likeCount} Likes</p>
          <span className="h-1 w-1 rounded-[50%] bg-[#555]"></span>
          <p className="text-[#555] text-sm">{formatRelativeDate(short.publishedAt)}</p>
        </div>
      </div>
    </a>
  );
};

export default ShortCard;
