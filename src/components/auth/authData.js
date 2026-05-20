export const demoAccounts =
  import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === "true"
    ? [
        {
          email: "admin@buildforu.com",
          name: "Sophie Carter",
          role: "admin",
          companyName: "BuildForU Demo Construction"
        },
        {
          email: "worker@buildforu.com",
          name: "Alex Novak",
          role: "employee",
          companyName: "BuildForU Demo Construction"
        }
      ]
    : [];

export const availablePlans = ["starter", "pro", "enterprise"];
