/* Variables globales agissant comme cache local pour limiter les requêtes API redondantes lors de l'ouverture des modales */
let categoriesData = [];
let locauxData = [];
let rangementsData = [];
let niveauxData = [];
let sitesData = [];

// Prévisualise automatiquement des images lors d'un upload.
document.addEventListener('change', (e) => {
    if (e.target.type === 'file' && e.target.files[0]) {
        const reader = new FileReader();
        const previewImg = document.getElementById(e.target.id + '-preview');
        
        if (previewImg) {
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewImg.classList.remove('d-none');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userJson);
    if (user.role !== 'admin') {
        alert("Accès refusé. Cette page est réservée aux administrateurs.");
        window.location.href = 'dressing.html?tab=accueil';
        return;
    }

    /* Chargement initial des données */
    chargerCategories();
    chargerSites();
    chargerLocaux();
    chargerRangements();
    chargerNiveaux();

    /* Rafraîchissement des données lors de la navigation entre les onglets Admin */
    document.getElementById('sites-tab').addEventListener('shown.bs.tab', chargerSites);
    document.getElementById('locaux-tab').addEventListener('shown.bs.tab', chargerLocaux);
    document.getElementById('rangements-tab').addEventListener('shown.bs.tab', chargerRangements);
    document.getElementById('niveaux-tab').addEventListener('shown.bs.tab', chargerNiveaux);
    document.getElementById('categories-tab').addEventListener('shown.bs.tab', chargerCategories);
    document.getElementById('utilisateurs-tab').addEventListener('shown.bs.tab', chargerUtilisateurs);
    
    /* Ecouteurs d'événements pour les actions principales (Modales & Sauvegardes) */
    document.getElementById('btn-ajouter-site').addEventListener('click', ouvrirModalAjoutSite);
    document.getElementById('btn-sauvegarder-site').addEventListener('click', sauvegarderSite);

    document.getElementById('btn-ajouter-local').addEventListener('click', ouvrirModalAjoutLocal);
    document.getElementById('btn-sauvegarder-local').addEventListener('click', sauvegarderLocal);
    
    document.getElementById('btn-ajouter-rangement').addEventListener('click', ouvrirModalAjoutRangement);
    document.getElementById('btn-sauvegarder-rangement').addEventListener('click', sauvegarderRangement);
    
    document.getElementById('btn-ajouter-niveau').addEventListener('click', ouvrirModalAjoutNiveau);
    document.getElementById('btn-sauvegarder-niveau').addEventListener('click', sauvegarderNiveau);

    document.getElementById('btn-ajouter-categorie').addEventListener('click', ouvrirModalAjoutCategorie);
    document.getElementById('btn-sauvegarder-cat').addEventListener('click', sauvegarderCategorie);

    document.getElementById('btn-deconnexion-admin').addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Moteur de recherche
    function configurerRecherche(idInput, idTbody) {
        const input = document.getElementById(idInput);
        if (input) {
            input.addEventListener('input', function() {
                const terme = this.value.toLowerCase().trim();
                const tbody = document.getElementById(idTbody);
                if (!tbody) return;
                
                const lignes = tbody.querySelectorAll('tr');

                lignes.forEach(ligne => {
                    if (ligne.children.length === 1) return;

                    let texteLigne = "";
                    
                    Array.from(ligne.cells).forEach(cell => {
                        const select = cell.querySelector('select');
                        if (select) {
                            texteLigne += select.options[select.selectedIndex].text.toLowerCase() + " ";
                        } else {
                            texteLigne += cell.textContent.toLowerCase() + " ";
                        }
                    });

                    ligne.style.display = texteLigne.includes(terme) ? '' : 'none';
                });
            });
        }
    }

    configurerRecherche('search-sites', 'liste-sites');
    configurerRecherche('search-categories', 'liste-categories');
    configurerRecherche('search-locaux', 'liste-locaux');
    configurerRecherche('search-rangements', 'liste-rangements');
    configurerRecherche('search-niveaux', 'liste-niveaux');
    configurerRecherche('search-utilisateurs', 'liste-utilisateurs');
});

/* ==========================================
   GESTION DES SITES
   ========================================== */

// Récupère et injecte la liste des sites dans le tableau

async function chargerSites() {
    const tbody = document.getElementById('liste-sites');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';

    const data = await fetchDonnees('site/get_sites.php');
    if (data && Array.isArray(data)) {
        sitesData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun site trouvé.</td></tr>';
            return;
        }
        data.forEach(site => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${site.idSite}</td>
                <td class="align-middle"><img src="${site.photo || 'assets/icons/ctos.png'}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="align-middle">${site.nom}</td>
                <td class="align-middle text-muted small">${site.adresse || '-'}, ${site.code_postal || '-'} ${site.localite || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionSite(${site.idSite})">Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerSite(${site.idSite})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function ouvrirModalAjoutSite() {
    document.getElementById('form-site').reset();
    document.getElementById('site-id').value = "";
    document.getElementById('modalSiteTitre').textContent = "Ajouter un site";

    const inputPhoto = document.getElementById('site-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('site-photo-preview');
    if (preview) {
        preview.src = '';
        preview.classList.add('d-none');
    }
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite')).show();
}

function ouvrirModalEditionSite(id) {
    const site = sitesData.find(s => s.idSite == id);
    if (!site) return;
    
    document.getElementById('site-id').value = site.idSite;

    const inputPhoto = document.getElementById('site-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('site-photo-preview');
    if (site.photo) {
        preview.src = site.photo;
        preview.classList.remove('d-none');
    } else {
        preview.src = '';
        preview.classList.add('d-none');
    }
    
    document.getElementById('site-nom').value = site.nom;
    document.getElementById('site-adresse').value = site.adresse;
    document.getElementById('site-cp').value = site.code_postal;
    document.getElementById('site-localite').value = site.localite;
    document.getElementById('modalSiteTitre').textContent = "Modifier le site";
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite')).show();
}

// Gère dynamiquement la création ou la mise à jour d'un site
async function sauvegarderSite() {
    const form = document.getElementById('form-site');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('site-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('site-nom').value.trim());
    formData.append('adresse', document.getElementById('site-adresse').value.trim());
    formData.append('code_postal', document.getElementById('site-cp').value.trim());
    formData.append('localite', document.getElementById('site-localite').value.trim());

    const photoInput = document.getElementById('site-photo');
    if (photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    let url = id !== "" ? 'site/modify_site.php' : 'site/add_site.php';
    let messageSucces = id !== "" ? "Site modifié avec succès !" : "Site ajouté avec succès !";
    
    if (id !== "") formData.append('idSite', id);

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite')).hide();
        afficherNotification(messageSucces, "success");
        chargerSites(); 
    } else { 
        afficherNotification("Erreur : " + (resultat.message || "inconnue"), "danger"); 
    }
}

async function supprimerSite(id) {
    // Protection du site racine
    if (id == 1) { 
        afficherNotification("Opération interdite : Le Site n°1 sert de structure de secours.", "warning"); 
        return; 
    }
    
    const messageAvertissement = "Êtes-vous sûr de vouloir supprimer ce site définitivement ?<br><br><small class='text-muted'>⚠️ La suppression de ce site entraînera une réaffectation en cascade (locaux, rangements, niveaux) vers le site racine.</small>";
    
    if (await demanderConfirmation(messageAvertissement)) {
        const response = await fetch('backend/site/delete_site.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idSite: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Site supprimé avec succès.", "success");
            chargerSites();
        } else { 
            afficherNotification("Erreur : " + data.message, "danger"); 
        }
    }
}

/* ==========================================
   GESTION DES CATÉGORIES
   ========================================== */

async function chargerCategories() {
    const tbody = document.getElementById('liste-categories');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chargement...</td></tr>';

    const data = await fetchDonnees('categorie/get_categories.php');
    if (data && Array.isArray(data)) {
        categoriesData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Aucune catégorie trouvée.</td></tr>';
            return;
        }
        data.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${cat.idcategorie}</td>
                <td class="align-middle">${cat.nom}</td>
                <td class="align-middle text-muted small">${cat.infoPlus || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionCategorie(${cat.idcategorie})">Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerCategorie(${cat.idcategorie})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function ouvrirModalAjoutCategorie() {
    document.getElementById('form-categorie').reset();
    document.getElementById('cat-id').value = "";
    document.getElementById('modalCategorieTitre').textContent = "Ajouter une catégorie";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie')).show();
}

function ouvrirModalEditionCategorie(id) {
    const categorie = categoriesData.find(c => c.idcategorie == id);
    if (!categorie) return;
    
    document.getElementById('cat-id').value = categorie.idcategorie;
    document.getElementById('cat-nom').value = categorie.nom;
    document.getElementById('cat-info').value = categorie.infoPlus;
    document.getElementById('modalCategorieTitre').textContent = "Modifier la catégorie";
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie')).show();
}

async function sauvegarderCategorie() {
    const form = document.getElementById('form-categorie');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('cat-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('cat-nom').value.trim());
    formData.append('infoPlus', document.getElementById('cat-info').value.trim());

    let url = id !== "" ? 'categorie/modify_categorie.php' : 'categorie/add_categorie.php';
    let messageSucces = id !== "" ? "Catégorie modifiée avec succès !" : "Catégorie ajoutée avec succès !";
    
    if (id !== "") formData.append('idcategorie', id);

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie')).hide();
        afficherNotification(messageSucces, "success");
        chargerCategories(); 
    } else { 
        afficherNotification("Erreur : " + (resultat.message || "inconnue"), "danger"); 
    }
}

async function supprimerCategorie(id) {
    if (await demanderConfirmation("Confirmez-vous la suppression de cette catégorie ? Elle doit être vide de tout vêtement.")) {
        const response = await fetch('backend/categorie/delete_categorie.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idcategorie: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Catégorie supprimée.", "success");
            chargerCategories();
        } else {
            afficherNotification("Erreur : " + data.message, "danger");
        }
    }
}

/* ==========================================
   GESTION DES LOCAUX
   ========================================== */

async function chargerLocaux() {
    const tbody = document.getElementById('liste-locaux');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';

    const data = await fetchDonnees('local/get_locaux.php');
    if (data && Array.isArray(data)) {
        locauxData = data;
        tbody.innerHTML = '';
        if(data.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun local trouvé.</td></tr>';

        data.forEach(loc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${loc.idLocal}</td>
                <td class="align-middle"><img src="${loc.photo || 'assets/icons/ctos.png'}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="align-middle">${loc.nom}</td>
                <td class="align-middle text-muted small">${loc.infoLocal || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionLocal(${loc.idLocal})">Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerLocal(${loc.idLocal})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Prépare la modale pour l'ajout en s'assurant que la liste des sites est bien préchargée.
async function ouvrirModalAjoutLocal() {
    document.getElementById('form-local').reset();
    document.getElementById('local-id').value = ""; 
    document.getElementById('modalLocalTitre').textContent = "Ajouter un local";

    const selectSite = document.getElementById('local-idsite');
    const inputPhoto = document.getElementById('local-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('local-photo-preview');
    if (preview) {
        preview.src = '';
        preview.classList.add('d-none');
    }
    
    selectSite.innerHTML = '<option value="">Choisir un site...</option>';

    if (sitesData.length === 0) {
        const sData = await fetchDonnees('site/get_sites.php');
        if (sData) sitesData = sData;
    }

    sitesData.forEach(s => {
        selectSite.innerHTML += `<option value="${s.idSite}">${s.nom}</option>`;
    });
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLocal')).show();
}

async function ouvrirModalEditionLocal(id) {
    const local = locauxData.find(l => l.idLocal == id);
    if (!local) return;

    const selectSite = document.getElementById('local-idsite');
    selectSite.innerHTML = '<option value="">Choisir un site...</option>';

    if (sitesData.length === 0) {
        const sData = await fetchDonnees('site/get_sites.php');
        if (sData) sitesData = sData;
    }

    sitesData.forEach(s => {
        const isSelected = s.idSite == local.idSite ? 'selected' : '';
        selectSite.innerHTML += `<option value="${s.idSite}" ${isSelected}>${s.nom}</option>`;
    });

    const inputPhoto = document.getElementById('local-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('local-photo-preview');
    if (local.photo) {
        preview.src = local.photo;
        preview.classList.remove('d-none');
    } else {
        preview.src = '';
        preview.classList.add('d-none');
    }

    document.getElementById('local-id').value = local.idLocal;
    document.getElementById('local-nom').value = local.nom;
    document.getElementById('local-info').value = local.infoLocal;
    document.getElementById('modalLocalTitre').textContent = "Modifier le local";
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLocal')).show();
}

async function sauvegarderLocal() {
    const form = document.getElementById('form-local');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('local-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('local-nom').value.trim());
    formData.append('infoLocal', document.getElementById('local-info').value.trim());
    formData.append('idSite', document.getElementById('local-idsite').value); 

    const photoInput = document.getElementById('local-photo');
    if (photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    let url = id !== "" ? 'local/modify_local.php' : 'local/add_local.php';
    let messageSucces = id !== "" ? "Local modifié avec succès !" : "Local ajouté avec succès !";
    
    if (id !== "") formData.append('idLocal', id);

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLocal')).hide();
        afficherNotification(messageSucces, "success");
        chargerLocaux(); 
    } else { 
        afficherNotification("Erreur : " + (resultat.message || "inconnue"), "danger"); 
    }
}

async function supprimerLocal(id) {
    // Protection du local réserve
    if (id == 1) { 
        afficherNotification("Opération interdite : Le Local n°1 sert de structure de secours.", "warning"); 
        return; 
    }
    
    const messageAvertissement = "Êtes-vous sûr de vouloir supprimer ce local définitivement ?<br><br><small class='text-muted'>⚠️ La suppression engendrera le reclassement des rangements et niveaux vers le local racine.</small>";
    
    if (await demanderConfirmation(messageAvertissement)) {
        const response = await fetch('backend/local/delete_local.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idLocal: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Local supprimé avec succès.", "success");
            chargerLocaux();
        } else { 
            afficherNotification("Erreur : " + data.message, "danger"); 
        }
    }
}

/* ==========================================
   GESTION DES RANGEMENTS
   ========================================== */

// Charge la liste des rangements. Nécessite une jointure avec locauxData pour afficher le local parent.
async function chargerRangements() {
    const tbody = document.getElementById('liste-rangements');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
    if (locauxData.length === 0) {
        const lData = await fetchDonnees('local/get_locaux.php');
        if (lData) locauxData = lData;
    }

    const data = await fetchDonnees('rangement/get_rangements.php'); 
    if (data && Array.isArray(data)) {
        rangementsData = data;
        tbody.innerHTML = '';
        if(data.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun rangement trouvé.</td></tr>';

        data.forEach(rg => {
            const localTrouve = locauxData.find(l => l.idLocal == rg.idLocal);
            const nomLocal = localTrouve ? localTrouve.nom : "Inconnu";
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${rg.idRangement}</td>
                <td class="align-middle"><img src="${rg.photo || 'assets/icons/ctos.png'}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="align-middle">${rg.nom}</td>
                <td class="align-middle text-muted"> Local: ${nomLocal}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionRangement(${rg.idRangement})">Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerRangement(${rg.idRangement})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function ouvrirModalAjoutRangement() {
    document.getElementById('form-rangement').reset();
    document.getElementById('rangement-id').value = "";
    document.getElementById('modalRangementTitre').textContent = "Ajouter un rangement";
    
    const selectLocal = document.getElementById('rangement-idlocal');
    const inputPhoto = document.getElementById('rangement-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('rangement-photo-preview');
    if (preview) {
        preview.src = '';
        preview.classList.add('d-none');
    }

    selectLocal.innerHTML = '<option value="">Choisir un local...</option>';
    locauxData.forEach(loc => {
        selectLocal.innerHTML += `<option value="${loc.idLocal}">${loc.nom}</option>`;
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement')).show();
}

async function ouvrirModalEditionRangement(id) {
    const rangement = rangementsData.find(r => r.idRangement == id);
    if (!rangement) return;

    document.getElementById('rangement-id').value = rangement.idRangement;
    document.getElementById('rangement-nom').value = rangement.nom;
    document.getElementById('rangement-info').value = rangement.infoRangement;

    const inputPhoto = document.getElementById('rangement-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('rangement-photo-preview');
    if (rangement.photo) {
        preview.src = rangement.photo;
        preview.classList.remove('d-none');
    } else {
        preview.src = '';
        preview.classList.add('d-none');
    }
    
    const selectLocal = document.getElementById('rangement-idlocal');
    selectLocal.innerHTML = '<option value="">Choisir un local...</option>';

    if (locauxData.length === 0) {
        const data = await fetchDonnees('local/get_locaux.php');
        if (data) locauxData = data;
    }

    locauxData.forEach(loc => {
        const isSelected = loc.idLocal == rangement.idLocal ? 'selected' : '';
        selectLocal.innerHTML += `<option value="${loc.idLocal}" ${isSelected}>${loc.nom}</option>`;
    });

    document.getElementById('modalRangementTitre').textContent = "Modifier le rangement";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement')).show();
}

async function sauvegarderRangement() {
    const form = document.getElementById('form-rangement');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('rangement-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('rangement-nom').value.trim());
    formData.append('infoRangement', document.getElementById('rangement-info').value.trim());
    formData.append('idLocal', document.getElementById('rangement-idlocal').value);

    const photoInput = document.getElementById('rangement-photo');
    if (photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    let url = id !== "" ? 'rangement/modify_rangement.php' : 'rangement/add_rangement.php';
    let messageSucces = id !== "" ? "Rangement modifié avec succès !" : "Rangement ajouté avec succès !";
    
    if (id !== "") formData.append('idRangement', id);

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement')).hide();
        afficherNotification(messageSucces, "success");
        chargerRangements(); 
    } else { 
        afficherNotification("Erreur : " + (resultat.message || "inconnue"), "danger"); 
    }
}

async function supprimerRangement(id) {
    if (id == 1) { 
        afficherNotification("Opération interdite : Le Rangement n°1 sert de structure de secours.", "warning"); 
        return; 
    }
    
    const messageAvertissement = "Êtes-vous sûr de vouloir supprimer ce rangement définitivement ?<br><br><small class='text-muted'>⚠️ La suppression engendrera le reclassement des niveaux rattachés vers le rangement racine.</small>";
    
    if (await demanderConfirmation(messageAvertissement)) {
        const response = await fetch('backend/rangement/delete_rangement.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idRangement: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Rangement supprimé avec succès.", "success");
            chargerRangements();
        } else { 
            afficherNotification("Erreur : " + data.message, "danger"); 
        }
    }
}

/* ==========================================
   GESTION DES NIVEAUX
   ========================================== */

// Charge les niveaux
async function chargerNiveaux() {
    const tbody = document.getElementById('liste-niveaux');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chargement...</td></tr>';
    
    const data = await fetchDonnees('niveau/get_niveaux.php'); 
    
    if (rangementsData.length === 0) {
        const rData = await fetchDonnees('rangement/get_rangements.php');
        if(rData) rangementsData = rData;
    }

    if (locauxData.length === 0) {
        const lData = await fetchDonnees('local/get_locaux.php');
        if (lData) locauxData = lData;
    }

    if (data && Array.isArray(data)) {
        niveauxData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun niveau trouvé.</td></tr>';
            return;
        }

        data.forEach(niv => {
            const rangementTrouve = rangementsData.find(r => r.idRangement == niv.idRangement);
            const nomRangement = rangementTrouve ? rangementTrouve.nom : "Inconnu";
            const localTrouve = locauxData.find(l => l.idLocal == (rangementTrouve ? rangementTrouve.idLocal : -1));
            const nomLocal = localTrouve ? localTrouve.nom : "Inconnu";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${niv.idNiveau}</td>
                <td class="align-middle fw-bold"><img src="${niv.photo || 'assets/icons/ctos.png'}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="align-middle fw-bold text-primary">${niv.nom}</td>
                <td class="align-middle text-muted">${nomRangement} (Local : ${nomLocal})</td>
                <td class="align-middle text-muted small">${niv.infoNiveau || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionNiveau(${niv.idNiveau})">Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerNiveau(${niv.idNiveau})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function ouvrirModalAjoutNiveau() {
    document.getElementById('form-niveau').reset();
    document.getElementById('niveau-id').value = "";
    document.getElementById('modalNiveauTitre').textContent = "Ajouter un niveau (Étagère)";
    
    const selectRang = document.getElementById('niveau-idrangement');
    const inputPhoto = document.getElementById('niveau-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('niveau-photo-preview');
    if (preview) {
        preview.src = '';
        preview.classList.add('d-none');
    }

    selectRang.innerHTML = '<option value="">Chargement...</option>';
    
    if (rangementsData.length === 0) {
        const rData = await fetchDonnees('rangement/get_rangements.php');
        if(rData) rangementsData = rData;
    }

    if (locauxData.length === 0) {
        const lData = await fetchDonnees('local/get_locaux.php');
        if (lData) locauxData = lData;
    }

    selectRang.innerHTML = '<option value="">Choisir un rangement...</option>';
    rangementsData.forEach(rg => {
        const localTrouve = locauxData.find(l => l.idLocal == rg.idLocal);
        const nomLocal = localTrouve ? localTrouve.nom : "Inconnu";
        selectRang.innerHTML += `<option value="${rg.idRangement}">${rg.nom} (Local : ${nomLocal})</option>`;
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNiveau')).show();
}

async function ouvrirModalEditionNiveau(id) {
    const niveau = niveauxData.find(n => n.idNiveau == id);
    if (!niveau) return;
    
    document.getElementById('niveau-id').value = niveau.idNiveau;
    document.getElementById('niveau-nom').value = niveau.nom;
    document.getElementById('niveau-info').value = niveau.infoNiveau;

    const inputPhoto = document.getElementById('niveau-photo');
    if (inputPhoto) inputPhoto.value = "";

    const preview = document.getElementById('niveau-photo-preview');
    if (niveau.photo) {
        preview.src = niveau.photo;
        preview.classList.remove('d-none');
    } else {
        preview.src = '';
        preview.classList.add('d-none');
    }
    
    const selectRang = document.getElementById('niveau-idrangement');

    if (rangementsData.length === 0) {
        const rData = await fetchDonnees('rangement/get_rangements.php');
        if(rData) rangementsData = rData;
    }

    if (locauxData.length === 0) {
        const lData = await fetchDonnees('local/get_locaux.php');
        if (lData) locauxData = lData;
    }

    selectRang.innerHTML = '<option value="">Choisir un rangement...</option>';
    rangementsData.forEach(rg => {
        const localTrouve = locauxData.find(l => l.idLocal == rg.idLocal);
        const nomLocal = localTrouve ? localTrouve.nom : "Inconnu";
        const isSelected = rg.idRangement == niveau.idRangement ? 'selected' : '';
        selectRang.innerHTML += `<option value="${rg.idRangement}" ${isSelected}>${rg.nom} (Local : ${nomLocal})</option>`;
    });

    document.getElementById('modalNiveauTitre').textContent = "Modifier le niveau";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNiveau')).show();
}

async function sauvegarderNiveau() {
    const form = document.getElementById('form-niveau');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('niveau-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('niveau-nom').value.trim());
    formData.append('infoNiveau', document.getElementById('niveau-info').value.trim());
    formData.append('idRangement', document.getElementById('niveau-idrangement').value);

    const photoInput = document.getElementById('niveau-photo');
    if (photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    let url = id !== "" ? 'niveau/modify_niveau.php' : 'niveau/add_niveau.php';
    let messageSucces = id !== "" ? "Niveau modifié avec succès !" : "Niveau ajouté avec succès !";
    
    if (id !== "") formData.append('idNiveau', id);

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNiveau')).hide();
        afficherNotification(messageSucces, "success");
        chargerNiveaux(); 
    } else { 
        afficherNotification("Erreur : " + (resultat.message || "inconnue"), "danger"); 
    }
}

async function supprimerNiveau(id) {
    if (id == 1) { 
        afficherNotification("Opération interdite : Le Niveau n°1 sert de structure de secours.", "warning"); 
        return; 
    }
    
    const messageAvertissement = "Êtes-vous sûr de vouloir supprimer ce niveau définitivement ?<br><br><small class='text-muted'>⚠️ Les vêtements qui s'y trouvent seront reclassés vers le niveau de secours global.</small>";
    
    if (await demanderConfirmation(messageAvertissement)) {
        const response = await fetch('backend/niveau/delete_niveau.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNiveau: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Niveau supprimé avec succès.", "success");
            chargerNiveaux();
        } else { 
            afficherNotification("Erreur : " + data.message, "danger"); 
        }
    }
}

/* ==========================================
   GESTION DES UTILISATEURS (ADMIN)
   ========================================== */

// Récupère l'intégralité des comptes utilisateurs pour la gestion des rôles et les suppressions
async function chargerUtilisateurs() {
    const tbody = document.getElementById('liste-utilisateurs');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';

    try {
        const response = await fetch('backend/utilisateur/get_utilisateurs_admin.php');
        const data = await response.json();

        if (data && Array.isArray(data)) {
            tbody.innerHTML = '';
            if(data.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun utilisateur.</td></tr>';

            const userConnecte = JSON.parse(sessionStorage.getItem('user'));

            data.forEach(u => {
                // Un admin ne peut pas altérer ses propres droits
                const isMe = u.idutilisateur == userConnecte.idutilisateur;
                
                const roleSelect = `
                    <select class="form-select form-select-sm border-0 bg-light" onchange="changerRole(${u.idutilisateur}, this.value)" ${isMe ? 'disabled' : ''}>
                        <option value="user" ${u.role === 'user' ? 'selected' : ''}>User (Consulter & Emprunter)</option>
                        <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>Owner (Ajouter des objets)</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected text-danger fw-bold' : ''}>Admin (Contrôle Total)</option>
                    </select>
                `;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="align-middle fw-bold">${u.idutilisateur}</td>
                    <td class="align-middle">${u.prenom} ${u.nom} ${isMe ? ' <span class="badge bg-primary">Moi</span>' : ''}</td>
                    <td class="align-middle text-muted">${u.login}</td>
                    <td class="align-middle" style="width: 250px;">${roleSelect}</td>
                    <td class="text-end align-middle">
                        <button class="btn btn-sm btn-outline-danger" onclick="supprimerUtilisateur(${u.idutilisateur})" ${isMe ? 'disabled' : ''}> Banni</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erreur de chargement des utilisateurs</td></tr>';
    }
}

// Modifie le niveau de privilège d'un utilisateur cible
async function changerRole(id, nouveauRole) {
    const response = await fetch('backend/utilisateur/modify_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idutilisateur: id, role: nouveauRole })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
        afficherNotification("Le rôle de l'utilisateur a été mis à jour.", "success");
    } else {
        afficherNotification("Erreur lors de la mise à jour : " + data.message, "danger");
        chargerUtilisateurs(); 
    }
}

async function supprimerUtilisateur(id) {
    const messageAvertissement = "Es-tu sûr de vouloir supprimer définitivement cet utilisateur ?<br><br><small class='text-muted'>⚠️ Cette action est irréversible et détruira l'ensemble de ses accès.</small>";

    if (await demanderConfirmation(messageAvertissement)) {
        const response = await fetch('backend/utilisateur/delete_utilisateur_admin.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idutilisateur: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            afficherNotification("Utilisateur banni et supprimé avec succès.", "success");
            chargerUtilisateurs();
        } else {
            afficherNotification("Erreur de suppression : " + data.message, "danger");
        }
    }
}