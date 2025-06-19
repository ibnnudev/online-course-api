const wrapMutationResolver =
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

const wrapQueryResolver = (resolverFunction) => async (_, args) => {
  try {
    const result = await resolverFunction(args);
    return result;
  } catch (error) {
    console.error("Query Resolver Error:", error);
    throw new Error(
      error.message || "An unexpected error occurred during query."
    );
  }
};

module.exports = { wrapMutationResolver, wrapQueryResolver };
