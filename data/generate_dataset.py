import csv
import random
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)

OUTPUT_FILE = Path(__file__).with_name("threat_intelligence_dataset.csv")

ip_addresses = [
    "192.0.2.10", "192.0.2.25",
    "198.51.100.15", "198.51.100.40",
    "203.0.113.20", "203.0.113.55"
]
domains = ["example.com", "example.org", "example.net", "demo.invalid"]
ioc_types = ["IPv4", "Domain", "URL", "SHA256", "CVE"]
categories = ["Phishing Awareness", "Malware Report (Simulated)", "Suspicious Login (Simulated)", "Vulnerability Awareness"]
severities = ["Informational", "Low", "Medium", "High", "Critical"]
sources = ["Synthetic Lab", "Training Dataset", "Demo Feed"]

fields = [
    "record_id", "ioc_type", "ioc_value", "category", "severity",
    "confidence", "observed_at", "source", "description", "data_label"
]

now = datetime.now()
with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fields)
    writer.writeheader()
    for number in range(1, 2001):
        ioc_type = random.choice(ioc_types)
        if ioc_type == "IPv4":
            ioc_value = random.choice(ip_addresses)
        elif ioc_type == "Domain":
            ioc_value = random.choice(domains)
        elif ioc_type == "URL":
            ioc_value = "https://" + random.choice(domains) + "/training-page"
        elif ioc_type == "SHA256":
            ioc_value = hashlib.sha256(f"synthetic-demo-{number}".encode()).hexdigest()
        else:
            ioc_value = f"CVE-{random.randint(2020, 2026)}-{random.randint(1000, 99999)}"

        observed_at = now - timedelta(hours=random.randint(0, 24 * 90))
        writer.writerow({
            "record_id": number,
            "ioc_type": ioc_type,
            "ioc_value": ioc_value,
            "category": random.choice(categories),
            "severity": random.choice(severities),
            "confidence": random.randint(10, 100),
            "observed_at": observed_at.isoformat(timespec="seconds"),
            "source": random.choice(sources),
            "description": "Synthetic training record; not a verified real-world threat.",
            "data_label": "SYNTHETIC/DEMO ONLY"
        })

print(f"Dataset created: {OUTPUT_FILE}")
print("Records created: 2000")
print("Label: SYNTHETIC/DEMO ONLY")