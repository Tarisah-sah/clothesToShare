// frontend/js/vetements.js

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
    
    // Le PHP attend $_POST['vetement_new']['nom'] etc... donc on nomme nos champs ainsi :
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