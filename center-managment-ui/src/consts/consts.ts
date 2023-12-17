export const url = `http://localhost/api/`;

export function appendToUrl(addToUrl: string) {
  return url + addToUrl;
}
export const formatISODate = (dateString: Date | undefined) => {
  if (dateString) {
    const dateObject = new Date(dateString);
    return dateObject.toLocaleString();
  } else {
    return "Invalid date";
  }
};

export const formatISODateWithOffset = (
  dateString: Date | undefined,
  offsetMilliseconds: number | undefined
) => {
  if (dateString && offsetMilliseconds) {
    const originalDate = new Date(dateString);
    const newDate = new Date(originalDate.getTime() + offsetMilliseconds);
    return newDate.toLocaleString();
  } else {
    return "Invalid date";
  }
};
