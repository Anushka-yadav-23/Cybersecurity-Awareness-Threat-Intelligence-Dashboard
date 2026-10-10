const API_URL = "http://127.0.0.1:5000";

async function loadDashboard() {
    const statusElement = document.getElementById("api-status");
    const errorElement = document.getElementById("error-message");
    const tableBody = document.getElementById("threat-table-body");
    const refreshButton = document.getElementById("refresh-button");

    statusElement.textContent = "Connecting to API...";
    errorElement.textContent = "";
    refreshButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/threats?limit=200`);

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const threats = data.threats;

        statusElement.textContent = "API Connected";
        statusElement.style.background = "#dcfce7";
        statusElement.style.color = "#166534";

        document.getElementById("total-records").textContent = data.count;

        document.getElementById("high-risk").textContent =
            threats.filter(item => item.risk_level === "High").length;

        document.getElementById("critical-risk").textContent =
            threats.filter(item => item.risk_level === "Critical").length;

        tableBody.replaceChildren();

        if (threats.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No records found.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        threats.forEach(item => {
            const row = document.createElement("tr");

            const values = [
                item.record_id,
                item.ioc_type,
                item.ioc_value,
                item.severity,
                `${item.confidence}%`,
                item.risk_score
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const riskCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.textContent = item.risk_level;
            badge.classList.add(
                "risk-badge",
                `risk-${String(item.risk_level).toLowerCase()}`
            );
            riskCell.appendChild(badge);
            row.appendChild(riskCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        statusElement.textContent = "API Connection Failed";
        statusElement.style.background = "#fee2e2";
        statusElement.style.color = "#991b1b";
        errorElement.textContent =
            "Could not load dashboard data. Check that the Flask API is running.";
        console.error("Dashboard loading error:", error);
    } finally {
        refreshButton.disabled = false;
    }
}

document
    .getElementById("refresh-button")
    .addEventListener("click", loadDashboard);

loadDashboard();

const searchInput = document.getElementById("ioc-search");
const searchButton = document.getElementById("ioc-search-button");
const clearButton = document.getElementById("ioc-clear-button");
const searchMessage = document.getElementById("search-message");

async function searchIOC() {
    const query = searchInput.value.trim();

    if (!query) {
        searchMessage.textContent = "Please enter an IOC to search.";
        return;
    }

    searchMessage.textContent = "Searching...";

    try {
        const response = await fetch(
            `${API_URL}/api/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Search failed.");
        }

        const tableBody = document.getElementById("threat-table-body");
        tableBody.replaceChildren();

        data.results.forEach(item => {
            const row = document.createElement("tr");

            [
                item.record_id,
                item.ioc_type,
                item.ioc_value,
                item.severity,
                `${item.confidence}%`,
                item.risk_score,
                item.risk_level
            ].forEach((value, index) => {
                const cell = document.createElement("td");

                if (index === 6) {
                    const badge = document.createElement("span");
                    badge.textContent = value;
                    badge.classList.add(
                        "risk-badge",
                        `risk-${String(value).toLowerCase()}`
                    );
                    cell.appendChild(badge);
                } else {
                    cell.textContent = value;
                }

                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        searchMessage.textContent =
            `Found ${data.count} matching demo records.`;

    } catch (error) {
        searchMessage.textContent = error.message;
    }
}

searchButton.addEventListener("click", searchIOC);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchIOC();
    }
});

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchMessage.textContent = "";
    loadDashboard();
});

const riskFilter = document.getElementById("risk-filter");

riskFilter.addEventListener("change", () => {
    const selectedRisk = riskFilter.value;
    const rows = document.querySelectorAll("#threat-table-body tr");

    rows.forEach(row => {
        const riskCell = row.cells[6];

        if (!riskCell) return;

        const riskLevel = riskCell.textContent.trim();

        row.style.display =
            !selectedRisk || riskLevel === selectedRisk
                ? ""
                : "none";
    });
});
javascript
// Dashboard Analytics Charts
let riskChartInstance = null;
let iocChartInstance = null;

async function loadAnalyticsCharts() {
    try {
        const response = await fetch(`${API_URL}/api/threats?limit=200`);

        if (!response.ok) {
            throw new Error("Unable to load chart data.");
        }

        const data = await response.json();
        const threats = data.threats;

        // Count records by risk level
        const riskLevels = ["Low", "Medium", "High", "Critical"];

        const riskCounts = riskLevels.map(level =>
            threats.filter(item => item.risk_level === level).length
        );

        // Count records by IOC type
        const iocTypes = [...new Set(threats.map(item => item.ioc_type))];

        const iocCounts = iocTypes.map(type =>
            threats.filter(item => item.ioc_type === type).length
        );

        // Risk Distribution Chart
        const riskCanvas = document.getElementById("riskChart");

        if (riskChartInstance) {
            riskChartInstance.destroy();
        }

        riskChartInstance = new Chart(riskCanvas, {
            type: "doughnut",
            data: {
                labels: riskLevels,
                datasets: [{
                    data: riskCounts,
                    backgroundColor: [
                        "#22c55e",
                        "#eab308",
                        "#f97316",
                        "#dc2626"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });

        // IOC Type Distribution Chart
        const iocCanvas = document.getElementById("iocChart");

        if (iocChartInstance) {
            iocChartInstance.destroy();
        }

        iocChartInstance = new Chart(iocCanvas, {
            type: "bar",
            data: {
                labels: iocTypes,
                datasets: [{
                    label: "Number of Records",
                    data: iocCounts,
                    backgroundColor: "#3b82f6"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Chart loading error:", error);
    }
}

loadAnalyticsCharts();
javascript
// Severity Distribution Chart
let severityChartInstance = null;

async function loadSeverityChart() {
    try {
        const response = await fetch(`${API_URL}/api/threats?limit=200`);

        if (!response.ok) {
            throw new Error("Unable to load severity data.");
        }

        const data = await response.json();
        const threats = data.threats;

        const severityLevels = [
            ...new Set(threats.map(item => item.severity))
        ];

        const severityCounts = severityLevels.map(level =>
            threats.filter(item => item.severity === level).length
        );

        const canvas = document.getElementById("severityChart");

        if (severityChartInstance) {
            severityChartInstance.destroy();
        }

        severityChartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: severityLevels,
                datasets: [{
                    label: "Number of Records",
                    data: severityCounts,
                    backgroundColor: "#8b5cf6"
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Severity chart error:", error);
    }
}

loadSeverityChart();