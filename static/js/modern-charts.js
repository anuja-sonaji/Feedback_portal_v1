
// Modern Charts for Team Data Distribution
let teamDistributionChart = null;
let activeDataType = 'skill';

const chartColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const dataTypeConfigs = {
    skill: { field: 'skills', title: 'Skills Distribution' },
    billable_status: { field: 'billable_status', title: 'Billable Status' },
    employment_type: { field: 'employment_type', title: 'Employment Type' },
    team: { field: 'team', title: 'Team Distribution' },
    location: { field: 'location', title: 'Location Distribution' }
};

/**
 * Initialize dashboard charts with analytics data
 */
function initializeDashboardCharts(analyticsData) {
    console.log('Initializing dashboard charts:', analyticsData);

    if (!analyticsData) {
        console.error('No analytics data available');
        return;
    }

    // Set Chart.js defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
        Chart.defaults.color = '#6b7280';
    }

    // Store data globally for chart switching
    window.analyticsData = analyticsData;

    // Initialize with skills data by default
    updateDistributionChart(analyticsData, activeDataType);
}

/**
 * Update the distribution chart with new data
 */
function updateDistributionChart(analyticsData, dataType) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) {
        console.error('Distribution chart canvas not found');
        return;
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded');
        return;
    }

    const config = dataTypeConfigs[dataType];
    if (!config || !analyticsData[config.field]) {
        console.error('Invalid data type or missing data:', dataType);
        return;
    }

    const data = analyticsData[config.field] || {};
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (labels.length === 0) {
        console.warn('No data available for', dataType);
        showNoDataMessage();
        return;
    }

    // Destroy existing chart
    if (teamDistributionChart) {
        teamDistributionChart.destroy();
    }

    const backgroundColors = labels.map((_, index) => chartColors[index % chartColors.length]);

    teamDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#374151',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 6,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 600
            }
        }
    });

    // Update legend
    updateChartLegend(labels, values, backgroundColors);
}

/**
 * Show no data message
 */
function showNoDataMessage() {
    const legendContainer = document.getElementById('chartLegend');
    if (legendContainer) {
        legendContainer.innerHTML = `
            <div class="no-data-state text-center py-4">
                <div class="no-data-icon text-muted mb-2">
                    <i class="fas fa-chart-pie fa-2x"></i>
                </div>
                <p class="no-data-text text-muted mb-0">No data available for this category</p>
            </div>
        `;
    }
}

/**
 * Update the custom legend
 */
function updateChartLegend(labels, values, colors) {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;

    const total = values.reduce((a, b) => a + b, 0);

    legendContainer.innerHTML = labels.map((label, index) => {
        const value = values[index];
        const percentage = ((value / total) * 100).toFixed(1);
        const color = colors[index];

        return `
            <div class="legend-item d-flex align-items-center mb-2">
                <div class="legend-color me-3" style="width: 16px; height: 16px; background-color: ${color}; border-radius: 3px;"></div>
                <div class="legend-content flex-grow-1">
                    <div class="legend-label fw-medium text-dark">${label}</div>
                    <div class="legend-stats">
                        <span class="legend-count text-primary fw-bold">${value}</span>
                        <span class="legend-percentage text-muted ms-1">(${percentage}%)</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Switch data view (called by filter buttons)
 */
function switchDataView(dataType) {
    activeDataType = dataType;

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-chart="${dataType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update chart with new data
    if (window.analyticsData) {
        updateDistributionChart(window.analyticsData, dataType);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, checking for analytics data...');
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    }
});

// Export functions for global access
window.switchDataView = switchDataView;
window.initializeDashboardCharts = initializeDashboardCharts;
