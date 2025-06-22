// Modern Chart Configurations for Professional Dashboard
const chartColors = {
    primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
    success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
    info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
    warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
    secondary: ['#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
};

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                    size: 11,
                    family: 'Inter'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 8,
            padding: 12,
            titleFont: {
                size: 12,
                family: 'Inter'
            },
            bodyFont: {
                size: 11,
                family: 'Inter'
            }
        }
    }
};

function createDoughnutChart(canvasId, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: colors,
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: {
                    ...chartDefaults.plugins.legend,
                    position: 'bottom'
                }
            }
        }
    });
}

function createBarChart(canvasId, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Count',
                data: Object.values(data),
                backgroundColor: color,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 10,
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: '#f1f5f9'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10,
                            family: 'Inter'
                        },
                        maxRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeDashboardCharts(analyticsData) {
    if (!analyticsData) return;

    // Employment Type Chart
    if (analyticsData.employment_type) {
        createDoughnutChart('employmentTypeChart', analyticsData.employment_type, chartColors.primary);
    }

    // Billable Status Chart
    if (analyticsData.billable_status) {
        createDoughnutChart('billableStatusChart', analyticsData.billable_status, chartColors.success);
    }

    // Team Chart
    if (analyticsData.team) {
        createDoughnutChart('teamChart', analyticsData.team, chartColors.info);
    }

    // Location Chart
    if (analyticsData.location) {
        createDoughnutChart('locationChart', analyticsData.location, chartColors.warning);
    }

    // Skills Chart (if exists)
    if (analyticsData.skills) {
        createBarChart('skillsChart', analyticsData.skills, chartColors.primary[0]);
    }
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    }
});