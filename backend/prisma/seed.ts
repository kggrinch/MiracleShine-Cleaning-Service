
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// The seed is destructive: it replaces existing application records with a
// predictable local demo dataset. Do not run it against production data.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Hash demo passwords instead of storing plain-text passwords.
  const demoPasswordHash = await bcrypt.hash(
    "DemoPassword123!",
    12,
  );

  // Delete dependents before the records they reference to satisfy foreign keys.
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Create identities first so later demo records can refer to customer IDs.
  const admin = await prisma.user.create({
    data: {
      firstName: "MiracleShine",
      lastName: "Admin",
      email: "admin@example.com",
      passwordHash: demoPasswordHash,
      role: "ADMIN",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@example.com",
      passwordHash: demoPasswordHash,
      phone: "425-555-0101",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      firstName: "Jamie",
      lastName: "Taylor",
      email: "jamie.taylor@example.com",
      passwordHash: demoPasswordHash,
      phone: "425-555-0102",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      firstName: "Sam",
      lastName: "Jordan",
      email: "sam.jordan@example.com",
      passwordHash: demoPasswordHash,
      phone: "425-555-0103",
    },
  });

  // Build the catalog used by the sample quote requests.
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Residential Cleaning",
        description: "Routine cleaning for houses and apartments.",
        category: "RESIDENTIAL",
        startingPrice: "120.00",
        estimatedDurationMinutes: 120,
      },
    }),
    prisma.service.create({
      data: {
        name: "Commercial Cleaning",
        description: "Cleaning services for commercial properties.",
        category: "COMMERCIAL",
        startingPrice: "200.00",
        estimatedDurationMinutes: 180,
      },
    }),
    prisma.service.create({
      data: {
        name: "Deep Cleaning",
        description: "Detailed cleaning of hard-to-reach areas.",
        category: "RESIDENTIAL",
        startingPrice: "180.00",
        estimatedDurationMinutes: 240,
      },
    }),
    prisma.service.create({
      data: {
        name: "Move In / Move Out Cleaning",
        description: "Cleaning for properties before or after a move.",
        category: "RESIDENTIAL",
        startingPrice: "220.00",
        estimatedDurationMinutes: 240,
      },
    }),
    prisma.service.create({
      data: {
        name: "Disinfecting and Sanitizing",
        description: "Cleaning focused on frequently touched surfaces.",
        category: "SPECIALTY",
        startingPrice: "150.00",
        estimatedDurationMinutes: 120,
      },
    }),
    prisma.service.create({
      data: {
        name: "Post Construction Cleaning",
        description: "Removal of dust and debris after construction.",
        category: "SPECIALTY",
        startingPrice: "300.00",
        estimatedDurationMinutes: 300,
      },
    }),
    prisma.service.create({
      data: {
        name: "Carpet Cleaning",
        description: "Cleaning service for carpets and rugs.",
        category: "SPECIALTY",
        startingPrice: "100.00",
        estimatedDurationMinutes: 90,
      },
    }),
    prisma.service.create({
      data: {
        name: "Office Cleaning",
        description: "Cleaning for offices and workspaces.",
        category: "COMMERCIAL",
        startingPrice: "175.00",
        estimatedDurationMinutes: 150,
      },
    }),
    prisma.service.create({
      data: {
        name: "Specialty Cleaning",
        description: "Custom cleaning for specific customer needs.",
        category: "SPECIALTY",
        startingPrice: null,
        estimatedDurationMinutes: 120,
      },
    }),
  ]);

  // Include both account-linked and guest submissions to demonstrate optional ownership.
  const quote1 = await prisma.quoteRequest.create({
    data: {
      userId: customer1.id,
      serviceId: services[0].id,
      customerFirstName: "Alex",
      customerLastName: "Morgan",
      customerEmail: "alex.morgan@example.com",
      customerPhone: "425-555-0101",
      propertyType: "HOUSE",
      squareFootage: 1800,
      bedrooms: 3,
      bathrooms: "2.0",
      streetAddress: "100 Main Street",
      city: "Edmonds",
      state: "WA",
      postalCode: "98020",
      preferredDate: new Date("2026-11-05T00:00:00.000Z"),
      preferredTime: new Date("1970-01-01T10:00:00.000Z"),
      notes: "Please focus on the kitchen and bathrooms.",
      status: "ACCEPTED",
    },
  });

  const quote2 = await prisma.quoteRequest.create({
    data: {
      userId: customer2.id,
      serviceId: services[1].id,
      customerFirstName: "Jamie",
      customerLastName: "Taylor",
      customerEmail: "jamie.taylor@example.com",
      customerPhone: "425-555-0102",
      propertyType: "OFFICE",
      squareFootage: 3500,
      streetAddress: "200 Business Park Drive",
      city: "Lynnwood",
      state: "WA",
      postalCode: "98036",
      preferredDate: new Date("2026-11-07T00:00:00.000Z"),
      preferredTime: new Date("1970-01-01T09:00:00.000Z"),
      notes: "Requesting a recurring commercial cleaning estimate.",
      status: "PENDING",
    },
  });

  const quote3 = await prisma.quoteRequest.create({
    data: {
      userId: null,
      serviceId: services[2].id,
      customerFirstName: "Morgan",
      customerLastName: "Lee",
      customerEmail: "morgan.lee@example.com",
      customerPhone: "425-555-0104",
      propertyType: "APARTMENT",
      squareFootage: 950,
      bedrooms: 2,
      bathrooms: "1.5",
      streetAddress: "300 Example Avenue",
      city: "Mountlake Terrace",
      state: "WA",
      postalCode: "98043",
      notes: "Guest quote request without an account.",
      status: "CONTACTED",
    },
  });

  // Each quote can have at most one appointment in the data model.
  const appointment1 = await prisma.appointment.create({
    data: {
      quoteRequestId: quote1.id,
      scheduledDate: new Date("2026-11-05T00:00:00.000Z"),
      startTime: new Date("1970-01-01T10:00:00.000Z"),
      endTime: new Date("1970-01-01T12:00:00.000Z"),
      status: "CONFIRMED",
      notes: "Customer confirmed the requested time.",
    },
  });

  await prisma.appointment.create({
    data: {
      quoteRequestId: quote2.id,
      scheduledDate: new Date("2026-11-07T00:00:00.000Z"),
      startTime: new Date("1970-01-01T09:00:00.000Z"),
      endTime: new Date("1970-01-01T12:00:00.000Z"),
      status: "REQUESTED",
      notes: "Pending confirmation.",
    },
  });

  // Demonstrate both authenticated and guest contact-form submissions.
  await prisma.contactMessage.create({
    data: {
      userId: customer3.id,
      customerName: "Sam Jordan",
      email: "sam.jordan@example.com",
      phone: "425-555-0103",
      subject: "Commercial cleaning question",
      message: "Do you offer recurring weekly office cleaning?",
      status: "NEW",
    },
  });

  await prisma.contactMessage.create({
    data: {
      userId: null,
      customerName: "Casey Brown",
      email: "casey.brown@example.com",
      subject: "Service area",
      message: "Do you provide cleaning services in my neighborhood?",
      status: "READ",
    },
  });

  // Reviews are linked to completed-work examples and include a public approved review.
  await prisma.review.create({
    data: {
      appointmentId: appointment1.id,
      rating: 5,
      comment: "The team was professional and thorough.",
      status: "APPROVED",
    },
  });

  console.log({
    users: await prisma.user.count(),
    services: await prisma.service.count(),
    quoteRequests: await prisma.quoteRequest.count(),
    appointments: await prisma.appointment.count(),
    contactMessages: await prisma.contactMessage.count(),
    reviews: await prisma.review.count(),
    adminEmail: admin.email,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
