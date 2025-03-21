import * as Highcharts from 'highcharts';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import dayjs from 'dayjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { errorMessages } from 'src/assets/errorMessages';

declare function userCheck(data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  start: any;
  startDate: any;
  endDate: any;
  cardtype: any;
  enable: any;
  vendors: any;
  paymenttype: any;
  operationtype: any;
  chartData_cardtype: any;
  chartData_vendors: any;
  ChartOptions_cardtype: any;
  ChartOptions_vendors: any;
  chartData_paymenttype: any;
  ChartOptions_paymenttype: any;
  ChartData_operationtype: any;
  ChartOptions_operationtype: any;
  ChartOptions_operationtypem: any;
  recentTransacation: any;
  highcharts = Highcharts;
  cardtype_count_percentage: any;
  dummydata: any;
  cardFilter: any;
  point: any;
  selected: any = { startDate: null, endDate: null };
  cardTypeSelectAll: any;
  selectedCardItems = new Array();
  cardTypeSettings: any = {};
  selectedCardType = new Array();
  vendorNameSelectAll: any;
  selectedVendors = new Array();
  vendorNameSettings: any = {};
  selectedVendorName = new Array();
  paymentTypeSelectAll: any;
  selectedPaymentItems = new Array();
  paymentTypeSettings: any = {};
  selectedPaymentType = new Array();
  operationTypeSelectAll: any;
  selectedOperationItems = new Array();
  operationTypeSettings: any = {};
  selectedOperationType = new Array();
  operationItems = new Array();
  errorMessage: any;
  startdaterange: any;
  enddaterange: any;
  auth0code: any;
  loginauth0tokendata: any;
  id_token: any;
  logincheckflag: any;
  selectedvendorItems = new Array();
  userdata: any;
  productResponseData = new Array();
  channelsData: any;
  productChannelIds = new Array();
  successFailedTransaction: any;

  selectedModule: string = 'dashboard';

  ranges: any = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };

  public constructor(
    private toastr: ToastrService,
    private cookieService: CookieService,
    public datepipe: DatePipe,
    private service: DashboardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
  
      this.cardTypeSelectAll = true;
      this.vendorNameSelectAll = true;
      this.paymentTypeSelectAll = true;
      this.operationTypeSelectAll = true;

      this.enable =
        this.getLocalStorage(`toggleButton_${this.selectedModule}`) || false;

      this.id_token = this.cookieService.get('encrptedToken');
      
      if (this.id_token && this.cookieService.get('organization') !== 'global_auth') {
        let userRole = this.cookieService.get('userRole');
        updateUserRole(userRole);
        document.getElementById('mainNav')?.classList.remove('hidenav');
        document.getElementById('routerdata')?.classList.remove('hidenav');
        document.getElementById('page-top')?.classList.remove('hidenav');
        document.getElementById('loader1')?.classList.add('hideloader');
        document.getElementById('overlay1')?.classList.add('hideloader');
        let username = this.cookieService.get('username');
        userCheck(username);
        this.cookieService.set('userStatus', 'true');
        if (window.location.href.includes('dashboard')) {
          document.getElementById('dashboard')?.classList.add('nav-active');
        }
        let getUserInfo = this.service.getUserInfo();
        getUserInfo.subscribe(
          (data: any) => {
            this.userdata = data;
            this.cookieService.set(
              'userRole',
              this.userdata.dbUserDetails.role.roleName
            );
  
            let userRole = this.cookieService.get('userRole');
            updateUserRole(userRole);
            this.cookieService.set(
              'userEmailId',
              this.userdata.dbUserDetails.userEmailId
            );
  
            if (this.userdata.dbUserDetails.dbStatus.status == 'active') {
              this.cookieService.set(
                'encrptedToken',
                this.userdata.encrptedToken,
                1
              );
              this.cookieService.set(
                'username',
                this.userdata.dbUserDetails.userFullName,
                1
              );
  
              userCheck(this.userdata.dbUserDetails.userFullName);
              this.cookieService.set('userStatus', 'true');
            
              let productChannels = this.userdata.dbUserDetails.productChannels;
  
              this.productResponseData = productChannels;
              let product: {
                productChannelId: any;
                productId: any;
                productName: any;
                channelId: any;
                channelName: any;
              }[] = [];
              this.channelsData = [];
              this.productResponseData.forEach((val: any) => {
                product.push({
                  productChannelId: val.productChannelId,
                  productId: val.productId.productId,
                  productName: val.productId.name,
                  channelId: val.channelId.channelId,
                  channelName: val.channelId.name,
                });
                this.channelsData.push({
                  channelId: val.productChannelId,
                  name: val.channelId.name + ' (' + val.productId.name + ')',
                });
              });
  
              this.cookieService.set('products', JSON.stringify(product));
              this.cookieService.set(
                'channels',
                JSON.stringify(this.channelsData)
              );
              this.channelsData.forEach((val: any) => {
                this.productChannelIds.push(val.channelId);
              });
  
              document.getElementById('loader1')?.classList.add('hideloader');
              document.getElementById('overlay1')?.classList.add('hideloader');
              if (window.location.href.includes('dashboard')) {
                document.getElementById('dashboard')?.classList.add('nav-active');
              }
  
              this.cookieDateRange();
            } else {
              document.getElementById('loader')?.classList.add('hideloader');
              document.getElementById('overlay')?.classList.add('hideloader');
              this.cookieService.set('userStatus', 'false');
              Swal.fire('User not Verified');
              setTimeout(() => {
                let res = this.service.logoutUser();
                window.location.href = '/login';
              }, 4000);
            }
          },
          (error: any) => {
            this.errorMessage = error;
            document.getElementById('loader')?.classList.add('hideloader');
            document.getElementById('overlay')?.classList.add('hideloader');
  
            Swal.fire({
              title: errorMessages.userNotVerified,
              showCancelButton: false,
              showConfirmButton: false,
            });
            setTimeout(() => {
              let res = this.service.logoutUser();
              window.location.href = '/login';
            }, 4000);
          }
        );
  
        this.cookieDateRange();
      } else {
        this.route.queryParamMap.subscribe(
          async (queryParams: { get: (arg0: string) => any }) => {
            this.auth0code = queryParams.get('code');
            if (this.auth0code) {
              let loginauth0token = this.service.getLoginAuth0token(
                this.auth0code
              );
              loginauth0token.subscribe((data: any) => {
                this.loginauth0tokendata = data;
                this.cookieService.set(
                  'id_token',
                  this.loginauth0tokendata.id_token,
                  1
                );
                this.cookieService.set(
                  'access_token',
                  this.loginauth0tokendata.access_token,
                  1
                );
                if(this.cookieService.get('organization') === 'global_auth') {
                  window.location.href='/manageCustomers'
                }else{
                  let getUserInfo = this.service.getUserInfo();
                  getUserInfo.subscribe(
                    (data: any) => {
                      this.userdata = data;
                      this.cookieService.set(
                        'userEmailId',
                        this.userdata.dbUserDetails.userEmailId
                      );
                      this.cookieService.set(
                        'userRole',
                        this.userdata.dbUserDetails.role.roleName
                      );
                      let userRole = this.cookieService.get('userRole');
                      updateUserRole(userRole);
                      if (this.userdata.dbUserDetails.dbStatus.status == 'active') {
                        this.cookieService.set(
                          'encrptedToken',
                          this.userdata.encrptedToken,
                          1
                        );
                        this.cookieService.set(
                          'username',
                          this.userdata.dbUserDetails.userFullName,
                          1
                        );
                        userCheck(this.userdata.dbUserDetails.userFullName);
                        this.cookieService.set('userStatus', 'true');
                        
                        let productChannels =
                          this.userdata.dbUserDetails.productChannels;
    
                        this.productResponseData = productChannels;
                        let product: {
                          productChannelId: any;
                          productId: any;
                          productName: any;
                          channelId: any;
                          channelName: any;
                        }[] = [];
                        this.channelsData = [];
                        this.productResponseData.forEach((val: any) => {
                          product.push({
                            productChannelId: val.productChannelId,
                            productId: val.productId.productId,
                            productName: val.productId.name,
                            channelId: val.channelId.channelId,
                            channelName: val.channelId.name,
                          });
                          this.channelsData.push({
                            channelId: val.productChannelId,
                            name:
                              val.channelId.name + ' (' + val.productId.name + ')',
                          });
                        });
    
                        this.cookieService.set('products', JSON.stringify(product));
                        this.cookieService.set(
                          'channels',
                          JSON.stringify(this.channelsData)
                        );
                        this.channelsData.forEach((val: any) => {
                          this.productChannelIds.push(val.channelId);
                        });
    
                        document
                          .getElementById('loader1')
                          ?.classList.add('hideloader');
                        document
                          .getElementById('overlay1')
                          ?.classList.add('hideloader');
                        if (window.location.href.includes('dashboard')) {
                          document
                            .getElementById('dashboard')
                            ?.classList.add('nav-active');
                        }
    
                        this.cookieDateRange();
                      } else {
                        document
                          .getElementById('loader')
                          ?.classList.add('hideloader');
                        document
                          .getElementById('overlay')
                          ?.classList.add('hideloader');
                        this.cookieService.set('userStatus', 'false');
                        Swal.fire({
                          title: errorMessages.userNotVerified,
                          showCancelButton: false,
                          showConfirmButton: false,
                        });
                        setTimeout(() => {
                          let res = this.service.logoutUser();
                          window.location.href = '/login';
                        }, 4000);
                      }
                    },
                    (error: any) => {
                      this.errorMessage = error;
                      document
                        .getElementById('loader')
                        ?.classList.add('hideloader');
                      document
                        .getElementById('overlay')
                        ?.classList.add('hideloader');
    
                      Swal.fire({
                        title: errorMessages.userNotVerified,
                        showCancelButton: false,
                        showConfirmButton: false,
                      });
                      setTimeout(() => {
                        let res = this.service.logoutUser();
                        window.location.href = '/login';
                      }, 4000);
                    }
                  );
                }
                
              });
            } else {
              document.getElementById('loader')?.classList.add('hideloader');
              document.getElementById('overlay')?.classList.add('hideloader');
              Swal.fire({
                title: errorMessages.userNotVerified,
                showCancelButton: false,
                showConfirmButton: false,
              });
              setTimeout(() => {
                let res = this.service.logoutUser();
                window.location.href = '/login';
              }, 4000);
            }
          }
        );
      }
    
    
  }

  openDatepicker(ref: any): void {
    ref.click();
  }

  toggletranschange(val: any) {
    this.enable = val;
    this.myChart();
  }

  datechange() {
    this.myChart();
  }

  myChart() {
    if (this.productChannelIds.length == 0 && this.cookieService.get('organization') !== 'global_auth') {
      document.getElementById('loader')?.classList.add('hideloader');
      document.getElementById('overlay')?.classList.add('hideloader');
    } else {
      this.startdaterange = this.datepipe.transform(
        this.selected.start['$d'],
        'yyyy-MM-dd'
      );
      this.enddaterange = this.datepipe.transform(
        this.selected.end['$d'],
        'yyyy-MM-dd'
      );
      let successFailedTransaction = this.service.getTransactionRatio(
        this.startdaterange,
        this.enddaterange,
        this.productChannelIds
      );

      successFailedTransaction.subscribe(
        (data: any) => {
          let categories: any[] = [];
          let successTransactionsCount: any[] = [];
          let failedTransactionsCount: any[] = [];
          let percentage = [];
          data.forEach((val: any) => {
            categories.push(val.vendorName);
            var successPercentage = (
              (val.successTransactionsCount /
                (val.successTransactionsCount + val.failedTransactionsCount)) *
              100
            ).toFixed(2);
            successTransactionsCount.push(Number(successPercentage));
            var failedPercentage = (
              (val.failedTransactionsCount /
                (val.successTransactionsCount + val.failedTransactionsCount)) *
              100
            ).toFixed(2);
            failedTransactionsCount.push(Number(failedPercentage));
          });
          this.successFailedTransaction = {
            chart: {
              type: 'column',
            },
            title: {
              text: 'Success VS Failed Transactions',
              align: 'left',
            },
            xAxis: {
              categories: categories,
              crosshair: true,
              accessibility: {
                description: 'Vendors',
              },
            },
            yAxis: {
              min: 0,
              title: {
                text: 'Transactions in %',
              },
            },
            tooltip: {
              valueSuffix: ' %',
            },
            accessibility: {
              point: {
                valueSuffix: '%',
              },
            },
            plotOptions: {
              column: {
                pointPadding: 0.0,
                borderWidth: 0,
              },
              series: {
                minPointLength: 20,
              },
            },
            series: [
              {
                name: 'SUCCESS',
                data: successTransactionsCount,
                color: '#7CD57C',
              },
              {
                name: 'FAILED',
                data: failedTransactionsCount,
                color: '#FF4D4D',
              },
            ],
          };
          document.getElementById('containerd-fluid')?.classList.remove('hide');
        },
        (error: any) => {
          this.errorMessage = error;
          document.getElementById('loader')?.classList.add('hideloader');
          document.getElementById('overlay')?.classList.add('hideloader');
          document
            .getElementById('vendortype_fail_div')
            ?.classList.add('vendortype_fail_div');
          document
            .getElementById('operationtype_fail_div')
            ?.classList.add('operationtype_fail_div');
          document
            .getElementById('paymenttype_fail_div')
            ?.classList.add('paymenttype_fail_div');
          document
            .getElementById('cardtype_fail_div')
            ?.classList.add('cardtype_fail_div');
          document
            .getElementById('vendortype_main_div')
            ?.classList.add('vendortype_main_div');
          document
            .getElementById('operationtype_main_div')
            ?.classList.add('operationtype_main_div');
          document
            .getElementById('paymenttype_main_div')
            ?.classList.add('paymenttype_main_div');
          document
            .getElementById('cardtype_main_div')
            ?.classList.add('cardtype_main_div');

          this.toastr.error(error.error.message);
        }
      );

      let vendortype = this.service.getVendorTypes(
        this.startdaterange,
        this.enddaterange,
        this.enable,
        this.productChannelIds
      );
      let recenttransactions = this.service.getRecentTransactions(
        this.startdaterange,
        this.enddaterange,
        this.productChannelIds
      );
      vendortype.subscribe(
        (data: any) => {
          this.chartData_vendors = [];
          this.vendors = data;
          this.createVendors();
          document.getElementById('containerd-fluid')?.classList.remove('hide');
        },
        (error: any) => {
          this.errorMessage = error;
          document.getElementById('loader')?.classList.add('hideloader');
          document.getElementById('overlay')?.classList.add('hideloader');
          document
            .getElementById('vendortype_fail_div')
            ?.classList.add('vendortype_fail_div');
          document
            .getElementById('operationtype_fail_div')
            ?.classList.add('operationtype_fail_div');
          document
            .getElementById('paymenttype_fail_div')
            ?.classList.add('paymenttype_fail_div');
          document
            .getElementById('cardtype_fail_div')
            ?.classList.add('cardtype_fail_div');
          document
            .getElementById('vendortype_main_div')
            ?.classList.add('vendortype_main_div');
          document
            .getElementById('operationtype_main_div')
            ?.classList.add('operationtype_main_div');
          document
            .getElementById('paymenttype_main_div')
            ?.classList.add('paymenttype_main_div');
          document
            .getElementById('cardtype_main_div')
            ?.classList.add('cardtype_main_div');

          this.toastr.error(error.error.message);
          if (error.error.message.endsWith('expired')) {
            let res = this.service.logoutUser();
            window.location.href = '/login';
          }
        }
      );

      recenttransactions.subscribe(
        (data: any) => {
          this.recentTransacation = data;
        },
        (error: any) => {
          this.errorMessage = error;
          document
            .getElementById('recent_fail_div')
            ?.classList.add('recent_fail_div');
          document
            .getElementById('recent_main_div')
            ?.classList.add('recent_main_div');
          this.toastr.error(error.error.message);
        }
      );
    }
  }

  onCardTypeItemSelect(item: any) {
    this.cardTypeSelectAll = false;
    let cardTypeName = item.cardTypeName;
    const index: number = this.selectedCardType.indexOf(cardTypeName);
    if (index !== -1) {
      this.selectedCardType.splice(index, 1);
    }
    this.selectedCardType.push(cardTypeName);
    this.createCardType();
  }
  onCardTypeItemDeSelect(item: any) {
    this.cardTypeSelectAll = false;
    let cardTypeName = item.cardTypeName;
    const index: number = this.selectedCardType.indexOf(cardTypeName);
    if (index !== -1) {
      this.selectedCardType.splice(index, 1);
    }
    this.createCardType();
  }

  onCardTypeSelectAll() {
    this.selectedCardType = [];
    this.cardTypeSelectAll = 'select';
    this.createCardType();
  }
  onCardTypeDeSelectAll() {
    this.selectedCardType = [];
    this.cardTypeSelectAll = false;
    this.createCardType();
  }

  createCardType = () => {
    this.chartData_cardtype = [];

    this.cardTypeSettings = {
      singleSelection: false,
      idField: 'cardTypeId',
      textField: 'cardTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    this.selectedCardItems = [];
    if (this.cardTypeSelectAll) {
      this.selectedCardType = [];
      this.cardtype.forEach((val: any) => {
        if (val.cardTypeCount || this.cardTypeSelectAll == 'select') {
          this.selectedCardType.push(val.cardTypeName);
          this.selectedCardItems.push({
            cardTypeId: val.cardTypeId,
            cardTypeName: val.cardTypeName,
          });
          this.chartData_cardtype.push({
            name: val.cardTypeName,
            y: val.cardTypeCount,
            color: val.color,
            sliced: false,
            selected: false,
          });
        }
      });
    } else {
      this.cardtype.forEach((val: any) => {
        this.selectedCardType.forEach((val1) => {
          if (val1 == val.cardTypeName) {
            this.selectedCardItems.push({
              cardTypeId: val.cardTypeId,
              cardTypeName: val.cardTypeName,
            });
            this.chartData_cardtype.push({
              name: val.cardTypeName,
              y: val.cardTypeCount,
              color: val.color,
              sliced: false,
              selected: false,
            });
          }
        });
      });
    }

    this.ChartOptions_cardtype = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        height: (9 / 16) * 100 + '%',
        type: 'pie',
      },

      title: {
        text: 'Card Type',
        align: 'left',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            itemStyle: {
              color: '#333333',
              cursor: 'pointer',
              fontSize: '2px',
              fontWeight: 'bold',
              textOverflow: 'ellipsis',
            },
          },
        },
      },
      legend: {
        itemStyle: {
          fontSize: '12px',
          width: 100,
        },
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -50,
        y: 30,
        labelFormat: '{name}: {y} ',
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
      series: [
        {
          name: 'card',
          colorByPoint: false,
          data: this.chartData_cardtype,
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              legend: {
                layout: 'vertical',
                x: 0,
                y: 30,
              },
            },
          },
        ],
      },
    };
  };

  onVendorItemSelect(item: any) {
    this.vendorNameSelectAll = false;
    let vendorName = item.vendorName;
    const index: number = this.selectedVendorName.indexOf(vendorName);
    if (index !== -1) {
      this.selectedVendorName.splice(index, 1);
    }
    this.selectedVendorName.push(vendorName);
    this.createVendors();
  }
  onVendorItemDeSelect(item: any) {
    this.vendorNameSelectAll = false;
    let vendorName = item.vendorName;
    const index: number = this.selectedVendorName.indexOf(vendorName);
    if (index !== -1) {
      this.selectedVendorName.splice(index, 1);
    }
    this.createVendors();
  }

  onVendorSelectAll() {
    this.selectedVendorName = [];
    this.vendorNameSelectAll = 'select';
    this.createVendors();
  }
  onVendorDeSelectAll(event: any, action: any) {
    this.selectedVendorName = [];
    this.vendorNameSelectAll = false;

    setTimeout(() => {
      this.selectedVendors.push(this.vendors[0].vendorId);
      this.chartData_vendors.push({
        name: this.vendors[0].vendorName,
        y: this.vendors[0].vendorCount,
        color: this.vendors[0].color,
        sliced: false,
        selected: false,
      });
      this.selectedvendorItems.push({
        vendorId: this.vendors[0].vendorId,
        vendorName: this.vendors[0].vendorName,
      });
      this.selectedVendorName.push(this.vendors[0].vendorName);
      if (this.vendorNameSelectAll == false) {
        this.toastr.info(errorMessages.vendorRequired);
      }
      this.createVendors();
    }, 100);
  }

  createVendors = () => {
    this.chartData_vendors = [];

    this.vendorNameSettings = {
      singleSelection: false,
      idField: 'vendorId',
      textField: 'vendorName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    this.selectedVendors = [];
    this.selectedvendorItems = [];
    if (this.vendorNameSelectAll) {
      this.selectedVendorName = [];
      this.vendors.forEach((val: any) => {
        if (val.vendorCount || this.vendorNameSelectAll == 'select') {
          this.selectedVendorName.push(val.vendorName);
          this.selectedVendors.push(val.vendorId);
          this.selectedvendorItems.push({
            vendorId: val.vendorId,
            vendorName: val.vendorName,
          });
          this.chartData_vendors.push({
            name: val.vendorName,
            y: val.vendorCount,
            color: val.color,
            sliced: false,
            selected: false,
          });
        }
      });
    } else {
      this.vendors.forEach((val: any) => {
        this.selectedVendorName.forEach((val1) => {
          if (val1 == val.vendorName) {
            this.selectedVendors.push(val.vendorId);
            this.selectedvendorItems.push({
              vendorId: val.vendorId,
              vendorName: val.vendorName,
            });
            this.chartData_vendors.push({
              name: val.vendorName,
              y: val.vendorCount,
              color: val.color,
              sliced: false,
              selected: false,
            });
          }
        });
      });
    }

    this.ChartOptions_vendors = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        height: (9 / 16) * 100 + '%',
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: 'Vendor Type',
        align: 'left',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
      },
      legend: {
        itemStyle: {
          fontSize: '12px',
          width: 100,
        },
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -50,
        y: 30,
        labelFormat: '{name}: {y} ',
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
      series: [
        {
          name: 'card',
          colorByPoint: false,
          data: this.chartData_vendors,
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              legend: {
                layout: 'vertical',
                x: 0,
                y: 30,
              },
            },
          },
        ],
      },
    };

    if (this.selectedVendors.length == 0) {
      this.selectedVendorName.push(this.vendors[0].vendorName);
      this.selectedVendors.push(this.vendors[0].vendorId);
      this.chartData_vendors.push({
        name: this.vendors[0].vendorName,
        y: this.vendors[0].vendorCount,
        color: this.vendors[0].color,
        sliced: false,
        selected: false,
      });
      this.selectedvendorItems.push({
        vendorId: this.vendors[0].vendorId,
        vendorName: this.vendors[0].vendorName,
      });
      if (this.vendorNameSelectAll == false) {
        this.toastr.info(errorMessages.vendorRequired);
      }
    }

    document.getElementById('loader')?.classList.remove('hideloader');
    document.getElementById('overlay')?.classList.remove('hideloader');
    let cardtype = this.service.getCardTypes(
      this.startdaterange,
      this.enddaterange,
      this.selectedVendors,
      this.enable,
      this.productChannelIds
    );
    let paymenttype = this.service.getPaymentTypes(
      this.startdaterange,
      this.enddaterange,
      this.selectedVendors,
      this.enable,
      this.productChannelIds
    );
    let operationtype = this.service.getOperationTypes(
      this.startdaterange,
      this.enddaterange,
      this.selectedVendors,
      this.enable,
      this.productChannelIds
    );

    cardtype.subscribe(
      (data: any) => {
        this.chartData_cardtype = [];
        this.cardtype = data;
        this.createCardType();
      },
      (error: any) => {
        this.errorMessage = error;
        document.getElementById('loader')?.classList.add('hideloader');
        document.getElementById('overlay')?.classList.add('hideloader');
        document
          .getElementById('cardtype_fail_div')
          ?.classList.add('cardtype_fail_div');
        document
          .getElementById('cardtype_main_div')
          ?.classList.add('cardtype_main_div');
        this.toastr.error(error.error.message);
      }
    );

    paymenttype.subscribe(
      (data: any) => {
        this.chartData_paymenttype = [];
        this.paymenttype = data;
        this.createPaymentType();
      },
      (error: any) => {
        this.errorMessage = error;
        document.getElementById('loader')?.classList.add('hideloader');
        document.getElementById('overlay')?.classList.add('hideloader');
        document
          .getElementById('paymenttype_fail_div')
          ?.classList.add('paymenttype_fail_div');
        document
          .getElementById('paymenttype_main_div')
          ?.classList.add('paymenttype_main_div');

        this.toastr.error(error.error.message);
      }
    );
    operationtype.subscribe(
      (data: any) => {
        this.ChartData_operationtype = [];
        this.operationtype = data;
        this.operationtype.forEach((val: any) => {
          val.operationTypeName = val.transactionType
            ? val.operationTypeName + ' - ' + val.transactionType
            : val.operationTypeName;
        });

        this.createOperationType();
      },
      (error: any) => {
        this.errorMessage = error;
        document.getElementById('loader')?.classList.add('hideloader');
        document.getElementById('overlay')?.classList.add('hideloader');
        document
          .getElementById('operationtype_fail_div')
          ?.classList.add('operationtype_fail_div');
        document
          .getElementById('operationtype_main_div')
          ?.classList.add('operationtype_main_div');
        this.toastr.error(error.error.message);
      }
    );

    setTimeout(() => {
      document.getElementById('loader')?.classList.add('hideloader');
      document.getElementById('overlay')?.classList.add('hideloader');
    }, 1000);
  };

  onPaymentTypeItemSelect(item: any) {
    this.paymentTypeSelectAll = false;
    let paymentTypeName = item.paymentTypeName;
    const index: number = this.selectedPaymentType.indexOf(paymentTypeName);
    if (index !== -1) {
      this.selectedPaymentType.splice(index, 1);
    }
    this.selectedPaymentType.push(paymentTypeName);
    this.createPaymentType();
  }
  onPaymentTypeItemDeSelect(item: any) {
    this.paymentTypeSelectAll = false;
    let paymentTypeName = item.paymentTypeName;
    const index: number = this.selectedPaymentType.indexOf(paymentTypeName);
    if (index !== -1) {
      this.selectedPaymentType.splice(index, 1);
    }
    this.createPaymentType();
  }

  onPaymentTypeSelectAll() {
    this.selectedPaymentType = [];
    this.paymentTypeSelectAll = 'select';
    this.createPaymentType();
  }
  onPaymentTypeDeSelectAll() {
    this.selectedPaymentType = [];
    this.paymentTypeSelectAll = false;
    this.createPaymentType();
  }

  createPaymentType = () => {
    this.chartData_paymenttype = [];

    this.paymentTypeSettings = {
      singleSelection: false,
      idField: 'paymentTypeId',
      textField: 'paymentTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    this.selectedPaymentItems = [];
    if (this.paymentTypeSelectAll) {
      this.selectedPaymentType = [];
      this.paymenttype.forEach((val: any) => {
        if (val.paymentTypeCount || this.paymentTypeSelectAll == 'select') {
          this.selectedPaymentType.push(val.paymentTypeName);
          this.selectedPaymentItems.push({
            paymentTypeId: val.paymentTypeId,
            paymentTypeName: val.paymentTypeName,
          });
          this.chartData_paymenttype.push({
            name: val.paymentTypeName,
            y: val.paymentTypeCount,
            color: val.color,
            sliced: false,
            selected: false,
          });
        }
      });
    } else {
      this.paymenttype.forEach((val: any) => {
        this.selectedPaymentType.forEach((val1) => {
          if (val1 == val.paymentTypeName) {
            this.selectedPaymentItems.push({
              paymentTypeId: val.paymentTypeId,
              paymentTypeName: val.paymentTypeName,
            });
            this.chartData_paymenttype.push({
              name: val.paymentTypeName,
              y: val.paymentTypeCount,
              color: val.color,
              sliced: false,
              selected: false,
            });
          }
        });
      });
    }

    this.ChartOptions_paymenttype = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        height: (9 / 16) * 100 + '%',
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: 'Payment Type',
        align: 'left',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
      },
      legend: {
        itemStyle: {
          fontSize: '12px',
          width: 100,
        },
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -50,
        y: 30,
        size: '100%',
        labelFormat: '{name}: {y} ',
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
      series: [
        {
          name: 'card',
          colorByPoint: false,
          data: this.chartData_paymenttype,
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              legend: {
                layout: 'vertical',
                x: 0,
                y: 30,
              },
            },
          },
        ],
      },
    };
  };

  onOperationTypeItemSelect(item: any) {
    this.operationTypeSelectAll = false;
    let operationTypeName = item.operationTypeName;
    const index: number = this.selectedOperationType.indexOf(operationTypeName);
    if (index !== -1) {
      this.selectedOperationType.splice(index, 1);
    }
    this.selectedOperationType.push(operationTypeName);
    this.createOperationType();
  }
  onOperationTypeItemDeSelect(item: any) {
    this.operationTypeSelectAll = false;
    let operationTypeName = item.operationTypeName;
    const index: number = this.selectedOperationType.indexOf(operationTypeName);
    if (index !== -1) {
      this.selectedOperationType.splice(index, 1);
    }
    this.createOperationType();
  }

  onOperationTypeSelectAll() {
    this.selectedOperationType = [];
    this.operationTypeSelectAll = 'select';
    this.createOperationType();
  }
  onOperationTypeDeSelectAll() {
    this.selectedOperationType = [];
    this.operationTypeSelectAll = false;
    this.createOperationType();
  }

  createOperationType = () => {
    this.ChartData_operationtype = [];
    this.operationTypeSettings = {
      singleSelection: false,
      idField: 'operationTypeId',
      textField: 'operationTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.selectedOperationItems = [];
    if (this.operationTypeSelectAll) {
      this.selectedOperationType = [];
      this.operationtype.forEach((val: any) => {
        if (val.operationTypeCount || this.operationTypeSelectAll == 'select') {
          this.selectedOperationType.push(val.operationTypeName);
          this.selectedOperationItems.push({
            operationTypeId: val.operationTypeId,
            operationTypeName: val.operationTypeName,
          });
          this.ChartData_operationtype.push({
            name: val.operationTypeName,
            y: val.operationTypeCount,
            color: val.color,
            sliced: false,
            selected: false,
          });
        }
      });
    } else {
      this.operationtype.forEach((val: any) => {
        this.selectedOperationType.forEach((val1) => {
          if (val1 == val.operationTypeName) {
            this.selectedOperationItems.push({
              operationTypeId: val.operationTypeId,
              operationTypeName: val.operationTypeName,
            });
            this.ChartData_operationtype.push({
              name: val.operationTypeName,
              y: val.operationTypeCount,
              color: val.color,
              sliced: false,
              selected: false,
            });
          }
        });
      });
    }
    this.ChartOptions_operationtype = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        height: (9 / 16) * 100 + '%',
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: 'Operation Type',
        align: 'left',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 30,
        size: '100%',
        labelFormat: '{name}: {y} ',
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
      series: [
        {
          name: 'card',
          colorByPoint: false,
          data: this.ChartData_operationtype,
        },
      ],
    };
    this.ChartOptions_operationtypem = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        height: (9 / 16) * 100 + '%',
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: 'Operation Type',
        align: 'left',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -50,
        y: 30,
        size: '100%',
        labelFormat: '{name}: {y} ',
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
      series: [
        {
          name: 'card',
          colorByPoint: false,
          data: this.ChartData_operationtype,
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              legend: {
                itemStyle: {
                  fontSize: '12px',
                  width: 100,
                },
                layout: 'vertical',
                x: 0,
                y: 30,
              },
            },
          },
        ],
      },
    };
  };

  onFilterChange() {
    this.setLocalStorage(
      `dateRange_${this.selectedModule}`,
      JSON.stringify(this.selected)
    );

    this.setLocalStorage(`toggleButton_${this.selectedModule}`, this.enable);
  }

  private setLocalStorage(name: string, value: any): void {
    if (value === null || value === undefined) {
      return;
    }
    localStorage.setItem(name, JSON.stringify(value));
  }

  private getLocalStorage(name: string): any {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  }

  cookieDateRange() {
    const storedDateRange = this.getLocalStorage(
      `dateRange_${this.selectedModule}`
    );

    const parsedDateRange = JSON.parse(storedDateRange);
    if (parsedDateRange.start && parsedDateRange.end) {
      this.selected = {
        start: dayjs(parsedDateRange.start),
        end: dayjs(parsedDateRange.end).subtract(5.5, 'hour'),
      };
    } else {
      this.selected = {
        start: dayjs().startOf('month'),
        end: dayjs().endOf('month').subtract(5.5, 'hour'),
      };
    }
  }
}
