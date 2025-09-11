"use client";

import { useEffect, useState } from "react";

type Thumbnail = { id:number; title:string; imageUrl:string };

type Props = { token:string; thumbnail: Thumbnail };

export default function ThumbnailCard({ token, thumbnail }: Props) {
  const [value, setValue] = useState<number>(0); // -1, 0, 1
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const key = `vote:${token}:${thumbnail.id}`;
    const v = localStorage.getItem(key);
    if (v) setValue(parseInt(v, 10));
  }, [token, thumbnail.id]);

  async function vote(newValue:number) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, thumbnailId: thumbnail.id, value: newValue }),
      });
      if (res.ok) {
        setValue(newValue);
        localStorage.setItem(`vote:${token}:${thumbnail.id}`, String(newValue));
      }
    } finally {
      setSaving(false);
    }
  }

  const isLike = value === 1;
  const isDislike = value === -1;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-[16/9] w-full bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnail.imageUrl} alt={thumbnail.title} className="h-full w-full object-contain" />
      </div>
      <div className="flex items-center justify-between p-3">
        <div>
          <div className="font-medium">{thumbnail.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => vote(isLike ? 0 : 1)}
            className={`rounded-full px-3 py-1 text-sm ${isLike ? "bg-green-600 text-white" : "bg-neutral-200"}`}
            disabled={saving}
            aria-label="Like"
          >👍</button>
          <button
            onClick={() => vote(isDislike ? 0 : -1)}
            className={`rounded-full px-3 py-1 text-sm ${isDislike ? "bg-red-600 text-white" : "bg-neutral-200"}`}
            disabled={saving}
            aria-label="Dislike"
          >👎</button>
        </div>
      </div>
    </article>
  );
}
