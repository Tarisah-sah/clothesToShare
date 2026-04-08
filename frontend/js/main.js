document.addEventListener('DOMContentLoaded', () => {
    
    // Initialisation
    chargerVetements();

    // Écouteurs pour le formulaire d'ajout
    document.getElementById('btn-afficher-ajout').addEventListener('click', () => basculerAffichageFormulaire(true));
    document.getElementById('btn-annuler').addEventListener('click', () => basculerAffichageFormulaire(false));
    document.getElementById('btn-fermer-form').addEventListener('click', () => basculerAffichageFormulaire(false));
    
    // Soumission du formulaire d'ajout
    document.getElementById('form-vetement').addEventListener('submit', ajouterVetement);

    // Écouteurs pour la recherche (à implémenter dans vetements.js plus tard)
    // document.getElementById('form-recherche').addEventListener('submit', filtrerVetements);
    // document.getElementById('btn-reset-recherche').addEventListener('click', reinitialiserRecherche);
});

// Écouteur pour afficher/masquer les infos de prêt dynamiquement
document.getElementById('etat').addEventListener('change', async function() {
    const sectionPret = document.getElementById('section-pret-dynamique');
    const emprunteurSelect = document.getElementById('idemprunteur');
    const dateFinInput = document.getElementById('datefinprevue');

    if (this.value === 'En prêt') {
        sectionPret.style.display = 'block';
        emprunteurSelect.required = true;
        dateFinInput.required = true;

        // Charger les utilisateurs si la liste est vide
        if (emprunteurSelect.options.length <= 1) {
            // Remplacer getpending_utilisateurs par get_all_utilisateurs quand il existera
            const utilisateurs = await fetchDonnees('get/getpending_utilisateurs.php'); 
            if (utilisateurs) {
                utilisateurs.forEach(user => {
                    emprunteurSelect.innerHTML += `<option value="${user.idutilisateur}">${user.nom} ${user.prenom}</option>`;
                });
            }
        }
    } else {
        sectionPret.style.display = 'none';
        emprunteurSelect.required = false;
        dateFinInput.required = false;
    }
});