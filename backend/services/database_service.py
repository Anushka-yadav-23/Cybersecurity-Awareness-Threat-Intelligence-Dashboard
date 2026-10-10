import csv
from backend.models.database import get_connection
from backend.services.risk_engine import calculate_risk_score, risk_level
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = PROJECT_ROOT / "data" / "threat_intelligence_dataset.csv"


def import_csv_to_database():
    """Import synthetic demo records from CSV into SQLite."""
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {CSV_PATH}")

    connection = get_connection()
    imported_count = 0

    try:
        with CSV_PATH.open("r", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                score = calculate_risk_score(
                    row["severity"],
                    int(row["confidence"])
                )

                connection.execute(
                    """
                    INSERT OR IGNORE INTO threat_records
                    (record_id, ioc_type, ioc_value, category, severity,
                     confidence, risk_score, risk_level, data_label)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        int(row["record_id"]),
                        row["ioc_type"],
                        row["ioc_value"],
                        row["category"],
                        row["severity"],
                        int(row["confidence"]),
                        score,
                        risk_level(score),
                        row["data_label"]
                    )
                )
                imported_count += 1

        connection.commit()

        total = connection.execute(
            "SELECT COUNT(*) FROM threat_records"
        ).fetchone()[0]

        print(f"CSV records processed: {imported_count}")
        print(f"Records in database: {total}")
        print("Label: SYNTHETIC/DEMO ONLY")

    finally:
        connection.close()


if __name__ == "__main__":
    import_csv_to_database()