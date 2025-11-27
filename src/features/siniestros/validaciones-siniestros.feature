# language: es
@validaciones-siniestros @suite-validacion-siniestros
Característica: Validaciones de Solicitudes - SINIESTROS
  Como usuario del sistema Paynova
  Quiero validar las solicitudes de SINIESTROS en diferentes módulos
  Para verificar que toda la información se muestra correctamente según las plantillas

  # ==================== VALIDACIÓN DE DETALLE ====================
  
  @validar-detalle-siniestros @suite-validacion-siniestros
  Escenario: Validar detalle completo de solicitud registrada usando plantilla - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "SOAT"
    Y hago clic en Ver Solicitud
    Entonces debería validar la Información General de SINIESTROS:
      | Campo      | Valor Esperado                    |
      | Correlativo| (usará datos guardados)           |
      | Incidente  | (usará datos guardados)           |
      | Asunto     | SOAT                              |
      | Monto      | (usará datos guardados)           |
      | Estado     | (cualquier estado)                |
    Y debería validar que la sección Datos tenga al menos un registro en SINIESTROS
    Y debería validar que cada registro en Datos tenga los campos en SINIESTROS:
      | Campo   |
      | Nombre  |
      | DNI     |
      | Monto   |
      | Moneda  |
      | Banco   |
      | Cuenta  |
    Y debería validar que la sección Documentos esté presente en SINIESTROS
    Y debería validar que la sección Observaciones esté presente en SINIESTROS
    Y debería validar que la sección Trazabilidad tenga registros en SINIESTROS
    Y debería validar que cada registro en Trazabilidad tenga los campos en SINIESTROS:
      | Campo        |
      | Paso         |
      | Usuario      |
      | Fecha Inicio |
      | Fecha Fin    |
      | Estado       |

  @validar-detalle-siniestros @validar-informacion-general-siniestros
  Escenario: Validar Información General de solicitud - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "VEHICULAR"
    Y hago clic en Ver Solicitud
    Entonces debería validar la Información General de SINIESTROS:
      | Campo      | Valor Esperado                    |
      | Correlativo| (usará datos guardados)           |
      | Incidente  | (usará datos guardados)           |
      | Asunto     | VEHICULAR                         |
      | Monto      | (usará datos guardados)           |
      | Estado     | (cualquier estado)                |

  @validar-detalle-siniestros @validar-datos-siniestros
  Escenario: Validar sección Datos de solicitud - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "SOAT"
    Y hago clic en Ver Solicitud
    Entonces debería validar que la sección Datos tenga registros en SINIESTROS
    Y debería validar que cada registro en Datos tenga los campos en SINIESTROS:
      | Campo   |
      | Nombre  |
      | DNI     |
      | Monto   |
      | Moneda  |
      | Banco   |
      | Cuenta  |

  @validar-detalle-siniestros @validar-trazabilidad-siniestros
  Escenario: Validar sección Trazabilidad de solicitud - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Y accedo a Solicitudes de Pago y luego a Bandeja
    Cuando selecciono la última solicitud creada de "SOAT"
    Y hago clic en Ver Solicitud
    Entonces debería validar que la sección Trazabilidad tenga registros en SINIESTROS
    Y debería validar que cada registro en Trazabilidad tenga los campos en SINIESTROS:
      | Campo        |
      | Paso         |
      | Usuario      |
      | Fecha Inicio |
      | Fecha Fin    |
      | Estado       |

  # ==================== VALIDACIÓN DE HISTÓRICO ====================

  @validar-historico-siniestros @suite-validacion-siniestros
  Escenario: Validar Histórico de Solicitudes con Filtros - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Histórico de Solicitudes de SINIESTROS
    Entonces debería ver los filtros disponibles en SINIESTROS
    Y debería ver la tabla de Histórico con las columnas correctas en SINIESTROS

  @validar-historico-siniestros @suite-validacion-siniestros
  Escenario: Validar Columnas de la Tabla Histórico según Resultados - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Histórico de Solicitudes de SINIESTROS
    Entonces debería validar que cada registro en Histórico tenga las columnas en SINIESTROS:
      | Columna        |
      | N° Solicitud   |
      | Descripción    |
      | Fecha Solicitud|
      | Estado         |
      | Monto          |
      | Moneda         |
      | Tipo Memo      |
      | Última Acción  |
      | Creador        |
      | Acciones       |
    Y debería verificar que los datos coincidan con solicitudes-creadas.json en SINIESTROS

  @validar-historico-siniestros @suite-validacion-siniestros
  Escenario: Buscar Solicitud por Correlativo - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Histórico de Solicitudes de SINIESTROS
    Y busco una solicitud por correlativo desde solicitudes-creadas.json en SINIESTROS
    Y presiono el botón Buscar en SINIESTROS
    Entonces debería ver los resultados filtrados por correlativo en SINIESTROS

  @validar-historico-siniestros @suite-validacion-siniestros
  Escenario: Filtrar por Estado APROBADO - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Histórico de Solicitudes de SINIESTROS
    Y selecciono el estado "APROBADO" en el filtro de Estado en SINIESTROS
    Y presiono el botón Buscar en SINIESTROS
    Entonces debería ver solo las solicitudes con estado APROBADO en SINIESTROS

  @validar-historico-siniestros @suite-validacion-siniestros
  Escenario: Exportar Histórico a Excel - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Histórico de Solicitudes de SINIESTROS
    Y hago clic en el botón Exportar Excel en SINIESTROS
    Entonces debería descargarse el archivo Excel correctamente de SINIESTROS

  # ==================== VALIDACIÓN DE REPORTERÍA ====================

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Validar Reportería con Filtros - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Entonces debería ver los filtros disponibles en Reportería de SINIESTROS
    Y presiono el botón Consultar en SINIESTROS
    Y debería ver la tabla de Reportería con las columnas correctas en SINIESTROS
    Y hago clic en el botón Exportar Excel en Reportería de SINIESTROS
    Entonces debería descargarse el archivo Excel correctamente de Reportería de SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Validar Registros con Estado APROBADO - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y ingreso el incidente "633668" en el filtro de Incidente en SINIESTROS
    Y presiono el botón Consultar en SINIESTROS
    Entonces debería ver los resultados filtrados por incidente en Reportería de SINIESTROS
    Y cada registro APROBADO debe tener Asiento con valor válido (no vacío ni '-') en SINIESTROS
    Y debería validar las columnas obligatorias para estado APROBADO en SINIESTROS:
      | Columna      |
      | Asunto       |
      | Correlativo  |
      | Incidente   |
      | Estado       |
      | Paso         |
      | Asiento      |
      | Código       |
      | Contratante  |
      | Solicitud    |
      | Área         |
      | Póliza       |

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Validar Registros con Estado PENDIENTE_APROBACION - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y ingreso el incidente "633490" en el filtro de Incidente en SINIESTROS
    Y presiono el botón Consultar en SINIESTROS
    Entonces debería ver los resultados filtrados por incidente en Reportería de SINIESTROS
    Y cada registro PENDIENTE_APROBACION debe tener Asiento igual a "-" en SINIESTROS
    Y debería validar las columnas obligatorias para estado PENDIENTE_APROBACION en SINIESTROS:
      | Columna      |
      | Asunto       |
      | Correlativo  |
      | Incidente   |
      | Estado       |
      | Paso         |
      | Código       |
      | Contratante  |
      | Solicitud    |
      | Área         |
      | Póliza       |

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Buscar Solicitud por Correlativo en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y busco una solicitud por correlativo desde solicitudes-creadas.json en Reportería de SINIESTROS
    Entonces debería ver los resultados filtrados por correlativo en Reportería de SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Filtrar por Moneda en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y selecciono la moneda "PEN" en el filtro de Moneda en SINIESTROS
    Entonces debería ver que el filtro de moneda se aplicó correctamente en SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Filtrar por Incidente en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y ingreso un incidente en el filtro de Incidente en SINIESTROS
    Entonces debería ver los resultados filtrados por incidente en SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Filtrar por Memo en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y selecciono el memo "SOAT" en el filtro de Memo en SINIESTROS
    Y presiono el botón Consultar en SINIESTROS
    Entonces debería ver solo las solicitudes con memo "SOAT" en SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Filtrar por Fechas en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y selecciono fecha inicio "19/11/2025" en el filtro de SINIESTROS
    Y selecciono fecha fin "20/11/2025" en el filtro de SINIESTROS
    Y presiono el botón Consultar en SINIESTROS
    Entonces debería ver solo las solicitudes dentro del rango de fechas seleccionado en SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Limpiar Filtros en Reportería - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y ingreso el incidente "633668" en el filtro de Incidente en SINIESTROS
    Y presiono el botón Limpiar Filtros en SINIESTROS
    Entonces los filtros deberían estar vacíos en SINIESTROS

  @validar-reporteria-siniestros @suite-validacion-siniestros
  Escenario: Exportar Reportería a Excel - SINIESTROS
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS
    Cuando accedo a la página de Reportería de Solicitudes de SINIESTROS
    Y hago clic en el botón Exportar Excel en Reportería de SINIESTROS
    Entonces debería descargarse el archivo Excel correctamente de Reportería de SINIESTROS

