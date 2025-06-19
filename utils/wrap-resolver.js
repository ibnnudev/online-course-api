const wrapResolver =
  (resolverFunction, successMessage = "Operation successful") =>
  async (_, args) => {
    try {
      const result = await resolverFunction(args);
      return {
        success: true,
        message: successMessage,
        data: Array.isArray(result) ? result : result ? [result] : [],
      };
    } catch (error) {
      console.error("Resolver Error:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred.",
        data: [],
      };
    }
  };

module.exports = { wrapResolver };
