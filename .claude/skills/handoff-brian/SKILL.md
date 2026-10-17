---
name: handoff-brian
description: 結束 session 前,把目前進度寫成交接文件存進專案的 handoff/,給下一個 session 接手。
argument-hint: "下一個 session 要做什麼?(可省略)"
disable-model-invocation: true
---

把這次對話的進度寫成交接文件,存進專案的 `handoff/`(已被 git 忽略,只留在本機)。下一個 session 會依 `CLAUDE.md` 自動讀最新的那一份。若使用者有給參數,把它當成下一個 session 的焦點,整份文件圍繞它來寫。

## 步驟

1. **查現況**:執行 `git branch --show-current`、`git status --porcelain`、`git log --oneline -10`、`git log --oneline @{u}..HEAD`(未 push 的 commit)。完成條件:你能說出分支、哪些檔案未 commit、哪些 commit 還沒 push。

2. **讀上一份**:若 `handoff/` 已有檔案,讀修改時間最新的一份。逐項判斷:仍成立的保留,已完成或已過時的刪掉,和步驟 1 的現況矛盾的以現況為準。完成條件:舊文件的每一項都已決定「保留 / 改寫 / 刪除」。

3. **寫新文件**:存成 `handoff/YYYY-MM-DD-<主題>.md`(日期用今天,主題用短英文),每次都是新檔,舊檔留著。依序包含:
   - **下一個 session 的焦點**
   - **專案狀態**:分支、未 commit / 未 push 的內容。commit 只寫編號和標題,細節交給 `git show`。
   - **這次完成的事**:指向 commit、檔案路徑或文件,不重述 diff 內容。
   - **下一步**:具體到可以直接動手的程度。
   - **待使用者決定的事**、**已知問題**
   - **慣例與使用者偏好**:只寫看程式碼看不出來的(做事流程、驗證方式、溝通語言、何時才能 commit/push)。
   - **建議的 skills**:下一個 session 該用 Skill 工具呼叫哪些 skill。

   完成條件:新 session 只讀這份文件加上它指向的檔案,就能接手,不需要回頭看這次的對話。

4. **去除敏感資料**:密碼、API key、token、Email、真實姓名、資料庫帳密一律不寫。測試帳號只寫 id。

5. **確認並回報**:執行 `git check-ignore <新檔路徑>` 確認它被忽略。不要 commit。回報給使用者:新檔路徑、這次刪掉了上一份的哪些過時內容。若 `handoff/` 累積超過 5 份,提醒使用者可以刪掉舊的。
