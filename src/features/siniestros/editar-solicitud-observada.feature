# language: es
@editar-observada-siniestros
Característica: Editar Solicitud en Estado OBSERVADO - SINIESTROS
  Como usuario del sistema Paynova
  Quiero editar una solicitud de SINIESTROS que está en estado OBSERVADO
  Para corregir los datos y reenviarla

  Antecedentes:
    Dado que estoy autenticado en el sistema Paynova como usuario de SINIESTROS

  @editar-observada-siniestros-completo
  Escenario: Editar solicitud observada y actualizar monto en SINIESTROS
    Dado que estoy en la bandeja de solicitudes de SINIESTROS
    Cuando busco una solicitud de SINIESTROS con "Paso Actual" igual a "OBSERVADO"
    Y hago clic en el botón del ojo para ver el detalle de SINIESTROS
    Entonces verifico que el campo "Paso Actual" sea "OBSERVADO" en SINIESTROS
    Cuando hago clic en el botón "EDITAR SOLICITUD" en SINIESTROS
    Y modifico el monto a "650000" en SINIESTROS
    Cuando hago clic en el botón "ACTUALIZAR" en SINIESTROS
    Y hago clic en el botón "ENVIAR" en SINIESTROS
    Entonces la solicitud de SINIESTROS es enviada exitosamente

