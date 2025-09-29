import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';


interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslateModule,
    TranslateTitlePipe
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  addressForm: FormGroup;
  paymentForm: FormGroup;

  loading = signal(false);
  currentStep = signal(0);
  orderCompleted = signal(false);

  cartItems = this.cartService.cartItems;
  totalItems = this.cartService.itemCount;
  subtotal = this.cartService.total;

  shippingOptions: ShippingOption[] = [];
  selectedShipping = signal<ShippingOption>({} as ShippingOption);

  paymentMethods: PaymentMethod[] = [];

  selectedPayment = signal<PaymentMethod>(this.paymentMethods[0]);

  installmentOptions = [
    { value: 1, label: '1x sem juros' },
    { value: 2, label: '2x sem juros' },
    { value: 3, label: '3x sem juros' },
    { value: 4, label: '4x com juros' },
    { value: 5, label: '5x com juros' },
    { value: 6, label: '6x com juros' }
  ];

  shippingCost = computed(() => {
    const shipping = this.selectedShipping();
    return this.subtotal() >= 100 ? 0 : shipping.price;
  });

  totalPrice = computed(() => this.subtotal() + this.shippingCost());

  constructor() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['credit', [Validators.required]],
      cardNumber: [''],
      cardName: [''],
      cardExpiry: [''],
      cardCvv: [''],
      installments: [1]
    });
  }

  ngOnInit(): void {
    this.shippingOptions = [
      {
        id: 'standard',
        name: this.translate.instant('CHECKOUT.SHIPPING_STANDARD'),
        price: 15.90,
        estimatedDays: this.translate.instant('CHECKOUT.SHIPPING_STANDARD_DAYS')
      },
      {
        id: 'express',
        name: this.translate.instant('CHECKOUT.SHIPPING_EXPRESS'),
        price: 25.90,
        estimatedDays: this.translate.instant('CHECKOUT.SHIPPING_EXPRESS_DAYS')
      },
      {
        id: 'premium',
        name: this.translate.instant('CHECKOUT.SHIPPING_PREMIUM'),
        price: 35.90,
        estimatedDays: this.translate.instant('CHECKOUT.SHIPPING_PREMIUM_DAYS')
      }
    ];
    this.selectedShipping.set(this.shippingOptions[0]);

    this.paymentMethods = [
      { id: 'credit', name: this.translate.instant('CHECKOUT.PAYMENT_CREDIT'), icon: 'credit_card' },
      { id: 'debit', name: this.translate.instant('CHECKOUT.PAYMENT_DEBIT'), icon: 'payment' },
      { id: 'pix', name: this.translate.instant('CHECKOUT.PAYMENT_PIX'), icon: 'qr_code' },
      { id: 'boleto', name: this.translate.instant('CHECKOUT.PAYMENT_BOLETO'), icon: 'receipt' }
    ];
    this.selectedPayment.set(this.paymentMethods[0]);

    if (this.cartItems().length === 0) {
      this.snackBar.open(
        this.translate.instant('CHECKOUT.EMPTY_CART'),
        this.translate.instant('CHECKOUT.CLOSE'),
        { duration: 3000 }
      );
      this.router.navigate(['/cart']);
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        this.translate.instant('CHECKOUT.LOGIN_REQUIRED'),
        this.translate.instant('CHECKOUT.LOGIN'),
        { duration: 4000 }
      ).onAction().subscribe(() => {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: '/checkout' }
        });
      });
      return;
    }

    this.prefillUserData();
  }

  private prefillUserData(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.addressForm.patchValue({
        fullName: user.name,
        email: user.email
      });
    }
  }

  onShippingChange(shipping: ShippingOption): void {
    this.selectedShipping.set(shipping);
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.selectedPayment.set(method);

    this.updatePaymentValidators(method.id);
  }

  selectPaymentMethod(methodId: string): void {
    const method = this.paymentMethods.find(p => p.id === methodId);
    if (method) {
      this.onPaymentMethodChange(method);
    }
  }

  selectShippingOption(optionId: string): void {
    const option = this.shippingOptions.find(s => s.id === optionId);
    if (option) {
      this.onShippingChange(option);
    }
  }

  private updatePaymentValidators(paymentMethod: string): void {
    const cardNumber = this.paymentForm.get('cardNumber');
    const cardName = this.paymentForm.get('cardName');
    const cardExpiry = this.paymentForm.get('cardExpiry');
    const cardCvv = this.paymentForm.get('cardCvv');

    cardNumber?.clearValidators();
    cardName?.clearValidators();
    cardExpiry?.clearValidators();
    cardCvv?.clearValidators();

    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]);
      cardName?.setValidators([Validators.required, Validators.minLength(3)]);
      cardExpiry?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
      cardCvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    }

    cardNumber?.updateValueAndValidity();
    cardName?.updateValueAndValidity();
    cardExpiry?.updateValueAndValidity();
    cardCvv?.updateValueAndValidity();
  }

  nextStep(): void {
    if (this.currentStep() === 0 && this.addressForm.valid) {
      this.currentStep.set(1);
    } else if (this.currentStep() === 1 && this.paymentForm.valid) {
      this.currentStep.set(2);
    } else {
      this.markFormGroupTouched(this.currentStep() === 0 ? this.addressForm : this.paymentForm);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  completeOrder(): void {
    if (!this.addressForm.valid || !this.paymentForm.valid) {
      this.snackBar.open(
        this.translate.instant('CHECKOUT.CHECK_DATA'),
        this.translate.instant('CHECKOUT.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.orderCompleted.set(true);
      this.cartService.clearCart();

      this.snackBar.open(
        this.translate.instant('CHECKOUT.ORDER_SUCCESS'),
        this.translate.instant('CHECKOUT.CLOSE'),
        { duration: 5000 }
      );

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }, 2000);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);
    if (control?.hasError('required')) {
      return this.translate.instant('CHECKOUT.ERROR_REQUIRED');
    }
    if (control?.hasError('email')) {
      return this.translate.instant('CHECKOUT.ERROR_INVALID_EMAIL');
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return this.translate.instant('CHECKOUT.ERROR_MIN_LENGTH', { length: requiredLength });
    }
    if (control?.hasError('pattern')) {
      return this.translate.instant('CHECKOUT.ERROR_INVALID_FORMAT');
    }
    return '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = value;
    this.paymentForm.patchValue({ cardNumber: value });
  }

  formatCardExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentForm.patchValue({ cardExpiry: value });
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    event.target.value = value;
    this.addressForm.patchValue({ phone: value });
  }

  formatZipCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    event.target.value = value;
    this.addressForm.patchValue({ zipCode: value });
  }

  refreshOrderSummary(): void {
    const cartSnapshot = this.cartService.getCartSnapshot();
    console.log('Order summary refreshed:', cartSnapshot);
  }
}