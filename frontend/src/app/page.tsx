"use client";

import { useEffect, useState } from "react";
import ContentRenderer from "@/components/ContentRenderer";

export default function Home() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/general")
      .then((res) => res.json())
      .then((data) => {
        setBlocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-10 mt-10">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          TOP 10 機器學習演算法
        </h1>
        <p className="text-xl text-slate-400">研讀報告：詳細說明、範例、圖文對照與實作導讀</p>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <ContentRenderer blocks={blocks} />
      )}
    </div>
  );
}
