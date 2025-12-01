const Review = require('../models/reviewModel');
const { errorResponse, successResponse } = require('../utils/validators');
const { handleError } = require('../utils/errorHandler');

// Obtenir les avis en attente
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'pending' })
            .populate('authorId', 'pseudo')
            .populate('driverId', 'pseudo');
        return successResponse(res, 200, 'Avis en attente récupérés avec succès', { reviews });
    } catch (error) {
        return handleError(error, res, 'Erreur serveur');
    }
};

// Mettre à jour le statut d'un avis
exports.updateReviewStatus = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return errorResponse(res, 400, 'Statut invalide.');
    }
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return errorResponse(res, 404, 'Avis non trouvé.');
        }
        review.status = status;
        await review.save();
        return successResponse(res, 200, `Avis ${status === 'approved' ? 'approuvé' : 'rejeté'}.`, { review });
    } catch (error) {
        return handleError(error, res, 'Erreur serveur');
    }
};
