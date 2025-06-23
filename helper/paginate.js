function paginate({ limit = 10, page = 1, total = 0 }) {
  const validLimit = Math.max(1, limit);
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * validLimit;
  const totalPages = Math.ceil(total / validLimit);

  return {
    limit: validLimit,
    page: validPage,
    offset,
    totalPages,
  };
}

module.exports = paginate;
