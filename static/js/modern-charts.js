
// Modern Charts for Team Data Distribution
let distributionChart = null;
let currentDataType = 'skill';

const referenceColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#F4D03F'
];

const dataConfigs = {
    skill: { field: 'skills', title: 'Skills Distribution' },
    billable: { field: 'billable_status', title: 'Billable Status' },
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
        Chart.defaults.color = '#64748b';
    }

    // Store data globally for chart switching
    window.analyticsData = analyticsData;

    // Initialize with skills data by default
    updateDistributionChart(analyticsData, currentDataType);
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

    const config = dataConfigs[dataType];
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
    if (distributionChart) {
        distributionChart.destroy();
    }

    const backgroundColors = labels.map((_, index) => referenceColors[index % referenceColors.length]);

    distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6
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
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
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
                duration: 800
            }
        }
    });

    // Update legend
    updateLegend(labels, values, backgroundColors);
}

/**
 * Show no data message
 */
function showNoDataMessage() {
    const legendContainer = document.getElementById('chartLegend');
    if (legendContainer) {
        legendContainer.innerHTML = `
            <div class="no-data-state">
                <div class="no-data-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <p class="no-data-text">No data available for this category</p>
            </div>
        `;
    }
}

/**
 * Update the custom legend
 */
function updateLegend(labels, values, colors) {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;

    const total = values.reduce((a, b) => a + b, 0);

    legendContainer.innerHTML = labels.map((label, index) => {
        const value = values[index];
        const percentage = ((value / total) * 100).toFixed(1);
        const color = colors[index];

        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <div class="legend-content">
                    <div class="legend-label">${label}</div>
                    <div class="legend-stats">
                        <span class="legend-count">${value}</span>
                        <span class="legend-percentage">${percentage}%</span>
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
    currentDataType = dataType;

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
