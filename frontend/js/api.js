const API_BASE = 'backend/';

// Fonction générique pour récupérer des données (GET)
async function fetchDonnees(url) {
    try {
        const response = await fetch(API_BASE + url);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        return await response.json();
    } catch (error) {
        return null;
    }
}

// Fonction générique pour envoyer des données (POST avec FormData pour les fichiers)
async function postDonnees(url, formData) {
    try {
        const response = await fetch(API_BASE + url, {
            method: 'POST',
            body: formData
        });

        const textReponse = await response.text();

        try {
            return JSON.parse(textReponse);
        } catch (jsonError) {
            return { status: 'error', message: "Erreur serveur inattendue. Veuillez réessayer." };
        }

    } catch (error) {
        return { status: 'error', message: "Problème de connexion au serveur." };
    }
}