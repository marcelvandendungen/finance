const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

let chart = null;

function createChart(ctx, incomes, expenses) {
    chart = new Chart(ctx, {
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
                var activeElement = chart.getElementAtEvent(e);
                console.log(activeElement[0]._model.label + ' ' + activeElement[0]._model.datasetLabel);
            }
        }
    });
    return chart;
}

function refreshChart(incomes, expenses) {
    chart.data.datasets[0].data = incomes;
    chart.data.datasets[1].data = expenses;
    chart.update();
}

export {createChart, refreshChart}
