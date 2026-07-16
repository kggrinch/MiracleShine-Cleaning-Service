import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const customers = [
  {
    first_name: "Alice",
    last_name: "Smith",
    email: "alice.smith@example.com",
    phone: "111-222-3333",
    passport_number: "PS123456",
  },
  {
    first_name: "Bob",
    last_name: "Johnson",
    email: "bob.j@example.com",
    phone: "444-555-6666",
    passport_number: "PS789012",
  },
  {
    first_name: "Charlie",
    last_name: "Brown",
    email: "cbrownie@example.com",
    phone: "777-888-9999",
    passport_number: "PS345678",
  },
  {
    first_name: "Diana",
    last_name: "Prince",
    email: "diana.p@example.com",
    phone: "222-333-4444",
    passport_number: "PS901234",
  },
  {
    first_name: "Eve",
    last_name: "Adams",
    email: "eve.a@example.com",
    phone: "555-666-7777",
    passport_number: "PS567890",
  },
  {
    first_name: "Frank",
    last_name: "White",
    email: "frank.w@example.com",
    phone: "888-999-0000",
    passport_number: "PS654321",
  },
  {
    first_name: "Grace",
    last_name: "Taylor",
    email: "grace.t@example.com",
    phone: "123-456-7890",
    passport_number: "PS098765",
  },
  {
    first_name: "Henry",
    last_name: "Miller",
    email: "henry.m@example.com",
    phone: "321-654-9870",
    passport_number: "PS246813",
  },
  {
    first_name: "Ivy",
    last_name: "Davis",
    email: "ivy.d@example.com",
    phone: "987-654-3210",
    passport_number: "PS135792",
  },
  {
    first_name: "Jack",
    last_name: "Garcia",
    email: "jack.g@example.com",
    phone: "987-654-3212",
    passport_number: "PS864209",
  },
  {
    first_name: "Jerry",
    last_name: "Jones",
    email: "JerrJ.g@example.com",
    phone: "967-694-3112",
    passport_number: "PS864569",
  },
  {
    first_name: "Liam",
    last_name: "Walker",
    email: "liam.w@example.com",
    phone: "222-444-6666",
    passport_number: "PS777888",
  },
  {
    first_name: "Mia",
    last_name: "Harris",
    email: "mia.h@example.com",
    phone: "333-555-7777",
    passport_number: "PS888999",
  },
  {
    first_name: "Noah",
    last_name: "Clark",
    email: "noah.c@example.com",
    phone: "444-666-8888",
    passport_number: "PS999000",
  },
  {
    first_name: "Olivia",
    last_name: "Lewis",
    email: "olivia.l@example.com",
    phone: "555-777-9999",
    passport_number: "PS111222",
  },
  {
    first_name: "Sophia",
    last_name: "Hall",
    email: "sophia.h@example.com",
    phone: "666-888-0000",
    passport_number: "PS333444",
  },
];

const credentials = [
  { email: "alice.smith@example.com", username: "asmith", password: "pass123" },
  { email: "bob.j@example.com", username: "bjohnson", password: "securepwd" },
  { email: "cbrownie@example.com", username: "cbrown", password: "mysecret" },
  { email: "diana.p@example.com", username: "dprince", password: "wonderw" },
  { email: "eve.a@example.com", username: "eadams", password: "evypass" },
  { email: "frank.w@example.com", username: "fwhite", password: "frankpwd" },
  { email: "grace.t@example.com", username: "gtaylor", password: "gracet" },
  { email: "henry.m@example.com", username: "hmiller", password: "henry_m" },
  { email: "ivy.d@example.com", username: "idavis", password: "ivy_d" },
  { email: "jack.g@example.com", username: "jgarcia", password: "jackg" },
  { email: "JerrJ.g@example.com", username: "jjones", password: "jj123" },
  { email: "liam.w@example.com", username: "lwalker", password: "liampass" },
  { email: "mia.h@example.com", username: "mharris", password: "miapass" },
  { email: "noah.c@example.com", username: "nclark", password: "noahpass" },
  { email: "olivia.l@example.com", username: "olewis", password: "oliviapass" },
  { email: "sophia.h@example.com", username: "shall", password: "sophiapass" },
];

async function main() {
  await prisma.authentication.deleteMany();
  await prisma.customer.deleteMany();

  const createdCustomers = [] as Array<{ user_id: number; email: string }>;

  for (const customerData of customers) {
    const customer = await prisma.customer.create({
      data: customerData,
    });

    createdCustomers.push({ user_id: customer.user_id, email: customer.email });
  }

  for (const credential of credentials) {
    const customer = createdCustomers.find((entry) => entry.email === credential.email);

    if (!customer) {
      continue;
    }

    await prisma.authentication.create({
      data: {
        user_id: customer.user_id,
        username: credential.username,
        password: credential.password,
      },
    });
  }

  console.log(`Seeded ${customers.length} customers and ${credentials.length} authentication records.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

