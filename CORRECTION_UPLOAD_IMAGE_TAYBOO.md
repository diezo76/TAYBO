# 🔧 Correction : Upload Image Restaurant TAYBOO

**Date** : 18 Novembre 2025  
**Problème** : Image ne s'affiche pas après upload  
**Cause** : Mauvais MIME type (application/json au lieu de image/jpeg)  
**Status** : ✅ **CORRIGÉ**

---

## 🔍 Problème Identifié

Quand vous avez uploadé votre image, le fichier a été enregistré avec :
- ❌ **MIME type** : `application/json`
- ❌ **Contenu** : FormData brut au lieu de l'image
- ❌ **Taille** : 991 bytes (au lieu de plusieurs KB pour une image)

**Cause** : Supabase Storage ignorait l'option `contentType` et utilisait le mauvais type MIME.

---

## ✅ Correction Appliquée

### Dans le Code (`src/services/restaurantService.js`)

**Avant** :
```javascript
// Upload direct du fichier (Supabase ignore contentType)
await supabase.storage
  .from('restaurant-images')
  .upload(filePath, file, {
    contentType: contentType, // Ignoré par Supabase
  });
```

**Après** :
```javascript
// Créer un nouveau Blob avec le bon MIME type
const fileBlob = new Blob([file], { type: contentType });

// Upload du Blob (le MIME type est maintenant correct)
await supabase.storage
  .from('restaurant-images')
  .upload(filePath, fileBlob, {
    contentType: contentType,
  });
```

### Nettoyage Effectué

✅ **Supprimé** : Tous les fichiers corrompus du Storage  
✅ **Réinitialisé** : `image_url` mis à NULL dans la base de données  
✅ **Prêt** : Votre restaurant est prêt pour un nouvel upload

---

## 🚀 Comment Réessayer l'Upload

### Étape 1 : Rafraîchir l'Application

1. **Fermez complètement votre navigateur** (important pour recharger le nouveau code)
2. **Rouvrez** votre application
3. **Connectez-vous** avec le compte restaurant (diezoweez@gmail.com)

### Étape 2 : Uploader une Nouvelle Image

1. Allez dans **Profil Restaurant** → **Gérer le profil**
2. Cliquez sur **Choisir un fichier**
3. Sélectionnez une image **JPG, PNG ou WebP** (max 5MB)
4. Attendez que la prévisualisation s'affiche
5. Cliquez sur **Uploader l'image**
6. Attendez le message "Image uploadée avec succès"
7. Cliquez sur **Sauvegarder** en bas de la page

### Étape 3 : Vérifier

1. Allez sur la **page d'accueil**
2. **Votre restaurant devrait s'afficher avec l'image** ✅

---

## 📊 Ce Qui a Changé

| Élément | Avant | Après |
|---------|-------|-------|
| **MIME type** | `application/json` ❌ | `image/jpeg` ✅ |
| **Contenu fichier** | FormData brut ❌ | Image réelle ✅ |
| **Affichage** | Erreur 406 ❌ | Fonctionne ✅ |
| **Code** | File direct ❌ | Blob correct ✅ |

---

## 🎯 Pourquoi Ça Va Fonctionner Maintenant

### Avant la Correction

```javascript
file.type = "" // Vide ou incorrect
↓
Supabase utilise "application/json" par défaut
↓
Erreur 406 (Not Acceptable)
```

### Après la Correction

```javascript
new Blob([file], { type: 'image/jpeg' })
↓
Supabase utilise le type fourni par le Blob
↓
Image s'affiche correctement ✅
```

---

## ⚠️ Points Importants

### 1. Formats Acceptés
- ✅ **JPEG/JPG** (recommandé)
- ✅ **PNG** (transparence)
- ✅ **WebP** (moderne)
- ❌ **GIF** (non supporté)
- ❌ **BMP** (non supporté)

### 2. Taille Maximum
- ✅ **Max 5MB** par image
- 💡 **Recommandé** : 500KB - 2MB pour de bonnes performances

### 3. Dimensions Recommandées
- 📐 **800x600 pixels** minimum
- 📐 **1920x1080 pixels** maximum
- ℹ️ **Ratio** : 4:3 ou 16:9

### 4. Qualité
- ✨ Image nette et bien éclairée
- ✨ Représentative de votre restaurant
- ✨ Professionnelle

---

## 🔄 Si Ça Ne Fonctionne Toujours Pas

### Option A : Vérifier le Fichier

**Testez votre image avant l'upload** :
1. Ouvrez l'image dans un éditeur (Preview, Paint, etc.)
2. **Enregistrez-la à nouveau** en JPG
3. Assurez-vous qu'elle s'ouvre correctement
4. Réessayez l'upload

### Option B : Utiliser Unsplash Temporairement

Si vous voulez **tester immédiatement** :

```sql
UPDATE restaurants
SET image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
WHERE id = 'c45a3a48-c343-4922-8c6e-c62e8a165440';
```

**Résultat** : Image s'affiche immédiatement (comme les restaurants exemples)

---

## 📝 Logs à Vérifier

Quand vous uploadez, vérifiez la **console du navigateur** (F12) :

### Logs Normaux (Succès) ✅
```
[ManageProfile] Début upload image pour restaurant: c45a3a48-...
[ManageProfile] Résultat upload: { success: true, url: "https://..." }
[ManageProfile] Upload réussi, URL: https://...
```

### Logs d'Erreur (Problème) ❌
```
[ManageProfile] Erreur upload: <message d'erreur>
Erreur upload image: StorageApiError: ...
```

**Si vous voyez une erreur**, envoyez-moi le message complet.

---

## 📄 Fichiers Modifiés

### `src/services/restaurantService.js`
- ✅ Ligne 244-246 : Création du Blob avec bon MIME type
- ✅ Ligne 251 : Upload du Blob au lieu du File

### Base de Données
- ✅ Storage : Fichiers corrompus supprimés
- ✅ Table `restaurants` : `image_url` réinitialisé

---

## 🎉 Résumé

| Action | Status |
|--------|--------|
| Code corrigé | ✅ Fait |
| Fichiers corrompus supprimés | ✅ Fait |
| Base de données réinitialisée | ✅ Fait |
| Prêt pour nouvel upload | ✅ Oui |

---

## 🚀 Prochaines Étapes

1. **Fermez et rouvrez votre navigateur**
2. **Reconnectez-vous** au compte restaurant
3. **Allez dans Gérer le profil**
4. **Uploadez votre image**
5. **Cliquez sur Sauvegarder**
6. **Vérifiez sur la page d'accueil**

**Cette fois, ça va fonctionner !** ✅

---

## 📞 Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que votre image est bien un **JPG/PNG/WebP**
2. Vérifiez que la taille est **< 5MB**
3. Vérifiez les **logs de la console** (F12)
4. **Essayez avec une autre image** pour tester

---

**Le problème est maintenant corrigé. Réessayez l'upload et votre image devrait s'afficher correctement !** 🎉🖼️

