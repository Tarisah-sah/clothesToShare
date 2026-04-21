// Variable globale pour stocker les catégories chargées
let categoriesData = [];

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
    
    document.getElementById('btn-deconnexion-admin').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    });
    document.getElementById('btn-ajouter-rangement').addEventListener('click', ouvrirModalAjoutRangement);
});

// ==========================================
// LECTURE (READ)
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
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erreur de chargement.</td></tr>';
    }
}

// ==========================================
// AJOUT ET MODIFICATION (CREATE / UPDATE)
// ==========================================
function ouvrirModalAjout() {
    document.getElementById('form-categorie').reset();
    document.getElementById('cat-id').value = ""; // Vide l'ID = mode Ajout
    document.getElementById('modalCategorieTitre').textContent = "Ajouter une catégorie";
    
    // CORRECTION ICI : getOrCreateInstance
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie'));
    modal.show();
}

function ouvrirModalEdition(id) {
    const categorie = categoriesData.find(c => c.idcategorie == id);
    if (!categorie) return;

    // Pré-remplir le formulaire
    document.getElementById('cat-id').value = categorie.idcategorie;
    document.getElementById('cat-nom').value = categorie.nom;
    document.getElementById('cat-info').value = categorie.infoPlus;
    
    document.getElementById('modalCategorieTitre').textContent = "Modifier la catégorie";
    
    // CORRECTION ICI : getOrCreateInstance
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategorie'));
    modal.show();
}

async function sauvegarderCategorie() {
    const form = document.getElementById('form-categorie');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('cat-id').value;
    const nom = document.getElementById('cat-nom').value.trim();
    const infoPlus = document.getElementById('cat-info').value.trim();

    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('infoPlus', infoPlus);

    // Si on a un ID, c'est une modification, sinon c'est un ajout
    let url = 'categorie/add_categorie.php';
    if (id !== "") {
        url = 'categorie/modify_categorie.php';
        formData.append('idcategorie', id);
    }

    const resultat = await postDonnees(url, formData);

    if (resultat && resultat.status === 'success') {
        // CORRECTION ICI : getOrCreateInstance au lieu de getInstance
        const modalElement = document.getElementById('modalCategorie');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
        
        chargerCategories(); // Recharger le tableau
    } else {
        alert("Erreur : " + (resultat.message || "inconnue"));
    }
}

// ==========================================
// SUPPRESSION (DELETE)
// ==========================================
async function supprimerCategorie(id) {
    if (confirm("Attention : Es-tu sûr de vouloir supprimer cette catégorie ?")) {
        try {
            const response = await fetch('backend/categorie/delete_categorie.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idcategorie: id })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                chargerCategories();
            } else {
                alert("Erreur : " + data.message);
            }
        } catch (error) {
            console.error("Erreur DELETE :", error);
        }
    }
}

// ==========================================
// GESTION DES ONGLETS BOOTSTRAP
// ==========================================
document.getElementById('locaux-tab').addEventListener('shown.bs.tab', chargerLocaux);
document.getElementById('rangements-tab').addEventListener('shown.bs.tab', chargerRangements);

// ==========================================
// CRUD : LOCAUX
// ==========================================
let locauxData = [];

async function chargerLocaux() {
    const tbody = document.getElementById('liste-locaux');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
    
    // Tu possèdes déjà ce fichier dans backend/local/get_locaux.php !
    const data = await fetchDonnees('local/get_locaux.php'); 
    
    if (data && Array.isArray(data)) {
        locauxData = data;
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun local trouvé.</td></tr>';
            return;
        }

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
    
    // Tu possèdes déjà ce fichier dans backend/rangement/get_rangements.php !
    const data = await fetchDonnees('rangement/get_rangements.php'); 
    
    if (data && Array.isArray(data)) {
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun rangement trouvé.</td></tr>';
            return;
        }

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

// Fonction pour ouvrir la modale de Rangement
function ouvrirModalAjoutRangement() {
    document.getElementById('form-rangement').reset();
    document.getElementById('rangement-id').value = "";
    document.getElementById('modalRangementTitre').textContent = "Ajouter un rangement";
    
    // Remplir dynamiquement la liste déroulante des locaux
    const selectLocal = document.getElementById('rangement-idlocal');
    selectLocal.innerHTML = '<option value="">Choisir un local...</option>';
    
    // On utilise la liste "locauxData" qu'on a déjà chargée dans l'onglet Locaux !
    locauxData.forEach(loc => {
        selectLocal.innerHTML += `<option value="${loc.idLocal}">${loc.nom}</option>`;
    });

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRangement'));
    modal.show();
}

// N'oublie pas de lier le bouton à cette fonction en haut de ton fichier admin.js :
// document.getElementById('btn-ajouter-rangement').addEventListener('click', ouvrirModalAjoutRangement);