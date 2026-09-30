# Decisiones técnicas adicionales — SmartBudget (MenteMoneda)

## 1. `@extend` con placeholders en SASS

**Qué es:** en `sass/abstracts/_placeholders.scss` hay cinco patrones
de layout que se repetían mucho (`%row`, `%row-between`, `%col`,
`%circle`). En vez de escribir `display: flex; align-items: center;`
en cada clase que lo necesita, esa clase hace `@extend %row;`.

**Cómo se implementó:** `sass/abstracts/_placeholders.scss` declara los
placeholders con `%nombre { ... }` (no generan CSS por sí solos). Cada
archivo de `/components` o `/layout` que los necesita hace
`@use "../abstracts/placeholders";` y luego `@extend %row;` dentro del
selector. Al compilar, todas las clases que extienden `%row` aparecen
juntas, separadas por comas, compartiendo una sola declaración:

```css
.mm-footer__brand, .mm-navbar__brand, .mm-testimonial__author {
  display: flex;
  align-items: center;
}
```
## 2. Arquitectura 7-1 completa y con módulos namespaced

**Qué es:** las 7 carpetas del patrón 7-1
(`abstracts / base / components / layout / pages / themes / vendors`)
están todas presentes, con ~20 archivos parciales en total, y
`sass/main.scss` las conecta todas usando `@use "carpeta/archivo" as
alias;` en vez de `@import`.

**Por qué:** `@import` está oficialmente deprecado en Dart Sass — cada
archivo importado se procesa una y otra vez si dos parciales distintos
lo importan, y todas las variables/mixins quedan en un único espacio
global (fácil que se pisen nombres). `@use` carga cada parcial **una
sola vez** y obliga a referenciar sus variables con un alias
(`v.$color-brand-600`), lo que evita colisiones de nombres a medida
que el proyecto crece.

**Cómo se implementó:** cada parcial que necesita variables o mixins
empieza con `@use "../abstracts/variables" as v;` (o el alias que
corresponda) y usa `v.$nombre-variable` en vez de `$nombre-variable`
a secas. `sass/main.scss` es el único punto de entrada: agrupa los
`@use` de las 7 carpetas en el orden en que deben compilarse
(abstracts → vendors → base → themes → components → layout → pages).

## 3. Una sola función de JS para los dos modales de acceso

**Qué es:** `initAuthForm(formId, successId, modalId)`, en
`js/main.js`, valida el formulario y muestra el mensaje de éxito. Se
llama dos veces — una para "Crear cuenta" y otra para "Iniciar
sesión" — en vez de escribir la misma lógica dos veces.

**Por qué:** ambos formularios necesitan exactamente el mismo
comportamiento (validar, mostrar éxito, resetear al cerrar el modal).
Escribirlo una vez y pasarle los IDs como parámetros evita que, si mañana
cambia la lógica de validación, haya que recordar actualizarla en dos
lugares distintos y arriesgarse a que queden desincronizados.

**Cómo se implementó:**

```js
function initAuthForm(formId, successId, modalId) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  // ...misma lógica para cualquier par formulario/modal...
}

initAuthForm('mmSignupForm', 'mmSignupSuccess', 'modalComenzar');
initAuthForm('mmLoginForm', 'mmLoginSuccess', 'modalIniciarSesion');
```

## 4. `Intl.NumberFormat` para las cifras en pesos chilenos

**Qué es:** `formatearCLP()` usa la API nativa `Intl.NumberFormat` del
navegador para convertir un número (`5000`) en el formato de moneda
chilena (`$5.000`), en vez de armar el string a mano.

**Por qué:** formatear montos "a mano" (separar miles con un bucle o
expresión regular) es propenso a errores con números grandes o
negativos. `Intl` es una API nativa de JavaScript — no es una
librería externa — pensada exactamente para este problema
(fechas, monedas, plurales) y ya sabe cómo formatea cada configuración
regional (`'es-CL'`).

**Cómo se implementó:**

```js
function formatearCLP(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(valor);
}
```

## 5. Controles propios sobre el carrusel de Bootstrap

**Qué es:** el carrusel de la galería (`#mmGallery`) usa el
componente `.carousel` de Bootstrap 4, pero con flechas e indicadores
propios (`.mm-avatar` reutilizado como flecha, puntos con
`.mm-gallery__dot`) en vez de los que trae Bootstrap por defecto.

**Por qué:** las flechas e indicadores por defecto de Bootstrap están
pensadas para ir **sobre una foto** (blancas, semitransparentes, en
las esquinas). Acá el carrusel va dentro de una tarjeta blanca, así
que esos estilos por defecto quedarían invisibles. La solución fue
dejar que Bootstrap siga manejando el cambio de slide (con sus propios
atributos `data-slide` y `data-slide-to`), pero dibujar los controles
con las clases visuales del sitio.

**Cómo se implementó:** los botones de flecha llevan
`data-target="#mmGallery" data-slide="prev"` (o `"next"`) y los puntos
llevan `data-target="#mmGallery" data-slide-to="0"` (1, 2...) — esos
atributos son los que Bootstrap ya sabe leer, así que su JavaScript
sigue funcionando sin escribir una sola línea propia. El único CSS
nuevo (`sass/layout/_gallery.scss`) sobreescribe la posición y el
color de esos controles.
