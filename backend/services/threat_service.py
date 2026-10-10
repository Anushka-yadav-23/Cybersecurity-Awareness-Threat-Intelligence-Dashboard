import csv
from pathlib import Path
from backend.services.risk_engine import calculate_risk_score, risk_level

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "data" / "threat_intelligence_dataset.csv"


def get_threat_records(limit: int = 100) -> list[dict]:
    """Read synthetic demo records and add calculated risk information."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    records = []
    with DATASET_PATH.open("r", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            score = calculate_risk_score(row["severity"], int(row["confidence"]))
            row["risk_score"] = score
            row["risk_level"] = risk_level(score)
            records.append(row)
            if len(records) >= max(1, int(limit)):
                break
    return records


if __name__ == "__main__":
    records = get_threat_records(5)
    print(f"Records processed: {len(records)}")
    for record in records:
        print(
            f"ID={record['record_id']} | IOC={record['ioc_value']} | "
            f"Score={record['risk_score']} | Level={record['risk_level']}"
        )
    print("Label: SYNTHETIC/DEMO ONLY")