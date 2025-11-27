# language: es
Característica: Aprobación de Solicitudes de Pago VIDA
  Como aprobador de solicitudes de pago del área VIDA
  Quiero poder aprobar solicitudes
  Para gestionar correctamente los flujos de aprobación por montos

  # ==================== APROBAR ====================

  @aprobar-vida @aprobador1 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 1 - APROBAR Solicitud
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "aprobar" de "cualquier"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "APROBAR"
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  # ==================== RECHAZAR ====================

  @aprobar-vida @aprobador1 @rechazar @suite-vida-aprobacion
  Escenario: Aprobador 1 - RECHAZAR Solicitud
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "rechazar" de "cualquier"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Rechazar"
    Y ingreso el comentario "No cumple con los requisitos establecidos"
    Y confirmo el cambio de estado
    Y la solicitud debe terminar correctamente

  # ==================== OBSERVAR ====================

  @aprobar-vida @aprobador1 @observar @suite-vida-aprobacion
  Escenario: Aprobador 1 - OBSERVAR Solicitud
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "observar" de "cualquier"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Observar"
    Y ingreso el comentario "Favor completar datos bancarios del beneficiario"
    Y confirmo el cambio de estado
    Y la solicitud debe regresar a la bandeja del usuario Recaudador

  # =====================================================================
  # APROBADOR NIVEL 2: 20k-100k USD / 60k-300k PEN
  # (Flujo escalonado: pasa primero por Aprobador 1)
  # =====================================================================

  @aprobar-vida @aprobador2 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 2 - APROBAR Solicitud y Finalizar
    Dado que la solicitud "PAGO DE SOBREVIVENCIA" con monto 70000 Soles fue aprobada por Aprobador 1
    Y estoy autenticado como "aprobador2" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud con memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "Enviar"
    Y confirmo el envío
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  @aprobar-vida @aprobador2 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 2 - APROBAR Solicitud de Monto Superior
    Dado que la solicitud "RESCATE POLIZA CON PRESTAMO" con monto 25000 Dolares fue aprobada por Aprobador 1
    Y estoy autenticado como "aprobador2" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud con memo "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "Enviar"
    Y confirmo el envío
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  # =====================================================================
  # APROBADOR NIVEL 3: 100k-6M USD / 300k-2M PEN
  # (Flujo escalonado: pasa por Aprobador 1 → Aprobador 2 → Aprobador 3)
  # =====================================================================

  @aprobar-vida @aprobador3 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 3 - APROBAR Solicitud y Finalizar
    Dado que la solicitud "PAGO DE SOBREVIVENCIA" con monto 500000 Soles fue aprobada por Aprobador 1 y 2
    Y estoy autenticado como "aprobador3" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud con memo "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "Enviar"
    Y confirmo el envío
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

