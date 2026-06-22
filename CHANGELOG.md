# Changelog

Toutes les modifications notables de **Les Marmottes** sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

## [1.2.0] - 2026-06-22

### Added

- **Inventaire** : tri alphabétique des articles dans l'inventaire et la liste de courses.

## [1.1.2] - 2026-06-12

### Fix

- **Checklist course** assure la cohérence du `previous` state dans les mises à jour de l'inventaire et du magasin de courses.

## [1.1.1] - 2026-06-11

### Fix

- **Lien associatif pour android** : lien associatif pour l'application Android.

## [1.1.0] - 2026-06-11

### Ajouté

- **Push notifications** : notifications de rappel pour l'inventaire et les courses en fin de séjour.
- **setup eas et firebase pour le dev** : configuration des services de notifications push.

## [1.0.0] - 2026-06-10

Première version publique, distribuée en APK Android via les *releases* GitHub.

### Ajouté

- **Authentification** : connexion par identifiant / mot de passe (JWT + refresh
  token), rafraîchissement transparent du jeton à l'expiration et déconnexion.
- **Planning** : création, consultation et gestion des séjours / occupations de
  l'appartement, avec filtrage et tri.
- **Inventaire** : suivi du matériel et des stocks (CRUD complet, catégories).
- **Courses** : liste de courses partagée (ajout, édition, suppression d'articles).
- **Notes** : notes partagées entre les membres de la famille.
- **Travaux** : suivi des travaux et tâches (filtres, tri, CRUD).
- **À propos** : écran d'information affichant l'utilisateur connecté et la
  version installée de l'application.
- **Vérification de version** : l'app interroge l'API au démarrage et invite à
  mettre à jour (suggérée ou forcée) quand une nouvelle version est disponible.
- **Distribution Android** : workflow GitHub Actions qui construit et publie
  automatiquement l'APK sur une *release* à chaque tag `v*`.

### Notes

- Application pensée pour un usage familial privé. Seul **Android** est ciblé
  pour la distribution ; iOS n'est pas publié.
- L'app est un client léger de l'API `villard-api` (Symfony + API Platform 4).
  L'URL de l'API est lue depuis `EXPO_PUBLIC_API_URL` au moment du build.

[Non publié]: https://github.com/marmottes-industries/villard-appli/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/marmottes-industries/villard-appli/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/marmottes-industries/villard-appli/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/marmottes-industries/villard-appli/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/marmottes-industries/villard-appli/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/marmottes-industries/villard-appli/releases/tag/v1.0.0
