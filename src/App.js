import React, { useState } from "react";

const pestOptions = [
  "Silberfische", "Kellerasseln", "Schaben", "Ameisen", "Wespen",
  "Bienen", "Hornissen", "Mäuse", "Ratten", "Marder",
];

const beeNotice =
  "Hinweis: Bei Bienen ist eventuell ein Imker zu Rate zu ziehen.";
const hornetNotice = `Hinweis: Für die Bekämpfung von Hornissen muss eine Genehmigung der Oberen Naturschutzbehörde vorliegen bzw. eingeholt werden.

Ansprechpartner:
- Arne Drews, 04347-704360, arne.drews@lfu.landsh.de
- Jörn Krütgen, 04347-704320, joern.kruetgen@lfu.landsh.de
`;
const martenNotice = `Hinweis: Bei aktiver Bekämpfung von Mardern muss ein Jäger hinzugezogen werden.

Kreisjägerschaft Nordfriesland e.V.
- im Naturzentrum Mittleres Nordfriesland -

Ansprechpartner: Herr Klang

Bahnhofstraße 23, 25821 Bredstedt
Tel.: 04671 / 4555
Telefax: 04671 / 933516
E-Mail: geschaeftsstelle@kjs-nf.de
`;

const defaultCustomer = {
  salutation: "",
  firstName: "",
  lastName: "",
  customerNumber: "",
  street: "",
  houseNumber: "",
  zip: "",
  city: "",
  phone: "",
  mobile: "",
  email: "",
};
const defaultInvoiceRecipient = {
  firstName: "",
  lastName: "",
  street: "",
  houseNumber: "",
  zip: "",
  city: "",
  phone: "",
  mobile: "",
  email: "",
};

const defaultFAQs = [
  {
    question: "Was tun bei Hornissen?",
    answer: `Hornissen stehen unter Naturschutz. Für eine Bekämpfung ist eine Genehmigung der Oberen Naturschutzbehörde nötig.
Ansprechpartner:
- Arne Drews, 04347-704360, arne.drews@lfu.landsh.de
- Jörn Krütgen, 04347-704320, joern.kruetgen@lfu.landsh.de`,
  },
  {
    question: "Wie nehme ich eine Adresse korrekt auf?",
    answer: "Frage immer nach vollständiger Adresse inkl. Hausnummer, PLZ und Ort. Ergänze wenn möglich Mobilnummer und E-Mail für Rückfragen.",
  },
  {
    question: "Was tun bei Wespen?",
    answer: "Erfrage die Lage des Nestes (z.B. Höhe, Erreichbarkeit), ob es sich wirklich um Wespen handelt und ob Allergiker im Haushalt sind.",
  },
];

