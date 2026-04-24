// Variables globales pour stocker les données afin de populer les selects rapidement
let categoriesData = [];
let locauxData = [];
let rangementsData = [];
let niveauxData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. VÉRIFICATION DE SÉCURITÉ FRONTEND
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

    // 2. INITIALISATION
    chargerCategories();
    chargerSites();
    chargerLocaux();
    chargerRangements();
    chargerNiveaux();

    // ==========================================
    // GESTION DES ONGLETS BOOTSTRAP
    // ==========================================

    document.getElementById('sites-tab').addEventListener('shown.bs.tab', chargerSites);
    document.getElementById('locaux-tab').addEventListener('shown.bs.tab', chargerLocaux);
    document.getElementById('rangements-tab').addEventListener('shown.bs.tab', chargerRangements);
    document.getElementById('niveaux-tab').addEventListener('shown.bs.tab', chargerNiveaux);
    document.getElementById('categories-tab').addEventListener('shown.bs.tab', chargerCategories);
    
    // 3. ÉCOUTEURS D'ÉVÉNEMENTS

    // Écouteurs pour les Sites
    document.getElementById('btn-ajouter-site').addEventListener('click', ouvrirModalAjoutSite);
    document.getElementById('btn-sauvegarder-site').addEventListener('click', sauvegarderSite);

    // Écouteurs pour les Locaux
    document.getElementById('btn-ajouter-local').addEventListener('click', ouvrirModalAjoutLocal);
    document.getElementById('btn-sauvegarder-local').addEventListener('click', sauvegarderLocal);
    
    // Écouteurs pour les Rangements
    document.getElementById('btn-ajouter-rangement').addEventListener('click', ouvrirModalAjoutRangement);
    document.getElementById('btn-sauvegarder-rangement').addEventListener('click', sauvegarderRangement);
    
    // Nouveaux écouteurs pour les Niveaux
    document.getElementById('btn-ajouter-niveau').addEventListener('click', ouvrirModalAjoutNiveau);
    document.getElementById('btn-sauvegarder-niveau').addEventListener('click', sauvegarderNiveau);

    // Écouteurs pour les Catégories
    document.getElementById('btn-ajouter-categorie').addEventListener('click', ouvrirModalAjoutCategorie);
    document.getElementById('btn-sauvegarder-cat').addEventListener('click', sauvegarderCategorie);

    document.getElementById('btn-deconnexion-admin').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    document.getElementById('utilisateurs-tab').addEventListener('shown.bs.tab', chargerUtilisateurs);

});

// ==========================================
// CRUD : SITES
// ==========================================
async function chargerSites() {
    const tbody = document.getElementById('liste-sites');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';

    const data = await fetchDonnees('site/get_sites.php');
    if (data && Array.isArray(data)) {
        sitesData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun site trouvée.</td></tr>';
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
                    <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionSite(${site.idSite})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerSite(${site.idSite})">🗑️ Sup.</button>
                </td>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function ouvrirModalAjoutSite() {
    document.getElementById('form-site').reset();
    document.getElementById('site-id').value = "";
    document.getElementById('modalSiteTitre').textContent = "Ajouter une site";
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite'));
    modal.show();
}

function ouvrirModalEditionSite(id) {
    const site = sitesData.find(s => s.idSite == id);
    if (!site) return;
    document.getElementById('site-id').value = site.idSite;
    document.getElementById('site-photo').value = site.photo;
    document.getElementById('site-nom').value = site.nom;
    document.getElementById('site-adresse').value = site.adresse;
    document.getElementById('site-cp').value = site.code_postal;
    document.getElementById('site-localite').value = site.localite;
    document.getElementById('modalSiteTitre').textContent = "Modifier le site";
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite'));
    modal.show();
}

async function sauvegarderSite() {
    const form = document.getElementById('form-site');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('site-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('site-nom').value.trim());
    formData.append('adresse', document.getElementById('site-adresse').value.trim());
    formData.append('code_postal', document.getElementById('site-cp').value.trim());
    formData.append('localite', document.getElementById('site-localite').value.trim());


    let url = 'site/add_site.php';
    if (id !== "") {
        url = 'site/modify_site.php';
        formData.append('idSite', id);
    }

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSite')).hide();
        chargerSites(); 
    } else { alert("Erreur : " + (resultat.message || "inconnue")); }
}

async function supprimerSite(id) {
    if (id == 1) { alert("Tu ne peux pas supprimer le Site n°1 car il sert de 'Reserve Secours' !"); return; }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce site définitivement ?\n\n⚠️ En supprimant celui-ci, les locaux, rangements et niveaux qui y sont seront également supprimés.\n👕 Les habits, eux, seront redirigés vers le site 'Garde tout' (ID 1).")) {
        const response = await fetch('backend/site/delete_site.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idSite: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerSites();
        else alert("Erreur : " + data.message);
    }
}

// ==========================================
// CRUD : CATÉGORIES
// ==========================================
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
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionCategorie(${cat.idcategorie})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerCategorie(${cat.idcategorie})">🗑️ Sup.</button>
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
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie'));
    modal.show();
}

function ouvrirModalEditionCategorie(id) {
    const categorie = categoriesData.find(c => c.idcategorie == id);
    if (!categorie) return;
    document.getElementById('cat-id').value = categorie.idcategorie;
    document.getElementById('cat-nom').value = categorie.nom;
    document.getElementById('cat-info').value = categorie.infoPlus;
    document.getElementById('modalCategorieTitre').textContent = "Modifier la catégorie";
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie'));
    modal.show();
}

async function sauvegarderCategorie() {
    const form = document.getElementById('form-categorie');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('cat-id').value;
    const formData = new FormData();
    formData.append('nom', document.getElementById('cat-nom').value.trim());
    formData.append('infoPlus', document.getElementById('cat-info').value.trim());

    let url = 'categorie/add_categorie.php';
    if (id !== "") {
        url = 'categorie/modify_categorie.php';
        formData.append('idcategorie', id);
    }

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie')).hide();
        chargerCategories(); 
    } else { alert("Erreur : " + (resultat.message || "inconnue")); }
}

