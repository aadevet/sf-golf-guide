---
name: Bay Area Golf Register
description: A compact field guide for comparing public golf courses and driving ranges.
colors:
  paper: "#f5f3e9"
  ink: "#173e31"
  body: "#253b31"
  muted: "#52665c"
  line: "#cbd5c9"
  wash: "#e8eddf"
  accent: "#d36b52"
  white: "#fffefa"
  field-white: "#ffffff"
  focus: "#c05b3e"
typography:
  display:
    fontFamily: "Georgia, Iowan Old Style, serif"
    fontSize: "clamp(3.3rem, 5.2vw, 4.9rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Georgia, Iowan Old Style, serif"
    fontSize: "clamp(1.9rem, 3vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Georgia, Iowan Old Style, serif"
    fontSize: "1.36rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.48
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 750
rounded:
  action: "4px"
  field: "5px"
  count: "20px"
spacing:
  control-gap: "13px"
  row-gap: "18px"
  row-inline: "18px"
  row-block: "19px"
components:
  booking-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: "7px 11px"
    height: "39px"
  filter-field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "8px 11px"
    height: "39px"
  course-row:
    backgroundColor: "{colors.white}"
    textColor: "{colors.body}"
    padding: "19px 18px"
  activity-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    padding: "0 18px 9px"
  saved-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "6px 0"
---

# Design System: Bay Area Golf Register

## Overview

**Creative North Star: "The Pocket Yardage Book"**

The register feels like a practical field guide carried to the course. Warm paper, deep evergreen ink, fine rules, and restrained coral marks make the information feel collected and trustworthy. A large serif title adds character while compact sans serif controls and figures keep comparisons quick.

The page is intentionally dense enough to show the start of the register in the first desktop viewport. Repeated rows carry the visual rhythm; the illustration and color accents stay secondary to names, fees, and direct actions.

**Key Characteristics:**
- Warm paper and flat white surfaces with evergreen type.
- Ruled, tabular rows instead of promotional tiles.
- Serif editorial headings with small, clear sans serif labels.
- Coral reserved for the masthead rule and selected or saved states.

## Colors

The palette uses a warm neutral base and green ink, with a small coral signal for actions and state.

### Primary
- **Evergreen ink** (`colors.ink`): masthead, main headings, booking actions, and strong rules.
- **Coral marker** (`colors.accent`): masthead underline, active tab, and saved star.

### Neutral
- **Warm paper** (`colors.paper`): page background and the field guide atmosphere.
- **Ivory sheet** (`colors.white`): control panel and register rows.
- **Body green** (`colors.body`): normal reading text.
- **Quiet green** (`colors.muted`): metadata, supporting labels, and secondary facts.
- **Pale rule** (`colors.line`): row dividers and control boundaries.
- **Grass wash** (`colors.wash`): source note and compact count badge.
- **Field white** (`colors.field-white`): search and select interiors, giving their thin borders a clean edge.
- **Focus coral** (`colors.focus`): visible keyboard focus outline.

**The Marker Rule.** Keep coral for selected states and brief accents so prices and booking actions remain easy to scan.

## Typography

**Display Font:** Georgia, with Iowan Old Style and serif fallbacks.  
**Body Font:** system sans serif stack.  
**Character:** The serif face supplies a personal field guide voice. The sans face handles controls and dense facts without becoming ornamental.

### Hierarchy
- **Display** (`typography.display`): the compact masthead title; the mobile size changes to `clamp(2.75rem, 10vw, 3.8rem)`.
- **Headline** (`typography.headline`): the register section title.
- **Title** (`typography.title`): course names in each row; mobile uses `1.42rem`.
- **Body** (`typography.body`): explanatory copy and ordinary reading text.
- **Label** (`typography.label`): filter labels; column headings shrink to `.67rem`, uppercase with `.11em` tracking.
- **Figures** (`1.27rem`, weight `730`, tabular numerals): fee and range values aligned for comparison.

**The Two Voices Rule.** Use serif for named places and major headings; use sans serif for controls, prices, and operational detail.

## Layout

The page shell is centered at a maximum width of `1500px` with `32px` side padding. The masthead sits above a bordered filter strip; the register follows with a slim summary and fine ruled rows. The desktop filter grid gives search twice the width of each of four selects. The register uses four columns for place, play, range, and action, with a wider place column.

At `1000px`, page padding tightens to `20px` and search spans a row. At `720px`, padding becomes `12px`, register headings disappear, and each course becomes a two-column row with place and action spanning both columns. The filter strip initially shows search and area; the other filters expand on request. At `380px`, filters become one column and row indents disappear.

**The First Row Rule.** Keep the masthead and filters compact enough that the register starts within the first desktop viewport.

## Elevation & Depth

The design uses no box shadows. Depth comes from the dark masthead, white control and row surfaces, a grass-toned information panel, and horizontal rules. Course rows gain a faint green background on hover.

**The Ruled Sheet Rule.** Separate repeated information with fine lines and tonal changes, not floating cards.

## Shapes

The layout is mostly rectangular. Booking actions have a small `4px` radius, fields a `5px` radius, and the small saved count is pill shaped with a `20px` radius. Thin borders and rules do more work than rounded containers.

## Components

### Activity tabs

Text tabs sit on a bottom rule. The active tab uses evergreen text and a `3px` coral underline; hover darkens the text. They wrap when space is tight.

### Fields

Search and select controls are white, lightly bordered, and at least `39px` tall in the final compact layout. A darker border marks focus; a `3px` coral `:focus-visible` outline is shared by keyboard targets.

### Course rows

Each row is a flat ivory record separated by a pale line. The name uses serif type; location and notes use small sans type. Play and range facts pair a large tabular figure with a concise basis and detail. A saved star sits beside the name and fills coral when active.

### Booking actions

The main link is an evergreen filled rectangle with ivory text and a right arrow. Hover deepens the green and nudges the arrow right; the arrow motion stops when reduced motion is requested. Secondary source links remain underlined text below it.

### Source note

A grass wash and strong top rule distinguish the dated fee caveat from the register while keeping the same flat sheet language.

## Do's and Don'ts

### Do:
- **Do** keep facts in aligned, ruled rows with the place column wider than price columns.
- **Do** show a visible focus outline and preserve text labels on controls.
- **Do** use coral sparingly for active tabs and saved state.

### Don't:
- **Don't** add drop shadows or raised promotional cards to the register.
- **Don't** replace tabular fee figures with decorative price badges.
- **Don't** let the masthead push the register below the first desktop viewport.
