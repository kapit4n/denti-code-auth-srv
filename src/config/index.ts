import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    auth: process.env.AUTH_SERVICE_URL,
    patients: process.env.PATIENT_SERVICE_URL,
    clinic: process.env.CLINIC_PROVIDER_SERVICE_URL,
    appointments: process.env.APPOINTMENTS_RECORDS_SERVICE_URL,
  },
};
