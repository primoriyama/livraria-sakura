import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '400px',
        maxWidth: '90vw',
        data,
        disableClose: true,
        autoFocus: false,
        restoreFocus: true
      }
    );

    return dialogRef.afterClosed();
  }

  confirmDelete(itemName?: string): Observable<boolean> {
    const message = itemName
      ? this.translate.instant('DIALOG.CONFIRM_DELETE_ITEM', { item: itemName })
      : this.translate.instant('DIALOG.CONFIRM_DELETE_GENERIC');

    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.CONFIRM_DELETE'),
      message,
      confirmText: this.translate.instant('DIALOG.DELETE'),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: 'danger',
      icon: 'delete'
    });
  }

  confirmRemoveFromCart(itemName?: string): Observable<boolean> {
    const message = itemName
      ? this.translate.instant('DIALOG.CONFIRM_REMOVE_ITEM', { item: itemName })
      : this.translate.instant('DIALOG.CONFIRM_REMOVE_GENERIC');

    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.REMOVE_FROM_CART'),
      message,
      confirmText: this.translate.instant('DIALOG.REMOVE'),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: 'warning',
      icon: 'remove_shopping_cart'
    });
  }

  confirmClearCart(): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.CLEAR_CART'),
      message: this.translate.instant('DIALOG.CONFIRM_CLEAR_CART'),
      confirmText: this.translate.instant('DIALOG.CLEAR'),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: 'warning',
      icon: 'clear_all'
    });
  }

  confirmLogout(): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.LOGOUT'),
      message: this.translate.instant('DIALOG.CONFIRM_LOGOUT'),
      confirmText: this.translate.instant('DIALOG.LOGOUT'),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: 'info',
      icon: 'logout'
    });
  }

  confirmCancelOrder(orderNumber?: string): Observable<boolean> {
    const message = orderNumber
      ? this.translate.instant('DIALOG.CONFIRM_CANCEL_ORDER_NUMBER', { orderNumber })
      : this.translate.instant('DIALOG.CONFIRM_CANCEL_ORDER');

    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.CANCEL_ORDER'),
      message,
      confirmText: this.translate.instant('DIALOG.CANCEL_ORDER'),
      cancelText: this.translate.instant('DIALOG.KEEP_ORDER'),
      type: 'warning',
      icon: 'cancel'
    });
  }

  confirmUnsavedChanges(): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('DIALOG_TITLES.UNSAVED_CHANGES'),
      message: this.translate.instant('DIALOG.CONFIRM_UNSAVED_CHANGES'),
      confirmText: this.translate.instant('DIALOG.EXIT_WITHOUT_SAVING'),
      cancelText: this.translate.instant('DIALOG.CONTINUE_EDITING'),
      type: 'warning',
      icon: 'warning'
    });
  }

  confirmToggleUserStatus(userName: string, isActive: boolean): Observable<boolean> {
    const messageKey = isActive ? 'DIALOG.CONFIRM_DEACTIVATE_USER' : 'DIALOG.CONFIRM_ACTIVATE_USER';
    const titleKey = isActive ? 'DIALOG_TITLES.DEACTIVATE_USER' : 'DIALOG_TITLES.ACTIVATE_USER';
    const confirmKey = isActive ? 'DIALOG.DEACTIVATE' : 'DIALOG.ACTIVATE';

    return this.confirm({
      title: this.translate.instant(titleKey),
      message: this.translate.instant(messageKey, { userName }),
      confirmText: this.translate.instant(confirmKey),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: isActive ? 'warning' : 'info',
      icon: isActive ? 'person_off' : 'person'
    });
  }

  confirmToggleBookAvailability(bookTitle: string, isAvailable: boolean): Observable<boolean> {
    const messageKey = isAvailable ? 'DIALOG.CONFIRM_MAKE_UNAVAILABLE' : 'DIALOG.CONFIRM_MAKE_AVAILABLE';
    const titleKey = 'DIALOG_TITLES.TOGGLE_BOOK_AVAILABILITY';
    const confirmKey = isAvailable ? 'DIALOG.MAKE_UNAVAILABLE' : 'DIALOG.MAKE_AVAILABLE';

    return this.confirm({
      title: this.translate.instant(titleKey),
      message: this.translate.instant(messageKey, { bookTitle }),
      confirmText: this.translate.instant(confirmKey),
      cancelText: this.translate.instant('DIALOG.CANCEL'),
      type: isAvailable ? 'warning' : 'info',
      icon: isAvailable ? 'visibility_off' : 'visibility'
    });
  }
}