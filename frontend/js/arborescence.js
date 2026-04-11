let historiqueArborescence = []; // Pour mémoriser où on est et pouvoir faire "Retour"

// Fonction pour tout masquer et afficher uniquement l'arborescence
document.getElementById('nav-arborescence').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('section-dressing').style.display = 'none';
    document.getElementById('section-recherche').style.display = 'none';
    document.getElementById('section-formulaire').style.display = 'none';
    
    document.getElementById('section-arborescence').style.display = 'block';
    
    // On charge la première étape : Les Locaux
    chargerBulles('locaux', null);
});

// Bouton Retour
document.getElementById('btn-retour-arborescence').addEventListener('click', () => {
    historiqueArborescence.pop(); // Enlève l'état actuel
    const etatPrecedent = historiqueArborescence.pop(); // Récupère l'état précédent
    
    if (etatPrecedent) {
        chargerBulles(etatPrecedent.type, etatPrecedent.id);
    } else {
        chargerBulles('locaux', null); // Retour à la case départ
    }
});

// Fonction générique pour charger les bulles selon le niveau
async function chargerBulles(type, parentId) {
    const conteneur = document.getElementById('conteneur-bulles');
    const titre = document.getElementById('titre-arborescence');
    const btnRetour = document.getElementById('btn-retour-arborescence');
    
    conteneur.innerHTML = '<p class="text-muted">Chargement...</p>';
    historiqueArborescence.push({ type, id: parentId }); // Sauvegarde pour le bouton retour
    
    if (historiqueArborescence.length > 1) {
        btnRetour.classList.remove('d-none');
    } else {
        btnRetour.classList.add('d-none');
    }

    let url = '';
    
    // Selon le type, on appelle le bon fichier PHP
    if (type === 'locaux') {
        titre.innerHTML = "📍 Choisis un Local";
        url = 'get/get_locaux.php'; 
    } else if (type === 'rangements') {
        titre.innerHTML = "🗄️ Choisis un Rangement";
        url = `get/get_rangements.php?idLocal=${parentId}`;
    } else if (type === 'niveaux') {
        titre.innerHTML = "📏 Choisis un Niveau";
        url = `get/get_niveaux.php?idRangement=${parentId}`;
    } else if (type === 'vetements') {
        // Ici on n'affiche plus des bulles, mais les cartes de vêtements normales
        titre.innerHTML = "👗 Vêtements trouvés";
        const urlVetements = `get/getall_vetements.php?idNiveau=${parentId}`; // À adapter dans le PHP
        const dataVetements = await fetchDonnees(urlVetements);
        conteneur.innerHTML = ''; // On vide les bulles
        
        // On réutilise la fonction de ui.js en contournant le conteneur habituel !
        const divTemp = document.createElement('div');
        divTemp.className = 'row g-4 w-100';
        divTemp.id = 'temp-liste-vetements';
        conteneur.appendChild(divTemp);
        
        // Petite astuce : on temporise l'ID pour utiliser ta fonction existante
        const backupId = document.getElementById('liste-vetements');
        divTemp.id = 'liste-vetements'; 
        afficherCartesVetements(dataVetements);
        divTemp.id = 'temp-liste-vetements'; // on remet
        return; 
    }

    // Récupération des données pour les bulles (Locaux, Rangements, Niveaux)
    const data = await fetchDonnees(url);
    conteneur.innerHTML = '';

    if (data && data.length > 0) {
        data.forEach(item => {
            // L'image par défaut si aucune photo en base
            const photoUrl = item.photo || 'https://placehold.co/200x200/e91e8c/ffffff?text=' + item.nom;
            
            // Déterminer la prochaine étape au clic
            let prochainType = '';
            let itemId = '';
            if (type === 'locaux') { prochainType = 'rangements'; itemId = item.idLocal; }
            if (type === 'rangements') { prochainType = 'niveaux'; itemId = item.idRangement; }
            if (type === 'niveaux') { prochainType = 'vetements'; itemId = item.idNiveau; }

            const bulle = document.createElement('div');
            bulle.className = 'bulle shadow-sm';
            bulle.style.backgroundImage = `url('${photoUrl}')`;
            bulle.innerHTML = `<div class="bulle-texte">${item.nom}</div>`;
            
            bulle.addEventListener('click', () => chargerBulles(prochainType, itemId));
            
            conteneur.appendChild(bulle);
        });
    } else {
        conteneur.innerHTML = '<p class="text-muted">Aucun élément trouvé ici.</p>';
    }
}