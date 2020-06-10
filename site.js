(
    async () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let incomes = new Array(12).fill(0);
        let expenses = new Array(12).fill(0);
        let categoriesSet = new Set();

        var transactions = await getTransactionData();
        transactions.map(d => processTransaction(d));

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", refresh);

        let categories = Array.from(categoriesSet);

        addFilters(categories);

        const ctx = document.getElementById('myChart');
        const chart = createChart();

        function createChart() {
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'income',
                        data: incomes,
                        backgroundColor: '#0A0',
                        borderWidth: 2,
                        borderColor: '#777',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#000',
                        hoverBackgroundColor: '#0A0'
                        },
                        {
                        label: 'expenses',
                        data: expenses,
                        backgroundColor: '#D00',
                        borderWidth: 2,
                        borderColor: '#777',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#000',
                        hoverBackgroundColor: 'Red'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        function toggleCheckbox(elem) {
            if (elem.srcElement.checked) {
                categoriesSet.add(elem.srcElement.value);
            } else {
                categoriesSet.delete(elem.srcElement.value);
            }
            recalc();
            // chart.data.datasets[1].data[2] = 3456;
            chart.update();
        }

        function addFilters(categories) {
            let parentElement = document.getElementById("filters");
            for (var count in categories)
            {
                parentElement.appendChild(createCheckbox(count, categories[count]));
                parentElement.appendChild(createLabel(count, categories[count]))
            }
        }

        function createCheckbox(count, category) {
            let newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.id = 'cat' + count;
            newCheckBox.value = category;
            newCheckBox.checked = true;
            newCheckBox.addEventListener('click', toggleCheckbox);
            return newCheckBox;
        }

        function createLabel(count, category) {
            let newLabel = document.createElement("label");
            newLabel.setAttribute('for', 'cat' + count);
            newLabel.innerText = category;
            return newLabel;
        }

        function processTransaction(transaction) {
            let month = transaction.month;
            expenses[month] += transaction.amount;
            transaction.categories.forEach(element => {
                categoriesSet.add(element);
            });
        }

        function recalc() {
            incomes = new Array(12).fill(0);
            expenses = new Array(12).fill(0);
            transactions.map(t => calcExpenses(t));
            chart.data.datasets[1].data = expenses;
            chart.update();
        }

        function calcExpenses(transaction) {
            for (let c of transaction.categories) {
                if (categoriesSet.has(c)) {                 // if one of the categories is checked
                    let month = transaction.month;
                    expenses[month] += transaction.amount;  // add amount to expenses for that month
                    console.log("adding " + transaction.amount + " to " + transaction.month + " with " + transaction.categories)
                    return;
                }
            }
        }

        function refresh() {
            chart.update();
        }

        async function getTransactionData() {
            const result = await fetch('/transactions.json');
            const json = await result.json();
            return json;
        }
    }
)();
