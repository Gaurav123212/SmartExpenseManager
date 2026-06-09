/**
 * SmartExpenseTracker — Premium Frontend Integration Script
 * Single Page Application Controller utilizing Chart.js & Fetch API
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine API server URL. If running standalone (e.g. VS Code Live Server on port 5500),
    // redirect to local Spring Boot backend. Otherwise, use same origin.
    const API_BASE = window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '3000'
        ? 'http://localhost:8081'
        : window.location.origin;

    console.log('SmartExpenseTracker API Endpoint Configured to:', API_BASE);

    // State Variables
    let categories = [];
    let expenses = [];
    let budgets = [];
    let currentTab = 'overview';
    let deleteTarget = null; // { type: 'expense'|'category'|'budget', id: number }
    
    // Chart References (needed to destroy/re-create them cleanly)
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

    // DOM Elements - Modals & Forms
    const expenseModal = document.getElementById('expense-modal');
    const categoryModal = document.getElementById('category-modal');
    const budgetModal = document.getElementById('budget-modal');
    const deleteModal = document.getElementById('delete-modal');

    // Forms
    const expenseForm = document.getElementById('expense-form');
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

        // Populate month select inputs
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

        // Populate year select inputs
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

        // Set default date picker values to today
        const dateInputs = ['quick-date', 'expense-date'];
        const dateString = today.toISOString().split('T')[0];
        dateInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = dateString;
        });
    }

    async function initApp() {
        // Load Categories first because Expenses depend on category IDs for rendering Names
        await loadCategories();
        
        // Setup Event Listeners
        setupEventListeners();

        // Load Initial Dashboard Metrics
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
        if (btnQuickExpense) {
            btnQuickExpense.addEventListener('click', () => openExpenseModal());
        }
        
        const btnAddExpense = document.getElementById('btn-add-expense');
        if (btnAddExpense) {
            btnAddExpense.addEventListener('click', () => openExpenseModal());
        }

        const btnAddCategory = document.getElementById('btn-add-category');
        if (btnAddCategory) {
            btnAddCategory.addEventListener('click', () => openCategoryModal());
        }

        const btnAddBudget = document.getElementById('btn-add-budget');
        if (btnAddBudget) {
            btnAddBudget.addEventListener('click', () => openBudgetModal());
        }

        // 4. Modal Closing Actions (Close Icon & Cancel Button)
        setupModalClose('expense-modal', 'btn-close-expense-modal', 'btn-cancel-expense');
        setupModalClose('category-modal', 'btn-close-category-modal', 'btn-cancel-category');
        setupModalClose('budget-modal', 'btn-close-budget-modal', 'btn-cancel-budget');
        setupModalClose('delete-modal', 'btn-close-delete-modal', 'btn-cancel-delete');

        // 5. Forms Submissions
        if (quickExpenseForm) {
            quickExpenseForm.addEventListener('submit', handleQuickExpenseSubmit);
        }
        if (expenseForm) {
            expenseForm.addEventListener('submit', handleExpenseSubmit);
        }
        if (categoryForm) {
            categoryForm.addEventListener('submit', handleCategorySubmit);
        }
        if (budgetForm) {
            budgetForm.addEventListener('submit', handleBudgetSubmit);
        }
        
        // 6. Delete Action Confirmation
        const btnConfirmDelete = document.getElementById('btn-confirm-delete');
        if (btnConfirmDelete) {
            btnConfirmDelete.addEventListener('click', executeDeletion);
        }

        // 7. Interactive Filtering & Sorting Keyups/Changes
        const expenseSearch = document.getElementById('expense-search');
        if (expenseSearch) expenseSearch.addEventListener('input', renderExpensesTable);

        const expenseFilterCat = document.getElementById('expense-filter-category');
        if (expenseFilterCat) expenseFilterCat.addEventListener('change', renderExpensesTable);

        const expenseSort = document.getElementById('expense-sort');
        if (expenseSort) expenseSort.addEventListener('change', renderExpensesTable);

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
        const icon = document.getElementById(closeIconId);
        const btn = document.getElementById(cancelBtnId);

        const close = () => {
            modal.classList.remove('show');
        };

        if (icon) icon.addEventListener('click', close);
        if (btn) btn.addEventListener('click', close);
        
        // Close modal when clicking on background backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }

    /* ==========================================================================
       Tab Navigation Controller
       ========================================================================== */

    function switchTab(tabId) {
        currentTab = tabId;

        // Toggle Sidebar Active State
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Toggle Active Content Panel
        tabContents.forEach(content => {
            if (content.getAttribute('id') === `tab-${tabId}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Update Title & Load fresh data for respective tabs
        switch (tabId) {
            case 'overview':
                pageTitle.textContent = 'Financial Overview';
                pageSubtitle.textContent = 'Track, analyze, and optimize your spending habits in real-time.';
                loadDashboardStats();
                break;
            case 'expenses':
                pageTitle.textContent = 'Transaction Ledger';
                pageSubtitle.textContent = 'Add, modify, and filter your historical expenditure logs.';
                loadExpenses();
                break;
            case 'categories':
                pageTitle.textContent = 'Spending Categories';
                pageSubtitle.textContent = 'Set up custom buckets to classify your expense outputs.';
                loadCategories();
                break;
            case 'budgets':
                pageTitle.textContent = 'Monthly Budget Planner';
                pageSubtitle.textContent = 'Establish monthly spend caps to cultivate strong financial hygiene.';
                loadBudgets();
                break;
            case 'analytics':
                pageTitle.textContent = 'Analytics & Reports';
                pageSubtitle.textContent = 'Deep dive into annual trend curves and download breakdown charts.';
                // Default trigger annual trend & monthly report for current month
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
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Animate Out & Delete
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4000);
    }

    /* ==========================================================================
       Overview & Dashboard Integrations
       ========================================================================= */

    async function loadDashboardStats() {
        const month = document.getElementById('dashboard-month-select').value;
        const year = parseInt(document.getElementById('dashboard-year-select').value);

        try {
            // 1. Fetch budget status from Analytics API
            const res = await fetch(`${API_BASE}/analytics/budget-status?month=${month}&year=${year}`);
            
            // Check if backend returned an error (e.g. Budget not found)
            if (!res.ok) {
                // If it's a 500 or 400 (likely budget not found)
                renderEmptyBudgetDashboard(month, year);
                return;
            }

            const data = await res.json();
            
            // Populate Stat Cards
            document.getElementById('stat-total-spent').textContent = formatCurrency(data.spent);
            document.getElementById('stat-active-budget').textContent = formatCurrency(data.budget);
            
            const remainingEl = document.getElementById('stat-remaining-balance');
            remainingEl.textContent = formatCurrency(data.remaining);
            
            // Color coding remaining card based on standing
            const remainingCard = remainingEl.closest('.stat-card');
            if (data.remaining < 0) {
                remainingCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                remainingEl.style.color = 'var(--danger)';
            } else {
                remainingCard.style.borderColor = 'var(--border-glass)';
                remainingEl.style.color = 'var(--success)';
            }

            // Set up Gauge Circle
            renderGaugeRing(data.percentageUsed, data.status, data.spent, data.remaining);
            
            // Toggle Budget Exceeded Banner Alert
            const banner = document.getElementById('budget-status-banner');
            const bannerText = document.getElementById('budget-banner-text');
            if (data.percentageUsed >= 100) {
                banner.style.display = 'flex';
                banner.style.background = 'var(--danger-bg)';
                banner.style.borderColor = 'var(--danger-border)';
                banner.style.color = 'var(--danger)';
                bannerText.textContent = `ALERT: You have exceeded your monthly limit for ${month} by ${formatCurrency(Math.abs(data.remaining))}!`;
            } else if (data.percentageUsed >= 85) {
                banner.style.display = 'flex';
                banner.style.background = 'var(--warning-bg)';
                banner.style.borderColor = 'var(--warning-border)';
                banner.style.color = 'var(--warning)';
                bannerText.textContent = `WARNING: You have utilized ${data.percentageUsed}% of your designated budget limit for ${month}!`;
            } else {
                banner.style.display = 'none';
            }

        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            renderEmptyBudgetDashboard(month, year);
        }

        // Fetch recent expenses to show on the dashboard
        await loadRecentExpenses(month, year);
    }

    function renderEmptyBudgetDashboard(month, year) {
        // Reset Stat Cards to Safe Defaults
        document.getElementById('stat-total-spent').textContent = '$0.00';
        document.getElementById('stat-active-budget').textContent = '$0.00';
        
        const remainingEl = document.getElementById('stat-remaining-balance');
        remainingEl.textContent = '$0.00';
        remainingEl.style.color = 'var(--text-primary)';
        remainingEl.closest('.stat-card').style.borderColor = 'var(--border-glass)';

        // Render circular progress gauge as 0%
        renderGaugeRing(0, 'NO ACTIVE BUDGET', 0, 0);

        // Display banner prompting setting a limit
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
        
        // Cap percent drawing to 100 so ring doesn't overflow backwards
        const drawPercent = Math.min(Math.max(percent, 0), 100);
        const offset = circumference - (drawPercent / 100) * circumference;
        ring.style.strokeDashoffset = offset;

        // Change color gradients dynamically based on percentage
        const svgGradStop1 = document.querySelector('#paint0_linear stop:nth-child(1)');
        const svgGradStop2 = document.querySelector('#paint0_linear stop:nth-child(2)');
        const statusText = document.getElementById('utilization-status');

        if (percent >= 100) {
            svgGradStop1.setAttribute('stop-color', '#ef4444');
            svgGradStop2.setAttribute('stop-color', '#f43f5e');
            statusText.textContent = 'Exceeded';
            statusText.style.color = 'var(--danger)';
        } else if (percent >= 85) {
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
            
            // Filter expenses strictly belonging to specified month & year
            const filtered = data.filter(e => {
                if (!e.expenseDate) return false;
                const d = new Date(e.expenseDate);
                const expMonth = months[d.getMonth()];
                const expYear = d.getFullYear();
                return expMonth === month && expYear === year;
            });

            // Sort by Date descending (newest first)
            filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));

            document.getElementById('stat-expense-count').textContent = filtered.length;

            const tbody = document.querySelector('#recent-expenses-table tbody');
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">No logged transactions found for ${month} ${year}.</td>
                    </tr>
                `;
                return;
            }

            // Render top 5 recent expenses
            filtered.slice(0, 5).forEach(e => {
                const tr = document.createElement('tr');
                const catName = getCategoryName(e.categoryId);
                
                tr.innerHTML = `
                    <td><strong>${escapeHtml(e.name)}</strong></td>
                    <td><span class="badge badge-category">${escapeHtml(catName)}</span></td>
                    <td>${formatDate(e.expenseDate)}</td>
                    <td class="text-muted">${escapeHtml(e.description || '—')}</td>
                    <td><span class="badge badge-amount">${formatCurrency(e.amount)}</span></td>
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
        const sortBy = document.getElementById('expense-sort')?.value;

        const tableBody = document.querySelector('#expenses-table tbody');
        if (!tableBody) return;

        // Apply dynamic UI Filtering
        let filtered = expenses.filter(e => {
            const nameMatch = e.name.toLowerCase().includes(query);
            const descMatch = (e.description || '').toLowerCase().includes(query);
            const catMatch = filterCat ? String(e.categoryId) === filterCat : true;
            return (nameMatch || descMatch) && catMatch;
        });

        // Apply Sorting
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
                    <td colspan="6" class="text-center text-muted py-4">No matching transactions found. Add a new expense!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach(e => {
            const tr = document.createElement('tr');
            const catName = getCategoryName(e.categoryId);
            
            tr.innerHTML = `
                <td><strong>${escapeHtml(e.name)}</strong></td>
                <td><span class="badge badge-category">${escapeHtml(catName)}</span></td>
                <td>${formatDate(e.expenseDate)}</td>
                <td class="text-muted">${escapeHtml(e.description || '—')}</td>
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

    async function handleExpenseSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('expense-id').value;
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const expenseDate = document.getElementById('expense-date').value;
        const categoryId = parseInt(document.getElementById('expense-category').value);
        const description = document.getElementById('expense-description').value;

        const payload = { name, amount, expenseDate, categoryId, description };

        try {
            let res;
            if (id) {
                // Update
                res = await fetch(`${API_BASE}/expenses/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                res = await fetch(`${API_BASE}/expenses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error('Transaction submission failed');
            
            showToast(id ? 'Transaction updated successfully.' : 'New transaction logged.', 'success');
            expenseModal.classList.remove('show');
            expenseForm.reset();

            // Refresh Active Context
            if (currentTab === 'overview') loadDashboardStats();
            else loadExpenses();

        } catch (err) {
            console.error('Error saving expense:', err);
            showToast('Failed to write expense log. Try again.', 'danger');
        }
    }

    async function handleQuickExpenseSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('quick-name').value;
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const expenseDate = document.getElementById('quick-date').value;
        const categoryId = parseInt(document.getElementById('quick-category').value);
        const description = document.getElementById('quick-description').value;

        const payload = { name, amount, expenseDate, categoryId, description };

        try {
            const res = await fetch(`${API_BASE}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('API rejection');

            showToast('Transaction logged successfully!', 'success');
            quickExpenseForm.reset();
            
            // Re-apply today's date placeholder
            document.getElementById('quick-date').value = today.toISOString().split('T')[0];

            loadDashboardStats();

        } catch (err) {
            console.error('Quick submit error:', err);
            showToast('Unable to log quick transaction.', 'danger');
        }
    }

    // Modal Edit Pre-fill
    window.editExpense = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/expenses/${id}`);
            if (!res.ok) throw new Error('Target not found');
            const data = await res.json();

            // Pre-fill Forms
            document.getElementById('expense-id').value = data.id;
            document.getElementById('expense-name').value = data.name;
            document.getElementById('expense-amount').value = data.amount;
            document.getElementById('expense-date').value = data.expenseDate;
            document.getElementById('expense-category').value = data.categoryId;
            document.getElementById('expense-description').value = data.description || '';

            document.getElementById('expense-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Transaction Details`;
            document.getElementById('btn-submit-expense').textContent = 'Update Expense';

            expenseModal.classList.add('show');
        } catch (err) {
            console.error('Error fetching edit detail:', err);
            showToast('Could not load transaction information.', 'danger');
        }
    };

    function openExpenseModal() {
        document.getElementById('expense-id').value = '';
        expenseForm.reset();
        document.getElementById('expense-date').value = today.toISOString().split('T')[0];
        document.getElementById('expense-modal-title').innerHTML = `<i class="fa-solid fa-receipt"></i> Add New Expense`;
        document.getElementById('btn-submit-expense').textContent = 'Save Expense';
        expenseModal.classList.add('show');
    }

    /* ==========================================================================
       Category Module Integrations (CRUD)
       ========================================================================== */

    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (!res.ok) throw new Error('Failed to retrieve categories');
            categories = await res.json();

            // Update selectors inside UI
            populateCategorySelectors();

            if (currentTab === 'categories') {
                renderCategoriesGrid();
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            showToast('Failed to sync spending categories.', 'danger');
        }
    }

    function populateCategorySelectors() {
        const selects = ['quick-category', 'expense-category', 'expense-filter-category'];
        
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const selectedValue = el.value; // Cache selections
            el.innerHTML = '';

            // Filter dropdown includes "All Categories" choice
            if (id === 'expense-filter-category') {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'All Categories';
                el.appendChild(opt);
            } else {
                const opt = document.createElement('option');
                opt.value = '';
                opt.disabled = true;
                opt.selected = true;
                opt.textContent = 'Select Category';
                el.appendChild(opt);
            }

            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.categoryName;
                el.appendChild(opt);
            });

            // Restore selection if it existed prior
            if (selectedValue) el.value = selectedValue;
        });
    }

    function renderCategoriesGrid() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        const query = document.getElementById('category-search').value.toLowerCase();
        
        // Filter categories list
        const filtered = categories.filter(c => {
            return c.categoryName.toLowerCase().includes(query) || 
                   (c.categoryDescription || '').toLowerCase().includes(query);
        });

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="content-card col-span-3 text-center py-4 text-muted">
                    No matching categories found. Create a new one to classify expenses!
                </div>
            `;
            return;
        }

        filtered.forEach(c => {
            const card = document.createElement('div');
            card.className = 'category-card';
            
            card.innerHTML = `
                <div class="category-card-header">
                    <div class="category-card-icon">
                        <i class="fa-solid fa-tag"></i>
                    </div>
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editCategory(${c.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('category', ${c.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div>
                    <h4>${escapeHtml(c.categoryName)}</h4>
                    <p>${escapeHtml(c.categoryDescription || 'No description provided.')}</p>
                </div>
                <div class="category-card-footer">
                    <span class="category-stats-label">Ident: #${c.id}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async function handleCategorySubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('category-id').value;
        const categoryName = document.getElementById('category-name').value;
        const categoryDescription = document.getElementById('category-description').value;

        const payload = { categoryName, categoryDescription };

        try {
            let res;
            if (id) {
                res = await fetch(`${API_BASE}/categories/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error('API submission error');

            showToast(id ? 'Category updated.' : 'Category created successfully.', 'success');
            categoryModal.classList.remove('show');
            categoryForm.reset();
            
            // Reload category registers
            await loadCategories();

        } catch (err) {
            console.error('Error writing category:', err);
            showToast('Unable to complete category operation.', 'danger');
        }
    }

    window.editCategory = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            document.getElementById('category-id').value = data.id;
            document.getElementById('category-name').value = data.categoryName;
            document.getElementById('category-description').value = data.categoryDescription || '';

            document.getElementById('category-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Category`;
            document.getElementById('btn-submit-category').textContent = 'Update Category';

            categoryModal.classList.add('show');

        } catch (err) {
            console.error('Error getting category:', err);
            showToast('Could not fetch category profile.', 'danger');
        }
    };

    function openCategoryModal() {
        document.getElementById('category-id').value = '';
        categoryForm.reset();
        document.getElementById('category-modal-title').innerHTML = `<i class="fa-solid fa-tag"></i> Add New Category`;
        document.getElementById('btn-submit-category').textContent = 'Save Category';
        categoryModal.classList.add('show');
    }

    /* ==========================================================================
       Budgets Planners (CRUD)
       ========================================================================== */

    async function loadBudgets() {
        try {
            const res = await fetch(`${API_BASE}/budgets`);
            if (!res.ok) throw new Error('Ledger failure');
            budgets = await res.json();

            // Setup Year filter dropdown
            populateBudgetYearFilter();
            renderBudgetsGrid();

        } catch (err) {
            console.error('Budget load error:', err);
            showToast('Failed to load budget planners.', 'danger');
        }
    }

    function populateBudgetYearFilter() {
        const filter = document.getElementById('budget-filter-year');
        if (!filter) return;

        const cached = filter.value;
        filter.innerHTML = '<option value="">All Years</option>';
        
        // Read unique years from budget list
        const years = [...new Set(budgets.map(b => b.year))].sort((a,b) => b-a);
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            filter.appendChild(opt);
        });

        if (cached) filter.value = cached;
    }

    async function renderBudgetsGrid() {
        const grid = document.getElementById('budgets-grid');
        if (!grid) return;

        const yearFilter = document.getElementById('budget-filter-year').value;
        const filtered = yearFilter ? budgets.filter(b => String(b.year) === yearFilter) : budgets;

        // Sort by year desc, then month order
        filtered.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return months.indexOf(b.month) - months.indexOf(a.month);
        });

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="content-card col-span-3 text-center py-4 text-muted">
                    No budget planners set up. Create one to limit spending alerts!
                </div>
            `;
            return;
        }

        // Fetch all expenses to dynamically calculate current spending totals for each budget card
        let allExpenses = [];
        try {
            const res = await fetch(`${API_BASE}/expenses`);
            if (res.ok) allExpenses = await res.json();
        } catch (e) {
            console.error('Failed to pre-fetch expenses for card progress calculations:', e);
        }

        filtered.forEach(b => {
            // Calculate sum of expenses logged inside this budget period (Month & Year)
            const spent = allExpenses.filter(e => {
                if (!e.expenseDate) return false;
                const d = new Date(e.expenseDate);
                return months[d.getMonth()] === b.month && d.getFullYear() === b.year;
            }).reduce((sum, e) => sum + e.amount, 0);

            const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
            const remaining = b.monthlyLimit - spent;

            let statusClass = 'active'; // green
            let statusText = 'Healthy';
            let progressClass = '';

            if (percentage >= 100) {
                statusClass = 'danger';
                statusText = 'Exceeded';
                progressClass = 'exceeded';
            } else if (percentage >= 85) {
                statusClass = 'warning';
                statusText = 'Limit Near';
            }

            const card = document.createElement('div');
            card.className = 'budget-card';
            
            card.innerHTML = `
                <div class="budget-card-header">
                    <div class="budget-period">
                        <span class="year">${b.year}</span>
                        <h4>${b.month}</h4>
                    </div>
                    <div class="budget-card-limit">
                        <span>Limit Limit</span>
                        <h3>${formatCurrency(b.monthlyLimit)}</h3>
                    </div>
                </div>
                <div class="budget-card-progress">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-progress-labels">
                        <span>Spent: <strong>${formatCurrency(spent)}</strong></span>
                        <span>${Math.round(percentage)}% used</span>
                    </div>
                </div>
                <div class="budget-card-status">
                    <span class="budget-status-tag ${statusClass}">${statusText}</span>
                    <div class="action-btn-group">
                        <button class="action-btn edit" onclick="window.editBudget(${b.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" onclick="window.confirmDelete('budget', ${b.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async function handleBudgetSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('budget-id').value;
        const monthlyLimit = parseFloat(document.getElementById('budget-limit').value);
        const month = document.getElementById('budget-month').value;
        const year = parseInt(document.getElementById('budget-year').value);

        const payload = { monthlyLimit, month, year };
        if (id) payload.id = parseInt(id);

        try {
            let res;
            if (id) {
                res = await fetch(`${API_BASE}/budgets`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE}/budgets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error('API budget rejected');

            showToast(id ? 'Budget limit updated.' : 'Budget limit active.', 'success');
            budgetModal.classList.remove('show');
            budgetForm.reset();

            // Refresh Contexts
            if (currentTab === 'overview') loadDashboardStats();
            else loadBudgets();

        } catch (err) {
            console.error('Error saving budget plan:', err);
            showToast('Unable to complete budget registration.', 'danger');
        }
    }

    window.editBudget = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/budgets/${id}`);
            if (!res.ok) throw new Error('Endpoint failure');
            const data = await res.json();

            document.getElementById('budget-id').value = data.id;
            document.getElementById('budget-limit').value = data.monthlyLimit;
            document.getElementById('budget-month').value = data.month;
            document.getElementById('budget-year').value = data.year;

            document.getElementById('budget-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Modify Budget Limit`;
            document.getElementById('btn-submit-budget').textContent = 'Update Budget';

            budgetModal.classList.add('show');

        } catch (err) {
            console.error('Error loading budget form:', err);
            showToast('Failed to pull budget planner detail.', 'danger');
        }
    };

    function openBudgetModal() {
        document.getElementById('budget-id').value = '';
        budgetForm.reset();
        document.getElementById('budget-month').value = currentMonthName;
        document.getElementById('budget-year').value = currentYear;
        document.getElementById('budget-modal-title').innerHTML = `<i class="fa-solid fa-sliders"></i> Set Monthly Limit`;
        document.getElementById('btn-submit-budget').textContent = 'Save Budget';
        budgetModal.classList.add('show');
    }

    /* ==========================================================================
       Reports & Annual Trends Analysis
       ========================================================================== */

    async function generateMonthlyReport() {
        const month = document.getElementById('report-month-select').value;
        const year = parseInt(document.getElementById('report-year-select').value);

        try {
            // 1. Fetch Monthly general details
            const resReport = await fetch(`${API_BASE}/analytics/monthly-report?month=${month}&year=${year}`);
            if (!resReport.ok) throw new Error('Monthly report retrieval failed');
            const reportData = await resReport.json();

            // Show Results Container Panel
            const resultsBox = document.getElementById('report-results');
            resultsBox.style.display = 'block';

            const total = reportData.totalSpent || 0;
            const count = reportData.expenseCount || 0;
            const avg = count > 0 ? (total / count) : 0;

            document.getElementById('report-total-spent').textContent = formatCurrency(total);
            document.getElementById('report-transaction-count').textContent = count;
            document.getElementById('report-avg-spend').textContent = formatCurrency(avg);
            document.getElementById('report-active-month').textContent = `For ${month} ${year}`;

            // 2. Fetch active monthly budget limit (to compute projection comparison)
            let limitVal = 0;
            try {
                const resBudget = await fetch(`${API_BASE}/analytics/budget-status?month=${month}&year=${year}`);
                if (resBudget.ok) {
                    const budgetData = await resBudget.json();
                    limitVal = budgetData.budget || 0;
                }
            } catch (e) {
                // Graceful bypass: Budget might not exist
            }

            // 3. Render Category Distribution chart for that period
            await renderCategoryDistributionChart(month, year);

        } catch (err) {
            console.error('Error generating report:', err);
            showToast('Unable to compile reports for selected timeframe.', 'danger');
        }
    }


    async function renderCategoryDistributionChart(month, year) {
        try {
            // Retrieve all expenses of selected period
            const res = await fetch(`${API_BASE}/expenses`);
            if (!res.ok) return;
            const data = await res.json();

            const periodExpenses = data.filter(e => {
                if (!e.expenseDate) return false;
                const d = new Date(e.expenseDate);
                return months[d.getMonth()] === month && d.getFullYear() === year;
            });

            // Map and reduce by Category name
            const categorySpend = {};
            periodExpenses.forEach(e => {
                const catName = getCategoryName(e.categoryId);
                categorySpend[catName] = (categorySpend[catName] || 0) + e.amount;
            });

            const labels = Object.keys(categorySpend);
            const values = Object.values(categorySpend);

            // Destroy previous chart cleanly
            if (categoryChart) categoryChart.destroy();

            const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
            
            if (labels.length === 0) {
                // Draw empty text inside canvas or clean placeholder
                ctx.clearRect(0,0, 200, 200);
                return;
            }

            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                            '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#6366f1'
                        ],
                        borderWidth: 1,
                        borderColor: '#151526'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#9ca3af',
                                font: {
                                    family: 'Plus Jakarta Sans',
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });

        } catch (e) {
            console.error('Error drawing doughnut chart:', e);
        }
    }

    async function loadAnnualTrend(year) {
        try {
            const res = await fetch(`${API_BASE}/analytics/trend?year=${year}`);
            if (!res.ok) throw new Error('Annual trend analytics returned error state');
            const data = await res.json();

            // Populate Months labels array and values
            // We want months ordered chronologically, ensuring all 12 are represented
            const trendMap = {};
            months.forEach(m => trendMap[m] = 0);
            data.forEach(t => {
                trendMap[t.month] = t.totalSpent;
            });

            const values = months.map(m => trendMap[m]);

            // Draw Curve Chart
            if (trendChart) trendChart.destroy();

            const ctx = document.getElementById('annualSpendingTrendChart').getContext('2d');
            
            // Build gorgeous gradient fill under the line
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
                        tension: 0.35, // Smooth Bezier
                        fill: true,
                        backgroundColor: gradient
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
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
       Global Window Actions & Deletions Flows
       ========================================================================== */

    // Expose Deletion Modal triggers globally to HTML list bindings
    window.confirmDelete = (type, id) => {
        deleteTarget = { type, id };
        deleteModal.classList.add('show');
    };

    async function executeDeletion() {
        if (!deleteTarget) return;

        const { type, id } = deleteTarget;
        let url = '';

        if (type === 'expense') url = `${API_BASE}/expenses/${id}`;
        else if (type === 'category') url = `${API_BASE}/categories/${id}`;
        else if (type === 'budget') url = `${API_BASE}/budgets/${id}`;

        try {
            const res = await fetch(url, { method: 'DELETE' });
            
            if (!res.ok) {
                // If it's a category being deleted, it might have constraints
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

            // Refresh UI
            if (type === 'expense') {
                if (currentTab === 'overview') loadDashboardStats();
                else loadExpenses();
            } else if (type === 'category') {
                loadCategories();
            } else if (type === 'budget') {
                if (currentTab === 'overview') loadDashboardStats();
                else loadBudgets();
            }

        } catch (err) {
            console.error('Deletion request failure:', err);
            showToast('Unable to execute deletion command.', 'danger');
            deleteModal.classList.remove('show');
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
        // Format as MMM DD, YYYY
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC' // aligned with database localdates
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
