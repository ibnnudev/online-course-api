const dayjs = require("dayjs");

const generateTimestamp = () => {
  // 2020-12-21T07:56:11.000Z
  const now = dayjs();
  const formattedTimestamp = now.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  return formattedTimestamp;
};

module.exports = { generateTimestamp };
