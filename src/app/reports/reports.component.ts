import { Component, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  toggleNameStates: boolean[] = [];
  editButtonByIndex: boolean[] = [];
  deleteButtonByIndex: boolean[] = [];
  saveButtonByIndex: boolean[] = [];
  showFilters: boolean = false;
  currentIndex: number = -1;
  activeRowIndex: number | null = null;
  isCheckboxDisabled: boolean = false;
  saveNewButton: boolean = false;
  isEditing: boolean = false;
  editedName: string = '';
  editedDescription: string = '';
  editModeByIndex: boolean[] = [];
  toggleTable: boolean = false;
  count: boolean = false;
  countSavedReports: boolean = false;
  activateReports: boolean = false;
  clearAllEnabled: boolean = true;
  selectAllEnabled: boolean = false;
  nameInputValue: string = '';
  descriptionInputValue: string = '';

  allFilters: Array<Array<Array<{ label: string; selected: boolean }>>> = [
    [
      [
        { label: 'Card Type', selected: false },
        { label: 'VISA', selected: false },
        { label: 'AMEX', selected: false },
        { label: 'Master Card', selected: false },
        { label: 'JCB', selected: false },
        { label: 'Dinners Club', selected: false },
      ],
      [
        { label: 'Transaction Type', selected: false },
        { label: 'Sale', selected: false },
        { label: 'Authorization', selected: false },
        { label: 'Capture', selected: false },
        { label: 'Refund', selected: false },
        { label: 'Void', selected: false },
        { label: 'Status', selected: false },
        { label: 'Account Verification', selected: false },
      ],
      [
        { label: 'Operations Type', selected: false },
        { label: 'Create Profile Redirect', selected: false },
        { label: 'Update Profile Redirect', selected: false },
        { label: 'Create Payment Redirect', selected: false },
        { label: 'Update Profile', selected: false },
        { label: 'Delete Profile', selected: false },
        { label: 'Get Profile', selected: false },
        { label: 'Create Vault Transactions', selected: false },
      ],
      [
        { label: 'Payment Type', selected: false },
        { label: 'CC', selected: false },
        { label: 'ACH', selected: false },
        { label: 'Google Pay', selected: false },
        { label: 'Apple Pay', selected: false },
        { label: 'PayPal', selected: false },
      ],
    ],
    [
      [
        { label: 'Vendors', selected: false },
        { label: 'Payway', selected: false },
        { label: 'Braintree', selected: false },
      ],
      [
        { label: 'Status', selected: false },
        { label: 'Success', selected: false },
        { label: 'Failed', selected: false },
      ],
      [
        { label: 'Publication', selected: false },
        { label: 'Pub1', selected: false },
        { label: 'Pub2', selected: false },
      ],
      [
        { label: 'Product', selected: false },
        { label: 'Prod1', selected: false },
        { label: 'Prod2', selected: false },
      ],
    ],
  ];
  savedReportsData: {
    name: string;
    description: string;
    filters: Array<Array<Array<{ label: string; selected: boolean }>>>;
  }[] = [
    {
      name: 'ABC',
      description: 'all filters',
      filters: this.allFilters,
    },
  ];
  downloadData: { category: string; labels: string[] }[] = [
    { category: 'Card Type', labels: [] },
    { category: 'Transaction Type', labels: [] },
    { category: 'Operations Type', labels: [] },
    { category: 'Payment Type', labels: [] },
    { category: 'Vendors', labels: [] },
    { category: 'Status', labels: [] },
    { category: 'Publication', labels: [] },
    { category: 'Product', labels: [] },
  ];

  newReportData: {
    name: string;
    description: string;
    filters: any[];
  } = {
    name: '',
    description: '',
    filters: [],
  };

  editedReports: {
    name: string;
    description: string;
    filters: any[];
  }[] = [];

  selected: any = { startDate: null, endDate: null };
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

  exportAsConfig: ExportAsConfig = {
    type: 'xlsx',
    elementIdOrContent: 'download',
  };

  constructor(private exportAsService: ExportAsService) {}

  ngOnInit(): void {
    if (window.location.href.includes('report')) {
      document.getElementById('reports')?.classList.add('nav-active');
    }
    this.editModeByIndex = new Array(this.savedReportsData.length).fill(false);
    this.editedReports = JSON.parse(JSON.stringify(this.savedReportsData));
  }

  openDatepicker(ref: any): void {
    ref.click();
  }

  handleSelectAll() {
    this.clearAllEnabled = false;
    this.selectAllEnabled = true;

    this.allFilters.forEach((filters) => {
      filters.forEach((filter) => {
        for (let i = 0; i < filter.length; i++) {
          filter[i].selected = true;
        }
      });
    });
  }

  handleCancelAll() {
    this.clearAllEnabled = true;
    this.selectAllEnabled = false;
    this.allFilters.forEach((filters) => {
      filters.forEach((filter) => {
        for (let i = 0; i < filter.length; i++) {
          filter[i].selected = false;
        }
      });
    });
  }

  handleDownload() {
    this.count = false;
    this.allFilters.forEach((filters) => {
      filters.forEach((filter) => {
        for (let i = 1; i < filter.length; i++) {
          if (filter[i].selected) {
            this.count = true;
            const categoryLabel = filter[0].label;
            this.downloadData.forEach((data) => {
              if (data.category === categoryLabel) {
                data.labels.push(filter[i].label);
              }
            });
          }
        }
      });
    });

    if (this.count) {
      this.exportAsService.save(this.exportAsConfig, 'Filters');
      this.exportAsService
        .get(this.exportAsConfig)
        .subscribe((downloadData) => {});
    } else {
      alert('Select atleast 1 filter for downloading the report');
    }
  }

  handleTableOpen() {
    this.toggleTable = true;
  }

  handleCreateReport() {
    this.countSavedReports = false;

    this.allFilters.forEach((filters) => {
      filters.forEach((filter) => {
        for (let i = 1; i < filter.length; i++) {
          if (filter[i].selected) {
            this.countSavedReports = true;
          }
        }
      });
    });

    if (this.countSavedReports) {
      this.activateReports = true;
    } else {
      alert('Select atleast 1 filter for creating the report');
    }
  }

  handleTableClose() {
    this.toggleTable = false;
    this.savedReportsData.forEach((_report, index) => {
      if (this.toggleNameStates[index]) {
        this.handleNameClick(index);
      }
    });
  }

  handleNameClick(index: number) {
    this.isCheckboxDisabled = true;
    this.activeRowIndex = index;

    this.editButtonByIndex[index] = !this.editButtonByIndex[index];
    this.deleteButtonByIndex[index] = !this.deleteButtonByIndex[index];

    this.toggleNameStates[index] = !this.toggleNameStates[index];
    for (let i = 0; i < this.toggleNameStates.length; i++) {
      if (i !== index) {
        this.toggleNameStates[i] = false;
        this.editButtonByIndex[i] = false;
        this.deleteButtonByIndex[i] = false;
      }
    }

    if (this.toggleNameStates[index]) {
      this.showFilters = true;
      this.currentIndex = index;
    } else {
      this.showFilters = false;
    }
  }

  handleSaveClick(index: number) {
    if (this.toggleNameStates[index]) {
      const editedName = this.editedName.trim();
      const editedDescription = this.editedDescription.trim();

      if (editedName.length === 0 || editedDescription.length === 0) {
        alert('Name and description are required fields.');
      } else {
        this.savedReportsData[index].name = editedName;
        this.savedReportsData[index].description = editedDescription;

        this.editButtonByIndex[index] = true;
        this.saveButtonByIndex[index] = false;
        this.isCheckboxDisabled = true;

        this.isEditing = false;
        this.editModeByIndex[index] = false;
      }
    }
  }

  handleEditClick(index: number) {
    if (this.toggleNameStates[index]) {
      this.editModeByIndex[index] = true;

      this.editedName = this.savedReportsData[index].name;
      this.editedDescription = this.savedReportsData[index].description;

      this.saveButtonByIndex[index] = true;
      this.editButtonByIndex[index] = false;
      this.activeRowIndex = null;
      this.isCheckboxDisabled = false;

      this.isEditing = true;
    }
  }

  preventClickPropagation(event: Event) {
    if (this.isEditing) {
      event.stopPropagation();
    }
  }

  handleDeleteClick(i: number) {
    if (this.deleteButtonByIndex[i] && this.editButtonByIndex[i]) {
      const confirmed: boolean = window.confirm(
        'Are you sure you want to delete this report?'
      );
      if (confirmed) {
        this.savedReportsData[i].filters.forEach((filterGroup) => {
          filterGroup.forEach((filter) => {
            for (let j = 1; j < filter.length; j++) {
              filter[j].selected = false;
            }
          });
        });
        this.isCheckboxDisabled = false;
        this.savedReportsData.forEach((_report, index) => {
          if (this.toggleNameStates[index]) {
            this.handleNameClick(index);
          }
        });

        this.savedReportsData.splice(i, 1);

        alert('Report deleted successfully');
      }
    }
  }

  handleSaveReport() {
    if (
      this.nameInputValue.length === 0 &&
      this.descriptionInputValue.length === 0
    ) {
      alert('Enter NAME and DESCRIPTION');
    } else if (this.nameInputValue.length === 0) {
      alert('Enter NAME');
    } else if (this.descriptionInputValue.length === 0) {
      alert('Enter DESCRIPTION');
    } else {
      if (
        this.nameInputValue.length === 0 &&
        this.descriptionInputValue.length === 0
      ) {
        alert('Enter NAME and DESCRIPTION');
      } else if (this.nameInputValue.length === 0) {
        alert('Enter NAME');
      } else if (this.descriptionInputValue.length === 0) {
        alert('Enter DESCRIPTION');
      } else {
        const newReport = {
          name: this.nameInputValue,
          description: this.descriptionInputValue,
          filters: JSON.parse(JSON.stringify(this.allFilters)),
        };

        const existingReport = this.savedReportsData.find(
          (report) => report.name === newReport.name
        );

        if (existingReport) {
          alert(
            'A report with the same name already exists. Please use a different name.'
          );
        } else {
          this.savedReportsData.push(newReport);
          this.activateReports = false;
          this.handleCancelAll();

          this.nameInputValue = '';
          this.descriptionInputValue = '';
          this.allFilters = [
            [
              [
                { label: 'Card Type', selected: false },
                { label: 'VISA', selected: false },
                { label: 'AMEX', selected: false },
                { label: 'Master Card', selected: false },
                { label: 'JCB', selected: false },
                { label: 'Dinners Club', selected: false },
              ],
              [
                { label: 'Transaction Type', selected: false },
                { label: 'Sale', selected: false },
                { label: 'Authorization', selected: false },
                { label: 'Capture', selected: false },
                { label: 'Refund', selected: false },
                { label: 'Void', selected: false },
                { label: 'Status', selected: false },
                { label: 'Account Verification', selected: false },
              ],
              [
                { label: 'Operations Type', selected: false },
                { label: 'Create Profile Redirect', selected: false },
                { label: 'Update Profile Redirect', selected: false },
                { label: 'Create Payment Redirect', selected: false },
                { label: 'Update Profile', selected: false },
                { label: 'Delete Profile', selected: false },
                { label: 'Get Profile', selected: false },
                { label: 'Create Vault Transactions', selected: false },
              ],
              [
                { label: 'Payment Type', selected: false },
                { label: 'CC', selected: false },
                { label: 'ACH', selected: false },
                { label: 'Google Pay', selected: false },
                { label: 'Apple Pay', selected: false },
                { label: 'PayPal', selected: false },
              ],
            ],
            [
              [
                { label: 'Vendors', selected: false },
                { label: 'Payway', selected: false },
                { label: 'Braintree', selected: false },
              ],
              [
                { label: 'Status', selected: false },
                { label: 'Success', selected: false },
                { label: 'Failed', selected: false },
              ],
              [
                { label: 'Publication', selected: false },
                { label: 'Pub1', selected: false },
                { label: 'Pub2', selected: false },
              ],
              [
                { label: 'Product', selected: false },
                { label: 'Prod1', selected: false },
                { label: 'Prod2', selected: false },
              ],
            ],
          ];
        }
      }
    }
  }

  updateSaveNewButtonState() {
    this.saveNewButton = !!this.nameInputValue && !!this.descriptionInputValue;
  }

  selectAllCheckbox(filter: { label: string; selected: boolean }[]): void {
    const allCheckbox = filter[0];
    allCheckbox.selected = !allCheckbox.selected;

    for (let i = 1; i < filter.length; i++) {
      filter[i].selected = allCheckbox.selected;
    }
    this.updateButtonStates();
  }

  toggleCheckbox(
    eachFilter: { label: string; selected: boolean },
    filter: { label: string; selected: boolean }[]
  ): void {
    eachFilter.selected = !eachFilter.selected;
    this.updateAllCheckbox(filter);
    this.updateButtonStates();
  }

  updateButtonStates() {
    let allSelected = true;
    let noneSelected = true;

    this.allFilters.forEach((filters) => {
      filters.forEach((filter) => {
        if (!filter[0].selected) {
          allSelected = false;
        } else {
          noneSelected = false;
        }

        for (let i = 1; i < filter.length; i++) {
          if (filter[i].selected) {
            noneSelected = false;
          } else {
            allSelected = false;
          }
        }
      });
    });
    this.selectAllEnabled = allSelected;
    this.clearAllEnabled = noneSelected;
  }

  updateAllCheckbox(filter: { label: string; selected: boolean }[]): void {
    const allCheckbox = filter[0];
    allCheckbox.selected = filter.slice(1).every((option) => option.selected);
  }

  validateDateRange() {
    const startDate = new Date(this.selected.start);
    const endDate = new Date(this.selected.end);

    if (startDate > endDate) {
      alert('fromDate cannot be greater than toDate');

      this.selected = {
        start: endDate,
        end: endDate,
      };
    }
  }

  // resetFilters() {
  //   this.allFilters.forEach((filterGroup) => {
  //     filterGroup.forEach((filter) => {
  //       for (let i = 1; i < filter.length; i++) {
  //         filter[i].selected = false;
  //       }
  //     });
  //   });
  // }
}
