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

    currentCompactDataType = dataType;

    // Update button states for compact chart
    document.querySelectorAll('.btn-group-sm .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-chart="${dataType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Create compact chart with new data
    createCompactChart(dataType);
}

let compactChart = null;
let currentCompactDataType = 'team';

function createCompactChart(dataType = 'team') {
    const canvas = document.getElementById('teamCompactChart');
    if (!canvas || !window.analyticsData) return;

    const config = dataConfigs[dataType];
    if (!config || !window.analyticsData[config.field]) return;

    const data = window.analyticsData[config.field];
    if (Object.keys(data).length === 0) return;

    // Destroy existing chart
    if (compactChart) {
        compactChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = referenceColors.slice(0, labels.length);

    compactChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
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
                    cornerRadius: 6,
                    padding: 12,
                    titleFont: { size: 12, weight: '600' },
                    bodyFont: { size: 11 },
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
            }
        }
    });

    // Update compact legend
    const legendContainer = document.getElementById('compactChartLegend');
    if (legendContainer) {
        legendContainer.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <div class="legend-content">
                    <div class="legend-label">${label}</div>
                    <div class="legend-count">${values[index]}</div>
                </div>
            </div>
        `).join('');
    }

    currentCompactDataType = dataType;
}

function initializeDashboardCharts(analyticsData) {
    console.log('Initializing compact team chart:', analyticsData);
    
    if (!analyticsData) {
        console.error('No analytics data available');
        return;
    }

    // Store data globally for chart switching
    window.analyticsData = analyticsData;

    // Initialize with team data
    setTimeout(() => {
        createCompactChart('team');
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
// Modern Charts for Team Data Distribution
let distributionChart = null;
let currentDataType = 'skill';

/**
 * Initialize dashboard charts with analytics data
 */
function initializeDashboardCharts(analyticsData) {
    console.log('Initializing dashboard charts:', analyticsData);

    // Set Chart.js defaults
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.color = '#64748b';

    // Initialize the distribution chart
    initializeDistributionChart(analyticsData);
}

/**
 * Initialize the main distribution chart
 */
function initializeDistributionChart(analyticsData) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) {
        console.error('Distribution chart canvas not found');
        return;
    }

    // Initialize with skills data by default
    updateDistributionChart(analyticsData, currentDataType);
}

/**
 * Update the distribution chart with new data
 */
function updateDistributionChart(analyticsData, dataType) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    const data = analyticsData[dataType] || {};
    const labels = Object.keys(data);
    const values = Object.values(data);

    // Destroy existing chart
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Color schemes for different data types
    const colorSchemes = {
        skill: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#dda0dd', '#98d8c8', '#ffd93d', '#6c5ce7', '#fd79a8'
        ],
        team: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        location: ['#43e97b', '#38f9d7', '#ffecd2', '#fcb69f'],
        employment_type: ['#667eea', '#764ba2', '#f093fb'],
        billable_status: ['#43e97b', '#f093fb', '#ffecd2']
    };

    const colors = colorSchemes[dataType] || colorSchemes.skill;
    const backgroundColors = labels.map((_, index) => colors[index % colors.length]);
    const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));

    distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 3,
                hoverOffset: 8,
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We'll use custom legend
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#64748b',
                    borderWidth: 1,
                    cornerRadius: 8,
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
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false
            }
        }
    });

    // Update legend
    updateLegend(labels, values, backgroundColors);
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
            <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 0.75rem; padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid #e2e8f0; transition: all 0.2s ease;">
                <div class="legend-color" style="width: 20px; height: 20px; border-radius: 50%; background: ${color}; margin-right: 0.75rem; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                <div class="legend-content" style="flex-grow: 1;">
                    <div class="legend-label" style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">${label}</div>
                    <div class="legend-stats" style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="legend-count" style="font-size: 0.8rem; color: #64748b; background: #f3f4f6; padding: 0.125rem 0.5rem; border-radius: 4px;">${value}</span>
                        <span class="legend-percentage" style="font-size: 0.75rem; color: #9ca3af;">${percentage}%</span>
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    }
});

// Export functions for global access
window.switchDataView = switchDataView;
window.initializeDashboardCharts = initializeDashboardCharts;