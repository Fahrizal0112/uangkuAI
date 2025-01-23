const prisma = require("../utils/prisma");

class TransactionController {
  async createTransaction(req, res) {
    try {
      const { amount, category_id, description } = req.body;
      
      const transaction = await prisma.transactions.create({
        data: {
          user_id: req.user.id,
          amount,
          category_id,
          description
        },
        include: {
          category: true
        }
      });

      res.status(201).json({
        status: "success",
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async getTransactions(req, res) {
    try {
      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedTransactions = transactions.map(transaction => ({
        ...transaction,
        createdAt: transaction.createdAt.toISOString().split('T')[0]
      }));

      res.status(200).json({
        status: "success",
        data: formattedTransactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transactions.findFirst({
        where: {
          id: parseInt(id),
          user_id: req.user.id
        }
      });

      if (!transaction) {
        return res.status(404).json({
          status: "error",
          message: "Transaction not found"
        });
      }

      await prisma.transactions.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({
        status: "success",
        message: "Transaction deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
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
            lte: endDate
          }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        status: "success",
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async getTransactionByMonth(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        status: "success",
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async getTransactionByYear(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), 0, 1);
      const endDate = new Date(today);

      const transactions = await prisma.transactions.findMany({
        where: {
          user_id: req.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        status: "success",
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
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
            lte: today
          }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        status: "success",
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }
}

module.exports = new TransactionController();
