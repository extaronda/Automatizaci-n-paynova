# language: es
@editar-observada
Característica: Editar Solicitud en Estado OBSERVADO
  Como usuario del sistema Paynova
  Quiero editar una solicitud que está en estado OBSERVADO
  Para corregir los datos y reenviarla

  Antecedentes:
    Dado que estoy autenticado en el sistema Paynova como usuario de VIDA

  @editar-observada-completo
  Escenario: Editar solicitud observada y actualizar monto
    Dado que estoy en la bandeja de solicitudes
    Cuando busco una solicitud con "Paso Actual" igual a "OBSERVADO"
    Y hago clic en el botón del ojo para ver el detalle
    Entonces verifico que el campo "Paso Actual" sea "OBSERVADO"
    Cuando hago clic en el botón "EDITAR SOLICITUD"
    Y modifico el monto a "650000"
    Cuando hago clic en el botón "ACTUALIZAR"
    Y hago clic en el botón "ENVIAR"
    Entonces la solicitud es enviada exitosamente

