# Web design system

## Figma reference and implementation boundaries

The six PNG exports in `b4f_trips_web_figma/` are the visual reference for the
staff portal. Their brand name is illustrative; the application keeps its B4F
identity. The exported images do not expose source design tokens, so the color
values below are close visual matches, not verified Figma variables.

The designs show a few workflows that the current REST API does not provide.
Keep the interface truthful to the available contract:

- Authentication remains determined by the signed-in staff account. Do not
  add a role selector, persistent-login toggle, or password reset link without
  supporting authentication behavior.
- Trip archives remain grouped by departure day, as required by the portal
  workflow, instead of flattening all departures into one table.
- Seat booking supports multiple selected seats and passenger name/phone for
  each seat. The API does not accept passenger email, SMS preferences,
  payment, arrival times, or terminal details.
- Reservation details show the actual reference, passenger, trip, seat, fare,
  and status. Payment collection, ticket printing, and ticket issuance are not
  available in the current API.
- Trip and recurring-schedule editing stay separate. Do not present controls
  for applying edits to future departures, changing service amenities, or
  cancelling individual departures as part of a series unless those operations
  are supported end to end.
- Bus configuration references are derived from the six configurations used
  by the frontend and do not imply that a bus is assigned or that a seat is
  available.

## Visual foundations

Use a light, low-contrast operations workspace with white content surfaces,
thin cool-gray borders, modest corner radii, and minimal shadows. The UI should
remain information-dense but readable.

| Token | Approximate value | Use |
|---|---|---|
| Workspace background | `#F4F7FB` | Dashboard page background |
| Primary | `#2563D9` | Main actions, active navigation, selected seats |
| Dark brand panel | `#173A64` | Sign-in illustration panel |
| Foreground | `#1B3555` | Headings and primary text |
| Muted text | `#64748B` | Helper text, metadata, table headings |
| Border | `#DCE5F1` | Cards, fields, dividers |
| Success | `#EAF6F0` / `#16835F` | Confirmed reservation state |
| Error | `#FEF0F0` / `#C43D3D` | Error or cancelled state |

Use the existing system sans-serif stack. Page titles are approximately
28–32px, card headings 16–20px, body text 14–16px, and metadata 11–13px.
Controls should be around 40px high with visible keyboard focus.

## Application shell

- On wide screens, use a white left navigation rail around 224px wide, a
  compact white top bar, and a flexible light-gray workspace.
- The sidebar contains role-appropriate links with small outline icons,
  uppercase workspace context, a clear active state, and a neutral workspace
  footer.
- The top bar identifies the current workspace and signed-in staff account.
  Do not show fake notifications, office names, or account features.
- On small screens, retain access to the same navigation through a horizontally
  scrollable navigation row. Keep main content padding responsive.
- Cards use white backgrounds, thin borders, roughly 10–12px radii, and little
  or no shadow. Primary actions are blue; destructive actions remain distinct.

## Screen guidance

### Sign-in

At large breakpoints, use a two-panel composition: a deep-blue brand/story
panel and a white sign-in form area. The brand panel includes a simple route
motif, not fabricated live trip data. The form presents a staff-portal label,
welcome heading, email and password fields, a full-width primary action, and a
clear staff-only access note. On smaller screens, hide the illustration panel
and retain the brand mark above the form.

### Trip archives and editing

The trip index uses a concise title/action row, truthful summary cards, a
separate filter card, and a distinct archive table. Keep the date → trips
hierarchy; filter state must continue through archive links. In the day archive,
show route, departure time, bus/class, per-seat fare, capacity/status, and
available staff actions.

Editing uses grouped cards for route/departure and time/bus/fare, with schedule
controls in their own panel only on recurring-schedule routes. Keep all labels
aligned with backend semantics, especially “fare per seat.”

### Staff booking

Show a compact trip summary card above the booking form. Lay out seat selection
beside passenger details and a reservation summary on wide screens; stack these
sections on narrow screens. Seat states must remain visually and accessibly
distinct: available, selected, and reserved. Passenger fields correspond to
each selected seat. The final action confirms the reservation; it must not
imply a payment or ticket step that does not exist.

### Reservation details

Use a clear confirmed/cancelled state banner, journey and passenger details,
and a separate reservation-reference/fare panel. Preserve existing
authorization and cancellation rules. Do not present a fabricated booking
reference format, payment status, SMS result, or printable ticket.

### Seat-layout reference

Show the six supported Ordinary, First Class, and Business large/medium
layouts in a responsive three-column grid. Include capacity, layout shape,
front-to-rear numbering, and the Ordinary rear-row middle-seat exception. A
reference diagram means unassigned seats; actual availability belongs to a
specific trip.

## Shared component rules

Keep common controls in `components/ui/` and use existing project variants
rather than duplicating styles in each route. Feature-specific forms and seat
maps remain in their feature folders. Use server-rendered route data by default
and only introduce browser state for genuinely interactive controls such as
seat selection or frequency selection.
