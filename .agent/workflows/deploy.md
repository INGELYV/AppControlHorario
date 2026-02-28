---
description: Cómo desplegar la aplicación a Vercel
---

# Flujo de Despliegue (Deploy) de App Control Horario

La aplicación está vinculada a Vercel, pero el despliegue automático desde GitHub requiere que conectes tu repositorio en Vercel.

## 1. Habilitar Auto-Deploy (Una sola vez)

1. Entra a tu cuenta en [Vercel](https://vercel.com).
2. Selecciona tu proyecto `app-control-horario`.
3. Ve a **Settings** > **Git**.
4. Haz click en **Connect GitHub Repository** y selecciona el repositorio `INGELYV/AppControlHorario`.
5. A partir de ahora, cada vez que hagas `git push` a la rama `main`, Vercel actualizará la app automáticamente.

## 2. Flujo de Trabajo Diario

Cuando quieras hacer cambios en el código, sigue estos pasos:

1. **Haz tus cambios** en el código localmente.
2. **Verifica que compila y sin errores** de TypeScript:
   ```bash
   npm run build
   ```
3. **Guarda los cambios y súbelos a GitHub**:
   ```bash
   git add .
   git commit -m "feat: descripción de tus cambios"
   git push
   ```
4. **Espera unos minutos**. Vercel detectará el `git push`, compilará la app y la publicará en la URL de producción.

## 3. Variables de Entorno

Si agregas una nueva variable en `.env`, debes agregarla también en Vercel:
1. Ve a Vercel > Proyecto > **Settings** > **Environment Variables**.
2. Agrega la variable (Aplica para producción).
3. Haz un nuevo deploy (Vercel > Deployments > "Redeploy").
