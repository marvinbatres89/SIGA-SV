/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: app.js
   VERSIÓN BASE 1.1
   VALIDACIÓN OBLIGATORIA POR FASES
========================================================= */


/* =========================================================
   ESTADO GENERAL
========================================================= */

const state = {
  fact: {},
  agents: [],
  person: {},
  victim: {},
  selectedCrime: null,
  narrative: "",
  evidence: ""
};


/* =========================================================
   BASE LOCAL DE PERSONAS
========================================================= */

function getPeopleDatabase() {

  try {

    const saved =
      localStorage.getItem(
        "siga_sv_people"
      );

    if (!saved) {
      return {};
    }

    return JSON.parse(saved);

  } catch (error) {

    console.error(
      "Error leyendo personas:",
      error
    );

    return {};

  }

}


function savePeopleDatabase(database) {

  try {

    localStorage.setItem(
      "siga_sv_people",
      JSON.stringify(database)
    );

  } catch (error) {

    console.error(
      "Error guardando personas:",
      error
    );

  }

}


/* =========================================================
   CATÁLOGO JURÍDICO DEMOSTRATIVO

   IMPORTANTE:
   El catálogo definitivo se incorporará
   posteriormente con normativa oficial
   vigente y verificada.
========================================================= */

const crimeCatalog = [

  {
    name: "Lesiones",
    article: "142",
    law: "Código Penal de El Salvador",
    description:
      "Registro demostrativo para probar el buscador jurídico."
  },

  {
    name: "Lesiones graves",
    article: "143",
    law: "Código Penal de El Salvador",
    description:
      "Registro demostrativo para probar el buscador jurídico."
  }

];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


function initializeApp() {

  configureNavigation();

  configureButtons();

  configureLiveValidation();

  setDefaultDate();

  loadDraft();

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function configureNavigation() {

  const navigationButtons =
    document.querySelectorAll(
      "[data-target]"
    );


  navigationButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const target =
            button.dataset.target;


          if (target) {

            showScreen(target);

          }

        }
      );

    }
  );

}


function showScreen(id) {

  const screens =
    document.querySelectorAll(
      ".screen"
    );


  screens.forEach(
    screen => {

      screen.classList.toggle(
        "active",
        screen.id === id
      );

    }
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   CONFIGURACIÓN DE BOTONES
========================================================= */

function configureButtons() {

  const newActButton =
    document.getElementById(
      "newActButton"
    );

  const goAgentsButton =
    document.getElementById(
      "goAgentsButton"
    );

  const addAgentButton =
    document.getElementById(
      "addAgentButton"
    );

  const goPersonButton =
    document.getElementById(
      "goPersonButton"
    );

  const searchDuiButton =
    document.getElementById(
      "searchDuiButton"
    );

  const savePersonButton =
    document.getElementById(
      "savePersonButton"
    );

  const goVictimButton =
    document.getElementById(
      "goVictimButton"
    );

  const goCrimeButton =
    document.getElementById(
      "goCrimeButton"
    );

  const searchCrimeButton =
    document.getElementById(
      "searchCrimeButton"
    );

  const goNarrativeButton =
    document.getElementById(
      "goNarrativeButton"
    );

  const goPreviewButton =
    document.getElementById(
      "goPreviewButton"
    );

  const saveDraftButton =
    document.getElementById(
      "saveDraftButton"
    );

  const printButton =
    document.getElementById(
      "printButton"
    );


  if (newActButton) {

    newActButton.addEventListener(
      "click",
      startNewAct
    );

  }


  if (goAgentsButton) {

    goAgentsButton.addEventListener(
      "click",
      validateFactPhase
    );

  }


  if (addAgentButton) {

    addAgentButton.addEventListener(
      "click",
      addAgent
    );

  }


  if (goPersonButton) {

    goPersonButton.addEventListener(
      "click",
      validateAgentsPhase
    );

  }


  if (searchDuiButton) {

    searchDuiButton.addEventListener(
      "click",
      searchPersonByDui
    );

  }


  if (savePersonButton) {

    savePersonButton.addEventListener(
      "click",
      savePerson
    );

  }


  if (goVictimButton) {

    goVictimButton.addEventListener(
      "click",
      validatePersonPhase
    );

  }


  if (goCrimeButton) {

    goCrimeButton.addEventListener(
      "click",
      validateVictimPhase
    );

  }


  if (searchCrimeButton) {

    searchCrimeButton.addEventListener(
      "click",
      searchCrimes
    );

  }


  if (goNarrativeButton) {

    goNarrativeButton.addEventListener(
      "click",
      validateCrimePhase
    );

  }


  if (goPreviewButton) {

    goPreviewButton.addEventListener(
      "click",
      validateNarrativePhase
    );

  }


  if (saveDraftButton) {

    saveDraftButton.addEventListener(
      "click",
      saveDraft
    );

  }


  if (printButton) {

    printButton.addEventListener(
      "click",
      () => {

        window.print();

      }
    );

  }


  configureEnterSearches();

}


/* =========================================================
   VALIDACIÓN EN TIEMPO REAL

   Cuando el usuario comienza a completar
   un campo marcado en rojo, el aviso
   desaparece automáticamente.
========================================================= */

function configureLiveValidation() {

  const fieldIds = [

    "factDate",
    "factTime",
    "factPlace",
    "station",
    "procedureType",

    "agentName",
    "agentRank",
    "agentId",

    "duiSearch",
    "personFirstName",
    "personLastName",
    "personBirthDate",
    "personCivilStatus",
    "personOccupation",
    "personAddress",

    "victimFirstName",
    "victimLastName",
    "victimAddress",
    "victimRelation",

    "narrative"

  ];


  fieldIds.forEach(
    id => {

      const element =
        document.getElementById(id);


      if (!element) {
        return;
      }


      const eventName =
        element.tagName === "SELECT"
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

            clearFieldError(id);

          }

        }
      );

    }
  );

}


