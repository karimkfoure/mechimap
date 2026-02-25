# Bike & Coffee Flyer Map

Web estatica para preparar un mapa limpio de cafeterias y generar estilos visuales listos para compartir/capturar en flyers.

## Que resuelve

- Carga automaticamente una fuente fija de Google My Maps al abrir la app.
- No muestra markers hasta terminar la descarga del KML (con overlay de loading).
- Permite filtrar por layer del KML.
- Incluye controles amplios para estilo: base, filtros, markers, etiquetas, atmosfera, poster y canvas.
- Incluye modo captura para ocultar el panel lateral y exportar screenshot manualmente.

## Uso local

Abrir `index.html` directamente en navegador, o levantar un servidor estatico:

```bash
python3 -m http.server 8080
```

Luego ir a `http://localhost:8080`.

## Fuente de datos

- URL fija de My Maps (configurada en `app.js`): se toma el `mid`, se descarga KML y se parsean `Placemark -> Point`.
- Si hay carpetas/layers en el KML, se habilita selector de layer para visualizar subconjuntos.

## Flujo recomendado para flyer

1. Esperar que carguen los puntos por defecto.
2. Elegir layer (opcional).
3. Ajustar estilo visual usando los bloques de UI.
4. Definir ratio de salida y margen externo para encuadre.
5. Activar `Modo captura` y sacar screenshot.

## Deploy en GitHub Pages (sin build)

1. Subir este repo a GitHub.
2. Ir a `Settings -> Pages`.
3. En `Build and deployment`, elegir `Deploy from a branch`.
4. Seleccionar branch `main` y carpeta `/ (root)`.
5. Guardar y esperar el publish.

GitHub Pages va a servir directamente `index.html`.

## Estructura

- `index.html`: layout y controles del editor visual.
- `styles.css`: look & feel, overlays, poster y canvas.
- `app.js`: carga fija desde My Maps + logica completa de estilos.
