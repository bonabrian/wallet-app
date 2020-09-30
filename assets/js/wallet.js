/* GLOBAL VARIABLES */
let balance = 0,
    totalIncome = 0,
    totalExpenses = 0;
let ENTRY_LIST;
let SELECTED_TAB;

/**
 * Show tab when click
 * @param element
 */
const showTab = element => {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hide');
  });
  element.classList.remove('hide');
};

/**
 * Set active tab
 * @param element
 */
const setActive = element => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  element.classList.add('active');
};

/**
 * Calculate total income/expenses
 * @param string type
 * @param object list
 */
const calculateTotal = (type, list) => {
  let total = 0;

  list.forEach(entry => {
    if (entry.type == type) {
      total += entry.amount;
    }
  });

  return total;
};

/**
 * Calculate total balance
 * @param int income
 * @param int expenses
 */
const calculateBalance = (income, expenses) => {
  return income - expenses;
};

/**
 * Clear list of income, expenses, and all
 */
const clearList = () => {
  document.querySelectorAll('.list').forEach(list => {
    list.innerHTML = '';
  });
};

/**
 * Show entry list
 *
 * @param listElem
 * @param entry
 * @param id
 */
const showEntry = (listElem, entry, id) => {
  const entryElem = `<li id="${entry.type}-${id}" class="${entry.type}">
    <div class="card">
      <div class="card__content">
        <div class="entry">
          <div class="details">
            <div class="card__title">${entry.title}</div>
            <div class="card__text">${(entry.type == 'expense' ? '-' : '') + 'Rp ' + formatNumber(entry.amount)}</div>
          </div>
          <div class="options" id="${id}">
            <div class="edit">Edit</div>
            <div class="delete">Delete</div>
          </div>
        </div>
      </div>
    </div>
  </li>`;

  listElem.insertAdjacentHTML('afterbegin', entryElem);
};

/**
 * Format number into IDR format
 *
 * @param text
 */
const formatNumber = val => {
  if (!val) return 0;
  val = val.toString().replace(/[^0-9\,]/g, '');
  if (val != '') {
      valArr = val.split('.');
      valArr[0] = (parseInt(valArr[0], 10)).toLocaleString('id');
      val = valArr.join('.');
  }
  return val;
};

/**
 * Update UI when anything changed
 */
const balanceElement = document.querySelector('#balance');
const incomeElement = document.querySelector('#total-income');
const expenseElement = document.querySelector('#total-expenses');
const incomeList = document.querySelector('#income .list');
const expenseList = document.querySelector('#expenses .list');
const allList = document.querySelector('#all .list');
const updateUI = () => {
  totalIncome = calculateTotal('income', ENTRY_LIST);
  totalExpenses = calculateTotal('expense', ENTRY_LIST);
  balance = Math.abs(calculateBalance(totalIncome, totalExpenses));

  let sign = (totalIncome >= totalExpenses) ? '' : '-';

  balanceElement.innerHTML = sign + formatNumber(balance);
  incomeElement.innerHTML = formatNumber(totalIncome);
  expenseElement.innerHTML = formatNumber(totalExpenses);

  clearList();

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == 'income') {
      showEntry(incomeList, entry, index);
    } else if (entry.type == 'expense') {
      showEntry(expenseList, entry, index);
    }
    showEntry(allList, entry, index);
  });

  localStorage.setItem('entryList', JSON.stringify(ENTRY_LIST));
};

/**
 * Empty input values
 * @param inputs
 */
const clearInput = inputs => {
  inputs.forEach(input => {
    input.value = '';
  });
};

const editOrDelete = (event) => {
  const targetBtn = event.target;

  const entry = targetBtn.parentNode;

  if (targetBtn.className == 'delete') {
    deleteEntry(entry);
  } else if (targetBtn.className == 'edit') {
    editEntry(entry);
  }
};

/**
 * Delete entry
 *
 * @param entry
 */
const deleteEntry = entry => {
  ENTRY_LIST.splice(entry.id, 1);

  updateUI();
};

/**
 * Edit entry
 *
 * @param entry
 */
const editEntry = entry => {
  const entryData = ENTRY_LIST[entry.id];
  if (entryData.type == 'income') {
    inputIncomeAmount.value = entryData.amount;
    inputIncomeTitle.value = entryData.title;
  } else if (entryData.type == 'expense') {
    inputExpenseAmount.value = entryData.amount;
    inputExpenseTitle.value = entryData.title;
  }
  deleteEntry(entry);
};

/* Check entry list from localstorage */
ENTRY_LIST = JSON.parse(localStorage.getItem('entryList')) || [];
SELECTED_TAB = localStorage.getItem('selectedTab') || 'all';
/* Then update the UI */
updateUI();
setActive(document.querySelector('.tab--' + SELECTED_TAB));
showTab(document.querySelector('#' + SELECTED_TAB));

/* All tabs */
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', function () {
    const target = tab.getAttribute('data-target');
    const tabElement = document.querySelector('#' + target);

    localStorage.setItem('selectedTab', target);

    showTab(tabElement);

    setActive(tab);
  });
});

const inputIncomeTitle = document.querySelector('.income-title');
const inputIncomeAmount = document.querySelector('.income-amount');
const btnAddIncome = document.querySelector('.add-income');

const inputExpenseTitle = document.querySelector('.expense-title');
const inputExpenseAmount = document.querySelector('.expense-amount');
const btnAddExpense = document.querySelector('.add-expense');

btnAddIncome.addEventListener('click', function () {
  if (!inputIncomeTitle.value || !inputIncomeAmount.value) return;

  let amount = inputIncomeAmount.value.toString().replace(/\./g, '');

  if (amount == 0) return;

  let income = {
    type: 'income',
    title: inputIncomeTitle.value,
    amount: parseInt(amount)
  };

  ENTRY_LIST.push(income);

  updateUI();
  clearInput([inputIncomeTitle, inputIncomeAmount]);
});

inputIncomeAmount.addEventListener('input', function (e) {
  e.target.value = formatNumber(inputIncomeAmount.value);
});

inputExpenseAmount.addEventListener('input', function (e) {
  e.target.value = formatNumber(inputExpenseAmount.value);
});

btnAddExpense.addEventListener('click', function () {
  if (!inputExpenseTitle.value || !inputExpenseAmount.value) return;

  let amount = inputExpenseAmount.value.toString().replace(/\./g, '');

  if (amount == 0) return;

  let expense = {
    type: 'expense',
    title: inputExpenseTitle.value,
    amount: parseInt(amount)
  };

  ENTRY_LIST.push(expense);

  updateUI();
  clearInput([inputExpenseTitle, inputExpenseAmount]);
});

incomeList.addEventListener('click', editOrDelete);
expenseList.addEventListener('click', editOrDelete);
allList.addEventListener('click', editOrDelete);
