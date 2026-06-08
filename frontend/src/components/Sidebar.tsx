"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Topic {
  id: string;
  title: string;
}

export default function Sidebar() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data) => setTopics(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className="w-80 h-screen fixed left-0 top-0 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col z-50">
      <div className="p-6">
        <Link href="/">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider mb-8 hover:opacity-80 transition-opacity cursor-pointer">
            ML Algorithms
          </h1>
        </Link>
        <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 custom-scrollbar">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className={`px-4 py-3 rounded-lg transition-all duration-300 ease-out flex items-center ${
                pathname === `/topics/${topic.id}`
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] translate-x-2"
                  : "text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50 hover:translate-x-1"
              }`}
            >
              <span className="text-sm font-medium leading-relaxed truncate" title={topic.title}>{topic.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
