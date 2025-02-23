export const SCHEDULES = ["Monthly", "Yearly"] as const;

export type Schedule = (typeof SCHEDULES)[number];

export const SORTS = ["name", "price"] as const;
