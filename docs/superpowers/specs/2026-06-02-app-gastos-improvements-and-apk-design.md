# Finanzas Mateo — mejoras + empaquetado APK

**Fecha:** 2026-06-02
**Estado:** Diseño aprobado, pendiente de aprobación del spec escrito
**Tipo:** Mejoras incrementales sobre la PWA actual + empaquetado nativo

---

## Resumen ejecutivo

La app actual (`index.html` single-file PWA) funciona bien pero le faltan tres features funcionales y polish de UX antes de empaquetarla como APK de Android. Este spec define **3 fases** sobre el mismo `index.html`:

1. **Fase 1 — Lógica nueva:** cierre de tarjetas + gasto pagado con tarjeta + conteo por tarjeta + USD como ahorro separado + paleta de colores con custom picker + gastos de terceros (reembolsos).
2. **Fase 2 — UX/visuales:** pulido del form de carga, pestaña de análisis, configuración, y polish global.
3. **Fase 3 — Empaquetado APK:** GitHub Pages + Bubblewrap (TWA). **No se ejecuta sin OK explícito del usuario una vez que la app esté terminada.**

El modelo single-file de la app se mantiene. Toda la persistencia nueva es vía `localStorage` y respeta el flujo de backup/restore existente.

---

## Restricciones y constraints generales

- **Single-file HTML:** no se introduce build step, framework ni separación de archivos. El `index.html` queda como única fuente.
- **Persistencia:** `localStorage` exclusivamente. Sin servidor.
- **Compatibilidad:** la app debe seguir funcionando con datos viejos (sin migraciones manuales). Datos nuevos se interpretan con defaults sensatos.
- **Backup/restore:** debe seguir funcionando — los nuevos campos van en el JSON exportado.
- **Sin notificaciones push reales:** los avisos de cierre son in-app banner. Push push se difiere a un follow-up con servidor dedicado si el usuario lo pide.

---

## Fase 1 — Lógica nueva

### 1.1 Cierre de tarjetas

**Data model:**
- Cada método de pago gana 2 campos opcionales: `closeDay` (1–31) y `dueDay` (1–31).
- `paymentMethods` migra de constante hardcoded en `APP_CONFIG` a `localStorage.paymentMethods` con seed inicial copiado del actual.
- Si no hay nada en `localStorage`, usa el seed.

**UI en Configuración:**
- Nueva sub-sección **"Tarjetas"** (con ícono SVG rectángulo con banda).
- Lista de tarjetas con campos editables: nombre, día de cierre, día de vencimiento.
- Botón "+ Agregar tarjeta" y botón borrar por tarjeta (con confirmación inline de 3 seg).
- Si el método es "Efectivo" no se piden días.

**Lógica de asignación de cuotas:**
- Función nueva `cuotaPrimerMes(cuota)` que devuelve `{year, month}` del primer mes de facturación.
- Si la tarjeta de la cuota tiene `closeDay` configurado y `inicio` es posterior al `closeDay` del mes en cuestión, la cuota empieza el mes siguiente.
- Si no hay `closeDay`, comportamiento actual (mes del `inicio`).
- Se calcula en runtime cada render (sin caché en el registro). Las cuotas viejas se "reasignan" automáticamente cuando configurás los días.

**Banners de cierre próximo:**
- En el dashboard, arriba del KPI grid, banner condicional cuando alguna tarjeta cierra en **≤3 días** (umbral configurable más adelante).
- Banner separado cuando una tarjeta vence en ≤3 días (texto distinto).
- Tap → va a la sección Tarjetas en Config.
- Si hay varias tarjetas en estado de aviso, se muestra **solo la más próxima** en el banner principal. Tap → modal con la lista completa de cierres/vencimientos próximos.

### 1.2 Gasto pagado con tarjeta + widget "Por tarjeta"

**Data model:**
- Cada transacción regular suma un campo opcional **`tarjeta`** (mismo dominio que cuotas).
- Default al cargar: la última tarjeta usada (guardada en `localStorage.lastUsedCard`). Si no hay registro previo, default = `"Efectivo"`.
- Transacciones existentes sin `tarjeta` se asumen como `"Efectivo"` retroactivamente. Sin migración manual.

