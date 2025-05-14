import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrl: './account-edit.component.scss',
  standalone: false
})
export class AccountEditComponent implements OnInit {

  ngOnInit() {
    console.log('Account Edit Component page loaded');
  }
}
