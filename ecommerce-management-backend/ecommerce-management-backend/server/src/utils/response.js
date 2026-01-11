export const sendData = (res, data) => res.json({ data });

export const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
