# CyberShield — Cybersecurity Awareness & Threat Intelligence Dashboard

## Project Overview

CyberShield is an educational cybersecurity project designed to demonstrate threat intelligence data management, IOC searching, risk scoring, and dashboard analytics using synthetic demonstration data.

The application provides a web dashboard where users can explore simulated threat records, filter them by risk level, search indicators of compromise (IOCs), and visualize threat distributions.

**Important:** All records are synthetic demonstration data. They are not verified real-world threats and must not be used to make real security decisions.

## Key Features

- **Threat Intelligence Dashboard:** Displays threat records from a local SQLite database.
- **IOC Search:** Search simulated IP addresses, domains, URLs, and hashes.
- **Risk-Level Filtering:** Filter displayed records by risk level.
- **Risk Scoring:** Calculate demonstration risk scores using severity and confidence.
- **Data Visualization:** Interactive charts for risk distribution, IOC types, and severity.
- **Flask REST API:** Provides endpoints for health checks, threat records, and IOC searches.
- **SQLite Database:** Stores the synthetic threat intelligence dataset.
- **Automated Testing:** Uses pytest to test the risk engine and API endpoints.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend logic and risk scoring |
| Flask | REST API and web server |
| SQLite | Local database |
| Pandas | Dataset processing |
| HTML | Dashboard structure |
| CSS | Dashboard styling |
| JavaScript | Search, filters, and chart interactions |
| Chart.js | Data visualization |
| pytest | Automated testing |

## Project Structure

```text
Cybersecurity-Awareness-Threat-Intelligence-Dashboard/
├── awareness/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.py
├── data/
│   ├── generate_dataset.py
│   └── threat_intelligence_dataset.csv
├── docs/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── dashboard.js
│   └── index.html
├── reports/
├── screenshots/
├── tests/
│   ├── test_api.py
│   └── test_risk_engine.py
├── requirements.txt
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Anushka-yadav-23/Cybersecurity-Awareness-Threat-Intelligence-Dashboard.git
cd Cybersecurity-Awareness-Threat-Intelligence-Dashboard
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

Ensure that `requirements.txt` includes the packages needed by the project, including Flask, pandas, and pytest.

### 4. Generate the synthetic dataset

```bash
python data/generate_dataset.py
```

This generates the demonstration threat intelligence CSV file.

### 5. Initialize the database

```bash
python -m backend.models.database
```

### 6. Import demonstration records

```bash
python -m backend.services.database_service
```

### 7. Start the application

```bash
python -m backend.app
```

Open the dashboard in a browser:

http://127.0.0.1:5000/

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Check API health |
| `GET /api/threats?limit=10` | Retrieve threat records |
| `GET /api/search?q=example.com` | Search synthetic IOC records |

The search endpoint requires a non-empty `q` parameter. Requests without a search term return HTTP 400.

## Risk Scoring

The project calculates a demonstration risk score based on threat severity and confidence.

Risk scores and risk categories are intended for learning and dashboard demonstration only. They do not establish that an indicator is malicious or that a real-world system is at risk.

## Testing

Run all automated tests from the project root:

```bash
python -m pytest -v
```

Current development test result:

- Risk engine tests: 2 passed
- API tests: 3 passed
- Total: 5 passed

These results reflect the tests run during development. Run the command again to verify the current code.

## Security and Data Disclaimer

- The dataset contains synthetic demonstration records.
- The application does not establish the real-world reputation of any IOC.
- Do not submit confidential, personal, or production security data to this demonstration application.
- Do not use the generated data for blocking, alerting, or incident-response decisions in real environments.
- Any future integration with external threat intelligence sources should use authorized sources, safe validation, and appropriate privacy controls.

## Future Improvements

- Add pagination for large result sets.
- Add stronger validation and error handling.
- Improve search and risk-filter integration.
- Add more automated tests and test coverage.
- Add documented screenshots and a user guide.
- Consider authorized threat intelligence API integrations in a future version.

## Learning Outcomes

This project demonstrates practical experience with:

- Python backend development
- REST API design
- SQLite database operations
- Synthetic data generation and processing
- Risk scoring concepts
- Frontend dashboard development
- Data visualization
- Automated testing with pytest

## Project Status

Educational prototype under development.

**Data label: SYNTHETIC / DEMO ONLY**
