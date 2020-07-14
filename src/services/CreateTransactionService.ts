import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === transactionsRepository.typeOutcome) {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError(
          'The value of the new outgoing transaction is greater than your balance.',
        );
      }
    }

    const categoryRepository = getRepository(Category);
    let categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryExists);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
