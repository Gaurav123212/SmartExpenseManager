/**
 * SmartExpenseTracker — Premium Wealth & Financial Analytics Engine
 * SPA Controller supporting Accounts, Incomes, Subscriptions, Goals, Budgets, and Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '3000'
        ? 'http://localhost:8081'
        : window.location.origin;

    console.log('SmartExpenseTracker API Endpoint Configured to:', API_BASE);

    // State Variables
    let categories = [];
    let accounts = [];
    let expenses = [];
    let incomes = [];
    let recurringExpenses = [];
    let savingsGoals = [];
    let budgets = [];
    let currentTab = 'overview';
    let deleteTarget = null; // { type, id }
    
    // Chart References
    let trendChart = null;
    let categoryChart = null;

    // Date Utilities
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const today = new Date();
    const currentMonthName = months[today.getMonth()];
    const currentYear = today.getFullYear();

    // DOM Elements - Navigation & Layouts
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const btnQuickExpense = document.getElementById('btn-quick-expense');
    const btnQuickIncome = document.getElementById('btn-quick-income');

    // DOM Elements - Modals
    const expenseModal = document.getElementById('expense-modal');
    const incomeModal = document.getElementById('income-modal');
    const accountModal = document.getElementById('account-modal');
    const recurringModal = document.getElementById('recurring-modal');
    const goalModal = document.getElementById('goal-modal');
    const contributeModal = document.getElementById('contribute-modal');
    const categoryModal = document.getElementById('category-modal');
    const budgetModal = document.getElementById('budget-modal');
    const deleteModal = document.getElementById('delete-modal');

    // Forms
    const expenseForm = document.getElementById('expense-form');
    const incomeForm = document.getElementById('income-form');
    const accountForm = document.getElementById('account-form');
    const recurringForm = document.getElementById('recurring-form');
    const goalForm = document.getElementById('goal-form');
    const contributeForm = document.getElementById('contribute-form');
    const categoryForm = document.getElementById('category-form');
    const budgetForm = document.getElementById('budget-form');
    const quickExpenseForm = document.getElementById('quick-expense-form');

    // Initialize Page Controls & Selectors
    initSelectors();
    initApp();

    /* ==========================================================================
       Initializations & Dynamic Setup
       ========================================================================== */

    function initSelectors() {
        const monthSelects = ['dashboard-month-select', 'report-month-select', 'budget-month'];
        const yearSelects = ['dashboard-year-select', 'report-year-select', 'budget-year', 'trend-year-select', 'budget-filter-year'];

        monthSelects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            months.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                if (m === currentMonthName) opt.selected = true;
                el.appendChild(opt);
            });
        });

        yearSelects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                if (y === currentYear) opt.selected = true;
                el.appendChild(opt);
            });
        });

        const dateInputs = ['quick-date', 'expense-date', 'income-date', 'recurring-next-date', 'goal-date'];
        const dateString = today.toISOString().split('T')[0];
        const nextMonthDateString = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];
        
        dateInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = id === 'recurring-next-date' ? nextMonthDateString : dateString;
        });
    }

    async function initApp() {
        await loadCategories();
        await loadAccounts();
        setupEventListeners();
        loadDashboardStats();
    }

    /* ==========================================================================
       Event Listeners Wiring
       ========================================================================== */

    function setupEventListeners() {
        // 1. Sidebar Tab Swapping
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // 2. Overview Quick Action Redirects
        const linkViewAll = document.getElementById('link-view-all-expenses');
        if (linkViewAll) {
            linkViewAll.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab('expenses');
            });
        }

        // 3. Modal Opening Triggers
        if (btnQuickExpense) btnQuickExpense.addEventListener('click', () => openExpenseModal());
        if (btnQuickIncome) btnQuickIncome.addEventListener('click', () => openIncomeModal());

        const btnAddExpense = document.getElementById('btn-add-expense');
        if (btnAddExpense) btnAddExpense.addEventListener('click', () => openExpenseModal());

        const btnAddIncome = document.getElementById('btn-add-income');
        if (btnAddIncome) btnAddIncome.addEventListener('click', () => openIncomeModal());

        const btnAddAccount = document.getElementById('btn-add-account');
        if (btnAddAccount) btnAddAccount.addEventListener('click', () => openAccountModal());

        const btnAddRecurring = document.getElementById('btn-add-recurring');
        if (btnAddRecurring) btnAddRecurring.addEventListener('click', () => openRecurringModal());

        const btnAddGoal = document.getElementById('btn-add-goal');
        if (btnAddGoal) btnAddGoal.addEventListener('click', () => openGoalModal());

        const btnAddCategory = document.getElementById('btn-add-category');
        if (btnAddCategory) btnAddCategory.addEventListener('click', () => openCategoryModal());

        const btnAddBudget = document.getElementById('btn-add-budget');
        if (btnAddBudget) btnAddBudget.addEventListener('click', () => openBudgetModal());

        // 4. Modal Closing Actions
        setupModalClose('expense-modal', 'btn-close-expense-modal', 'btn-cancel-expense');
        setupModalClose('income-modal', 'btn-close-income-modal', 'btn-cancel-income');
        setupModalClose('account-modal', 'btn-close-account-modal', 'btn-cancel-account');
        setupModalClose('recurring-modal', 'btn-close-recurring-modal', 'btn-cancel-recurring');
        setupModalClose('goal-modal', 'btn-close-goal-modal', 'btn-cancel-goal');
        setupModalClose('contribute-modal', 'btn-close-contribute-modal', 'btn-cancel-contribute');
        setupModalClose('category-modal', 'btn-close-category-modal', 'btn-cancel-category');
        setupModalClose('budget-modal', 'btn-close-budget-modal', 'btn-cancel-budget');
        setupModalClose('delete-modal', 'btn-close-delete-modal', 'btn-cancel-delete');

        // 5. Forms Submissions
        if (quickExpenseForm) quickExpenseForm.addEventListener('submit', handleQuickExpenseSubmit);
        if (expenseForm) expenseForm.addEventListener('submit', handleExpenseSubmit);
        if (incomeForm) incomeForm.addEventListener('submit', handleIncomeSubmit);
        if (accountForm) accountForm.addEventListener('submit', handleAccountSubmit);
        if (recurringForm) recurringForm.addEventListener('submit', handleRecurringSubmit);
        if (goalForm) goalForm.addEventListener('submit', handleGoalSubmit);
        if (contributeForm) contributeForm.addEventListener('submit', handleContributeSubmit);
        if (categoryForm) categoryForm.addEventListener('submit', handleCategorySubmit);
        if (budgetForm) budgetForm.addEventListener('submit', handleBudgetSubmit);
        
        // 6. Delete Action Confirmation
        const btnConfirmDelete = document.getElementById('btn-confirm-delete');
        if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', executeDeletion);

        // 7. Filtering & Sorting Listeners
        const expenseSearch = document.getElementById('expense-search');
        if (expenseSearch) expenseSearch.addEventListener('input', renderExpensesTable);

        const expenseFilterCat = document.getElementById('expense-filter-category');
        if (expenseFilterCat) expenseFilterCat.addEventListener('change', renderExpensesTable);

        const expenseFilterAcc = document.getElementById('expense-filter-account');
        if (expenseFilterAcc) expenseFilterAcc.addEventListener('change', renderExpensesTable);

        const expenseSort = document.getElementById('expense-sort');
        if (expenseSort) expenseSort.addEventListener('change', renderExpensesTable);

        const incomeSearch = document.getElementById('income-search');
        if (incomeSearch) incomeSearch.addEventListener('input', renderIncomesTable);

        const recurringSearch = document.getElementById('recurring-search');
        if (recurringSearch) recurringSearch.addEventListener('input', renderRecurringGrid);

        const goalsSearch = document.getElementById('goals-search');
        if (goalsSearch) goalsSearch.addEventListener('input', renderGoalsGrid);

        const categorySearch = document.getElementById('category-search');
        if (categorySearch) categorySearch.addEventListener('input', renderCategoriesGrid);

        // 8. Analytics Selectors Dynamic Updating
        const dashMonth = document.getElementById('dashboard-month-select');
        const dashYear = document.getElementById('dashboard-year-select');
        if (dashMonth) dashMonth.addEventListener('change', loadDashboardStats);
        if (dashYear) dashYear.addEventListener('change', loadDashboardStats);

        const trendYear = document.getElementById('trend-year-select');
        if (trendYear) trendYear.addEventListener('change', () => loadAnnualTrend(parseInt(trendYear.value)));

        const budgetYearFilter = document.getElementById('budget-filter-year');
        if (budgetYearFilter) budgetYearFilter.addEventListener('change', renderBudgetsGrid);

        const btnGenerateReport = document.getElementById('btn-generate-report');
        if (btnGenerateReport) btnGenerateReport.addEventListener('click', generateMonthlyReport);
    }

    function setupModalClose(modalId, closeIconId, cancelBtnId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const icon = document.getElementById(closeIconId);
        const btn = document.getElementById(cancelBtnId);

        const close = () => {
            modal.classList.remove('show');
        };

        if (icon) icon.addEventListener('click', close);
        if (btn) btn.addEventListener('click', close);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }

    /* ==========================================================================
       Tab Navigation Controller
       ========================================================================== */

    function switchTab(tabId) {
        currentTab = tabId;

        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.getAttribute('id') === `tab-${tabId}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        switch (tabId) {
            case 'overview':
                pageTitle.textContent = 'Financial Overview';
                pageSubtitle.textContent = 'Track, analyze, and optimize your spending habits in real-time.';
                loadDashboardStats();
                break;
            case 'expenses':
                pageTitle.textContent = 'Transaction Ledger';
                pageSubtitle.textContent = 'Add, modify, and audit expenditures across accounts & merchants.';
                loadExpenses();
                break;
            case 'incomes':
                pageTitle.textContent = 'Incomes & Cash Flow';
                pageSubtitle.textContent = 'Monitor all income streams, paychecks, and net monthly cash flow.';
                loadIncomes();
                break;
            case 'accounts':
                pageTitle.textContent = 'Payment Accounts & Portfolios';
                pageSubtitle.textContent = 'Manage bank accounts, credit cards, digital wallets, and liquid assets.';
                loadAccounts();
                break;
            case 'recurring':
                pageTitle.textContent = 'Subscriptions & Scheduled Bills';
                pageSubtitle.textContent = 'Track recurring commitments and execute automated bill payments with ease.';
                loadRecurring();
                break;
            case 'goals':
                pageTitle.textContent = 'Target Savings Goals';
                pageSubtitle.textContent = 'Plan, fund, and accomplish milestones with visual progress trackers.';
                loadSavingsGoals();
                break;
            case 'categories':
                pageTitle.textContent = 'Spending & Income Categories';
                pageSubtitle.textContent = 'Organize financial activities with color-coded tags and subcategories.';
                loadCategories();
                break;
            case 'budgets':
                pageTitle.textContent = 'Monthly Budget Planner';
                pageSubtitle.textContent = 'Set spend limits and warning triggers to safeguard your financial health.';
                loadBudgets();
                break;
            case 'analytics':
                pageTitle.textContent = 'Analytics & Reports';
                pageSubtitle.textContent = 'Explore annual spending trends and detailed category distribution breakdowns.';
                const trendYearSelect = document.getElementById('trend-year-select');
                if (trendYearSelect) loadAnnualTrend(parseInt(trendYearSelect.value));
                generateMonthlyReport();
                break;
        }
    }

    /* ==========================================================================
       Toast Alerts Notification System
       ========================================================================== */

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-check';
        if (type === 'danger') iconClass = 'fa-triangle-exclamation';
        if (type === 'warning') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    /* ==========================================================================
       Dashboard & Overview Controller
       ========================================================================== */

    async function loadDashboardStats() {
        const monthSelect = document.getElementById('dashboard-month-select');
        const yearSelect = document.getElementById('dashboard-year-select');
        
        const month = monthSelect ? monthSelect.value : currentMonthName;
        const year = yearSelect ? parseInt(yearSelect.value) : currentYear;

        // 1. Budget Status
        try {
            const res = await fetch(`${API_BASE}/analytics/budget-status?month=${month}&year=${year}`);
            if (!res.ok) throw new Error('API returned an error');
            const data = await res.json();

            document.getElementById('stat-total-spent').textContent = formatCurrency(data.spent);
            document.getElementById('stat-active-budget').textContent = formatCurrency(data.budget);
            
            const remainingEl = document.getElementById('stat-remaining-balance');
            const remainingCard = remainingEl.closest('.stat-card');
            remainingEl.textContent = formatCurrency(data.remaining);

            if (data.remaining < 0) {
                remainingCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                remainingEl.style.color = 'var(--danger)';
            } else {
                remainingCard.style.borderColor = 'var(--border-glass)';
                remainingEl.style.color = 'var(--success)';
            }

            renderGaugeRing(data.percentageUsed, data.status, data.spent, data.remaining);
            
            const banner = document.getElementById('budget-status-banner');
            const bannerText = document.getElementById('budget-banner-text');
            if (data.percentageUsed >= 100) {
                banner.style.display = 'flex';
                banner.style.background = 'var(--danger-bg)';
                banner.style.borderColor = 'var(--danger-border)';
                banner.style.color = 'var(--danger)';
                bannerText.textContent = `ALERT: You have exceeded your monthly limit for ${month} by ${formatCurrency(Math.abs(data.remaining))}!`;
            } else if (data.percentageUsed >= 80) {
                banner.style.display = 'flex';
                banner.style.background = 'var(--warning-bg)';
                banner.style.borderColor = 'var(--warning-border)';
                bannerText.textContent = `WARNING: You have utilized ${data.percentageUsed}% of your designated budget limit for ${month}!`;
            } else {
                banner.style.display = 'none';
            }

        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            renderEmptyBudgetDashboard(month, year);
        }

        // 2. Cash Flow Summary
        try {
            const cfRes = await fetch(`${API_BASE}/analytics/cash-flow?month=${month}&year=${year}`);
            if (cfRes.ok) {
                const cf = await cfRes.json();
                const cfIncome = document.getElementById('cf-income');
                const cfExpense = document.getElementById('cf-expense');
                const cfSavings = document.getElementById('cf-savings');
                const cfRate = document.getElementById('cf-rate');
                const cfRecurring = document.getElementById('cf-recurring');

                if (cfIncome) cfIncome.textContent = formatCurrency(cf.totalIncome);
                if (cfExpense) cfExpense.textContent = formatCurrency(cf.totalExpense);
                if (cfSavings) {
                    cfSavings.textContent = formatCurrency(cf.netSavings);
                    cfSavings.className = `cf-val ${cf.netSavings >= 0 ? 'text-primary' : 'text-danger'}`;
                }
                if (cfRate) cfRate.textContent = `${cf.savingsRate.toFixed(1)}%`;
                if (cfRecurring) cfRecurring.textContent = `${formatCurrency(cf.recurringCommitment)}/mo`;
            }
        } catch (e) {
            console.error('Cash flow fetch error:', e);
        }

        // 3. Total Balance
        try {
            const balRes = await fetch(`${API_BASE}/accounts/total-balance`);
            if (balRes.ok) {
                const bal = await balRes.json();
                const balEl = document.getElementById('stat-total-balance');
                if (balEl) balEl.textContent = formatCurrency(bal);
            }
        } catch (e) {
            console.error('Total balance fetch error:', e);
        }

        await loadRecentExpenses(month, year);
    }

    function renderEmptyBudgetDashboard(month, year) {
        document.getElementById('stat-total-spent').textContent = '$0.00';
        document.getElementById('stat-active-budget').textContent = '$0.00';
        
        const remainingEl = document.getElementById('stat-remaining-balance');
        remainingEl.textContent = '$0.00';
        remainingEl.style.color = 'var(--text-primary)';
        remainingEl.closest('.stat-card').style.borderColor = 'var(--border-glass)';

        renderGaugeRing(0, 'NO ACTIVE BUDGET', 0, 0);

        const banner = document.getElementById('budget-status-banner');
        const bannerText = document.getElementById('budget-banner-text');
        banner.style.display = 'flex';
        banner.style.background = 'rgba(255, 255, 255, 0.03)';
        banner.style.borderColor = 'var(--border-glass)';
        banner.style.color = 'var(--text-secondary)';
        bannerText.innerHTML = `<i class="fa-solid fa-circle-info"></i> No budget limit set for <strong>${month} ${year}</strong>. Set one up in the Budgets tab to track utilization!`;
    }

    function renderGaugeRing(percent, status, spent, remaining) {
        const ring = document.getElementById('utilization-ring');
        if (!ring) return;

        const radius = ring.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;

        ring.style.strokeDasharray = `${circumference} ${circumference}`;
        
        const drawPercent = Math.min(Math.max(percent, 0), 100);
        const offset = circumference - (drawPercent / 100) * circumference;
        ring.style.strokeDashoffset = offset;

        const svgGradStop1 = document.querySelector('#paint0_linear stop:nth-child(1)');
        const svgGradStop2 = document.querySelector('#paint0_linear stop:nth-child(2)');
        const statusText = document.getElementById('utilization-status');

        if (percent >= 100) {
            svgGradStop1.setAttribute('stop-color', '#ef4444');
            svgGradStop2.setAttribute('stop-color', '#f43f5e');
            statusText.textContent = 'Exceeded';
            statusText.style.color = 'var(--danger)';
        } else if (percent >= 80) {
            svgGradStop1.setAttribute('stop-color', '#f59e0b');
            svgGradStop2.setAttribute('stop-color', '#fbbf24');
            statusText.textContent = 'Warning';
            statusText.style.color = 'var(--warning)';
        } else if (percent === 0 && status === 'NO ACTIVE BUDGET') {
            svgGradStop1.setAttribute('stop-color', '#4b5563');
            svgGradStop2.setAttribute('stop-color', '#6b7280');
            statusText.textContent = 'No Limit Set';
            statusText.style.color = 'var(--text-muted)';
        } else {
            svgGradStop1.setAttribute('stop-color', '#8b5cf6');
            svgGradStop2.setAttribute('stop-color', '#3b82f6');
            statusText.textContent = 'Healthy';
            statusText.style.color = 'var(--success)';
        }

        document.getElementById('utilization-percentage').textContent = `${Math.round(percent)}%`;
        document.getElementById('util-spent').textContent = formatCurrency(spent);
        document.getElementById('util-remaining').textContent = formatCurrency(remaining);
    }

    async function loadRecentExpenses(month, year) {
        try {
            const res = await fetch(`${API_BASE}/expenses`);
            if (!res.ok) throw new Error('Failed to retrieve ledger');
            const data = await res.json();
            
            const filtered = data.filter(e => {
                if (!e.expenseDate) return false;
                const d = new Date(e.expenseDate);
                const expMonth = months[d.getMonth()];
                const expYear = d.getFullYear();
                return expMonth === month && expYear === year;
            });

            filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));

            const tbody = document.querySelector('#recent-expenses-table tbody');
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">No logged transactions found for ${month} ${year}.</td>
                    </tr>
                `;
                return;
            }

            filtered.slice(0, 5).forEach(e => {
                const tr = document.createElement('tr');
                const catName = e.categoryName || getCategoryName(e.categoryId);
                const accName = e.accountName || 'Cash';
                
                tr.innerHTML = `
                    <td><strong>${escapeHtml(e.name)}</strong></td>
                    <td class="text-secondary">${escapeHtml(e.merchant || '—')}</td>
                    <td><span class="badge" style="background:${e.categoryColor || '#6366f1'}20; color:${e.categoryColor || '#6366f1'}; border: 1px solid ${e.categoryColor || '#6366f1'}40;"><i class="fa-solid ${e.categoryIcon || 'fa-tag'} mr-2"></i>${escapeHtml(catName)}</span></td>
                    <td><span class="badge badge-info"><i class="fa-solid fa-credit-card mr-2"></i>${escapeHtml(accName)}</span></td>
                    <td>${formatDate(e.expenseDate)}</td>
                    <td><span class="badge badge-amount font-weight-bold">${formatCurrency(e.amount)}</span></td>
                    <td class="text-right">
                        <div class="action-btn-group">
                            <button class="action-btn edit" onclick="window.editExpense(${e.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="action-btn delete" onclick="window.confirmDelete('expense', ${e.id})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (err) {
            console.error('Error rendering recent transactions:', err);
        }
    }

    /* ==========================================================================
       Expense Ledger Integrations (CRUD)
       ========================================================================== */

    async function loadExpenses() {
        try {
            const res = await fetch(`${API_BASE}/expenses`);
            if (!res.ok) throw new Error('Failed to retrieve expenses list');
            expenses = await res.json();
            renderExpensesTable();
        } catch (err) {
            console.error('Error fetching expenses:', err);
            showToast('Unable to synchronize transaction database.', 'danger');
        }
    }

    function renderExpensesTable() {
        const query = (document.getElementById('expense-search')?.value || '').toLowerCase();
        const filterCat = document.getElementById('expense-filter-category')?.value;
        const filterAcc = document.getElementById('expense-filter-account')?.value;
        const sortBy = document.getElementById('expense-sort')?.value;

        const tableBody = document.querySelector('#expenses-table tbody');
        if (!tableBody) return;

        let filtered = expenses.filter(e => {
            const nameMatch = (e.name || '').toLowerCase().includes(query);
            const merchMatch = (e.merchant || '').toLowerCase().includes(query);
            const descMatch = (e.description || '').toLowerCase().includes(query);
            const catMatch = filterCat ? String(e.categoryId) === filterCat : true;
            const accMatch = filterAcc ? String(e.accountId) === filterAcc : true;
            return (nameMatch || merchMatch || descMatch) && catMatch && accMatch;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortBy === 'date-desc') return new Date(b.expenseDate) - new Date(a.expenseDate);
            if (sortBy === 'date-asc') return new Date(a.expenseDate) - new Date(b.expenseDate);
            if (sortBy === 'amount-desc') return b.amount - a.amount;
            if (sortBy === 'amount-asc') return a.amount - b.amount;
            return 0;
        });

        tableBody.innerHTML = '';

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">No matching transactions discovered.</td>
                </tr>
            `;
            return;
        }

        filtered.forEach(e => {
            const tr = document.createElement('tr');
            const catName = e.categoryName || getCategoryName(e.categoryId);
            const accName = e.accountName || 'Cash';
            const tagsHtml = (e.tags && e.tags.length > 0) 
                ? e.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('') 
                : '<span class="text-muted">—</span>';

            tr.innerHTML = `
                <td><strong>${escapeHtml(e.name)}</strong></td>
                <td class="text-secondary">${escapeHtml(e.merchant || '—')}</td>
                <td>
                    <span class="badge" style="background:${e.categoryColor || '#6366f1'}20; color:${e.categoryColor || '#6366f1'}; border: 1px solid ${e.categoryColor || '#6366f1'}40;">
                        <i class="fa-solid ${e.categoryIcon || 'fa-tag'} mr-2"></i>${escapeHtml(catName)}
                    </span>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span class="badge badge-info"><i class="fa-solid fa-wallet mr-2"></i>${escapeHtml(accName)}</span>
                        <small class="text-muted" style="font-size:0.7rem;">${e.paymentMethod || 'CARD'}</small>
                    </div>
                </td>
                <td>${tagsHtml}</td>
                <td>${formatDate(e.expenseDate)}</td>
                <td><span class="badge badge-amount">${formatCurrency(e.amount)}</span></td>
                <td class="text-right">
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editExpense(${e.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('expense', ${e.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function openExpenseModal(expense = null) {
        const titleEl = document.getElementById('expense-modal-title');
        const submitBtn = document.getElementById('btn-submit-expense');

        if (expense) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Expense';
            submitBtn.textContent = 'Update Expense';
            document.getElementById('expense-id').value = expense.id;
            document.getElementById('expense-name').value = expense.name;
            document.getElementById('expense-merchant').value = expense.merchant || '';
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-date').value = expense.expenseDate;
            document.getElementById('expense-category').value = expense.categoryId || '';
            document.getElementById('expense-account').value = expense.accountId || '';
            document.getElementById('expense-payment-method').value = expense.paymentMethod || 'CREDIT_CARD';
            document.getElementById('expense-tags').value = (expense.tags || []).join(', ');
            document.getElementById('expense-description').value = expense.description || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-receipt"></i> Add New Expense';
            submitBtn.textContent = 'Save Expense';
            expenseForm.reset();
            document.getElementById('expense-id').value = '';
            document.getElementById('expense-date').value = today.toISOString().split('T')[0];
        }

        expenseModal.classList.add('show');
    }

    async function handleExpenseSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('expense-id').value;
        const tagsRaw = document.getElementById('expense-tags').value;
        const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
        const catVal = document.getElementById('expense-category').value;
        const accVal = document.getElementById('expense-account').value;
        const amountVal = document.getElementById('expense-amount').value;

        const payload = {
            name: document.getElementById('expense-name').value,
            merchant: document.getElementById('expense-merchant').value || '',
            amount: amountVal ? parseFloat(amountVal) : 0,
            expenseDate: document.getElementById('expense-date').value || today.toISOString().split('T')[0],
            categoryId: catVal ? parseInt(catVal) : null,
            accountId: accVal ? parseInt(accVal) : null,
            paymentMethod: document.getElementById('expense-payment-method').value || 'CREDIT_CARD',
            isRecurring: false,
            tags: tags,
            description: document.getElementById('expense-description').value || ''
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/expenses/${id}` : `${API_BASE}/expenses`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => null);
                throw new Error(errJson?.message || `Server returned ${res.status}`);
            }

            showToast(isUpdate ? 'Expense successfully updated!' : 'Expense saved successfully!', 'success');
            expenseModal.classList.remove('show');
            expenseForm.reset();

            await loadAccounts(); // Refresh accounts in case balance was updated
            if (currentTab === 'overview') loadDashboardStats();
            else loadExpenses();

        } catch (err) {
            console.error('Error saving expense:', err);
            showToast('Unable to complete expense transaction.', 'danger');
        }
    }

    async function handleQuickExpenseSubmit(e) {
        e.preventDefault();
        const catVal = document.getElementById('quick-category').value;
        const accVal = document.getElementById('quick-account').value;
        const amountVal = document.getElementById('quick-amount').value;

        const payload = {
            amount: amountVal ? parseFloat(amountVal) : 0,
            name: document.getElementById('quick-name').value,
            merchant: document.getElementById('quick-merchant').value || '',
            categoryId: catVal ? parseInt(catVal) : null,
            accountId: accVal ? parseInt(accVal) : null,
            paymentMethod: 'CREDIT_CARD',
            isRecurring: false,
            expenseDate: document.getElementById('quick-date').value || today.toISOString().split('T')[0],
            description: document.getElementById('quick-description').value || ''
        };

        try {
            const res = await fetch(`${API_BASE}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to post quick transaction');

            showToast('Transaction logged successfully!', 'success');
            quickExpenseForm.reset();
            document.getElementById('quick-date').value = today.toISOString().split('T')[0];

            await loadAccounts();
            loadDashboardStats();

        } catch (err) {
            console.error('Error processing quick add expense:', err);
            showToast('Failed to record quick transaction.', 'danger');
        }
    }

    /* ==========================================================================
       Income & Cash Flow Controller (CRUD)
       ========================================================================== */

    async function loadIncomes() {
        try {
            const res = await fetch(`${API_BASE}/incomes`);
            if (!res.ok) throw new Error('Failed to fetch incomes');
            incomes = await res.json();
            renderIncomesTable();
        } catch (err) {
            console.error('Incomes loading error:', err);
            showToast('Unable to load incomes ledger.', 'danger');
        }
    }

    function renderIncomesTable() {
        const query = (document.getElementById('income-search')?.value || '').toLowerCase();
        const tbody = document.querySelector('#incomes-table tbody');
        if (!tbody) return;

        let totalMonth = 0;
        let filtered = incomes.filter(i => {
            const src = (i.source || '').toLowerCase();
            const notes = (i.notes || '').toLowerCase();
            return src.includes(query) || notes.includes(query);
        });

        filtered.forEach(i => {
            if (i.amount) totalMonth += parseFloat(i.amount);
        });

        const totalStat = document.getElementById('income-stat-total');
        if (totalStat) totalStat.textContent = formatCurrency(totalMonth);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">No income records discovered. Record some above!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(i.source)}</strong></td>
                <td><span class="badge badge-success"><i class="fa-solid fa-tag mr-2"></i>${escapeHtml(i.categoryName || 'General Income')}</span></td>
                <td><span class="badge badge-info"><i class="fa-solid fa-building-columns mr-2"></i>${escapeHtml(i.accountName || 'Cash')}</span></td>
                <td>${formatDate(i.incomeDate)}</td>
                <td><span class="badge badge-primary">${i.paymentMethod || 'TRANSFER'}</span></td>
                <td><strong class="text-success">+${formatCurrency(i.amount)}</strong></td>
                <td class="text-right">
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editIncome(${i.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('income', ${i.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function openIncomeModal(income = null) {
        const titleEl = document.getElementById('income-modal-title');
        const submitBtn = document.getElementById('btn-submit-income');

        if (income) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Income';
            submitBtn.textContent = 'Update Income';
            document.getElementById('income-id').value = income.id;
            document.getElementById('income-source').value = income.source;
            document.getElementById('income-amount').value = income.amount;
            document.getElementById('income-date').value = income.incomeDate;
            document.getElementById('income-category').value = income.categoryId || '';
            document.getElementById('income-account').value = income.accountId || '';
            document.getElementById('income-method').value = income.paymentMethod || 'BANK_TRANSFER';
            document.getElementById('income-notes').value = income.notes || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-money-bill-wave"></i> Record Income';
            submitBtn.textContent = 'Save Income';
            incomeForm.reset();
            document.getElementById('income-id').value = '';
            document.getElementById('income-date').value = today.toISOString().split('T')[0];
        }

        incomeModal.classList.add('show');
    }

    async function handleIncomeSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('income-id').value;
        const payload = {
            source: document.getElementById('income-source').value,
            amount: parseFloat(document.getElementById('income-amount').value),
            incomeDate: document.getElementById('income-date').value,
            categoryId: document.getElementById('income-category').value ? parseInt(document.getElementById('income-category').value) : null,
            accountId: document.getElementById('income-account').value ? parseInt(document.getElementById('income-account').value) : null,
            paymentMethod: document.getElementById('income-method').value,
            notes: document.getElementById('income-notes').value
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/incomes/${id}` : `${API_BASE}/incomes`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to record income');

            showToast(isUpdate ? 'Income updated successfully!' : 'Income deposited successfully!', 'success');
            incomeModal.classList.remove('show');
            incomeForm.reset();

            await loadAccounts();
            if (currentTab === 'incomes') loadIncomes();
            else loadDashboardStats();

        } catch (err) {
            console.error('Error saving income:', err);
            showToast('Unable to complete income transaction.', 'danger');
        }
    }

    /* ==========================================================================
       Payment Accounts Controller (CRUD)
       ========================================================================== */

    async function loadAccounts() {
        try {
            const res = await fetch(`${API_BASE}/accounts`);
            if (!res.ok) throw new Error('Failed to fetch payment accounts');
            accounts = await res.json();
            populateAccountDropdowns();
            renderAccountsGrid();
        } catch (err) {
            console.error('Accounts loading error:', err);
        }
    }

    function populateAccountDropdowns() {
        const selectIds = ['expense-account', 'quick-account', 'income-account', 'recurring-account', 'goal-account', 'expense-filter-account'];
        selectIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const currentVal = el.value;
            const isFilter = id === 'expense-filter-account';
            
            el.innerHTML = isFilter 
                ? '<option value="">All Accounts</option>' 
                : '<option value="">None / External Cash</option>';

            accounts.forEach(acc => {
                const opt = document.createElement('option');
                opt.value = acc.id;
                opt.textContent = `${acc.accountName} (${formatCurrency(acc.currentBalance)})`;
                el.appendChild(opt);
            });

            if (currentVal) el.value = currentVal;
        });
    }

    function renderAccountsGrid() {
        const grid = document.getElementById('accounts-grid');
        if (!grid) return;

        let totalBal = 0;
        accounts.forEach(a => totalBal += (a.currentBalance || 0));

        const totEl = document.getElementById('accounts-total-balance');
        if (totEl) totEl.textContent = formatCurrency(totalBal);

        grid.innerHTML = '';

        if (accounts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-box col-span-3">
                    <i class="fa-solid fa-credit-card"></i>
                    <h4>No Payment Accounts Added</h4>
                    <p>Link your bank accounts, credit cards, or digital wallets to track balances automatically.</p>
                </div>
            `;
            return;
        }

        accounts.forEach(acc => {
            const card = document.createElement('div');
            card.className = 'account-card';
            const color = acc.color || '#3b82f6';
            const icon = acc.accountType === 'CREDIT_CARD' ? 'fa-credit-card' 
                : acc.accountType === 'CASH' ? 'fa-money-bill-wave'
                : acc.accountType === 'DIGITAL_WALLET' ? 'fa-mobile-screen'
                : acc.accountType === 'INVESTMENT' ? 'fa-chart-pie' : 'fa-building-columns';

            let creditLimitInfo = '';
            if (acc.accountType === 'CREDIT_CARD' && acc.creditLimit) {
                const util = Math.min(Math.round((acc.currentBalance / acc.creditLimit) * 100), 100);
                creditLimitInfo = `
                    <div style="margin-top:0.5rem; font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px; color:var(--text-secondary);">
                            <span>Limit: ${formatCurrency(acc.creditLimit)}</span>
                            <span>${util}% utilized</span>
                        </div>
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                            <div style="width:${util}%; height:100%; background:${util > 80 ? 'var(--danger)' : color};"></div>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="account-card-top">
                    <div class="account-chip">
                        <i class="fa-solid ${icon}" style="color:${color}"></i>
                        <div>
                            <h4 style="margin:0; font-size:1.05rem;">${escapeHtml(acc.accountName)}</h4>
                            <span class="account-institution">${escapeHtml(acc.institutionName || 'Default')}</span>
                        </div>
                    </div>
                    <span class="badge" style="background:${color}20; color:${color}; border: 1px solid ${color}40;">${acc.accountType}</span>
                </div>
                <div class="account-card-balance">
                    <span class="account-balance-label">Current Balance</span>
                    <h2 class="account-balance-val">${formatCurrency(acc.currentBalance)}</h2>
                    ${creditLimitInfo}
                </div>
                <div class="account-card-bottom">
                    <span class="account-masked-number">${escapeHtml(acc.accountNumberMasked || '•••• ••••')}</span>
                    <div class="account-card-actions">
                        <button class="action-btn edit" onclick="window.editAccount(${acc.id})" title="Edit Account"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('account', ${acc.id})" title="Delete Account"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openAccountModal(acc = null) {
        const titleEl = document.getElementById('account-modal-title');
        const submitBtn = document.getElementById('btn-submit-account');

        if (acc) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Payment Account';
            submitBtn.textContent = 'Update Account';
            document.getElementById('account-id').value = acc.id;
            document.getElementById('account-name').value = acc.accountName;
            document.getElementById('account-type').value = acc.accountType;
            document.getElementById('account-institution').value = acc.institutionName || '';
            document.getElementById('account-masked').value = acc.accountNumberMasked || '';
            document.getElementById('account-balance').value = acc.currentBalance;
            document.getElementById('account-credit-limit').value = acc.creditLimit || '';
            document.getElementById('account-color').value = acc.color || '#3b82f6';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-building-columns"></i> Link Payment Account';
            submitBtn.textContent = 'Save Account';
            accountForm.reset();
            document.getElementById('account-id').value = '';
        }

        accountModal.classList.add('show');
    }

    async function handleAccountSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('account-id').value;
        const payload = {
            accountName: document.getElementById('account-name').value,
            accountType: document.getElementById('account-type').value,
            institutionName: document.getElementById('account-institution').value,
            accountNumberMasked: document.getElementById('account-masked').value,
            currentBalance: parseFloat(document.getElementById('account-balance').value),
            creditLimit: document.getElementById('account-credit-limit').value ? parseFloat(document.getElementById('account-credit-limit').value) : null,
            color: document.getElementById('account-color').value
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/accounts/${id}` : `${API_BASE}/accounts`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save account');

            showToast(isUpdate ? 'Account modified successfully!' : 'Account registered successfully!', 'success');
            accountModal.classList.remove('show');
            accountForm.reset();

            await loadAccounts();
            if (currentTab === 'overview') loadDashboardStats();

        } catch (err) {
            console.error('Error saving account:', err);
            showToast('Unable to persist payment account.', 'danger');
        }
    }

    /* ==========================================================================
       Subscriptions & Recurring Expenses Controller (CRUD & Execution)
       ========================================================================== */

    async function loadRecurring() {
        try {
            const res = await fetch(`${API_BASE}/recurring-expenses`);
            if (!res.ok) throw new Error('Failed to retrieve subscriptions');
            recurringExpenses = await res.json();
            renderRecurringGrid();
        } catch (err) {
            console.error('Recurring expenses error:', err);
            showToast('Unable to load subscriptions ledger.', 'danger');
        }
    }

    function renderRecurringGrid() {
        const query = (document.getElementById('recurring-search')?.value || '').toLowerCase();
        const grid = document.getElementById('recurring-grid');
        if (!grid) return;

        let totalMonthly = 0;
        let activeCount = 0;

        let filtered = recurringExpenses.filter(r => {
            const title = (r.title || '').toLowerCase();
            const notes = (r.notes || '').toLowerCase();
            return title.includes(query) || notes.includes(query);
        });

        filtered.forEach(r => {
            if (r.status === 'ACTIVE') {
                activeCount++;
                totalMonthly += parseFloat(r.amount || 0);
            }
        });

        const statTotal = document.getElementById('recurring-stat-total');
        const statCount = document.getElementById('recurring-stat-count');
        if (statTotal) statTotal.textContent = `${formatCurrency(totalMonthly)}/mo`;
        if (statCount) statCount.textContent = activeCount;

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-box col-span-3">
                    <i class="fa-solid fa-repeat"></i>
                    <h4>No Subscriptions Found</h4>
                    <p>Keep recurring bills, gym memberships, and cloud hosting under watch.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(r => {
            const card = document.createElement('div');
            card.className = 'sub-card';
            
            let statusBadge = r.status === 'ACTIVE' 
                ? '<span class="badge badge-success">ACTIVE</span>'
                : r.status === 'PAUSED'
                ? '<span class="badge badge-warning">PAUSED</span>'
                : '<span class="badge badge-danger">CANCELLED</span>';

            let dueAlert = '';
            if (r.daysUntilDue <= 0) {
                dueAlert = '<span class="badge badge-danger">DUE TODAY / OVERDUE</span>';
            } else if (r.daysUntilDue <= 5) {
                dueAlert = `<span class="badge badge-warning">Due in ${r.daysUntilDue} days</span>`;
            } else {
                dueAlert = `<span class="badge badge-info">Due in ${r.daysUntilDue} days</span>`;
            }

            card.innerHTML = `
                <div class="sub-card-header">
                    <div class="sub-title-wrap">
                        <div class="sub-icon"><i class="fa-solid fa-repeat"></i></div>
                        <div>
                            <div class="sub-title">${escapeHtml(r.title)}</div>
                            <span class="sub-category">${escapeHtml(r.categoryName || 'General')} • ${escapeHtml(r.accountName || 'Cash')}</span>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                <div>
                    <span class="sub-cost">${formatCurrency(r.amount)}</span>
                    <span class="sub-cycle">/ ${r.frequency.toLowerCase()}</span>
                </div>
                <div class="sub-meta-row">
                    <span><i class="fa-solid fa-calendar mr-2 text-muted"></i>Next: <strong>${formatDate(r.nextDueDate)}</strong></span>
                    ${dueAlert}
                </div>
                <div class="sub-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.payRecurring(${r.id})">
                        <i class="fa-solid fa-check mr-2"></i> Pay & Advance
                    </button>
                    <button class="action-btn edit" onclick="window.editRecurring(${r.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" onclick="window.confirmDelete('recurring', ${r.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openRecurringModal(sub = null) {
        const titleEl = document.getElementById('recurring-modal-title');
        const submitBtn = document.getElementById('btn-submit-recurring');

        if (sub) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Subscription';
            submitBtn.textContent = 'Update Subscription';
            document.getElementById('recurring-id').value = sub.id;
            document.getElementById('recurring-title').value = sub.title;
            document.getElementById('recurring-amount').value = sub.amount;
            document.getElementById('recurring-frequency').value = sub.frequency;
            document.getElementById('recurring-next-date').value = sub.nextDueDate;
            document.getElementById('recurring-category').value = sub.categoryId || '';
            document.getElementById('recurring-account').value = sub.accountId || '';
            document.getElementById('recurring-status').value = sub.status || 'ACTIVE';
            document.getElementById('recurring-notes').value = sub.notes || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-repeat"></i> Add Subscription / Bill';
            submitBtn.textContent = 'Save Subscription';
            recurringForm.reset();
            document.getElementById('recurring-id').value = '';
            document.getElementById('recurring-next-date').value = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];
        }

        recurringModal.classList.add('show');
    }

    async function handleRecurringSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('recurring-id').value;
        const payload = {
            title: document.getElementById('recurring-title').value,
            amount: parseFloat(document.getElementById('recurring-amount').value),
            frequency: document.getElementById('recurring-frequency').value,
            nextDueDate: document.getElementById('recurring-next-date').value,
            categoryId: document.getElementById('recurring-category').value ? parseInt(document.getElementById('recurring-category').value) : null,
            accountId: document.getElementById('recurring-account').value ? parseInt(document.getElementById('recurring-account').value) : null,
            status: document.getElementById('recurring-status').value,
            notes: document.getElementById('recurring-notes').value
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/recurring-expenses/${id}` : `${API_BASE}/recurring-expenses`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save recurring subscription');

            showToast(isUpdate ? 'Subscription modified!' : 'Subscription established!', 'success');
            recurringModal.classList.remove('show');
            recurringForm.reset();

            loadRecurring();
        } catch (err) {
            console.error('Error saving subscription:', err);
            showToast('Unable to persist subscription plan.', 'danger');
        }
    }

    window.payRecurring = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/recurring-expenses/${id}/pay`, { method: 'POST' });
            if (!res.ok) throw new Error('Payment processing failed');

            showToast('Payment recorded in ledger & next due date rolled forward!', 'success');
            await loadAccounts();
            await loadRecurring();
            if (currentTab === 'overview') loadDashboardStats();
        } catch (err) {
            console.error('Pay subscription failure:', err);
            showToast('Failed to process subscription bill payment.', 'danger');
        }
    };

    /* ==========================================================================
       Savings Goals Controller (CRUD & Contributions)
       ========================================================================== */

    async function loadSavingsGoals() {
        try {
            const res = await fetch(`${API_BASE}/savings-goals`);
            if (!res.ok) throw new Error('Failed to retrieve savings goals');
            savingsGoals = await res.json();
            renderGoalsGrid();
        } catch (err) {
            console.error('Savings goals load error:', err);
            showToast('Unable to load savings goals.', 'danger');
        }
    }

    function renderGoalsGrid() {
        const query = (document.getElementById('goals-search')?.value || '').toLowerCase();
        const grid = document.getElementById('goals-grid');
        if (!grid) return;

        let totalTarget = 0;
        let totalSaved = 0;

        let filtered = savingsGoals.filter(g => {
            const name = (g.goalName || '').toLowerCase();
            const notes = (g.notes || '').toLowerCase();
            return name.includes(query) || notes.includes(query);
        });

        filtered.forEach(g => {
            totalTarget += parseFloat(g.targetAmount || 0);
            totalSaved += parseFloat(g.currentAmount || 0);
        });

        const statSaved = document.getElementById('goals-stat-saved');
        const statTarget = document.getElementById('goals-stat-target');
        if (statSaved) statSaved.textContent = formatCurrency(totalSaved);
        if (statTarget) statTarget.textContent = formatCurrency(totalTarget);

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-box col-span-3">
                    <i class="fa-solid fa-bullseye"></i>
                    <h4>No Savings Goals Established</h4>
                    <p>Create visual savings targets with milestones to achieve your financial dreams.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(g => {
            const card = document.createElement('div');
            card.className = 'goal-card';
            const color = g.color || '#10b981';
            
            let statusBadge = g.status === 'ACHIEVED'
                ? '<span class="badge badge-success"><i class="fa-solid fa-trophy mr-2"></i>ACHIEVED</span>'
                : `<span class="badge badge-primary">${g.priority} PRIORITY</span>`;

            card.innerHTML = `
                <div class="goal-card-header">
                    <div class="goal-name">${escapeHtml(g.goalName)}</div>
                    ${statusBadge}
                </div>
                <div class="goal-progress-wrap">
                    <div class="goal-stats-row">
                        <span>Progress (${g.progressPercentage.toFixed(1)}%)</span>
                        <span>Target: ${formatDate(g.targetDate)}</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width:${g.progressPercentage}%; background:${color};"></div>
                    </div>
                    <div class="goal-stats-row">
                        <span class="goal-current">${formatCurrency(g.currentAmount)}</span>
                        <span class="goal-target">of ${formatCurrency(g.targetAmount)}</span>
                    </div>
                </div>
                <div class="sub-meta-row" style="margin-top:0.25rem;">
                    <span class="text-secondary"><i class="fa-solid fa-piggy-bank mr-2"></i>${escapeHtml(g.linkedAccountName || 'Direct Savings')}</span>
                    <strong class="${g.remainingAmount <= 0 ? 'text-success' : 'text-primary'}">
                        ${g.remainingAmount <= 0 ? 'Goal Reached!' : `${formatCurrency(g.remainingAmount)} left`}
                    </strong>
                </div>
                <div class="goal-footer-actions">
                    <button class="btn btn-success btn-sm" onclick="window.openContributeModal(${g.id}, '${escapeHtml(g.goalName)}')">
                        <i class="fa-solid fa-plus mr-2"></i> Deposit
                    </button>
                    <button class="action-btn edit" onclick="window.editGoal(${g.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" onclick="window.confirmDelete('goal', ${g.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openGoalModal(goal = null) {
        const titleEl = document.getElementById('goal-modal-title');
        const submitBtn = document.getElementById('btn-submit-goal');

        if (goal) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Savings Goal';
            submitBtn.textContent = 'Update Goal';
            document.getElementById('goal-id').value = goal.id;
            document.getElementById('goal-name').value = goal.goalName;
            document.getElementById('goal-target').value = goal.targetAmount;
            document.getElementById('goal-current').value = goal.currentAmount;
            document.getElementById('goal-date').value = goal.targetDate;
            document.getElementById('goal-priority').value = goal.priority;
            document.getElementById('goal-account').value = goal.linkedAccountId || '';
            document.getElementById('goal-color').value = goal.color || '#10b981';
            document.getElementById('goal-notes').value = goal.notes || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-bullseye"></i> Create Savings Goal';
            submitBtn.textContent = 'Save Goal';
            goalForm.reset();
            document.getElementById('goal-id').value = '';
            document.getElementById('goal-date').value = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()).toISOString().split('T')[0];
        }

        goalModal.classList.add('show');
    }

    async function handleGoalSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('goal-id').value;
        const payload = {
            goalName: document.getElementById('goal-name').value,
            targetAmount: parseFloat(document.getElementById('goal-target').value),
            currentAmount: parseFloat(document.getElementById('goal-current').value || 0),
            targetDate: document.getElementById('goal-date').value,
            priority: document.getElementById('goal-priority').value,
            linkedAccountId: document.getElementById('goal-account').value ? parseInt(document.getElementById('goal-account').value) : null,
            color: document.getElementById('goal-color').value,
            notes: document.getElementById('goal-notes').value
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/savings-goals/${id}` : `${API_BASE}/savings-goals`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save savings goal');

            showToast(isUpdate ? 'Savings goal updated!' : 'Savings goal forged!', 'success');
            goalModal.classList.remove('show');
            goalForm.reset();

            loadSavingsGoals();
        } catch (err) {
            console.error('Error saving goal:', err);
            showToast('Unable to persist savings goal.', 'danger');
        }
    }

    window.openContributeModal = (goalId, goalTitle) => {
        document.getElementById('contribute-goal-id').value = goalId;
        document.getElementById('contribute-goal-title').textContent = goalTitle;
        document.getElementById('contribute-amount').value = '';
        contributeModal.classList.add('show');
    };

    async function handleContributeSubmit(e) {
        e.preventDefault();
        const goalId = document.getElementById('contribute-goal-id').value;
        const amount = parseFloat(document.getElementById('contribute-amount').value);

        if (!amount || amount <= 0) {
            showToast('Please enter a valid deposit amount.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/savings-goals/${goalId}/contribute?amount=${amount}`, { method: 'POST' });
            if (!res.ok) throw new Error('Contribution failed');

            showToast(`Deposit of ${formatCurrency(amount)} recorded!`, 'success');
            contributeModal.classList.remove('show');

            await loadAccounts();
            await loadSavingsGoals();
        } catch (err) {
            console.error('Contribution failed:', err);
            showToast('Unable to record goal contribution.', 'danger');
        }
    }

    /* ==========================================================================
       Categories Management Controller (CRUD)
       ========================================================================== */

    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (!res.ok) throw new Error('Failed to retrieve categories');
            categories = await res.json();

            populateCategoryDropdowns();
            renderCategoriesGrid();
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }

    function populateCategoryDropdowns() {
        const selectIds = [
            'expense-category', 'quick-category', 'expense-filter-category',
            'income-category', 'recurring-category', 'budget-category', 'category-parent'
        ];

        selectIds.forEach(id => {
            const selectEl = document.getElementById(id);
            if (!selectEl) return;

            const currentVal = selectEl.value;
            const isFilter = id === 'expense-filter-category';
            const isBudget = id === 'budget-category';
            const isParent = id === 'category-parent';

            selectEl.innerHTML = '';

            if (isFilter) selectEl.innerHTML = '<option value="">All Categories</option>';
            else if (isBudget) selectEl.innerHTML = '<option value="">Overall Monthly Budget</option>';
            else if (isParent) selectEl.innerHTML = '<option value="">None (Top-Level Category)</option>';
            else selectEl.innerHTML = '<option value="" disabled selected>Select Category</option>';

            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.categoryName;
                selectEl.appendChild(opt);
            });

            if (currentVal) selectEl.value = currentVal;
        });
    }

    function renderCategoriesGrid() {
        const query = (document.getElementById('category-search')?.value || '').toLowerCase();
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        const filtered = categories.filter(c => 
            c.categoryName.toLowerCase().includes(query) ||
            (c.categoryDescription || '').toLowerCase().includes(query)
        );

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-box col-span-3">
                    <i class="fa-solid fa-tags"></i>
                    <h4>No Categories Discovered</h4>
                    <p>Start classifying transactions by creating your first expense bucket above.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(c => {
            const card = document.createElement('div');
            card.className = 'content-card category-item-card';
            const color = c.colorCode || '#6366f1';
            const icon = c.icon || 'fa-tag';

            card.innerHTML = `
                <div class="card-header border-none">
                    <div class="category-title-wrapper" style="display:flex; align-items:center; gap:0.75rem;">
                        <div class="cat-icon-badge" style="width:42px; height:42px; border-radius:10px; background:${color}20; color:${color}; display:flex; align-items:center; justify-content:center; font-size:1.15rem;">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <div>
                            <h3 style="margin:0; font-size:1.1rem;">${escapeHtml(c.categoryName)}</h3>
                            <span class="badge" style="font-size:0.65rem; padding:1px 6px; margin-top:2px; background:${color}15; color:${color}; border: 1px solid ${color}35;">
                                ${c.categoryType || 'EXPENSE'}
                            </span>
                        </div>
                    </div>
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editCategory(${c.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('category', ${c.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="text-secondary" style="font-size:0.85rem; margin-bottom:0.75rem;">
                        ${escapeHtml(c.categoryDescription || 'No description provided.')}
                    </p>
                    ${c.parentCategoryName ? `<div style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-sitemap mr-2"></i>Parent: <strong>${escapeHtml(c.parentCategoryName)}</strong></div>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openCategoryModal(cat = null) {
        const titleEl = document.getElementById('category-modal-title');
        const submitBtn = document.getElementById('btn-submit-category');

        if (cat) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Category';
            submitBtn.textContent = 'Update Category';
            document.getElementById('category-id').value = cat.id;
            document.getElementById('category-name').value = cat.categoryName;
            document.getElementById('category-description').value = cat.categoryDescription || '';
            document.getElementById('category-type').value = cat.categoryType || 'EXPENSE';
            document.getElementById('category-icon').value = cat.icon || 'fa-tag';
            document.getElementById('category-color').value = cat.colorCode || '#6366f1';
            document.getElementById('category-parent').value = cat.parentCategoryId || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-tag"></i> Add New Category';
            submitBtn.textContent = 'Save Category';
            categoryForm.reset();
            document.getElementById('category-id').value = '';
        }

        categoryModal.classList.add('show');
    }

    async function handleCategorySubmit(e) {
        e.preventDefault();
        const id = document.getElementById('category-id').value;
        const payload = {
            categoryName: document.getElementById('category-name').value,
            categoryDescription: document.getElementById('category-description').value,
            categoryType: document.getElementById('category-type').value,
            icon: document.getElementById('category-icon').value,
            colorCode: document.getElementById('category-color').value,
            parentCategoryId: document.getElementById('category-parent').value ? parseInt(document.getElementById('category-parent').value) : null
        };

        const isUpdate = Boolean(id);
        const url = isUpdate ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Category persistence failed');

            showToast(isUpdate ? 'Category updated successfully!' : 'Category created successfully!', 'success');
            categoryModal.classList.remove('show');
            categoryForm.reset();

            await loadCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            showToast('Unable to persist category.', 'danger');
        }
    }

    /* ==========================================================================
       Budgets Management Controller (CRUD)
       ========================================================================== */

    async function loadBudgets() {
        try {
            const res = await fetch(`${API_BASE}/budgets`);
            if (!res.ok) throw new Error('Failed to fetch budgets');
            budgets = await res.json();
            renderBudgetsGrid();
        } catch (err) {
            console.error('Error fetching budgets:', err);
            showToast('Unable to load budget plans.', 'danger');
        }
    }

    function renderBudgetsGrid() {
        const grid = document.getElementById('budgets-grid');
        const filterYear = parseInt(document.getElementById('budget-filter-year')?.value || currentYear);
        if (!grid) return;

        const filtered = budgets.filter(b => b.year === filterYear);
        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-box col-span-3">
                    <i class="fa-solid fa-sliders"></i>
                    <h4>No Budget Caps for ${filterYear}</h4>
                    <p>Establish monthly spend caps above to track real-time utilization.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(b => {
            const card = document.createElement('div');
            card.className = 'content-card budget-item-card';

            card.innerHTML = `
                <div class="card-header border-none">
                    <div>
                        <span class="budget-badge-pill">${b.year}</span>
                        <h3 class="budget-month-title">${escapeHtml(b.month)}</h3>
                        <small class="badge badge-info" style="margin-top:4px;">${escapeHtml(b.categoryName || 'Overall Budget')}</small>
                    </div>
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editBudget(${b.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('budget', ${b.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <span class="stat-label">Allocated Cap</span>
                    <h2 class="budget-card-amount">${formatCurrency(b.monthlyLimit)}</h2>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.5rem;">
                        <span>Alert Threshold: <strong>${b.warningThresholdPercent || 80}%</strong></span>
                    </div>
                    ${b.notes ? `<p class="text-muted" style="font-size:0.8rem; margin-top:0.25rem;">${escapeHtml(b.notes)}</p>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openBudgetModal(b = null) {
        const titleEl = document.getElementById('budget-modal-title');
        const submitBtn = document.getElementById('btn-submit-budget');

        if (b) {
            titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Budget Cap';
            submitBtn.textContent = 'Update Budget';
            document.getElementById('budget-id').value = b.id;
            document.getElementById('budget-limit').value = b.monthlyLimit;
            document.getElementById('budget-month').value = b.month;
            document.getElementById('budget-year').value = b.year;
            document.getElementById('budget-category').value = b.categoryId || '';
            document.getElementById('budget-threshold').value = b.warningThresholdPercent || 80;
            document.getElementById('budget-notes').value = b.notes || '';
        } else {
            titleEl.innerHTML = '<i class="fa-solid fa-sliders"></i> Set Monthly Limit';
            submitBtn.textContent = 'Save Budget';
            budgetForm.reset();
            document.getElementById('budget-id').value = '';
            document.getElementById('budget-month').value = currentMonthName;
            document.getElementById('budget-year').value = currentYear;
            document.getElementById('budget-threshold').value = 80;
        }

        budgetModal.classList.add('show');
    }

    async function handleBudgetSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('budget-id').value;
        const payload = {
            monthlyLimit: parseFloat(document.getElementById('budget-limit').value),
            month: document.getElementById('budget-month').value,
            year: parseInt(document.getElementById('budget-year').value),
            categoryId: document.getElementById('budget-category').value ? parseInt(document.getElementById('budget-category').value) : null,
            warningThresholdPercent: parseFloat(document.getElementById('budget-threshold').value || 80),
            notes: document.getElementById('budget-notes').value
        };

        if (id) payload.id = parseInt(id);

        const isUpdate = Boolean(id);
        const url = `${API_BASE}/budgets`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Budget persistence rejected');

            showToast(isUpdate ? 'Budget cap updated!' : 'Monthly budget configured!', 'success');
            budgetModal.classList.remove('show');
            budgetForm.reset();

            if (currentTab === 'overview') loadDashboardStats();
            else loadBudgets();

        } catch (err) {
            console.error('Error saving budget:', err);
            showToast('Unable to persist budget settings.', 'danger');
        }
    }

    /* ==========================================================================
       Global Window Actions & Deletions Flows
       ========================================================================== */

    window.editExpense = (id) => {
        const exp = expenses.find(e => e.id === id);
        if (exp) openExpenseModal(exp);
    };

    window.editIncome = (id) => {
        const inc = incomes.find(i => i.id === id);
        if (inc) openIncomeModal(inc);
    };

    window.editAccount = (id) => {
        const acc = accounts.find(a => a.id === id);
        if (acc) openAccountModal(acc);
    };

    window.editRecurring = (id) => {
        const sub = recurringExpenses.find(r => r.id === id);
        if (sub) openRecurringModal(sub);
    };

    window.editGoal = (id) => {
        const g = savingsGoals.find(x => x.id === id);
        if (g) openGoalModal(g);
    };

    window.editCategory = (id) => {
        const cat = categories.find(c => c.id === id);
        if (cat) openCategoryModal(cat);
    };

    window.editBudget = (id) => {
        const b = budgets.find(x => x.id === id);
        if (b) openBudgetModal(b);
    };

    window.confirmDelete = (type, id) => {
        deleteTarget = { type, id };
        deleteModal.classList.add('show');
    };

    async function executeDeletion() {
        if (!deleteTarget) return;

        const { type, id } = deleteTarget;
        let url = '';

        if (type === 'expense') url = `${API_BASE}/expenses/${id}`;
        else if (type === 'income') url = `${API_BASE}/incomes/${id}`;
        else if (type === 'account') url = `${API_BASE}/accounts/${id}`;
        else if (type === 'recurring') url = `${API_BASE}/recurring-expenses/${id}`;
        else if (type === 'goal') url = `${API_BASE}/savings-goals/${id}`;
        else if (type === 'category') url = `${API_BASE}/categories/${id}`;
        else if (type === 'budget') url = `${API_BASE}/budgets/${id}`;

        try {
            const res = await fetch(url, { method: 'DELETE' });
            
            if (!res.ok) {
                if (type === 'category') {
                    showToast('Cannot delete category. Ensure it contains no active expenses first!', 'warning');
                } else {
                    throw new Error('API delete call rejected');
                }
                deleteModal.classList.remove('show');
                return;
            }

            showToast(`${capitalize(type)} successfully deleted.`, 'success');
            deleteModal.classList.remove('show');

            if (type === 'expense') {
                await loadAccounts();
                if (currentTab === 'overview') loadDashboardStats();
                else loadExpenses();
            } else if (type === 'income') {
                await loadAccounts();
                if (currentTab === 'overview') loadDashboardStats();
                else loadIncomes();
            } else if (type === 'account') {
                loadAccounts();
            } else if (type === 'recurring') {
                loadRecurring();
            } else if (type === 'goal') {
                loadSavingsGoals();
            } else if (type === 'category') {
                loadCategories();
            } else if (type === 'budget') {
                if (currentTab === 'overview') loadDashboardStats();
                else loadBudgets();
            }

        } catch (err) {
            console.error('Deletion failure:', err);
            showToast('Unable to execute deletion command.', 'danger');
            deleteModal.classList.remove('show');
        }
    }

    /* ==========================================================================
       Analytics & Chart.js Visualizations
       ========================================================================== */

    async function generateMonthlyReport() {
        const month = document.getElementById('report-month-select')?.value || currentMonthName;
        const year = parseInt(document.getElementById('report-year-select')?.value || currentYear);

        try {
            const res = await fetch(`${API_BASE}/analytics/monthly-report?month=${month}&year=${year}`);
            if (!res.ok) throw new Error('Failed to generate monthly analytics');
            const data = await res.json();

            document.getElementById('report-total-spent').textContent = formatCurrency(data.totalSpent);
            document.getElementById('report-transaction-count').textContent = data.expenseCount;
            document.getElementById('report-active-month').textContent = `For ${month} ${year}`;

            const avg = data.expenseCount > 0 ? (data.totalSpent / data.expenseCount) : 0;
            document.getElementById('report-avg-spend').textContent = formatCurrency(avg);

            document.getElementById('report-results').style.display = 'block';

            renderCategoryDistributionChart(month, year);

        } catch (err) {
            console.error('Error generating report:', err);
            showToast('Report generation encountered an issue.', 'danger');
        }
    }

    async function renderCategoryDistributionChart(month, year) {
        try {
            const res = await fetch(`${API_BASE}/expenses`);
            if (!res.ok) return;
            const allExpenses = await res.json();

            const monthExpenses = allExpenses.filter(e => {
                if (!e.expenseDate) return false;
                const d = new Date(e.expenseDate);
                return months[d.getMonth()] === month && d.getFullYear() === year;
            });

            const catTotals = {};
            monthExpenses.forEach(e => {
                const name = e.categoryName || getCategoryName(e.categoryId);
                catTotals[name] = (catTotals[name] || 0) + parseFloat(e.amount);
            });

            const labels = Object.keys(catTotals);
            const values = Object.values(catTotals);

            if (categoryChart) categoryChart.destroy();

            const canvas = document.getElementById('categoryDistributionChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e', '#a855f7'];

            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels.length > 0 ? labels : ['No Data'],
                    datasets: [{
                        data: values.length > 0 ? values : [1],
                        backgroundColor: values.length > 0 ? colors.slice(0, labels.length) : ['#2d2d44'],
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#f3f4f6',
                                font: { family: 'Plus Jakarta Sans', size: 12 },
                                padding: 15
                            }
                        }
                    },
                    cutout: '70%'
                }
            });

        } catch (e) {
            console.error('Error drawing doughnut chart:', e);
        }
    }

    async function loadAnnualTrend(year) {
        try {
            const res = await fetch(`${API_BASE}/analytics/trend?year=${year}`);
            if (!res.ok) throw new Error('Annual trend analytics error');
            const data = await res.json();

            const trendMap = {};
            months.forEach(m => trendMap[m] = 0);
            data.forEach(t => {
                trendMap[t.month] = t.totalSpent;
            });

            const values = months.map(m => trendMap[m]);

            if (trendChart) trendChart.destroy();

            const ctx = document.getElementById('annualSpendingTrendChart').getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

            trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Total Spend ($)',
                        data: values,
                        borderColor: '#8b5cf6',
                        borderWidth: 3,
                        pointBackgroundColor: '#8b5cf6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.35,
                        fill: true,
                        backgroundColor: gradient
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#9ca3af',
                                font: { family: 'Plus Jakarta Sans' }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#9ca3af',
                                font: { family: 'Plus Jakarta Sans' }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

        } catch (err) {
            console.error('Annual trend loading error:', err);
        }
    }

    /* ==========================================================================
       Miscellaneous Helpers
       ========================================================================== */

    function getCategoryName(catId) {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.categoryName : 'Uncategorized';
    }

    function formatCurrency(val) {
        if (val === null || val === undefined) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(val);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function capitalize(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