**UI: form de carga de gasto:**
- Nuevo campo **"Pagué con"** (select de tarjetas) arriba del campo "Fecha".
- Disponible tanto en modo manual como en auto-interpretado.

**Quick chips con tarjeta default:**
- Cada chip puede tener una `tarjeta` opcional. Defaults hardcoded iniciales:

| Chip | Tarjeta default |
|---|---|
| Nafta | Visa Galicia |
| Subte | Mercado Pago |
| Comida | Mercado Pago |
| Ropa | Visa Galicia |
| Netflix | Mastercard Gold |
| USD | (sin tarjeta) |

- En Configuración, nueva sub-sección **"Atajos rápidos"** que permite editar de cada chip: descripción, categoría, monto fijo y tarjeta.

**Widget "Por tarjeta" (nuevo en Dashboard):**
- Card nueva debajo del donut.
- Lista las tarjetas con: ícono, nombre, total facturado, sub-label con cuentas (`12 gastos + 3 cuotas`) y período usado, badge con "cierra en Xd" cuando aplica.
- Ordenado por monto descendente.
- Tap en una tarjeta → modal con la lista de gastos y cuotas que componen ese total, ordenados por fecha. Permite editar/borrar (reutilizando flujos existentes).

**Lógica del "mes" en el conteo por tarjeta:**
- Si la tarjeta tiene `closeDay` configurado → usa **período de facturación** (entre cierre anterior y cierre actual).
- Si no tiene `closeDay` → usa **mes calendario**.
- Para "Efectivo" siempre mes calendario.
- El sub-label del widget aclara qué modo está en uso (ej. "Período: 26 May – 25 Jun" vs "Mes calendario").

**Impacto en KPI "Gastado":**
- **No cambia.** El KPI "Gastado" sigue siendo todo lo del mes calendario. El widget "Por tarjeta" es una vista adicional.

### 1.3 USD como ahorro separado

**Cambio de lógica:**

```
ANTES:
  ahorro_est = ingreso − gastado − cuotas_mes − previo
  donde gastado INCLUYE Ahorro USD

DESPUÉS:
  gastado            = suma de tx con cat ≠ "Ahorro USD"
  ahorro_est         = ingreso − gastado − cuotas_mes − previo  (sin USD)
  ahorro_usd_acum    = suma de tx con cat = "Ahorro USD" en el mes
```

**KPIs en el dashboard:**
- Grilla 2×2 con los 4 KPIs existentes (Gastado, Cuotas, Ahorro est., Disponible) — sin Ahorro USD.
- Card ancha **debajo** de la grilla: "Ahorro USD acumulado" con monto del mes en pesos + badge con equivalente en USD.
- Color verde (`var(--ok)`) para diferenciar visualmente del bloque rojo/ámbar de KPIs principales.

**Donut chart:**
- La categoría "Ahorro USD" **deja de aparecer** en el donut "Gasto por categoría".

**Pestaña Análisis:**
- Nueva sección **"Compras de USD"** con:
  - Line chart de pesos invertidos por mes (últimos 12 meses).
  - Card con total histórico acumulado en pesos y en USD.
  - Cantidad total de operaciones.

**Lista de transacciones:**
- Las compras de USD siguen apareciendo en la lista, sin cambios visuales.

### 1.4 Paleta de colores + custom picker

**Persistencia:**
- `localStorage.catColors` guarda overrides de color por categoría: `{ "Gastronomía": "#abc123", ... }`.
- En la función que arma `CAT_COLORS` al inicio: defaults primero, override después.

**Paleta curada:**
- 24 colores en 4 grupos de 6 (cálidos, fríos, violetas, neutros). Saturaciones medias para no competir con la aurora roja.

**UI del picker:**
- Modal triggereado desde la config de cada categoría (donde hoy editás presupuesto), botón "Color" con swatch del color actual.
- 4 filas etiquetadas con grupos.
- Botón "+ Color personalizado" → abre `<input type="color">` nativo.
- Sección "Vista previa" con el dot + nombre de la categoría.
- Botón "Restablecer color" para volver al default.

**Categorías personalizadas:**
- El select de 9 colores existente al crear categoría custom se reemplaza por el mismo picker (paleta + custom).

### 1.5 Gastos de terceros (reembolsos)

