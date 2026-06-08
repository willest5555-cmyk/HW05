import os
import json
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# Set matplotlib backend to Agg to avoid GUI issues
matplotlib.use('Agg')

def business_understanding() -> dict:
    """Phase 1: Business Understanding"""
    return {
        "objective": "Generate synthetic linear data with Gaussian noise to estimate slope and intercept.",
        "goals": [
            "Generate synthetic linear data with Gaussian noise",
            "Estimate the unknown slope and intercept",
            "Measure model performance",
            "Identify the 10 data points that differ most from the fitted regression line"
        ],
        "success_criteria": [
            "The model successfully estimates a slope and intercept",
            "The program calculates appropriate regression evaluation metrics",
            "The program identifies and displays the largest outliers",
            "The program produces a clear visualization and output report"
        ]
    }

def validate_parameters(n: int, a: float, b: float, var: float, random_seed: int) -> None:
    if not isinstance(n, int) or n <= 0:
        raise ValueError("n must be a positive integer.")
    if not (-50 <= a <= 50):
        raise ValueError("a (slope) must be between -50 and 50.")
    if not (0 <= b <= 100):
        raise ValueError("b (intercept) must be between 0 and 100.")
    if not (0 <= var <= 300):
        raise ValueError("var (noise variance) must be between 0 and 300.")

def generate_data(n: int, a: float, b: float, var: float, random_seed: int) -> pd.DataFrame:
    """Phase 2: Data Understanding - Generation"""
    np.random.seed(random_seed)
    
    x = np.random.uniform(-10, 10, n)
    noise_standard_deviation = np.sqrt(var)
    noise = np.random.normal(0, noise_standard_deviation, n)
    y = a * x + b + noise
    
    df = pd.DataFrame({
        'point_id': range(1, n + 1),
        'x': x,
        'y': y,
        'noise': noise
    })
    return df

