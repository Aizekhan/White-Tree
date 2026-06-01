# Phase 2.4 Integration Test — EXTRACT_CANON

**Мета:** Перевірити що backfill коректно витягує canon з реального проєкту перед створенням UI.

---

## 🎯 Критерії проходження (4 тести)

| # | Тест | Що перевіряє |
|---|------|--------------|
| 1 | **Canon structure** | Всі сутності мають `id`, `slug`, `name`, `origin` |
| 2 | **Inferred entities** | Всі `origin.source === "inferred"` і `origin.confirmed === false` |
| 3 | **deriveMemory empty** | `deriveMemory(canon)` повертає порожній memory (жодна сутність не authoritative) |
| 4 | **Idempotency** | Повторний прогін дає такий самий count сутностей (немає дублів) |

**Якщо всі 4 ✅ → можна будувати UI (Phase 2.3)**
**Якщо хоч один ❌ → фіксимо extraction перед UI**

---

## 🚀 Як запустити тест

### Варіант 1: Через консоль браузера (найпростіший)

1. **Запустіть dev сервер:**
   ```bash
   npm run dev
   ```

2. **Запустіть backend:**
   ```bash
   node server.js
   ```

3. **Відкрийте app у браузері:** `http://localhost:5173`

4. **Авторизуйтесь** (щоб Firebase працював)

5. **Відкрийте консоль браузера** (F12 → Console)

6. **Знайдіть ID проєкту для тесту:**
   - Відкрийте список проєктів
   - URL буде виглядати як `/project/ABC123XYZ`
   - Скопіюйте ID проєкту (частина після `/project/`)

7. **Виконайте тест:**
   ```js
   // Імпортуйте функцію тесту
   const { runBackfillTest } = await import('./src/canon/testBackfill.js');

   // Запустіть тест (замініть PROJECT_ID на реальний)
   const result = await runBackfillTest('YOUR_PROJECT_ID_HERE');

   // Результат виведеться в консоль
   console.log('Test result:', result.passed ? '✅ PASSED' : '❌ FAILED');
   ```

8. **Перевірте результати в консолі:**
   - Має з'явитися `TEST SUMMARY` з 4 тестами
   - Кожен тест має показати ✅ PASS або ❌ FAIL
   - Якщо всі ✅ → extraction працює коректно

9. **Перевірте у Firestore:**
   - Відкрийте Firebase Console → Firestore
   - Знайдіть ваш проєкт за ID
   - Перевірте що з'явилося поле `canon` з сутностями

---

### Варіант 2: Швидкий copy-paste скрипт

Скопіюйте цей блок цілком у консоль браузера (після авторизації):

```js
(async () => {
  const { backfillProjectCanon } = await import('./src/canon/backfillCanon.js');
  const { deriveMemory } = await import('./src/canon/deriveMemory.js');
  const { validateCanon } = await import('./src/canon/backfillCanon.js');
  const { db } = await import('./src/firebase.js');
  const { doc, getDoc, updateDoc } = await import('firebase/firestore');

  // ⚠️ ЗАМІНІТЬ на ID вашого проєкту
  const projectId = 'YOUR_PROJECT_ID_HERE';

  console.log('🧪 Starting backfill test...');

  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    console.error('❌ Project not found!');
    return;
  }

  const project = { id: projectSnap.id, ...projectSnap.data() };
  console.log('📁 Project:', project.title);

  // Run backfill
  const result = await backfillProjectCanon(project);

  if (!result.success) {
    console.error('❌ Backfill failed:', result.error);
    return;
  }

  console.log('✅ Backfill succeeded!');
  console.log('📊 Stats:', result.stats);

  // Test 1: Structure
  const validation = validateCanon(result.canon);
  console.log('✓ Test 1 - Structure:', validation.valid ? '✅ PASS' : '❌ FAIL');
  if (!validation.valid) console.log('  Errors:', validation.errors);

  // Test 2: All inferred
  const allInferred = [...result.canon.characters, ...result.canon.locations, ...result.canon.events]
    .every(e => e.origin?.source === 'inferred' && e.origin?.confirmed === false);
  console.log('✓ Test 2 - All inferred:', allInferred ? '✅ PASS' : '❌ FAIL');

  // Test 3: deriveMemory empty
  const derived = deriveMemory(result.canon);
  const isEmpty = derived.characters.length === 0;
  console.log('✓ Test 3 - deriveMemory empty:', isEmpty ? '✅ PASS' : '❌ FAIL');
  console.log('  Derived:', derived);

  // Write to Firestore
  await updateDoc(projectRef, { canon: result.canon });
  console.log('💾 Saved to Firestore');

  // Test 4: Idempotency
  console.log('\n🔄 Re-running for idempotency test...');
  const result2 = await backfillProjectCanon(project);
  const same = result2.stats.characters === result.stats.characters;
  console.log('✓ Test 4 - Idempotency:', same ? '✅ PASS' : '❌ FAIL');

  const allPassed = validation.valid && allInferred && isEmpty && same;
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
})();
```

