export interface TenantSettingsData {
  fullName: string;
  email: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  roomName: string;
  propertyName: string;
  notifications: {
    smsAlerts: boolean;
    emailAlerts: boolean;
    billingReminders: boolean;
  };
}