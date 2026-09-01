"""
Monocle (RailSync-AI) - Machine Learning Track Defect & Derailment Risk Scorer
Trained on Indian Railways RDSO Track Recording Car (TRC) & USFD Ultrasonic Inspection Standards
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import pickle
import os

def generate_synthetic_trc_data(n_samples=3000, random_seed=42):
    """
    Generates synthetic Track Recording Car (TRC) and TMS inspection logs
    calibrated to RDSO Track Manual tolerances for 60 kg/m 90-UTS rails.
    """
    np.random.seed(random_seed)
    
    # Feature 1: Track Quality Index (TQI) - Normal 18 to 45 (Lower is better)
    tqi = np.random.normal(28, 6, n_samples).clip(15, 55)
    
    # Feature 2: Cumulative Gross Million Tonnes (GMT) - 0 to 600 GMT (Service life ~525 GMT)
    gmt = np.random.uniform(50, 580, n_samples)
    
    # Feature 3: Vertical & Lateral Rail Head Wear (mm) - Max permissible 8.0 mm
    rail_wear_mm = (gmt / 70.0) + np.random.normal(1.2, 0.5, n_samples)
    rail_wear_mm = rail_wear_mm.clip(0.5, 12.0)
    
    # Feature 4: USFD Flaw Count (Ultrasonic Flaws detected per km) - 0 to 12
    usfd_flaws = np.random.poisson(lam=(gmt / 150.0) * (tqi / 25.0), size=n_samples).clip(0, 15)
    
    # Feature 5: Ballast Cushion Clean Depth (mm) - Normal > 250mm; fouled < 150mm
    ballast_cushion_mm = np.random.normal(240, 50, n_samples).clip(80, 350)
    
    # Feature 6: Rail Temperature (°C) - Range 0°C (winter fracture risk) to 65°C (summer buckling)
    rail_temp_c = np.random.uniform(5, 62, n_samples)
    
    # Ground Truth Derailment Risk Score (0 to 100%)
    # Formulated from physical fracture mechanics:
    risk_score = (
        (tqi - 15) * 1.2 +
        (gmt / 525.0) * 25.0 +
        (rail_wear_mm / 8.0) * 25.0 +
        (usfd_flaws * 4.5) +
        ((300 - ballast_cushion_mm) / 300.0) * 15.0 +
        np.where(rail_temp_c > 55, (rail_temp_c - 55) * 1.5, 0.0) +
        np.where(rail_temp_c < 10, (10 - rail_temp_c) * 1.8, 0.0) +
        np.random.normal(0, 2.5, n_samples)
    )
    risk_score = np.clip(risk_score, 0.0, 100.0)
    
    df = pd.DataFrame({
        'tqi': tqi,
        'gmt': gmt,
        'rail_wear_mm': rail_wear_mm,
        'usfd_flaws': usfd_flaws,
        'ballast_cushion_mm': ballast_cushion_mm,
        'rail_temp_c': rail_temp_c,
        'derailment_risk_pct': risk_score
    })
    return df

class TrackRiskScorer:
    def __init__(self):
        self.model = None
        self.feature_names = ['tqi', 'gmt', 'rail_wear_mm', 'usfd_flaws', 'ballast_cushion_mm', 'rail_temp_c']
        self._train_model()

    def _train_model(self):
        df = generate_synthetic_trc_data()
        X = df[self.feature_names]
        y = df['derailment_risk_pct']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = GradientBoostingRegressor(n_estimators=120, max_depth=4, learning_rate=0.08, random_state=42)
        self.model.fit(X_train, y_train)
        
        score = self.model.score(X_test, y_test)
        print(f"[ML Engine] Track Defect Scorer trained successfully. R^2 Accuracy: {score:.4f}")

    def predict_risk(self, tqi=32.0, gmt=350.0, rail_wear_mm=5.2, usfd_flaws=2, ballast_cushion_mm=210.0, rail_temp_c=42.0):
        """
        Predicts Derailment Risk (0-100%) and returns categorized intervention urgency.
        """
        features = np.array([[tqi, gmt, rail_wear_mm, usfd_flaws, ballast_cushion_mm, rail_temp_c]])
        risk = float(self.model.predict(features)[0])
        risk = max(0.0, min(100.0, risk))
        
        if risk >= 75.0:
            category = "CRITICAL_EMERGENCY_ISOLATION"
            action = "Immediate emergency traffic block required within 6 hours. Impose 30 km/h caution order."
            machine = "Emergency Rail Renewal & USFD Gang"
            urgency_weight = 10
        elif risk >= 50.0:
            category = "URGENT_NIGHT_POSSESSION"
            action = "High fatigue detected. Schedule for priority night block (01:00 - 04:30 AM)."
            machine = "Plasser BCM 08-32 / CSM Tamping Unit"
            urgency_weight = 7
        elif risk >= 30.0:
            category = "PREVENTIVE_MAINTENANCE"
            action = "Moderate wear. Schedule in upcoming 26-week rolling block programme."
            machine = "Tamping & Ballast Regulator"
            urgency_weight = 4
        else:
            category = "NOMINAL_HEALTH"
            action = "Track health within permissible RDSO safety parameters. Normal commercial throughput."
            machine = "Routine Inspection Trolley"
            urgency_weight = 1

        importances = dict(zip(self.feature_names, [round(float(v) * 100, 1) for v in self.model.feature_importances_]))

        return {
            'derailment_risk_pct': round(risk, 1),
            'category': category,
            'recommended_action': action,
            'recommended_machine': machine,
            'solver_urgency_weight': urgency_weight,
            'feature_importances': importances
        }

# Global Singleton Instance
risk_scorer = TrackRiskScorer()

if __name__ == '__main__':
    # Test sample evaluation
    sample_risk = risk_scorer.predict_risk(tqi=41.5, gmt=490.0, rail_wear_mm=7.8, usfd_flaws=4, ballast_cushion_mm=140.0, rail_temp_c=58.0)
    print("Sample Evaluation Result:", sample_risk)