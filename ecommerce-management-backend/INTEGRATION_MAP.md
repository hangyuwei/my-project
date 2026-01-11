# INTEGRATION_MAP

This map documents each service function, its mock source, expected shape, backend cloud function, and adapt layer.

## Contract Guardrails (Golden Snapshots)

每个 service 的返回结构以 `useMock=true` 实际运行结果为准，保存在 `contracts/*.json`。

- 生成快照：`node scripts/contracts/generate.js`（或 `npm run contracts:gen`）
- 对比真实返回：`node scripts/contracts/compare.js`（或 `npm run contracts:diff`）
- 对比会忽略动态字段：`requestId`, `clientIp`, `rt`（以及 `dispatchCommitPay` 的 `tradeNo`/`transactionId`）

## Service Inventory (fetch + related)

| Service Path | Function | Mock Source | Shape Summary | Cloud Function | Adapt Function |
| --- | --- | --- | --- | --- | --- |
| services/home/home.js | fetchHome | model/swiper.genSwiperImageList + local tabList | `{ swiper: string[], tabList: {text,key}[], activityImg: string }` | getHome | model/home.adaptHome |
| services/activity/fetchActivity.js | fetchActivity | model/activity.getActivity | `Activity` object | getActivity | model/activity.adaptActivity |
| services/activity/fetchActivityList.js | fetchActivityList | model/activities.getActivityList | `Activity[]` | getActivityList | model/activities.adaptActivityList |
| services/address/fetchAddress.js | fetchDeliveryAddress | model/address.genAddress | `Address` object | getAddress | model/address.adaptAddress |
| services/address/fetchAddress.js | fetchDeliveryAddressList | model/address.genAddressList | `Address[]` with `phoneNumber`, `address`, `tag` | getAddressList | model/address.adaptDeliveryAddressList |
| services/cart/cart.js | fetchCartGroupData | model/cart.genCartGroupData | `{ data: CartGroup }` | getCartGroupData | model/cart.adaptCartGroupData |
| services/comments/fetchComments.js | fetchComments | model/comments.getGoodsAllComments | `{ pageNum, pageSize, totalCount, pageList: Comment[] }` | getComments | model/comments.adaptGoodsAllComments |
| services/comments/fetchCommentsCount.js | fetchCommentsCount | model/comments.getGoodsCommentsCount | `CommentCount` object | getCommentsCount | model/comments.adaptGoodsCommentsCount |
| services/coupon/index.js | fetchCouponList | model/coupon.getCouponList | `Coupon[]` | getCouponList | model/coupon.adaptCouponList |
| services/coupon/index.js | fetchCouponDetail | model/coupon.getCoupon + model/address.genAddressList | `{ detail: Coupon, storeInfoList: Address[] }` | getCouponDetail | model/coupon.adaptCouponDetail |
| services/good/createGoods.js | createGoods | services/good/localGoods (mock) | `GoodDetail` | createGoods | model/good.adaptGoodDetail |
| services/good/fetchCategoryList.js | getCategoryList | model/category.getCategoryList | `Category[]` | getCategoryList | model/category.adaptCategoryList |
| services/good/fetchGood.js | fetchGood | model/good.genGood | `GoodDetail` | getGood | model/good.adaptGoodDetail |
| services/good/fetchGoods.js | fetchGoodsList | model/goods.getGoodsList | `GoodsListItem[]` | getGoodsList | model/goods.adaptGoodsList |
| services/good/fetchGoodsDetailsComments.js | getGoodsDetailsCommentsCount | model/detailsComments.getGoodsDetailsCommentsCount | `CommentCount` | getGoodsDetailsCommentsCount | model/detailsComments.adaptGoodsDetailsCommentsCount |
| services/good/fetchGoodsDetailsComments.js | getGoodsDetailsCommentList | model/detailsComments.getGoodsDetailsComments | `{ homePageComments: Comment[] }` | getGoodsDetailsCommentList | model/detailsComments.adaptGoodsDetailsComments |
| services/good/fetchGoodsList.js | fetchGoodsList | model/search.getSearchResult | `{ pageNum, pageSize, totalCount, spuList: GoodDetail[] }` | searchGoods | model/search.adaptSearchResult |
| services/good/fetchSearchHistory.js | getSearchHistory | model/search.getSearchHistory | `{ historyWords: string[] }` | getSearchHistory | model/search.adaptSearchHistory |
| services/good/fetchSearchHistory.js | getSearchPopular | model/search.getSearchPopular | `{ popularWords: string[] }` | getSearchPopular | model/search.adaptSearchPopular |
| services/good/fetchSearchResult.js | getSearchResult | model/search.getSearchResult | `{ pageNum, pageSize, totalCount, spuList: GoodDetail[] }` | searchGoods | model/search.adaptSearchResult |
| services/good/comments/fetchCommentDetail.js | getCommentDetail | model/comments/queryDetail.queryCommentDetail | `{ commentInfos: CommentDetail[] }` | getCommentDetail | model/comments/queryDetail.adaptCommentDetail |
| services/order/applyService.js | fetchRightsPreview | model/order/applyService.genRightsPreview | `{ data: RightsPreview }` | getRightsPreview | model/order/applyService.adaptRightsPreview |
| services/order/applyService.js | dispatchConfirmReceived | delay only | `{ success: true }` | confirmReceived | (none) |
| services/order/applyService.js | fetchApplyReasonList | model/order/applyService.genApplyReasonList | `{ data: { rightsReasonList } }` | getApplyReasonList | model/order/applyService.adaptApplyReasonList |
| services/order/applyService.js | dispatchApplyService | model/order/applyService.applyService | `{ data: { rightsNo } }` | applyService | model/order/applyService.adaptApplyService |
| services/order/orderConfirm.js | fetchSettleDetail | model/order/orderConfirm.genSettleDetail | `{ data: SettleDetail }` | getSettleDetail | model/order/orderConfirm.adaptSettleDetail |
| services/order/orderConfirm.js | dispatchCommitPay | mockDispatchCommitPay | `{ data: { isSuccess, tradeNo, ... } }` | commitPay | model/order/orderConfirm.adaptCommitPay |
| services/order/orderConfirm.js | dispatchSupplementInvoice | delay only | empty ok | supplementInvoice | (none) |
| services/order/orderDetail.js | fetchOrderDetail | model/order/orderDetail.genOrderDetail | `{ data: OrderDetail }` | getOrderDetail | model/order/orderDetail.adaptOrderDetail |
| services/order/orderDetail.js | fetchBusinessTime | model/order/orderDetail.genBusinessTime | `{ data: { businessTime, telphone, saasId } }` | getBusinessTime | model/order/orderDetail.adaptBusinessTime |
| services/order/orderList.js | fetchOrders | model/order/orderList.genOrders | `{ data: { pageNum, pageSize, totalCount, orders } }` | getOrderList | model/order/orderList.adaptOrders |
| services/order/orderList.js | fetchOrdersCount | model/order/orderList.genOrdersCount | `{ data: [{ tabType, orderNum }] }` | getOrderCount | model/order/orderList.adaptOrdersCount |
| services/order/orderSubmitComment.js | getGoods | model/submitComment.getGoods | `{ goods: [...], storeComment: {...} }` | getSubmitCommentGoods | model/submitComment.adaptSubmitCommentGoods |
| services/promotion/detail.js | fetchPromotion | model/promotion.getPromotion | `{ list, banner, time, showBannerDesc, statusTag }` | getPromotion | model/promotion.adaptPromotion |
| services/usercenter/fetchUsercenter.js | fetchUserCenter | model/usercenter.genUsercenter | `{ userInfo, countsData, orderTagInfos, customerServiceInfo }` | getUserCenter | model/usercenter.adaptUsercenter |
| services/usercenter/fetchPerson.js | fetchPerson | model/usercenter.genSimpleUserInfo + model/address.genAddress | `{ avatarUrl, nickName, phoneNumber, gender, address }` | getPerson | model/usercenter.adaptPerson |

