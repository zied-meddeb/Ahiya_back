import mongoose, { Schema, Document } from 'mongoose';

export interface ICatalogue extends Document {
  Fournisseur: Schema.Types.ObjectId;
  name: string;
  pages: {
    imageUrl: string;
    uploadDate: Date;
    pageNumber: number;
  }[];
  createdDate: Date;
  updatedDate: Date;
  pageCount: number;
}

const CatalogueSchema = new Schema<ICatalogue>(
  {
    Fournisseur: {
      type: Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    pages: [{
      imageUrl: {
        type: String,
        required: true,
      },
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      pageNumber: {
        type: Number,
        required: true,
      },
    }],
    createdDate: {
      type: Date,
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Update pageCount when pages are modified
CatalogueSchema.pre('save', function(next) {
  this.pageCount = this.pages.length;
  this.updatedDate = new Date();
  next();
});

export const Catalogue = mongoose.model<ICatalogue>('Catalogue', CatalogueSchema);
