import os
import io
import base64
import json
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification, make_blobs, make_moons, make_circles
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, accuracy_score, f1_score, silhouette_score

# Set matplotlib backend to Agg to avoid GUI issues
matplotlib.use('Agg')

def plot_decision_boundary(model, X, y, ax):
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.05),
                         np.arange(y_min, y_max, 0.05))
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    ax.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.RdYlBu)
    ax.scatter(X[:, 0], X[:, 1], c=y, edgecolors='k', cmap=plt.cm.RdYlBu)

def run_pipeline(topic_id: str, params: dict) -> dict:
    np.random.seed(params.get('random_seed', 42))
    
    n_samples = params.get('n', 100)
    
    # Defaults
    df = pd.DataFrame()
    outliers = pd.DataFrame()
    metrics = {}
    fig, ax = plt.subplots(figsize=(10, 6))
    title = ""
    
    if topic_id == "1": # Linear Regression
        a = params.get('a', 2.5)
        b = params.get('b', 10.0)
        var = params.get('var', 50.0)
        
        x = np.random.uniform(-10, 10, n_samples)
        noise = np.random.normal(0, np.sqrt(var), n_samples)
        y = a * x + b + noise
        
        df = pd.DataFrame({'point_id': range(1, n_samples + 1), 'x': x, 'y': y})
        
        X_reshaped = x.reshape(-1, 1)
        model = LinearRegression().fit(X_reshaped, y)
        pred_y = model.predict(X_reshaped)
        
        metrics = {
            "r2_score": r2_score(y, pred_y),
            "rmse": np.sqrt(mean_squared_error(y, pred_y)),
            "mae": mean_absolute_error(y, pred_y),
            "estimated_slope": float(model.coef_[0]),
            "estimated_intercept": float(model.intercept_)
        }
        
        res = np.abs(y - pred_y)
        df_out = df.copy()
        df_out['predicted_y'] = pred_y
        df_out['residual'] = y - pred_y
        df_out['absolute_residual'] = res
        outliers = df_out.sort_values(by='absolute_residual', ascending=False).head(10).copy()
        outliers.insert(0, 'rank', range(1, len(outliers) + 1))
        
        ax.scatter(x, y, color='blue', alpha=0.5, label='Data')
        x_line = np.linspace(x.min(), x.max(), 100).reshape(-1, 1)
        ax.plot(x_line, model.predict(x_line), color='red', label='Regression Line')
        ax.scatter(outliers['x'], outliers['y'], color='orange', s=100, edgecolors='black', label='Outliers', zorder=5)
        title = "Linear Regression Analysis"
        
    elif topic_id in ["2", "3", "4", "5", "6", "7", "10"]: # Classifiers
        # Determine dataset type
        if topic_id == "5": # SVM
            X, y = make_circles(n_samples=n_samples, noise=params.get('noise', 0.1), factor=0.5, random_state=params.get('random_seed', 42))
        elif topic_id == "10": # NN
            X, y = make_moons(n_samples=n_samples, noise=params.get('noise', 0.1), random_state=params.get('random_seed', 42))
        else:
            X, y = make_classification(n_samples=n_samples, n_features=2, n_redundant=0, n_clusters_per_class=1, flip_y=params.get('noise', 0.1), random_state=params.get('random_seed', 42))
            
        df = pd.DataFrame({'point_id': range(1, n_samples + 1), 'x1': X[:, 0], 'x2': X[:, 1], 'true_class': y})
        
        # Train model
        if topic_id == "2":
            model = LogisticRegression(C=params.get('C', 1.0))
            title = "Logistic Regression"
        elif topic_id == "3":
            model = DecisionTreeClassifier(max_depth=int(params.get('max_depth', 5)))
            title = "Decision Tree"
        elif topic_id == "4":
            model = RandomForestClassifier(n_estimators=int(params.get('n_estimators', 50)), max_depth=int(params.get('max_depth', 5)))
            title = "Random Forest"
        elif topic_id == "5":
            model = SVC(kernel=params.get('kernel', 'rbf'), C=params.get('C', 1.0))
            title = "Support Vector Machine"
        elif topic_id == "6":
            model = KNeighborsClassifier(n_neighbors=int(params.get('n_neighbors', 5)))
            title = "K-Nearest Neighbors"
        elif topic_id == "7":
            model = GaussianNB()
            title = "Naive Bayes"
        elif topic_id == "10":
            model = MLPClassifier(hidden_layer_sizes=tuple([int(params.get('hidden_size', 50))]), max_iter=1000)
            title = "Neural Network"
            
        model.fit(X, y)
        pred_y = model.predict(X)
        
        metrics = {
            "accuracy": accuracy_score(y, pred_y),
            "f1_score": f1_score(y, pred_y, average='weighted')
        }
        
        df_out = df.copy()
        df_out['predicted_class'] = pred_y
        # Find misclassified
        misclassified = df_out[df_out['true_class'] != df_out['predicted_class']].copy()
        misclassified.insert(0, 'rank', range(1, len(misclassified) + 1))
        outliers = misclassified.head(10) # take top 10 to keep it manageable
        
        plot_decision_boundary(model, X, y, ax)
        if len(outliers) > 0:
            ax.scatter(outliers['x1'], outliers['x2'], facecolors='none', edgecolors='lime', s=150, linewidth=2, label='Misclassified', zorder=5)
            
    elif topic_id == "8": # K-Means
        k = int(params.get('k', 3))
        X, true_y = make_blobs(n_samples=n_samples, centers=k, cluster_std=params.get('cluster_std', 1.0), random_state=params.get('random_seed', 42))
        
        df = pd.DataFrame({'point_id': range(1, n_samples + 1), 'x1': X[:, 0], 'x2': X[:, 1]})
        
        model = KMeans(n_clusters=k, random_state=42)
        clusters = model.fit_predict(X)
        
        metrics = {
            "silhouette_score": silhouette_score(X, clusters) if k > 1 else 0.0,
            "inertia": model.inertia_
        }
        
        df['cluster'] = clusters
        
        # Display points that are furthest from their cluster center as "outliers"
        centers = model.cluster_centers_
        distances = [np.linalg.norm(X[i] - centers[clusters[i]]) for i in range(n_samples)]
        df['distance_to_center'] = distances
        outliers = df.sort_values(by='distance_to_center', ascending=False).head(10).copy()
        outliers.insert(0, 'rank', range(1, len(outliers) + 1))
        
        ax.scatter(X[:, 0], X[:, 1], c=clusters, cmap='viridis', alpha=0.6)
        ax.scatter(centers[:, 0], centers[:, 1], c='red', marker='X', s=200, label='Centroids')
        ax.scatter(outliers['x1'], outliers['x2'], facecolors='none', edgecolors='black', s=100, linewidth=1.5, label='Furthest Points')
        title = "K-Means Clustering"
        
    elif topic_id == "9": # PCA
        # Generate 5D data, 2 informative features
        X, y = make_classification(n_samples=n_samples, n_features=5, n_informative=2, n_redundant=0, random_state=params.get('random_seed', 42))
        
        df = pd.DataFrame({'point_id': range(1, n_samples + 1), 'x1': X[:,0], 'x2': X[:,1], 'x3': X[:,2], 'x4': X[:,3], 'x5': X[:,4], 'class': y})
        
        n_comp = int(params.get('n_components', 2))
        model = PCA(n_components=n_comp)
        X_pca = model.fit_transform(X)
        
        metrics = {
            "explained_variance_ratio_sum": np.sum(model.explained_variance_ratio_),
            "explained_variance_1": model.explained_variance_ratio_[0] if n_comp > 0 else 0,
            "explained_variance_2": model.explained_variance_ratio_[1] if n_comp > 1 else 0
        }
        
        # Outliers could be points with lowest log likelihood or just head 10
        outliers = df.head(10).copy()
        outliers.insert(0, 'rank', range(1, 11))
        
        if n_comp >= 2:
            ax.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap=plt.cm.RdYlBu, alpha=0.7)
            ax.set_xlabel("Principal Component 1")
            ax.set_ylabel("Principal Component 2")
        title = "PCA Dimensionality Reduction"
        
    ax.set_title(title)
    ax.legend(loc='upper right', framealpha=0.8)
    # Generate Base64 Image
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format='png', dpi=150)
    plt.close(fig)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    image_uri = f"data:image/png;base64,{img_b64}"
    
    # Generate Base64 CSVs
    csv_data_b64 = base64.b64encode(df.to_csv(index=False).encode('utf-8')).decode('utf-8')
    csv_data_uri = f"data:text/csv;base64,{csv_data_b64}"
    
    csv_outliers_b64 = base64.b64encode(outliers.to_csv(index=False).encode('utf-8')).decode('utf-8')
    csv_outliers_uri = f"data:text/csv;base64,{csv_outliers_b64}"
    
    # Generate Base64 Report
    report_lines = [f"CRISP-DM Report: {title}", "="*50, "Metrics:"]
    for k, v in metrics.items():
        report_lines.append(f"- {k}: {v:.4f}")
    report_text = "\n".join(report_lines) + "\n"
    report_b64 = base64.b64encode(report_text.encode('utf-8')).decode('utf-8')
    report_uri = f"data:text/plain;base64,{report_b64}"
            
    return {
        "metrics": metrics,
        "table_data": outliers.to_dict(orient="records"),
        "image_url": image_uri,
        "csv_data_url": csv_data_uri,
        "csv_outliers_url": csv_outliers_uri,
        "report_url": report_uri
    }
