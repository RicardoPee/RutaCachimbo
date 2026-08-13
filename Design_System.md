# LectorIA — Sistema de Diseño UI/UX

> Sistema Web Adaptativo basado en LLM y Gamificación  
> Reyes Huamán, Luis Fernando · Sulca Sedano, Jesús Ricardo · UPC · 2026

---

## 1. Paleta de Colores

### 1.1 Colores Primarios

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `--color-navy` | `#0F2B46` | 15, 43, 70 | Header, sidebar, navbar |
| `--color-teal` | `#0D7377` | 13, 115, 119 | Botones primarios, badges activos |
| `--color-teal-light` | `#14A3A8` | 20, 163, 168 | Hover, highlights, links |

### 1.2 Colores de Fondo

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `--color-bg-reading` | `#F5F0E8` | 245, 240, 232 | Área de lectura del texto (reduce fatiga visual) |
| `--color-bg-app` | `#F0F4F8` | 240, 244, 248 | Fondo general de la aplicación |
| `--color-bg-card` | `#FFFFFF` | 255, 255, 255 | Cards de preguntas y contenido |

> **Nota:** El fondo crema `#F5F0E8` es crítico para el área de lectura prolongada. Reduce el contraste agresivo del blanco puro y permite sesiones de 20-30 minutos sin fatiga visual, siguiendo el principio de los e-readers modernos.

### 1.3 Colores de Gamificación (FORGE)

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `--color-xp-gold` | `#F5A623` | 245, 166, 35 | Puntos XP, insignias, nivel actual |
| `--color-correct` | `#27AE60` | 39, 174, 96 | Respuesta correcta, misión completada |
| `--color-error` | `#E74C3C` | 231, 76, 60 | Solo borde de error — nunca fondo completo |
| `--color-scaffold` | `#3498DB` | 52, 152, 219 | Recuadro de pista del LLM (andamiaje) |
| `--color-critical` | `#8E44AD` | 142, 68, 173 | Badge nivel crítico |

> **Regla de oro:** El rojo `#E74C3C` se usa **únicamente** como borde (4px) nunca como fondo. En estudiantes de 14-17 años el rojo de fondo genera ansiedad y bloqueo ante el error. El borde comunica sin castigar visualmente.

### 1.4 Colores por Nivel de Comprensión

| Nivel | HEX | Uso |
|---|---|---|
| Literal | `#27AE60` | Badge, indicador, borde de pregunta literal |
| Inferencial | `#0D7377` | Badge, indicador, borde de pregunta inferencial |
| Crítico | `#8E44AD` | Badge, indicador, borde de pregunta crítica |

### 1.5 Colores Modo Oscuro

| Token | HEX | Uso |
|---|---|---|
| `--dark-bg` | `#1A1A2E` | Fondo principal modo oscuro |
| `--dark-surface` | `#16213E` | Superficie de cards en modo oscuro |
| `--dark-reading` | `#2C2C3E` | Área de lectura en modo oscuro (nunca negro puro) |
| `--dark-text` | `#E8EAF0` | Texto principal en modo oscuro |

### 1.6 Colores de Texto

| Token | HEX | Uso |
|---|---|---|
| `--text-primary` | `#2C3E50` | Texto principal, cuerpo |
| `--text-secondary` | `#64748B` | Subtítulos, labels secundarios |
| `--text-muted` | `#94A3B8` | Placeholders, texto desactivado |
| `--text-on-dark` | `#FFFFFF` | Texto sobre fondos navy o teal |

---

## 2. Tipografía

### 2.1 Fuentes

```css
/* Interfaz general */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Texto de lectura */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap');
```

| Fuente | Tipo | Uso | Razón |
|---|---|---|---|
| **Inter** | Sans-serif | Toda la interfaz | Diseñada para UI digital, alta legibilidad en pantalla |
| **Lora** | Serif | Bloque de texto a leer | Estudios confirman mejor comprensión lectora en textos largos con serif |

> El contraste Inter (interfaz) + Lora (texto de lectura) permite al estudiante distinguir visualmente cuándo está navegando y cuándo está leyendo, sin necesidad de instrucciones.

### 2.2 Escala Tipográfica

