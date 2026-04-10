export const materialRequestStatusOptions = ["Pending", "Ordered", "Purchased", "Rejected"];

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
    projectId: "project-1",
    projectName: "North River Residences",
    projectNameKey: "seed.projects.project-1.name",
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
    projectId: "project-2",
    projectName: "Skyline Offices",
    projectNameKey: "seed.projects.project-2.name",
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
    projectId: "project-3",
    projectName: "Harbor Villas",
    projectNameKey: "seed.projects.project-3.name",
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
    projectId: "project-1",
    projectName: "North River Residences",
    projectNameKey: "seed.projects.project-1.name",
    createdAt: "2026-04-06T16:05:00"
  }
];
