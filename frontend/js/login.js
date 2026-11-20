// Gestionnaire d'authentification utilisateur
document.getElementById('btnConnexion').addEventListener('click', function () {
    const login  = document.getElementById('login').value.trim();
    const mdp    = document.getElementById('mdp').value;
    const erreur = document.getElementById('erreurLogin');
    const btn    = document.getElementById('btnConnexion');
    
    erreur.classList.add('d-none');

    // Validation front-end pour éviter une requête serveur inutile
    if (!login || !mdp) {
        erreur.textContent = 'Merci de remplir tous les champs.';
        erreur.classList.remove('d-none');
        return;
    }

    // Verrouillage de l'interface. Empêche l'utilisateur de cliquer plusieurs fois par impatience
    btn.disabled = true;
    btn.textContent = 'Connexion en cours...';

    // Appel AJAX asynchrone vers l'API d'authentification
    fetch('backend/connexion/login_utilisateur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, mdp: mdp })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // Routage vers le tableau de bord
            window.location.href = 'dressing.html?tab=accueil';
        } else {
            // Affichage de l'erreur renvoyée par le backend
            erreur.textContent = data.message || 'Login ou mot de passe incorrect.';
            erreur.classList.remove('d-none');
        }
    })
    .catch(err => {
        // Interception des erreurs réseaux (coupure internet, serveur crashé)
        erreur.textContent = 'Erreur de communication avec le serveur.';
        erreur.classList.remove('d-none');
    })
    .finally(() => {
        // Que ce soit un succès ou un échec, on déverrouille le bouton
        btn.disabled = false;
        btn.textContent = 'Se connecter';
    });
});

// Déclenche la connexion à l'appui de la touche "Entrée" n'importe où sur la page
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('btnConnexion').click();
    }
});