---

## 📊 Що має показати тест (приклад успішного виводу)

```
🧪 ========== BACKFILL INTEGRATION TEST ==========
📁 Project ID: abc123xyz
⏰ Started at: 2026-06-01T12:00:00.000Z

📖 Loading project from Firestore...
✅ Project loaded: "Перший Сигнал" (UA)
   Memory: 3 chars, 2 locs
   Text: 1500 chars

🤖 Running backfillProjectCanon() [1st run]...
✅ Backfill completed successfully
📊 Stats: { characters: 3, locations: 2, events: 5, factions: 1, artifacts: 0, worldRules: 2 }

🧪 TEST 1: Canon structure validation...
   ✅ PASS

🧪 TEST 2: All entities inferred + unconfirmed...
   ✅ PASS

🧪 TEST 3: deriveMemory returns empty authoritative memory...
   ✅ PASS
   Derived memory: { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] }

💾 Writing canon to Firestore...
✅ Written to Firestore

🧪 TEST 4: Idempotency test (re-running backfill)...
   ✅ PASS
   1st run: { characters: 3, locations: 2, events: 5, factions: 1, artifacts: 0, worldRules: 2 }
   2nd run: { characters: 3, locations: 2, events: 5, factions: 1, artifacts: 0, worldRules: 2 }

==================================================
📊 TEST SUMMARY:
   1. ✅ Canon structure (id, name, origin fields)
   2. ✅ All entities inferred (confirmed:false)
   3. ✅ deriveMemory returns empty (proof migration is safe)
   4. ✅ Idempotency (same entity counts on re-run)

🎉 ALL TESTS PASSED
==================================================
```

---

## ⚠️ Troubleshooting

### Проблема: `Module not found`
- **Рішення:** Переконайтесь що dev server запущений (`npm run dev`)
- Спробуйте оновити сторінку (F5)

### Проблема: `AI Engine Error (401)`
- **Рішення:** Backend не запущений. Виконайте `node server.js`

### Проблема: `Project not found`
- **Рішення:** Перевірте ID проєкту. Він має бути точно як у Firestore.

### Проблема: Test 2 FAIL (entities not inferred)
- **Причина:** Баг в `asInferredCanon()` — не всі сутності отримали `origin.source="inferred"`
- **Дія:** Перевірте `src/canon/extractCanonPrompt.ts` функцію `asInferredCanon()`

### Проблема: Test 3 FAIL (deriveMemory not empty)
- **Причина:** Якісь сутності мають `confirmed: true` або `source: "explicit"`
- **Дія:** Перевірте що AI не ставить `confirmed: true` в response

### Проблема: Test 4 FAIL (duplicates)
- **Причина:** Ідемпотентність порушена — AI генерує різні IDs при повторному прогоні
- **Дія:** Перевірте промпт `EXTRACT_CANON_SYSTEM` — він має інструкцію "Reuse the SAME id when the same entity recurs"

---

## 🎬 Після успішного тесту

**Якщо всі 4 тести ✅:**

1. ✅ Extraction працює коректно
2. ✅ Canon безпечно записується в Firestore
3. ✅ deriveMemory коректно ігнорує inferred entities
4. ✅ Повторний прогін безпечний

**→ Можна переходити до Phase 2.3 (UI черги підтвердження)**

**Якщо є ❌:**
- Зафіксити проблему перед UI
- Повторити тест після фіксу
- Переконатися що всі 4 ✅

---

## 📝 Логи для Claude Design

Після тесту надішліть Claude Design:
- Вивід TEST SUMMARY (4 тести)
- Screenshot Firestore з `project.canon`
- Будь-які помилки якщо були

Це допоможе при дебазі Phase 2.