/* =========================================================
   BÚSQUEDA CON ENTER
========================================================= */

function configureEnterSearches() {

  const duiInput =
    document.getElementById(
      "duiSearch"
    );

  const crimeInput =
    document.getElementById(
      "crimeSearch"
    );


  if (duiInput) {

    duiInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          searchPersonByDui();

        }

      }
    );

  }


  if (crimeInput) {

    crimeInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          searchCrimes();

        }

      }
    );

  }

}


/* =========================================================
   NUEVA ACTA
========================================================= */

function startNewAct() {

  showScreen(
    "screen-fact"
  );

}


/* =========================================================
   FECHA AUTOMÁTICA
========================================================= */

function setDefaultDate() {

  const dateInput =
    document.getElementById(
      "factDate"
    );


  if (
    dateInput &&
    !dateInput.value
  ) {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    dateInput.value =
      `${year}-${month}-${day}`;

  }

}


/* =========================================================
   UTILIDAD GENERAL DE VALIDACIÓN
========================================================= */

function validateRequiredField(
  id,
  message
) {

  const value =
    getValue(id);


  if (!value) {

    showFieldError(
      id,
      message
    );

    return false;

  }


  clearFieldError(id);

  return true;

}


/* =========================================================
   MOSTRAR ERROR DE CAMPO
========================================================= */

function showFieldError(
  id,
  message
) {

  const field =
    document.getElementById(id);


  const error =
    document.getElementById(
      `error-${id}`
    );


  if (field) {

    field.classList.add(
      "input-error"
    );

  }


  if (error) {

    error.textContent =
      message;

    error.classList.add(
      "visible"
    );

  }

}


/* =========================================================
   QUITAR ERROR DE CAMPO
========================================================= */

function clearFieldError(id) {

  const field =
    document.getElementById(id);


  const error =
    document.getElementById(
      `error-${id}`
    );


  if (field) {

    field.classList.remove(
      "input-error"
    );

  }


  if (error) {

    error.textContent = "";

    error.classList.remove(
      "visible"
    );

  }

}


/* =========================================================
   MOSTRAR ERROR GENERAL DE FASE
========================================================= */

