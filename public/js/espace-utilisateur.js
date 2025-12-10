/**
 * EcoRide - Espace utilisateur
 * Gestion du dashboard utilisateur (profil, véhicules, trajets, notes)
 * @file espace-utilisateur.js
 */

/**
 * Compresse une image avant de l'envoyer au serveur
 * Version améliorée avec gestion EXIF et optimisation mobile
 * @param {File} file - Fichier image à compresser
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @param {number} quality - Qualité JPEG (0-1)
 * @returns {Promise<string>} - Image en base64
 */
const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onerror = () => reject(new Error('Image invalide ou corrompue'));
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculer les nouvelles dimensions en conservant le ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    // Assurer des dimensions minimales
                    if (width < 100 || height < 100) {
                        reject(new Error('Image trop petite (minimum 100x100 pixels)'));
                        return;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d', { alpha: false });
                    
                    // Fond blanc pour les images transparentes
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    
                    // Améliorer la qualité du rendu
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Dessiner l'image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir en base64 avec compression progressive
                    let imageData = canvas.toDataURL('image/jpeg', quality);
                    let currentQuality = quality;
                    
                    // Si l'image est trop grosse (>2MB en base64), réduire la qualité
                    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
                    while (imageData.length > maxSizeBytes && currentQuality > 0.3) {
                        currentQuality -= 0.1;
                        imageData = canvas.toDataURL('image/jpeg', currentQuality);
                    }
                    
                    // Vérification finale de la taille
                    if (imageData.length > 5 * 1024 * 1024) {
                        reject(new Error('Image trop volumineuse après compression'));
                        return;
                    }
                    
                    console.log(`✅ Image compressée: ${Math.round(imageData.length / 1024)}KB, qualité: ${Math.round(currentQuality * 100)}%`);
                    resolve(imageData);
                    
                } catch (error) {
                    reject(new Error(`Erreur de compression: ${error.message}`));
                }
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });
};

/**
 * Initialise les gestionnaires de modales de véhicules
 */
