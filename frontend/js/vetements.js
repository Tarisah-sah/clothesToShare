let tousLesVetements = [];

// Variable globale pour mémoriser sur quel onglet on est
let modeActuel = 'accueil'; 

// Écouteurs pour le menu (A placer au tout début de vetements.js ou dans un DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-accueil').addEventListener('click', (e) => {
        e.preventDefault();
        chargerVetements('accueil');
    });

    document.getElementById('nav-dressing').addEventListener('click', (e) => {
        e.preventDefault();
        chargerVetements('dressing');
    });
});

// La fonction de chargement modifiée
// La fonction de chargement modifiée
async function chargerVetements(mode = 'accueil') {
    modeActuel = mode; // On mémorise le choix
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Protection : Si on clique sur Dressing sans être connecté
    if (mode === 'dressing' && !user) {
        alert("Tu dois être connecté pour voir ton dressing privé !");
        window.location.href = 'login.html';
        return;
    }

    // Gestion visuelle du menu actif
    document.getElementById('nav-accueil').classList.toggle('active', mode === 'accueil');
    document.getElementById('nav-dressing').classList.toggle('active', mode === 'dressing');
    
    // Changement du titre H2
    const titre = document.getElementById('titre-section-vetements');
    if (titre) titre.innerHTML = mode === 'dressing' ? '👗 Mon Dressing' : '🌍 Accueil';

    // --- NOUVEAUTÉ : GESTION DU BOUTON "+ AJOUTER" ---
    const btnAjout = document.getElementById('btn-afficher-ajout');
    if (btnAjout) {
        // On affiche le bouton SEULEMENT si on est connecté ET sur l'onglet "Mon Dressing"
        if (user && mode === 'dressing') {
            btnAjout.style.display = 'block';
        } else {
            btnAjout.style.display = 'none';
        }
    }

    // Rendre visible les bonnes sections
    document.getElementById('section-arborescence').style.display = 'none';
    document.getElementById('section-formulaire').style.display = 'none';
    document.getElementById('section-recherche').style.display = 'block';
    document.getElementById('section-dressing').style.display = 'block';

    // Construction de l'URL pour le PHP
    let url = `get/getall_vetements.php?mode=${mode}`;
    if (user) url += `&userId=${user.idutilisateur}`;

    const data = await fetchDonnees(url);
    if (data && Array.isArray(data)) {
        tousLesVetements = data;
        afficherCartesVetements(tousLesVetements);
    } else {
        document.getElementById('liste-vetements').innerHTML = '<div class="alert alert-danger">Impossible de charger les vêtements.</div>';
    }
}

async function ajouterVetement(event) {
    event.preventDefault();

    const formData = new FormData();
    const photoFile = document.getElementById('photo').files[0];

    // --- MODE AJOUT CLASSIQUE ---
    formData.append('vetement_new[nom]', document.getElementById('nom').value);
    formData.append('vetement_new[marque]', document.getElementById('marque').value);
    formData.append('vetement_new[taille]', document.getElementById('taille').value);
    formData.append('vetement_new[couleur]', document.getElementById('couleur').value);
    formData.append('vetement_new[genre]', document.getElementById('genre').value);
    formData.append('vetement_new[etat]', document.getElementById('etat').value);
    formData.append('vetement_new[description]', document.getElementById('description').value);
    formData.append('vetement_new[type]', document.getElementById('type').value);
    formData.append('vetement_new[idcategorie]', document.getElementById('idcategorie').value);
    formData.append('vetement_new[idniveau]', document.getElementById('idniveau').value);
    
    const user = JSON.parse(sessionStorage.getItem('user'));
    formData.append('vetement_new[idproprietaire]', user.idutilisateur);
    
    formData.append('vetement_new[idemprunteur]', document.getElementById('idemprunteur').value);
    formData.append('vetement_new[datefinprevue]', document.getElementById('datefinprevue').value);
    if (photoFile) formData.append('photo', photoFile);

    const resultat = await postDonnees('add/add_vetement.php', formData);
    
    if (resultat && resultat.status === 'success') {
        alert("Vêtement ajouté avec succès !");
        document.getElementById('form-vetement').reset();
        basculerAffichageFormulaire(false);
        chargerVetements(modeActuel);
    } else {
        alert("Erreur lors de l'ajout : " + (resultat.message || "Erreur inconnue"));
    }
}

