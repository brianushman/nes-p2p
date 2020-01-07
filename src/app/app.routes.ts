import { Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { GameModeSelectComponent } from "./setup/game-mode-select/game-mode-select.component";
import { OfflineLobbyComponent } from "./setup/offline-lobby/offline-lobby.component";
import { LobbyComponent } from "./setup/lobby/lobby.component";
import { PlayGameComponent } from "./play/play-game/play-game.component";
import { AboutComponent } from "./about/about.component";

export const ROUTES:Routes = [
  // Main redirect
  {path: '', redirectTo: 'home', pathMatch: 'full'},

  {
    path: '', component: GameModeSelectComponent,
    children: [
      {path: 'home', component: GameModeSelectComponent}
    ]
  },
  {
    path: 'offline-lobby', component: OfflineLobbyComponent,
    children: [
      {path: 'offline-lobby', component: OfflineLobbyComponent}
    ]
  },
  {
    path: 'lobby', component: LobbyComponent,
    children: [
      {path: 'lobby', component: LobbyComponent}
    ]
  },
  {
    path: 'play-game', component: PlayGameComponent,
    children: [
      {path: 'play-game', component: PlayGameComponent}
    ]
  },
  {
    path: 'about', component: AboutComponent,
    children: [
      {path: 'about', component: AboutComponent}
    ]
  },

  // Handle all other routes
  {path: '**',  redirectTo: 'home'}
];
