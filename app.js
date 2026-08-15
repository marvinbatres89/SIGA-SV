/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: app.js
   VERSIÓN BASE 1
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
    const saved = localStorage.getItem("siga_sv_people");

    if (!saved) {
      return {};
    }

    return JSON.parse(saved);

  } catch (error) {
    console.error("Error leyendo personas:", error);
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
    console.error("Error guardando personas:", error);
  }
}


/* =========================================================
   CATÁLOGO JURÍDICO DEMOSTRATIVO

   IMPORTANTE:
   Estos registros son únicamente para probar
   el funcionamiento de esta Base 1.

   Posteriormente se sustituirán por normativa
   oficial vigente y verificada.
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
  setDefaultDate();
  loadDraft();
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function configureNavigation() {
  const navigationButtons =
    document.querySelectorAll("[data-target]");

  navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;

      if (target) {
        showScreen(target);
      }
    });
  });
}


function showScreen(id) {
  const screens =
    document.querySelectorAll(".screen");

  screens.forEach(screen => {
    screen.classList.toggle(
      "active",
      screen.id === id
    );
  });

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
    document.getElementById("newActButton");

  const goAgentsButton =
    document.getElementById("goAgentsButton");

  const addAgentButton =
    document.getElementById("addAgentButton");

  const goPersonButton =
    document.getElementById("goPersonButton");

  const searchDuiButton =
    document.getElementById("searchDuiButton");

  const savePersonButton =
    document.getElementById("savePersonButton");

  const goVictimButton =
    document.getElementById("goVictimButton");

  const goCrimeButton =
    document.getElementById("goCrimeButton");

  const searchCrimeButton =
    document.getElementById("searchCrimeButton");

  const goNarrativeButton =
    document.getElementById("goNarrativeButton");

  const goPreviewButton =
    document.getElementById("goPreviewButton");

  const saveDraftButton =
    document.getElementById("saveDraftButton");

  const printButton =
    document.getElementById("printButton");


  if (newActButton) {
    newActButton.addEventListener(
      "click",
      startNewAct
    );
  }


  if (goAgentsButton) {
    goAgentsButton.addEventListener(
      "click",
      saveFactAndContinue
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
      () => {
        showScreen("screen-persons");
      }
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
      () => {
        capturePerson();
        showScreen("screen-victim");
      }
    );
  }


  if (goCrimeButton) {
    goCrimeButton.addEventListener(
      "click",
      saveVictimAndContinue
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
      () => {
        showScreen("screen-narrative");
      }
    );
  }


  if (goPreviewButton) {
    goPreviewButton.addEventListener(
      "click",
      preparePreview
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
   BÚSQUEDA CON ENTER
========================================================= */

function configureEnterSearches() {
  const duiInput =
    document.getElementById("duiSearch");

  const crimeInput =
    document.getElementById("crimeSearch");


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
  showScreen("screen-fact");
}


/* =========================================================
   FECHA AUTOMÁTICA
========================================================= */

function setDefaultDate() {
  const dateInput =
    document.getElementById("factDate");

  if (dateInput && !dateInput.value) {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    dateInput.value =
      `${year}-${month}-${day}`;
  }
}


/* =========================================================
   DATOS DEL HECHO
========================================================= */

function saveFactAndContinue() {
  const date =
    getValue("factDate");

  const time =
    getValue("factTime");

  const place =
    getValue("factPlace");

  const station =
    getValue("station");

  const procedureType =
    getValue("procedureType");

  const internalReference =
    getValue("internalReference");


  if (!date) {
    alert(
      "Ingrese la fecha del hecho."
    );
    return;
  }


  state.fact = {
    date,
    time,
    place,
    station,
    procedureType,
    internalReference
  };


  showScreen("screen-agents");
}


/* =========================================================
   AGENTES
========================================================= */

function addAgent() {
  const name =
    getValue("agentName");

  const rank =
    getValue("agentRank");

  const id =
    getValue("agentId");


  if (!name) {
    alert(
      "Ingrese el nombre del agente."
    );
    return;
  }


  state.agents.push({
    name,
    rank,
    id
  });


  renderAgents();


  setValue("agentName", "");
  setValue("agentRank", "");
  setValue("agentId", "");
}


/* =========================================================
   MOSTRAR AGENTES
========================================================= */

