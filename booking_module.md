# Public Property Marketplace & Booking Module
## Implementation Guide

**Feature Name:** Public Property Marketplace (Kompleto Exclusive)

---

# Overview

This module introduces a **public marketplace** where prospective tenants (Paupahan seekers) can browse available rental properties and submit booking or viewing requests.

The marketplace is **exclusive to landlords subscribed to the Kompleto plan**.

Properties belonging to landlords on lower subscription plans must never appear publicly.

---

# Business Rules

## Rule 1 — Public Listings are Plan-Gated

Only landlords with an **ACTIVE Kompleto subscription** can publish listings.

```
Free Plan
    ❌ Hidden

Basic Plan
    ❌ Hidden

Standard Plan
    ❌ Hidden

Kompleto Plan
    ✅ Public Marketplace
```

The backend must enforce this rule.

Never rely on frontend checks.

---

## Rule 2 — Listing is Optional

Having a Kompleto subscription does not automatically publish every property.

Each property has its own visibility.

```
Property

Public Listing

true / false
```

Example

```
Landlord
    Kompleto

Property A
    Published

Property B
    Hidden
```

---

## Rule 3 — Only Available Units are Visible

Marketplace only shows units that are

```
Vacant

or

Available Soon
```

Do not display

- Occupied
- Maintenance
- Archived

---

## Rule 4 — Public Visitors Need No Account

Visitors should be able to

- Browse listings
- Search
- Filter
- View property details
- Submit booking request

No login required.

---

## Rule 5 — Booking Requires Contact Information

Required

- Full Name
- Phone Number
- Email (optional)
- Preferred Viewing Date
- Message

---

# Marketplace Flow

```
Visitor

↓

Browse Listings

↓

View Property

↓

View Available Units

↓

Book Viewing

↓

Booking Created

↓

Landlord Notification

↓

Landlord Approves / Rejects

↓

Prospect Receives Update
```

---

# Database Changes

## Properties

Add

```sql
is_public BOOLEAN NOT NULL DEFAULT FALSE
published_at TIMESTAMPTZ
```

Only Kompleto landlords may enable

```
is_public = true
```

---

## Units

Additional fields

```sql
available_from DATE
display_order INTEGER
```

---

## Bookings

Expand existing table.

```sql
booking_status

requested

confirmed

cancelled

completed

expired

rejected
```

Additional columns

```sql
preferred_date

preferred_time

landlord_notes

prospect_message

expires_at

confirmed_by
```

---

# Subscription Validation

Every marketplace query must validate

```
Organization

↓

Subscription

↓

Status

↓

Plan == Kompleto

↓

Published

↓

Visible
```

Pseudo

```
Property

JOIN Subscription

WHERE

subscription.status='active'

AND

subscription.plan='kompleto'

AND

property.is_public=true
```

Never expose unpublished properties.

---

# Public Routes

```
/

Marketplace Landing

/properties

Marketplace Grid

/properties/[slug]

Property Detail

/properties/[slug]/book

Booking Form

/search

Search Results
```

---

# Landlord Dashboard

New Menu

```
Marketplace
```

Contains

```
Public Listings

Booking Requests

Analytics

Publishing Settings
```

---

# Property Publishing Workflow

```
Property

↓

Publish

↓

Validate Subscription

↓

Kompleto?

↓

No

Upgrade Prompt

↓

Yes

Publish
```

---

# Upgrade Experience

If landlord attempts to publish

```
Basic

↓

Publish
```

Show

```
Public Marketplace is available only for Kompleto subscribers.

Upgrade now.
```

Do not allow publishing.

---

# Marketplace Homepage

Suggested sections

```
Hero

↓

Search Bar

↓

Featured Properties

↓

Recently Added

↓

Popular Locations

↓

How It Works

↓

FAQ

↓

Footer
```

---

# Search Filters

Basic

- City
- Municipality
- Monthly Rent
- Property Type

Advanced

- Bedrooms
- Bathrooms
- Amenities
- Parking
- Internet
- Pets Allowed
- Available Date

---

# Property Card

Display

- Cover Image
- Property Name
- Location
- Starting Rent
- Property Type
- Available Units
- Rating (future)
- Verified Badge (future)

CTA

```
View Property
```

---

# Property Detail Page

Sections

```
Gallery

Overview

Description

Amenities

Available Units

House Rules

Map

Nearby Places

Book Viewing
```

---

# Unit Detail

Display

- Unit Number
- Monthly Rent
- Deposit
- Capacity
- Floor
- Amenities
- Availability

---

# Booking Flow

```
Visitor

↓

Fill Form

↓

Validation

↓

Booking Request

↓

Notification

↓

Landlord Dashboard

↓

Accept

Reject

Reschedule
```

---

# Booking Management

Landlord can

- Accept
- Reject
- Cancel
- Complete
- Reschedule

Every action sends notifications.

---

# Notifications

Prospect

- Booking Received
- Booking Confirmed
- Booking Rejected
- Booking Reminder

Landlord

- New Booking
- Cancellation
- Reminder

---

# Anti-Spam

Implement

- Rate limiting
- Honeypot field
- CAPTCHA (optional)
- Duplicate booking detection

Prevent

```
Same Phone

+

Same Unit

+

Within 24 hours
```

---

# SEO

Each property page should have

Dynamic

```
title

description

OpenGraph

Twitter Card

JSON-LD
```

Generate sitemap entries automatically.

---

# Images

Support

- Cover Image
- Gallery
- Lazy Loading
- WebP
- Blur Placeholder

---

# Analytics

Track

- Property Views
- Unit Views
- Booking Requests
- Conversion Rate

Visible only to landlord.

---

# Permissions

Only Kompleto landlords may

- Publish properties
- Receive public bookings
- Access marketplace analytics

Everyone else

```
Read Only

Upgrade Prompt
```

---

# Future Enhancements

Phase 2

- Favorite Properties
- Saved Searches
- Reviews
- Ratings
- Virtual Tour
- Google Maps Integration
- Chat with Landlord
- AI Property Recommendations

---

# Suggested Project Structure

```
src/

features/
    marketplace/
        actions/
        services/
        repositories/
        validators/
        components/
        hooks/
        types/

app/
    (public)/
        properties/
            page.tsx
            [slug]/
                page.tsx
                book/
                    page.tsx

components/
    marketplace/
        PropertyCard.tsx
        PropertyGallery.tsx
        PropertyFilters.tsx
        SearchBar.tsx
        BookingForm.tsx
        FeaturedProperties.tsx
```

---

# Implementation Order

## Phase 1

- Database schema updates
- Property publishing
- Subscription validation
- Public property API

---

## Phase 2

- Marketplace homepage
- Property listing
- Property detail page
- Search & filters

---

## Phase 3

- Booking request flow
- Landlord booking management
- Email notifications

---

## Phase 4

- SEO optimization
- Analytics
- Performance optimization
- Anti-spam protection

---

# Definition of Done

The Marketplace feature is complete when:

- Only active **Kompleto** subscribers can publish listings.
- Property publication is controlled per property via `is_public`.
- Only available units are displayed.
- Visitors can browse without authentication.
- Visitors can submit booking requests.
- Landlords can manage booking requests from the dashboard.
- Subscription validation is enforced on the backend.
- Hidden or non-Kompleto properties can never be accessed through public endpoints.
- SEO metadata and sitemap entries are generated for published properties.
- Analytics and notifications are fully functional.