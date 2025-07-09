import { Schema, model, Document } from 'mongoose';

export interface IFavoris extends Document {
  userId: Schema.Types.ObjectId;
  produitId: Schema.Types.ObjectId;
}

const favorisSchema = new Schema<IFavoris>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produitId: {
    type: Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  }
}, { timestamps: true });

export const Favoris = model<IFavoris>('Favoris', favorisSchema);