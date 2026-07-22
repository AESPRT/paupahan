export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface PropertySettings {
  propertyName: string;
  address: string;
  defaultGracePeriodDays: number;
  lateFeePercentage: number;
  waterRatePerCubic: number;
  electricityRatePerKwh: number;
}

export interface PaymentGatewaySettings {
  gcashNumber: string;
  gcashName: string;
  mayaNumber: string;
  mayaName: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  isGcashActive: boolean;
  isMayaActive: boolean;
  isBankActive: boolean;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  autoRemindOverdue: boolean;
}