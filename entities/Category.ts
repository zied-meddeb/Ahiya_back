import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  nom: string;
  description?: string;
  imageUrl?: string;
  parentCategories?: Types.ObjectId[];
  hierarchies?: string[]; // multiple hierarchy paths
}

const categorySchema = new Schema<ICategory>(
  {
    nom: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    imageUrl: String,
    parentCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: [],
      },
    ],
    hierarchies: {
      type: [String],
      index: true,
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual for children (inverse relationship)
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategories',
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

/**
 * Pre-save hook to compute all hierarchy paths
 * Example: ['clothes/homme/shoes', 'clothes/femme/shoes']
 */
categorySchema.pre('save', async function (next) {
  const category = this as ICategory;

  // base case: no parent
  if (!category.parentCategories || category.parentCategories.length === 0) {
    category.hierarchies = [category.nom.toLowerCase()];
    return next();
  }

  const hierarchies: string[] = [];

  for (const parentId of category.parentCategories) {
    let path = category.nom.toLowerCase();
    let currentParentId = parentId;

    while (currentParentId) {
      const parent = await Category.findById(currentParentId).select('nom parentCategories');
      if (!parent) break;
      path = `${parent.nom.toLowerCase()}/${path}`;
      // If parent has multiple parents, stop at one path (or recursively handle all branches if needed)
      currentParentId = parent.parentCategories?.[0]!; // depth-first single path
    }

    hierarchies.push(path);
  }

  category.hierarchies = hierarchies;
  next();
});

export const Category = model<ICategory>('Category', categorySchema);
