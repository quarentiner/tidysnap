# Decisions

## Decision 1: Use A Dependency-Light MVP

Decision:

Use HTML, CSS, JavaScript modules, and Node.js scripts.

Reason:

The workspace started empty. A small stack makes the MVP runnable without installing packages.

Tradeoff:

The app does not use React yet.

Future option:

Move to React or another framework when the product needs more screens, routing, or shared UI state.

## Decision 2: Keep Recommendations Rule-Based First

Decision:

Use a rule-based recommendation engine before real ML.

Reason:

The user asked for practical actions. Rules are easier to audit and keep the output predictable.

Tradeoff:

The app cannot truly identify every visible item yet.

Future option:

Use AI vision for item detection, then feed detected items into the same rule engine.

## Decision 3: Always Return Exactly 3 Actions

Decision:

Each analysis returns exactly 3 action cards.

Reason:

The product should feel finishable.

Tradeoff:

The result may not include every possible clean-up action.

Future option:

Add an optional "more ideas" section after the main 3 tasks.

## Decision 4: Use Selected City For Season

Decision:

Use a city selector instead of browser location permission.

Reason:

It avoids permission prompts and keeps the MVP simple.

Tradeoff:

The user must choose a city manually.

Future option:

Offer browser location with clear consent.