## Adapt Functions (input/output examples)

### model/home.adaptHome
Input (real):
```
{
  "banners": [{"image": "https://.../banner1.png"}],
  "tabs": [{"text": "精选推荐", "key": 0}],
  "activityImage": "https://.../banner.png"
}
```
Output (mock):
```
{
  "swiper": ["https://.../banner1.png"],
  "tabList": [{"text": "精选推荐", "key": 0}],
  "activityImg": "https://.../banner.png"
}
```

### model/good.adaptGoodDetail
Input (real):
```
{
  "id": "0",
  "name": "航天神舟牌鱼蛋白粉固体饮料",
  "image": "https://.../main.png",
  "price": 95800,
  "linePrice": 100000,
  "stock": 510,
  "skus": [{"id": "135676631", "price": 95800, "linePrice": 100000, "stock": 175}]
}
```
Output (mock):
```
{
  "spuId": "0",
  "goodsName": "航天神舟牌鱼蛋白粉固体饮料",
  "primaryImage": "https://.../main.png",
  "minSalePrice": 95800,
  "maxLinePrice": 100000,
  "spuStockQuantity": 510,
  "skuList": [{"skuId": "135676631", "priceInfo": [{"priceType":1,"price":"95800"}]}]
}
```

### model/search.adaptSearchResult
Input (real):
```
{
  "pageNum": 1,
  "pageSize": 20,
  "totalCount": 1,
  "list": [ {"id": "0", "name": "航天神舟牌鱼蛋白粉固体饮料", "image": "https://..."} ]
}
```
Output (mock):
```
{
  "pageNum": 1,
  "pageSize": 20,
  "totalCount": 1,
  "spuList": [ {"spuId": "0", "title": "航天神舟牌鱼蛋白粉固体饮料", "thumb": "https://..."} ]
}
```

