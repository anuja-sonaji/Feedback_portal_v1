/**
 * Professional Dashboard Charts with Optimized Sizing and Styling
 */

// Professional color scheme
const professionalColors = {
    primary: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'],
    success: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    warning: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
    info: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'],
    neutral: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
};

// Global chart instances
window.professionalCharts = {};

/**
 * Initialize all dashboard charts with professional styling
 */
function initializeDashboardCharts(analyticsData) {
    if (!analyticsData || typeof Chart === 'undefined') {
        console.warn('Chart.js or analytics data not available');
        return;
    }

    // Configure Chart.js defaults for professional appearance
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#64748b';
    Chart.defaults.elements.arc.borderWidth = 0;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.boxHeight = 8;

    // Initialize charts with error handling
    try {
        if (analyticsData.employment_type) initEmploymentTypeChart(analyticsData);
        if (analyticsData.billable_status) initBillableStatusChart(analyticsData);
        if (analyticsData.team) initTeamChart(analyticsData);
        if (analyticsData.location) initLocationChart(analyticsData);
        if (analyticsData.skills) initSkillsChart(analyticsData);
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

/**
 * Employment Type Doughnut Chart
 */
function initEmploymentTypeChart(data) {
    const ctx = document.getElementById('employmentTypeChart');
    if (!ctx) return;

    // Destroy existing chart
    if (window.professionalCharts.employmentType) {
        window.professionalCharts.employmentType.destroy();
    }

    const chartData = Object.entries(data.employment_type);
    const labels = chartData.map(([key]) => key);
    const values = chartData.map(([, value]) => value);

    window.professionalCharts.employmentType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: professionalColors.primary.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 11 },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

/**
 * Billable Status Doughnut Chart
 */
function initBillableStatusChart(data) {
    const ctx = document.getElementById('billableStatusChart');
    if (!ctx) return;

    if (window.professionalCharts.billableStatus) {
        window.professionalCharts.billableStatus.destroy();
    }

    const chartData = Object.entries(data.billable_status);
    const labels = chartData.map(([key]) => key);
    const values = chartData.map(([, value]) => value);

    window.professionalCharts.billableStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: professionalColors.success.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 11 },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

/**
 * Team Distribution Doughnut Chart
 */
function initTeamChart(data) {
    const ctx = document.getElementById('teamChart');
    if (!ctx) return;

    if (window.professionalCharts.team) {
        window.professionalCharts.team.destroy();
    }

    const chartData = Object.entries(data.team);
    const labels = chartData.map(([key]) => key);
    const values = chartData.map(([, value]) => value);

    window.professionalCharts.team = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: professionalColors.info.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 11 },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

/**
 * Location Distribution Doughnut Chart
 */
function initLocationChart(data) {
    const ctx = document.getElementById('locationChart');
    if (!ctx) return;

    if (window.professionalCharts.location) {
        window.professionalCharts.location.destroy();
    }

    const chartData = Object.entries(data.location);
    const labels = chartData.map(([key]) => key);
    const values = chartData.map(([, value]) => value);

    window.professionalCharts.location = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: professionalColors.warning.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 11 },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

/**
 * Skills Distribution Horizontal Bar Chart
 */
function initSkillsChart(data) {
    const ctx = document.getElementById('skillsChart');
    if (!ctx) return;

    if (window.professionalCharts.skills) {
        window.professionalCharts.skills.destroy();
    }

    const chartData = Object.entries(data.skills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Show top 10 skills

    const labels = chartData.map(([key]) => key);
    const values = chartData.map(([, value]) => value);

    window.professionalCharts.skills = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: professionalColors.neutral[0],
                borderColor: professionalColors.neutral[1],
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.x} employees`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 11 },
                        color: '#64748b'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 11 },
                        color: '#64748b',
                        maxRotation: 0
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.analyticsData) {
        initializeDashboardCharts(window.analyticsData);
    }
});