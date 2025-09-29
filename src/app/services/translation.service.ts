import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translateService: TranslateService) {}

  /**
   * Traduz o título de um livro baseado no idioma atual
   * @param originalTitle Título original (pode estar em português ou inglês)
   * @returns Título traduzido ou original se não houver tradução
   */
  translateBookTitle(originalTitle: string): string {
    const currentLang = this.translateService.currentLang || 'pt';
    
    // Busca tradução no arquivo JSON usando o TranslateService
    const translationKey = `BOOK_TITLES.${originalTitle}`;
    const translation = this.translateService.instant(translationKey);
    
    // Se a tradução existe e é diferente da chave, retorna a tradução
    if (translation && translation !== translationKey) {
      return translation;
    }
    
    // Se não encontrar tradução, retorna o título original
    return originalTitle;
  }

  /**
   * Verifica se existe tradução para um título
   * @param originalTitle Título original
   * @param lang Idioma (opcional, usa o atual se não especificado)
   * @returns true se existe tradução
   */
  hasTranslation(originalTitle: string, lang?: string): boolean {
    const targetLang = lang || this.translateService.currentLang || 'pt';
    const translationKey = `BOOK_TITLES.${originalTitle}`;
    const translation = this.translateService.instant(translationKey);
    return translation && translation !== translationKey;
  }
}