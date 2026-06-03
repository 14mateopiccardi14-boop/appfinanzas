# Finanzas Mateo · Plan de migración + empaquetado APK

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar todas las features ya implementadas en `playground.html` al `index.html` real, validar la app en modo producción, y empaquetarla como APK Android vía TWA/Bubblewrap.

**Architecture:** El playground es una copia 1:1 del index con `localStorage` namespaceado (prefijo `pg:`), seed automático, banner + botón reset, y un cambio en el flag inicial del tutorial. La migración consiste en: clonar playground a index, remover esos 4 envoltorios de desarrollo, y validar. Después: hostear en GitHub Pages y generar APK firmado con Bubblewrap.

**Tech Stack:** HTML/CSS/JS vanilla single-file · localStorage · Chart.js (CDN) · GitHub Pages · Bubblewrap CLI · Java JDK + Android SDK.

**Spec aprobado:** [`docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`](../specs/2026-06-02-app-gastos-improvements-and-apk-design.md)

**Testing:** la app no tiene framework de tests automatizados. Cada feature se verifica manualmente abriendo el archivo en el navegador y siguiendo la checklist del paso correspondiente. No introducir framework de tests en este plan (YAGNI — el costo no se justifica para un single-file de un usuario).

---

## Fase A · Migración playground → index.html

### Task 1: Backup del index.html actual

**Files:**
- Modify: `index.html` (sin tocar todavía — solo backup)

- [ ] **Step 1: Crear backup explícito por las dudas**

```bash
cp "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html.pre-migration.bak"
```

- [ ] **Step 2: Verificar que existe**

```bash
ls -la "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html.pre-migration.bak"
```

Expected: archivo de ~107 KB visible.

- [ ] **Step 3: Agregar el .bak al .gitignore**

Editar `.gitignore` para agregar al final:
```
index.html.pre-migration.bak
```

- [ ] **Step 4: Commit del paso**

```bash
git add .gitignore
git commit -m "chore: ignore migration backup before applying playground changes"
```

---

### Task 2: Copiar playground.html → index.html (nueva versión)

**Files:**
- Modify: `index.html` (será sobrescrito por el contenido de playground.html)

- [ ] **Step 1: Sobrescribir index.html con playground.html**

```bash
cp "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/playground.html" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

- [ ] **Step 2: Verificar tamaño**

```bash
wc -l "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: ~3100 líneas (igual que playground.html actual).

- [ ] **Step 3: NO commitear todavía** — los siguientes pasos remueven el envoltorio de playground.

---

### Task 3: Remover el shim de namespacing localStorage

**Files:**
- Modify: `index.html` (líneas del IIFE que envuelve `window.localStorage`)

- [ ] **Step 1: Localizar el bloque a remover**

Buscar en `index.html` el comentario:
```
// ═══ PLAYGROUND MODE — namespacea localStorage con prefijo "pg:" ═══
```

- [ ] **Step 2: Borrar el bloque completo**

El bloque es un IIFE `(function(){...})()` que reemplaza `window.localStorage` con un shim que prefija `pg:`. Borrar desde el comentario hasta el `})();` inclusive (~28 líneas).

Eliminar también el log `console.log('%c[PLAYGROUND]'...);` que está al final del IIFE.

- [ ] **Step 3: Verificar que no queda referencia a `pg:`**

```bash
grep -n "pg:" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: ninguna línea (o sólo en comentarios irrelevantes).

---

### Task 4: Remover el seed automático

**Files:**
- Modify: `index.html` (IIFE que carga datos ficticios)

- [ ] **Step 1: Localizar el bloque a remover**

Buscar el comentario:
```
// ═══ PLAYGROUND SEED — datos ficticios para ver la app poblada ═══
```

- [ ] **Step 2: Borrar el IIFE completo del seed**

Es otro `(function(){var SEED_VERSION='seed:v4';...})();`. Borrar desde el comentario hasta el `})();` inclusive.

- [ ] **Step 3: Verificar que no queda nada con `seed:`**

```bash
grep -n "seed:v" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: ninguna línea.

---

### Task 5: Remover el banner del playground y el botón Reset

**Files:**
- Modify: `index.html` (HTML del banner)

- [ ] **Step 1: Localizar el banner**

