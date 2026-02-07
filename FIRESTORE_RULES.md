# Firestore Security Rules 配置說明

## 📋 概述

本專案的 Firestore 安全規則已配置完成，支援以下功能：
- ✅ 產品瀏覽（公開）
- ✅ 訂單創建和追蹤（公開）
- ✅ 訂單留言系統（雙向溝通）
- ✅ 修改請求提交（客戶）
- ✅ 管理員完整權限

---

## 🔐 Collection 權限設定

### 1. `products` - 產品資料

| 操作 | 權限 | 說明 |
|------|------|------|
| **Read** | 🌐 Public | 所有訪客都可以瀏覽產品 |
| **Create/Update/Delete** | 🔒 Admin only | 僅管理員可以管理產品 |

**使用場景：**
- 首頁產品展示
- 產品詳情頁
- 購物車添加產品

---

### 2. `orders` - 訂單

| 操作 | 權限 | 說明 |
|------|------|------|
| **Create** | 🌐 Public | 任何人都可以創建訂單 |
| **Read** | 🌐 Public | 任何人都可以讀取訂單（用於追蹤） |
| **Update/Delete** | 🔒 Admin only | 僅管理員可以修改訂單狀態 |

**使用場景：**
- 客戶提交訂單
- 訂單追蹤頁面（輸入訂單 ID）
- 管理員更新訂單狀態

**安全考量：**
- 雖然是公開讀取，但客戶需要知道訂單 ID 才能查看
- 訂單 ID 使用 Firebase 自動生成（難以猜測）
- 未來可增加「驗證碼」或「手機號碼」驗證

---

### 3. `orders/{orderId}/messages` - 訂單留言（子集合）

| 操作 | 權限 | 說明 |
|------|------|------|
| **Read** | 🌐 Public | 任何人都可以讀取留言 |
| **Create** | 🌐 Public | 客戶和管理員都可以發送消息 |
| **Update/Delete** | 🔒 Admin only | 僅管理員可以編輯/刪除消息 |

**使用場景：**
- 客戶在訂單追蹤頁留言
- 管理員回覆客戶問題
- 雙向溝通（類似客服系統）

**消息結構：**
```typescript
{
  id: string;
  orderId: string;
  senderType: 'customer' | 'admin';
  senderName: string;
  message: string;
  timestamp: Firestore.Timestamp;
  isRead: boolean;
}
```

---

### 4. `modificationRequests` - 修改請求

| 操作 | 權限 | 說明 |
|------|------|------|
| **Create** | 🌐 Public | 客戶可以提交修改請求 |
| **Read** | 🌐 Public | 客戶可以查看自己的請求狀態 |
| **Update/Delete** | 🔒 Admin only | 管理員處理請求 |

**使用場景：**
- 客戶要求修改訂單（變更顏色、數量等）
- 管理員審核並回應請求
- 追蹤修改請求狀態

**請求結構：**
```typescript
{
  id: string;
  orderId: string;
  customerName: string;
  customerContact: string;
  requestType: 'color' | 'quantity' | 'design' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: Firestore.Timestamp;
  updatedAt?: Firestore.Timestamp;
}
```

---

### 5. `colorSwatches` - 顏色選項

| 操作 | 權限 | 說明 |
|------|------|------|
| **Read** | 🌐 Public | 所有人都可以查看可用顏色 |
| **Create/Update/Delete** | 🔒 Admin only | 僅管理員可以管理顏色 |

**使用場景：**
- 產品詳情頁顯示顏色選項
- 管理員新增/刪除可用顏色
- 標記庫存狀態

---

## 🔑 管理員驗證

**驗證方式：**
```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.email != null;
}
```

**條件：**
- ✅ 用戶已通過 Firebase Authentication 登入
- ✅ 用戶有有效的 email

**如何設置管理員：**
1. 在 Firebase Console 創建用戶帳號
2. 使用 `/login` 頁面登入
3. 訪問 `/admin` 管理後台

---

## 🚨 安全考量與限制

### 目前的安全措施

✅ **已實施：**
- 管理員操作需要身份驗證
- 敏感操作（修改、刪除）僅限管理員
- 使用 Firestore 規則而非客戶端驗證

⚠️ **潛在風險：**
- 訂單和留言是公開讀取的（任何人知道 ID 即可查看）
- 沒有速率限制（可能被濫用大量創建訂單）
- 沒有內容過濾（留言可能包含不當內容）

