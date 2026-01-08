# DB_SCHEMA

This document defines collections, fields, relations, and indexes used by the admin backend.

## Collections

### goods
| Field | Type | Notes |
| --- | --- | --- |
| sku | string | Unique SKU |
| goodName | string | Product name |
| price | number | Price in yuan |
| description | string | Product description |
| stock | number | Stock quantity |
| coverImage | string | Cover image URL |
| galleryImages | array<string> | Gallery image URL list |
| detailImages | array<string> | Detail image URL list |
| picture | array<string> | Legacy alias of galleryImages (optional) |
| status | string | `online` or `offline` |
| createTime | date | Created time |
| updateTime | date | Updated time |

### user
| Field | Type | Notes |
| --- | --- | --- |
| id | string | Member ID |
| name | string | Member name |
| grade | string | `bronze` / `silver` / `gold` |
| orderIds | array<string> | Optional order ID list |
| createTime | date | Created time |
| updateTime | date | Updated time |

### order
| Field | Type | Notes |
| --- | --- | --- |
| id | string | Order ID |
| goodsSku | string | References `goods.sku` |
| num | number | Quantity |
| userId | string | References `user.id` |
| salesPromotionId | string or null | References `salesPromotion.id` |
| totalPrice | number | Total price |
| status | string | `pending` / `shipped` / `completed` / `refunded` |
| createTime | date | Created time |
| updateTime | date | Updated time |

### salesPromotion
| Field | Type | Notes |
| --- | --- | --- |
| id | string | Promotion ID |
| name | string | Promotion name |
| description | string | Promotion description |
| startTime | date | Start time |
| endTime | date | End time |
| multiPrize | number | Discount amount |
| lowestPrice | number | Minimum spend |
| createTime | date | Created time |
| updateTime | date | Updated time |

## Relations

- `order.goodsSku` -> `goods.sku`
- `order.userId` -> `user.id`
- `order.salesPromotionId` -> `salesPromotion.id`

## Indexes

### goods
- `sku` (unique)
- `goodName`

### order
- `id` (unique)
- `goodsSku`
- `userId`
- `status`

### user
- `id` (unique)

### salesPromotion
- `id` (unique)

## Optional composite indexes

Only add these if you see index-related errors for filtered + ordered queries:

- `order`: `status + createTime`
- `goods`: `status + createTime`