async function supprimerCategorie(id) {
    if (confirm("Es-tu sûr de vouloir supprimer cette catégorie ?")) {
        const response = await fetch('backend/categorie/delete_categorie.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idcategorie: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerCategories();
        else alert("Erreur : " + data.message);
    }
}

// ==========================================
// CRUD : LOCAUX 
// ==========================================
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
                    <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionLocal(${loc.idLocal})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerLocal(${loc.idLocal})">🗑️ Sup.</button>
                </td>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function ouvrirModalAjoutLocal() {
    document.getElementById('form-local').reset();
    document.getElementById('local-id').value = ""; // Vide l'ID = mode Ajout
    document.getElementById('modalLocalTitre').textContent = "Ajouter un local";

    const selectSite = document.getElementById('local-idsite');
    
    // On vide la liste complètement avant de la remplir !
    selectSite.innerHTML = '<option value="">Choisir un site...</option>';

    // Sécurité : au cas où les sites n'ont pas encore été téléchargés
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
    
    // On vide la liste ici aussi !
    selectSite.innerHTML = '<option value="">Choisir un site...</option>';

    if (sitesData.length === 0) {
        const sData = await fetchDonnees('site/get_sites.php');
        if (sData) sitesData = sData;
    }

    sitesData.forEach(s => {
        // Sélectionner le site actuel
        const isSelected = s.idSite == local.idSite ? 'selected' : '';
        selectSite.innerHTML += `<option value="${s.idSite}" ${isSelected}>${s.nom}</option>`;
    });

    // Pré-remplir le formulaire avec les données du local
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
    formData.append('idSite', document.getElementById('local-idsite').value); // Normalement "1"

    // Si on a un ID, c'est une modification, sinon c'est un ajout
    let url = 'local/add_local.php';
    if (id !== "") {
        url = 'local/modify_local.php';
        formData.append('idLocal', id);
    }

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLocal')).hide();
        chargerLocaux(); // On met à jour le tableau
    } else { 
        alert("Erreur : " + (resultat.message || "inconnue")); 
    }
}

async function supprimerLocal(id) {
    if (id == 1) { alert("Tu ne peux pas supprimer le Local n°1 car il sert de 'Reserve Secours' !"); return; }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce local définitivement ?\n\n⚠️ En supprimant celui-ci, les rangements et niveaux qui y sont seront également supprimés.\n👕 Les habits, eux, seront redirigés vers le 'Garde tout' (ID 1).")) {
        const response = await fetch('backend/local/delete_local.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idLocal: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerLocaux();
        else alert("Erreur : " + data.message);
    }
}

