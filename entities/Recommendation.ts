import { Schema, model, Document } from 'mongoose';

export interface IRecommendedProduct {
  product: Schema.Types.ObjectId;
  score: number;
}

export interface IRecommendation extends Document {
  userId: Schema.Types.ObjectId;
  recommendedProducts: IRecommendedProduct[];
  lastUpdated: Date;
}

const recommendationSchema = new Schema<IRecommendation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendedProducts: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Produit'
    },
    score: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Recommendation = model<IRecommendation>('Recommendation', recommendationSchema);