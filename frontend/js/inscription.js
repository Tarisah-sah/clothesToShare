document.getElementById('btnInscription').addEventListener('click', function () {
    const nom        = document.getElementById('nom').value.trim();
    const prenom     = document.getElementById('prenom').value.trim();
    const email      = document.getElementById('email').value.trim();
    const adresse    = document.getElementById('adresse').value.trim();
    const login      = document.getElementById('login').value.trim();
    const mdp        = document.getElementById('mdp').value;
    const mdpConfirm = document.getElementById('mdpConfirm').value;
    const sexe       = document.querySelector('input[name="sexe"]:checked');

    const erreur = document.getElementById('erreurInscription');
    const succes = document.getElementById('succesInscription');
    const btn    = document.getElementById('btnInscription');

    erreur.classList.add('d-none');
    succes.classList.add('d-none');

    if (!nom || !prenom || !email || !adresse || !login || !mdp || !mdpConfirm || !sexe) {
        erreur.textContent = 'Merci de remplir tous les champs.';
        erreur.classList.remove('d-none');
        return;
    }

    if (mdp !== mdpConfirm) {
        erreur.textContent = 'Les mots de passe ne correspondent pas.';
        erreur.classList.remove('d-none');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';

    fetch('backend/utilisateur/add_utilisateur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, adresse, login, mdp }) 
    })
    .then(async r => {
        // Lecture propre du JSON
        const data = await r.json();
        if (data.status === 'success') {
            succes.classList.remove('d-none');
            document.querySelectorAll('input').forEach(i => i.value = '');
        } else {
            erreur.textContent = data.message || 'Une erreur est survenue lors de l\'inscription.';
            erreur.classList.remove('d-none');
        }
    })
    .catch(() => {
        // Notification silencieuse pour l'utilisateur, pas de console.error
        erreur.textContent = "Une erreur technique est survenue. Veuillez réessayer plus tard.";
        erreur.classList.remove('d-none');
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "S'inscrire";
    });
});