export const GENDER_TYPE = Object.freeze({
    MALE: "Male",
    FEMALE: "Female",
});

export const PARTICIPANT_TYPE = Object.freeze({
  ASD: "ASD",
  TD: "TD"
});

export const ALERT_STATUS = Object.freeze({
  START: "start",
  OPEN: "open",
  CLOSE: "close",
  CLOSE_FINAL: "close-final"
});

export const USER_STATUS = Object.freeze({
    INACTIVE: "Inactive",
    ACTIVE: "Active",
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted'
});

export const USER_ROLE = Object.freeze({
  PATIENT: 'Patient',
  CARE_GIVER: 'Care Giver',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
});

export const CONTENT_TYPE = Object.freeze({
  TEXT: "text",
  IMAGE: "image",
});

export const TOAST_TYPE = Object.freeze({
  INFO: "info",              // Passive info or message
  SUCCESS: "success",        // Completed successfully
  ERROR: "error",            // Something went wrong
  WARNING: "warning",        // Needs attention, but not fatal

  NEED_ACTION: "need action",         // Requires user decision/input
  BLOCKING: "blocking",               // Prevents user from continuing
  CONFIRMATION: "confirmation",       // Asks user to confirm or cancel
  PROCESSING: "processing",           // In-progress feedback
  CANCELLED: "cancelled",             // User or system cancelled something

  FIXED: "fixed"
})

export const BIONIC_TYPE = Object.freeze({
  BOLD: "bold",              // Passive info or message
  HIGHLIGHT: "highlight",        // Completed successfully
  UNDERLINE: "underline",            // Something went wrong
  COLOR: "color",        // Needs attention, but not fatal
})

export const CHAT_TYPE = Object.freeze({
  DIRECT: "direct",
  GROUP: 'group',
});

export const CHAT_MEMBER_TYPE = Object.freeze({
  ADMIN: "admin",
  MEMBER: 'member',
});

export const REGULAR_ACTION = Object.freeze({
  CREATE: "create",
  UPDATE: 'update',
  DELETE: 'delete',
});


export const DAYS_OF_WEEK = Object.freeze({
    SUNDAY: "1",
    MONDAY: "2",
    TUESDAY: "3",
    WEDNESDAY: "4",
    THURSDAY: "5",
    FRIDAY: "6",
    SATURDAY: "7",
});

export const TRANSACTION_TYPE = Object.freeze({
    EXPENSE: "Expense",
    INCOME: "Income",
    // TRANSFER: "Transfer",
});

export const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

export const PRIORITY_LEVEL = Object.freeze({
  Low: "1",
  Medium: "2",
  High: "3",
});

export const getPriorityKey = (value) =>{
  return Object.keys(PRIORITY_LEVEL).find(
    (key) => PRIORITY_LEVEL[key] == value
  );
}

export const COURSES = Object.freeze({
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  MATH: "Math"
})

export const DIFFICULTY_LEVEL = Object.freeze({
  EASY: "Easy",
  Medium: "Medium",
  High: "High",
});

export const QUESTION_OPTION_MAP = ["a", "b", "c", "d"];