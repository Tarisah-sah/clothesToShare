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

    // 3. ÉCOUTEURS D'ÉVÉNEMENTS
    document.getElementById('btn-ajouter-categorie').addEventListener('click', ouvrirModalAjout);
    document.getElementById('btn-sauvegarder-cat').addEventListener('click', sauvegarderCategorie);
    
    document.getElementById('btn-ajouter-rangement').addEventListener('click', ouvrirModalAjoutRangement);
    
    // Nouveaux écouteurs pour les Niveaux
    document.getElementById('btn-ajouter-niveau').addEventListener('click', ouvrirModalAjoutNiveau);
    document.getElementById('btn-sauvegarder-niveau').addEventListener('click', sauvegarderNiveau);

    document.getElementById('btn-deconnexion-admin').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});

// ==========================================
// GESTION DES ONGLETS BOOTSTRAP
// ==========================================
document.getElementById('locaux-tab').addEventListener('shown.bs.tab', chargerLocaux);
document.getElementById('rangements-tab').addEventListener('shown.bs.tab', chargerRangements);
document.getElementById('niveaux-tab').addEventListener('shown.bs.tab', chargerNiveaux);

// ==========================================
// CRUD : CATÉGORIES (Ton code d'origine)
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
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="ouvrirModalEdition(${cat.idcategorie})">✏️ Éditer</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerCategorie(${cat.idcategorie})">🗑️ Sup.</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function ouvrirModalAjout() {
    document.getElementById('form-categorie').reset();
    document.getElementById('cat-id').value = "";
    document.getElementById('modalCategorieTitre').textContent = "Ajouter une catégorie";
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie'));
    modal.show();
}

function ouvrirModalEdition(id) {
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
                    <button class="btn btn-sm btn-outline-primary me-2">✏️</button>
                    <button class="btn btn-sm btn-outline-danger">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// ==========================================
// CRUD : RANGEMENTS
// ==========================================
async function chargerRangements() {
    const tbody = document.getElementById('liste-rangements');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
    const data = await fetchDonnees('rangement/get_rangements.php'); 
    if (data && Array.isArray(data)) {
        rangementsData = data; // On stocke pour plus tard
        tbody.innerHTML = '';
        if(data.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun rangement trouvé.</td></tr>';

        data.forEach(rg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${rg.idRangement}</td>
                <td class="align-middle"><img src="${rg.photo || 'assets/icons/ctos.png'}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="align-middle">${rg.nom}</td>
                <td class="align-middle text-muted">ID Local: ${rg.idLocal}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-primary me-2">✏️</button>
                    <button class="btn btn-sm btn-outline-danger">🗑️</button>
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


// ==========================================
// CRUD : NIVEAUX (NOUVEAU !)
// ==========================================
async function chargerNiveaux() {
    const tbody = document.getElementById('liste-niveaux');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
    const data = await fetchDonnees('niveau/get_niveaux.php'); 
    
    if (data && Array.isArray(data)) {
        niveauxData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun niveau trouvé.</td></tr>';
            return;
        }

        data.forEach(niv => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle fw-bold">${niv.idNiveau}</td>
                <td class="align-middle fw-bold text-primary">${niv.nom}</td>
                <td class="align-middle text-muted">ID Rangement: ${niv.idRangement}</td>
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
    if (confirm("Es-tu sûr de vouloir supprimer ce niveau ?")) {
        const response = await fetch('backend/niveau/delete_niveau.php', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNiveau: id })
        });
        const data = await response.json();
        if (data.status === 'success') chargerNiveaux();
        else alert("Erreur : " + data.message);
    }
}