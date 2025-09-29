import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    TranslateModule   
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'livraria-sakura';
}