### model/cart.adaptCartGroupData
Input (real):
```
{ "items": [{"spuId":"0","skuId":"135676631","title":"航天神舟牌鱼蛋白粉固体饮料","price":95800,"quantity":2}] }
```
Output (mock):
```
{ "data": { "storeGoods": [{ "promotionGoodsList": [{ "goodsPromotionList": [ {"spuId":"0","quantity":2} ] }]}] } }
```

### model/order/orderConfirm.adaptSettleDetail
Input (real):
```
{ "goodsRequestList": [ {"spuId":"0","price":95800,"quantity":1} ] }
```
Output (mock):
```
{ "data": { "storeGoodsList": [ { "skuDetailVos": [ {"spuId":"0"} ] } ] } }
```

### model/order/orderConfirm.adaptCommitPay
Input (real):
```
{ "isSuccess": true, "tradeNo": "T123" }
```
Output (mock):
```
{ "data": { "isSuccess": true, "tradeNo": "T123" }, "code": "Success" }
```

### model/order/orderList.adaptOrders
Input (real):
```
{ "orders": [ {"orderNo":"O1","orderStatus":5,"items":[{"spuId":"0","name":"航天神舟牌鱼蛋白粉固体饮料"}] } ] }
```
Output (mock):
```
{ "data": { "orders": [ {"orderNo":"O1","orderItemVOs":[{"goodsName":"航天神舟牌鱼蛋白粉固体饮料"}] } ] } }
```

### model/order/orderDetail.adaptOrderDetail
Input (real):
```
{ "orderNo":"O1", "items":[{"spuId":"0","name":"航天神舟牌鱼蛋白粉固体饮料"}] }
```
Output (mock):
```
{ "data": { "orderNo":"O1", "orderItemVOs":[{"goodsName":"航天神舟牌鱼蛋白粉固体饮料"}] } }
```

### model/order/applyService.adaptRightsPreview
Input (real):
```
{ "orderNo":"O1", "goodsName":"航天神舟牌鱼蛋白粉固体饮料", "image":"https://..." }
```
Output (mock):
```
{ "data": { "orderNo":"O1", "goodsInfo": { "goodsName":"航天神舟牌鱼蛋白粉固体饮料", "skuImage":"https://..." } } }
```

### model/promotion.adaptPromotion
Input (real):
```
{ "items": [ {"id":"0","name":"航天神舟牌鱼蛋白粉固体饮料","image":"https://..."} ] }
```
Output (mock):
```
{ "list": [ {"spuId":"0","thumb":"https://...","title":"航天神舟牌鱼蛋白粉固体饮料"} ] }
```

## Validation Steps

1. Home page: toggle `config.useMock = false`, verify banners + tabs + activity image from `/cloudfunctions/getHome`.
2. Goods list + detail: verify `/cloudfunctions/getGoodsList` and `/cloudfunctions/getGood` map to mock shapes; product name and image render.
3. Search: search product name, ensure `searchGoods` returns list and results render.
4. Cart + checkout: add product, cart totals update, settle detail and commit pay succeed.
5. Orders: place order, verify `/cloudfunctions/getOrderList` + `/cloudfunctions/getOrderDetail` show order.
6. Rights/after-sale: open rights preview, check `getRightsPreview` + reason list.

## Backend Notes

- Cloud functions entry: `POST /cloudfunctions/<name>` with body `{ data: {...}, context?: {...} }`.
- Admin console: `http://localhost:3001/admin`.
- Data store: `server/data/db.json` (collections: `products`, `home`, `orders`, `rights`, `categories`).
- Function-level mock switch: `config.mockServices` / `config.realServices` allow partial real APIs without flipping all pages.

## ID 关联规则（%10）与 mockId

模板里大量关联依赖 `id % 10`。为避免真实后端 ID 打爆关联逻辑，后端保留数字型 `mockId`：

- 每条商品/分类/优惠券可保存 `mockId`（数字），前端适配优先使用 `mockId` 作为 `spuId`/`groupId`/`coupon.key`。
- 后端 `getGood/getGoodsList` 支持按 `id` 或 `mockId` 查询。
- Admin 新建数据时如未提供 `mockId`，后端自动分配递增 `mockId`。
