// frontend/js/ui.js

function afficherCartesVetements(vetements) {
    const conteneur = document.getElementById('liste-vetements');
    
    // Sécurité au cas où le conteneur n'est pas trouvé (pour les bulles)
    if (!conteneur) return; 
    
    conteneur.innerHTML = '';

    // On récupère l'utilisateur connecté depuis la session
    const userJson = sessionStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;

    if (!vetements || vetements.length === 0) {
        conteneur.innerHTML = '<div class="col-12"><p class="text-center text-muted">Aucun vêtement trouvé.</p></div>';
        return;
    }

    vetements.forEach(vetement => {
        let badgeColor = 'bg-secondary';
        if (vetement.etat === 'Disponible') badgeColor = 'bg-success';
        if (vetement.etat === 'En prêt') badgeColor = 'bg-warning text-dark';
        if (vetement.etat === 'Au lavage') badgeColor = 'bg-info text-dark';

        const photoUrl = (vetement.photo && vetement.photo.trim() !== "") ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';

        // --- GESTION DES BOUTONS ---
        let actionsHTML = '';
        
        // Si l'utilisateur est connecté ET qu'il est le propriétaire
        if (currentUser && currentUser.idutilisateur == vetement.idproprietaire) {
            
            // 1. BOUTONS DE GESTION (MODIFIER / SUPPRIMER)
            actionsHTML += `
                <div class="d-flex gap-2 mb-2">
                    <button class="btn btn-sm btn-secondary w-50" onclick="preparerEdition(${vetement.idvetement})">✏️ Modifier</button>
                    <button class="btn btn-sm btn-outline-danger w-50" onclick="supprimerVetement(${vetement.idvetement})">🗑️ Sup.</button>
                </div>
            `;

            // 2. BOUTONS DE PRÊT
            if (vetement.etat === 'Disponible') {
                actionsHTML += `<button class="btn btn-sm btn-outline-primary w-100" onclick="ouvrirModalPret(${vetement.idvetement}, '${vetement.nom.replace(/'/g, "\\'")}')">🤝 Prêter</button>`;
            } else if (vetement.etat === 'En prêt') {
                actionsHTML += `<button class="btn btn-sm btn-outline-warning w-100" onclick="rendreVetement(${vetement.idvetement})">🔙 Marquer comme Rendu</button>`;
            } else if (vetement.etat === 'Au lavage') {
                actionsHTML += `<button class="btn btn-sm btn-outline-info w-100" onclick="vetementLave(${vetement.idvetement})">✨ Laver & Ranger (Dispo)</button>`;
            }
        }

        const carteHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${photoUrl}" class="card-img-top p-3 bg-light" alt="${vetement.nom}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${vetement.nom || 'Sans nom'}</h5>
                            <span class="badge ${badgeColor} rounded-pill">${vetement.etat}</span>
                        </div>
                        <p class="card-text text-muted small mb-3">
                            Marque : ${vetement.marque || 'N/A'} | Taille : ${vetement.taille} | Type : ${vetement.type}
                        </p>
                        <p class="card-text">${vetement.description}</p>
                    </div>
                    ${actionsHTML ? `<div class="card-footer bg-transparent border-0">${actionsHTML}</div>` : ''}
                </div>
            </div>
        `;
        conteneur.insertAdjacentHTML('beforeend', carteHTML);
    });
}

function basculerAffichageFormulaire(afficher) {
    document.getElementById('section-dressing').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-recherche').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-formulaire').style.display = afficher ? 'block' : 'none';
    document.getElementById('section-arborescence').style.display = 'none'; // On masque aussi l'arborescence par sécurité
}