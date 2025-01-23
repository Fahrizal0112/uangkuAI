const prisma = require('../utils/prisma');

class CategoryController {
    async createCategory(req, res) {
        try {
            const categories = req.body;
            
            if (!Array.isArray(categories)) {
                return res.status(400).json({
                    status: "error",
                    message: "Data must be an array"
                });
            }

            const createdCategories = await prisma.category.createMany({
                data: categories.map(cat => ({
                    name: cat.name,
                    description: cat.description
                }))
            });

            res.status(201).json({
                status: "success", 
                message: "Categories created successfully",
                data: {
                    count: createdCategories.count
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }

    async getCategories(req, res) {
        const categories = await prisma.category.findMany();
        res.status(200).json({ message: 'Categories fetched successfully', categories });
    }

    async updateCategory(req, res) {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await prisma.category.update({ where: { id }, data: { name, description } });
        res.status(200).json({ message: 'Category updated successfully', category });
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        await prisma.category.delete({ where: { id } });
        res.status(200).json({ message: 'Category deleted successfully' });
    }
}

module.exports = new CategoryController();