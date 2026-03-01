import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { keyframes } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class Scartonpacking {
  sizeList: any = [];

  colorList: any = [];
  colorModel: any = '';
  packedStatus: string = '';

  isAvailablePcs = new BehaviorSubject<boolean>(false);
  isAvailablePcs$ = this.isAvailablePcs.asObservable();

  isRemovePcs = new BehaviorSubject<boolean>(false);
  isRemovePcs$ = this.isRemovePcs.asObservable();

  barcodeSizeMap = new Map(); //Creating a map and using it through out

  private cartonDetails = new BehaviorSubject<any>(null);
  cartonDetails$ = this.cartonDetails.asObservable();

  private refocusSubject = new Subject<void>();
  refocus$ = this.refocusSubject.asObservable();

  requestRefocus() {
    this.refocusSubject.next();
  }

  constructor(private reusableService: ReusableService) { }

  // Cartonpack details
  sendCartonDetails(data: any) {
    this.cartonDetails.next(data);
    console.log(data, 'service Data');
  }

  getCartonDetails() {
    return this.cartonDetails.getValue();
  }

  // Cartonpack garments
  addInitalGarmentData(sizeMapData: any) {
    this.barcodeSizeMap = sizeMapData;
    console.log(this.barcodeSizeMap, 'From the carton store')
  }

  async handleScan(isScanner: string, barcode: any) {
    switch (isScanner) {
      case 'PACK':
        await this.handlePackScan(barcode);
        break;
      case 'ADDPCS':
        await this.handleAddPcsScan(barcode);
        break;
      case 'REPACK':
        await this.handleRepackScan(barcode);
        break;
      case 'REMOVEGARMENT':
        // remove button function in the intial stage(might bring here)
        break;

      default:
        break;
    }
    let { color } = this.barcodeSizeMap.get(barcode)
    return color;
  }

  // reusables
  async handlePackScan(barcode: string) {
    await this.processScan(barcode, (size) => {
      this.dec(size, 'balance_popp_qty_load');
      this.dec(size, 'balance_packed');
      this.inc(size, 'current_carton_pcs');
    });
  }


  async handleAddPcsScan(barcode: string) {
    await this.processScan(barcode, (size) => {
      if (size.remove_qty_count) {
        this.dec(size, 'remove_qty_count');
        this.isRemovePcs.next(true);

      } else if (size.balance_popp_qty_load) {
        this.dec(size, 'balance_popp_qty_load');
      }
      this.dec(size, 'balance_packed');
      this.inc(size, 'current_carton_pcs');
    });
  }

  async handleRepackScan(barcode: string) {
    await this.processScan(barcode, (size) => {
      if (size['previous_packed_pcs']) {
        this.dec(size, 'previous_packed_pcs');
      } else if (size['remove_qty_count']) {
        this.dec(size, 'remove_qty_count');
        this.isRemovePcs.next(true);

      } else if (size['balance_popp_qty_load']) {
        this.dec(size, 'balance_popp_qty_load');
      } else if (size['testingpcs_qty_count']) {
        this.dec(size, 'testingpcs_qty_count');
      } else {
        return;
      }
      this.dec(size, 'balance_packed');
      this.inc(size, 'current_carton_pcs')
    });
  }

  private async processScan(barcode: string, onDirectFlow: (size: any) => void) {


    const validBarcode = this.barcodeSizeMap.get(barcode);
    if (!validBarcode) {
      this.infoAlert('invalidBarcode', barcode);
      return;
    }

    const { size } = validBarcode;

    // pcs availability
    if (this.pcsAvailable(size)) {
      this.infoAlert('noPcs', barcode);
      return;
    }

    console.log(size, 'size')
    // size not assigned
    const unknown = await this.shouldHandleUnknown(size);
    if (unknown === 'PERMITTED') {
      this.handleUnknownGarment(size);
      return;
    } else if (unknown === 'DENIED') {
      return;
    }

    // reached max load
    const overload = await this.shouldHandleOverload(size);
    if (overload === 'PERMITTED') {
      this.handleMaxCapacity(size);
      return;
    } else if (overload === 'DENIED') {
      return;
    }

    // available pcs from other boxes in the same PO
    const avail = await this.shouldHandleAvailPcs(size);
    if (avail === 'PERMITTED') {
      this.handleAvailablePcs(size);
      return;
    } else if (avail === 'DENIED') {
      return;
    }

    // direct flow
    onDirectFlow(size);
    this.requestRefocus();
  }


  // handle vulnerables
  async shouldHandleOverload(sizeData: any) {
    if (sizeData.balance_packed > 0) return false;

    let permitted = await this.confirmPermission('overload');
    console.log(permitted, 'hanldeoverload')

    this.requestRefocus();
    return permitted;
  }

  async shouldHandleUnknown(sizeData: any) {
    let isUnknown = !sizeData.balance_packed && !sizeData.current_carton_pcs;
    console.log(isUnknown, 'handleunknown', sizeData)
    if (!isUnknown) return false;

    let permitted = await this.confirmPermission('unknown');

    this.requestRefocus();
    return permitted;
  }

  async shouldHandleAvailPcs(size: any) {
    let pcs = size.remove_qty_count > 0 || size.balance_popp_qty_load > 0 || size.previous_packed_pcs > 0;
    let availPcs = size.testingpcs_qty_count > 0;
    console.log(availPcs, +size.testingpcs_qty_count)
    if (pcs || !availPcs) return false; // to check for previous packed, remove_pcs, polypack...

    const permitted = await this.confirmPermission('availPcs');

    /*
    
    if (permitted == 'PERMITTED') {
      this.requestRefocus();
      return 'PERMITTED';
    };
    this.requestRefocus();
    return 'DENIED';
    
    */

    this.requestRefocus();
    return permitted;
  }


  // check availability
  pcsAvailable(sizeData: any) {
    let noPcs = !sizeData.balance_popp_qty_load && !sizeData.remove_qty_count && !sizeData.testingpcs_qty_count && !sizeData.previous_packed_pcs
    if (noPcs) {
      return true
    }
    return false;
  }

  // handle situations
  async handleMaxCapacity(sizeData: any) {
    // variables
    let isPolypack = sizeData.balance_popp_qty_load;
    let removePcs = sizeData.remove_qty_count;
    let isAvailPcs = sizeData.testingpcs_qty_count;
    let isPreviouslyPacked = sizeData.previous_packed_pcs;

    if (isPreviouslyPacked) {
      this.dec(sizeData, 'previous_packed_pcs')
      this.inc(sizeData, 'current_carton_pcs')
      return;
    }

    if (!removePcs) {
      // no removePcs checked
      if (isPolypack) {
        // polypack availability checked
        this.dec(sizeData, 'balance_popp_qty_load');

      } else if (isAvailPcs) {
        // testingpcs availability checked
        const avail = await this.shouldHandleAvailPcs(sizeData);
        if (avail === 'PERMITTED') {
          this.handleAvailablePcs(sizeData);
          return;
        } else if (avail === 'DENIED') {
          return;
        }
      } else {
        // pcsAvaialble() will prevent from coming here but just in case
        console.warn(isPolypack, isAvailPcs, 'No pcs available')
        return;
      }
    } else {
      this.dec(sizeData, 'remove_qty_count');
      this.isRemovePcs.next(true);
    }

    this.inc(sizeData, 'current_carton_pcs')
  }

  async handleUnknownGarment(sizeData: any) {
    // variables
    let isPolypack = sizeData.balance_popp_qty_load;
    let removePcs = sizeData.remove_qty_count;
    let isAvailPcs = sizeData.testingpcs_qty_count;
    let isPreviouslyPacked = sizeData.testingpcs_qty_count;

    if (isPreviouslyPacked) {
      this.dec(sizeData, 'previous_packed_pcs')
      this.inc(sizeData, 'current_carton_pcs')
      return;
    }

    if (!removePcs) {
      // removePcs availability checked
      if (isPolypack) {
        // polypack availability checked
        this.dec(sizeData, 'balance_popp_qty_load');
        this.dec(sizeData, 'balance_packed')
      } else if (isAvailPcs) {
        // testingpcs availability checked
        const avail = await this.shouldHandleAvailPcs(sizeData);
        if (avail === 'PERMITTED') {
          this.handleAvailablePcs(sizeData);
          return;
        } else if (avail === 'DENIED') {
          return;
        }
      } else {
        // pcsAvaialble() will prevent from coming here but just in case
        console.warn(isPolypack, isAvailPcs, 'No pcs available')
        return;
      }
    } else {
      this.dec(sizeData, 'remove_qty_count');
      this.isRemovePcs.next(true);
    }

    this.inc(sizeData, 'current_carton_pcs')
    console.log('handleUnknown')
  }

  handleAvailablePcs(sizeData: any) {
    if (!sizeData.testingpcs_qty_count) {
      // toast msg? stating no pcs to add... probably not needed as nopcs will take care but just in case...
      return;
    }

    // for keeping the remove to be true only when removepcs and the available pcs are used
    if (!sizeData.removed_data && this.isRemovePcs) {
      this.isRemovePcs.next(false);
    }
    this.isAvailablePcs.next(true);
    this.dec(sizeData, 'testingpcs_qty_count')
    this.dec(sizeData, 'balance_packed')
    this.inc(sizeData, 'current_carton_pcs')
  }

  setLoadedColor(sizeData) { //check this
    const color = sizeData.find(c =>
      c.sizes.some(s =>
        s.current_carton_pcs !== 0 || s.remove_qty_count !== 0 || this.packedStatus === 'PACKED'
      )
    );

    if (color) {
      this.colorModel = {
        color: color.color,
        color_seq_num: color.color_seq_num
      };
      return this.colorModel;
    }
    return null;
  }

  // helper functions
  inc(size: any, field: string) {
    size[field]++
  }

  dec(size: any, field: string) {
    if (size[field] > 0) {
      size[field]--
    } else {
      size[field]
    }
  }

  // alerts
  // Grant permission
  async confirmPermission(permFor: string): Promise<string> {
    let alertHeader = '';
    let alertMsg = '';

    if (permFor == 'overload') {
      alertHeader = 'Overload warning!'
    } else if (permFor == 'unknown') {
      alertHeader = 'Unknown garment!'
    } else if (permFor == 'availPcs') {
      alertHeader = 'Add available pcs?'
    }

    return new Promise((resolve) => {
      let alert = {
        header: "⚠️ " + alertHeader,
        msg: alertMsg || 'Continue anyways?',
        btn: [
          {
            text: 'Cancel',
            role: 'confirm',
            func: () => {
              console.log('Cancelled');
              // may be a toast msg will be suitable
              resolve('DENIED');
              let toast = {
                message: '🛑 Action cancelled',
                color: 'dark'
              }

              this.reusableService.showToast(toast);
            }
          },
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              console.log('submitted');
              resolve('PERMITTED');
            }
          }
        ]
      }
      this.reusableService.showAlert(alert)
    })

  }

  //check this (mostly to show static alerts)
  async infoAlert(alertType: string, barcode?: string) {
    this.reusableService.playAudio('warning');
    let alertMsg = '';

    if (alertType == 'invalidBarcode') {
      alertMsg = `Invalid barcode: ${barcode}`
    } else if (alertType == 'noPcs') {
      alertMsg = `❌ No Pcs available for barcode: ${barcode}`
    }

    let alert = {
      header: '⚠️ Error',
      msg: alertMsg, //check this
      btn: [
        {
          text: 'OK',
          role: 'confirm',
          func: () => {
            this.reusableService.stopAudio();
            this.requestRefocus()
          }
        },
      ],
    };

    await this.reusableService.showAlert(alert);
  }
}
