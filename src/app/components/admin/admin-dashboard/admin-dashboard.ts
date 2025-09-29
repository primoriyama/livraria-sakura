import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

import { UserService, UserStats } from '../../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  userStats = signal<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0
  });

  bookStats = {
    totalBooks: 156,
    lowStockBooks: 12
  };

  isLoading = signal<boolean>(false);

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.isLoading.set(true);
    
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.isLoading.set(false);
      }
    });
  }

  refreshStats(): void {
    this.loadUserStats();
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToAddUser(): void {
    this.router.navigate(['/admin/register-user']);
  }

  navigateToAddBook(): void {
    this.router.navigate(['/admin/add-book']);
  }
}