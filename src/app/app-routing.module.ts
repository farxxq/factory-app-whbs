import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/auth/login/login.module').then((m) => m.LoginPageModule),
      }
    ],

  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/auth/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'polypack',
    children: [
      {
        path: '',
        loadChildren: () =>
          import(
            './pages/polypack/polypack-master/polypack-master.module'
          ).then((m) => m.PolypackMasterPageModule),
      },
      {
        path: 'add-polypack',
        loadChildren: () =>
          import('./pages/polypack/add-polypack/add-polypack.module').then(
            (m) => m.AddPolypackPageModule
          ),
      },
      {
        path: 'list-polypack',
        loadChildren: () =>
          import('./pages/polypack/list-polypack/list-polypack.module').then(
            (m) => m.ListPolypackPageModule
          ),
      },
      {
        path: 'map-polypack',
        loadChildren: () =>
          import('./pages/polypack/map-polypack/map-polypack.module').then(
            (m) => m.MapPolypackPageModule
          ),
      },
      {
        path: 'pomap-polypack',
        loadChildren: () => import('./pages/polypack/po-map-polypack/po-map-polypack.module').then(m => m.PoMapPolypackPageModule)
      },
    ],
  },
  {
    path: 'cartonpacking',
    children: [
      {
        path: '',
        loadChildren: () =>
          import(
            './pages/cartonpacking/cartonpacking-master/cartonpacking.module'
          ).then((m) => m.CartonpackingPageModule),
      },
      {
        path: 'garmentscan',
        loadChildren: () =>
          import(
            './pages/cartonpacking/cartonpacking-garmentscan/cartonpacking-garmentscan.module'
          ).then((m) => m.CartonpackingGarmentscanPageModule),
      },
      {
        path: 'cartonpack-details',
        loadChildren: () => import('./pages/cartonpacking/cartonpack-details/cartonpack-details.module').then(m => m.CartonpackDetailsPageModule)
      },
      {
        path: 'cartonpacking-recheck',
        loadChildren: () => import('./pages/cartonpacking/cartonpacking-recheck/cartonpacking-recheck.module').then(m => m.CartonpackingRecheckPageModule)
      },
    ],
  },
  {
    path: 'panelcheck',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/panelCheck/panelcheck-master/panelcheck-master.module').then(m => m.PanelcheckMasterPageModule)
      },
      {
        path: 'panelcheckaddpcs',
        loadChildren: () => import('./pages/panelCheck/panelcheck-add-pcs/panelcheck-add-pcs.module').then(m => m.PanelcheckAddPcsPageModule)
      },
      {
        path: 'panelcheckreplacepcs',
        loadChildren: () => import('./pages/panelCheck/panelcheck-replace-pcs/panelcheck-replace-pcs.module').then(m => m.PanelcheckReplacePcsPageModule)
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
