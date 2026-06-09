# CRISP-DM 互動式機器學習實驗室
**(Top 10 Machine Learning Algorithms Interactive Lab)**

這是一個全端的互動式機器學習學習平台，根據 **CRISP-DM (Cross-Industry Standard Process for Data Mining)** 流程設計。使用者可以直接在網頁上調整 10 大經典機器學習演算法的超參數，並即時觀察模型邊界、數據分佈、評估指標，以及下載預測結果與異常樣本的數據集。

## 🚀 專案展示 (Live Demo)
- **正式環境前端 (Vercel)**: [https://hw-05.vercel.app/](https://hw-05.vercel.app/)
- **正式環境後端 API (Render)**: [https://hw05-backend.onrender.com/](https://hw05-backend.onrender.com/)

---

## 🏗️ 系統架構 (Architecture)

本專案採用業界標準的 **微服務 (Microservices) 全端分離架構**，確保高併發下的效能與可用性：

### 1. 前端展示與代理 (Frontend & API Gateway) - 託管於 Vercel
- **框架**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **職責**: 
  - 提供極速的 SSR/SSG 靜態頁面快取。
  - 使用 Next.js API Routes (`/api/general`, `/api/topics`) 處理輕量化的 JSON 資料讀取，達成 0 冷啟動延遲。
  - 透過 `next.config.ts` 的 Proxy Rewrite，將所有需要高算力的 `/api/interactive` 請求無縫轉發給 Render 後端，解決跨來源請求 (CORS) 問題。

### 2. 重度運算引擎 (Backend ML Engine) - 託管於 Render
- **框架**: FastAPI (Python)
- **核心套件**: `scikit-learn`, `pandas`, `numpy`, `matplotlib`
- **職責**:
  - 接收來自前端的演算法超參數。
  - 即時生成模擬數據集，並訓練對應的機器學習模型。
  - **Serverless 友好設計 (Base64 Streaming)**：不依賴實體磁碟讀寫 (`os.makedirs`)，直接使用 `io.BytesIO` 將 Matplotlib 繪製的圖表與 Pandas 產生的 CSV 轉換為 **Base64 Data URIs**，以 JSON 格式高速回傳給前端。

---

## 🌟 支援的機器學習演算法 (Top 10 ML Algorithms)

1. **Linear Regression** (線性迴歸)
2. **Logistic Regression** (邏輯迴歸)
3. **Decision Tree** (決策樹)
4. **Random Forest** (隨機森林)
5. **Support Vector Machine, SVM** (支援向量機)
6. **K-Nearest Neighbors, KNN** (K-近鄰演算法)
7. **Naive Bayes** (單純貝氏分類器)
8. **K-Means Clustering** (K-平均分群)
9. **Principal Component Analysis, PCA** (主成分分析)
10. **Neural Networks / Deep Learning** (類神經網路)

---

## 💻 本地端開發指南 (Local Development)

### 1. 啟動 FastAPI 後端
請確保您的環境已經安裝 Python 3.10+。
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(後端伺服器將運行於 `http://localhost:8000`)*

### 2. 啟動 Next.js 前端
請確保您的環境已經安裝 Node.js。
```bash
cd frontend
npm install
npm run dev
```
*(前端伺服器將運行於 `http://localhost:3000`)*

> **提示**: 在本地開發時，前端預設會將請求發送給 Render 的線上後端。若您修改了 Python 後端程式碼並希望在本地測試，請修改 `frontend/next.config.ts` 中的 `process.env.API_URL` 或直接將 destination 改為 `http://127.0.0.1:8000`。

---

## 📁 專案目錄結構

```text
HW05/
├── backend/                  # Python FastAPI 運算引擎
│   ├── main.py               # API 進入點
│   ├── crisp_dm_engine.py    # scikit-learn 訓練與圖表生成核心
│   └── requirements.txt      # Python 相依套件
│
├── frontend/                 # Next.js 前端介面
│   ├── src/
│   │   ├── app/              # Next.js App Router 頁面與 API Routes
│   │   ├── components/       # 共用 React 元件 (包含 InteractiveLab.tsx)
│   │   └── data.json         # 網頁靜態文章內容與選單資料
│   ├── public/               # 靜態資源 (含演算法介紹圖片)
│   └── next.config.ts        # Next.js 設定檔與 Proxy 路由
│
├── Resources/                # 參考文獻與專案報告
└── vercel.json               # Vercel 佈署核心設定檔
```
