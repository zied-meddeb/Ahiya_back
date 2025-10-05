import { Catalogue, ICatalogue } from '../entities/Catalogue';
import { ServiceError } from '../utils/ErrorResponse';

export interface CatalogueResponse {
  success: boolean;
  data?: ICatalogue;
  message?: string;
}

export interface CataloguesResponse {
  success: boolean;
  data?: ICatalogue[];
  message?: string;
}

export const catalogueService = {
  // Get all catalogues for a fournisseur
  getCataloguesByFournisseur: async (fournisseurId: string): Promise<CataloguesResponse> => {
    try {
      const catalogues = await Catalogue.find({ Fournisseur: fournisseurId })
        .sort({ createdDate: -1 })
        .populate('Fournisseur', 'nom email');

      return { success: true, data: catalogues };
    } catch (error: any) {
      console.error('Error fetching catalogues:', error);
      throw new ServiceError(error.message, 500);
    }
  },

  // Get a single catalogue by ID
  getCatalogueById: async (catalogueId: string): Promise<CatalogueResponse> => {
    try {
      const catalogue = await Catalogue.findById(catalogueId)
        .populate('Fournisseur', 'nom email');

      if (!catalogue) {
        throw new ServiceError('Catalogue not found', 404);
      }

      return { success: true, data: catalogue };
    } catch (error: any) {
      console.error('Error fetching catalogue:', error);
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(error.message, 500);
    }
  },

  // Create a new catalogue
  createCatalogue: async (catalogueData: Partial<ICatalogue>): Promise<CatalogueResponse> => {
    try {
      const catalogue = new Catalogue(catalogueData);
      await catalogue.save();
      
      const populatedCatalogue = await Catalogue.findById(catalogue._id)
        .populate('Fournisseur', 'nom email');

      return { success: true, data: populatedCatalogue! };
    } catch (error: any) {
      console.error('Error creating catalogue:', error);
      throw new ServiceError(error.message, 500);
    }
  },

  // Update a catalogue
  updateCatalogue: async (catalogueId: string, updateData: Partial<ICatalogue>): Promise<CatalogueResponse> => {
    try {
      const catalogue = await Catalogue.findByIdAndUpdate(
        catalogueId,
        { ...updateData, updatedDate: new Date() },
        { new: true, runValidators: true }
      ).populate('Fournisseur', 'nom email');

      if (!catalogue) {
        throw new ServiceError('Catalogue not found', 404);
      }

      return { success: true, data: catalogue };
    } catch (error: any) {
      console.error('Error updating catalogue:', error);
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(error.message, 500);
    }
  },

  // Delete a catalogue
  deleteCatalogue: async (catalogueId: string): Promise<CatalogueResponse> => {
    try {
      const catalogue = await Catalogue.findByIdAndDelete(catalogueId);

      if (!catalogue) {
        throw new ServiceError('Catalogue not found', 404);
      }

      return { success: true, data: catalogue };
    } catch (error: any) {
      console.error('Error deleting catalogue:', error);
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(error.message, 500);
    }
  },

  // Add a page to a catalogue
  addPageToCatalogue: async (catalogueId: string, pageData: { imageUrl: string }): Promise<CatalogueResponse> => {
    try {
      const catalogue = await Catalogue.findById(catalogueId);
      
      if (!catalogue) {
        throw new ServiceError('Catalogue not found', 404);
      }

      const newPage = {
        imageUrl: pageData.imageUrl,
        uploadDate: new Date(),
        pageNumber: catalogue.pages.length + 1,
      };

      catalogue.pages.push(newPage);
      await catalogue.save();

      const updatedCatalogue = await Catalogue.findById(catalogueId)
        .populate('Fournisseur', 'nom email');

      return { success: true, data: updatedCatalogue! };
    } catch (error: any) {
      console.error('Error adding page to catalogue:', error);
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(error.message, 500);
    }
  },

  // Remove a page from a catalogue
  removePageFromCatalogue: async (catalogueId: string, pageIndex: number): Promise<CatalogueResponse> => {
    try {
      const catalogue = await Catalogue.findById(catalogueId);
      
      if (!catalogue) {
        throw new ServiceError('Catalogue not found', 404);
      }

      if (pageIndex < 0 || pageIndex >= catalogue.pages.length) {
        throw new ServiceError('Invalid page index', 400);
      }

      // Remove the page
      catalogue.pages.splice(pageIndex, 1);

      // Update page numbers
      catalogue.pages.forEach((page, index) => {
        page.pageNumber = index + 1;
      });

      await catalogue.save();

      const updatedCatalogue = await Catalogue.findById(catalogueId)
        .populate('Fournisseur', 'nom email');

      return { success: true, data: updatedCatalogue! };
    } catch (error: any) {
      console.error('Error removing page from catalogue:', error);
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(error.message, 500);
    }
  },
};
