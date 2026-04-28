const API_BASE = 'backend/';

// Fonction générique pour récupérer des données (GET)
async function fetchDonnees(url) {
    try {
        const response = await fetch(API_BASE + url);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        return await response.json();
    } catch (error) {
        console.error('Erreur fetch :', error);
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

        // On récupère le texte brut envoyé par PHP
        const textReponse = await response.text();

        try {
            // On essaie de le transformer en JSON
            return JSON.parse(textReponse);
        } catch (jsonError) {
            // Si ça échoue, on affiche la VRAIE erreur PHP dans la console
            console.error("PHP n'a pas renvoyé du JSON ! Voici ce qu'il a dit :");
            console.error(textReponse);
            return { status: 'error', message: "Erreur serveur : Regardez la console pour lire l'erreur PHP." };
        }

    } catch (error) {
        console.error('Erreur de réseau :', error);
        return { status: 'error', message: error.message };
    }
}