function renderAgents() {
  const list =
    document.getElementById("agentsList");

  if (!list) {
    return;
  }


  list.innerHTML = "";


  if (state.agents.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        No hay agentes agregados.
      </div>
    `;

    return;
  }


  state.agents.forEach(
    (agent, index) => {

      const card =
        document.createElement("div");

      card.className =
        "data-card";

      card.innerHTML = `
        <strong>
          ${escapeHtml(agent.name)}
        </strong>

        <small>
          ${
            escapeHtml(
              agent.rank ||
              "Sin cargo o grado"
            )
          }

          <br>

          ${
            escapeHtml(
              agent.id ||
              "Sin número institucional"
            )
          }
        </small>

        <div style="margin-top:10px;">

          <button
            type="button"
            class="text-button"
            data-remove-agent="${index}"
          >
            Eliminar
          </button>

        </div>
      `;

      list.appendChild(card);
    }
  );


  const removeButtons =
    list.querySelectorAll(
      "[data-remove-agent]"
    );


  removeButtons.forEach(button => {
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
  });
}


/* =========================================================
   NORMALIZAR DUI
========================================================= */

function normalizeDui(value) {
  return String(value || "")
    .trim()
    .replace(/[^0-9]/g, "");
}


/* =========================================================
   FORMATO DE DUI
========================================================= */

function formatDui(value) {
  const digits =
    normalizeDui(value);

  if (digits.length !== 9) {
    return value;
  }

  return (
    digits.slice(0, 8)
    +
    "-"
    +
    digits.slice(8)
  );
}


/* =========================================================
   BUSCAR PERSONA POR DUI
========================================================= */

function searchPersonByDui() {
  const duiInput =
    getValue("duiSearch");

  const dui =
    normalizeDui(duiInput);

  const status =
    document.getElementById(
      "duiStatus"
    );


  if (!dui) {
    alert(
      "Ingrese un DUI para buscar."
    );
    return;
  }


  if (dui.length !== 9) {
    alert(
      "Revise el DUI ingresado."
    );
    return;
  }


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
        "DUI no registrado. Puede ingresar los datos y guardarlos.";
    }

    setValue(
      "duiSearch",
      formatDui(dui)
    );

    return;
  }


  setValue(
    "duiSearch",
    formatDui(dui)
  );

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


  if (status) {
    status.textContent =
      "Persona encontrada. Datos cargados automáticamente.";
  }
}


/* =========================================================
   LIMPIAR CAMPOS DE PERSONA
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
        getValue("duiSearch")
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
   GUARDAR PERSONA
========================================================= */

function savePerson() {
  const person =
    capturePerson();

  const dui =
    normalizeDui(
      person.dui
    );


  if (dui.length !== 9) {
    alert(
      "Ingrese un DUI válido antes de guardar la persona."
    );
    return;
  }


  if (
    !person.firstName ||
    !person.lastName
  ) {
    alert(
      "Ingrese nombres y apellidos."
    );
    return;
  }


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


  savePeopleDatabase(database);


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
   VÍCTIMA
========================================================= */

function saveVictimAndContinue() {
  state.victim = {
    dui:
      formatDui(
        getValue("victimDui")
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


  showScreen("screen-crimes");
}


/* =========================================================
   BUSCADOR DE DELITOS
========================================================= */

function searchCrimes() {
  const term =
    getValue("crimeSearch")
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
    crimeCatalog.filter(item => {
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
    });


  if (results.length === 0) {
    resultsBox.innerHTML = `
      <div class="empty-state">
        No se encontraron coincidencias
        en el catálogo actual.
      </div>
    `;

    return;
  }


  results.forEach(crime => {
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

    card.innerHTML = `
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
        selectCrime(crime);
      }
    );


    resultsBox.appendChild(
      card
    );
  });
}


/* =========================================================
   SELECCIONAR DELITO
========================================================= */

function selectCrime(crime) {
  state.selectedCrime =
    crime;

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


  box.innerHTML = `
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
   PREPARAR VISTA PREVIA
========================================================= */

function preparePreview() {
  capturePerson();

  state.narrative =
    getValue("narrative");

  state.evidence =
    getValue("evidence");

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
        .map(agent => {
          let text =
            escapeHtml(
              agent.name
            );

          if (agent.rank) {
            text +=
              ", "
              +
              escapeHtml(
                agent.rank
              );
          }

          if (agent.id) {
            text +=
              ", "
              +
              escapeHtml(
                agent.id
              );
          }

          return text;
        })
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


  if (state.selectedCrime) {
    crimeText = `
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


  preview.innerHTML = `
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
        state.fact.place ||
        "No especificado"
      )}
    </p>


    <p>
      <strong>
        Dependencia:
      </strong>

      ${escapeHtml(
        state.fact.station ||
        "No especificada"
      )}
    </p>


    <p>
      <strong>
        Tipo de procedimiento:
      </strong>

      ${escapeHtml(
        state.fact.procedureType ||
        "No especificado"
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
        personName ||
        "No especificada"
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
        victimName ||
        "No especificada"
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
        state.narrative ||
        "Sin relato ingresado."
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
  capturePerson();

  state.narrative =
    getValue("narrative");

  state.evidence =
    getValue("evidence");


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
      new Date().toISOString()
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
    console.error(error);

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
   RESTAURAR CAMPOS DEL BORRADOR
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


  if (state.selectedCrime) {
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


  recentActs.innerHTML = `
    <div
      class="data-card"
      style="text-align:left;"
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
    document.getElementById(id);

  if (!element) {
    return "";
  }

  return String(
    element.value || ""
  ).trim();
}


function setValue(id, value) {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.value =
    value || "";
}


/* =========================================================
   SEGURIDAD BÁSICA PARA TEXTO MOSTRADO EN HTML
========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
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
   CONSERVAR SALTOS DE LÍNEA DEL RELATO
========================================================= */

function formatParagraph(value) {
  return escapeHtml(value)
    .replaceAll(
      "\n",
      "<br>"
    );
}


/* =========================================================
   FIN DE app.js
   SIGA SV - BASE 1
========================================================= */
