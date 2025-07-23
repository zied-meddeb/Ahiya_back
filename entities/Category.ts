import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  nom: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategory?: Schema.Types.ObjectId;
  hierarchy?: string;
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    hierarchy: {
      type: String,
      index: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Virtual for child categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Show virtuals when converting to JSON/objects
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

/**
 * Pre-save hook to compute the hierarchy path
 * Example result: clothes/men/shoes
 */
categorySchema.pre('save', async function (next) {
  const category = this as ICategory;

  let path = category.nom.toLowerCase();
  let parentId = category.parentCategory;

  while (parentId) {
    const parent = await Category.findById(parentId).select('nom parentCategory');
    if (!parent) break;
    const parentPath = parent.nom.toLowerCase();
    path = `${parentPath}/${path}`;
    parentId = parent.parentCategory;
  }

  category.hierarchy = path;
  next();
});

export const Category = model<ICategory>('Category', categorySchema);
