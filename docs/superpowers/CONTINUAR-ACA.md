# Dónde quedamos — App Gastos

**Última sesión:** 2026-06-12

## Sesión 2026-06-12 — Auditoría + bugs + pulido UX

Auditoría completa de la app. Se implementaron 7 mejoras (un commit c/u):

1. **fix txInPeriod**: el año se calculaba mal en cierres de tarjeta que cruzan dic→ene
2. **SW offline**: ahora cachea Chart.js y fuentes del CDN (cache v4) — gráficos funcionan sin señal
3. **Deshacer al borrar**: toast con botón "Deshacer" 5s (toast ahora soporta acciones: `toast(msg,type,{label,fn})`)
4. **Hápticos**: `buzz(ms)` al registrar/editar/borrar/saldar/cambiar mes
5. **Recordatorio de backup**: toast si pasaron 30+ días del último export (o nunca y hay 20+ gastos), máx 1/semana
6. **Detalle del día**: tocar un día del heatmap abre sheet con los gastos de ese día (antes te tiraba a Gastos con búsqueda)
7. **USD coherente**: nueva config "Cotización USD" en Ajustes (`cfg usdRate`, default 1200). Txs USD guardan `usd` (dólares) + `monto` (pesos). Migración one-time de txs viejas (`usdMigrated`). KPI USD muestra US$ reales. **El usuario tiene que poner la cotización real en Ajustes.**

Pendientes que quedaron de la auditoría (no pedidos aún): tenencia USD con cotización automática (DolarAPI), búsqueda multi-mes, compartir resumen como imagen.

**Íconos rediseñados (aprobados por el usuario, commit `3caaa0d`):** medallón central del emblema (sol + $AR + laurel) sobre cuero a sangre completa — sin marco de placa ni adornos cortados por la máscara. Fuente del arte: `icon-source.png` (committeado); builder: `_build_icons.py` (local, gitignored, requiere Pillow). Cache-bust en `?v=3`. **Falta que el usuario regenere el APK en PWA Builder para que cambie el ícono del launcher.**

También en esta sesión: pulido estético (bottom sheets, total en la dona, header compacto al scroll, transición direccional, acentos dorados, grano de fondo). Se intentó tipografía serif Fraunces y se revirtió (no gustó — ver memoria feedback-tipografia-app).

---

## Sesión anterior (2026-06-05)

## Estado actual

✅ Brainstorming completo
✅ Diseño aprobado
✅ Migración playground.html → index.html
✅ 31/32 decisiones del spec implementadas (D17 pull-to-refresh descartado conscientemente — no aplica a app local)
✅ Cleanup: `playground.html` eliminado, `_part*.js` / `extract.js` / `fix.js` / `temp.js` borrados
✅ **APK funcional generado y andando en el celu del usuario** (PWA Builder + TWA)
✅ Repo público en GitHub + GitHub Pages activo:
   - URL pública: https://14mateopiccardi14-boop.github.io/appfinanzas/
   - Repo: https://github.com/14mateopiccardi14-boop/appfinanzas
✅ Hermana puede instalar vía Safari → "Agregar a pantalla de inicio"
✅ Updates automáticos: `git push` → en 2 min llega al celu sin reinstalar

## Polish premium aplicado en esta sesión

- **Aurora**: animado con 5 blobs → mesh gradient estático saturado (sin animaciones, sin parallax)
- **Nav inferior**: pill grande deslizante → dot 5px iOS-18 style con glow accent
- **Income card**: count-up 650ms del número + sheen periódico cada 7s
- **KPIs**: 4 barras de progreso → sparklines de 6 meses con currentColor (responde al tema)
- **Manifest**: scope, id, orientation, categories, lang agregados para TWA
- **iOS touch icon**: apunta al maskable (sin fondo blanco)

## ⚠️ PENDIENTE para la próxima sesión

**El logo NO convenció al usuario.** Recorrido del logo en esta sesión:

1. Original: icon.png 2048×2048 AI-generated con emblema $AR + sol + handshake + íconos rituales sobre cuadro vino con fondo blanco
   → Problema: Android lo mostraba con fondo blanco alrededor (no maskable)
2. Fix v1 (commit `29b9ac8`): crop 78% del original sobre fondo vino
   → Quedaba un margen blanco fino del anti-aliasing del borde redondeado
3. Fix v2 (commit `b226e82`): crop 62% del original, descarta el contorno dorado
   → Mejor pero el usuario lo sentía cargado/AI-generated
4. **Nuevo design** (commit `97edc5e`): Sol de Mayo dorado + "$" abajo sobre vino sólido, generado con PowerShell + System.Drawing
   → **Usuario dijo "el logo es feo"** — el design programático es demasiado plano/básico

**Caminos posibles para la próxima:**
- Hacer un logo en Figma/Canva (más control visual que PowerShell)
- Probar una IA generadora de íconos (Midjourney, Recraft, etc.) con prompts más curados
- Volver al emblema AR-generated original pero procesarlo mejor (sacar el blanco, no croppear el laurel)
- Pedirle al usuario que pase un logo de referencia que le guste

## Workflow del proyecto

- Branch único `main`. Commits inmediatos por feature.
- `git push` → GitHub Pages → app del celu actualizada en ~2 min (TWA carga la URL)
- Re-empaquetar APK solo necesario si cambia: manifest.json, sw.js mismo, íconos, package_id
- Para cambios de UI/features/lógica → solo push, no reinstalar APK

## Archivos relevantes

- **App:** `index.html` (~3760 líneas, single file)
- **Manifest:** `manifest.json` (con maskable + any icons)
- **Service worker:** `sw.js` (network-first para HTML, cache-first para assets)
- **Íconos actuales (a redesignar):**
  - `icon.png` (1024×1024, purpose:any) — Sol+$ programático
  - `icon-maskable-512.png` (purpose:maskable)
  - `icon-maskable-192.png` (purpose:maskable)
- **Spec:** `docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`
- **Plan:** `docs/superpowers/plans/2026-06-03-app-gastos-migration-and-apk.md`

## Estado del repo

- Branch: `main`
- Working tree limpio
- Pusheado a origin/main
- Último commit: `97edc5e` feat: nuevo icono Sol de Mayo + dólar (el que no gustó)

## Próximo paso al volver

1. Decidir cómo abordar el logo (ver opciones arriba)
2. Si el usuario tiene un logo en mente, generar maskable + 192/512 a partir de ese
3. Push → usuario regenera APK en PWA Builder (mismos pasos de siempre)
4. Listo, proyecto cerrado salvo features futuras

## Lo que queda fuera del scope original

- Pull-to-refresh (D17) — descartado conscientemente, no aplica a localStorage
- Sincronización entre dispositivos (sería backend, no estaba en spec)
- Publicación en Google Play (signing key actual sirve para sideload, no Play Store)
