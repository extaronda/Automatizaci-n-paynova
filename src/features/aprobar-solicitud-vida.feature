# language: es
Característica: Aprobación de Solicitudes de Pago VIDA
  Como aprobador de solicitudes de pago del área VIDA
  Quiero poder aprobar, observar o rechazar solicitudes
  Para gestionar correctamente los flujos de aprobación por montos

  # =====================================================================
  # APROBADOR NIVEL 1: 0-20k USD / 0-60k PEN
  # =====================================================================

  # ==================== RECHAZAR ====================

  @aprobar-vida @aprobador1 @rechazar @suite-vida-aprobacion
  Escenario: Aprobador 1 - RECHAZAR Solicitud PAGO DE SOBREVIVENCIA
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "rechazar" de "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Rechazar"
    Y ingreso el comentario "No cumple con los requisitos establecidos"
    Y confirmo el cambio de estado
    Y la solicitud debe terminar correctamente

  @aprobar-vida @aprobador1 @rechazar @suite-vida-aprobacion
  Escenario: Aprobador 1 - RECHAZAR Solicitud RESCATE POLIZA CON PRESTAMO
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "rechazar" de "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Rechazar"
    Y ingreso el comentario "Documentación incompleta"
    Y confirmo el cambio de estado
    Y la solicitud debe terminar correctamente

  @aprobar-vida @aprobador1 @rechazar @suite-vida-aprobacion
  Escenario: Aprobador 1 - RECHAZAR Solicitud PAGO DE MULTAS, COSTAS y CARGOS
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "rechazar" de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Rechazar"
    Y ingreso el comentario "Monto inconsistente con documentación"
    Y confirmo el cambio de estado
    Y la solicitud debe terminar correctamente

  # ==================== OBSERVAR ====================

  @aprobar-vida @aprobador1 @observar @suite-vida-aprobacion
  Escenario: Aprobador 1 - OBSERVAR Solicitud PAGO DE SOBREVIVENCIA
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "observar" de "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Observar"
    Y ingreso el comentario "Favor completar datos bancarios del beneficiario"
    Y confirmo el cambio de estado
    Y la solicitud debe regresar a la bandeja del usuario Recaudador

  @aprobar-vida @aprobador1 @observar @suite-vida-aprobacion
  Escenario: Aprobador 1 - OBSERVAR Solicitud RESCATE POLIZA CON PRESTAMO
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "observar" de "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Observar"
    Y ingreso el comentario "Verificar número de póliza ingresado"
    Y confirmo el cambio de estado
    Y la solicitud debe regresar a la bandeja del usuario Recaudador

  @aprobar-vida @aprobador1 @observar @suite-vida-aprobacion
  Escenario: Aprobador 1 - OBSERVAR Solicitud PAGO DE MULTAS, COSTAS y CARGOS
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "observar" de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud
    Cuando hago clic en el botón "Observar"
    Y ingreso el comentario "Adjuntar documento legal correspondiente"
    Y confirmo el cambio de estado
    Y la solicitud debe regresar a la bandeja del usuario Recaudador

  # ==================== APROBAR ====================

  @aprobar-vida @aprobador1 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 1 - APROBAR Solicitud PAGO DE SOBREVIVENCIA
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "aprobar" de "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "APROBAR"
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  @aprobar-vida @aprobador1 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 1 - APROBAR Solicitud RESCATE POLIZA CON PRESTAMO
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "aprobar" de "RESCATE POLIZA CON PRESTAMO"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "APROBAR"
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  @aprobar-vida @aprobador1 @aprobar @happy-path @suite-completa @suite-vida @suite-vida-aprobacion
  Escenario: Aprobador 1 - APROBAR Solicitud PAGO DE MULTAS, COSTAS y CARGOS
    Dado que estoy autenticado como "aprobador1" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud para "aprobar" de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Y debería verificar que los datos del documento hayan migrado correctamente
    Cuando hago clic en el botón "APROBAR"
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

  # =====================================================================
  # APROBADOR NIVEL 2: 20k-100k USD / 60k-300k PEN
  # (Flujo escalonado: pasa primero por Aprobador 1)
  # =====================================================================

  @aprobar-vida @aprobador2 @aprobar @happy-path
  Esquema del escenario: Aprobador 2 - APROBAR Solicitud {memo} con monto {monto} {moneda}
    Dado que la solicitud "{memo}" con monto {monto} {moneda} fue aprobada por Aprobador 1
    Y estoy autenticado como "aprobador2" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud con memo "{memo}"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Cuando hago clic en el botón "Enviar"
    Y confirmo el envío
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

    Ejemplos:
      | memo                           | monto | moneda  |
      | PAGO DE SOBREVIVENCIA          | 70000 | Soles   |
      | RESCATE POLIZA CON PRESTAMO    | 25000 | Dolares |
      | PAGO DE MULTAS, COSTAS y CARGOS| 80000 | Soles   |

  # =====================================================================
  # APROBADOR NIVEL 3: 100k-6M USD / 300k-2M PEN
  # (Flujo escalonado: pasa por Aprobador 1 → Aprobador 2 → Aprobador 3)
  # =====================================================================

  @aprobar-vida @aprobador3 @aprobar @happy-path
  Esquema del escenario: Aprobador 3 - APROBAR Solicitud {memo} con monto {monto} {moneda}
    Dado que la solicitud "{memo}" con monto {monto} {moneda} fue aprobada por Aprobador 1 y 2
    Y estoy autenticado como "aprobador3" de VIDA
    Cuando accedo a Solicitudes de Pago y luego a Bandeja
    Y selecciono la solicitud con memo "{memo}"
    Y hago clic en Ver Solicitud
    Entonces debería ver el detalle de la solicitud con número de incidente
    Cuando hago clic en el botón "Enviar"
    Y confirmo el envío
    Entonces debería ver la Bandeja de Entrada
    Y la solicitud debe pasar a EXACTUS

    Ejemplos:
      | memo                           | monto   | moneda  |
      | PAGO DE SOBREVIVENCIA          | 500000  | Soles   |
      | RESCATE POLIZA CON PRESTAMO    | 150000  | Dolares |
      | PAGO DE MULTAS, COSTAS y CARGOS| 400000  | Soles   |

