/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: legal-catalog.js
   VERSIÓN: V3 PILOTO
========================================================= */


/* =========================================================
   CATÁLOGO JURÍDICO PILOTO

   IMPORTANTE:
   Esta base es solamente para las pruebas de funcionamiento
   de SIGA SV.

   Antes de utilizar la herramienta en casos reales,
   el catálogo deberá verificarse y ampliarse con
   normativa oficial vigente de El Salvador.
========================================================= */


window.SIGA_LEGAL_CATALOG = [

  /* =======================================================
     LESIONES
  ======================================================= */

  {
    id: "lesiones",

    name: "Lesiones",

    article: "142",

    law: "Código Penal de El Salvador",

    keywords: [
      "lesiones",
      "lesion",
      "daño físico",
      "daño fisico"
    ],

    status: "PILOTO"
  },


  {
    id: "lesiones-graves",

    name: "Lesiones graves",

    article: "143",

    law: "Código Penal de El Salvador",

    keywords: [
      "lesiones graves",
      "lesion grave",
      "grave"
    ],

    status: "PILOTO"
  },


  /* =======================================================
     DESOBEDIENCIA EN MEDIDAS
  ======================================================= */

  {
    id: "desobediencia-medida",

    name:
      "Desobediencia en caso de medida cautelar o de protección",

    article: "338-A",

    law: "Código Penal de El Salvador",

    keywords: [
      "desobediencia",
      "medida cautelar",
      "medida de protección",
      "medidas cautelares",
      "medidas de protección"
    ],

    status: "PILOTO"
  },


  /* =======================================================
     ARMAS DE FUEGO
  ======================================================= */

  {
    id: "portacion-ilegal-arma",

    name:
      "Tenencia, portación o conducción ilegal o irresponsable de armas de fuego",

    article: "346-B",

    law: "Código Penal de El Salvador",

    keywords: [
      "arma",
      "arma de fuego",
      "portación ilegal",
      "portacion ilegal",
      "tenencia ilegal",
      "conducción ilegal",
      "conduccion ilegal",
      "armas de fuego"
    ],

    status: "PILOTO"
  }

];


/* =========================================================
   NORMALIZAR TEXTO PARA BÚSQUEDA
========================================================= */

function sigaNormalizarTextoLegal(texto) {

  return String(
    texto ?? ""
  )

    .toLowerCase()

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .trim();

}


/* =========================================================
   BUSCAR DELITOS

   Devuelve una lista de coincidencias.

   Ejemplo:
   buscarDelitosSIGA("lesiones")

   ->
   [
     Lesiones,
     Lesiones graves
   ]
========================================================= */

function buscarDelitosSIGA(consulta) {

  const texto =
    sigaNormalizarTextoLegal(
      consulta
    );


  if (!texto) {
    return [];
  }


  const resultados =
    window
      .SIGA_LEGAL_CATALOG
      .filter(delito => {

        const nombre =
          sigaNormalizarTextoLegal(
            delito.name
          );


        const articulo =
          sigaNormalizarTextoLegal(
            delito.article
          );


        const ley =
          sigaNormalizarTextoLegal(
            delito.law
          );


        const coincideNombre =
          nombre.includes(texto);


        const coincideArticulo =
          articulo.includes(texto);


        const coincideLey =
          ley.includes(texto);


        const coincidePalabra =
          Array.isArray(
            delito.keywords
          )

          &&

          delito.keywords.some(
            palabra => {

              return sigaNormalizarTextoLegal(
                palabra
              ).includes(texto);

            }
          );


        return (
          coincideNombre
          ||
          coincideArticulo
          ||
          coincideLey
          ||
          coincidePalabra
        );

      });


  return resultados;

}


/* =========================================================
   BUSCAR DELITO EXACTO POR ID
========================================================= */

function obtenerDelitoSIGAPorId(id) {

  return (
    window
      .SIGA_LEGAL_CATALOG
      .find(
        delito =>
          delito.id === id
      )
    ||
    null
  );

}


/* =========================================================
   BUSCAR DELITO EXACTO POR NOMBRE
========================================================= */

function obtenerDelitoSIGAPorNombre(nombre) {

  const buscado =
    sigaNormalizarTextoLegal(
      nombre
    );


  return (
    window
      .SIGA_LEGAL_CATALOG
      .find(
        delito => {

          return (
            sigaNormalizarTextoLegal(
              delito.name
            )
            ===
            buscado
          );

        }
      )
    ||
    null
  );

}


/* =========================================================
   AGREGAR DELITO MANUALMENTE AL CATÁLOGO DE SESIÓN

   Esta función NO modifica el archivo legal-catalog.js.
   Sirve solamente durante la sesión del navegador.

   Posteriormente podemos crear un módulo administrativo
   para registrar y validar nuevas figuras jurídicas.
========================================================= */

function agregarDelitoTemporalSIGA({
  name,
  article,
  law,
  keywords = []
}) {

  if (
    !name
    ||
    !article
    ||
    !law
  ) {

    return {
      ok: false,

      message:
        "Faltan datos del delito."
    };

  }


  const existente =
    obtenerDelitoSIGAPorNombre(
      name
    );


  if (existente) {

    return {
      ok: false,

      message:
        "Ese delito ya existe en el catálogo."
    };

  }


  const nuevoDelito = {

    id:
      "manual-"
      +
      Date.now(),

    name:
      String(name).trim(),

    article:
      String(article).trim(),

    law:
      String(law).trim(),

    keywords:
      Array.isArray(keywords)
        ?
        keywords
        :
        [],

    status:
      "TEMPORAL"
  };


  window
    .SIGA_LEGAL_CATALOG
    .push(
      nuevoDelito
    );


  return {
    ok: true,

    crime:
      nuevoDelito
  };

}


/* =========================================================
   EXPONER FUNCIONES GLOBALMENTE
========================================================= */

window.SIGA_LEGAL = {

  catalog:
    window.SIGA_LEGAL_CATALOG,

  search:
    buscarDelitosSIGA,

  getById:
    obtenerDelitoSIGAPorId,

  getByName:
    obtenerDelitoSIGAPorNombre,

  addTemporary:
    agregarDelitoTemporalSIGA

};


/* =========================================================
   FIN DE legal-catalog.js
   SIGA SV V3 PILOTO
========================================================= */
