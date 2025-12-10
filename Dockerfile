# Image de base Node.js optimisée
FROM node:18-alpine

# Métadonnées
LABEL maintainer="Cyril Touchard <cyril@ecoride.fr>"
LABEL description="EcoRide - Plateforme de covoiturage écologique"
LABEL version="1.0.0"

# Création utilisateur non-root pour sécurité
RUN addgroup -g 1001 -S ecoride && \
    adduser -S ecoride -u 1001

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache \
    curl \
    dumb-init

# Copie des fichiers de dépendances
COPY server/package*.json ./server/

# Installation des dépendances Node.js
RUN cd server && npm install --production --legacy-peer-deps && \
    npm cache clean --force && \
    mkdir -p /tmp/node_modules && \
    cp -r node_modules /tmp/node_modules/

# Copie du code source
COPY server/ ./server/
COPY public/ ./public/
COPY *.html ./

# Restaurer node_modules
RUN cp -r /tmp/node_modules/node_modules ./server/ && rm -rf /tmp/node_modules

# Changement de propriétaire vers utilisateur non-root
RUN chown -R ecoride:ecoride /app
USER ecoride

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Port exposé
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Point d'entrée avec dumb-init pour gestion des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "server/server.js"]