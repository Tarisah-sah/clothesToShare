// ==========================================
// 1. INJECTION DE COMPOSANTS HTML (AVEC ANTI-CACHE)
// ==========================================
async function chargerComposant(idConteneur, urlFichier) {
    try {
        const urlAntiCache = urlFichier + '?v=' + new Date().getTime();
        const reponse = await fetch(urlAntiCache);
        if (!reponse.ok) throw new Error('Composant introuvable : ' + urlFichier);
        
        const html = await reponse.text();
        document.getElementById(idConteneur).innerHTML = html;
    } catch (erreur) {
        console.error("Erreur chargement de " + urlFichier, erreur);
    }
}

window.toggleFavori = function(id, event) {
    event.stopPropagation();
    
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
        afficherNotification("Tu dois être connecté pour ajouter des vêtements en favoris !", "warning");
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }
    
    const user = JSON.parse(userJson);
    let favoris = JSON.parse(localStorage.getItem('favoris_' + user.idutilisateur)) || [];
    const idStr = id.toString();
    
    if (favoris.includes(idStr)) {
        favoris = favoris.filter(f => f !== idStr);
    } else {
        favoris.push(idStr);
    }
    
    localStorage.setItem('favoris_' + user.idutilisateur, JSON.stringify(favoris));
    chargerVetements(modeActuel); 
};