| Elemento | Fuente | Peso | Tamaño | Color |
|---|---|---|---|---|
| Título de sección | Inter | Bold 700 | 24px | `#0F2B46` |
| Subtítulo | Inter | SemiBold 600 | 18px | `#0F2B46` |
| Texto de lectura | Lora | Regular 400 | 17px | `#2C3E50` |
| Preguntas | Inter | Medium 500 | 16px | `#0F2B46` |
| Respuesta del estudiante | Inter | Regular 400 | 15px | `#2C3E50` |
| Andamiaje LLM | Inter | Regular 400 | 15px | `#2C3E50` |
| Labels XP / Nivel | Inter | SemiBold 600 | 13px | `#F5A623` |
| Placeholders | Inter | Regular 400 | 15px | `#94A3B8` |

> **Regla:** Tamaño mínimo absoluto = **15px** en toda la aplicación. Por debajo de eso, estudiantes con problemas de visión leve no diagnosticados pierden comodidad de lectura.

### 2.3 Line Height y Espaciado

```css
/* Texto de lectura — máxima legibilidad */
.reading-text {
  font-family: 'Lora', serif;
  font-size: 17px;
  line-height: 1.8;        /* Mayor interlineado para lectura prolongada */
  letter-spacing: 0.01em;
  max-width: 680px;        /* Máximo de caracteres por línea */
}

/* Interfaz general */
.ui-text {
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  letter-spacing: -0.01em;
}
```

---

## 3. Componentes UI

### 3.1 Cards de Preguntas

```css
.question-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
  transition: box-shadow 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
```

**Estructura interna de la card:**
1. Badge de nivel (Literal / Inferencial / Crítico) — esquina superior izquierda
2. Texto de la pregunta — Inter Medium 16px
3. Textarea de respuesta — fondo crema, borde gris → teal al enfocar
4. Botón de enviar — teal primario, ancho completo

### 3.2 Textarea de Respuesta

```css
.answer-textarea {
  background: #F5F0E8;
  border: 1.5px solid #CBD5E1;
  border-radius: 10px;
  padding: 14px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #2C3E50;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;
}

.answer-textarea:focus {
  border-color: #0D7377;
  outline: none;
  box-shadow: 0 0 0 3px rgba(13, 115, 119, 0.12);
}
```

### 3.3 Recuadro de Andamiaje (Respuesta del LLM)

```css
.scaffold-box {
  background: #EBF5FB;
  border-left: 4px solid #3498DB;
  border-radius: 0 10px 10px 0;
  padding: 16px 20px;
  margin-top: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.scaffold-icon {
  color: #F5A623;  /* bombilla dorada */
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.scaffold-text {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #2C3E50;
  line-height: 1.6;
}
```

> **Tono del andamiaje:** Nunca "Estás equivocado." Siempre "Para responder esta pregunta, considera..." El lenguaje es de acompañamiento, no de corrección.

### 3.4 Botones

```css
/* Primario */
.btn-primary {
  background: #0D7377;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn-primary:hover  { background: #0B6268; }
.btn-primary:active { transform: scale(0.98); }

/* Secundario */
.btn-secondary {
  background: transparent;
  color: #0D7377;
  border: 1.5px solid #0D7377;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-secondary:hover { background: rgba(13, 115, 119, 0.06); }
```

### 3.5 Feedback de Respuesta

```css
/* Correcto */
.feedback-correct {
  border: 1.5px solid #27AE60;
  background: #F0FFF4;
  border-radius: 10px;
}

/* Parcial */
.feedback-partial {
  border: 1.5px solid #F5A623;
  background: #FFFBEB;
  border-radius: 10px;
}

/* Incorrecto — solo borde, nunca fondo rojo */
.feedback-incorrect {
  border: 1.5px solid #E74C3C;
  background: #FFF5F5;
  border-radius: 10px;
}
```

---

## 4. Sistema de Gamificación (FORGE UI)

### 4.1 Barra de Progreso — Anillos Concéntricos

En lugar de una barra horizontal simple, se implementan tres anillos concéntricos:

| Anillo | Qué representa | Color |
|---|---|---|
| Exterior | Nivel global del estudiante | `#0D7377` teal |
| Intermedio | Nivel de comprensión actual (L/I/C) | Color del nivel activo |
| Interior | XP de la sesión actual | `#F5A623` oro |

El estudiante ve su progreso de un vistazo sin leer números.

### 4.2 Insignias (Badges FORGE)

```css
.badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Por nivel */
.badge-literal    { background: linear-gradient(135deg, #27AE60, #1E8449); }
.badge-inferencial { background: linear-gradient(135deg, #0D7377, #085D61); }
.badge-critico    { background: linear-gradient(135deg, #8E44AD, #6C3483); }

/* Animación de desbloqueo */
.badge-unlock {
  animation: badgeReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes badgeReveal {
  from { transform: scale(0.3); opacity: 0; }
  to   { transform: scale(1.0); opacity: 1; }
}
```

