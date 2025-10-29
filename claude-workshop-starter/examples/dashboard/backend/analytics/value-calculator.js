// Financial Value Calculator
// Calculates ROI, payback periods, and expansion potential

class ValueCalculator {
    constructor(db) {
        this.db = db;

        // Industry-specific expansion multipliers
        this.expansionMultipliers = {
            'Technology': 2.5,         // Tech companies tend to expand aggressively
            'Financial Services': 2.0,  // Regulated but stable expansion
            'Healthcare': 1.8,          // Slower but steady expansion
            'Manufacturing': 2.2,       // Scale-driven expansion
            'Retail': 1.5,              // Competitive, lower margins
            'Education': 1.3,           // Budget-constrained
            'Other': 1.5
        };
    }

    /**
     * Calculate ROI for a pilot
     * @param {Object} pilot - Pilot data
     * @param {number} pilotCost - Cost to run the pilot
     * @returns {Object} ROI analysis
     */
    calculateROI(pilot, pilotCost = 50000) {
        const projectedRevenue = pilot.arr_projection || 0;
        const conversionProbability = (pilot.conversion_probability || 50) / 100;
        const expectedRevenue = projectedRevenue * conversionProbability;

        // Calculate first year ROI (assuming typical SaaS metrics)
        const firstYearRevenue = expectedRevenue;
        const grossMargin = 0.8; // Typical SaaS gross margin
        const firstYearProfit = firstYearRevenue * grossMargin;

        const roi = ((firstYearProfit - pilotCost) / pilotCost) * 100;

        // Calculate 3-year LTV
        const churnRate = 0.08; // 8% annual churn (typical enterprise)
        const year2Revenue = firstYearRevenue * (1 - churnRate) * 1.15; // 15% expansion
        const year3Revenue = year2Revenue * (1 - churnRate) * 1.15;
        const threeYearLTV = (firstYearRevenue + year2Revenue + year3Revenue) * grossMargin;

        return {
            pilotCost: pilotCost,
            projectedARR: projectedRevenue,
            conversionProbability: pilot.conversion_probability,
            expectedRevenue: Math.round(expectedRevenue),
            firstYearProfit: Math.round(firstYearProfit),
            roi: Math.round(roi * 10) / 10,
            roiCategory: this.categorizROI(roi),
            threeYearLTV: Math.round(threeYearLTV),
            ltvToCAC: Math.round((threeYearLTV / pilotCost) * 10) / 10,
            breakEvenMonths: this.calculateBreakEvenMonths(pilotCost, firstYearRevenue * grossMargin)
        };
    }

    /**
     * Project annual value over time
     * @param {Object} pilot - Pilot data
     * @param {number} years - Number of years to project
     * @returns {Array} Year-by-year projections
     */
    projectAnnualValue(pilot, years = 5) {
        const baseARR = pilot.arr_projection || 0;
        const conversionProb = (pilot.conversion_probability || 50) / 100;
        const expansionRate = this.getExpansionRate(pilot.industry);
        const churnRate = this.getChurnRate(pilot.industry);

        const projections = [];
        let currentARR = baseARR * conversionProb;

        for (let year = 1; year <= years; year++) {
            // Apply expansion and churn
            if (year > 1) {
                currentARR = currentARR * (1 - churnRate) * (1 + expansionRate);
            }

            projections.push({
                year: year,
                arr: Math.round(currentARR),
                cumulativeRevenue: year === 1
                    ? Math.round(currentARR)
                    : Math.round(projections[year - 2].cumulativeRevenue + currentARR),
                churnAdjustedRetention: Math.round(Math.pow(1 - churnRate, year - 1) * 100)
            });
        }

        return projections;
    }

    /**
     * Calculate payback period
     * @param {Object} pilot - Pilot data
     * @param {number} pilotCost - Cost to run the pilot
     * @returns {Object} Payback analysis
     */
    calculatePaybackPeriod(pilot, pilotCost = 50000) {
        const monthlyRevenue = (pilot.arr_projection || 0) / 12;
        const grossMargin = 0.8;
        const monthlyProfit = monthlyRevenue * grossMargin;

        if (monthlyProfit <= 0) {
            return {
                paybackMonths: null,
                paybackYears: null,
                message: 'Unable to calculate payback - no projected profit'
            };
        }

        const paybackMonths = Math.ceil(pilotCost / monthlyProfit);

        return {
            paybackMonths: paybackMonths,
            paybackYears: Math.round((paybackMonths / 12) * 10) / 10,
            monthlyProfit: Math.round(monthlyProfit),
            paybackCategory: this.categorizePayback(paybackMonths),
            message: this.getPaybackMessage(paybackMonths)
        };
    }

