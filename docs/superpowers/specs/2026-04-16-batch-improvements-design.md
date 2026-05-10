# Life OS — Batch Improvements Design Spec

**Date:** 2026-04-16
**Scope:** 5 features — notifications workout, CRUD habitudes, CRUD courses, renommage app, date/time picker tâches
**Platform:** Android only (Expo/React Native)

---

## Feature 1: Notification persistante de séance workout

### Objectif
Afficher une notification Android persistante pendant une séance de musculation, montrant le chrono de séance et le chrono de repos en temps réel. Un tap ramène à l'app.

### Approche technique
- **Dépendances:** `expo-notifications`, `expo-task-manager`
- Notification `ongoing: true` (Android foreground-style) déclenchée au démarrage de la séance
- Mise à jour toutes les secondes via un interval dans un background task
- Contenu de la notification :
  - **Titre:** "Séance en cours"
  - **Body:** chrono de séance (ex: "12:34") — quand le rest timer est actif : "12:34 — Repos : 1:30"
- Tap sur la notification → deep link vers `/(tabs)/sport/active-workout`
- Notification supprimée quand la séance se termine (`finishSession`)

### Fichiers
- **Nouveau:** `lib/workoutNotification.ts` — module encapsulant toute la logique notification
  - `startWorkoutNotification(startedAt: number)` — crée la notification + lance l'interval de mise à jour
  - `updateRestTimer(restStartTime: number | null)` — met à jour le body avec le repos
  - `stopWorkoutNotification()` — supprime la notification + clear interval
- **Modifié:** `app/(tabs)/sport/active-workout.tsx` — appeler `startWorkoutNotification` au mount si session active, `stopWorkoutNotification` au finish
- **Modifié:** `components/sport/RestTimer.tsx` — appeler `updateRestTimer` quand le repos démarre/skip
- **Modifié:** `app.json` — ajouter plugin `expo-notifications`
- **Modifié:** `app/_layout.tsx` — demander les permissions notification au démarrage

### Comportement attendu
1. L'utilisateur démarre une séance → notification apparaît avec chrono
2. L'utilisateur quitte l'app → notification reste visible, chrono tourne
3. Sur l'écran de verrouillage → notification visible avec chrono séance + repos
4. L'utilisateur valide une série → notification se met à jour avec "Repos : X:XX"
5. L'utilisateur skip le repos → notification revient au chrono séance seul
6. L'utilisateur termine la séance → notification disparaît

---

## Feature 2: Modifier et supprimer les habitudes

### Objectif
Permettre de modifier tous les champs d'une habitude existante et de la supprimer, depuis la page détail.

### Approche technique
- Ajouter un bouton `more-vertical` (icône "...") dans le header de la page `habit/[id].tsx` via `headerRight`
- Au tap : bottom sheet ou menu avec deux options "Modifier" et "Supprimer"
- "Modifier" navigue vers un nouvel écran `habit/edit.tsx` qui affiche le `HabitForm` pré-rempli avec `initial={habit}`
- "Supprimer" déclenche le `ConfirmModal` existant (déjà en place)
- `HabitForm` supporte déjà la prop `initial` et affiche "Modifier" comme label du bouton submit
- `habitStore.updateHabit()` existe déjà

### Fichiers
- **Nouveau:** `app/habit/edit.tsx` — écran plein écran avec `HabitForm` en mode édition
  - Reçoit `id` en search param
  - Charge l'habitude depuis le store
  - Appelle `updateHabit(id, data)` au submit
  - Retour à la page détail après sauvegarde
- **Modifié:** `app/habit/[id].tsx`
  - Ajout `headerRight` avec icône "more-vertical"
  - Menu avec "Modifier" (→ navigate vers `habit/edit?id=X`) et "Supprimer" (→ ConfirmModal existant)
  - Suppression du bouton supprimer standalone en bas de page (remplacé par le menu)

---

## Feature 3: Modifier et supprimer les séances de course

### Objectif
Permettre de consulter le détail d'une course, la modifier, et la supprimer.

### Approche technique

#### Store
- Ajouter `updateRun(id: string, data: Partial<RunningLog>)` dans `runningStore.ts`
- Recalcule le `pace_per_km` si distance ou durée changent
- Met à jour l'objectif lié si applicable

#### Page détail
- Nouveau screen `app/(tabs)/sport/run-detail.tsx`
- Reçoit `id` en search param, charge la course depuis le store
- Affiche : date, distance, durée, allure, type, effort (dots visuels), notes
- Header avec bouton "more-vertical" → options "Modifier" / "Supprimer"
- "Supprimer" → `ConfirmModal` → `deleteRun(id)` → retour à la liste

