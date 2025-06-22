// Team Data Distribution Chart - Exact Reference Implementation
const referenceColors = [
    '#FF6B6B', // Red/Pink
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Light Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Purple
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Lavender
    '#85C1E9', // Sky Blue
    '#F8C471', // Peach
    '#82E0AA', // Green
    '#F1948A', // Salmon
    '#AED6F1', // Light Blue
    '#F4D03F'  // Bright Yellow
];

let teamPieChart = null;
let currentDataType = 'skill';

const dataConfigs = {
    skill: { field: 'skills', title: 'Skills Distribution' },
    billable: { field: 'billable_status', title: 'Billable Status' },
    employment: { field: 'employment_type', title: 'Employment Type' },
    team: { field: 'team', title: 'Team Distribution' },
    location: { field: 'location', title: 'Location Distribution' }
};

function createTeamPieChart(data, title) {
    const canvas = document.getElementById('teamPieChart');
    if (!canvas || !data || Object.keys(data).length === 0) {
        console.error('Cannot create chart: missing canvas or data', { canvas: !!canvas, data });
        return;
    }

    // Destroy existing chart
    if (teamPieChart) {
        teamPieChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = referenceColors.slice(0, labels.length);

    teamPieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6,
                hoverBorderWidth: 3
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
                    padding: 16,
                    titleFont: {
                        size: 14,
                        family: 'Inter',
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Inter'
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        },
                        afterLabel: function(context) {
                            // Get employee names for this data point
                            const label = context.label;
                            const currentField = dataConfigs[currentDataType].field;
                            const employeesByCategory = window.employeesByCategory || {};
                            
                            if (employeesByCategory[currentField] && employeesByCategory[currentField][label]) {
                                const employees = employeesByCategory[currentField][label];
                                const names = employees.map(emp => emp.full_name || emp.name).slice(0, 5); // Show max 5 names
                                let result = '\nEmployees: ' + names.join(', ');
                                if (employees.length > 5) {
                                    result += ` and ${employees.length - 5} more...`;
                                }
                                return result;
                            }
                            return '';
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                duration: 800
            }
        }
    });

    // Update legend
    updateLegend(labels, values, colors);
}

function updateLegend(labels, values, colors) {
    const legendContainer = document.getElementById('pieChartLegend');
    if (!legendContainer) return;

    legendContainer.innerHTML = labels.map((label, index) => {
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <div class="legend-content">
                    <div class="legend-label">${label}</div>
                    <div class="legend-count">${values[index]}</div>
                </div>
            </div>
        `;
    }).join('');
}

function switchChartView(dataType) {
    if (!window.analyticsData) {
        console.error('No analytics data available');
        return;
    }

    const config = dataConfigs[dataType];
    if (!config || !window.analyticsData[config.field]) {
        console.error('Invalid data type or missing data:', dataType);
        return;
    }

    currentDataType = dataType;

    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-chart="${dataType}"]`).classList.add('active');

    // Create chart with new data
    createTeamPieChart(window.analyticsData[config.field], config.title);
}

function initializeDashboardCharts(analyticsData) {
    console.log('Initializing team data distribution chart:', analyticsData);
    
    if (!analyticsData) {
        console.error('No analytics data available');
        return;
    }

    // Store data globally for chart switching
    window.analyticsData = analyticsData;

    // Find the first available data set
    let initialDataType = 'skill';
    for (const [key, config] of Object.entries(dataConfigs)) {
        if (analyticsData[config.field] && Object.keys(analyticsData[config.field] || {}).length > 0) {
            initialDataType = key;
            break;
        }
    }

    console.log('Initializing with data type:', initialDataType);
    
    // Initialize chart
    setTimeout(() => {
        switchChartView(initialDataType);
    }, 100);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, checking for analytics data...');
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    } else {
        console.warn('Analytics data not available yet');
    }
});