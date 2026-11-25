# Bay Area Golf Register

A static, personal index of public Bay Area golf courses and driving ranges. It covers San Francisco and Pacifica, Marin, Berkeley and the East Bay through Walnut Creek and San Leandro, and the Peninsula through Sunnyvale. San Jose is outside the requested scope.

Richmond is in the requested travel area, but the local Richmond Golf Club identifies itself as a private club. No public Richmond booking option was verified. Tilden Park in Berkeley and Franklin Canyon in Hercules are nearby public alternatives.

## Use

Open `index.html` in a browser. Filter by activity, area and round length; compare published adult fees for weekday or weekend play; save places in your browser; and use the venue's booking, rates, range and map links. The register does **not** fetch live tee times. It sends you to the course's own booking page for current availability and the final price.

`courses.js` is the data file. Add or update one course object there, including links to the venue's own price page. A `null` fee means the rate is variable or has not been reliably published. Rates were researched from official operator or municipal sources on **25 November 2026** and need periodic review.

## Local preview

Run `python3 -m http.server 8788` from this folder, then open http://127.0.0.1:8788/. The command serves these files locally without installing a framework or uploading anything.

## Notes on pricing

- The default comparison is the published standard adult price, with the basis named in each row. Some operators count Friday as weekend, offer resident discounts, or charge extra for a cart.
- For variable-price venues, the register shows “See live rates” rather than a guessed number.
- The Golden Gate Park facility page and central SF Rec & Park rate page differ slightly on the resident rate; the register uses only the consistent standard rate.
- Some venue websites block automated reading of their booking widget. Their official landing page is used as the link instead.
