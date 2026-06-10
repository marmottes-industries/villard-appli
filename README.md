# Les Marmottes 🦫

Application mobile familiale pour gérer l'appartement de montagne : planning des
séjours, inventaire, liste de courses, notes et suivi des travaux.

Client léger (Expo / React Native) de l'API [`villard-api`](https://github.com/marmottes-industries)
(Symfony + API Platform 4). Usage **privé**, distribué en APK Android via les
[releases GitHub](https://github.com/marmottes-industries/villard-appli/releases).

> iOS n'est pas publié — c'est une app pour la famille, sur Android.

## 📲 Installer l'app (utilisateur)

1. Ouvrez la dernière [release](https://github.com/marmottes-industries/villard-appli/releases/latest).
2. Téléchargez le fichier `les-marmottes-x.y.z.apk` directement sur votre téléphone Android.
3. Ouvrez le fichier téléchargé. Android demandera l'autorisation d'installer
   depuis cette source : acceptez.
4. Lancez **Les Marmottes** et connectez-vous.

Les mises à jour s'installent par-dessus la version précédente (signature
constante) — pas besoin de désinstaller.

## 🛠️ Développement

Pré-requis : Node 20+, un appareil ou émulateur Android, et l'API `villard-api`
accessible.

```bash
npm install
cp .env.example .env        # renseignez EXPO_PUBLIC_API_URL (IP LAN de l'API)
npm run start               # Metro
npm run android             # build + lancement sur appareil/émulateur Android
npm run lint                # ESLint (eslint-config-expo)
npx tsc --noEmit            # vérification de types
```

L'URL de l'API est lue depuis `.env` (`EXPO_PUBLIC_API_URL`). Les variables
`EXPO_PUBLIC_*` sont injectées au démarrage du bundler — **redémarrez Metro**
après une modification.

L'architecture du projet (routing Expo Router, auth JWT, stores par ressource,
thème, conventions) est documentée dans [`CLAUDE.md`](./CLAUDE.md). Le contrat
backend est dans [`API.md`](./API.md).

## 🚀 Publier une release Android

Voir le guide détaillé : [`docs/RELEASE.md`](./docs/RELEASE.md).

En résumé :

```bash
# 1. Mettre à jour la version dans app.json + package.json (ex. 1.1.0)
# 2. Compléter le CHANGELOG.md (déplacer "Non publié" -> [1.1.0])
git commit -am "chore(release): 1.1.0"
git tag v1.1.0
git push origin main --tags
```

Le push du tag déclenche le workflow [`release-android.yml`](./.github/workflows/release-android.yml)
qui construit l'APK et crée automatiquement la release GitHub avec l'APK attachée
et les notes extraites du `CHANGELOG.md`.

## 📂 Structure

```
app/            Routes (Expo Router v6, file-based)
src/api/        Clients d'API (axios + intercepteurs auth/collection)
src/stores/     État par ressource (hooks + AsyncState) + AuthProvider
src/components/ Composants UI et métier
src/theme/      Thème statique (couleurs, espacements, typo)
src/lib/        Utilitaires (storage, dates, versions)
keystore/       Keystore de signature de l'APK release
.github/        Workflow CI de release Android
```

## 📜 Licence

Projet privé à usage familial. Tous droits réservés.
