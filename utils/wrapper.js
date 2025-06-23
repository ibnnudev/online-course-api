const wrapQueryResolver =
    (resolver, successMessage = null) =>
        async (parent, args, context, info) => {
            try {
                const data = await resolver(parent, args, context, info);
                return successMessage ? {message: successMessage, data, success: true} : data;
            } catch (error) {
                throw new Error(error.message);
            }
        };

const wrapMutationResolver =
    (resolver, successMessage = null) =>
        async (parent, args, context, info) => {
            try {
                const data = await resolver(parent, args, context, info);
                return successMessage
                    ? {
                        success: true,
                        message: successMessage,
                        data,
                    }
                    : data;
            } catch (error) {
                throw new Error(error.message);
            }
        };

module.exports = {
    wrapQueryResolver,
    wrapMutationResolver,
};
