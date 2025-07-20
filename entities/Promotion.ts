import { Schema, model, Document } from 'mongoose';

export interface IPromotion extends Document {
  Fournisseur: Schema.Types.ObjectId;
  type: 'Biens' | 'Services';
  afficheUrl: string;
  description: string;
  prix_original: number;
  prix_offre: number;
  date_debut: Date;
  date_fin: Date;
  produits?: Schema.Types.ObjectId[];
  statut:String
}


const PromotionSchema = new Schema<IPromotion>({
    Fournisseur: {
    type: Schema.Types.ObjectId,
    ref: 'Fournisseur',
    required: true
  },
  type: {
    type: String,
    enum: ['Biens', 'Services'],
    required: true
  },

  afficheUrl: {
    type: String,
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
  ],
  statut:{
    type: String,
    enum: ['ATT_VER', 'REJETE','VALIDE','ACTIVE'],
    default: 'ATT_VER'
  }
}, { timestamps: true });

export const Promotion = model<IPromotion>('Promotion', PromotionSchema);