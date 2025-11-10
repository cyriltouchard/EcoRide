// Créer des données de test (véhicule + trajets)
require('dotenv').config();
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: String,
    model: String,
    plate: String,
    color: String,
    energy: String,
    seats: Number,
    year: Number
});

const rideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    departure: String,
    arrival: String,
    departureDate: Date,
    departureTime: String,
    price: Number,
    totalSeats: Number,
    availableSeats: Number,
    status: String,
    isEcologic: Boolean,
    description: String
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Ride = mongoose.model('Ride', rideSchema);
const User = mongoose.model('User', new mongoose.Schema({
    pseudo: String,
    email: String,
    password: String,
    sql_id: Number
}));

async function createTestData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // Trouver l'utilisateur test
        const user = await User.findOne({ email: 'final@ecoride.fr' });
        if (!user) {
            console.log('❌ Utilisateur final@ecoride.fr non trouvé');
            process.exit(1);
        }
        console.log('✅ Utilisateur trouvé:', user.pseudo);

        // Créer un véhicule
        let vehicle = await Vehicle.findOne({ userId: user._id });
        if (!vehicle) {
            vehicle = new Vehicle({
                userId: user._id,
                brand: 'Tesla',
                model: 'Model 3',
                plate: 'AB-123-CD',
                color: 'Blanc',
                energy: 'electric',
                seats: 4,
                year: 2023
            });
            await vehicle.save();
            console.log('✅ Véhicule créé:', vehicle.brand, vehicle.model);
        } else {
            console.log('✅ Véhicule existant:', vehicle.brand, vehicle.model);
        }

        // Créer des trajets de test
        const rides = [
            {
                driver: user._id,
                vehicle: vehicle._id,
                departure: 'Paris',
                arrival: 'Lyon',
                departureDate: new Date('2025-10-30'),
                departureTime: '08:00',
                price: 35,
                totalSeats: 3,
                availableSeats: 3,
                status: 'scheduled',
                isEcologic: true,
                description: 'Trajet écologique Paris-Lyon'
            },
            {
                driver: user._id,
                vehicle: vehicle._id,
                departure: 'Lyon',
                arrival: 'Marseille',
                departureDate: new Date('2025-10-31'),
                departureTime: '14:30',
                price: 25,
                totalSeats: 3,
                availableSeats: 2,
                status: 'scheduled',
                isEcologic: true,
                description: 'Trajet écologique Lyon-Marseille'
            },
            {
                driver: user._id,
                vehicle: vehicle._id,
                departure: 'Paris',
                arrival: 'Bordeaux',
                departureDate: new Date('2025-11-01'),
                departureTime: '10:00',
                price: 40,
                totalSeats: 3,
                availableSeats: 3,
                status: 'scheduled',
                isEcologic: true,
                description: 'Trajet écologique Paris-Bordeaux'
            }
        ];

        for (const rideData of rides) {
            const existing = await Ride.findOne({ 
                departure: rideData.departure, 
                arrival: rideData.arrival, 
                departureDate: rideData.departureDate 
            });
            if (!existing) {
                const ride = new Ride(rideData);
                await ride.save();
                console.log(`✅ Trajet créé: ${rideData.departure} → ${rideData.arrival}`);
            } else {
                console.log(`⚠️  Trajet existant: ${rideData.departure} → ${rideData.arrival}`);
            }
        }

        console.log('\n🎉 Données de test créées avec succès!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

createTestData();
