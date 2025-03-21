import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { errorMessages } from 'src/assets/errorMessages';
import Swal from 'sweetalert2';
import { DashboardService } from '../dashboard.service';

declare function userCheck(data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-scenarios',
  templateUrl: './scenarios.component.html',
  styleUrls: ['./scenarios.component.css'],
})
export class ScenariosComponent implements OnInit {
  constructor(
    private cookieService: CookieService,
    private toastr: ToastrService,
    private service: DashboardService
  ) {}

  newScenario: {
    startTime: string;
    endTime: string;
    duration: string;
    name: string;
    source: string;
    vendors: {
      vendorId: number;
      vendorName: string;
    }[];
    operationTypes: {
      opTypeId: number;
      opType: string;
      color: string;
      operationTypeName: string;
      transactionType: string | null;
    }[];
    paymentTypes: {
      paymentTypeId: number;
      paymentType: string;
      color: string;
      paymentTypeName: string;
    }[];
    operationStatus: string[];
    threshold: string;
    recipient: any | null;
    remarks: string;
    isActive: string;
    createdAt: string;
    updatedAt: string | null;
    modifiedBy: string;
    serverInfoList: any[] | null;
    vendorStatus: string;
    thresholdSign: string;
    thresholdAction: {
      thresholdActionId: number;
      thresholdActionDescr: string | null;
    };
  } = {
    startTime: '00:00',
    endTime: '23:59',
    duration: '',
    name: '',
    source: 'transactions',
    vendors: [],
    operationTypes: [],
    paymentTypes: [],
    operationStatus: [],
    threshold: '',
    recipient: null,
    remarks: '',
    isActive: 'yes',
    createdAt: '',
    updatedAt: null,
    modifiedBy: '',
    serverInfoList: [],
    thresholdSign: '',
    vendorStatus: 'both',
    thresholdAction: {
      thresholdActionId: 1,
      thresholdActionDescr: null,
    },
  };

  scenarioData: {
    scenarioId: number;
    startTime: string;
    endTime: string;
    duration: string;
    name: string;
    source: string;
    vendors: {
      vendorId: number;
      vendorName: string;
    }[];
    operationTypes: {
      opTypeId: number;
      opType: string;
      color: string;
      operationTypeName: string;
      transactionType: string | null;
    }[];
    paymentTypes: {
      paymentTypeId: number;
      paymentType: string;
      color: string;
      paymentTypeName: string;
    }[];
    operationStatus: string[];
    threshold: any | null;
    recipient: any | null;
    remarks: string;
    isActive: string;
    createdAt: string;
    updatedAt: string | null;
    modifiedBy: string;
    serverInfoList: any[] | null;
    vendorStatus: string;
    thresholdSign: string;
    thresholdAction: {
      thresholdActionId: number;
      thresholdActionDescr: string | null;
    };
  }[] = [];

  enable: any;
  selectedScenario: {
    scenarioId: number;
    startTime: string;
    endTime: string;
    duration: string;
    name: string;
    source: string;
    vendors: {
      vendorId: number;
      vendorName: string;
    }[];
    operationTypes: {
      opTypeId: number;
      opType: string;
      color: string;
      operationTypeName: string;
      transactionType: string | null;
    }[];
    paymentTypes: {
      paymentTypeId: number;
      paymentType: string;
      color: string;
      paymentTypeName: string;
    }[];
    operationStatus: string[];
    threshold: any | null;
    recipient: any | null;
    remarks: string;
    isActive: string;
    createdAt: string;
    updatedAt: string | null;
    modifiedBy: string;
    serverInfoList: any[] | null;
    vendorStatus: string;
    thresholdSign: string;
    thresholdAction: {
      thresholdActionId: number;
      thresholdActionDescr: string | null;
    };
  } = {
    scenarioId: 0,
    startTime: '',
    endTime: '',
    duration: '',
    name: '',
    source: '',
    vendors: [],
    operationTypes: [],
    paymentTypes: [],
    operationStatus: [],
    threshold: null,
    recipient: null,
    remarks: '',
    isActive: '',
    createdAt: '',
    updatedAt: null,
    modifiedBy: '',
    serverInfoList: [],
    vendorStatus: '',
    thresholdSign: '',
    thresholdAction: {
      thresholdActionId: 0,
      thresholdActionDescr: null,
    },
  };

  serverInfoData: {
    vendorName: string;
    dbProductChannel: {
      productChannelId: number;
      productId: {
        productId: number;
        name: string;
        code: string;
      };
      channelId: {
        channelId: number;
        createdAt: string | null;
        name: string;
        code: string;
      };
    };
    endCustomerId: number;
  }[] = [];

