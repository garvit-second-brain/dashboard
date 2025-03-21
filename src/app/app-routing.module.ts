import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { PaymentsComponent } from './payments/payments.component';
import { LoginComponent } from './login/login.component';
import { CustomersComponent } from './customers/customers.component';
import { PaymentdetailsComponent } from './paymentdetails/paymentdetails.component';
import { CustomerdetailsComponent } from './customerdetails/customerdetails.component';
import { ReportsComponent } from './reports/reports.component';
import { ManageCustomersComponent } from './manageCustomers/manageCustomers.component';
import { ScenariosComponent } from './scenarios/scenarios.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'paymentdetail', component: PaymentdetailsComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customerdetails', component: CustomerdetailsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'manageCustomers', component: ManageCustomersComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'scenarios', component: ScenariosComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
