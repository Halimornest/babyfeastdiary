# AI Tuning Baseline

This document defines internal baseline metrics for tuning Baby Feast Diary AI features.

## Core Metrics

1. Recommendation CTR (`next_food_ctr`)
- Definition: `recommendation_accepted / recommendation_served`
- Source events:
  - `next_foods_generated` (served)
  - `food_log_created` (proxy accepted when logged ingredients include recommended ones)

2. New Foods Tried (`new_foods_tried_count`)
- Definition: count of newly introduced ingredient IDs per baby per day/week.
- Source event:
  - `food_log_created.newFoodsCount`

3. AI Endpoint Reliability (`ai_success_rate`)
- Definition: `% successful responses among all AI endpoint requests`
- Source events:
  - cache hit events (`*_cache_hit`)
  - generated events (`*_generated`)
  - HTTP status monitoring for `429` and `5xx`

4. Rate-Limit Pressure (`ai_rate_limit_block_rate`)
- Definition: `% requests blocked by rate limiter`
- Source: endpoint response status `429`.

## Baseline Collection Plan

- Aggregation window:
  - Daily snapshot for operational checks.
  - Weekly trend for tuning decisions.
- Minimum signal threshold before tuning weights:
  - At least 200 `next_foods_generated` events and 7 days of data.

## Suggested Initial Targets

- `next_food_ctr`: >= 0.25
- `new_foods_tried_count`: +10% week-over-week
- `ai_success_rate`: >= 99%
- `ai_rate_limit_block_rate`: <= 2%

## Notes

- Telemetry in this project is intentionally best-effort and non-blocking.
- Redis unavailability should not break app logic.
- Tuning changes should be rolled out with `NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED` and compared week-over-week.
