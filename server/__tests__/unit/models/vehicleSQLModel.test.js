/**
 * Tests unitaires pour vehicleSQLModel
 * Couvre la validation et les opérations CRUD
 */

const VehicleSQL = require('../../../models/vehicleSQLModel');

describe('VehicleSQLModel', () => {
  
  describe('validateVehicleData', () => {
    
    it('devrait valider des données de véhicule correctes', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors).toEqual([]);
    });

    it('devrait rejeter une marque trop courte', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'R',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('marque');
    });

    it('devrait rejeter un modèle trop court', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'C',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('modèle'))).toBe(true);
    });

    it('devrait rejeter une plaque d\'immatriculation invalide', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: '12345',
        energy_type: 'essence',
        available_seats: 4
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('immatriculation'))).toBe(true);
    });

    it('devrait rejeter un type d\'énergie invalide', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'nucleaire',
        available_seats: 4
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('énergie'))).toBe(true);
    });

    it('devrait accepter les types d\'énergie valides', () => {
      const validEnergyTypes = ['essence', 'diesel', 'electrique', 'hybride'];

      validEnergyTypes.forEach(energyType => {
        const vehicleData = {
          user_id: 1,
          brand: 'Renault',
          model: 'Clio',
          license_plate: 'AB123CD',
          energy_type: energyType,
          available_seats: 4
        };

        const errors = VehicleSQL.validateVehicleData(vehicleData);

        expect(errors.filter(e => e.includes('énergie'))).toEqual([]);
      });
    });

    it('devrait rejeter un nombre de places trop élevé', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 10
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('places'))).toBe(true);
    });

    it('devrait rejeter un nombre de places négatif', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: -1
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('places'))).toBe(true);
    });

    it('devrait accepter des champs optionnels', () => {
      const vehicleData = {
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4,
        color: 'Rouge',
        first_registration: '2020-01-01'
      };

      const errors = VehicleSQL.validateVehicleData(vehicleData);

      expect(errors).toEqual([]);
    });
  });
});