function showPhaseError(id) {

  const element =
    document.getElementById(id);


  if (element) {

    element.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   OCULTAR ERROR GENERAL DE FASE
========================================================= */

function hidePhaseError(id) {

  const element =
    document.getElementById(id);


  if (element) {

    element.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   LLEVAR AL PRIMER CAMPO INCORRECTO
========================================================= */

function focusFirstError() {

  const firstError =
    document.querySelector(
      ".input-error"
    );


  if (!firstError) {
    return;
  }


  firstError.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  setTimeout(
    () => {

      try {

        firstError.focus();

      } catch (error) {

        console.error(error);

      }

    },
    350
  );

}


/* =========================================================
   FASE 1
   VALIDAR DATOS DEL HECHO
========================================================= */

function validateFactPhase() {

  hidePhaseError(
    "factPhaseError"
  );


  const validDate =
    validateRequiredField(
      "factDate",
      "Ingrese la fecha del hecho."
    );


  const validTime =
    validateRequiredField(
      "factTime",
      "Ingrese la hora del hecho."
    );


  const validPlace =
    validateRequiredField(
      "factPlace",
      "Ingrese el lugar del hecho."
    );


  const validStation =
    validateRequiredField(
      "station",
      "Ingrese la dependencia o puesto policial."
    );


  const validProcedure =
    validateRequiredField(
      "procedureType",
      "Seleccione el tipo de procedimiento."
    );


  const valid =
    validDate &&
    validTime &&
    validPlace &&
    validStation &&
    validProcedure;


  if (!valid) {

    showPhaseError(
      "factPhaseError"
    );

    focusFirstError();

    return;

  }


  state.fact = {

    date:
      getValue(
        "factDate"
      ),

    time:
      getValue(
        "factTime"
      ),

    place:
      getValue(
        "factPlace"
      ),

    station:
      getValue(
        "station"
      ),

    procedureType:
      getValue(
        "procedureType"
      ),

    internalReference:
      getValue(
        "internalReference"
      )

  };


  hidePhaseError(
    "factPhaseError"
  );


  showScreen(
    "screen-agents"
  );

}


/* =========================================================
   FASE 2
   AGREGAR AGENTE
========================================================= */

function addAgent() {

  const name =
    getValue(
      "agentName"
    );


  const rank =
    getValue(
      "agentRank"
    );


  const id =
    getValue(
      "agentId"
    );


  const validName =
    validateRequiredField(
      "agentName",
      "Ingrese el nombre completo del agente."
    );


  const validRank =
    validateRequiredField(
      "agentRank",
      "Ingrese el cargo o grado."
    );


  const validId =
    validateRequiredField(
      "agentId",
      "Ingrese el número institucional."
    );


  if (
    !validName ||
    !validRank ||
    !validId
  ) {

    focusFirstError();

    return;

  }


  state.agents.push({

    name,

    rank,

    id

  });


  renderAgents();


  setValue(
    "agentName",
    ""
  );


  setValue(
    "agentRank",
    ""
  );


  setValue(
    "agentId",
    ""
  );


  clearFieldError(
    "agentName"
  );


  clearFieldError(
    "agentRank"
  );


  clearFieldError(
    "agentId"
  );


  hidePhaseError(
    "agentsPhaseError"
  );

}


/* =========================================================
   VALIDAR FASE DE AGENTES
========================================================= */

function validateAgentsPhase() {

  if (
    state.agents.length === 0
  ) {

    showPhaseError(
      "agentsPhaseError"
    );

    return;

  }


  hidePhaseError(
    "agentsPhaseError"
  );


  showScreen(
    "screen-persons"
  );

}


/* =========================================================
   MOSTRAR AGENTES
========================================================= */

function renderAgents() {

  const list =
    document.getElementById(
      "agentsList"
    );


  if (!list) {
    return;
  }


  list.innerHTML = "";


  if (
    state.agents.length === 0
  ) {

    list.innerHTML =
      `
        <div class="empty-state">
          No hay agentes agregados.
        </div>
      `;

    return;

  }


  state.agents.forEach(
    (agent, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "data-card";


      card.innerHTML =
        `
          <strong>
            ${escapeHtml(agent.name)}
          </strong>

          <small>

            ${escapeHtml(agent.rank)}

            <br>

            ${escapeHtml(agent.id)}

          </small>

          <div
            style="
              margin-top:10px;
            "
          >

            <button
              type="button"
              class="text-button"
              data-remove-agent="${index}"
            >
              Eliminar
            </button>

          </div>
        `;


      list.appendChild(
        card
      );

    }
  );


  const removeButtons =
    list.querySelectorAll(
      "[data-remove-agent]"
    );


  removeButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.removeAgent
            );


          state.agents.splice(
            index,
            1
          );


          renderAgents();

        }
      );

    }
  );

}