Buscar el comentario HTML:
```html
<!-- PLAYGROUND BANNER -->
```

- [ ] **Step 2: Borrar el div completo del banner**

Es el `<div style="background:#7a0e1e;...">🧪 PLAYGROUND — ...</div>` (con el botón Reset adentro). Borrar también el comentario `<!-- PLAYGROUND BANNER -->`.

- [ ] **Step 3: Verificar que no queda nada de "PLAYGROUND"**

```bash
grep -n "PLAYGROUND\|🧪" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: ninguna línea (o sólo en comentarios totalmente irrelevantes — verificar manualmente).

---

### Task 6: Restaurar el título de la pestaña del navegador

**Files:**
- Modify: `index.html` (tag `<title>`)

- [ ] **Step 1: Cambiar el título**

Buscar:
```html
<title>🧪 PLAYGROUND · Finanzas · Mateo</title>
```

Reemplazar por:
```html
<title>Finanzas · Mateo</title>
```

(Mateo se queda como nombre default; el usuario puede cambiarlo desde Ajustes → Perfil.)

---

### Task 7: Verificación del index.html limpio

**Files:**
- Read: `index.html`

- [ ] **Step 1: Verificar tamaño aprox**

```bash
wc -l "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: ~3000–3050 líneas (perdimos ~50 líneas al sacar los wrappers).

- [ ] **Step 2: Buscar referencias residuales a playground**

```bash
grep -ni "playground\|seed:v\|pg:" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html"
```

Expected: cero resultados.

- [ ] **Step 3: Sintaxis JS — abrir el archivo en el navegador**

Doble-click sobre `index.html`. Abrir DevTools (F12) → tab Console. Verificar que NO hay errores rojos.

Expected: consola sin errores. La app abre. Probablemente vacía (sin gastos).

- [ ] **Step 4: Aparece el tutorial**

Como es la primera vez en una sesión nueva (sin `tutorial:seen` en localStorage real), el tutorial debería aparecer automáticamente a los 500ms.

Expected: modal full-screen con bienvenida.

- [ ] **Step 5: Cerrar tutorial → la app queda vacía**

Tocar "¡Empezar!" hasta el final del tutorial.

Expected: dashboard vacío. KPIs en cero. Empty state amigable en "Movimientos".

---

### Task 8: Smoke test de las features clave en index.html

**Files:**
- Read only: `index.html` (testing en navegador)

- [ ] **Step 1: Configurar ingreso base**

Ajustes → Finanzas → Ingreso base: 1000000 → Guardar.

Expected: toast "Configuración guardada". Dashboard muestra ingreso $1.000.000.

- [ ] **Step 2: Cambiar nombre del usuario**

Ajustes → Perfil → Tu nombre: "Test" → Guardar.

Expected: el header dice "Buenos días, Test".

- [ ] **Step 3: Cargar un gasto manual**

Cargar → tipear "café 5000" en el textarea → tocar "Registrar gasto".

Expected: toast "Registrado: $5.000". Dashboard muestra Gastado: $5.000.

- [ ] **Step 4: Cargar un gasto de tercero**

Cargar → "campera 50000" → activar toggle "Es de tercero" → escribir "Mamá" → Registrar.

Expected: Dashboard muestra card violeta "Te deben: $50.000".

- [ ] **Step 5: Tap en card "Te deben" → pantalla detalle**

Tap en la card violeta.

Expected: pantalla overlay con "Mamá" + el gasto + botón verde "✓ Pagó".

- [ ] **Step 6: Marcar saldado**

Tap "✓ Pagó".

Expected: toast "💰 Saldado". El gasto desaparece de pendientes. Volver al dashboard: card "Te deben" desaparece (no hay pendientes).

- [ ] **Step 7: Probar color picker**

Ajustes → Presupuestos por categoría → tocar el círculo de color de "Gastronomía" → elegir uno azul de la paleta.

Expected: el donut del dashboard usa el nuevo color para Gastronomía.

- [ ] **Step 8: Probar modo claro**

Ajustes → Apariencia → toggle "Modo claro".

Expected: fondo cambia a beige/crema, texto oscuro.

- [ ] **Step 9: Backup / restore**

Ajustes → Backup → Exportar backup completo. Descarga un .json.