Permite registrar gastos que otra persona hace con tu medio de pago (típicamente tu tarjeta) y que esa persona después te devuelve. Tracking completo de "te deben".

**Data model:**
- Cada transacción gana un campo opcional `tercero`:
  ```js
  tercero: {
    nombre: "Mamá",
    estado: "pendiente",      // "pendiente" | "saldado"
    fechaSaldo: "2026-06-15"  // solo presente cuando estado === "saldado"
  }
  ```
- Si la transacción no tiene `tercero`, es gasto normal.
- Lista de nombres usados antes guardada en `localStorage.terceros` para autocomplete rápido.

**Comportamiento en cálculos:**
- Gastos con `tercero.estado === 'pendiente'`:
  - **NO se descuentan** de "Gastado" en el KPI del dashboard.
  - **NO aparecen** en el donut "Gasto por categoría".
  - **SÍ se suman** al widget "Por tarjeta" (porque la tarjeta cobra igual). Aparecen con dot 🟡 al lado del monto: "incluye reembolsables".
- Gastos con `tercero.estado === 'saldado'`:
  - Quedan como histórico. No entran a ningún cálculo del mes (ya te lo devolvieron).
- Aplica a **cualquier método de pago** (tarjeta, MP, efectivo).

**UI: form de carga de gasto:**
- Toggle "Es de tercero" debajo del campo "Pagué con".
- Cuando está ON, aparece:
  - Input "¿Quién?" con autocomplete de los nombres en `localStorage.terceros`.
- Si el gasto tiene `tercero` cargado, se guarda inicialmente como `estado: "pendiente"`.

**UI: dashboard — card "Te deben":**
- Card compacta debajo del widget "Por tarjeta".
- Muestra: total adeudado, count de gastos pendientes, count de personas, top 2 personas con monto.
- Ejemplo:
  ```
  👥 Te deben                 $87.500
     3 gastos pendientes · 2 personas
     → Mamá $62.000 · Hermana $25.500
  ```
- Tap → navega a la pantalla detalle "Te deben".

**UI: pantalla detalle "Te deben":**
- Nueva pantalla accesible vía tap en la card del dashboard (NO nueva pestaña en bottom nav).
- Header con flecha "← Te deben".
- Lista agrupada por persona, ordenada por monto descendente.
- Cada persona: nombre + total adeudado + chevron expandible.
- Al expandir: lista de gastos pendientes de esa persona con fecha y monto.
- **Cada gasto pendiente:** botón verde compacto "✓ Pagó" visible al lado del monto. Tap → marca ese gasto como `saldado`, animación fade-out, toast "💰 Saldado".
- Por persona: botón "✓ Me pagó todo" que marca todos sus pendientes como saldados de una.
- Botón "+ Nuevo" por persona: shortcut para cargar un gasto nuevo prellenado con esa persona como tercero.
- Sección "Historial saldado" colapsada al final con los saldados, ordenados por `fechaSaldo` descendente.

**UI: lista de transacciones general:**
- Gastos con `tercero` muestran un badge "👤 Mamá · Te debe" (pendiente) o "👤 Mamá · Saldado" (saldado) debajo de la descripción.
- Mismo estilo visual que el dot de categoría.

**Backup/restore:**
- El JSON exportado incluye los campos `tercero` en cada tx + la lista `terceros` (nombres frecuentes).
- Restore importa todo sin migraciones.

**Migración de tx existentes:**
- Las transacciones viejas sin `tercero` siguen funcionando como gasto normal. Sin migración.

---

## Fase 2 — UX/visuales

### 2.1 Form de carga de gasto

- Campo **"Pagué con"** ya cubierto en 1.2.
- **Monto con formato vivo:** display grande arriba del input que muestra `$1.500.000` mientras tipeás.
- **Auto-focus en Descripción** al entrar al form. Al confirmar gasto en modo manual, focus vuelve a Descripción.
- **Haptic feedback** (`navigator.vibrate(15)`) en "Registrar gasto" y en quick chips.
- **Feedback visual del auto-interpret:** chip de categoría se ilumina 400ms cuando la app interpreta.
- **Atajos "Hoy/Ayer":** 2 chips chicos al lado del datepicker.

### 2.2 Pestaña Análisis

