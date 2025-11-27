# language: es
Característica: Registro de Solicitud de Pago VIDA en Paynova
  Como usuario del área VIDA
  Quiero registrar solicitudes de pago de sobrevivencia, rescates y multas
  Para gestionar los pagos de pólizas provenientes de ACSEL-E

  Antecedentes:
    Dado que estoy autenticado como usuario "vida"
    Y estoy en la página de Registrar Solicitud de Pago

  # =====================================================================
  # SMOKE TESTS - Flujo básico exitoso
  # =====================================================================

  @registrar-vida @happy-path @suite-completa @suite-vida @suite-vida-registro
  Escenario: VIDA - Pago Sobrevivencia Interbank Dólares (Happy Path)
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    # Opción 1: Usar JSON (recomendado - más limpio)
    Y completo los datos de VIDA desde JSON "pago_sobrevivencia_interbank_dolares"
    # Opción 2: Usar tabla (también funciona)
    # Y completo los datos de VIDA:
    #   | DNI      | Poliza     | Moneda  | Monto | Banco     | Tipo cuenta | Número cuenta |
    #   | 45678912 | 4393543295 | Dolares | 800   | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @happy-path @suite-completa @suite-vida @suite-vida-registro
  Escenario: VIDA - Rescate Póliza con Préstamo Scotiabank Dólares (Happy Path)
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    # Usar JSON (datos centralizados en test-data/solicitudes.json)
    Y completo los datos de VIDA desde JSON "rescate_poliza_scotiabank_dolares"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @happy-path @suite-completa @suite-vida @suite-vida-registro
  Escenario: VIDA - Pago Multas Costas y Cargos BCP Dólares (Happy Path)
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    # Usar JSON (datos centralizados en test-data/solicitudes.json)
    Y completo los datos de VIDA desde JSON "pago_multas_bcp_dolares"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # REGISTROS PARA RECHAZAR - Montos bajos (Aprobador 1)
  # =====================================================================

  @registrar-vida @rechazar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para RECHAZAR PAGO DE SOBREVIVENCIA
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_sobrevivencia_rechazar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @rechazar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para RECHAZAR RESCATE POLIZA CON PRESTAMO
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "rescate_poliza_rechazar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @rechazar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para RECHAZAR PAGO DE MULTAS, COSTAS y CARGOS
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_multas_rechazar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # REGISTROS PARA OBSERVAR - Montos bajos (Aprobador 1)
  # =====================================================================

  @registrar-vida @observar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para OBSERVAR PAGO DE SOBREVIVENCIA
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_sobrevivencia_observar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @observar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para OBSERVAR RESCATE POLIZA CON PRESTAMO
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "rescate_poliza_observar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @observar @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para OBSERVAR PAGO DE MULTAS, COSTAS y CARGOS
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_multas_observar"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # REGISTROS PARA APROBADOR 2 - Montos 20k-100k USD / 60k-300k PEN
  # =====================================================================

  @registrar-vida @aprobador2 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 2 - PAGO DE SOBREVIVENCIA 70000 Soles
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_sobrevivencia_aprobador2_soles"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @aprobador2 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 2 - RESCATE POLIZA 25000 Dolares
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "rescate_poliza_aprobador2_dolares"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @aprobador2 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 2 - PAGO DE MULTAS 80000 Soles
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_multas_aprobador2_soles"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # REGISTROS PARA APROBADOR 3 - Montos 100k-6M USD / 300k-2M PEN
  # =====================================================================

  @registrar-vida @aprobador3 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 3 - PAGO DE SOBREVIVENCIA 500000 Soles
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_sobrevivencia_aprobador3_soles"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @aprobador3 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 3 - RESCATE POLIZA 150000 Dolares
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "rescate_poliza_aprobador3_dolares"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @aprobador3 @suite-vida @suite-vida-registro
  Escenario: VIDA - Registro para Aprobador 3 - PAGO DE MULTAS 400000 Soles
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA desde JSON "pago_multas_aprobador3_soles"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # VALIDACIONES - Casos de error esperados (Unhappy Paths)
  # =====================================================================

  @registrar-vida @validacion-campos
  Escenario: VIDA - Validar campos obligatorios vacíos
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y hago clic en ACTUALIZAR sin llenar datos
    Entonces debería ver mensajes de validación de campos obligatorios

  @registrar-vida @validacion-negocio
  Escenario: VIDA - Validar que NO se pueden mezclar bancos diferentes
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    # Primer registro con Scotiabank (usar moneda correcta que trae el modal: Dólares)
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto | Banco      | Tipo cuenta | Número cuenta |
      | 45678912 | 4393543295 | Dolares | 800   | Scotiabank | Ahorros     | 1234567890    |
    Y hago clic en ACTUALIZAR sin validar
    # Segundo registro con Interbank (moneda correcta: Dólares)
    Cuando hago clic en el botón Editar del segundo registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto | Banco     | Tipo cuenta | Número cuenta |
      | 78945612 | 4407767694 | Dolares | 900   | Interbank | Ahorros     | 9876543210987 |
    Y hago clic en ACTUALIZAR sin validar
    # Intentar ENVIAR → Error de bancos diferentes
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver modal de error indicando bancos diferentes

  @registrar-vida @validacion-negocio
  Escenario: VIDA - Validar que NO se pueden mezclar monedas diferentes
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    # Intento cambiar moneda del primer registro (viene Dólares, pongo Soles) → Error
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda | Monto | Banco     | Tipo cuenta | Número cuenta |
      | 45678912 | 4393543295 | Soles  | 800   | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en ACTUALIZAR
    Entonces debería ver modal de error indicando monedas diferentes

  @registrar-vida @validacion-negocio
  Escenario: VIDA - Validar que SÍ se pueden agregar múltiples con mismo banco y moneda
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    # Primer registro: Interbank + Dólares (moneda correcta del modal)
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto | Banco     | Tipo cuenta | Número cuenta |
      | 45678912 | 4393543295 | Dolares | 800   | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en ACTUALIZAR sin validar
    # Segundo registro: Interbank + Dólares (mismo banco y moneda) → NO debe dar error
    Cuando hago clic en el botón Editar del segundo registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto | Banco     | Tipo cuenta | Número cuenta |
      | 78945612 | 4407767694 | Dolares | 950   | Interbank | Ahorros     | 9876543210987 |
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver 2 registros en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-vida @validacion-bancos
  Escenario: VIDA - Validar dígitos correctos de todos los bancos en una sesión
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    
    # Validar Interbank - 13 dígitos
    Cuando hago clic en el botón Editar del registro
    Y valido cuenta bancaria para:
      | Banco     | Tipo cuenta | Dígitos | Cuenta válida   | Cuenta inválida |
      | Interbank | Ahorros     | 13      | 1234567890123   | 12345           |
    Entonces debería ver error con cuenta inválida y éxito con cuenta válida
    
    # Validar Scotiabank - 10 dígitos
    Y valido cuenta bancaria para:
      | Banco      | Tipo cuenta | Dígitos | Cuenta válida | Cuenta inválida |
      | Scotiabank | Ahorros     | 10      | 1234567890    | 12345           |
    Entonces debería ver error con cuenta inválida y éxito con cuenta válida
    
    # Validar BCP Ahorros - 14 dígitos
    Y valido cuenta bancaria para:
      | Banco                     | Tipo cuenta | Dígitos | Cuenta válida  | Cuenta inválida |
      | Banco de Crédito del Perú | Ahorros     | 14      | 12345678901234 | 12345           |
    Entonces debería ver error con cuenta inválida y éxito con cuenta válida
    
    # Validar BCP Corriente - 13 dígitos
    Y valido cuenta bancaria para:
      | Banco                     | Tipo cuenta | Dígitos | Cuenta válida | Cuenta inválida |
      | Banco de Crédito del Perú | Corriente   | 13      | 1234567890123 | 12345           |
    Entonces debería ver error con cuenta inválida y éxito con cuenta válida
    
    # Validar BBVA - 20 dígitos
    Y valido cuenta bancaria para:
      | Banco            | Tipo cuenta | Dígitos | Cuenta válida        | Cuenta inválida |
      | BBVA Continental | Ahorros     | 20      | 12345678901234567890 | 12345           |
    Entonces debería ver error con cuenta inválida y éxito con cuenta válida

  # =====================================================================
  # PRUEBAS DE MONTOS - SOLES (Diferentes niveles de aprobación)
  # =====================================================================

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Pago Sobrevivencia con monto <monto> Soles - <nivel_aprobacion>
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda | Monto   | Banco     | Tipo cuenta | Número cuenta |
      | 45678912 | 4393543295 | Soles  | <monto> | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto  | nivel_aprobacion      |
      | 50000  | Menor a 60K           |
      | 60000  | Igual a 60K           |
      | 100000 | Mayor 60K menor 300K  |
      | 300000 | Igual a 300K          |
      | 500000 | Mayor 300K menor 6000K|
      | 6000000| Igual a 6000K         |

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Rescate Póliza con monto <monto> Soles
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda | Monto   | Banco      | Tipo cuenta | Número cuenta |
      | 78945612 | 4407767694 | Soles  | <monto> | Scotiabank | Ahorros     | 9876543210    |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto   |
      | 60000   |
      | 500000  |

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Pago Multas Costas y Cargos con monto <monto> Soles
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda | Monto   | Banco                     | Tipo cuenta | Número cuenta  |
      | 32165498 | 4421094447 | Soles  | <monto> | Banco de Crédito del Perú | Ahorros     | 98765432109876 |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto   |
      | 100000  |
      | 6000000 |

  # =====================================================================
  # PRUEBAS DE MONTOS - DOLARES (Diferentes niveles de aprobación)
  # =====================================================================

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Pago Sobrevivencia con monto <monto> Dólares - <nivel>
    Cuando selecciono el memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto   | Banco     | Tipo cuenta | Número cuenta |
      | 45678912 | 4393543295 | Dolares | <monto> | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto  | nivel                 |
      | 15000  | Menor a 20K           |
      | 20000  | Igual a 20K           |
      | 50000  | Mayor 20K menor 100K  |
      | 100000 | Igual a 100K          |
      | 500000 | Mayor 100K menor 2000K|
      | 2000000| Igual a 2000K         |

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Rescate Póliza con monto <monto> Dólares
    Cuando selecciono el memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el segundo registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto   | Banco      | Tipo cuenta | Número cuenta |
      | 78945612 | 4407767694 | Dolares | <monto> | Scotiabank | Ahorros     | 9876543210    |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto   |
      | 20000   |
      | 500000  |

  @registrar-vida @regresion
  Esquema del escenario: VIDA - Pago Multas Costas y Cargos con monto <monto> Dólares
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo VIDA
    Y selecciono el tercer registro del modal
    Y hago clic en Guardar Seleccionado
    Cuando hago clic en el botón Editar del registro
    Y completo los datos de VIDA:
      | DNI      | Poliza     | Moneda  | Monto   | Banco                     | Tipo cuenta | Número cuenta  |
      | 32165498 | 4421094447 | Dolares | <monto> | Banco de Crédito del Perú | Ahorros     | 98765432109876 |
    Y hago clic en ACTUALIZAR
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | monto   |
      | 50000   |
      | 2000000 |

