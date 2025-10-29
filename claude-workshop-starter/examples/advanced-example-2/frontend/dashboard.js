/**
 * Enterprise B2B Pilot Program Manager - Dashboard
 * Frontend Application Logic
 */

class PilotDashboard {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.pilots = [];
        this.filteredPilots = [];
        this.currentEditId = null;

        // Sample data for demo purposes (will be replaced by API data)
        this.samplePilots = [
            {
                id: 1,
                companyName: 'TechCorp Industries',
                startDate: '2024-10-01',
                endDate: '2024-12-31',
                contractValue: 150000,
                status: 'on_track',
                healthScore: 85,
                primaryContact: {
                    name: 'Sarah Chen',
                    email: 'sarah.chen@techcorp.com',
                    role: 'VP of Engineering'
                },
                successCriteria: [
                    { text: '90% user adoption across engineering team', completed: true },
                    { text: 'Process 10,000+ transactions', completed: true },
                    { text: 'Achieve 99.9% uptime', completed: false },
                    { text: 'Integrate with existing SSO', completed: false }
                ],
                conversionProbability: 75,
                notes: 'Strong engagement from technical team. Need to address scaling concerns.'
            },
            {
                id: 2,
                companyName: 'Global Finance Solutions',
                startDate: '2024-09-15',
                endDate: '2024-12-15',
                contractValue: 250000,
                status: 'at_risk',
                healthScore: 45,
                primaryContact: {
                    name: 'Michael Rodriguez',
                    email: 'mrodriguez@globalfinance.com',
                    role: 'Chief Technology Officer'
                },
                successCriteria: [
                    { text: 'Complete security audit', completed: true },
                    { text: 'Train 50+ users', completed: false },
                    { text: 'Migrate 100k records', completed: false },
                    { text: 'Achieve SOC 2 compliance', completed: false }
                ],
                conversionProbability: 35,
                notes: 'Facing delays in security review. Champion left company last week.'
            },
            {
                id: 3,
                companyName: 'CloudScale Dynamics',
                startDate: '2024-11-01',
                endDate: '2025-01-31',
                contractValue: 180000,
                status: 'active',
                healthScore: 92,
                primaryContact: {
                    name: 'Emily Thompson',
                    email: 'emily.t@cloudscale.io',
                    role: 'Director of Operations'
                },
                successCriteria: [
                    { text: 'Onboard 3 departments', completed: true },
                    { text: 'Automate key workflows', completed: true },
                    { text: 'Reduce manual processing by 60%', completed: true },
                    { text: 'Generate ROI report', completed: false }
                ],
                conversionProbability: 90,
                notes: 'Exceptional progress. Already seeing measurable ROI. Early expansion discussions.'
            },
            {
                id: 4,
                companyName: 'DataStream Analytics',
                startDate: '2024-08-01',
                endDate: '2024-10-31',
                contractValue: 120000,
                status: 'completed',
                healthScore: 88,
                primaryContact: {
                    name: 'James Park',
                    email: 'j.park@datastream.com',
                    role: 'VP of Product'
                },
                successCriteria: [
                    { text: 'Process 1M data points', completed: true },
                    { text: 'Achieve <100ms latency', completed: true },
                    { text: 'Complete integration', completed: true },
                    { text: 'User satisfaction >4.5/5', completed: true }
                ],
                conversionProbability: 95,
                notes: 'Pilot completed successfully. Contract negotiation in progress.'
            },
            {
                id: 5,
                companyName: 'InnovateLabs',
                startDate: '2024-10-15',
                endDate: '2025-01-15',
                contractValue: 95000,
                status: 'active',
                healthScore: 72,
                primaryContact: {
                    name: 'Lisa Martinez',
                    email: 'lisa.m@innovatelabs.com',
                    role: 'Engineering Manager'
                },
                successCriteria: [
                    { text: 'Deploy to production', completed: true },
                    { text: 'Train development team', completed: false },
                    { text: 'Document API usage', completed: false },
                    { text: 'Performance benchmarking', completed: false }
                ],
                conversionProbability: 60,
                notes: 'Good technical fit. Budget concerns raised by finance team.'
            }
        ];

