import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
# Cargar el dataset (ajusta la ruta si está en otra carpeta)
df = pd.read_csv(r"D:\Andres\Descargas\StudentPerformanceFactors.csv", sep=";")

# 2️⃣ Seleccionar las columnas que usas en tu formulario
columnas = [
    'Hours_Studied', 'Attendance', 'Parental_Involvement',
    'Access_to_Resources', 'Extracurricular_Activities',
    'Sleep_Hours', 'Previous_Scores', 'Motivation_Level'
]

X = df[columnas]
y = df['Exam_Score']

# 3️⃣ Convertir texto a números
# Reemplazar valores comunes categóricos con números
mapeo = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Yes': 1,
    'No': 0
}

X = X.replace(mapeo)

# 4️⃣ Asegurar que todas las columnas sean numéricas
X = X.apply(pd.to_numeric, errors='coerce')
X = X.fillna(0)  # reemplaza NaN por 0

# 5️⃣ Dividir en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6️⃣ Entrenar modelo
modelo = RandomForestRegressor(n_estimators=100, random_state=42)
modelo.fit(X_train, y_train)

# 7️⃣ Evaluar desempeño
predicciones = modelo.predict(X_test)
mae = mean_absolute_error(y_test, predicciones)
r2 = r2_score(y_test, predicciones)

print(f"✅ Entrenamiento completado correctamente")
print(f"📊 Error absoluto medio: {mae:.2f}")
print(f"📈 Coeficiente R²: {r2:.2f}")

# 8️⃣ Guardar modelo
joblib.dump(modelo, r'C:\Users\andre\Desktop\MODELO\prediccion_estudiantes\modelo_prediccion.pkl')
print("💾 Modelo guardado correctamente en 'modelo_prediccion.pkl'")