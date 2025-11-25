/**
 * Tests unitaires pour le système de commission sur les trajets
 * @file creditModel.commission.test.js
 */

const CreditModel = require('../../../models/creditModel');
const { pool } = require('../../../config/db-mysql');

// Mock de la connexion à la base de données
jest.mock('../../../config/db-mysql');

describe('Système de Commission - CreditModel.processBooking', () => {
    let mockConnection;
    
    beforeEach(() => {
        // Configuration du mock de connexion
        mockConnection = {
            execute: jest.fn(),
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };
        
        pool.getConnection = jest.fn().mockResolvedValue(mockConnection);
        
        // Mock des méthodes statiques
        CreditModel.canAfford = jest.fn().mockResolvedValue(true);
        CreditModel.getUserCredits = jest.fn().mockResolvedValue({
            user_id: 'test-user',
            current_credits: 100
        });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Commission de 2 crédits - Prix > 2', () => {
        test('Prix de 25 crédits : plateforme reçoit 2, chauffeur reçoit 23', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                25,
                'ride-id',
                'booking-id'
            );
            
            // Vérifier les montants
            expect(result.amount_charged).toBe(25);
            expect(result.platform_commission).toBe(2);
            expect(result.driver_earned).toBe(23);
            expect(result.warning).toBeNull();
            
            // Vérifier que 3 transactions ont été créées
            expect(mockConnection.execute).toHaveBeenCalledTimes(3);
            
            // Transaction 1 : Dépense du passager (25 crédits)
            expect(mockConnection.execute).toHaveBeenNthCalledWith(1,
                expect.stringContaining('INSERT INTO credit_transactions'),
                expect.arrayContaining(['passenger-id', 25])
            );
            
            // Transaction 2 : Commission plateforme (2 crédits)
            expect(mockConnection.execute).toHaveBeenNthCalledWith(2,
                expect.stringContaining('INSERT INTO credit_transactions'),
                expect.arrayContaining(['passenger-id', 2])
            );
            
            // Transaction 3 : Gain du chauffeur (23 crédits)
            expect(mockConnection.execute).toHaveBeenNthCalledWith(3,
                expect.stringContaining('INSERT INTO credit_transactions'),
                expect.arrayContaining(['driver-id', 23])
            );
        });
        
        test('Prix de 5 crédits : plateforme reçoit 2, chauffeur reçoit 3', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                5,
                'ride-id',
                'booking-id'
            );
            
            expect(result.amount_charged).toBe(5);
            expect(result.platform_commission).toBe(2);
            expect(result.driver_earned).toBe(3);
            expect(result.warning).toBeNull();
        });
        
        test('Prix de 3 crédits : plateforme reçoit 2, chauffeur reçoit 1', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                3,
                'ride-id',
                'booking-id'
            );
            
            expect(result.amount_charged).toBe(3);
            expect(result.platform_commission).toBe(2);
            expect(result.driver_earned).toBe(1);
            expect(result.warning).toBeNull();
        });
    });
    
    describe('Cas particuliers - Prix ≤ 2', () => {
        test('Prix de 2 crédits : plateforme prend tout, chauffeur reçoit 0', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                2,
                'ride-id',
                'booking-id'
            );
            
            // Vérifier les montants
            expect(result.amount_charged).toBe(2);
            expect(result.platform_commission).toBe(2);
            expect(result.driver_earned).toBe(0);
            expect(result.warning).toBe('Prix inférieur ou égal à la commission : le chauffeur ne reçoit rien');
            
            // Vérifier que seulement 2 transactions ont été créées (pas de gain chauffeur)
            expect(mockConnection.execute).toHaveBeenCalledTimes(2);
            
            // Transaction 1 : Dépense du passager
            expect(mockConnection.execute).toHaveBeenNthCalledWith(1,
                expect.stringContaining('INSERT INTO credit_transactions'),
                expect.arrayContaining(['passenger-id', 2])
            );
            
            // Transaction 2 : Commission plateforme (totalité)
            expect(mockConnection.execute).toHaveBeenNthCalledWith(2,
                expect.stringContaining('INSERT INTO credit_transactions'),
                expect.arrayContaining(['passenger-id', 2])
            );
            
            // PAS de transaction 3 pour le chauffeur
        });
        
        test('Prix de 1 crédit : plateforme prend tout, chauffeur reçoit 0', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                1,
                'ride-id',
                'booking-id'
            );
            
            expect(result.amount_charged).toBe(1);
            expect(result.platform_commission).toBe(1);
            expect(result.driver_earned).toBe(0);
            expect(result.warning).toBeTruthy();
            
            // Seulement 2 transactions
            expect(mockConnection.execute).toHaveBeenCalledTimes(2);
        });
        
        test('Prix de 0.5 crédit : plateforme prend tout, chauffeur reçoit 0', async () => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                0.5,
                'ride-id',
                'booking-id'
            );
            
            expect(result.amount_charged).toBe(0.5);
            expect(result.platform_commission).toBe(0.5);
            expect(result.driver_earned).toBe(0);
            expect(result.warning).toBeTruthy();
        });
    });
    
    describe('Gestion des erreurs', () => {
        test('Crédits insuffisants : rejette la transaction', async () => {
            CreditModel.canAfford = jest.fn().mockResolvedValue(false);
            
            await expect(
                CreditModel.processBooking('passenger-id', 'driver-id', 25, 'ride-id', 'booking-id')
            ).rejects.toThrow('Crédits insuffisants pour cette réservation');
            
            // Vérifier que la transaction a été rollback
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.commit).not.toHaveBeenCalled();
        });
        
        test('Erreur lors de l\'insertion : rollback automatique', async () => {
            mockConnection.execute.mockRejectedValueOnce(new Error('Erreur DB'));
            
            await expect(
                CreditModel.processBooking('passenger-id', 'driver-id', 25, 'ride-id', 'booking-id')
            ).rejects.toThrow('Erreur DB');
            
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.commit).not.toHaveBeenCalled();
        });
    });
    
    describe('Validation des montants', () => {
        test.each([
            [2.5, 2, 0.5],
            [10, 2, 8],
            [100, 2, 98],
            [2.01, 2, 0.01]
        ])('Prix %d crédits => Commission %d, Chauffeur %d', async (price, expectedCommission, expectedDriver) => {
            const result = await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                price,
                'ride-id',
                'booking-id'
            );
            
            expect(result.platform_commission).toBe(expectedCommission);
            expect(result.driver_earned).toBeCloseTo(expectedDriver, 2);
        });
    });
    
    describe('Intégrité des transactions', () => {
        test('Toutes les transactions doivent être dans une seule transaction DB', async () => {
            await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                25,
                'ride-id',
                'booking-id'
            );
            
            // Vérifier l'ordre des opérations
            expect(mockConnection.beginTransaction).toHaveBeenCalledBefore(mockConnection.execute);
            expect(mockConnection.execute).toHaveBeenCalledBefore(mockConnection.commit);
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
        
        test('Les IDs de réservation et trajet sont bien transmis', async () => {
            await CreditModel.processBooking(
                'passenger-id',
                'driver-id',
                25,
                'ride-123',
                'booking-456'
            );
            
            // Toutes les transactions doivent contenir les IDs
            const calls = mockConnection.execute.mock.calls;
            calls.forEach(call => {
                const params = call[1];
                expect(params).toContain('booking-456');
                expect(params).toContain('ride-123');
            });
        });
    });
});

describe('Validation Frontend - Avertissement Prix Bas', () => {
    test('Prix ≤ 2 doit déclencher un avertissement', () => {
        const validatePriceWarning = (price) => {
            return price > 0 && price <= 2;
        };
        
        expect(validatePriceWarning(0)).toBe(false);  // Pas d'avertissement pour gratuit
        expect(validatePriceWarning(0.5)).toBe(true); // Avertissement
        expect(validatePriceWarning(1)).toBe(true);   // Avertissement
        expect(validatePriceWarning(2)).toBe(true);   // Avertissement
        expect(validatePriceWarning(2.01)).toBe(false); // Pas d'avertissement
        expect(validatePriceWarning(3)).toBe(false);  // Pas d'avertissement
    });
});
