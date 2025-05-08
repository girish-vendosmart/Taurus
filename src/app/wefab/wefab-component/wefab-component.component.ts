import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../wefab-shared-component/navigation-bar/navigation-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wefab-component',
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, CommonModule],
  templateUrl: './wefab-component.component.html',
  styleUrl: './wefab-component.component.scss'
})
export class WefabComponentComponent {

}
