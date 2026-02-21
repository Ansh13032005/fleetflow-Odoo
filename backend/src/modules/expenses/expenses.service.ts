import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ExpenseLog, Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.ExpenseLogUncheckedCreateInput,
  ): Promise<ExpenseLog> {
    return this.prisma.expenseLog.create({ data });
  }

  async findAll(): Promise<ExpenseLog[]> {
    return this.prisma.expenseLog.findMany({
      include: { vehicle: true, trip: true },
    });
  }

  async findOne(id: string): Promise<ExpenseLog | null> {
    return this.prisma.expenseLog.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
    });
  }

  async update(
    id: string,
    data: Prisma.ExpenseLogUncheckedUpdateInput,
  ): Promise<ExpenseLog> {
    return this.prisma.expenseLog.update({ where: { id }, data });
  }

  async remove(id: string): Promise<ExpenseLog> {
    return this.prisma.expenseLog.delete({ where: { id } });
  }
}
