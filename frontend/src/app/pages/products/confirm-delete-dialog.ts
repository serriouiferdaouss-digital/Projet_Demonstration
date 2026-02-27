import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'DIALOG.CONFIRM_DELETE_TITLE' | translate }}</h2>

    <div mat-dialog-content>
      {{ 'DIALOG.CONFIRM_DELETE_MSG' | translate }}
      <div style="margin-top: 8px; opacity: 0.8">
        <b>{{ data.name }}</b>
      </div>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">{{ 'DIALOG.CANCEL' | translate }}</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        {{ 'DIALOG.DELETE' | translate }}
      </button>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}