document.addEventListener('DOMContentLoaded', async () => {
    // 1. Charger la navbar injectée
    await chargerComposant('composant-navbar', 'frontend/components/navbar.html');
    
    // 2. Vérifier la session (redirige si non connecté)
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }
    verifierSession();

    // 3. Charger les infos actuelles depuis la base de données
    chargerInfosProfil();

    // 4. Écouteur de soumission
    document.getElementById('form-profil').addEventListener('submit', mettreAJourProfil);
});

async function chargerInfosProfil() {
    // 1. On appelle l'API PHP créée ci-dessus via fetchDonnees
    const data = await fetchDonnees('utilisateur/get_profil.php');

    // 2. Si le PHP renvoie bien les données
    if (data && data.status !== 'error') {
        // 3. On remplit les champs HTML avec les valeurs de la base de données
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