const generatePrevAndNext = ({
  url,
  count,
  limitOptions: { limit, offset },
  queryObject,
}) => {
  // offset starts from 0, hence the -1
  const noOfIterations = count / limit - 1;
  const currentIteration = offset / limit;

  const queryObjectCopy = { ...queryObject };
  delete queryObjectCopy.offset;

  const query = Object.keys(queryObjectCopy)
    .map((key) => `${key}=${encodeURIComponent(queryObjectCopy[key])}`)
    .join('&');

  const urlWithLimitAndOffset = `${url}?${query}&offset=`;

  const nextUrl =
    currentIteration < noOfIterations
      ? `${urlWithLimitAndOffset}${+offset + +limit}`
      : null;
  let prev = null;
  if (offset - +limit >= 0) {
    prev = `${urlWithLimitAndOffset}${+offset - +limit}`;
  }

  return { next: nextUrl, prev };
};

const getFilterAndLimitOptions = (query) => {
  const filter = { ...query };
  const limitOptions = {};

  const defaultRange = { limit: 100, offset: 0 };
  limitOptions.limit = +filter.limit || defaultRange.limit;
  limitOptions.offset = +filter.offset || defaultRange.offset;
  limitOptions.orderBy = filter.sort_by;
  limitOptions.order = filter.order;

  delete filter.limit;
  delete filter.offset;
  delete filter.order;
  delete filter.sort_by;

  return { filter, limitOptions };
};

module.exports = {
  generatePrevAndNext,
  getFilterAndLimitOptions,
};
