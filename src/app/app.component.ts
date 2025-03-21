import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from './dashboard.service';

declare function userCheck(event: any, data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  backendApiUrl: any;

  activeUrl: string = '';

  showHead: boolean = false;
  logincheckflag: any;
  id_token: any;
  auth0code: any;
  loginauth0tokendata: any;
  selectedvendorItems = new Array();
  userdata: any;
  userDashboard: boolean = false;

  title(title: any) {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    let userRole = this.cookieService.get('userRole');
    updateUserRole(userRole);
  }

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private service: DashboardService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (
          this.cookieService.get('organization') === 'global_auth' &&
          this.cookieService.get('id_token') &&
          event['url'] != '/login' &&
          event['url'] != '/manageCustomers'
        ) {
          window.location.href = '/manageCustomers';
          this.showHead = true;
          this.userDashboard = false;
          let url = event['url'].replace('/', '');
          this.activeUrl = url;
        } else if (event['url'] == '/login') {
          this.showHead = false;
        } else if (event['url'] == '/manageCustomers') {
          this.showHead = true;
          this.userDashboard = false;
          let url = event['url'].replace('/', '');
          this.activeUrl = url;
        } else {
          this.userDashboard = true;
          if (event['url'] == '/login' || event['url'] == '/login') {
            window.location.href = '/dashboard';
          }
          this.showHead = true;
          if (event['url'] != '/login') {
            let url = event['url'].replace('/', '');
            this.activeUrl = url;
          }
        }
      }
    });
  }

  logout() {
    let res = this.service.logoutUser();

    window.location.href = '/login';
  }
}
