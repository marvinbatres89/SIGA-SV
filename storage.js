/* =========================================================
   SIGA SV
   Sistema Inteligente de Gestión de Actas
   ARCHIVO: storage.js
   VERSIÓN: V3 PILOTO
========================================================= */

window.SIGA_STORAGE = (() => {

  /* =======================================================
     NOMBRES INTERNOS DE ALMACENAMIENTO
  ======================================================= */

  const KEYS = {

    agents:
      "siga_sv_v3_agents",

    captors:
      "siga_sv_v3_captors",

    draft:
      "siga_sv_v3_draft",

    settings:
      "siga_sv_v3_settings"

  };


  /* =======================================================
     LEER INFORMACIÓN
  ======================================================= */

  function read(key, defaultValue) {

    try {

      const raw =
        localStorage.getItem(key);


      if (
        raw === null
        ||
        raw === undefined
      ) {

        return defaultValue;

      }


      const parsed =
        JSON.parse(raw);


      return (
        parsed ??
        defaultValue
      );

    }

    catch (error) {

      console.warn(
        "SIGA SV: no fue posible leer almacenamiento:",
        key,
        error
      );


      return defaultValue;

    }

  }


  /* =======================================================
     GUARDAR INFORMACIÓN
  ======================================================= */

  function write(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );


      return true;

    }

    catch (error) {

      console.error(
        "SIGA SV: no fue posible guardar:",
        key,
        error
      );


      return false;

    }

  }


  /* =======================================================
     ELIMINAR INFORMACIÓN
  ======================================================= */

  function remove(key) {

    try {

      localStorage.removeItem(key);

      return true;

    }

    catch (error) {

      console.error(
        "SIGA SV: no fue posible eliminar:",
        key,
        error
      );


      return false;

    }

  }


  /* =======================================================
     AGENTES GUARDADOS
  ======================================================= */

  function getAgents() {

    const agents =
      read(
        KEYS.agents,
        []
      );


    return Array.isArray(agents)
      ?
      agents
      :
      [];

  }


  function setAgents(agents) {

    if (
      !Array.isArray(agents)
    ) {

      return false;

    }


    return write(
      KEYS.agents,
      agents
    );

  }


  /* =======================================================
     CAPTORES GUARDADOS
  ======================================================= */

  function getCaptors() {

    const captors =
      read(
        KEYS.captors,
        []
      );


    return Array.isArray(captors)
      ?
      captors
      :
      [];

  }


  function setCaptors(captors) {

    if (
      !Array.isArray(captors)
    ) {

      return false;

    }


    return write(
      KEYS.captors,
      captors
    );

  }


  /* =======================================================
     BORRADOR DEL ACTA

     IMPORTANTE:
     El relato utilizado solamente como referencia
     se puede mantener dentro del borrador para comodidad
     del usuario, pero NUNCA debe mezclarse con los datos
     utilizados para generar el acta.
  ======================================================= */

  function getDraft() {

    return read(
      KEYS.draft,
      null
    );

  }


  function setDraft(draft) {

    if (
      !draft
      ||
      typeof draft !== "object"
    ) {

      return false;

    }


    const data = {

      ...draft,

      savedAt:
        new Date()
          .toISOString()

    };


    return write(
      KEYS.draft,
      data
    );

  }


  function deleteDraft() {

    return remove(
      KEYS.draft
    );

  }


  function hasDraft() {

    return (
      getDraft()
      !==
      null
    );

  }


  /* =======================================================
     CONFIGURACIÓN DE VISTA PREVIA
  ======================================================= */

  function getSettings() {

    return read(
      KEYS.settings,
      {

        fontFamily:
          "Arial",

        fontSize:
          "11",

        voiceEnabled:
          true,

        voiceRate:
          0.95

      }
    );

  }


  function setSettings(settings) {

    if (
      !settings
      ||
      typeof settings !== "object"
    ) {

      return false;

    }


    return write(
      KEYS.settings,
      settings
    );

  }


  /* =======================================================
     LIMPIAR SOLAMENTE EL BORRADOR

     No elimina agentes ni captores.
  ======================================================= */

  function clearCurrentAct() {

    return deleteDraft();

  }


  /* =======================================================
     LIMPIEZA TOTAL

     Esta función queda disponible para una futura opción
     de mantenimiento.

     NO se ejecuta automáticamente.
  ======================================================= */

  function clearAll() {

    const draftDeleted =
      remove(
        KEYS.draft
      );


    const agentsDeleted =
      remove(
        KEYS.agents
      );


    const captorsDeleted =
      remove(
        KEYS.captors
      );


    const settingsDeleted =
      remove(
        KEYS.settings
      );


    return (
      draftDeleted
      &&
      agentsDeleted
      &&
      captorsDeleted
      &&
      settingsDeleted
    );

  }


  /* =======================================================
     INFORMACIÓN DE ALMACENAMIENTO

     Útil posteriormente para diagnósticos.
  ======================================================= */

  function getStorageInfo() {

    return {

      agents:
        getAgents().length,

      captors:
        getCaptors().length,

      hasDraft:
        hasDraft(),

      settings:
        getSettings()

    };

  }


  /* =======================================================
     EXPORTAR FUNCIONES
  ======================================================= */

  return {

    getAgents,

    setAgents,

    getCaptors,

    setCaptors,

    getDraft,

    setDraft,

    deleteDraft,

    hasDraft,

    getSettings,

    setSettings,

    clearCurrentAct,

    clearAll,

    getStorageInfo

  };

})();


/* =========================================================
   FIN DE storage.js
   SIGA SV V3 PILOTO
========================================================= */
