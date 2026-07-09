export type PollStatusFilter = "all" | "active" | "draft" | "expired";

export type PollsPageRequest = {
  page: number;
  pageSize: number;
  query: string;
  status: PollStatusFilter;
};
