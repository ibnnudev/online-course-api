const EnrollmentStatus = {
    PENDING: {value: "pending"},
    COMPLETED: {value: "completed"},
    CANCELLED: {value: "cancelled"},
}

Object.freeze(EnrollmentStatus);
module.exports = {EnrollmentStatus};