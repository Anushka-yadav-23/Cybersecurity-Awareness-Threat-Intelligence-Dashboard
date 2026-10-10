# CyberShield — Cybersecurity Awareness & Threat Intelligence Dashboard

![Python](https://img.shields.io/badge/Python-3.14-blue)
![Flask](https://img.shields.io/badge/Flask-REST%20API-lightgrey)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue)
![Testing](https://img.shields.io/badge/Tests-5%20Passed-success)
![Status](https://img.shields.io/badge/Status-Educational%20Prototype-orange)

## Project Overview

**CyberShield** is an educational cybersecurity project that demonstrates threat intelligence data management, Indicators of Compromise (IOC) searching, demonstration risk scoring, and interactive dashboard analytics.

The application combines a Flask REST API, a local SQLite database, synthetic threat intelligence records, and a browser-based dashboard. Users can explore simulated indicators, apply risk-level filters, search IOC values, view threat details, and analyze distributions through interactive charts.

The project is designed as a learning and portfolio demonstration of backend development, database operations, API design, data visualization, and automated testing.

> **Important:** All records are synthetic demonstration data. They are not verified real-world threats. Risk scores and classifications must not be used to make real security decisions.

## Key Features

- **Threat Intelligence Dashboard:** Displays synthetic threat records stored in a local SQLite database.
- **IOC Search:** Supports searching demonstration indicators such as IP addresses, domains, URLs, and hashes.
- **Risk-Level Filtering:** Filters records according to the available risk categories.
- **Demonstration Risk Scoring:** Calculates risk scores using severity and confidence.
- **Threat Details Panel:** Displays selected record details in the dashboard.
- **Interactive Visualizations:** Uses Chart.js to display threat-related distributions and analytics.
- **Flask REST API:** Provides endpoints for API health, threat records, and IOC searches.
- **SQLite Database:** Stores the application's synthetic demonstration records.
- **CSV Dataset Generation:** Generates a reproducible synthetic dataset containing 2,000 records.
- **CSV Export:** Allows dashboard records to be exported for further educational analysis.
- **Automated Testing:** Uses pytest to test API endpoints and risk-scoring behaviour.

## Dashboard Preview

![CyberShield Threat Intelligence Dashboard](screenshots/dashboard.png)

*CyberShield dashboard preview. All displayed records are synthetic and intended for educational demonstration only.*

**Screenshot note:** Ensure that `screenshots/dashboard.png` exists in the repository. If your screenshot has a different filename, update the image path above to match it.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend logic and risk scoring |
| Flask | Web server and REST API |
| SQLite | Local database storage |
| Pandas | Dataset processing dependency |
| HTML | Dashboard structure |
| CSS | Dashboard styling and layout |
| JavaScript | Search, filters, and dashboard interactions |
| Chart.js | Interactive charts |
| pytest | Automated testing |
| Git and GitHub | Version control and project hosting |

## Application Architecture

```text
Synthetic CSV Dataset
        |
        v
Database Import Service
        |
        v
SQLite Database
        |
        v
Flask REST API
        |
        v
HTML + CSS + JavaScript Dashboard
        |
        v
Search, Filters, Details,
Charts and CSV Export
```

The dataset generator creates demonstration records. The import service calculates risk scores and stores records in SQLite. Flask exposes API endpoints, and the frontend displays the returned information.

## Project Structure

```text
Cybersecurity-Awareness-Threat-Intelligence-Dashboard/
├── backend/
│   ├── models/
│   │   └── database.py
│   ├── services/
│   │   ├── database_service.py
│   │   └── risk_engine.py
│   ├── utils/
│   └── app.py
├── data/
│   ├── generate_dataset.py
│   └── threat_intelligence_dataset.csv
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── dashboard.js
│   └── index.html
├── screenshots/
│   └── dashboard.png
├── tests/
│   ├── test_api.py
│   └── test_risk_engine.py
├── requirements.txt
└── README.md
```

This is a representative structure. Optional folders and files may differ in your local repository. The screenshot file must exist for the preview to render correctly.

## Installation and Setup

### Prerequisites

- Python installed on your system
- Git installed on your system
- A web browser
- A terminal such as Windows PowerShell

### 1. Clone the repository

```bash
git clone https://github.com/Anushka-yadav-23/Cybersecurity-Awareness-Threat-Intelligence-Dashboard.git
cd Cybersecurity-Awareness-Threat-Intelligence-Dashboard
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell activation is unavailable, use the environment's Python executable directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

The requirements file should list the dependencies needed by the project, including Flask and pytest, along with any other packages actually used by the code.

### 4. Generate the synthetic dataset (optional)

```bash
python data/generate_dataset.py
```

This command generates `data/threat_intelligence_dataset.csv` containing 2,000 synthetic records.

**Warning:** Running the generator again overwrites the existing CSV file. Skip this step if you want to preserve your current dataset.

### 5. Initialize the database

```bash
python -m backend.models.database
```

This creates the SQLite database and the `threat_records` table if they do not already exist.

### 6. Import demonstration records

```bash
python -m backend.services.database_service
```

This reads the CSV file, calculates demonstration risk scores, and imports records into SQLite.

The import service uses `INSERT OR IGNORE`, so existing record IDs are not inserted again. If you regenerate the dataset with the same record IDs, existing database records will not automatically be updated.

### 7. Run automated tests

```bash
python -m pytest -v
```

The tests check API health, threat retrieval, search validation, and basic risk-scoring behaviour.

### 8. Start the application

```bash
python -m backend.app
```

Keep the terminal open while using the dashboard.

Open this address in your browser:

**http://127.0.0.1:5000/**

To stop the server, press `Ctrl + C` in the terminal.

## API Documentation

The application provides the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Serves the dashboard |
| GET | `/api/health` | Returns API health information |
| GET | `/api/threats?limit=10` | Retrieves a limited number of threat records |
| GET | `/api/search?q=example.com` | Searches IOC values |

### Example API requests

Health check:

```text
http://127.0.0.1:5000/api/health
```

Retrieve records:

```text
http://127.0.0.1:5000/api/threats?limit=10
```

Search the synthetic dataset:

```text
http://127.0.0.1:5000/api/search?q=example.com
```

The search endpoint requires a non-empty `q` parameter. A request without a search term returns HTTP 400.

The threat retrieval endpoint accepts limits from 1 to 200.

## Risk Scoring

CyberShield calculates a demonstration risk score based on threat severity and confidence.

The resulting score and risk category are used to demonstrate how security-related information can be organized and visualized in a dashboard.

These values are educational indicators only. They do not prove that an IOC is malicious, that a security incident has occurred, or that a real-world system is at risk.

## Automated Testing

The project uses pytest to validate selected backend functionality.

**Latest recorded development test result:**

- API tests: 3 passed
- Risk engine tests: 2 passed
- **Total: 5 passed**

Run the tests from the project root:

```bash
python -m pytest -v
```

The recorded result reflects a previous test run. Execute the command again after making changes to verify the current code.

## Security and Data Disclaimer

- The dataset contains synthetic demonstration records.
- The application does not verify the real-world reputation of an IOC.
- Do not submit confidential, personal, or production security data to this educational application.
- Do not use demonstration scores for blocking, alerting, or incident-response decisions in real environments.
- Treat imported external data as untrusted and validate it before use.
- Any future external threat-intelligence integration should use authorized sources and appropriate security and privacy controls.

## Future Improvements

- Add pagination for larger datasets.
- Expand API validation and error handling.
- Improve search and risk-filter integration.
- Add more automated tests and measure test coverage.
- Add a user guide and additional dashboard screenshots.
- Improve accessibility and responsive dashboard design.
- Consider authorized threat-intelligence API integrations in a future version.

## Learning Outcomes

This project demonstrates practical experience with:

- Python backend development
- REST API design using Flask
- SQLite database operations
- Synthetic dataset generation and processing
- Basic risk-scoring concepts
- Frontend dashboard development
- Interactive data visualization
- Automated testing using pytest
- Git and GitHub project documentation

## Project Status

**Educational prototype under development.**

CyberShield is intended for learning, experimentation with synthetic data, and portfolio demonstration.

**Data classification: SYNTHETIC / DEMO ONLY**
