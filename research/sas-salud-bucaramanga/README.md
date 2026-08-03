# SAS de servicios de salud en Bucaramanga — contactos

Investigación de empresas constituidas como **SAS (Sociedad por Acciones Simplificada)** con domicilio en **Bucaramanga (Santander)** que prestan **servicios de salud** (IPS, laboratorios, odontología, salud ocupacional, imágenes diagnósticas, rehabilitación, etc.), con sus datos de contacto.

- **Archivo de datos:** [`contactos-sas-salud-bucaramanga.csv`](./contactos-sas-salud-bucaramanga.csv)
- **Fecha de compilación:** 2026-08-03
- **Registros:** 35 empresas SAS identificadas

## Qué contiene

Para cada empresa: nombre, tipo societario, actividad/servicios, dirección, barrio, teléfono, email, sitio web/perfil, contacto nominal (representante legal/gerente cuando se pudo hallar), NIT, fecha de constitución y la fuente.

## Contactos nominales encontrados ("la persona detrás")

La mayoría de directorios públicos exponen el teléfono y la dirección, pero **no** el nombre del representante legal (queda tras muros de pago o solo en el certificado de la Cámara de Comercio). Los que sí se hallaron:

| Empresa | Contacto | Cargo | Email |
|---|---|---|---|
| Mediclinicos IPS SAS | Cristian Augusto Serrano León | Gerente | citas@mediclinico.com |
| Casa Salud IPS SAS | Claudia Janeth Rodríguez Rangel | Gerente | — |
| Salud Vital IPS SAS | — | Gerencia | gerencia@saludvitalips.com |
| Clínica IPS Cabecera SAS | — | — | info@ipscabecera.com |
| Laboral Médica Salud Ocupacional IPS SAS | — | — | info@laboralmedicasoips.com |

## Metodología y limitaciones (importante)

- Datos compilados de **directorios públicos**: informacolombia.com, einforma.co, empresite (elEconomista), lasempresas.com.co, EMIS, clinicasyhospitales.com.co, Páginas Amarillas y sitios propios de las empresas.
- El entorno de esta sesión **bloquea el acceso directo** al dataset oficial de la Cámara de Comercio de Bucaramanga (datos.gov.co, recurso `wf53-j577`) y a las páginas de directorio, por política de red. La recolección se hizo vía búsqueda web, por lo que **esto es una muestra sólida, no un censo completo**. Los directorios reportan 100+ IPS solo bajo el término "IPS".
- **Verificar antes de usar:** teléfonos/direcciones cambian y algunos NIT aparecen parciales. Confirmar razón social y estado (activa/liquidada) y el nombre del representante legal en la fuente oficial.

## Cómo obtener el censo completo + representantes legales

1. **RUES** — <https://www.rues.org.co> — buscar por ubicación (Bucaramanga) y actividad CIIU; el certificado incluye representante legal.
2. **Cámara de Comercio de Bucaramanga** — <https://www.camaradirecta.com> — pueden vender **bases de datos filtradas** por CIIU + tipo societario (SAS) + municipio. Códigos CIIU de salud: sección **Q**, divisiones **86** (actividades de atención de la salud humana), **87** (asistencia en instituciones) y **88** (asistencia social sin alojamiento).
3. **Dataset abierto** "BASE DE DATOS DE EMPRESAS CÁMARA DE COMERCIO DE BUCARAMANGA" en datos.gov.co (recurso `wf53-j577`) — descargable como CSV/Excel; filtrar por CIIU 86xx–88xx y organización = SAS. (Bloqueado en esta sesión; accesible desde un navegador normal.)
4. **REPS / Prestadores de Salud (MinSalud)** — <https://prestadores.minsalud.gov.co> — registro oficial de IPS habilitadas con datos de gerente/representante.
5. **Cluster de la Salud – Cámara de Comercio de Bucaramanga** — <https://www.camaradirecta.com/cluster/> — directorio de afiliados del sector.

## Fuentes consultadas

- informacolombia.com · directorio-empresas.einforma.co · empresite.eleconomistaamerica.co
- lasempresas.com.co · emis.com · clinicasyhospitales.com.co · paginasamarillas.com.co
- Sitios propios: ipscabecera.com, saludvitalips.com, laboralmedicasoips.com, medicidsas.com, centrodepsicologiayterapias.com, icsa.com.co, ipssanar.com, sainsaips.com, saluddar.com
