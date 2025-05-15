const Category = require('../entities/Category');

const categoryService = {
    getAllCategories: async () => {
        try {
            const categories = await Category.find();
            return categories;
        } catch (error) {
            throw new Error('Error fetching categories: ' + error.message);
        }
    },

    getCategoryById: async (id) => {
        try {
            const category = await Category.findById(id);
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        } catch (error) {
            throw new Error('Error fetching category: ' + error.message);
        }
    },

    createCategory: async (categoryData) => {
        try {
            const category = new Category(categoryData);
            await category.save();
            return category;
        } catch (error) {
            throw new Error('Error creating category: ' + error.message);
        }
    },
}

module.exports = categoryService;
