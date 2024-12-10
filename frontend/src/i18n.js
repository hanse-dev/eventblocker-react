import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: {
    translation: {
      // Navigation
      "Home": "Startseite",
      "Events": "Veranstaltungen",
      "Admin Dashboard": "Admin-Dashboard",
      "Login": "Anmelden",
      "Register": "Registrieren",
      "Logout": "Abmelden",
      "My Events": "Meine Veranstaltungen",
      "Welcome,": "Willkommen,",

      // Event related
      "Event Details": "Veranstaltungsdetails",
      "Register for Event": "Für Veranstaltung anmelden",
      "Available Places": "Verfügbare Plätze",
      "Date": "Datum",
      "Location": "Ort",
      "Price": "Preis",
      "Capacity": "Kapazität",
      "Description": "Beschreibung",
      "Created by": "Erstellt von",
      "Upcoming Events": "Kommende Veranstaltungen",
      "View Details": "Details anzeigen",
      "Create New Event": "Neue Veranstaltung erstellen",
      "Edit Event": "Veranstaltung bearbeiten",
      "Delete Event": "Veranstaltung löschen",
      "Event Full": "Veranstaltung ausgebucht",
      "place": "Platz",
      "places": "Plätze",
      "Back to Events": "Zurück zu Veranstaltungen",
      "Login to Register": "Anmelden zum Registrieren",
      "Or": "Oder",
      "Register as Guest": "Als Gast registrieren",

      // Forms
      "Full Name": "Vollständiger Name",
      "Email": "E-Mail",
      "Password": "Passwort",
      "Submit": "Absenden",
      "Cancel": "Abbrechen",
      "Title": "Titel",
      "Save Changes": "Änderungen speichern",
      "Phone": "Telefon",

      // Admin Dashboard
      "Edit": "Bearbeiten",
      "Delete": "Löschen",
      "Create Event": "Veranstaltung erstellen",
      "Registrations": "Anmeldungen",
      "User": "Benutzer",
      "Guest": "Gast",
      "Registration Date": "Anmeldedatum",
      "View Registrations": "Anmeldungen anzeigen",
      "Hide Registrations": "Anmeldungen ausblenden",
      "No registrations yet": "Noch keine Anmeldungen",
      "Registrations for": "Anmeldungen für",

      // Messages
      "Successfully registered": "Erfolgreich registriert",
      "Registration failed": "Registrierung fehlgeschlagen",
      "Please login to continue": "Bitte melden Sie sich an, um fortzufahren",
      "Event created successfully": "Veranstaltung erfolgreich erstellt",
      "Event updated successfully": "Veranstaltung erfolgreich aktualisiert",
      "Event deleted successfully": "Veranstaltung erfolgreich gelöscht",
      "Are you sure?": "Sind Sie sicher?",
      "This action cannot be undone": "Diese Aktion kann nicht rückgängig gemacht werden",
      "Loading...": "Wird geladen...",
      "Failed to fetch events": "Fehler beim Laden der Veranstaltungen",
      "Failed to fetch registrations": "Fehler beim Laden der Anmeldungen",
      "Successfully registered for this event!": "Erfolgreich für diese Veranstaltung registriert!",
      "You are already registered for this event": "Sie sind bereits für diese Veranstaltung registriert",
      "This event is full": "Diese Veranstaltung ist ausgebucht",
      "Cancel Registration": "Anmeldung stornieren",
      "Are you sure you want to cancel your registration for this event?": "Sind Sie sicher, dass Sie Ihre Anmeldung für diese Veranstaltung stornieren möchten?",

      // Validation
      "Required field": "Pflichtfeld",
      "Invalid email": "Ungültige E-Mail",
      "Password too short": "Passwort zu kurz",
      "Passwords do not match": "Passwörter stimmen nicht überein"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Set German as the default language
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
