import { Component, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import { DashboardService } from '../dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { errorMessages } from '../../assets/errorMessages';

declare function userCheck(data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  startDate: any;
  endDate: any;
  selected: any = { startDate: null, endDate: null };

  selectedPaymentType: string[] = [];
  selectedCardType: string[] = [];
  selectedVendorType: string[] = [];
  selectedProduct: string[] = [];
  selectedChannel: string[] = [];
  profileIdValue: string = '';

  startTime: number = 0;
  endTime: number = 0;

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
    idField: 'id',
    textField: 'paymentTypeName',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
  };

  responseData: {
    name: string;
    email: string;
    groupId: string;
    profileId: string;
    vendor: string;
    paymentType: string;
    cardType: string;
    date: string;
    productName: string;
    channelName: string;
    indexId: string;
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

  paginationSize: number = 10;

  showErrorMessage: boolean = false;
  isLoading: boolean = false;

  cardTypeSelectAll: any;
  vendorNameSelectAll: any;
  paymentTypeSelectAll: any;
  productSelectAll: any;
  channelSelectAll: any;

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

  paymentTypeMapping: { [key: string]: string } = {};
  cardTypeMapping: { [key: string]: string } = {};
  vendorMapping: { [key: string]: string } = {};
  productMapping: { [key: string]: string } = {};
  channelMapping: { [key: string]: string } = {};

  paymentTypeSettings: any = {};
  cardTypeSettings: any = {};
  vendorSettings: any = {};
  productSettings: any = {};
  channelSettings: any = {};

  selectedPaymentItems = new Array();
  selectedCardItems = new Array();
  selectedVendorItems = new Array();
  selectedProductsItems = new Array();
  selectedChannelsItems = new Array();
  channelItems = new Array();

  selectedModule: string = 'customers';

  paginationFrom: number =
    (this.paginationData.currentPage - 1) * this.paginationSize;

  constructor(
    private service: DashboardService,
    private cookieService: CookieService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
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
    this.cardTypeSelectAll = true;
    this.vendorNameSelectAll = true;
    this.paymentTypeSelectAll = true;

    this.profileIdValue =
      this.getLocalStorage('profileIdValue_' + this.selectedModule) || '';

    const savedVendorItems = this.getLocalStorage(
      `vendorItems_${this.selectedModule}`
    );
    const savedCardItems = this.getLocalStorage(
      `cardItems_${this.selectedModule}`
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

    if (!savedPaymentItems && !savedVendorItems && !savedCardItems) {
      this.getAllData();
    }

    let username = this.cookieService.get('username');
    userCheck(username);

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
    setTimeout(() => {
      var hh = (<HTMLInputElement>document.getElementById('startDate')).value;
    }, 1000);
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
  }

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

  handleResetFilters() {
    this.selected = {
      start: dayjs().startOf('month'),
      end: dayjs().endOf('month'),
    };

    this.selectedPaymentType = [];
    this.selectedVendorType = [];
    this.selectedCardType = [];
    this.selectedPaymentItems = [];
    this.selectedVendorItems = [];
    this.selectedCardItems = [];
    this.selectedProductsItems = [];
    this.selectedChannelsItems = [];
    this.channelsData = [];
    this.selectedProduct = [];
    this.selectedChannel = [];
    this.channelSelectAll = false;
    this.profileIdValue = '';
    this.paymentTypeSelectAll = false;
    this.cardTypeSelectAll = false;
    this.vendorNameSelectAll = false;
  }

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

    this.service
      .getCustomersFilters(
        this.startTime,
        this.endTime,
        this.selectedPaymentType,
        this.selectedVendorType,
        this.selectedCardType,
        this.selectedProduct,
        this.channelItems,
        this.paginationFrom,
        this.paginationSize,
        this.profileIdValue
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
          this.toastr.error(error.error.message);
          this.isLoading = false;
          this.showErrorMessage = true;
          if (error.error.message.endsWith('expired')) {
            let res = this.service.logoutUser();
            window.location.href = '/login';
          }
        },
      });
  }

  handlePageChange(event: number) {
    this.paginationData.currentPage = event;
    this.paginationFrom =
      (this.paginationData.currentPage - 1) * this.paginationSize;

    const parsedPaymentTypes = JSON.parse(
      this.getLocalStorage(`paymentItems_${this.selectedModule}`) || '[]'
    );
    this.selectedPaymentType = (
      parsedPaymentTypes as { paymentTypeName: any }[]
    ).map((item) => item.paymentTypeName);
    this.selectedPaymentItems = parsedPaymentTypes.map(
      (item: { paymentTypeId: number; paymentTypeName: string }) => ({
        paymentTypeId: item.paymentTypeId,
        paymentTypeName: item.paymentTypeName,
      })
    );

    const parsedVendorTypes = JSON.parse(
      this.getLocalStorage(`vendorItems_${this.selectedModule}`) || '[]'
    );
    this.selectedVendorType = (parsedVendorTypes as { vendorName: any }[]).map(
      (item) => item.vendorName
    );
    this.selectedVendorItems = parsedVendorTypes.map(
      (item: { vendorId: number; vendorName: string }) => ({
        vendorId: item.vendorId,
        vendorName: item.vendorName,
      })
    );

    const parsedCardTypes = JSON.parse(
      this.getLocalStorage(`cardItems_${this.selectedModule}`) || '[]'
    );
    this.selectedCardType = (parsedCardTypes as { cardTypeName: any }[]).map(
      (item) => item.cardTypeName
    );
    this.selectedCardItems = parsedCardTypes.map(
      (item: { cardTypeId: number; cardTypeName: string }) => ({
        cardTypeId: item.cardTypeId,
        cardTypeName: item.cardTypeName,
      })
    );

    this.profileIdValue =
      this.getLocalStorage(`profileIdValue_${this.selectedModule}`) || '';

    this.selectedChannel = JSON.parse(
      this.getLocalStorage(`selectedChannels_${this.selectedModule}`) || '[]'
    ).map((item: { channelId: any }) => item.channelId);

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

    this.service
      .getDataForCustomersPage(
        this.paginationFrom,
        this.paginationSize,
        this.startTime,
        this.endTime,
        this.selectedPaymentType,
        this.selectedVendorType,
        this.selectedCardType,
        this.profileIdValue,
        this.selectedChannel
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
  }

  navigateToCustomerDetails(indexId: string) {
    this.router.navigate(['/customerdetails'], {
      queryParams: { indexID: indexId },
    });
  }

  onFilterChange(): void {
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

    const storedPaymentTypes = this.getLocalStorage(
      `paymentsTypeData_${this.selectedModule}`
    );

    const completePaymentTypes = storedPaymentTypes
      ? (
          JSON.parse(storedPaymentTypes) as { paymentTypeName: string }[]
        ).filter((item) =>
          this.selectedPaymentItems.some(
            (selectedItem) =>
              selectedItem.paymentTypeName === item.paymentTypeName
          )
        )
      : [];

    this.selectedPaymentType = completePaymentTypes.map(
      (item) => item.paymentTypeName
    );

    this.setLocalStorage(
      `paymentItems_${this.selectedModule}`,
      JSON.stringify(completePaymentTypes)
    );

    const storedVendorItems = this.getLocalStorage(
      `vendorsData_${this.selectedModule}`
    );

    const completeVendorItems = storedVendorItems
      ? (JSON.parse(storedVendorItems) as { vendorName: string }[]).filter(
          (item) =>
            this.selectedVendorItems.some(
              (selectedItem) => selectedItem.vendorName === item.vendorName
            )
        )
      : [];

    this.selectedVendorType = completeVendorItems.map(
      (item) => item.vendorName
    );

    this.setLocalStorage(
      `vendorItems_${this.selectedModule}`,
      JSON.stringify(completeVendorItems)
    );

    const storedCardItems = this.getLocalStorage(
      `cardTypesData_${this.selectedModule}`
    );

    const completeCardItems = storedCardItems
      ? (JSON.parse(storedCardItems) as { cardTypeName: string }[]).filter(
          (item) =>
            this.selectedCardItems.some(
              (selectedItem) => selectedItem.cardTypeName === item.cardTypeName
            )
        )
      : [];

    this.selectedCardType = completeCardItems.map((item) => item.cardTypeName);

    this.setLocalStorage(
      `cardItems_${this.selectedModule}`,
      JSON.stringify(completeCardItems)
    );

    this.getAllData();
  }

  private setLocalStorage(name: string, value: string): void {
    if (value === null || value === undefined) {
      return;
    }
    localStorage.setItem(name, value);
  }

  private getLocalStorage(name: string): string | null {
    const value = localStorage.getItem(name);
    return value || null;
  }
}
