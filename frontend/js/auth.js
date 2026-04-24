/**
 * Ce fichier gère l'authentification, la vérification de session 
 * et les fonctions d'administration (validation des comptes).
 */

/**
 * Vérifie si un utilisateur est connecté via le sessionStorage
 * et met à jour l'interface (Navbar, Avatar, Admin) en conséquence.
 */
function verifierSession() {
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (user) {

        // Mise à jour de la Navbar : cache le bouton Connexion, montre le Profil
        document.getElementById('nav-login').classList.add('d-none');
        document.getElementById('nav-profil').classList.remove('d-none');

        // Calcul et affichage des initiales de l'avatar
        const initiales = (user.prenom[0] + user.nom[0]).toUpperCase();
        document.getElementById('avatar-initiales').textContent = initiales;
        document.getElementById('profil-nom').textContent = user.prenom + ' ' + user.nom;
        
        // Affichage du rôle
        document.getElementById('profil-role').textContent = user.role === 'admin' ? '⭐ Administrateur' : 'Utilisateur';

        // Si l'utilisateur est admin, on active les outils de gestion
        if (user.role === 'admin') {
            document.getElementById('lien-admin-demandes').classList.remove('d-none');
            actualiserBadgeDemandes();
        }

        // SI L'UTILISATEUR EST ADMIN, ON AFFICHE LE LIEN
        const adminLink = document.getElementById('nav-admin-link');
        if (adminLink && user.role === 'admin') {
            adminLink.style.display = 'block';
        }

        // Configuration du bouton de déconnexion
        document.getElementById('btn-deconnexion').addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
        });

        // Écouteur pour ouvrir le panneau admin des demandes
        document.getElementById('btn-voir-demandes')?.addEventListener('click', function (e) {
            e.preventDefault();
            chargerDemandes();
            document.getElementById('panneau-admin').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Écouteur pour fermer le panneau admin
        document.getElementById('btn-fermer-admin')?.addEventListener('click', function () {
            document.getElementById('panneau-admin').style.display = 'none';
        });
    }
}

/**
 * Récupère le nombre de demandes en attente pour mettre à jour le badge dans le menu.
 */
function actualiserBadgeDemandes() {
    fetch('backend/utilisateur/getpending_utilisateurs.php')
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                const badge = document.getElementById('badge-nb-demandes');
                badge.textContent = data.length;
                badge.style.display = 'inline';
            } else {
                document.getElementById('badge-nb-demandes').style.display = 'none';
            }
        })
        .catch(() => {});
}

/**
 * Charge et affiche la liste des utilisateurs en attente de validation dans le panneau admin.
 */
function chargerDemandes() {
    const liste = document.getElementById('liste-demandes');
    liste.innerHTML = '<p class="text-muted">Chargement...</p>';

    fetch('backend/utilisateur/getpending_utilisateurs.php')
        .then(r => r.json())
        .then(data => {
            if (!data.length) {
                liste.innerHTML = '<p class="text-muted fst-italic">Aucune demande en attente.</p>';
                return;
            }
            liste.innerHTML = '';
            data.forEach(u => {
                const div = document.createElement('div');
                div.className = 'carte-demande mb-3';
                div.id = 'demande-' + u.idutilisateur;
                div.innerHTML = `
                    <div class="info-user">
                        <strong>${u.prenom} ${u.nom}</strong>
                        <span>${u.email} · @${u.login}</span>
                        <span class="d-block">${u.adresse}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn-accepter" onclick="validerDemande(${u.idutilisateur}, 'accepter')">✔ Accepter</button>
                        <button class="btn-refuser"  onclick="validerDemande(${u.idutilisateur}, 'refuser')">✖ Refuser</button>
                    </div>
                `;
                liste.appendChild(div);
            });
        })
        .catch(() => {
            liste.innerHTML = '<p class="text-danger">Erreur lors du chargement des demandes.</p>';
        });
}

/**
 * Envoie la décision de l'admin (accepter/refuser) au serveur pour un utilisateur donné.
 * @param {number} id - L'ID de l'utilisateur concerné.
 * @param {string} action - 'accepter' ou 'refuser'.
 */
async function validerDemande(id, action) {
    const user = JSON.parse(sessionStorage.getItem('user'));

    try {
        // 1. Assure-toi que le fichier s'appelle bien valider_inscription.php !
        const response = await fetch('backend/valider_inscription.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idutilisateur: id, action: action })
        });
        
        // 2. On lit la réponse en TEXTE brut d'abord, pour voir ce que PHP raconte
        const text = await response.text(); 
        console.log("🔍 Réponse brute du serveur :", text);

        // 3. On essaie de la transformer en JSON
        const data = JSON.parse(text); 
        
        if (data.status === 'success') {
            const carte = document.getElementById('demande-' + id);
            if (carte) {
                const actionLabel = action === 'accepter' ? '✔ Accepté' : '✖ Refusé';
                const couleur = action === 'accepter' ? '#0a5c36' : '#ad1457';
                
                carte.innerHTML = `
                    <div class="info-user">
                        <span style="color:${couleur}; font-weight:500;">${actionLabel} par ${user.prenom} ${user.nom}</span>
                    </div>
                `;

                setTimeout(() => {
                    carte.remove();
                    const liste = document.getElementById('liste-demandes');
                    if (!liste.children.length) {
                        liste.innerHTML = '<p class="text-muted fst-italic">Aucune demande en attente.</p>';
                        document.getElementById('badge-nb-demandes').style.display = 'none';
                    } else {
                        actualiserBadgeDemandes();
                    }
                }, 2000);
            }
        } else {
            alert("Erreur signalée par PHP : " + data.message);
        }

    } catch (error) {
        // Si ça crashe ici, c'est que la réponse brute n'était pas du JSON
        console.error("❌ Erreur JS interceptée :", error);
        alert("Regarde la console (F12), le serveur a renvoyé une erreur fatale.");
    }
}