> La animación dura máximo 2 segundos. Si dura más, el estudiante se distrae del contenido académico.

### 4.3 Semáforo del Panel Docente

```
● Verde  (#27AE60) — Estudiante domina el nivel
● Amarillo (#F5A623) — Estudiante en proceso
● Rojo  (#E74C3C) — Estudiante necesita intervención
```

Al hacer clic en un estudiante se despliega el historial de errores clasificado por nivel (Literal / Inferencial / Crítico) con la frecuencia de error y las últimas respuestas.

---

## 5. Layout y Espaciado

### 5.1 Grid Principal

```css
.app-layout {
  display: grid;
  grid-template-columns: 260px 1fr;  /* sidebar + contenido */
  grid-template-rows: 64px 1fr;      /* header + cuerpo */
  min-height: 100vh;
}

/* Responsive móvil */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;       /* columna única */
    grid-template-rows: 56px auto;
  }
}
```

### 5.2 Escala de Espaciado

| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | 4px | Espaciado mínimo entre elementos inline |
| `--space-sm` | 8px | Padding interno de labels y badges |
| `--space-md` | 16px | Padding interno de cards |
| `--space-lg` | 24px | Margen entre secciones |
| `--space-xl` | 40px | Separación entre bloques principales |
| `--space-2xl` | 64px | Margen de página en desktop |

### 5.3 Border Radius

| Elemento | Radio |
|---|---|
| Cards principales | 16px |
| Botones | 10px |
| Inputs / Textarea | 10px |
| Badges de nivel | 8px |
| Insignias FORGE | 50% (círculo) |
| Chips / Tags | 20px (pill) |

### 5.4 Sombras

```css
--shadow-sm:  0 1px 4px rgba(0,0,0,0.06);   /* Cards en reposo */
--shadow-md:  0 2px 12px rgba(0,0,0,0.08);  /* Cards hover */
--shadow-lg:  0 4px 20px rgba(0,0,0,0.12);  /* Modales, dropdowns */
--shadow-teal: 0 0 0 3px rgba(13,115,119,0.12); /* Focus ring */
```

---

## 6. Layout por Vista

### 6.1 Vista Estudiante — Sesión de Lectura

```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo + Nivel actual + XP (anillos)     │
├──────────┬──────────────────────────────────────┤
│          │  Texto de lectura (Lora, crema)       │
│ SIDEBAR  │  ─────────────────────────────────── │
│          │  Card pregunta 1 (literal)            │
│ • Nivel  │    [Textarea respuesta]               │
│ • XP     │    [Botón Enviar]                     │
│ • Racha  │    [Andamiaje LLM si aplica]          │
│ • Badges │  ─────────────────────────────────── │
│          │  Card pregunta 2 (inferencial)        │
│          │  Card pregunta 3 (crítico)            │
└──────────┴──────────────────────────────────────┘
```

### 6.2 Vista Docente — Panel de Seguimiento

```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo + Nombre docente + Curso          │
├──────────┬──────────────────────────────────────┤
│          │  KPIs: % aula en cada nivel          │
│ SIDEBAR  │  ─────────────────────────────────── │
│          │  Lista de estudiantes + semáforo      │
│ • Textos │  ─────────────────────────────────── │
│ • Grupos │  Detalle estudiante seleccionado:    │
│ • Config │    Historial por nivel L / I / C     │
│          │    Últimas 5 respuestas              │
│          │    Botón exportar PDF / Excel        │
└──────────┴──────────────────────────────────────┘
```

### 6.3 Vista Móvil (Responsive)

En móvil el layout es una columna única en este orden:

1. Header compacto (56px) con XP en chip pequeño
2. Texto de lectura — scroll interno limitado
3. Preguntas — una por vez (no todas visibles)
4. Feedback / Andamiaje del LLM
5. Barra de progreso FORGE — horizontal fina al fondo

---

## 7. UX — Principios para Población 14-17 años

### 7.1 Feedback Inmediato

El estudiante **nunca espera más de 5 segundos** para ver la evaluación de GPT-4o. Si la API tiene latencia, se muestra:

```
🔄  "Analizando tu respuesta..."
    [Skeleton loader animado — barras grises pulsando]
```

Nunca pantalla en blanco. El skeleton mantiene el contexto visual del estudiante.

### 7.2 Texto de Lectura Sin Scroll Infinito

El bloque de texto va en un contenedor de **altura máxima fija** con scroll interno:

```css
.reading-container {
  max-height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 24px;
  background: #F5F0E8;
  border-radius: 12px;
}
```