/* =========================================================
   DUI
========================================================= */

function normalizeDui(value) {

  return String(
    value || ""
  )
    .trim()
    .replace(
      /[^0-9]/g,
      ""
    );

}


function formatDui(value) {

  const digits =
    normalizeDui(value);


  if (
    digits.length !== 9
  ) {

    return value;

  }


  return (
    digits.slice(
      0,
      8
    )
    +
    "-"
    +
    digits.slice(
      8
    )
  );

}


/* =========================================================
   BUSCAR PERSONA POR DUI
========================================================= */

function searchPersonByDui() {

  const duiInput =
    getValue(
      "duiSearch"
    );


  const dui =
    normalizeDui(
      duiInput
    );


  const status =
    document.getElementById(
      "duiStatus"
    );


  if (!dui) {

    showFieldError(
      "duiSearch",
      "Ingrese el DUI."
    );

    return;

  }


  if (
    dui.length !== 9
  ) {

    showFieldError(
      "duiSearch",
      "El DUI debe contener 9 dígitos."
    );

    return;

  }


  clearFieldError(
    "duiSearch"
  );


  setValue(
    "duiSearch",
    formatDui(dui)
  );


  const database =
    getPeopleDatabase();


  const person =
    database[dui];


  if (status) {

    status.classList.remove(
      "hidden"
    );

  }


  if (!person) {

    clearPersonFields();


    if (status) {

      status.textContent =
        "DUI no registrado. Complete los datos para registrar la persona.";

    }


    return;

  }


  setValue(
    "personFirstName",
    person.firstName || ""
  );


  setValue(
    "personLastName",
    person.lastName || ""
  );


  setValue(
    "personBirthDate",
    person.birthDate || ""
  );


  setValue(
    "personCivilStatus",
    person.civilStatus || ""
  );


  setValue(
    "personOccupation",
    person.occupation || ""
  );


  setValue(
    "personAddress",
    person.address || ""
  );


  clearFieldError(
    "personFirstName"
  );


  clearFieldError(
    "personLastName"
  );


  clearFieldError(
    "personBirthDate"
  );


  clearFieldError(
    "personCivilStatus"
  );


  clearFieldError(
    "personOccupation"
  );


  clearFieldError(
    "personAddress"
  );


  if (status) {

    status.textContent =
      "Persona encontrada. Datos cargados automáticamente.";

  }

}


/* =========================================================
   LIMPIAR PERSONA
========================================================= */

function clearPersonFields() {

  setValue(
    "personFirstName",
    ""
  );


  setValue(
    "personLastName",
    ""
  );


  setValue(
    "personBirthDate",
    ""
  );


  setValue(
    "personCivilStatus",
    ""
  );


  setValue(
    "personOccupation",
    ""
  );


  setValue(
    "personAddress",
    ""
  );

}


/* =========================================================
   CAPTURAR PERSONA
========================================================= */

function capturePerson() {

  state.person = {

    dui:
      formatDui(
        getValue(
          "duiSearch"
        )
      ),

    firstName:
      getValue(
        "personFirstName"
      ),

    lastName:
      getValue(
        "personLastName"
      ),

    birthDate:
      getValue(
        "personBirthDate"
      ),

    civilStatus:
      getValue(
        "personCivilStatus"
      ),

    occupation:
      getValue(
        "personOccupation"
      ),

    address:
      getValue(
        "personAddress"
      )

  };


  return state.person;

}


/* =========================================================
   VALIDAR PERSONA APREHENDIDA
========================================================= */

