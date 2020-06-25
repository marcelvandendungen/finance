(
    async () => {
        const dataUrl = getTransactionUrl();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let incomes = new Array(12).fill(0);
        let expenses = new Array(12).fill(0);
        let categoriesSet = new Set();

        var transactions = await getTransactionData(dataUrl);
        transactions.map(d => processTransaction(d));   // calculate totals per month and fill categoriesSet

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", async () => {await refresh()});

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
                                suggestedMax: 30000,
                                beginAtZero: true
                            }
                        }]
                    },
                    onClick: function (e) {
                        // debugger;
                        var activeElement = chart.getElementAtEvent(e);
                        console.log(activeElement[0]._model.label + ' ' + activeElement[0]._model.datasetLabel);
                    }
                }
            });
        }

        function getTransactionUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const filename = urlParams.get('file');
            const path = filename ? "/in/" + filename + ".json" : "/transactions.json";
            return path;
        }

        function toggleCheckbox(elem) {
            if (elem.srcElement.checked) {
                categoriesSet.add(elem.srcElement.value);
            } else {
                categoriesSet.delete(elem.srcElement.value);
            }
            recalc();
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
            processAmount(transaction.amount, transaction.month);
            transaction.categories.forEach(element => {
                categoriesSet.add(element);
            });
        }

        function processAmount(amount, month) {
            if (amount > 0) {
                incomes[month] += amount;
                // console.log("adding " + Math.abs(transaction.amount) + " to income of " + transaction.month + " with " + transaction.categories);
            } else {
                expenses[month] += Math.abs(amount);
                // console.log("adding " + Math.abs(transaction.amount) + " to expenses of " + transaction.month + " with " + transaction.categories);
        }
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
                    processAmount(transaction.amount, transaction.month);
                    return;
                }
            }
        }

        async function refresh() {
            let p = document.getElementById("inputFile");
            let path = p != null && p.value ? "/in/" + p.value + ".json" : "/transactions.json";
            let transactions = await getTransactionData(path);
            incomes = new Array(12).fill(0);
            expenses = new Array(12).fill(0);
            transactions.map(d => processTransaction(d));
            chart.data.datasets[0].data = incomes;
            chart.data.datasets[1].data = expenses;
            chart.update();
        }

        async function getTransactionData(path) {
            const result = await fetch(path);
            const json = await result.json();
            return json;    
        }
    }
)();
