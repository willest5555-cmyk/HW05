# 專案開發日誌 (Project Development Log) - 2026.06.08

## 1. 靜態文件解析與動態網站建置
* **資料萃取**：撰寫 `parse_data.py` 將原始 Word 文件 (`top10_machine_learning_algorithms_研讀報告.docx`) 解析為結構化的 `data.json` 格式，妥善處理了章節標題、內文與圖片，並修復了 Sidebar 導覽列的重複 Bug。
* **全端架構重構**：將原本簡單的靜態 HTML 升級為 **Next.js (前端)** + **FastAPI (後端)** 架構，讓 10 大機器學習演算法的學習內容可以動態呈現。

## 2. 導入 CRISP-DM 互動式資料科學實驗室
* **線性迴歸雛形**：首先依照 CRISP-DM 六大階段（Business Understanding 到 Deployment），利用 `scikit-learn` 與 `matplotlib` 開發出可動態生成資料、訓練模型、並標示出 Top 10 殘差最大點 (Outliers) 的線性迴歸引擎。
* **擴增至 10 大演算法**：後續大幅重構後端系統，建立 `crisp_dm_engine.py`，將互動功能全面擴充至所有 10 個演算法：
  * **分類問題**（Logistic Regression, Decision Tree, Random Forest, SVM, KNN, Naive Bayes, Neural Networks）：動態生成分類資料，繪製彩色決策邊界 (Decision Boundary)，並找出預測錯誤的樣本 (Misclassified Points)。
  * **分群問題**（K-Means）：動態生成叢集資料，繪製群聚中心，找出距離中心最遠的點。
  * **降維問題**（PCA）：將 5D 資料動態降維至 2D 散佈圖。

## 3. 前端 UI/UX 最佳化與 Glassmorphism 設計
* **版面優化**：為提供最佳學習體驗，將圖表展示區置頂，並將參數控制面板（n, noise, max_depth, C 等）與「執行」按鈕直接移至圖表下方，實現「免滑動即時預覽」的效果。
* **動態表單**：透過 `InteractiveLab.tsx` 元件，系統會根據所選演算法，智慧化切換適合的參數輸入框。
* **資料匯出**：於實驗室最下方加入下載功能，支援下載「原始資料 (CSV)」、「異常值 / 錯誤樣本 (CSV)」以及「詳細分析報表 (TXT)」。

## 4. 環境與日誌建立
* **環境依賴**：解決了 `requirements.txt` 的編碼與安裝問題，確保所有資料科學套件順利運行。
* **Prompt 紀錄**：透過解析系統日誌，自動匯出今日所有的對話需求並保存至 `prompt_log.md`。

---
**總結**：今天成功將一份單純的靜態閱讀報告，轉化為具備「全端架構」、「高互動性」、「資料科學運算」與「現代化 UI 設計」的沉浸式機器學習體驗平台！
