/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: app.js
   VERSIÓN: V3 PILOTO
========================================================= */


/* =========================================================
   UTILIDADES BÁSICAS
========================================================= */

const $ = id =>
  document.getElementById(id);


const $$ = selector =>
  [
    ...document.querySelectorAll(
      selector
    )
  ];


const STORAGE =
  window.SIGA_STORAGE;


let helpers = [];

let annexes = [];

let captors = [];

let agents =
  STORAGE.getAgents();

let captorRegistry =
  STORAGE.getCaptors();

let currentDuiImageUrl =
  null;


/* =========================================================
   VALORES
========================================================= */

function value(id) {

  const element =
    $(id);


  if (!element) {
    return "";
  }


  return String(
    element.value || ""
  ).trim();

}


function setValue(
  id,
  newValue
) {

  const element =
    $(id);


  if (!element) {
    return;
  }


  element.value =
    newValue ?? "";

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escapeHtml(text) {

  return String(
    text ?? ""
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
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   MOSTRAR PANTALLA
========================================================= */

function showOnly(id) {

  [
    "home",
    "wizard",
    "preview"
  ]
    .forEach(
      screenId => {

        const screen =
          $(screenId);


        if (!screen) {
          return;
        }


        screen.classList.add(
          "hidden"
        );

      }
    );


  const target =
    $(id);


  if (target) {

    target.classList.remove(
      "hidden"
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   MOSTRAR PARTE
========================================================= */

function showPart(id) {

  $$(".part")
    .forEach(
      part => {

        part.classList.add(
          "hidden"
        );

      }
    );


  const target =
    $(id);


  if (target) {

    target.classList.remove(
      "hidden"
    );

  }


  showOnly(
    "wizard"
  );

}


/* =========================================================
   VALIDACIÓN DE CAMPOS OBLIGATORIOS
========================================================= */

function validateRequired(ids) {

  let valid = true;

  let firstError =
    null;


  ids.forEach(
    id => {

      const element =
        $(id);


      if (!element) {
        return;
      }


      const empty =
        !String(
          element.value || ""
        ).trim();


      element.classList.toggle(
        "invalid",
        empty
      );


      if (
        empty &&
        !firstError
      ) {

        firstError =
          element;

      }


      if (empty) {
        valid = false;
      }

    }
  );


  if (
    firstError
  ) {

    firstError.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });


    setTimeout(
      () => {

        try {

          firstError.focus();

        }

        catch (error) {

          console.warn(
            error
          );

        }

      },
      300
    );

  }


  return valid;

}


/* =========================================================
   QUITAR ERROR EN TIEMPO REAL
========================================================= */

function activateLiveValidation() {

  $$(
    "input, textarea, select"
  )
    .forEach(
      element => {

        const eventName =
          element.tagName
          ===
          "SELECT"

            ?

            "change"

            :

            "input";


        element.addEventListener(
          eventName,
          () => {

            if (
              String(
                element.value || ""
              ).trim()
            ) {

              element.classList.remove(
                "invalid"
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   CALCULAR EDAD
========================================================= */

function calculateAge(
  birthDate
) {

  if (!birthDate) {
    return "";
  }


  const birth =
    new Date(
      birthDate
      +
      "T00:00:00"
    );


  const today =
    new Date();


  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {

    return "";

  }


  let age =
    today.getFullYear()
    -
    birth.getFullYear();


  const monthDifference =
    today.getMonth()
    -
    birth.getMonth();


  if (
    monthDifference < 0
    ||
    (
      monthDifference === 0
      &&
      today.getDate()
      <
      birth.getDate()
    )
  ) {

    age--;

  }


  return age >= 0
    ?
    age
    :
    "";

}


/* =========================================================
   FECHA INICIAL
========================================================= */

function setDefaultDate() {

  if (
    value(
      "actDate"
    )
  ) {
    return;
  }


  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      now.getDate()
    )
      .padStart(
        2,
        "0"
      );


  setValue(
    "actDate",
    `${year}-${month}-${day}`
  );

}


/* =========================================================
   AGENTES GUARDADOS
========================================================= */

function renderAgentRegistry() {

  const container =
    $(
      "agentRegistry"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    agents.length === 0
  ) {

    container.innerHTML =
      `
      <div class="repeat-card">
        No hay agentes guardados.
      </div>
      `;

    return;

  }


  agents.forEach(
    (
      agent,
      index
    ) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "registry-item";


      card.innerHTML =
        `
        <span>
          <b>
            ${escapeHtml(
              agent.name
            )}
          </b>

          <br>

          <small>
            ${escapeHtml(
              agent.rank
            )}
            ·
            ONI
            ${escapeHtml(
              agent.oni
            )}
          </small>
        </span>

        <span class="registry-actions">

          <button
            type="button"
            data-use-agent
          >
            Usar
          </button>

          <button
            type="button"
            data-edit-agent
          >
            Editar
          </button>

          <button
            type="button"
            data-delete-agent
          >
            Eliminar
          </button>

        </span>
        `;


      card
        .querySelector(
          "[data-use-agent]"
        )
        .onclick =
        () => {

          setValue(
            "leadRank",
            agent.rank
          );


          setValue(
            "leadName",
            agent.name
          );


          setValue(
            "leadOni",
            agent.oni
          );

        };


      card
        .querySelector(
          "[data-edit-agent]"
        )
        .onclick =
        () => {

          setValue(
            "leadRank",
            agent.rank
          );


          setValue(
            "leadName",
            agent.name
          );


          setValue(
            "leadOni",
            agent.oni
          );


          agents.splice(
            index,
            1
          );


          STORAGE.setAgents(
            agents
          );


          renderAgentRegistry();

        };


      card
        .querySelector(
          "[data-delete-agent]"
        )
        .onclick =
        () => {

          const confirmed =
            confirm(
              "¿Desea eliminar este agente guardado?"
            );


          if (!confirmed) {
            return;
          }


          agents.splice(
            index,
            1
          );


          STORAGE.setAgents(
            agents
          );


          renderAgentRegistry();

        };


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   GUARDAR AGENTE PRINCIPAL
========================================================= */

function saveLeadAgent() {

  const valid =
    validateRequired([
      "leadRank",
      "leadName",
      "leadOni"
    ]);


  if (!valid) {
    return;
  }


  const newAgent = {

    rank:
      value(
        "leadRank"
      ),

    name:
      value(
        "leadName"
      ),

    oni:
      value(
        "leadOni"
      )

  };


  const duplicate =
    agents.some(
      agent =>
        agent.name
          .toLowerCase()
        ===
        newAgent.name
          .toLowerCase()
    );


  if (duplicate) {

    alert(
      "Ese agente ya está guardado."
    );

    return;

  }


  agents.push(
    newAgent
  );


  STORAGE.setAgents(
    agents
  );


  renderAgentRegistry();


  alert(
    "Agente guardado correctamente."
  );

}


/* =========================================================
   AUXILIARES
========================================================= */

function addHelper(
  data = {
    rank: "",
    name: "",
    oni: ""
  }
) {

  helpers.push(
    data
  );


  renderHelpers();

}


/* =========================================================
   MOSTRAR AUXILIARES
========================================================= */

function renderHelpers() {

  const container =
    $(
      "helpers"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  helpers.forEach(
    (
      helper,
      index
    ) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "repeat-card";


      card.innerHTML =
        `
        <div class="grid3">

          <label>
            Grado / categoría *

            <input
              data-helper-field="rank"
              value="${escapeHtml(
                helper.rank
              )}"
            >
          </label>

          <label>
            Nombre *

            <input
              data-helper-field="name"
              value="${escapeHtml(
                helper.name
              )}"
            >
          </label>

          <label>
            ONI

            <input
              data-helper-field="oni"
              value="${escapeHtml(
                helper.oni
              )}"
            >
          </label>

        </div>

        <button
          type="button"
          class="remove"
        >
          Eliminar auxiliar
        </button>
        `;


      card
        .querySelectorAll(
          "[data-helper-field]"
        )
        .forEach(
          input => {

            input.addEventListener(
              "input",
              () => {

                const key =
                  input.dataset
                    .helperField;


                helpers[
                  index
                ][
                  key
                ] =
                  input.value
                    .trim();

              }
            );

          }
        );


      card
        .querySelector(
          ".remove"
        )
        .onclick =
        () => {

          helpers.splice(
            index,
            1
          );


          renderHelpers();

        };


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   VALIDAR AUXILIARES
========================================================= */

function validateHelpers() {

  for (
    const helper
    of helpers
  ) {

    if (
      !helper.rank
      ||
      !helper.name
    ) {

      alert(
        "Complete el grado y nombre de cada auxiliar o elimine la fila que no utilizará."
      );

      return false;

    }

  }


  return true;

}


/* =========================================================
   CÁMARA / DUI
========================================================= */

function openDuiCamera() {

  const input =
    $(
      "duiImage"
    );


  if (input) {

    input.click();

  }

}


/* =========================================================
   MOSTRAR FOTO DEL DUI

   IMPORTANTE:
   Esta versión V3 usa la cámara únicamente
   como apoyo visual.

   No extrae automáticamente los datos todavía.
========================================================= */

function handleDuiImage(
  event
) {

  const file =
    event.target
      .files?.[0];


  if (!file) {
    return;
  }


  if (
    currentDuiImageUrl
  ) {

    URL.revokeObjectURL(
      currentDuiImageUrl
    );

  }


  currentDuiImageUrl =
    URL.createObjectURL(
      file
    );


  const preview =
    $(
      "duiPreview"
    );


  if (preview) {

    preview.src =
      currentDuiImageUrl;

  }


  $(
    "scanPanel"
  )
    ?.classList
    .remove(
      "hidden"
    );

}


/* =========================================================
   DESCARTAR FOTO DUI
========================================================= */

function discardDuiImage() {

  if (
    currentDuiImageUrl
  ) {

    URL.revokeObjectURL(
      currentDuiImageUrl
    );


    currentDuiImageUrl =
      null;

  }


  const preview =
    $(
      "duiPreview"
    );


  if (preview) {

    preview.src = "";

  }


  const input =
    $(
      "duiImage"
    );


  if (input) {

    input.value = "";

  }


  $(
    "scanPanel"
  )
    ?.classList
    .add(
      "hidden"
    );

}


/* =========================================================
   BUSCAR DELITOS
========================================================= */

function searchCrimes() {

  const query =
    value(
      "crimeSearch"
    );


  const container =
    $(
      "crimeSuggestions"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!query) {
    return;
  }


  const results =
    window
      .SIGA_LEGAL
      .search(
        query
      );


  if (
    results.length === 0
  ) {

    container.innerHTML =
      `
      <div class="repeat-card">
        No se encontraron coincidencias.
      </div>
      `;

    return;

  }


  results.forEach(
    crime => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.innerHTML =
        `
        <b>
          ${escapeHtml(
            crime.name
          )}
        </b>

        <small>
          Art.
          ${escapeHtml(
            crime.article
          )}
          ·
          ${escapeHtml(
            crime.law
          )}
        </small>
        `;


      button.onclick =
        () => {

          setValue(
            "crimeSearch",
            crime.name
          );


          setValue(
            "crimeName",
            crime.name
          );


          setValue(
            "crimeArticle",
            crime.article
          );


          setValue(
            "crimeLaw",
            crime.law
          );


          container.innerHTML =
            "";

        };


      container.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   VÍCTIMA
========================================================= */

function updateVictimMode() {

  const mode =
    value(
      "victimMode"
    );


  $(
    "victimPersonFields"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "person"
    );


  $(
    "victimPublicFields"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "public"
    );

}


/* =========================================================
   OBJETOS
========================================================= */

function updateObjectsMode() {

  const mode =
    value(
      "objectsMode"
    );


  $(
    "objectsFields"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "yes"
    );

}


/* =========================================================
   AVISO DE APREHENSIÓN
========================================================= */

function updateNoticeMode() {

  const mode =
    value(
      "noticeMode"
    );


  $(
    "noticeNobodyFields"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "nobody"
    );


  $(
    "noticePersonFields"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "person"
    );

}


/* =========================================================
   FIRMA APREHENDIDO
========================================================= */

function updateDetaineeSignatureMode() {

  const mode =
    value(
      "detaineeSigns"
    );


  $(
    "noSignReasonWrap"
  )
    ?.classList
    .toggle(
      "hidden",
      mode !== "no"
    );

}


/* =========================================================
   ANEXOS
========================================================= */

function addAnnex(
  text = ""
) {

  annexes.push(
    text
  );


  renderAnnexes();

}


function renderAnnexes() {

  const container =
    $(
      "annexes"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  annexes.forEach(
    (
      annex,
      index
    ) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "repeat-card";


      card.innerHTML =
        `
        <label>
          Anexo ${index + 1}

          <input
            value="${escapeHtml(
              annex
            )}"
            placeholder="Ej. hoja de chequeo clínico"
          >
        </label>

        <button
          type="button"
          class="remove"
        >
          Eliminar
        </button>
        `;


      card
        .querySelector(
          "input"
        )
        .addEventListener(
          "input",
          event => {

            annexes[
              index
            ] =
              event.target
                .value
                .trim();

          }
        );


      card
        .querySelector(
          ".remove"
        )
        .onclick =
        () => {

          annexes.splice(
            index,
            1
          );


          renderAnnexes();

        };


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   REGISTRO DE CAPTORES
========================================================= */

function renderCaptorRegistry() {

  const container =
    $(
      "captorRegistry"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    captorRegistry.length === 0
  ) {

    container.innerHTML =
      `
      <div class="repeat-card">
        No hay captores guardados.
      </div>
      `;

    return;

  }


  captorRegistry.forEach(
    (
      captor,
      index
    ) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "registry-item";


      card.innerHTML =
        `
        <span>

          <b>
            ${escapeHtml(
              captor.name
            )}
          </b>

          <br>

          <small>

            ${escapeHtml(
              captor.rank || ""
            )}

            ${
              captor.oni
                ?
                " · ONI "
                +
                escapeHtml(
                  captor.oni
                )
                :
                ""
            }

          </small>

        </span>


        <span class="registry-actions">

          <button
            type="button"
            data-use-captor
          >
            Usar
          </button>


          <button
            type="button"
            data-edit-captor
          >
            Editar
          </button>


          <button
            type="button"
            data-delete-captor
          >
            Eliminar
          </button>

        </span>
        `;


      card
        .querySelector(
          "[data-use-captor]"
        )
        .onclick =
        () => {

          captors.push(
            captor.name
          );


          renderCaptors();

        };


      card
        .querySelector(
          "[data-edit-captor]"
        )
        .onclick =
        () => {

          setValue(
            "registryRank",
            captor.rank || ""
          );


          setValue(
            "registryName",
            captor.name || ""
          );


          setValue(
            "registryOni",
            captor.oni || ""
          );


          captorRegistry.splice(
            index,
            1
          );


          STORAGE.setCaptors(
            captorRegistry
          );


          renderCaptorRegistry();

        };


      card
        .querySelector(
          "[data-delete-captor]"
        )
        .onclick =
        () => {

          const confirmed =
            confirm(
              "¿Desea eliminar este captor guardado?"
            );


          if (!confirmed) {
            return;
          }


          captorRegistry.splice(
            index,
            1
          );


          STORAGE.setCaptors(
            captorRegistry
          );


          renderCaptorRegistry();

        };


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   GUARDAR CAPTOR
========================================================= */

function saveCaptor() {

  const name =
    value(
      "registryName"
    );


  if (!name) {

    alert(
      "Escriba el nombre del captor."
    );

    return;

  }


  const newCaptor = {

    rank:
      value(
        "registryRank"
      ),

    name,

    oni:
      value(
        "registryOni"
      )

  };


  const duplicate =
    captorRegistry
      .some(
        captor =>
          captor.name
            .toLowerCase()
          ===
          name.toLowerCase()
      );


  if (duplicate) {

    alert(
      "Ese captor ya está guardado."
    );

    return;

  }


  captorRegistry.push(
    newCaptor
  );


  STORAGE.setCaptors(
    captorRegistry
  );


  setValue(
    "registryRank",
    ""
  );


  setValue(
    "registryName",
    ""
  );


  setValue(
    "registryOni",
    ""
  );


  renderCaptorRegistry();


  alert(
    "Captor guardado correctamente."
  );

}


/* =========================================================
   LISTA DISPONIBLE DE AGENTES/CAPTORES
========================================================= */

function getAvailablePersonnel() {

  const list = [

    ...agents,

    ...captorRegistry,

    {
      rank:
        value(
          "leadRank"
        ),

      name:
        value(
          "leadName"
        ),

      oni:
        value(
          "leadOni"
        )
    },

    ...helpers

  ]
    .filter(
      person =>
        person
        &&
        person.name
    );


  return list.filter(
    (
      person,
      index,
      array
    ) => {

      return (
        array.findIndex(
          other =>
            other.name
              .toLowerCase()
            ===
            person.name
              .toLowerCase()
        )
        ===
        index
      );

    }
  );

}


/* =========================================================
   AGREGAR CAPTOR A FIRMAS
========================================================= */

function addCaptor(
  name = ""
) {

  captors.push(
    name
  );


  renderCaptors();

}


/* =========================================================
   MOSTRAR CAPTORES PARA FIRMA
========================================================= */

function renderCaptors() {

  const container =
    $(
      "captors"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const personnel =
    getAvailablePersonnel();


  captors.forEach(
    (
      selectedName,
      index
    ) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "repeat-card";


      const options =
        personnel
          .map(
            person => {

              const selected =
                person.name
                ===
                selectedName

                  ?

                  "selected"

                  :

                  "";


              const label =
                (
                  person.rank
                    ?
                    person.rank
                    +
                    " "
                    :
                    ""
                )
                +
                person.name;


              return (
                `
                <option
                  value="${escapeHtml(
                    person.name
                  )}"
                  ${selected}
                >
                  ${escapeHtml(
                    label
                  )}
                </option>
                `
              );

            }
          )
          .join("");


      card.innerHTML =
        `
        <label>

          Captor ${index + 1}

          <select data-captor-select>

            <option value="">
              Seleccione
            </option>

            ${options}

            <option value="MANUAL">
              Otro / manual
            </option>

          </select>

        </label>


        <input
          data-captor-manual
          class="hidden"
          placeholder="Escriba nombre manualmente"
        >


        <button
          type="button"
          class="remove"
        >
          Eliminar captor
        </button>
        `;


      const select =
        card.querySelector(
          "[data-captor-select]"
        );


      const manual =
        card.querySelector(
          "[data-captor-manual]"
        );


      select.addEventListener(
        "change",
        () => {

          if (
            select.value
            ===
            "MANUAL"
          ) {

            manual.classList.remove(
              "hidden"
            );


            captors[
              index
            ] =
              manual.value
                .trim();

          }

          else {

            manual.classList.add(
              "hidden"
            );


            captors[
              index
            ] =
              select.value;

          }

        }
      );


      manual.addEventListener(
        "input",
        () => {

          captors[
            index
          ] =
            manual.value
              .trim();

        }
      );


      card
        .querySelector(
          ".remove"
        )
        .onclick =
        () => {

          captors.splice(
            index,
            1
          );


          renderCaptors();

        };


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   VALIDAR PARTE 1
========================================================= */

function validatePart1() {

  const requiredFields = [

    "headerFixed",
    "actDate",
    "actTime",

    "leadRank",
    "leadName",
    "leadOni",

    "detaineeDui",
    "detaineeName",
    "birthDate",
    "civilStatus",
    "occupation",

    "detaineeAddress",
    "detaineeMunicipality",
    "detaineeDepartment",

    "physicalFeatures",
    "clothing",

    "motherName",
    "fatherName",

    "crimeName",
    "crimeArticle",
    "crimeLaw",

    "victimMode"

  ];


  if (
    !validateRequired(
      requiredFields
    )
  ) {

    return false;

  }


  if (
    !validateHelpers()
  ) {

    return false;

  }


  const victimMode =
    value(
      "victimMode"
    );


  if (
    victimMode
    ===
    "person"
  ) {

    if (
      !validateRequired([
        "victimName"
      ])
    ) {

      return false;

    }

  }


  if (
    victimMode
    ===
    "public"
  ) {

    if (
      !validateRequired([
        "publicInterest"
      ])
    ) {

      return false;

    }

  }


  setValue(
    "age",
    calculateAge(
      value(
        "birthDate"
      )
    )
  );


  return true;

}


/* =========================================================
   VALIDAR PARTE 2
========================================================= */

function validatePart2() {

  const valid =
    validateRequired([

      "story",

      "arrestDate",
      "arrestTime",

      "arrestPlace",

      "arrestMunicipality",
      "arrestDepartment"

    ]);


  if (!valid) {
    return false;
  }


  /*
    Validación simple de cronología cuando
    ambas fechas son iguales.
  */

  if (
    value(
      "actDate"
    )
    ===
    value(
      "arrestDate"
    )
  ) {

    if (
      value(
        "actTime"
      )
      <
      value(
        "arrestTime"
      )
    ) {

      alert(
        "Revise las horas. La hora de elaboración del acta está antes de la hora de aprehensión."
      );

      return false;

    }

  }


  return true;

}


/* =========================================================
   VALIDAR PARTE 3
========================================================= */

function validatePart3() {

  if (
    !validateRequired([

      "rightsText",

      "objectsMode",

      "noticeMode",

      "detaineeSigns"

    ])
  ) {

    return false;

  }


  if (
    value(
      "objectsMode"
    )
    ===
    "yes"
  ) {

    if (
      !value(
        "depositObjects"
      )
      &&
      !value(
        "seizedObjects"
      )
    ) {

      alert(
        "Indique al menos un objeto en depósito o en incautación."
      );

      return false;

    }

  }


  if (
    value(
      "noticeMode"
    )
    ===
    "nobody"
  ) {

    if (
      !validateRequired([
        "noticeNobodyReason"
      ])
    ) {

      return false;

    }

  }


  if (
    value(
      "noticeMode"
    )
    ===
    "person"
  ) {

    if (
      !validateRequired([
        "noticePersonName"
      ])
    ) {

      return false;

    }

  }


  if (
    value(
      "detaineeSigns"
    )
    ===
    "no"
  ) {

    if (
      !validateRequired([
        "noSignReason"
      ])
    ) {

      return false;

    }

  }


  return true;

}


/* =========================================================
   CAPTURAR TODOS LOS DATOS
========================================================= */

function collectActData() {

  return {

    /* ENCABEZADO */

    headerFixed:
      value(
        "headerFixed"
      ),

    actDate:
      value(
        "actDate"
      ),

    actTime:
      value(
        "actTime"
      ),


    /* AGENTES */

    leadRank:
      value(
        "leadRank"
      ),

    leadName:
      value(
        "leadName"
      ),

    leadOni:
      value(
        "leadOni"
      ),

    helpers:
      helpers,


    /* APREHENDIDO */

    detaineeDui:
      value(
        "detaineeDui"
      ),

    detaineeName:
      value(
        "detaineeName"
      ),

    alias:
      value(
        "alias"
      ),

    birthDate:
      value(
        "birthDate"
      ),

    age:
      value(
        "age"
      ),

    civilStatus:
      value(
        "civilStatus"
      ),

    occupation:
      value(
        "occupation"
      ),

    detaineeAddress:
      value(
        "detaineeAddress"
      ),

    detaineeMunicipality:
      value(
        "detaineeMunicipality"
      ),

    detaineeDepartment:
      value(
        "detaineeDepartment"
      ),

    physicalFeatures:
      value(
        "physicalFeatures"
      ),

    clothing:
      value(
        "clothing"
      ),


    /* FILIACIÓN */

    motherName:
      value(
        "motherName"
      ),

    motherNote:
      value(
        "motherNote"
      ),

    fatherName:
      value(
        "fatherName"
      ),

    fatherNote:
      value(
        "fatherNote"
      ),

    parentsAddress:
      value(
        "parentsAddress"
      ),


    /* DELITO */

    crimeName:
      value(
        "crimeName"
      ),

    crimeArticle:
      value(
        "crimeArticle"
      ),

    crimeLaw:
      value(
        "crimeLaw"
      ),


    /* VÍCTIMA */

    victimMode:
      value(
        "victimMode"
      ),

    victimName:
      value(
        "victimName"
      ),

    victimAge:
      value(
        "victimAge"
      ),

    victimAddress:
      value(
        "victimAddress"
      ),

    publicInterest:
      value(
        "publicInterest"
      ),


    /* RELATO ACTUAL */

    story:
      value(
        "story"
      ),


    /*
      MUY IMPORTANTE:

      referenceStory NO se incluye.

      El relato de referencia queda totalmente
      separado del generador del acta.
    */


    /* APREHENSIÓN */

    arrestDate:
      value(
        "arrestDate"
      ),

    arrestTime:
      value(
        "arrestTime"
      ),

    arrestPlace:
      value(
        "arrestPlace"
      ),

    arrestHamlet:
      value(
        "arrestHamlet"
      ),

    arrestCanton:
      value(
        "arrestCanton"
      ),

    arrestMunicipality:
      value(
        "arrestMunicipality"
      ),

    arrestDepartment:
      value(
        "arrestDepartment"
      ),


    /* DERECHOS */

    rightsText:
      value(
        "rightsText"
      ),


    /* OBJETOS */

    objectsMode:
      value(
        "objectsMode"
      ),

    depositObjects:
      value(
        "depositObjects"
      ),

    seizedObjects:
      value(
        "seizedObjects"
      ),


    /* AVISO */

    noticeMode:
      value(
        "noticeMode"
      ),

    noticeNobodyReason:
      value(
        "noticeNobodyReason"
      ),

    noticePersonName:
      value(
        "noticePersonName"
      ),

    noticeRelation:
      value(
        "noticeRelation"
      ),


    /* FIRMA */

    detaineeSigns:
      value(
        "detaineeSigns"
      ),

    noSignReason:
      value(
        "noSignReason"
      ),


    /* OBSERVACIÓN */

    finalObservation:
      value(
        "finalObservation"
      ),


    /* ANEXOS */

    annexes:
      annexes.filter(
        Boolean
      ),


    /* CAPTORES */

    captors:
      captors.filter(
        Boolean
      )

  };

}


/* =========================================================
   VISTA PREVIA
========================================================= */

function generatePreview() {

  const selectedCaptors =
    captors.filter(
      Boolean
    );


  if (
    selectedCaptors.length
    ===
    0
  ) {

    alert(
      "Agregue al menos un captor antes de generar la vista previa."
    );

    return;

  }


  const data =
    collectActData();


  const html =
    window
      .SIGA_GENERATOR
      .build(
        data
      );


  const act =
    $(
      "acta"
    );


  if (!act) {
    return;
  }


  act.innerHTML =
    html;


  applySavedPreviewSettings();


  showOnly(
    "preview"
  );

}


/* =========================================================
   BOTÓN FLOTANTE
========================================================= */

function toggleFloatingMenu() {

  $(
    "floatingMenu"
  )
    ?.classList
    .toggle(
      "hidden"
    );

}


/* =========================================================
   VOZ
========================================================= */

let currentSpeech =
  null;


function speakAct() {

  if (
    !(
      "speechSynthesis"
      in
      window
    )
  ) {

    alert(
      "Este navegador no soporta lectura por voz."
    );

    return;

  }


  window
    .speechSynthesis
    .cancel();


  const actText =
    $(
      "acta"
    )
      ?.innerText
      ?.trim();


  if (!actText) {

    alert(
      "No hay contenido para leer."
    );

    return;

  }


  currentSpeech =
    new SpeechSynthesisUtterance(
      actText
    );


  currentSpeech.lang =
    "es-SV";


  const settings =
    STORAGE.getSettings();


  currentSpeech.rate =
    Number(
      settings.voiceRate
      ||
      0.95
    );


  window
    .speechSynthesis
    .speak(
      currentSpeech
    );

}


function pauseSpeech() {

  if (
    "speechSynthesis"
    in
    window
  ) {

    window
      .speechSynthesis
      .pause();

  }

}


function resumeSpeech() {

  if (
    "speechSynthesis"
    in
    window
  ) {

    window
      .speechSynthesis
      .resume();

  }

}


function stopSpeech() {

  if (
    "speechSynthesis"
    in
    window
  ) {

    window
      .speechSynthesis
      .cancel();

  }

}


/* =========================================================
   FORMATO DE VISTA PREVIA
========================================================= */

function savePreviewSettings() {

  STORAGE.setSettings({

    fontFamily:
      value(
        "fontFamily"
      )
      ||
      "Arial",

    fontSize:
      value(
        "fontSize"
      )
      ||
      "11",

    voiceEnabled:
      true,

    voiceRate:
      0.95

  });

}


/* =========================================================
   APLICAR FORMATO GUARDADO
========================================================= */

function applySavedPreviewSettings() {

  const settings =
    STORAGE.getSettings();


  const act =
    $(
      "acta"
    );


  if (!act) {
    return;
  }


  const font =
    settings.fontFamily
    ||
    "Arial";


  const size =
    settings.fontSize
    ||
    "11";


  act.style.fontFamily =
    font;


  act.style.fontSize =
    size
    +
    "pt";


  setValue(
    "fontFamily",
    font
  );


  setValue(
    "fontSize",
    size
  );

}


/* =========================================================
   CAMBIAR FUENTE
========================================================= */

function changeFontFamily() {

  const font =
    value(
      "fontFamily"
    )
    ||
    "Arial";


  const act =
    $(
      "acta"
    );


  if (act) {

    act.style.fontFamily =
      font;

  }


  savePreviewSettings();

}


/* =========================================================
   CAMBIAR TAMAÑO
========================================================= */

function changeFontSize() {

  const size =
    value(
      "fontSize"
    )
    ||
    "11";


  const act =
    $(
      "acta"
    );


  if (act) {

    act.style.fontSize =
      size
      +
      "pt";

  }


  savePreviewSettings();

}


/* =========================================================
   SELECCIONAR TODA EL ACTA
========================================================= */

function selectAllAct() {

  const act =
    $(
      "acta"
    );


  if (!act) {
    return;
  }


  const range =
    document.createRange();


  range.selectNodeContents(
    act
  );


  const selection =
    window.getSelection();


  selection.removeAllRanges();


  selection.addRange(
    range
  );

}


/* =========================================================
   APLICAR NEGRITA / SUBRAYADO
========================================================= */

function applyFormat(
  command
) {

  try {

    document.execCommand(
      command,
      false,
      null
    );

  }

  catch (error) {

    console.warn(
      "Formato no disponible:",
      error
    );

  }

}


/* =========================================================
   PASAR SELECCIÓN A MAYÚSCULA
========================================================= */

function uppercaseSelection() {

  const selection =
    window.getSelection();


  if (
    !selection
    ||
    selection.rangeCount === 0
    ||
    selection.isCollapsed
  ) {

    alert(
      "Seleccione primero el texto que desea convertir a mayúsculas."
    );

    return;

  }


  const range =
    selection.getRangeAt(
      0
    );


  const text =
    selection
      .toString()
      .toUpperCase();


  const span =
    document.createElement(
      "span"
    );


  span.textContent =
    text;


  range.deleteContents();


  range.insertNode(
    span
  );


  selection.removeAllRanges();

}


/* =========================================================
   RESTABLECER ACTA
========================================================= */

function resetPreviewFormat() {

  const data =
    collectActData();


  const act =
    $(
      "acta"
    );


  if (!act) {
    return;
  }


  act.innerHTML =
    window
      .SIGA_GENERATOR
      .build(
        data
      );


  act.style.fontFamily =
    "Arial";


  act.style.fontSize =
    "11pt";


  setValue(
    "fontFamily",
    "Arial"
  );


  setValue(
    "fontSize",
    "11"
  );


  STORAGE.setSettings({

    fontFamily:
      "Arial",

    fontSize:
      "11",

    voiceEnabled:
      true,

    voiceRate:
      0.95

  });

}


/* =========================================================
   EXPORTAR WORD

   Genera archivo .doc compatible con Word.

   Word sigue siendo una OPCIÓN.
   La Vista previa permanece dentro de SIGA SV.
========================================================= */

function exportWord() {

  const act =
    $(
      "acta"
    );


  if (
    !act
    ||
    !act.innerHTML.trim()
  ) {

    alert(
      "Primero genere la vista previa."
    );

    return;

  }


  const font =
    value(
      "fontFamily"
    )
    ||
    "Arial";


  const size =
    value(
      "fontSize"
    )
    ||
    "11";


  const html =
    `
    <!doctype html>

    <html>

    <head>

      <meta charset="utf-8">

      <style>

        @page {
          size: 8.5in 13in;
          margin: 0.55in 0.65in;
        }

        body {
          font-family:
            ${font},
            Arial,
            sans-serif;

          font-size:
            ${size}pt;

          line-height: 1.25;

          text-align: justify;

          color: #000000;
        }

        * {
          color: #000000;
        }

        p {
          margin: 0 0 4px;
        }

        .header-fixed {
          text-transform: uppercase;
        }

        .person-key {
          text-transform: uppercase;
          text-decoration: underline;
          font-weight: bold;
        }

        .important-key {
          font-weight: bold;
          text-decoration: underline;
        }

        .section-title {
          text-transform: uppercase;
          font-weight: bold;
        }

        .signatures {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 28px 18px;
          margin-top: 36px;
        }

        .signature {
          width: 29%;
          min-width: 170px;
          text-align: center;
        }

        .line {
          margin-top: 42px;
          padding-top: 5px;
          border-top: 1px solid #000000;
          font-weight: bold;
        }

      </style>

    </head>


    <body>

      ${act.innerHTML}

    </body>

    </html>
    `;


  const blob =
    new Blob(
      [
        "\ufeff",
        html
      ],
      {
        type:
          "application/msword"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "SIGA_SV_ACTA.doc";


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1500
  );

}


/* =========================================================
   IMPRIMIR / PDF
========================================================= */

function printAct() {

  window.print();

}


/* =========================================================
   GUARDAR BORRADOR
========================================================= */

function saveDraft() {

  const fields = {};


  $$(
    "input, textarea, select"
  )
    .forEach(
      element => {

        if (
          !element.id
        ) {
          return;
        }


        if (
          element.id
          ===
          "duiImage"
        ) {
          return;
        }


        fields[
          element.id
        ] =
          element.value;

      }
    );


  const draft = {

    fields,

    helpers,

    annexes,

    captors

  };


  const saved =
    STORAGE.setDraft(
      draft
    );


  if (saved) {

    alert(
      "Borrador guardado correctamente en este dispositivo."
    );

  }

  else {

    alert(
      "No fue posible guardar el borrador."
    );

  }

}


/* =========================================================
   RECUPERAR BORRADOR
========================================================= */

function loadDraft(
  openPart = false
) {

  const draft =
    STORAGE.getDraft();


  if (!draft) {

    if (
      openPart
    ) {

      alert(
        "No existe un borrador guardado."
      );

    }


    return;

  }


  const fields =
    draft.fields
    ||
    {};


  Object.entries(
    fields
  )
    .forEach(
      (
        [
          id,
          fieldValue
        ]
      ) => {

        setValue(
          id,
          fieldValue
        );

      }
    );


  helpers =
    Array.isArray(
      draft.helpers
    )

      ?

      draft.helpers

      :

      [];


  annexes =
    Array.isArray(
      draft.annexes
    )

      ?

      draft.annexes

      :

      [];


  captors =
    Array.isArray(
      draft.captors
    )

      ?

      draft.captors

      :

      [];


  renderHelpers();


  renderAnnexes();


  renderCaptors();


  updateVictimMode();


  updateObjectsMode();


  updateNoticeMode();


  updateDetaineeSignatureMode();


  if (
    openPart
  ) {

    showPart(
      "part1"
    );

  }

}


/* =========================================================
   NUEVA ACTA
========================================================= */

function startNewAct() {

  showPart(
    "part1"
  );


  if (
    helpers.length === 0
  ) {

    addHelper();

  }


  if (
    captors.length === 0
  ) {

    addCaptor();

    addCaptor();

  }

}


/* =========================================================
   NAVEGACIÓN SIGUIENTE / ANTERIOR
========================================================= */

function configureNavigation() {

  $$(
    "[data-goto]"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showPart(
              button.dataset.goto
            );

          }
        );

      }
    );


  $$(
    "[data-back]"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showPart(
              button.dataset.back
            );

          }
        );

      }
    );


  $$(
    "[data-edit]"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            stopSpeech();


            showPart(
              button.dataset.edit
            );

          }
        );

      }
    );


  $$(
    "[data-next]"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const target =
              button.dataset.next;


            if (
              target ===
              "part2"
            ) {

              if (
                !validatePart1()
              ) {
                return;
              }


              showPart(
                "part2"
              );

              return;

            }


            if (
              target ===
              "part3"
            ) {

              if (
                !validatePart2()
              ) {
                return;
              }


              showPart(
                "part3"
              );

              return;

            }


            if (
              target ===
              "part4"
            ) {

              if (
                !validatePart3()
              ) {
                return;
              }


              renderCaptors();


              showPart(
                "part4"
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   CONFIGURAR BOTONES
========================================================= */

function configureButtons() {

  $(
    "newAct"
  )
    ?.addEventListener(
      "click",
      startNewAct
    );


  $(
    "resumeDraft"
  )
    ?.addEventListener(
      "click",
      () => {

        loadDraft(
          true
        );

      }
    );


  $(
    "homeBtn"
  )
    ?.addEventListener(
      "click",
      () => {

        stopSpeech();


        showOnly(
          "home"
        );

      }
    );


  $(
    "saveLeadAgent"
  )
    ?.addEventListener(
      "click",
      saveLeadAgent
    );


  $(
    "addHelper"
  )
    ?.addEventListener(
      "click",
      () => {

        addHelper();

      }
    );


  $(
    "birthDate"
  )
    ?.addEventListener(
      "change",
      () => {

        setValue(
          "age",
          calculateAge(
            value(
              "birthDate"
            )
          )
        );

      }
    );


  $(
    "scanDui"
  )
    ?.addEventListener(
      "click",
      openDuiCamera
    );


  $(
    "duiImage"
  )
    ?.addEventListener(
      "change",
      handleDuiImage
    );


  $(
    "discardDuiImage"
  )
    ?.addEventListener(
      "click",
      discardDuiImage
    );


  $(
    "crimeSearch"
  )
    ?.addEventListener(
      "input",
      searchCrimes
    );


  $(
    "victimMode"
  )
    ?.addEventListener(
      "change",
      updateVictimMode
    );


  $(
    "objectsMode"
  )
    ?.addEventListener(
      "change",
      updateObjectsMode
    );


  $(
    "noticeMode"
  )
    ?.addEventListener(
      "change",
      updateNoticeMode
    );


  $(
    "detaineeSigns"
  )
    ?.addEventListener(
      "change",
      updateDetaineeSignatureMode
    );


  $(
    "clearReference"
  )
    ?.addEventListener(
      "click",
      () => {

        setValue(
          "referenceStory",
          ""
        );

      }
    );


  $(
    "addAnnex"
  )
    ?.addEventListener(
      "click",
      () => {

        addAnnex();

      }
    );


  $(
    "saveCaptorName"
  )
    ?.addEventListener(
      "click",
      saveCaptor
    );


  $(
    "addCaptor"
  )
    ?.addEventListener(
      "click",
      () => {

        addCaptor();

      }
    );


  $(
    "previewBtn"
  )
    ?.addEventListener(
      "click",
      generatePreview
    );


  $(
    "floatingTools"
  )
    ?.addEventListener(
      "click",
      toggleFloatingMenu
    );


  $(
    "speak"
  )
    ?.addEventListener(
      "click",
      speakAct
    );


  $(
    "pauseVoice"
  )
    ?.addEventListener(
      "click",
      pauseSpeech
    );


  $(
    "resumeVoice"
  )
    ?.addEventListener(
      "click",
      resumeSpeech
    );


  $(
    "stopVoice"
  )
    ?.addEventListener(
      "click",
      stopSpeech
    );


  $(
    "fontFamily"
  )
    ?.addEventListener(
      "change",
      changeFontFamily
    );


  $(
    "fontSize"
  )
    ?.addEventListener(
      "change",
      changeFontSize
    );


  $(
    "selectAllAct"
  )
    ?.addEventListener(
      "click",
      selectAllAct
    );


  $$(
    "[data-format]"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            applyFormat(
              button.dataset.format
            );

          }
        );

      }
    );


  $(
    "uppercaseSelection"
  )
    ?.addEventListener(
      "click",
      uppercaseSelection
    );


  $(
    "resetFormat"
  )
    ?.addEventListener(
      "click",
      resetPreviewFormat
    );


  $(
    "saveDraft"
  )
    ?.addEventListener(
      "click",
      saveDraft
    );


  $(
    "exportWord"
  )
    ?.addEventListener(
      "click",
      exportWord
    );


  $(
    "printAct"
  )
    ?.addEventListener(
      "click",
      printAct
    );

}


/* =========================================================
   INICIO DE LA APLICACIÓN
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    configureNavigation();


    configureButtons();


    activateLiveValidation();


    setDefaultDate();


    renderAgentRegistry();


    renderCaptorRegistry();


    loadDraft(
      false
    );


    updateVictimMode();


    updateObjectsMode();


    updateNoticeMode();


    updateDetaineeSignatureMode();


    applySavedPreviewSettings();

  }
);


/* =========================================================
   FIN DE app.js
   SIGA SV V3 PILOTO
========================================================= */
