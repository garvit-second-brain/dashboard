import { Component, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import { DashboardService } from '../dashboard.service';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import {
  DropDownSize,
  DropDownRounded,
  DropDownFillMode,
} from '@progress/kendo-angular-dropdowns';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { errorMessages } from '../../assets/errorMessages';
import * as FileSaver from 'file-saver';

declare function kendoPlaceholder(event: any): any;
declare function userCheck(data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit {
  selectedModule: string = 'payments';
  operationSize: DropDownSize = 'medium';
  rounded: DropDownRounded = 'full';
  fillMode: DropDownFillMode = 'outline';
  vendors: string[] = [];
  startdaterange: any;
  enddaterange: any;
  enable: any;
  startDate: any;
  endDate: any;
  selected: any = { startDate: null, endDate: null };

  selectedPaymentType: string[] = [];
  selectedCardType: string[] = [];
  selectedVendorType: string[] = [];
  selectedPaymentStatusType: string[] = [];
  selectedOperationType: string[] = [];
  selectedProduct: string[] = [];
  selectedChannel: string[] = [];

  startTime: number = 0;
  endTime: number = 0;
  paginationSize: number = 10;

  showErrorMessage: boolean = false;
  isLoading: boolean = false;

  profileIdValue: string = '';
  transIdValue: string = '';
  downloading: boolean = false;

  cardTypeSelectAll: any;
  vendorNameSelectAll: any;
  paymentTypeSelectAll: any;
  statusSelectAll: any;
  productSelectAll: any;
  channelSelectAll: any;
  productChannelIds: any;
  paymentTypeMapping: { [key: string]: string } = {};
  cardTypeMapping: { [key: string]: string } = {};
  vendorMapping: { [key: string]: string } = {};
  paymentStatusMapping: { [key: string]: string } = {};
  productMapping: { [key: string]: string } = {};
  channelMapping: { [key: string]: string } = {};

  paymentTypeSettings: any = {};
  cardTypeSettings: any = {};
  vendorSettings: any = {};
  paymentStatusSettings: any = {};
  productSettings: any = {};
  channelSettings: any = {};

  selectedPaymentItems = new Array();
  selectedCardItems = new Array();
  selectedVendorItems = new Array();
  selectedStatusItems = new Array();
  selectedProductsItems = new Array();
  selectedChannelsItems = new Array();
  channelItems = new Array();

  operationTypes: any[] = [];

  operationAndTransactionsType: (
    | {
        categoryId: number;
        categoryName: string;
        subCategories: { subCategoryId: number; subCategoryName: string }[];
      }
    | { subCategoryId: number; subCategoryName: string }
  )[] = [];

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

  vendorNameSettings = {
    singleSelection: false,
    idField: 'paymentTypeId',
    textField: 'paymentTypeName',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
  };

  responseData: {
    amount: null | number;
    status: string;
    transactionId: null | string;
    profileId: string;
    vendor: string;
    paymentType: string;
    transType: string;
    cardType: string;
    date: string;
    pagination: null | any;
    operationType: string;
    indexId: string;
    productName: string;
    channelName: string;
  }[] = [];

  paginationData: {
    currentPage: number;
    nextPage: number;
    totalRecord: number;
    totalPage: number;
  } = {
    currentPage: 1,
    nextPage: 0,
    totalRecord: 0,
    totalPage: 0,
  };

  paymentsTypeData: {
    paymentTypeId: number;
    paymentType: string;
    color: string;
    paymentTypeName: string;
  }[] = [];

  cardTypesData: {
    cardTypeId: number;
    cardTypeName: string;
    cardTypeCode: string;
    cardTypeEnum: string;
    color: string;
  }[] = [];

  vendorsData: {
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    color: string;
  }[] = [];

  paymentStatusData: {
    id: number;
    status: string;
    displayName: string;
  }[] = [];

  operationTypesData: {
    operationTypeName: string;
    transactionTypes: {
      transactionType: string;
      color: string;
    }[];
    opType: string;
  }[] = [];

  productsData: {
    productId: number;
    name: string;
  }[] = [];

  productResponseData: any;

  channelsData: {
    channelId: number;
    name: string;
  }[] = [];

  defaultChannelsData: {
    channelId: number;
    name: string;
  }[] = [];

  filtervalue: any[] = [];

  constructor(
    private service: DashboardService,
    public datepipe: DatePipe,
    public cookieService: CookieService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.filtervalue = [
      {
        categoryId: 1,
        categoryName: 'Create Payment Redirect',
        subCategories: [
          {
            subCategoryId: 8,
            subCategoryName: 'authorization',
          },
          {
            subCategoryId: 9,
            subCategoryName: 'sale',
          },
        ],
      },
      {
        subCategoryId: 8,
        subCategoryName: 'authorization',
      },
      {
        subCategoryId: 9,
        subCategoryName: 'sale',
      },
    ];

    const savedOperationType = this.getLocalStorage(
      `operationAndTransactionsType_${this.selectedModule}`
    );
    this.selectedOperationType = savedOperationType
      ? JSON.parse(savedOperationType)
      : [];

    console.log('ngoninit selectedoperationtype', this.selectedOperationType);

    const storedSelectedProducts = this.getLocalStorage(
      `selectedProducts_${this.selectedModule}`
    );

    const storedSelectedChannels = this.getLocalStorage(
      `selectedChannels_${this.selectedModule}`
    );

    this.toggleDisplayDiv();
    this.productSettings = {
      singleSelection: false,
      idField: 'paymentTypeId',
      textField: 'paymentTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.channelSettings = {
      singleSelection: false,
      idField: 'paymentTypeId',
      textField: 'paymentTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    let userRole = this.cookieService.get('userRole');
    updateUserRole(userRole);
    this.paymentTypeSelectAll = true;
    this.cardTypeSelectAll = true;
    this.vendorNameSelectAll = true;
    this.statusSelectAll = true;

    this.profileIdValue =
      this.getLocalStorage('profileIdValue_' + this.selectedModule) || '';

    this.transIdValue =
      this.getLocalStorage('transIdValue_' + this.selectedModule) || '';

    const savedVendorItems = this.getLocalStorage(
      `vendorItems_${this.selectedModule}`
    );
    const savedCardItems = this.getLocalStorage(
      `cardItems_${this.selectedModule}`
    );
    const savedStatusItems = this.getLocalStorage(
      `statusItems_${this.selectedModule}`
    );
    const savedPaymentItems = this.getLocalStorage(
      `paymentItems_${this.selectedModule}`
    );

    if (savedPaymentItems) {
      const parsedPaymentItems = JSON.parse(savedPaymentItems);

      this.selectedPaymentItems = parsedPaymentItems.map(
        (item: { paymentTypeId: number; paymentTypeName: string }) => ({
          paymentTypeId: item.paymentTypeId,
          paymentTypeName: item.paymentTypeName,
        })
      );

      this.createPaymentType();
    }

    if (savedVendorItems) {
      const parsedVendorItems = JSON.parse(savedVendorItems);
      this.selectedVendorItems = parsedVendorItems.map(
        (item: { vendorId: number; vendorName: string }) => ({
          vendorId: item.vendorId,
          vendorName: item.vendorName,
        })
      );

      this.createVendors();
    }

    if (savedCardItems) {
      const parsedCardItems = JSON.parse(savedCardItems);
      this.selectedCardItems = parsedCardItems.map(
        (item: { cardTypeId: number; cardTypeName: string }) => ({
          cardTypeId: item.cardTypeId,
          cardTypeName: item.cardTypeName,
        })
      );

      this.createCardTypes();
    }

    if (savedStatusItems) {
      const parsedStatusItems = JSON.parse(savedStatusItems);
      this.selectedStatusItems = parsedStatusItems.map(
        (item: { id: number; displayName: string }) => ({
          id: item.id,
          displayName: item.displayName,
        })
      );
      this.createPaymentStatus();
    }

    if (
      !savedPaymentItems &&
      !savedVendorItems &&
      !savedCardItems &&
      !savedStatusItems
    ) {
      this.getAllData();
    }

    let username = this.cookieService.get('username');
    userCheck(username);

    this.enable = false;
    if (window.location.href.includes('payment')) {
      document.getElementById('payments')?.classList.add('nav-active');
    }
    setTimeout(() => {
      var hh = <HTMLInputElement>document.getElementById('startDate')
        ? (<HTMLInputElement>document.getElementById('startDate')).value
        : '';
    }, 1000);
    setTimeout(() => {
      kendoPlaceholder(true);
    }, 2000);

    let userStatus = this.cookieService.get('userStatus');
    if (userStatus) {
      const searchButtonClicked =
        this.getLocalStorage('searchButtonClicked') === 'true';

      const storedDateRange = this.getLocalStorage(
        `dateRange_${this.selectedModule}`
      );

      if (storedDateRange && searchButtonClicked) {
        const parsedDateRange = JSON.parse(storedDateRange);
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

      let getUserInfo = this.service.getUserInfo();
      getUserInfo.subscribe(
        (data: any) => {
          let userdata = data;
          let productChannels = userdata.dbUserDetails.productChannels;

          let product: {
            productChannelId: any;
            productId: any;
            productName: any;
            channelId: any;
            channelName: any;
          }[] = [];
          let channelsData: { channelId: any; name: string }[] = [];
          productChannels.forEach((val: any) => {
            product.push({
              productChannelId: val.productChannelId,
              productId: val.productId.productId,
              productName: val.productId.name,
              channelId: val.channelId.channelId,
              channelName: val.channelId.name,
            });
            channelsData.push({
              channelId: val.productChannelId,
              name: val.channelId.name + ' (' + val.productId.name + ')',
            });
          });

          this.cookieService.set('products', JSON.stringify(product));
          this.cookieService.set('channels', JSON.stringify(channelsData));

          if (storedSelectedProducts) {
            this.selectedProductsItems = JSON.parse(storedSelectedProducts);

            this.selectedProduct = this.selectedProductsItems.map(
              (item: { productId: number }) => item.productId.toString()
            );
          }

          if (storedSelectedChannels) {
            this.selectedChannelsItems = JSON.parse(storedSelectedChannels);
            this.selectedChannel = this.selectedChannelsItems.map((channel) =>
              channel.channelId.toString()
            );
          }

          this.createProducts();
          this.createChannels();
          this.handleClick();
        },
        (error: any) => {
          Swal.fire({
            title: errorMessages.userNotVerified,
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            this.service.logoutUser();
            window.location.href = '/login';
          }, 4000);
        }
      );

      if (window.location.href.includes('customer')) {
        document.getElementById('customers')?.classList.add('nav-active');
      }
    } else {
      Swal.fire({
        title: errorMessages.userNotVerified,
        showCancelButton: false,
        showConfirmButton: false,
      });
      setTimeout(() => {
        this.service.logoutUser();
        window.location.href = '/login';
      }, 4000);
    }
  }

  tagMapper(tags: any[]): any[] {
    return tags.length < 2 ? tags : [tags];
  }

  getAllData() {
    const storedPaymentTypes = this.getLocalStorage(
      `paymentsTypeData_${this.selectedModule}`
    );

    if (storedPaymentTypes) {
      this.paymentsTypeData = JSON.parse(storedPaymentTypes);
      this.createPaymentType();
      this.paymentsTypeData.forEach((paymentType) => {
        this.paymentTypeMapping[paymentType.paymentTypeName] =
          paymentType.paymentType;
      });
    } else {
      this.service.getAllPaymentTypes().subscribe({
        next: (data: any) => {
          this.paymentsTypeData = this.service.sortDataByName(
            data,
            'paymentTypeName'
          );
          this.createPaymentType();
          this.paymentsTypeData.forEach((paymentType) => {
            this.paymentTypeMapping[paymentType.paymentTypeName] =
              paymentType.paymentType;
          });
          this.setLocalStorage(
            `paymentsTypeData_${this.selectedModule}`,
            JSON.stringify(this.paymentsTypeData)
          );
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }

    const storedCardTypes = this.getLocalStorage(
      `cardTypesData_${this.selectedModule}`
    );

    if (storedCardTypes) {
      this.cardTypesData = JSON.parse(storedCardTypes);
      this.createCardTypes();
      this.cardTypesData.forEach((card) => {
        this.cardTypeMapping[card.cardTypeName] = card.cardTypeEnum;
      });
    } else {
      this.service.getAllCardTypes().subscribe({
        next: (data: any) => {
          this.cardTypesData = this.service.sortDataByName(
            data,
            'cardTypeName'
          );
          this.createCardTypes();
          this.cardTypesData.forEach((card) => {
            this.cardTypeMapping[card.cardTypeName] = card.cardTypeEnum;
          });
          this.setLocalStorage(
            `cardTypesData_${this.selectedModule}`,
            JSON.stringify(this.cardTypesData)
          );
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }

    const storedVendors = this.getLocalStorage(
      `vendorsData_${this.selectedModule}`
    );

    if (storedVendors) {
      this.vendorsData = JSON.parse(storedVendors);
      this.createVendors();
      this.vendorsData.forEach((vendor) => {
        this.vendorMapping[vendor.vendorName] = vendor.vendorCode;
      });
    } else {
      this.service.getAllVendors().subscribe({
        next: (data: any) => {
          this.vendorsData = this.service.sortDataByName(data, 'vendorName');
          this.createVendors();
          this.vendorsData.forEach((vendor) => {
            this.vendorMapping[vendor.vendorName] = vendor.vendorCode;
          });
          this.setLocalStorage(
            `vendorsData_${this.selectedModule}`,
            JSON.stringify(this.vendorsData)
          );
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }

    const storedPaymentStatuses = this.getLocalStorage(
      `paymentStatusData_${this.selectedModule}`
    );

    if (storedPaymentStatuses) {
      this.paymentStatusData = JSON.parse(storedPaymentStatuses);
      this.createPaymentStatus();
      this.paymentStatusData.forEach((paymentStatus) => {
        this.paymentStatusMapping[paymentStatus.displayName] =
          paymentStatus.status;
      });
    } else {
      this.service.getAllPaymentStatus().subscribe({
        next: (data: any) => {
          this.paymentStatusData = this.service.sortDataByName(
            data,
            'displayName'
          );
          this.createPaymentStatus();
          this.paymentStatusData.forEach((paymentStatus) => {
            this.paymentStatusMapping[paymentStatus.displayName] =
              paymentStatus.status;
          });
          this.setLocalStorage(
            `paymentStatusData_${this.selectedModule}`,
            JSON.stringify(this.paymentStatusData)
          );
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }

    this.service.getAllOperationTypes().subscribe({
      next: (data: any) => {
        this.operationTypesData = data;
        this.createOperationType();
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  createOperationType() {
    this.operationTypes = this.operationTypesData.map(
      (operation, categoryId) => {
        return {
          categoryId: categoryId + 1,
          categoryName: operation.operationTypeName,
          subCategories: operation.transactionTypes.map(
            (transaction, subCategoryId) => {
              let adjustedSubCategoryId = subCategoryId + 1;

              if (operation.operationTypeName === 'Create Payment Redirect') {
                adjustedSubCategoryId = 8 + subCategoryId;
              }

              return {
                subCategoryId: adjustedSubCategoryId,
                subCategoryName: transaction.transactionType,
              };
            }
          ),
        };
      }
    );
  }

  onStatusItemSelect(item: any) {
    this.statusSelectAll = false;

    let statusName = item.displayName;

    const index: number = this.selectedPaymentStatusType.indexOf(statusName);

    if (index !== -1) {
      this.selectedPaymentStatusType.splice(index, 1);
    }

    this.selectedPaymentStatusType.push(statusName);

    this.createPaymentStatus();
  }

  onStatusItemDeSelect(item: any) {
    this.statusSelectAll = false;

    let statusName = item.displayName;

    const index: number = this.selectedPaymentStatusType.indexOf(statusName);

    if (index !== -1) {
      this.selectedPaymentStatusType.splice(index, 1);
    }

    this.createPaymentStatus();
  }

  onStatusSelectAll() {
    this.selectedPaymentStatusType = [];
    this.statusSelectAll = 'select';
    this.createPaymentStatus();
  }

  onStatusDeSelectAll() {
    this.selectedPaymentStatusType = [];
    this.statusSelectAll = false;
    this.createPaymentStatus();
  }

  createPaymentStatus = () => {
    this.paymentStatusSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'displayName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (!this.statusSelectAll) {
      this.selectedStatusItems = [];
    }

    if (this.statusSelectAll === 'select') {
      this.selectedStatusItems = this.paymentStatusData.map((status: any) => ({
        id: status.id,
        displayName: status.displayName,
      }));
      this.selectedPaymentStatusType = this.selectedStatusItems.map(
        (item) => item.displayName
      );
    } else {
      this.selectedPaymentStatusType.forEach((selectedName) => {
        const matchedStatus = this.paymentStatusData.find(
          (status) => status.displayName === selectedName
        );

        if (matchedStatus) {
          const exists = this.selectedStatusItems.some(
            (item) => item.id === matchedStatus.id
          );

          if (!exists) {
            this.selectedStatusItems.push({
              id: matchedStatus.id,
              displayName: matchedStatus.displayName,
            });
          }
        }
      });
    }
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
    this.paymentTypeSettings = {
      singleSelection: false,
      idField: 'paymentTypeId',
      textField: 'paymentTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (!this.paymentTypeSelectAll) {
      this.selectedPaymentItems = [];
    }

    if (this.paymentTypeSelectAll === 'select') {
      this.selectedPaymentItems = this.paymentsTypeData.map((val: any) => ({
        paymentTypeId: val.paymentTypeId,
        paymentTypeName: val.paymentTypeName,
      }));
      this.selectedPaymentType = this.selectedPaymentItems.map(
        (item) => item.paymentTypeName
      );
    } else {
      this.selectedPaymentType.forEach((selectedName) => {
        const matchedPaymentType = this.paymentsTypeData.find(
          (paymentType) => paymentType.paymentTypeName === selectedName
        );

        if (matchedPaymentType) {
          const exists = this.selectedPaymentItems.some(
            (item) => item.paymentTypeId === matchedPaymentType.paymentTypeId
          );

          if (!exists) {
            this.selectedPaymentItems.push({
              paymentTypeId: matchedPaymentType.paymentTypeId,
              paymentTypeName: matchedPaymentType.paymentTypeName,
            });
          }
        }
      });
    }
  };

  onVendorItemSelect(item: any) {
    this.vendorNameSelectAll = false;
    const vendorName = item.vendorName;
    const index = this.selectedVendorType.indexOf(vendorName);

    if (index !== -1) {
      this.selectedVendorType.splice(index, 1);
    }

    this.selectedVendorType.push(vendorName);
    this.createVendors();
  }

  onVendorItemDeSelect(item: any) {
    this.vendorNameSelectAll = false;
    const vendorName = item.vendorName;
    const index = this.selectedVendorType.indexOf(vendorName);

    if (index !== -1) {
      this.selectedVendorType.splice(index, 1);
    }

    this.createVendors();
  }

  onVendorSelectAll() {
    this.selectedVendorType = [];
    this.vendorNameSelectAll = 'select';
    this.createVendors();
  }

  onVendorDeSelectAll() {
    this.selectedVendorType = [];
    this.vendorNameSelectAll = false;
    this.createVendors();
  }

  createVendors = () => {
    this.vendorSettings = {
      singleSelection: false,
      idField: 'vendorId',
      textField: 'vendorName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (!this.vendorNameSelectAll) {
      this.selectedVendorItems = [];
    }

    if (this.vendorNameSelectAll === 'select') {
      this.selectedVendorItems = this.vendorsData.map((val: any) => ({
        vendorId: val.vendorId,
        vendorName: val.vendorName,
      }));
      this.selectedVendorType = this.selectedVendorItems.map(
        (item) => item.vendorName
      );
    } else {
      this.selectedVendorType.forEach((selectedName) => {
        const matchedVendor = this.vendorsData.find(
          (vendor) => vendor.vendorName === selectedName
        );

        if (matchedVendor) {
          const exists = this.selectedVendorItems.some(
            (item) => item.vendorId === matchedVendor.vendorId
          );

          if (!exists) {
            this.selectedVendorItems.push({
              vendorId: matchedVendor.vendorId,
              vendorName: matchedVendor.vendorName,
            });
          }
        }
      });
    }
  };

  onCardTypeItemSelect(item: any) {
    this.cardTypeSelectAll = false;
    const cardTypeName = item.cardTypeName;
    const index = this.selectedCardType.indexOf(cardTypeName);

    if (index !== -1) {
      this.selectedCardType.splice(index, 1);
    }

    this.selectedCardType.push(cardTypeName);
    this.createCardTypes();
  }

  onCardTypeItemDeSelect(item: any) {
    this.cardTypeSelectAll = false;
    const cardTypeName = item.cardTypeName;
    const index = this.selectedCardType.indexOf(cardTypeName);

    if (index !== -1) {
      this.selectedCardType.splice(index, 1);
    }

    this.createCardTypes();
  }

  onCardTypeSelectAll() {
    this.cardTypeSelectAll = 'select';
    this.selectedCardType = [];
    this.createCardTypes();
  }

  onCardTypeDeSelectAll() {
    this.selectedCardType = [];
    this.cardTypeSelectAll = false;
    this.createCardTypes();
  }

  createCardTypes = () => {
    this.cardTypeSettings = {
      singleSelection: false,
      idField: 'cardTypeId',
      textField: 'cardTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (!this.cardTypeSelectAll) {
      this.selectedCardItems = [];
    }

    if (this.cardTypeSelectAll === 'select') {
      this.selectedCardItems = this.cardTypesData.map((val: any) => ({
        cardTypeId: val.cardTypeId,
        cardTypeName: val.cardTypeName,
      }));
      this.selectedCardType = this.selectedCardItems.map(
        (item) => item.cardTypeName
      );
    } else {
      this.selectedCardType.forEach((selectedName) => {
        const matchedCardType = this.cardTypesData.find(
          (cardType) => cardType.cardTypeName === selectedName
        );

        if (matchedCardType) {
          const exists = this.selectedCardItems.some(
            (item) => item.cardTypeId === matchedCardType.cardTypeId
          );

          if (!exists) {
            this.selectedCardItems.push({
              cardTypeId: matchedCardType.cardTypeId,
              cardTypeName: matchedCardType.cardTypeName,
            });
          }
        }
      });
    }
  };

  onProductItemSelect(item: any) {
    this.productSelectAll = false;
    let productId = item.productId;
    const index: number = this.selectedProduct.indexOf(productId);
    if (index === -1) {
      this.selectedProduct.push(productId);
    }
    this.createProducts();
  }

  onProductItemDeSelect(item: any) {
    this.productSelectAll = false;
    let productId = item.productId;
    const index: number = this.selectedProduct.indexOf(productId);
    if (index !== -1) {
      this.selectedProduct.splice(index, 1);
    }
    this.createProducts();
  }

  onProductSelectAll() {
    this.productSelectAll = 'select';
    this.selectedProductsItems = [];
    this.createProducts();
  }

  onProductDeSelectAll() {
    this.productSelectAll = false;
    this.selectedProductsItems = [];
    this.createProducts();
  }

  createProducts = () => {
    this.productSettings = {
      singleSelection: false,
      idField: 'productId',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    let productData: any[] = [];
    this.channelsData = [];
    this.defaultChannelsData = [];

    let product = this.cookieService.get('products');
    let products = JSON.parse(product);

    let channel = this.cookieService.get('channels');

    if (this.productSelectAll === 'select') {
      this.selectedProductsItems = this.productsData.map((val: any) => ({
        productId: val.productId,
        name: val.name,
      }));
      this.selectedProduct = this.selectedProductsItems.map((item) =>
        item.productId.toString()
      );
    }
    if (channel) {
      this.defaultChannelsData = JSON.parse(channel);

      products.forEach((val: any) => {
        if (!productData[val.productId]) {
          productData[val.productId] = [];
        }
        productData[val.productId].push(val);
      });
    }

    this.productsData = [];
    productData.forEach((val: any) => {
      this.productsData.push({
        productId: val[0].productId,
        name: val[0].productName,
      });
    });

    this.productsData = this.service.sortDataByName(this.productsData, 'name');

    if (this.selectedProductsItems.length) {
      this.selectedProductsItems.forEach((selectedProduct) => {
        this.selectedProduct.push(selectedProduct.productId);
        productData[selectedProduct.productId].forEach((val1: any) => {
          this.channelsData.push({
            channelId: val1['productChannelId'],
            name: val1['channelName'] + '(' + selectedProduct.name + ')',
          });
          this.channelsData = this.service.sortDataByName(
            this.channelsData,
            'name'
          );
        });
      });
    }

    this.createChannels();
  };

  onChannelItemSelect(item: any) {
    this.channelSelectAll = false;

    let channelId = item.channelId;

    const index: number = this.selectedChannel.indexOf(channelId);
    if (index === -1) {
      this.selectedChannel.push(channelId);

      const itemExists = this.selectedChannelsItems.some(
        (channel) => channel.channelId === channelId
      );

      if (!itemExists) {
        this.selectedChannelsItems.push({
          channelId: channelId,
          name: item.name,
        });

        this.setLocalStorage(
          `channels_${this.selectedModule}`,
          JSON.stringify(this.selectedChannelsItems)
        );
      }

      this.createChannels();
    }
  }

  onChannelItemDeSelect(item: any) {
    this.channelSelectAll = false;
    let channelId = item.channelId;

    const index: number = this.selectedChannel.indexOf(channelId);
    if (index !== -1) {
      this.selectedChannel.splice(index, 1);

      const selectedIndex = this.selectedChannelsItems.findIndex(
        (channel) => channel.channelId === channelId
      );
      if (selectedIndex !== -1) {
        this.selectedChannelsItems.splice(selectedIndex, 1);
      }
    }

    this.createChannels();
  }

  onChannelSelectAll() {
    this.selectedChannelsItems = this.defaultChannelsData.map((val: any) => ({
      channelId: val.channelId,
      name: val.name,
    }));
    this.channelSelectAll = 'select';
    this.createChannels();
  }

  onChannelDeSelectAll() {
    this.selectedChannelsItems = [];
    this.channelSelectAll = false;
    this.createChannels();
  }

  createChannels = () => {
    this.channelSettings = {
      singleSelection: false,
      idField: 'channelId',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (this.channelSelectAll === 'select') {
      this.selectedChannelsItems = this.defaultChannelsData.map((val: any) => ({
        channelId: val.channelId,
        name: val.name,
      }));

      this.setLocalStorage(
        `channels_${this.selectedModule}`,
        JSON.stringify(this.selectedChannelsItems)
      );
    } else if (!this.channelSelectAll) {
      this.selectedChannelsItems = this.selectedChannelsItems.filter(
        (item: any) =>
          this.defaultChannelsData.some(
            (channel: any) => channel.channelId === item.channelId
          )
      );
    }
  };

  onSelectedKeysChange() {
    this.operationAndTransactionsType.length > 0
      ? kendoPlaceholder(false)
      : kendoPlaceholder(true);
  }

  convertCategory(categoryName: string) {
    const name = categoryName.split(' ').join('');
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  handleOperationAndTransactionType() {
    console.log(
      'handleOperation and trnASCTION TYPE',
      this.operationAndTransactionsType
    );

    this.operationAndTransactionsType.forEach((eachType) => {
      if ('categoryName' in eachType) {
        if (eachType.categoryId !== 0) {
          const categoryName = this.convertCategory(eachType.categoryName);
          const operationName = categoryName + '-';
          eachType.subCategories?.forEach((transType) => {
            const newOperationName = operationName + transType.subCategoryName;
            if (!this.selectedOperationType.includes(newOperationName)) {
              this.selectedOperationType.push(newOperationName);
            }
          });
        }
      } else {
        if (eachType.subCategoryId <= 7) {
          const newOperationName =
            'createVaultTransaction-' + eachType.subCategoryName;
          if (!this.selectedOperationType.includes(newOperationName)) {
            this.selectedOperationType.push(newOperationName);
          }
        } else {
          const newOperationName =
            'createPaymentRedirect-' + eachType.subCategoryName;
          if (!this.selectedOperationType.includes(newOperationName)) {
            this.selectedOperationType.push(newOperationName);
          }
        }
      }
    });
  }

  // reverseOperationAndTransactionType(selectedOperationType: string[]) {
  //   const output = [];

  //   // Original data structure for reference
  //   const originalData = [
  //     {
  //       categoryId: 1,
  //       categoryName: 'createPaymentRedirect',
  //       subCategories: [
  //         { subCategoryId: 6, subCategoryName: 'sale' },
  //         { subCategoryId: 7, subCategoryName: 'authorization' }
  //       ]
  //     },
  //     {
  //       categoryId: 2,
  //       categoryName: 'createVaultTransaction',
  //       subCategories: [
  //         { subCategoryId: 1, subCategoryName: 'sale' },
  //         { subCategoryId: 2, subCategoryName: 'authorization' },
  //         { subCategoryId: 3, subCategoryName: 'void' },
  //         { subCategoryId: 4, subCategoryName: 'capture' },
  //         { subCategoryId: 5, subCategoryName: 'refund' }
  //       ]
  //     }
  //   ];

  //   // Process each category
  //   originalData.forEach((category) => {
  //     // Filter selected subcategories for this category
  //     const selectedSubCategories = category.subCategories.filter((subCategory) =>
  //       selectedOperationType.includes(`${category.categoryName}-${subCategory.subCategoryName}`)
  //     );

  //     // If all subcategories of this category are selected, add the full category to output
  //     if (selectedSubCategories.length === category.subCategories.length) {
  //       output.push({
  //         categoryId: category.categoryId,
  //         categoryName: this.convertCategoryName(category.categoryName), // Assuming a method to format the name
  //         subCategories: selectedSubCategories
  //       });
  //     }
  //     // If only specific subcategories are selected, add each subcategory individually
  //     else {
  //       selectedSubCategories.forEach((subCategory) => {
  //         output.push({
  //           subCategoryId: subCategory.subCategoryId,
  //           subCategoryName: subCategory.subCategoryName
  //         });
  //       });
  //     }
  //   });

  //   return output;
  // }

  // // Helper function to format category names
  // convertCategoryName(categoryName: string): string {
  //   const formattedNames: { [key: string]: string } = {
  //     'createPaymentRedirect': 'Create Payment Redirect',
  //     'createVaultTransaction': 'Create Vault Transaction'
  //   };
  //   return formattedNames[categoryName] || categoryName;
  // }

  convertTime() {
    const result = this.service.timeConversion(
      this.selected.start,
      this.selected.end
    );
    this.startTime = result.startTime;
    this.endTime = result.endTime;
  }

  handleClick() {
    this.setLocalStorage('searchButtonClicked', 'true');

    this.onFilterChange();
    this.setLocalStorage(
      `dateRange_${this.selectedModule}`,
      JSON.stringify(this.selected)
    );
    this.paginationFrom = 0;
    if (this.operationAndTransactionsType.length > 0) {
      this.handleOperationAndTransactionType();
    }
    this.isLoading = true;
    this.convertTime();

    this.channelItems = this.selectedChannel ? this.selectedChannel : [];
    if (this.selectedChannel.length == 0) {
      if (this.channelsData.length == 0) {
        this.defaultChannelsData.forEach((val: any) => {
          this.channelItems.push(val.channelId);
        });
      } else {
        this.channelsData.forEach((val: any) => {
          this.channelItems.push(val.channelId);
        });
      }
      this.selectedChannel = [];
    }

    if (this.channelItems.length > 0) {
      this.service
        .getPaymentFilters(
          this.startTime,
          this.endTime,
          this.selectedPaymentType,
          this.selectedCardType,
          this.selectedVendorType,
          this.selectedPaymentStatusType,
          this.selectedOperationType,
          this.selectedProduct,
          this.channelItems,
          this.paginationFrom,
          this.paginationSize,
          this.profileIdValue,
          this.transIdValue
        )
        .subscribe({
          next: (data: any) => {
            document.getElementById('loader')?.classList.add('hideloader');
            document.getElementById('overlay')?.classList.add('hideloader');
            this.responseData = data.response;
            this.paginationData = data.pagination;
            this.showErrorMessage = false;
            this.isLoading = false;
          },
          error: (error: any) => {
            document.getElementById('loader')?.classList.add('hideloader');
            document.getElementById('overlay')?.classList.add('hideloader');
            this.isLoading = false;
            this.toastr.error(error.error.message);
            this.showErrorMessage = true;
          },
        });
    } else {
      document.getElementById('loader')?.classList.add('hideloader');
      document.getElementById('overlay')?.classList.add('hideloader');
      this.isLoading = false;
    }
  }

  handleResetFilters() {
    this.selected = {
      start: dayjs().startOf('month'),
      end: dayjs().endOf('month'),
    };

    this.filters();
    this.selectedPaymentType = [];
    this.selectedCardType = [];
    this.selectedVendorType = [];
    this.selectedPaymentStatusType = [];
    this.selectedOperationType = [];
    this.operationAndTransactionsType = [];
    this.selectedPaymentItems = [];
    this.selectedVendorItems = [];
    this.selectedCardItems = [];
    this.selectedStatusItems = [];
    this.selectedProductsItems = [];
    this.selectedChannelsItems = [];
    this.channelsData = [];
    this.selectedProduct = [];
    this.selectedChannel = [];
    this.channelSelectAll = false;
    this.profileIdValue = '';
    this.transIdValue = '';
    kendoPlaceholder(true);
    this.paymentTypeSelectAll = false;
    this.cardTypeSelectAll = false;
    this.vendorNameSelectAll = false;
    this.statusSelectAll = false;
  }
  paginationFrom: number =
    (this.paginationData.currentPage - 1) * this.paginationSize;

  handlePageChange(event: number) {
    this.paginationData.currentPage = event;
    this.paginationFrom =
      (this.paginationData.currentPage - 1) * this.paginationSize;
    this.handleOperationAndTransactionType();

    this.selectedOperationType = JSON.parse(
      this.getLocalStorage(
        `operationAndTransactionsType_${this.selectedModule}`
      ) || '[]'
    );

    this.selectedProductsItems = JSON.parse(
      this.getLocalStorage(`selectedProducts_${this.selectedModule}`) || '[]'
    );

    this.selectedChannelsItems = JSON.parse(
      this.getLocalStorage(`selectedChannels_${this.selectedModule}`) || '[]'
    );

    this.profileIdValue =
      this.getLocalStorage(`profileIdValue_${this.selectedModule}`) || '';
    this.transIdValue =
      this.getLocalStorage(`transIdValue_${this.selectedModule}`) || '';

    const parsedPaymentTypes = JSON.parse(
      this.getLocalStorage(`paymentItems_${this.selectedModule}`)
    );
    this.selectedPaymentType = (parsedPaymentTypes || '[]').map(
      (item: { paymentTypeName: any }) => item.paymentTypeName
    );
    this.selectedPaymentItems = parsedPaymentTypes.map(
      (item: { paymentTypeId: number; paymentTypeName: string }) => ({
        paymentTypeId: item.paymentTypeId,
        paymentTypeName: item.paymentTypeName,
      })
    );

    const parsedVendorTypes = JSON.parse(
      this.getLocalStorage(`vendorItems_${this.selectedModule}`)
    );
    this.selectedVendorType = (parsedVendorTypes || '[]').map(
      (item: { vendorName: any }) => item.vendorName
    );
    this.selectedVendorItems = parsedVendorTypes.map(
      (item: { vendorId: number; vendorName: string }) => ({
        vendorId: item.vendorId,
        vendorName: item.vendorName,
      })
    );

    const parsedCardTypes = JSON.parse(
      this.getLocalStorage(`cardItems_${this.selectedModule}`)
    );
    this.selectedCardType = (parsedCardTypes || '[]').map(
      (item: { cardTypeName: any }) => item.cardTypeName
    );
    this.selectedCardItems = parsedCardTypes.map(
      (item: { cardTypeId: number; cardTypeName: string }) => ({
        cardTypeId: item.cardTypeId,
        cardTypeName: item.cardTypeName,
      })
    );

    const parsedPaymentStatus = JSON.parse(
      this.getLocalStorage(`statusItems_${this.selectedModule}`)
    );
    this.selectedPaymentStatusType = (parsedPaymentStatus || '[]').map(
      (item: { displayName: any }) => item.displayName
    );
    this.selectedStatusItems = parsedPaymentStatus.map(
      (item: { id: number; displayName: string }) => ({
        id: item.id,
        displayName: item.displayName,
      })
    );

    this.channelItems = this.selectedChannel ? this.selectedChannel : [];
    if (this.selectedChannel.length == 0) {
      if (this.channelsData.length == 0) {
        this.defaultChannelsData.forEach((val: any) => {
          this.channelItems.push(val.channelId);
        });
      } else {
        this.channelsData.forEach((val: any) => {
          this.channelItems.push(val.channelId);
        });
      }
      this.selectedChannel = [];
    }

    console.log('vendor pagination', this.selectedVendorType);

    this.service
      .getDataForPaymentsPage(
        this.paginationFrom,
        this.paginationSize,
        this.startTime,
        this.endTime,
        this.selectedPaymentType,
        this.selectedCardType,
        this.selectedVendorType,
        this.selectedPaymentStatusType,
        this.selectedOperationType,
        this.profileIdValue,
        this.transIdValue,
        this.channelItems
      )
      .subscribe({
        next: (data: any) => {
          this.responseData = data.response;
          this.paginationData = data.pagination;
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });

    this.selectedOperationType = [];
  }

  filters() {
    if (this.selected.start == null) {
    } else {
      this.vendorSettings = {
        singleSelection: false,
        idField: 'vendorId',
        textField: 'vendorName',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 1,
        allowSearchFilter: true,
      };
      this.startdaterange = this.datepipe.transform(
        this.selected.start['$d'],
        'yyyy-MM-dd'
      );
      this.enddaterange = this.datepipe.transform(
        this.selected.end['$d'],
        'yyyy-MM-dd'
      );

      let channelItems = this.selectedChannel ? this.selectedChannel : [];
      if (this.selectedChannel.length == 0) {
        this.channelsData.forEach((val: any) => {
          channelItems.push(val.channelId);
        });
        this.selectedChannel = [];
      }
      if (channelItems.length > 0) {
        let vendortype = this.service.getVendorTypes(
          this.startdaterange,
          this.enddaterange,
          this.enable,
          channelItems
        );
        vendortype.subscribe((data: any) => {
          this.vendors = data;
        });
      }
    }
  }

  openDatepicker(ref: any): void {
    ref.click();
  }

  toggleDisplayDiv() {
    document.getElementById('filtertext')?.classList.add('filtertext');
    document
      .getElementById('filterdownarrow')
      ?.classList.add('filterdownarrow');
    document.getElementById('filtercontent')?.classList.add('filtercontent');
    document.getElementById('filteruparrow')?.classList.add('filteruparrow');
  }

  togglefilterDisplayDiv() {
    document.getElementById('filteruparrow')?.classList.remove('filteruparrow');
    document.getElementById('filtertext')?.classList.remove('filtertext');
    document
      .getElementById('filterdownarrow')
      ?.classList.remove('filterdownarrow');
    document.getElementById('filtercontent')?.classList.remove('filtercontent');
  }

  navigateToPaymentDetails(indexId: string) {
    this.router.navigate(['/paymentdetail'], {
      queryParams: { indexId: indexId },
    });
  }

  convertTimestamp() {
    const currentDate = new Date();

    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    return `${day}${month}${year}${hours}${minutes}${seconds}`;
  }

  exportExcel() {
    this.downloading = true;

    this.service
      .exportPartialData(
        this.paginationFrom,
        this.paginationSize,
        this.startTime,
        this.endTime,
        this.selectedPaymentType,
        this.selectedCardType,
        this.selectedVendorType,
        this.selectedPaymentStatusType,
        this.selectedOperationType,
        this.profileIdValue,
        this.transIdValue,
        this.channelItems
      )
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response.body], {
            type: response.headers.get('content-type'),
          });

          const timestamp = this.convertTimestamp();
          const filename = `NPayDashboard_Payments_Current_Page_Report_${timestamp}.xlsx`;

          FileSaver.saveAs(blob, filename);
          this.toastr.success('Records downloaded successfully');
          this.downloading = false;
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
          this.downloading = false;
        },
      });
  }

  exportExcelAll() {
    this.downloading = true;
    this.convertTime();

    this.service
      .exportAllData(
        this.paginationFrom,
        this.paginationSize,
        this.startTime,
        this.endTime,
        this.selectedPaymentType,
        this.selectedCardType,
        this.selectedVendorType,
        this.selectedPaymentStatusType,
        this.selectedOperationType,
        this.profileIdValue,
        this.transIdValue,
        this.channelItems
      )
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response.body], {
            type: response.headers.get('content-type'),
          });

          const timestamp = this.convertTimestamp();
          const filename = `NPayDashboard_Payments_All_Records_Report_${timestamp}.xlsx`;

          FileSaver.saveAs(blob, filename);
          this.toastr.success('Records downloaded successfully');
          this.downloading = false;
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
          this.downloading = false;
        },
      });
  }

  onFilterChange(): void {
    this.handleOperationAndTransactionType();
    this.setLocalStorage(
      `operationAndTransactionsType_${this.selectedModule}`,
      JSON.stringify(this.selectedOperationType)
    );

    console.log('onfilter selectedoperationtype', this.selectedOperationType);

    this.setLocalStorage(
      `selectedProducts_${this.selectedModule}`,
      JSON.stringify(this.selectedProductsItems)
    );

    this.setLocalStorage(
      `selectedChannels_${this.selectedModule}`,
      JSON.stringify(this.selectedChannelsItems)
    );

    this.setLocalStorage(
      'profileIdValue_' + this.selectedModule,
      this.profileIdValue
    );

    this.setLocalStorage(
      'transIdValue_' + this.selectedModule,
      this.transIdValue
    );

    const storedPaymentTypes = this.getLocalStorage(
      `paymentsTypeData_${this.selectedModule}`
    );
    const completePaymentTypes = storedPaymentTypes
      ? JSON.parse(storedPaymentTypes).filter(
          (item: { paymentTypeName: string }) =>
            this.selectedPaymentItems.some(
              (selectedItem) =>
                selectedItem.paymentTypeName === item.paymentTypeName
            )
        )
      : [];

    this.selectedPaymentType = completePaymentTypes.map(
      (item: { paymentTypeName: any }) => item.paymentTypeName
    );

    this.setLocalStorage(
      `paymentItems_${this.selectedModule}`,
      JSON.stringify([...new Set(completePaymentTypes)])
    );

    const storedVendorItems = this.getLocalStorage(
      `vendorsData_${this.selectedModule}`
    );
    const completeVendorItems = storedVendorItems
      ? JSON.parse(storedVendorItems).filter((item: { vendorName: string }) =>
          this.selectedVendorItems.some(
            (selectedItem) => selectedItem.vendorName === item.vendorName
          )
        )
      : [];

    this.selectedVendorType = completeVendorItems.map(
      (item: { vendorName: any }) => item.vendorName
    );

    this.setLocalStorage(
      `vendorItems_${this.selectedModule}`,
      JSON.stringify([...new Set(completeVendorItems)])
    );

    const storedCardItems = this.getLocalStorage(
      `cardTypesData_${this.selectedModule}`
    );
    const completeCardItems = storedCardItems
      ? JSON.parse(storedCardItems).filter((item: { cardTypeName: string }) =>
          this.selectedCardItems.some(
            (selectedItem) => selectedItem.cardTypeName === item.cardTypeName
          )
        )
      : [];

    this.selectedCardType = completeCardItems.map(
      (item: { cardTypeName: any }) => item.cardTypeName
    );

    this.setLocalStorage(
      `cardItems_${this.selectedModule}`,
      JSON.stringify([...new Set(completeCardItems)])
    );

    const storedStatusItems = this.getLocalStorage(
      `paymentStatusData_${this.selectedModule}`
    );
    const completeStatusItems = storedStatusItems
      ? JSON.parse(storedStatusItems).filter((item: { displayName: string }) =>
          this.selectedStatusItems.some(
            (selectedItem) => selectedItem.displayName === item.displayName
          )
        )
      : [];

    this.selectedPaymentStatusType = completeStatusItems.map(
      (item: { displayName: any }) => item.displayName
    );

    this.setLocalStorage(
      `statusItems_${this.selectedModule}`,
      JSON.stringify([...new Set(completeStatusItems)])
    );

    this.getAllData();
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
}
