const Review = require('../models/reviewModel');

// Obtenir les avis en attente
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'pending' })
            .populate('authorId', 'pseudo')
            .populate('driverId', 'pseudo');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur' });
    }
};

// Mettre à jour le statut d'un avis
exports.updateReviewStatus = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Statut invalide.' });
    }
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ msg: 'Avis non trouvé.' });
        }
        review.status = status;
        await review.save();
        res.json({ msg: `Avis ${status === 'approved' ? 'approuvé' : 'rejeté'}.` });
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur' });
    }
};
