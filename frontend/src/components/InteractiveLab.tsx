'use client';

import React, { useState, useEffect } from 'react';

interface InteractiveLabProps {
  topicId: string;
}

interface Outlier {
  rank: number;
  point_id: number;
  [key: string]: any;
}

interface LabResult {
  metrics: Record<string, number>;
  table_data: Outlier[];
  image_url: string;
  csv_data_url: string;
  csv_outliers_url: string;
  report_url: string;
}

export default function InteractiveLab({ topicId }: InteractiveLabProps) {
  // Common
  const [params, setParams] = useState<Record<string, any>>({
    n: 100,
    noise: 0.1,
    random_seed: 42,
    a: 2.5,
    b: 10.0,
    var: 50.0,
    C: 1.0,
    max_depth: 5,
    n_estimators: 50,
    n_neighbors: 5,
    kernel: 'rbf',
    hidden_size: 50,
    k: 3,
    cluster_std: 1.0,
    n_components: 2
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LabResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset results when topic changes
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [topicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interactive/${topicId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to run analysis');
      }
      
      const data = await res.json();
      data.image_url = `${data.image_url}?t=${new Date().getTime()}`;
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Define inputs based on topic
  const renderInputs = () => {
    const inputs = [
      <div key="n" className="flex flex-col">
        <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">資料點數 (n)</label>
        <input type="number" name="n" value={params.n} onChange={handleChange} min="10" max="1000" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
      </div>,
      <div key="seed" className="flex flex-col">
        <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">亂數種子 (seed)</label>
        <input type="number" name="random_seed" value={params.random_seed} onChange={handleChange} className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
      </div>
    ];

    if (topicId === "1") {
      inputs.push(
        <div key="a" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">真實斜率 (a)</label>
          <input type="number" name="a" value={params.a} onChange={handleChange} step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>,
        <div key="b" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">真實截距 (b)</label>
          <input type="number" name="b" value={params.b} onChange={handleChange} step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>,
        <div key="var" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">雜訊變異數 (var)</label>
          <input type="number" name="var" value={params.var} onChange={handleChange} min="0" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>
      );
    } else if (["2", "3", "4", "5", "6", "7", "10"].includes(topicId)) {
      inputs.push(
        <div key="noise" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">雜訊程度 (noise)</label>
          <input type="number" name="noise" value={params.noise} onChange={handleChange} min="0" max="1" step="0.05" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>
      );
      
      if (topicId === "2" || topicId === "5") {
        inputs.push(
          <div key="C" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">正規化強度 (C)</label>
            <input type="number" name="C" value={params.C} onChange={handleChange} min="0.01" step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
          </div>
        );
      }
      if (topicId === "5") {
        inputs.push(
          <div key="kernel" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">Kernel</label>
            <select name="kernel" value={params.kernel} onChange={handleChange} className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400">
              <option value="linear">Linear</option>
              <option value="rbf">RBF</option>
              <option value="poly">Poly</option>
            </select>
          </div>
        );
      }
      if (topicId === "3" || topicId === "4") {
        inputs.push(
          <div key="max_depth" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">最大樹深 (max_depth)</label>
            <input type="number" name="max_depth" value={params.max_depth} onChange={handleChange} min="1" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
          </div>
        );
      }
      if (topicId === "4") {
        inputs.push(
          <div key="n_estimators" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">樹的數量 (n_estimators)</label>
            <input type="number" name="n_estimators" value={params.n_estimators} onChange={handleChange} min="1" step="10" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
          </div>
        );
      }
      if (topicId === "6") {
        inputs.push(
          <div key="n_neighbors" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">鄰居數 (n_neighbors)</label>
            <input type="number" name="n_neighbors" value={params.n_neighbors} onChange={handleChange} min="1" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
          </div>
        );
      }
      if (topicId === "10") {
        inputs.push(
          <div key="hidden_size" className="flex flex-col">
            <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">隱藏層神經元 (hidden)</label>
            <input type="number" name="hidden_size" value={params.hidden_size} onChange={handleChange} min="5" step="5" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
          </div>
        );
      }
    } else if (topicId === "8") {
      inputs.push(
        <div key="k" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">叢集數 (k)</label>
          <input type="number" name="k" value={params.k} onChange={handleChange} min="1" max="10" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>,
        <div key="cluster_std" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">分佈變異 (std)</label>
          <input type="number" name="cluster_std" value={params.cluster_std} onChange={handleChange} min="0.1" step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>
      );
    } else if (topicId === "9") {
      inputs.push(
        <div key="n_components" className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">降維維度</label>
          <input type="number" name="n_components" value={params.n_components} onChange={handleChange} min="1" max="5" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400" />
        </div>
      );
    }

    return inputs;
  };

  return (
    <div className="mt-12 p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">🧪</span> CRISP-DM 互動實驗室
      </h2>
      <p className="text-blue-100/70 mb-6 text-sm">
        動態生成資料並即時觀察模型變化，圖表位於上方，控制面板位於下方。
      </p>

      {/* 1. Image Area (On Top) */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6 min-h-[300px] flex items-center justify-center">
        {result ? (
          <img src={result.image_url} alt="Analysis Result" className="w-full max-w-2xl h-auto object-contain rounded-lg shadow-lg" />
        ) : (
          <div className="text-slate-500 flex flex-col items-center gap-3">
            <span className="text-4xl">📊</span>
            <p>請點擊下方按鈕生成分析圖表</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          ⚠️ 錯誤: {error}
        </div>
      )}

      {/* 2. Control Panel & Button (Below Image) */}
      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">模型參數控制</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {renderInputs()}
        </div>
        
        <button 
          onClick={handleRun}
          disabled={loading}
          className="w-full sm:w-auto mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              運算中...
            </>
          ) : (
            '🚀 執行 CRISP-DM 分析'
          )}
        </button>
      </div>

      {/* 3. Metrics & Tables Area */}
      {result && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📈 評估指標
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(result.metrics).map(([key, val]) => (
                <div key={key} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 uppercase break-words mb-2">{key.replace(/_/g, ' ')}</p>
                  <p className="text-xl font-bold text-blue-400">{val.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>

          {result.table_data.length > 0 && (
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🚨 異常 / 錯誤分析樣本 (Top {result.table_data.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      {Object.keys(result.table_data[0]).map(k => (
                        <th key={k} className="px-4 py-3">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table_data.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-white/5 transition-colors">
                        {Object.entries(row).map(([k, v]) => (
                          <td key={k} className={`px-4 py-3 ${k === 'rank' ? 'font-bold text-orange-400' : ''}`}>
                            {typeof v === 'number' && v % 1 !== 0 ? v.toFixed(4) : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
            <a href={`${result.csv_data_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📥</span> 下載原始資料 (CSV)
            </a>
            <a href={`${result.csv_outliers_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📥</span> 下載錯誤樣本 (CSV)
            </a>
            <a href={`${result.report_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📄</span> 下載分析報表 (TXT)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
