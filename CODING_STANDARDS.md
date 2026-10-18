# Coding Standards

> 本文件是 code review 的判卷依據。每條規則都必須能從 diff 中客觀判斷「有沒有違反」。

> **套用到本 repo(DineTogether)時的對照**:本文件的範例取自股票專案,請依下表對應,不要按字面比對名稱。
>
> | 文件寫法 | 本 repo 對應 |
> |---|---|
> | 套件 `com.brian.stock` | `com.example.GroupRecommend`(`src/main/java/`) |
> | `domain/`(Entity) | `entity/` |
> | `config/` 裡的 `@RestControllerAdvice` | `exception/GlobalExceptionHandler` |
> | `SymbolNotFoundException`、行情 API 等例子 | 換成本專案的領域概念(見 `GLOSSARY.md`) |
> | 前端根目錄 | `web/src/` |
> | TypeScript 範例(`.tsx`、型別) | 本 repo 前端是 JavaScript,取其做法,不要求型別 |

---

## Backend — Spring Boot

### 1. 分層職責（最高優先）

| 層 | 只能做 | 禁止 |
|---|---|---|
| **Controller** | 接收 Request DTO、`@Valid` 驗證、呼叫 Service、回傳 Response DTO | 業務判斷（if / for / 計算）、呼叫 Repository、呼叫外部 API、組裝或修改 Entity、try-catch 業務例外 |
| **Service** | 業務邏輯、交易邊界（`@Transactional`）、協調多個 Repository / Port | 處理 HTTP 細節（`HttpServletRequest`、`ResponseEntity`、status code） |
| **Repository** | 資料存取 | 業務邏輯 |
| **Adapter / Client** | 呼叫外部系統（行情 API、通知服務等） | 業務邏輯 |

**Controller 判定標準：**
- 一個 endpoint 只呼叫 **一個** Service 方法
- 方法內不得出現 `if`、`for`、`stream()` 等業務流程控制
- 例外一律往上拋，由 `@RestControllerAdvice` 統一轉成錯誤回應

```java
// ✅ 正確
@PostMapping
public SignalResponse create(@Valid @RequestBody CreateSignalRequest req) {
    return signalService.create(req);
}

// ❌ 錯誤：業務邏輯寫在 Controller
@PostMapping
public SignalResponse create(@RequestBody CreateSignalRequest req) {
    if (req.getPrice().compareTo(BigDecimal.ZERO) <= 0) { ... }
    Signal s = signalRepository.save(new Signal(...));
    return new SignalResponse(s);
}
```

### 2. 依賴與解耦

- 一律 **constructor injection**，欄位宣告為 `final`；禁止 field `@Autowired`
- 外部資料源、通知服務必須透過 **interface（Port）** 存取，Service 只依賴 interface，實作放在 adapter 套件
- Service 之間避免互相循環依賴；共用邏輯抽成獨立的 domain service

### 3. 資料傳遞

- **Entity 不得離開 Service 層**：Controller 收發一律使用 DTO
- DTO ↔ Entity 轉換集中在 Mapper（MapStruct 或專責 Mapper 類別），不得散落在 Controller / Service 各處
- 金額、價格、比率一律使用 `BigDecimal`，禁止 `double` / `float`

### 4. 例外處理

- 業務錯誤使用自訂例外（如 `SymbolNotFoundException`），繼承共同的 `BusinessException`
- 禁止吞例外（空 catch、只 log 不處理）

### 5. 套件結構

```
com.brian.stock
├── controller/      # 只有 HTTP 轉換
├── service/         # 業務邏輯
├── repository/      # 資料存取
├── domain/          # Entity、Value Object
├── dto/             # Request / Response
├── mapper/          # DTO ↔ Entity
├── port/            # 對外部系統的 interface
├── adapter/         # port 的實作（API client 等）
└── config/          # 設定、ControllerAdvice
```

---

## Frontend — React + Ant Design

### 1. 元件分層

| 目錄 | 職責 | 禁止 |
|---|---|---|
| `components/common/` | 跨功能可重用的通用元件 | import API、store、業務型別；寫死業務文字或欄位名稱 |
| `features/<feature>/components/` | 特定功能的業務元件 | 被其他 feature 直接 import（需要共用就搬到 common） |
| `pages/` | 路由頁面，負責組裝元件與 hooks | 直接寫 API 呼叫、大量 UI 細節 |
| `hooks/` | 資料取得、狀態邏輯 | 回傳 JSX |
| `services/api/` | 所有 API 呼叫集中於此 | — |

**元件內禁止直接呼叫 `fetch` / `axios`**，必須透過 `services/api` + hooks。

### 2. 通用元件的彈性化設計

- **透傳原生 props**：包裝 antd 元件時，型別擴充原元件的 Props，並以 `...rest` 透傳，保留 antd 原本的 API

  ```tsx
  // ✅ 正確
  type DataTableProps<T> = TableProps<T> & { loading?: boolean };
  export function DataTable<T>({ loading, ...rest }: DataTableProps<T>) {
    return <Table<T> loading={loading} {...rest} />;
  }
  ```

- **用組合取代旗標**：客製化區塊使用 `children`、render props 或 slot props（如 `extra`、`renderActions`），避免持續新增 `showXxx`、`isXxxMode` 這類 boolean 旗標
- **資料由外部注入**：通用元件只透過 props 取得資料與 callback，不自行取資料
- **不寫死樣式**：顏色、間距使用 antd `ConfigProvider` theme token，不得寫死色碼

### 3. 抽出共用的時機

- 同一 UI 結構 **第二次出現** → 評估抽出
- **第三次出現** → 必須抽到 `components/common/`

---

## Review 判定原則

1. 違反「分層職責」與「Entity 不得離開 Service 層」→ **必須修正**
2. 違反彈性化設計、抽共用時機 → **建議修正**
3. 本文件未涵蓋的問題，依 Fowler code smells 判斷