    /**
     * Estimate expansion potential
     * @param {Object} pilot - Pilot data
     * @param {Object} company - Company data (optional)
     * @returns {Object} Expansion analysis
     */
    async estimateExpansionPotential(pilot) {
        const baseARR = pilot.arr_projection || 0;
        const industry = pilot.industry || 'Other';
        const expansionMultiplier = this.expansionMultipliers[industry];

        // Estimate based on company size and industry
        const estimatedExpansion = baseARR * (expansionMultiplier - 1);

        // Year-over-year expansion projection
        const year1 = baseARR;
        const year2 = Math.round(baseARR * 1.15); // 15% expansion year 1
        const year3 = Math.round(year2 * 1.20);   // 20% expansion year 2
        const year4 = Math.round(year3 * 1.15);   // Return to 15%
        const year5 = Math.round(year4 * 1.10);   // Mature at 10%

        return {
            initialARR: baseARR,
            industry: industry,
            expansionMultiplier: expansionMultiplier,
            estimatedTotalValue: Math.round(baseARR * expansionMultiplier),
            estimatedExpansion: Math.round(estimatedExpansion),
            fiveYearProjection: {
                year1: year1,
                year2: year2,
                year3: year3,
                year4: year4,
                year5: year5,
                total: year1 + year2 + year3 + year4 + year5
            },
            expansionDrivers: this.getExpansionDrivers(industry),
            recommendation: this.getExpansionRecommendation(expansionMultiplier)
        };
    }

    /**
     * Calculate customer lifetime value
     */
    calculateCustomerLifetimeValue(pilot, avgCustomerLifeYears = 5) {
        const annualRevenue = pilot.arr_projection || 0;
        const grossMargin = 0.8;
        const churnRate = this.getChurnRate(pilot.industry);
        const retentionRate = 1 - churnRate;

        // CLV = (Annual Revenue * Gross Margin) * (Retention Rate / Churn Rate)
        const clv = (annualRevenue * grossMargin) * (retentionRate / churnRate);

        return {
            lifetimeValue: Math.round(clv),
            avgLifeYears: avgCustomerLifeYears,
            annualRevenue: annualRevenue,
            grossMargin: grossMargin * 100,
            churnRate: churnRate * 100,
            retentionRate: retentionRate * 100
        };
    }

    // Helper methods
    categorizROI(roi) {
        if (roi >= 200) return 'Excellent';
        if (roi >= 100) return 'Strong';
        if (roi >= 50) return 'Good';
        if (roi >= 0) return 'Moderate';
        return 'Poor';
    }

    categorizePayback(months) {
        if (months <= 6) return 'Excellent';
        if (months <= 12) return 'Good';
        if (months <= 18) return 'Fair';
        return 'Concerning';
    }

    getPaybackMessage(months) {
        if (months <= 6) return 'Outstanding payback period - strong investment';
        if (months <= 12) return 'Solid payback period - good investment';
        if (months <= 18) return 'Acceptable payback period - monitor closely';
        return 'Long payback period - evaluate strategic value';
    }

    calculateBreakEvenMonths(cost, annualProfit) {
        if (annualProfit <= 0) return null;
        return Math.ceil((cost / annualProfit) * 12);
    }

    getExpansionRate(industry) {
        const rates = {
            'Technology': 0.25,        // 25% annual expansion
            'Financial Services': 0.20,
            'Healthcare': 0.15,
            'Manufacturing': 0.18,
            'Retail': 0.12,
            'Education': 0.10,
            'Other': 0.15
        };
        return rates[industry] || rates['Other'];
    }

    getChurnRate(industry) {
        const rates = {
            'Technology': 0.08,        // 8% annual churn
            'Financial Services': 0.05, // More sticky
            'Healthcare': 0.06,
            'Manufacturing': 0.07,
            'Retail': 0.12,            // Higher churn
            'Education': 0.10,
            'Other': 0.08
        };
        return rates[industry] || rates['Other'];
    }

    getExpansionDrivers(industry) {
        const drivers = {
            'Technology': ['Rapid user growth', 'Feature expansion', 'Multi-product adoption'],
            'Financial Services': ['Regulatory compliance value', 'Risk reduction', 'Process automation'],
            'Healthcare': ['Patient volume growth', 'Additional departments', 'Compliance requirements'],
            'Manufacturing': ['Production scaling', 'Additional facilities', 'Supply chain integration'],
            'Retail': ['Store expansion', 'Seasonal growth', 'Omnichannel integration'],
            'Education': ['Student enrollment growth', 'Additional programs', 'District-wide adoption'],
            'Other': ['User growth', 'Feature adoption', 'Process expansion']
        };
        return drivers[industry] || drivers['Other'];
    }

    getExpansionRecommendation(multiplier) {
        if (multiplier >= 2.3) {
            return 'High expansion potential - prioritize customer success and upsell strategies';
        } else if (multiplier >= 1.8) {
            return 'Moderate expansion potential - focus on feature adoption and value demonstration';
        } else {
            return 'Standard expansion potential - maintain strong relationship and service delivery';
        }
    }
}

module.exports = ValueCalculator;
