import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  standalone: true,
  imports: [MatButton, MatIcon, MatDivider],
})
export class CookiePolicyComponent {
  constructor(private _location: Location) {}

  goBack() {
    this._location.back();
  }
}
