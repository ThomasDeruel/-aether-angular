import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'li[benefitcard],div[benefitcard]',
  imports: [MatIconModule],
  templateUrl: './benefitcard.html',
  styleUrl: './benefitcard.css',
})
export class Benefitcard {
  icon = input('');
}
