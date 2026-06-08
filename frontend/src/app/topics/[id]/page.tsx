"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ContentRenderer from "@/components/ContentRenderer";
import InteractiveLab from "@/components/InteractiveLab";

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/topics/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Topic not found");
        return res.json();
      })
      .then((data) => {
        setTopic(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        找不到該主題內容。
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10 mt-10 animate-fade-in">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-6 text-white border-l-4 border-indigo-500 pl-4">
          {topic.title}
        </h1>
      </header>
      
      <ContentRenderer blocks={topic.content} />

      {/* Mount Universal Interactive Component for CRISP-DM */}
      <InteractiveLab topicId={id as string} />
    </div>
  );
}
