const GENDER_TYPE = Object.freeze({
    MALE: "Male",
    FEMALE: "Female",
});

const PARTICIPANT_TYPE = Object.freeze({
    ASD: "ASD",
    TD: "TD"
});

const USER_ROLE = Object.freeze({
    PATIENT: 'Patient',
    CARE_GIVER: 'Care Giver',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'Super Admin',
});

const USER_STATUS = Object.freeze({
    INACTIVE: "Inactive",
    ACTIVE: "Active",
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted'
});

const CONTENT_TYPE = Object.freeze({
    TEXT: "text",
    IMAGE: "image",
});

const CHAT_TYPE = Object.freeze({
    DIRECT: "direct",
    GROUP: 'group',
});

const CHAT_MEMBER_TYPE = Object.freeze({
    ADMIN: "admin",
    MEMBER: 'member',
});

const DAYS_OF_WEEK = Object.freeze({
    SUNDAY: "1",
    MONDAY: "2",
    TUESDAY: "3",
    WEDNESDAY: "4",
    THURSDAY: "5",
    FRIDAY: "6",
    SATURDAY: "7",
});

const COURSES = Object.freeze({
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  MATH: "Math"
});

const DIFFICULTY_LEVEL = Object.freeze({
  EASY: "Easy",
  Medium: "Meidum",
  High: "High",
});

module.exports = {
    GENDER_TYPE,
    PARTICIPANT_TYPE,
    UserRole: USER_ROLE,
    USER_STATUS,
    CONTENT_TYPE,
    CHAT_TYPE,
    CHAT_MEMBER_TYPE,
    DAYS_OF_WEEK,
    COURSES,
    DIFFICULTY_LEVEL,
}