const initVehicleModals = (fetchWithAuth, loadUserVehicles) => {
    const addModal = document.getElementById('add-vehicle-modal');
    const editModal = document.getElementById('edit-vehicle-modal');
    const addForm = document.getElementById('add-vehicle-form-modal');
    const editForm = document.getElementById('edit-vehicle-form-modal');

    if (!addModal || !editModal || !addForm || !editForm) return;

    // ==================== INITIALISATION MARQUES/MODÈLES ====================
    
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');
    const modelCustomInput = document.getElementById('model-custom');
    const editBrandSelect = document.getElementById('edit-brand-modal');
    const editModelSelect = document.getElementById('edit-model-modal');
    const editModelCustomInput = document.getElementById('edit-model-custom');

    // Fonction pour peupler les marques
    const populateBrands = (selectElement) => {
        const brands = getAllBrands();
        selectElement.innerHTML = '<option value="">-- Choisir une marque --</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            selectElement.appendChild(option);
        });
    };

    // Fonction pour peupler les modèles
    const populateModels = (brandValue, selectElement, customInput) => {
        const cleanBrand = brandValue ? brandValue.trim() : '';
        
        if (!cleanBrand) {
            selectElement.innerHTML = '<option value="">-- Choisir un modèle --</option>';
            selectElement.disabled = true;
            return;
        }
        
        const models = getModelsByBrand(cleanBrand);
        selectElement.innerHTML = '<option value="">-- Choisir un modèle --</option>';
        
        if (models.length === 0) {
            selectElement.disabled = true;
            customInput.required = true;
            customInput.placeholder = 'Tapez le modèle';
            showNotification('Tapez le modèle manuellement', 'info');
        } else {
            selectElement.disabled = false;
            customInput.required = false;
            customInput.placeholder = 'Modèle personnalisé (optionnel)';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                selectElement.appendChild(option);
            });
        }
    };

    // Initialiser les marques
    populateBrands(brandSelect);
    populateBrands(editBrandSelect);

    // Gérer le changement de marque (ajout)
    brandSelect.addEventListener('change', (e) => {
        populateModels(e.target.value, modelSelect, modelCustomInput);
    });

    // Gérer le changement de marque (édition)
    editBrandSelect.addEventListener('change', (e) => {
        populateModels(e.target.value, editModelSelect, editModelCustomInput);
    });

    // Forcer majuscules sur immatriculation (ajout)
    const plateInput = document.getElementById('plate');
    if (plateInput) {
        plateInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Forcer majuscules sur immatriculation (édition)
    const editPlateInput = document.getElementById('edit-plate-modal');
    if (editPlateInput) {
        editPlateInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // ==================== FIN INITIALISATION ====================

    // Gestionnaires d'ouverture/fermeture
    document.getElementById('add-vehicle-btn')?.addEventListener('click', () => addModal.classList.add('active'));
    document.getElementById('close-modal-btn')?.addEventListener('click', () => addModal.classList.remove('active'));
    document.getElementById('close-edit-modal-btn')?.addEventListener('click', () => editModal.classList.remove('active'));
    
    window.addEventListener('click', (e) => {
        if (e.target === addModal) addModal.classList.remove('active');
        if (e.target === editModal) editModal.classList.remove('active');
    });

    // Soumission formulaire d'ajout
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Utiliser le modèle personnalisé si renseigné, sinon le select
        const modelValue = formData.get('model-custom')?.trim() || formData.get('model');
        
        if (!modelValue) {
            showNotification('Veuillez sélectionner ou saisir un modèle', 'error');
            return;
        }
        
        // Normaliser les accents pour l'énergie (électrique -> electrique)
        const energyValue = formData.get('energy').toLowerCase()
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, ''); // Supprime les accents
        
        const vehicleData = {
            brand: formData.get('brand'),
            model: modelValue,
            plate: formData.get('plate').toUpperCase(),
            energy: energyValue,
            seats: Number.parseInt(formData.get('seats'))
        };
        
        console.log('🚗 Données du véhicule à envoyer:', vehicleData);
        
        try {
            await fetchWithAuth(`${API_BASE_URL}/vehicles`, { 
                method: 'POST', 
                body: JSON.stringify(vehicleData) 
            });
            showNotification('Véhicule ajouté !', 'success');
            addModal.classList.remove('active');
            e.target.reset();
            modelSelect.disabled = true;
            loadUserVehicles();
        } catch (error) {
            console.error('❌ Erreur complète:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
        }
    });

    // Soumission formulaire de modification
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const vehicleId = formData.get('edit-vehicle-id');
        
        // Utiliser le modèle personnalisé si renseigné, sinon le select
        const modelValue = formData.get('model-custom')?.trim() || formData.get('model');
        
        if (!modelValue) {
            showNotification('Veuillez sélectionner ou saisir un modèle', 'error');
            return;
        }
        
        const vehicleData = {
            brand: formData.get('brand'),
            model: modelValue,
            energy_type: formData.get('energy').toLowerCase(),
            available_seats: Number.parseInt(formData.get('seats'))
        };
        
        try {
            await fetchWithAuth(`${API_BASE_URL}/vehicles/${vehicleId}`, { 
                method: 'PUT', 
                body: JSON.stringify(vehicleData) 
            });
            showNotification('Véhicule mis à jour !', 'success');
            editModal.classList.remove('active');
            loadUserVehicles();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, 'error');
        }
    });

    return editModal;
};

/**
 * Initialise les gestionnaires de photo de profil
 */
