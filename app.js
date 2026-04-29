document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('bda_data.json');
        const data = await response.json();
        
        initDashboard(data);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
});

function initDashboard(data) {
    // 1. Calculate KPIs
    const totalStudents = data.length;
    const avgScore = data.reduce((acc, curr) => acc + curr.total_marks, 0) / totalStudents;
    const topStudent = [...data].sort((a, b) => b.total_marks - a.total_marks)[0];
    const sessionNames = Object.keys(data[0].sessions);
    const activeSessions = sessionNames.length;

    // Update UI
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('avgEngagement').textContent = (avgScore * 100).toFixed(1) + '%';
    document.getElementById('topScorer').textContent = topStudent.name;
    document.getElementById('activeSessions').textContent = activeSessions;

    // 2. Render Table
    renderTable(data);

    // 3. Search Logic
    document.getElementById('studentSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = data.filter(s => s.name.toLowerCase().includes(searchTerm));
        renderTable(filtered);
    });

    // 4. Trends Chart (Avg Participation per session)
    const sessionAvgs = sessionNames.map(s => {
        const total = data.reduce((acc, curr) => acc + curr.sessions[s], 0);
        return (total / totalStudents).toFixed(2);
    });

    const ctxTrends = document.getElementById('trendsChart').getContext('2d');
    new Chart(ctxTrends, {
        type: 'line',
        data: {
            labels: sessionNames.map(s => s.replace('(Class Participation)', '')),
            datasets: [{
                label: 'Avg Participation',
                data: sessionAvgs,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // 5. Distribution Chart (Donut)
    const high = data.filter(s => s.total_marks > 0.4).length;
    const mid = data.filter(s => s.total_marks <= 0.4 && s.total_marks > 0.2).length;
    const low = data.filter(s => s.total_marks <= 0.2).length;

    const ctxDist = document.getElementById('distChart').getContext('2d');
    new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Mid', 'Low'],
            datasets: [{
                data: [high, mid, low],
                backgroundColor: ['#4ade80', '#facc15', '#f87171'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 20 }
                }
            },
            cutout: '70%'
        }
    });
}

function renderTable(students) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    students.forEach(s => {
        const activeCount = Object.values(s.sessions).filter(v => v > 0).length;
        const levelClass = s.total_marks > 0.4 ? 'badge-high' : (s.total_marks > 0.2 ? 'badge-mid' : 'badge-low');
        const levelText = s.total_marks > 0.4 ? 'High' : (s.total_marks > 0.2 ? 'Moderate' : 'Needs Focus');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.name}</td>
            <td style="font-weight: 600;">${(s.total_marks * 100).toFixed(1)}%</td>
            <td>${activeCount} Sessions</td>
            <td><span class="badge ${levelClass}">${levelText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
