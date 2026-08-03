# Barber Flow

Quiero construir un MVP de un SaaS para gestión de barberías utilizando Lovable.

Este proyecto debe pensarse desde el inicio como un producto comercial escalable, aunque inicialmente solo existirá una barbería.

IMPORTANTE

No quiero una aplicación hecha rápidamente.

Quiero una arquitectura limpia, mantenible y preparada para crecer.

Aplica buenas prácticas de desarrollo.

Utiliza componentes reutilizables.

Evita duplicación de código.

Organiza correctamente carpetas, componentes y lógica.

=========================

TECNOLOGÍAS

=========================

Utiliza:

- React

- TypeScript

- Vite

- TailwindCSS

- shadcn/ui

- Supabase

- Supabase Auth

- React Router

- TanStack Query

- React Hook Form

- Zod

Debe funcionar como una Progressive Web App (PWA).

Debe ser Mobile First.

También debe verse correctamente en tablets y escritorio.

=========================

AUTENTICACIÓN

=========================

Habrá únicamente dos roles:

Administrador

Cliente

El administrador representa al dueño de la barbería.

Los clientes deberán registrarse utilizando:

Nombre completo

Número de teléfono

Email

Contraseña

El administrador podrá iniciar sesión utilizando sus credenciales.

No implementar todavía múltiples barberías, pero diseñar la arquitectura para soportarlas en el futuro.

=========================

DISEÑO

=========================

Quiero un diseño minimalista.

Inspirado en:

Booksy

Fresha

Calendly

Google Calendar

Mucho espacio en blanco.

Tipografía moderna.

Componentes limpios.

Sin exceso de colores.

Solo un color principal para destacar acciones.

Diseño elegante.

Aspecto premium.

No utilizar gradientes exagerados.

Debe transmitir confianza.

=========================

NAVEGACIÓN CLIENTE

=========================

Crear únicamente la estructura de navegación.

Inicio

Reservar turno

Mis turnos

Perfil

=========================

NAVEGACIÓN ADMINISTRADOR

=========================

Crear únicamente la estructura.

Agenda

Clientes

Servicios

Configuración

Perfil

=========================

BASE DE DATOS

=========================

Diseñar una estructura escalable en Supabase para futuras funcionalidades.

No implementar todavía toda la lógica.

Solo preparar las tablas necesarias.

Usuarios

Perfiles

Servicios

Turnos

Configuración

Disponibilidad

Bloqueos

La estructura debe estar preparada para soportar múltiples barberías en el futuro.

=========================

EXPERIENCIA

=========================

Implementar:

Dark Mode

Light Mode

Persistencia de sesión

Pantallas de carga

Pantallas vacías

Pantallas de error

Estados de loading

Estados de éxito

Estados de error

=========================

OBJETIVO

=========================

Al finalizar este prompt quiero tener:

Proyecto completamente configurado.

Autenticación funcionando.

Roles funcionando.

Diseño general terminado.

Navegación terminada.

Base de datos preparada.

Sin implementar todavía la lógica de reservas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf71a022-679f-4aa7-a660-fd56c41deb07).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