Inspeccionar manualmente el JSON descargado: debe contener keys `months`, `extras`, `cuotas`, `config`, `simple`. El campo `version` debe ser `3`.

- [ ] **Step 10: Commit la migración**

```bash
git add index.html
git commit -m "feat: apply playground improvements to index.html

- Cierre de tarjetas (banner + asignación de cuotas al ciclo correcto)
- Gasto pagado con tarjeta + widget 'Por tarjeta' con período de facturación
- USD separado del KPI Gastado, KPI propio + sección Análisis con histórico
- Gastos de terceros (reembolsos) con pantalla dedicada y marcar saldado
- Paleta de colores 24 + custom picker en modal
- Nombre del usuario editable
- Ingresos extras del mes (pestaña Ingresos)
- Gastos recurrentes con auto-carga mensual
- Tutorial in-app 6 slides al primer arranque
- Empty states amigables
- Búsqueda en transacciones
- Modo claro opcional
- Compartir resumen via Web Share API
- Confirmación inline (clearMonth)
- Polish global: transitions, tap states, toasts top-center
- Backup v3 con todas las keys nuevas"
```

---

## Fase B · Limpieza de archivos auxiliares

### Task 9: Eliminar playground.html (ya migrado a index.html)

**Files:**
- Delete: `playground.html`

- [ ] **Step 1: Confirmar que index.html funciona bien (volver a Task 8 si dudás)**

- [ ] **Step 2: Borrar playground.html**

```bash
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/playground.html"
```

- [ ] **Step 3: Verificar que se borró**

```bash
ls "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/playground.html"
```

Expected: error "No such file".

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove playground.html (migrated to index.html)"
```

---

### Task 10: Limpiar archivos working antiguos del gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Leer el gitignore actual**

```bash
cat "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/.gitignore"
```

Expected output:
```
_part*.js
extract.js
fix.js
temp.js
Resumenes/
.superpowers/
index.html.pre-migration.bak
```

- [ ] **Step 2: Decisión**

Esos archivos (`_part*.js`, `extract.js`, etc.) son de etapas previas del proyecto. Si ya no se usan, podés removerlos físicamente:

```bash
ls "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/" | grep -E "_part|extract|fix\.js|temp\.js"
```

Si existen y NO los usás, borralos:
```bash
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/_part"*.js
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/extract.js"
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/fix.js"
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/temp.js"
```

Si no existen físicamente, el .gitignore queda inocuo.

- [ ] **Step 3: Commit (si hubo cambios)**

```bash
git status
# si hay cambios:
git add -A
git commit -m "chore: clean up unused dev files from earlier phases"
```

---

## Fase C · Validación final pre-APK

### Task 11: Checklist completo del spec contra el index.html

**Files:**
- Read: `docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`

- [ ] **Step 1: Abrir el spec en una columna, el index.html (en navegador) en otra**

- [ ] **Step 2: Recorrer las 32 decisiones de la tabla**

Para cada decisión, verificar que está implementada en la app. Ir tildando mentalmente. Lista de chequeo:

1. TWA Bubblewrap → no aplica en esta fase
2. Enfoque A (features primero) → ✓ ya completado
3. Cierre tarjetas in-app banner → verificar config Visa con closeDay=5 y ver banner si faltan ≤3 días
4. Umbral ≤3 días → confirmado en código
5. Sub-sección "Tarjetas" en Config → ✓ visible
6. Recálculo runtime cuotas → cargar cuota nueva con tarjeta Visa después del día 5 → confirmar mes siguiente
7. Default tarjeta = última usada → cargar gasto con Visa, salir, volver: Visa pre-seleccionada
8. Período facturación si hay closeDay → widget "Por tarjeta" muestra "26 May–25 Jun"
9. Chips con tarjeta default + editables → verificar Ajustes → Atajos rápidos (si está)
10. KPI USD card ancha → ✓
11. USD fuera del donut → confirmado
12. Histórico USD en Análisis → tocar Análisis del mes → ver barras de 12 meses
13. Paleta 24 colores + custom → ✓ probado en Task 8
14. Modal no inline → ✓
15. Reset color individual → botón "Restablecer" en el modal
16. Heatmap análisis → opcional/parcial (queda como nice-to-have, no bloqueante)
17. Pull-to-refresh → no implementado, opcional
18. Iconos SVG en Config → ✓ varios usados
19. APK con OK explícito → próxima fase
20-23. Gastos de terceros → ✓
24. Tutorial 6 slides → ✓
25. Nombre editable → ✓ probado
26. Gastos recurrentes → ✓
27. Empty states → ✓ probado
28. Búsqueda en tx → ✓
29. Modo claro → ✓ probado
30. Compartir resumen → ✓
31. Confirmación inline → ✓
32. Color picker → ✓ probado

- [ ] **Step 3: Anotar gaps**

Si encontrás algo no implementado, decidir: ¿bloquea el ship o se difiere? Heatmap y pull-to-refresh son los más probables candidatos a diferir.

- [ ] **Step 4: Si querés, commit final de validación**

```bash
# si todo está OK:
git commit --allow-empty -m "chore: validation pass against spec — ready for APK"
```

---

### Task 12: Validación offline (service worker)

**Files:**
- Verify: `sw.js`, `manifest.json`, `index.html` (sin tocar)

- [ ] **Step 1: Servir el index.html con servidor local**

Usar Live Server de VSCode, o `python -m http.server 8000` desde la carpeta del proyecto. (El service worker no funciona vía `file://`.)

