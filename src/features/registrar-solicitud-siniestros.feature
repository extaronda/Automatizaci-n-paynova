# language: es
Característica: Registro de Solicitud de Pago SINIESTROS en Paynova
  Como usuario del área SINIESTROS
  Quiero registrar solicitudes de pago de siniestros
  Para gestionar los pagos de siniestros

  Antecedentes:
    Dado que estoy autenticado como usuario "siniestros"
    Y estoy en la página de Registrar Solicitud de Pago

  # =====================================================================
  # SMOKE TESTS - Flujo básico exitoso
  # =====================================================================

  @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - SOAT Interbank Dólares (Happy Path - Sin Modal)
    Cuando selecciono el memo "SOAT"
    Y hago clic en ENVIAR
    # Sin modal - va directo al formulario
    # Opción 1: Usar JSON (recomendado - más limpio)
    Y completo los datos de SINIESTROS desde JSON "soat_interbank_dolares"
    # Opción 2: Usar tabla (también funciona)
    # Y completo los datos de SINIESTROS:
    #   | Nombres  | DNI      | Siniestros | Cobertura | Moneda  | Monto | Banco     | Tipo cuenta | Número cuenta |
    #   | Juan Doe | 12345678 | SIN001     | SOAT      | Dolares | 20000 | Interbank | Ahorros     | 1234567890123 |
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Vehicular Scotiabank Dólares (Happy Path - Sin Modal)
    Cuando selecciono el memo "VEHICULAR"
    Y hago clic en ENVIAR
    # Sin modal - va directo al formulario
    # Usar JSON (datos centralizados en test-data/solicitudes.json)
    Y completo los datos de SINIESTROS desde JSON "vehicular_scotiabank_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Pago Multas Costas y Cargos BCP Dólares (Happy Path - Sin Modal)
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    # Sin modal - va directo al formulario
    # Usar JSON (datos centralizados en test-data/solicitudes.json)
    Y completo los datos de SINIESTROS desde JSON "pago_multas_bcp_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Pago Siniestro VIDA Individual Interbank Dólares (Happy Path - Con Modal)
    Cuando selecciono el memo "PAGO SINIESTRO VIDA INDIVIDUAL (Acsel-e)"
    Y hago clic en ENVIAR
    Y espero que aparezca el modal de Grupo SINIESTROS
    Y selecciono el primer registro del modal
    Y hago clic en Guardar Seleccionado
    Entonces debería ver el registro guardado en la grilla
    Cuando hago clic en el botón Editar del registro
    # Usar JSON (datos centralizados en test-data/solicitudes.json)
    # Este memo requiere: Nombres, DNI, Póliza, Siniestros, Cobertura
    Y completo los datos de SINIESTROS desde JSON "pago_siniestro_vida_individual"
    Y hago clic en ACTUALIZAR sin validar
    Entonces debería ver el registro actualizado en la grilla
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente
