/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: number-to-words.js
   VERSIÓN: V3 PILOTO
========================================================= */

window.SIGA_WORDS = (() => {

  const unidades = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
    "veinte",
    "veintiuno",
    "veintidós",
    "veintitrés",
    "veinticuatro",
    "veinticinco",
    "veintiséis",
    "veintisiete",
    "veintiocho",
    "veintinueve"
  ];


  const decenas = [
    "",
    "",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa"
  ];


  const centenas = [
    "",
    "",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos"
  ];


  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ];


  /* =======================================================
     CONVERTIR NÚMERO NORMAL A LETRAS

     Ejemplos:
     21   -> veintiuno
     35   -> treinta y cinco
     142  -> ciento cuarenta y dos
     2026 -> dos mil veintiséis
  ======================================================= */

  function numeroEnLetras(numero) {

    const n = Number(numero);


    if (
      !Number.isFinite(n) ||
      n < 0
    ) {
      return String(numero ?? "");
    }


    if (n < 30) {
      return unidades[n];
    }


    if (n < 100) {

      const decena =
        decenas[
          Math.floor(n / 10)
        ];


      const unidad =
        n % 10;


      if (unidad === 0) {
        return decena;
      }


      return (
        decena
        +
        " y "
        +
        numeroEnLetras(unidad)
      );

    }


    if (n === 100) {
      return "cien";
    }


    if (n < 200) {

      return (
        "ciento "
        +
        numeroEnLetras(
          n - 100
        )
      );

    }


    if (n < 1000) {

      const centena =
        centenas[
          Math.floor(n / 100)
        ];


      const resto =
        n % 100;


      if (resto === 0) {
        return centena;
      }


      return (
        centena
        +
        " "
        +
        numeroEnLetras(resto)
      );

    }


    if (n < 2000) {

      const resto =
        n % 1000;


      if (resto === 0) {
        return "mil";
      }


      return (
        "mil "
        +
        numeroEnLetras(resto)
      );

    }


    if (n < 1000000) {

      const miles =
        Math.floor(
          n / 1000
        );


      const resto =
        n % 1000;


      let resultado =
        numeroEnLetras(miles)
        +
        " mil";


      if (resto !== 0) {

        resultado +=
          " "
          +
          numeroEnLetras(resto);

      }


      return resultado;

    }


    /*
      Para la versión piloto no necesitamos
      cantidades superiores a este rango.
    */

    return String(n);

  }


  /* =======================================================
     CONVERTIR IDENTIFICADORES DÍGITO POR DÍGITO

     IMPORTANTE:
     Se usa para DUI, ONI y números similares.

     Ejemplo:
     01234567-8

     ->
     cero, uno, dos, tres, cuatro,
     cinco, seis, siete, guion, ocho

     Así nunca se pierden ceros iniciales.
  ======================================================= */

  function digitosEnLetras(valor) {

    const texto =
      String(
        valor ?? ""
      );


    const partes = [];


    for (
      const caracter
      of texto
    ) {

      if (
        /^[0-9]$/.test(
          caracter
        )
      ) {

        partes.push(
          unidades[
            Number(caracter)
          ]
        );

        continue;

      }


      if (
        caracter === "-"
        ||
        caracter === "–"
      ) {

        partes.push(
          "guion"
        );

        continue;

      }


      if (
        caracter === " "
      ) {

        continue;

      }


      /*
        Si aparece algún carácter especial,
        lo conservamos para evitar modificar
        accidentalmente el identificador.
      */

      partes.push(
        caracter
      );

    }


    return partes.join(
      ", "
    );

  }


  /* =======================================================
     FECHA A LETRAS

     Entrada:
     2026-08-04

     Resultado:
     cuatro de agosto del año dos mil veintiséis
  ======================================================= */

  function fechaEnLetras(valor) {

    if (!valor) {
      return "";
    }


    const partes =
      String(valor)
        .split("-")
        .map(Number);


    if (
      partes.length !== 3
    ) {
      return String(valor);
    }


    const [
      anio,
      mes,
      dia
    ] = partes;


    if (
      !anio ||
      !mes ||
      !dia ||
      mes < 1 ||
      mes > 12
    ) {
      return String(valor);
    }


    return (
      numeroEnLetras(dia)
      +
      " de "
      +
      meses[
        mes - 1
      ]
      +
      " del año "
      +
      numeroEnLetras(anio)
    );

  }


  /* =======================================================
     HORA A LETRAS

     Entrada:
     20:35

     Resultado:
     veinte horas con treinta y cinco minutos
  ======================================================= */

  function horaEnLetras(valor) {

    if (!valor) {
      return "";
    }


    const partes =
      String(valor)
        .split(":")
        .map(Number);


    if (
      partes.length < 2
    ) {
      return String(valor);
    }


    const [
      hora,
      minutos
    ] = partes;


    if (
      !Number.isFinite(hora)
      ||
      !Number.isFinite(minutos)
    ) {
      return String(valor);
    }


    let resultado =
      numeroEnLetras(hora)
      +
      " horas";


    if (
      minutos > 0
    ) {

      resultado +=
        " con "
        +
        numeroEnLetras(minutos)
        +
        " minutos";

    }


    return resultado;

  }


  /* =======================================================
     ARTÍCULO A LETRAS

     Permite artículos como:
     142
     338-A
     346-B

     Ejemplo:
     346-B

     ->
     trescientos cuarenta y seis B
  ======================================================= */

  function articuloEnLetras(valor) {

    const texto =
      String(
        valor ?? ""
      ).trim();


    if (!texto) {
      return "";
    }


    const coincidencia =
      texto.match(
        /^(\d+)\s*(.*)$/
      );


    if (
      !coincidencia
    ) {
      return texto;
    }


    const numero =
      Number(
        coincidencia[1]
      );


    const sufijo =
      String(
        coincidencia[2] || ""
      ).trim();


    let resultado =
      numeroEnLetras(
        numero
      );


    if (sufijo) {

      resultado +=
        " "
        +
        sufijo;

    }


    return resultado;

  }


  /* =======================================================
     EDAD A LETRAS
  ======================================================= */

  function edadEnLetras(valor) {

    if (
      valor === ""
      ||
      valor === null
      ||
      valor === undefined
    ) {
      return "";
    }


    return numeroEnLetras(
      Number(valor)
    );

  }


  /* =======================================================
     EXPORTAR FUNCIONES
  ======================================================= */

  return {

    numeroEnLetras,

    digitosEnLetras,

    fechaEnLetras,

    horaEnLetras,

    articuloEnLetras,

    edadEnLetras,


    /*
      Alias cortos utilizados por otros archivos
      del proyecto.
    */

    num:
      numeroEnLetras,

    digits:
      digitosEnLetras,

    date:
      fechaEnLetras,

    time:
      horaEnLetras,

    article:
      articuloEnLetras,

    age:
      edadEnLetras

  };

})();


/* =========================================================
   FIN DE number-to-words.js
   SIGA SV V3 PILOTO
========================================================= */
