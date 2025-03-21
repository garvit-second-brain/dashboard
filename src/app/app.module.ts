import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import { PaymentsComponent } from './payments/payments.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DatePipe } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoginComponent } from './login/login.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { PaymentdetailsComponent } from './paymentdetails/paymentdetails.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerdetailsComponent } from './customerdetails/customerdetails.component';
import { ReportsComponent } from './reports/reports.component';
import { AdminComponent } from './admin/admin.component';
import { ExportAsModule } from 'ngx-export-as';
import { NgxPaginationModule } from 'ngx-pagination';
import { LabelModule } from '@progress/kendo-angular-label';
import {
  DropDownListModule,
  DropDownsModule,
} from '@progress/kendo-angular-dropdowns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import {ManageCustomersComponent} from './manageCustomers/manageCustomers.component';
import { ScenariosComponent } from './scenarios/scenarios.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    PaymentsComponent,
    LoginComponent,
    PaymentdetailsComponent,
    CustomersComponent,
    CustomerdetailsComponent,
    ReportsComponent,
    AdminComponent,
    ManageCustomersComponent,
    ScenariosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HighchartsChartModule,
    HttpClientModule,
    UiSwitchModule,
    NgxDaterangepickerMd.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    ExportAsModule,
    NgxPaginationModule,
    LabelModule,
    DropDownListModule,
    DropDownsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-full-width',
      preventDuplicates: true,
      closeButton: true,
    }),
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
