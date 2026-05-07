document.addEventListener('DOMContentLoaded', async () => {
    // Charger la navbar injectée
    await chargerComposant('composant-navbar', 'frontend/components/navbar.html');
    
    // Vérifier la session (redirige si non connecté)
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }
    verifierSession();

    // Charger les infos de la base de données
    chargerInfosProfil();

    // Écouteur de soumission
    document.getElementById('form-profil').addEventListener('submit', mettreAJourProfil);
    
    const btnSupprimer = document.getElementById('btn-supprimer-compte');
    if (btnSupprimer) {
        btnSupprimer.addEventListener('click', async () => {
            // Première alerte
            if (confirm("⚠️ ATTENTION ! Es-tu absolument sûr de vouloir supprimer ton compte ?")) {
                
                // Deuxième alerte (pour éviter les clics par erreur)
                if (confirm("Cette action est DÉFINITIVE et IRRÉVERSIBLE. Confirmer la suppression ?")) {
                    
                    // On appelle notre nouveau script PHP
                    const response = await fetch('backend/utilisateur/delete_mon_compte.php', {
                        method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        alert("Ton compte a bien été supprimé. Au revoir !");
                        // On vide la mémoire du navigateur
                        sessionStorage.removeItem('user');
                        localStorage.clear(); // Vide aussi les favoris
                        
                        // On le renvoie vers la page d'accueil ou de connexion
                        window.location.href = 'index.html'; 
                    } else {
                        alert("Erreur : " + data.message);
                    }
                }
            }
        });
    }
});

async function chargerInfosProfil() {
    // On appelle l'API PHP via fetchDonnees
    const data = await fetchDonnees('utilisateur/get_profil.php');

    // Si le PHP renvoie bien les données
    if (data && data.status !== 'error') {
        // On remplit les champs HTML avec les valeurs de la base de données
        document.getElementById('profil-prenom').value = data.prenom;
        document.getElementById('profil-nom-input').value = data.nom;
        document.getElementById('profil-login').value = data.login;
    } else {
        console.error("Impossible de charger les données du profil.");
    }
}

async function mettreAJourProfil(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('prenom', document.getElementById('profil-prenom').value);
    formData.append('nom', document.getElementById('profil-nom-input').value);
    formData.append('login', document.getElementById('profil-login').value);
    
    const mdp = document.getElementById('profil-mdp').value;
    if (mdp) formData.append('mdp', mdp);

    const result = await postDonnees('utilisateur/modify_profil.php', formData);

    if (result.status === 'success') {
        alert("Profil mis à jour avec succès !");
        
        // Mettre à jour le sessionStorage pour que la navbar s'actualise
        const user = JSON.parse(sessionStorage.getItem('user'));
        user.prenom = document.getElementById('profil-prenom').value;
        user.nom = document.getElementById('profil-nom-input').value;
        sessionStorage.setItem('user', JSON.stringify(user));
        
        location.reload(); // Rafraîchir pour voir les changements
    } else {
        alert("Erreur : " + result.message);
    }
}