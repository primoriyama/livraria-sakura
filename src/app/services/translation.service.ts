import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translateService: TranslateService) {}

  translateBookTitle(originalTitle: string): string {
    const currentLang = this.translateService.currentLang || 'pt';

    const translationKey = `BOOK_TITLES.${originalTitle}`;
    const translation = this.translateService.instant(translationKey);

    if (translation && translation !== translationKey) {
      return translation;
    }

    return originalTitle;
  }

  hasTranslation(originalTitle: string, lang?: string): boolean {
    const targetLang = lang || this.translateService.currentLang || 'pt';
    const translationKey = `BOOK_TITLES.${originalTitle}`;
    const translation = this.translateService.instant(translationKey);
    return translation && translation !== translationKey;
  }
}
