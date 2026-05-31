// =========================
// ORGANIZATION (TENANT)
// =========================
{
  "Organization": {
    "id": "string", // unique org ID
    "name": "string", // business name
    "slug": "string", // URL-friendly identifier (e.g. my-clinic)
    "createdAt": "datetime"
  },

  // =========================
  // USERS (STAFF SYSTEM)
  // =========================
  "User": {
    "id": "string",
    "organizationId": "string", // isolates user to ONE org only

    "name": "string",
    "email": "string",
    "passwordHash": "string",

    "role": "owner | admin | staff", // permission level: owners vs created users
    "createdById": "string", // ID of the owner/admin who created this user

    "isActive": "boolean",
    "createdAt": "datetime"
  },

  // =========================
  // QUEUE (MAIN SYSTEM UNIT)
  // =========================
  "Queue": {
    "id": "string",
    "organizationId": "string",

    "name": "string", // e.g. "Main Clinic Queue"
    "description": "string",
    
    "passcode": "string", // Hashed password/code to protect queue access

    // UI customization per queue (VERY IMPORTANT for your idea)
    "theme": {
      "primaryColor": "string",
      "backgroundColor": "string",
      "fontStyle": "string"
    },

    // layout rules for display screen
    "layout": {
      "type": "grid | fullscreen | split",
      "showLogo": "boolean",
      "showClock": "boolean",
      "showQueueList": "boolean",
      "showAnnouncements": "boolean"
    },

    "isActive": "boolean",
    "createdAt": "datetime"
  },

  // =========================
  // SERVICE (WHAT PEOPLE QUEUE FOR)
  // =========================
  "Service": {
    "id": "string",
    "queueId": "string",

    "name": "string", // e.g. Consultation, Payment
    "prefix": "string", // e.g. A, B, C
    "avgDurationMinutes": "number",

    "isActive": "boolean"
  },

  // =========================
  // QUEUE SESSION (DAILY / SHIFT INSTANCE)
  // =========================
  "QueueSession": {
    "id": "string",
    "queueId": "string",

    "date": "date", // session date (important for future booking)

    "status": "open | closed",

    "currentNumber": "number", // last issued number

    "createdAt": "datetime"
  },

  // =========================
  // TICKET (CORE ENTITY)
  // =========================
  "Ticket": {
    "id": "string",

    "organizationId": "string",
    "queueId": "string",
    "serviceId": "string",
    "queueSessionId": "string",

    "number": "number", // sequential number
    "code": "string", // e.g. A-001

    // =========================
    // CUSTOMER (FLEXIBLE JSON)
    // =========================
    "customer": {
      "name": "string", // optional for walk-ins
      "phone": "string",
      "email": "string",

      // optional metadata (VERY FLEXIBLE)
      "meta": {
        "address": "string",
        "notes": "string",
        "age": "number",
        "gender": "string"
      }
    },

    // =========================
    // STATUS FLOW
    // =========================
    "status": "waiting | serving | skipped | done | no_show",

    // priority queue support (VIP, elderly, etc.)
    "priority": "number",

    // timestamps for analytics
    "createdAt": "datetime",
    "calledAt": "datetime",
    "startedAt": "datetime",
    "completedAt": "datetime"
  },

  // =========================
  // COUNTER / WINDOW (STAFF STATION)
  // =========================
  "Counter": {
    "id": "string",
    "queueId": "string",

    "name": "string", // e.g. Window 1

    "currentTicketId": "string",

    "isActive": "boolean"
  },

  // =========================
  // DISPLAY SCREEN (YOUR CUSTOM UI IDEA)
  // =========================
  "DisplayScreen": {
    "id": "string",
    "queueId": "string",

    "name": "string",

    // fully customizable layout engine
    "layout": {
      "template": "default | modern | minimal | custom",

      "components": [
        // each UI block can be enabled/disabled
        "currentServing",
        "nextInLine",
        "serviceName",
        "queueList",
        "clock",
        "announcements"
      ]
    },

    // styling system per queue
    "theme": {
      "primaryColor": "string",
      "secondaryColor": "string",
      "background": "string",
      "fontSize": "string"
    },

    "isActive": "boolean"
  },

  // =========================
  // EVENTS (ANALYTICS + AUDIT LOG)
  // =========================
  "TicketEvent": {
    "id": "string",
    "ticketId": "string",

    "type": "created | called | skipped | recalled | completed | no_show",

    "meta": {}, // flexible event data

    "createdAt": "datetime"
  },

  // =========================
  // SUBSCRIPTION (SAAS BILLING)
  // =========================
  "Subscription": {
    "id": "string",
    "organizationId": "string",

    "plan": "free | pro | enterprise",
    "status": "active | canceled | past_due",

    "startedAt": "datetime",
    "endsAt": "datetime"
  }
}