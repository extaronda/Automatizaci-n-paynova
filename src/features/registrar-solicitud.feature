# language: es
Característica: Registro de Solicitud de Pago en Paynova
  Como usuario del sistema Paynova
  Quiero registrar solicitudes de pago
  Para gestionar los pagos de mi área

  Antecedentes:
    Dado que estoy autenticado en el sistema Paynova
    Y estoy en la página de Registrar Solicitud de Pago

  @registrar-rrhh @validacion-bancos @suite-completa @suite-rrhh
  Escenario: RRHH - Validar dígitos de todos los bancos en una sesión
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    # Interbank - 13 dígitos
    Y ingreso datos validando banco:
      | Nombres     | DNI      | Moneda | Monto | Banco     | Tipo cuenta | Cuenta válida | Cuenta inválida |
      | Ana Lopez   | 87654321 | Soles  | 600   | Interbank | Ahorros     | 1234567890123 | 12345           |
    # Scotiabank - 10 dígitos
    Y ingreso datos validando banco:
      | Nombres     | DNI      | Moneda | Monto | Banco      | Tipo cuenta | Cuenta válida | Cuenta inválida |
      | Carlos Ruiz | 12345678 | Soles  | 500   | Scotiabank | Ahorros     | 1234567890    | 12345           |
    # BCP Ahorros - 14 dígitos
    Y ingreso datos validando banco:
      | Nombres      | DNI      | Moneda | Monto | Banco                     | Tipo cuenta | Cuenta válida  | Cuenta inválida |
      | Maria Torres | 11223344 | Soles  | 700   | Banco de Crédito del Perú | Ahorros     | 12345678901234 | 12345           |
    # BCP Corriente - 13 dígitos
    Y ingreso datos validando banco:
      | Nombres     | DNI      | Moneda | Monto | Banco                     | Tipo cuenta | Cuenta válida | Cuenta inválida |
      | Juan Perez  | 22334455 | Soles  | 650   | Banco de Crédito del Perú | Corriente   | 1234567890123 | 12345           |
    # BBVA - 20 dígitos
    Y ingreso datos validando banco:
      | Nombres      | DNI      | Moneda | Monto | Banco            | Tipo cuenta | Cuenta válida        | Cuenta inválida |
      | Pedro Garcia | 99887766 | Soles  | 800   | BBVA Continental | Ahorros     | 12345678901234567890 | 12345           |

  @registrar-rrhh @happy-path
  Escenario: Registrar solicitud - Interbank 13 dígitos
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    Y ingreso los datos:
      | Nombres  | DNI      | Moneda | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Ana Lopez| 87654321 | Soles  | 600   | Transferencia a terceros | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-rrhh @validacion-negocio
  Escenario: RRHH - Validar que NO se pueden mezclar bancos diferentes
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    # Primer registro con Interbank
    Y ingreso los datos:
      | Nombres    | DNI      | Moneda | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Ana Lopez  | 87654321 | Soles  | 600   | Transferencia a terceros | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en GUARDAR
    # Intentar agregar segundo registro con Scotiabank (banco diferente)
    Y ingreso los datos con banco diferente:
      | Nombres      | DNI      | Moneda | Monto | Subtipo                  | Banco      | Tipo cuenta | Número cuenta |
      | Carlos Perez | 12345678 | Soles  | 700   | Transferencia a terceros | Scotiabank | Ahorros     | 9876543210    |
    Entonces debería ver error indicando bancos diferentes

  @registrar-rrhh @validacion-negocio
  Escenario: RRHH - Validar que NO se pueden mezclar monedas diferentes
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    # Primer registro con Soles
    Y ingreso los datos:
      | Nombres    | DNI      | Moneda | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Ana Lopez  | 87654321 | Soles  | 600   | Transferencia a terceros | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en GUARDAR
    # Intentar agregar segundo registro con Dólares (moneda diferente) → Error al GUARDAR
    Y ingreso los datos:
      | Nombres      | DNI      | Moneda  | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Maria Torres | 22334455 | Dolares | 500   | Transferencia a terceros | Interbank | Ahorros     | 9876543210987 |
    Y hago clic en GUARDAR validando error
    Entonces debería ver error indicando monedas diferentes

  @registrar-rrhh @validacion-negocio
  Escenario: RRHH - Validar que SÍ se pueden agregar múltiples con mismo banco y moneda
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    # Primer registro: Interbank + Soles
    Y ingreso los datos:
      | Nombres    | DNI      | Moneda | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Ana Lopez  | 87654321 | Soles  | 600   | Transferencia a terceros | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en GUARDAR
    # Segundo registro: Interbank + Soles (mismo banco y moneda)
    Y ingreso los datos:
      | Nombres      | DNI      | Moneda | Monto | Subtipo                  | Banco     | Tipo cuenta | Número cuenta |
      | Carlos Perez | 12345678 | Soles  | 700   | Transferencia a terceros | Interbank | Ahorros     | 9876543210987 |
    Y hago clic en GUARDAR
    Entonces debería ver 2 registros guardados
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-rrhh
  Escenario: Registrar solicitud - Scotiabank 10 dígitos
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    Y ingreso los datos:
      | Nombres      | DNI      | Moneda | Monto | Subtipo                  | Banco      | Tipo cuenta | Número cuenta |
      | Carlos Ruiz  | 12345678 | Soles  | 500   | Transferencia a terceros | Scotiabank | Ahorros     | 1234567890    |
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-rrhh
  Escenario: Registrar solicitud - BCP 14 dígitos
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    Y ingreso los datos:
      | Nombres       | DNI      | Moneda | Monto | Subtipo                  | Banco                       | Tipo cuenta | Número cuenta  |
      | Maria Torres  | 11223344 | Soles  | 700   | Transferencia a terceros | Banco de Crédito del Perú   | Ahorros     | 12345678901234 |
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-rrhh
  Escenario: Registrar solicitud - BBVA 20 dígitos
    Cuando selecciono el memo "JUICIO DE ALIMENTOS"
    Y hago clic en ENVIAR
    Y ingreso los datos:
      | Nombres      | DNI      | Moneda | Monto | Subtipo                  | Banco            | Tipo cuenta | Número cuenta        |
      | Pedro Garcia | 99887766 | Soles  | 800   | Transferencia a terceros | BBVA Continental | Ahorros     | 12345678901234567890 |
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

