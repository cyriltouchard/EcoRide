/**
 * Base de données des marques et modèles de véhicules
 * Pour l'ajout/modification de véhicules
 */

const VEHICLE_BRANDS = {
    'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Boxer'],
    'Renault': ['Clio', 'Captur', 'Mégane', 'Kadjar', 'Scenic', 'Talisman', 'Twingo', 'Zoe', 'Kangoo', 'Trafic'],
    'Citroën': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Jumper'],
    'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touran', 'Caddy', 'Transporter', 'Id.3', 'Id.4'],
    'Bmw': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'I3', 'I4', 'Ix1', 'Ix3', 'Z4'],
    'Mercedes': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Gla', 'Glb', 'Glc', 'Vito', 'Sprinter'],
    'Audi': ['A1', 'A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'E-tron'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Probe', 'Transit', 'Transit Custom', 'Mustang'],
    'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'C-HR', 'Highlander', 'Proace', 'Land Cruiser'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'NV200', 'NV300'],
    'Fiat': ['500', 'Panda', '500X', 'Tipo', 'Doblo', 'Ducato'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Vivaro'],
    'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
    'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
    'Dacia': ['Sandero', 'Duster', 'Jogger', 'Spring'],
    'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Ioniq', 'Santa Fe'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Ev6'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Mazda': ['Mazda2', 'Mazda3', 'Cx-3', 'Cx-5', 'Cx-30', 'Mx-30'],
    'Honda': ['Jazz', 'Civic', 'Hr-v', 'Cr-v', 'E:ny1'],
    'Volvo': ['V40', 'V60', 'V90', 'Xc40', 'Xc60', 'Xc90'],
    'Autre': [] // Pour les marques non listées
};

/**
 * Obtenir toutes les marques triées
 */
function getAllBrands() {
    return Object.keys(VEHICLE_BRANDS).sort((a, b) => a.localeCompare(b));
}

/**
 * Normaliser le nom d'une marque (gère la casse et trouve la bonne clé)
 */
function normalizeBrandName(brand) {
    if (!brand) return null;
    
    const cleanBrand = brand.trim();
    
    // Recherche exacte d'abord
    if (VEHICLE_BRANDS[cleanBrand]) {
        return cleanBrand;
    }
    
    // Recherche insensible à la casse
    const brandLower = cleanBrand.toLowerCase();
    const foundKey = Object.keys(VEHICLE_BRANDS).find(key => key.toLowerCase() === brandLower);
    
    if (foundKey) {
        return foundKey;
    }
    
    return null;
}

/**
 * Obtenir les modèles d'une marque (Version robuste avec debug)
 */
function getModelsByBrand(brand) {
    if (!brand) return [];

    const normalizedBrand = normalizeBrandName(brand);
    if (!normalizedBrand) return [];

    return VEHICLE_BRANDS[normalizedBrand];
}
