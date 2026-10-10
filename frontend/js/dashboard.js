const API_URL = "http://127.0.0.1:5000";

let currentThreats = [];
let currentThreatsForExport = [];

let riskChartInstance = null;
let iocChartInstance = null;
let severityChartInstance = null;
let trendChartInstance = null;

const $ = (id) => document.getElementById(id);

const searchInput = $("ioc-query");
const searchButton = $("ioc-search-button");
const clearButton = $("ioc-clear-button");
const searchMessage = $("search-message");
const riskFilter = $("risk-filter");
const iocTypeFilter = $("ioc-type-filter");
const severityFilter = $("severity-filter");

// ==================== SAFE HELPERS ====================

function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
}

function normalizeIOCType(value) {
    const type = normalize(value).replace(/[\s_-]+/g, "");

    if (["ip", "ipaddress", "ipv4", "ipv6"].includes(type)) return "ip";
    if (["domain", "hostname"].includes(type)) return "domain";
    if (["url", "uri"].includes(type)) return "url";
    if (["hash", "filehash", "md5", "sha1", "sha256"].includes(type)) return "hash";

    return type;
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value ?? "");
}

function setApiStatus(message, connected = false) {
    const status = $("api-status");
    if (!status) return;

    status.textContent = message;
    status.style.color = connected ? "#6ee7b7" : "#fda4af";
    status.style.borderColor = connected ? "#246c59" : "#713d4a";
    status.style.background = connected ? "#102b2a" : "#301b27";
}

function showError(message = "") {
    setText("error-message", message);
}

function getFilteredThreats(threats) {
    const selectedRisk = normalize(riskFilter?.value);
    const selectedType = normalizeIOCType(iocTypeFilter?.value);
    const selectedSeverity = normalize(severityFilter?.value);
    const query = normalize(searchInput?.value);

    return threats.filter((item) => {
        const matchesRisk =
            !selectedRisk || normalize(item.risk_level) === selectedRisk;

        const matchesType =
            !selectedType ||
            normalizeIOCType(item.ioc_type) === selectedType;

        const matchesSeverity =
            !selectedSeverity ||
            normalize(item.severity) === selectedSeverity;

        const matchesQuery =
            !query || normalize(item.ioc_value).includes(query);

        return matchesRisk && matchesType && matchesSeverity && matchesQuery;
    });
}

// ==================== LOAD DASHBOARD ====================

