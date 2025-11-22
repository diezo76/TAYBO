# 🔄 Redémarrage du Serveur de Développement

**Problème** : Le code corrigé n'est pas chargé car le serveur Vite n'a pas été redémarré.

---

## 🚀 Solution Rapide

### Étape 1 : Arrêter Tous les Processus

Dans votre terminal où `npm run dev` tourne :

1. **Appuyez sur `Ctrl+C`** (plusieurs fois si nécessaire)
2. **Attendez** que le serveur s'arrête complètement

Si ça ne suffit pas, **tuez tous les processus Node/Vite** :

```bash
# Arrêter tous les processus Vite
pkill -f vite

# Ou arrêter tous les processus Node (attention si vous avez d'autres apps Node)
pkill -f node
```

### Étape 2 : Redémarrer le Serveur

```bash
cd /Users/diezowee/Taybo
npm run dev
```

**Attendez** de voir :
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Étape 3 : Recharger le Navigateur

1. **Fermez TOUS les onglets** de localhost:5173
2. **Ouvrez un NOUVEL onglet** (ou navigation privée)
3. Allez sur http://localhost:5173
4. **Vérifiez dans la console** (F12) que le nouveau code est chargé

---

## ✅ Vérification que le Code est Rechargé

### Dans la Console du Navigateur (F12)

Quand vous vous connectez avec le restaurant, vous devriez voir :

```javascript
✅ [authService] Restaurant détecté, ne pas interroger la table users
```

Si vous ne voyez PAS ce message, le code n'est pas encore rechargé.

---

## 📋 Checklist Complète

### 1. Terminal
- [ ] `Ctrl+C` pour arrêter le serveur
- [ ] `pkill -f vite` si nécessaire
- [ ] `npm run dev` pour redémarrer
- [ ] Attendre "Local: http://localhost:5173/"

### 2. Navigateur
- [ ] Fermer TOUS les onglets localhost:5173
- [ ] Ouvrir un NOUVEL onglet
- [ ] Aller sur http://localhost:5173
- [ ] Ouvrir la console (F12)

### 3. Test Upload
- [ ] Se connecter (diezoweez@gmail.com)
- [ ] Aller dans Gérer le profil
- [ ] Uploader une image
- [ ] Vérifier le fichier dans Storage (doit être > 100 KB)
- [ ] Vérifier MIME type = image/jpeg

---

## 🔍 Vérification Post-Upload

Après avoir uploadé une nouvelle image, vérifiez dans la **console du navigateur** :

```javascript
// Vous devriez voir des logs comme :
[ManageProfile] Début upload image pour restaurant: c45a3a48-...
[ManageProfile] Résultat upload: { success: true, url: "https://..." }
[ManageProfile] Upload réussi
```

---

## ⚠️ Si ça ne Marche Toujours Pas

### Vérifier que le Code est Bien Modifié

```bash
cd /Users/diezowee/Taybo
grep "const fileBlob = new Blob" src/services/restaurantService.js
```

**Résultat attendu** :
```javascript
    const fileBlob = new Blob([file], { type: contentType });
```

Si vous ne voyez PAS cette ligne, le fichier n'a pas été modifié.

### Vider le Cache du Navigateur Complètement

1. **Ctrl+Shift+Delete** (ou Cmd+Shift+Delete sur Mac)
2. Cocher **Tout** :
   - Cache
   - Cookies
   - Données de site
3. **Effacer**
4. **Fermer le navigateur**
5. **Rouvrir**

---

## 🎯 Résultat Attendu

Après redémarrage du serveur et upload d'une nouvelle image :

| Élément | Avant | Après |
|---------|-------|-------|
| **MIME type** | application/json ❌ | image/jpeg ✅ |
| **Taille** | ~1 KB ❌ | > 100 KB ✅ |
| **Affichage** | Erreur 406 ❌ | Image visible ✅ |

---

## 📞 Commandes Rapides

```bash
# Arrêter tous les serveurs
pkill -f vite

# Redémarrer
cd /Users/diezowee/Taybo && npm run dev

# Vérifier que le code est modifié
grep "fileBlob" src/services/restaurantService.js
```

---

**Arrêtez le serveur, redémarrez-le, et réessayez l'upload. Cette fois le code corrigé sera chargé !** 🚀

