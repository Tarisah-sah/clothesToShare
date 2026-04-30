document.getElementById('btnConnexion').addEventListener('click', function () {
    const login  = document.getElementById('login').value.trim();
    const mdp    = document.getElementById('mdp').value;
    const erreur = document.getElementById('erreurLogin');
    const btn    = document.getElementById('btnConnexion');
    
    erreur.classList.add('d-none');

    // Vérification que les champs ne sont pas vides
    if (!login || !mdp) {
        erreur.textContent = 'Merci de remplir tous les champs.';
        erreur.classList.remove('d-none');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Connexion en cours...';

    // Requête AJAX vers le backend
    fetch('backend/connexion/login_utilisateur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, mdp: mdp })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            // Redirection vers l'accueil
            window.location.href = 'dressing.html?tab=accueil';
        } else {
            erreur.textContent = data.message || 'Login ou mot de passe incorrect.';
            erreur.classList.remove('d-none');
        }
    })
    .catch(err => {
        erreur.textContent = 'Erreur de communication avec le serveur.';
        erreur.classList.remove('d-none');
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Se connecter';
    });
});

// Permet de se connecter en appuyant sur la touche "Entrée"
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btnConnexion').click();
});