function validatePersonPhase() {

  hidePhaseError(
    "personPhaseError"
  );


  const dui =
    normalizeDui(
      getValue(
        "duiSearch"
      )
    );


  let validDui = true;


  if (
    dui.length !== 9
  ) {

    showFieldError(
      "duiSearch",
      "Ingrese un DUI válido de 9 dígitos."
    );

    validDui = false;

  } else {

    clearFieldError(
      "duiSearch"
    );

    setValue(
      "duiSearch",
      formatDui(dui)
    );

  }


  const validFirstName =
    validateRequiredField(
      "personFirstName",
      "Ingrese los nombres."
    );


  const validLastName =
    validateRequiredField(
      "personLastName",
      "Ingrese los apellidos."
    );


  const validBirthDate =
    validateRequiredField(
      "personBirthDate",
      "Ingrese la fecha de nacimiento."
    );


  const validCivilStatus =
    validateRequiredField(
      "personCivilStatus",
      "Ingrese el estado civil."
    );


  const validOccupation =
    validateRequiredField(
      "personOccupation",
      "Ingrese la profesión u oficio."
    );


  const validAddress =
    validateRequiredField(
      "personAddress",
      "Ingrese el domicilio."
    );


  const valid =
    validDui &&
    validFirstName &&
    validLastName &&
    validBirthDate &&
    validCivilStatus &&
    validOccupation &&
    validAddress;


  if (!valid) {

    showPhaseError(
      "personPhaseError"
    );

    focusFirstError();

    return;

  }


  capturePerson();


  hidePhaseError(
    "personPhaseError"
  );


  showScreen(
    "screen-victim"
  );

}


/* =========================================================
   GUARDAR PERSONA
========================================================= */

function savePerson() {

  const dui =
    normalizeDui(
      getValue(
        "duiSearch"
      )
    );


  if (
    dui.length !== 9
  ) {

    showFieldError(
      "duiSearch",
      "Ingrese un DUI válido de 9 dígitos."
    );

    focusFirstError();

    return;

  }


  const validFirstName =
    validateRequiredField(
      "personFirstName",
      "Ingrese los nombres."
    );


  const validLastName =
    validateRequiredField(
      "personLastName",
      "Ingrese los apellidos."
    );


  const validBirthDate =
    validateRequiredField(
      "personBirthDate",
      "Ingrese la fecha de nacimiento."
    );


  const validCivilStatus =
    validateRequiredField(
      "personCivilStatus",
      "Ingrese el estado civil."
    );


  const validOccupation =
    validateRequiredField(
      "personOccupation",
      "Ingrese la profesión u oficio."
    );


  const validAddress =
    validateRequiredField(
      "personAddress",
      "Ingrese el domicilio."
    );


  if (
    !validFirstName ||
    !validLastName ||
    !validBirthDate ||
    !validCivilStatus ||
    !validOccupation ||
    !validAddress
  ) {

    focusFirstError();

    return;

  }


  const person =
    capturePerson();


  const database =
    getPeopleDatabase();


  database[dui] = {

    firstName:
      person.firstName,

    lastName:
      person.lastName,

    birthDate:
      person.birthDate,

    civilStatus:
      person.civilStatus,

    occupation:
      person.occupation,

    address:
      person.address

  };


  savePeopleDatabase(
    database
  );


  const status =
    document.getElementById(
      "duiStatus"
    );


  if (status) {

    status.classList.remove(
      "hidden"
    );


    status.textContent =
      "Persona guardada correctamente en este dispositivo.";

  }


  alert(
    "Persona guardada correctamente."
  );

}


/* =========================================================
   FASE 4
   VALIDAR VÍCTIMA
========================================================= */

