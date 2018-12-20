import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private _titleService: Title) {
      // set the page title
      this._titleService.setTitle('Knora User Interface | Research Layer');
  }

  ngOnInit() {
  }

}
