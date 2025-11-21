/**
 * Base de données des marques et modèles de véhicules
 * Pour l'ajout/modification de véhicules
 */

const VEHICLE_BRANDS = {
    'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Boxer'],
    'Renault': ['Clio', 'Captur', 'Mégane', 'Kadjar', 'Scenic', 'Talisman', 'Twingo', 'Zoe', 'Kangoo', 'Trafic'],
    'Citroën': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Jumper'],
    'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touran', 'Caddy', 'Transporter', 'ID.3', 'ID.4'],
    'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'i3', 'i4', 'iX', 'iX3', 'Z4'],
    'Mercedes': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'GLA', 'GLB', 'GLC', 'Vito', 'Sprinter'],
    'Audi': ['A1', 'A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'e-tron'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Probe', 'Transit', 'Transit Custom', 'Mustang Mach-E'],
    'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'C-HR', 'Highlander', 'Proace', 'Land Cruiser'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'NV200', 'NV300'],
    'Fiat': ['500', 'Panda', '500X', 'Tipo', 'Doblo', 'Ducato'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Vivaro'],
    'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
    'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
    'Dacia': ['Sandero', 'Duster', 'Jogger', 'Spring'],
    'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Ioniq', 'Santa Fe'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'EV6'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-30', 'MX-30'],
    'Honda': ['Jazz', 'Civic', 'HR-V', 'CR-V', 'e:Ny1'],
    'Volvo': ['V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
    'Autre': [] // Pour les marques non listées
};

/**
 * Obtenir toutes les marques triées
 */
function getAllBrands() {
    return Object.keys(VEHICLE_BRANDS).sort((a, b) => a.localeCompare(b));
}

/**
 * Obtenir les modèles d'une marque (Version robuste avec debug)
 */
function getModelsByBrand(brand) {
    // 1. Vérification de sécurité
    if (!brand) {
        console.warn('[vehicle-data] Aucune marque sélectionnée');
        return [];
    }

    // 2. Nettoyage de la valeur (trim pour retirer les espaces)
    const cleanBrand = brand.trim();

    // 3. Recherche de la marque
    const models = VEHICLE_BRANDS[cleanBrand];

    // 4. Debugging : Si on ne trouve pas la marque
    if (!models) {
        console.warn(`[vehicle-data] La marque "${cleanBrand}" n'existe pas dans VEHICLE_BRANDS`);
        console.log('[vehicle-data] Clés disponibles:', Object.keys(VEHICLE_BRANDS));
        console.log('[vehicle-data] Valeur reçue (avec espaces visibles):', `"${brand}"`);
        return [];
    }

    console.log(`[vehicle-data] Marque "${cleanBrand}" trouvée: ${models.length} modèles disponibles`);
    return models;
}
