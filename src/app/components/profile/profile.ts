import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';


interface Order {
  _id: string;
  date: Date;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    book: {
      _id: string;
      titulo: string;
      autor: string;
      preco: number;
      imagemUrl?: string;
    };
    quantity: number;
  }>;
}

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    TranslateModule,
    TranslateTitlePipe
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = signal(false);
  orders = signal<Order[]>([]);
  user = signal<any>(null);

  displayedColumns: string[] = ['date', 'items', 'total', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      birthDate: [''],
      address: this.fb.group({
        street: [''],
        number: [''],
        complement: [''],
        neighborhood: [''],
        city: [''],
        state: [''],
        zipCode: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]]
      })
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadOrders();
  }

  loadUserData() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.profileForm.patchValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        birthDate: currentUser.birthDate || '',
        address: currentUser.address || {}
      });
    }
  }

  loadOrders() {
    this.loading.set(true);
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          _id: '1',
          date: new Date('2024-01-15'),
          total: 89.90,
          status: 'delivered',
          items: [
            {
              book: {
                _id: '1',
                titulo: 'Norwegian Wood',
                autor: 'Haruki Murakami',
                preco: 45.90,
                imagemUrl: '/assets/images/books/norwegian-wood.jpg'
              },
              quantity: 1
            },
            {
              book: {
                _id: '2',
                titulo: 'Kafka à Beira-Mar',
                autor: 'Haruki Murakami',
                preco: 44.00,
                imagemUrl: '/assets/images/books/kafka.jpg'
              },
              quantity: 1
            }
          ]
        },
        {
          _id: '2',
          date: new Date('2024-01-20'),
          total: 67.80,
          status: 'shipped',
          items: [
            {
              book: {
                _id: '3',
                titulo: 'O Livro do Chá',
                autor: 'Kakuzo Okakura',
                preco: 32.90,
                imagemUrl: '/assets/images/books/livro-cha.jpg'
              },
              quantity: 2
            }
          ]
        }
      ];
      this.orders.set(mockOrders);
      this.loading.set(false);
    }, 1000);
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.loading.set(true);

      setTimeout(() => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.PROFILE_UPDATED_SUCCESS'),
          this.translate.instant('PROFILE.CLOSE'),
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }, 1500);
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      this.loading.set(true);

      setTimeout(() => {
        this.loading.set(false);
        this.passwordForm.reset();
        this.snackBar.open(
          this.translate.instant('PROFILE.PASSWORD_CHANGED_SUCCESS'),
          this.translate.instant('PROFILE.CLOSE'),
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }, 1500);
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  viewOrderDetails(order: Order) {
    console.log('Ver detalhes do pedido:', order);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warn',
      'processing': 'accent',
      'shipped': 'primary',
      'delivered': 'primary',
      'cancelled': 'warn'
    };
    return colors[status] || 'primary';
  }

  getStatusText(status: string): string {
    const statusKeys: { [key: string]: string } = {
      'pending': 'PROFILE.STATUS_PENDING',
      'processing': 'PROFILE.STATUS_PROCESSING',
      'shipped': 'PROFILE.STATUS_SHIPPED',
      'delivered': 'PROFILE.STATUS_DELIVERED',
      'cancelled': 'PROFILE.STATUS_CANCELLED'
    };
    return statusKeys[status] ? this.translate.instant(statusKeys[status]) : status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      this.profileForm.get('phone')?.setValue(value);
    }
  }

  formatZipCode(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
      this.profileForm.get('address.zipCode')?.setValue(value);
    }
  }

  getErrorMessage(field: string, form: FormGroup): string {
    const control = form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant('PROFILE.ERROR_REQUIRED');
      }
      if (control.errors['email']) {
        return this.translate.instant('PROFILE.ERROR_INVALID_EMAIL');
      }
      if (control.errors['minlength']) {
        return this.translate.instant('PROFILE.ERROR_MIN_LENGTH', {
          length: control.errors['minlength'].requiredLength
        });
      }
      if (control.errors['pattern']) {
        if (field === 'phone') {
          return this.translate.instant('PROFILE.ERROR_INVALID_PHONE');
        }
        if (field === 'zipCode') {
          return this.translate.instant('PROFILE.ERROR_INVALID_ZIP');
        }
      }
      if (control.errors['mismatch']) {
        return this.translate.instant('PROFILE.ERROR_PASSWORD_MISMATCH');
      }
    }
    return '';
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}