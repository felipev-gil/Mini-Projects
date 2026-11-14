# Currency Converter

Convert amounts between USD, EUR, GBP, COP, JPY, CAD, AUD, CHF, MXN, and BRL.

## How to use

1. Enter a non-negative amount up to 999,999,999, including decimals if needed.
2. Select the source and destination currencies. Use the swap button to exchange them.
3. Select **Convert amount** or press Enter. The result includes the unit rate and the provider's update timestamp when available.

Changing an input clears the previous result so it cannot be mistaken for a new conversion. Matching currencies are converted locally without an API request.

## Features and concepts

Native forms, `fetch`, response validation, request cancellation, stale-response protection, `Intl.NumberFormat`, and optional local storage. Requests time out after 12 seconds; the interface allows another attempt.

## Data and dependencies

Rates come from [ExchangeRate-API](https://www.exchangerate-api.com/). Only the source currency is sent in the request; conversion is calculated locally. Selected currencies are stored under `mini-projects:currency:v1`. The app can read older currency preferences and continues working when storage is blocked.

## Limitations

Internet access and provider availability are required for different currencies. Rates are periodically published, not a live trading feed. Results use ordinary JavaScript floating-point calculations and display currency-appropriate rounding; they exclude fees and are estimates.

Run from the repository's web server so shared styles and navigation can load. See the [collection README](../../README.md).
