# OpenClaw System Intelligence Connection Guide

This document defines the technical integration between OpenClaw (The System Brain) and the Ceyhun Admin API.

## 🔗 Connection Details

- **Base URL:** `https://ceyhun.vercel.app` (Production)
- **Security:** Protected via Bearer Token.
- **Header:** `Authorization: Bearer claw_admin_2026_safe_key`

## 📡 Primary Intelligence Endpoints

OpenClaw has full administrative authority to query the following live data points:

| Endpoint | Description | Key Data |
| :--- | :--- | :--- |
| `/api/admin/status` | **Main Status Bridge** | High-level summary, system health, and vital stats. |
| `/api/admin/financial-report` | **Deep Finance Analysis** | MTD & All-time Revenue, Expenses, Net Profit. |
| `/api/admin/profit-loss` | **P&L Statement** | Categorized expense breakdown and historical profitability. |
| `/api/admin/cash-flow` | **Receivables/Billing** | Unpaid/Overdue invoices and cash flow monitoring. |
| `/api/admin/bookings/total` | **Historical Volume** | Total number of bookings ever made (Current: 32). |
| `/api/admin/statistics/historical` | **System Growth** | Lifetime analytics across CRM, Finance, and Operations. |
| `/api/admin/bookings/tomorrow` | **Operational Details** | Tomorrow's bookings with full CRM/Customer contact details. |

## 🧠 Data Characteristics

1. **Live Data:** Every request performs a direct, non-cached query to the Supabase database.
2. **Intelligence Summary:** Every response includes a `summary` field specifically designed for AI consumption.
3. **Historical Context:** OpenClaw can distinguish between **Total System Volume** (32 bookings) and **Current Operational Load** (18 pending bookings).

## 🛠 Instructions for Claude / OpenClaw

When analyzing this system, always:
- Check the `summary` field first for the **CRITICAL** status line.
- Use the **All-Time** metrics to evaluate company health, rather than just the current month.
- Identify the "Pending" bookings count as the primary operational bottleneck to be resolved.

---
*Generated for OpenClaw Master Intelligence Integration - 14 March 2026*