- [ ] **Step 2: Abrir http://localhost:8000 en el navegador**

Expected: app carga, service worker se registra (ver Console).

- [ ] **Step 3: DevTools → Application → Service Workers → confirmar registrado**

Expected: `sw.js` listado, status "activated and running".

- [ ] **Step 4: Apagar el server (matar el proceso)**

- [ ] **Step 5: Recargar la pestaña**

Expected: la app sigue funcionando, datos del localStorage intactos. (Esto valida que el service worker cachea offline.)

- [ ] **Step 6: Volver a prender el server**

- [ ] **Step 7: Commit**

```bash
git commit --allow-empty -m "test: validate offline service worker still works post-migration"
```

---

## Fase D · Empaquetado APK (NO EJECUTAR SIN OK EXPLÍCITO DEL USUARIO)

> **⚠️ Esta fase requiere confirmación explícita del usuario antes de iniciar.** El plan asume que el usuario ya dijo "dale, hacé el APK".

### Task 13: Gate de aprobación del usuario

- [ ] **Step 1: Confirmar verbalmente con el usuario**

Pregunta al usuario:
> "Confirmás que querés empaquetar la app como APK ahora? Esto implica:
> 1. Hacer el repo público (o usar GitHub Pro para Pages privado).
> 2. Hostear la PWA en GitHub Pages.
> 3. Instalar Bubblewrap CLI y Java JDK + Android SDK localmente.
> 4. Generar y firmar el APK."

Si el usuario dice "sí", continuar. Si dice "después", parar acá. Si dice "cambiá X primero", volver a planning.

---

### Task 14: Verificar visibilidad del repo

**Files:**
- External: repositorio GitHub del proyecto

- [ ] **Step 1: Verificar si el repo es público o privado**

```bash
gh repo view --json visibility
```

Expected: `{"visibility":"PUBLIC"}` (o `"PRIVATE"`).

- [ ] **Step 2: Decisión**

- Si PUBLIC: continuar al Task 15.
- Si PRIVATE: el usuario debe decidir entre:
  - Hacer el repo público: `gh repo edit --visibility public` (confirmación explícita del usuario requerida — exponer commits viejos al público).
  - Mantener privado y usar GitHub Pro para Pages privado (US$ 4/mes).
  - Cambiar a otro hosting (Netlify, Cloudflare Pages — gratis con repos privados).

- [ ] **Step 3: Verificación post-decisión**

Si fue cambio a público:
```bash
gh repo view --json visibility
```

Expected: `{"visibility":"PUBLIC"}`.

---

### Task 15: Activar GitHub Pages

**Files:**
- External: settings del repo

- [ ] **Step 1: Push de los últimos commits a main**

```bash
git push origin main
```

Expected: push sin errores.

- [ ] **Step 2: Activar Pages via gh CLI**

```bash
gh api -X POST "repos/{owner}/{repo}/pages" -f source[branch]=main -f source[path]=/
```

(Reemplazar `{owner}` y `{repo}` con valores reales. `gh api repos/{owner}/{repo}` te los muestra.)

