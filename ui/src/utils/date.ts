import { DateTimeFormatter, Instant, ZonedDateTime, ZoneId } from '@js-joda/core';

export const parseServerDateToZdt = (date: string) => {
  const nativeDate = new Date(date);
  const instant = Instant.ofEpochMilli(nativeDate.getTime());
  return ZonedDateTime.ofInstant(instant, ZoneId.of('UTC'));
};

export const formatServerDate = (date: string) => {
  const zdt = parseServerDateToZdt(date);
  return zdt.format(DateTimeFormatter.ofPattern('dd.MM.yyyy hh:mm:ss'));
};
