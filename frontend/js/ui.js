async function chargerComposant(idConteneur, urlFichier) {
    try {
        const reponse = await fetch(urlFichier);
        if (!reponse.ok) throw new Error('Composant introuvable : ' + urlFichier);
        const html = await reponse.text();
        document.getElementById(idConteneur).innerHTML = html;
    } catch (erreur) {
        console.error("Erreur chargement", erreur);
    }
}

window.toggleFavori = function(id, event) {
    event.stopPropagation();
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) return;
    
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
                    <button class="btn btn-sm btn-secondary w-50" onclick="preparerEdition(${vetement.idvetement})">✏️ Modifier</button>
                    <button class="btn btn-sm btn-outline-danger w-50" onclick="supprimerVetement(${vetement.idvetement})">🗑️ Sup.</button>
                </div>
            `;
            if (vetement.etat === 'Disponible') {
                actionsHTML += `<button class="btn btn-sm btn-outline-primary w-100" onclick="ouvrirModalPret(${vetement.idvetement}, '${vetement.nom.replace(/'/g, "\\'")}')">🤝 Prêter</button>`;
            } else if (vetement.etat === 'En prêt') {
                actionsHTML += `<button class="btn btn-sm btn-outline-warning w-100" onclick="rendreVetement(${vetement.idvetement})">🔙 Forcer le retour</button>`;
            } else if (vetement.etat === 'Retour en attente') {
                actionsHTML += `<button class="btn btn-sm btn-success w-100 fw-bold" onclick="rendreVetement(${vetement.idvetement})">✅ Confirmer la réception</button>`;
            } else if (vetement.etat === 'Au lavage') {
                actionsHTML += `<button class="btn btn-sm btn-outline-info w-100" onclick="vetementLave(${vetement.idvetement})">✨ Laver & Ranger</button>`;
            }
        } 
        // ACTIONS EMPRUNTEUR (SÉCURISÉ : on vérifie l'id de l'emprunteur renvoyé par PHP)
        else if (currentUser && vetement.etat === 'En prêt' && vetement.idemprunteur == currentUser.idutilisateur) {
            actionsHTML += `<button class="btn btn-sm btn-primary w-100" onclick="signalerRetour(${vetement.idvetement})">👋 Signaler comme rendu</button>`;
        }

        let estFavori = favoris.includes(vetement.idvetement.toString());
        let btnFavoriHTML = currentUser ? `<button class="btn btn-link text-decoration-none p-0 ms-2 fs-5" onclick="toggleFavori(${vetement.idvetement}, event)">${estFavori ? '❤️' : '🤍'}</button>` : '';

        return `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${photoUrl}" class="card-img-top p-3 bg-light" style="height: 200px; object-fit: contain; cursor: pointer;" onclick="ouvrirModalDetails(${vetement.idvetement})">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${vetement.nom} ${btnFavoriHTML}</h5>
                            <span class="badge ${badgeColor}">${vetement.etat}</span>
                        </div>
                        <p class="card-text text-muted small">Taille : ${vetement.taille} | Marque : ${vetement.marque}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0">${actionsHTML}</div>
                </div>
            </div>`;
    };

    if (modeActuel === 'dressing' && currentUser) {
        const mesh = vetements.filter(v => v.idproprietaire == currentUser.idutilisateur);
        const mese = vetements.filter(v => v.idemprunteur == currentUser.idutilisateur);
        const mesf = vetements.filter(v => favoris.includes(v.idvetement.toString()) && v.idproprietaire != currentUser.idutilisateur);

        conteneur.innerHTML = `
            <h3 class="w-100 border-bottom pb-2">👕 Mes possessions</h3>
            <div class="row g-4 w-100 mb-4">${mesh.length ? mesh.map(genererCarte).join('') : '<p class="text-muted">Aucun vêtement.</p></div>'}
            <h3 class="w-100 border-bottom pb-2 mt-4">🤝 Mes emprunts</h3>
            <div class="row g-4 w-100 mb-4">${mese.length ? mese.map(genererCarte).join('') : '<p class="text-muted">Aucun emprunt.</p></div>'}
            <h3 class="w-100 border-bottom pb-2 mt-4 text-danger">❤️ Mes Favoris</h3>
            <div class="row g-4 w-100">${mesf.length ? mesf.map(genererCarte).join('') : '<p class="text-muted">Aucun favori.</p></div>'}`;
    } else {
        conteneur.innerHTML = vetements.map(genererCarte).join('');
    }
}

function basculerAffichageFormulaire(afficher) {
    document.getElementById('section-dressing').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-recherche').style.display = afficher ? 'none' : 'block';
    document.getElementById('section-formulaire').style.display = afficher ? 'block' : 'none';
    document.getElementById('section-arborescence').style.display = 'none';
}