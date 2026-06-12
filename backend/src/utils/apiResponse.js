export function sendSuccess(res, data = {}, message = 'Operation completed', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendPaginatedSuccess(res, items, page, limit, total, message = 'Operation completed', statusCode = 200) {
  const totalPages = Math.ceil(total / limit);
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }
  });
}
