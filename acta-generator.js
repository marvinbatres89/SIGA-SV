/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: acta-generator.js
   VERSIÓN: V3 PILOTO
========================================================= */

window.SIGA_GENERATOR = (() => {

  const W = window.SIGA_WORDS;


  /* =======================================================
     PROTEGER TEXTO INTRODUCIDO POR EL USUARIO
  ======================================================= */

  function esc(texto) {

    return String(
      texto ?? ""
    )

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      );

  }


  /* =======================================================
     NOMBRES IMPORTANTES

     Regla aprobada:
     - MAYÚSCULAS
     - SUBRAYADO
     - NEGRITA

     Se utilizará para nombres de:
     - agentes
     - auxiliares
     - aprehendido
     - víctima
     - padres
     - persona a quien se avisa
  ======================================================= */

  function nombreClave(nombre) {

    if (!nombre) {
      return "";
    }


    return (
      '<span class="person-key">'
      +
      esc(
        String(nombre)
          .toUpperCase()
      )
      +
      "</span>"
    );

  }


  /* =======================================================
     TEXTO OPCIONAL
  ======================================================= */

  function textoOpcional(
    texto,
    prefijo = "",
    sufijo = ""
  ) {

    if (!texto) {
      return "";
    }


    return (
      prefijo
      +
      esc(texto)
      +
      sufijo
    );

  }


  /* =======================================================
     AUXILIARES
  ======================================================= */

  function generarAuxiliares(
    auxiliares = []
  ) {

    if (
      !Array.isArray(auxiliares)
      ||
      auxiliares.length === 0
    ) {

      return "";

    }


    const validos =
      auxiliares.filter(
        auxiliar =>
          auxiliar
          &&
          auxiliar.name
      );


    if (
      validos.length === 0
    ) {

      return "";

    }


    const texto =
      validos.map(
        auxiliar => {

          let resultado = "";


          if (
            auxiliar.rank
          ) {

            resultado +=
              esc(
                auxiliar.rank
              )
              +
              " ";

          }


          resultado +=
            nombreClave(
              auxiliar.name
            );


          if (
            auxiliar.oni
          ) {

            resultado +=
              ", con orden numérico institucional "
              +
              W.digits(
                auxiliar.oni
              );

          }


          return resultado;

        }
      );


    return (
      ", auxiliado de "
      +
      texto.join(", ")
    );

  }


  /* =======================================================
     VÍCTIMA
  ======================================================= */

  function generarVictima(datos) {

    if (
      datos.victimMode
      ===
      "person"
    ) {

      let texto =
        " En perjuicio de ";


      texto +=
        nombreClave(
          datos.victimName
        );


      if (
        datos.victimAge
      ) {

        texto +=
          ", de "
          +
          W.num(
            datos.victimAge
          )
          +
          " años de edad";

      }


      if (
        datos.victimAddress
      ) {

        texto +=
          ", residente en "
          +
          esc(
            datos.victimAddress
          );

      }


      texto += ".";


      return texto;

    }


    if (
      datos.victimMode
      ===
      "public"
    ) {

      return (
        " En perjuicio de "
        +
        esc(
          datos.publicInterest
        )
        +
        "."
      );

    }


    return "";

  }


  /* =======================================================
     PADRES / FILIACIÓN
  ======================================================= */

  function generarFiliacion(
    datos
  ) {

    let texto =
      " siendo hijo de la señora ";


    texto +=
      nombreClave(
        datos.motherName
      );


    if (
      datos.motherNote
    ) {

      texto +=
        ", "
        +
        esc(
          datos.motherNote
        );

    }


    texto +=
      " y del señor ";


    texto +=
      nombreClave(
        datos.fatherName
      );


    if (
      datos.fatherNote
    ) {

      texto +=
        ", "
        +
        esc(
          datos.fatherNote
        );

    }


    if (
      datos.parentsAddress
    ) {

      texto +=
        ", ambos residentes en "
        +
        esc(
          datos.parentsAddress
        );

    }


    texto += ".";


    return texto;

  }


  /* =======================================================
     LUGAR DE APREHENSIÓN
  ======================================================= */

  function generarLugarAprehension(
    datos
  ) {

    const partes = [];


    if (
      datos.arrestPlace
    ) {

      partes.push(
        esc(
          datos.arrestPlace
        )
      );

    }


    if (
      datos.arrestHamlet
    ) {

      partes.push(
        "caserío "
        +
        esc(
          datos.arrestHamlet
        )
      );

    }


    if (
      datos.arrestCanton
    ) {

      partes.push(
        "cantón "
        +
        esc(
          datos.arrestCanton
        )
      );

    }


    if (
      datos.arrestMunicipality
    ) {

      partes.push(
        "distrito o municipio de "
        +
        esc(
          datos.arrestMunicipality
        )
      );

    }


    if (
      datos.arrestDepartment
    ) {

      partes.push(
        "departamento de "
        +
        esc(
          datos.arrestDepartment
        )
      );

    }


    return partes.join(
      ", "
    );

  }


  /* =======================================================
     DEPÓSITO / INCAUTACIÓN
  ======================================================= */

  function generarObjetos(
    datos
  ) {

    if (
      datos.objectsMode
      ===
      "none"
    ) {

      return (
        " No deja nada en calidad de depósito "
        +
        "ni en calidad de incautación."
      );

    }


    if (
      datos.objectsMode
      !==
      "yes"
    ) {

      return "";

    }


    const partes = [];


    if (
      datos.depositObjects
    ) {

      partes.push(
        "dejando en calidad de depósito "
        +
        esc(
          datos.depositObjects
        )
      );

    }


    if (
      datos.seizedObjects
    ) {

      partes.push(
        "dejando en calidad de incautación "
        +
        esc(
          datos.seizedObjects
        )
      );

    }


    if (
      partes.length === 0
    ) {

      return "";

    }


    return (
      " "
      +
      partes.join(" y ")
      +
      "."
    );

  }


  /* =======================================================
     AVISO DE LA APREHENSIÓN
  ======================================================= */

  function generarAviso(
    datos
  ) {

    if (
      datos.noticeMode
      ===
      "nobody"
    ) {

      let texto =
        " Al preguntarle a quién se le puede dar aviso "
        +
        "de su aprehensión, manifestó que a nadie";


      if (
        datos.noticeNobodyReason
      ) {

        texto +=
          ", "
          +
          esc(
            datos.noticeNobodyReason
          );

      }


      texto += ".";


      return texto;

    }


    if (
      datos.noticeMode
      ===
      "person"
    ) {

      let texto =
        " Al preguntarle a quién se le puede dar aviso "
        +
        "de su aprehensión, manifestó que a ";


      texto +=
        nombreClave(
          datos.noticePersonName
        );


      if (
        datos.noticeRelation
      ) {

        texto +=
          ", "
          +
          esc(
            datos.noticeRelation
          );

      }


      texto += ".";


      return texto;

    }


    return "";

  }


  /* =======================================================
     FIRMA DEL APREHENDIDO
  ======================================================= */

  function generarFirmaAprehendido(
    datos
  ) {

    if (
      datos.detaineeSigns
      ===
      "yes"
    ) {

      return (
        " firmando también el aprehendido."
      );

    }


    if (
      datos.detaineeSigns
      ===
      "no"
    ) {

      let texto =
        " no así el aprehendido";


      if (
        datos.noSignReason
      ) {

        texto +=
          " "
          +
          esc(
            datos.noSignReason
          );

      }


      texto += ".";


      return texto;

    }


    return ".";

  }


  /* =======================================================
     ANEXOS
  ======================================================= */

  function generarAnexos(
    anexos = []
  ) {

    if (
      !Array.isArray(anexos)
    ) {

      return "";

    }


    const validos =
      anexos
        .filter(Boolean)
        .map(
          anexo =>
            esc(anexo)
        );


    if (
      validos.length === 0
    ) {

      return "";

    }


    return (
      " Se anexa a la presente acta: "
      +
      validos.join("; ")
      +
      "."
    );

  }


  /* =======================================================
     FIRMAS HORIZONTALES
  ======================================================= */

  function generarFirmas(
    captores = []
  ) {

    let html = "";


    html +=
      `
      <div class="signature">
        <div class="line">
          APREHENDIDO
        </div>
      </div>
      `;


    if (
      Array.isArray(captores)
    ) {

      captores
        .filter(Boolean)
        .forEach(
          (captor, indice) => {

            html +=
              `
              <div class="signature">

                <div class="line">
                  CAPTOR ${indice + 1}
                </div>

                <div>
                  ${esc(
                    String(captor)
                      .toUpperCase()
                  )}
                </div>

              </div>
              `;

          }
        );

    }


    return (
      '<div class="signatures">'
      +
      html
      +
      "</div>"
    );

  }


  /* =======================================================
     GENERAR ACTA COMPLETA
  ======================================================= */

  function build(
    datos
  ) {

    const auxiliares =
      generarAuxiliares(
        datos.helpers
      );


    const victima =
      generarVictima(
        datos
      );


    const filiacion =
      generarFiliacion(
        datos
      );


    const lugarAprehension =
      generarLugarAprehension(
        datos
      );


    const objetos =
      generarObjetos(
        datos
      );


    const aviso =
      generarAviso(
        datos
      );


    const firmaAprehendido =
      generarFirmaAprehendido(
        datos
      );


    const anexos =
      generarAnexos(
        datos.annexes
      );


    const firmas =
      generarFirmas(
        datos.captors
      );


    /* =====================================================
       ALIAS
    ===================================================== */

    let alias = "";


    if (
      datos.alias
    ) {

      alias =
        " alias "
        +
        esc(
          String(
            datos.alias
          ).toUpperCase()
        );

    }


    /* =====================================================
       ENCABEZADO

       IMPORTANTE:
       - MAYÚSCULAS.
       - NO SUBRAYADO.
       - La fecha y hora se unen corridamente.
    ===================================================== */

    let html = "";


    html +=
      '<p>';


    html +=
      '<span class="header-fixed">'
      +
      esc(
        datos.headerFixed
      )
      +
      "</span> ";


    html +=
      "A LAS "
      +
      W.time(
        datos.actTime
      ).toUpperCase()
      +
      " DEL DÍA "
      +
      W.date(
        datos.actDate
      ).toUpperCase()
      +
      ". ";


    /* =====================================================
       AGENTE PRINCIPAL
    ===================================================== */

    html +=
      "Presente el suscrito "
      +
      esc(
        datos.leadRank
      )
      +
      " "
      +
      nombreClave(
        datos.leadName
      )
      +
      ", con orden numérico institucional "
      +
      W.digits(
        datos.leadOni
      );


    html +=
      auxiliares;


    html +=
      ", todos de generales conocidas por laborar "
      +
      "temporalmente en la Estación Policial Puente Cuscatlán, ";


    /* =====================================================
       APREHENDIDO
    ===================================================== */

    html +=
      "dejamos constancia de la aprehensión en flagrancia "
      +
      "del señor "
      +
      nombreClave(
        datos.detaineeName
      )
      +
      alias
      +
      ", de "
      +
      W.num(
        datos.age
      )
      +
      " años de edad";


    if (
      datos.civilStatus
    ) {

      html +=
        ", "
        +
        esc(
          datos.civilStatus
        );

    }


    if (
      datos.occupation
    ) {

      html +=
        ", "
        +
        esc(
          datos.occupation
        );

    }


    html +=
      ", residente en "
      +
      esc(
        datos.detaineeAddress
      );


    if (
      datos.detaineeMunicipality
    ) {

      html +=
        ", "
        +
        esc(
          datos.detaineeMunicipality
        );

    }


    if (
      datos.detaineeDepartment
    ) {

      html +=
        ", departamento de "
        +
        esc(
          datos.detaineeDepartment
        );

    }


    /* =====================================================
       DUI
    ===================================================== */

    html +=
      ", quien se identificó con su Documento Único "
      +
      "de Identidad número "
      +
      W.digits(
        datos.detaineeDui
      );


    /* =====================================================
       CARACTERÍSTICAS
    ===================================================== */

    html +=
      ", siendo de las características físicas siguientes: "
      +
      esc(
        datos.physicalFeatures
      );


    html +=
      ", y quien al momento de su aprehensión vestía "
      +
      "de la siguiente manera: "
      +
      esc(
        datos.clothing
      );


    /* =====================================================
       FECHA DE NACIMIENTO
    ===================================================== */

    html +=
      ", con fecha de nacimiento "
      +
      W.date(
        datos.birthDate
      )
      +
      ".";


    /* =====================================================
       FILIACIÓN
    ===================================================== */

    html +=
      filiacion;


    /* =====================================================
       DELITO

       Se reutiliza automáticamente el nombre del
       aprehendido ya registrado.
    ===================================================== */

    html +=
      " Dejando constancia de la aprehensión en flagrancia "
      +
      "del señor "
      +
      nombreClave(
        datos.detaineeName
      )
      +
      ", por el delito de "
      +
      esc(
        String(
          datos.crimeName
        ).toUpperCase()
      )
      +
      ", según lo establecido en el artículo "
      +
      W.article(
        datos.crimeArticle
      )
      +
      " de "
      +
      esc(
        datos.crimeLaw
      )
      +
      ".";


    /* =====================================================
       VÍCTIMA
    ===================================================== */

    html +=
      victima;


    /* =====================================================
       RELATO DE LOS HECHOS

       MUY IMPORTANTE:
       referenceStory NO SE UTILIZA AQUÍ.

       El relato de referencia está completamente
       aislado del documento final.
    ===================================================== */

    html +=
      ' <span class="section-title">'
      +
      "RELATO DE LOS HECHOS:"
      +
      "</span> ";


    html +=
      esc(
        datos.story
      )
      .replaceAll(
        "\n",
        " "
      );


    /* =====================================================
       APREHENSIÓN

       Esta sección va:
       - minúscula
       - negrita
       - subrayada

       Desde:
       "a su aprehensión..."

       Hasta:
       "...por el delito ya mencionado."
    ===================================================== */

    html +=
      ' <span class="important-key">';


    html +=
      "a su aprehensión en flagrancia a las "
      +
      W.time(
        datos.arrestTime
      )
      +
      " del día "
      +
      W.date(
        datos.arrestDate
      );


    if (
      lugarAprehension
    ) {

      html +=
        ", en "
        +
        lugarAprehension;

    }


    html +=
      ", por el delito ya mencionado.";


    html +=
      "</span>";


    /* =====================================================
       DERECHOS

       Texto automático/editable de la Parte 3.
    ===================================================== */

    if (
      datos.rightsText
    ) {

      html +=
        " "
        +
        esc(
          datos.rightsText
        )
        .replaceAll(
          "\n",
          " "
        );

    }


    /* =====================================================
       DEPÓSITO / INCAUTACIÓN
    ===================================================== */

    html +=
      objetos;


    /* =====================================================
       AVISO DE LA APREHENSIÓN
    ===================================================== */

    html +=
      aviso;


    /* =====================================================
       CIERRE
    ===================================================== */

    html +=
      " Y no habiendo nada más que hacer constar "
      +
      "en la presente acta de aprehensión, "
      +
      "se da por terminada, la cual para mayor "
      +
      "constancia firmamos";


    html +=
      firmaAprehendido;


    /* =====================================================
       ANEXOS
    ===================================================== */

    html +=
      anexos;


    /* =====================================================
       OBSERVACIÓN FINAL
    ===================================================== */

    if (
      datos.finalObservation
    ) {

      html +=
        " "
        +
        esc(
          datos.finalObservation
        );

    }


    html +=
      "</p>";


    /* =====================================================
       FIRMAS
    ===================================================== */

    html +=
      firmas;


    return html;

  }


  /* =======================================================
     EXPORTAR GENERADOR
  ======================================================= */

  return {

    build

  };

})();


/* =========================================================
   FIN DE acta-generator.js
   SIGA SV V3 PILOTO
========================================================= */