const initProfilePictureHandlers = (fetchWithAuth) => {
    console.log('🔧 Initialisation des gestionnaires de photo de profil');
    
    const pictureModal = document.getElementById('picture-modal');
    const editPictureBtn = document.getElementById('edit-picture-btn');
    const closePictureModalBtn = document.getElementById('close-picture-modal-btn');
    const pictureForm = document.getElementById('picture-form');
    const useFileBtn = document.getElementById('use-file-btn');
    const useUrlBtn = document.getElementById('use-url-btn');
    const fileUploadSection = document.getElementById('file-upload-section');
    const urlUploadSection = document.getElementById('url-upload-section');
    
    console.log('📋 Éléments trouvés:', {
        pictureModal: !!pictureModal,
        pictureForm: !!pictureForm,
        editPictureBtn: !!editPictureBtn
    });

    if (useFileBtn && useUrlBtn && fileUploadSection && urlUploadSection) {
        useFileBtn.addEventListener('click', () => {
            fileUploadSection.style.display = 'block';
            urlUploadSection.style.display = 'none';
            useFileBtn.style.background = '#4CAF50';
            useUrlBtn.style.background = '#2196F3';
        });

        useUrlBtn.addEventListener('click', () => {
            fileUploadSection.style.display = 'none';
            urlUploadSection.style.display = 'block';
            useFileBtn.style.background = '#2196F3';
            useUrlBtn.style.background = '#4CAF50';
        });
    }

    // Aperçu de l'image sélectionnée
    const fileInput = document.getElementById('profileImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) {
                console.log('📁 Fichier sélectionné:', {
                    name: file.name,
                    type: file.type,
                    size: `${Math.round(file.size / 1024)}KB`
                });
                
                // Afficher un aperçu si possible
                const reader = new FileReader();
                reader.onload = (event) => {
                    console.log('✅ Fichier chargé, prêt pour l\'upload');
                };
                reader.onerror = () => {
                    console.error('❌ Erreur lecture fichier');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (editPictureBtn && pictureModal) {
        editPictureBtn.addEventListener('click', () => {
            console.log('🖼️ Ouverture modal photo');
            pictureModal.classList.add('active');
        });
    }

    if (closePictureModalBtn && pictureModal) {
        closePictureModalBtn.addEventListener('click', () => {
            console.log('❌ Fermeture modal photo');
            pictureModal.classList.remove('active');
        });
    }

    if (pictureModal) {
        window.addEventListener('click', (e) => {
            if (e.target === pictureModal) {
                console.log('🔙 Clic extérieur - fermeture modal');
                pictureModal.classList.remove('active');
            }
        });
    }

    if (pictureForm) {
        console.log('📝 Ajout du listener submit sur le formulaire');
        
        pictureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🚀 SUBMIT DÉCLENCHÉ - Début traitement');
            
            const fileInput = document.getElementById('profileImageFile');
            const urlInput = document.getElementById('profileImageUrl');
            
            try {
                let imageUrl = '';
                
                if (fileInput?.files?.[0]) {
                    const file = fileInput.files[0];
                    
                    console.log('📸 Fichier sélectionné:', {
                        name: file.name,
                        type: file.type,
                        size: `${Math.round(file.size / 1024)}KB`
                    });
                    
                    // Vérifier le type de fichier (accepter plus de formats)
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
                    if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
                        showNotification('Format non supporté. Utilisez JPG, PNG ou WEBP', 'error');
                        return;
                    }
                    
                    // Limite taille fichier original (20MB max pour mobile)
                    if (file.size > 20 * 1024 * 1024) {
                        showNotification('Fichier trop volumineux (max 20MB)', 'error');
                        return;
                    }
                    
                    // Afficher un loader pendant la compression
                    const submitBtn = pictureForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn?.textContent;
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = '⏳ Compression...';
                    }
                    
                    try {
                        // Compresser l'image avec paramètres adaptés à la taille
                        const targetSize = file.size > 5 * 1024 * 1024 ? 600 : 800;
                        const targetQuality = file.size > 5 * 1024 * 1024 ? 0.7 : 0.85;
                        
                        showNotification('📸 Compression de l\'image...', 'info');
                        imageUrl = await compressImage(file, targetSize, targetSize, targetQuality);
                        
                        if (submitBtn) {
                            submitBtn.textContent = '⬆️ Envoi...';
                        }
                        
                    } catch (compressError) {
                        console.error('Erreur compression:', compressError);
                        showNotification(`Erreur de compression: ${compressError.message}`, 'error');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                        return;
                    }
                    
                } else if (urlInput?.value) {
                    imageUrl = urlInput.value;
                    
                    // Valider l'URL
                    try {
                        new URL(imageUrl);
                    } catch {
                        showNotification('URL invalide', 'error');
                        return;
                    }
                    
                } else {
                    showNotification('Veuillez sélectionner une image ou entrer une URL', 'warning');
                    return;
                }
                
                // Envoyer au serveur
                await fetchWithAuth(`${window.API_BASE_URL}/users/profile-picture`, {
                    method: 'PUT',
                    body: JSON.stringify({ profile_picture: imageUrl })
                });
                
                // Mettre à jour l'affichage
                const profileImg = document.getElementById('profile-picture');
                if (profileImg) {
                    profileImg.src = imageUrl;
                    // Forcer le rechargement de l'image
                    profileImg.onload = () => console.log('✅ Photo de profil mise à jour dans le DOM');
                    profileImg.onerror = () => console.warn('⚠️ Erreur chargement image dans le DOM');
                }
                
                showNotification('✅ Photo de profil mise à jour !', 'success');
                pictureModal.classList.remove('active');
                pictureForm.reset();
                
                // Réinitialiser le bouton
                const submitBtn = pictureForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour';
                }
                
            } catch (error) {
                console.error('❌ Erreur upload photo:', error);
                showNotification(`Erreur: ${error.message}`, 'error');
                
                // Réinitialiser le bouton en cas d'erreur
                const submitBtn = pictureForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour';
                }
            }
        });
    }
};

