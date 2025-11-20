# language: es
Característica: Validación de Histórico de Solicitudes
  Como usuario del sistema Paynova
  Quiero validar el histórico de solicitudes
  Para verificar que la información se muestra correctamente

  @validar-historico @suite-validacion
  Escenario: Validar Histórico de Solicitudes con Filtros
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Histórico de Solicitudes
    Entonces debería ver los filtros disponibles
    Y debería ver la tabla de Histórico con las columnas correctas

  @validar-historico @suite-validacion
  Escenario: Validar Columnas de la Tabla Histórico según Resultados
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Histórico de Solicitudes
    Entonces debería validar que cada registro en Histórico tenga las columnas:
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
    Y debería verificar que los datos coincidan con solicitudes-creadas.json

  @validar-historico @suite-validacion
  Escenario: Buscar Solicitud por Correlativo
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Histórico de Solicitudes
    Y busco una solicitud por correlativo desde solicitudes-creadas.json
    Y presiono el botón Buscar
    Entonces debería ver los resultados filtrados por correlativo

  @validar-historico @suite-validacion
  Escenario: Filtrar por Estado APROBADO
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Histórico de Solicitudes
    Y selecciono el estado "APROBADO" en el filtro de Estado
    Y presiono el botón Buscar
    Entonces debería ver solo las solicitudes con estado APROBADO

  @validar-historico @suite-validacion
  Escenario: Exportar Histórico a Excel
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA
    Cuando accedo a la página de Histórico de Solicitudes
    Y hago clic en el botón Exportar Excel
    Entonces debería descargarse el archivo Excel correctamente

