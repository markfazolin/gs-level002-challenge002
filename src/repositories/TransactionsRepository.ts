import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public typeIncome = 'income';

  public typeOutcome = 'outcome';

  public isValidType(type: string): boolean {
    return type === this.typeIncome || type === this.typeOutcome;
  }

  public async getBalance(): Promise<Balance> {
    const initialValue = 0;

    const incomes = await this.find({ where: { type: 'income' } });
    const income = incomes.reduce((accumulator, transaction) => {
      let tmpValue = 0;

      if (transaction.type === this.typeIncome) tmpValue = transaction.value;

      if (typeof tmpValue === 'string') tmpValue = parseFloat(tmpValue);

      return accumulator + tmpValue;
    }, initialValue);

    const outcomes = await this.find({ where: { type: 'outcome' } });
    const outcome = outcomes.reduce((accumulator, transaction) => {
      let tmpValue = 0;

      if (transaction.type === this.typeOutcome) tmpValue = transaction.value;

      if (typeof tmpValue === 'string') tmpValue = parseFloat(tmpValue);

      return accumulator + tmpValue;
    }, initialValue);

    const total = income - outcome;
    const balance = { income, outcome, total };
    return balance;
  }
}

export default TransactionsRepository;
