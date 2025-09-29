import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService, User } from '../../../services/user.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  filteredUsers = signal<User[]>([]);

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];

  private translateService = inject(TranslateService);

  constructor(
    private userService: UserService,
    private confirmDialog: ConfirmDialogService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.filteredUsers.set(response.users);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Erro ao carregar usuários:', error);
        this.snackBar.open(
          this.translateService.instant('SNACKBAR.ERROR_LOADING_USERS'), 
          this.translateService.instant('SNACKBAR.CLOSE'), 
          { duration: 3000 }
        );
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.users().filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
  }

  navigateToAddUser(): void {
    this.router.navigate(['/admin/register-user']);
  }

  toggleUserStatus(user: User): void {
    const isDeactivating = user.isActive;
    const titleKey = isDeactivating ? 'USER_ACTIONS.CONFIRM_DEACTIVATE' : 'USER_ACTIONS.CONFIRM_ACTIVATE';
    const messageKey = isDeactivating ? 'USER_ACTIONS.DEACTIVATE_MESSAGE' : 'USER_ACTIONS.ACTIVATE_MESSAGE';
    
    this.confirmDialog.confirm({
      title: this.translateService.instant(titleKey),
      message: this.translateService.instant(messageKey, { name: user.name }),
      confirmText: this.translateService.instant('DIALOG.CONFIRM'),
      cancelText: this.translateService.instant('DIALOG.CANCEL')
    }).subscribe(confirmed => {
      if (confirmed) {
        this.userService.toggleUserStatus(user._id).subscribe({
          next: () => {
            this.loadUsers();
            const successKey = isDeactivating ? 'SNACKBAR.USER_DEACTIVATED_SUCCESS' : 'SNACKBAR.USER_ACTIVATED_SUCCESS';
            this.snackBar.open(
              this.translateService.instant(successKey), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          },
          error: (error: any) => {
            console.error('Erro ao atualizar status do usuário:', error);
            const errorKey = isDeactivating ? 'SNACKBAR.ERROR_DEACTIVATE_USER' : 'SNACKBAR.ERROR_ACTIVATE_USER';
            this.snackBar.open(
              this.translateService.instant(errorKey), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  toggleUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const translatedRole = this.translateService.instant(newRole === 'admin' ? 'ADMIN.ADMINISTRATOR' : 'ADMIN.USER');
    
    this.confirmDialog.confirm({
      title: this.translateService.instant('USER_ACTIONS.CHANGE_ROLE_TITLE'),
      message: this.translateService.instant('USER_ACTIONS.CHANGE_ROLE_MESSAGE', { 
        name: user.name, 
        role: translatedRole 
      }),
      confirmText: this.translateService.instant('DIALOG.CONFIRM'),
      cancelText: this.translateService.instant('DIALOG.CANCEL')
    }).subscribe(confirmed => {
      if (confirmed) {
        this.userService.toggleUserRole(user._id).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open(
              this.translateService.instant('SNACKBAR.ROLE_CHANGED_SUCCESS'), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          },
          error: (error: any) => {
            console.error('Erro ao alterar função do usuário:', error);
            this.snackBar.open(
              this.translateService.instant('SNACKBAR.ERROR_CHANGE_ROLE'), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    this.confirmDialog.confirm({
      title: this.translateService.instant('USER_ACTIONS.DELETE_USER_TITLE'),
      message: this.translateService.instant('USER_ACTIONS.DELETE_USER_MESSAGE', { name: user.name }),
      confirmText: this.translateService.instant('DIALOG.DELETE'),
      cancelText: this.translateService.instant('DIALOG.CANCEL')
    }).subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open(
              this.translateService.instant('SNACKBAR.USER_DELETED_SUCCESS'), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          },
          error: (error: any) => {
            console.error('Erro ao excluir usuário:', error);
            this.snackBar.open(
              this.translateService.instant('SNACKBAR.ERROR_DELETE_USER'), 
              this.translateService.instant('SNACKBAR.CLOSE'), 
              { duration: 3000 }
            );
          }
        });
      }
    });
  }
}