- **Heatmap mensual:** mini-calendario del mes con días coloreados según monto gastado.
- **Top 5 gastos del mes:** lista compacta.
- **Sparkline por categoría:** mini-curva (~8px alto) al lado del nombre de cada categoría, últimos 6 meses, sin ejes.
- **Filtro "Por tarjeta":** chip superior que filtra los análisis a una tarjeta puntual.
- **Sección "Compras de USD":** ya cubierta en 1.3.

### 2.3 Configuración

- **Iconos SVG** monocromáticos por sub-sección (no emojis): Finanzas, Presupuestos, Categorías, Tarjetas, Atajos, Backup.
- **Accordeon:** sub-secciones colapsan/expanden con animación de 220ms. Default: Finanzas abierta.
- **Confirmación inline para borrar:** botón "Borrar" → "¿Seguro?" durante 3 seg antes de ejecutar. Reemplaza `confirm()` del navegador.
- **Backup/restore más visible:** card propia arriba, con "última fecha de export" si hay registro.

### 2.4 Polish global

- **Transiciones entre pestañas:** fade + slide horizontal de 220ms.
- **Skeleton loaders:** shimmer en cards al primer render del dashboard.
- **Empty states con personalidad:** ícono grande + mensaje cuando la pantalla está vacía.
- **Pull-to-refresh** en el dashboard.
- **Toasts mejorados:** top-center con animación spring + ícono por tipo.
- **Tap states más claros:** `transform: scale(0.97)` + opacidad en `:active` en todos los items tappeables.

---

## Fase 3 — Empaquetado APK (no ejecutar sin OK explícito)

### 3.1 Hosting

- **GitHub Pages** desde el repo existente.
- Verificar que el repo es público (o usar GitHub Pro para Pages privado).
- URL resultante: `https://<usuario>.github.io/App-Gastos/`.

### 3.2 Digital Asset Links

- Generar `.well-known/assetlinks.json` con la huella SHA-256 del keystore.
- Servirlo desde el hosting.

### 3.3 Bubblewrap

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<host>/manifest.json
# Wizard pregunta: nombre, color theme, ícono, paquete (com.mateo.finanzas)
bubblewrap build
```

Output: `.apk` (sideload), `.aab` (Play Store futuro), `.keystore` + passwords.

**Keystore: guardar offline. No commitear.**

### 3.4 Testing

- Habilitar "Orígenes desconocidos" en Android.
- Transferir APK (USB / Drive).
- Instalar y validar:
  - Abre offline (service worker).
  - Ícono se ve bien (192 y 512 en manifest).
  - Theme color matches.
  - `localStorage` persiste entre sesiones.

### 3.5 Updates futuros

- Cambios al `index.html` → push a GitHub Pages → el APK los toma automáticamente vía network-first del service worker.
- Solo re-empaquetar APK si cambia el wrapper (nombre, ícono, paquete).

---

## Estructura de archivos resultante

```
App Gastos/
├── index.html               # ← todos los cambios de Fase 1 y 2
├── manifest.json            # (sin cambios)
├── sw.js                    # (sin cambios)
├── icon.png                 # (sin cambios)
├── .gitignore               # + .superpowers/
└── docs/superpowers/specs/
    └── 2026-06-02-app-gastos-improvements-and-apk-design.md  # este archivo
