import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

declare function userCheck(data: any): any;
declare function updateUserRole(userRole: any): any;

@Component({
  selector: 'app-manageCustomers',
  templateUrl: './manageCustomers.component.html',
  styleUrls: ['./manageCustomers.component.css'],
})
export class ManageCustomersComponent implements OnInit {
  showErrorMessage: string = '';
  isLoading: boolean = false;
  isReadonly:boolean = false;
  responseData: {
    customerId:string;
    customerName: string;
    adminEmail: string;
    currentDBVersion: string;
    availableDBVersion: string;
    customerStatus: string;
    lastUpdatedDate: string;
    modifiedBy:string;
    selected:boolean;
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

  paginationSize: number = 8;

  paginationFrom: number =
    (this.paginationData.currentPage - 1) * this.paginationSize;
  
  adddisplayStyle: string='none';
  formHeading:string='Add New Cutomer';
  customerId:string='';
  customer:{
    customerName:string,
    adminEmail:string,
    domain:string,
    clientId:string,
    clientSecret:string,
    redirectUri:string,
    customerStatus:string,
    availableDBVersion:string,
    currentDBVersion:string
  }={
    customerName:'',
    adminEmail:'',
    domain:'',
    clientId:'',
    clientSecret:'',
    redirectUri:'',
    customerStatus:'Active',
    availableDBVersion:'',
    currentDBVersion:''
  }
  id_token:any;
  userdata:any;
  constructor(
    public datepipe: DatePipe,
    private service: DashboardService,
    private cookieService: CookieService,
    private router: Router,
    private toastr: ToastrService
    
  ) {}

  ngOnInit(): void {
    
    this.id_token = this.cookieService.get('encrptedToken');
    
    if(this.cookieService.get('organization') == 'global_auth'){
      document.getElementById('list')?.classList.remove('hidesidebar');
        let getUserInfo = this.service.getUserInfo();
        getUserInfo.subscribe(
          (data: any) => {
              this.userdata = data;        
              this.cookieService.set('userEmailId',this.userdata.dbUserDetails.userEmailId);
              this.cookieService.set('encrptedToken', this.userdata.encrptedToken,1);
              this.cookieService.set('username',this.userdata.dbUserDetails.userFullName,1);

              userCheck(this.userdata.dbUserDetails.userFullName);
              this.cookieService.set('userStatus', 'true');

              document.getElementById('mainNav')?.classList.remove('hidenav');
              document.getElementById('routerdata')?.classList.remove('hidenav');
              document.getElementById('page-top')?.classList.remove('hidenav');
              document.getElementById('loader')?.classList.add('hideloader');
              document.getElementById('overlay')?.classList.add('hideloader');

              this.service.getManageCustomerList().subscribe({
                next: (data: any) => {
                  this.sortData(data.data)
                  
                },
                error: (error: any) => {
                  this.toastr.error(error.error.message);
                },
              });
             
              
              
            
          },
          (error: any) => {
            document.getElementById('loader')?.classList.add('hideloader');
            document.getElementById('overlay')?.classList.add('hideloader');

            
            setTimeout(() => {
              let res = this.service.logoutUser();
              window.location.href = '/login';
            }, 4000);
          }
        );
      
    }
    else{
      window.location.href = '/login';
    }
  }

  sortData(data:any){
    const sortedData = data.sort((a:any, b:any) => b.customerId - a.customerId);
    sortedData.forEach((val:any) => {
      let date = val.lastUpdatedDate.replace("IST", "+05:30");
          date = new Date(date)
      val.lastUpdatedDate = this.datepipe.transform(
        date,
        'MMM dd, YYYY'
      );
    })
    this.responseData = sortedData;
    this.paginationData.totalRecord = this.responseData.length
  }

  deleteCustomer(id:string){
    const customerDetails:any={}
    customerDetails.loggedInUserEmail = this.cookieService.get('userEmailId')
    customerDetails.data={}

    this.service.deleteCustomer(id,customerDetails).subscribe({
      next: (data: any) => {
        this.toastr.success(data.message)
        document.getElementById(id)?.remove()
      },
      error: (error: any) => {
        this.toastr.error(error.error.message);
      },
    });
    
  }

  selectAll(){
    for (let i = 0; i < this.responseData.length; i++) {
      this.responseData[i].selected = !this.responseData[i].selected;
    }
  }
  
  handlePageChange(event: number){
    this.paginationData.currentPage = event
  }

  openPopup(headline:string,id:string){
    this.adddisplayStyle = 'block'
    this.formHeading = headline === 'add' ? 'Add New Cutomer' : 'Edit Customer'
    this.customerId=id;
    this.isReadonly = id ? true : false;
    if(this.customerId){
      this.service.getCustomerDetails(this.customerId).subscribe({
        next: (data: any) => {
          this.customer.customerName = data.data.customerName
          this.customer.adminEmail = data.data.adminEmail
          this.customer.domain = data.data.auth0Configuration.domain
          this.customer.clientId = data.data.auth0Configuration.clientId
          // this.customer.clientSecret = data.data.auth0Configuration.clientSecret
          this.customer.redirectUri =  data.data.auth0Configuration.redirectURI
          this.customer.clientSecret = data.data.auth0Configuration.clientSecret
          this.customer.currentDBVersion = data.data.currentDBVersion
          this.customer.availableDBVersion = data.data.availableDBVersion
          this.customer.customerStatus = data.data.customerStatus
        },
        error: (error: any) => {
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  closePopup(){
    this.adddisplayStyle = 'none'
    this.customer = {
      customerName:'',
      adminEmail:'',
      domain:'',
      clientId:'',
      clientSecret:'',
      redirectUri:'',
      customerStatus:'',
      availableDBVersion:'',
      currentDBVersion:''
    }
    this.customerId = ''
    this.isReadonly = false;
    this.showErrorMessage = '';
  }

  saveCustomer(){
    
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(this.customer.adminEmail)) {
      this.showErrorMessage = '';
      const customerDetails:any={}
      customerDetails.loggedInUserEmail = this.cookieService.get('userEmailId')
        
      const auth0Configuration={
        'domain':this.customer.domain,
        'clientId':this.customer.clientId,
        'clientSecret':this.customer.clientSecret,
        'redirectURI':this.customer.redirectUri
      }
      const data = {
        'customerName':this.customer.customerName,
        'adminEmail':this.customer.adminEmail,
        // 'currentDBVersion':this.customer.currentDBVersion ? this.customer.currentDBVersion : 'v1.0',
        // 'availableDBVersion':this.customer.availableDBVersion ? this.customer.availableDBVersion : 'v1.0',
        'customerStatus':this.customer.customerStatus ? this.customer.customerStatus : 'Active',
        'auth0Configuration':auth0Configuration
      }
      customerDetails.data = data
      if(this.customerId===''){
        this.service.addCustomerDetails(customerDetails).subscribe({
          next: (data: any) => {
            if(data.status=="success"){
              this.toastr.success(data.message)
              setTimeout(() => {
                this.closePopup()
              },500)
            }
            else{
              this.toastr.error(data.message)
            }
            
            if(data.data){
              const customerdata = this.responseData
              customerdata.push(data.data)
              this.sortData(customerdata)
            }
           
          },
          error: (error: any) => {
            this.toastr.error(error.error.message);
          },
        });
      }
      else{
        
        this.service.editCustomerDetails(customerDetails,this.customerId).subscribe({
          next: (data: any) => {
            if(data.status=="success"){
             
              this.toastr.success(data.message)
              setTimeout(() => {
                this.closePopup()
              },500)
            }
            else{
              this.toastr.error(data.message)
            }
            
            if(data.data){
              const index = this.responseData.findIndex(
                (val) => val.customerId === this.customerId
              );
              
              this.responseData[index] = data.data
              this.sortData(this.responseData)
            }
            
            
          },
          error: (error: any) => {
            this.toastr.error(error.error.message);
          },
        });
      }
      
    } else {
      this.showErrorMessage = 'Email is not valid'
    }
   
   
    
  }

  inputValidation(event:KeyboardEvent){
    if (event.key === ' ' || event.keyCode === 32) {
      event.preventDefault();
    }
    if (event.key.length === 1 && event.key.match(/[A-Z]/)) {
      event.preventDefault();
    }
  }
}
