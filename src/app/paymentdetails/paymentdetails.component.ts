import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

declare function userCheck(data: any): any;

@Component({
  selector: 'app-paymentdetails',
  templateUrl: './paymentdetails.component.html',
  styleUrls: ['./paymentdetails.component.css'],
})
export class PaymentdetailsComponent implements OnInit {
  isVerticalLineVisible: boolean = true;

  userType: any;
  profileDetailsData: any;
  containsData: number = 0;

  paymentDetailsData: {
    status: string;
    createdDate: string;
    updatedDate: string;
    operationType: string;
    profileId: string;
    paymentType: string;
    taxAmount: string;
    transAmount: string;
    transType: string;
    vendor: string;
    siteCode: string;
    taxDesc: string;
    approvalCode: string;
    approvalMsg: string;
    avsResponse: string;
    cscResponse: string;
    groupId: string;
    auLastUpdate: string;
    transactionMode: string;
    transactionFrequency: string;
    statementDescriptor: string;
    invoiceNbr: string;
    merchantId: string;
    cardType: string;
    initialTransactionId: string;
    errorCode: string;
    errorMessage: string;
    custom1: string;
    custom2: string;
    custom3: string;
    transId: string;
    retryable: string;
    declinedReason: string;
    declinedReasonString: string;
    operationId: string;
    initiatedBy: string;
  } = {
    status: '',
    createdDate: '',
    updatedDate: '',
    operationType: '',
    profileId: '',
    paymentType: '',
    taxAmount: '',
    transAmount: '',
    transType: '',
    vendor: '',
    siteCode: '',
    taxDesc: '',
    approvalCode: '',
    approvalMsg: '',
    avsResponse: '',
    cscResponse: '',
    groupId: '',
    auLastUpdate: '',
    transactionMode: '',
    transactionFrequency: '',
    statementDescriptor: '',
    invoiceNbr: '',
    merchantId: '',
    cardType: '',
    initialTransactionId: '',
    errorCode: '',
    errorMessage: '',
    custom1: '',
    custom2: '',
    custom3: '',
    transId: '',
    retryable: '',
    declinedReason: '',
    declinedReasonString: '',
    operationId: '',
    initiatedBy: '',
  };

  constructor(
    private route: ActivatedRoute,
    private service: DashboardService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private router: Router
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
      if (window.location.href.includes('payment')) {
        document.getElementById('payments')?.classList.add('nav-active');
        document.getElementById('customers')?.classList.remove('nav-active');
      }
      this.route.queryParamMap.subscribe(
        async (queryParams: { get: (arg0: string) => any }) => {
          const indexId = queryParams.get('indexId');
          const proID = queryParams.get('proID');

          if (indexId !== null) {
            this.userType = indexId;
          } else if (proID !== null) {
            this.userType = proID;
          } else {
            this.userType = null;
          }
        }
      );
      this.service.getPaymentDetailsData(this.userType).subscribe({
        next: (data: any) => {
          this.paymentDetailsData = data;
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
          if (error.error.message.endsWith('expired')) {
            let res = this.service.logoutUser();
            window.location.href = '/login';
          }
        },
      });
    } else {
      window.location.href = '/login';
    }
  }

  responseContainsData() {
    return Object.keys(this.profileDetailsData).length;
  }

  navigateToCustomerDetails(profileId: string) {
    this.router.navigate(['/customerdetails'], {
      queryParams: { proID: profileId },
    });
  }
}