```

Fase 3 agrega afuera del repo un proyecto Android wrapper generado por Bubblewrap (mantenido por separado).

---

## Testing strategy

La app no tiene tests automatizados hoy. Para este spec:

- **Testing manual** en cada feature: lista de checks por feature antes de marcarla como terminada.
- **Smoke test al final de Fase 1**: cargar gastos, cuotas, validar KPIs, cargar USD, validar widget por tarjeta, configurar cierres, validar reasignación.
- **Smoke test al final de Fase 2**: navegación entre pestañas, transiciones, empty states, accordeon.
- **Validación de no-regresión**: importar un backup viejo y verificar que la app sigue funcionando con datos sin los campos nuevos.

---

## Riesgos identificados

1. **Recálculo de cuotas en runtime al configurar cierres** → puede confundir si una cuota "se mueve" de un mes a otro sin que el usuario lo entienda. **Mitigación:** modal informativo al guardar el `closeDay` por primera vez en una tarjeta, con el texto: "Las cuotas existentes pagadas con esta tarjeta se recalcularán automáticamente según el día de cierre. Las cargadas después del día N corresponden al mes siguiente."
2. **Período de facturación complejo** → cálculos de "qué cae en este ciclo" pueden tener bugs con meses de distinta longitud / cierres en fin de mes. **Mitigación:** función pura `periodoFacturacion(tarjeta, ref_date)` con tests manuales explícitos.
3. **Hosting en GitHub Pages requiere repo público** → ya hay un commit que indica que se quitaron datos sensibles. Verificar antes de hacer el repo público.
4. **Bubblewrap depende de Java JDK + Android SDK** → setup inicial puede ser fricción en Windows. **Mitigación:** documentar el setup en el plan de implementación, considerar PWA Builder web como alternativa más fácil.

---

## Decisiones cerradas durante el brainstorming

| # | Decisión | Resolución |
|---|---|---|
| 1 | Tipo de empaquetado | TWA (Bubblewrap) — no Capacitor, no nativo |
| 2 | Orden | Enfoque A: features primero, APK al final |
| 3 | Cierre tarjetas: notificaciones | In-app banner (no push real) |
| 4 | Cierre tarjetas: umbral aviso | ≤3 días |
| 5 | Cierre tarjetas: lugar Config | Nueva sub-sección "Tarjetas" |
| 6 | Cierre tarjetas: cuotas existentes | Recálculo runtime (no caché en registro) |
| 7 | Tarjeta en gasto: default | Última tarjeta usada |
| 8 | Conteo por tarjeta: período | Período facturación si hay closeDay, mes calendario si no |
| 9 | Chips con tarjeta default | Hardcoded + editable en Config sub-sección "Atajos rápidos" |
| 10 | USD: 5to KPI | Card ancha debajo del grid 2×2 |
| 11 | USD en donut | Desaparece del donut |
| 12 | Histórico USD | En Análisis (no sub-label del KPI) |
| 13 | Paleta de colores | 24 colores en 4 grupos + custom picker |
| 14 | Picker | Modal (no inline) |
| 15 | Reset color | Por categoría individual (no global) |
| 16 | Heatmap análisis | Sí |
| 17 | Pull-to-refresh | Sí |
| 18 | Iconos Config | SVG monocromáticos (no emojis) |
| 19 | APK | No ejecutar sin OK explícito post-app |
| 20 | Gastos de terceros: tracking | Completo — quién debe + estado + saldado |
| 21 | Gastos de terceros: métodos | Cualquier método de pago, no solo tarjeta |
| 22 | Gastos de terceros: lugar UI | Card en dashboard + pantalla dedicada (no tab en nav) |
| 23 | Gastos de terceros: marcar saldado | Botón "✓ Pagó" visible al lado del monto (no swipe, no menú) |
| 24 | Tutorial in-app primera vez | Modal 5 slides en primer arranque, re-disponible desde Ajustes |
| 25 | Nombre del usuario | Editable en Ajustes (para que sirva compartir con otra persona) |
| 26 | Gastos recurrentes | Suscripciones/abonos configurables en Ajustes, se auto-cargan en el día correspondiente |
| 27 | Empty states | Pantalla vacía amigable con emoji + mensaje + CTA (no texto plano "Sin datos") |
| 28 | Búsqueda en transacciones | Input arriba de la lista, filtra por descripción y categoría en vivo |
| 29 | Modo claro opcional | Toggle en Ajustes → Apariencia, persiste en localStorage |
| 30 | Compartir resumen | Botón en Ajustes que usa Web Share API (fallback a clipboard) |
| 31 | Confirmación inline | El botón "Borrar mes" pide segundo tap en lugar de `confirm()` del navegador |
| 32 | Color picker | 4 grupos de 6 colores + custom picker nativo + restablecer, accesible desde Ajustes → Presupuestos |

---

## Próximos pasos

1. Usuario aprueba este spec.
2. Invocar skill `writing-plans` para generar el plan de implementación detallado, paso por paso, por fase.
3. Ejecutar Fase 1.
4. Ejecutar Fase 2.
5. Esperar OK del usuario.
6. Ejecutar Fase 3.
