import { Schema, model, Document } from 'mongoose';


export interface IProduit extends Document {
  nom: string;
  description: string;
  imageUrl?: string;
  verified: boolean;
  lien_produit?: string;
  views: number;
  tags: string[];
  category: Schema.Types.ObjectId;
  fournisseur: Schema.Types.ObjectId;
  checked_by?: Schema.Types.ObjectId;
}

const produitSchema = new Schema<IProduit>({
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  verified: {
    type: Boolean,
    default: false
  },
  lien_produit: String,
  views: {
    type: Number,
    default: 0
  },
  tags: [String],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  fournisseur: {
    type: Schema.Types.ObjectId,
    ref: 'Fournisseur',
    required: true
  },
  checked_by: {
    type: Schema.Types.ObjectId,
    ref: 'Verificateur'
  }
}, { timestamps: true });

export const Produit = model<IProduit>('Produit', produitSchema);