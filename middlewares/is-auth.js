module.exports = async function isAuth(context) {
    if (!context.user) throw new Error("Not authenticated");
}