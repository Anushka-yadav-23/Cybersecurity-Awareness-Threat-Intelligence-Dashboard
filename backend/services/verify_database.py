from backend.models.database import get_connection


def verify_database():
    connection = get_connection()

    try:
        total = connection.execute(
            "SELECT COUNT(*) FROM threat_records"
        ).fetchone()[0]

        print(f"Total threat records: {total}")
        print("\nFirst 5 records:")

        records = connection.execute("""
            SELECT record_id, ioc_type, ioc_value,
                   severity, risk_score, risk_level
            FROM threat_records
            ORDER BY record_id
            LIMIT 5
        """).fetchall()

        for record in records:
            print(dict(record))

        print("\nDatabase verification completed.")
        print("Label: SYNTHETIC/DEMO ONLY")

    finally:
        connection.close()


if __name__ == "__main__":
    verify_database()