---

### 建議的進階安全措施

#### 1. 訂單隱私保護

**選項 A：驗證碼系統**
```javascript
// 創建訂單時生成 6 位數驗證碼
const verificationCode = Math.random().toString().slice(2, 8);

// 規則：需要提供正確的驗證碼才能讀取
allow read: if request.auth != null &&
            resource.data.verificationCode == request.query.code;
```

**選項 B：手機號碼驗證**
```javascript
// 規則：僅允許匹配手機號的人查看
allow read: if request.auth != null &&
            resource.data.customerPhone == request.auth.token.phone_number;
```

---

#### 2. 速率限制

**使用 Firebase App Check：**
```json
// firebase.json
{
  "appCheck": {
    "enabled": true
  }
}
```

**規則示例：**
```javascript
// 限制每個 IP 每小時最多創建 10 個訂單
allow create: if request.time > resource.data.lastOrderTime + duration.value(1, 'h')
              || resource.data.orderCount < 10;
```

---

#### 3. 內容審核

**留言過濾：**
- 使用 Firebase Cloud Functions 自動審核
- 檢測敏感詞彙
- 標記可疑消息供管理員審核

**實施方式：**
```javascript
// functions/index.js
exports.moderateMessages = functions.firestore
  .document('orders/{orderId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const inappropriate = detectInappropriate(message.message);

    if (inappropriate) {
      await snap.ref.update({ flagged: true, visible: false });
      // 通知管理員
    }
  });
```

---

#### 4. 管理員權限分級

**自訂 Claims：**
```javascript
// 在 Cloud Functions 中設置
admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  permissions: ['orders.write', 'products.write']
});

// 在規則中使用
function hasPermission(permission) {
  return request.auth.token.permissions.hasAny([permission]);
}
```

---

## 📊 規則測試

**使用 Firebase Emulator：**
```bash
# 啟動 Firestore Emulator
firebase emulators:start --only firestore

# 在代碼中連接到 Emulator
connectFirestoreEmulator(db, 'localhost', 8080);
```

**測試案例：**
```javascript
// 測試 1: 訪客可以讀取產品
const products = await getDocs(collection(db, 'products'));
expect(products.size).toBeGreaterThan(0);

// 測試 2: 訪客不能刪除產品
await expectAsync(
  deleteDoc(doc(db, 'products', 'test-id'))
).toBeRejected();

// 測試 3: 管理員可以更新訂單
await signInWithEmailAndPassword(auth, admin_email, admin_password);
await updateDoc(doc(db, 'orders', 'test-order'), { status: 'completed' });
```

---

## 🔄 規則更新流程

**部署新規則：**
```bash
# 1. 編輯 firestore.rules
vim firestore.rules

# 2. 本地測試（使用 Emulator）
firebase emulators:start --only firestore

# 3. 部署到生產環境
firebase deploy --only firestore:rules

# 4. 驗證部署
firebase firestore:rules:get
```

**回滾規則：**
```bash
# 查看歷史版本
firebase firestore:rules:list

# 回滾到特定版本
firebase firestore:rules:release <version-id>
```

---

## 📝 常見問題

### Q1: 為什麼訂單是公開讀取的？

**A:** 為了讓客戶可以在不登入的情況下追蹤訂單。客戶需要知道訂單 ID（Firebase 生成的隨機字串）才能查看，這提供了一定程度的安全性。

**更安全的做法：** 實施驗證碼或手機號驗證系統。

---

### Q2: 如何防止垃圾訂單？

**A:** 目前規則允許任何人創建訂單。建議實施：
- Firebase App Check（防止機器人）
- reCAPTCHA 驗證
- 速率限制
- 手機號碼驗證

---

### Q3: 留言會被審核嗎？

**A:** 目前沒有自動審核。建議：
- 實施 Cloud Functions 自動過濾
- 管理員手動審核標記的消息
- 設置敏感詞黑名單

---

### Q4: 如何查看當前規則？

**A:**
```bash
# 命令行查看
firebase firestore:rules:get

# 或在 Firebase Console
https://console.firebase.google.com/project/ddd-project-130e3/firestore/rules
```

---

## 📚 相關文檔

- [Firebase Security Rules 官方文檔](https://firebase.google.com/docs/rules)
- [Firestore Security Rules 參考](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)

---

**最後更新：** 2026-02-07
**規則版本：** 1.0.0
**部署狀態：** ✅ 已部署至生產環境
