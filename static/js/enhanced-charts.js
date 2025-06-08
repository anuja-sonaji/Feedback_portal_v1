/**
 * Enhanced Charts Configuration for Professional Dashboard
 */

// Enhanced color palettes
const colorPalettes = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
    gradient: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)', 
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(168, 237, 234, 0.8)'
    ],
    professional: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    success: ['#22c55e', '#16a34a', '#15803d', '#166534'],
    warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    info: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
};

// Global chart storage for cleanup
window.dashboardCharts = {};

/**
 * Initialize all dashboard charts with enhanced styling
 */
function initializeDashboardCharts(analyticsData) {
    try {
        if (!analyticsData || typeof Chart === 'undefined') {
            console.error('Chart.js not loaded or analytics data missing');
            return;
        }
        
        // Set chart defaults
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        Chart.defaults.font.size = 10;
        Chart.defaults.color = '#64748b';
        
        // Initialize each chart type safely
        if (analyticsData.employment_type) {
            initEnhancedEmploymentTypeChart(analyticsData);
        }
        if (analyticsData.billable_status) {
            initEnhancedBillableStatusChart(analyticsData);
        }
        if (analyticsData.team) {
            initEnhancedTeamChart(analyticsData);
        }
        if (analyticsData.location) {
            initEnhancedLocationChart(analyticsData);
        }
        if (analyticsData.skills) {
            initEnhancedSkillsChart(analyticsData);
        }
        
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

/**
 * Enhanced Employment Type Pie Chart with employee names on hover
 */
function initEnhancedEmploymentTypeChart(data) {
    const ctx = document.getElementById('employmentTypeChart');
    if (!ctx || !data.employment_type) return;
    
    try {
        // Destroy existing chart if it exists
        if (window.dashboardCharts.employmentType) {
            window.dashboardCharts.employmentType.destroy();
        }
        
        const labels = Object.keys(data.employment_type);
        const values = Object.values(data.employment_type);
        
        window.dashboardCharts.employmentType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colorPalettes.professional,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
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
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 9,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 12,
                        titleFont: {
                            size: 11,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 10
                        },
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                            afterLabel: function(context) {
                                const empType = context.label;
                                const employees = window.employeesByType[empType] || [];
                                if (employees.length > 0) {
                                    const names = employees.slice(0, 5).map(emp => emp.full_name || emp.name || 'Unknown');
                                    const result = ['Employees:'];
                                    names.forEach(name => result.push(`• ${name}`));
                                    if (employees.length > 5) {
                                        result.push(`• and ${employees.length - 5} more...`);
                                    }
                                    return result;
                                }
                                return '';
                            }
                        }
                    }
                },
                cutout: '55%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    } catch (error) {
        console.error('Error creating employment type chart:', error);
    }
}

/**
 * Enhanced Billable Status Chart with employee names on hover
 */
function initEnhancedBillableStatusChart(data) {
    const ctx = document.getElementById('billableStatusChart');
    if (!ctx || !data.billable_status) return;
    
    try {
        // Destroy existing chart if it exists
        if (window.dashboardCharts.billableStatus) {
            window.dashboardCharts.billableStatus.destroy();
        }
        
        const labels = Object.keys(data.billable_status);
        const values = Object.values(data.billable_status);
        
        window.dashboardCharts.billableStatus = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colorPalettes.success,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 12,
                            usePointStyle: true,
                            font: {
                                size: 9,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 12,
                        titleFont: {
                            size: 11,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 10
                        },
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                            afterLabel: function(context) {
                                const billableStatus = context.label;
                                const employees = window.employeesByBillable[billableStatus] || [];
                                if (employees.length > 0) {
                                    const names = employees.slice(0, 5).map(emp => emp.full_name || emp.name || 'Unknown');
                                    const result = ['Employees:'];
                                    names.forEach(name => result.push(`• ${name}`));
                                    if (employees.length > 5) {
                                        result.push(`• and ${employees.length - 5} more...`);
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
                    duration: 1000
                }
            }
        });
    } catch (error) {
        console.error('Error creating billable status chart:', error);
    }
}

/**
 * Enhanced Team Distribution Chart with employee names on hover
 */
