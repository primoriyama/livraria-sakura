import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslateModule,
  ],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent {
  private translate = inject(TranslateService);

  values = [
    {
      icon: 'auto_stories',
      titleKey: 'ABOUT.VALUES.READING_PASSION.TITLE',
      descriptionKey: 'ABOUT.VALUES.READING_PASSION.DESCRIPTION'
    },
    {
      icon: 'diversity_3',
      titleKey: 'ABOUT.VALUES.CULTURAL_DIVERSITY.TITLE',
      descriptionKey: 'ABOUT.VALUES.CULTURAL_DIVERSITY.DESCRIPTION'
    },
    {
      icon: 'verified',
      titleKey: 'ABOUT.VALUES.GUARANTEED_QUALITY.TITLE',
      descriptionKey: 'ABOUT.VALUES.GUARANTEED_QUALITY.DESCRIPTION'
    },
    {
      icon: 'favorite',
      titleKey: 'ABOUT.VALUES.HUMANIZED_SERVICE.TITLE',
      descriptionKey: 'ABOUT.VALUES.HUMANIZED_SERVICE.DESCRIPTION'
    }
  ];

  stats = [
    { number: '10.000+', labelKey: 'ABOUT.STATS.BOOKS_AVAILABLE' },
    { number: '5.000+', labelKey: 'ABOUT.STATS.SATISFIED_CUSTOMERS' },
    { number: '15+', labelKey: 'ABOUT.STATS.YEARS_EXPERIENCE' },
    { number: '50+', labelKey: 'ABOUT.STATS.PARTNER_PUBLISHERS' }
  ];
}