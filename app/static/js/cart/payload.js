// cart/payload.js
import { state } from '../state.js';
import { $ } from './helpers.js';

export function getDeliveryPayload() {
  return {
    fullname:       $('d-fullname')?.value.trim()  || '',
    phone:          $('d-phone')?.value.trim()     || '',
    note:           $('d-note')?.value.trim()      || '',
    regionId:       state.regionId,
    regionName:     state.regionName,
    districtId:     state.districtId,
    districtName:   state.districtName,
    isTashkentCity: state.isTashkentCity,
    address:        $('d-address')?.value.trim()   || '',
    location:       state.location,
    label:          $('d-label')?.value.trim()     || '',
    deliveryPrice:  state.deliveryPrice,
    serviceId:      state.serviceId,
    serviceName:    state.serviceName,
    serviceSlug:    state.serviceSlug,
    isTaxi:         state.isTaxi,
    branchId:       state.branchId,
    branchName:     state.branchName,
    branchAddress:  state.branchAddress,
    uzpostAddress:  $('d-uzpost-address')?.value.trim() || '',
    paymentType:    state.paymentType,
    building:       $('d-building')?.value.trim()  || '',
    apartment:      $('d-apartment')?.value.trim() || '',
    intercom:       $('d-intercom')?.value.trim()  || '',
  };
}