# Life OS — Android Home Screen Widget

## Overview

Add interactive Android home screen widgets to Life OS using `react-native-android-widget` with its Expo config plugin. The widgets display key app data (habits, tasks, sport stats, finances, objectives) and allow completing habits directly from the home screen.

## Tech Stack

- **Library**: `react-native-android-widget` (Expo config plugin included)
- **Data bridge**: Android SharedPreferences for app ↔ widget data sync
- **Platform**: Android only
- **Theme**: Light mode only, matching app's light theme DA

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Surface | `#FFFFFF` | Widget background |
| Background | `#F5F3EF` | Sub-sections, stat cards |
| Border | `#E0DDD7` | Card borders, dividers |
| Text Primary | `#1a1608` | Main text |
| Text Secondary | `#6b6560` | Labels, muted text |
| Text Muted | `#9a9590` | Completed/strikethrough |
| Gold Primary | `#D4AA40` | Accent, section labels |
| Gold Dark | `#B8922E` | Secondary accent |
| Success | `#22c55e` | Completed habits |
| Danger | `#ef4444` | Negative finance |
| Border Radius Card | `14px` | Widget container |
| Border Radius Element | `10px` | Habit icons, stat cards |

## Widget Sizes

### Small (4×1) — Read-only summary

**Content:**
- App icon + "Life OS" label
- Habit progress counter (e.g., "4/7")
- Today's remaining tasks count
- Weekly running distance (km)

**Interactions:**
- Tap anywhere → opens the app

**Dimensions:** `minWidth: 250dp`, `minHeight: 50dp`

### Medium (4×2) — Interactive habits

**Content:**
- Header: app icon + "Life OS" + habit counter
- Habit grid: today's habits as tappable icons (emoji + completion state)
  - Completed: green border `#22c55e`, light green background
  - Pending: gray border `#E0DDD7`, `#F5F3EF` background
- Stats row (3 cards): weekly running km, weekly workout count, today's task count

**Interactions:**
- Tap a habit icon → toggles completion (immediate visual feedback + Supabase sync)
- Tap header/stats → opens the app

**Dimensions:** `minWidth: 250dp`, `minHeight: 110dp`

### Large (4×4) — Full dashboard

**Content:**
- Header: app icon + "Life OS" + date
- Habits section: label "HABITUDES — X/Y" + tappable habit grid (same as medium)
- Tasks section: label "TACHES DU JOUR" + list of today's tasks (completed shown with strikethrough)
  - Max 3 tasks displayed, overflow shows "+N more"
- Stats row: weekly running km, weekly workout count, monthly finance balance
- Objective card: name + progress bar + current/target values
  - Shows the objective with the nearest deadline, or the first one if no deadlines

**Interactions:**
- Tap a habit icon → toggles completion
- Tap tasks section → opens app on tasks tab
- Tap stats → opens app on corresponding tab
- Tap objective → opens app on objectives tab

**Dimensions:** `minWidth: 250dp`, `minHeight: 250dp`

## Architecture

### Data Flow

```
App (Zustand stores) → SharedPreferences JSON → Widget (reads on render)
Widget (habit tap) → SharedPreferences update → Widget refresh → Supabase background sync
App (next open) → SharedPreferences → Zustand resync
```

### SharedPreferences Data Schema

A single JSON object stored under key `lifeos_widget_data`. The `habits` array contains only today's habits (filtered by frequency/schedule), not the full habit list:

```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Meditation",
      "icon": "🧘",
      "completed": false
    }
  ],
  "tasks": [
    {
      "id": "uuid",
      "title": "Preparer reunion",
      "completed": false
    }
  ],
  "stats": {
    "weeklyRunKm": 12.3,
    "weeklyWorkoutCount": 3,
    "todayTaskCount": 2,
    "monthlyBalance": -230
  },
  "objective": {
    "name": "Courir un semi-marathon",
    "current": 13.7,
    "target": 21.1,
    "unit": "km",
    "deadline": "2026-06-15"
  },
  "lastUpdated": "2026-04-16T10:30:00Z"
}
```

### Sync Strategy

**App → Widget:**
- On every habit toggle, task change, or relevant store update, serialize the widget data to SharedPreferences
- Call `requestWidgetUpdate()` to force an immediate widget refresh
- On app launch, always write fresh data to SharedPreferences

**Widget → App:**
- On habit tap, update SharedPreferences directly and trigger widget re-render
- Queue a Supabase sync call via the widget task handler (runs in background)
- On next app open, the app reads SharedPreferences to reconcile any widget-side changes

**Periodic refresh:**
- Configure `updatePeriodMillis: 1800000` (30 minutes) in the widget config plugin
- This handles cases where the app updated data but couldn't notify the widget

### File Structure

```
life-tracker/
├── widgets/
│   ├── SmallWidget.tsx        # Small widget component
│   ├── MediumWidget.tsx       # Medium widget component
│   ├── LargeWidget.tsx        # Large widget component
│   ├── WidgetTaskHandler.ts   # Click handler + Supabase sync
│   └── shared/
│       ├── widgetData.ts      # SharedPreferences read/write helpers
│       ├── widgetStyles.ts    # Design tokens & shared styles
│       └── widgetSync.ts      # App-side sync (write to SharedPreferences on store changes)
├── app.json                   # Add widget plugin config
└── stores/
    └── habitStore.ts          # Add SharedPreferences write on toggle
```

### Expo Config Plugin

In `app.json`, add the widget definitions:

```json
{
  "plugins": [
    ["react-native-android-widget", {
      "widgets": [
        {
          "name": "LifeOSSmall",
          "label": "Life OS - Résumé",
          "minWidth": "250dp",
          "minHeight": "50dp",
          "description": "Résumé rapide: habitudes, tâches, sport",
          "updatePeriodMillis": 1800000
        },
        {
          "name": "LifeOSMedium",
          "label": "Life OS - Habitudes",
          "minWidth": "250dp",
          "minHeight": "110dp",
          "description": "Habitudes interactives + stats semaine",
          "updatePeriodMillis": 1800000,
          "resizeMode": "horizontal|vertical"
        },
        {
          "name": "LifeOSLarge",
          "label": "Life OS - Dashboard",
          "minWidth": "250dp",
          "minHeight": "250dp",
          "description": "Dashboard complet: habitudes, tâches, sport, finances, objectifs",
          "updatePeriodMillis": 1800000,
          "resizeMode": "horizontal|vertical"
        }
      ]
    }]
  ]
}
```

## Out of Scope

- Dark mode widget (light only)
- Widget configuration screen (no user-selectable sections)
- Task completion from widget (habits only)
- Real-time sync (periodic 30min + immediate on interaction)
- iOS widgets
- Finance transaction details (only monthly balance shown)
