// On attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    
    // On appelle la fonction pour charger les vêtements dès le début
    chargerVetements();

});

/**
 * Fonction qui récupère les vêtements via l'API et met à jour l'affichage
 */
function chargerVetements() {
    const apiURL = 'backend/get/getall_vetements.php'; 

    // On utilise fetch() pour faire la requête AJAX
    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors de la récupération des données');
            }
            return response.json(); // On transforme la réponse en objet JavaScript
        })
        .then(data => {
            // 1. ON ESPIONNE CE QUE LE PHP NOUS DONNE
            console.log("Données reçues de PHP :", data); 

            // 2. ON SÉCURISE LE CODE
            let liste = []; 
            
            if (Array.isArray(data)) {
                // Si le PHP renvoie directement le tableau
                liste = data; 
            } else if (data && data.data && Array.isArray(data.data)) {
                // Si Neph a utilisé notre contrat JSON { statut: "success", data: [...] }
                liste = data.data; 
            } else {
                console.error("Format de données inconnu :", data);
            }

            // 3. ON ENVOIE LE VRAI TABLEAU A LA FONCTION
            afficherCartesVetements(liste);
        })
        .catch(error => {
            console.error('Erreur :', error);
            document.getElementById('liste-vetements').innerHTML = 
                '<div class="col-12"><div class="alert alert-danger">Impossible de charger le dressing pour le moment.</div></div>';
        });
}

/**
 * Fonction qui génère le HTML des cartes à partir des données
 */
function afficherCartesVetements(vetements) {
    const conteneur = document.getElementById('liste-vetements');
    conteneur.innerHTML = ''; // On vide le conteneur avant de le remplir

    if (vetements.length === 0) {
        conteneur.innerHTML = '<div class="col-12"><p class="text-center text-muted">Votre dressing est vide !</p></div>';
        return;
    }

    // On parcourt chaque vêtement reçu
    vetements.forEach(vetement => {
        
        // On choisit la couleur du badge en fonction de l'état
        let badgeColor = 'bg-secondary';
        if (vetement.etat === 'Disponible') badgeColor = 'bg-success';
        if (vetement.etat === 'En prêt') badgeColor = 'bg-warning text-dark';
        if (vetement.etat === 'Au lavage') badgeColor = 'bg-info text-dark';

        // Si la photo est vide, on met une image par défaut
        const photoUrl = vetement.photo ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';

        // On construit le HTML de la carte
        const carteHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${photoUrl}" class="card-img-top" alt="${vetement.nom}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${vetement.nom}</h5>
                            <span class="badge ${badgeColor} rounded-pill">${vetement.etat}</span>
                        </div>
                        <p class="card-text text-muted small mb-3">
                            Marque : ${vetement.marque} | Taille : ${vetement.taille} | Genre : ${vetement.genre}
                        </p>
                        <p class="card-text">${vetement.description}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0 pt-0">
                        <div class="d-grid gap-2 d-flex justify-content-end">
                            <button class="btn btn-outline-secondary btn-sm" onclick="modifierVetement(${vetement.idvetement})">Modifier</button>
                            <button class="btn btn-primary btn-sm" onclick="ouvrirModalPret(${vetement.idvetement}, '${vetement.nom}')" ${vetement.etat !== 'Disponible' ? 'disabled' : ''}>Prêter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // On ajoute la carte au conteneur principal
        conteneur.insertAdjacentHTML('beforeend', carteHTML);
    });
}

// Fonctions vides pour le moment (à remplir plus tard !)
function modifierVetement(id) {
    console.log("Clic sur modifier pour l'ID : " + id);
    // Ici, on affichera le formulaire pré-rempli
}

function ouvrirModalPret(id, nom) {
    console.log("Clic sur prêter pour : " + nom);
    // Ici, on ouvrira la Modale Bootstrap
}