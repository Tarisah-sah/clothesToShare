document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. On attend que TOUS les composants HTML soient injectés
    await chargerComposant('composant-navbar', 'frontend/components/navbar.html');
    await chargerComposant('composant-modals', 'frontend/components/modals.html');
    await chargerComposant('composant-recherche', 'frontend/components/recherche.html');
    await chargerComposant('composant-formulaire', 'frontend/components/formulaireAjout.html');

    // 2. Vérification de connexion
    verifierSession();

    // 3. On active les boutons du menu
    initialiserMenuVetements();
    initialiserArborescence();

    // --- NOUVEAUTÉ : On active les clics des modales (Mise à jour, Prêt, Emprunt) ---
    initialiserEcouteursVetements();

    // --- NOUVEAUTÉ : On active le "suivi" des listes déroulantes (pour détecter les clics) ---
    attacherEventCascades('');      // Formulaire d'ajout
    attacherEventCascades('edit-'); // Fenêtre de modification

    // 4. On charge le contenu principal 
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'accueil';
    
    if (tab === 'dressing') {
        chargerVetements('dressing');
    } else if (tab === 'explorer') {
        setTimeout(() => document.getElementById('nav-arborescence').click(), 100);
    } else {
        chargerVetements('accueil');
    }
    
    // 5. Bouton "Ajouter un vêtement"
    document.getElementById('btn-afficher-ajout').addEventListener('click', async () => {
        reinitialiserFormulaire();
        await chargerSelectLocaux(''); // NOUVEAU : Télécharge la liste des Locaux
        basculerAffichageFormulaire(true);
    });
    
    // Fermeture du formulaire
    document.getElementById('btn-annuler').addEventListener('click', () => basculerAffichageFormulaire(false));
    document.getElementById('btn-fermer-form').addEventListener('click', () => basculerAffichageFormulaire(false));
    
    document.getElementById('form-vetement').addEventListener('submit', ajouterVetement);
    document.getElementById('form-recherche').addEventListener('submit', filtrerVetements);
    document.getElementById('btn-reset-recherche').addEventListener('click', reinitialiserRecherche);

    // 6. Gestion du champ "Etat" (pour afficher la zone d'emprunt si "En prêt" est choisi)
    const champEtat = document.getElementById('etat');
    if (champEtat) {
        champEtat.addEventListener('change', async function() {
            const sectionPret = document.getElementById('section-pret-dynamique');
            const emprunteurSelect = document.getElementById('idemprunteur');
            const dateFinInput = document.getElementById('datefinprevue');

            if (this.value === 'En prêt') {
                sectionPret.style.display = 'block';
                emprunteurSelect.required = true;
                dateFinInput.required = true;

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
    }
});