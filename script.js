// ===== KHATABOOK - LEDGER TRACKER =====
// Yeh ek accounting app hai jaise Khatabook mein
// Har person/vendor ke liye alag khata aur transactions

// ===== GLOBAL VARIABLES =====
// Sabhi khate ka array
let khatas = JSON.parse(localStorage.getItem('khatas')) || [];

// Jo khata open hai uska ID
let currentKhataId = null;

// ===== PAGE LOAD HONE PAR =====
// Jab page load ho to pehle se ka data dikha do
document.addEventListener('DOMContentLoaded', function() {
    renderKhatas();
    updateStats();
});

// ===== TAB SWITCHING FUNCTION =====
// Tabs ko switch karne ke liye (Sabhi Khate / Naya Khata)
function switchTab(tabName) {
    // Sabhi tab content ko hide karo
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Sabhi buttons se active class remove karo
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Selected tab ko active karo
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ===== NAYA KHATA ADD KARNE KA FUNCTION =====
// Form se data le kar naya khata create karo
function addNewKhata() {
    const name = document.getElementById('khata-name').value.trim();
    const type = document.getElementById('khata-type').value;

    // Data validation - sahi data likha hai ki nahi check karo
    if (name === '') {
        alert('Kripya khata ka naam likho!');
        return;
    }

    // Naya khata object banao
    const newKhata = {
        id: Date.now(), // Unique ID banane ke liye current time use karo
        name: name,
        type: type, // 'customer' ya 'vendor'
        transactions: [], // Is khate mein jo lena-dena hoga
        createdAt: new Date().toLocaleDateString('hi-IN') // Aaj ki date
    };

    // Khate ko array mein add karo
    khatas.push(newKhata);

    // LocalStorage mein save karo taaki refresh hone ke baad bhi rahe
    saveToLocalStorage();

    // Input fields ko khali karo
    document.getElementById('khata-name').value = '';
    document.getElementById('khata-type').value = 'customer';

    // Alert dikha do
    alert('Khata khole gaya! 📕');

    // Sabhi khate ko dikha do
    renderKhatas();

    // Stats update karo
    updateStats();

    // "Sabhi Khate" tab par switch karo
    switchTab('all-khatas');
}

// ===== RENDER KHATAS FUNCTION =====
// Sabhi khate ko screen par display karo
function renderKhatas() {
    const khatasList = document.getElementById('khatas-list');

    // Agar koi khata nahi hai to message dikha do
    if (khatas.length === 0) {
        khatasList.innerHTML = '<p class="empty-message">Abhi koi khata nahi hai. Naya Khata add karo!</p>';
        return;
    }

    // Sabhi khate ko HTML mein convert karo
    khatasList.innerHTML = khatas.map(khata => {
        const balance = calculateBalance(khata);
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        const balanceText = balance >= 0 ? `आपको ₹${balance} मिलेगा` : `आपको ₹${Math.abs(balance)} देना पड़ेगा`;

        // Per-account small totals
        const totalGot = khata.transactions.reduce((s, t) => t.type === 'debit' ? s + t.amount : s, 0);
        const totalGive = khata.transactions.reduce((s, t) => t.type === 'credit' ? s + t.amount : s, 0);

        return `
            <div class="khata-card ${khata.type}">
                <div class="khata-card-header">
                    <div class="khata-name">${khata.name}</div>
                    <div class="khata-type">${khata.type === 'customer' ? '👤 Customer' : '🏪 Vendor'}</div>
                </div>

                <div class="khata-balance ${balanceClass}">
                    ${balanceText}
                </div>

                <div class="khata-totals">
                    <div class="khata-mini you-got">You Got<br/><span>₹${totalGot}</span></div>
                    <div class="khata-mini you-give">You Give<br/><span>₹${totalGive}</span></div>
                </div>

                <div class="khata-actions">
                    <button class="action-btn action-btn-view" onclick="openKhataDetail(${khata.id})">
                        👁️ Dekhiye
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deleteKhata(${khata.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== KHATA DETAIL OPEN KARNA =====
// Jab koi khata click karo to uska detail modal open ho
function openKhataDetail(id) {
    currentKhataId = id;

    // Jo khata click kiya use find karo
    const khata = khatas.find(k => k.id === id);

    if (!khata) {
        alert('Khata nahi mila!');
        return;
    }

    // Modal ka title update karo
    document.getElementById('modal-title').innerText = khata.name;

    // Balance calculate karo
    const balance = calculateBalance(khata);
    const balanceElement = document.getElementById('modal-balance');
    balanceElement.innerText = `₹${balance}`;

    // Balance ke hisaab se color change karo
    const balanceInfo = document.querySelector('.balance-info');
    balanceInfo.classList.remove('positive', 'negative');
    if (balance >= 0) {
        balanceInfo.classList.add('positive');
    } else {
        balanceInfo.classList.add('negative');
    }

    // Per-khata totals (You Got / You Give)
    const totalGot = khata.transactions.reduce((s, t) => t.type === 'debit' ? s + t.amount : s, 0);
    const totalGive = khata.transactions.reduce((s, t) => t.type === 'credit' ? s + t.amount : s, 0);
    const youGotEl = document.getElementById('modal-you-got');
    const youGiveEl = document.getElementById('modal-you-gave');
    if (youGotEl) youGotEl.innerText = `₹${totalGot}`;
    if (youGiveEl) youGiveEl.innerText = `₹${totalGive}`;

    // Sabhi transactions ko display karo
    const transactionsList = document.getElementById('modal-transactions');
    
    if (khata.transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">Abhi koi transaction nahi hai</p>';
    } else {
        transactionsList.innerHTML = khata.transactions.map(trans => {
            return `
                <div class="transaction-item ${trans.type}">
                    <div class="transaction-desc">
                        <div class="transaction-desc-name">${trans.description}</div>
                        <div class="transaction-desc-date">${trans.date}</div>
                    </div>
                    <div class="transaction-amount ${trans.type}">
                        ${trans.type === 'debit' ? '+' : '-'}₹${trans.amount}
                    </div>
                    <button class="transaction-delete" onclick="deleteTransaction(${id}, ${trans.id})">
                        Delete
                    </button>
                </div>
            `;
        }).join('');
    }

    // Modal ko show karo
    document.getElementById('detail-modal').style.display = 'flex';
}

// ===== MODAL CLOSE KARNA =====
// Modal ko close karo
function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
    currentKhataId = null;
}

// ===== ADD TRANSACTION FORM OPEN KARNA =====
// Naya transaction add karne ka form open karo
function openAddTransactionForm() {
    document.getElementById('transaction-form').style.display = 'block';
}

// ===== TRANSACTION ADD KARNA =====
// Naya transaction add karo
function addTransaction() {
    const description = document.getElementById('trans-description').value.trim();
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const type = document.getElementById('trans-type').value;

    // Validation check karo
    if (description === '' || amount <= 0) {
        alert('Kripya sahi data likho!');
        return;
    }

    // Jo khata selected hai use find karo
    const khata = khatas.find(k => k.id === currentKhataId);
    if (!khata) {
        alert('Khata nahi mila!');
        return;
    }

    // Naya transaction object banao
    const newTransaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type, // 'credit' ya 'debit'
        date: new Date().toLocaleDateString('hi-IN') // Aaj ki date
    };

    // Transaction ko khate mein add karo
    khata.transactions.push(newTransaction);

    // LocalStorage mein save karo
    saveToLocalStorage();

    // Form ko khali karo
    document.getElementById('trans-description').value = '';
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-type').value = 'debit';

    // Auto-close transaction form and update modal
    document.getElementById('transaction-form').style.display = 'none';
    openKhataDetail(currentKhataId);

    // Stats update karo
    updateStats();
}

// ===== CANCEL TRANSACTION =====
// Transaction add karna cancel karo
function cancelTransaction() {
    document.getElementById('transaction-form').style.display = 'none';
    document.getElementById('trans-description').value = '';
    document.getElementById('trans-amount').value = '';
}

// ===== DELETE TRANSACTION =====
// Ek transaction ko delete karo
function deleteTransaction(khataId, transactionId) {
    // Confirm karo user se
    if (!confirm('Kya delete kar dun?')) {
        return;
    }

    // Khata find karo
    const khata = khatas.find(k => k.id === khataId);
    if (!khata) return;

    // Transaction ko remove karo
    khata.transactions = khata.transactions.filter(t => t.id !== transactionId);

    // Save karo
    saveToLocalStorage();

    // Modal ko update karo
    openKhataDetail(khataId);

    // Stats update karo
    updateStats();
}

// ===== DELETE KHATA =====
// Pura khata delete karo
function deleteKhata(id) {
    // Confirm karo user se - 2 baar pooch rahe hain kyunki ye important hai
    if (!confirm('Kya sachmein delete kar dun? Sab transaction bhi delete ho jayenge!')) {
        return;
    }

    if (!confirm('Are aap bilkul pakka ho?')) {
        return;
    }

    // Khate ko remove karo
    khatas = khatas.filter(k => k.id !== id);

    // Save karo
    saveToLocalStorage();

    // Display update karo
    renderKhatas();

    // Stats update karo
    updateStats();

    alert('Khata delete ho gaya! 🗑️');
}

// ===== CALCULATE BALANCE =====
// Ek khate ka total balance calculate karo
function calculateBalance(khata) {
    let balance = 0;

    // Sabhi transactions ko loop karo
    khata.transactions.forEach(trans => {
        if (trans.type === 'credit') {
            // Credit = hamko paisa dena padega (negative)
            balance -= trans.amount;
        } else {
            // Debit = hamko paisa milna hai (positive)
            balance += trans.amount;
        }
    });

    return balance;
}

// ===== UPDATE STATS =====
// Top mein jo total income aur expense dikha rahe hain update karo
function updateStats() {
    let totalIncome = 0; // Kaul = customer ko dena padega
    let totalExpense = 0; // Udhar = vendor ko dena padega

    // Sabhi khate ko loop karo
    khatas.forEach(khata => {
        const balance = calculateBalance(khata);

        if (khata.type === 'customer') {
            // Customer: agar positive balance to hamhe paise milne hain
            if (balance > 0) {
                totalIncome += balance;
            } else {
                totalExpense += Math.abs(balance);
            }
        } else {
            // Vendor: agar positive balance to hamhe paise dene hain
            if (balance > 0) {
                totalExpense += balance;
            } else {
                totalIncome += Math.abs(balance);
            }
        }
    });

    // DOM update karo
    document.getElementById('total-income').innerText = `₹${totalIncome}`;
    document.getElementById('total-expense').innerText = `₹${totalExpense}`;
}

// ===== SAVE TO LOCAL STORAGE =====
// Khate ko browser ke localStorage mein save karo
// Taaki refresh hone ke baad bhi data rahe
function saveToLocalStorage() {
    localStorage.setItem('khatas', JSON.stringify(khatas));
}

// ===== MODAL CLOSE KARNA - OUTSIDE CLICK PAR =====
// Agar modal ke bahar click karo to modal close ho jaye
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detail-modal');
    if (event.target == modal) {
        closeModal();
    }
});
