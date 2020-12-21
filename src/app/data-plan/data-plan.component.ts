import { Component, TemplateRef, ViewChild, ElementRef, ViewEncapsulation, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { CommonService } from '../_services/common.service';
import { ToastrService } from 'ngx-toastr';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Page } from '../_models/page';


@Component({
  selector: 'app-data-plan',
  templateUrl: './data-plan.component.html',
  encapsulation: ViewEncapsulation.None
})

export class DataPlanComponent implements OnInit {

  entryForm: FormGroup;
  planHistoryList: FormArray;
  planFormArray: any;

  submitted = false;
  @BlockUI() blockUI: NgBlockUI;
  modalTitle = 'Add Data Plan';
  btnSaveText = 'Save';
  modalConfig: any = { class: 'gray modal-md', backdrop: 'static' };
  modalRef: BsModalRef;

  page = new Page();
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  rows = [];
  loadingIndicator = false;
  ColumnMode = ColumnMode;

  scrollBarHorizontal = (window.innerWidth < 1200);

  constructor(
    private modalService: BsModalService,
    public formBuilder: FormBuilder,
    private _service: CommonService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.page.pageNumber = 0;
    this.page.size = 10;
    window.onresize = () => {
      this.scrollBarHorizontal = (window.innerWidth < 1200);
    };
  }


  ngOnInit() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      planHistory: this.formBuilder.array([this.initPlanHistory()])
    });
    this.planHistoryList = this.entryForm.get('planHistory') as FormArray;
    this.planFormArray = this.entryForm.get('planHistory')['controls'];

    this.getList();
  }

  get f() {
    return this.entryForm.controls;
  }


  get plan_his(): FormArray {
    return this.entryForm.get('planHistory') as FormArray;
  }

  initPlanHistory() {
    return this.formBuilder.group({
      plan: [null, [Validators.required]]
    });
  }

  addPlanHistory() {
    this.planHistoryList.push(this.initPlanHistory());
  }

  removePlanHistory(i) {
    if (this.planHistoryList.length > 1) {
      this.planHistoryList.removeAt(i);
    }
  }

  // setPage(pageInfo) {
  //   this.page.pageNumber = pageInfo.offset;
  //   this.getList();
  // }

  getList() {
    this.loadingIndicator = true;
    // const obj = {
    //   size: this.page.size,
    //   pageNumber: this.page.pageNumber
    // };
    this._service.get('subscription/get-data-plan-list').subscribe(res => {

      if (!res) {
        this.toastr.error(res.Message, 'Error!', { closeButton: true, disableTimeOut: true });
        return;
      }
      this.rows = res;
      // this.page.totalElements = res.Total;
      // this.page.totalPages = Math.ceil(this.page.totalElements / this.page.size);
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1000);
    }, err => {
      this.toastr.error(err.message || err, 'Error!', { closeButton: true, disableTimeOut: true });
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1000);
    }
    );
  }

  // getItem(id) {
  //   this.blockUI.start('Getting data...');
  //   this._service.get('product-type/get/' + id).subscribe(res => {

  //     this.blockUI.stop();

  //     if (!res) {
  //       this.toastr.error(res.Message, 'Error!', { timeOut: 2000 });
  //       return;
  //     }
  //     this.formTitle = 'Update ProductType';
  //     this.btnSaveText = 'Update';
  //     this.entryForm.controls['Id'].setValue(res.Record.Id);
  //     this.entryForm.controls['Name'].setValue(res.Record.Name);

  //   }, err => {
  //     this.blockUI.stop();
  //     this.toastr.error(err.Message || err, 'Error!', { closeButton: true, disableTimeOut: true });
  //   });
  // }

  onFormSubmit() {
    this.submitted = true;
    if (this.entryForm.invalid) {
      return;
    }

    this.blockUI.start('Saving...');

    let plans = [];
    this.planHistoryList.value.forEach(element => {
      plans.push({
        plan: element.plan,
      })
    });


    const obj = {
     // Id: this.entryForm.value.Id ? this.entryForm.value.Id : 0,
     plans: plans
    };

    const request = this._service.post('subscription/save-data-plan', obj);

    request.subscribe(
      data => {
        this.blockUI.stop();
        if (data.IsReport == "Success") {
          this.toastr.success(data.Msg, 'Success!', { timeOut: 2000 });
          this.getList();
          this.modalHide();
        } else if (data.IsReport == "Warning") {
          this.toastr.warning(data.Msg, 'Warning!', { closeButton: true, disableTimeOut: true });
        } else {
          this.toastr.error(data.Msg, 'Error!', { closeButton: true, disableTimeOut: true });
        }
      },
      err => {
        this.blockUI.stop();
        this.toastr.error(err.Message || err, 'Error!', { closeButton: true, disableTimeOut: true });
      }
    );

  }

  modalHide() {
    this.entryForm.reset();
    this.modalRef.hide();
    this.submitted = false;
    this.modalTitle = 'Add Data Plan';
    this.btnSaveText = 'Save';
  }

  openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, this.modalConfig);
  }
}