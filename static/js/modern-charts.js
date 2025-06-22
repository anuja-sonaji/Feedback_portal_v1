// Modern Chart Configurations for Professional Dashboard
const chartColors = {
    vibrant: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F'
    ],
    professional: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
    ]
};

let currentChart = null;
let currentChartType = 'skill';

const chartConfigs = {
    skill: { data: 'skills', title: 'Skills Distribution', colors: chartColors.vibrant },
    billable: { data: 'billable_status', title: 'Billable Status', colors: chartColors.professional },
    employment: { data: 'employment_type', title: 'Employment Type', colors: chartColors.professional },
    team: { data: 'team', title: 'Team Distribution', colors: chartColors.vibrant },
    location: { data: 'location', title: 'Location Distribution', colors: chartColors.professional }
};

function createMainChart(data, colors, title) {
    const ctx = document.getElementById('mainChart');
    if (!ctx || !data) return;

    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We'll create custom legend
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: 'Inter',
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12,
                        family: 'Inter'
                    },
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
            layout: {
                padding: 20
            }
        }
    });

    // Update custom legend
    updateCustomLegend(labels, values, colors.slice(0, labels.length));
}

function updateCustomLegend(labels, values, colors) {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;

    const total = values.reduce((a, b) => a + b, 0);
    
    legendContainer.innerHTML = labels.map((label, index) => {
        const value = values[index];
        const percentage = ((value / total) * 100).toFixed(1);
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <div class="legend-text">${label}</div>
                <div class="legend-value">${value}</div>
            </div>
        `;
    }).join('');
}

function switchChart(chartType, analyticsData) {
    const config = chartConfigs[chartType];
    if (!config || !analyticsData[config.data]) return;

    currentChartType = chartType;
    
    // Update button states
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

    // Create new chart
    createMainChart(analyticsData[config.data], config.colors, config.title);
}

function initializeDashboardCharts(analyticsData) {
    console.log('Initializing modern dashboard charts with data:', analyticsData);
    if (!analyticsData) {
        console.error('No analytics data provided');
        return;
    }

    // Set up chart switcher buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            console.log('Switching to chart type:', chartType);
            switchChart(chartType, analyticsData);
        });
    });

    // Initialize with skills chart (or first available)
    let initialChart = 'skill';
    if (!analyticsData.skills || Object.keys(analyticsData.skills || {}).length === 0) {
        // Find first available chart
        for (const [key, config] of Object.entries(chartConfigs)) {
            if (analyticsData[config.data] && Object.keys(analyticsData[config.data] || {}).length > 0) {
                initialChart = key;
                console.log('Using fallback chart:', initialChart);
                break;
            }
        }
    }

    console.log('Initializing with chart type:', initialChart);
    switchChart(initialChart, analyticsData);
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    }
});