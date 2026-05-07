let historiqueArborescence = []; 

function initialiserArborescence() {
    const navArborescence = document.getElementById('nav-arborescence');
    if (navArborescence) {
        navArborescence.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.pushState({}, '', 'dressing.html?tab=explorer');
            modeActuel = 'explorer';
            
            document.getElementById('nav-accueil')?.classList.remove('active');
            document.getElementById('nav-dressing')?.classList.remove('active');
            navArborescence.classList.add('active');
            
            document.getElementById('section-dressing').style.display = 'none';
            document.getElementById('section-recherche').style.display = 'none';
            document.getElementById('section-formulaire').style.display = 'none';
            
            document.getElementById('section-arborescence').style.display = 'block';
            
            chargerBulles('sites', null);
        });
    }

    const btnRetour = document.getElementById('btn-retour-arborescence');
    if (btnRetour) {
        btnRetour.addEventListener('click', () => {
            historiqueArborescence.pop(); 
            const etatPrecedent = historiqueArborescence.pop(); 
            
            if (etatPrecedent) {
                chargerBulles(etatPrecedent.type, etatPrecedent.id);
            } else {
                chargerBulles('sites', null); 
            }
        });
    }
}

async function chargerBulles(type, parentId) {
    const conteneur = document.getElementById('conteneur-bulles');
    const titre = document.getElementById('titre-arborescence');
    const btnRetour = document.getElementById('btn-retour-arborescence');
    
    conteneur.innerHTML = '<p class="text-muted">Chargement...</p>';
    historiqueArborescence.push({ type, id: parentId }); 
    
    if (historiqueArborescence.length > 1) {
        btnRetour.classList.remove('d-none');
    } else {
        btnRetour.classList.add('d-none');
    }

    let url = '';
   
    if (type === 'sites') {
        titre.innerHTML = "Choisis un Site";
        url = 'site/get_sites.php';
    } else if (type === 'locaux') {
        titre.innerHTML = "Choisis un Local";
        url = `local/get_locaux.php?idSite=${parentId}`; 
    } else if (type === 'rangements') {
        titre.innerHTML = "Choisis un Rangement";
        url = `rangement/get_rangements.php?idLocal=${parentId}`;
    } else if (type === 'niveaux') {
        titre.innerHTML = "Choisis un Niveau";
        url = `niveau/get_niveaux.php?idRangement=${parentId}`;
    } else if (type === 'vetements') {
        titre.innerHTML = "Vêtements trouvés";
        
        const userJson = sessionStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        
        let urlVetements = `vetement/getall_vetements.php?idNiveau=${parentId}&mode=explorer`;
        if (user) {
            urlVetements += `&userId=${user.idutilisateur}`;
        }
        
        const dataVetements = await fetchDonnees(urlVetements);
        tousLesVetements = dataVetements; 
        
        conteneur.innerHTML = ''; 
        
        const divTemp = document.createElement('div');
        divTemp.className = 'row g-4 w-100';
        conteneur.appendChild(divTemp);
        
        const vraiConteneur = document.getElementById('liste-vetements');
        if (vraiConteneur) vraiConteneur.id = 'liste-vetements-cache';
        
        divTemp.id = 'liste-vetements'; 
        afficherCartesVetements(dataVetements);
        
        divTemp.id = 'temp-liste-vetements'; 
        if (vraiConteneur) vraiConteneur.id = 'liste-vetements'; 
        
        return; 
    }

    // On récupère les données principales (les bulles à afficher)
    const data = await fetchDonnees(url);
    
    // Sur l'écran des sites, on télécharge les locaux en avance
    let locauxData = [];
    if (type === 'sites') {
        locauxData = await fetchDonnees('local/get_locaux.php');
    }

    conteneur.innerHTML = '';

    if (data && data.length > 0) {
        data.forEach(item => {
            const photoUrl = item.photo || 'https://placehold.co/200x200/e91e8c/ffffff?text=' + encodeURIComponent(item.nom);
            
            let prochainType = '';
            let itemId = '';
            
            if (type === 'sites') { prochainType = 'locaux'; itemId = item.idSite; }
            if (type === 'locaux') { prochainType = 'rangements'; itemId = item.idLocal; }
            if (type === 'rangements') { prochainType = 'niveaux'; itemId = item.idRangement; }
            if (type === 'niveaux') { prochainType = 'vetements'; itemId = item.idNiveau; }

            // On crée la bulle standard
            const bulle = document.createElement('div');
            bulle.className = 'bulle shadow-sm';
            bulle.style.backgroundImage = `url('${photoUrl}')`;
            bulle.innerHTML = `<div class="bulle-texte">${item.nom}</div>`;
            bulle.addEventListener('click', () => chargerBulles(prochainType, itemId));
            
            // Injection du tooltip UNIQUEMENT pour les sites
            if (type === 'sites') {
                const wrapper = document.createElement('div');
                wrapper.className = 'bulle-container';
                
                // On cherche les locaux qui appartiennent à ce site
                const locauxDuSite = locauxData ? locauxData.filter(l => l.idSite == item.idSite) : [];
                
                let htmlPreview = '';
                if (locauxDuSite.length > 0) {
                    const listeNoms = locauxDuSite.map(l => `<i class="bi bi-door-open-fill me-1"></i> ${l.nom}`).join('<br>');
                    htmlPreview = `<div class="locaux-preview fw-bold text-start">${listeNoms}</div>`;
                } else {
                    htmlPreview = `<div class="locaux-preview text-muted small">Aucun local</div>`;
                }
                
                // On met le tout dans le wrapper
                wrapper.appendChild(bulle);
                wrapper.insertAdjacentHTML('beforeend', htmlPreview);
                conteneur.appendChild(wrapper);
            } 
            // Pour les autres (locaux, rangements, etc.), on affiche la bulle normalement
            else {
                conteneur.appendChild(bulle);
            }
        });
    } else {
        conteneur.innerHTML = '<p class="text-muted">Aucun élément trouvé ici.</p>';
    }
}