El estudiante sabe que el texto termina. No siente que la tarea no tiene fin.

### 7.3 Errores Sin Penalización Visual

Ninguna métrica de fracaso se muestra en rojo prominente. Los errores se presentan como:

- ✗ ~~"Respondiste mal 3 preguntas"~~
- ✓ **"Tienes 3 oportunidades de mejora en nivel inferencial"**

El número exacto de errores solo se muestra si el estudiante hace clic para ver el detalle.

### 7.4 Modo Oscuro

Toggle en el header — los estudiantes de 14-17 años usan modo oscuro en casi todo.

```css
[data-theme="dark"] {
  --color-bg-app:     #1A1A2E;
  --color-bg-card:    #16213E;
  --color-bg-reading: #2C2C3E;
  --text-primary:     #E8EAF0;
  --text-secondary:   #A0AEC0;
}
```

### 7.5 Preguntas de una en una (Móvil)

En móvil, las preguntas se muestran de una en una con navegación por swipe o botón "Siguiente pregunta". Evita el scroll largo que genera abandono.

### 7.6 Animaciones

| Elemento | Animación | Duración | Curva |
|---|---|---|---|
| Badge desbloqueado | Scale 0.3 → 1.0 + confeti | 600ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Subida de nivel | Fade + scale del anillo | 800ms | `ease-out` |
| Feedback correcto | Border flash verde | 300ms | `ease` |
| Andamiaje LLM | Slide down + fade in | 400ms | `ease-out` |
| Skeleton loader | Pulso de opacidad | Infinito | `ease-in-out` |

---

## 8. Stack de Implementación

```
Framework UI:    React 18
Estilos:         Tailwind CSS (utility-first)
Fuentes:         Google Fonts — Inter + Lora
Iconos:          Lucide React
Animaciones:     Framer Motion
Gráficos panel:  Recharts
```

### 8.1 Variables CSS Globales

```css
:root {
  /* Colores primarios */
  --color-navy:         #0F2B46;
  --color-teal:         #0D7377;
  --color-teal-light:   #14A3A8;

  /* Fondos */
  --color-bg-reading:   #F5F0E8;
  --color-bg-app:       #F0F4F8;
  --color-bg-card:      #FFFFFF;

  /* Gamificación */
  --color-xp-gold:      #F5A623;
  --color-correct:      #27AE60;
  --color-error:        #E74C3C;
  --color-scaffold:     #3498DB;
  --color-critical:     #8E44AD;

  /* Niveles comprensión */
  --color-literal:      #27AE60;
  --color-inferencial:  #0D7377;
  --color-critico:      #8E44AD;

  /* Texto */
  --text-primary:       #2C3E50;
  --text-secondary:     #64748B;
  --text-muted:         #94A3B8;

  /* Espaciado */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;

  /* Sombras */
  --shadow-sm:   0 1px 4px rgba(0,0,0,0.06);
  --shadow-md:   0 2px 12px rgba(0,0,0,0.08);
  --shadow-lg:   0 4px 20px rgba(0,0,0,0.12);
  --shadow-focus: 0 0 0 3px rgba(13,115,119,0.12);

  /* Bordes */
  --radius-card:   16px;
  --radius-btn:    10px;
  --radius-input:  10px;
  --radius-badge:  8px;
  --radius-pill:   20px;

  /* Tipografía */
  --font-ui:      'Inter', sans-serif;
  --font-reading: 'Lora', serif;
}
```

---

## 9. Accesibilidad (WCAG 2.1 AA)

| Par de colores | Ratio de contraste | Resultado |
|---|---|---|
| `#FFFFFF` sobre `#0F2B46` | 12.6 : 1 | ✅ AAA |
| `#2C3E50` sobre `#F5F0E8` | 8.1 : 1 | ✅ AAA |
| `#FFFFFF` sobre `#0D7377` | 5.2 : 1 | ✅ AA |
| `#2C3E50` sobre `#FFFFFF` | 9.7 : 1 | ✅ AAA |
| `#0F2B46` sobre `#F0F4F8` | 11.3 : 1 | ✅ AAA |

- Todos los inputs tienen `label` visible asociado — no solo placeholder
- Focus ring visible en todos los elementos interactivos (`--shadow-focus`)
- Tamaño mínimo de área clickeable: 44×44px (estándar WCAG para touch)
- Textos alternativos en todas las insignias y gráficos
- Compatible con lectores de pantalla (aria-labels en botones de acción)

---

*Elaboración propia · LectorIA Design System v1.0 · 2026*
