'use client';

import React, { useState } from 'react';

interface Outlier {
  rank: number;
  point_id: number;
  x: number;
  y: number;
  predicted_y: number;
  residual: number;
  absolute_residual: number;
}

interface LinRegResult {
  metrics: {
    true_slope: number;
    estimated_slope: number;
    absolute_slope_error: number;
    true_intercept: number;
    estimated_intercept: number;
    absolute_intercept_error: number;
    r2_score: number;
    mean_absolute_error: number;
    mean_squared_error: number;
    root_mean_squared_error: number;
  };
  outliers: Outlier[];
  image_url: string;
  csv_data_url: string;
  csv_outliers_url: string;
  report_url: string;
}

export default function InteractiveLinReg() {
  const [params, setParams] = useState({
    n: 100,
    a: 2.5,
    b: 10.0,
    var: 50.0,
    random_seed: 42
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinRegResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/interactive/linear-regression', {
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
      // append a timestamp to image_url to prevent browser caching
      data.image_url = `http://localhost:8000${data.image_url}?t=${new Date().getTime()}`;
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">🧪</span> CRISP-DM 互動實驗室：線性迴歸
      </h2>
      <p className="text-blue-100/70 mb-6 text-sm">
        動態生成資料並即時訓練線性迴歸模型，體驗 CRISP-DM 完整流程。您可以調整以下參數來觀察模型預測與 Outliers 的變化。
      </p>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">資料點數 (n)</label>
          <input type="number" name="n" value={params.n} onChange={handleChange} min="10" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">真實斜率 (a)</label>
          <input type="number" name="a" value={params.a} onChange={handleChange} min="-50" max="50" step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">真實截距 (b)</label>
          <input type="number" name="b" value={params.b} onChange={handleChange} min="0" max="100" step="0.1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">雜訊變異數 (var)</label>
          <input type="number" name="var" value={params.var} onChange={handleChange} min="0" max="300" step="1" className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">亂數種子 (seed)</label>
          <input type="number" name="random_seed" value={params.random_seed} onChange={handleChange} className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors" />
        </div>
      </div>

      <button 
        onClick={handleRun}
        disabled={loading}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            執行中...
          </>
        ) : (
          '🚀 生成資料並分析'
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          ⚠️ 錯誤: {error}
        </div>
      )}

      {/* Results Area */}
      {result && (
        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Chart */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📊 模型可視化 (Phase 6: Deployment)
              </h3>
              <div className="flex-1 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                <img src={result.image_url} alt="Regression Analysis" className="w-full h-auto object-contain rounded-lg" />
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📈 評估指標 (Phase 5: Evaluation)
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase">R² Score</p>
                  <p className="text-2xl font-bold text-blue-400">{result.metrics.r2_score.toFixed(4)}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase">RMSE</p>
                  <p className="text-2xl font-bold text-purple-400">{result.metrics.root_mean_squared_error.toFixed(4)}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span>真實方程式</span>
                  <span className="font-mono text-blue-300">y = {result.metrics.true_slope.toFixed(2)}x + {result.metrics.true_intercept.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span>預測方程式</span>
                  <span className="font-mono text-green-300">y = {result.metrics.estimated_slope.toFixed(2)}x + {result.metrics.estimated_intercept.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span>MAE (平均絕對誤差)</span>
                  <span className="font-mono text-yellow-300">{result.metrics.mean_absolute_error.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outliers Table */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🚨 Top 10 異常值 (Outliers)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Rank</th>
                    <th className="px-4 py-3">Point ID</th>
                    <th className="px-4 py-3">X</th>
                    <th className="px-4 py-3">Actual Y</th>
                    <th className="px-4 py-3">Predicted Y</th>
                    <th className="px-4 py-3">Residual</th>
                    <th className="px-4 py-3 rounded-tr-lg">Abs Residual</th>
                  </tr>
                </thead>
                <tbody>
                  {result.outliers.map((outlier, idx) => (
                    <tr key={outlier.point_id} className="border-b border-slate-700/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-orange-400">#{outlier.rank}</td>
                      <td className="px-4 py-3">{outlier.point_id}</td>
                      <td className="px-4 py-3">{outlier.x.toFixed(4)}</td>
                      <td className="px-4 py-3">{outlier.y.toFixed(4)}</td>
                      <td className="px-4 py-3">{outlier.predicted_y.toFixed(4)}</td>
                      <td className="px-4 py-3">{outlier.residual.toFixed(4)}</td>
                      <td className="px-4 py-3 font-mono text-red-300">{outlier.absolute_residual.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
            <a href={`http://localhost:8000${result.csv_data_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📥</span> 下載原始資料 (CSV)
            </a>
            <a href={`http://localhost:8000${result.csv_outliers_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📥</span> 下載異常值 (CSV)
            </a>
            <a href={`http://localhost:8000${result.report_url}`} download className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm border border-slate-600">
              <span>📄</span> 下載分析報表 (TXT)
            </a>
          </div>

        </div>
      )}
    </div>
  );
}
