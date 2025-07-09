import { Schema, model, Document } from 'mongoose';

export interface IPromotion extends Document {
  type: 'Biens' | 'Services';
  description: string;
  prix_original: number;
  prix_offre: number;
  date_debut: Date;
  date_fin: Date;
  produits?: Schema.Types.ObjectId[];
}

const PromotionSchema = new Schema<IPromotion>({
  type: {
    type: String,
    enum: ['Biens', 'Services'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  prix_original: {
    type: Number,
    required: true
  },
  prix_offre: {
    type: Number,
    required: true
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
  produits: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Produit'
    }
  ]
}, { timestamps: true });

export const Promotion = model<IPromotion>('Promotion', PromotionSchema);