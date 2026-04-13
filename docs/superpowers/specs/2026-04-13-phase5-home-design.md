# Phase 5 — Ecran Aujourd'hui (Home)

## Objectif

Ecran principal de l'app. Rassemble TOUTES les donnees des autres modules.
Repond en 3 secondes a : "ou j'en suis aujourd'hui ?"

## Stack / Contraintes

- React Native + Expo, TypeScript, NativeWind
- Theme violet/sombre (#111118 fond, #6C5CE7 primary)
- Donnees 100% depuis les stores Zustand existants (pas de fetch supplementaire)
- Fichier principal : `app/(tabs)/index.tsx`
- Sous-composants dans `components/home/` si necessaire

## Layout (de haut en bas)

### 1. Header

- Date du jour formatee en francais : "Lundi 14 Avril"
- Utiliser `dateUtils.ts` : `isoDayOfWeek()` + `MONTH_LABELS` + tableau local de jours complets
- Message motivant contextuel base sur les donnees reelles :
  - Si meilleur streak > 0 et en cours : "{X} jours de streak, continue !"
  - Si toutes habitudes faites hier : "Hier etait parfait, on recommence ?"
  - Si rien fait depuis 2+ jours : "C'est le moment de reprendre"
  - Sinon : message generique motivant ("Chaque jour compte")

### 2. Progression du jour

- Composant `ProgressCircle` existant (`components/ui/ProgressCircle.tsx`)
- Props: `progress` = completees / total, `label` = "X/Y", `sublabel` = "habitudes"
- Ne compte que les habitudes scheduled pour aujourd'hui (`isHabitScheduledForDate`)

### 3. Bloc Habitudes du jour

- Liste compacte des habitudes prevues aujourd'hui
- Chaque ligne : checkbox + icone + nom + StreakBadge
- Tap checkbox = `toggleCompletion(habitId, today)` directement
- Habitudes faites en bas de la liste, grisees (tri: non-faites d'abord)
- Si toutes faites : message de celebration ("Bravo, tout est fait !")
- Pas de chevron (contrairement a HabitItem) — on reste sur Home
- Reutiliser `calculateStreak()` de `lib/habitUtils.ts`
- Reutiliser `StreakBadge` de `components/habits/StreakBadge.tsx`

### 4. Bloc Sport (conditionnel)

- Lire `workoutStore.programs` et `workoutStore.currentSession`
- Si session en cours : carte "Seance en cours" + bouton "Reprendre"
- Si programmes existent mais pas de session : carte avec dernier programme + "Demarrer la seance"
- Si rien : lien discret "Seance libre ?"
- Navigation vers `/(tabs)/sport` ou ecran de seance

### 5. Bloc Objectifs (resume compact)

- 2-3 objectifs actifs les plus proches de leur deadline
- Tri par deadline ASC, filtrer `status === "in_progress"`
- Barre de progression (`ProgressBar` existant)
- Indicateur avance/retard :
  - Calculer le % temps ecoule vs % progression
  - Vert (success) si en avance, Orange (warning) si en retard
- Tap = navigation vers detail objectif

## Composants a creer

| Composant | Fichier | Role |
|-----------|---------|------|
| HomeScreen | `app/(tabs)/index.tsx` | Orchestrateur principal |
| HomeHeader | `components/home/HomeHeader.tsx` | Date + message motivant |
| HomeDayProgress | `components/home/HomeDayProgress.tsx` | Cercle progression |
| HomeHabitList | `components/home/HomeHabitList.tsx` | Liste habitudes cochables |
| HomeHabitRow | `components/home/HomeHabitRow.tsx` | Ligne habitude simplifiee |
| HomeSportCard | `components/home/HomeSportCard.tsx` | Carte sport conditionnelle |
| HomeObjectivesList | `components/home/HomeObjectivesList.tsx` | Resume objectifs |

## APIs utilisees

### habitStore
- `habits` — toutes les habitudes actives
- `completions` — Record<`habitId:date`, boolean>
- `toggleCompletion(habitId, date)` — toggle avec optimistic update
- `getCompletedDatesForHabit(habitId)` — pour calculer streak
- `fetchHabits()`, `fetchCompletions(start, end)` — refresh si vide

### objectiveStore
- `objectives` — tous les objectifs
- `fetchObjectives()` — refresh si vide

### workoutStore
- `programs` — programmes de muscu
- `currentSession` — session en cours ou null
- `fetchPrograms()` — refresh si vide

### Utilitaires
- `isHabitScheduledForDate(habit, date)` — filtrer habitudes du jour
- `calculateStreak(habit, completedDates, today)` — calcul streak
- `toDateString()`, `isoDayOfWeek()`, `MONTH_LABELS` — formatage date

## Principes UX

- Tout actionnable directement — pas besoin de naviguer pour cocher
- Pas de scroll infini — tout tient sur un ecran
- Design epure, beaucoup d'espace
- Couleurs = statut : violet/vert = fait, gris = a faire, orange = en retard
- Reactif — donnees Zustand, pas de loading spinner

## Responsive

- Sur grand ecran (web) : blocs cote a cote en 2 colonnes
- Breakpoint NativeWind `md:` pour le layout
