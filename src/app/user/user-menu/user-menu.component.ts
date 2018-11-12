import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../../main/declarations/menu-item';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

    userName: string;

    items: MenuItem[] = [
        {
            label: 'Projects',
            route: '/projects',
            icon: 'assignment'
        },
        {
            label: 'Collections',
            route: '/collections',
            icon: 'bookmark_outline'
        },
        {
            label: 'Profile',
            route: '/user/',
            icon: 'fingerprint'
        },
        {
            label: 'Account',
            route: '/account',
            icon: 'settings'
        }
    ];


    constructor() {
    }

    ngOnInit() {
        this.userName = JSON.parse(localStorage.getItem('session')).user.name;
        const userEncoded = encodeURIComponent(this.userName);
        this.items[2].route += this.userName;
    }

}
