const middlewares = (middlewares, resolver) => {
    return async (parent, args, context, info) => {
        for (const middleware of middlewares) {
            await middleware(context);
        }
        return resolver(parent, args, context, info);
    };
};

module.exports = middlewares;
