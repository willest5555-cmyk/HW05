"use client";

interface ContentBlock {
  type: string;
  content?: string;
  url?: string;
  caption?: string;
  headers?: string[];
  rows?: string[][];
}

export default function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index} className="text-slate-300 leading-relaxed text-lg">{block.content}</p>;
          case "h2":
            return (
              <h2 key={index} className="text-3xl font-bold text-white mt-12 mb-6 pb-2 border-b-2 border-slate-700/50">
                {block.content}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} className="text-xl font-semibold text-indigo-400 mt-8 mb-4">
                {block.content}
              </h3>
            );
          case "meta":
            return (
              <div key={index} className="bg-slate-800/60 p-4 rounded-xl border-l-4 border-indigo-500 mb-8 shadow-lg">
                <p className="text-slate-300">
                  <strong className="text-white">{block.content?.split("：")[0]}：</strong>
                  {block.content?.split("：").slice(1).join("：")}
                </p>
              </div>
            );
          case "image":
            return (
              <figure key={index} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 shadow-2xl my-8 transition-transform hover:-translate-y-1 duration-300">
                <img src={`${block.url}`} alt={block.caption} className="w-full h-auto rounded-xl block" />
                <figcaption className="text-center mt-4 text-slate-400 text-sm">{block.caption}</figcaption>
              </figure>
            );
          case "code":
            return (
              <pre key={index} className="bg-[#0d1117] p-5 rounded-xl border border-slate-700/50 overflow-x-auto my-6 shadow-inner">
                <code className="text-indigo-300 font-mono text-sm leading-loose">{block.content}</code>
              </pre>
            );
          case "table":
            return (
              <div key={index} className="my-8">
                <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/60">
                      <tr>
                        {block.headers?.map((h, i) => (
                          <th key={i} className="p-4 text-indigo-300 font-semibold border-b border-slate-700/50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {block.rows?.map((row, r) => (
                        <tr key={r} className="hover:bg-slate-700/30 transition-colors">
                          {row.map((cell, c) => (
                            <td key={c} className="p-4 text-slate-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && <p className="text-center mt-3 text-sm text-slate-400">{block.caption}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