// Fonction pour filtrer les vêtements
async function filtrerVetements(event) {
    event.preventDefault(); 

    // Récupération des valeurs simples
    const texte = document.getElementById('search-texte').value.trim();
    const categorie = document.getElementById('search-categorie').value;
    const etat = document.getElementById('search-etat').value;
    const taille = document.getElementById('search-taille').value.trim();
    const genre = document.getElementById('search-genre').value;
    const type = document.getElementById('search-type').value.trim();
    const marque = document.getElementById('search-marque').value.trim();

    // Récupération des couleurs multiples (Lit toutes les cases cochées qui ont la classe 'couleur-checkbox')
    const checkboxesCouleurs = document.querySelectorAll('.couleur-checkbox:checked');
    const couleurs = Array.from(checkboxesCouleurs).map(cb => cb.value).join(',');

    // Construction dynamique de l'URL avec URLSearchParams (plus propre)
    const params = new URLSearchParams();
    if (texte) params.append('motcle', texte);
    if (categorie) params.append('categorie', categorie);
    if (etat) params.append('etat', etat);
    if (taille) params.append('taille', taille);
    if (genre) params.append('genre', genre);
    if (type) params.append('type', type);
    if (marque) params.append('marque', marque);
    if (couleurs) params.append('couleurs', couleurs);

    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    params.append('mode', modeActuel);
    if (user) params.append('userId', user.idutilisateur);

    const url = `get/recherche_vetement.php?${params.toString()}`;
    const data = await fetchDonnees(url);

    if (data && Array.isArray(data)) {
        if (data.length === 0) {
            document.getElementById('liste-vetements').innerHTML = '<div class="col-12"><p class="text-center text-muted">Aucun vêtement ne correspond.</p></div>';
        } else {
            afficherCartesVetements(data);
        }
    } else {
        alert("Erreur lors de la recherche.");
    }
}

// Fonction pour réinitialiser la recherche
function reinitialiserRecherche() {
    document.getElementById('form-recherche').reset(); // Vide les champs du formulaire
    chargerVetements(); // Recharge tous les vêtements par défaut
}

// ==========================================
// GESTION DES PRÊTS ET DES RETOURS
// ==========================================

// 1. Ouvre la modale pour prêter un vêtement
async function ouvrirModalPret(idVetement, nomVetement) {
    document.getElementById('pret-id-vetement').value = idVetement;
    document.getElementById('pret-nom-vetement').value = nomVetement;
    document.getElementById('pret-date-debut').valueAsDate = new Date(); // Date du jour par défaut

    // Charger les utilisateurs si la liste déroulante est vide
    const select = document.getElementById('pret-emprunteur');
    if (select.options.length <= 1) {
        const utilisateurs = await fetchDonnees('get/get_all_utilisateurs.php');
        if (utilisateurs) {
            utilisateurs.forEach(u => {
                select.innerHTML += `<option value="${u.idutilisateur}">${u.prenom} ${u.nom}</option>`;
            });
        }
    }

    // Ouvre la modale Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalPret'));
    modal.show();
}

// 2. Valider le formulaire de prêt (Clic sur "Valider" dans la modale)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-valider-pret').addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('idvetement', document.getElementById('pret-id-vetement').value);
        formData.append('idutilisateur', document.getElementById('pret-emprunteur').value);
        formData.append('datefinpret', document.getElementById('pret-date-fin').value);

        if (!document.getElementById('pret-emprunteur').value || !document.getElementById('pret-date-fin').value) {
            alert("Merci de sélectionner un emprunteur et une date de fin.");
            return;
        }

        const resultat = await postDonnees('post/pret_vetement.php', formData);
        
        if (resultat && resultat.status === 'success') {
            // Fermer la modale proprement
            const modalElement = document.getElementById('modalPret');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            alert('Vêtement prêté avec succès !');
            chargerVetements(); // On met à jour l'affichage
        } else {
            alert("Erreur lors du prêt : " + (resultat.message || "Erreur inconnue"));
        }
    });
});

// 3. Rendre un vêtement (Passe de "En prêt" à "Au lavage")
async function rendreVetement(idVetement) {
    const commentaire = prompt("Un petit commentaire sur l'état du vêtement rendu ? (facultatif)");
    
    // Si l'utilisateur n'a pas cliqué sur "Annuler" dans la fenêtre
    if (commentaire !== null) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        formData.append('commentaire', commentaire);

        const resultat = await postDonnees('post/rend_vetement.php', formData);
        if (resultat && resultat.status === 'success') {
            chargerVetements(); // Recharge l'affichage, il passera en "Au lavage"
        } else {
            alert("Erreur lors du retour : " + resultat.message);
        }
    }
}