async function loadDashboard() {
    const refreshButton = $("refresh-button");

    setApiStatus("Connecting to API...");
    showError();

    if (refreshButton) refreshButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/threats?limit=200`);

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.threats)) {
            throw new Error("Unexpected API response: threats list is missing.");
        }

        currentThreats = data.threats;

        setApiStatus("● API Connected", true);

        setText("total-records", data.count ?? currentThreats.length);

        setText(
            "high-risk",
            currentThreats.filter(
                (item) => normalize(item.risk_level) === "high"
            ).length
        );

        setText(
            "critical-risk",
            currentThreats.filter(
                (item) => normalize(item.risk_level) === "critical"
            ).length
        );

        renderThreats(currentThreats);
        loadAnalyticsCharts(currentThreats);

    } catch (error) {
        console.error("Dashboard loading error:", error);
        setApiStatus("● API Connection Failed");
        showError(
            "Could not load records. Check that the Flask API is running and try Refresh."
        );

        const tableBody = $("threat-table-body");
        if (tableBody) {
            tableBody.replaceChildren();
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "Unable to load records.";
            row.appendChild(cell);
            tableBody.appendChild(row);
        }
    } finally {
        if (refreshButton) refreshButton.disabled = false;
    }
}

// ==================== RENDER THREAT TABLE ====================

function renderThreats(threats) {
    const tableBody = $("threat-table-body");
    if (!tableBody) return;

    tableBody.replaceChildren();

    if (!threats.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No matching records found.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        currentThreatsForExport = [];
        updateSearchMessage();
        return;
    }

    threats.forEach((item) => {
        const row = document.createElement("tr");

        const values = [
            item.record_id,
            item.ioc_type,
            item.ioc_value,
            item.severity,
            item.confidence == null ? "" : `${item.confidence}%`,
            item.risk_score
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = String(value ?? "");
            row.appendChild(cell);
        });

        const riskCell = document.createElement("td");
        const badge = document.createElement("span");
        const risk = normalize(item.risk_level) || "unknown";

        badge.textContent = item.risk_level ?? "Unknown";
        badge.classList.add("risk-badge", risk, `risk-${risk}`);

        riskCell.appendChild(badge);
        row.appendChild(riskCell);

        row.tabIndex = 0;
        row.title = "Select to view record details";
        row.style.cursor = "pointer";

        row.addEventListener("click", () => showThreatDetails(item));

        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                showThreatDetails(item);
            }
        });

        tableBody.appendChild(row);
    });

    applyFilters();
}

// ==================== THREAT DETAILS ====================


function showThreatDetails(item) {
    const panel = $("threat-details-panel");

    if (!panel || !item) {
        console.error("Threat details panel or record is missing.");
        return;
    }

    setText("detail-record-id", item.record_id ?? "N/A");
    setText("detail-ioc-type", item.ioc_type ?? "N/A");
    setText("detail-ioc-value", item.ioc_value ?? "N/A");

    setText("detail-severity", item.severity ?? "N/A");

    setText(
        "detail-confidence",
        item.confidence == null ? "N/A" : `${item.confidence}%`
    );

    setText("detail-risk-score", item.risk_score ?? "N/A");
    setText("detail-risk-level", item.risk_level ?? "Unknown");

    panel.hidden = false;
    panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

const closeThreatDetailsButton = $("close-threat-details");

if (closeThreatDetailsButton) {
    closeThreatDetailsButton.addEventListener("click", () => {
        const panel = $("threat-details-panel");

        if (panel) {
            panel.hidden = true;
        }
    });
}



// ==================== IOC SEARCH ====================

async function searchIOC() {
    const query = searchInput?.value.trim() ?? "";

    if (!query) {
        applyFilters();
        updateSearchMessage();
        return;
    }

    if (searchButton) searchButton.disabled = true;
    setText("search-message", "Searching demo records...");

    try {
        const response = await fetch(
            `${API_URL}/api/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Search failed (${response.status}).`);
        }

        if (!Array.isArray(data.results)) {
            throw new Error("Unexpected search response from the API.");
        }

        currentThreats = data.results;
        renderThreats(currentThreats);

        setText(
            "search-message",
            `Search returned ${currentThreats.length} record(s) before filters.`
        );

        applyFilters();

    } catch (error) {
        console.error("IOC search error:", error);
        setText("search-message", error.message || "Search failed.");
    } finally {
        if (searchButton) searchButton.disabled = false;
    }
}

if (searchButton) {
    searchButton.addEventListener("click", searchIOC);
}

if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") searchIOC();
    });
}

// ==================== FILTERS ====================

function applyFilters() {
    const visibleThreats = getFilteredThreats(currentThreats);
    const visibleIds = new Set(
        visibleThreats.map((item) => String(item.record_id))
    );

    const tableBody = $("threat-table-body");

    if (tableBody) {
        Array.from(tableBody.rows).forEach((row) => {
            const recordId = row.cells[0]?.textContent.trim();

            const threat = currentThreats.find(
                (item) => String(item.record_id) === recordId
            );

            if (threat) {
                row.style.display = visibleIds.has(String(threat.record_id))
                    ? ""
                    : "none";
            }
        });
    }

    currentThreatsForExport = visibleThreats;
    updateSearchMessage();
}

function updateSearchMessage() {
    if (!searchMessage) return;

    const count = currentThreatsForExport.length;
    const activeFilters = [];

    if (riskFilter?.value) {
        activeFilters.push(`Risk: ${riskFilter.value}`);
    }

    if (iocTypeFilter?.value) {
        activeFilters.push(`IOC Type: ${iocTypeFilter.value}`);
    }

    if (severityFilter?.value) {
        activeFilters.push(`Severity: ${severityFilter.value}`);
    }

    if (searchInput?.value.trim()) {
        activeFilters.push("Search applied");
    }

    searchMessage.textContent = activeFilters.length
        ? `${count} matching record(s) • ${activeFilters.join(" • ")}`
        : `${count} record(s) displayed.`;
}

[riskFilter, iocTypeFilter, severityFilter].forEach((filter) => {
    if (filter) filter.addEventListener("change", applyFilters);
});

// ==================== RESET FILTERS ====================

if (clearButton) {
    clearButton.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (riskFilter) riskFilter.value = "";
        if (iocTypeFilter) iocTypeFilter.value = "";
        if (severityFilter) severityFilter.value = "";

        setText("search-message", "");
        showError();

        loadDashboard();
    });
}

const refreshButton = $("refresh-button");
if (refreshButton) {
    refreshButton.addEventListener("click", loadDashboard);
}

// ==================== CHART THEME ====================

function getChartTheme() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#b8c8df",
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 16,
                    font: { family: "Inter", size: 11 }
                }
            },
            tooltip: {
                backgroundColor: "#0b1527",
                titleColor: "#f0f6ff",
                bodyColor: "#c5d7ef",
                borderColor: "#344965",
                borderWidth: 1,
                padding: 12
            }
        }
    };
}

// ==================== ANALYTICS CHARTS ====================

function loadAnalyticsCharts(threats) {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded. Charts were skipped.");
        return;
    }

    const riskLevels = ["Low", "Medium", "High", "Critical"];
    const riskColors = ["#34d399", "#fbbf24", "#fb923c", "#fb7185"];

    const riskCounts = riskLevels.map((level) =>
        threats.filter(
            (item) => normalize(item.risk_level) === normalize(level)
        ).length
    );

    const riskCanvas = $("riskChart");

    if (riskCanvas) {
        if (riskChartInstance) riskChartInstance.destroy();

        riskChartInstance = new Chart(riskCanvas, {
            type: "doughnut",
            data: {
                labels: riskLevels,
                datasets: [{
                    data: riskCounts,
                    backgroundColor: riskColors,
                    borderColor: "#111d31",
                    borderWidth: 4,
                    hoverOffset: 7
                }]
            },
            options: { ...getChartTheme(), cutout: "68%" }
        });
    }

    const iocTypes = [...new Set(
        threats.map((item) => item.ioc_type || "Unknown")
    )];

    const iocCounts = iocTypes.map((type) =>
        threats.filter(
            (item) => (item.ioc_type || "Unknown") === type
        ).length
    );

    const iocCanvas = $("iocChart");

    if (iocCanvas) {
        if (iocChartInstance) iocChartInstance.destroy();

        iocChartInstance = new Chart(iocCanvas, {
            type: "bar",
            data: {
                labels: iocTypes,
                datasets: [{
                    label: "Records",
                    data: iocCounts,
                    backgroundColor: "#38bdf8",
                    borderRadius: 6,
                    maxBarThickness: 38
                }]
            },
            options: {
                ...getChartTheme(),
                plugins: {
                    ...getChartTheme().plugins,
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: "#91a4bf" },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#91a4bf", precision: 0 },
                        grid: { color: "rgba(145,164,191,.10)" }
                    }
                }
            }
        });
    }

    const severityLevels = ["Critical", "High", "Medium", "Low"];
    const severityColors = ["#fb7185", "#fb923c", "#fbbf24", "#34d399"];

    const severityCounts = severityLevels.map((level) =>
        threats.filter(
            (item) => normalize(item.severity) === normalize(level)
        ).length
    );

    const severityCanvas = $("severityChart");

    if (severityCanvas) {
        if (severityChartInstance) severityChartInstance.destroy();

        severityChartInstance = new Chart(severityCanvas, {
            type: "bar",
            data: {
                labels: severityLevels,
                datasets: [{
                    label: "Records",
                    data: severityCounts,
                    backgroundColor: severityColors,
                    borderRadius: 6,
                    maxBarThickness: 38
                }]
            },
            options: {
                ...getChartTheme(),
                plugins: {
                    ...getChartTheme().plugins,
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: "#91a4bf" },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#91a4bf", precision: 0 },
                        grid: { color: "rgba(145,164,191,.10)" }
                    }
                }
            }
        });
    }

    loadThreatTrendChart(threats);
}

// ==================== THREAT TIMELINE ====================

function loadThreatTrendChart(threats) {
    const canvas = $("threatTrendChart");
    if (!canvas || typeof Chart === "undefined") return;

    if (trendChartInstance) trendChartInstance.destroy();

    const timestampKeys = ["timestamp", "created_at", "event_time", "date"];

    const timestampKey = timestampKeys.find((key) =>
        threats.some((item) =>
            item[key] && !Number.isNaN(Date.parse(item[key]))
        )
    );

    let labels;
    let counts;
    let chartLabel;

    if (timestampKey) {
        const groups = {};

        threats.forEach((item) => {
            const date = new Date(item[timestampKey]);
            if (Number.isNaN(date.getTime())) return;

            const day = date.toISOString().slice(0, 10);
            groups[day] = (groups[day] || 0) + 1;
        });

        labels = Object.keys(groups).sort();
        counts = labels.map((day) => groups[day]);
        chartLabel = "Records by date";
    } else {
        labels = [
            "Sample 1", "Sample 2", "Sample 3",
            "Sample 4", "Sample 5", "Sample 6"
        ];

        counts = [12, 18, 14, 24, 19, 28];
        chartLabel = "Illustrative sample — not actual activity";
    }

    const note = document.querySelector(".chart-note");

    if (note) {
        note.textContent = timestampKey
            ? "Grouped from timestamp fields supplied by the API."
            : "Illustrative values only; no usable timestamp field was found.";
    }

    trendChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: chartLabel,
                data: counts,
                borderColor: "#38bdf8",
                backgroundColor: "rgba(56,189,248,.12)",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: "#38bdf8"
            }]
        },
        options: {
            ...getChartTheme(),
            scales: {
                x: {
                    ticks: { color: "#91a4bf", maxRotation: 35 },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#91a4bf", precision: 0 },
                    grid: { color: "rgba(145,164,191,.10)" }
                }
            }
        }
    });
}

// ==================== CSV EXPORT ====================

const exportButton = $("export-csv-button");

if (exportButton) {
    exportButton.addEventListener("click", () => {
        const threats = currentThreatsForExport;

        if (!threats.length) {
            alert("No matching records available to export.");
            return;
        }

        const headers = [
            "Record ID", "IOC Type", "IOC Value",
            "Severity", "Confidence", "Risk Score", "Risk Level"
        ];

        function escapeCSV(value) {
            let text = String(value ?? "");

            // Prevent spreadsheet formula injection.
            if (/^[\s]*[=+\-@]/.test(text)) {
                text = "'" + text;
            }

            return `"${text.replace(/"/g, '""')}"`;
        }

        const rows = threats.map((item) => [
            item.record_id,
            item.ioc_type,
            item.ioc_value,
            item.severity,
            item.confidence,
            item.risk_score,
            item.risk_level
        ]);

        const csv = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(","))
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "cybershield-filtered-threat-records.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
}

// ==================== INITIALIZE ====================

loadDashboard();