        this.init();
    }

    async init() {
        console.log('Initializing dashboard...');
        this.showLoading();

        // Try to fetch from API, fall back to sample data
        await this.loadPilots();

        this.renderDashboard();
        this.hideLoading();
    }

    async loadPilots() {
        try {
            const response = await fetch(`${this.apiUrl}/pilots`);
            if (response.ok) {
                const result = await response.json();
                // Backend returns {success, count, data}
                this.pilots = result.data || result;

                // Convert backend snake_case to frontend camelCase
                this.pilots = this.pilots.map(pilot => this.convertPilotFromAPI(pilot));

                console.log('Loaded pilots from API:', this.pilots.length);
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.log('Using sample data (API not available):', error.message);
            this.pilots = this.samplePilots;
        }

        this.filteredPilots = [...this.pilots];
    }

    // Convert backend format to frontend format
    convertPilotFromAPI(pilot) {
        return {
            id: pilot.id,
            companyName: pilot.company_name,
            startDate: pilot.start_date,
            endDate: pilot.end_date,
            contractValue: pilot.contract_value,
            status: pilot.status.toLowerCase().replace(' ', '_'),
            healthScore: pilot.health_score,
            primaryContact: {
                name: pilot.primary_contact ? pilot.primary_contact.split(' - ')[0] : 'Unknown',
                email: pilot.primary_contact ? pilot.primary_contact.split(' - ')[1] || '' : '',
                role: pilot.primary_contact ? pilot.primary_contact.split(' - ')[1] || '' : ''
            },
            successCriteria: pilot.success_criteria || [],
            conversionProbability: pilot.conversion_probability,
            notes: pilot.notes || '',
            // Additional fields from backend
            arrProjection: pilot.arr_projection,
            daysRemaining: pilot.daysRemaining,
            progress: pilot.progress,
            riskLevel: pilot.riskLevel
        };
    }

    // Convert frontend format to backend format
    convertPilotToAPI(pilot) {
        return {
            company_name: pilot.companyName,
            industry: pilot.industry || 'Technology',
            start_date: pilot.startDate,
            end_date: pilot.endDate,
            status: pilot.status,
            contract_value: pilot.contractValue,
            arr_projection: pilot.arrProjection || pilot.contractValue * 2,
            conversion_probability: pilot.conversionProbability || 50,
            primary_contact: `${pilot.primaryContact.name} - ${pilot.primaryContact.role}`,
            notes: pilot.notes || ''
        };
    }

    renderDashboard() {
        this.renderMetrics();
        this.renderPilotCards();
        this.renderRiskAlerts();
    }

    renderMetrics() {
        const activePilots = this.pilots.filter(p =>
            p.status === 'active' || p.status === 'on_track' || p.status === 'at_risk'
        );

        const completedPilots = this.pilots.filter(p =>
            p.status === 'completed' || p.status === 'converted'
        );

        const avgHealth = activePilots.length > 0
            ? Math.round(activePilots.reduce((sum, p) => sum + p.healthScore, 0) / activePilots.length)
            : 0;

        const totalARR = this.pilots.reduce((sum, p) => sum + p.contractValue, 0);

        const conversionRate = this.pilots.length > 0
            ? Math.round((completedPilots.length / this.pilots.length) * 100)
            : 0;

        // Update metrics
        document.getElementById('metric-active').textContent = activePilots.length;
        document.getElementById('metric-active-change').textContent =
            `+${Math.floor(Math.random() * 3 + 1)} this month`;

        document.getElementById('metric-health').textContent = avgHealth;
        document.getElementById('metric-health-change').textContent =
            `+${Math.floor(Math.random() * 5 + 1)} points`;

        document.getElementById('metric-arr').textContent = this.formatCurrency(totalARR);
        document.getElementById('metric-arr-change').textContent =
            `${conversionRate}% conversion rate`;

        document.getElementById('metric-conversion').textContent = `${conversionRate}%`;
        document.getElementById('metric-conversion-change').textContent =
            `${completedPilots.length} converted`;
    }

    renderPilotCards() {
        const grid = document.getElementById('pilots-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.filteredPilots.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = this.filteredPilots.map(pilot => this.renderPilotCard(pilot)).join('');
    }

    renderPilotCard(pilot) {
        const daysElapsed = this.getDaysElapsed(pilot.startDate);
        const totalDays = this.getTotalDays(pilot.startDate, pilot.endDate);
        const progress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
        const daysRemaining = totalDays - daysElapsed;

        const healthClass = this.getHealthClass(pilot.healthScore);
        const progressClass = this.getProgressClass(progress, pilot.status);

        const completedCriteria = pilot.successCriteria.filter(c => c.completed).length;
        const totalCriteria = pilot.successCriteria.length;

        return `
            <div class="pilot-card" onclick="dashboard.viewPilotDetails(${pilot.id})">
                <div class="pilot-card-header">
                    <div class="pilot-card-title-row">
                        <h3 class="pilot-card-company">${pilot.companyName}</h3>
                        <div class="pilot-card-actions" onclick="event.stopPropagation()">
                            <button class="pilot-card-icon-btn edit" onclick="dashboard.editPilot(${pilot.id})" title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="pilot-card-icon-btn delete" onclick="dashboard.deletePilot(${pilot.id})" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="pilot-card-meta">
                        <span>${this.formatDate(pilot.startDate)} - ${this.formatDate(pilot.endDate)}</span>
                    </div>
                </div>

                <div class="pilot-card-body">
                    <div class="pilot-info-row">
                        <div class="status-badge ${pilot.status}">
                            <span class="status-badge-dot"></span>
                            ${this.formatStatus(pilot.status)}
                        </div>
                        <div class="health-score">
                            <span class="health-score-label">Health</span>
                            <span class="health-score-value ${healthClass}">${pilot.healthScore}</span>
                        </div>
                    </div>

                    <div class="timeline-section">
                        <div class="timeline-label">
                            <span>Timeline Progress</span>
                            <span>${daysRemaining} days remaining</span>
                        </div>
                        <div class="timeline-progress-bar">
                            <div class="timeline-progress-fill ${progressClass}" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <div class="contract-value">
                        <div>
                            <div class="contract-value-label">Contract Value</div>
                            <div class="contract-value-amount">${this.formatCurrency(pilot.contractValue)}</div>
                            <div class="conversion-probability">${pilot.conversionProbability}% conversion probability</div>
                        </div>
                    </div>

                    <div class="success-criteria">
                        <div class="success-criteria-header">
                            Success Criteria (${completedCriteria}/${totalCriteria})
                        </div>
                        <div class="success-criteria-list">
                            ${pilot.successCriteria.slice(0, 3).map(criterion => `
                                <div class="success-criterion">
                                    <div class="success-criterion-checkbox ${criterion.completed ? 'checked' : ''}">
                                        ${criterion.completed ? `
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        ` : ''}
                                    </div>
                                    <span>${criterion.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="stakeholders-section">
                        <div class="stakeholders-header">Primary Contact</div>
                        <div class="stakeholder">
                            <div class="stakeholder-icon">${pilot.primaryContact.name.charAt(0)}</div>
                            <div class="stakeholder-info">
                                <div class="stakeholder-name">${pilot.primaryContact.name}</div>
                                <div class="stakeholder-role">${pilot.primaryContact.role}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRiskAlerts() {
        const atRiskPilots = this.pilots.filter(p =>
            p.status === 'at_risk' || p.healthScore < 60
        );

        const alertsContainer = document.getElementById('risk-alerts');

        if (atRiskPilots.length === 0) {
            alertsContainer.innerHTML = '<p style="color: var(--gray-500); font-size: 0.875rem;">No at-risk pilots</p>';
            return;
        }

        alertsContainer.innerHTML = atRiskPilots.map(pilot => {
            const reason = pilot.status === 'at_risk'
                ? 'Marked as at risk'
                : 'Low health score';

            return `
                <div class="risk-alert" onclick="dashboard.viewPilotDetails(${pilot.id})">
                    <div class="risk-alert-company">${pilot.companyName}</div>
                    <div class="risk-alert-reason">${reason} - Health: ${pilot.healthScore}</div>
                </div>
            `;
        }).join('');
    }

    viewPilotDetails(id) {
        const pilot = this.pilots.find(p => p.id === id);
        if (!pilot) return;

        const modal = document.getElementById('detail-modal');
        document.getElementById('detail-company-name').textContent = pilot.companyName;

        const daysElapsed = this.getDaysElapsed(pilot.startDate);
        const totalDays = this.getTotalDays(pilot.startDate, pilot.endDate);
        const progress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

        const detailContent = document.getElementById('detail-content');
        detailContent.innerHTML = `
            <div class="detail-grid">
                <div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">Overview</h3>
                        <div class="detail-info-grid">
                            <div class="detail-info-item">
                                <div class="detail-info-label">Status</div>
                                <div class="detail-info-value">
                                    <div class="status-badge ${pilot.status}">
                                        <span class="status-badge-dot"></span>
                                        ${this.formatStatus(pilot.status)}
                                    </div>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-label">Health Score</div>
                                <div class="detail-info-value">
                                    <span class="health-score-value ${this.getHealthClass(pilot.healthScore)}" style="font-size: 1.5rem;">
                                        ${pilot.healthScore}
                                    </span>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-label">Timeline</div>
                                <div class="detail-info-value">
                                    ${this.formatDate(pilot.startDate)} - ${this.formatDate(pilot.endDate)}
                                    <div class="timeline-progress-bar" style="margin-top: 8px;">
                                        <div class="timeline-progress-fill ${this.getProgressClass(progress, pilot.status)}"
                                             style="width: ${progress}%"></div>
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 4px;">
                                        ${progress}% complete - ${totalDays - daysElapsed} days remaining
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section-title">Success Criteria</h3>
                        <div class="success-criteria-list">
                            ${pilot.successCriteria.map(criterion => `
                                <div class="success-criterion">
                                    <div class="success-criterion-checkbox ${criterion.completed ? 'checked' : ''}">
                                        ${criterion.completed ? `
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        ` : ''}
                                    </div>
                                    <span>${criterion.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section-title">Notes</h3>
                        <div class="detail-info-value">${pilot.notes || 'No notes available'}</div>
                    </div>
                </div>

                <div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">Contract Details</h3>
                        <div class="detail-info-grid">
                            <div class="detail-info-item">
                                <div class="detail-info-label">Contract Value</div>
                                <div class="detail-info-value" style="font-size: 1.5rem; font-weight: 700;">
                                    ${this.formatCurrency(pilot.contractValue)}
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-label">Conversion Probability</div>
                                <div class="detail-info-value" style="font-size: 1.25rem; font-weight: 600; color: var(--primary-blue);">
                                    ${pilot.conversionProbability}%
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-label">Expected ARR</div>
                                <div class="detail-info-value">
                                    ${this.formatCurrency(pilot.contractValue * (pilot.conversionProbability / 100))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section-title">Stakeholders</h3>
                        <div class="detail-stakeholder-list">
                            <div class="detail-stakeholder">
                                <div class="detail-stakeholder-name">${pilot.primaryContact.name}</div>
                                <div class="detail-stakeholder-role">${pilot.primaryContact.role}</div>
                                <div class="detail-stakeholder-contact">${pilot.primaryContact.email}</div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section-title">Quick Actions</h3>
                        <div class="quick-actions">
                            <button class="quick-action-btn" onclick="dashboard.editPilot(${pilot.id}); dashboard.closeDetailModal();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit Pilot
                            </button>
                            <button class="quick-action-btn" onclick="alert('Email functionality would open here')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Email Contact
                            </button>
                            <button class="quick-action-btn" onclick="alert('Report generation would start here')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    closeDetailModal() {
        document.getElementById('detail-modal').classList.remove('active');
    }

    openAddPilotModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'New Pilot Program';
        document.getElementById('pilot-form').reset();
        document.getElementById('pilot-id').value = '';

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date').value = today;

        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        document.getElementById('end-date').value = threeMonthsLater.toISOString().split('T')[0];

        document.getElementById('pilot-modal').classList.add('active');
    }

    editPilot(id) {
        const pilot = this.pilots.find(p => p.id === id);
        if (!pilot) return;

        this.currentEditId = id;
        document.getElementById('modal-title').textContent = 'Edit Pilot Program';
        document.getElementById('pilot-id').value = id;

        // Populate form
        document.getElementById('company-name').value = pilot.companyName;
        document.getElementById('start-date').value = pilot.startDate;
        document.getElementById('end-date').value = pilot.endDate;
        document.getElementById('contract-value').value = pilot.contractValue;
        document.getElementById('pilot-status').value = pilot.status;
        document.getElementById('primary-contact').value = pilot.primaryContact.name;
        document.getElementById('contact-email').value = pilot.primaryContact.email || '';
        document.getElementById('contact-role').value = pilot.primaryContact.role || '';

        const criteriaText = pilot.successCriteria.map(c => c.text).join('\n');
        document.getElementById('success-criteria').value = criteriaText;
        document.getElementById('pilot-notes').value = pilot.notes || '';

        document.getElementById('pilot-modal').classList.add('active');
    }

    async deletePilot(id) {
        if (!confirm('Are you sure you want to delete this pilot program?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/pilots/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log('Pilot deleted via API');
            }
        } catch (error) {
            console.log('Deleting from local data');
        }

        // Remove from local array regardless
        this.pilots = this.pilots.filter(p => p.id !== id);
        this.filteredPilots = this.filteredPilots.filter(p => p.id !== id);

        this.renderDashboard();
    }

    async savePilot(event) {
        event.preventDefault();

        const formData = {
            companyName: document.getElementById('company-name').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            contractValue: parseInt(document.getElementById('contract-value').value),
            status: document.getElementById('pilot-status').value,
            primaryContact: {
                name: document.getElementById('primary-contact').value,
                email: document.getElementById('contact-email').value,
                role: document.getElementById('contact-role').value
            },
            healthScore: this.currentEditId
                ? this.pilots.find(p => p.id === this.currentEditId).healthScore
                : Math.floor(Math.random() * 30 + 60), // Random 60-90
            successCriteria: document.getElementById('success-criteria').value
                .split('\n')
                .filter(line => line.trim())
                .map(text => ({ text: text.trim(), completed: false })),
            conversionProbability: Math.floor(Math.random() * 40 + 50), // Random 50-90
            notes: document.getElementById('pilot-notes').value
        };

        // Convert to backend format
        const apiData = this.convertPilotToAPI(formData);

        try {
            let response;
            if (this.currentEditId) {
                // Update existing
                response = await fetch(`${this.apiUrl}/pilots/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiData)
                });

                if (response.ok) {
                    const result = await response.json();
                    const updatedPilot = this.convertPilotFromAPI(result.data || result);
                    const index = this.pilots.findIndex(p => p.id === this.currentEditId);
                    this.pilots[index] = updatedPilot;
                } else {
                    throw new Error('API update failed');
                }
            } else {
                // Create new
                response = await fetch(`${this.apiUrl}/pilots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiData)
                });

                if (response.ok) {
                    const result = await response.json();
                    const newPilot = this.convertPilotFromAPI(result.data || result);
                    this.pilots.push(newPilot);
                } else {
                    throw new Error('API create failed');
                }
            }
        } catch (error) {
            console.log('Saving to local data');

            if (this.currentEditId) {
                const index = this.pilots.findIndex(p => p.id === this.currentEditId);
                this.pilots[index] = { ...this.pilots[index], ...formData };
            } else {
                const newPilot = {
                    id: Date.now(),
                    ...formData
                };
                this.pilots.push(newPilot);
            }
        }

        this.closeModal();
        this.applyFilters();
        this.renderDashboard();
    }

    closeModal() {
        document.getElementById('pilot-modal').classList.remove('active');
    }

    applyFilters() {
        const statusFilter = document.getElementById('filter-status').value;
        const sortBy = document.getElementById('filter-sort').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        // Filter
        this.filteredPilots = this.pilots.filter(pilot => {
            const matchesStatus = !statusFilter || pilot.status === statusFilter;
            const matchesSearch = !searchTerm ||
                pilot.companyName.toLowerCase().includes(searchTerm) ||
                pilot.primaryContact.name.toLowerCase().includes(searchTerm);

            return matchesStatus && matchesSearch;
        });

        // Sort
        this.filteredPilots.sort((a, b) => {
            switch (sortBy) {
                case 'health':
                    return b.healthScore - a.healthScore;
                case 'value':
                    return b.contractValue - a.contractValue;
                case 'startDate':
                    return new Date(b.startDate) - new Date(a.startDate);
                case 'endDate':
                    return new Date(a.endDate) - new Date(b.endDate);
                default:
                    return 0;
            }
        });

        this.renderPilotCards();
    }

    async refreshData() {
        this.showLoading();
        await this.loadPilots();
        this.renderDashboard();
        this.hideLoading();
    }

    exportReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalPilots: this.pilots.length,
                activePilots: this.pilots.filter(p => p.status === 'active' || p.status === 'on_track').length,
                atRiskPilots: this.pilots.filter(p => p.status === 'at_risk').length,
                completedPilots: this.pilots.filter(p => p.status === 'completed' || p.status === 'converted').length,
                totalARR: this.pilots.reduce((sum, p) => sum + p.contractValue, 0),
                averageHealthScore: Math.round(
                    this.pilots.reduce((sum, p) => sum + p.healthScore, 0) / this.pilots.length
                )
            },
            pilots: this.pilots
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pilot-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    viewExecutiveSummary() {
        alert('Executive Summary:\n\n' +
              `Total Active Pilots: ${this.pilots.filter(p => p.status === 'active' || p.status === 'on_track').length}\n` +
              `Total Pipeline Value: ${this.formatCurrency(this.pilots.reduce((sum, p) => sum + p.contractValue, 0))}\n` +
              `Average Health Score: ${Math.round(this.pilots.reduce((sum, p) => sum + p.healthScore, 0) / this.pilots.length)}\n` +
              `At Risk Count: ${this.pilots.filter(p => p.status === 'at_risk' || p.healthScore < 60).length}\n\n` +
              'Full executive dashboard coming soon!');
    }

    scheduleReview() {
        alert('Review scheduling interface would open here.\n\nIntegration with calendar systems coming soon!');
    }

    showLoading() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('pilots-grid').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-state').style.display = 'none';
    }

    // Utility Functions
    getDaysElapsed(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        return Math.floor((today - start) / (1000 * 60 * 60 * 24));
    }

    getTotalDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatStatus(status) {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getHealthClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'warning';
        return 'poor';
    }

    getProgressClass(progress, status) {
        if (status === 'completed' || status === 'converted') return 'complete';
        if (progress > 80 && status === 'at_risk') return 'danger';
        if (progress > 90) return 'warning';
        return '';
    }
}

// Initialize dashboard when DOM is ready
const dashboard = new PilotDashboard();
