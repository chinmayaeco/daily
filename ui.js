document.addEventListener('DOMContentLoaded', () => {
    const engine = new SimulationEngine();
    const ctx = document.getElementById('profitChart').getContext('2d');
    let profitChart;

    // UI Elements
    const form = document.getElementById('decision-form');
    const logs = document.getElementById('feedback-log');
    const modal = document.getElementById('score-modal');
    
    // Inputs & Badges
    const inputs = {
        price: document.getElementById('price'),
        quantity: document.getElementById('quantity'),
        ad: document.getElementById('ad-spend'),
        inv: document.getElementById('investment')
    };

    const badges = {
        price: document.getElementById('price-val'),
        quantity: document.getElementById('quantity-val'),
        ad: document.getElementById('ad-val'),
        inv: document.getElementById('inv-val')
    };

    // Stats
    const stats = {
        cash: document.getElementById('stat-cash'),
        share: document.getElementById('stat-share'),
        round: document.getElementById('current-round'),
        revenue: document.getElementById('res-revenue'),
        profit: document.getElementById('res-profit'),
        satisfaction: document.getElementById('res-satisfaction'),
        inventoryBar: document.getElementById('inventory-bar')
    };

    // Update Input Badges
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', () => {
            let val = inputs[key].value;
            if (key === 'price' || key === 'ad' || key === 'inv') {
                badges[key].textContent = `$${parseInt(val).toLocaleString()}`;
            } else {
                badges[key].textContent = `${parseInt(val).toLocaleString()} units`;
            }
        });
    });

    function initChart() {
        profitChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Net Profit',
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    data: [],
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function addLog(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = `Round ${engine.state.round}: ${msg}`;
        logs.prepend(div);
    }

    function updateDashboard(res) {
        stats.cash.textContent = `$${engine.state.cash.toLocaleString()}`;
        stats.share.textContent = `${engine.state.marketShare.toFixed(1)}%`;
        stats.round.textContent = engine.state.round;
        
        stats.revenue.textContent = `$${res.revenue.toLocaleString()}`;
        stats.profit.textContent = `$${res.profit.toLocaleString()}`;
        stats.profit.className = res.profit >= 0 ? 'success' : 'danger';
        
        // Inventory Health
        const invPercent = Math.max(0, 100 - (res.inventory / 50));
        stats.inventoryBar.style.width = `${invPercent}%`;
        stats.inventoryBar.style.background = invPercent < 30 ? '#ef4444' : '#10b981';

        // Update Chart
        profitChart.data.labels.push(`R${res.round}`);
        profitChart.data.datasets[0].data.push(res.profit);
        profitChart.update();

        // Feedback
        if (res.shock) {
            addLog(`⚠️ ${res.shock.name}: ${res.shock.desc}`, 'shock');
        }
        if (res.demand > res.quantity + engine.state.inventory) {
            addLog(`⚠️ Stockout! You missed sales of ${res.demand - res.sales} units.`, 'shock');
        } else if (res.inventory > 500) {
            addLog(`⚠️ Excess Supply! Heavy inventory costs incurred.`, 'shock');
        } else {
            addLog(`✅ Round execution successful. Profit: $${res.profit.toLocaleString()}`, 'success');
        }
    }

    function showFinalScore() {
        const score = engine.calculateFinalScore();
        document.getElementById('final-grade').textContent = score.grade;
        
        const details = document.getElementById('score-details');
        details.innerHTML = '';
        score.details.forEach(d => {
            const p = document.createElement('p');
            p.innerHTML = `<strong>${d.label}:</strong> ${d.value}`;
            details.appendChild(p);
        });

        modal.classList.remove('hidden');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const decisions = {
            price: parseInt(inputs.price.value),
            quantity: parseInt(inputs.quantity.value),
            adSpend: parseInt(inputs.ad.value),
            investment: parseInt(inputs.inv.value)
        };

        const result = engine.runRound(decisions);
        updateDashboard(result);

        if (engine.state.round > 10) {
            showFinalScore();
        }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        location.reload();
    });

    // Initialize
    initChart();
});
