export const mockUsers = [
  {
    id: "u-admin-1",
    name: "Sophie Carter",
    email: "boss@buildforu.com",
    role: "admin",
    title: "Operations Director",
    titleKey: "seed.users.u-admin-1.title",
    avatar: "SC"
  },
  {
    id: "u-employee-1",
    name: "Alex Novak",
    email: "worker@buildforu.com",
    role: "employee",
    title: "Site Supervisor",
    titleKey: "seed.users.u-employee-1.title",
    avatar: "AN"
  },
  {
    id: "u-employee-2",
    name: "Mia Berger",
    email: "mia@buildforu.com",
    role: "employee",
    title: "Electrician",
    titleKey: "seed.users.u-employee-2.title",
    avatar: "MB"
  },
  {
    id: "u-employee-3",
    name: "Luca Moretti",
    email: "luca@buildforu.com",
    role: "employee",
    title: "Plumbing Lead",
    titleKey: "seed.users.u-employee-3.title",
    avatar: "LM"
  }
];

export const mockTasks = [
  {
    id: "task-101",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Concrete slab inspection",
    titleKey: "seed.tasks.task-101.title",
    location: "North River Residences",
    locationKey: "seed.projects.project-1.name",
    date: "2026-04-10",
    status: "pending",
    priority: "high"
  },
  {
    id: "task-102",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Safety briefing with subcontractors",
    titleKey: "seed.tasks.task-102.title",
    location: "BuildForU HQ",
    locationKey: "seed.common.hq",
    date: "2026-04-11",
    status: "completed",
    priority: "medium"
  },
  {
    id: "task-103",
    employeeId: "u-employee-2",
    assignee: "Mia Berger",
    title: "Install lighting circuits",
    titleKey: "seed.tasks.task-103.title",
    location: "Skyline Offices",
    locationKey: "seed.projects.project-2.name",
    date: "2026-04-12",
    status: "pending",
    priority: "high"
  },
  {
    id: "task-104",
    employeeId: "u-employee-3",
    assignee: "Luca Moretti",
    title: "Pipe pressure test",
    titleKey: "seed.tasks.task-104.title",
    location: "Harbor Villas",
    locationKey: "seed.projects.project-3.name",
    date: "2026-04-13",
    status: "pending",
    priority: "medium"
  },
  {
    id: "task-105",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Facade delivery check-in",
    titleKey: "seed.tasks.task-105.title",
    location: "Skyline Offices",
    locationKey: "seed.projects.project-2.name",
    date: "2026-04-15",
    status: "pending",
    priority: "low"
  },
  {
    id: "task-106",
    employeeId: "u-employee-2",
    assignee: "Mia Berger",
    title: "Panel labeling audit",
    titleKey: "seed.tasks.task-106.title",
    location: "North River Residences",
    locationKey: "seed.projects.project-1.name",
    date: "2026-04-17",
    status: "completed",
    priority: "low"
  }
];