def prepare_data(dataframe: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Phase 3: Data Preparation"""
    # Check for missing values
    if dataframe.isnull().values.any():
        dataframe = dataframe.dropna()
    
    # Reshape x for scikit-learn
    x = dataframe['x'].values.reshape(-1, 1)
    y = dataframe['y'].values
    
    return x, y

def train_model(x: np.ndarray, y: np.ndarray) -> LinearRegression:
    """Phase 4: Modeling"""
    model = LinearRegression()
    model.fit(x, y)
    return model

def evaluate_model(model: LinearRegression, x: np.ndarray, y: np.ndarray, true_a: float, true_b: float, df: pd.DataFrame) -> tuple[dict, pd.DataFrame]:
    """Phase 5: Evaluation"""
    predicted_y = model.predict(x)
    residual = y - predicted_y
    absolute_residual = np.abs(residual)
    
    estimated_a = float(model.coef_[0])
    estimated_b = float(model.intercept_)
    
    metrics = {
        "true_slope": true_a,
        "estimated_slope": estimated_a,
        "absolute_slope_error": abs(true_a - estimated_a),
        "true_intercept": true_b,
        "estimated_intercept": estimated_b,
        "absolute_intercept_error": abs(true_b - estimated_b),
        "r2_score": r2_score(y, predicted_y),
        "mean_absolute_error": mean_absolute_error(y, predicted_y),
        "mean_squared_error": mean_squared_error(y, predicted_y),
        "root_mean_squared_error": np.sqrt(mean_squared_error(y, predicted_y))
    }
    
    # Find outliers
    outlier_df = df.copy()
    outlier_df['predicted_y'] = predicted_y
    outlier_df['residual'] = residual
    outlier_df['absolute_residual'] = absolute_residual
    
    outlier_df = outlier_df.sort_values(by='absolute_residual', ascending=False)
    top_outliers = outlier_df.head(10).copy()
    top_outliers.insert(0, 'rank', range(1, len(top_outliers) + 1))
    
    return metrics, top_outliers

def create_visualization(dataframe: pd.DataFrame, outliers: pd.DataFrame, model: LinearRegression, metrics: dict, output_path: str) -> None:
    """Phase 6: Deployment - Visualization"""
    plt.figure(figsize=(10, 6))
    
    # All points
    plt.scatter(dataframe['x'], dataframe['y'], color='blue', alpha=0.5, label='Data Points', s=30)
    
    # Regression line
    x_line = np.linspace(dataframe['x'].min(), dataframe['x'].max(), 100).reshape(-1, 1)
    y_line = model.predict(x_line)
    plt.plot(x_line, y_line, color='red', linewidth=2, label='Fitted Regression Line')
    
    # Top 10 outliers
    plt.scatter(outliers['x'], outliers['y'], color='orange', s=100, edgecolors='black', label='Top Outliers', zorder=5)
    
    # Annotate outliers
    for _, row in outliers.iterrows():
        plt.annotate(f"#{int(row['rank'])}", (row['x'], row['y']), textcoords="offset points", xytext=(5,5), ha='center', fontsize=9, fontweight='bold', color='darkred')
    
    plt.title('CRISP-DM Linear Regression Analysis')
    plt.xlabel('X (Feature)')
    plt.ylabel('Y (Target)')
    
    est_a = metrics['estimated_slope']
    est_b = metrics['estimated_intercept']
    r2 = metrics['r2_score']
    rmse = metrics['root_mean_squared_error']
    
    textstr = f"Estimated: y = {est_a:.2f}x + {est_b:.2f}\n$R^2$ = {r2:.3f}\nRMSE = {rmse:.3f}"
    props = dict(boxstyle='round', facecolor='white', alpha=0.8)
    plt.gca().text(0.05, 0.95, textstr, transform=plt.gca().transAxes, fontsize=11, verticalalignment='top', bbox=props)
    
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    
    # Use standard savefig to output_path
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()

def export_results(dataframe: pd.DataFrame, outliers: pd.DataFrame, metrics: dict, output_directory: str) -> None:
    """Phase 6: Deployment - Exporting"""
    os.makedirs(output_directory, exist_ok=True)
    
    dataframe.to_csv(os.path.join(output_directory, 'generated_data.csv'), index=False)
    outliers.to_csv(os.path.join(output_directory, 'top_10_outliers.csv'), index=False)
    
    with open(os.path.join(output_directory, 'model_metrics.csv'), 'w', encoding='utf-8') as f:
        f.write("metric,value\n")
        for k, v in metrics.items():
            f.write(f"{k},{v}\n")
            
    # CRISP-DM Report
    with open(os.path.join(output_directory, 'crisp_dm_report.txt'), 'w', encoding='utf-8') as f:
        f.write("==================================================\n")
        f.write("CRISP-DM Report\n")
        f.write("==================================================\n\n")
        f.write("1. Business Understanding\n")
        f.write("Objective: Generate synthetic linear data and fit regression model.\n\n")
        f.write("2. Data & Modeling\n")
        f.write(f"Estimated Equation: y = {metrics['estimated_slope']:.4f}x + {metrics['estimated_intercept']:.4f}\n\n")
        f.write("3. Evaluation Metrics\n")
        for k, v in metrics.items():
            f.write(f"  - {k}: {v:.4f}\n")

def run_crisp_dm_pipeline(n: int, a: float, b: float, var: float, random_seed: int) -> dict:
    validate_parameters(n, a, b, var, random_seed)
    
    # Phase 1
    business_understanding()
    
    # Phase 2
    df = generate_data(n, a, b, var, random_seed)
    
    # Phase 3
    x, y = prepare_data(df)
    
    # Phase 4
    model = train_model(x, y)
    
    # Phase 5
    metrics, outliers = evaluate_model(model, x, y, a, b, df)
    
    # Phase 6
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    img_path = os.path.join(output_dir, 'regression_analysis.png')
    create_visualization(df, outliers, model, metrics, img_path)
    export_results(df, outliers, metrics, output_dir)
    
    # Return serializable summary for API
    return {
        "metrics": metrics,
        "outliers": outliers.to_dict(orient="records"),
        "image_url": f"/outputs/regression_analysis.png",
        "csv_data_url": "/outputs/generated_data.csv",
        "csv_outliers_url": "/outputs/top_10_outliers.csv",
        "report_url": "/outputs/crisp_dm_report.txt"
    }
