# language: es
Característica: Registro de Solicitud de Pago SINIESTROS en Paynova
  Como usuario del área SINIESTROS
  Quiero registrar solicitudes de pago de siniestros
  Para gestionar los pagos de siniestros

  Antecedentes:
    Dado que estoy autenticado como usuario "siniestros"
    Y estoy en la página de Registrar Solicitud de Pago

  # =====================================================================
  # ESCENARIOS OPTIMIZADOS - Flujo básico exitoso (Sin Modal)
  # =====================================================================

  @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  Esquema del escenario: SINIESTROS - Registro exitoso sin modal
    Cuando selecciono el memo "<memo>"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "<identificador>"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

    Ejemplos:
      | memo                              | identificador                          |
      | SOAT                              | soat_interbank_dolares                |
      | SOAT                              | soat_bcp_soles                         |
      | DESGRAVAMEN IBK                   | desgravamen_ibk_interbank_dolares      |
      | DESGRAVAMEN IBK                   | desgravamen_ibk_scotiabank_soles       |
      | DESGRAVAMEN FUNO                  | desgravamen_funo_bcp_dolares           |
      | DESGRAVAMEN FUNO                  | desgravamen_funo_bbva_soles            |
      | PT                                | pt_interbank_dolares                   |
      | PT                                | pt_scotiabank_soles                    |
      | VIDA INDIVIDUAL FLEX              | vida_individual_flex_bcp_dolares       |
      | VIDA INDIVIDUAL FLEX              | vida_individual_flex_bbva_soles        |
      | SURA                              | sura_interbank_dolares                 |
      | SURA                              | sura_scotiabank_soles                  |
      | VIDA LEY                          | vida_ley_bcp_dolares                   |
      | VIDA LEY                          | vida_ley_bbva_soles                    |
      | SCTR                              | sctr_interbank_dolares                 |
      | SCTR                              | sctr_bcp_soles                         |
      | VEHICULAR                         | vehicular_scotiabank_dolares           |
      | VEHICULAR                         | vehicular_bbva_soles                   |
      | PAGO DE MULTAS, COSTAS y CARGOS   | pago_multas_bcp_dolares                |
      | PAGO DE MULTAS, COSTAS y CARGOS   | pago_multas_interbank_soles            |

  # =====================================================================
  # REGISTROS PARA RECHAZAR - Montos bajos (Aprobador 1)
  # =====================================================================

  @registrar-siniestros @rechazar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para RECHAZAR SOAT
    Cuando selecciono el memo "SOAT"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "soat_interbank_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @rechazar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para RECHAZAR VEHICULAR
    Cuando selecciono el memo "VEHICULAR"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "vehicular_scotiabank_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @rechazar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para RECHAZAR PAGO DE MULTAS, COSTAS y CARGOS
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "pago_multas_bcp_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # REGISTROS PARA OBSERVAR - Montos bajos (Aprobador 1)
  # =====================================================================

  @registrar-siniestros @observar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para OBSERVAR SOAT
    Cuando selecciono el memo "SOAT"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "soat_bcp_soles"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @observar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para OBSERVAR DESGRAVAMEN IBK
    Cuando selecciono el memo "DESGRAVAMEN IBK"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "desgravamen_ibk_interbank_dolares"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  @registrar-siniestros @observar @suite-siniestros @suite-siniestros-registro
  Escenario: SINIESTROS - Registro para OBSERVAR PAGO DE MULTAS, COSTAS y CARGOS
    Cuando selecciono el memo "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en ENVIAR
    Y completo los datos de SINIESTROS desde JSON "pago_multas_interbank_soles"
    Y hago clic en GUARDAR
    Entonces debería ver el registro guardado
    Cuando hago clic en ENVIAR solicitud
    Entonces debería ver el modal con correlativo e incidente

  # =====================================================================
  # ESCENARIO CON MODAL (Pausado - Servicio fallando)
  # =====================================================================
  # @registrar-siniestros @happy-path @suite-completa @suite-siniestros @suite-siniestros-registro
  # Escenario: SINIESTROS - Pago Siniestro VIDA Individual Interbank Dólares (Happy Path - Con Modal)
  #   Cuando selecciono el memo "PAGO SINIESTRO VIDA INDIVIDUAL (Acsel-e)"
  #   Y hago clic en ENVIAR
  #   Y espero que aparezca el modal de Grupo SINIESTROS
  #   Y selecciono el primer registro del modal
  #   Y hago clic en Guardar Seleccionado
  #   Entonces debería ver el registro guardado en la grilla
  #   Cuando hago clic en el botón Editar del registro
  #   Y completo los datos de SINIESTROS desde JSON "pago_siniestro_vida_individual"
  #   Y hago clic en ACTUALIZAR sin validar
  #   Entonces debería ver el registro actualizado en la grilla
  #   Cuando hago clic en ENVIAR solicitud
  #   Entonces debería ver el modal con correlativo e incidente
