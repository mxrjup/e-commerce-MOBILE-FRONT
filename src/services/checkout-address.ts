import type { Address, AddressPayload } from './user-profile-api.ts';

export function selectCheckoutAddress(addresses: Address[]): Address | undefined {
  return addresses.find((address) => address.isDefault) ?? addresses[0];
}

export function prepareCheckoutAddressPayload(payload: AddressPayload, existingAddressCount: number): AddressPayload {
  return {
    ...payload,
    isDefault: existingAddressCount === 0 ? true : payload.isDefault,
  };
}
