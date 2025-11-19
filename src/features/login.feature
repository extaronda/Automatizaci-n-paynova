# language: es
Característica: Autenticación de usuarios en Paynova
  Como usuario del sistema Paynova
  Quiero poder autenticarme con mis credenciales
  Para acceder a las funcionalidades del sistema

  Antecedentes:
    Dado que estoy en la página de login de Paynova

  @login @happy-path @suite-completa @suite-smoke
  Escenario: Login exitoso con credenciales válidas
    Cuando hago clic en "Usar login tradicional"
    Y ingreso el usuario "adrian"
    Y ingreso la contraseña "123"
    Y hago clic en el botón INGRESAR
    Entonces debería ver el dashboard del sistema
    Y debería ver mi nombre de usuario en el navbar

  @login @unhappy-path
  Escenario: Login fallido con credenciales inválidas
    Cuando hago clic en "Usar login tradicional"
    Y ingreso el usuario "usuarioInvalido"
    Y ingreso la contraseña "123"
    Y hago clic en el botón INGRESAR
    Entonces no debería ver el dashboard del sistema
    Y debería permanecer en la página de login