/**
 * Initialise les gestionnaires de profil utilisateur
 */
const initProfileHandlers = (fetchWithAuth) => {
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeEditProfileModalBtn = document.getElementById('close-edit-profile-modal-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', async () => {
            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                document.getElementById('edit-pseudo').value = data.pseudo || '';
                document.getElementById('edit-email').value = data.email || '';
                document.getElementById('edit-phone').value = data.phone || '';
                document.getElementById('edit-bio').value = data.bio || '';
                editProfileModal.classList.add('active');
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }

    if (closeEditProfileModalBtn && editProfileModal) {
        closeEditProfileModalBtn.addEventListener('click', () => editProfileModal.classList.remove('active'));
    }

    if (editProfileModal) {
        window.addEventListener('click', (e) => {
            if (e.target === editProfileModal) editProfileModal.classList.remove('active');
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const profileData = {
                pseudo: formData.get('pseudo'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                bio: formData.get('bio') || null
            };
            
            try {
                await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });
                
                document.getElementById('user-pseudo-profile').textContent = profileData.pseudo;
                document.getElementById('user-email-profile').textContent = profileData.email;
                
                showNotification('Profil mis à jour avec succès !', 'success');
                editProfileModal.classList.remove('active');
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }
};

/**
 * Initialise les gestionnaires d'onglets
 */
const initTabs = (loadUserVehicles, loadRides, loadMyRatings) => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            localStorage.setItem('activeTab', tab.dataset.tab);
            
            if (tab.dataset.tab === 'tab-vehicles') loadUserVehicles();
            if (tab.dataset.tab === 'tab-offered-rides') loadRides('offered');
            if (tab.dataset.tab === 'tab-booked-rides') loadRides('booked');
            if (tab.dataset.tab === 'tab-my-ratings') loadMyRatings();
        });
    });
    
    const savedTab = localStorage.getItem('activeTab') || 'tab-vehicles';
    const tabToActivate = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
    
    if (tabToActivate) {
        tabToActivate.click();
    }
};

/**
 * Affiche les statistiques de notation
 * @param {HTMLElement} statsContainer - Conteneur des statistiques
 * @param {Object} ratingData - Données de notation
 */