function validateVictimPhase() {

  hidePhaseError(
    "victimPhaseError"
  );


  const validFirstName =
    validateRequiredField(
      "victimFirstName",
      "Ingrese los nombres de la víctima."
    );


  const validLastName =
    validateRequiredField(
      "victimLastName",
      "Ingrese los apellidos de la víctima."
    );


  const validAddress =
    validateRequiredField(
      "victimAddress",
      "Ingrese el domicilio de la víctima."
    );


  const validRelation =
    validateRequiredField(
      "victimRelation",
      "Seleccione la relación con el hecho."
    );


  const valid =
    validFirstName &&
    validLastName &&
    validAddress &&
    validRelation;


  if (!valid) {

    showPhaseError(
      "victimPhaseError"
    );

    focusFirstError();

    return;

  }


  const victimDui =
    getValue(
      "victimDui"
    );


  if (victimDui) {

    const normalized =
      normalizeDui(
        victimDui
      );


    if (
      normalized.length !== 9
    ) {

      alert(
        "Revise el DUI de la víctima o déjelo vacío si no está disponible."
      );

      return;

    }


    setValue(
      "victimDui",
      formatDui(normalized)
    );

  }


  state.victim = {

    dui:
      formatDui(
        getValue(
          "victimDui"
        )
      ),

    firstName:
      getValue(
        "victimFirstName"
      ),

    lastName:
      getValue(
        "victimLastName"
      ),

    address:
      getValue(
        "victimAddress"
      ),

    relation:
      getValue(
        "victimRelation"
      )

  };


  hidePhaseError(
    "victimPhaseError"
  );


  showScreen(
    "screen-crimes"
  );

}


/* =========================================================
   BUSCADOR DE DELITOS
========================================================= */

