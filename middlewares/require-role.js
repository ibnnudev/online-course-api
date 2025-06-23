module.exports = (roleRequired) => {
    const roles = require('../constants/roles');
    return async function (context) {
        if (!context.user || context.user.role !== roleRequired.value) {
            throw new Error(`Access denied: ${roleRequired.value} role is required.`);
        }
    };
};