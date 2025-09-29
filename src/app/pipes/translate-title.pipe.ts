import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateTitle',
  standalone: true,
  pure: false
})
export class TranslateTitlePipe implements PipeTransform {

  constructor(
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {}

  transform(title: string): string {
    if (!title) return '';

    if (!this.translateService.currentLang) {
      return title; 
    }

    const translatedTitle = this.translationService.translateBookTitle(title);
    return translatedTitle;
  }
}