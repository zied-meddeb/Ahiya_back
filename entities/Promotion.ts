import { Schema, model, Document } from "mongoose";

export interface IPromotion extends Document {
  Fournisseur: Schema.Types.ObjectId;
  type: "Biens" | "Services";
  afficheUrls: string[];
  description: string;
  prix_original: number;
  prix_offre: number;
  date_debut: Date;
  date_fin: Date;
  date_affiche: Date;
  date_affiche_fin: Date;
  produit?: Schema.Types.ObjectId;
  statut: String;
  titre: String;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    Fournisseur: {
      type: Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    },
    type: {
      type: String,
      enum: ["Biens", "Services"],
      required: true,
    },

    afficheUrls: {
      type: [String],
      required: true,
      unique: true,
      set: (v: string[]) => Array.from(new Set(v)),
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one affiche URL is required",
      },
    },
    titre: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    prix_original: {
      type: Number,
      required: true,
    },
    prix_offre: {
      type: Number,
      required: true,
    },
    date_debut: {
      type: Date,
      required: true,
    },
    date_fin: {
      type: Date,
      required: true,
    },
    date_affiche: {
      type: Date,
      required: true,
    },
    date_affiche_fin: {
      type: Date,
      required: true,
    },
    produit: {
      type: Schema.Types.ObjectId,
      ref: "Produit",
      required: true,
    },
    statut: {
      type: String,
      enum: ["ATT_VER", "REJETE", "VALIDE", "ACTIVE"],
      default: "ATT_VER",
    },
  },
  { timestamps: true }
);

export const Promotion = model<IPromotion>("Promotion", PromotionSchema);