Expected: respuesta JSON con `"html_url"`.

- [ ] **Step 3: Esperar ~2 minutos al primer deploy**

- [ ] **Step 4: Verificar que la PWA carga vía HTTPS**

Abrir en el navegador: `https://<owner>.github.io/<repo>/`.

Expected: la app carga, tutorial aparece, todo funciona.

- [ ] **Step 5: Anotar la URL exacta** — la vas a necesitar en Task 17.

---

### Task 16: Instalar Bubblewrap CLI

**Files:**
- External: dependencias globales

- [ ] **Step 1: Verificar que tenés Node.js**

```bash
node --version
```

Expected: `v18.x` o superior. Si no, instalar Node desde https://nodejs.org.

- [ ] **Step 2: Verificar Java JDK 17**

```bash
java -version
```

Expected: `openjdk version "17"` o `"21"`. Si no, instalar:
- Windows: https://adoptium.net/temurin/releases/?version=17
- Settear `JAVA_HOME` apuntando al JDK.

- [ ] **Step 3: Instalar Bubblewrap CLI globalmente**

```bash
npm install -g @bubblewrap/cli
```

Expected: instalación sin errores.

- [ ] **Step 4: Verificar instalación**

```bash
bubblewrap --version
```

Expected: número de versión.

---

### Task 17: Generar proyecto Bubblewrap

**Files:**
- Create: nueva carpeta `c:\Users\Mateo\Desktop\CLAUDE CODE\App Gastos APK\` (paralela al repo, NO adentro)

- [ ] **Step 1: Crear directorio aparte para el wrapper Android**

```bash
mkdir "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos APK"
cd "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos APK"
```

- [ ] **Step 2: Inicializar Bubblewrap**

```bash
bubblewrap init --manifest "https://<owner>.github.io/<repo>/manifest.json"
```

Reemplazar la URL con la real de Task 15.

- [ ] **Step 3: Responder el wizard**

- App name: `Finanzas Mateo`
- Short name: `Finanzas`
- Package name: `com.mateo.finanzas` (escogido durante brainstorming)
- Display mode: `standalone`
- Status bar color: `#080808`
- Theme color: `#080808`
- Splash bg: `#080808`
- Icon: usar el icon.png del repo (URL automática)
- Signing keystore: crear nuevo (Bubblewrap genera el .keystore — guardarlo offline)
- Password keystore: anotar segura (gestor de contraseñas, NO commitear)
- Password key alias: anotar igual

Expected: directorio con `app-release-signed.apk` y `app-release-bundle.aab` post-build.

---

### Task 18: Build del APK

**Files:**
- Output: `app-release-signed.apk`, `app-release-bundle.aab`, `<package>.keystore`

- [ ] **Step 1: Generar build**

```bash
bubblewrap build
```

Expected: 5–10 minutos de build (descarga gradle/SDK la primera vez). Termina con paths a APK y AAB.

- [ ] **Step 2: Verificar archivos generados**

```bash
ls -la *.apk *.aab *.keystore
```

Expected: los 3 archivos presentes. Anotar el SHA-256 fingerprint del keystore (Bubblewrap lo imprime en pantalla — necesario para el `assetlinks.json`).

- [ ] **Step 3: Guardar keystore + passwords offline**

⚠️ **CRÍTICO:** Sin el keystore no podés generar futuros updates de la app. Copiarlo a:
- Un drive externo (USB, Google Drive privado, etc.).
- NO commitearlo al repo (debe estar en .gitignore del directorio APK — está por default).
- Guardar las dos passwords en un gestor de contraseñas.

---

### Task 19: Configurar Digital Asset Links

**Files:**
- Create: `<repo>/.well-known/assetlinks.json`

- [ ] **Step 1: Obtener el contenido del assetlinks.json**

Bubblewrap lo genera automáticamente. Buscar en el directorio del APK:
```bash
cat "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos APK/assetlinks.json"
```

