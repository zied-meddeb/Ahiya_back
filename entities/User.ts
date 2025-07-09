import { Schema, model, Document } from 'mongoose';

export interface ILastViewedProduct {
  product: Schema.Types.ObjectId;
  viewedAt: Date;
}

export interface ISearchHistory {
  query: string;
  searchedAt: Date;
}

export interface IUser extends Document {
  nom: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode?: string;
  favoriteCategories: Schema.Types.ObjectId[];
  lastViewedProducts: ILastViewedProduct[];
  searchHistory: ISearchHistory[];
}

const userSchema = new Schema<IUser>({
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  favoriteCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  lastViewedProducts: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Produit'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  searchHistory: [{
    query: String,
    searchedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

userSchema.index(
  { "createdAt": 1 },
  { expireAfterSeconds: 3600, partialFilterExpression: { isVerified: false } }
);

export const User = model<IUser>('User', userSchema);