function renderRatingStats(statsContainer, ratingData) {
    if (ratingData.success && ratingData.rating && ratingData.rating.total_reviews > 0) {
        const stats = ratingData.rating;
        
        // Convertir les valeurs en nombres (MySQL retourne des strings pour AVG)
        const avgRating = Number.parseFloat(stats.avg_rating) || 0;
        const avgPunctuality = Number.parseFloat(stats.avg_punctuality) || 0;
        const avgDrivingQuality = Number.parseFloat(stats.avg_driving_quality) || 0;
        const avgVehicleCleanliness = Number.parseFloat(stats.avg_vehicle_cleanliness) || 0;
        const avgFriendliness = Number.parseFloat(stats.avg_friendliness) || 0;
        
        const stars = '⭐'.repeat(Math.round(avgRating));
        
        statsContainer.innerHTML = `
            <div class="rating-overview">
                <div class="rating-score">
                    <div class="score-number">${avgRating.toFixed(1)}</div>
                    <div class="score-stars">${stars}</div>
                    <div class="score-count">${stats.total_reviews} avis</div>
                </div>
                <div class="rating-breakdown">
                    <div class="rating-criteria">
                        <span>⏰ Ponctualité:</span>
                        <strong>${avgPunctuality > 0 ? avgPunctuality.toFixed(1) : 'N/A'}/5</strong>
                    </div>
                    <div class="rating-criteria">
                        <span>🚗 Conduite:</span>
                        <strong>${avgDrivingQuality > 0 ? avgDrivingQuality.toFixed(1) : 'N/A'}/5</strong>
                    </div>
                    <div class="rating-criteria">
                        <span>✨ Propreté:</span>
                        <strong>${avgVehicleCleanliness > 0 ? avgVehicleCleanliness.toFixed(1) : 'N/A'}/5</strong>
                    </div>
                    <div class="rating-criteria">
                        <span>😊 Amabilité:</span>
                        <strong>${avgFriendliness > 0 ? avgFriendliness.toFixed(1) : 'N/A'}/5</strong>
                    </div>
                </div>
            </div>
        `;
    } else {
        statsContainer.innerHTML = `
            <div class="no-rating-yet">
                <p>Vous n'avez pas encore reçu de notes.</p>
                <p>Proposez des trajets pour commencer à recevoir des avis !</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('dashboard-page')) return;
    
    console.log('👤 Page espace utilisateur initialisée');
    
    const userToken = localStorage.getItem('token');
    if (!userToken) {
        window.location.href = 'connexion.html';
        return;
    }

    const fetchWithAuth = createFetchWithAuth(userToken);

    /**
     * Charge le nombre de trajets à noter
     */
    const loadPendingReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/eligible-rides`, {
                headers: { 'x-auth-token': userToken }
            });
            
            if (response.ok) {
                const data = await response.json();
                const count = data.rides ? data.rides.length : 0;
                
                const banner = document.getElementById('pending-reviews-banner');
                const countText = document.getElementById('pending-count');
                
                if (count > 0 && banner && countText) {
                    countText.textContent = `${count} trajet${count > 1 ? 's' : ''} à noter`;
                    banner.style.display = 'block';
                }
            }
        } catch (error) {
            console.log('Erreur chargement avis en attente:', error);
        }
    };

    /**
     * Charge les données utilisateur
     */
    const fetchUserData = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const data = response.data || response;
            
            if (document.getElementById('user-pseudo')) document.getElementById('user-pseudo').textContent = data.pseudo;
            if (document.getElementById('user-email')) document.getElementById('user-email').textContent = data.email;
            if (document.getElementById('user-credits')) document.getElementById('user-credits').textContent = data.credits || 0;
            if (document.getElementById('user-pseudo-welcome')) document.getElementById('user-pseudo-welcome').textContent = data.pseudo;
            if (document.getElementById('user-pseudo-profile')) document.getElementById('user-pseudo-profile').textContent = data.pseudo;
            if (document.getElementById('user-email-profile')) document.getElementById('user-email-profile').textContent = data.email;
            
            if (data.profile_picture && document.getElementById('profile-picture')) {
                document.getElementById('profile-picture').src = data.profile_picture;
            }
        } catch (error) {
            showNotification(`Erreur chargement profil: ${error.message}`, 'error');
        }
    };

    /**
     * Charge les véhicules de l'utilisateur
     */
    const loadUserVehicles = async () => {
        const container = document.getElementById('vehicle-list');
        const noMsg = document.getElementById('no-vehicles-message');
        if (!container || !noMsg) return;

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
            container.innerHTML = '';
            
            if (data.vehicles && data.vehicles.length > 0) {
                noMsg.style.display = 'none';
                data.vehicles.forEach(v => {
                    container.innerHTML += `<div class="vehicle-card" data-brand="${v.brand}" data-model="${v.model}" data-plate="${v.plate}" data-energy="${v.energy}" data-seats="${v.seats}"><h3>${v.brand} ${v.model}</h3><p>Immatriculation: ${v.plate}</p><p>Énergie: ${v.energy}</p><p>Nombre de sièges: ${v.seats}</p><div class="vehicle-actions"><button class="edit-vehicle-btn button button-secondary" data-id="${v._id}">Modifier</button><button class="delete-vehicle-btn button button-danger" data-id="${v._id}">Supprimer</button></div></div>`;
                });
            } else {
                noMsg.style.display = 'block';
            }
            addVehicleActionListeners();
        } catch (error) {
            showNotification(`Erreur chargement véhicules: ${error.message}`, 'error');
        }
    };

    /**
     * Ajoute les listeners sur les boutons d'action des véhicules
     */
    const addVehicleActionListeners = () => {
        document.querySelectorAll('.edit-vehicle-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const cardData = event.target.closest('.vehicle-card').dataset;
                openEditModal(event.target.dataset.id, cardData);
            });
        });

        document.querySelectorAll('.delete-vehicle-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
                    try {
                        await fetchWithAuth(`${API_BASE_URL}/vehicles/${event.target.dataset.id}`, { method: 'DELETE' });
                        showNotification('Véhicule supprimé.', 'success');
                        loadUserVehicles();
                    } catch (error) {
                        showNotification(`Erreur : ${error.message}`, 'error');
                    }
                }
            });
        });
    };

    /**
     * Ajoute les listeners sur les boutons d'action des trajets
     */
    const addRideActionListeners = (type) => {
        const selector = type === 'offered' ? '.cancel-ride-btn' : '.cancel-booking-btn';
        document.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', async (event) => {
                const action = type === 'offered' ? 'trajet' : 'réservation';
                if (confirm(`Êtes-vous sûr de vouloir annuler cette ${action} ?`)) {
                    try {
                        if (type === 'offered') {
                            await fetchWithAuth(`${API_BASE_URL}/rides/${event.target.dataset.id}`, { method: 'DELETE' });
                        } else {
                            await fetchWithAuth(`${API_BASE_URL}/rides/bookings/${event.target.dataset.id}`, { method: 'DELETE' });
                        }
                        showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} annulé(e).`, 'success');
                        loadRides('offered');
                        loadRides('booked');
                    } catch (error) {
                        showNotification(`Erreur : ${error.message}`, 'error');
                    }
                }
            });
        });
    };

    /**
     * Charge les trajets (proposés ou réservés)
     */
    const loadRides = async (type) => {
        const listId = type === 'offered' ? 'offered-rides-list' : 'booked-rides-list';
        const noItemsId = type === 'offered' ? 'no-offered-rides' : 'no-booked-rides';
        const container = document.getElementById(listId);
        const noMsg = document.getElementById(noItemsId);
        if (!container || !noMsg) return;

        const statusMap = {
            en_attente: 'En attente',
            scheduled: 'Ouvert',
            started: 'En cours',
            completed: 'Terminé',
            termine: 'Terminé',
            confirme: 'Confirmé',
            cancelled: 'Annulé',
            annule: 'Annulé'
        };

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/rides/${type}`);
            container.innerHTML = '';
            
            if (data.rides && data.rides.length > 0) {
                const activeRides = data.rides.filter(ride => ride.status !== 'cancelled' && ride.status !== 'annule');
                
                if (activeRides.length > 0) {
                    noMsg.style.display = 'none';
                    activeRides.forEach(ride => {
                        const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                        
                        // Vérifier si le trajet est dans le passé
                        const departureDateTime = new Date(ride.departureDate);
                        const isPast = departureDateTime < new Date();
                        
                        // Si le trajet est passé et toujours en attente/confirmé, le marquer comme terminé
                        let actualStatus = ride.status;
                        if (isPast && (ride.status === 'en_attente' || ride.status === 'scheduled' || ride.status === 'confirme')) {
                            actualStatus = 'termine';
                        }
                        
                        const statusText = statusMap[actualStatus] || actualStatus;
                        
                        let isCancellable = false;
                        if (type === 'offered') {
                            isCancellable = !isPast && (ride.status === 'scheduled' || ride.status === 'en_attente');
                        } else {
                            isCancellable = !isPast && (ride.status === 'confirme' || ride.status === 'scheduled' || ride.status === 'en_attente');
                        }
                        
                        let cardHtml = '';
                        if (type === 'offered') {
                            cardHtml = `
                                <div class="ride-card-content">
                                    <h3>${ride.departure} → ${ride.arrival}</h3>
                                    <p>Date et heure: ${date} à ${ride.departureTime}</p>
                                    <p>Statut: ${statusText}</p>
                                </div>
                                <div class="ride-actions">
                                    <button class="cancel-ride-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler</button>
                                </div>`;
                        } else {
                            // Vérifier si le trajet est terminé et peut être noté
                            const isCompleted = actualStatus === 'completed' || actualStatus === 'termine';
                            const canRate = isCompleted && ride.driver?.id;
                            
                            cardHtml = `
                                <div class="ride-card-content">
                                    <h3>${ride.departure} → ${ride.arrival}</h3>
                                    <p>Avec ${ride.driver.pseudo}</p>
                                    <p>Date: ${date}</p>
                                    <p>Statut: ${statusText}</p>
                                </div>
                                <div class="ride-actions">
                                    <button class="cancel-booking-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler</button>
                                    ${canRate ? `<a href="avis.html" class="button button-primary rate-driver-btn" style="text-decoration: none;">⭐ Noter</a>` : ''}
                                </div>`;
                        }
                        container.innerHTML += `<div class="ride-card">${cardHtml}</div>`;
                    });
                } else {
                    noMsg.style.display = 'block';
                }
            } else {
                noMsg.style.display = 'block';
            }
            addRideActionListeners(type);
        } catch (error) {
            showNotification(`Erreur chargement trajets: ${error.message}`, 'error');
        }
    };
    
    /**
     * Gestion des modales de véhicules
     */
    const editModal = initVehicleModals(fetchWithAuth, loadUserVehicles);
    
    /**
     * Ouvre la modale d'édition de véhicule
     */
    const openEditModal = (id, data) => {
        const editModalElement = document.getElementById('edit-vehicle-modal');
        if (editModalElement) {
            const editForm = document.getElementById('edit-vehicle-form-modal');
            const editBrandSelect = document.getElementById('edit-brand-modal');
            const editModelSelect = document.getElementById('edit-model-modal');
            const editModelCustom = document.getElementById('edit-model-custom');
            
            if (editForm) {
                // Remplir les champs
                editForm.elements['edit-vehicle-id'].value = id;
                
                // Normaliser la marque pour gérer les problèmes de casse (BMW vs bmw)
                const normalizedBrand = normalizeBrandName(data.brand);
                editBrandSelect.value = normalizedBrand || data.brand;
                
                // Déclencher le changement de marque pour charger les modèles
                const event = new Event('change');
                editBrandSelect.dispatchEvent(event);
                
                // Attendre que les modèles se chargent puis sélectionner
                setTimeout(() => {
                    const modelOption = Array.from(editModelSelect.options).find(opt => opt.value === data.model);
                    if (modelOption) {
                        editModelSelect.value = data.model;
                        editModelCustom.value = '';
                    } else {
                        // Modèle personnalisé
                        editModelCustom.value = data.model;
                    }
                    
                    editForm.elements['plate'].value = data.plate;
                    editForm.elements['energy'].value = data.energy;
                    editForm.elements['seats'].value = data.seats;
                }, 100);
                
                editModalElement.classList.add('active');
            }
        }
    };

    /**
     * Charge les notes et avis reçus
     */
    async function loadMyRatings() {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const userData = response.data || response;
            const userId = userData.id || userData._id;
            
            if (!userId) {
                console.error('❌ Impossible de récupérer l\'ID utilisateur:', userData);
                showNotification('Erreur: ID utilisateur non trouvé', 'error');
                return;
            }
            
            console.log(`✅ Chargement des avis pour le chauffeur ID: ${userId}`);
            
            const ratingResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}/rating`);
            const ratingData = await ratingResponse.json();
            
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}?limit=50`);
            const reviewsData = await reviewsResponse.json();
            
            const statsContainer = document.getElementById('rating-stats');
            const reviewsList = document.getElementById('my-reviews-list');
            const noReviewsMsg = document.getElementById('no-reviews');
            
            if (!statsContainer || !reviewsList || !noReviewsMsg) return;
            
            renderRatingStats(statsContainer, ratingData);
            
            if (reviewsData.success && reviewsData.reviews && reviewsData.reviews.length > 0) {
                noReviewsMsg.classList.add('hidden');
                reviewsList.innerHTML = reviewsData.reviews.map(review => {
                    const stars = '⭐'.repeat(review.rating);
                    const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <div>
                                    <strong>${review.passenger_pseudo || 'Passager'}</strong>
                                    <div class="review-stars">${stars}</div>
                                </div>
                                <span class="review-date">${date}</span>
                            </div>
                            ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                            ${review.departure_city && review.arrival_city ? 
                                `<p class="review-trip"><i class="fas fa-route"></i> ${review.departure_city} → ${review.arrival_city}</p>` 
                                : ''}
                        </div>
                    `;
                }).join('');
            } else {
                noReviewsMsg.classList.remove('hidden');
                reviewsList.innerHTML = '';
            }
            
        } catch (error) {
            console.error('Erreur chargement notes:', error);
            showNotification('Erreur lors du chargement des notes', 'error');
        }
    }

    /**
     * Gestion de la photo de profil
     */
    initProfilePictureHandlers(fetchWithAuth);

    /**
     * Gestion du profil utilisateur
     */
    initProfileHandlers(fetchWithAuth);

    /**
     * Gestion des onglets
     */
    initTabs(loadUserVehicles, loadRides, loadMyRatings);
    
    // Charger les données initiales
    fetchUserData();
    loadPendingReviews();
});