  mode: 'add' | 'edit' | 'copy' = 'add';

  showDetailsTable = false;
  paginationSize = 10;
  currentPage = 1;
  paginationSizeDetails = 5;
  currentPageDetails = 1;
  isLoading: boolean = false;
  isLoadingDetails: boolean = false;
  showAddModal = false;
  editableScenario: any = {};
  editableScenarioIndex: number | null = null;
  activeSection: 'basic' | 'triggers' | 'sources' | 'actions' = 'basic';
  sourceValue: 'transactions' | 'vendorStatus' = 'transactions';
  allDay: boolean = true;
  durationValue: number = 0;
  durationUnit: string = 'sec';
  thresholdSign: string = 'le';
  thresholdValue: number = 0;

  paymentTypeSettings: any = {};
  operationTypeSettings: any = {};
  paymentStatusSettings: any = {};
  vendorSettings: any = {};
  productSettings: any = {};
  channelSettings: any = {};

  selectedPaymentItems = new Array();
  selectedOperationItems = new Array();
  selectedStatusItems = new Array();
  selectedProductsItems = new Array();
  selectedChannelsItems = new Array();
  selectedVendorItems = new Array();

  selectedChannelsEndCustomerIds: {
    vendorId: number;
    dbProductChannel: {
      productChannelId: number;
    };
    endCustomerId: number;
  }[] = [];

  selectedPaymentType: {
    paymentTypeId: number;
    paymentType: string;
    color: string;
    paymentTypeName: string;
  }[] = [];
  selectedOperationType: {
    opTypeId: number;
    opType: string;
    color: string;
    operationTypeName: string;
    transactionType: string | null;
  }[] = [];
  selectedPaymentStatusType: string[] = [];
  selectedVendorType: {
    vendorId: number;
    vendorName: string;
  }[] = [];
  selectedProduct: string[] = [];
  selectedChannel: string[] = [];

  operationTypeData: {
    opTypeId: number;
    opType: string;
    color: string;
    operationTypeName: string;
    transactionType: string;
  }[] = [];

  paymentsTypeData: {
    paymentTypeId: number;
    paymentType: string;
    color: string;
    paymentTypeName: string;
  }[] = [];

  vendorsData: {
    vendorId: number;
    vendorName: string;
  }[] = [];

  paymentStatusData: {
    id: number;
    status: string;
    displayName: string;
  }[] = [];

  productsData: {
    productId: number;
    name: string;
  }[] = [];

  channelsData: {
    channelId: number;
    name: string;
  }[] = [];

  defaultChannelsData: {
    channelId: number;
    name: string;
  }[] = [];

  paymentTypeSelectAll: any;
  statusSelectAll: any;
  productSelectAll: any;
  channelSelectAll: any;
  operationTypeSelectAll: any;
  vendorNameSelectAll: any;
  emailId: string = '';
  errors: any = {};

  templateNameInput: string = '';
  emailSubjectInput: string = '';
  emailContentInput: string = '';

