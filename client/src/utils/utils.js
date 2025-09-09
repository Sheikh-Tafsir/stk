import { jwtDecode } from "jwt-decode";
import { format } from "date-fns";
import { USER_ROLE } from "./enums";

export const APP_NAME = "STK";

export const ACCESS_TOKEN = "visoredAccessToken";

export const REFRESH_TOKEN = "visoredRefreshToken"

export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const paginationSize = 10;

export const TOTAL_EXPERIMENTS = 2;

export const FIRST_PAGE = 1;

export const REGULAR_DATE_FORMAT = "dd-MM-yyyy";

export const INVERSE_DATE_FORMAT = "yyyy-MM-dd";

export const REGULAR_TIME_FORMAT_12 = "hh:mm a";

export const REGULAR_TIME_FORMAT_24 = "HH:mm";

export const MAX_PARTICIPANT_COUNT  = 20;

export const isNull = (value) => {
    return !value || value == null || value == undefined || value == "";
}

export const isNotNull = (value) => {
    return !isNull(value);
}

export const isInRange = (value, min, max) => {
    return value >= min && value <= max;
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

export const saveAccessToken = (token) => {
    localStorage.setItem(ACCESS_TOKEN, token);
}

export const isLoggedIn = () => {
    return isNotNull(getAccessToken());
}

export const getLoggedInUser = () => {
    return isLoggedIn() ? jwtDecode(getAccessToken()) : {};
};

export const imageToByte = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0]
}

export const addRequestParam = (link, paramName, paramValue) => {
    if (paramValue == 0) paramValue = 1;
    //console.log(link + "?" + paramName + "=" + paramValue)
    return link + "?" + paramName + "=" + paramValue;
}

export const validateFile = (file) => {
    return file && file.size <= MAX_FILE_SIZE;
}

export const isUserSetInUserContext = (user) => {
    return user?.id ? true : false;
}

export const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export const getQueryString = (params = {}) => {
    const query = Object.entries(params)
        .filter(([, value]) => (isNotNull(value) && value != {}))
        .map(([key, value]) => {
            const encodedValue =
                typeof value === 'object' ? JSON.stringify(value) : value;
            return `${encodeURIComponent(key)}=${encodeURIComponent(encodedValue)}`;
        })
        .join('&');

    return query ? `?${query}` : '';
};

export const getDateFromTimeAndDate = (date) => {
    return date.slice(0, 10)
}

export const prepareFormData = (formData, imageFile) => {
    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSubmit.append(key, value)
    }
    );
    if (imageFile) formDataToSubmit.append("image", imageFile);
    return formDataToSubmit;
};

export const isSameDay = (date1, date2) => {
    return date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate();
}

export const isYesterday = (date, today) => {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return isSameDay(date, yesterday);
};

export const getLastMessageTime = (timestamp) => {
    // Add 6 hours to the original timestamp
    const messageDate = new Date(new Date(timestamp).getTime() + 6 * 60 * 60 * 1000);
    const now = new Date();

    if (isSameDay(messageDate, now)) {
        return format(messageDate, REGULAR_TIME_FORMAT_24);
      }
    
      if (isYesterday(messageDate, now)) {
        return `Yesterday ${format(messageDate, REGULAR_TIME_FORMAT_24)}`;
      }
    
      return format(messageDate, REGULAR_DATE_FORMAT);
};

export const arrayBufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export const base64ToArrayBuffer = (base64) => {
    if (!base64 || typeof base64 !== 'string') {
        throw new Error("Invalid base64 input to decode.");
    }
    try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (err) {
        console.error("Failed to decode base64 string:", base64);
        throw err;
    }
};

export const initialToastState = {
    message: "",
    type: "",
    id: Date.now(),
};

export const getResponseErrorMessage = (error) => {
    return error.response?.data || { global: error.response.data.message } || { global: error.message };
}

export const isAdmin = (role) => {
    return role === USER_ROLE.ADMIN || role === USER_ROLE.SUPER_ADMIN;
}