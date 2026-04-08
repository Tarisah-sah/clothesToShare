// frontend/js/ui.js

function afficherCartesVetements(vetements) {
    const conteneur = document.getElementById('liste-vetements');
    conteneur.innerHTML = '';

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

        const carteHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${photoUrl}" class="card-img-top" alt="${vetement.nom}" style="height: 200px; object-fit: cover;">
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
}