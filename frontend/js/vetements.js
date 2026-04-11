let tousLesVetements = [];

async function chargerVetements() {
    const data = await fetchDonnees('get/getall_vetements.php');
    if (data && Array.isArray(data)) {
        tousLesVetements = data;
        afficherCartesVetements(tousLesVetements);
    } else {
        document.getElementById('liste-vetements').innerHTML = '<div class="alert alert-danger">Impossible de charger le dressing.</div>';
    }
}

async function ajouterVetement(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // 1. Préparation des données (FormData est nécessaire à cause de l'image)
    const formData = new FormData();
    
    // Le PHP attend $_POST['vetement_new']['nom'] etc...
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
    formData.append('vetement_new[idproprietaire]', document.getElementById('idproprietaire').value);
    formData.append('vetement_new[idemprunteur]', document.getElementById('idemprunteur').value);
    formData.append('vetement_new[datefinprevue]', document.getElementById('datefinprevue').value);

    // Ajout du fichier photo (le PHP attend $_FILES['photo'])
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    // 2. Envoi au serveur
    const resultat = await postDonnees('add/add_vetement.php', formData);

    if (resultat && resultat.status === 'success') {
        alert("Vêtement ajouté avec succès !");
        document.getElementById('form-vetement').reset();
        basculerAffichageFormulaire(false);
        chargerVetements(); // On recharge la liste pour voir le nouveau vêtement
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