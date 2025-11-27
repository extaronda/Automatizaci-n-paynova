# language: es
Característica: Validación de Reportería de Solicitudes
  Como usuario del sistema Paynova
  Quiero validar la reportería de solicitudes
  Para verificar que la información se muestra correctamente según el estado

  @validar-reporteria @suite-validacion
  Escenario: Validar Reportería con Filtros
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Entonces debería ver los filtros disponibles en Reportería
    Y presiono el botón Consultar
    Y debería ver la tabla de Reportería con las columnas correctas
    Y hago clic en el botón Exportar Excel en Reportería
    Entonces debería descargarse el archivo Excel correctamente de Reportería

  @validar-reporteria @suite-validacion
  Escenario: Validar Registros con Estado APROBADO
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y ingreso el incidente "633501" en el filtro de Incidente
    Y presiono el botón Consultar
    Entonces debería ver los resultados filtrados por incidente en Reportería
    Y cada registro APROBADO debe tener Asiento con valor válido (no vacío ni '-')
    Y debería validar las columnas obligatorias para estado APROBADO:
      | Columna      |
      | Asunto       |
      | Correlativo  |
      | Incidente    |
      | Estado       |
      | Paso         |
      | Asiento      |
      | Código       |
      | Contratante  |
      | Solicitud    |
      | Área         |
      | Póliza       |

  @validar-reporteria @suite-validacion
  Escenario: Validar Registros con Estado PENDIENTE_APROBACION
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y ingreso el incidente "633490" en el filtro de Incidente
    Y presiono el botón Consultar
    Entonces debería ver los resultados filtrados por incidente en Reportería
    Y cada registro PENDIENTE_APROBACION debe tener Asiento igual a "-"
    Y debería validar las columnas obligatorias para estado PENDIENTE_APROBACION:
      | Columna      |
      | Asunto       |
      | Correlativo  |
      | Incidente    |
      | Estado       |
      | Paso         |
      | Código       |
      | Contratante  |
      | Solicitud    |
      | Área         |
      | Póliza       |

  @validar-reporteria @suite-validacion
  Escenario: Buscar Solicitud por Correlativo en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y busco una solicitud por correlativo desde solicitudes-creadas.json en Reportería
    Entonces debería ver los resultados filtrados por correlativo en Reportería

  @validar-reporteria @suite-validacion
  Escenario: Filtrar por Moneda en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y selecciono la moneda "PEN" en el filtro de Moneda
    Entonces debería ver que el filtro de moneda se aplicó correctamente

  @validar-reporteria @suite-validacion
  Escenario: Filtrar por Incidente en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y ingreso un incidente en el filtro de Incidente
    Entonces debería ver los resultados filtrados por incidente

  @validar-reporteria @suite-validacion
  Escenario: Filtrar por Memo en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y selecciono el memo "PAGO DE SOBREVIVENCIA" en el filtro de Memo
    Y presiono el botón Consultar
    Entonces debería ver solo las solicitudes con memo "PAGO DE SOBREVIVENCIA"

  @validar-reporteria @suite-validacion
  Escenario: Filtrar por Fechas en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y selecciono fecha inicio "19/11/2025" en el filtro
    Y selecciono fecha fin "20/11/2025" en el filtro
    Y presiono el botón Consultar
    Entonces debería ver solo las solicitudes dentro del rango de fechas seleccionado

  @validar-reporteria @suite-validacion
  Escenario: Limpiar Filtros en Reportería
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y ingreso el incidente "633501" en el filtro de Incidente
    Y presiono el botón Limpiar Filtros
    Entonces los filtros deberían estar vacíos

  @validar-reporteria @suite-validacion
  Escenario: Exportar Reportería a Excel
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Reportería de Solicitudes
    Y hago clic en el botón Exportar Excel en Reportería
    Entonces debería descargarse el archivo Excel correctamente de Reportería

