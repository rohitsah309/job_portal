export const getJobStatus = (applicationStart, applicationLastDate) => {
  const now = new Date();

  const startDate = new Date(applicationStart);
  const lastDate = new Date(applicationLastDate);

  if (now < startDate) {
    return "UPCOMING";
  }

  if (now > lastDate) {
    return "CLOSED";
  }

  return "OPEN";
};