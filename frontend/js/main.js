// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
// On stocke tous les vêtements ici une bonne fois pour toutes 
// pour pouvoir les filtrer en direct sans rappeler le serveur PHP.
let tousLesVetements = [];

// =====================================================================
// INITIALISATION (Quand la page a fini de charger)
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. On charge les vêtements depuis la base de données dès le début
    chargerVetements();

    // 2. On écoute la validation du formulaire de recherche
    document.getElementById('form-recherche').addEventListener('submit', filtrerVetements);
    
    // 3. On écoute le clic sur le bouton d'annulation (la petite croix)
    document.getElementById('btn-reset-recherche').addEventListener('click', reinitialiserRecherche);

});

// =====================================================================
// FONCTIONS DE COMMUNICATION AVEC LE BACK-END (AJAX / FETCH)
// =====================================================================

/**
 * Fonction qui récupère les vêtements via l'API de Neph
 */
function chargerVetements() {
    const apiURL = 'backend/get/getall_vetements.php';
    console.log("📡 Appel vers :", apiURL); // ← vérifie le chemin

    fetch(apiURL)
        .then(response => {
            console.log("📥 Statut HTTP :", response.status); // ← 200 ? 404 ? 500 ?
            if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log("✅ Données reçues :", data); // ← vide ? null ? tableau ?
            if (Array.isArray(data)) {
                tousLesVetements = data;
            } else {
                console.error("❌ Format inattendu :", data);
                tousLesVetements = [];
            }
            afficherCartesVetements(tousLesVetements);
        })
        .catch(error => {
            console.error('❌ Erreur fetch :', error); // ← message d'erreur précis
            document.getElementById('liste-vetements').innerHTML =
                '<div class="col-12"><div class="alert alert-danger">Impossible de charger le dressing.</div></div>';
        });
}

// =====================================================================
// FONCTIONS D'AFFICHAGE ET D'INTERFACE (FRONT-END)
// =====================================================================

/**
 * Fonction qui génère le HTML des cartes Bootstrap à partir des données
 */
function afficherCartesVetements(vetements) {
    const conteneur = document.getElementById('liste-vetements');
    conteneur.innerHTML = ''; // On vide la zone avant de dessiner les nouvelles cartes

    // Si le tableau est vide (aucun vêtement ou recherche infructueuse)
    if (vetements.length === 0) {
        conteneur.innerHTML = '<div class="col-12"><p class="text-center text-muted">Aucun vêtement trouvé.</p></div>';
        return;
    }

    // On parcourt chaque vêtement reçu pour créer sa carte HTML
    vetements.forEach(vetement => {
        
        // On choisit la couleur du badge Bootstrap en fonction de l'état du vêtement
        let badgeColor = 'bg-secondary';
        if (vetement.etat === 'Disponible') badgeColor = 'bg-success';
        if (vetement.etat === 'En prêt') badgeColor = 'bg-warning text-dark';
        if (vetement.etat === 'Au lavage') badgeColor = 'bg-info text-dark';

        // Gestion de la photo (image par défaut si aucune photo n'est fournie)
        const photoUrl = (vetement.photo && vetement.photo.trim() !== "") ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';

        // Construction du HTML de la carte
        const carteHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${photoUrl}" class="card-img-top" alt="${vetement.nom}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${vetement.nom || 'Vêtement sans nom'}</h5>
                            <span class="badge ${badgeColor} rounded-pill">${vetement.etat}</span>
                        </div>
                        <p class="card-text text-muted small mb-3">
                            Marque : ${vetement.marque || 'N/A'} | Taille : ${vetement.taille} | Genre : ${vetement.genre}
                        </p>
                        <p class="card-text">${vetement.description}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0 pt-0">
                        <div class="d-grid gap-2 d-flex justify-content-end">
                            <button class="btn btn-outline-secondary btn-sm" onclick="modifierVetement(${vetement.idvetement})">Modifier</button>
                            <button class="btn btn-primary btn-sm" onclick="ouvrirModalPret(${vetement.idvetement}, '${vetement.nom ? vetement.nom.replace(/'/g, "\\'") : ''}')" ${vetement.etat !== 'Disponible' ? 'disabled' : ''}>Prêter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // On injecte la carte dans la page web
        conteneur.insertAdjacentHTML('beforeend', carteHTML);
    });
}

// =====================================================================
// FONCTIONS DE RECHERCHE
// =====================================================================

/**
 * Fonction de recherche multifactorielle
 */
function filtrerVetements(event) {
    event.preventDefault(); // On bloque le rechargement

    const motCle = document.getElementById('search-texte').value.trim();
    const categorieChoisie = document.getElementById('search-categorie').value; 
    const etatChoisi = document.getElementById('search-etat').value;

    // On construit l'URL avec les paramètres
    const url = `backend/get/recherche_vetement.php?vetement_recherche=${encodeURIComponent(motCle)}&vetement_categorie=${encodeURIComponent(categorieChoisie)}&vetement_etat=${encodeURIComponent(etatChoisi)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            afficherCartesVetements(data);
        })
        .catch(err => console.error("Erreur de recherche :", err));
}

/**
 * Fonction pour réinitialiser la recherche
 */
function reinitialiserRecherche() {
    // Vide le formulaire HTML
    document.getElementById('form-recherche').reset();
    // Réaffiche tous les vêtements
    afficherCartesVetements(tousLesVetements);
}

// =====================================================================
// ACTIONS SUR LES VÊTEMENTS (À développer)
// =====================================================================

function modifierVetement(id) {
    console.log("Clic sur modifier pour l'ID : " + id);
    alert("La fonctionnalité de modification sera bientôt disponible !");
}

function ouvrirModalPret(id, nom) {
    console.log("Clic sur prêter pour l'ID : " + id + " - Nom : " + nom);
    // TODO: Afficher la Modale Bootstrap et pré-remplir les champs
}