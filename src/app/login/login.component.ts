import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { errorMessages } from 'src/assets/errorMessages';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  logincheckflag: any;
  errorMessage: any;
  loginauth0url: any;
  email: any;
  organization: any;
  isLoading: boolean = false;

  constructor(
    private service: DashboardService,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    document.getElementById('hideloader')?.classList.add('hideloader');
  }

  blurbg() {
    document
      .getElementById('gradient-custom')
      ?.classList.add('gradient-custom');
  }

  removeblur() {
    document
      .getElementById('gradient-custom')
      ?.classList.remove('gradient-custom');
  }

  verifyUser() {
    this.isLoading = true;
    let verifyUser = this.service.verifyUser(this.email, this.organization);
    verifyUser.subscribe(
      (data: any) => {
        this.cookieService.set('organization', this.organization, 1);
        if (data.message == 'success') {
          this.loginauth0url = data.url;
          window.location.href = this.loginauth0url;
        } else {
          this.toastr.error(errorMessages.userNotVerified);
        }
        this.isLoading = false;
      },
      (error: any) => {
        this.errorMessage = error;
        if (error.status === 404) {
          this.toastr.error(errorMessages[404]);
        } else if (error.status === 502 || error.status === 0) {
          this.toastr.error(errorMessages[502]);
        } else if (error.status === 500) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error(error.error.message);
        }
        this.isLoading = false;
      }
    );
  }
}
