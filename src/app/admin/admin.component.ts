import Swal from 'sweetalert2';
import { DashboardService } from '../dashboard.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { errorMessages } from 'src/assets/errorMessages';
import { ViewChild } from '@angular/core';

declare function userCheck(data: any): any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  @ViewChild('myModal') myModal: any;

  dummydata: any;
  enable: any;
  activeUser: any;
  userdata = new Array();
  userproduct: any = [];
  userchannel: any = [];
  activeUserData = new Array();
  isDisabled: boolean = true;
  isLoading: boolean = false;
  clickedUserEmailId: string = '';
  activeRowIndex: number = -1;

  allProductsData: {
    productId: number;
    name: string;
    code: string | null;
    productChannels: {
      channelId: number;
      createdAt: string | null;
      name: string;
      code: string | null;
    }[];
  }[] = [];
  productsChannelsList: any;
  products: any;
  channels: any;

  allUsersData: {
    userDetailsId: number;
    userFullName: string;
    userEmailId: string;
    role?:
      | {
          roleId: number;
          roleName: string;
        }
      | undefined;
    updatedBy: string;
    updatedAt: string;
    dbStatus?:
      | {
          statusId: number;
          status: string;
        }
      | undefined;
    productChannels: {
      productChannelId: number;
      productId: {
        productId: number;
        name: string;
        code: string | null;
      };
      channelId: {
        channelId: number;
        createdAt: string | null;
        name: string;
        code: string | null;
      };
    }[];
  }[] = [];

  clickedUserData: Partial<{
    userDetailsId: number;
    userFullName: string;
    userEmailId: string;
    role?:
      | {
          roleId: number;
          roleName: string;
        }
      | undefined;
    updatedBy: string;
    updatedAt: string;
    dbStatus?:
      | {
          statusId: number;
          status: string;
        }
      | undefined;
    productChannels: {
      productChannelId: number;
      productId: {
        productId: number;
        name: string;
        code: string | null;
      };
      channelId: {
        channelId: number;
        createdAt: string | null;
        name: string;
        code: string | null;
      };
    }[];
  }> = {};

  productChannelDataByEmail: {
    productChannelId: number;
    productName: string;
    channelName: string;
  }[] = [];

  productDropdownSettings = {
    singleSelection: true,
    idField: 'productName',
    textField: 'name',
    allowSearchFilter: true,
  };

  channelDropdownSettings = {
    idField: 'channelName',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
  };

  constructor(
    private service: DashboardService,
    public datepipe: DatePipe,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    let username = this.cookieService.get('username');
    userCheck(username);
    this.enable = false;
    if (window.location.href.includes('admin')) {
      document.getElementById('admin')?.classList.add('nav-active');
    }

    let userStatus = this.cookieService.get('userStatus');
    if (userStatus == 'true') {
      this.getProductAndChannelData();
      this.getUsersData();
    } else {
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

  openUser(user: any) {
    const previousActiveUserElement = document.getElementById(
      this.activeUser?.userEmailId
    );
    if (previousActiveUserElement) {
      previousActiveUserElement.classList.remove('activeuser');
    }

    this.activeUser = user;

    const newActiveUserElement = document.getElementById(
      this.activeUser?.userEmailId
    );
    if (newActiveUserElement) {
      newActiveUserElement.classList.add('activeuser');
    }

    this.activeUser.name = user.userFullName;

    this.clickedUserEmailId = this.activeUser?.userEmailId;

    document.getElementById('mainuser')?.classList.remove('userdata');

    this.clickedUserData = {};
    this.productChannelDataByEmail = [];

    this.service.getUserDetailsByEmail(this.clickedUserEmailId).subscribe({
      next: (data: any) => {
        this.clickedUserData = data ?? {};
        this.productChannelDataByEmail =
          this.transformProductChannelDataByEmail(
            this.clickedUserData?.productChannels ?? []
          );
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  createProduct() {
    if (this.userproduct.length > 0 && this.userchannel.length > 0) {
      this.userchannel.forEach((eachChannel: string) => {
        let userdata = {
          product: this.userproduct[0],
          publication: eachChannel,
        };
        this.userdata[this.activeUser.email] = this.userdata[
          this.activeUser.email
        ]
          ? this.userdata[this.activeUser.email]
          : [];
        this.userdata[this.activeUser.email].push(userdata);
        this.activeUserData = this.userdata[this.activeUser.email];
      });
    } else {
      this.toastr.info(errorMessages.selectBothProductAndChannel);
    }
  }

  deleteproduct(index: any) {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (isConfirmed) {
      this.service
        .deleteProductChannel(this.clickedUserEmailId, index)
        .subscribe({
          next: (data: any) => {
            const userIndex = this.allUsersData.findIndex(
              (user) => user.userEmailId === this.clickedUserEmailId
            );

            if (userIndex !== -1) {
              this.allUsersData[userIndex] = data;
            }
            this.clickedUserData = data;
            this.productChannelDataByEmail =
              this.transformProductChannelDataByEmail(
                this.clickedUserData.productChannels
              );
            this.toastr.success(errorMessages.recordDeletedSuccessfully);
          },
          error: (error: any) => {
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.toastr.info(errorMessages.deletionCanceledByUser);
    }
  }

  getProductAndChannelData() {
    this.service.getAllProducts().subscribe({
      next: (data: any) => {
        this.allProductsData = data;

        const allNewData = this.transformProductChannelDataByEmail(
          this.allProductsData
        );

        this.products = [];

        allNewData.forEach((eachProductChannel: any) => {
          const existingProduct = this.products.includes(
            eachProductChannel.productName
          );

          if (!existingProduct) {
            this.products.push(eachProductChannel.productName);
          }
        });
      },

      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  getUsersData() {
    this.isLoading = true;

    this.service.getAdminUsers().subscribe({
      next: (data: any) => {
        this.allUsersData = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
        this.isLoading = false;
        if (error.error.message.endsWith('expired')) {
          let res = this.service.logoutUser();
          window.location.href = '/login';
        }
      },
    });
  }

  transformProductChannelDataByEmail(inputData: any) {
    return inputData.map((item: any) => ({
      productChannelId: item.productChannelId,
      productName: item.productId.name,
      productID: item.productId.productId,
      channelName: item.channelId.name,
      channelID: item.channelId.channelId,
    }));
  }

  onProductChange() {
    const allNewData = this.transformProductChannelDataByEmail(
      this.allProductsData
    );

    this.channels = [];

    this.isDisabled = false;
    allNewData.forEach((eachProductChannel: any) => {
      if (eachProductChannel.productName === this.userproduct[0]) {
        this.channels.push(eachProductChannel.channelName);
      }
    });
  }

  addProductAndChannel() {
    if (Object.keys(this.clickedUserData).length > 0) {
      if (this.clickedUserData.dbStatus?.status === 'active') {
        const email: string = this.clickedUserEmailId;
        const role: string | undefined = this.clickedUserData.role?.roleName;
        const status = this.clickedUserData.dbStatus?.status;
        let ids: number[] = this.getPublicationChannelIds();

        const allNewData = this.transformProductChannelDataByEmail(
          this.allProductsData
        );

        allNewData.forEach((eachObject: any) => {
          if (
            eachObject.productName === this.userproduct[0] &&
            this.userchannel.length === 0
          ) {
            this.toastr.info(errorMessages.selectChannelFirst);
          }

          this.userchannel.forEach((eachChannel: string) => {
            if (
              eachObject.productName === this.userproduct[0] &&
              eachObject.channelName === eachChannel
            ) {
              const productChannelId = eachObject.productChannelId;
              if (!ids.includes(productChannelId)) {
                ids.push(productChannelId);
              }
            }
          });
        });
        if (role !== undefined && status !== undefined) {
          this.service.saveProducts(email, role, status, ids).subscribe({
            next: (data: any) => {
              const userIndex = this.allUsersData.findIndex(
                (user) => user.userEmailId === email
              );

              if (userIndex !== -1) {
                this.allUsersData[userIndex] = data;
              }
              this.clickedUserData = data;
              this.productChannelDataByEmail =
                this.transformProductChannelDataByEmail(
                  this.clickedUserData.productChannels
                );
              this.toastr.success(
                errorMessages.productAndChannelAddedSuccessfully
              );
              this.userproduct = [];
              this.userchannel = [];
              this.isDisabled = true;
            },

            error: (error: any) => {
              this.toastr.error(error.error.message);
            },
          });
        } else {
          this.toastr.error(errorMessages.undefinedRole);
        }
      } else {
        this.toastr.error(errorMessages.cannotAddProductAndPublication);
      }
    }
  }

  editRoleAndStatus() {
    const email: string = this.clickedUserEmailId;
    const role: string | undefined = this.clickedUserData.role?.roleName;
    const status = this.clickedUserData.dbStatus?.status;
    let ids: number[] = this.getPublicationChannelIds();

    if (role !== undefined && status !== undefined) {
      this.service.saveProducts(email, role, status, ids).subscribe({
        next: (data: any) => {
          const userIndex = this.allUsersData.findIndex(
            (user) => user.userEmailId === email
          );

          if (userIndex !== -1) {
            this.allUsersData[userIndex] = data;
          }

          this.clickedUserData = data;
          this.productChannelDataByEmail =
            this.transformProductChannelDataByEmail(
              this.clickedUserData.productChannels
            );
          this.toastr.success(errorMessages.userInformationUpdatedSuccessfully);
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  getPublicationChannelIds() {
    const ids: number[] = [];
    this.clickedUserData.productChannels?.forEach((eachObject: any) => {
      ids.push(eachObject.productChannelId);
    });
    return ids;
  }

  setActiveRow(index: number) {
    this.activeRowIndex = index;
    this.userproduct = [];
    this.userchannel = [];
  }

  dropdownsChanged: boolean = false;

  resetDropdownsChanged() {
    this.dropdownsChanged = false;
  }

  onDropdownChange() {
    this.dropdownsChanged = true;
  }

  openModal() {
    this.resetDropdownsChanged();
    this.myModal.show();
  }
}
