document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. On attend que TOUS les composants HTML soient injectés
    await chargerComposant('composant-navbar', 'frontend/components/navbar.html');
    await chargerComposant('composant-modals', 'frontend/components/modals.html');
    await chargerComposant('composant-recherche', 'frontend/components/recherche.html');
    await chargerComposant('composant-formulaire', 'frontend/components/formulaireAjout.html');

    // 2. Maintenant que le HTML existe, on lance la vérification de connexion
    verifierSession();

    // 3. On active les boutons du menu
    initialiserMenuVetements();
    initialiserArborescence();

    // 4. On charge le contenu principal (la page d'accueil)
    // On lit l'URL pour savoir quel onglet ouvrir
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'accueil';
    
    if (tab === 'dressing') {
        chargerVetements('dressing');
    } else if (tab === 'explorer') {
        // On attend 100ms que le composant soit bien prêt avant de cliquer
        setTimeout(() => document.getElementById('nav-arborescence').click(), 100);
    } else {
        chargerVetements('accueil');
    }
    
    // 5. On attache les événements aux éléments qui viennent d'être injectés
    document.getElementById('btn-afficher-ajout').addEventListener('click', () => {
        reinitialiserFormulaire();
        basculerAffichageFormulaire(true);
    });
    
    document.getElementById('btn-annuler').addEventListener('click', () => basculerAffichageFormulaire(false));
    document.getElementById('btn-fermer-form').addEventListener('click', () => basculerAffichageFormulaire(false));
    
    document.getElementById('form-vetement').addEventListener('submit', ajouterVetement);
    document.getElementById('form-recherche').addEventListener('submit', filtrerVetements);
    document.getElementById('btn-reset-recherche').addEventListener('click', reinitialiserRecherche);
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
            const utilisateurs = await fetchDonnees('utilisateur/get_all_utilisateurs.php'); 
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