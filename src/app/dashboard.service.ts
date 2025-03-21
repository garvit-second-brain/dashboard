import { Injectable } from '@angular/core';
import { backendApiURL } from '../assets/config';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  res: any;
  apiHeaders: any;
  id_token: any;
  access_token: any;
  organization: any;
  emailID: any;

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  handleApiHeaders() {
    this.id_token = this.cookieService.get('encrptedToken');
    const authorizationHeader = 'Bearer ' + this.id_token;
    return {
      headers: {
        Authorization: authorizationHeader,
      },
    };
  }

  getCardTypes(
    startdaterange: any,
    enddaterange: any,
    vendors: any,
    transfilter: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/count/cardtypes?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&vendorIds=' +
      vendors +
      '&operationFilter=' +
      transfilter +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const cardtypes = this.http.get(url, apiHeaders);
    return cardtypes;
  }

  getVendorTypes(
    startdaterange: any,
    enddaterange: any,
    transfilter: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/count/vendors?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&operationFilter=' +
      transfilter +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const vendortypes = this.http.get(url, apiHeaders);
    return vendortypes;
  }

  getPaymentTypes(
    startdaterange: any,
    enddaterange: any,
    vendors: any,
    transfilter: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/count/paymenttypes?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&vendorIds=' +
      vendors +
      '&operationFilter=' +
      transfilter +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const paymenttypes = this.http.get(url, apiHeaders);
    return paymenttypes;
  }

  getOperationTypes(
    startdaterange: any,
    enddaterange: any,
    vendors: any,
    transfilter: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/count/operationtypes?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&vendorIds=' +
      vendors +
      '&operationFilter=' +
      transfilter +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const operationtypes = this.http.get(url, apiHeaders);
    return operationtypes;
  }

  getTransactionRatio(
    startdaterange: any,
    enddaterange: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/transactionsratio?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const transactionRatio = this.http.get(url, apiHeaders);
    return transactionRatio;
  }

  verifyUser(email: any, organization: any) {
    const url =
      backendApiURL +
      'login/authenticate?customer=' +
      organization +
      '&email=' +
      email;
    const loginchecks = this.http.get(url);
    return loginchecks;
  }

  getLoginChecks() {
    const url = backendApiURL + 'login/checks';
    const loginchecks = this.http.get(url);
    return loginchecks;
  }

  getLoginAuthenticate() {
    const url = `${backendApiURL}login/authenticate`;
    const loginauthenticate = this.http.get(url, { responseType: 'text' });
    return loginauthenticate;
  }

  getLoginAuth0token(code: any) {
    this.organization = this.cookieService.get('organization');
    const url =
      backendApiURL +
      'login/token?code=' +
      code +
      '&customer=' +
      this.organization;
    const loginauth0token = this.http.get(url);
    return loginauth0token;
  }

  getUserInfo() {
    this.id_token = this.cookieService.get('id_token');
    this.organization = this.cookieService.get('organization');
    this.access_token = this.cookieService.get('access_token');
    this.apiHeaders = {
      headers: {
        Authorization: 'Bearer' + ' ' + this.id_token,
        AccessToken: this.access_token,
        Customer: this.organization,
        Accept: 'application/json',
      },
    };
    const url = backendApiURL + 'dashboard/userinfo';
    const userdata = this.http.get(url, this.apiHeaders);
    return userdata;
  }

  logoutUser() {
    this.cookieService.deleteAll();
    localStorage.clear();
    window.location.href = backendApiURL + 'logout';
  }

  getRecentTransactions(
    startdaterange: any,
    enddaterange: any,
    productChannelId: any
  ) {
    const apiHeaders = this.handleApiHeaders();
    const url =
      backendApiURL +
      'dashboard/recenttransactions?startDate=' +
      startdaterange +
      '&endDate=' +
      enddaterange +
      '&productChannelIds=' +
      `${productChannelId.join(',')}`;
    const recentTransacations = this.http.get(url, apiHeaders);
    return recentTransacations;
  }

  getPaymentFilters(
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedCardType: string[],
    selectedVendorType: string[],
    selectedStatus: string[],
    selectedOperationType: string[],
    selectedProduct: string[],
    selectedChannel: string[],
    paginationFrom: number,
    paginationSize: number,
    profileIdValue: string,
    transIdValue: string
  ) {
    const url = backendApiURL + `payment`;
    const apiHeaders = this.handleApiHeaders();

    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');
    const modifiedTransId = transIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: paginationFrom,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      status: selectedStatus.length ? selectedStatus : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,
      operationTypes: selectedOperationType.length
        ? selectedOperationType
        : null,
      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
      transactionIds:
        transIdValue && transIdValue.length ? modifiedTransId : null,
    };

    const data = this.http.post(url, requestPayload, apiHeaders);
    return data;
  }

  getPaymentDetailsData(id: number) {
    const apiHeaders = this.handleApiHeaders();
    const url = backendApiURL + 'payment/transaction/' + id;
    const data = this.http.get(url, apiHeaders);
    return data;
  }

  getCustomersFilters(
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedVendorType: string[],
    selectedCardType: string[],
    selectedProduct: string[],
    selectedChannel: string[],
    paginationFrom: number,
    paginationSize: number,
    profileIdValue: string
  ) {
    const url = backendApiURL + `customer`;

    const apiHeaders = this.handleApiHeaders();
    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: paginationFrom,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,

      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
    };
    const data = this.http.post(url, requestPayload, apiHeaders);
    return data;
  }

  getCustomerProfileDetails(profileId: string, indexId: any) {
    const apiHeaders = this.handleApiHeaders();

    const requestPayload = {
      profileId: profileId,
      indexId: indexId,
    };

    const url = backendApiURL + 'customer/profile';
    const data = this.http.post(url, requestPayload, apiHeaders);
    return data;
  }

  getDataForPaymentsPage(
    from: number,
    paginationSize: number,
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedCardType: string[],
    selectedVendorType: string[],
    selectedStatus: string[],
    selectedOperationType: string[],
    profileIdValue: string,
    transIdValue: string,
    selectedChannel: string[]
  ) {
    const url = backendApiURL + `payment`;
    const apiHeaders = this.handleApiHeaders();

    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');
    const modifiedTransId = transIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: from,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      status: selectedStatus.length ? selectedStatus : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,
      operationTypes: selectedOperationType.length
        ? selectedOperationType
        : null,
      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
      transactionIds:
        transIdValue && transIdValue.length ? modifiedTransId : null,
    };

    const data = this.http.post(url, requestPayload, apiHeaders);
    return data;
  }

  getDataForCustomersPage(
    from: number,
    paginationSize: number,
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedVendorType: string[],
    selectedCardType: string[],
    profileIdValue: string,
    selectedChannel: string[]
  ) {
    const url = backendApiURL + `customer`;
    const apiHeaders = this.handleApiHeaders();

    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: from,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,

      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
    };

    const data = this.http.post(url, requestPayload, apiHeaders);
    return data;
  }

  getAllCardTypes() {
    const url = backendApiURL + 'cardtype/getallcards';
    const apiHeaders = this.handleApiHeaders();
    const cardtypes = this.http.get(url, apiHeaders);
    return cardtypes;
  }

  getAllVendors() {
    const url = backendApiURL + 'vendor';
    const apiHeaders = this.handleApiHeaders();
    const vendors = this.http.get(url, apiHeaders);
    return vendors;
  }

  getAllPaymentTypes() {
    const url = backendApiURL + 'payment-type';
    const apiHeaders = this.handleApiHeaders();
    const paymentTypes = this.http.get(url, apiHeaders);
    return paymentTypes;
  }

  getAllPaymentStatus() {
    const url = backendApiURL + 'payment-status';
    const apiHeaders = this.handleApiHeaders();
    const paymentStatus = this.http.get(url, apiHeaders);
    return paymentStatus;
  }

  getAllOperationTypes() {
    const url = backendApiURL + 'operation-type';
    const apiHeaders = this.handleApiHeaders();
    const operationTypes = this.http.get(url, apiHeaders);
    return operationTypes;
  }

  getAllProducts() {
    const apiHeaders = this.handleApiHeaders();
    const url = backendApiURL + 'users/productchannels';
    const allProducts = this.http.get(url, apiHeaders);
    return allProducts;
  }

  getAdminUsers() {
    const apiHeaders = this.handleApiHeaders();
    const url = backendApiURL + 'users/userList';
    const adminUsers = this.http.get(url, apiHeaders);
    return adminUsers;
  }

  getUserDetailsByEmail(email: string) {
    const url = `${
      backendApiURL + 'users/userDetails'
    }?email=${encodeURIComponent(email)}`;

    const apiHeaders = this.handleApiHeaders();

    const userDetailByEmail = this.http.get(url, apiHeaders);
    return userDetailByEmail;
  }

  deleteProductChannel(email: string, productChannelId: number) {
    this.emailID = this.cookieService.get('userEmailId');

    const url = `${
      backendApiURL + 'users/removeProducts'
    }?email=${email}&productChannelId=${productChannelId}&updatedByEmail=${
      this.emailID
    }`;

    const apiHeaders = this.handleApiHeaders();

    const deleteProduct = this.http.put(url, '', apiHeaders);
    return deleteProduct;
  }

  saveProducts(
    email: string,
    role: string,
    status: string,
    productChannelIds: number[]
  ) {
    this.emailID = this.cookieService.get('userEmailId');
    const apiHeaders = this.handleApiHeaders();
    const url = backendApiURL + 'users/saveProducts';
    const requestPayload = {
      email: email,
      role: role,
      status: status,
      productChannelIds: productChannelIds,
      updatedByEmail: this.emailID,
    };

    const saveProducts = this.http.put(url, requestPayload, apiHeaders);
    return saveProducts;
  }

  verifyApi() {
    const apiHeaders = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Method's": 'GET, POST, PUT',
        'Access-Control-Allow-Headers': 'application/json',
      },
    };
    const url =
      'https://dev-rs-np.ncs-dev-lab.net/PaymentService/PaymentServiceServlet?siteCode=cvpayway&siteKey=fred&operation=createPaymentRedirect&caller=https://dev-mg.ncs-dev-lab.net&paymentType=applepay&transAmount=5.49&transType=authorization';
    return this.http.post(url, '', apiHeaders);
  }

  exportPartialData(
    from: number,
    paginationSize: number,
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedCardType: string[],
    selectedVendorType: string[],
    selectedStatus: string[],
    selectedOperationType: string[],
    profileIdValue: string,
    transIdValue: string,
    selectedChannel: string[]
  ) {
    const url = backendApiURL + `payment/partialexport`;

    this.id_token = this.cookieService.get('encrptedToken');
    this.apiHeaders = {
      headers: {
        Authorization: 'Bearer' + ' ' + this.id_token,
      },
      responseType: 'blob',
      observe: 'response',
    };

    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');
    const modifiedTransId = transIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: from,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      status: selectedStatus.length ? selectedStatus : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,
      operationTypes: selectedOperationType.length
        ? selectedOperationType
        : null,
      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
      transactionIds:
        transIdValue && transIdValue.length ? modifiedTransId : null,
    };

    const data = this.http.post(url, requestPayload, this.apiHeaders);
    return data;
  }

  exportAllData(
    from: number,
    paginationSize: number,
    startTime: number,
    endTime: number,
    selectedPaymentType: string[],
    selectedCardType: string[],
    selectedVendorType: string[],
    selectedStatus: string[],
    selectedOperationType: string[],
    profileIdValue: string,
    transIdValue: string,
    selectedChannel: string[]
  ) {
    const url = backendApiURL + `payment/export`;
    this.id_token = this.cookieService.get('encrptedToken');
    this.apiHeaders = {
      headers: {
        Authorization: 'Bearer' + ' ' + this.id_token,
      },
      responseType: 'blob',
      observe: 'response',
    };

    const modifiedProfileId = profileIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');
    const modifiedTransId = transIdValue
      .split(',')
      .map((s) => s.trim())
      .filter((value) => value !== '');

    const requestPayload = {
      fromDate: startTime,
      toDate: endTime,
      from: from,
      size: paginationSize,
      paymentTypes: selectedPaymentType.length ? selectedPaymentType : null,
      status: selectedStatus.length ? selectedStatus : null,
      vendors: selectedVendorType.length ? selectedVendorType : null,
      operationTypes: selectedOperationType.length
        ? selectedOperationType
        : null,
      cardTypes: selectedCardType.length ? selectedCardType : null,
      productChannelIds: selectedChannel.length ? selectedChannel : null,
      profileIds:
        profileIdValue && profileIdValue.length ? modifiedProfileId : null,
      transactionIds:
        transIdValue && transIdValue.length ? modifiedTransId : null,
    };

    const data = this.http.post(url, requestPayload, this.apiHeaders);
    return data;
  }

  timeConversion(start: any, end: any) {
    const newStartDate = new Date(start);
    const utcStartDate = new Date(
      Date.UTC(
        newStartDate.getUTCFullYear(),
        newStartDate.getUTCMonth(),
        newStartDate.getUTCDate(),
        newStartDate.getUTCHours(),
        newStartDate.getUTCMinutes(),
        newStartDate.getUTCSeconds()
      )
    );
    const startTime = Math.floor(utcStartDate.getTime());

    const newEndDate = new Date(end);
    const utcEndDate = new Date(
      Date.UTC(
        newEndDate.getUTCFullYear(),
        newEndDate.getUTCMonth(),
        newEndDate.getUTCDate(),
        newEndDate.getUTCHours(),
        newEndDate.getUTCMinutes(),
        newEndDate.getUTCSeconds()
      )
    );
    const endTime = Math.floor(utcEndDate.getTime());

    return { startTime, endTime };
  }

  sortDataByName(data: any[], nameKey: string) {
    return data.sort((a, b) => {
      const nameA = a[nameKey].toUpperCase();
      const nameB = b[nameKey].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  syncCustomer(profileId: string) {
    const url = `${backendApiURL}customerutility/savePreExistingCustomer`;

    const apiHeaders = this.handleApiHeaders();

    const postData = {
      profileId: profileId,
    };

    const data = this.http.post(url, postData, apiHeaders);
    return data;
  }

  getManageCustomerList(){
    const url = backendApiURL + 'global_auth';
    const apiHeaders = this.handleApiHeaders();
    const customers = this.http.get(url, apiHeaders);
    return customers;
  }

  getCustomerDetails(customerId:string){
    const url = backendApiURL + 'global_auth/'+customerId;
    const apiHeaders = this.handleApiHeaders();
    const customers = this.http.get(url, apiHeaders);
    return customers;
  }

  editCustomerDetails(customer:object,customerId:string){
    const url = backendApiURL + 'global_auth/'+customerId;
    const apiHeaders = this.handleApiHeaders();
    const customers = this.http.put(url, customer, apiHeaders);
    return customers;
  }

  addCustomerDetails(customer:object){
    const url = backendApiURL + 'global_auth/';
    const apiHeaders = this.handleApiHeaders();
    const customers = this.http.post(url, customer, apiHeaders);
    return customers;
  }

  deleteCustomer(id:string,customer:object){
    const url = backendApiURL + 'global_auth/'+id;
    const apiHeaders = this.handleApiHeaders();
    const customers = this.http.delete(url, apiHeaders);
    return customers;
  }

  getScenarioData() {
    const url = `${backendApiURL}scenario`;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.get(url, apiHeaders);
    return data;
  }

  getScenarioDataById(id: number) {
    const url = `${backendApiURL}scenario/` + id;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.get(url, apiHeaders);
    return data;
  }

  deleteScenario(id: number) {
    const url = `${backendApiURL}scenario/` + id;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.delete(url, apiHeaders);
    return data;
  }

  updateScenario(newScenario: any) {
    const url = `${backendApiURL}scenario`;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.put(url, newScenario, apiHeaders);
    return data;
  }

  addScenario(newScenario: any) {
    const url = `${backendApiURL}scenario`;
    const apiHeaders = this.handleApiHeaders(); 
    return this.http.post(url, newScenario, apiHeaders);
  }

  getServerInfoList() {
    const url = `${backendApiURL}serverinfo`;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.get(url, apiHeaders);
    return data;
  }

  getOperationTypesData() {
    const url = `${backendApiURL}operation-type/operationTypes`;
    const apiHeaders = this.handleApiHeaders();
    const data = this.http.get(url, apiHeaders);
    return data;
  }
}
