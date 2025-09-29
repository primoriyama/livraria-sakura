import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then(m => m.HomeComponent)
  },

  {
    path: 'book/:id',
    loadComponent: () => import('./components/book-details/book-details').then(m => m.BookDetailsComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },

  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart').then(m => m.CartComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'about',
    loadComponent: () => import('./components/about/about').then(m => m.AboutComponent)
  },

  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'add-book',
        loadComponent: () => import('./components/admin/book-form/book-form').then(m => m.BookFormComponent)
      },
      {
        path: 'edit-book/:id',
        loadComponent: () => import('./components/admin/book-form/book-form').then(m => m.BookFormComponent)
      },
      {
        path: 'register-user',
        loadComponent: () => import('./components/admin/user-form/user-form').then(m => m.UserFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/user-list/user-list').then(m => m.UserListComponent)
      }
    ]
  },

  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found').then(m => m.NotFoundComponent)
  }
];
