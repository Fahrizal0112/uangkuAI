const prisma = require("../utils/prisma");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class InsightController {
    async generateInsight(req, res) {
        try {
            const user = await prisma.users.findUnique({
                where: { id: req.user.id }
            });

            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const transactions = await prisma.transactions.findMany({
                where: {
                    user_id: req.user.id,
                    createdAt: {
                        gte: startOfMonth
                    }
                },
                include: {
                    category: true
                }
            });

            const expensesByCategory = transactions.reduce((acc, transaction) => {
                const categoryName = transaction.category.name;
                if (!acc[categoryName]) {
                    acc[categoryName] = 0;
                }
                acc[categoryName] += transaction.amount;
                return acc;
            }, {});

            const totalExpense = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

            const monthlyIncome = user.monthly_income || 0;
            const remainingBudget = monthlyIncome - totalExpense;
            const spendingPercentage = (totalExpense / monthlyIncome) * 100;

            const prompt = `
            Analisis keuangan pengguna:
            - Pendapatan bulanan: Rp${monthlyIncome.toLocaleString()}
            - Total pengeluaran: Rp${totalExpense.toLocaleString()}
            - Sisa budget: Rp${remainingBudget.toLocaleString()}
            - Persentase pengeluaran: ${spendingPercentage.toFixed(2)}%

            Pengeluaran per kategori:
            ${Object.entries(expensesByCategory)
                .map(([category, amount]) => `${category}: Rp${amount.toLocaleString()}`)
                .join('\n')}

            Berikan saran keuangan dalam bahasa Indonesia dengan mempertimbangkan:
            1. Apakah pengeluaran sudah sesuai dengan pendapatan
            2. Kategori mana yang pengeluarannya terlalu tinggi
            3. Bagaimana cara mengoptimalkan pengeluaran
            4. Tips penghematan untuk kategori dengan pengeluaran tertinggi
            5. Saran untuk menabung dan investasi

            Berikan saran yang spesifik dan praktis dalam format poin-poin.
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const insight = response.text();

            await prisma.insight.create({
                data: {
                    user_id: req.user.id,
                    insight_text: insight,
                    insight_date: new Date()
                }
            });

            res.status(200).json({
                status: "success",
                data: {
                    monthly_income: monthlyIncome,
                    total_expense: totalExpense,
                    remaining_budget: remainingBudget,
                    spending_percentage: spendingPercentage,
                    expenses_by_category: expensesByCategory,
                    insight: insight
                }
            });

        } catch (error) {
            console.error("Error generating insight:", error);
            res.status(500).json({
                status: "error",
                message: "Gagal menghasilkan insight"
            });
        }
    }

    // Mendapatkan riwayat insight
    async getInsightHistory(req, res) {
        try {
            const insights = await prisma.insight.findMany({
                where: {
                    user_id: req.user.id
                },
                orderBy: {
                    insight_date: 'desc'
                }
            });

            res.status(200).json({
                status: "success",
                data: insights
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Gagal mengambil riwayat insight"
            });
        }
    }
}

module.exports = new InsightController();
