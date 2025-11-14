/**
 * Base de données des marques et modèles de véhicules
 * Pour l'ajout/modification de véhicules
 */

const VEHICLE_BRANDS = {
    'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Boxer'],
    'Renault': ['Clio', 'Captur', 'Mégane', 'Kadjar', 'Scenic', 'Talisman', 'Twingo', 'Zoe', 'Kangoo', 'Trafic'],
    'Citroën': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Jumper'],
    'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touran', 'Caddy', 'Transporter', 'ID.3', 'ID.4'],
    'BMW': ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'X1', 'X3', 'X5', 'i3', 'iX'],
    'Mercedes': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'GLA', 'GLB', 'GLC', 'Vito', 'Sprinter'],
    'Audi': ['A1', 'A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'e-tron'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Transit', 'Transit Custom', 'Mustang Mach-E'],
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
    return Object.keys(VEHICLE_BRANDS).sort();
}

/**
 * Obtenir les modèles d'une marque
 */
function getModelsByBrand(brand) {
    return VEHICLE_BRANDS[brand] || [];
}
