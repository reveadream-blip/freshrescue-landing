
const apiInstance = {
  auth: {
    // Simulation de l'utilisateur connecté avec ton e-mail
    me: async () => ({ 
      id: 'admin-1', 
      name: 'Natcha', 
      email: 'contact.applimanagement@gmail.com', 
      role: 'admin' 
    })
  },
  entities: {
    // Cette fonction simulera la récupération de tes données (ex: liste des offres)
    get: async (entityName) => {
      console.log(`[FreshRescue] Appel local pour l'entité : ${entityName}`);
      return []; 
    },
    // Simulation pour les profils marchands (utilisé dans PostOffer.jsx)
    MerchantProfile: {
      filter: async ({ created_by }) => {
        console.log(`[FreshRescue] Filtrage profil pour : ${created_by}`);
        return [
          { 
            id: 'p1', 
            shop_name: 'FreshRescue Shop', 
            address: 'Rawai, Phuket',
            created_by: 'contact.applimanagement@gmail.com'
          }
        ];
      }
    }
  },
  functions: {
    call: async (name, params) => {
      console.log(`[FreshRescue] Appel de fonction locale : ${name}`);
      return { success: true };
    }
  }
};

// Exportation sous le nouveau nom pour ton nouveau branding
export const api = apiInstance;
