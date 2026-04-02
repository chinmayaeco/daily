class SimulationEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            round: 1,
            maxRounds: 10,
            cash: 1000000,
            inventory: 0,
            marketShare: 12.5,
            fixedCost: 150000,
            variableCost: 200,
            baseDemand: 2500,
            demandElasticity: 1.5,
            adEffectiveness: 5.0,
            history: [],
            competitorPrice: 550,
            competitorAd: 20000,
            currentShock: null
        };
        this.shocks = [
            { name: "Economic Boom", demandMod: 1.4, desc: "Consumer confidence is at an all-time high! Demand surges." },
            { name: "Global Recession", demandMod: 0.6, desc: "Market downturn! Consumers are tightening their belts." },
            { name: "Supply Chain Crisis", costMod: 1.5, desc: "Raw material prices have spiked! Variable costs increased." },
            { name: "Marketing Viral Trend", adMod: 2.0, desc: "Social media trend favors your industry! Marketing is 2x effective." }
        ];
    }

    runRound(decisions) {
        const { price, quantity, adSpend, investment } = decisions;
        
        // 1. Process Shocks
        this.state.currentShock = Math.random() < 0.25 ? this.shocks[Math.floor(Math.random() * this.shocks.length)] : null;
        let demandMod = this.state.currentShock?.demandMod || 1.0;
        let costMod = this.state.currentShock?.costMod || 1.0;
        let adMod = this.state.currentShock?.adMod || 1.0;

        // 2. Resource Adjustments
        // Investment increases production capacity or efficiency (simulated by reducing variable cost slightly)
        this.state.variableCost = Math.max(120, this.state.variableCost * (1 - (investment / 1000000)));
        this.state.cash -= investment;
        this.state.cash -= adSpend;

        // 3. Compute Demand (Qd)
        // Qd = a - bP + c*sqrt(A) - d*CompetitorEffect
        const priceEffect = this.state.demandElasticity * price;
        const adEffect = this.state.adEffectiveness * adMod * Math.sqrt(adSpend);
        const compEffect = (price - this.state.competitorPrice) * 0.5;
        
        let qd = (this.state.baseDemand * demandMod) - priceEffect + adEffect - compEffect;
        qd = Math.max(0, Math.floor(qd));

        // 4. Compute Supply (Qs)
        // User supplies 'quantity', plus existing inventory
        const totalAvailable = quantity + this.state.inventory;
        const actualSales = Math.min(qd, totalAvailable);
        
        // 5. Financials
        const revenue = actualSales * price;
        const prodCost = quantity * (this.state.variableCost * costMod) + this.state.fixedCost;
        const inventoryCost = (totalAvailable - actualSales) * 20; // $20 per unit storage
        const netProfit = revenue - prodCost - inventoryCost;
        
        this.state.cash += revenue;
        this.state.cash -= prodCost;
        this.state.cash -= inventoryCost;
        this.state.inventory = totalAvailable - actualSales;

        // 6. Market Share (Simplified)
        const marketTotal = qd + (this.state.baseDemand * 2); // Total market size estimate
        this.state.marketShare = (actualSales / marketTotal) * 100;

        // 7. Update Competitor for next round
        this.state.competitorPrice = Math.floor(price * (0.9 + Math.random() * 0.2));
        this.state.competitorAd = Math.floor(adSpend * (0.8 + Math.random() * 0.4));

        // 8. Record History
        const roundResult = {
            round: this.state.round,
            price,
            quantity,
            sales: actualSales,
            demand: qd,
            revenue,
            profit: netProfit,
            inventory: this.state.inventory,
            cash: this.state.cash,
            shock: this.state.currentShock
        };
        this.state.history.push(roundResult);
        
        this.state.round++;
        return roundResult;
    }

    calculateFinalScore() {
        if (this.state.history.length === 0) return { grade: 'F', details: [] };

        const totalProfit = this.state.history.reduce((sum, r) => sum + r.profit, 0);
        const finalCash = this.state.cash;
        const avgShare = this.state.marketShare;
        const avgInventory = this.state.history.reduce((sum, r) => sum + r.inventory, 0) / this.state.history.length;
        
        let score = 0;
        
        // Profitability (30%)
        const profitScore = Math.min(30, (totalProfit / 1000000) * 30);
        score += Math.max(0, profitScore);

        // Market Share (20%)
        const shareScore = Math.min(20, (avgShare / 20) * 20);
        score += shareScore;

        // Efficiency (15%) - Low waste/inventory
        const efficiencyScore = Math.max(0, 15 - (avgInventory / 100));
        score += efficiencyScore;

        // Stability & Cash (35%)
        const cashScore = Math.min(35, (finalCash / 2000000) * 35);
        score += Math.max(0, cashScore);

        let grade = 'F';
        if (score >= 85) grade = 'A';
        else if (score >= 70) grade = 'B';
        else if (score >= 55) grade = 'C';
        else if (score >= 40) grade = 'D';

        return {
            grade,
            score: Math.floor(score),
            details: [
                { label: "Cumulative Profit", value: `$${totalProfit.toLocaleString()}` },
                { label: "Closing Cash", value: `$${finalCash.toLocaleString()}` },
                { label: "Avg Market Share", value: `${avgShare.toFixed(1)}%` },
                { label: "Inventory Efficiency", value: `${Math.floor((1 - (avgInventory/1000)) * 100)}%` }
            ]
        };
    }
}

// Export for UI
window.SimulationEngine = SimulationEngine;
