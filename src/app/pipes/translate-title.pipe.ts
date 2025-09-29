import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateTitle',
  standalone: true,
  pure: false // Permite que o pipe seja executado novamente quando as traduções mudarem
})
export class TranslateTitlePipe implements PipeTransform {

  constructor(
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {}

  transform(title: string): string {
    if (!title) return '';
    
    // Aguarda o carregamento das traduções
    if (!this.translateService.currentLang) {
      return title; // Retorna o título original enquanto carrega
    }
    
    const translatedTitle = this.translationService.translateBookTitle(title);
    return translatedTitle;
  }
}