// ==========================================
// CRUD : RANGEMENTS
// ==========================================
async function chargerRangements() {
    const tbody = document.getElementById('liste-rangements');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
    if (locauxData.length === 0) {
        const lData = await fetchDonnees('local/get_locaux.php');
        if (lData) locauxData = lData;
    }

    const data = await fetchDonnees('rangement/get_rangements.php'); 
    if (data && Array.isArray(data)) {
        rangementsData = data; // On stocke pour plus tard
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
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionRangement(${rg.idRangement})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerRangement(${rg.idRangement})">🗑️ Sup.</button>
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
    selectLocal.innerHTML = '<option value="">Choisir un local...</option>';
    locauxData.forEach(loc => {
        selectLocal.innerHTML += `<option value="${loc.idLocal}">${loc.nom}</option>`;
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement')).show();
}

async function ouvrirModalEditionRangement(id) {
    const rangement = rangementsData.find(r => r.idRangement == id);
    if (!rangement) return;

    // Pré-remplir le formulaire
    document.getElementById('rangement-id').value = rangement.idRangement;
    document.getElementById('rangement-nom').value = rangement.nom;
    document.getElementById('rangement-info').value = rangement.infoRangement;
    
    // Remplir dynamiquement la liste déroulante des locaux
    const selectLocal = document.getElementById('rangement-idlocal');
    selectLocal.innerHTML = '<option value="">Choisir un local...</option>';

    // S'assurer que les locaux sont chargés
    if (locauxData.length === 0) {
        const data = await fetchDonnees('local/get_locaux.php');
        if (data) locauxData = data;
    }

    locauxData.forEach(loc => {
        // Sélectionner le local actuel
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

    let url = 'rangement/add_rangement.php';
    if (id !== "") {
        url = 'rangement/modify_rangement.php';
        formData.append('idRangement', id);
    }

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement')).hide();
        chargerRangements(); 
    } else { 
        alert("Erreur : " + (resultat.message || "inconnue")); 
    }
}

async function supprimerRangement(id) {
    if (id == 1) { alert("Tu ne peux pas supprimer le Rangement n°1 car il sert de 'Reserve Secours' !"); return; }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce rangement définitivement ?\n\n⚠️ En supprimant celui-ci, les niveaux (étagères) qui y sont seront également supprimés.\n👕 Les habits, eux, seront redirigés vers le 'Garde tout' (ID 1).")) {
        const response = await fetch('backend/rangement/delete_rangement.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idRangement: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerRangements();
        else alert("Erreur : " + data.message);
    }
}


// ==========================================
// CRUD : NIVEAUX
// ==========================================
async function chargerNiveaux() {
    const tbody = document.getElementById('liste-niveaux');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
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
            const localTrouve = locauxData.find(l => l.idLocal == rangementTrouve.idLocal);
            const nomLocal = localTrouve ? localTrouve.nom : "Inconnu";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${niv.idNiveau}</td>
                <td class="align-middle fw-bold text-primary">${niv.nom}</td>
                <td class="align-middle text-muted">${nomRangement} (Local : ${nomLocal})</td>
                <td class="align-middle text-muted small">${niv.infoNiveau || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEditionNiveau(${niv.idNiveau})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerNiveau(${niv.idNiveau})">🗑️ Sup.</button>
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
    selectRang.innerHTML = '<option value="">Chargement...</option>';
    
    // Si l'admin n'a pas encore cliqué sur l'onglet "Rangements", la variable globale est vide. On la télécharge !
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
        // On cherche le local correspondant directement dans la mémoire Javascript (C'est instantané)
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
    
    // Charger le select des rangements
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
        selectRang.innerHTML += `<option value="${rg.idRangement}" ${rg.idRangement == niveau.idRangement ? 'selected' : ''}>${rg.nom} (Local : ${nomLocal})</option>`;
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

    let url = 'niveau/add_niveau.php';
    if (id !== "") {
        url = 'niveau/modify_niveau.php';
        formData.append('idNiveau', id);
    }

    const resultat = await postDonnees(url, formData);
    if (resultat && resultat.status === 'success') {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNiveau')).hide();
        chargerNiveaux(); 
    } else { alert("Erreur : " + (resultat.message || "inconnue")); }
}

async function supprimerNiveau(id) {
    if (id == 1) { alert("Tu ne peux pas supprimer le Niveau n°1 car il sert de 'Reserve Secours' !"); return; }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce niveau (étagère) définitivement ?\n\n👕 Les habits qui s'y trouvent seront redirigés vers le 'Garde tout' (ID 1).")) {
        const response = await fetch('backend/niveau/delete_niveau.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNiveau: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerNiveaux();
        else alert("Erreur : " + data.message);
    }
}

// ==========================================
// CRUD : UTILISATEURS (ADMIN)
// ==========================================
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
                // Empêcher l'admin de se bloquer/supprimer lui-même
                const isMe = u.idutilisateur == userConnecte.idutilisateur;
                
                // Le selecteur de rôle
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
                        <button class="btn btn-sm btn-outline-danger" onclick="supprimerUtilisateur(${u.idutilisateur})" ${isMe ? 'disabled' : ''}>🗑️ Banni</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erreur de chargement</td></tr>';
    }
}

async function changerRole(id, nouveauRole) {
    const response = await fetch('backend/utilisateur/modify_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idutilisateur: id, role: nouveauRole })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
        // Optionnel : tu pourrais afficher une petite notif "toast" ici
    } else {
        alert("Erreur : " + data.message);
        chargerUtilisateurs(); // On recharge pour remettre l'ancien rôle dans le select si ça a raté
    }
}

async function supprimerUtilisateur(id) {
    if (confirm("Es-tu sûr de vouloir supprimer cet utilisateur ? Son compte sera détruit.")) {
        const response = await fetch('backend/utilisateur/delete_utilisateur_admin.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idutilisateur: id })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            chargerUtilisateurs();
        } else {
            alert("Erreur : " + data.message);
        }
    }
}