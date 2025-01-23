const prisma = require("../utils/prisma");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIController {
    async generateInsight(req, res) {
        try {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const transactions = await prisma.transactions.findMany({
                where: {
                    user_id: req.user.id,
                    createdAt: {
                        gte: lastWeek
                    }
                },
                include: {
                    category: true
                }
            });

            const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
            const expensesByCategory = transactions.reduce((acc, t) => {
                if (!acc[t.category.name]) {
                    acc[t.category.name] = 0;
                }
                acc[t.category.name] += t.amount;
                return acc;
            }, {});

            const categories = Object.entries(expensesByCategory);
            const largestCategory = categories.sort((a, b) => b[1] - a[1])[0];
            const largestPercentage = Math.round((largestCategory[1] / totalExpense) * 100);

            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            
            const previousTransactions = await prisma.transactions.findMany({
                where: {
                    user_id: req.user.id,
                    createdAt: {
                        gte: twoWeeksAgo,
                        lt: lastWeek
                    }
                }
            });

            const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentageChange = previousTotal === 0 ? 0 : Math.min(Math.round(((totalExpense - previousTotal) / previousTotal) * 100), 100);

            const prompt = `
                Analisis pengeluaran pengguna:
                - Total pengeluaran: Rp${totalExpense.toLocaleString()}
                - Perubahan: ${percentageChange}% dari minggu sebelumnya
                - Kategori terbesar: ${largestCategory[0]} (${largestPercentage}%)
                
                Pengeluaran per kategori:
                ${categories.map(([category, amount]) => 
                    `- ${category}: Rp${amount.toLocaleString()}`
                ).join('\n')}

                Berikan saran dan rekomendasi keuangan yang spesifik dalam bahasa Indonesia dengan mempertimbangkan:
                1. Pola pengeluaran saat ini
                2. Perubahan dari periode sebelumnya
                3. Kategori dengan pengeluaran terbesar
                4. Tips praktis untuk mengoptimalkan pengeluaran
                
                Berikan saran dalam format paragraf yang mudah dibaca, fokus pada solusi praktis.
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const aiRecommendation = result.response.text();

            const insightData = {
                summary: {
                    total: totalExpense,
                    percentageChange: percentageChange,
                    period: "7 Hari Terakhir"
                },
                largestCategory: {
                    name: largestCategory[0],
                    percentage: largestPercentage,
                    description: `Melebihi rata-rata sebesar ${percentageChange}%`
                },
                recommendation: aiRecommendation
            };

            await prisma.insight.create({
                data: {
                    user_id: req.user.id,
                    insight_text: JSON.stringify(insightData),
                    insight_date: new Date()
                }
            });

            res.status(200).json({
                status: "success",
                data: insightData
            });

        } catch (error) {
            console.error("Error generating insight:", error);
            res.status(500).json({
                status: "error",
                message: "Gagal menghasilkan insight"
            });
        }
    }

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

module.exports = new AIController();
