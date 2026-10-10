SEVERITY_WEIGHTS = {
    "Informational": 10,
    "Low": 25,
    "Medium": 50,
    "High": 75,
    "Critical": 95,
}


def calculate_risk_score(severity: str, confidence: int) -> int:
    """Return a demo risk score from 0 to 100; not a real threat verdict."""
    severity_score = SEVERITY_WEIGHTS.get(str(severity).title(), 0)
    confidence_score = max(0, min(100, int(confidence)))

    score = (severity_score * 0.7) + (confidence_score * 0.3)
    return round(max(0, min(100, score)))


def risk_level(score: int) -> str:
    """Map a 0-100 demo score to a display category."""
    score = max(0, min(100, int(score)))
    if score <= 20:
        return "Informational"
    if score <= 40:
        return "Low"
    if score <= 60:
        return "Medium"
    if score <= 80:
        return "High"
    return "Critical"


if __name__ == "__main__":
    examples = [
        ("Low", 27),
        ("Medium", 60),
        ("Critical", 95),
    ]
    for severity, confidence in examples:
        score = calculate_risk_score(severity, confidence)
        print(f"Severity={severity}, Confidence={confidence}, Score={score}, Level={risk_level(score)}")