// 4. Laver un vêtement (Passe de "Au lavage" à "Disponible")
async function vetementLave(idVetement) {
    if (confirm("Ce vêtement est propre et de nouveau disponible dans ton dressing ?")) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);

        const resultat = await postDonnees('post/lave_vetement.php', formData);
        if (resultat && resultat.status === 'success') {
            chargerVetements(); // Recharge l'affichage, il passera en "Disponible"
        }
    }
}

// Remet le formulaire à zéro (Mode "Ajout")
function reinitialiserFormulaire() {
    document.getElementById('form-vetement').reset();
    document.getElementById('edit-idvetement').value = "";
    document.getElementById('form-titre').textContent = "Ajouter un vêtement";
    document.querySelector('#form-vetement button[type="submit"]').textContent = "Enregistrer";
    document.getElementById('photo').required = true;
    document.getElementById('aide-photo').classList.add('d-none');
}

// GESTION DE LA MODIFICATION (MODALE)

// 1. Ouvre la modale et pré-remplit les champs
function preparerEdition(id) {
    const vetement = tousLesVetements.find(v => v.idvetement == id);
    if (!vetement) return;

    // Remplissage des champs de la modale
    document.getElementById('edit-idvetement-modal').value = vetement.idvetement;
    document.getElementById('edit-nom').value = vetement.nom;
    document.getElementById('edit-marque').value = vetement.marque;
    document.getElementById('edit-taille').value = vetement.taille;
    document.getElementById('edit-couleur').value = vetement.couleur;
    document.getElementById('edit-genre').value = vetement.genre;
    document.getElementById('edit-type').value = vetement.type;
    document.getElementById('edit-idcategorie').value = vetement.idcategorie;
    document.getElementById('edit-etat').value = vetement.etat; // Conservé en caché
    document.getElementById('edit-description').value = vetement.description;
    
    // On vide le champ fichier pour éviter toute confusion
    document.getElementById('edit-photo').value = "";

    // Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('modalModifier'));
    modal.show();
}

// 2. Écouteur pour la sauvegarde de la modale
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-sauvegarder-modif').addEventListener('click', async () => {
        
        // Validation basique (simule la validation HTML5)
        const form = document.getElementById('form-modifier-vetement');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData();
        formData.append('idvetement', document.getElementById('edit-idvetement-modal').value);
        formData.append('nom', document.getElementById('edit-nom').value);
        formData.append('marque', document.getElementById('edit-marque').value);
        formData.append('taille', document.getElementById('edit-taille').value);
        formData.append('couleur', document.getElementById('edit-couleur').value);
        formData.append('genre', document.getElementById('edit-genre').value);
        formData.append('etat', document.getElementById('edit-etat').value); // Repris de l'existant
        formData.append('description', document.getElementById('edit-description').value);
        formData.append('type', document.getElementById('edit-type').value);
        formData.append('idcategorie', document.getElementById('edit-idcategorie').value);
        formData.append('idniveau', document.getElementById('edit-idniveau').value);

        // Utilisateur connecté
        const user = JSON.parse(sessionStorage.getItem('user'));
        formData.append('idproprietaire', user.idutilisateur);

        // Photo (si modifiée)
        const photoFile = document.getElementById('edit-photo').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        // Appel au backend
        const resultat = await postDonnees('modify/modify_vetement.php', formData);
        
        if (resultat && resultat.status === 'success') {
            // Fermer la modale
            const modalElement = document.getElementById('modalModifier');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            alert("Vêtement mis à jour avec succès !");
            chargerVetements(modeActuel); // Recharge l'affichage
        } else {
            alert("Erreur lors de la modification : " + (resultat.message || "Erreur inconnue"));
        }
    });
});

// Supprimer un vêtement
function supprimerVetement(id) {
    if(confirm("Es-tu sûr de vouloir supprimer définitivement ce vêtement ?")) {
        fetch('backend/delete/delete_vetement.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idvetement: id })
        })
        .then(r => r.json())
        .then(data => {
            if(data.status === 'success') {
                chargerVetements(modeActuel); // On recharge l'affichage actuel
            } else {
                alert("Erreur : " + data.message);
            }
        });
    }
}

// ==========================================
// DÉTAILS ET EMPRUNT (UTILISATEUR)
// ==========================================

let idVetementEnCoursDeDetail = null;

