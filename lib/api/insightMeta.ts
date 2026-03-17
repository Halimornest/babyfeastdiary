export type InsightDataSource = "cache" | "fresh";

export interface InsightMeta {
  dataSource: InsightDataSource;
  generatedAt: string;
  cacheKey: string;
  cacheTtlSeconds: number;
}

export interface InsightMetaContainer {
  _meta?: Partial<InsightMeta>;
}

interface AttachInsightMetaOptions {
  dataSource: InsightDataSource;
  cacheKey: string;
  cacheTtlSeconds: number;
}

export function withInsightMeta<T extends object>(
  payload: T,
  options: AttachInsightMetaOptions
): T & { _meta: InsightMeta } {
  const previousMeta = (payload as InsightMetaContainer)._meta;
  const generatedAt = previousMeta?.generatedAt || new Date().toISOString();

  return {
    ...payload,
    _meta: {
      dataSource: options.dataSource,
      generatedAt,
      cacheKey: options.cacheKey,
      cacheTtlSeconds: options.cacheTtlSeconds,
    },
  };
}
