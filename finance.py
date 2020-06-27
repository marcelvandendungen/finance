"""Parse CSV files and gather statistics for home finances"""

from categories import categories
from collections import namedtuple
# from decimal import Decimal
import csv
import json
import os
import re
import sys
import datetime

savings = 0
transactions = []

class Stats:
    """Keeps stats on financial transactions"""
    def __init__(self, id):
        self.id = id
        self.count = 0
        self.income = 0     # dollars in
        self.spending = 0   # dollars out

    def process(self, transaction_type, amount, balance):
        """Keeps statistics over incoming transactions"""
        if self.count == 0:
            self.start = balance
        self.count += 1
        if transaction_type == 'Credit':
            self.income += amount
        if transaction_type == 'Debit':
            self.spending += amount

    def __repr__(self):

        return """
            id: {}
            count: {:3d}
            in: {:.2f}
            out: {:.2f}
            diff: {:.2f}
            """.format(self.id, self.count, self.income, abs(self.spending), self.income - abs(self.spending))

    def as_array(self):
        return [self.id, 
                round(self.count, 2),
                round(self.income, 2),
                round(self.spending, 2)]


def parse_date(date_string, *format_strings):

    for fmt in format_strings:
        try:
            date_time_obj = datetime.datetime.strptime(date_string, fmt)
            return date_time_obj
        except ValueError as ex:
            pass

    return None


def processRow(stats, values):
    date_time_obj = parse_date(values['date'], '%m/%d/%Y %H:%M:%S %p', '%m/%d/%Y %H:%M', '%m/%d/%Y', '%m/%d/%y')

    if date_time_obj.year < 2000:
        date_time_obj.year += 2000

    month = date_time_obj.month - 1

    # exclude transfers between checkings and savings accounts
    if '9303995208' in values['description'] or '9304263191' in values['description']or '9304263418' in values['description']:
        global savings
        savings -= values['amount']
    else:
        stats[month].process(values['type'], values['amount'], values['balance'])
        transactions.append({
            "amount": values['amount'],
            "description": values['description'],
            "reference": values['reference'],
            "month": month,
            "categories": getCategories(values['description'])
        })


def getCategories(description):
    tokens = re.split('[ \*]+', description)
    print(tokens)
    key = tokens[0]
    # for each word in the list
    for idx, word in enumerate(tokens):
        if idx != 0:
            key += ' ' + word
        if key in categories:
            return categories[key]
    return []


def read_row_definition(row):
    """
        Read initial line of CSV file and determine what position the values are
    """
    definitions = {}
    for idx, col in enumerate(row):
        if col == 'Transaction_Date' or col == 'Effective Date':
            definitions['date'] = idx
        elif col == 'Description':
            definitions['description'] = idx
        elif col == 'Amount':
            definitions['amount'] = idx
        elif col == 'Balance':
            definitions['balance'] = idx
        elif col == 'Reference Number' or col == 'Transaction_ID':
            definitions['reference'] = idx

    return definitions

def read_row(definitions, row):
    """
        Read values from the positions in the definitions
    """
    amount = float(row[definitions['amount']])
    ret = {
        'date': row[definitions['date']],
        'type': 'Debit' if amount < 0 else 'Credit',
        'amount': amount,
        'reference': row[definitions['reference']],
        'description': row[definitions['description']],
        'balance': float(row[definitions['balance']])
        }
    return ret

def main(filename):
    """Read passed in CSV file and print highest/lowest balance, total income, total spending"""

    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

    base = os.path.basename(filename)
    id = os.path.splitext(base)[0]

    month_stats = []
    year_stats = Stats(id)

    for i in range(0,12):
        month_stats.append(Stats(months[i]))

    with open(filename) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        count = 0
        for row in csv_reader:
            if count == 0:
                definitions = read_row_definition(row)
            else:
                values = read_row(definitions, row)
                processRow(month_stats, values)
                year_stats.process(values['type'], 
                                   values['amount'], 
                                   values['balance'])
            count += 1

    outname = filename.replace('.csv', '.json')
    print('writing to: ', outname)
    with open(outname, 'w') as json_file:
        json_file.write(json.dumps(transactions))

    for stats in month_stats:
        print(stats)
    print(year_stats)
    global savings
    print('savings: ' + str(savings))

    with open('out.csv', 'w') as out_file:
        csv_writer = csv.writer(out_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(['', 'count', 'income', 'spending'])
        for month in month_stats:
            csv_writer.writerow(month.as_array())
        csv_writer.writerow(year_stats.as_array())

if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main('in/2017.csv')