export const mockWorkers = [
  {
    id: "u-employee-1",
    name: "Alex Novak",
    email: "alex@buildforu.com",
    phone: "+49 151 555 0131",
    position: "Site Supervisor",
    positionKey: "seed.users.u-employee-1.title",
    assignedProject: "North River Residences",
    assignedProjectKey: "seed.projects.project-1.name",
    trade: "Site Supervisor",
    tradeKey: "seed.users.u-employee-1.title",
    location: "North River Residences",
    locationKey: "seed.projects.project-1.name",
    status: "On Site",
    availability: "Available",
    completionRate: 86,
    nextShift: "07:30",
    attendance: {
      currentStatus: "On Site",
      workStartTime: "2026-04-10T07:28:00",
      workEndTime: null,
      workStartLocation: {
        latitude: 52.52084,
        longitude: 13.40943
      },
      workEndLocation: null
    }
  },
  {
    id: "u-employee-2",
    name: "Mia Berger",
    email: "mia@buildforu.com",
    phone: "+49 151 555 0182",
    position: "Electrician",
    positionKey: "seed.users.u-employee-2.title",
    assignedProject: "Skyline Offices",
    assignedProjectKey: "seed.projects.project-2.name",
    trade: "Electrician",
    tradeKey: "seed.users.u-employee-2.title",
    location: "Skyline Offices",
    locationKey: "seed.projects.project-2.name",
    status: "Off Site",
    availability: "Available",
    completionRate: 91,
    nextShift: "08:00",
    attendance: {
      currentStatus: "Off Site",
      workStartTime: "2026-04-09T08:02:00",
      workEndTime: "2026-04-09T17:14:00",
      workStartLocation: {
        latitude: 52.51641,
        longitude: 13.37771
      },
      workEndLocation: {
        latitude: 52.51589,
        longitude: 13.38812
      }
    }
  },
  {
    id: "u-employee-3",
    name: "Luca Moretti",
    email: "luca@buildforu.com",
    phone: "+49 151 555 0197",
    position: "Plumbing Lead",
    positionKey: "seed.users.u-employee-3.title",
    assignedProject: "Harbor Villas",
    assignedProjectKey: "seed.projects.project-3.name",
    trade: "Plumbing Lead",
    tradeKey: "seed.users.u-employee-3.title",
    location: "Harbor Villas",
    locationKey: "seed.projects.project-3.name",
    status: "On Site",
    availability: "Busy",
    completionRate: 78,
    nextShift: "09:15",
    attendance: {
      currentStatus: "On Site",
      workStartTime: "2026-04-10T08:47:00",
      workEndTime: null,
      workStartLocation: null,
      workEndLocation: null
    }
  }
];

export const mockProjects = [
  {
    id: "project-1",
    name: "North River Residences",
    nameKey: "seed.projects.project-1.name",
    status: "In Progress",
    phase: "Structural finish",
    phaseKey: "seed.projects.project-1.phase",
    progress: 74,
    budget: "$1.24M",
    health: "Healthy",
    location: "Berlin - Prenzlauer Berg",
    locationKey: "seed.projects.project-1.location",
    startDate: "2026-02-03",
    deadline: "2026-07-18",
    notes: "Facade coordination is on track, but the slab inspection still needs final sign-off.",
    notesKey: "seed.projects.project-1.notes"
  },
  {
    id: "project-2",
    name: "Skyline Offices",
    nameKey: "seed.projects.project-2.name",
    status: "On Hold",
    phase: "MEP installation",
    phaseKey: "seed.projects.project-2.phase",
    progress: 58,
    budget: "$860K",
    health: "At risk",
    location: "Berlin - Mitte",
    locationKey: "seed.projects.project-2.location",
    startDate: "2026-01-15",
    deadline: "2026-08-02",
    notes: "Electrical works are paused until supplier confirmation for the missing control panels.",
    notesKey: "seed.projects.project-2.notes"
  },
  {
    id: "project-3",
    name: "Harbor Villas",
    nameKey: "seed.projects.project-3.name",
    status: "Completed",
    phase: "Interior detailing",
    phaseKey: "seed.projects.project-3.phase",
    progress: 100,
    budget: "$2.1M",
    health: "Healthy",
    location: "Potsdam Waterfront",
    locationKey: "seed.projects.project-3.location",
    startDate: "2025-10-10",
    deadline: "2026-03-29",
    notes: "All punch-list items have been closed and the client handover package was delivered.",
    notesKey: "seed.projects.project-3.notes"
  },
  {
    id: "project-4",
    name: "Greenpoint Warehouse",
    nameKey: "seed.projects.project-4.name",
    status: "Not Started",
    phase: "Pre-construction planning",
    phaseKey: "seed.projects.project-4.phase",
    progress: 0,
    budget: "$690K",
    health: "Healthy",
    location: "Brandenburg Logistics Park",
    locationKey: "seed.projects.project-4.location",
    startDate: "2026-05-06",
    deadline: "2026-10-14",
    notes: "Kick-off is scheduled after permit approval and site fencing confirmation.",
    notesKey: "seed.projects.project-4.notes"
  }
];

