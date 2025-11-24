# language: es
Característica: Validación de Detalle de Solicitud
  Como usuario del sistema Paynova
  Quiero validar el detalle de una solicitud
  Para verificar que toda la información se muestra correctamente según la plantilla

  @validar-detalle @suite-completa
  Escenario: Validar detalle completo de solicitud registrada usando plantilla
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería validar la Información General:
      | Campo      | Valor Esperado                    |
      | Correlativo| (usará datos guardados)           |
      | Incidente  | (usará datos guardados)           |
      | Asunto     | PAGO DE MULTAS, COSTAS y CARGOS   |
      | Monto      | (usará datos guardados)           |
      | Estado     | (cualquier estado)                |
    Y debería validar que la sección Datos tenga al menos un registro
    Y debería validar que cada registro en Datos tenga los campos:
      | Campo   |
      | Nombre  |
      | DNI     |
      | Monto   |
      | Moneda  |
      | Banco   |
      | Cuenta  |
    Y debería validar que la sección Documentos esté presente
    Y debería validar que la sección Observaciones esté presente
    Y debería validar que la sección Distribución esté presente
    Y debería validar que la sección Trazabilidad tenga registros
    Y debería validar que cada registro en Trazabilidad tenga los campos:
      | Campo        |
      | Paso         |
      | Usuario      |
      | Fecha Inicio |
      | Fecha Fin    |
      | Estado       |

  @validar-detalle @validar-informacion-general
  Escenario: Validar Información General de solicitud
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "PAGO DE SOBREVIVENCIA"
    Y hago clic en Ver Solicitud
    Entonces debería validar la Información General:
      | Campo      | Valor Esperado                    |
      | Correlativo| (usará datos guardados)           |
      | Incidente  | (usará datos guardados)           |
      | Asunto     | PAGO DE SOBREVIVENCIA             |
      | Monto      | (usará datos guardados)           |
      | Estado     | (cualquier estado)                |

  @validar-detalle @validar-datos
  Escenario: Validar sección Datos de solicitud
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería validar que la sección Datos tenga registros
    Y debería validar que cada registro en Datos tenga los campos:
      | Campo   |
      | Nombre  |
      | DNI     |
      | Monto   |
      | Moneda  |
      | Banco   |
      | Cuenta  |

  @validar-detalle @validar-trazabilidad
  Escenario: Validar sección Trazabilidad de solicitud
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "PAGO DE MULTAS, COSTAS y CARGOS"
    Y hago clic en Ver Solicitud
    Entonces debería validar que la sección Trazabilidad tenga registros
    Y debería validar que cada registro en Trazabilidad tenga los campos:
      | Campo        |
      | Paso         |
      | Usuario      |
      | Fecha Inicio |
      | Fecha Fin    |
      | Estado       |
