"""
    Parse Fidelity CSV files and gather statistics for home finances
    Usage: python finance3.py "/Users/mvandend/Downloads/download (7).csv"
"""

from categories import categories
from collections import namedtuple
from decimal import Decimal
from itertools import islice
import csv
import datetime
import json
import sys
import re


Transaction = namedtuple('Transaction', ['date', 'type', 'description', 'memo', 'amount'])


def processRow(posting_date, transaction_type, amount, description):
    # split words in description by space or asterisk
    tokens = re.split('[ \*]+', description)
    print(tokens)
    key = tokens[0]
    ret_val = [posting_date, description, amount]
    # for each word in the list
    for idx, word in enumerate(tokens):
        if idx != 0:
            key += ' ' + word
        if key in categories:
            ret_val = [posting_date, description, amount] + categories[key]
    return ret_val


def read_transactions(filename):
    with open(filename, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')

        for transaction in islice(map(Transaction._make, csv_reader), 1, None):
            if transaction.type == 'CREDIT':
                continue

            yield transaction


def main(argv):
    """Read passed in CSV file and print highest/lowest balance, total income, total spending"""

    with open('out.json', 'w') as json_file:
        json_file.write(json.dumps(categories))

    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

    transactions = []

    month_stats = []
    with open('out.csv', 'w') as out_file:
        csv_writer = csv.writer(out_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(['date', 'description', 'amount', 'category 1', 'category 2', 'category 3'])

        for transaction in read_transactions(argv[1]):
            result = processRow(transaction.date, transaction.type, transaction.amount, transaction.description)
            date_time_obj = datetime.datetime.strptime(result[0], '%m/%d/%Y')
            month = date_time_obj.month - 1

            transactions.append({
                'amount': abs(float(result[2])),
                'description': result[1],
                'month': month,
                'categories': result[3:]
            })
            print(result)
            csv_writer.writerow(result)

    with open('transactions1.json', 'w') as json_file:
        json_file.write(json.dumps(transactions))


if __name__ == "__main__":
    main([sys.argv, "/Users/mvandend/dev/finance/download.csv"])