function afficherCartesVetements(vetements) {
    const conteneur = document.getElementById('liste-vetements');
    if (!conteneur) return; 
    
    conteneur.innerHTML = '';
    const userJson = sessionStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    let favoris = currentUser ? JSON.parse(localStorage.getItem('favoris_' + currentUser.idutilisateur)) || [] : [];

    const genererCarte = (vetement) => {
        let badgeColor = 'bg-secondary';
        if (vetement.etat === 'Disponible') badgeColor = 'bg-success';
        if (vetement.etat === 'En prêt') badgeColor = 'bg-warning text-dark';
        if (vetement.etat === 'Au lavage') badgeColor = 'bg-info text-dark';
        if (vetement.etat === 'Demande en cours') badgeColor = 'bg-danger text-white';
        if (vetement.etat === 'Retour en attente') badgeColor = 'bg-primary text-white';

        const photoUrl = (vetement.photo && vetement.photo.trim() !== "") ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';

        let actionsHTML = '';
        
        // ACTIONS PROPRIÉTAIRE
        if (currentUser && currentUser.idutilisateur == vetement.idproprietaire) {
            actionsHTML += `
                <div class="d-flex gap-2 mb-2">
                    <button class="btn btn-sm btn-secondary w-50" onclick="preparerEdition(${vetement.idvetement})"><i class="bi bi-pencil-square me-1"></i> Modifier</button>
                    <button class="btn btn-sm btn-outline-danger w-50" onclick="supprimerVetement(${vetement.idvetement})"><i class="bi bi-trash me-1"></i> Supprimer</button>
                </div>
            `;
            if (vetement.etat === 'Disponible') {
                actionsHTML += `<button class="btn btn-sm btn-outline-primary w-100" onclick="ouvrirModalPret(${vetement.idvetement}, '${vetement.nom.replace(/'/g, "\\'")}')"><i class="bi bi-box-arrow-right me-1"></i> Prêter</button>`;
            } else if (vetement.etat === 'Demande en cours') {
                const nomEmprunteur = vetement.nom_emprunteur || 'Utilisateur inconnu';
                const dateDebut = vetement.datedebut ? new Date(vetement.datedebut).toLocaleDateString('fr-FR') : 'Non précisé';
                const dateFin = vetement.datefinprevue ? new Date(vetement.datefinprevue).toLocaleDateString('fr-FR') : 'Non précisé';

                actionsHTML += `
                    <div class="alert alert-info p-2 mt-2 mb-2 small text-center shadow-sm">
                        <i class="bi bi-person-fill me-1"></i> Demandé par <strong>${nomEmprunteur}</strong><br>
                        <i class="bi bi-calendar-event me-1"></i> Du <strong>${dateDebut}</strong> au <strong>${dateFin}</strong>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-success w-50 fw-bold" onclick="repondreDemande(${vetement.idvetement}, 'accepter')"><i class="bi bi-check-lg me-1"></i> Accepter</button>
                        <button class="btn btn-sm btn-danger w-50 fw-bold" onclick="repondreDemande(${vetement.idvetement}, 'refuser')"><i class="bi bi-x-lg me-1"></i> Refuser</button>
                    </div>
                `;
            } else if (vetement.etat === 'En prêt') {
                actionsHTML += `<button class="btn btn-sm btn-outline-warning w-100" onclick="rendreVetement(${vetement.idvetement})"><i class="bi bi-arrow-return-left me-1"></i> Forcer le retour</button>`;
            } else if (vetement.etat === 'Retour en attente') {
                actionsHTML += `<button class="btn btn-sm btn-success w-100 fw-bold" onclick="rendreVetement(${vetement.idvetement})"><i class="bi bi-check-circle-fill me-1"></i> Confirmer la réception</button>`;
            } else if (vetement.etat === 'Au lavage') {
                actionsHTML += `<button class="btn btn-sm btn-outline-info w-100" onclick="vetementLave(${vetement.idvetement})"><i class="bi bi-droplet-fill me-1"></i> Laver & Ranger</button>`;
            }
        } 
        // ACTIONS EMPRUNTEUR
        else if (currentUser && vetement.idemprunteur == currentUser.idutilisateur) {
            if (vetement.etat === 'En prêt') {
                actionsHTML += `<button class="btn btn-sm btn-primary w-100 mt-2" onclick="signalerRetour(${vetement.idvetement})"><i class="bi bi-arrow-return-left me-1"></i> Signaler comme rendu</button>`;
            } else if (vetement.etat === 'Demande en cours') {
                actionsHTML += `<button class="btn btn-sm btn-outline-danger w-100 mt-2 fw-bold" onclick="annulerDemande(${vetement.idvetement})"><i class="bi bi-x-circle me-1"></i> Annuler ma demande</button>`;
            }
        }

        let estFavori = currentUser ? favoris.includes(vetement.idvetement.toString()) : false;
        let btnFavoriHTML = '';
        
        if (!currentUser || currentUser.idutilisateur != vetement.idproprietaire) {
            const iconeCoeur = estFavori ? '<i class="bi bi-heart-fill text-danger"></i>' : '<i class="bi bi-heart text-secondary"></i>';
            btnFavoriHTML = `<button class="btn btn-link text-decoration-none p-0 ms-2 fs-5" onclick="toggleFavori(${vetement.idvetement}, event)">${iconeCoeur}</button>`;
        }

        return `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                    <div class="position-relative">
                        <img src="${photoUrl}" class="card-img-top bg-light" style="height: 220px; object-fit: contain; cursor: pointer; padding: 1rem;" onclick="ouvrirModalDetails(${vetement.idvetement})">
                        <span class="badge ${badgeColor} position-absolute top-0 end-0 m-2 shadow-sm">${vetement.etat}</span>
                    </div>
                    
                    <div class="card-body pt-3 pb-2">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title fw-bold mb-0 text-truncate" style="color: #ad1457;" title="${vetement.nom}">${vetement.nom}</h5>
                            ${btnFavoriHTML}
                        </div>
                        
                        <div class="d-flex justify-content-between text-muted small mb-1">
                            <span><i class="bi bi-tag-fill text-secondary me-1"></i> ${vetement.marque || 'Sans marque'}</span>
                            <span><i class="bi bi-arrows-fullscreen text-secondary me-1"></i> ${vetement.taille}</span>
                        </div>
                        <div class="text-muted small text-truncate" title="${vetement.type} • ${vetement.genre}">
                            <i class="bi bi-info-circle-fill text-secondary me-1"></i> ${vetement.type} <span class="mx-1">•</span> <span class="text-capitalize">${vetement.genre}</span>
                        </div>
                    </div>
                    
                    <div class="card-footer bg-white border-top-0 pt-0 pb-3">
                        ${actionsHTML}
                    </div>
                </div>
            </div>`;
    };

    if (modeActuel === 'dressing' && currentUser) {
        const listeComplete = vetements || [];
        const mesh = listeComplete.filter(v => v.idproprietaire == currentUser.idutilisateur);
        const mese = listeComplete.filter(v => v.idemprunteur == currentUser.idutilisateur && (v.etat === 'En prêt' || v.etat === 'Retour en attente'));
        const mesf = listeComplete.filter(v => favoris.includes(v.idvetement.toString()) && v.idproprietaire != currentUser.idutilisateur);
        const mesd = listeComplete.filter(v => v.idemprunteur == currentUser.idutilisateur && v.etat === 'Demande en cours');

        let htmlDressing = '';

        if (currentUser.role === 'admin' || currentUser.role === 'owner') {
            htmlDressing += `
                <div class="d-flex align-items-center border-bottom pb-2 mb-3 mt-2">
                    <i class="bi bi-archive-fill fs-4 text-secondary me-2"></i>
                    <h3 class="mb-0 text-secondary">Mes possessions</h3>
                </div>
                <div class="row g-4 w-100 mb-4">${mesh.length ? mesh.map(genererCarte).join('') : '<p class="text-muted"><i class="bi bi-emoji-frown me-1"></i> Aucun vêtement.</p>'}</div>
            `;
        }

        htmlDressing += `
            <div class="d-flex align-items-center border-bottom pb-2 mb-3 mt-4">
                <i class="bi bi-hourglass-split fs-4 text-warning me-2"></i>
                <h3 class="mb-0 text-warning">Mes demandes en attente</h3>
            </div>
            <div class="row g-4 w-100 mb-4">${mesd.length ? mesd.map(genererCarte).join('') : '<p class="text-muted"><i class="bi bi-wind me-1"></i> Aucune demande en cours.</p>'}</div>
        `;

        htmlDressing += `
            <div class="d-flex align-items-center border-bottom pb-2 mb-3 mt-4">
                <i class="bi bi-bag-check-fill fs-4 text-primary me-2"></i>
                <h3 class="mb-0 text-primary">Mes emprunts actifs</h3>
            </div>
            <div class="row g-4 w-100 mb-4">${mese.length ? mese.map(genererCarte).join('') : '<p class="text-muted"><i class="bi bi-bag-x me-1"></i> Aucun emprunt en cours.</p>'}</div>
            
            <div class="d-flex align-items-center border-bottom pb-2 mb-3 mt-4">
                <i class="bi bi-heart-fill fs-4 text-danger me-2"></i>
                <h3 class="mb-0 text-danger">Mes Favoris</h3>
            </div>
            <div class="row g-4 w-100">${mesf.length ? mesf.map(genererCarte).join('') : '<p class="text-muted"><i class="bi bi-heartbreak me-1"></i> Aucun favori pour le moment.</p>'}</div>
        `;

        conteneur.innerHTML = htmlDressing;
    } else {
        if (!vetements || vetements.length === 0) {
            conteneur.innerHTML = '<div class="col-12 text-center mt-5"><i class="bi bi-search fs-1 text-muted mb-3 d-block"></i><p class="text-muted fs-5">Aucun vêtement trouvé.</p></div>';
            return;
        }
        conteneur.innerHTML = vetements.map(genererCarte).join('');
    }
}

