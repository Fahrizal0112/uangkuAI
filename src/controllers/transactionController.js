const prisma = require("../utils/prisma");

class TransactionController {
  async createTransaction(req, res) {
    const { user_id, amount, category_id, description } = req.body;
    const transaction = await prisma.transactions.create({
      data: { user_id, amount, category_id, description },
    });
    res
      .status(201)
      .json({ message: "Transaction created successfully", transaction });
  }
  async getTransactions(req, res) {
    const transactions = await prisma.transactions.findMany({
      where: {
        user_id: req.user.id,
      },
      include: {
        category: true,
      },
    });

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      createdAt: transaction.createdAt.toISOString().split("T")[0],
    }));

    res
      .status(200)
      .json({
        message: "Transactions fetched successfully",
        transactions: formattedTransactions,
      });
  }
  async deleteTransaction(req, res) {
    const { id } = req.params;
    await prisma.transactions.delete({ where: { id } });
    res.status(200).json({ message: "Transaction deleted successfully" });
  }
  async getTransactionByDay(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          category: true,
        },
      });

      res.status(200).json({
        status: "success",
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  async getTransactionByMonth(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const endDate = new Date(today);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          category: true,
        },
      });

      res.status(200).json({
        status: "success",
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error", 
      });
    }
  }

  async getTransactionByYear(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const endDate = new Date(today);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          category: true,
        },
      });

      res.status(200).json({
        status: "success",
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  async getTransactionByWeek(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: today,
          },
        },
        include: {
          category: true,
        },
      });

      res.status(200).json({
        status: "success",
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
}

module.exports = new TransactionController();
