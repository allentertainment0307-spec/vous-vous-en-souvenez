# Vous vous en souvenez ? — mode d'emploi

## 1. Remplir tes données

Tout se passe dans le fichier `data.json`. C'est une liste, une entrée par dessin animé :

```json
{
  "name": "Nom du dessin animé",
  "image": "URL de l'image (miniature, capture, etc.)",
  "videoId": "l'ID de la vidéo YouTube",
  "videoTitle": "Titre de la vidéo où tu en parles",
  "timestamp": 125
}
```

- `videoId` : dans une URL YouTube du type `https://www.youtube.com/watch?v=ABC123xyz`,
  c'est la partie après `v=`, ici `ABC123xyz`.
- `timestamp` : le moment où tu commences à parler du dessin animé, **en secondes**
  (2 min 05 = 125).
- `image` : tu peux utiliser une capture d'écran du dessin animé, une image trouvée en
  ligne, ou une miniature que tu crées toi-même. Héberge-la où tu veux (par exemple sur
  un service d'images gratuit, ou dans ce même dossier si tu ajoutes les fichiers image).

Copie-colle une entrée pour chaque nouveau dessin animé, sépare-les par une virgule.
Attention à ne pas laisser de virgule après la toute dernière entrée.

## 2. Mettre le site en ligne (sans terminal)

Le plus simple : **GitHub Pages**, entièrement depuis le site web de GitHub.

1. Crée un compte sur [github.com](https://github.com) si tu n'en as pas.
2. Clique sur "New repository", donne-lui un nom (ex. `vous-vous-en-souvenez`), coche
   "Public", puis "Create repository".
3. Sur la page du repo, clique "Add file" > "Upload files", puis glisse les 4 fichiers
   (`index.html`, `style.css`, `script.js`, `data.json`). Valide avec "Commit changes".
4. Va dans "Settings" > "Pages" (menu de gauche). Dans "Branch", choisis `main` et
   dossier `/ (root)`, puis "Save".
5. Après une minute, ton site est en ligne à une adresse du type
   `https://ton-pseudo.github.io/vous-vous-en-souvenez/`.

## 3. Ajouter un nouveau dessin animé plus tard

Toujours sur GitHub, va dans ton repo, clique sur `data.json`, puis sur l'icône crayon
("Edit this file"). Ajoute ta nouvelle entrée, puis "Commit changes". Le site se met à
jour automatiquement en quelques secondes, sans rien réinstaller.

## Alternative encore plus rapide (mais moins pratique pour les mises à jour)

Sur [app.netlify.com/drop](https://app.netlify.com/drop), tu peux glisser directement
le dossier du site pour obtenir une URL en ligne en quelques secondes. L'inconvénient :
pour chaque mise à jour de `data.json`, il faut re-glisser tout le dossier.
