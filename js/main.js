// 1. Simulation de données (En attendant le PHP/MySQL)
const vêtementsFictifs = [
    { id: 1, nom: "Veste en Jean", taille: "L", couleur: "Bleu", image: "veste.jpg", dispo: true },
    { id: 2, nom: "Robe d'été", taille: "M", couleur: "Fleurs", image: "robe.jpg", dispo: false },
    { id: 3, nom: "Pull Over", taille: "XL", couleur: "Gris", image: "pull.jpg", dispo: true }
];

// 2. Fonction pour afficher la liste des vêtements
function afficherGardeRobe(vetements) {
    const appView = document.getElementById('app-view');
    
    // On vide le "Chargement..."
    appView.innerHTML = '<div class="row" id="vetements-list"></div>';
    const list = document.getElementById('vetements-list');

    vetements.forEach(item => {
        // Déterminer le badge de disponibilité
        const badge = item.dispo 
            ? '<span class="badge bg-success">Disponible</span>' 
            : '<span class="badge bg-danger">Emprunté</span>';

        // Création de la carte Bootstrap
        list.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="assets/img/wardrobe/${item.image}" class="card-img-top" alt="${item.nom}" onerror="this.src='https://via.placeholder.com/300x200?text=Pas+d+image'">
                    <div class="card-body">
                        <h5 class="card-title">${item.nom}</h5>
                        <p class="card-text text-muted">Taille : ${item.taille} | ${item.couleur}</p>
                        ${badge}
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <button class="btn btn-sm btn-outline-primary w-100" onclick="voirDetails(${item.id})">Voir détails</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 3. Simulation du clic sur un bouton
function voirDetails(id) {
    alert("Détails du vêtement ID : " + id + "\n(Bientôt disponible avec AJAX !)");
}

// 4. Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Système prêt !");
    // On simule un délai réseau de 1 seconde pour voir le spinner
    setTimeout(() => {
        afficherGardeRobe(vêtementsFictifs);
    }, 1000);
});