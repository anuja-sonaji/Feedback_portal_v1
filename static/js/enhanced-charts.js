/**
 * Enhanced Charts Configuration for Professional Dashboard
 */

// Enhanced color palettes
const colorPalettes = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
    gradient: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ],
    professional: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    success: ['#22c55e', '#16a34a', '#15803d', '#166534'],
    warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    info: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
};

// Enhanced chart defaults
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#64748b';

/**
 * Initialize all dashboard charts with enhanced styling
 */
function initializeDashboardCharts(analyticsData) {
    if (!analyticsData) return;
    
    // Initialize each chart type
    initEnhancedEmploymentTypeChart(analyticsData);
    initEnhancedBillableStatusChart(analyticsData);
    initEnhancedTeamChart(analyticsData);
    initEnhancedLocationChart(analyticsData);
    initEnhancedSkillsChart(analyticsData);
}

/**
 * Enhanced Employment Type Pie Chart
 */
function initEnhancedEmploymentTypeChart(data) {
    const ctx = document.getElementById('employmentTypeChart');
    if (!ctx || !data.employment_type) return;
    
    const labels = Object.keys(data.employment_type);
    const values = Object.values(data.employment_type);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colorPalettes.professional,
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
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
                animateRotate: true
            }
        }
    });
}

/**
 * Enhanced Billable Status Chart
 */
function initEnhancedBillableStatusChart(data) {
    const ctx = document.getElementById('billableStatusChart');
    if (!ctx || !data.billable_status) return;
    
    const labels = Object.keys(data.billable_status);
    const values = Object.values(data.billable_status);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colorPalettes.success,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    cornerRadius: 8
                }
            },
            animation: {
                animateScale: true
            }
        }
    });
}

/**
 * Enhanced Team Distribution Chart
 */
function initEnhancedTeamChart(data) {
    const ctx = document.getElementById('teamChart');
    if (!ctx || !data.team) return;
    
    const labels = Object.keys(data.team);
    const values = Object.values(data.team);
    
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colorPalettes.info.map(color => color + '80'),
                borderColor: colorPalettes.info,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/**
 * Enhanced Skills Bar Chart
 */
function initEnhancedSkillsChart(data) {
    const ctx = document.getElementById('skillsChart');
    if (!ctx || !data.skills) return;
    
    const sortedSkills = Object.entries(data.skills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const labels = sortedSkills.map(([skill]) => skill);
    const values = sortedSkills.map(([,count]) => count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Employee Count',
                data: values,
                backgroundColor: colorPalettes.warning.map(color => color + '80'),
                borderColor: colorPalettes.warning[0],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45
                    }
                }
            },
            animation: {
                delay: (context) => context.dataIndex * 100
            }
        }
    });
}

/**
 * Enhanced Location Chart
 */
function initEnhancedLocationChart(data) {
    const ctx = document.getElementById('locationChart');
    if (!ctx || !data.location) return;
    
    const labels = Object.keys(data.location);
    const values = Object.values(data.location);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colorPalettes.gradient.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            cutout: '50%'
        }
    });
}

/**
 * Export chart as image
 */
function exportChart(canvasId, filename = 'chart.png') {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }
}

/**
 * Toggle chart view (bar/horizontal for skills chart)
 */
function toggleSkillsChartView() {
    // Implementation for chart view toggle
    console.log('Toggle skills chart view');
}