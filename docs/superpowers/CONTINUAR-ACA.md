# Dónde quedamos — App Gastos

**Última sesión:** 2026-06-02

## Estado actual

✅ Brainstorming completo
✅ Diseño aprobado por secciones (mockup visual OK)
✅ Spec escrito y autorrevisado → [spec aprobado](specs/2026-06-02-app-gastos-improvements-and-apk-design.md)
✅ `playground.html` creado en la raíz — copia de `index.html` con `localStorage` namespaceado (prefijo `pg:`) para testear los cambios sin tocar datos reales
⏳ **Esperando confirmación final del spec para arrancar implementación**

## Workflow de implementación

- Todos los cambios se hacen en **`playground.html`**, no en `index.html` (hasta que se aprueben).
- Para tener datos realistas: exportar backup desde `index.html` e importarlo en `playground.html`.
- Cuando una fase está aprobada al 100%, se copia `playground.html` → `index.html`.

## Decisiones clave (las 19 cerradas)

Ver tabla completa al final del spec. Resumen:
- TWA (Bubblewrap) para empaquetar, no Capacitor
- Orden: features primero, APK al final
- 3 fases: Lógica nueva → UX/visuales → APK
- USD separado del KPI "Gastado", card ancha verde abajo
- Widget "Por tarjeta" usa período de facturación si hay closeDay
- Tarjeta default por chip (hardcoded + editable en Config)
- Paleta 24 colores + custom picker en modal
- Iconos SVG monocromáticos en Config (no emojis)
- **Fase 3 (APK) no se ejecuta sin OK explícito post-app**

## Próximo paso cuando vuelvas

Pegale a Claude esto exactamente:

> Vengo de continuar el spec de App Gastos. Está en `docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`. Ya lo aprobé. Avanzá con el skill `writing-plans` para armar el plan de implementación paso a paso.

O alternativamente si querés cambiar algo del spec primero:

> Vengo de continuar el spec de App Gastos en `docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`. Quiero cambiar [lo que sea] antes de avanzar.

## Archivos del brainstorming

- **Spec final:** `docs/superpowers/specs/2026-06-02-app-gastos-improvements-and-apk-design.md`
- **Mockup visual del dashboard:** `.superpowers/brainstorm/809-1780438687/content/dashboard-mockup.html`
  (carpeta `.superpowers/` ya está en `.gitignore`, no se sube al repo)

## Estado del repo

- `index.html` y `icon.png` aparecen como modificados desde antes de esta sesión — no los toqué.
- `.gitignore` modificado: agregué `.superpowers/`.
- `docs/superpowers/specs/...md` creado nuevo (sin commitear todavía — decidí esperar tu OK).

## Pendientes técnicos para Fase 3 (cuando llegue)

- Verificar si el repo es público (GitHub Pages gratis lo requiere).
- Tener Java JDK + Android SDK instalados para Bubblewrap.
- Alternativa más fácil: PWA Builder web (https://www.pwabuilder.com/).
