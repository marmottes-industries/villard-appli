# Publier une release Android

Ce projet est distribué sous forme d'**APK Android** attachée à une *release*
GitHub. Tout est automatisé par le workflow [`.github/workflows/release-android.yml`](../.github/workflows/release-android.yml).

## Comment ça marche

| Déclencheur | Résultat |
| --- | --- |
| Push d'un tag `vX.Y.Z` | Build de l'APK **+ création d'une release GitHub** avec l'APK et les notes du CHANGELOG |
| Lancement manuel (*workflow_dispatch*) | Build de l'APK seul, disponible en **artifact** du run (pour tester sans publier) |

Le workflow, sur un runner `ubuntu-latest` :

1. installe les dépendances (`npm ci`) ;
2. génère le projet natif Android (`npx expo prebuild`) ;
3. remplace la keystore générée par `keystore/release.keystore` (signature
   stable d'une version à l'autre) ;
4. injecte `versionName` (depuis le tag) et `versionCode` (numéro de run) ;
5. construit `assembleRelease` ;
6. publie la release avec l'APK `les-marmottes-X.Y.Z.apk`.

## Étapes pour publier une nouvelle version

1. **Bumper la version** dans `app.json` (`expo.version`) **et** `package.json`
   (`version`). Gardez les deux synchronisés.
2. **Mettre à jour le `CHANGELOG.md`** : renommez la section `## [Non publié]`
   en `## [X.Y.Z] - AAAA-MM-JJ`, et recréez une section `## [Non publié]` vide
   au-dessus. Mettez à jour les liens de comparaison en bas du fichier.
3. **Commiter** :
   ```bash
   git commit -am "chore(release): X.Y.Z"
   ```
4. **Taguer et pousser** :
   ```bash
   git tag vX.Y.Z
   git push origin main --tags
   ```
5. Suivez le run dans l'onglet **Actions**. La release apparaît dans
   **Releases** une fois le build terminé (~5–10 min).

## Signature de l'APK

L'APK release est signée avec `keystore/release.keystore` (alias
`androiddebugkey`, mot de passe `android` — la keystore de debug standard
Android). C'est volontairement simple : aucun secret à configurer, et la
signature reste identique d'une version à l'autre, donc les mises à jour
s'installent par-dessus l'existant.

> Ce n'est **pas** une signature de production sécurisée. Pour une diffusion
> hors cadre familial (ou un passage sur le Play Store), générez une vraie
> keystore et faites-la consommer par le workflow via un secret GitHub
> (`base64 -d` de la keystore + variables de signature). Voir la
> [doc React Native sur la signature](https://reactnative.dev/docs/signed-apk-android).

## Configurer l'URL de l'API du build (optionnel)

Par défaut, le build utilise l'`EXPO_PUBLIC_API_URL` du `.env` commité. Pour
surcharger sans toucher au dépôt, définissez une **variable de dépôt** GitHub
(*Settings → Secrets and variables → Actions → Variables*) nommée
`EXPO_PUBLIC_API_URL`. Le workflow l'utilisera si elle est présente.

## Build local (optionnel)

Pour produire une APK en local sans CI :

```bash
npx expo prebuild --platform android --no-install
cp keystore/release.keystore android/app/debug.keystore
cd android && ./gradlew assembleRelease
# APK : android/app/build/outputs/apk/release/app-release.apk
```
