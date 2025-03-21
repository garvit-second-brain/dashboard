import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { errorMessages } from '../../assets/errorMessages';

declare function userCheck(data: any): any;

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css'],
})
export class CustomerdetailsComponent implements OnInit {
  isVerticalLineVisible: boolean = true;
  downloading: boolean = false;

  profileID: any = '';
  groupID: any;
  containsData: number = 0;
  indexId: string = '';

  profileDetailsData: {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fax: string;
    company: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    createdAt: string;
    updatedAt: string;
    refKey1: string;
    refKey2: string;
    cardType: string;
    cardNumber: string;
    accountType: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    paymentType: string;
    expirationMonth: string;
    expirationYear: string;
    vendor: string;
    isActive: string;
    siteCode: string;
    country: string;
    merchantId: string;
    operationId: string;
    errorCode: string;
    errorMessage: string;
    operationText: string;
    operationCode: string;
  } = {
    profileId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fax: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    createdAt: '',
    updatedAt: '',
    refKey1: '',
    refKey2: '',
    cardType: '',
    cardNumber: '',
    accountType: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    paymentType: '',
    expirationMonth: '',
    expirationYear: '',
    vendor: '',
    isActive: '',
    siteCode: '',
    country: '',
    merchantId: '',
    operationId: '',
    errorCode: '',
    errorMessage: '',
    operationText: '',
    operationCode: '',
  };

  syncData: {
    responseMessageDb: string;
    responseMessageOpensearch: string;
    vendorResponseMessage: string;
  } = {
    responseMessageDb: '',
    responseMessageOpensearch: '',
    vendorResponseMessage: '',
  };

  constructor(
    private route: ActivatedRoute,
    private service: DashboardService,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isVerticalLineVisible = window.innerWidth >= 768;
  }

  ngOnInit(): void {
    let username = this.cookieService.get('username');
    userCheck(username);
    let userStatus = this.cookieService.get('userStatus');
    if (userStatus) {
      if (window.location.href.includes('customer')) {
        document.getElementById('customers')?.classList.add('nav-active');
        document.getElementById('payments')?.classList.remove('nav-active');
      }
      this.queryParams();
      this.getCustomerDetails();
    } else {
      Swal.fire(errorMessages.userNotVerified);
      setTimeout(() => {
        let res = this.service.logoutUser();
        window.location.href = '/login';
      }, 4000);
    }
  }

  queryParams() {
    this.route.queryParamMap.subscribe(
      async (queryParams: { get: (arg0: string) => any }) => {
        this.profileID =
          queryParams.get('proID') || this.profileDetailsData.profileId;
        this.groupID = queryParams.get('grpID');
        this.indexId = queryParams.get('indexID');
      }
    );
  }

  responseContainsData() {
    return Object.keys(this.profileDetailsData).length;
  }

  sync() {
    this.queryParams();

    this.downloading = true;
    Swal.fire({
      title: 'Syncing data...',
      text: '',
      icon: 'info',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
    });
    this.service.syncCustomer(this.profileID).subscribe({
      next: (data: any) => {
        this.downloading = false;
        this.syncData = data;

        if (this.syncData.vendorResponseMessage === 'success') {
          Swal.fire('Profile synced successfully').then(() => {
            this.getCustomerDetails();
          });
        } else {
          Swal.fire(
            `Customer profile not synced; ${this.syncData.vendorResponseMessage}`
          ).then(() => {
            this.getCustomerDetails();
          });
        }
      },

      error: (error: any) => {
        this.downloading = false;
        Swal.fire(error.error.message);
      },
    });
  }

  getCustomerDetails() {
    document.getElementById('loader')?.classList.remove('hideloader');
    document.getElementById('overlay')?.classList.remove('hideloader');
    this.service
      .getCustomerProfileDetails(this.profileID, this.indexId)
      .subscribe({
        next: (data: any) => {
          document.getElementById('loader')?.classList.add('hideloader');
          document.getElementById('overlay')?.classList.add('hideloader');
          this.profileDetailsData = data;

          this.containsData = this.responseContainsData();
          if (!this.containsData) {
            this.toastr.error(errorMessages.noDataFound);
          }
        },
        error: (error: any) => {
          document.getElementById('loader')?.classList.add('hideloader');
          document.getElementById('overlay')?.classList.add('hideloader');
          this.toastr.error(error.error.message);
          if (error.error.message.endsWith('expired')) {
            let res = this.service.logoutUser();
            window.location.href = '/login';
          }
        },
      });
  }
}
