export const mockUsers = [
  {
    id: "u-admin-1",
    name: "Sophie Carter",
    email: "boss@buildforu.com",
    role: "admin",
    title: "Operations Director",
    avatar: "SC"
  },
  {
    id: "u-employee-1",
    name: "Alex Novak",
    email: "worker@buildforu.com",
    role: "employee",
    title: "Site Supervisor",
    avatar: "AN"
  },
  {
    id: "u-employee-2",
    name: "Mia Berger",
    email: "mia@buildforu.com",
    role: "employee",
    title: "Electrician",
    avatar: "MB"
  },
  {
    id: "u-employee-3",
    name: "Luca Moretti",
    email: "luca@buildforu.com",
    role: "employee",
    title: "Plumbing Lead",
    avatar: "LM"
  }
];

export const mockTasks = [
  {
    id: "task-101",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Concrete slab inspection",
    location: "North River Residences",
    date: "2026-04-10",
    status: "pending",
    priority: "high"
  },
  {
    id: "task-102",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Safety briefing with subcontractors",
    location: "BuildForU HQ",
    date: "2026-04-11",
    status: "completed",
    priority: "medium"
  },
  {
    id: "task-103",
    employeeId: "u-employee-2",
    assignee: "Mia Berger",
    title: "Install lighting circuits",
    location: "Skyline Offices",
    date: "2026-04-12",
    status: "pending",
    priority: "high"
  },
  {
    id: "task-104",
    employeeId: "u-employee-3",
    assignee: "Luca Moretti",
    title: "Pipe pressure test",
    location: "Harbor Villas",
    date: "2026-04-13",
    status: "pending",
    priority: "medium"
  },
  {
    id: "task-105",
    employeeId: "u-employee-1",
    assignee: "Alex Novak",
    title: "Facade delivery check-in",
    location: "Skyline Offices",
    date: "2026-04-15",
    status: "pending",
    priority: "low"
  },
  {
    id: "task-106",
    employeeId: "u-employee-2",
    assignee: "Mia Berger",
    title: "Panel labeling audit",
    location: "North River Residences",
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
    assignedProject: "North River Residences",
    trade: "Site Supervisor",
    location: "North River Residences",
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
    assignedProject: "Skyline Offices",
    trade: "Electrician",
    location: "Skyline Offices",
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
    assignedProject: "Harbor Villas",
    trade: "Plumbing Lead",
    location: "Harbor Villas",
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
    phase: "Structural finish",
    progress: 74,
    budget: "$1.24M",
    health: "Healthy"
  },
  {
    id: "project-2",
    name: "Skyline Offices",
    phase: "MEP installation",
    progress: 58,
    budget: "$860K",
    health: "At risk"
  },
  {
    id: "project-3",
    name: "Harbor Villas",
    phase: "Interior detailing",
    progress: 84,
    budget: "$2.1M",
    health: "Healthy"
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
