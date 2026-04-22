// frontend/js/vetements.js

function initialiserMenuVetements() {
    document.getElementById('nav-accueil').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', 'dressing.html?tab=accueil'); 
        chargerVetements('accueil');
    });

    document.getElementById('nav-dressing').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', 'dressing.html?tab=dressing');
        chargerVetements('dressing');
    });
}

let tousLesVetements = [];
let modeActuel = 'accueil';

async function chargerVetements(mode = 'accueil') {
    modeActuel = mode; 
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (mode === 'dressing' && !user) {
        alert("Tu dois être connecté pour voir ton dressing privé !");
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('nav-accueil').classList.toggle('active', mode === 'accueil');
    document.getElementById('nav-dressing').classList.toggle('active', mode === 'dressing');
    
    const titre = document.getElementById('titre-section-vetements');
    if (titre) titre.innerHTML = mode === 'dressing' ? 'Mon Dressing' : 'Accueil';

    const btnAjout = document.getElementById('btn-afficher-ajout');
    if (btnAjout) {
        if (user && mode === 'dressing') {
            btnAjout.style.display = 'block';
        } else {
            btnAjout.style.display = 'none';
        }
    }

    document.getElementById('section-arborescence').style.display = 'none';
    document.getElementById('section-formulaire').style.display = 'none';
    document.getElementById('section-recherche').style.display = 'block';
    document.getElementById('section-dressing').style.display = 'block';

    let url = `vetement/getall_vetements.php?mode=${mode}`;
    if (user) {
        url += `&userId=${user.idutilisateur}`;
        if (mode === 'dressing') {
            const favoris = JSON.parse(localStorage.getItem('favoris_' + user.idutilisateur)) || [];
            if (favoris.length > 0) {
                url += `&favoris=${favoris.join(',')}`;
            }
        }
    }

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

    const resultat = await postDonnees('vetement/add_vetement.php', formData);
    
    if (resultat && resultat.status === 'success') {
        alert("Vêtement ajouté avec succès !");
        document.getElementById('form-vetement').reset();
        basculerAffichageFormulaire(false);
        chargerVetements(modeActuel);
    } else {
        alert("Erreur lors de l'ajout : " + (resultat.message || "Erreur inconnue"));
    }
}

async function filtrerVetements(event) {
    event.preventDefault(); 

    const texte = document.getElementById('search-texte').value.trim();
    const categorie = document.getElementById('search-categorie').value;
    const etat = document.getElementById('search-etat').value;
    const taille = document.getElementById('search-taille').value.trim();
    const genre = document.getElementById('search-genre').value;
    const type = document.getElementById('search-type').value.trim();
    const marque = document.getElementById('search-marque').value.trim();

    const checkboxesCouleurs = document.querySelectorAll('.couleur-checkbox:checked');
    const couleurs = Array.from(checkboxesCouleurs).map(cb => cb.value).join(',');

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

    const url = `vetement/recherche_vetement.php?${params.toString()}`;
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

function reinitialiserRecherche() {
    document.getElementById('form-recherche').reset(); 
    chargerVetements(); 
}

// ==========================================
// GESTION DES PRÊTS ET RETOURS
// ==========================================

async function ouvrirModalPret(idVetement, nomVetement) {
    document.getElementById('pret-id-vetement').value = idVetement;
    document.getElementById('pret-nom-vetement').value = nomVetement;
    document.getElementById('pret-date-debut').valueAsDate = new Date(); 

    const select = document.getElementById('pret-emprunteur');
    if (select.options.length <= 1) {
        const utilisateurs = await fetchDonnees('utilisateur/get_all_utilisateurs.php');
        if (utilisateurs) {
            utilisateurs.forEach(u => {
                select.innerHTML += `<option value="${u.idutilisateur}">${u.prenom} ${u.nom}</option>`;
            });
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('modalPret'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    const btnValiderPret = document.getElementById('btn-valider-pret');
    if (btnValiderPret) {
        btnValiderPret.addEventListener('click', async () => {
            const formData = new FormData();
            formData.append('idvetement', document.getElementById('pret-id-vetement').value);
            formData.append('idutilisateur', document.getElementById('pret-emprunteur').value);
            formData.append('datefinpret', document.getElementById('pret-date-fin').value);

            if (!document.getElementById('pret-emprunteur').value || !document.getElementById('pret-date-fin').value) {
                alert("Merci de sélectionner un emprunteur et une date de fin.");
                return;
            }

            const resultat = await postDonnees('pret/pret_vetement.php', formData);
            
            if (resultat && resultat.status === 'success') {
                const modalElement = document.getElementById('modalPret');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                alert('Vêtement prêté avec succès !');
                chargerVetements(); 
            } else {
                alert("Erreur lors du prêt : " + (resultat.message || "Erreur inconnue"));
            }
        });
    }
});

async function rendreVetement(idVetement) {
    const commentaire = prompt("Un petit commentaire sur l'état du vêtement rendu ? (facultatif)");
    if (commentaire !== null) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        formData.append('commentaire', commentaire);

        const resultat = await postDonnees('vetement/rend_vetement.php', formData);
        if (resultat && resultat.status === 'success') {
            chargerVetements(); 
        } else {
            alert("Erreur lors du retour : " + resultat.message);
        }
    }
}

async function vetementLave(idVetement) {
    if (confirm("Ce vêtement est propre et de nouveau disponible dans ton dressing ?")) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);

        const resultat = await postDonnees('vetement/lave_vetement.php', formData);
        if (resultat && resultat.status === 'success') {
            chargerVetements(); 
        }
    }
}

function reinitialiserFormulaire() {
    document.getElementById('form-vetement').reset();
    document.getElementById('edit-idvetement').value = "";
    document.getElementById('form-titre').textContent = "Ajouter un vêtement";
    document.querySelector('#form-vetement button[type="submit"]').textContent = "Enregistrer";
    document.getElementById('photo').required = true;
    document.getElementById('aide-photo').classList.add('d-none');

    // Réinitialisation de la cascade
    document.getElementById('idrangement').innerHTML = '<option value="">Choisir un local d\'abord...</option>';
    document.getElementById('idrangement').disabled = true;
    document.getElementById('idniveau').innerHTML = '<option value="">Choisir un rangement d\'abord...</option>';
    document.getElementById('idniveau').disabled = true;
}

// ==========================================
// GESTION DE LA MODIFICATION
// ==========================================

async function preparerEdition(id) {
    const vetement = tousLesVetements.find(v => v.idvetement == id);
    if (!vetement) return;

    document.getElementById('edit-idvetement-modal').value = vetement.idvetement;
    document.getElementById('edit-nom').value = vetement.nom;
    document.getElementById('edit-marque').value = vetement.marque;
    document.getElementById('edit-taille').value = vetement.taille;
    document.getElementById('edit-couleur').value = vetement.couleur;
    document.getElementById('edit-genre').value = vetement.genre;
    document.getElementById('edit-type').value = vetement.type;
    document.getElementById('edit-idcategorie').value = vetement.idcategorie;
    document.getElementById('edit-etat').value = vetement.etat; 
    document.getElementById('edit-description').value = vetement.description;
    document.getElementById('edit-photo').value = "";

    // NOUVEAU : Préremplir la cascade !
    document.getElementById('edit-idniveau').innerHTML = '<option value="">Chargement...</option>';
    document.getElementById('edit-idniveau').disabled = true;

    await chargerSelectLocaux('edit-');
    document.getElementById('edit-idlocal').value = vetement.idLocal;

    await chargerSelectRangements('edit-', vetement.idLocal);
    document.getElementById('edit-idrangement').value = vetement.idRangement;

    await chargerSelectNiveaux('edit-', vetement.idRangement);
    document.getElementById('edit-idniveau').value = vetement.idniveau;

    const modal = new bootstrap.Modal(document.getElementById('modalModifier'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    const btnSauvegarderModif = document.getElementById('btn-sauvegarder-modif');
    if (btnSauvegarderModif) {
        btnSauvegarderModif.addEventListener('click', async () => {
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
            formData.append('etat', document.getElementById('edit-etat').value); 
            formData.append('description', document.getElementById('edit-description').value);
            formData.append('type', document.getElementById('edit-type').value);
            formData.append('idcategorie', document.getElementById('edit-idcategorie').value);
            formData.append('idniveau', document.getElementById('edit-idniveau').value);

            const user = JSON.parse(sessionStorage.getItem('user'));
            formData.append('idproprietaire', user.idutilisateur);

            const photoFile = document.getElementById('edit-photo').files[0];
            if (photoFile) {
                formData.append('photo', photoFile);
            }

            const resultat = await postDonnees('vetement/modify_vetement.php', formData);
            
            if (resultat && resultat.status === 'success') {
                const modalElement = document.getElementById('modalModifier');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                alert("Vêtement mis à jour avec succès !");
                chargerVetements(modeActuel); 
            } else {
                alert("Erreur lors de la modification : " + (resultat.message || "Erreur inconnue"));
            }
        });
    }
});

function supprimerVetement(id) {
    if(confirm("Es-tu sûr de vouloir supprimer définitivement ce vêtement ?")) {
        fetch('backend/vetement/delete_vetement.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idvetement: id })
        })
        .then(r => r.json())
        .then(data => {
            if(data.status === 'success') {
                chargerVetements(modeActuel); 
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

async function ouvrirModalDetails(id) {
    const vetement = tousLesVetements.find(v => v.idvetement == id);
    if (!vetement) return;

    idVetementEnCoursDeDetail = id;

    document.getElementById('detail-nom').textContent = vetement.nom;
    document.getElementById('detail-photo').src = (vetement.photo && vetement.photo.trim() !== "") ? vetement.photo : 'https://placehold.co/500x300?text=Pas+de+photo';
    document.getElementById('detail-marque').textContent = vetement.marque || 'Non spécifié';
    document.getElementById('detail-taille').textContent = vetement.taille;
    document.getElementById('detail-couleur').textContent = vetement.couleur;
    document.getElementById('detail-genre').textContent = vetement.genre;
    document.getElementById('detail-type').textContent = vetement.type;
    document.getElementById('detail-description').textContent = vetement.description || 'Aucune description fournie.';
    
    document.getElementById('detail-proprio').textContent = 'Chargement...';
    const utilisateurs = await fetchDonnees('utilisateur/get_all_utilisateurs.php');
    if (utilisateurs) {
        const proprio = utilisateurs.find(u => u.idutilisateur == vetement.idproprietaire);
        document.getElementById('detail-proprio').textContent = proprio ? proprio.login : 'Utilisateur introuvable';
    }
    
    const badgeEtat = document.getElementById('detail-etat');
    badgeEtat.textContent = vetement.etat;
    badgeEtat.className = 'badge mb-3 fs-6 ' + 
        (vetement.etat === 'Disponible' ? 'bg-success' : 
        (vetement.etat === 'En prêt' ? 'bg-warning text-dark' : 'bg-info text-dark'));

    const zoneEmprunt = document.getElementById('zone-emprunt');
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (user && user.idutilisateur != vetement.idproprietaire && vetement.etat === 'Disponible') {
        zoneEmprunt.classList.remove('d-none');
        document.getElementById('emprunt-date-fin').value = ''; 
    } else {
        zoneEmprunt.classList.add('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('modalDetailsVetement'));
    modal.show();
}

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
            
            const formData = new FormData();
            formData.append('idvetement', idVetementEnCoursDeDetail);
            formData.append('idutilisateur', user.idutilisateur); 
            formData.append('datefinpret', dateFin);

            const resultat = await postDonnees('pret/pret_vetement.php', formData);
            
            if (resultat && resultat.status === 'success') {
                const modalElement = document.getElementById('modalDetailsVetement');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                alert("Emprunt confirmé ! Le vêtement est maintenant dans ton dressing.");
                chargerVetements(modeActuel); 
            } else {
                alert("Erreur lors de l'emprunt : " + (resultat.message || "Erreur inconnue"));
            }
        });
    }
});

async function repondreDemande(idVetement, action) {
    let confirmation = true;
    if (action === 'refuser') {
        confirmation = confirm("Es-tu sûr de vouloir refuser cette demande de prêt ?");
    }

    if (confirmation) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        formData.append('action', action);

        const resultat = await postDonnees('pret/repondre_demande_pret.php', formData);
        
        if (resultat && resultat.status === 'success') {
            alert(action === 'accepter' ? "Demande acceptée ! Le vêtement est en prêt." : "Demande refusée.");
            chargerVetements(modeActuel); 
        } else {
            alert("Erreur lors du traitement de la demande : " + (resultat.message || "inconnue"));
        }
    }
}

async function signalerRetour(idVetement) {
    if(confirm("Confirmer que tu as bien rendu ce vêtement à son propriétaire ?")) {
        const formData = new FormData();
        formData.append('idvetement', idVetement);
        
        const resultat = await postDonnees('pret/demande_retour.php', formData);
        if (resultat && resultat.status === 'success') {
            alert("Le propriétaire a été notifié ! En attente de sa confirmation.");
            chargerVetements(modeActuel); 
        } else {
            alert("Erreur lors de la notification : " + (resultat.message || "inconnue"));
        }
    }
}

// ==========================================
// CASCADES : LOCAL > RANGEMENT > NIVEAU
// ==========================================

async function chargerSelectLocaux(prefix) {
    const selectLocal = document.getElementById(prefix + 'idlocal');
    const data = await fetchDonnees('local/get_locaux.php');
    selectLocal.innerHTML = '<option value="">Choisir...</option>';
    if(data) data.forEach(l => selectLocal.innerHTML += `<option value="${l.idLocal}">${l.nom}</option>`);
}

async function chargerSelectRangements(prefix, idLocal) {
    const selectRang = document.getElementById(prefix + 'idrangement');
    const selectNiv = document.getElementById(prefix + 'idniveau');
    selectRang.innerHTML = '<option value="">Chargement...</option>';
    
    selectNiv.innerHTML = '<option value="">Choisir un rangement d\'abord...</option>';
    selectNiv.disabled = true;

    if(!idLocal) {
        selectRang.innerHTML = '<option value="">Choisir un local d\'abord...</option>';
        selectRang.disabled = true;
        return;
    }

    const data = await fetchDonnees(`rangement/get_rangements.php?idLocal=${idLocal}`);
    selectRang.innerHTML = '<option value="">Choisir...</option>';
    if(data) data.forEach(r => selectRang.innerHTML += `<option value="${r.idRangement}">${r.nom}</option>`);
    selectRang.disabled = false;
}

async function chargerSelectNiveaux(prefix, idRangement) {
    const selectNiv = document.getElementById(prefix + 'idniveau');
    selectNiv.innerHTML = '<option value="">Chargement...</option>';

    if(!idRangement) {
        selectNiv.innerHTML = '<option value="">Choisir un rangement d\'abord...</option>';
        selectNiv.disabled = true;
        return;
    }

    const data = await fetchDonnees(`niveau/get_niveaux.php?idRangement=${idRangement}`);
    selectNiv.innerHTML = '<option value="">Choisir...</option>';
    if(data) data.forEach(n => selectNiv.innerHTML += `<option value="${n.idNiveau}">${n.nom}</option>`);
    selectNiv.disabled = false;
}

// Relie les actions "on change" aux selects
function attacherEventCascades(prefix) {
    const local = document.getElementById(prefix + 'idlocal');
    const rangement = document.getElementById(prefix + 'idrangement');
    
    if (local && rangement) {
        local.addEventListener('change', function() {
            chargerSelectRangements(prefix, this.value);
        });
        rangement.addEventListener('change', function() {
            chargerSelectNiveaux(prefix, this.value);
        });
    }
}