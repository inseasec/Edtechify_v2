/**
 * Builds JSON body for /users/signup and /users/signin (email or mobile + password).
 */
export function buildAuthPayload(userData) {
  const id = String(userData.identifier ?? "").trim();
  const payload = {
    email: id.includes("@") ? id : undefined,
    mobileNo: /^\d{10}$/.test(id) ? id : undefined,
    password: userData.password,
  };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });
  return payload;
}

export function getApiErrorMessage(error) {
  const d = error?.response?.data;
  if (typeof d === "string" && d.trim()) return d;
  if (d?.message) return d.message;
  if (error?.message) return error.message;
  return "Something went wrong. Please try again.";
}
