(
    async () => {
        var apiData = await getApiData();
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const income = apiData.map(d => d.income)
        const expenses = apiData.map(d => d.expenses)

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", refresh);

        const ctx = document.getElementById('myChart');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'income',
                    data: income,
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

        function refresh() {
            chart.data.datasets[1].data[2] = 3456;
            chart.update();
        }

        async function getApiData() {
            const result = await fetch('/data.json');
            const json = await result.json();
            return json;
        }
    }
)();
