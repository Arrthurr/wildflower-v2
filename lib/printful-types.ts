export type PrintfulSyncVariant = {
  id: number;
  sync_product_id: number;
  name: string;
  sku?: string;
  retail_price: string;
  currency: string;
  in_stock?: boolean;
};

export type PrintfulSyncProductDetail = {
  id: number;
  external_id?: string;
  name: string;
  thumbnail_url?: string;
  sync_variants: PrintfulSyncVariant[];
};

export type PrintfulListRow = {
  id: number;
  external_id?: string;
  name: string;
  variants?: number;
  synced?: number;
  thumbnail_url?: string;
};