function searchCrimes() {

  const term =
    getValue(
      "crimeSearch"
    )
      .toLowerCase();


  const resultsBox =
    document.getElementById(
      "crimeResults"
    );


  if (!resultsBox) {
    return;
  }


  resultsBox.innerHTML = "";


  if (!term) {

    alert(
      "Escriba el nombre, artículo o ley que desea buscar."
    );

    return;

  }


  const results =
    crimeCatalog.filter(
      item => {

        return (

          item.name
            .toLowerCase()
            .includes(term)

          ||

          item.article
            .toLowerCase()
            .includes(term)

          ||

          item.law
            .toLowerCase()
            .includes(term)

        );

      }
    );


  if (
    results.length === 0
  ) {

    resultsBox.innerHTML =
      `
        <div class="empty-state">

          No se encontraron
          coincidencias en el
          catálogo actual.

        </div>
      `;

    return;

  }


  results.forEach(
    crime => {

      const card =
        document.createElement(
          "button"
        );


      card.type =
        "button";


      card.className =
        "data-card";


      card.style.textAlign =
        "left";


      card.innerHTML =
        `
          <strong>
            ${escapeHtml(crime.name)}
          </strong>

          <small>

            Artículo
            ${escapeHtml(crime.article)}

            <br>

            ${escapeHtml(crime.law)}

          </small>

          <div
            style="
              margin-top:7px;
              font-size:12px;
              color:#687386;
              line-height:1.4;
            "
          >

            ${escapeHtml(
              crime.description
            )}

          </div>
        `;


      card.addEventListener(
        "click",
        () => {

          selectCrime(
            crime
          );

        }
      );


      resultsBox.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   SELECCIONAR DELITO
========================================================= */

function selectCrime(crime) {

  state.selectedCrime =
    crime;


  hidePhaseError(
    "crimePhaseError"
  );


  const box =
    document.getElementById(
      "selectedCrime"
    );


  if (!box) {
    return;
  }


  box.classList.remove(
    "hidden"
  );


  box.innerHTML =
    `
      <strong>
        Delito seleccionado
      </strong>

      <br><br>

      ${escapeHtml(crime.name)}

      <br>

      Artículo
      ${escapeHtml(crime.article)}

      <br>

      ${escapeHtml(crime.law)}
    `;

}


/* =========================================================
   FASE 5
   VALIDAR DELITO
========================================================= */

function validateCrimePhase() {

  if (
    !state.selectedCrime
  ) {

    showPhaseError(
      "crimePhaseError"
    );

    return;

  }


  hidePhaseError(
    "crimePhaseError"
  );


  showScreen(
    "screen-narrative"
  );

}


/* =========================================================
   FASE 6
   VALIDAR RELATO
========================================================= */

function validateNarrativePhase() {

  hidePhaseError(
    "narrativePhaseError"
  );


  const validNarrative =
    validateRequiredField(
      "narrative",
      "Ingrese el relato de los hechos."
    );


  if (!validNarrative) {

    showPhaseError(
      "narrativePhaseError"
    );

    focusFirstError();

    return;

  }


  state.narrative =
    getValue(
      "narrative"
    );


  state.evidence =
    getValue(
      "evidence"
    );


  hidePhaseError(
    "narrativePhaseError"
  );


  renderPreview();


  showScreen(
    "screen-preview"
  );

}


/* =========================================================
   CREAR VISTA PREVIA
========================================================= */

function renderPreview() {

  const preview =
    document.getElementById(
      "documentPreview"
    );


  if (!preview) {
    return;
  }


  const agents =
    state.agents.length
      ?
      state.agents
        .map(
          agent => {

            return (
              escapeHtml(
                agent.name
              )
              +
              ", "
              +
              escapeHtml(
                agent.rank
              )
              +
              ", "
              +
              escapeHtml(
                agent.id
              )
            );

          }
        )
        .join("; ")

      :

      "No especificados";


  const personName =
    [
      state.person.firstName,
      state.person.lastName
    ]
      .filter(Boolean)
      .join(" ");


  const victimName =
    [
      state.victim.firstName,
      state.victim.lastName
    ]
      .filter(Boolean)
      .join(" ");


  let crimeText =
    "No seleccionado";


  if (
    state.selectedCrime
  ) {

    crimeText =
      `
        ${escapeHtml(
          state.selectedCrime.name
        )},

        artículo

        ${escapeHtml(
          state.selectedCrime.article
        )}

        de

        ${escapeHtml(
          state.selectedCrime.law
        )}
      `;

  }


  preview.innerHTML =
    `
      <h3>
        ACTA POLICIAL
      </h3>


      <p>

        <strong>
          Fecha:
        </strong>

        ${escapeHtml(
          state.fact.date || ""
        )}

        &nbsp;&nbsp;

        <strong>
          Hora:
        </strong>

        ${escapeHtml(
          state.fact.time || ""
        )}

      </p>


      <p>

        <strong>
          Lugar:
        </strong>

        ${escapeHtml(
          state.fact.place || ""
        )}

      </p>


      <p>

        <strong>
          Dependencia:
        </strong>

        ${escapeHtml(
          state.fact.station || ""
        )}

      </p>


      <p>

        <strong>
          Tipo de procedimiento:
        </strong>

        ${escapeHtml(
          state.fact.procedureType || ""
        )}

      </p>


      <p>

        <strong>
          Agentes intervinientes:
        </strong>

        ${agents}

      </p>


      <p>

        <strong>
          Persona aprehendida:
        </strong>

        ${escapeHtml(
          personName
        )}

        ${
          state.person.dui
            ?
            `, DUI ${escapeHtml(
              state.person.dui
            )}`
            :
            ""
        }

      </p>


      <p>

        <strong>
          Víctima:
        </strong>

        ${escapeHtml(
          victimName
        )}

        ${
          state.victim.dui
            ?
            `, DUI ${escapeHtml(
              state.victim.dui
            )}`
            :
            ""
        }

      </p>


      <p>

        <strong>
          Delito / base legal:
        </strong>

        ${crimeText}

      </p>


      <p>

        <strong>
          RELATO DE LOS HECHOS
        </strong>

      </p>


      <p>

        ${formatParagraph(
          state.narrative
        )}

      </p>


      <p>

        <strong>
          Objetos / evidencias:
        </strong>

        <br>

        ${formatParagraph(
          state.evidence ||
          "No se registraron objetos o evidencias."
        )}

      </p>
    `;

}


/* =========================================================
   GUARDAR BORRADOR
========================================================= */

function saveDraft() {

  state.narrative =
    getValue(
      "narrative"
    );


  state.evidence =
    getValue(
      "evidence"
    );


  capturePerson();


  const draft = {

    fact:
      state.fact,

    agents:
      state.agents,

    person:
      state.person,

    victim:
      state.victim,

    selectedCrime:
      state.selectedCrime,

    narrative:
      state.narrative,

    evidence:
      state.evidence,

    savedAt:
      new Date()
        .toISOString()

  };


  try {

    localStorage.setItem(
      "siga_sv_draft",
      JSON.stringify(draft)
    );


    alert(
      "Borrador guardado correctamente en este dispositivo."
    );

  } catch (error) {

    console.error(
      error
    );


    alert(
      "No fue posible guardar el borrador."
    );

  }

}


/* =========================================================
   RECUPERAR BORRADOR
========================================================= */

function loadDraft() {

  try {

    const saved =
      localStorage.getItem(
        "siga_sv_draft"
      );


    if (!saved) {

      renderAgents();

      return;

    }


    const draft =
      JSON.parse(saved);


    state.fact =
      draft.fact || {};


    state.agents =
      Array.isArray(
        draft.agents
      )
        ?
        draft.agents
        :
        [];


    state.person =
      draft.person || {};


    state.victim =
      draft.victim || {};


    state.selectedCrime =
      draft.selectedCrime || null;


    state.narrative =
      draft.narrative || "";


    state.evidence =
      draft.evidence || "";


    restoreDraftFields();

    renderAgents();

    renderRecentDraft();

  } catch (error) {

    console.error(
      "Error recuperando borrador:",
      error
    );


    renderAgents();

  }

}


/* =========================================================
   RESTAURAR BORRADOR
========================================================= */

function restoreDraftFields() {

  setValue(
    "factDate",
    state.fact.date || ""
  );


  setValue(
    "factTime",
    state.fact.time || ""
  );


  setValue(
    "factPlace",
    state.fact.place || ""
  );


  setValue(
    "station",
    state.fact.station || ""
  );


  setValue(
    "procedureType",
    state.fact.procedureType || ""
  );


  setValue(
    "internalReference",
    state.fact.internalReference || ""
  );


  setValue(
    "duiSearch",
    state.person.dui || ""
  );


  setValue(
    "personFirstName",
    state.person.firstName || ""
  );


  setValue(
    "personLastName",
    state.person.lastName || ""
  );


  setValue(
    "personBirthDate",
    state.person.birthDate || ""
  );


  setValue(
    "personCivilStatus",
    state.person.civilStatus || ""
  );


  setValue(
    "personOccupation",
    state.person.occupation || ""
  );


  setValue(
    "personAddress",
    state.person.address || ""
  );


  setValue(
    "victimDui",
    state.victim.dui || ""
  );


  setValue(
    "victimFirstName",
    state.victim.firstName || ""
  );


  setValue(
    "victimLastName",
    state.victim.lastName || ""
  );


  setValue(
    "victimAddress",
    state.victim.address || ""
  );


  setValue(
    "victimRelation",
    state.victim.relation || ""
  );


  setValue(
    "narrative",
    state.narrative || ""
  );


  setValue(
    "evidence",
    state.evidence || ""
  );


  if (
    state.selectedCrime
  ) {

    selectCrime(
      state.selectedCrime
    );

  }

}


/* =========================================================
   MOSTRAR BORRADOR EN INICIO
========================================================= */

function renderRecentDraft() {

  const recentActs =
    document.getElementById(
      "recentActs"
    );


  if (!recentActs) {
    return;
  }


  const personName =
    [
      state.person.firstName,
      state.person.lastName
    ]
      .filter(Boolean)
      .join(" ");


  recentActs.innerHTML =
    `
      <div
        class="data-card"
        style="
          text-align:left;
        "
      >

        <strong>
          Borrador guardado
        </strong>

        <small>

          ${
            escapeHtml(
              state.fact.date ||
              "Sin fecha"
            )
          }

          <br>

          ${
            escapeHtml(
              personName ||
              "Persona no especificada"
            )
          }

        </small>

      </div>
    `;

}


/* =========================================================
   UTILIDADES
========================================================= */

function getValue(id) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return "";
  }


  return String(
    element.value || ""
  ).trim();

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.value =
    value || "";

}


/* =========================================================
   SEGURIDAD BÁSICA PARA TEXTO HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
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
   CONSERVAR SALTOS DE LÍNEA
========================================================= */

function formatParagraph(value) {

  return escapeHtml(
    value
  ).replaceAll(
    "\n",
    "<br>"
  );

}


/* =========================================================
   FIN DE app.js
   SIGA SV - BASE 1.1
========================================================= */
