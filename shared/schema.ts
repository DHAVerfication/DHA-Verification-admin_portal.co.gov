import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Permits/Documents table
export const permits = pgTable("permits", {
  id: serial("id").primaryKey(),
  permitNumber: text("permit_number").unique().notNull(),
  referenceNumber: text("reference_number").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  forename: text("forename"),
  passport: text("passport").notNull(),
  nationality: text("nationality").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  placeOfBirth: text("place_of_birth"),
  sex: text("sex").notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  issuedAt: text("issued_at").notNull(),
  conditions: text("conditions"),
  apiSource: text("api_source"),
  documentData: json("document_data"),
  pdfPath: text("pdf_path"),
  qrCode: text("qr_code"),
  digitalSignature: text("digital_signature"),
  verificationHash: text("verification_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Print Orders table for hard copy printing
export const printOrders = pgTable("print_orders", {
  id: serial("id").primaryKey(),
  permitId: integer("permit_id").references(() => permits.id).notNull(),
  orderNumber: text("order_number").unique().notNull(),
  printType: text("print_type").notNull(), // 'DHA_OFFICIAL' or 'GWP_HARD_COPY'
  priority: text("priority").notNull().default("HIGH"), // HIGH, NORMAL, LOW
  status: text("status").notNull().default("PENDING"), // PENDING, PROCESSING, PRINTED, DELIVERED, FAILED
  recipientName: text("recipient_name").notNull(),
  deliveryAddress: json("delivery_address").notNull(),
  postOffice: text("post_office"),
  scheduledDate: timestamp("scheduled_date"),
  printedDate: timestamp("printed_date"),
  deliveredDate: timestamp("delivered_date"),
  trackingNumber: text("tracking_number"),
  gwpQueuePosition: integer("gwp_queue_position"),
  dhaSystemRef: text("dha_system_ref"),
  gwpSystemRef: text("gwp_system_ref"),
  apiResponse: json("api_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document Verification Audit table
export const verificationAudit = pgTable("verification_audit", {
  id: serial("id").primaryKey(),
  permitId: integer("permit_id").references(() => permits.id).notNull(),
  verificationType: text("verification_type").notNull(), // QR_SCAN, API_CHECK, MANUAL_VERIFY
  verificationResult: text("verification_result").notNull(), // VALID, INVALID, EXPIRED
  verifiedBy: text("verified_by"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: json("location"),
  additionalData: json("additional_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Permit = typeof permits.$inferSelect;
export type InsertPermit = typeof permits.$inferInsert;
export type PrintOrder = typeof printOrders.$inferSelect;
export type InsertPrintOrder = typeof printOrders.$inferInsert;
export type VerificationAudit = typeof verificationAudit.$inferSelect;
export type InsertVerificationAudit = typeof verificationAudit.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertPermitSchema = createInsertSchema(permits);
export const selectPermitSchema = createSelectSchema(permits);
export const insertPrintOrderSchema = createInsertSchema(printOrders);
export const selectPrintOrderSchema = createSelectSchema(printOrders);