export const mockMaterials = [
  {
    id: "material-1",
    name: "Rebar bundles",
    supplier: "SteelCore",
    stock: "142 units",
    status: "In stock"
  },
  {
    id: "material-2",
    name: "Facade glass panels",
    supplier: "Nordic Glass",
    stock: "18 units",
    status: "Low stock"
  },
  {
    id: "material-3",
    name: "Copper cabling",
    supplier: "Voltix",
    stock: "620 m",
    status: "In stock"
  }
];

export const mockMaterialRequests = [
  {
    id: "request-1",
    itemName: "Cement bags",
    itemNameKey: "seed.materialRequests.request-1.itemName",
    quantity: "24 bags",
    note: "Needed for slab prep near tower B.",
    noteKey: "seed.materialRequests.request-1.note",
    status: "Pending",
    requestedById: "u-employee-1",
    requestedBy: "Alex Novak",
    projectName: "North River Residences",
    createdAt: "2026-04-09T09:10:00"
  },
  {
    id: "request-2",
    itemName: "Cable clips",
    itemNameKey: "seed.materialRequests.request-2.itemName",
    quantity: "200 pcs",
    note: "For east wing cable routing.",
    noteKey: "seed.materialRequests.request-2.note",
    status: "Ordered",
    requestedById: "u-employee-2",
    requestedBy: "Mia Berger",
    projectName: "Skyline Offices",
    createdAt: "2026-04-08T14:35:00"
  },
  {
    id: "request-3",
    itemName: "Portable site toilet",
    itemNameKey: "seed.materialRequests.request-3.itemName",
    quantity: "1 unit",
    note: "Needed before the plumbing crew stays on site all day.",
    noteKey: "seed.materialRequests.request-3.note",
    status: "Purchased",
    requestedById: "u-employee-3",
    requestedBy: "Luca Moretti",
    projectName: "Harbor Villas",
    createdAt: "2026-04-07T11:20:00"
  },
  {
    id: "request-4",
    itemName: "White interior paint",
    itemNameKey: "seed.materialRequests.request-4.itemName",
    quantity: "12 buckets",
    note: "Spec changed after latest client review.",
    noteKey: "seed.materialRequests.request-4.note",
    status: "Rejected",
    requestedById: "u-employee-1",
    requestedBy: "Alex Novak",
    projectName: "North River Residences",
    createdAt: "2026-04-06T16:05:00"
  }
];

export const mockFinance = {
  revenue: "$3.84M",
  expenses: "$2.91M",
  profit: "$930K",
  outstandingInvoices: 12
};

export const mockNotifications = [
  { id: "n-1", titleKey: "notifications.n-1.title", timeKey: "notifications.n-1.time" },
  { id: "n-2", titleKey: "notifications.n-2.title", timeKey: "notifications.n-2.time" },
  { id: "n-3", titleKey: "notifications.n-3.title", timeKey: "notifications.n-3.time" }
];

export const mockThreads = [
  {
    id: "thread-1",
    name: "Sophie Carter",
    participants: ["u-admin-1", "u-employee-1"],
    messages: [
      {
        id: "m-1",
        senderId: "u-admin-1",
        textKey: "chat.messages.m-1",
        timestamp: "08:12"
      },
      {
        id: "m-2",
        senderId: "u-employee-1",
        textKey: "chat.messages.m-2",
        timestamp: "08:24"
      }
    ]
  },
  {
    id: "thread-2",
    name: "Mia Berger",
    participants: ["u-admin-1", "u-employee-2"],
    messages: [
      {
        id: "m-3",
        senderId: "u-admin-1",
        textKey: "chat.messages.m-3",
        timestamp: "07:48"
      },
      {
        id: "m-4",
        senderId: "u-employee-2",
        textKey: "chat.messages.m-4",
        timestamp: "08:01"
      }
    ]
  },
  {
    id: "thread-3",
    name: "Luca Moretti",
    participants: ["u-admin-1", "u-employee-3"],
    messages: [
      {
        id: "m-5",
        senderId: "u-employee-3",
        textKey: "chat.messages.m-5",
        timestamp: "08:05"
      }
    ]
  }
];
