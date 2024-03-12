export default function isoDateFormat(isoDate) {
  // Create a Date object
  const date = new Date(isoDate);

  // Extract components using getUTC* methods for a UTC date, or get* methods for local time
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // Note: month is 0-indexed, 0 = January, 11 = December
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Format the month
  // const monthNames = [
  //   "January",
  //   "February",
  //   "March",
  //   "April",
  //   "May",
  //   "June",
  //   "July",
  //   "August",
  //   "September",
  //   "October",
  //   "November",
  //   "December",
  // ];
  // const formattedMonth = monthNames[month];

  // Format the hours to 12-hour format and determine AM/PM
  const formattedHours = hours % 12 || 12; // Converts 0 hours to 12 for 12AM
  const ampm = hours < 12 ? "am" : "pm";

  // Format minutes to always be two digits
  const formattedMinutes = minutes.toString().padStart(2, "0");

  // Combine components into a formatted string
  const formattedDate = `${month}-${day}-${year} ${formattedHours}:${formattedMinutes}${ampm}`;

  // console.log(formattedDate);

  return formattedDate;
}