function initEnhancedTeamChart(data) {
    const ctx = document.getElementById('teamChart');
    if (!ctx || !data.team) return;
    
    try {
        // Destroy existing chart if it exists
        if (window.dashboardCharts.team) {
            window.dashboardCharts.team.destroy();
        }
        
        const labels = Object.keys(data.team);
        const values = Object.values(data.team);
        
        window.dashboardCharts.team = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colorPalettes.info.map(color => color + '60'),
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
                            padding: 12,
                            font: {
                                size: 9,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 12,
                        titleFont: {
                            size: 11,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 10
                        },
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                            afterLabel: function(context) {
                                const team = context.label;
                                const employees = window.employeesByTeam[team] || [];
                                if (employees.length > 0) {
                                    const names = employees.slice(0, 5).map(emp => emp.full_name || emp.name || 'Unknown');
                                    const result = ['Members:'];
                                    names.forEach(name => result.push(`• ${name}`));
                                    if (employees.length > 5) {
                                        result.push(`• and ${employees.length - 5} more...`);
                                    }
                                    return result;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        pointLabels: {
                            font: {
                                size: 8,
                                weight: '500'
                            }
                        },
                        ticks: {
                            font: {
                                size: 8
                            }
                        }
                    }
                },
                animation: {
                    duration: 1200
                }
            }
        });
    } catch (error) {
        console.error('Error creating team chart:', error);
    }
}

/**
 * Enhanced Skills Bar Chart
 */
function initEnhancedSkillsChart(data) {
    const ctx = document.getElementById('skillsChart');
    if (!ctx || !data.skills) return;
    
    try {
        // Destroy existing chart if it exists
        if (window.dashboardCharts.skills) {
            window.dashboardCharts.skills.destroy();
        }
        
        const sortedSkills = Object.entries(data.skills)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const labels = sortedSkills.map(([skill]) => skill);
        const values = sortedSkills.map(([,count]) => count);
        
        window.dashboardCharts.skills = new Chart(ctx, {
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
                        cornerRadius: 8,
                        titleFont: {
                            size: 11
                        },
                        bodyFont: {
                            size: 10
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 9
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 9
                            }
                        }
                    }
                },
                animation: {
                    delay: (context) => context.dataIndex * 100
                }
            }
        });
    } catch (error) {
        console.error('Error creating skills chart:', error);
    }
}

/**
 * Enhanced Location Chart with employee names on hover
 */
function initEnhancedLocationChart(data) {
    const ctx = document.getElementById('locationChart');
    if (!ctx || !data.location) return;
    
    try {
        // Destroy existing chart if it exists
        if (window.dashboardCharts.location) {
            window.dashboardCharts.location.destroy();
        }
        
        const labels = Object.keys(data.location);
        const values = Object.values(data.location);
        
        window.dashboardCharts.location = new Chart(ctx, {
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
                            padding: 12,
                            usePointStyle: true,
                            font: {
                                size: 9,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 12,
                        titleFont: {
                            size: 11,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 10
                        },
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                            afterLabel: function(context) {
                                const location = context.label;
                                const employees = window.employeesByLocation[location] || [];
                                if (employees.length > 0) {
                                    const names = employees.slice(0, 5).map(emp => emp.full_name || emp.name || 'Unknown');
                                    const result = ['Employees:'];
                                    names.forEach(name => result.push(`• ${name}`));
                                    if (employees.length > 5) {
                                        result.push(`• and ${employees.length - 5} more...`);
                                    }
                                    return result;
                                }
                                return '';
                            }
                        }
                    }
                },
                cutout: '50%'
            }
        });
    } catch (error) {
        console.error('Error creating location chart:', error);
    }
}

/**
 * Export chart as image
 */
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

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Chart.js to be fully loaded
    setTimeout(function() {
        if (typeof Chart !== 'undefined' && window.analyticsData) {
            initializeDashboardCharts(window.analyticsData);
        } else {
            console.warn('Chart.js or analytics data not available');
        }
    }, 100);
});

// Make functions globally available
window.initializeDashboardCharts = initializeDashboardCharts;
window.exportChart = exportChart;