  ngOnInit(): void {
    let userRole = this.cookieService.get('userRole');
    updateUserRole(userRole);

    let username = this.cookieService.get('username');
    userCheck(username);

    let userStatus = this.cookieService.get('userStatus');
    if (userStatus) {
      let getUserInfo = this.service.getUserInfo();
      getUserInfo.subscribe(
        (data: any) => {
          this.emailId = data.dbUserDetails.userEmailId;
          this.newScenario.modifiedBy = this.emailId;
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

      if (window.location.href.includes('scenarios')) {
        document.getElementById('scenarios')?.classList.add('nav-active');
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

    this.getFiltersData();
    this.getAllScenariosData();
    this.getServerInfoData();

    this.paymentTypeSettings = {
      singleSelection: false,
      idField: 'paymentTypeId',
      textField: 'paymentTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.operationTypeSettings = {
      singleSelection: false,
      idField: 'opTypeId',
      textField: 'operationTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.paymentStatusSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'displayName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.vendorSettings = {
      singleSelection: false,
      idField: 'vendorId',
      textField: 'vendorName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.productSettings = {
      singleSelection: false,
      idField: 'productId',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.channelSettings = {
      singleSelection: false,
      idField: 'channelId',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.enable = false;
  }

  selectScenario(scenario: any): void {
    this.selectedScenario = scenario;

    this.showDetailsTable = true;
    this.isLoadingDetails = true;

    setTimeout(() => {
      this.isLoadingDetails = false;
    }, 2000);
  }

  goBack(): void {
    this.selectedScenario = {
      scenarioId: 0,
      startTime: '',
      endTime: '',
      duration: '',
      name: '',
      source: '',
      vendors: [],
      operationTypes: [],
      paymentTypes: [],
      operationStatus: [],
      threshold: null,
      recipient: null,
      remarks: '',
      isActive: '',
      createdAt: '',
      updatedAt: null,
      modifiedBy: '',
      serverInfoList: [],
      vendorStatus: '',
      thresholdSign: '',
      thresholdAction: {
        thresholdActionId: 0,
        thresholdActionDescr: null,
      },
    };
    this.showDetailsTable = false;
  }

  showDetails(scenario: any): void {
    this.selectedScenario = scenario;
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
  }

  handlePageChangeDetails(page: number): void {
    this.currentPageDetails = page;
  }

  onPaymentTypeItemSelect(item: any) {
    this.paymentTypeSelectAll = false;
    const index: number = this.selectedPaymentType.findIndex(
      (paymentType) => paymentType.paymentTypeId === item.paymentTypeId
    );
    if (index === -1) {
      this.selectedPaymentType.push(item);
    }
    this.createPaymentType();
  }

  onPaymentTypeItemDeSelect(item: any) {
    this.paymentTypeSelectAll = false;
    const index: number = this.selectedPaymentType.findIndex(
      (paymentType) => paymentType.paymentTypeId === item.paymentTypeId
    );
    if (index !== -1) {
      this.selectedPaymentType.splice(index, 1);
    }
    this.createPaymentType();
  }

  onPaymentTypeSelectAll() {
    this.selectedPaymentType = [...this.paymentsTypeData];
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
      this.selectedPaymentType = this.selectedPaymentItems;
    } else {
      this.selectedPaymentType.forEach((selectedItem) => {
        const matchedPaymentType = this.paymentsTypeData.find(
          (paymentType) =>
            paymentType.paymentTypeId === selectedItem.paymentTypeId
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

  onVendorItemSelect(item: any) {
    this.vendorNameSelectAll = false;
    const vendorName = item.vendorName;
    const index = this.selectedVendorType.indexOf(vendorName);

    if (index !== -1) {
      this.selectedVendorType.splice(index, 1);
    }

    this.selectedVendorType.push(item);
    this.createVendors();
  }

  onVendorItemDeSelect(item: any) {
    this.vendorNameSelectAll = false;

    const index = this.selectedVendorType.findIndex(
      (vendor) => vendor.vendorName === item.vendorName
    );

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
          (vendor) => vendor.vendorName === selectedName.vendorName
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
    this.createProducts();
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

    const selectedVendorIds = this.selectedVendorItems.map(
      (item) => item.vendorId
    );
    this.productsData = [];

    if (this.vendorNameSelectAll) {
      this.serverInfoData.forEach((val: any) => {
        this.productsData.push({
          productId: val.dbProductChannel.productId.productId,
          name: val.dbProductChannel.productId.name + '-' + val.vendorName,
        });
      });
    } else if (selectedVendorIds.length) {
      this.serverInfoData.forEach((val: any) => {
        if (selectedVendorIds.includes(val.vendorId)) {
          this.productsData.push({
            productId: val.dbProductChannel.productId.productId,
            name: val.dbProductChannel.productId.name + '-' + val.vendorName,
          });
        }
      });
    }

    this.selectedProductsItems = this.selectedProductsItems.map((item) =>
      this.productsData.find((product) => product.productId === item.productId)
    );

    this.productsData = this.service.sortDataByName(
      this.productsData.filter(
        (value, index, self) =>
          index === self.findIndex((v) => v.productId === value.productId)
      ),
      'name'
    );

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

    const selectedProductIds = this.selectedProductsItems.map(
      (item) => item.productId
    );
    const selectedVendorIds = this.selectedVendorItems.map(
      (item) => item.vendorId
    );

    this.channelsData = [];
    this.selectedChannelsEndCustomerIds = [];

    if (this.vendorNameSelectAll) {
      selectedVendorIds.push(
        ...this.serverInfoData.map((val: any) => val.vendorId)
      );
    }

    if (this.productSelectAll) {
      selectedProductIds.push(
        ...this.serverInfoData.map(
          (val: any) => val.dbProductChannel.productId.productId
        )
      );
    }

    if (selectedProductIds.length && selectedVendorIds.length) {
      this.serverInfoData.forEach((val: any) => {
        const vendorMatches =
          this.vendorNameSelectAll || selectedVendorIds.includes(val.vendorId);
        const productMatches =
          this.productSelectAll ||
          selectedProductIds.includes(val.dbProductChannel.productId.productId);

        if (vendorMatches && productMatches) {
          const channelName = `${val.dbProductChannel.channelId.name}-${val.dbProductChannel.productId.name}-${val.vendorName}`;

          this.channelsData.push({
            channelId: val.dbProductChannel.channelId.channelId,
            name: channelName,
          });

          const isChannelSelected = this.selectedChannel.some(
            (item) => item === val.dbProductChannel.channelId.channelId
          );

          if (isChannelSelected) {
            const endCustomerId = val.endCustomerId;
            const productChannelId = val.dbProductChannel.productChannelId;
            const vendorId = val.vendorId;

            const exists = this.selectedChannelsEndCustomerIds.some(
              (item) =>
                item.vendorId === vendorId &&
                item.dbProductChannel.productChannelId === productChannelId &&
                item.endCustomerId === endCustomerId
            );

            if (!exists && endCustomerId) {
              this.selectedChannelsEndCustomerIds.push({
                vendorId,
                dbProductChannel: {
                  productChannelId,
                },
                endCustomerId,
              });
            }
          }
        }
      });

      this.selectedChannelsItems = this.selectedChannelsItems.map((item) =>
        this.channelsData.find(
          (channel) => channel.channelId === item.channelId
        )
      );

      this.channelsData = this.service.sortDataByName(
        this.channelsData.filter(
          (value, index, self) =>
            index === self.findIndex((v) => v.channelId === value.channelId)
        ),
        'name'
      );
    }
  };

  onOperationTypeItemSelect(item: any) {
    this.operationTypeSelectAll = false;
    const index: number = this.selectedOperationType.findIndex(
      (opType) => opType.opTypeId === item.opTypeId
    );
    if (index === -1) {
      this.selectedOperationType.push(item);
    }
    this.createOperationType();
  }

  onOperationTypeItemDeSelect(item: any) {
    this.operationTypeSelectAll = false;
    const index: number = this.selectedOperationType.findIndex(
      (opType) => opType.opTypeId === item.opTypeId
    );
    if (index !== -1) {
      this.selectedOperationType.splice(index, 1);
    }
    this.createOperationType();
  }

  onOperationTypeSelectAll() {
    this.selectedOperationType = [...this.operationTypeData];
    this.operationTypeSelectAll = 'select';
    this.createOperationType();
  }

  onOperationTypeDeSelectAll() {
    this.selectedOperationType = [];
    this.operationTypeSelectAll = false;
    this.createOperationType();
  }

  createOperationType = () => {
    this.operationTypeSettings = {
      singleSelection: false,
      idField: 'opTypeId',
      textField: 'operationTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    if (!this.operationTypeSelectAll) {
      this.selectedOperationItems = [];
    }

    if (this.operationTypeSelectAll === 'select') {
      this.selectedOperationItems = this.operationTypeData.map((val: any) => ({
        opTypeId: val.opTypeId,
        operationTypeName: val.operationTypeName,
      }));
      this.selectedOperationType = this.selectedOperationItems;
    } else {
      this.selectedOperationType.forEach((selectedItem) => {
        const matchedOperationType = this.operationTypeData.find(
          (opType) => opType.opTypeId === selectedItem.opTypeId
        );

        if (matchedOperationType) {
          const exists = this.selectedOperationItems.some(
            (item) => item.opTypeId === matchedOperationType.opTypeId
          );

          if (!exists) {
            this.selectedOperationItems.push({
              opTypeId: matchedOperationType.opTypeId,
              operationTypeName: matchedOperationType.operationTypeName,
            });
          }
        }
      });
    }
  };

  addNewScenario() {
    this.newScenario.operationStatus = this.selectedPaymentStatusType;
    this.newScenario.paymentTypes = this.selectedPaymentType;
    this.newScenario.operationTypes = this.selectedOperationType;
    this.newScenario.serverInfoList = this.selectedChannelsEndCustomerIds;
    this.service.addScenario(this.newScenario).subscribe({
      next: (data: any) => {
        this.getAllScenariosData();
        this.currentPage = 1;
        this.toastr.success(errorMessages.scenarioAddedSuccessfully, 'Success');
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.message);
      },
    });
  }

  editNewScenario() {
    this.setupEditScenario(this.newScenario);

    this.newScenario.operationStatus = this.selectedPaymentStatusType;
    this.newScenario.paymentTypes = this.selectedPaymentType;
    this.newScenario.operationTypes = this.selectedOperationType;
    this.newScenario.serverInfoList = this.selectedChannelsEndCustomerIds;

    if (this.mode === 'copy') {
      this.service.addScenario(this.newScenario).subscribe({
        next: (data: any) => {
          this.getAllScenariosData();
          this.currentPage = 1;
          this.toastr.success(
            errorMessages.scenarioCopiedSuccessfully,
            'Success'
          );
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.service.updateScenario(this.newScenario).subscribe({
        next: (data: any) => {
          this.getAllScenariosData();
          this.currentPage = 1;
          this.toastr.success(
            errorMessages.scenarioUpdatedSuccessfully,
            'Success'
          );
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  setupEditScenario(scenario: any) {
    this.newScenario = { ...scenario };
    this.editableScenario = scenario;
    this.setSourceValue();

    if (scenario.duration) {
      const match = scenario.duration.match(/^(\d+)([a-zA-Z]*)$/);
      if (match) {
        this.durationValue = parseInt(match[1], 10);
        this.durationUnit = match[2] || '';
      } else {
        this.durationValue = 0;
        this.durationUnit = '';
      }
    } else {
      this.durationValue = 0;
      this.durationUnit = '';
    }

    this.thresholdValue = scenario.threshold
      ? parseInt(scenario.threshold, 10)
      : 0;

    this.mode = 'edit';
  }

  validateForm(): boolean {
    this.errors = {};

    // Basic Fields
    if (!this.newScenario.isActive) {
      this.errors.isActive = '*Required';
    }
    if (!this.newScenario.name) {
      this.errors.name = '*Required';
    }

    // Sources Fields
    if (this.selectedVendorItems.length === 0) {
      this.errors.selectedVendorItems = '*Required';
    }
    if (this.selectedProductsItems.length === 0) {
      this.errors.selectedProductsItems = '*Required';
    }
    if (this.selectedChannelsItems.length === 0) {
      this.errors.selectedChannelsItems = '*Required';
    }

    // Triggers Fields
    if (!this.newScenario.source) {
      this.errors.source = '*Required';
    } else if (this.newScenario.source === 'transactions') {
      if (!this.newScenario.startTime) {
        this.errors.startTime = '*Required';
      }
      if (!this.newScenario.endTime) {
        this.errors.endTime = '*Required';
      }
      if (this.selectedPaymentItems.length === 0) {
        this.errors.selectedPaymentItems = '*Required';
      }
      if (this.selectedOperationItems.length === 0) {
        this.errors.selectedOperationItems = '*Required';
      }
      if (this.selectedStatusItems.length === 0) {
        this.errors.selectedStatusItems = '*Required';
      }
      if (!this.durationValue) {
        this.errors.durationValue = '*Required';
      }
      if (!this.thresholdValue) {
        this.errors.thresholdValue = '*Required';
      }
      if (!this.thresholdSign) {
        this.errors.thresholdSign = '*Required';
      }
    } else if (this.newScenario.source === 'vendorStatus') {
      if (!this.newScenario.vendorStatus) {
        this.errors.vendorStatus = '*Required';
      }
    }

    // Actions Fields
    if (!this.templateNameInput || this.templateNameInput.trim() === '') {
      this.errors.templateNameInput = '*Required';
    }
    if (!this.emailSubjectInput || this.emailSubjectInput.trim() === '') {
      this.errors.emailSubjectInput = '*Required';
    }
    if (!this.emailContentInput || this.emailContentInput.trim() === '') {
      this.errors.emailContentInput = '*Required';
    }

    this.switchToFirstErrorSection();

    return Object.keys(this.errors).length === 0;
  }

  switchToFirstErrorSection(): void {
    if (this.errors.isActive || this.errors.name) {
      this.activeSection = 'basic';
    } else if (
      this.errors.selectedVendorItems ||
      this.errors.selectedProductsItems ||
      this.errors.selectedChannelsItems
    ) {
      this.activeSection = 'sources';
    } else if (
      this.errors.source ||
      this.errors.startTime ||
      this.errors.endTime ||
      this.errors.selectedPaymentItems ||
      this.errors.selectedOperationItems ||
      this.errors.selectedStatusItems ||
      this.errors.durationValue ||
      this.errors.thresholdValue ||
      this.errors.thresholdSign ||
      this.errors.vendorStatus
    ) {
      this.activeSection = 'triggers';
    } else if (
      this.errors.templateNameInput ||
      this.errors.emailSubjectInput ||
      this.errors.emailContentInput
    ) {
      this.activeSection = 'actions';
    }
  }

  setSourceValue() {
    const validSources = ['transactions', 'vendorStatus'];
    this.sourceValue = validSources.includes(this.newScenario?.source)
      ? (this.newScenario.source as 'transactions' | 'vendorStatus')
      : 'transactions';
  }

  editScenario(
    scenario: any,
    event: MouseEvent,
    mode: 'add' | 'edit' | 'copy' = 'edit'
  ) {
    event.stopPropagation();

    this.newScenario = { ...scenario };
    this.editableScenario = scenario;
    this.setSourceValue();

    if (scenario.duration) {
      const match = scenario.duration.match(/^(\d+)([a-zA-Z]*)$/);
      if (match) {
        this.durationValue = parseInt(match[1], 10);
        this.durationUnit = match[2] || '';
      } else {
        this.durationValue = 0;
        this.durationUnit = '';
      }
    } else {
      this.durationValue = 0;
      this.durationUnit = '';
    }

    this.thresholdValue = scenario.threshold
      ? parseInt(scenario.threshold, 10)
      : 0;

    this.selectedPaymentItems = this.newScenario.paymentTypes;
    this.selectedPaymentType = this.selectedPaymentItems;

    this.newScenario.operationTypes.forEach((val: any) => {
      val.operationTypeName = val.transactionType
        ? val.operationTypeName + ' - ' + val.transactionType
        : val.operationTypeName;
    });
    this.selectedOperationItems = this.newScenario.operationTypes;
    this.selectedOperationType = this.newScenario.operationTypes;

    this.newScenario.operationStatus.forEach((val: string) => {
      if (val === 'Failed') {
        this.selectedStatusItems.push({ id: 2, displayName: 'Failed' });
      } else if (val === 'Succeeded') {
        this.selectedStatusItems.push({ id: 1, displayName: 'Succeeded' });
      }
    });

    this.selectedStatusItems.forEach((item: any) => {
      this.selectedPaymentStatusType.push(item.displayName);
    });

    if (this.newScenario.serverInfoList) {
      this.selectedVendorItems = this.newScenario.serverInfoList.map(
        (info: any) => ({
          vendorId: info.vendorId,
          vendorName: info.vendorName,
        })
      );
      this.selectedVendorType = this.selectedVendorItems.map(
        (item) => item.vendorName
      );

      this.createProducts();

      this.selectedProductsItems = this.newScenario.serverInfoList.map(
        (info: any) => ({
          productId: info.dbProductChannel.productId.productId,
          name: info.dbProductChannel.productId.name + '-' + info.vendorName,
        })
      );

      this.selectedProductsItems = this.selectedProductsItems.map((item) =>
        this.productsData.find(
          (product) => product.productId === item.productId
        )
      );

      this.selectedProductsItems.forEach((item: { productId: string }) => {
        this.selectedProduct.push(item.productId);
      });

      this.createChannels();

      this.selectedChannelsItems = this.newScenario.serverInfoList.map(
        (info: any) => ({
          channelId: info.dbProductChannel.channelId.channelId,
          name: info.dbProductChannel.channelId.name,
        })
      );

      this.selectedChannelsItems = this.selectedChannelsItems.map((item) =>
        this.channelsData.find(
          (channel) => channel.channelId === item.channelId
        )
      );

      this.selectedChannelsItems.forEach((item: { channelId: string }) => {
        this.selectedChannel.push(item.channelId);
      });

      this.serverInfoData.forEach((val: any) => {
        const isChannelSelected = this.selectedChannel.some(
          (item) => item === val.dbProductChannel.channelId.channelId
        );

        if (isChannelSelected) {
          const isMatch = this.selectedProductsItems.some(
            (productItem) =>
              productItem.productId ===
                val.dbProductChannel.productId.productId &&
              this.selectedVendorItems.some(
                (vendorItem) => vendorItem.vendorId === val.vendorId
              ) &&
              productItem.productId === val.dbProductChannel.productId.productId
          );

          if (isMatch) {
            const endCustomerId = val.endCustomerId;
            const productChannelId = val.dbProductChannel.productChannelId;
            const vendorId = val.vendorId;

            const exists = this.selectedChannelsEndCustomerIds.some(
              (item) =>
                item.vendorId === vendorId &&
                item.dbProductChannel.productChannelId === productChannelId &&
                item.endCustomerId === endCustomerId
            );

            if (!exists && endCustomerId) {
              this.selectedChannelsEndCustomerIds.push({
                vendorId,
                dbProductChannel: {
                  productChannelId,
                },
                endCustomerId,
              });
            }
          }
        }
      });
    } else {
      this.selectedChannelsEndCustomerIds = [];
      this.selectedVendorItems = [];
      this.selectedVendorType = [];
      this.selectedProduct = [];
      this.selectedProductsItems = [];
      this.selectedChannel = [];
      this.selectedChannelsItems = [];
    }

    this.mode = mode;
    this.showAddModal = true;
    this.activeSection = 'basic';
  }

  openAddModal() {
    this.mode = 'add';
    this.showAddModal = true;
    this.activeSection = 'basic';
    this.setSourceValue();
  }

  closeAddModal() {
    this.newScenario = {
      startTime: '00:00',
      endTime: '23:59',
      duration: '',
      name: '',
      source: 'transactions',
      vendors: [],
      operationTypes: [],
      paymentTypes: [],
      operationStatus: [],
      threshold: '',
      recipient: null,
      remarks: '',
      isActive: 'yes',
      createdAt: '',
      updatedAt: null,
      modifiedBy: this.emailId,
      serverInfoList: [],
      vendorStatus: 'both',
      thresholdSign: '',
      thresholdAction: {
        thresholdActionId: 1,
        thresholdActionDescr: null,
      },
    };
    this.thresholdSign = 'le';
    this.thresholdValue = 0;
    this.durationUnit = 'sec';
    this.durationValue = 0;
    this.editableScenario = {};
    this.showAddModal = false;
  }

  switchSection(section: 'basic' | 'triggers' | 'sources' | 'actions') {
    this.activeSection = section;
  }

  saveNewScenario() {
    if (this.mode === 'add') {
      if (this.validateForm()) {
        this.addNewScenario();
        this.closeAddModal();
        this.resetForm();
      }
    } else if (this.mode === 'edit' || this.mode === 'copy') {
      if (this.validateForm()) {
        this.editNewScenario();
        this.closeAddModal();
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.selectedStatusItems = [];
    this.selectedPaymentStatusType = [];
    this.selectedPaymentItems = [];
    this.selectedPaymentType = [];
    this.selectedOperationType = [];
    this.selectedOperationItems = [];
    this.selectedChannelsEndCustomerIds = [];
    this.selectedVendorItems = [];
    this.selectedVendorType = [];
    this.selectedProduct = [];
    this.selectedProductsItems = [];
    this.selectedChannel = [];
    this.selectedChannelsItems = [];

    this.newScenario = {
      startTime: '00:00',
      endTime: '23:59',
      duration: '',
      name: '',
      source: 'transactions',
      vendors: [],
      operationTypes: [],
      paymentTypes: [],
      operationStatus: [],
      threshold: '',
      recipient: null,
      remarks: '',
      isActive: 'yes',
      createdAt: '',
      updatedAt: null,
      modifiedBy: this.emailId,
      serverInfoList: [],
      vendorStatus: 'both',
      thresholdSign: '',
      thresholdAction: {
        thresholdActionId: 1,
        thresholdActionDescr: null,
      },
    };
    this.thresholdSign = 'le';
    this.thresholdValue = 0;
    this.durationUnit = 'sec';
    this.durationValue = 0;
  }

  switchSource(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sourceValue = target.value as 'transactions' | 'vendorStatus';
    }
  }

  onAllDayChange(): void {
    if (this.allDay) {
      this.newScenario.startTime = '00:00';
      this.newScenario.endTime = '23:59';
    }
  }

  onTimeChange(): void {
    if (
      this.newScenario.startTime === '00:00' &&
      this.newScenario.endTime === '23:59'
    ) {
      this.allDay = true;
    } else {
      this.allDay = false;
    }
  }

  updateDurationValue(): void {
    if (
      this.durationValue === null ||
      this.durationValue === undefined ||
      this.durationValue === 0
    ) {
      this.newScenario.duration = '';
    } else {
      this.newScenario.duration = `${this.durationValue}${this.durationUnit}`;
    }
  }

  updateThresholdValue(): void {
    if (
      this.thresholdValue === null ||
      this.thresholdValue === undefined ||
      this.thresholdValue === 0
    ) {
      this.newScenario.threshold = '';
    } else {
      this.newScenario.threshold = `${this.thresholdValue}`;
    }
  }

  updateThresholdSign(): void {
    this.newScenario.thresholdSign = this.thresholdSign;
  }

  getAllScenariosData() {
    this.isLoading = true;
    this.service.getScenarioData().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.scenarioData = data.response;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteScenario(index: number, event: Event) {
    event.stopPropagation();
    const confirmation = confirm(
      'Are you sure you want to delete this scenario?'
    );
    if (confirmation) {
      this.service.deleteScenario(index).subscribe({
        next: (data: any) => {
          this.toastr.success(
            errorMessages.scenarioDeletedSuccessfully,
            'Success'
          );
          this.getAllScenariosData();
          this.currentPage = 1;
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  getServerInfoData() {
    this.isLoading = true;
    this.service.getServerInfoList().subscribe({
      next: (data: any) => {
        this.serverInfoData = data;

        let vendor: {
          vendorId: any;
          vendorName: any;
          productChannelId: any;
          productId: any;
          productName: any;
          channelId: any;
          channelName: any;
          endCustomerId: any;
        }[] = [];

        let product: {
          productChannelId: any;
          productId: any;
          productName: any;
          channelId: any;
          channelName: any;
          vendorName: any;
        }[] = [];
        let channelsData: {
          channelId: any;
          name: string;
          productId: number;
          vendorName: string;
        }[] = [];

        this.serverInfoData.forEach((val: any) => {
          if (
            !this.vendorsData.some((vendor) => vendor.vendorId === val.vendorId)
          ) {
            this.vendorsData.push({
              vendorName: val.vendorName,
              vendorId: val.vendorId,
            });
          }

          if (
            !product.some(
              (prod) =>
                prod.productChannelId ===
                  val.dbProductChannel.productChannelId &&
                prod.productId === val.dbProductChannel.productId.productId &&
                prod.vendorName === val.vendorName
            )
          ) {
            product.push({
              productChannelId: val.dbProductChannel.productChannelId,
              productId: val.dbProductChannel.productId.productId,
              productName:
                val.dbProductChannel.productId.name + '-' + val.vendorName,
              channelId: val.dbProductChannel.channelId.channelId,
              channelName: val.dbProductChannel.channelId.name,
              vendorName: val.vendorName,
            });
          }

          if (
            !channelsData.some(
              (channel) =>
                channel.channelId ===
                  val.dbProductChannel.channelId.channelId &&
                channel.productId ===
                  val.dbProductChannel.productId.productId &&
                channel.vendorName === val.vendorName
            )
          ) {
            channelsData.push({
              channelId: val.dbProductChannel.channelId.channelId,
              name:
                val.dbProductChannel.channelId.name +
                '-' +
                val.dbProductChannel.productId.name +
                '-' +
                val.vendorName,
              productId: val.dbProductChannel.productId.productId,
              vendorName: val.vendorName,
            });
          }
        });

        this.createVendors();
        this.createProducts();
        this.createChannels();
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  getFiltersData() {
    this.service.getAllPaymentTypes().subscribe({
      next: (data: any) => {
        this.paymentsTypeData = this.service.sortDataByName(
          data,
          'paymentTypeName'
        );
        this.createPaymentType();
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });

    this.service.getAllPaymentStatus().subscribe({
      next: (data: any) => {
        this.paymentStatusData = this.service.sortDataByName(
          data,
          'displayName'
        );
        this.createPaymentStatus();
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });

    this.service.getOperationTypesData().subscribe({
      next: (data: any) => {
        this.operationTypeData = this.service.sortDataByName(
          data,
          'operationTypeName'
        );
        this.operationTypeData.forEach((val: any) => {
          val.operationTypeName = val.transactionType
            ? val.operationTypeName + ' - ' + val.transactionType
            : val.operationTypeName;
        });

        this.createOperationType();
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  insertVariable(event: any, field: string) {
    const selectedValue = event.target.value;
    if (!selectedValue) return; // Return if no valid option is selected

    if (field === 'subject') {
      this.emailSubjectInput = this.insertAtCursor(
        'emailSubjectInput',
        this.emailSubjectInput,
        selectedValue
      );
    } else if (field === 'content') {
      this.emailContentInput = this.insertAtCursor(
        'emailContentInput',
        this.emailContentInput,
        selectedValue
      );
    }

    // Reset the dropdown after selection
    event.target.value = '';
  }

  insertAtCursor(
    elementId: string,
    originalText: string,
    textToInsert: string
  ): string {
    const inputElement = document.getElementById(elementId) as
      | HTMLInputElement
      | HTMLTextAreaElement;

    if (!inputElement) return originalText;

    const startPos = inputElement.selectionStart || 0;
    const endPos = inputElement.selectionEnd || 0;

    return (
      originalText.substring(0, startPos) +
      textToInsert + " " +
      originalText.substring(endPos)
    );
  }
}