function basculerAffichageFormulaire(afficher) {
    document.getElementById('section-dressing').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-recherche').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-formulaire').style.display = afficher ? 'block' : 'none';
    document.getElementById('section-arborescence').style.display = 'none';
}

// ==========================================
// BOÎTE À OUTILS UX (Toasts & Modales)
// ==========================================

function afficherNotification(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }

    const couleurs = {
        'success': 'bg-success text-white',
        'danger': 'bg-danger text-white',
        'warning': 'bg-warning text-dark',
        'info': 'bg-info text-dark'
    };
    const cssClass = couleurs[type] || couleurs['info'];

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 ${cssClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body fw-bold">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function demanderConfirmation(message) {
    return new Promise((resolve) => {
        const modalId = 'modal-confirm-' + Date.now();
        const html = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-body text-center p-4">
                            <h5 class="mb-4" style="color: #ad1457;">${message}</h5>
                            <div class="d-flex justify-content-center gap-2">
                                <button type="button" class="btn btn-outline-secondary w-50" id="btn-non-${modalId}">Annuler</button>
                                <button type="button" class="btn w-50 text-white fw-bold" style="background-color: #e91e8c;" id="btn-oui-${modalId}">Oui</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });

        const btnOui = document.getElementById(`btn-oui-${modalId}`);
        const btnNon = document.getElementById(`btn-non-${modalId}`);

        const nettoyer = () => {
            modal.hide();
            modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
        };

        btnOui.addEventListener('click', () => { nettoyer(); resolve(true); });
        btnNon.addEventListener('click', () => { nettoyer(); resolve(false); });

        modal.show();
    });
}

function demanderTexte(message) {
    return new Promise((resolve) => {
        const modalId = 'modal-prompt-' + Date.now();
        const html = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-light border-0">
                            <h6 class="modal-title text-secondary fw-bold">${message}</h6>
                            <button type="button" class="btn-close" id="btn-close-${modalId}"></button>
                        </div>
                        <div class="modal-body">
                            <textarea class="form-control border-primary" id="input-${modalId}" rows="3" placeholder="Écris ici..."></textarea>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-outline-secondary" id="btn-annuler-${modalId}">Annuler</button>
                            <button type="button" class="btn btn-primary fw-bold" id="btn-valider-${modalId}">Valider</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });

        const btnValider = document.getElementById(`btn-valider-${modalId}`);
        const btnAnnuler = document.getElementById(`btn-annuler-${modalId}`);
        const btnClose = document.getElementById(`btn-close-${modalId}`);
        const inputEl = document.getElementById(`input-${modalId}`);

        const nettoyer = () => {
            modal.hide();
            modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
        };

        btnValider.addEventListener('click', () => { nettoyer(); resolve(inputEl.value.trim()); });
        btnAnnuler.addEventListener('click', () => { nettoyer(); resolve(null); });
        btnClose.addEventListener('click', () => { nettoyer(); resolve(null); });

        modal.show();
    });
}