export default function App() {
  // State-Initialisierung
  const [customer, setCustomer] = useState({ ...defaultCustomer });
  const [order, setOrder] = useState({ text: "", area: "" });
  const [hasDifferentRecipient, setHasDifferentRecipient] = useState(false);
  const [recipient, setRecipient] = useState({ ...defaultInvoiceRecipient });
  const [message, setMessage] = useState("");
  const [selectedPests, setSelectedPests] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mapsBelow, setMapsBelow] = useState(false);
  const [depthHeight, setDepthHeight] = useState("");
  const [includeMapsLink, setIncludeMapsLink] = useState(true);
  const [showPLZWindow, setShowPLZWindow] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  React.useEffect(() => {
    const newWarnings = [];
    if (selectedPests.includes("Bienen")) newWarnings.push(beeNotice);
    if (selectedPests.includes("Hornissen")) newWarnings.push(hornetNotice);
    if (selectedPests.includes("Marder")) newWarnings.push(martenNotice);
    setWarnings(newWarnings);
  }, [selectedPests]);

  React.useEffect(() => {
    if (!showWeather) return;
    const zip = customer.zip;
    const city = customer.city;
    if (!zip && !city) return;
    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        zip + " " + city + ", Deutschland"
      )}`
    )
      .then((r) => r.json())
      .then((res) => {
        if (!res.length) throw new Error("Adresse/PLZ nicht gefunden");
        const { lat, lon } = res[0];
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Europe%2FBerlin`
        );
      })
      .then((r) => r.json())
      .then((data) => {
        setWeatherData(data.current_weather);
        setWeatherLoading(false);
      })
      .catch((err) => {
        setWeatherError("Keine Wetterdaten gefunden");
        setWeatherData(null);
        setWeatherLoading(false);
      });
  }, [showWeather, customer.zip, customer.city]);

  // Helper
  const handleSalutation = (val) =>
    setCustomer({ ...customer, salutation: val });
  const handleCustomerChange = (e) =>
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  const handleOrderChange = (e) =>
    setOrder({ ...order, [e.target.name]: e.target.value });
  const handleRecipientChange = (e) =>
    setRecipient({ ...recipient, [e.target.name]: e.target.value });
  const handlePestCheckbox = (e) => {
    const { value, checked } = e.target;
    setSelectedPests((prev) =>
      checked ? [...prev, value] : prev.filter((p) => p !== value)
    );
  };
  const makeMapsUrl = (street, houseNumber, zip, city) => {
    if (!street || !houseNumber || !zip || !city) return "";
    const address = `${street} ${houseNumber}, ${zip} ${city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  };
  const getMapsEmbedUrl = () => {
    if (
      !customer.street ||
      !customer.houseNumber ||
      !customer.zip ||
      !customer.city
    )
      return "";
    const address = `${customer.street} ${customer.houseNumber}, ${customer.zip} ${customer.city}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(
      address
    )}&output=embed`;
  };
  const bold = (txt) => (txt ? `*${txt}*` : "");
  const formatBlock = (person, title) => {
    if (title === "Kunde") {
      const lines = [
        bold(
          [person.salutation, person.firstName, person.lastName]
            .filter(Boolean)
            .join(" ")
        ),
        person.customerNumber ? `Kundennummer: ${person.customerNumber}` : null,
        person.street || person.houseNumber || person.zip || person.city
          ? `Adresse: ${person.street} ${person.houseNumber}, ${person.zip} ${person.city}`.replace(
              /\s+/g,
              " "
            )
          : null,
        person.phone ? `Festnetz: ${person.phone}` : null,
        person.mobile ? `Mobil: ${person.mobile}` : null,
        person.email ? `E-Mail: ${person.email}` : null,
      ].filter(Boolean);
      return lines.filter(Boolean).join("\n");
    } else {
      const lines = [
        person.firstName && person.lastName
          ? `${person.firstName} ${person.lastName}`
          : person.lastName || person.firstName,
        person.customerNumber ? `Kundennummer: ${person.customerNumber}` : null,
        person.street || person.houseNumber || person.zip || person.city
          ? `Adresse: ${person.street} ${person.houseNumber}, ${person.zip} ${person.city}`.replace(
              /\s+/g,
              " "
            )
          : null,
        person.phone ? `Festnetz: ${person.phone}` : null,
        person.mobile ? `Mobil: ${person.mobile}` : null,
        person.email ? `E-Mail: ${person.email}` : null,
      ].filter(Boolean);
      if (lines.length === 0) return "";
      return `\n${title}:\n${lines.join("\n")}`;
    }
  };
  function formatDepthHeightMsg(value) {
    if (!value || Number(value) === 0 || value === "0") return "";
    if (value === ">25") return "Höhe: >25m";
    const n = Number(value);
    if (n < 0) return `Tiefe: ${n}m`;
    if (n > 0) return `Höhe: +${n}m`;
    return "";
  }
  function pestListMsg() {
    if (!selectedPests.length) return "";
    return `\n\n${bold("Schädling(e):")} ${selectedPests
      .map(bold)
      .join(", ")}`;
  }
  const generateMessage = () => {
    let msg = formatBlock({ ...customer }, "Kunde");
    msg += pestListMsg();
    if (order.text) {
      msg += `\n\n${order.text}`;
      if (order.area) msg += ` (${order.area})`;
    } else if (order.area) {
      msg += `\n\nBereich: ${order.area}`;
    }
    const depthStr = formatDepthHeightMsg(depthHeight);
    if (depthStr) msg += `\n${depthStr}`;
    const mapsLink = makeMapsUrl(
      customer.street,
      customer.houseNumber,
      customer.zip,
      customer.city
    );
    if (mapsLink && includeMapsLink) {
      msg += `\n\nGoogle Maps: ${mapsLink}`;
    }
    if (hasDifferentRecipient) {
      const recBlock = formatBlock(
        { ...recipient },
        "Rechnungsempfänger (abweichend)"
      );
      if (recBlock) msg += `\n${recBlock}`;
    }
    setMessage(msg.trim());
  };
  const copyToClipboard = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      alert("Nachricht in die Zwischenablage kopiert!");
    } catch (err) {
      alert("Fehler beim Kopieren: " + err);
    }
  };
  const resetForm = () => {
    setCustomer({ ...defaultCustomer });
    setOrder({ text: "", area: "" });
    setHasDifferentRecipient(false);
    setRecipient({ ...defaultInvoiceRecipient });
    setSelectedPests([]);
    setMessage("");
    setDepthHeight("");
  };

  const colors = darkMode
    ? {
        bg: "#181a20",
        panel: "#23262f",
        field: "#23262f",
        text: "#f1f2f6",
        inputBg: "#181a20",
        border: "#333849",
        shadow: "0 4px 16px #000a",
        accent: "#007bff",
        warnBg: "#322900",
        warnBorder: "#ffd000",
        warnText: "#ffd000",
        info: "#c8e6c9",
        placeholder: "#aaa",
      }
    : {
        bg: "#f4f6fa",
        panel: "#f9f9f9",
        field: "#fff",
        text: "#222",
        inputBg: "#fff",
        border: "#ddd",
        shadow: "0 4px 16px #0001",
        accent: "#007bff",
        warnBg: "#fff3cd",
        warnBorder: "#ffeeba",
        warnText: "#856404",
        info: "#2d7036",
        placeholder: "#888",
      };

  function Switch({ checked, onChange }) {
    return (
      <span style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44, minHeight: 24
      }}>
        <label style={{
          display: "inline-block", cursor: "pointer", width: 44, height: 24, position: "relative"
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            style={{ display: "none" }}
          />
          <span
            style={{
              position: "absolute", top: 0, left: 0, width: 44, height: 24,
              borderRadius: 14, background: checked ? colors.accent : colors.border,
              transition: "background 0.18s", boxShadow: "0 1px 4px #0002",
            }}
          ></span>
          <span
            style={{
              position: "absolute", top: 3, left: checked ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 0.18s", boxShadow: checked ? "0 0 0 2px #007bff44" : "0 0 0 2px #0001",
            }}
          ></span>
        </label>
      </span>
    );
  }

  function Menu() {
    const rowStyle = {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      fontSize: 16,
      padding: "4px 0 4px 0"
    };
    return (
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          background: colors.panel,
          color: colors.text,
          borderRadius: 16,
          boxShadow: "0 8px 32px #0004",
          minWidth: 340,
          maxWidth: 410,
          zIndex: 100,
          padding: "18px 22px 18px 22px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Ansicht</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 14 }}>
          <label style={rowStyle}>
            <span>Dark Mode</span>
            <Switch checked={darkMode} onChange={() => setDarkMode(d => !d)} />
          </label>
          <label style={rowStyle}>
            <span>Google Maps & PLZ-Suche unter Formular</span>
            <Switch checked={mapsBelow} onChange={() => setMapsBelow(d => !d)} />
          </label>
          <label style={rowStyle}>
            <span>Wetterdaten anzeigen</span>
            <Switch checked={showWeather} onChange={() => setShowWeather(d => !d)} />
          </label>
          <label style={rowStyle}>
            <span>PLZ/Ort-Suche Schleswig-Holstein</span>
            <Switch checked={showPLZWindow} onChange={() => setShowPLZWindow(d => !d)} />
          </label>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, margin: "8px 0 10px 0" }}>Nachrichten</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 14 }}>
          <label style={rowStyle}>
            <span>Google Maps Link in Nachricht anzeigen</span>
            <Switch checked={includeMapsLink} onChange={() => setIncludeMapsLink(m => !m)} />
          </label>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, margin: "8px 0 10px 0" }}>Support/FAQ</div>
        <button
          type="button"
          style={{
            fontWeight: "bold",
            background: colors.accent,
            color: "#fff",
            padding: "0.6em 1.2em",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            cursor: "pointer",
            marginBottom: 6,
            marginTop: 2,
          }}
          onClick={() => { setShowFAQ(true); setMenuOpen(false); }}
        >
          FAQ öffnen
        </button>
      </div>
    );
  }

  function WeatherPanel() {
    const weatherCodes = {
      0: ["Klar", "☀️"],
      1: ["Überwiegend klar", "🌤️"],
      2: ["Teilweise bewölkt", "⛅"],
      3: ["Bewölkt", "☁️"],
      45: ["Nebel", "🌫️"],
      48: ["Nebel", "🌫️"],
      51: ["Leichter Sprühregen", "🌦️"],
      53: ["Sprühregen", "🌦️"],
      55: ["Starker Sprühregen", "🌧️"],
      61: ["Leichter Regen", "🌦️"],
      63: ["Regen", "🌧️"],
      65: ["Starker Regen", "🌧️"],
      71: ["Leichter Schneefall", "🌨️"],
      73: ["Schneefall", "🌨️"],
      75: ["Starker Schneefall", "❄️"],
      80: ["Schauer", "🌦️"],
      81: ["Schauer", "🌦️"],
      82: ["Starker Schauer", "⛈️"],
      95: ["Gewitter", "⛈️"],
      96: ["Gewitter", "⛈️"],
      99: ["Starkes Gewitter", "⛈️"],
    };
    return (
      <div
        style={{
          background: colors.field,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          marginTop: 22,
          marginBottom: 18,
          padding: 14,
          minHeight: 75,
        }}
      >
        <div style={{ color: colors.text, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Aktuelles Wetter</div>
        {!customer.zip && !customer.city ? (
          <div style={{ color: colors.placeholder }}>
            Bitte PLZ oder Ort eingeben...
          </div>
        ) : weatherLoading ? (
          <div style={{ color: colors.placeholder }}>Wetterdaten werden geladen...</div>
        ) : weatherError ? (
          <div style={{ color: "#c00", fontWeight: 500 }}>{weatherError}</div>
        ) : weatherData ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 34 }}>{weatherCodes[weatherData.weathercode]?.[1] ?? "🌡️"}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>
                {weatherData.temperature}°C
              </div>
              <div>
                {weatherCodes[weatherData.weathercode]?.[0] ?? "Unbekannt"}
                {" "}({weatherData.windspeed} km/h Wind)
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: colors.placeholder }}>Noch keine Wetterdaten...</div>
        )}
      </div>
    );
  }

  function FAQModal() {
    return (
      <div
        style={{
          position: "fixed",
          zIndex: 1200,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.23)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setShowFAQ(false)}
      >
        <div
          style={{
            background: colors.panel,
            color: colors.text,
            borderRadius: 16,
            minWidth: 320,
            maxWidth: 450,
            padding: 24,
            boxShadow: "0 8px 32px #0007",
            position: "relative",
            fontSize: 16,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            style={{
              position: "absolute", right: 14, top: 12, border: "none", background: "transparent",
              fontSize: 28, color: colors.text, cursor: "pointer",
            }}
            onClick={() => setShowFAQ(false)}
            aria-label="FAQ schließen"
            title="Schließen"
          >×</button>
          <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: "center" }}>Support / FAQ</h2>
          {defaultFAQs.map((faq, idx) => (
            <div key={idx} style={{ marginBottom: 17 }}>
              <button
                type="button"
                onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  width: "100%",
                  background: "#fff2",
                  color: colors.text,
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 0",
                  textAlign: "left",
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                {faq.question}
              </button>
              {faqOpenIndex === idx && (
                <div style={{ background: "#fff3", borderRadius: 6, padding: 8, whiteSpace: "pre-line", marginTop: 2 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isMobile = typeof window !== "undefined"
    ? window.innerWidth < 900
    : false;

  // HEADLINE-ROW (Überschriften nebeneinander Desktop, untereinander Mobil)
  const headlineRow = (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        gap: isMobile ? 6 : 0,
        margin: "0 0 28px 0"
      }}
    >
      <h1
        style={{
          color: colors.text,
          fontSize: isMobile ? 24 : 32,
          margin: 0,
          fontWeight: 700,
          letterSpacing: 0,
          lineHeight: 1.13,
          textAlign: "left",
          flex: 1
        }}
      >
        Zusätzliche Informationen zum Auftrag
      </h1>
      <h1
        style={{
          color: colors.text,
          fontSize: isMobile ? 24 : 32,
          margin: isMobile ? "18px 0 0 0" : 0,
          fontWeight: 700,
          letterSpacing: 0,
          lineHeight: 1.13,
          textAlign: isMobile ? "left" : "right",
          flex: 1
        }}
      >
        Kundenauftrag für WhatsApp generieren
      </h1>
    </div>
  );

  // Container für Überschriften & Inhalt
  const mainContainerStyle = {
    maxWidth: 1300,
    margin: "32px auto 0 auto",
    padding: "0 24px"
  };

  const leftColumn = (
    <div style={{
      width: isMobile ? "100%" : 600,
      minWidth: 0,
      margin: isMobile ? "0 auto" : 0,
      background: colors.panel,
      borderRadius: 12,
      boxShadow: colors.shadow,
      padding: isMobile ? 10 : 24,
      marginBottom: 40,
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
        <h3 style={{ color: colors.text, margin: 0, flex: 1 }}>
          Google Maps Vorschau
        </h3>
      </div>
      {getMapsEmbedUrl() ? (
        <iframe
          title="Google Maps"
          width="100%"
          height="320"
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: colors.panel,
            display: "block",
            marginBottom: showPLZWindow ? 24 : 0,
          }}
          src={getMapsEmbedUrl()}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      ) : (
        <div
          style={{
            background: colors.panel,
            border: `1px dashed ${colors.border}`,
            borderRadius: 12,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.placeholder,
            textAlign: "center",
            marginBottom: showPLZWindow ? 24 : 0,
          }}
        >
          Bitte Adresse ausfüllen,<br />dann erscheint hier die Karte.
        </div>
      )}
      {/* SWITCHES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
          <span style={{ fontSize: 16 }}>Wetterdaten anzeigen</span>
          <Switch checked={showWeather} onChange={() => setShowWeather(s => !s)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
          <span style={{ fontSize: 16 }}>PLZ/Ort-Suche Schleswig-Holstein</span>
          <Switch checked={showPLZWindow} onChange={() => setShowPLZWindow(m => !m)} />
        </div>
      </div>
      {showWeather ? <WeatherPanel /> : null}
      {showPLZWindow ? (
        <div>
          <div style={{
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
            minHeight: 250,
            background: colors.field,
          }}>
            <iframe
              src="https://www.postleitzahlen.de/plz/schleswig-holstein"
              title="PLZ-Suche Schleswig-Holstein"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  // RETURN & Formular
  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        fontFamily: "sans-serif",
        transition: "background 0.3s, color 0.3s",
        position: "relative"
      }}
    >
      <div style={{ position: "fixed", right: 16, top: 18, zIndex: 900 }}>
        <button
          style={{
            background: colors.panel,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            boxShadow: colors.shadow,
            padding: "7px 16px",
            fontWeight: 600,
            fontSize: 17,
            cursor: "pointer"
          }}
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Menü öffnen"
        >
          ☰ Menü
        </button>
        {menuOpen ? <Menu /> : null}
      </div>
      <div style={mainContainerStyle}>
        {headlineRow}
        <div style={{
          display: (mapsBelow || isMobile) ? "block" : "flex",
          flexDirection: (mapsBelow || isMobile) ? "column" : "row",
          gap: 36,
          alignItems: "flex-start"
        }}>
          {(mapsBelow || isMobile) ? null : leftColumn}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* FORMULAR RECHTS */}
            <form
              onSubmit={e => {
                e.preventDefault();
                generateMessage();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "1rem" : "1.5rem",
                background: colors.panel,
                padding: isMobile ? "1rem" : "2rem",
                borderRadius: isMobile ? "1rem" : "1.5rem",
                boxShadow: colors.shadow,
                color: colors.text,
                fontSize: isMobile ? 15 : 16,
              }}
            >
              {/* Kundendaten */}
              <fieldset
                style={{
                  background: colors.field,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                }}
              >
                <legend>Kundendaten</legend>
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 20,
                  marginBottom: 10,
                }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="checkbox"
                      checked={customer.salutation === "Frau"}
                      onChange={() => handleSalutation("Frau")}
                    />
                    Frau
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="checkbox"
                      checked={customer.salutation === "Herr"}
                      onChange={() => handleSalutation("Herr")}
                    />
                    Herr
                  </label>
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8 }}>
                  <input
                    name="firstName"
                    value={customer.firstName}
                    onChange={handleCustomerChange}
                    placeholder="Vorname"
                    autoComplete="given-name"
                    style={{
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <input
                    name="lastName"
                    value={customer.lastName}
                    onChange={handleCustomerChange}
                    placeholder="Nachname"
                    autoComplete="family-name"
                    required
                    style={{
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <input
                    name="customerNumber"
                    value={customer.customerNumber}
                    onChange={handleCustomerChange}
                    placeholder="Kundennummer (optional)"
                    style={{
                      width: isMobile ? "100%" : 130,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, marginTop: 8 }}>
                  <input
                    name="street"
                    value={customer.street}
                    onChange={handleCustomerChange}
                    placeholder="Straße"
                    autoComplete="street-address"
                    required
                    style={{
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <input
                    name="houseNumber"
                    value={customer.houseNumber}
                    onChange={handleCustomerChange}
                    placeholder="Nr."
                    style={{
                      width: isMobile ? "100%" : 50,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    required
                  />
                  <input
                    name="zip"
                    value={customer.zip}
                    onChange={handleCustomerChange}
                    placeholder="PLZ"
                    style={{
                      width: isMobile ? "100%" : 70,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    required
                  />
                  <input
                    name="city"
                    value={customer.city}
                    onChange={handleCustomerChange}
                    placeholder="Wohnort"
                    required
                    style={{
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, marginTop: 8 }}>
                  <input
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="Festnetz (optional)"
                    style={{
                      width: isMobile ? "100%" : 150,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <input
                    name="mobile"
                    value={customer.mobile}
                    onChange={handleCustomerChange}
                    placeholder="Mobil (optional)"
                    style={{
                      width: isMobile ? "100%" : 150,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <input
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="E-Mail (optional)"
                    style={{
                      width: isMobile ? "100%" : 200,
                      background: colors.inputBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </fieldset>
              {/* Schädlinge */}
              <fieldset
                style={{
                  background: colors.field,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                }}
              >
                <legend>Schnellauswahl Schädlinge</legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {pestOptions.map((pest) => (
                    <label key={pest} style={{ minWidth: 120 }}>
                      <input
                        type="checkbox"
                        value={pest}
                        checked={selectedPests.includes(pest)}
                        onChange={handlePestCheckbox}
                        style={{ accentColor: colors.accent, marginRight: 5 }}
                      />
                      {pest}
                    </label>
                  ))}
                </div>
              </fieldset>
              {/* Warnungen */}
              {warnings.length > 0 && (
                <div
                  style={{
                    background: colors.warnBg,
                    border: `1px solid ${colors.warnBorder}`,
                    color: colors.warnText,
                    padding: "1em",
                    borderRadius: "8px",
                    whiteSpace: "pre-line",
                    fontSize: "1em",
                  }}
                >
                  <b>Achtung / Hinweis:</b>
                  <ul style={{ margin: "0.5em 0 0 1em", padding: 0 }}>
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Auftrag / Bemerkungen */}
              <fieldset
                style={{
                  background: colors.field,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                }}
              >
                <legend>Auftrag / weitere Bemerkungen</legend>
                <textarea
                  name="text"
                  value={order.text}
                  onChange={handleOrderChange}
                  placeholder="Was ist das Anliegen? (z.B. Sichtung, Sonderwunsch, Details...)"
                  rows={3}
                  style={{
                    width: "100%",
                    background: colors.inputBg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                  }}
                />
                <select
                  name="area"
                  value={order.area}
                  onChange={handleOrderChange}
                  style={{
                    marginTop: 8,
                    background: colors.inputBg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                  }}
                >
                  <option value="">Bereich wählen (optional)</option>
                  <option>Innenbereich</option>
                  <option>Außenbereich</option>
                  <option>Innen & Außen</option>
                </select>
                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Tiefe/Höhe auswählen:
                  </label>
                  <input
                    type="range"
                    min={-5}
                    max={26}
                    step={0.5}
                    value={depthHeight === ">25" ? 26 : depthHeight || 0}
                    onChange={e => {
                      let v = e.target.value;
                      if (Number(v) >= 25.5) v = ">25";
                      setDepthHeight(v);
                    }}
                    style={{ width: "100%" }}
                  />
                  <div style={{ textAlign: "right", marginTop: 4 }}>
                    {depthHeight === ">25"
                      ? "mehr als 25m"
                      : Number(depthHeight) > 0
                      ? `+${depthHeight}m`
                      : Number(depthHeight) < 0
                      ? `${depthHeight}m`
                      : "0m"}
                  </div>
                  <div style={{ fontSize: 13, color: colors.placeholder, marginTop: 2 }}>
                    {`Gibt die Lage des Nestes oder des Problems (z.B. Wespennest-Höhe, Rattenschacht-Tiefe) an.`}
                  </div>
                </div>
              </fieldset>
              {/* Abweichender Rechnungsempfänger */}
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={hasDifferentRecipient}
                  onChange={(e) => setHasDifferentRecipient(e.target.checked)}
                  style={{ accentColor: colors.accent }}
                />
                Abweichender Rechnungsempfänger?
              </label>
              {hasDifferentRecipient && (
                <fieldset
                  style={{
                    background: colors.field,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                  }}
                >
                  <legend>Rechnungsempfänger (optional)</legend>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8 }}>
                    <input
                      name="firstName"
                      value={recipient.firstName}
                      onChange={handleRecipientChange}
                      placeholder="Vorname"
                      style={{
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="lastName"
                      value={recipient.lastName}
                      onChange={handleRecipientChange}
                      placeholder="Nachname"
                      style={{
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, marginTop: 8 }}>
                    <input
                      name="street"
                      value={recipient.street}
                      onChange={handleRecipientChange}
                      placeholder="Straße"
                      style={{
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="houseNumber"
                      value={recipient.houseNumber}
                      onChange={handleRecipientChange}
                      placeholder="Nr."
                      style={{
                        width: isMobile ? "100%" : 50,
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="zip"
                      value={recipient.zip}
                      onChange={handleRecipientChange}
                      placeholder="PLZ"
                      style={{
                        width: isMobile ? "100%" : 70,
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="city"
                      value={recipient.city}
                      onChange={handleRecipientChange}
                      placeholder="Wohnort"
                      style={{
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, marginTop: 8 }}>
                    <input
                      name="phone"
                      value={recipient.phone}
                      onChange={handleRecipientChange}
                      placeholder="Festnetz (optional)"
                      style={{
                        width: isMobile ? "100%" : 150,
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="mobile"
                      value={recipient.mobile}
                      onChange={handleRecipientChange}
                      placeholder="Mobil (optional)"
                      style={{
                        width: isMobile ? "100%" : 150,
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <input
                      name="email"
                      value={recipient.email}
                      onChange={handleRecipientChange}
                      placeholder="E-Mail (optional)"
                      style={{
                        width: isMobile ? "100%" : 200,
                        background: colors.inputBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </div>
                </fieldset>
              )}
              <button
                type="submit"
                style={{
                  fontWeight: "bold",
                  padding: isMobile ? "0.6rem 1rem" : "0.5rem 1.5rem",
                  fontSize: isMobile ? 17 : 18,
                  background: colors.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 2px 4px #0002",
                  marginTop: 8,
                  cursor: "pointer",
                }}
              >
                Nachricht generieren
              </button>
            </form>
            {message && (
              <div style={{ marginTop: 24 }}>
                <h3>WhatsApp-Nachricht</h3>
                <textarea
                  readOnly
                  value={message}
                  rows={Math.min(16, message.split("\n").length + 2)}
                  style={{
                    width: "100%",
                    fontFamily: "monospace",
                    background: darkMode ? "#292d36" : "#eef",
                    color: colors.text,
                    padding: 8,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 16, marginTop: 8, flexDirection: isMobile ? "column" : "row" }}>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      background: colors.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: "bold",
                      padding: "0.5em 1.2em",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    In Zwischenablage kopieren
                  </button>
                  <span style={{ color: colors.placeholder, fontSize: 15 }}>
                    → Wechsle zu WhatsApp Web, füge die Nachricht in den Chat ein und sende ab.
                  </span>
                </div>
                <button
                  onClick={resetForm}
                  style={{
                    marginTop: 10,
                    background: colors.accent,
                    color: "#fff",
                    padding: "0.5em 1.5em",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  Neuen Auftrag eingeben
                </button>
              </div>
            )}
          </div>
          {(mapsBelow || isMobile) ? <div style={{ marginTop: 36 }}>{leftColumn}</div> : null}
        </div>
      </div>
      {showFAQ ? <FAQModal /> : null}
    </div>
  );
}
