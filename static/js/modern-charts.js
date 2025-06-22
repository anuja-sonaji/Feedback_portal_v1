The code has been updated to include enhanced chart switching functionality and a more professional look for team analytics.
```

```replit_final_file
// Global chart instance
let currentChart = null;
let currentDataType = 'team';

// Chart switching functionality
function switchDataView(dataType) {
    currentDataType = dataType;

    // Update active filter option
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.chart === dataType) {
            option.classList.add('active');
        }
    });

    // Update chart title
    const titles = {
        'team': 'Team Distribution',
        'location': 'Location Analysis', 
        'employment_type': 'Employment Types',
        'billable_status': 'Billable Status'
    };

    const chartTitleElement = document.getElementById('currentChartTitle');
    if (chartTitleElement) {
        chartTitleElement.textContent = titles[dataType] || 'Analytics';
    }

    // Update chart and legend
    updateChart(dataType);
    updateLegend(dataType);
}

// Update chart based on data type
function updateChart(dataType) {
    const canvas = document.getElementById('distributionChart');
    const noDataOverlay = document.getElementById('noDataOverlay');

    if (!canvas || !window.employeesByCategory) return;

    const data = window.employeesByCategory[dataType];

    if (!data || Object.keys(data).length === 0) {
        if (noDataOverlay) noDataOverlay.style.display = 'flex';
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        return;
    }

    if (noDataOverlay) noDataOverlay.style.display = 'none';

    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data);

    // Color schemes for different data types
    const colorSchemes = {
        'team': ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
        'location': ['#f093fb', '#f5576c', '#667eea', '#764ba2', '#4facfe', '#00f2fe'],
        'employment_type': ['#4facfe', '#00f2fe', '#667eea', '#764ba2'],
        'billable_status': ['#43e97b', '#38f9d7', '#f093fb', '#f5576c']
    };

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colorSchemes[dataType] || colorSchemes.team,
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800
            }
        }
    });
}

// Update legend based on data type
function updateLegend(dataType) {
    const legendContainer = document.getElementById('chartLegend');
    const totalElement = document.getElementById('totalEmployees');

    if (!legendContainer || !window.employeesByCategory) return;

    const data = window.employeesByCategory[dataType];

    if (!data || Object.keys(data).length === 0) {
        legendContainer.innerHTML = '<p class="text-muted text-center p-3">No data available</p>';
        if (totalElement) totalElement.textContent = '0 employees';
        return;
    }

    const colorSchemes = {
        'team': ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
        'location': ['#f093fb', '#f5576c', '#667eea', '#764ba2', '#4facfe', '#00f2fe'],
        'employment_type': ['#4facfe', '#00f2fe', '#667eea', '#764ba2'],
        'billable_status': ['#43e97b', '#38f9d7', '#f093fb', '#f5576c']
    };

    const colors = colorSchemes[dataType] || colorSchemes.team;
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    if (totalElement) {
        totalElement.textContent = `${total} employee${total !== 1 ? 's' : ''}`;
    }

    let legendHTML = '';
    Object.entries(data).forEach(([key, value], index) => {
        const percentage = ((value / total) * 100).toFixed(1);
        const color = colors[index % colors.length];

        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <div class="legend-content">
                    <div class="legend-label">${key}</div>
                </div>
                <div class="legend-count">${value}</div>
                <div class="legend-percentage">${percentage}%</div>
            </div>
        `;
    });

    legendContainer.innerHTML = legendHTML;
}

// Export chart functionality
function exportChart(canvasId, filename = 'chart.png') {
    try {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
        }
    } catch (error) {
        console.error('Error exporting chart:', error);
    }
}

// Enhanced Employee Search
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced analytics
    if (window.employeesByCategory) {
        // Initialize with team view by default
        switchDataView('team');
    }
});

// Make functions globally available
window.switchDataView = switchDataView;
window.exportChart = exportChart;