export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;

}


export interface UserData {
  id: number;
  name: string;
  fname: string;
  gender: string;
  type: string;
  role: string;
  phone: string;
  image: string;
  username: string;
  sticky_notes?: StickyNote[];
  branch?: Branch;
}

export interface StickyNote {
  id?: string;
  content: string;
  user_id:string,
  created_at:Date,
  updated_at:Date
}


interface Branch {
  id: number;
  name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ✅ Update Profile
export interface UpdateProfileRequest {
  name: string;
  is_male: boolean;
  phone: string;
  username: string;
  password: string;
}

// ✅ Authenticated Devices
export interface AuthenticatedDevice {
  id: string | number;
  name: string;
  ip_address: string;
  platform: string;
  browser: string;
  device: string;
  device_type?: string;
  last_used_at: string; // ISO date string
  last_used_at_human: string;
  last_used_at_humans?: string; // For backward compatibility
  created_at: string; // ISO date string
  created_at_human: string;
  created_at_humans?: string; // For backward compatibility
  current: boolean;
}

export interface AuthenticatedDevicesResponse {
  status: string;
  message: string;
  data: AuthenticatedDevice[];
}

// ✅ General System Details
export interface AllowedPhones {
  description: string;
  format: string;
  example: string;
}

export interface AuthTokenLifetimes {
  without_remember: number; // in minutes
  with_remember: number;    // in minutes
  time_unit: string;
}


// ✅ General System Details (Simplified as One Export)
export interface GeneralSystemDetailsResponse {
  status: string;
  message: string;
  data: {
    timezone: string;
    detetime: string; // NOTE: probably meant to be "datetime"
    allowed_phones: {
      description: string;
      format: string;
      example: string;
    };
    auth_token_lifetimes: {
      without_remember: number; // in minutes
      with_remember: number;    // in minutes
      time_unit: string;
    };
    current_locale: string;
    default_language: {
      code: string;
      name: string;
    };
    available_languages: {
      code: string;
      name: string;
    }[];
  };
}