// Ouvre la modale et remplit les détails
function ouvrirModalDetails(id) {
    const vetement = tousLesVetements.find(v => v.idvetement == id);
    if (!vetement) return;

    idVetementEnCoursDeDetail = id;

    // 1. Remplir les informations texte et image
    document.getElementById('detail-nom').textContent = vetement.nom;
    document.getElementById('detail-photo').src = (vetement.photo && vetement.photo.trim() !== "") ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';
    document.getElementById('detail-marque').textContent = vetement.marque || 'Non spécifié';
    document.getElementById('detail-taille').textContent = vetement.taille;
    document.getElementById('detail-couleur').textContent = vetement.couleur;
    document.getElementById('detail-genre').textContent = vetement.genre;
    document.getElementById('detail-type').textContent = vetement.type;
    document.getElementById('detail-description').textContent = vetement.description || 'Aucune description fournie.';
    
    // Gérer la couleur du badge état
    const badgeEtat = document.getElementById('detail-etat');
    badgeEtat.textContent = vetement.etat;
    badgeEtat.className = 'badge mb-3 fs-6 ' + 
        (vetement.etat === 'Disponible' ? 'bg-success' : 
        (vetement.etat === 'En prêt' ? 'bg-warning text-dark' : 'bg-info text-dark'));

    // 2. Gérer l'affichage de la zone d'emprunt
    const zoneEmprunt = document.getElementById('zone-emprunt');
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Règle : On affiche la zone emprunt SI l'utilisateur est connecté ET qu'il n'est PAS le propriétaire ET que le vêtement est Disponible
    if (user && user.idutilisateur != vetement.idproprietaire && vetement.etat === 'Disponible') {
        zoneEmprunt.classList.remove('d-none');
        document.getElementById('emprunt-date-fin').value = ''; // Réinitialiser la date
    } else {
        zoneEmprunt.classList.add('d-none');
    }

    // 3. Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('modalDetailsVetement'));
    modal.show();
}

// Action quand l'utilisateur clique sur "Confirmer"
document.addEventListener('DOMContentLoaded', () => {
    const btnEmprunt = document.getElementById('btn-confirmer-emprunt');
    
    if(btnEmprunt) {
        btnEmprunt.addEventListener('click', async () => {
            const dateFin = document.getElementById('emprunt-date-fin').value;
            
            if(!dateFin) {
                alert("Merci d'indiquer à quelle date tu prévois de rendre le vêtement !");
                return;
            }

            const user = JSON.parse(sessionStorage.getItem('user'));
            
            // On prépare les données pour ton fichier PHP existant pret_vetement.php
            const formData = new FormData();
            formData.append('idvetement', idVetementEnCoursDeDetail);
            formData.append('idutilisateur', user.idutilisateur); // C'est lui-même l'emprunteur !
            formData.append('datefinpret', dateFin);

            // On envoie la requête
            const resultat = await postDonnees('post/pret_vetement.php', formData);
            
            if (resultat && resultat.status === 'success') {
                // On ferme la modale
                const modalElement = document.getElementById('modalDetailsVetement');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                alert("Emprunt confirmé ! 🥳 Le vêtement est maintenant dans ton dressing.");
                chargerVetements(modeActuel); // Recharge la page
            } else {
                alert("Erreur lors de l'emprunt : " + (resultat.message || "Erreur inconnue"));
            }
        });
    }
});

// Fonction pour accepter ou refuser une demande de prêt reçue
async function repondreDemande(idVetement, action) {
    let confirmation = true;
    if (action === 'refuser') {
        confirmation = confirm("Es-tu sûr de vouloir refuser cette demande de prêt ?");
    }

    if (confirmation) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        formData.append('action', action);

        const resultat = await postDonnees('post/repondre_demande_pret.php', formData);
        
        if (resultat && resultat.status === 'success') {
            alert(action === 'accepter' ? "Demande acceptée ! Le vêtement est en prêt." : "Demande refusée.");
            chargerVetements(modeActuel); // On recharge la page pour voir le nouveau statut
        } else {
            alert("Erreur lors du traitement de la demande : " + (resultat.message || "inconnue"));
        }
    }
}

// Fonction pour que l'emprunteur signale qu'il a rendu le vêtement
async function signalerRetour(idVetement) {
    if(confirm("Confirmer que tu as bien rendu ce vêtement à son propriétaire ?")) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        
        const resultat = await postDonnees('post/demande_retour.php', formData);
        if (resultat && resultat.status === 'success') {
            alert("Le propriétaire a été notifié ! En attente de sa confirmation.");
            chargerVetements(modeActuel); // On recharge la page, le statut passera à "Retour en attente"
        } else {
            alert("Erreur lors de la notification : " + (resultat.message || "inconnue"));
        }
    }
}