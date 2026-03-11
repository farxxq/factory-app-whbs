import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { Spolypack } from '../service/spolypack';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-list-polypack',
  templateUrl: './list-polypack.page.html',
  styleUrls: [
    './list-polypack.page.scss',
    '../polypack-master/polypack-master.page.scss',
  ],
  standalone: false,
})
export class ListPolypackPage implements OnInit {
  filterDataList: any = {};

  colorList: any = [];
  poNumList: any = [];

  fullQtyList: any = [];
  fullRawQtyList: any = [];

  isModalOpen: boolean = false;

  //flags
  editF: boolean = false;

  constructor(
    private polypackService: Spolypack,
    private reusableService: ReusableService,
    private dataService: DataService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.filterDataList = this.polypackService.getListData();
    this.poNumberList();
  }

  async allSizeQtyList(item: any, coloritem: any) {
    let onceCalled = 0;

    let selectedValue = item;
    if (!selectedValue) {
      console.error('No color selected');
      return;
    }
    if (onceCalled > 0) {
      this.isModalOpen = false;
      return;
    } //need to check

    console.log('Po', item, 'color', coloritem);
    let api = this.polypackService.changeApiPolypack(
      'carton_packing/getordersizeqty',
    );

    //http post
    let params = {
      path: api,
      // path: 'apppolypack/controllers/getordersizeqty.php',
      colorseqnum:
        this.poNumList.length > 0
          ? coloritem['color_seq_num']
          : item['color_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      lineseqnum: this.filterDataList.line['line_seq_num'],
      orderponum: item.order_ponumber ? item.order_ponumber : null,
    };

    this.dataService.postService(params).then(async (res: any) => {
      // await this.showLoading();
      if (res['status'].toLowerCase() == 'success') {
        this.fullQtyList = this.reusableService.rearrangeData(
          res['sizedata'],
          'size_name',
        );

        this.isModalOpen = true;
        console.log('fullQtyList', this.fullQtyList);
      } else {
        this.fullQtyList = [];
        let toast = {
          message: 'No sizes assigned for this colors',
          color: 'warning',
        };
        this.reusableService.showToast(toast);
      }
      // await this.cancelLoading();
    });
    onceCalled = 1;
  }

  async poNumberList() {
    let api = this.polypackService.changeApiPolypack(
      'carton_packing/getponumlist',
    );

    let params = {
      path: api,
      //  path: 'apppolypack/controllers/getponumlist.php',
      orderseqnum: this.filterDataList.order['order_seq_num'],
      lineseqnum: this.filterDataList.line['line_seq_num'],
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.poNumList = this.reusableService.rearrangeData(
          res['ponumberlist'],
          'order_ponumber',
        );

        if (this.poNumList.length == 0) {
          this.colorsList('');
        }
      } else if (res['status'].toLowerCase() == 'error') {
        let toast = {
          message: res['message'],
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
    });
  }

  async colorsList(po?: any) {
    let api = this.polypackService.changeApiPolypack(
      'carton_packing/getcolors',
    );

    let params = {
      path: api,
      // path: 'apppolypack/controllers/getcolors.php',
      orderseqnum: this.filterDataList.order['order_seq_num'],
      orderponum: po.order_ponumber ? po.order_ponumber : null,
      lineseqnum: this.filterDataList.line['line_seq_num'],
    };

    console.log('Po', po);

    // await this.showLoading();
    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.colorList = this.reusableService.rearrangeData(
          res['colordetails'],
          'color_name',
        );
        if (res['colordetails'].length == 0) {
          let toast = {
            message: 'Color list is empty',
            color: 'warning',
          };

          this.reusableService.showToast(toast);
        }
      } else if (res['status'].toLowerCase() == 'error') {
        let toast = {
          message: res['message'],
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
    });
  }

  editItemQty() {
    this.editF = true;
    console.log('editItemQtyFunc');
    this.isModalOpen = false;

    if (this.editF) {
      let sizedata = this.fullQtyList.map(
        ({
          size_seq_num,
          total_order_size_qty,
          total_pcssize_elc_qty,
          total_pcssize_poly_qty,
        }) => ({
          size_seq_num,
          total_order_size_qty,
          total_pcssize_elc_qty,
          total_pcssize_poly_qty,
          polypack_qty: total_pcssize_poly_qty, // need to confirm this as this overwritest the data in total_pcssize_poly_qty
        }),
      );

      console.log(sizedata);
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/cartonpackinginsert',
      );

      let params = {
        path: api,
        // path: 'apppolypack/controllers/cartonpackinginsert.php',
        colorseqnum: this.fullQtyList.color['color_seq_num'],
        customerseqnum: this.fullQtyList.customer['customer_seq_num'],
        lineseqnum: this.fullQtyList.line['line_seq_num'],
        orderseqnum: this.fullQtyList.order['order_seq_num'],
        seasonseqnum: this.fullQtyList.season['season_seq_num'],
        orderponum: this.fullQtyList.poNum
          ? this.fullQtyList.poNum['order_ponumber']
          : null,
        sizedata: JSON.stringify(sizedata),
      };
      // http
      this.dataService.postService(params).then((res: any) => {
        if (res['status'].toLowerCase == 'success') {
        }
      });
      // //flags
      // this.isModalOpen = false;
    }
  }

  canModalDismiss() {
    let alert = {};
    for (const item of this.fullQtyList) {
      if (this.editF && item.editQtyF) {
        alert = {
          msg: 'Have unsaved changes, want to submit them?',
          btn: [
            {
              text: 'Yes',
              role: 'confirm',
              func: () => {
                this.editItemQty();
                console.log('Changes saved');
                return;
              },
            },
            {
              text: 'No',
              role: 'cancel',
              func: () => {
                this.isModalOpen = false;
              },
            },
          ],
        };
      }
    }
    this.reusableService.showAlert(alert);
  }

  //leave
  canLeave() {
    this.navCtrl.back();
    console.log('Back to home page');
  }
}