Es un JSON tipo:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mateo.finanzas",
    "sha256_cert_fingerprints": ["AB:CD:EF:..."]
  }
}]
```

- [ ] **Step 2: Crear el directorio en el repo**

```bash
mkdir -p "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/.well-known"
```

- [ ] **Step 3: Copiar el assetlinks.json al repo**

```bash
cp "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos APK/assetlinks.json" "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/.well-known/assetlinks.json"
```

- [ ] **Step 4: Commit y push**

```bash
git add .well-known/assetlinks.json
git commit -m "feat: add Digital Asset Links for TWA APK validation"
git push origin main
```

- [ ] **Step 5: Esperar a que GitHub Pages re-deploye (~1 min)**

- [ ] **Step 6: Verificar que el archivo se sirve**

Abrir: `https://<owner>.github.io/<repo>/.well-known/assetlinks.json`

Expected: el JSON con el fingerprint, sin error 404.

---

### Task 20: Test del APK en Android

**Files:**
- Transfer: `app-release-signed.apk` al celular

- [ ] **Step 1: Habilitar "Orígenes desconocidos" en el Android**

Ajustes Android → Privacidad/Seguridad → permitir instalación de fuentes desconocidas para el explorador de archivos o Drive.

- [ ] **Step 2: Transferir el APK al celular**

Opciones:
- USB: copiar el `.apk` a la carpeta Download del celular.
- Drive/Telegram: subir, descargar en el celular.

- [ ] **Step 3: Instalar tocando el APK desde el explorador del celular**

Expected: pantalla "Quiere instalar esta app", tap "Instalar".

- [ ] **Step 4: Abrir la app instalada**

Expected: ícono propio en el cajón de apps, abre sin barra de navegador.

- [ ] **Step 5: Validar features clave en el APK**

- Tutorial aparece (primera vez).
- Cargar un gasto, refrescar, verificar persistencia (localStorage del WebView).
- Modo claro funciona.
- Compartir resumen abre el sheet nativo de Android.
- Ícono y theme color matchean el manifest.

- [ ] **Step 6: Validar offline**

Modo avión ON → cerrar y reabrir la app. Expected: carga normalmente (service worker).

---

### Task 21: Cleanup final + documentar

**Files:**
- Update: `docs/superpowers/CONTINUAR-ACA.md`
- Update: spec con estado "completado"

- [ ] **Step 1: Actualizar CONTINUAR-ACA.md con el estado final**

Marcar todo como completado. Anotar:
- URL de GitHub Pages.
- Ubicación del keystore (sin password, solo decir "en mi disco externo X").
- Package name del APK: `com.mateo.finanzas`.

- [ ] **Step 2: Marcar el spec como completo**

Cambiar el header del spec a:
```
**Estado:** Completado · APK firmado generado YYYY-MM-DD
```

- [ ] **Step 3: Eliminar el backup pre-migración**

```bash
rm "c:/Users/Mateo/Desktop/CLAUDE CODE/App Gastos/index.html.pre-migration.bak"
```

(Si querés conservarlo más tiempo por las dudas, dejalo — ya está en gitignore.)

- [ ] **Step 4: Commit final**

```bash
git add docs/
git commit -m "docs: mark App Gastos migration + APK packaging as complete"
git push origin main
```

- [ ] **Step 5: 🎉 Compartir APK con tu hermana**

Pasarle el archivo `app-release-signed.apk` por Drive/Telegram/USB. Cuando lo abra por primera vez verá el tutorial.

---

## Notas operativas

### Updates futuros de la app

- **Cambios al `index.html`** (features nuevos, fixes) → solo push a main → GitHub Pages re-deploye automáticamente → el APK ya instalado los toma vía network-first del service worker. **No hace falta re-generar el APK.**
- **Cambios al wrapper** (nombre, ícono, manifest, package name) → re-build con Bubblewrap usando el mismo keystore. NUNCA generar un keystore nuevo (perderías la firma).

### Si querés publicar en Google Play

Usar el `.aab` (no el `.apk`). Necesitás:
1. Cuenta Google Play Console (US$25 único pago).
2. Política de privacidad pública (puede ser una página en GitHub Pages).
3. Descripciones, screenshots, ícono 512x512.
4. Subir el `.aab` desde Play Console.

Plan separado si llegás a esto.

### Riesgos identificados durante el brainstorming (recordatorio)

1. Recálculo runtime de cuotas → mitigado con modal informativo en código.
2. Período de facturación complejo → función pura `billingPeriod` ya en código.
3. Repo público → resuelto en Task 14.
4. Bubblewrap setup en Windows → resuelto con instrucciones explícitas en Task 16.
