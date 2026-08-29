export type Role = "RETAILER" | "DISPATCHER" | "RIDER";
export type DeliveryStatus = "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId: string;
}

export interface Delivery {
  id: string;
  reference: string;
  storeId: string;
  createdById: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  description: string;
  status: DeliveryStatus;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  user: User;
}
