import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  nom: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategory?: Schema.Types.ObjectId;
}

const categorySchema = new Schema<ICategory>({
  nom: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  imageUrl: String,
  displayOrder: {
    type: Number,
    default: 0
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
}, { timestamps: true });

export const Category = model<ICategory>('Category', categorySchema);