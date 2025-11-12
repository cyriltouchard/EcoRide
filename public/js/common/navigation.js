/**
 * EcoRide - Module de navigation
 * Gestion de la navigation dynamique et du menu responsive
 * @file navigation.js
 */

import { getToken, isAdmin } from './auth.js';
import { showNotification } from './notifications.js';

/**
 * Bascule la visibilité d'un élément selon l'état de connexion
 * @param {HTMLElement} element - Élément DOM
 * @param {boolean} token - Présence du token
 * @param {boolean} hideWhenLoggedIn - Cacher quand connecté (pour le bouton guest)
 */
const toggleElementVisibility = (element, token, hideWhenLoggedIn = false) => {
    if (!element) return;
    const shouldHide = hideWhenLoggedIn ? token : !token;
    element.classList.toggle('hidden', shouldHide);
};

/**
 * Vérifie et affiche le bouton admin si nécessaire
 * @param {HTMLElement} adminNavButton - Bouton admin
 */
const checkAdminAccess = async (adminNavButton) => {
    if (!adminNavButton) return;
    
    const token = getToken();
    if (!token) {
        adminNavButton.classList.add('hidden');
        return;
    }
    
    try {
        const isAdminUser = await isAdmin();
        adminNavButton.classList.toggle('hidden', !isAdminUser);
    } catch (error) {
        console.error('Erreur vérification admin:', error);
        adminNavButton.classList.add('hidden');
    }
};

/**
 * Gère la déconnexion de l'utilisateur
 */
const handleLogout = () => {
    localStorage.removeItem('token');
    showNotification("Vous avez été déconnecté.", "success");
    setTimeout(() => window.location.href = 'index.html', 1500);
};

/**
 * Initialise la navigation dynamique selon l'état de connexion
 */
export const initNavigation = () => {
    const token = getToken();
    
    // Éléments de navigation à gérer
    const navigationElements = [
        { id: 'guest-nav-button', hideWhenLoggedIn: true },
        { id: 'user-nav-links', hideWhenLoggedIn: false },
        { id: 'user-nav-dashboard', hideWhenLoggedIn: false },
        { id: 'user-nav-button', hideWhenLoggedIn: false }
    ];
    
    // Gérer la visibilité de chaque élément
    navigationElements.forEach(({ id, hideWhenLoggedIn }) => {
        const element = document.getElementById(id);
        toggleElementVisibility(element, token, hideWhenLoggedIn);
    });
    
    // Vérifier l'accès admin
    const adminNavButton = document.getElementById('admin-nav-button');
    checkAdminAccess(adminNavButton);
    
    // Gestionnaires de déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    const navLogoutButton = document.getElementById('nav-logout');
    if (navLogoutButton) {
        navLogoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
};

/**
 * Initialise le menu hamburger pour mobile
 */
export const initHamburgerMenu = () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');
    
    if (!hamburger || !navMenu) return;
    
    // Toggle menu au clic sur hamburger
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Fermer menu en cliquant en dehors
    document.addEventListener('click', (event) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Fermer menu au clic sur un lien
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
};

/**
 * Initialise l'animation scroll reveal
 */
export const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(element => observer.observe(element));
};

/**
 * Ajoute un effet de scroll smooth aux ancres
 */
export const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

/**
 * Met en surbrillance l'élément de menu actif
 */
export const highlightActiveNavItem = () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a, .nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

/**
 * Initialise toutes les fonctionnalités de navigation
 */
export const initAllNavigation = () => {
    initNavigation();
    initHamburgerMenu();
    initScrollReveal();
    initSmoothScroll();
    highlightActiveNavItem();
};

// Exposer globalement pour compatibilité
window.initNavigation = initNavigation;
