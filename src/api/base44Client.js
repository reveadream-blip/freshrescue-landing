// On n'importe plus le SDK propriétaire
// On crée un simulateur de données (Mock) pour que l'app ne plante pas
export const base44 = {
  entities: {
    // Cette fonction simulera la récupération de tes données
    get: async (entityName) => {
      console.log(`Appel local pour l'entité : ${entityName}`);
      // Ici, on pourra charger des fichiers JSON locaux plus tard
      return []; 
    },
    // Simulation de l'utilisateur connecté
    User: {
      me: async () => ({ id: '1', name: 'David', role: 'admin' })
    }
  },
  functions: {
    call: async (name, params) => {
      console.log(`Appel de fonction locale : ${name}`);
      return { success: true };
    }
  }
};