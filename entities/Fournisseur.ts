import { Schema, model, Document } from 'mongoose';

export interface ISocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface IStoreInfo {
  website?: string;
  logoUrl?: string;
  description?: string;
  socialMedia?: ISocialMedia;
}

export interface IPerformanceMetrics {
  totalProductsListed: number;
  clickThroughRate: number;
}

export interface IFournisseur extends Document {
  nom: string;
  email: string;
  password: string;
  telephone: string;
  adresse: string;
  isVerified: boolean;
  verificationCode?: string;
  storeInfo?: IStoreInfo;
  performanceMetrics?: IPerformanceMetrics;
}

const fournisseurSchema = new Schema<IFournisseur>({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Entrer un email valide'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Mot de passe doit contenir au moins 8 caractères'],
  },
  telephone: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{8}$/.test(v) || /^\+[1-9]\d{1,14}$/.test(v);
      },
      message: 'Numéro de téléphone doit être 8 chiffres'
    }
  },
  adresse: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  storeInfo: {
    website: String,
    logoUrl: String,
    description: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  performanceMetrics: {
    totalProductsListed: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

export const Fournisseur = model<IFournisseur>('Fournisseur', fournisseurSchema);