#### Formulaire dual création/édition
- `add-run.tsx` accepte un query param optionnel `editId`
- Si `editId` est présent : charge la course, pré-remplit tous les champs, titre "Modifier la course", bouton "Enregistrer" appelle `updateRun`
- Si pas de `editId` : comportement actuel (création)

#### Liste cliquable
- Dans `running.tsx`, wrapper chaque `Card` dans un `Pressable` qui navigue vers `run-detail?id=X`

### Fichiers
- **Nouveau:** `app/(tabs)/sport/run-detail.tsx`
- **Modifié:** `app/(tabs)/sport/add-run.tsx` (mode édition)
- **Modifié:** `app/(tabs)/sport/running.tsx` (items cliquables)
- **Modifié:** `stores/runningStore.ts` (ajouter `updateRun`)

---

## Feature 4: Renommer l'app en "Life OS"

### Objectif
Renommer complètement l'application de "Life Tracker" à "Life OS".

### Changements
| Fichier | Champ | Avant | Après |
|---------|-------|-------|-------|
| `app.json` | `expo.name` | `life-tracker` | `Life OS` |
| `app.json` | `expo.slug` | `life-tracker` | `life-os` |
| `app.json` | `expo.scheme` | `lifetracker` | `lifeos` |
| `app.json` | `android.package` | `com.zoumoti.lifetracker` | `com.zoumoti.lifeos` |
| `package.json` | `name` | `life-tracker` | `life-os` |
| `lib/constants.ts` | `APP_NAME` | `"Life Tracker"` | `"Life OS"` |

### Note
Changement de package Android = nouvelle app. L'utilisateur doit désinstaller l'ancienne avant d'installer la nouvelle. Données Supabase non impactées (cloud), mais le cache local AsyncStorage sera perdu (re-login nécessaire).

---

## Feature 5: Date picker calendrier + heures début/fin pour les tâches

### Objectif
Remplacer le champ texte de date par un date picker natif avec bouton calendrier. Ajouter des champs optionnels heure de début et heure de fin.

### Approche technique

#### Dépendance
- `@react-native-community/datetimepicker` — pickers natifs Android

#### Types
Ajouter à `types/task.ts` :
```typescript
export interface Task {
  // ... existant ...
  start_time: string | null; // "HH:mm"
  end_time: string | null;   // "HH:mm"
}

export type TaskInput = {
  // ... existant ...
  start_time?: string | null;
  end_time?: string | null;
};
```

#### Base de données
Migration Supabase :
```sql
ALTER TABLE tasks ADD COLUMN start_time text;
ALTER TABLE tasks ADD COLUMN end_time text;
```

#### Formulaire (`TaskForm.tsx`)
- **Date :** Garder le `TextInput` en lecture seule + ajouter un bouton icône `calendar` à droite. Au tap → ouvre `DateTimePicker` mode "date". La sélection remplit le champ au format YYYY-MM-DD.
- **Horaires :** Sous le champ date, un bouton "+ Horaire" (texte discret). Au tap → révèle deux champs :
  - "Heure début" avec bouton icône `clock` → ouvre `DateTimePicker` mode "time"
  - "Heure fin" avec bouton icône `clock` → ouvre `DateTimePicker` mode "time"
  - Un bouton "x" pour masquer/effacer les horaires
- Les horaires restent cachés par défaut pour ne pas alourdir les tâches simples

#### Store (`taskStore.ts`)
- Passer `start_time` et `end_time` dans les appels Supabase insert/update
- Inclure les champs dans le fetch

#### Google Sync (`googleSync.ts`)
- Si `start_time` et `end_time` sont renseignés : créer un événement Google Calendar avec `dateTime` (pas `date` all-day)
- Si seul `due_date` sans heures : comportement actuel (événement journée entière)

### Fichiers
- **Modifié:** `components/tasks/TaskForm.tsx` (date picker + time pickers)
- **Modifié:** `types/task.ts` (nouveaux champs)
- **Modifié:** `stores/taskStore.ts` (gérer start_time/end_time)
- **Modifié:** `lib/googleSync.ts` (heures dans Calendar events)
- **Nouveau:** migration Supabase `supabase/migrations/XXXXXX_add_task_times.sql`

---

## Ordre d'implémentation recommandé

1. **Feature 4 — Renommage** (5 min, aucun risque, satisfaction immédiate)
2. **Feature 2 — CRUD Habitudes** (code quasi-prêt, petit scope)
3. **Feature 3 — CRUD Courses** (scope moyen, pattern similaire à Feature 2)
4. **Feature 5 — Date/time picker tâches** (nouvelle dépendance, migration DB)
5. **Feature 1 — Notifications workout** (la plus complexe, nouvelles dépendances, background tasks)

## Dépendances à installer
```bash
npx expo install expo-notifications expo-task-manager @react-native-community/datetimepicker
```
