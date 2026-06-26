let transactions = [];
let balance = 0;
let totalIncome = 0;
let totalExpense = 0;
let currentUser = null;
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function register(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        alert('این نام کاربری قبلاً ثبت شده است');
        return false;
    }
    if (password.length < 4) {
        alert('رمز عبور باید حداقل ۴ کاراکتر باشد');
        return false;
    }
    users.push({
        username: username,
        password: password,
        createdAt: Date.now()
    });
    saveUsers(users);
    alert('ثبت‌نام با موفقیت انجام شد! ✅');
    return true;
}
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        updateAuthUI(true);
        return true;
    } else {
        alert('نام کاربری یا رمز عبور اشتباه است ❌');
        return false;
    }
}
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI(false);
    renderTransactions();
}
function updateAuthUI(isLoggedIn) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const welcomeSection = document.getElementById('welcomeSection');
    const authSection = document.querySelector('.auth-section');
    
    if (isLoggedIn && currentUser) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        authSection.style.display = 'none';
        welcomeSection.style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser;
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        authSection.style.display = 'block';
        welcomeSection.style.display = 'none';
    }
}
function getTransactions() {
    if (!currentUser) return [];
    const stored = localStorage.getItem(`transactions_${currentUser}`);
    try {
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}
function saveTransactions() {
    if (currentUser) {
        localStorage.setItem(
            `transactions_${currentUser}`,
            JSON.stringify(transactions)
        );
    }
}
function updateBalance() {
    const el = document.getElementById('balance');
    if (el) {
        el.innerText = balance.toLocaleString('fa-IR');
    }
}
function updateTotals() {
    const ti = document.getElementById('totalIncome');
    const te = document.getElementById('totalExpense');
    if (ti) ti.innerText = totalIncome.toLocaleString('fa-IR');
    if (te) te.innerText = totalExpense.toLocaleString('fa-IR');
}
function addTransaction(type) {
    if (!currentUser) {
        alert('لطفاً ابتدا وارد شوید 🔐');
        return;
    }
    const categoryEl = document.getElementById('category');
    const titleEl = document.getElementById('title');
    const amountEl = document.getElementById('amount');
    const category = categoryEl ? categoryEl.value : 'سایر';
    const title = titleEl ? titleEl.value.trim() : '';
    const amount = amountEl ? Number(amountEl.value) : 0;

    if (title === '' || isNaN(amount) || amount <= 0) {
        alert('اطلاعات را کامل وارد کن');
        return;
    }
    const now = new Date();
    transactions.push({
        id: Date.now() + Math.random(),
        title,
        amount,
        type,
        category,
        date: now.toLocaleDateString('fa-IR'),
        time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
    });
    saveTransactions();
    if (titleEl) titleEl.value = '';
    if (amountEl) amountEl.value = '';
    renderTransactions();
}
function addIncome() { addTransaction('income'); }
function addExpense() { addTransaction('expense'); }
function renderTransactions() {
    const ul = document.getElementById('transactions');
    if (!ul) return;
    ul.innerHTML = '';

    balance = 0;
    totalIncome = 0;
    totalExpense = 0;

    transactions.forEach(function (item) {
        const typeSpan = document.createElement('span');
        typeSpan.classList.add('type-chip');
        if (item.type === 'income') {
            typeSpan.classList.add('income-chip');
            typeSpan.textContent = '💰درآمد';
        } else {
            typeSpan.classList.add('expense-chip');
            typeSpan.textContent = '💸هزینه';
        }
        const li = document.createElement('li');
        li.classList.add(item.type);
        li.classList.add('transaction-item');

        li.appendChild(document.createTextNode(
            item.title + ' | ' + item.amount.toLocaleString('fa-IR') + ' تومان | '
        ));
        const dateSpan = document.createElement('span');
        dateSpan.textContent = ' 📆 ' + item.date + ' | ⏱️ ' + item.time;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'حذف';
        deleteBtn.addEventListener('click', function () {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            li.style.transition = 'all 0.3s ease';
            setTimeout(() => deleteTransaction(item.id), 300);
        });
        li.appendChild(typeSpan);
        li.appendChild(dateSpan);
        li.appendChild(deleteBtn);
        ul.appendChild(li);

        if (item.type === 'income') {
            balance += item.amount;
            totalIncome += item.amount;
        } else {
            balance -= item.amount;
            totalExpense += item.amount;
        }
    });
    updateBalance();
    updateTotals();
    updateGoal();
    renderCharts();
}
function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveTransactions();
    renderTransactions();
}
function clearAll() {
    if (confirm('آیا مطمئن هستید؟')) {
        transactions = [];
        saveTransactions();
        renderTransactions();
    }
}
function searchTransactions() {
    const searchText = document.getElementById('search')?.value.toLowerCase() || '';
    document.querySelectorAll('#transactions li').forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(searchText) ? '' : 'none';
    });
}
function showAll() {
    document.querySelectorAll('#transactions li').forEach(li => li.style.display = '');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('showAllBtn').classList.add('active');
}
function showIncome() {
    document.querySelectorAll('#transactions li').forEach(li => {
        li.style.display = li.classList.contains('income') ? '' : 'none';
    });
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('showIncomeBtn').classList.add('active');
}
function showExpense() {
    document.querySelectorAll('#transactions li').forEach(li => {
        li.style.display = li.classList.contains('expense') ? '' : 'none';
    });
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('showExpenseBtn').classList.add('active');
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = isDark ? '☀️تغییر تم🌙' :`تغییر تم`;
}
let expenseChartInstance = null;
function renderCharts() {
    const canvas = document.getElementById('expenseChart');
    const placeholder = document.getElementById('chartPlaceholder');
    const placeholderText = document.getElementById('chartPlaceholderText');
    if (!currentUser) {
        if (canvas) canvas.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        if (placeholderText) placeholderText.textContent = 'برای مشاهده نمودار وارد شوید 🔐';
        return;
    }
    const expenseList = transactions.filter(t => t.type === 'expense');
    if (expenseList.length === 0) {
        if (canvas) canvas.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        if (placeholderText) placeholderText.textContent = 'هنوز هزینه‌ای ثبت نشده 📭';
        return;
    }
    if (canvas) canvas.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    if (typeof Chart === 'undefined') return;
    const categories = {};
    expenseList.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    if (expenseChartInstance) expenseChartInstance.destroy();
    expenseChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56',
                    '#4BC0C0', '#9966FF', '#FF9F40', '#8AC24A'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    currentUser = localStorage.getItem('currentUser');
    transactions = getTransactions();
    updateAuthUI(!!currentUser);
    document.getElementById('showLoginBtn').addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    });
    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    });
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (login(username, password)) {
            transactions = getTransactions();
            renderTransactions();
        }
    });
    document.getElementById('registerBtn').addEventListener('click', () => {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        if (password !== confirm) {
            alert('رمز عبور و تکرار آن مطابقت ندارند ❌');
            return;
        }
        if (register(username, password)) {
            document.getElementById('regUsername').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('incomeBtn')?.addEventListener('click', addIncome);
    document.getElementById('expenseBtn')?.addEventListener('click', addExpense);
    document.getElementById('clearBtn')?.addEventListener('click', clearAll);
    document.getElementById('showAllBtn')?.addEventListener('click', showAll);
    document.getElementById('showIncomeBtn')?.addEventListener('click', showIncome);
    document.getElementById('showExpenseBtn')?.addEventListener('click', showExpense);
    document.getElementById('search')?.addEventListener('keyup', searchTransactions);
    const chartContainer = document.getElementById('charts-container');
    if (chartContainer && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    renderCharts();
                    obs.unobserve(e.target);
                }
            });
        });
        obs.observe(chartContainer);
    }
});
function saveGoal() {
    let goalName = document.getElementById("goalName").value;
    let goalAmount = Number(document.getElementById("goalAmount").value);
    if(goalName.trim() === "" || goalAmount <= 0) {
        alert("لطفاً نام هدف و مبلغ آن را به درستی وارد کنید.");
        return;
    }
    localStorage.setItem(`goalName_${currentUser}`, goalName);
    localStorage.setItem(`goalAmount_${currentUser}`, goalAmount);
    alert("هدف با موفقیت ذخیره شد 🎯");
    document.getElementById("goalName").value = '';
    document.getElementById("goalAmount").value = '';
    updateGoal();
}
function updateGoal() {
    if(!currentUser) return;
    let goalAmount = Number(localStorage.getItem(`goalAmount_${currentUser}`));
    let goalName = localStorage.getItem(`goalName_${currentUser}`);
    let infoEl = document.getElementById("goalInfo");
    let progressEl = document.getElementById("goalProgress");

    if (!goalAmount || !infoEl || !progressEl) {
        if(infoEl) infoEl.innerText = "هدفی ثبت نشده است.";
        if(progressEl) progressEl.style.width = "0%";
        return;
    }
    let percent = 0;
    if (balance > 0) {
        percent = Math.min((balance / goalAmount) * 100, 100);
    }
    infoEl.innerText = `${goalName} | ${percent.toFixed(0)}%`;
    progressEl.style.width = percent + "%";
}
