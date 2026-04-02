document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const ctx = document.getElementById('expenseChart').getContext('2d');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let chart;

    const categoryColors = {
        'Dog Toys': '#fbbf24',
        'Specialty Coffee': '#c084fc',
        'Concert Tickets': '#f43f5e',
        'Dining Out': '#10b981',
        'Travel': '#38bdf8',
        'Hobbies': '#f472b6',
        'Subscriptions': '#a78bfa',
        'Miscellaneous': '#94a3b8'
    };

    // Initialize Chart
    function initChart() {
        const data = getChartData();
        chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    hoverOffset: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: { family: 'Inter', size: 12 },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` $${context.raw.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }

    function getChartData() {
        const totals = {};
        expenses.forEach(exp => {
            totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount);
        });

        const labels = Object.keys(totals);
        const values = Object.values(totals);
        const colors = labels.map(label => categoryColors[label] || '#94a3b8');

        return { labels, values, colors };
    }

    function updateChart() {
        const newData = getChartData();
        chart.data.labels = newData.labels;
        chart.data.datasets[0].data = newData.values;
        chart.data.datasets[0].backgroundColor = newData.colors;
        chart.update();
    }

    // Render Ledger
    function renderExpenses() {
        expenseList.innerHTML = '';
        // Show last 5 expenses
        expenses.slice(-5).reverse().forEach((exp, index) => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <div class="expense-info">
                    <span class="expense-category" style="background: ${categoryColors[exp.category]}22; color: ${categoryColors[exp.category]}">
                        ${exp.category}
                    </span>
                    <span class="expense-note">${exp.note || 'No description'}</span>
                </div>
                <div class="expense-amount">-$${parseFloat(exp.amount).toFixed(2)}</div>
            `;
            expenseList.appendChild(li);
        });
    }

    // Handle Form Submit
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newExpense = {
            id: Date.now(),
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            note: document.getElementById('note').value,
            date: new Date().toISOString()
        };

        expenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        expenseForm.reset();
        renderExpenses();
        updateChart();
    });

    // Initial Load
    initChart();
    renderExpenses();
});
