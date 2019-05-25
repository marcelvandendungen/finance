"""Parse CSV files and gather statistics for home finances"""

from collections import namedtuple
from decimal import Decimal
import csv
import sys
import datetime


class Stats:
    """Keeps stats on financial transactions"""
    def __init__(self, id):
        self.id = id
        self.income = 0     # dollars in
        self.spending = 0   # dollars out
        self.highest = 0    # max balance
        self.lowest = None  # min balance
        self.count = 0      # number of transactions

    def process(self, transaction_type, amount, balance):
        """Keeps stats for incoming transaction"""
        self.count += 1
        if transaction_type == 'Credit':
            self.income += amount
        if transaction_type == 'Debit':
            self.spending += amount

        if self.lowest == None:
            self.lowest = balance

        if balance > self.highest:
            self.highest = balance
        if balance < self.lowest:
            self.lowest = balance

    def __repr__(self):
        if self.lowest == None:
            return ""
            # self.lowest = Decimal(0)

        return """
            id: {}
            count: {:3d}
            in: {:.2f}
            out: {:.2f}
            highest: {:.2f}
            lowest: {:.2f}
            """.format(self.id, self.count, self.income, abs(self.spending), self.highest, self.lowest)

    def as_array(self):
        if self.lowest == None:
            return []
        return [self.id, self.count, self.income, self.spending, self.highest, self.lowest]


def processRow(stats, posting_date, transaction_type, amount, description, balance):
    date_time_obj = datetime.datetime.strptime(posting_date, '%m/%d/%Y')
    month = date_time_obj.month - 1
    stats[month].process(transaction_type, amount, balance)


def main(argv):
    """Read passed in CSV file and print highest/lowest balance, total income, total spending"""

    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

    month_stats = []
    year_stats = Stats('2019')

    for i in range(0,12):
        month_stats.append(Stats(months[i]))

    with open(argv[1]) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        count = 0
        for row in csv_reader:
            if count == 0:
                print(f'column names: {", ".join(row)}')
                count += 1
            else:
                processRow(month_stats, row[1], row[3], Decimal(row[4]), row[7], Decimal(row[10]))
                year_stats.process(row[3], Decimal(row[4]), Decimal(row[10]))
            count += 1


    for idx, month in enumerate(month_stats):
        print(month)
    print(year_stats)

    with open('out.csv', 'w') as out_file:
        csv_writer = csv.writer(out_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for idx, month in enumerate(month_stats):
            csv_writer.writerow(month.as_array())


if __name__ == "__main__":
    main(sys.argv)
